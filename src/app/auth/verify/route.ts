import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signToken,
  verifyToken,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?auth=missing", req.url));
  }

  if (!process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/?auth=unconfigured", req.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/?auth=invalid", req.url));
  }

  // Issue a session cookie. Same signed-token format, different lifetime
  // (matches the link in our case — 12 months).
  const sessionToken = signToken(
    { email: payload.email, name: payload.name },
    SESSION_TTL_SECONDS,
  );

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  return res;
}
