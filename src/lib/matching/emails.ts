// emails.ts — transactional emails for the matching lifecycle (via Resend).
// Falls back to console.log when RESEND_API_KEY isn't set (local dev).

import type { Assignment, MatchRequest, Professional } from "@/generated/prisma/client";
import { ACCEPT_WINDOW_HOURS } from "./criteria";

const FROM = "Clinkeys <hello@clinkeys.com>";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4001").replace(/\/$/, "");
}

async function send(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Clinkeys][email:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    if (!res.ok) console.error("[Clinkeys] Email send failed:", await res.text());
  } catch (err) {
    console.error("[Clinkeys] Email send error:", err);
  }
}

const ROLE_LABEL: Record<string, string> = {
  MORTGAGE_ADVISOR: "mortgage advisor",
  SOLICITOR: "solicitor",
  SURVEYOR: "surveyor",
};

// Anonymised request summary — no buyer contact details until acceptance.
function requestSummary(req: MatchRequest): string {
  const lines = [
    `Property location: ${req.propertyPostcode}`,
    req.propertyPrice ? `Property price: £${req.propertyPrice.toLocaleString("en-GB")}` : null,
    req.buyerType ? `Buyer type: ${req.buyerType.replace(/_/g, " ").toLowerCase()}` : null,
    req.employmentType ? `Employment: ${req.employmentType.replace(/_/g, " ").toLowerCase()}` : null,
    req.depositPercent ? `Deposit: ${req.depositPercent}%` : null,
    req.creditIssues ? `Credit issues: yes` : null,
    req.schemeUsage ? `Scheme: ${req.schemeUsage.replace(/_/g, " ").toLowerCase()}` : null,
    req.lender ? `Lender: ${req.lender}` : null,
    req.surveyType ? `Survey type: ${req.surveyType.replace(/_/g, " ")}` : null,
    req.timeline ? `Timeline: ${req.timeline}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

export async function sendOfferEmail(
  assignment: Assignment & { professional: Professional; matchRequest: MatchRequest },
) {
  const url = `${siteUrl()}/professionals/requests/${assignment.id}`;
  await send(
    assignment.professional.email,
    `New client request on Clinkeys — respond within ${ACCEPT_WINDOW_HOURS} hours`,
    `Hi ${assignment.professional.name},

A buyer matching your profile is looking for a ${ROLE_LABEL[assignment.matchRequest.role]}.

${requestSummary(assignment.matchRequest)}

Review and accept or decline here:
${url}

If you don't respond within ${ACCEPT_WINDOW_HOURS} hours, the request will be passed to another professional.

— Clinkeys`,
  );
}

export async function sendReminderEmail(
  assignment: Assignment & { professional: Professional; matchRequest: MatchRequest },
) {
  const url = `${siteUrl()}/professionals/requests/${assignment.id}`;
  const hoursLeft = Math.max(
    1,
    Math.round((assignment.expiresAt.getTime() - Date.now()) / 3_600_000),
  );
  await send(
    assignment.professional.email,
    `Reminder: client request expires in ~${hoursLeft} hours`,
    `Hi ${assignment.professional.name},

You have an open client request on Clinkeys that expires in about ${hoursLeft} hours.

${requestSummary(assignment.matchRequest)}

Respond here: ${url}

— Clinkeys`,
  );
}

export async function sendBuyerMatchedEmail(req: MatchRequest, professional: Professional) {
  await send(
    req.buyerEmail,
    `Good news — we've matched you with a ${ROLE_LABEL[req.role]}`,
    `Hi ${req.buyerName},

${professional.name}${professional.firmName ? ` (${professional.firmName})` : ""} has accepted your request and will be in touch shortly.

Their contact details:
Email: ${professional.email}${professional.phone ? `\nPhone: ${professional.phone}` : ""}

— Clinkeys`,
  );
}

export async function sendBuyerRematchingEmail(req: MatchRequest) {
  await send(
    req.buyerEmail,
    `Update on your ${ROLE_LABEL[req.role]} request`,
    `Hi ${req.buyerName},

The professional we first contacted wasn't available, so we're now connecting you with the next best match. We'll email you as soon as they accept — no action needed from you.

— Clinkeys`,
  );
}

export async function sendBuyerUnmatchedEmail(req: MatchRequest) {
  await send(
    req.buyerEmail,
    `We're working on your ${ROLE_LABEL[req.role]} request`,
    `Hi ${req.buyerName},

We haven't yet found an available ${ROLE_LABEL[req.role]} for your request. Our team has been notified and is finding you a match manually — we'll be in touch within one working day.

— Clinkeys`,
  );
}

export async function sendOpsUnmatchedAlert(req: MatchRequest) {
  const ops = process.env.OPS_ALERT_EMAIL;
  if (!ops) {
    console.warn(`[Clinkeys] Request ${req.id} unmatched — set OPS_ALERT_EMAIL to get alerts.`);
    return;
  }
  await send(
    ops,
    `⚠ Unmatched ${ROLE_LABEL[req.role]} request: ${req.id}`,
    `Request ${req.id} exhausted its candidate pool.\n\nBuyer: ${req.buyerName} <${req.buyerEmail}>\n${requestSummary(req)}\n\nHandle manually.`,
  );
}
