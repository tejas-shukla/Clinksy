"use client";

// StageProgressBar — 10-stage journey tracker with click-to-expand detail cards.
// Each card shows: stage info, relevant professionals, reminder input (localStorage),
// mark complete, Ask guide, and a full guide link.
// Used on both Dashboard 1 and Dashboard 2.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DASHBOARD_STAGES,
  SAMPLE_PROVIDERS,
  SERVICE_LABEL,
} from "@/lib/journey-data";
// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "clinksy_stage_reminders_v1";

function loadReminders(): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function persistReminders(r: Record<number, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StageProgressBar({
  currentStageId,
  basePath = "/dashboard",
}: {
  currentStageId: number;
  basePath?: string;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(currentStageId);
  const [reminders, setReminders] = useState<Record<number, string>>({});
  const [draft, setDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  // Load reminders from localStorage after mount
  useEffect(() => {
    setReminders(loadReminders());
  }, []);

  // Sync draft when the open stage changes
  useEffect(() => {
    if (openId !== null) setDraft(reminders[openId] ?? "");
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(id: number) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function saveReminder() {
    if (openId === null) return;
    const next = { ...reminders, [openId]: draft };
    setReminders(next);
    persistReminders(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  const openStage = openId != null
    ? DASHBOARD_STAGES.find((s) => s.id === openId)
    : null;

  const pct = Math.round(
    ((currentStageId - 1) / (DASHBOARD_STAGES.length - 1)) * 100,
  );

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-4 sm:p-5">
      {/* ── Header row ── */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
          Journey progress
        </p>
        <span className="text-[11px] text-ink/40">
          Stage {currentStageId} of {DASHBOARD_STAGES.length} &nbsp;·&nbsp; {pct}% complete
        </span>
      </div>

      {/* ── Overall progress bar ── */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-accent-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── Stage circles ── */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-max items-center">
          {DASHBOARD_STAGES.map((s, i) => {
            const status =
              s.id < currentStageId
                ? "done"
                : s.id === currentStageId
                  ? "current"
                  : "upcoming";
            const isOpen = openId === s.id;
            const isLast = i === DASHBOARD_STAGES.length - 1;

            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => toggle(s.id)}
                    aria-expanded={isOpen}
                    aria-label={`Stage ${s.id}: ${s.title}`}
                    title={s.title}
                    className={[
                      "relative grid h-8 w-8 place-items-center rounded-full text-xs font-medium transition-all sm:h-9 sm:w-9",
                      "hover:ring-2 hover:ring-ink/20 hover:ring-offset-1",
                      isOpen ? "ring-2 ring-ink ring-offset-1" : "",
                      status === "done"
                        ? "bg-ink text-bone"
                        : status === "current"
                          ? "border-2 border-accent-400 bg-bone text-accent-500"
                          : "border border-ink/15 bg-bone text-ink/30",
                    ].join(" ")}
                  >
                    {status === "done" ? (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5.5l2.5 2.5 4.5-5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      s.id
                    )}
                    {/* Reminder indicator dot */}
                    {reminders[s.id] && (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-bone bg-accent-400"
                        aria-label="Has reminder"
                      />
                    )}
                  </button>
                </div>
                {!isLast && (
                  <div
                    className={[
                      "mx-0.5 h-px w-4 sm:w-5",
                      s.id < currentStageId ? "bg-ink" : "bg-ink/15",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expanded detail card ── */}
      {openStage && (
        <div className="mt-4 space-y-3 rounded-xl border border-ink/10 bg-bone p-4">
          {/* Stage header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.13em]",
                    openStage.id < currentStageId
                      ? "bg-ink/10 text-ink/55"
                      : openStage.id === currentStageId
                        ? "bg-accent-50 text-accent-500"
                        : "bg-ink/5 text-ink/35",
                  ].join(" ")}
                >
                  {openStage.id < currentStageId
                    ? "Completed"
                    : openStage.id === currentStageId
                      ? "You are here"
                      : "Upcoming"}
                </span>
                <span className="text-[10px] text-ink/35">
                  Stage {openStage.id}
                </span>
              </div>
              <p className="font-serif text-lg leading-snug text-ink">
                {openStage.title}
              </p>
              <p className="mt-0.5 text-xs text-ink/50">
                {openStage.timescale} &nbsp;·&nbsp; {openStage.cost}
              </p>
            </div>
            <button
              onClick={() => setOpenId(null)}
              className="shrink-0 p-0.5 text-ink/30 transition-colors hover:text-ink"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3 3l8 8M11 3l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Professionals ── */}
          {openStage.needs.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.13em] text-ink/40">
                Who you need at this stage
              </p>
              <div className="space-y-2">
                {openStage.needs.map((svc) => (
                  <div
                    key={svc}
                    className="overflow-hidden rounded-lg border border-ink/10"
                  >
                    <div className="flex items-center justify-between bg-bone px-3 py-2">
                      <p className="text-xs font-medium text-ink">
                        {SERVICE_LABEL[svc]}
                      </p>
                      <Link
                        href={`/dashboard?stage=${openStage.id}#providers`}
                        className="text-[10px] text-accent-500 hover:underline"
                      >
                        Compare all →
                      </Link>
                    </div>
                    {SAMPLE_PROVIDERS[svc].slice(0, 2).map((p) => (
                      <div
                        key={p.name}
                        className="flex items-center justify-between border-t border-ink/8 px-3 py-1.5 text-[11px]"
                      >
                        <span className="text-ink/60">
                          {p.name} &nbsp;·&nbsp; {p.rating}
                        </span>
                        <span className="font-medium text-ink">{p.price}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Reminder ── */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-ink/40">
              Reminder
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveReminder()}
                placeholder="Add a note or reminder for this stage…"
                className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-bone-50 px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
              />
              <button
                onClick={saveReminder}
                className="shrink-0 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-bone transition-colors hover:bg-ink/80"
              >
                Save
              </button>
            </div>
            {savedFlash && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-accent-500">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Reminder saved
              </p>
            )}
            {!savedFlash && reminders[openId!] && (
              <p className="mt-1.5 text-[11px] text-ink/45">
                ↑ &nbsp;{reminders[openId!]}
              </p>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Mark complete (only for current stage) */}
            {openStage.id === currentStageId &&
              openStage.id < DASHBOARD_STAGES.length && (
                <button
                  onClick={() =>
                    router.push(`${basePath}?stage=${openStage.id + 1}`)
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-bone transition-colors hover:bg-ink/80"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mark complete
                </button>
              )}
            {/* Jump to stage (if not current) */}
            {openStage.id !== currentStageId && (
              <button
                onClick={() =>
                  router.push(`${basePath}?stage=${openStage.id}`)
                }
                className="rounded-lg border border-ink/20 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/40"
              >
                Go to this stage
              </button>
            )}
            {/* Full guide */}
            <Link
              href={`/guides/${openStage.slug}`}
              className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-medium text-ink/55 transition-colors hover:border-ink/30 hover:text-ink"
            >
              Full guide →
            </Link>
          </div>
        </div>
      )}

      {/* ── Footer summary ── */}
      <p className="mt-3 text-center text-[11px] text-ink/35">
        {currentStageId >= DASHBOARD_STAGES.length
          ? "🏠 Journey complete!"
          : `${DASHBOARD_STAGES.length - currentStageId} stage${
              DASHBOARD_STAGES.length - currentStageId !== 1 ? "s" : ""
            } remaining`}
        &nbsp;·&nbsp; Click any stage to see details, set reminders, or compare professionals
      </p>
    </div>
  );
}
