import crypto from "node:crypto";

// 12 months — matches the user-facing promise that links don't expire often.
export const MAGIC_LINK_TTL_SECONDS = 60 * 60 * 24 * 365;
// Session cookie also lives 12 months so they stay logged in.
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365;

export const SESSION_COOKIE_NAME = "ds_session";

export type Situation = "first-time" | "remortgage";
export type Stage =
  | "browsing"
  | "offer-placed"
  | "sourcing-pros"
  | "in-flight";

export type TokenPayload = {
  email: string;
  name?: string;
  situation?: Situation;
  stage?: Stage;
  iat: number;
  exp: number;
};

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input: string): Buffer {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a 24+ character secret in .env.local.",
    );
  }
  return secret;
}

export function signToken(
  payload: {
    email: string;
    name?: string;
    situation?: Situation;
    stage?: Stage;
  },
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const full: TokenPayload = {
    email: payload.email,
    name: payload.name,
    situation: payload.situation,
    stage: payload.stage,
    iat: now,
    exp: now + ttlSeconds,
  };
  const body = base64url(JSON.stringify(full));
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest();
  return `${body}.${base64url(sig)}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest();
  const got = base64urlDecode(sig);

  if (expected.length !== got.length) return null;
  if (!crypto.timingSafeEqual(expected, got)) return null;

  try {
    const decoded = JSON.parse(base64urlDecode(body).toString()) as TokenPayload;
    if (typeof decoded.exp !== "number") return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof decoded.email !== "string") return null;
    return decoded;
  } catch {
    return null;
  }
}
