"use client";

import { useState, useEffect } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type GameId = "unscramble" | "sort-steps" | "memory" | null;

// ─── Word Unscramble Data ──────────────────────────────────────────────────────

interface WordItem {
  word: string;
  hint: string;
}

const WORDS: WordItem[] = [
  { word: "MORTGAGE",    hint: "A loan secured against a property" },
  { word: "FREEHOLD",    hint: "You own the property and the land outright" },
  { word: "SOLICITOR",   hint: "The legal professional handling conveyancing" },
  { word: "EXCHANGE",    hint: "The point where contracts become legally binding" },
  { word: "DEPOSIT",     hint: "The upfront sum paid towards the property price" },
  { word: "GAZUMPING",   hint: "Seller takes a higher offer after agreeing to sell to you" },
  { word: "SURVEY",      hint: "An independent inspection of the property's condition" },
  { word: "LEASEHOLD",   hint: "You own the property but not the land it sits on" },
  { word: "VALUATION",   hint: "A lender's assessment of the property's worth" },
  { word: "COMPLETION",  hint: "The final day — you legally own the property" },
];

const WORD_TIME = 30; // seconds per word

function scrambleWord(word: string): string {
  const arr = word.split("");
  let shuffled: string;
  let attempts = 0;
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    shuffled = arr.join("");
    attempts++;
  } while (shuffled === word && attempts < 20);
  return shuffled;
}

// ─── Sort the Steps Data ───────────────────────────────────────────────────────

interface Step {
  id: number;
  text: string;
  emoji: string;
}

const CORRECT_STEPS: Step[] = [
  { id: 1, text: "Work out your budget and affordability",    emoji: "💰" },
  { id: 2, text: "Get a Mortgage in Principle (AIP)",         emoji: "📋" },
  { id: 3, text: "Find a property and get an offer accepted", emoji: "🏠" },
  { id: 4, text: "Appoint a solicitor and start conveyancing", emoji: "⚖️" },
  { id: 5, text: "Get a property survey done",                emoji: "🔎" },
  { id: 6, text: "Exchange contracts and pay the deposit",    emoji: "📝" },
  { id: 7, text: "Complete and collect the keys!",            emoji: "🔑" },
];

const SORT_TIME = 90; // seconds total

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Memory Match Data ─────────────────────────────────────────────────────────

interface MemCard {
  id: number;
  pairId: number;
  content: string;
  type: "term" | "def";
}

const MEM_PAIRS: { term: string; def: string }[] = [
  { term: "LTV",          def: "Loan to Value ratio" },
  { term: "AIP",          def: "Agreement in Principle" },
  { term: "Chain",        def: "Series of linked property sales" },
  { term: "SDLT",         def: "Stamp Duty Land Tax" },
  { term: "Freehold",     def: "Own property and land outright" },
  { term: "Conveyancing", def: "Legal transfer of ownership" },
];

function makeMemCards(): MemCard[] {
  const cards: MemCard[] = [];
  MEM_PAIRS.forEach((pair, pairId) => {
    cards.push({ id: pairId * 2,     pairId, content: pair.term, type: "term" });
    cards.push({ id: pairId * 2 + 1, pairId, content: pair.def,  type: "def"  });
  });
  return shuffleArray(cards);
}

// ─── Main GamesSection ─────────────────────────────────────────────────────────

export function GamesSection() {
  const [active, setActive] = useState<GameId>(null);

  if (active === "unscramble") return <WordUnscramble onClose={() => setActive(null)} />;
  if (active === "sort-steps") return <SortSteps      onClose={() => setActive(null)} />;
  if (active === "memory")     return <MemoryMatch    onClose={() => setActive(null)} />;

  return (
    <div className="mt-5 space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
        Mini games
      </p>

      <GameCard
        emoji="🔤"
        title="Word Unscramble"
        desc="Unscramble 10 property vocabulary words. 30 seconds per word!"
        badge="10 words · 30s"
        onClick={() => setActive("unscramble")}
      />
      <GameCard
        emoji="🧩"
        title="Sort the Steps"
        desc="Put the 7 stages of buying a home in the correct order. Beat the clock!"
        badge="7 steps · 90s"
        onClick={() => setActive("sort-steps")}
      />
      <GameCard
        emoji="🃏"
        title="Memory Match"
        desc="Flip cards to match property terms with their definitions. How fast can you go?"
        badge="6 pairs · stopwatch"
        onClick={() => setActive("memory")}
      />
    </div>
  );
}

