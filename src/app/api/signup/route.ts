import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
};

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
  // Support both JSON and form posts (the marketing form uses a regular form submit).
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = { email: form.get("email")?.toString() };
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

  // MVP: log to server console. Plug in a real database (Postgres, KV, etc.)
  // later, or pipe straight into ConvertKit/Mailchimp/Resend audiences.
  console.log(`[Clinksy] Early-access signup: ${email}`);
  await maybeSendWelcome(email);

  // For form posts, send the user back with a thank-you query param.
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/?signup=ok", req.url), 303);
  }

  return NextResponse.json({ ok: true });
}
