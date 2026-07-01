"use client";

import React from "react";
import Link from "next/link";
import { DASHBOARD_STAGES } from "@/lib/journey-data";

const EMOJIS = ["💰", "🔍", "🤝", "🏦", "⚖️", "🔎", "🛡️", "📝", "🔑", "🏡"];

// Short labels that fit on 1–2 lines under each node
const SHORT_LABELS = [
  "Budget",
  "Find home",
  "Make offer",
  "Mortgage",
  "Legal",
  "Survey",
  "Insurance",
  "Exchange",
  "Completion",
  "Move in",
];

export function JourneyMap({ currentStageId }: { currentStageId: number }) {
  const total = DASHBOARD_STAGES.length;
  const pct = Math.round(((currentStageId - 1) / (total - 1)) * 100);
  const stagesLeft = total - currentStageId;

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
            Road to completion
          </p>
          <p className="mt-0.5 font-serif text-xl text-ink">
            {stagesLeft === 0
              ? "You've done it! 🎉"
              : `${stagesLeft} stage${stagesLeft === 1 ? "" : "s"} to your new home`}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="font-serif text-3xl leading-none text-accent-400">{pct}%</p>
          <p className="text-[11px] text-ink/40 mt-0.5">complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-ink/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-ink/30 mt-1 mb-5">
        <span>Stage 1 · Budget</span>
        <span>Stage 10 · 🏡 Move in</span>
      </div>

      {/* Stage nodes — horizontal scroll */}
      <div className="overflow-x-auto -mx-5 px-5 pb-2">
        <div className="flex items-start min-w-max">
          {DASHBOARD_STAGES.map((stage, i) => {
            const done = stage.id < currentStageId;
            const active = stage.id === currentStageId;
            return (
              <React.Fragment key={stage.id}>
                {/* Node column */}
                <Link
                  href={`/dashboard?stage=${stage.id}`}
                  className="flex flex-col items-center w-16 group"
                >
                  {/* Circle */}
                  <div
                    className={`relative grid h-10 w-10 place-items-center rounded-full text-[15px] transition-all
                      ${done
                        ? "bg-accent-400 text-bone"
                        : active
                        ? "bg-ink text-bone ring-4 ring-ink/12"
                        : "bg-ink/8 text-ink/30 group-hover:bg-ink/15"
                      }`}
                  >
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      EMOJIS[i]
                    )}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent-400 border-2 border-bone"
                      />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`mt-1.5 text-[10px] font-medium leading-tight text-center
                      ${done ? "text-ink/50" : active ? "text-ink" : "text-ink/40"}`}
                  >
                    {SHORT_LABELS[i]}
                  </span>
                  {active && (
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-accent-500">
                      here
                    </span>
                  )}
                </Link>

                {/* Connector line */}
                {i < total - 1 && (
                  <div className="h-10 w-3 flex items-center flex-shrink-0">
                    <div
                      className={`h-0.5 w-full rounded-full ${
                        stage.id < currentStageId ? "bg-accent-400" : "bg-ink/10"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Next milestone pill */}
      {currentStageId < total && DASHBOARD_STAGES[currentStageId] && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-ink/4 px-3 py-2.5">
          <span className="text-lg" aria-hidden="true">{EMOJIS[currentStageId]}</span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">Next milestone</p>
            <p className="text-sm text-ink">{DASHBOARD_STAGES[currentStageId].title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
