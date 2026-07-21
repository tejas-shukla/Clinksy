// lifecycle.ts — request lifecycle: create → offer → accept/decline/expire → pass on.
// Accept/decline/expire are atomic: a conditional updateMany means the first
// state change wins and every other path is a no-op (spec §5.1).

import { prisma } from "@/lib/db";
import { offerToNextCandidate } from "./engine";
import {
  sendOfferEmail,
  sendReminderEmail,
  sendBuyerMatchedEmail,
  sendBuyerRematchingEmail,
  sendBuyerUnmatchedEmail,
  sendOpsUnmatchedAlert,
} from "./emails";
import { AUTO_PAUSE_AFTER_TIMEOUTS, REMINDER_AFTER_HOURS } from "./criteria";

/** Offer the request to the next candidate, or mark it unmatched. */
export async function progressRequest(matchRequestId: string) {
  const req = await prisma.matchRequest.findUnique({ where: { id: matchRequestId } });
  if (!req || req.status !== "OPEN") return null;

  const assignment = await offerToNextCandidate(req);
  if (assignment) {
    await sendOfferEmail(assignment);
    return assignment;
  }

  await prisma.matchRequest.update({
    where: { id: req.id },
    data: { status: "UNMATCHED" },
  });
  await Promise.allSettled([sendBuyerUnmatchedEmail(req), sendOpsUnmatchedAlert(req)]);
  return null;
}

/** Professional accepts. Atomic: only succeeds if still PENDING and not expired. */
export async function acceptAssignment(assignmentId: string): Promise<
  | { ok: true }
  | { ok: false; reason: "not_found" | "already_responded" | "expired" }
> {
  const updated = await prisma.assignment.updateMany({
    where: { id: assignmentId, status: "PENDING", expiresAt: { gt: new Date() } },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });

  if (updated.count === 0) {
    const existing = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!existing) return { ok: false, reason: "not_found" };
    if (existing.status !== "PENDING") return { ok: false, reason: "already_responded" };
    return { ok: false, reason: "expired" };
  }

  const assignment = await prisma.assignment.findUniqueOrThrow({
    where: { id: assignmentId },
    include: { professional: true, matchRequest: true },
  });

  await prisma.$transaction([
    prisma.matchRequest.update({
      where: { id: assignment.matchRequestId },
      data: { status: "MATCHED" },
    }),
    prisma.professional.update({
      where: { id: assignment.professionalId },
      data: { totalAccepted: { increment: 1 }, consecutiveTimeouts: 0 },
    }),
  ]);

  await sendBuyerMatchedEmail(assignment.matchRequest, assignment.professional);
  return { ok: true };
}

/** Professional declines. Atomic; then passes the request on. */
export async function declineAssignment(
  assignmentId: string,
  reason?: string,
): Promise<{ ok: boolean }> {
  const updated = await prisma.assignment.updateMany({
    where: { id: assignmentId, status: "PENDING" },
    data: { status: "DECLINED", respondedAt: new Date(), declineReason: reason ?? null },
  });
  if (updated.count === 0) return { ok: false };

  const assignment = await prisma.assignment.findUniqueOrThrow({
    where: { id: assignmentId },
    include: { matchRequest: true },
  });

  await prisma.professional.update({
    where: { id: assignment.professionalId },
    data: { totalDeclined: { increment: 1 }, consecutiveTimeouts: 0 },
  });

  await sendBuyerRematchingEmail(assignment.matchRequest);
  await progressRequest(assignment.matchRequestId);
  return { ok: true };
}

/**
 * Cron sweep (called by /api/cron/matching):
 * 1. Send 12h reminders for pending assignments.
 * 2. Expire pending assignments past their 24h window, penalise the
 *    professional (auto-pause after consecutive timeouts), notify the buyer,
 *    and pass the request to the next candidate.
 */
export async function sweep() {
  const now = new Date();
  const results = { reminded: 0, expired: 0 };

  // 1. Reminders
  const reminderCutoff = new Date(now.getTime() - REMINDER_AFTER_HOURS * 3_600_000);
  const needReminder = await prisma.assignment.findMany({
    where: {
      status: "PENDING",
      remindedAt: null,
      offeredAt: { lte: reminderCutoff },
      expiresAt: { gt: now },
    },
    include: { professional: true, matchRequest: true },
  });
  for (const a of needReminder) {
    // Claim atomically so overlapping cron runs don't double-send.
    const claimed = await prisma.assignment.updateMany({
      where: { id: a.id, remindedAt: null },
      data: { remindedAt: now },
    });
    if (claimed.count === 1) {
      await sendReminderEmail(a);
      results.reminded++;
    }
  }

  // 2. Expiries
  const overdue = await prisma.assignment.findMany({
    where: { status: "PENDING", expiresAt: { lte: now } },
    include: { professional: true, matchRequest: true },
  });
  for (const a of overdue) {
    // Atomic: if the professional accepts between the query and this update,
    // updateMany matches nothing and we skip.
    const expired = await prisma.assignment.updateMany({
      where: { id: a.id, status: "PENDING" },
      data: { status: "EXPIRED", respondedAt: now },
    });
    if (expired.count === 0) continue;

    const timeouts = a.professional.consecutiveTimeouts + 1;
    await prisma.professional.update({
      where: { id: a.professionalId },
      data: {
        totalExpired: { increment: 1 },
        consecutiveTimeouts: timeouts,
        ...(timeouts >= AUTO_PAUSE_AFTER_TIMEOUTS ? { status: "PAUSED" } : {}),
      },
    });

    await sendBuyerRematchingEmail(a.matchRequest);
    await progressRequest(a.matchRequestId);
    results.expired++;
  }

  return results;
}
