// GET /api/cron/matching — Vercel Cron: 12h reminders + 24h expiries + pass-on.
// Configured in vercel.json. Protect with CRON_SECRET (Vercel sends it as a
// Bearer token automatically when the env var is set).
import { NextResponse } from "next/server";
import { sweep } from "@/lib/matching/lifecycle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await sweep();
  return NextResponse.json({ ok: true, ...results });
}
