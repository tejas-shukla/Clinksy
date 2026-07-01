// chat-store.ts — server-side persistence for buyer ↔ advisor conversations.
//
// A "conversation" is the running thread between one buyer and their mortgage
// advisor. It is keyed by the buyer's email (lower-cased) — the buyer is the
// stable participant; whichever advisor serves them writes into the same thread.
//
// Either side can start the thread. POSTing the first message creates it.
// The full history is always returned, so both portals can render the
// conversation from the very beginning and "continue where they left off".
//
// Storage backend (selected automatically):
//   1. Upstash Redis (HTTP REST) when UPSTASH_REDIS_REST_URL + token are set.
//      Works on Vercel serverless and syncs across devices/browsers. Recommended
//      for production so the buyer and advisor genuinely see the same thread.
//   2. Local JSON file (.data/conversations.json) otherwise — for local dev.
//      Note: the file backend is per-machine and will NOT persist on Vercel's
//      ephemeral serverless filesystem, so configure Upstash for any deploy.

import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type ChatRole = "buyer" | "advisor";

// A buyer can hold separate threads with different professionals. Each is one
// "channel". "advisor" (mortgage advisor) is the default and — for backward
// compatibility with threads created before channels existed — uses the
// unsuffixed storage key. New channels (e.g. "solicitor") are suffixed.
export type ChatChannel = "advisor" | "solicitor";

export const CHAT_CHANNELS: ReadonlySet<ChatChannel> = new Set<ChatChannel>([
  "advisor",
  "solicitor",
]);

export function isChatChannel(value: unknown): value is ChatChannel {
  return typeof value === "string" && CHAT_CHANNELS.has(value as ChatChannel);
}

export type ChatMessage = {
  id: string;
  from: ChatRole;
  authorName: string;
  text: string;
  sentAt: string; // ISO 8601
};

export type Conversation = {
  buyerEmail: string;
  messages: ChatMessage[];
  updatedAt: string; // ISO 8601
};

const MAX_TEXT_LENGTH = 4000;
const MAX_MESSAGES = 1000;

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function newMessage(input: {
  from: ChatRole;
  authorName: string;
  text: string;
}): ChatMessage {
  return {
    id: crypto.randomUUID(),
    from: input.from,
    authorName: input.authorName.trim().slice(0, 200) || "Unknown",
    text: input.text.trim().slice(0, MAX_TEXT_LENGTH),
    sentAt: new Date().toISOString(),
  };
}

// ─── Backend selection ────────────────────────────────────────────────────────

function usingUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function keyFor(buyerEmail: string, channel: ChatChannel): string {
  const base = `clinksy:conversation:${normaliseEmail(buyerEmail)}`;
  // "advisor" keeps the legacy unsuffixed key so existing threads are preserved.
  return channel === "advisor" ? base : `${base}:${channel}`;
}

function emptyConversation(buyerEmail: string): Conversation {
  return {
    buyerEmail: normaliseEmail(buyerEmail),
    messages: [],
    updatedAt: new Date(0).toISOString(),
  };
}

// ─── Upstash Redis (REST) backend ─────────────────────────────────────────────

async function upstashGet(buyerEmail: string, channel: ChatChannel): Promise<Conversation> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(`${url}/get/${encodeURIComponent(keyFor(buyerEmail, channel))}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const data = (await res.json()) as { result: string | null };
  if (!data.result) return emptyConversation(buyerEmail);
  try {
    return JSON.parse(data.result) as Conversation;
  } catch {
    return emptyConversation(buyerEmail);
  }
}

async function upstashSet(conv: Conversation, channel: ChatChannel): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(`${url}/set/${encodeURIComponent(keyFor(conv.buyerEmail, channel))}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conv),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
}

// ─── Local JSON-file backend (dev fallback) ───────────────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "conversations.json");

type FileShape = Record<string, Conversation>;

async function fileReadAll(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as FileShape;
  } catch {
    return {};
  }
}

async function fileWriteAll(all: FileShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2), "utf8");
}

async function fileGet(buyerEmail: string, channel: ChatChannel): Promise<Conversation> {
  const all = await fileReadAll();
  return all[keyFor(buyerEmail, channel)] ?? emptyConversation(buyerEmail);
}

async function fileSet(conv: Conversation, channel: ChatChannel): Promise<void> {
  const all = await fileReadAll();
  all[keyFor(conv.buyerEmail, channel)] = conv;
  await fileWriteAll(all);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getConversation(
  buyerEmail: string,
  channel: ChatChannel = "advisor",
): Promise<Conversation> {
  if (usingUpstash()) return upstashGet(buyerEmail, channel);
  return fileGet(buyerEmail, channel);
}

export async function appendMessage(
  buyerEmail: string,
  message: ChatMessage,
  channel: ChatChannel = "advisor",
): Promise<Conversation> {
  const conv = await getConversation(buyerEmail, channel);
  const messages = [...conv.messages, message].slice(-MAX_MESSAGES);
  const next: Conversation = {
    buyerEmail: normaliseEmail(buyerEmail),
    messages,
    updatedAt: message.sentAt,
  };
  if (usingUpstash()) await upstashSet(next, channel);
  else await fileSet(next, channel);
  return next;
}

export function isPersistentBackendConfigured(): boolean {
  return usingUpstash();
}
