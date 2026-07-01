import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  source?: string;
};

// ── Store the signup in Airtable, if configured ────────────────────────
async function saveToAirtable(email: string, source: string, date: string) {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) return;
  const table = process.env.AIRTABLE_TABLE || "Signups";
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typecast: true,
          records: [{ fields: { Email: email, Source: source, Date: date } }],
        }),
      },
    );
    if (!res.ok) {
      console.error("[Clinksy] Airtable save failed:", await res.text());
    }
  } catch (err) {
    console.error("[Clinksy] Airtable save error:", err);
  }
}

// ── Store the signup in a Google Sheet (Apps Script webhook) ───────────
async function saveToGoogleSheet(email: string, source: string, date: string) {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, date }),
    });
  } catch (err) {
    console.error("[Clinksy] Google Sheet save error:", err);
  }
}

// ── Optional welcome email via Resend ──────────────────────────────────
async function maybeSendWelcome(email: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Clinksy <hello@clinksy.com>",
        to: email,
        subject: "Welcome to Clinksy — early access",
        text: `Thanks for joining the Clinksy early-access list. We'll let you know the moment the dashboard and adviser matching go live, plus send the occasional newsletter.\n\nIn the meantime, our free home buying guides are here: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/guides\n\n— Clinksy`,
      }),
    });
  } catch (err) {
    console.error("[Clinksy] Welcome email failed:", err);
  }
}

export async function POST(req: Request) {
  let body: Body;
  // Support both JSON and form posts (the marketing forms use a regular submit).
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = {
        email: form.get("email")?.toString(),
        source: form.get("source")?.toString(),
      };
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const source = (body.source || "unknown").slice(0, 60);
  const date = new Date().toISOString();

  console.log(`[Clinksy] Signup: ${email} (source: ${source})`);

  // Persist everywhere that's configured (safe if none are set).
  await Promise.allSettled([
    saveToAirtable(email, source, date),
    saveToGoogleSheet(email, source, date),
    maybeSendWelcome(email),
  ]);

  // For plain form posts, redirect back with a thank-you flag.
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/?signup=ok", req.url), 303);
  }

  return NextResponse.json({ ok: true });
}
