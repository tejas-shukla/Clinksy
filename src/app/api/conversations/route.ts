// /api/conversations — buyer ↔ advisor chat thread.
//
//   GET  /api/conversations?buyer=<email>
//        → { conversation: { buyerEmail, messages[], updatedAt } }
//        Returns the full history from the start of the conversation.
//
//   POST /api/conversations
//        body: { buyer: <email>, from: "buyer"|"advisor", authorName, text }
//        → { conversation }  (appends one message, creating the thread if new)
//
// Either side may send the first message. Both portals poll GET to stay in sync.

import { NextResponse } from "next/server";
import {
  appendMessage,
  getConversation,
  isChatChannel,
  newMessage,
  type ChatChannel,
  type ChatRole,
} from "@/lib/chat-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const buyer = params.get("buyer")?.trim();
  const channelParam = params.get("channel") ?? "advisor";
  if (!buyer || !EMAIL_REGEX.test(buyer)) {
    return NextResponse.json(
      { error: "A valid buyer email is required." },
      { status: 400 },
    );
  }
  if (!isChatChannel(channelParam)) {
    return NextResponse.json({ error: "Unknown channel." }, { status: 400 });
  }
  try {
    const conversation = await getConversation(buyer, channelParam as ChatChannel);
    return NextResponse.json({ conversation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load conversation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type PostBody = {
  buyer?: string;
  from?: string;
  authorName?: string;
  text?: string;
  channel?: string;
};

export async function POST(req: Request) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const buyer = body.buyer?.trim();
  const from = body.from;
  const text = body.text?.trim();
  const authorName = body.authorName?.trim();
  const channel = body.channel ?? "advisor";

  if (!buyer || !EMAIL_REGEX.test(buyer)) {
    return NextResponse.json(
      { error: "A valid buyer email is required." },
      { status: 400 },
    );
  }
  if (from !== "buyer" && from !== "advisor") {
    return NextResponse.json(
      { error: "`from` must be 'buyer' or 'advisor'." },
      { status: 400 },
    );
  }
  if (!isChatChannel(channel)) {
    return NextResponse.json({ error: "Unknown channel." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Message text is required." }, { status: 400 });
  }

  try {
    const message = newMessage({
      from: from as ChatRole,
      authorName: authorName || (from === "advisor" ? "Your advisor" : "Buyer"),
      text,
    });
    const conversation = await appendMessage(buyer, message, channel as ChatChannel);
    return NextResponse.json({ conversation, message }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
