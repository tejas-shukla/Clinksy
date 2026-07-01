"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// Rule-based automated chatbot. Not rendered in the current release.
// Drives users toward the dashboard by asking the two key questions
// (situation + stage), then collecting an email and sending a magic link.

type Situation = "first-time" | "remortgage";
type Stage = "browsing" | "offer-placed" | "sourcing-pros" | "in-flight";

type Option = {
  label: string;
  nextId?: string;
  action?: Action;
};

type Action =
  | { type: "set-situation"; value: Situation }
  | { type: "set-stage"; value: Stage }
  | { type: "request-email" }
  | { type: "submit-email" };

type Node = {
  id: string;
  bot: string[];
  options?: Option[];
};

type ChatTurn =
  | { kind: "bot"; id: string; text: string }
  | { kind: "user"; id: string; text: string };

const NODES: Record<string, Node> = {
  welcome: {
    id: "welcome",
    bot: [
      "Hi! 🏡",
      "I'm here to guide you through every step of buying your first home — from figuring out what you can borrow to picking up the keys.",
      "Before we dive in — how are you feeling about it all today?",
    ],
    options: [
      { label: "Excited, let's go!", nextId: "feeling-excited" },
      { label: "Nervous / a bit overwhelmed", nextId: "feeling-nervous" },
      { label: "Pretty stressed right now", nextId: "feeling-stressed" },
      { label: "Just need some quick info", nextId: "ask-situation" },
    ],
  },
  "feeling-excited": {
    id: "feeling-excited",
    bot: [
      "Love that energy! Buying your first home is genuinely exciting — and you're smart to get organised early.",
      "Let's make sure that excitement is backed up with a solid plan. Quick question:",
    ],
    options: [
      { label: "Buying my first home", action: { type: "set-situation", value: "first-time" }, nextId: "ask-stage" },
      { label: "Remortgaging", action: { type: "set-situation", value: "remortgage" }, nextId: "ask-stage" },
    ],
  },
  "feeling-nervous": {
    id: "feeling-nervous",
    bot: [
      "That's completely normal — almost everyone feels this way. The process has a lot of moving parts and it can feel like everyone else knows something you don't.",
      "You don't need to know it all at once. I'll break it down one step at a time, and I'm here whenever things feel unclear.",
      "To start — are you buying your first home, or remortgaging?",
    ],
    options: [
      { label: "Buying my first home", action: { type: "set-situation", value: "first-time" }, nextId: "ask-stage" },
      { label: "Remortgaging", action: { type: "set-situation", value: "remortgage" }, nextId: "ask-stage" },
    ],
  },
  "feeling-stressed": {
    id: "feeling-stressed",
    bot: [
      "I hear you. This process is genuinely hard, and the stress is real — you're not imagining it.",
      "Whatever's happening right now, we'll work through it. Most problems in a house purchase are solvable. Let's figure out where you are first.",
      "Are you buying your first home, or remortgaging?",
    ],
    options: [
      { label: "Buying my first home", action: { type: "set-situation", value: "first-time" }, nextId: "ask-stage" },
      { label: "Remortgaging", action: { type: "set-situation", value: "remortgage" }, nextId: "ask-stage" },
    ],
  },
  "ask-situation": {
    id: "ask-situation",
    bot: ["Of course — are you buying your first home, or remortgaging?"],
    options: [
      { label: "Buying my first home", action: { type: "set-situation", value: "first-time" }, nextId: "ask-stage" },
      { label: "Remortgaging", action: { type: "set-situation", value: "remortgage" }, nextId: "ask-stage" },
    ],
  },
  "ask-stage": {
    id: "ask-stage",
    bot: ["Got it. Where are you in the process right now?"],
    options: [
      {
        label: "Still browsing properties",
        action: { type: "set-stage", value: "browsing" },
        nextId: "plan-browsing",
      },
      {
        label: "Made or had an offer accepted",
        action: { type: "set-stage", value: "offer-placed" },
        nextId: "plan-offer",
      },
      {
        label: "Looking for a broker, solicitor, or surveyor",
        action: { type: "set-stage", value: "sourcing-pros" },
        nextId: "plan-sourcing",
      },
      {
        label: "Mid-purchase and hit a snag",
        action: { type: "set-stage", value: "in-flight" },
        nextId: "plan-flight",
      },
    ],
  },
  "plan-browsing": {
    id: "plan-browsing",
    bot: [
      "Lovely — you're at the start of the journey, which is actually the best time to get organised.",
      "Your two priorities right now are:\n\n1. A mortgage Agreement in Principle (AIP) — sellers won't take you seriously without one.\n2. A clear budget that includes the upfront extras (deposit + ~£5k for fees and surveys).",
      "I can open your personalised dashboard with these as your first checklist. Want to do that?",
    ],
    options: [
      { label: "Yes, open my dashboard", nextId: "ask-email" },
      { label: "Tell me more about AIPs first", nextId: "info-aip" },
    ],
  },
  "plan-offer": {
    id: "plan-offer",
    bot: [
      "Congratulations! The next two weeks are about locking down three things in parallel:",
      "1. A panel-approved solicitor (£1,000–£2,500).\n2. A Level 2 HomeBuyer survey, or Level 3 for older homes (£500–£1,500).\n3. Your formal mortgage offer through underwriting.",
      "Your dashboard will show all three side-by-side with a checklist. Open it now?",
    ],
    options: [
      { label: "Yes, open my dashboard", nextId: "ask-email" },
      { label: "What's a Level 2 vs Level 3 survey?", nextId: "info-survey" },
    ],
  },
  "plan-sourcing": {
    id: "plan-sourcing",
    bot: [
      "We'll compare options for you — no lead-farm calls, no inflated prices, just side-by-side.",
      "Which one do you need first?",
    ],
    options: [
      { label: "A mortgage broker", nextId: "ask-email" },
      { label: "A solicitor / conveyancer", nextId: "ask-email" },
      { label: "A surveyor", nextId: "ask-email" },
      { label: "Honestly, all of them", nextId: "ask-email" },
    ],
  },
  "plan-flight": {
    id: "plan-flight",
    bot: [
      "Most snags are recoverable — chains, downvaluations, slow solicitors, even gazumping.",
      "Open your dashboard and I'll surface the right playbook plus a clear escalation path.",
    ],
    options: [
      { label: "Open my dashboard", nextId: "ask-email" },
      { label: "What kind of snag is it?", nextId: "info-snag" },
    ],
  },
  "info-aip": {
    id: "info-aip",
    bot: [
      "An AIP (Agreement in Principle) is a soft-credit-check letter from a lender saying \"we'd probably lend you up to £X\".",
      "It's free, takes a couple of days, and is valid 30–90 days. Worth getting through a whole-of-market broker rather than going to your own bank — better rates and a wider view.",
    ],
    options: [
      { label: "Open my dashboard with this as step 1", nextId: "ask-email" },
    ],
  },
  "info-survey": {
    id: "info-survey",
    bot: [
      "Level 2 (HomeBuyer Report): the standard survey for homes under 50 years old in good condition. £500–£1,000.",
      "Level 3 (Full Structural): for older homes, listed properties, or anywhere with visible issues. Up to £1,500 but the detail can be ammunition to renegotiate the price.",
      "Want me to open your dashboard and shortlist surveyors near your postcode?",
    ],
    options: [{ label: "Yes please", nextId: "ask-email" }],
  },
  "info-snag": {
    id: "info-snag",
    bot: [
      "Pick the closest one and I'll bring up the right playbook on your dashboard.",
    ],
    options: [
      { label: "Chain has wobbled or broken", nextId: "ask-email" },
      { label: "Lender downvalued the property", nextId: "ask-email" },
      { label: "Solicitor is being slow", nextId: "ask-email" },
      { label: "Something else", nextId: "ask-email" },
    ],
  },
  "ask-email": {
    id: "ask-email",
    bot: [
      "Perfect. Drop your email below and I'll send you a one-tap sign-in link — it's good for 12 months, so you can come back any time without a password.",
    ],
    options: [{ label: "I'll add my email", action: { type: "request-email" } }],
  },
};

