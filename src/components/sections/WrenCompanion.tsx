"use client";

// WrenCompanion — animated chat preview showing Wren as a supportive guide.
// Placed just above the email sign-up section. Loops continuously.

import { useEffect, useState } from "react";

type Msg = { kind: "bot" | "user"; text: string };

const SCRIPT: { msg?: Msg; typing?: boolean; delay: number }[] = [
  { typing: true,                                                                              delay: 400  },
  { msg: { kind: "bot",  text: "Hi, I'm Wren 👋 I'm here every step of the way." },           delay: 1000 },
  { typing: true,                                                                              delay: 1400 },
  { msg: { kind: "bot",  text: "Buying a home can feel overwhelming. You're not alone in this." }, delay: 2400 },
  { msg: { kind: "user", text: "Honestly, I don't even know where to start" },               delay: 4000 },
  { typing: true,                                                                              delay: 4300 },
  { msg: { kind: "bot",  text: "That's completely normal. Let's figure out where you are right now and go from there — one step at a time." }, delay: 5500 },
  { msg: { kind: "user", text: "I'm worried about all the costs" },                          delay: 7400 },
  { typing: true,                                                                              delay: 7700 },
  { msg: { kind: "bot",  text: "I'll show you exactly what to expect at each stage — no surprises, no jargon." }, delay: 8900 },
  { msg: { kind: "user", text: "What if I make the wrong decision?" },                       delay: 10800 },
  { typing: true,                                                                              delay: 11100 },
  { msg: { kind: "bot",  text: "I'll flag anything that needs attention before it becomes a problem. That's what I'm here for." }, delay: 12400 },
];

const LOOP_AFTER = 16000;

export function WrenCompanion() {
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

  const visible = messages.slice(-5);

  function openChat() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ds-open-chat"));
    }
  }

  return (
    <section id="wren" className="border-t border-ink/10">
      <div className="container-narrow py-20 sm:py-24 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">

          {/* ── Left: copy ── */}
          <div>
            <p className="eyebrow">Your friendly guide</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[42px]">
              You&apos;re not alone
              <br />
              in this.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/65">
              Wren is your hand-holder through every stage — from your first
              Google search to getting your keys. Ask anything, any time.
              No judgement, no jargon, no agenda.
            </p>
            <ul className="mt-6 space-y-3 text-[15px] text-ink/70">
              {[
                "Explains every step before you hit it",
                "Flags costs and deadlines proactively",
                "Answers questions at 11pm when the anxiety kicks in",
                "Remembers where you are so you never repeat yourself",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={openChat}
              className="btn-solid mt-8"
            >
              Say hi to Wren →
            </button>
          </div>

          {/* ── Right: animated chat ── */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-bone-50 shadow-[0_1px_0_rgba(10,10,10,0.04),0_8px_32px_-12px_rgba(10,10,10,0.10)]">
              {/* Chrome */}
              <div className="flex items-center justify-between border-b border-ink/8 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-400" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">
                    Wren — your guide
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-ink/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Always here
                </span>
              </div>

              {/* Messages */}
              <div className="flex min-h-[260px] flex-col justify-end gap-2.5 px-5 py-5">
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
                        "max-w-[82%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed",
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

              {/* CTA row */}
              <button
                type="button"
                onClick={openChat}
                className="flex w-full items-center justify-between border-t border-ink/8 px-5 py-3.5 text-left transition-colors hover:bg-ink/3"
              >
                <span className="text-[13px] text-ink/40">
                  Start your own conversation…
                </span>
                <span className="text-[11px] font-medium text-accent-500">
                  Open chat →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
