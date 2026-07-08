"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardGate } from "@/components/DashboardGate";
import { JourneyMap } from "@/components/dashboard/JourneyMap";
import { JourneyBanner } from "@/components/dashboard/JourneyBanner";
import { ProgressDonut } from "@/components/dashboard/ProgressDonut";
import { QuizSection } from "@/components/dashboard/QuizSection";
import { GamesSection } from "@/components/dashboard/GamesSection";
import { fireConfetti } from "@/lib/confetti";
import { DocumentsPanel } from "@/components/dashboard/DocumentsPanel";
import { useUser } from "@/lib/user-store";
import { getApplication } from "@/lib/mortgage-application-store";
import {
  DASHBOARD_STAGES,
  ONBOARDING_TO_STAGE_ID,
  type ServiceType,
} from "@/lib/journey-data";
import type { Stage } from "@/lib/auth";

type Tab = "today" | "mortgage" | "documents" | "journey" | "learn";

const TABS: { id: Tab; label: string }[] = [
  { id: "today",     label: "Today" },
  { id: "mortgage",  label: "Mortgage" },
  { id: "documents", label: "Documents" },
  { id: "journey",   label: "Journey" },
  { id: "learn",     label: "Learn" },
];

export default function DashboardClient() {
  const { user, setUser, clearUser, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [appStatus, setAppStatus] = useState<"none" | "draft" | "submitted">("none");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);

  // ── Stage calculation ──────────────────────────────────────────────────────
  const paramStage = parseInt(searchParams.get("stage") ?? "", 10);
  const paramStageValid = !isNaN(paramStage) && paramStage >= 1 && paramStage <= DASHBOARD_STAGES.length;

  const stageFromOnboarding = user?.buyingStage
    ? (ONBOARDING_TO_STAGE_ID[user.buyingStage as Stage] ?? 1)
    : null;

  const currentStageId = paramStageValid ? paramStage : (stageFromOnboarding ?? 1);
  const currentStage = DASHBOARD_STAGES.find((s) => s.id === currentStageId)!;

  useEffect(() => {
    if (user) {
      const app = getApplication(user.email);
      setAppStatus(app ? app.status : "none");
      try {
        const raw = localStorage.getItem("clinkeys_selected_advisor_v1");
        if (raw) setSelectedAdvisor(JSON.parse(raw)?.name ?? null);
      } catch {}
    }
  }, [user]);

  const firstName = user?.name && user.name !== "Guest" ? user.name.split(" ")[0] : "";
  const initials = firstName ? firstName[0].toUpperCase() : "?";

  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {!user ? (
        <>
          <DashboardGate onLogin={setUser} />
          <Footer />
        </>
      ) : (
        <main className="container-narrow py-5 sm:py-7">

          {/* ── Welcome row ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ProgressDonut currentStageId={currentStageId} total={DASHBOARD_STAGES.length} size={44} />
              <div>
                <h1 className="font-serif text-2xl leading-tight tracking-tightish text-ink sm:text-3xl">
                  {firstName ? `Welcome back, ${firstName}` : "Your dashboard"}
                </h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {firstName && (
                <div
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-sm font-medium text-ink"
                  title={user.email}
                >
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={clearUser}
                className="text-xs text-ink/40 underline-offset-2 hover:text-ink hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* ── Journey progress banner (always visible across all tabs) ── */}
          <JourneyBanner currentStageId={currentStageId} />

          {/* ── Tab bar ── */}
          <div className="mt-4 flex gap-1 rounded-2xl border border-ink/10 bg-ink/3 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl py-2 text-[13px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-bone shadow-sm text-ink"
                    : "text-ink/50 hover:text-ink/75"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Today ── */}
          {activeTab === "today" && (
            <TodayTab
              key={currentStageId}
              stage={currentStage}
              stageId={currentStageId}
              onGoMortgage={() => setActiveTab("mortgage")}
              onGoDocuments={() => setActiveTab("documents")}
            />
          )}

          {/* ── Tab: Mortgage ── */}
          {activeTab === "mortgage" && (
            <MortgageTab
              stageId={currentStageId}
              userEmail={user.email}
              appStatus={appStatus}
              selectedAdvisor={selectedAdvisor}
            />
          )}

          {/* ── Tab: Documents ── */}
          {activeTab === "documents" && (
            <DocumentsTab stageId={currentStageId} />
          )}

          {/* ── Tab: Journey ── */}
          {activeTab === "journey" && (
            <JourneyTab currentStageId={currentStageId} stage={currentStage} />
          )}

          {/* ── Tab: Learn ── */}
          {activeTab === "learn" && (
            <LearnTab />
          )}

        </main>
      )}

      {user && <Footer />}
    </>
  );
}

