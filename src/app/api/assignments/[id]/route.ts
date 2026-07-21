// GET  /api/assignments/[id]      — assignment details for the respond page (anonymised until accepted)
// POST /api/assignments/[id]      — { action: "accept" | "decline", declineReason? }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { acceptAssignment, declineAssignment } from "@/lib/matching/lifecycle";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: { matchRequest: true, professional: { select: { name: true } } },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  const r = assignment.matchRequest;
  const accepted = assignment.status === "ACCEPTED";

  return NextResponse.json({
    id: assignment.id,
    status: assignment.status,
    expiresAt: assignment.expiresAt,
    professionalName: assignment.professional.name,
    request: {
      role: r.role,
      propertyPostcode: r.propertyPostcode,
      propertyPrice: r.propertyPrice,
      buyerType: r.buyerType,
      employmentType: r.employmentType,
      depositPercent: r.depositPercent,
      creditIssues: r.creditIssues,
      schemeUsage: r.schemeUsage,
      lender: r.lender,
      surveyType: r.surveyType,
      timeline: r.timeline,
      notes: r.notes,
      // Buyer contact details only after acceptance (spec §5.1).
      ...(accepted
        ? { buyerName: r.buyerName, buyerEmail: r.buyerEmail, buyerPhone: r.buyerPhone }
        : {}),
    },
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  let body: { action?: string; declineReason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "accept") {
    const result = await acceptAssignment(params.id);
    if (!result.ok) {
      const message =
        result.reason === "expired"
          ? "This request expired and has been passed to another professional."
          : result.reason === "already_responded"
            ? "You've already responded to this request."
            : "Request not found.";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "decline") {
    const result = await declineAssignment(params.id, body.declineReason?.slice(0, 500));
    if (!result.ok) {
      return NextResponse.json(
        { error: "This request is no longer open." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
