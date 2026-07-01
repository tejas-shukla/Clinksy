"use client";

// AdvisorChat — a live buyer ↔ advisor conversation thread.
//
// Used by BOTH portals with the same backend (/api/conversations):
//   • Buyer side (mortgage-portal):  me="buyer",  buyerEmail = the buyer's email
//   • Advisor side (advisor-portal): me="advisor", buyerEmail = the client's email
//
// The whole history is loaded and rendered from the start of the conversation.
// It polls every few seconds so each side sees the other's new messages and can
// pick up where they left off. Either side can send the first message.

import { useCallback, useEffect, useRef, useState } from "react";

type ChatRole = "buyer" | "advisor";

type ChatMessage = {
  id: string;
  from: ChatRole;
  authorName: string;
  text: string;
  sentAt: string;
};

type ChatChannel = "advisor" | "solicitor";

type Props = {
  /** The buyer's email — the conversation key shared by both portals. */
  buyerEmail: string;
  /** Which side the current user is. */
  me: ChatRole;
  /** Display name used when this side sends a message. */
  myName: string;
  /** Which professional thread this is. Defaults to the mortgage advisor. */
  channel?: ChatChannel;
  /** Name shown for the other participant when they have not messaged yet. */
  counterpartName?: string;
  /** Poll interval in ms. */
  pollMs?: number;
};

const POLL_DEFAULT = 2000;

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdvisorChat({
  buyerEmail,
  me,
  myName,
  channel = "advisor",
  counterpartName,
  pollMs = POLL_DEFAULT,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/conversations?buyer=${encodeURIComponent(buyerEmail)}&channel=${channel}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load");
      const data = await res.json();
      setMessages(data.conversation?.messages ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the conversation.");
    } finally {
      setLoading(false);
    }
  }, [buyerEmail, channel]);

  // Initial load + polling.
  useEffect(() => {
    if (!buyerEmail) return;
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [buyerEmail, pollMs, load]);

  // Auto-scroll to the newest message when the count grows.
  useEffect(() => {
    if (messages.length !== lastCountRef.current) {
      lastCountRef.current = messages.length;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    // Optimistic append.
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      from: me,
      authorName: myName,
      text,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer: buyerEmail, from: me, authorName: myName, text, channel }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to send");
      const data = await res.json();
      setMessages(data.conversation?.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send your message.");
      // Roll back the optimistic message.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-[460px] flex-col rounded-2xl border border-ink/10 bg-white">
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-ink/50">
              No messages yet.
            </p>
            <p className="mt-1 max-w-xs text-xs text-ink/40">
              {me === "buyer"
                ? `Start the conversation with ${counterpartName ?? "your advisor"} — ask anything about your mortgage.`
                : `Send ${counterpartName ?? "your client"} a message to get started.`}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.from === me;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "bg-ink text-white"
                      : "bg-ink/[0.06] text-ink"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 px-1 text-[11px] text-ink/40">
                  {mine ? "You" : m.authorName} · {fmtTime(m.sentAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="px-4 pb-1 text-xs text-red-500">{error}</p>
      )}

      {/* Composer */}
      <div className="border-t border-ink/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={
              me === "buyer"
                ? "Message your advisor…"
                : "Message your client…"
            }
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-ink/15 bg-bone-200 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-ink/30"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            className="h-[44px] shrink-0 rounded-xl bg-ink px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