// ─── Tab: Today ───────────────────────────────────────────────────────────────

function TodayTab({
  stage,
  stageId,
  onGoMortgage,
  onGoDocuments,
}: {
  stage: typeof DASHBOARD_STAGES[0];
  stageId: number;
  onGoMortgage: () => void;
  onGoDocuments: () => void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const celebratedStage = React.useRef<number>(-1);

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  // Fire confetti when all items are checked (once per stage)
  React.useEffect(() => {
    if (
      stage.actions.length > 0 &&
      checked.size === stage.actions.length &&
      celebratedStage.current !== stageId
    ) {
      celebratedStage.current = stageId;
      fireConfetti({ origin: { x: 0.5, y: 0.35 } });
      // Side bursts for extra drama
      setTimeout(() => {
        fireConfetti({ origin: { x: 0.1, y: 0.55 } });
        fireConfetti({ origin: { x: 0.9, y: 0.55 } });
      }, 280);
    }
  }, [checked.size, stage.actions.length, stageId, stage]);

  const needsMortgage = stage.needs.includes("mortgage-broker");
  const needsSolicitor = stage.needs.includes("solicitor");
  const needsSurveyor = stage.needs.includes("surveyor");

  return (
    <div className="mt-5 space-y-4">
      {/* Stage card */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/40">
          {stage.timescale} · {stage.cost}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-snug text-ink">{stage.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{stage.whatHappens}</p>
      </div>

      {/* Checklist */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Your actions this stage
        </p>
        <ul className="mt-3 space-y-3">
          {stage.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-label={checked.has(i) ? "Mark undone" : "Mark done"}
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                  checked.has(i)
                    ? "border-accent-400 bg-accent-400 text-bone"
                    : "border-ink/25 bg-transparent hover:border-ink/50"
                }`}
              >
                {checked.has(i) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`text-[15px] leading-snug ${checked.has(i) ? "text-ink/35 line-through" : "text-ink"}`}>
                {action}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Stage complete celebration ── */}
      {checked.size === stage.actions.length && stage.actions.length > 0 && (
        <div className="rounded-2xl border border-accent-400/30 bg-accent-50 p-5 text-center">
          <p className="animate-bounce text-4xl">🎉</p>
          <p className="mt-2 font-serif text-xl text-ink">Stage {stageId} complete!</p>
          <p className="mt-1 text-sm text-ink/60">
            You&apos;re {Math.round((stageId / DASHBOARD_STAGES.length) * 100)}% through
            your journey to the keys
          </p>
          {stageId < DASHBOARD_STAGES.length && (
            <Link
              href={`/dashboard?stage=${stageId + 1}`}
              className="mt-4 inline-flex btn-solid text-sm"
            >
              Continue to stage {stageId + 1} →
            </Link>
          )}
          {stageId === DASHBOARD_STAGES.length && (
            <p className="mt-3 text-sm font-medium text-accent-500">
              🏡 You&apos;ve completed the journey. Congratulations!
            </p>
          )}
        </div>
      )}

      {/* Stage-specific CTAs */}
      {needsMortgage && (
        <button
          type="button"
          onClick={onGoMortgage}
          className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4 text-left hover:border-ink/25 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏦</span>
            <div>
              <p className="font-medium text-ink">
                {stageId <= 2 ? "Get your Mortgage in Principle" : "Secure your mortgage offer"}
              </p>
              <p className="text-sm text-ink/50">Find a broker · complete your application</p>
            </div>
          </div>
          <span className="text-ink/30">→</span>
        </button>
      )}

      {needsSolicitor && (
        <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-ink">Find a solicitor</p>
              <p className="text-sm text-ink/50">Conveyancing · lender panel · fixed fee</p>
            </div>
          </div>
          <Link href="/dashboard?stage=5" className="text-sm font-medium text-accent-500 hover:underline underline-offset-2">
            Compare →
          </Link>
        </div>
      )}

      {needsSurveyor && (
        <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔍</span>
            <div>
              <p className="font-medium text-ink">Book a property survey</p>
              <p className="text-sm text-ink/50">Level 2 or Level 3 · RICS accredited</p>
            </div>
          </div>
          <Link href="/dashboard?stage=6" className="text-sm font-medium text-accent-500 hover:underline underline-offset-2">
            Compare →
          </Link>
        </div>
      )}

      {/* Documents nudge */}
      <button
        type="button"
        onClick={onGoDocuments}
        className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4 text-left hover:border-ink/25 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <p className="font-medium text-ink">Upload your documents</p>
            <p className="text-sm text-ink/50">ID, payslips, bank statements</p>
          </div>
        </div>
        <span className="text-ink/30">→</span>
      </button>

    </div>
  );
}

// ─── Tab: Mortgage ────────────────────────────────────────────────────────────

function MortgageTab({
  stageId,
  userEmail,
  appStatus,
  selectedAdvisor,
}: {
  stageId: number;
  userEmail: string;
  appStatus: "none" | "draft" | "submitted";
  selectedAdvisor: string | null;
}) {
  const isMortgageStage = stageId <= 4;
  const flowUrl = stageId <= 2 ? "/mortgage-flow?stage=browsing" : "/mortgage-flow?stage=offer-placed";

  return (
    <div className="mt-5 space-y-4">
      {isMortgageStage ? (
        <>
          {/* Advisor status */}
          {selectedAdvisor ? (
            <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Your advisor</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-bone text-sm font-bold">
                  {selectedAdvisor.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-serif text-lg text-ink">{selectedAdvisor}</p>
                  <p className="text-xs text-ink/50">Selected mortgage advisor</p>
                </div>
              </div>
              <Link href={flowUrl} className="mt-3 inline-flex text-sm text-accent-500 underline-offset-2 hover:underline">
                Change advisor →
              </Link>
            </div>
          ) : (
            <Link
              href={flowUrl}
              className="flex items-center justify-between rounded-2xl border border-ink bg-ink px-5 py-4 hover:bg-ink/90 transition-colors"
            >
              <div>
                <p className="font-medium text-bone">
                  {stageId <= 2 ? "Get your Mortgage in Principle" : "Find a mortgage advisor"}
                </p>
                <p className="text-sm text-bone/60">Browse advisors, select one, start your application</p>
              </div>
              <span className="text-bone/60">→</span>
            </Link>
          )}

          {/* Application status */}
          {appStatus === "none" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-600">Application not started</p>
              <p className="mt-2 font-serif text-lg text-ink">Complete your mortgage application</p>
              <p className="mt-1 text-sm text-ink/55 leading-relaxed">
                Fill in your personal details, income, and financial history before your first advisor call. ~10 minutes.
              </p>
              <Link href="/mortgage-application" className="mt-4 inline-flex btn-solid text-sm">
                Start application →
              </Link>
            </div>
          )}

          {appStatus === "draft" && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-600">Application in progress</p>
              <p className="mt-2 font-serif text-lg text-ink">Continue where you left off</p>
              <p className="mt-1 text-sm text-ink/55">Your draft is saved. Finish it before contacting your advisor.</p>
              <Link href="/mortgage-application" className="mt-4 inline-flex btn-solid text-sm">
                Continue application →
              </Link>
            </div>
          )}

          {appStatus === "submitted" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600">Application submitted ✓</p>
              <p className="mt-2 font-serif text-lg text-ink">Your advisor can see your full details</p>
              <p className="mt-1 text-sm text-ink/55">All your income, financial history, and property details are ready for review.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/mortgage-application" className="btn-ghost text-sm">
                  Review →
                </Link>
                <Link href="/mortgage-portal" className="btn-solid text-sm">
                  View portal →
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Post-mortgage stages */
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600">Mortgage stage complete</p>
          <p className="mt-2 font-serif text-xl text-ink">Your mortgage offer is in place</p>
          <p className="mt-1 text-sm text-ink/60">You're now focused on the legal and completion stages. Documents are in your portal.</p>
          <Link href="/mortgage-portal" className="mt-4 inline-flex text-sm font-medium text-emerald-700 underline-offset-2 hover:underline">
            View mortgage portal →
          </Link>
        </div>
      )}

      {/* What to expect */}
      {isMortgageStage && (
        <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">How it works</p>
          <ol className="mt-3 space-y-3">
            {[
              stageId <= 2
                ? "Choose a mortgage advisor and get a free Mortgage in Principle"
                : "Contact your advisor to progress your full mortgage application",
              "Complete the mortgage application form (10 mins)",
              "Upload supporting documents (payslips, bank statements, ID)",
              "Your advisor submits to lenders and you get a formal offer",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink/70">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/8 text-[11px] font-medium text-ink">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Documents ───────────────────────────────────────────────────────────

function DocumentsTab({ stageId }: { stageId: number }) {
  return (
    <div className="mt-5 space-y-4">
      {/* Portal link card */}
      <Link
        href="/mortgage-portal"
        className="flex items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4 hover:border-ink/25 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📁</span>
          <div>
            <p className="font-medium text-ink">Mortgage document portal</p>
            <p className="text-sm text-ink/50">Upload and manage all your application documents</p>
          </div>
        </div>
        <span className="text-ink/30">→</span>
      </Link>

      {/* What you need this stage */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Documents needed at this stage</p>
        <ul className="mt-3 space-y-2">
          {getStageDocuments(stageId).map((doc) => (
            <li key={doc.id} className="flex items-start gap-3">
              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${doc.required ? "bg-accent-400" : "bg-ink/20"}`} />
              <span className="text-sm text-ink/75">
                {doc.label}
                {!doc.required && <span className="ml-1.5 text-[11px] text-ink/40">(optional)</span>}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-ink/35">Orange dot = required · grey = optional</p>
      </div>

      <DocumentsPanel currentStageId={stageId} />
    </div>
  );
}

function getStageDocuments(stageId: number) {
  const allDocs = [
    { id: "photo_id",        label: "Photo ID (passport or driving licence)",         required: true,  stages: [1,4,5] },
    { id: "proof_address",   label: "Proof of address (utility bill, bank statement)", required: true,  stages: [1,3,4,5] },
    { id: "payslips",        label: "Last 3 months' payslips",                        required: true,  stages: [1,4] },
    { id: "p60",             label: "Most recent P60",                                required: true,  stages: [1,4] },
    { id: "bank_statements", label: "3 months' bank statements",                      required: true,  stages: [1,4,8] },
    { id: "sa302",           label: "SA302 / Tax Year Overview (self-employed)",       required: false, stages: [1,4] },
    { id: "savings",         label: "Savings / deposit account statements",            required: true,  stages: [4,8] },
    { id: "gift_letter",     label: "Gifted deposit letter (if applicable)",           required: false, stages: [4] },
    { id: "memo_sale",       label: "Memorandum of Sale",                             required: true,  stages: [4,5] },
  ];
  const relevant = allDocs.filter((d) => d.stages.includes(stageId));
  return relevant.length > 0
    ? relevant
    : allDocs.filter((d) => d.stages.includes(1)); // fallback to basic docs
}

// ─── Tab: Journey ─────────────────────────────────────────────────────────────

function JourneyTab({ currentStageId, stage }: { currentStageId: number; stage: typeof DASHBOARD_STAGES[0] }) {
  return (
    <div className="mt-5 space-y-4">
      {/* Visual journey map */}
      <JourneyMap currentStageId={currentStageId} />

      {/* Current stage details */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-400 text-sm font-medium text-bone">
            {currentStageId}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent-500">You are here</p>
            <p className="mt-0.5 font-serif text-xl text-ink">{stage.title}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <span className="rounded-full border border-ink/10 px-2.5 py-1 text-[12px] text-ink/55">
                ⏱ {stage.timescale}
              </span>
              <span className="rounded-full border border-ink/10 px-2.5 py-1 text-[12px] text-ink/55">
                💷 {stage.cost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Watch out for */}
      {stage.watchOutFor.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-600">⚠ Watch out for</p>
          <ul className="mt-3 space-y-2.5">
            {stage.watchOutFor.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-ink/70">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All stages overview */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 overflow-hidden">
        <div className="border-b border-ink/8 px-5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">All stages</p>
        </div>
        <div className="divide-y divide-ink/6">
          {DASHBOARD_STAGES.map((s) => {
            const done = s.id < currentStageId;
            const active = s.id === currentStageId;
            return (
              <Link
                key={s.id}
                href={`/dashboard?stage=${s.id}`}
                className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink/3 ${active ? "bg-accent-50/50" : ""}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-medium ${
                  done ? "bg-accent-400 text-bone" : active ? "bg-ink text-bone" : "bg-ink/8 text-ink/40"
                }`}>
                  {done ? "✓" : s.id}
                </span>
                <span className={`flex-1 text-sm ${active ? "font-medium text-ink" : done ? "text-ink/50" : "text-ink/65"}`}>
                  {s.title}
                </span>
                <span className="text-[11px] text-ink/30">{s.cost}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Guide link */}
      <Link
        href={`/guides/${stage.slug}`}
        className="flex items-center justify-between rounded-2xl border border-ink/10 bg-bone-50 px-5 py-4 hover:border-ink/25 transition-colors"
      >
        <div>
          <p className="font-medium text-ink">Full guide for this stage</p>
          <p className="text-sm text-ink/50">{stage.guideTitle}</p>
        </div>
        <span className="text-ink/30">→</span>
      </Link>
    </div>
  );
}

// ─── Tab: Learn ───────────────────────────────────────────────────────────────

function LearnTab() {
  return (
    <div className="mt-5 space-y-4">
      {/* Intro card */}
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Build your knowledge
        </p>
        <p className="mt-1 font-serif text-xl text-ink">
          Test yourself, then buy with confidence
        </p>
        <p className="mt-2 text-sm text-ink/55 leading-relaxed">
          Quick quizzes and tools to sharpen your understanding before the big decisions.
        </p>
      </div>

      <QuizSection />
      <GamesSection />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2l1.5 4.5L15 8l-4.5 1.5L9 14l-1.5-4.5L3 8l4.5-1.5L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
