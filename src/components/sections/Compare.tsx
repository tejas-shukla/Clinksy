"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Stage = {
  id: string;
  phase: string;
  when: string;
  pro: string | null;
  why: string;
  need: string | null;
};

const STAGES: Stage[] = [
  {
    id: "budget",
    phase: "Getting mortgage-ready",
    when: "Right at the start",
    pro: "Mortgage adviser",
    why: "Clinkeys matches you with a whole-of-market adviser to lock in your best rate before you start viewing.",
    need: "Matched on your deposit, income & timeline",
  },
  {
    id: "offer",
    phase: "Offer accepted",
    when: "The moment your offer is in",
    pro: "Conveyancing solicitor",
    why: "We introduce a vetted solicitor straight away so the legal work starts without losing days.",
    need: "Matched on leasehold vs freehold & location",
  },
  {
    id: "survey",
    phase: "Checking the property",
    when: "Once your solicitor is instructed",
    pro: "RICS surveyor",
    why: "We line up a surveyor suited to the property — and the right level of survey for its age and type.",
    need: "Matched on property age, type & condition",
  },
  {
    id: "keys",
    phase: "Exchange & completion",
    when: "The final stretch",
    pro: null,
    why: "Your dashboard keeps every professional in sync right through to keys in hand.",
    need: null,
  },
];

export function Compare() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gentle auto-advance through the journey until the user interacts.
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, 3200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  function select(i: number) {
    setPaused(true);
    setActive(i);
  }

  const current = STAGES[active];

  return (
    <section id="compare" className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          {/* Left: pitch */}
          <div className="md:col-span-5">
            <p className="eyebrow">On your dashboard</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Matched at the
              <br />
              right moment.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              As you move through your personalised Clinkeys dashboard, we
              understand where you are and what you need — and introduce the
              right mortgage adviser, solicitor, or surveyor at exactly the
              right time. No searching, no guesswork, no lead farm.
            </p>

            <Link href="/start" className="btn-solid mt-8 inline-block">
              Get early access
            </Link>
          </div>

          {/* Right: interactive journey */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-ink/10 bg-white/40 p-6 sm:p-8">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                  Your journey
                </p>
                <span className="flex items-center gap-1.5 text-[11px] text-ink/45">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
                  Live dashboard
                </span>
              </div>

              {/* Auto-advance progress bar */}
              <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
                {!paused && (
                  <div
                    key={active}
                    className="matcher-progress h-full rounded-full bg-accent-400/50"
                  />
                )}
              </div>

              {/* Journey steps */}
              <ol className="mt-5 space-y-2.5">
                {STAGES.map((s, i) => {
                  const isActive = i === active;
                  return (
                    <li
                      key={s.id}
                      className="dash-animate fade-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => select(i)}
                        aria-expanded={isActive}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                          isActive
                            ? "border-ink/25 bg-ink/[0.03]"
                            : "border-transparent hover:bg-ink/[0.02]"
                        }`}
                      >
                        <span
                          key={isActive ? `on-${i}` : `off-${i}`}
                          className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                            isActive
                              ? "matcher-pop bg-accent-400 text-bone"
                              : "bg-ink/10 text-ink/50"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block text-[15px] font-medium text-ink">
                            {s.phase}
                          </span>
                          <span className="block text-xs text-ink/45">
                            {s.when}
                          </span>
                        </span>
                        {s.pro && (
                          <span
                            className={`hidden flex-none rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline ${
                              isActive
                                ? "bg-accent-400/12 text-accent-400"
                                : "text-ink/40"
                            }`}
                          >
                            {s.pro}
                          </span>
                        )}
                      </button>

                      {/* Matched-pro detail for the active stage */}
                      {isActive && (
                        <div
                          key={s.id}
                          className="matcher-reveal mx-1 mt-2 rounded-xl border border-ink/10 bg-bone/60 p-4"
                        >
                          {s.pro ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent-400">
                                  Matched for you
                                </span>
                              </div>
                              <p className="mt-1.5 font-serif text-lg text-ink">
                                Your {s.pro.toLowerCase()}
                              </p>
                              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                                {s.why}
                              </p>
                              {s.need && (
                                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 text-[12px] text-ink/55">
                                  <span
                                    aria-hidden
                                    className="h-1.5 w-1.5 rounded-full bg-accent-400"
                                  />
                                  {s.need}
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="font-serif text-lg text-ink">
                                Keys in hand 🎉
                              </p>
                              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
                                {s.why}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            <p className="mt-4 text-center text-xs text-ink/40">
              Clinkeys stays on your side — we match you to the right fit at the
              right time, and never sell your details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
