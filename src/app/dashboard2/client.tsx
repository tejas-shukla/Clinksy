"use client";

// Dashboard 2 — Duolingo-style gamified home-buying journey
// Streak · Hearts · XP · League · Stage path · Mini quiz game

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConversationsCard } from "@/components/chat/ConversationsCard";
import { FinancialPanel } from "@/components/dashboard/FinancialPanel";
import { DocumentsPanel } from "@/components/dashboard/DocumentsPanel";
import { StageProgressBar } from "@/components/dashboard/StageProgressBar";
import { DashboardGate } from "@/components/DashboardGate";
import { useUser } from "@/lib/user-store";
import { DASHBOARD_STAGES } from "@/lib/journey-data";

// ─── Quiz questions ───────────────────────────────────────────────────────────

const QUIZ: {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  xp: number;
}[] = [
  {
    q: "What is an 'Agreement in Principle' (AIP) / Mortgage in Principle (MIP)?",
    options: [
      "A formal mortgage offer from your bank",
      "A soft-check letter showing roughly how much a lender will offer",
      "A legal agreement between buyer and seller",
      "A surveyor's report on the property",
    ],
    correct: 1,
    explanation:
      "An AIP / MIP is a free, soft-credit-check letter — not a binding offer. It's valid for 30–90 days and helps strengthen your offer to sellers.",
    xp: 30,
  },
  {
    q: "What happens at 'exchange of contracts'?",
    options: [
      "You get the keys to your new home",
      "The solicitor checks the title deeds",
      "Both parties sign and swap contracts — the sale becomes legally binding",
      "The mortgage is formally approved",
    ],
    correct: 2,
    explanation:
      "Exchange makes the deal legally binding. Neither party can pull out without a financial penalty.",
    xp: 40,
  },
  {
    q: "What does a conveyancer / solicitor do?",
    options: [
      "Values the property for the bank",
      "Handles all the legal work to transfer ownership",
      "Arranges your mortgage rate",
      "Inspects the property for structural issues",
    ],
    correct: 1,
    explanation:
      "The conveyancer (or solicitor) does searches, checks the title, drafts contracts and handles the money transfer.",
    xp: 30,
  },
  {
    q: "Stamp Duty (SDLT) — when do first-time buyers start paying it in England?",
    options: [
      "From the first £1 of the purchase price",
      "On any property over £125,000",
      "On the portion above £300,000 (up to a max property price of £500,000)",
      "They never pay Stamp Duty",
    ],
    correct: 2,
    explanation:
      "Since April 2025, first-time buyers in England pay 0% on the first £300,000, then 5% up to £500,000. Properties over £500k get standard rates.",
    xp: 50,
  },
  {
    q: "What's the difference between a Level 2 HomeBuyer Report and a Level 3 Full Structural Survey?",
    options: [
      "They are exactly the same thing",
      "The Level 2 is quicker but less detailed — a Level 3 is more thorough and suits older/unusual properties",
      "A Level 3 Survey is only for commercial properties",
      "The Level 2 includes a mortgage valuation; the Level 3 does not",
    ],
    correct: 1,
    explanation:
      "A Level 2 (HomeBuyer Report) is fine for modern properties in good condition. Go Level 3 (Full Structural) for anything pre-1930 or with obvious issues.",
    xp: 40,
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

const ACHIEVEMENTS: {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlockedAt: number;
}[] = [
  { id: "first-steps",     icon: "🚀", label: "First Steps",     desc: "Started your home journey",       unlockedAt: 1  },
  { id: "mortgage-ready",  icon: "💰", label: "Mortgage Ready",  desc: "Got your Mortgage in Principle",  unlockedAt: 1  },
  { id: "house-hunter",    icon: "🔍", label: "House Hunter",    desc: "Attended your first viewing",     unlockedAt: 2  },
  { id: "offer-maker",     icon: "✍️",  label: "Offer Maker",     desc: "Made your first offer",           unlockedAt: 4  },
  { id: "offer-accepted",  icon: "🎉", label: "Offer Accepted!", desc: "Your offer was accepted!",        unlockedAt: 5  },
  { id: "survey-ace",      icon: "📋", label: "Survey Ace",      desc: "Survey report received",          unlockedAt: 6  },
  { id: "exchange-expert", icon: "🤝", label: "Exchange Expert", desc: "Exchanged contracts — legal!",    unlockedAt: 9  },
  { id: "homeowner",       icon: "🏠", label: "Homeowner!",      desc: "Keys in hand. You did it.",       unlockedAt: 10 },
];

// ─── Quests per stage (updated: stage 1 now leads with MIP) ──────────────────

const STAGE_QUESTS: Record<number, { id: number; label: string; xp: number }[]> = {
  1:  [
        { id: 1, label: "Get your Mortgage in Principle (MIP/AIP) — free & strengthens offers", xp: 50 },
        { id: 2, label: "Pull your free credit report (Experian, ClearScore)", xp: 20 },
        { id: 3, label: "Speak to a whole-of-market mortgage broker", xp: 40 },
        { id: 4, label: "Set your walk-away monthly budget", xp: 20 },
      ],
  2:  [{ id: 1, label: "Search Rightmove & Zoopla daily", xp: 10 }, { id: 2, label: "Book 3+ viewings", xp: 30 }, { id: 3, label: "Research the neighbourhood", xp: 20 }],
  3:  [{ id: 1, label: "Confirm your budget with broker", xp: 20 }, { id: 2, label: "Prepare your offer strategy", xp: 30 }],
  4:  [{ id: 1, label: "Submit your offer in writing", xp: 30 }, { id: 2, label: "Negotiate if needed", xp: 20 }],
  5:  [{ id: 1, label: "Instruct a conveyancing solicitor", xp: 40 }, { id: 2, label: "Book your property survey", xp: 30 }, { id: 3, label: "Request formal mortgage offer", xp: 50 }],
  6:  [{ id: 1, label: "Review the survey report", xp: 30 }, { id: 2, label: "Re-negotiate if issues found", xp: 40 }],
  7:  [{ id: 1, label: "Approve final mortgage offer", xp: 50 }, { id: 2, label: "Sign all solicitor forms", xp: 30 }],
  8:  [{ id: 1, label: "Confirm exchange date with solicitor", xp: 30 }, { id: 2, label: "Pay deposit via solicitor", xp: 40 }],
  9:  [{ id: 1, label: "Do final walkthrough of property", xp: 30 }, { id: 2, label: "Arrange buildings insurance", xp: 40 }, { id: 3, label: "Book removal van", xp: 20 }],
  10: [{ id: 1, label: "Collect the keys! 🎉", xp: 100 }, { id: 2, label: "Change locks", xp: 20 }, { id: 3, label: "Set up utilities", xp: 20 }],
};

const LEAGUE_LABEL = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Dashboard2Client() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, isLoaded } = useUser();

  const paramStage = parseInt(searchParams.get("stage") ?? "", 10);
  const currentStageId =
    !isNaN(paramStage) && paramStage >= 1 && paramStage <= DASHBOARD_STAGES.length
      ? paramStage
      : 5;

  const currentStage = DASHBOARD_STAGES.find((s) => s.id === currentStageId)!;
  const quests = STAGE_QUESTS[currentStageId] ?? STAGE_QUESTS[5];
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [xpWidth, setXpWidth] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [questsDone, setQuestsDone] = useState<Set<number>>(new Set([1]));
  const [hearts, setHearts] = useState(4);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setQuestsDone(new Set([1]));
    setShowBanner(true);
    setXpWidth(0);
    const t = setTimeout(
      () => setXpWidth(Math.round((currentStageId / DASHBOARD_STAGES.length) * 100 - 4)),
      400,
    );
    return () => clearTimeout(t);
  }, [currentStageId]);

  function goToStage(n: number) {
    router.push(`/dashboard2?stage=${n}`);
  }

  const streak = 18;
  const leagueIdx = Math.min(Math.floor(currentStageId / 2), LEAGUE_LABEL.length - 1);
  const totalXpEarned = quests.reduce(
    (s, q) => s + (questsDone.has(q.id) ? q.xp : 0),
    0,
  );
  const dailyGoal = 100;

  // Prevent flash while localStorage loads
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

  // Gate — shown when no user in localStorage
  if (!user) {
    return (
      <>
        <Header />
        <DashboardGate onLogin={setUser} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* ── Celebration banner ── */}
      {showBanner && currentStageId > 1 && (
        <div className="bg-accent-400 px-4 py-2 text-white">
          <div className="container-narrow flex items-center justify-between gap-3">
            <p className="text-sm font-bold">
              🎊 Stage {currentStageId} unlocked!
              {ACHIEVEMENTS.find((a) => a.unlockedAt === currentStageId) &&
                ` · "${ACHIEVEMENTS.find((a) => a.unlockedAt === currentStageId)?.label}" badge earned`}
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="shrink-0 text-white/70 hover:text-white"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="container-narrow py-4 sm:py-6">

        {/* ── Top stats — 2×2 on mobile, 4-col on sm+ ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-bone-50 px-3 py-2.5">
            <span className="text-lg" aria-hidden>🔥</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/45">Streak</p>
              <p className="text-sm font-bold text-ink">{streak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-bone-50 px-3 py-2.5">
            <div className="flex gap-px">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < hearts ? "text-sm" : "text-sm opacity-20"} aria-hidden>❤️</span>
              ))}
            </div>
            <div className="ml-1 flex gap-px">
              <button onClick={() => setHearts((h) => Math.max(0, h - 1))} className="text-[10px] text-ink/30 hover:text-ink/60" title="Lose heart">−</button>
              <button onClick={() => setHearts((h) => Math.min(5, h + 1))} className="text-[10px] text-ink/30 hover:text-ink/60" title="Add heart">+</button>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-bone-50 px-3 py-2.5">
            <span className="text-lg" aria-hidden>⚡</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/45">XP today</p>
              <p className="text-sm font-bold text-ink">
                {totalXpEarned}
                <span className="text-xs font-normal text-ink/45">/{dailyGoal}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-bone-50 px-3 py-2.5">
            <span className="text-lg" aria-hidden>🏅</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/45">League</p>
              <p className="text-sm font-bold text-ink">{LEAGUE_LABEL[leagueIdx]}</p>
            </div>
          </div>
        </div>

        {/* ── XP daily progress bar ── */}
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, (totalXpEarned / dailyGoal) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-medium text-ink/45">
            {totalXpEarned >= dailyGoal ? "🎉 Goal hit!" : `${dailyGoal - totalXpEarned} XP to go`}
          </span>
        </div>

        {/* ── Player title + stage nav ── */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink/40">
              Lv {currentStageId} · {LEAGUE_LABEL[leagueIdx]} League
            </p>
            <h1 className="mt-0.5 font-serif text-2xl leading-tight text-ink sm:text-3xl">
              {firstName}&apos;s Journey
            </h1>
            <p className="truncate text-sm text-ink/55">{currentStage.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {currentStageId > 1 && (
              <button onClick={() => goToStage(currentStageId - 1)} className="btn-ghost text-sm">
                ← Prev
              </button>
            )}
            {currentStageId < DASHBOARD_STAGES.length ? (
              <button onClick={() => goToStage(currentStageId + 1)} className="btn-solid text-sm">
                Next →
              </button>
            ) : (
              <span className="text-sm font-bold text-accent-400">🏠 Done!</span>
            )}
          </div>
        </div>

        {/* ── Financial panel ── */}
        <div className="mt-4">
          <FinancialPanel currentStageId={currentStageId} />
        </div>

        {/* ── Documents panel ── */}
        <div className="mt-3">
          <DocumentsPanel currentStageId={currentStageId} />
        </div>

        {/* ── 10-stage progress bar with detail cards ── */}
        <div className="mt-3">
          <StageProgressBar currentStageId={currentStageId} basePath="/dashboard2" />
        </div>

        {/* ── Quests + Achievements ── */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">

          {/* Active quests */}
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <span aria-hidden>⚔️</span> Active Quests
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] text-accent-500">
                  Stage {currentStageId}
                </span>
              </p>
              <span className="text-xs text-ink/40">
                {questsDone.size}/{quests.length}
              </span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {quests.map((q) => {
                const done = questsDone.has(q.id);
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setQuestsDone((prev) => {
                          const next = new Set(prev);
                          next.has(q.id) ? next.delete(q.id) : next.add(q.id);
                          return next;
                        })
                      }
                      className="flex w-full items-start gap-2.5 text-left"
                    >
                      <span
                        className={[
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                          done ? "border-accent-400 bg-accent-400 text-white" : "border-ink/25",
                        ].join(" ")}
                        aria-hidden
                      >
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        className={[
                          "flex-1 text-sm leading-snug",
                          done ? "text-ink/40 line-through" : "text-ink",
                        ].join(" ")}
                      >
                        {q.label}
                      </span>
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          done
                            ? "bg-accent-50 text-accent-500"
                            : "bg-ink/5 text-ink/50",
                        ].join(" ")}
                      >
                        +{q.xp} XP
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {questsDone.size === quests.length && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-accent-500">
                <span aria-hidden>🌟</span>
                <span className="text-sm font-medium">All quests done!</span>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 border-t border-ink/10 pt-4">
              {currentStageId < DASHBOARD_STAGES.length && (
                <button
                  onClick={() => {
                    setShowBanner(true);
                    goToStage(currentStageId + 1);
                  }}
                  className="btn-solid flex w-full items-center justify-center gap-2 text-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mark Stage {currentStageId} Complete
                </button>
              )}
              {currentStageId === DASHBOARD_STAGES.length && (
                <div className="rounded-xl bg-accent-50 px-4 py-3 text-center text-sm font-medium text-accent-500">
                  🏠 Journey complete — you did it!
                </div>
              )}
            </div>
          </div>

          {/* Your conversations */}
          <ConversationsCard />

          {/* Achievements */}
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-4 sm:p-5">
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <span aria-hidden>🏆</span> Achievements
              <span className="text-xs font-normal text-ink/45">
                {ACHIEVEMENTS.filter((a) => a.unlockedAt <= currentStageId).length}/
                {ACHIEVEMENTS.length}
              </span>
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = a.unlockedAt <= currentStageId;
                const isNew = a.unlockedAt === currentStageId;
                return (
                  <div
                    key={a.id}
                    title={unlocked ? `${a.label}: ${a.desc}` : "Locked"}
                    className={[
                      "relative flex flex-col items-center gap-1 rounded-xl p-2 text-center",
                      !unlocked && "opacity-30 grayscale",
                    ].join(" ")}
                  >
                    {isNew && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-accent-400 px-1 text-[8px] font-bold text-bone">
                        NEW
                      </span>
                    )}
                    <span className="text-xl" aria-hidden>{a.icon}</span>
                    <span className="text-[9px] leading-tight text-ink/60">{a.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 border-t border-ink/10 pt-3 text-[10px] text-ink/40">
              Click a stage on the journey tracker above to see that stage&apos;s badges unlock.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MINI GAME — Home Buyer Quiz
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-ink/10" />
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">
              Mini Game
            </p>
            <div className="flex-1 border-t border-ink/10" />
          </div>

          {!showQuiz ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-bone-50">
              <div className="bg-ink px-6 py-8 text-center text-white">
                <span className="text-5xl" aria-hidden>🏡</span>
                <h2 className="mt-3 font-serif text-3xl">Home Buyer Quiz</h2>
                <p className="mt-2 text-base opacity-85">
                  5 quick questions. Earn XP. Sharpen your knowledge.
                </p>
              </div>
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-ink/60">
                  <span>⚡ Up to 190 XP</span>
                  <span>⏱ ~3 minutes</span>
                  <span>❓ 5 questions</span>
                </div>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="mt-6 rounded-2xl bg-ink px-10 py-3 font-bold text-white transition-all hover:translate-y-[1px] hover:bg-ink/80 active:translate-y-[2px]"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ) : (
            <QuizGame onDone={() => setShowQuiz(false)} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Quiz game component ──────────────────────────────────────────────────────

function QuizGame({ onDone }: { onDone: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [finished, setFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = QUIZ[qIdx];

  useEffect(() => {
    if (locked || finished) return;
    if (timeLeft === 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, locked, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (idx: number) => {
      if (locked) return;
      setSelected(idx);
      setLocked(true);
      setShowExplanation(true);
      if (idx === q.correct) {
        setCorrect((c) => c + 1);
        setTotalXp((x) => x + q.xp);
      }
    },
    [locked, q],
  );

  function next() {
    if (qIdx + 1 >= QUIZ.length) {
      setFinished(true);
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setLocked(false);
      setShowExplanation(false);
      setTimeLeft(15);
    }
  }

  if (finished) {
    const pct = Math.round((correct / QUIZ.length) * 100);
    return (
      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-bone-50">
        <div
          className={[
            "px-6 py-8 text-center text-white",
            pct >= 80 ? "bg-accent-400" : pct >= 60 ? "bg-ink/70" : "bg-ink/50",
          ].join(" ")}
        >
          <span className="text-5xl" aria-hidden>
            {pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "📚"}
          </span>
          <h2 className="mt-3 font-serif text-3xl">
            {pct >= 80 ? "Outstanding!" : pct >= 60 ? "Good effort!" : "Keep learning!"}
          </h2>
          <p className="mt-2 text-lg opacity-90">
            {correct}/{QUIZ.length} correct · +{totalXp} XP earned
          </p>
        </div>
        <div className="p-6">
          <div className="mb-6 grid grid-cols-5 gap-2">
            {QUIZ.map((_, i) => (
              <div
                key={i}
                className={["h-2 rounded-full", i < correct ? "bg-accent-400" : "bg-ink/10"].join(" ")}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setQIdx(0);
                setSelected(null);
                setLocked(false);
                setShowExplanation(false);
                setTimeLeft(15);
                setFinished(false);
                setCorrect(0);
                setTotalXp(0);
              }}
              className="flex-1 rounded-2xl border-2 border-ink/15 py-3 font-bold text-ink transition-colors hover:border-ink/40"
            >
              Try again
            </button>
            <button
              onClick={onDone}
              className="flex-1 rounded-2xl bg-ink py-3 font-bold text-white transition-all hover:translate-y-[1px] hover:bg-ink/80"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timerPct = (timeLeft / 15) * 100;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-bone-50">
      {/* Progress + timer */}
      <div className="border-b border-ink/10 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-ink transition-all duration-300"
                style={{ width: `${(qIdx / QUIZ.length) * 100}%` }}
              />
            </div>
          </div>
          <span
            className={[
              "flex items-center gap-1.5 text-sm font-bold",
              timeLeft <= 5 ? "text-accent-500" : "text-ink",
            ].join(" ")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {timeLeft}s
          </span>
          <span className="text-sm text-ink/50">{qIdx + 1}/{QUIZ.length}</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className={[
              "h-full rounded-full transition-all duration-1000",
              timeLeft <= 5 ? "bg-accent-400" : "bg-ink",
            ].join(" ")}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-6 pb-2 pt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-500">
          Question {qIdx + 1}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink sm:text-2xl">
          {q.q}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 px-6 pb-4 pt-4">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = selected === i;
          let style =
            "border-2 border-ink/15 bg-bone text-ink hover:border-ink/40 hover:bg-ink/5";
          if (locked) {
            if (isCorrect) style = "border-2 border-accent-400 bg-accent-50 text-ink font-medium";
            else if (isSelected && !isCorrect)
              style = "border-2 border-ink/40 bg-ink/5 text-ink/50";
            else style = "border-2 border-ink/10 bg-bone text-ink/40";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={locked}
              className={[
                "w-full rounded-2xl px-5 py-3.5 text-left text-[15px] leading-snug transition-all",
                style,
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                    locked && isCorrect
                      ? "border-accent-400 bg-accent-400 text-white"
                      : locked && isSelected
                        ? "border-ink/40 bg-ink/20 text-white"
                        : "border-current text-ink/50",
                  ].join(" ")}
                >
                  {["A", "B", "C", "D"][i]}
                </span>
                {opt}
                {locked && isCorrect && (
                  <span className="ml-auto text-lg" aria-hidden>✅</span>
                )}
                {locked && isSelected && !isCorrect && (
                  <span className="ml-auto text-lg" aria-hidden>❌</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation + next */}
      {showExplanation && (
        <div
          className={[
            "mx-6 mb-6 rounded-2xl p-4",
            selected === q.correct ? "bg-accent-50" : "bg-ink/5",
          ].join(" ")}
        >
          <p
            className={[
              "font-bold",
              selected === q.correct ? "text-accent-500" : "text-ink/60",
            ].join(" ")}
          >
            {selected === q.correct ? `Correct! +${q.xp} XP` : "Not quite!"}
          </p>
          <p className="mt-1 text-sm text-ink/75">{q.explanation}</p>
          <button
            onClick={next}
            className={[
              "mt-4 w-full rounded-2xl py-3 font-bold text-white transition-all hover:translate-y-[1px]",
              selected === q.correct ? "bg-accent-400 hover:bg-accent-500" : "bg-ink hover:bg-ink/80",
            ].join(" ")}
          >
            {qIdx + 1 >= QUIZ.length ? "See results →" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}
