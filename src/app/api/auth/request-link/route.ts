import { NextResponse } from "next/server";
import {
  MAGIC_LINK_TTL_SECONDS,
  signToken,
  type Situation,
  type Stage,
} from "@/lib/auth";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_SITUATIONS: ReadonlySet<Situation> = new Set<Situation>([
  "first-time",
  "remortgage",
]);
const VALID_STAGES: ReadonlySet<Stage> = new Set<Stage>([
  "browsing",
  "offer-placed",
  "sourcing-pros",
  "in-flight",
]);

type RequestBody = {
  email?: string;
  name?: string;
  situation?: string;
  stage?: string;
};

export async function POST(req: Request) {
  if (!process.env.AUTH_SECRET) {
    return NextResponse.json(
      {
        error:
          "Magic links aren't configured yet. Set AUTH_SECRET in .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim() || undefined;
  const situation =
    body.situation && VALID_SITUATIONS.has(body.situation as Situation)
      ? (body.situation as Situation)
      : undefined;
  const stage =
    body.stage && VALID_STAGES.has(body.stage as Stage)
      ? (body.stage as Stage)
      : undefined;

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const token = signToken(
    { email, name, situation, stage },
    MAGIC_LINK_TTL_SECONDS,
  );
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(req.url).origin ||
    "http://localhost:4001";
  const link = `${baseUrl.replace(/\/$/, "")}/auth/verify?token=${encodeURIComponent(token)}`;

  console.log(
    `[Clinkeys] Magic link for ${email} (${situation ?? "unknown"} / ${stage ?? "unknown"}):\n${link}`,
  );

  let emailed = false;
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(email, link);
      emailed = true;
    } catch (err) {
      console.error("[Clinkeys] Resend send failed:", err);
    }
  }

  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    email,
    emailed,
    devLink: isDev ? link : undefined,
  });
}

async function sendViaResend(to: string, link: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Clinkeys <hello@clinkeys.com>",
      to,
      subject: "Your Clinkeys sign-in link",
      text: `Click this link to open your Clinkeys dashboard. It's valid for 12 months:\n\n${link}\n\nIf you didn't request this, you can ignore it.`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend returned ${res.status}`);
  }
}
