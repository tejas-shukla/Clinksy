"use client";

// TryIt section — animated chat preview plays above the live ChatBot.
// The preview shows a scripted conversation so visitors understand how to
// interact before they start typing. Loops every ~12s.

import { useEffect, useState } from "react";
import { ChatBot } from "@/components/chat/ChatBot";

type Msg = { kind: "bot" | "user"; text: string };

const SCRIPT: { msg?: Msg; typing?: boolean; delay: number }[] = [
  { typing: true,                                                                        delay: 500  },
  { msg: { kind: "bot",  text: "Hi! I'm your home buying guide 🏡" },                     delay: 1100 },
  { typing: true,                                                                        delay: 1350 },
  { msg: { kind: "bot",  text: "Are you buying your first home, or remortgaging?" },    delay: 2100 },
  { msg: { kind: "user", text: "Buying my first home" },                                delay: 3500 },
  { typing: true,                                                                        delay: 3750 },
  { msg: { kind: "bot",  text: "Got it. Where are you right now?" },                   delay: 4600 },
  { msg: { kind: "user", text: "Had my offer accepted 🎉" },                            delay: 6100 },
  { typing: true,                                                                        delay: 6350 },
  { msg: { kind: "bot",  text: "Congratulations! You need 3 things now in parallel: a panel-approved solicitor, a survey, and your formal mortgage offer." }, delay: 7600 },
  { msg: { kind: "user", text: "How do I find a solicitor?" },                          delay: 9500 },
  { typing: true,                                                                        delay: 9750 },
  { msg: { kind: "bot",  text: "I'll compare panel-approved ones near you — no cold calls, just side-by-side prices." }, delay: 10900 },
];

const LOOP_AFTER = 14000;

export function TryIt() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      if (cancelled) return;
      setMessages([]);
      setShowTyping(false);

      SCRIPT.forEach((step) => {
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            if (step.typing) setShowTyping(true);
            if (step.msg) {
              setShowTyping(false);
              setMessages((prev) => [...prev, step.msg!]);
            }
          }, step.delay),
        );
      });

      timers.push(setTimeout(run, LOOP_AFTER));
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Keep only the last 5 messages so the panel doesn't overflow
  const visible = messages.slice(-5);

  return (
    <section id="try" className="border-t border-ink/10">
      <div className="container-narrow py-20 sm:py-24 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Chat to your guide</p>
          <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
            Where are you in
            <br />
            the journey?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/65">
            Tell our friendly guide where you are. We&apos;ll show you the next
            steps, what they cost, and who you&apos;ll need.
          </p>
        </div>

        {/* ── Animated preview ───────────────────────────────── */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-ink/10 bg-bone-50 shadow-[0_1px_0_rgba(10,10,10,0.04),0_8px_32px_-12px_rgba(10,10,10,0.08)]">
            {/* Chrome */}
            <div className="flex items-center justify-between border-b border-ink/8 px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink/15" />
                <span className="h-2 w-2 rounded-full bg-ink/15" />
                <span className="h-2 w-2 rounded-full bg-ink/15" />
                <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">
                  Preview
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-ink/35">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Live demo
              </span>
            </div>

            {/* Messages */}
            <div className="flex min-h-[200px] flex-col justify-end gap-2.5 px-5 py-5">
              {visible.map((msg, i) => (
                <div
                  key={`${msg.text}-${i}`}
                  className={[
                    "flex msg-enter",
                    msg.kind === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                      msg.kind === "user"
                        ? "rounded-br-sm bg-ink text-bone"
                        : "rounded-bl-sm bg-ink/6 text-ink",
                    ].join(" ")}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {showTyping && (
                <div className="flex justify-start msg-enter">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-ink/6 px-4 py-3">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink/35" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink/35" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink/35" />
                  </div>
                </div>
              )}
            </div>

            {/* Divider with label */}
            <div className="flex items-center gap-3 border-t border-ink/8 px-5 py-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/35">
                Now it&apos;s your turn ↓
              </span>
              <div className="flex-1 border-t border-ink/10" />
            </div>
          </div>
        </div>

        {/* ── Live interactive chatbot ────────────────────────── */}
        <div className="mx-auto mt-3 max-w-2xl">
          <ChatBot />
        </div>
      </div>
    </section>
  );
}