function GameCard({
  emoji, title, desc, badge, onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-ink/10 bg-bone-50 p-5 text-left hover:border-ink/25 transition-colors"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink/6 text-2xl">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink/50 leading-snug">{desc}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="rounded-full border border-ink/10 px-2 py-1 text-[11px] text-ink/40">
          {badge}
        </span>
        <p className="mt-1.5 text-sm text-ink/30">→</p>
      </div>
    </button>
  );
}

// ─── Game: Word Unscramble ─────────────────────────────────────────────────────

function WordUnscramble({ onClose }: { onClose: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState(() => scrambleWord(WORDS[0].word));
  const [input, setInput]         = useState("");
  const [result, setResult]       = useState<"idle" | "correct" | "wrong" | "timeout">("idle");
  const [score, setScore]         = useState(0);
  const [showHint, setShowHint]   = useState(false);
  const [finished, setFinished]   = useState(false);
  const [timeLeft, setTimeLeft]   = useState(WORD_TIME);

  const current = WORDS[wordIndex];
  const total   = WORDS.length;

  // Reset timer each new word
  useEffect(() => {
    setTimeLeft(WORD_TIME);
  }, [wordIndex]);

  // Countdown — paused while correct/timeout (auto-advance in progress)
  useEffect(() => {
    if (finished || result === "correct" || result === "timeout") return;
    if (timeLeft <= 0) {
      setResult("timeout");
      const t = setTimeout(() => advance(), 1400);
      return () => clearTimeout(t);
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result, finished]);

  function advance() {
    setWordIndex((wi) => {
      const next = wi + 1;
      if (next >= total) {
        setFinished(true);
        return wi;
      }
      setScrambled(scrambleWord(WORDS[next].word));
      setInput("");
      setResult("idle");
      setShowHint(false);
      return next;
    });
  }

  function checkAnswer() {
    if (result !== "idle" && result !== "wrong") return;
    if (input.trim().toUpperCase() === current.word) {
      setResult("correct");
      setScore((s) => s + 1);
      setTimeout(() => advance(), 900);
    } else {
      setResult("wrong");
    }
  }

  function skip() {
    setResult("idle");
    advance();
  }

  const pct      = Math.round((wordIndex / total) * 100);
  const timerRed = timeLeft <= 8 && result === "idle";

  if (finished) {
    const emoji = score >= 8 ? "🏆" : score >= 5 ? "👍" : "📖";
    const msg   = score >= 8
      ? "You're a property vocabulary pro!"
      : score >= 5
      ? "Solid effort — keep brushing up!"
      : "Plenty to learn — your guides can help.";
    return (
      <div className="rounded-2xl border border-ink/10 bg-bone-50 p-6 text-center space-y-4">
        <span className="text-5xl">{emoji}</span>
        <div>
          <p className="font-serif text-4xl text-ink">
            {score}<span className="text-2xl text-ink/30">/{total}</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45 mt-1">
            Word Unscramble
          </p>
        </div>
        <p className="text-sm text-ink/60 leading-relaxed">{msg}</p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWordIndex(0);
              setScrambled(scrambleWord(WORDS[0].word));
              setInput("");
              setResult("idle");
              setShowHint(false);
              setScore(0);
              setFinished(false);
              setTimeLeft(WORD_TIME);
            }}
            className="flex-1 rounded-xl border border-ink/15 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
          >
            Done →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Word Unscramble · {wordIndex + 1}/{total}
        </p>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <span className={`tabular-nums text-sm font-semibold transition-colors
            ${timerRed ? "text-red-500 animate-pulse" : "text-ink/45"}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
          <button type="button" onClick={onClose} className="text-sm text-ink/35 hover:text-ink" aria-label="Close">✕</button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 w-full rounded-full bg-ink/8 overflow-hidden">
        <div className="h-full rounded-full bg-accent-400 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Score */}
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-ink/40">Score</span>
        <span className="font-medium text-ink">{score} correct</span>
      </div>

      {/* Scrambled word display */}
      <div className="rounded-xl bg-ink/4 px-4 py-5 text-center">
        <p className="font-mono text-3xl font-bold tracking-[0.2em] text-ink select-none">
          {scrambled}
        </p>
        <p className="mt-2 text-[11px] text-ink/35 uppercase tracking-widest">
          {current.word.length} letters
        </p>
      </div>

      {/* Hint */}
      {showHint ? (
        <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          💡 {current.hint}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="w-full rounded-xl border border-ink/10 py-2 text-[13px] text-ink/45 hover:border-ink/25 hover:text-ink/65 transition-colors"
        >
          Show hint
        </button>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); checkAnswer(); }} className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            if (result === "wrong") setResult("idle");
          }}
          placeholder="Type your answer…"
          autoComplete="off"
          autoCapitalize="characters"
          disabled={result === "correct" || result === "timeout"}
          className={`w-full rounded-xl border px-4 py-3 text-center font-mono text-lg tracking-widest outline-none transition-colors
            ${result === "correct" ? "border-emerald-400 bg-emerald-50 text-emerald-700"
            : result === "wrong"   ? "border-red-300 bg-red-50 text-red-700"
            : result === "timeout" ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-ink/15 bg-transparent text-ink focus:border-ink/40"}`}
        />

        {result === "wrong"   && <p className="text-center text-sm text-red-600">Not quite — try again or show the hint</p>}
        {result === "correct" && <p className="text-center text-sm font-medium text-emerald-600">✓ Correct!</p>}
        {result === "timeout" && (
          <p className="text-center text-sm text-amber-700">
            ⏰ Time&apos;s up! The answer was <strong>{current.word}</strong>
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!input.trim() || result === "correct" || result === "timeout"}
            className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check
          </button>
          <button
            type="button"
            onClick={skip}
            disabled={result === "correct" || result === "timeout"}
            className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink/50 hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Game: Sort the Steps ──────────────────────────────────────────────────────

function SortSteps({ onClose }: { onClose: () => void }) {
  const [displaySteps]            = useState<Step[]>(() => shuffleArray(CORRECT_STEPS));
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [revealed, setRevealed]   = useState(false);
  const [timedOut, setTimedOut]   = useState(false);
  const [timeLeft, setTimeLeft]   = useState(SORT_TIME);

  // Countdown
  useEffect(() => {
    if (revealed) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setRevealed(true);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, revealed]);

  function clickStep(stepId: number) {
    if (revealed) return;
    if (userOrder.includes(stepId)) {
      if (userOrder[userOrder.length - 1] === stepId) {
        setUserOrder((prev) => prev.slice(0, -1));
      }
      return;
    }
    setUserOrder((prev) => [...prev, stepId]);
  }

  function reveal() {
    setRevealed(true);
  }

  function reset() {
    setUserOrder([]);
    setRevealed(false);
    setTimedOut(false);
    setTimeLeft(SORT_TIME);
  }

  const allPicked    = userOrder.length === CORRECT_STEPS.length;
  const correctCount = revealed
    ? userOrder.filter((id, i) => CORRECT_STEPS[i]?.id === id).length
    : 0;
  const scoreEmoji   = correctCount >= 6 ? "🏆" : correctCount >= 4 ? "👍" : "📖";
  const timerYellow  = timeLeft <= 20 && timeLeft > 10 && !revealed;
  const timerRed     = timeLeft <= 10 && !revealed;

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Sort the Steps
        </p>
        <div className="flex items-center gap-3">
          {/* Timer */}
          {!revealed && (
            <span className={`tabular-nums text-sm font-semibold transition-colors
              ${timerRed ? "text-red-500 animate-pulse" : timerYellow ? "text-amber-500" : "text-ink/45"}`}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
          <button type="button" onClick={onClose} className="text-sm text-ink/35 hover:text-ink" aria-label="Close">✕</button>
        </div>
      </div>

      <p className="text-sm text-ink/60">
        Click each step in the correct order of the home buying journey.
        {!revealed && (
          <span className="ml-1 font-medium text-ink">{userOrder.length}/{CORRECT_STEPS.length} placed</span>
        )}
      </p>

      {/* Score reveal */}
      {revealed && (
        <div className={`rounded-xl px-4 py-3 text-center
          ${correctCount >= 6 ? "bg-emerald-50" : correctCount >= 4 ? "bg-amber-50" : "bg-red-50"}`}>
          {timedOut && (
            <p className="text-[11px] font-medium text-amber-600 mb-1 uppercase tracking-wide">⏰ Time&apos;s up!</p>
          )}
          <span className="text-3xl">{scoreEmoji}</span>
          <p className={`mt-1 font-serif text-xl ${correctCount >= 6 ? "text-emerald-700" : correctCount >= 4 ? "text-amber-700" : "text-red-700"}`}>
            {correctCount} / {CORRECT_STEPS.length} in the right spot
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {displaySteps.map((step) => {
          const pickPos   = userOrder.indexOf(step.id);
          const isPicked  = pickPos !== -1;
          const isCorrect = revealed && CORRECT_STEPS[pickPos]?.id === step.id;
          const isWrong   = revealed && isPicked && !isCorrect;
          const notPicked = revealed && !isPicked;
          const correctPos = CORRECT_STEPS.findIndex((s) => s.id === step.id) + 1;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => clickStep(step.id)}
              disabled={revealed}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors
                ${isCorrect  ? "border-emerald-400 bg-emerald-50"
                : isWrong    ? "border-red-300 bg-red-50"
                : notPicked  ? "border-ink/8 bg-ink/3 opacity-60"
                : isPicked   ? "border-ink bg-ink/6"
                : "border-ink/10 bg-transparent hover:border-ink/25 hover:bg-ink/3"}`}
            >
              {/* Sequence badge */}
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold
                ${isCorrect  ? "bg-emerald-400 text-bone"
                : isWrong    ? "bg-red-400 text-bone"
                : notPicked  ? "bg-ink/10 text-ink/25"
                : isPicked   ? "bg-ink text-bone"
                : "bg-ink/8 text-ink/35"}`}>
                {isPicked ? pickPos + 1 : "?"}
              </span>

              <span className="mr-1 text-base">{step.emoji}</span>
              <span className={`flex-1 leading-snug
                ${isCorrect ? "text-emerald-800" : isWrong ? "text-red-700" : notPicked ? "text-ink/40" : isPicked ? "text-ink" : "text-ink/70"}`}>
                {step.text}
              </span>

              {/* Correct position hint after reveal */}
              {(isWrong || notPicked) && (
                <span className={`shrink-0 text-[11px] ${isWrong ? "text-red-500" : "text-ink/30"}`}>
                  #{correctPos}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {!revealed ? (
          <button
            type="button"
            onClick={reveal}
            disabled={!allPicked}
            className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allPicked ? "Check my order →" : `Pick all ${CORRECT_STEPS.length} steps first`}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-xl border border-ink/15 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
            >
              Done →
            </button>
          </>
        )}
      </div>

      {revealed && (
        <p className="text-[11px] text-ink/35 text-center">
          Numbers show where each step should have been
        </p>
      )}
    </div>
  );
}

// ─── Game: Memory Match ────────────────────────────────────────────────────────

function MemoryMatch({ onClose }: { onClose: () => void }) {
  const [cards]    = useState<MemCard[]>(() => makeMemCards());
  const [flipped,  setFlipped]  = useState<Set<number>>(new Set());
  const [matched,  setMatched]  = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number[]>([]);
  const [checking, setChecking] = useState(false);
  const [moves,    setMoves]    = useState(0);
  const [elapsed,  setElapsed]  = useState(0);
  const [started,  setStarted]  = useState(false);

  const allMatched = matched.size === cards.length;

  // Stopwatch — starts on first flip, stops when all matched
  useEffect(() => {
    if (!started || allMatched) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [started, allMatched]);

  // Pair-matching logic
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const cardA  = cards.find((c) => c.id === a)!;
    const cardB  = cards.find((c) => c.id === b)!;

    setMoves((m) => m + 1);

    if (cardA.pairId === cardB.pairId) {
      setMatched((prev) => new Set([...prev, a, b]));
      setSelected([]);
    } else {
      setChecking(true);
      const timeout = setTimeout(() => {
        setFlipped((prev) => {
          const next = new Set(prev);
          next.delete(a);
          next.delete(b);
          return next;
        });
        setSelected([]);
        setChecking(false);
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [selected, cards]);

  function flipCard(id: number) {
    if (checking) return;
    if (matched.has(id)) return;
    if (flipped.has(id)) return;
    if (selected.length >= 2) return;

    if (!started) setStarted(true);
    setFlipped((prev) => new Set([...prev, id]));
    setSelected((prev) => [...prev, id]);
  }

  function reset() {
    setFlipped(new Set());
    setMatched(new Set());
    setSelected([]);
    setChecking(false);
    setMoves(0);
    setElapsed(0);
    setStarted(false);
  }

  const pairsFound = matched.size / 2;
  const totalPairs = MEM_PAIRS.length;
  const scoreMsg   = moves <= totalPairs + 2
    ? "Impressive memory! 🏆"
    : moves <= totalPairs * 2
    ? "Well done — quick thinking! 👍"
    : "All matched! Practice makes perfect. 📖";

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Memory Match
        </p>
        <button type="button" onClick={onClose} className="text-sm text-ink/35 hover:text-ink" aria-label="Close">✕</button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink/50">
          {pairsFound}/{totalPairs} pairs found
        </span>
        <div className="flex items-center gap-3">
          <span className="text-ink/50">
            {moves} move{moves !== 1 ? "s" : ""}
          </span>
          <span className={`tabular-nums font-semibold transition-colors
            ${allMatched ? "text-emerald-600" : started ? "text-ink/60" : "text-ink/25"}`}>
            ⏱ {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Win banner */}
      {allMatched && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
          <p className="font-serif text-lg text-emerald-700">{scoreMsg}</p>
          <p className="text-sm text-emerald-600 mt-0.5">
            Finished in {moves} move{moves !== 1 ? "s" : ""} · {formatTime(elapsed)}
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cards.map((card) => {
          const isFlipped  = flipped.has(card.id);
          const isMatched  = matched.has(card.id);
          const isSelected = selected.includes(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flipCard(card.id)}
              disabled={isFlipped || isMatched || checking}
              aria-label={isFlipped || isMatched ? card.content : "Face-down card"}
              className={`relative rounded-xl border text-center transition-all
                min-h-[4.5rem] flex items-center justify-center p-2
                ${isMatched
                  ? "border-emerald-300 bg-emerald-50 cursor-default"
                  : isFlipped
                  ? "border-ink/25 bg-bone cursor-default"
                  : "border-ink/10 bg-ink/4 hover:bg-ink/8 hover:border-ink/20 cursor-pointer"
                }
                ${isSelected && !isMatched ? "ring-2 ring-accent-400 ring-offset-1" : ""}
              `}
            >
              {isFlipped || isMatched ? (
                <span className={`text-[12px] font-medium leading-snug text-center
                  ${isMatched ? "text-emerald-700" : card.type === "term" ? "text-ink font-bold" : "text-ink/70"}`}>
                  {card.content}
                </span>
              ) : (
                <span className="text-2xl select-none" aria-hidden="true">🏠</span>
              )}
              {isMatched && (
                <span className="absolute top-1 right-1 text-[10px]">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      {!allMatched && (
        <p className="text-[12px] text-ink/40 text-center">
          {started
            ? "Flip two cards at a time — match each term with its definition"
            : "Flip a card to start the timer!"}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex-1 rounded-xl border border-ink/15 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors"
        >
          {allMatched ? "Play again" : "Restart"}
        </button>
        {allMatched && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
          >
            Done →
          </button>
        )}
      </div>
    </div>
  );
}
