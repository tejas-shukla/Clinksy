"use client";

// Sits above the tab bar on every dashboard tab.
// accent-400 = #C5644A  |  ink = #0A0A0A  (from tailwind.config.ts)

import { DASHBOARD_STAGES } from "@/lib/journey-data";

// Milestones shown as tick-marks on the progress bar
const MILESTONES = [
  { stageId: 1,  label: "Start"    },
  { stageId: 4,  label: "Offer"    },
  { stageId: 6,  label: "Survey"   },
  { stageId: 8,  label: "Exchange" },
  { stageId: 10, label: "🏡 Keys"  },
];

function motivationalText(pct: number, stagesLeft: number): { headline: string; sub: string } {
  if (stagesLeft === 0)  return { headline: "You've done it! 🎉", sub: "Journey complete — welcome home." };
  if (stagesLeft === 1)  return { headline: "One stage to go!", sub: "Almost there — the keys are within reach." };
  if (pct >= 70)         return { headline: `${pct}% complete`, sub: `Just ${stagesLeft} stages standing between you and your new home.` };
  if (pct >= 40)         return { headline: `${pct}% complete`, sub: `${stagesLeft} stages to go — you're more than halfway there!` };
  if (pct >= 20)         return { headline: `${pct}% complete`, sub: `${stagesLeft} stages to go. Every step brings you closer.` };
  return                        { headline: `${pct}% complete`, sub: `${stagesLeft} stages to go. You're on your way!` };
}

export function JourneyBanner({ currentStageId }: { currentStageId: number }) {
  const total      = DASHBOARD_STAGES.length;
  const stagesLeft = total - currentStageId;
  const pct        = Math.round(((currentStageId - 1) / (total - 1)) * 100);
  const { headline, sub } = motivationalText(pct, stagesLeft);

  return (
    <div className="mt-4 rounded-2xl border border-ink/10 bg-bone-50 px-4 py-3.5">

      {/* Top row: headline + stage counter */}
      <div className="flex items-baseline justify-between gap-2 mb-2.5">
        <p className="font-serif text-[17px] leading-snug text-ink">{headline}</p>
        <p className="shrink-0 text-[11px] font-medium text-ink/40">
          Stage {currentStageId} of {total}
        </p>
      </div>

      {/* Progress bar with milestone ticks */}
      <div className="relative h-3 w-full rounded-full bg-ink/8 overflow-visible">
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: "#C5644A" }}
        />

        {/* Milestone ticks */}
        {MILESTONES.map((m) => {
          const pos     = ((m.stageId - 1) / (total - 1)) * 100;
          const reached = m.stageId <= currentStageId;
          return (
            <div
              key={m.stageId}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            >
              <div
                className="h-3 w-1 rounded-full transition-colors duration-500"
                style={{ backgroundColor: reached ? "#FAFAF7" : "rgba(10,10,10,0.15)" }}
              />
            </div>
          );
        })}

        {/* "You are here" knob */}
        {pct > 0 && pct < 100 && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          >
            <div
              className="h-5 w-5 rounded-full border-2 border-bone shadow-sm transition-all duration-700"
              style={{ backgroundColor: "#C5644A" }}
            />
          </div>
        )}
      </div>

      {/* Milestone labels */}
      <div className="relative mt-1.5 h-4">
        {MILESTONES.map((m) => {
          const pos     = ((m.stageId - 1) / (total - 1)) * 100;
          const reached = m.stageId <= currentStageId;
          // Avoid clipping at edges
          const align   = pos <= 5 ? "left-0 translate-x-0" : pos >= 95 ? "right-0 translate-x-0" : "-translate-x-1/2";
          return (
            <span
              key={m.stageId}
              className={`absolute text-[9px] font-medium transition-colors duration-500 ${align}
                ${reached ? "text-accent-500" : "text-ink/25"}`}
              style={pos > 5 && pos < 95 ? { left: `${pos}%` } : undefined}
            >
              {m.label}
            </span>
          );
        })}
      </div>

      {/* Sub-text */}
      <p className="mt-2.5 text-[12px] leading-snug text-ink/55">{sub}</p>
    </div>
  );
}
