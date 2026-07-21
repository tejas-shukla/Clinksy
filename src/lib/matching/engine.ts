// engine.ts — matching engine: hard filters + weighted ranking.
// Spec: Clinkeys_Professional_Matching_Spec.docx §4.

import type { MatchRequest, Professional } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  advisorSpecialisationsForBuyer,
  postcodeArea,
  ACCEPT_WINDOW_HOURS,
} from "./criteria";

const WEIGHTS = {
  specialisation: 0.4,
  responsiveness: 0.25,
  rating: 0.2,
  loadBalance: 0.15,
};

// ── Stage 1: hard filters ──────────────────────────────────────────────

function coversLocation(p: Professional, req: MatchRequest): boolean {
  if (p.role === "MORTGAGE_ADVISOR") {
    if (p.nationwide) return true;
    const area = postcodeArea(req.propertyPostcode);
    return p.coverageAreas.some(
      (a) => area === a.toUpperCase() || req.propertyPostcode.toUpperCase().startsWith(a.toUpperCase()),
    );
  }
  if (p.role === "SOLICITOR") {
    // Jurisdiction check. Scotland/NI postcodes: rough area-prefix mapping.
    const area = postcodeArea(req.propertyPostcode);
    const scottish = ["AB", "DD", "DG", "EH", "FK", "G", "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE"];
    const ni = ["BT"];
    const propJurisdiction = ni.includes(area)
      ? "NORTHERN_IRELAND"
      : scottish.includes(area)
        ? "SCOTLAND"
        : "ENGLAND_WALES";
    return p.jurisdiction === propJurisdiction;
  }
  if (p.role === "SURVEYOR") {
    // Without geocoding, approximate radius by coverage areas list;
    // surveyors list the postcode areas they serve at onboarding.
    const area = postcodeArea(req.propertyPostcode);
    return p.coverageAreas.some((a) => area === a.toUpperCase());
  }
  return false;
}

function meetsSpecialisation(p: Professional, req: MatchRequest): boolean {
  if (p.role === "MORTGAGE_ADVISOR") {
    const { required } = advisorSpecialisationsForBuyer(req);
    return required.every((s) => p.specialisations.includes(s));
  }
  if (p.role === "SOLICITOR") {
    // Lender panel is the critical filter when the buyer knows their lender.
    if (req.lender && p.lenderPanels.length > 0) {
      const onPanel = p.lenderPanels.some(
        (l) => l.toLowerCase() === req.lender!.toLowerCase(),
      );
      if (!onPanel) return false;
    }
    if (req.schemeUsage === "SHARED_OWNERSHIP") {
      return p.specialisations.includes("SHARED_OWNERSHIP");
    }
    return true;
  }
  if (p.role === "SURVEYOR") {
    return !req.surveyType || p.surveyTypes.includes(req.surveyType);
  }
  return false;
}

async function hasCapacity(p: Professional): Promise<boolean> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeThisWeek = await prisma.assignment.count({
    where: {
      professionalId: p.id,
      offeredAt: { gte: weekAgo },
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });
  return activeThisWeek < p.weeklyCapacity;
}

// ── Stage 2: ranking ───────────────────────────────────────────────────

function specialisationScore(p: Professional, req: MatchRequest): number {
  if (p.role === "MORTGAGE_ADVISOR") {
    const { required, desirable } = advisorSpecialisationsForBuyer(req);
    const wanted = [...required, ...desirable];
    if (wanted.length === 0) return 0.5;
    const hits = wanted.filter((s) => p.specialisations.includes(s)).length;
    return hits / wanted.length;
  }
  if (p.role === "SOLICITOR") {
    let score = 0.5;
    if (p.cqsAccredited) score += 0.25;
    if (req.schemeUsage === "SHARED_OWNERSHIP" && p.specialisations.includes("SHARED_OWNERSHIP")) score += 0.25;
    return Math.min(score, 1);
  }
  if (p.role === "SURVEYOR") {
    return req.surveyType && p.surveyTypes.includes(req.surveyType) ? 1 : 0.5;
  }
  return 0;
}

function responsivenessScore(p: Professional): number {
  const total = p.totalAccepted + p.totalDeclined + p.totalExpired;
  if (total === 0) return 0.6; // neutral prior for new joiners
  const acceptRate = p.totalAccepted / total;
  const timeoutRate = p.totalExpired / total;
  return Math.max(0, Math.min(1, acceptRate - timeoutRate * 0.5));
}

function ratingScore(p: Professional): number {
  if (p.ratingCount === 0) return 0.6; // neutral prior
  return p.ratingSum / p.ratingCount / 5;
}

async function loadBalanceScore(p: Professional): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await prisma.assignment.count({
    where: { professionalId: p.id, offeredAt: { gte: weekAgo } },
  });
  return 1 / (1 + recent); // fewer recent assignments -> higher score
}

// ── Public API ─────────────────────────────────────────────────────────

export type RankedCandidate = { professional: Professional; score: number };

/**
 * Returns the ranked candidate pool for a request, excluding professionals
 * who already declined, expired or were offered this request.
 */
export async function rankCandidates(req: MatchRequest): Promise<RankedCandidate[]> {
  const alreadyOffered = await prisma.assignment.findMany({
    where: { matchRequestId: req.id },
    select: { professionalId: true },
  });
  const excluded = new Set(alreadyOffered.map((a) => a.professionalId));

  const pool = await prisma.professional.findMany({
    where: { role: req.role, status: "ACTIVE" },
  });

  const candidates: RankedCandidate[] = [];
  for (const p of pool) {
    if (excluded.has(p.id)) continue;
    if (!coversLocation(p, req)) continue;
    if (!meetsSpecialisation(p, req)) continue;
    if (req.language && req.language !== "English" && !p.languages.includes(req.language)) continue;
    if (!(await hasCapacity(p))) continue;

    const score =
      WEIGHTS.specialisation * specialisationScore(p, req) +
      WEIGHTS.responsiveness * responsivenessScore(p) +
      WEIGHTS.rating * ratingScore(p) +
      WEIGHTS.loadBalance * (await loadBalanceScore(p));

    candidates.push({ professional: p, score });
  }

  // Sort by score desc; equal scores randomised for round-robin fairness.
  candidates.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  return candidates;
}

/**
 * Offers the request to the best available candidate.
 * Returns the created assignment (with professional), or null if pool exhausted.
 */
export async function offerToNextCandidate(req: MatchRequest) {
  const candidates = await rankCandidates(req);
  const top = candidates[0];
  if (!top) return null;

  const previousOffers = await prisma.assignment.count({
    where: { matchRequestId: req.id },
  });

  return prisma.assignment.create({
    data: {
      matchRequestId: req.id,
      professionalId: top.professional.id,
      rank: previousOffers + 1,
      score: top.score,
      expiresAt: new Date(Date.now() + ACCEPT_WINDOW_HOURS * 60 * 60 * 1000),
    },
    include: { professional: true, matchRequest: true },
  });
}
