// POST /api/match-requests — buyer requests a professional; triggers matching.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { progressRequest } from "@/lib/matching/lifecycle";
import { BUYER_TYPES, EMPLOYMENT_TYPES, SURVEY_TYPES } from "@/lib/matching/criteria";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d?[A-Z]{0,2}$/i;
const ROLES = ["MORTGAGE_ADVISOR", "SOLICITOR", "SURVEYOR"] as const;

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const role = str(body.role);
  if (!role || !ROLES.includes(role as (typeof ROLES)[number])) {
    return NextResponse.json({ error: "Choose the professional you need." }, { status: 400 });
  }

  const buyerName = str(body.buyerName);
  const buyerEmail = str(body.buyerEmail)?.toLowerCase();
  const propertyPostcode = str(body.propertyPostcode)?.toUpperCase();

  if (!buyerName) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  if (!buyerEmail || !EMAIL_REGEX.test(buyerEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!propertyPostcode || !POSTCODE_REGEX.test(propertyPostcode)) {
    return NextResponse.json(
      { error: "Enter a valid UK postcode (full or outward code, e.g. SW1A 1AA or SW1A)." },
      { status: 400 },
    );
  }

  const buyerType = str(body.buyerType);
  const employmentType = str(body.employmentType);
  const surveyType = str(body.surveyType);

  const matchRequest = await prisma.matchRequest.create({
    data: {
      role: role as (typeof ROLES)[number],
      buyerName,
      buyerEmail,
      buyerPhone: str(body.buyerPhone),
      propertyPostcode,
      propertyPrice: Number.isFinite(Number(body.propertyPrice))
        ? Math.floor(Number(body.propertyPrice))
        : undefined,
      buyerType: BUYER_TYPES.some((t) => t.value === buyerType) ? buyerType : undefined,
      employmentType: EMPLOYMENT_TYPES.some((t) => t.value === employmentType)
        ? employmentType
        : undefined,
      depositPercent: Number.isFinite(Number(body.depositPercent))
        ? Math.min(Math.max(Math.floor(Number(body.depositPercent)), 0), 100)
        : undefined,
      creditIssues: body.creditIssues === true,
      schemeUsage: str(body.schemeUsage),
      lender: str(body.lender),
      surveyType: SURVEY_TYPES.some((t) => t.value === surveyType) ? surveyType : undefined,
      timeline: str(body.timeline),
      language: str(body.language),
      appointmentMode: str(body.appointmentMode),
      notes: str(body.notes)?.slice(0, 2000),
    },
  });

  // Kick off matching immediately.
  const assignment = await progressRequest(matchRequest.id);

  return NextResponse.json({
    ok: true,
    id: matchRequest.id,
    matched: assignment !== null,
  });
}
