"use client";

// Dashboard section — visual preview of the Clinksy dashboard.
// Scroll-triggered animations: cost bar grows, cards fade up, phases pop in.
// Layout matches the product screenshot (4-phase progress, 3-col + 2-col cards,
// quick actions row, collapsed activity log).

import { useEffect, useRef, useState } from "react";

const PHASES = ["Get ready", "Find", "Make official", "Get the keys"];
const ACTIVE_PHASE = 3; // "Make official" — phases are 1-indexed

const TASKS = [
  { text: "Confirm survey date with Aurora Legal", done: false },
  { text: "Sign mortgage offer documents", done: false },
  { text: "Review final property report", done: true },
];

const QUICK_ACTIONS = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="3" width="5.5" height="8" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
        <rect x="7.5" y="3" width="5.5" height="8" rx="0.75" stroke="currentColor" strokeWidth="1.25" />
        <path d="M6.5 7H7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
    label: "Compare solicitors",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="1.5" width="10" height="11" rx="1" stroke="currentColor" strokeWidth="1.25" />
        <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
    label: "View documents",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
    label: "Cost breakdown",
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 10.5C2 8 4 6.5 7 6.5s5 1.5 5 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="7" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
    label: "Chat with guide",
  },
];

export function Dashboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          {/* Left column — copy */}
          <div className="md:col-span-5">
            <p className="eyebrow">The dashboard</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Your home,
              <br />
              on one page.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              Clinksy is the one tab you return to. Transparent progress,
              every cost itemised, proactive reminders — and the assistant
              always to hand. No lead-farm noise.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-ink/75">
              {[
                "Know exactly where you are in the process",
                "Every cost itemised — no surprises",
                "Reminders before deadlines slip",
                "Your AI assistant on every page",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — dashboard preview */}
          <div className="md:col-span-7">
            <DashboardPreview visible={visible} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview({ visible }: { visible: boolean }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const spent = 4210;
  const estimated = 8450;
  const barPct = Math.round((spent / estimated) * 100);

  const anim = (delay: number, type: string = "fade-up") =>
    visible
      ? {
          className: `dash-animate ${type} dash-running`,
          style: { animationDelay: `${delay}ms` } as React.CSSProperties,
        }
      : { className: "opacity-0" };

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-bone-50 shadow-[0_1px_0_rgba(10,10,10,0.04),0_16px_48px_-12px_rgba(10,10,10,0.10)]">
      {/* ── Greeting header ─────────────────────────────── */}
      <div className="flex items-baseline justify-between border-b border-ink/8 px-5 py-4 sm:px-6">
        <p className="font-serif text-lg text-ink sm:text-xl">
          Welcome back, Sara
        </p>
        <p className="text-[11px] text-ink/45">
          Phase {ACTIVE_PHASE} of 4 · {PHASES[ACTIVE_PHASE - 1]}
        </p>
      </div>

      <div className="px-5 pb-5 pt-5 sm:px-6">
        {/* ── 4-Phase progress ────────────────────────────── */}
        <div className="flex items-center" aria-label="Buying journey progress">
          {PHASES.map((phase, i) => {
            const phaseNum = i + 1;
            const isDone = phaseNum < ACTIVE_PHASE;
            const isActive = phaseNum === ACTIVE_PHASE;

            return (
              <div key={phase} className="flex flex-1 items-center">
                {/* Circle */}
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    {...anim(i * 80, "pop-in")}
                    className={[
                      anim(i * 80, "pop-in").className,
                      "grid h-7 w-7 place-items-center rounded-full text-xs font-medium transition-all",
                      isDone
                        ? "bg-ink text-bone"
                        : isActive
                          ? "border-2 border-accent-400 bg-bone-50 text-accent-400 phase-pulse"
                          : "border border-ink/20 bg-bone text-ink/35",
                    ].join(" ")}
                    style={anim(i * 80, "pop-in").style}
                  >
                    {isDone ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      phaseNum
                    )}
                  </div>
                  <p
                    className={[
                      "mt-1.5 text-[9px] font-medium uppercase tracking-[0.12em]",
                      isActive ? "text-accent-400" : "text-ink/40",
                    ].join(" ")}
                  >
                    {phase === "Get ready"
                      ? "Ready"
                      : phase === "Find your home"
                        ? "Find"
                        : phase === "Make official"
                          ? "Official"
                          : "Keys"}
                  </p>
                </div>
                {/* Connector */}
                {i < PHASES.length - 1 && (
                  <div
                    className={[
                      "mb-4 h-px flex-1",
                      phaseNum < ACTIVE_PHASE ? "bg-ink" : "bg-ink/15",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Row 1: Today | Costs | Reminder ─────────────── */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {/* Today */}
          <Card label="Today" badge={`${TASKS.filter((t) => t.done).length}/${TASKS.length} done`} animDelay={120} visible={visible}>
            <ul className="space-y-2.5">
              {TASKS.map((task) => (
                <li key={task.text} className="flex items-start gap-2">
                  <span
                    className={[
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      task.done ? "border-ink/30 bg-ink/8" : "border-ink/25 bg-bone",
                    ].join(" ")}
                  >
                    {task.done && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l1.5 1.5L7 1" stroke="#0A0A0A" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={[
                      "text-[12px] leading-snug",
                      task.done ? "text-ink/35 line-through" : "text-ink/80",
                    ].join(" ")}
                  >
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Costs so far */}
          <Card
            label={
              <span className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M5 2.5v5M3 4h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                Costs so far
              </span>
            }
            animDelay={200}
            visible={visible}
          >
            <p className="font-serif text-2xl leading-none text-ink">
              £{spent.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[11px] text-ink/50">
              of ~£{estimated.toLocaleString()}
            </p>
            {/* Animated cost bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className={[
                  "h-full rounded-full bg-accent-400",
                  visible ? "dash-animate grow-bar dash-running" : "",
                ].join(" ")}
                style={
                  {
                    "--bar-pct": `${barPct}%`,
                    animationDelay: "400ms",
                    width: visible ? undefined : "0%",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-ink/45">
              <span>{barPct}% spent</span>
              <span>All itemised</span>
            </div>
          </Card>

          {/* Next reminder */}
          <Card
            label={
              <span className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v4l2.5 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="5" cy="5" r="4.25" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                Next reminder
              </span>
            }
            animDelay={280}
            visible={visible}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl border border-accent-300/60 bg-accent-50 text-center">
                <p className="text-[8px] uppercase tracking-[0.1em] text-accent-500">May</p>
                <p className="font-serif text-base leading-none text-accent-500">14</p>
              </div>
              <p className="text-[12px] leading-relaxed text-ink/75">
                Ask your solicitor about exchange timing
              </p>
            </div>
          </Card>
        </div>

        {/* ── Row 2: Assistant (wider) + Overview ─────────── */}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {/* From your assistant — spans 2 cols */}
          <div className="sm:col-span-2">
            <Card label="From your assistant" animDelay={360} visible={visible}>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-400/15 text-sm text-accent-500">
                  ✦
                </div>
                <p className="text-[13px] italic leading-relaxed text-ink/70">
                  &ldquo;I&apos;ve drafted three questions to ask the surveyor on
                  tomorrow&apos;s call.&rdquo;
                </p>
              </div>
              <button className="mt-3 flex items-center gap-1 text-[12px] font-medium text-ink/55 transition-colors hover:text-ink">
                View suggestions
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M6.5 3.5L9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Card>
          </div>

          {/* Overview */}
          <Card label="Overview" animDelay={440} visible={visible}>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/6">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1.5" y="1" width="10" height="11" rx="1" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M3.5 4.5h6M3.5 6.5h6M3.5 8.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-serif text-lg leading-none text-ink">12</p>
                  <p className="text-[10px] text-ink/45">Documents · 3 need signing</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/6">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M1.5 6.5L6.5 2l5 4.5V11.5a.5.5 0 01-.5.5H8V8H5v4H2a.5.5 0 01-.5-.5V6.5z" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-ink">Under offer</p>
                  <p className="text-[10px] text-ink/45">Property status</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Quick actions ────────────────────────────────── */}
        <div
          className={[
            "mt-3 grid grid-cols-4 gap-2",
            visible ? "dash-animate fade-up dash-running" : "opacity-0",
          ].join(" ")}
          style={{ animationDelay: "520ms" } as React.CSSProperties}
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink/10 bg-bone py-3 text-center transition-colors hover:bg-bone-50"
            >
              <span className="text-ink/55">{action.icon}</span>
              <span className="text-[10px] leading-tight text-ink/55">{action.label}</span>
            </button>
          ))}
        </div>

        {/* ── Collapsed activity log ───────────────────────── */}
        <div
          className={[
            "mt-3",
            visible ? "dash-animate fade-up dash-running" : "opacity-0",
          ].join(" ")}
          style={{ animationDelay: "600ms" } as React.CSSProperties}
        >
          <button
            onClick={() => setActivityOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-ink/10 bg-bone px-4 py-2.5 text-left transition-colors hover:bg-bone-50"
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">
              Activity
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={[
                "text-ink/30 transition-transform duration-200",
                activityOpen ? "rotate-180" : "",
              ].join(" ")}
            >
              <path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {activityOpen && (
            <div className="mt-1 divide-y divide-ink/8 overflow-hidden rounded-xl border border-ink/10 bg-bone">
              {[
                { time: "Yesterday, 3:41pm", text: "Mortgage offer received from Halifax" },
                { time: "Mon 12 May", text: "Survey booked with RICS Direct" },
                { time: "Fri 9 May", text: "Solicitor instructed — Aurora Legal" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400/60" />
                  <div>
                    <p className="text-[11px] text-ink/40">{item.time}</p>
                    <p className="text-[12px] text-ink/75">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  badge,
  children,
  animDelay,
  visible,
}: {
  label: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  animDelay: number;
  visible: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-ink/10 bg-bone p-4",
        visible ? "dash-animate fade-up dash-running" : "opacity-0",
      ].join(" ")}
      style={{ animationDelay: `${animDelay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink/40">
          {label}
        </p>
        {badge && (
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-accent-500">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
