"use client";

import { useEffect, useRef, useState } from "react";

type Role = "assistant" | "user";

type Message = {
  id: string;
  role: Role;
  content: string;
};

const ACCOUNT_MARKER = "[[CREATE_ACCOUNT]]";

const INITIAL_MESSAGE: Message = {
  id: "clinkeys-intro",
  role: "assistant",
  content:
    "Hi — I'm Clinkeys. I help first-time buyers in the UK through every step of the process, in plain English. Before we get going, what should I call you?",
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function stripMarker(text: string) {
  return text.replace(/\[\[CREATE_ACCOUNT\]\]/g, "").trim();
}

function findEmail(text: string): string | undefined {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0];
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkSent, setLinkSent] = useState<{
    email: string;
    devLink?: string;
  } | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message as content streams in.
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, showLinkForm, linkSent]);

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || isStreaming) return;

    setError(null);
    const userMsg: Message = { id: newId(), role: "user", content: clean };
    const assistantId = newId();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsStreaming(true);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Couldn't reach the assistant.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let markerSeen = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        if (!markerSeen && buffer.includes(ACCOUNT_MARKER)) {
          markerSeen = true;
        }

        const displayed = stripMarker(buffer);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: displayed } : m,
          ),
        );
      }

      if (markerSeen && !linkSent) {
        setShowLinkForm(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) =>
        prev.filter((m) => !(m.id === assistantId && m.content === "")),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  async function handleLinkRequest(name: string, email: string) {
    setError(null);
    const res = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() || undefined, email }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let detail = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error) detail = parsed.error;
      } catch {
        // not JSON — leave as-is
      }
      throw new Error(detail || "Couldn't send the link.");
    }
    const data = (await res.json()) as {
      email: string;
      devLink?: string;
    };
    setLinkSent({ email: data.email, devLink: data.devLink });
    setShowLinkForm(false);
  }

  // Best-effort pre-fill of the email field: scan the existing user messages.
  const inferredEmail = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        const e = findEmail(messages[i].content);
        if (e) return e;
      }
    }
    return undefined;
  })();

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-bone-50 shadow-[0_1px_0_rgba(10,10,10,0.04),0_8px_32px_-12px_rgba(10,10,10,0.08)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-ink/10 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">
          Clinkeys · live
        </span>
        {linkSent && (
          <span className="ml-auto rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-500">
            Link sent
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="max-h-[460px] min-h-[260px] overflow-y-auto px-5 py-6"
      >
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-relaxed text-bone"
                    : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-ink-50 px-4 py-2.5 text-[15px] leading-relaxed text-ink"
                }
              >
                {m.content ||
                  (m.role === "assistant" && isStreaming ? (
                    <ThinkingDots />
                  ) : null)}
              </div>
            </li>
          ))}
        </ul>

        {showLinkForm && !linkSent && (
          <MagicLinkForm
            initialEmail={inferredEmail ?? ""}
            onSubmit={handleLinkRequest}
            onSkip={() => setShowLinkForm(false)}
          />
        )}

        {linkSent && <LinkSentNotice info={linkSent} />}

        {error && (
          <p className="mt-4 rounded-2xl border border-accent-100 bg-accent-50 px-4 py-2.5 text-[13px] text-accent-500">
            {error}
          </p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 border-t border-ink/10 px-4 py-3 sm:px-5"
      >
        <label htmlFor="chat-input" className="sr-only">
          Type your question
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question…"
          rows={1}
          disabled={isStreaming}
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-bone transition-opacity hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 7h9M7.5 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40 [animation-delay:400ms]" />
    </span>
  );
}

type MagicLinkFormProps = {
  initialEmail: string;
  onSubmit: (name: string, email: string) => Promise<void>;
  onSkip: () => void;
};

function MagicLinkForm({ initialEmail, onSubmit, onSkip }: MagicLinkFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(name, email.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't send the link.";
      setLocalError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handle}
      className="mt-4 rounded-2xl border border-ink/10 bg-bone p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-400">
        Send my sign-in link
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/70">
        No password needed. We&apos;ll email you a single link — it&apos;s good
        for 12 months and opens your dashboard in one click.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Your name (optional)" id="ml-name">
          <input
            id="ml-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sara"
            className="w-full bg-transparent py-1.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </Field>
        <Field label="Email" id="ml-email">
          <input
            id="ml-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-transparent py-1.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
          />
        </Field>
      </div>

      {localError && (
        <p className="mt-3 text-[13px] text-accent-500">{localError}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn-solid">
          {busy ? "Sending…" : "Send my link"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] text-ink/55 underline-offset-4 hover:underline"
        >
          Not yet, keep chatting
        </button>
      </div>
    </form>
  );
}

function LinkSentNotice({
  info,
}: {
  info: { email: string; devLink?: string };
}) {
  return (
    <div className="mt-4 rounded-2xl border border-ink/10 bg-bone p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-400">
        Check your inbox
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
        We&apos;ve sent a sign-in link to{" "}
        <span className="text-ink">{info.email}</span>. It&apos;s good for 12
        months — click it from any device and you&apos;ll land on your
        dashboard.
      </p>
      {info.devLink && (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-bone-50 p-3 text-[12px] text-ink/70">
          <p className="font-medium text-ink/80">Dev shortcut</p>
          <p className="mt-1">
            Email isn&apos;t hooked up locally, so use this link to open the
            dashboard right now:
          </p>
          <a
            href={info.devLink}
            className="mt-2 inline-flex break-all rounded-full bg-ink px-3 py-1.5 font-medium text-bone hover:bg-ink-700"
          >
            Open my dashboard →
          </a>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">
        {label}
      </span>
      <span className="mt-1 block border-b border-ink/15 focus-within:border-ink/40">
        {children}
      </span>
    </label>
  );
}