export function ChatBot() {
  const [nodeId, setNodeId] = useState<string>("welcome");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

  const currentNode = useMemo(() => NODES[nodeId], [nodeId]);

  // Push the current bot node's messages into history when it changes.
  useEffect(() => {
    if (!currentNode) return;
    const newTurns: ChatTurn[] = currentNode.bot.map((text, i) => ({
      kind: "bot",
      id: `${currentNode.id}-${i}`,
      text,
    }));
    setHistory((prev) => {
      // Avoid duplicating if user revisits the same node.
      const last = prev[prev.length - 1];
      if (last?.kind === "bot" && last.id.startsWith(`${currentNode.id}-`)) {
        return prev;
      }
      return [...prev, ...newTurns];
    });
  }, [currentNode]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, showEmail, done]);

  function handleOption(opt: Option) {
    // Echo the user's choice into history.
    setHistory((prev) => [
      ...prev,
      { kind: "user", id: `u-${Date.now()}`, text: opt.label },
    ]);

    // Apply any side-effect action.
    if (opt.action) {
      if (opt.action.type === "set-situation") setSituation(opt.action.value);
      if (opt.action.type === "set-stage") setStage(opt.action.value);
      if (opt.action.type === "request-email") setShowEmail(true);
    }

    if (opt.nextId) {
      setNodeId(opt.nextId);
    }
  }

  async function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          situation,
          stage,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let detail = text;
        try {
          const parsed = JSON.parse(text);
          if (parsed?.error) detail = parsed.error;
        } catch {
          // ignore
        }
        throw new Error(detail || "Couldn't send the link.");
      }
      const data = (await res.json()) as { devLink?: string };
      setDevLink(data.devLink);
      setShowEmail(false);
      setDone(true);
      setHistory((prev) => [
        ...prev,
        {
          kind: "user",
          id: `u-email-${Date.now()}`,
          text: email,
        },
        {
          kind: "bot",
          id: `done-${Date.now()}`,
          text: `Brilliant — link on its way to ${email}. It's good for 12 months. Click it from any device and you'll land straight on your dashboard.`,
        },
      ]);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-bone-50 shadow-[0_1px_0_rgba(10,10,10,0.04),0_8px_32px_-12px_rgba(10,10,10,0.08)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-ink/10 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="h-2 w-2 rounded-full bg-ink/20" />
        <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">
          Your home guide
        </span>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="max-h-[520px] min-h-[320px] overflow-y-auto px-5 py-6"
      >
        <ul className="space-y-3">
          {history.map((t) => (
            <li
              key={t.id}
              className={
                t.kind === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  t.kind === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-relaxed text-bone"
                    : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-ink-50 px-4 py-2.5 text-[15px] leading-relaxed text-ink"
                }
              >
                {t.text}
              </div>
            </li>
          ))}
        </ul>

        {/* Option chips */}
        {!showEmail && !done && currentNode?.options && (
          <div className="mt-5 flex flex-wrap gap-2">
            {currentNode.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleOption(opt)}
                className="rounded-full border border-ink/20 bg-bone px-4 py-2 text-left text-sm text-ink/85 transition-colors hover:border-ink hover:bg-ink hover:text-bone"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Email form */}
        {showEmail && !done && (
          <form
            onSubmit={handleSubmitEmail}
            className="mt-5 rounded-2xl border border-ink/10 bg-bone p-4"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-400">
              Send my sign-in link
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Your name (optional)" id="bot-name">
                <input
                  id="bot-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sara"
                  className="w-full bg-transparent py-1.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
                />
              </Field>
              <Field label="Email" id="bot-email">
                <input
                  id="bot-email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent py-1.5 text-[15px] text-ink placeholder:text-ink/35 focus:outline-none"
                />
              </Field>
            </div>
            {error && (
              <p className="mt-3 text-[13px] text-accent-500">{error}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={busy} className="btn-solid">
                {busy ? "Sending…" : "Send my link"}
              </button>
              <button
                type="button"
                onClick={() => setShowEmail(false)}
                className="text-[13px] text-ink/55 underline-offset-4 hover:underline"
              >
                Not yet
              </button>
            </div>
          </form>
        )}

        {/* Done with dev link shortcut */}
        {done && devLink && (
          <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-bone p-4 text-[13px] text-ink/70">
            <p className="font-medium text-ink">Dev shortcut</p>
            <p className="mt-1">
              Email isn&apos;t hooked up locally, so use this to land on the
              dashboard now:
            </p>
            <Link
              href={devLink}
              className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bone hover:bg-ink-700"
            >
              Open my dashboard →
            </Link>
          </div>
        )}
      </div>
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
