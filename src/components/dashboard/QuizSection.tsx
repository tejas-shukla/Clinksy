"use client";

import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type QuizActivity = "myths" | "jargon" | "stamp-duty" | null;

interface TFQuestion {
  statement: string;
  answer: boolean;
  explanation: string;
}

interface MCQQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

// ─── Quiz Data ─────────────────────────────────────────────────────────────────

const MYTHS: TFQuestion[] = [
  {
    statement: "You need a 20% deposit to get a mortgage in the UK.",
    answer: false,
    explanation:
      "Many lenders accept 5–10% deposits. 95% LTV mortgages are widely available for first-time buyers, including through government-backed schemes.",
  },
  {
    statement: "A Mortgage in Principle guarantees you'll get a mortgage.",
    answer: false,
    explanation:
      "An AIP is just an indication — not a guarantee. The lender will run full checks on your application and can still decline.",
  },
  {
    statement: "You should use your own solicitor, not the seller's.",
    answer: true,
    explanation:
      "Always instruct your own independent solicitor. The seller's solicitor acts for the seller, not for you.",
  },
  {
    statement: "You can renegotiate the price after a survey reveals problems.",
    answer: true,
    explanation:
      "Absolutely. If a survey uncovers issues, it's common — and expected — to ask for a price reduction or request repairs before exchange.",
  },
  {
    statement: "The cheapest survey is usually the best value.",
    answer: false,
    explanation:
      "A thorough Level 3 Building Survey costs more upfront but can reveal hidden defects that save thousands in surprises post-completion.",
  },
];

const JARGON: MCQQuestion[] = [
  {
    q: "What does 'LTV' stand for in mortgage terms?",
    options: [
      "Loan To Value",
      "Long Term Variable",
      "Leasehold Transfer Value",
      "Licensed Trading Valuation",
    ],
    correct: 0,
    explanation:
      "LTV = Loan to Value. It's the ratio of your mortgage amount to the property's value. Lower LTV = better rates.",
  },
  {
    q: "What is an 'Agreement in Principle' (AIP)?",
    options: [
      "A legally binding mortgage contract",
      "An indication from a lender of how much they might lend you",
      "The final mortgage offer document",
      "A solicitor's search report",
    ],
    correct: 1,
    explanation:
      "An AIP (also called MIP or DIP) is a soft-check indication from a lender. It shows sellers you're serious but is not a guarantee.",
  },
  {
    q: "What does 'conveyancing' refer to?",
    options: [
      "Moving your belongings to a new property",
      "A type of home insurance policy",
      "The legal process of transferring property ownership",
      "A mortgage affordability calculation",
    ],
    correct: 2,
    explanation:
      "Conveyancing is the legal work involved in buying and selling property. Your solicitor or licensed conveyancer handles it.",
  },
  {
    q: "What is 'gazumping'?",
    options: [
      "When a buyer suddenly pulls out of a purchase",
      "When a seller accepts a higher offer after already accepting yours",
      "A type of structural survey",
      "When a mortgage application is declined",
    ],
    correct: 1,
    explanation:
      "Gazumping is when a seller accepts a better offer from someone else after agreeing to sell to you. It's legal in England and Wales — one reason to move quickly after an offer is accepted.",
  },
  {
    q: "Buying 'freehold' means…",
    options: [
      "You own the property for a fixed lease period",
      "You share ownership with other flat residents",
      "You own the property and the land it stands on outright",
      "You rent the property from a housing association",
    ],
    correct: 2,
    explanation:
      "Freehold = you own everything, including the land. The alternative is leasehold, where you own the property but not the land it stands on.",
  },
];

// ─── Stamp Duty Calculation ─────────────────────────────────────────────────────

function calcFTBDuty(p: number): number {
  // UK SDLT rates for first-time buyers, effective from April 2025
  // 0% up to £300,000 (FTB relief)
  // 5% on £300,001 to £500,000
  // Above £500,000: no FTB relief — standard rates apply
  if (p <= 300000) return 0;
  if (p <= 500000) return (p - 300000) * 0.05;
  // Standard rates above £500k:
  let duty = 0;
  if (p > 125000) duty += (Math.min(p, 250000) - 125000) * 0.02;
  if (p > 250000) duty += (Math.min(p, 925000) - 250000) * 0.05;
  if (p > 925000) duty += (Math.min(p, 1500000) - 925000) * 0.10;
  if (p > 1500000) duty += (p - 1500000) * 0.12;
  return duty;
}

function fmtGBP(n: number) {
  return "£" + Math.round(n).toLocaleString("en-GB");
}

// ─── Main QuizSection ─────────────────────────────────────────────────────────

export function QuizSection() {
  const [active, setActive] = useState<QuizActivity>(null);
  const [mythsDone, setMythsDone] = useState<Record<number, boolean>>({});
  const [jargonDone, setJargonDone] = useState<Record<number, boolean>>({});

  const mythsComplete = Object.keys(mythsDone).length === MYTHS.length;
  const jargonComplete = Object.keys(jargonDone).length === JARGON.length;

  if (active === "myths") {
    return (
      <TFQuiz
        title="Home Buying Myths"
        questions={MYTHS}
        onDone={(scores) => { setMythsDone(scores); setActive(null); }}
        onClose={() => setActive(null)}
      />
    );
  }

  if (active === "jargon") {
    return (
      <MCQQuiz
        title="Mortgage Jargon Buster"
        questions={JARGON}
        onDone={(scores) => { setJargonDone(scores); setActive(null); }}
        onClose={() => setActive(null)}
      />
    );
  }

  if (active === "stamp-duty") {
    return <StampDutyCalc onClose={() => setActive(null)} />;
  }

  return (
    <div className="mt-5 space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
        Games &amp; quizzes
      </p>

      <ActivityCard
        emoji="🏠"
        title="Home Buying Myths"
        desc="True or false? Test what you think you know about buying."
        duration="2 min"
        complete={mythsComplete}
        score={mythsComplete
          ? `${Object.values(mythsDone).filter(Boolean).length}/${MYTHS.length}`
          : undefined}
        onClick={() => setActive("myths")}
      />

      <ActivityCard
        emoji="📚"
        title="Mortgage Jargon Buster"
        desc="LTV, AIP, conveyancing… do you know what they mean?"
        duration="3 min"
        complete={jargonComplete}
        score={jargonComplete
          ? `${Object.values(jargonDone).filter(Boolean).length}/${JARGON.length}`
          : undefined}
        onClick={() => setActive("jargon")}
      />

      <ActivityCard
        emoji="💷"
        title="Stamp Duty Calculator"
        desc="See exactly how much stamp duty you'd pay as a first-time buyer."
        duration="Interactive"
        complete={false}
        onClick={() => setActive("stamp-duty")}
      />
    </div>
  );
}

// ─── Activity Card ─────────────────────────────────────────────────────────────

function ActivityCard({
  emoji,
  title,
  desc,
  duration,
  complete,
  score,
  onClick,
}: {
  emoji: string;
  title: string;
  desc: string;
  duration: string;
  complete: boolean;
  score?: string;
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
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-ink">{title}</p>
          {complete && score && (
            <span className="rounded-full bg-accent-400/15 px-2 py-0.5 text-[10px] font-bold text-accent-500">
              {score} ✓
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-ink/50 leading-snug">{desc}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] text-ink/35">{duration}</p>
        <p className="mt-0.5 text-sm text-ink/30">→</p>
      </div>
    </button>
  );
}

// ─── True / False Quiz ─────────────────────────────────────────────────────────

function TFQuiz({
  title,
  questions,
  onDone,
  onClose,
}: {
  title: string;
  questions: TFQuestion[];
  onDone: (scores: Record<number, boolean>) => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  function answer(value: boolean) {
    if (current in answered) return;
    const correct = value === questions[current].answer;
    setAnswered((prev) => ({ ...prev, [current]: value }));
    setScores((prev) => ({ ...prev, [current]: correct }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  }

  const q = questions[current];
  const hasAnswered = current in answered;
  const wasCorrect = hasAnswered && scores[current];
  const totalCorrect = Object.values(scores).filter(Boolean).length;

  if (finished) {
    return (
      <ScoreScreen
        title={title}
        correct={totalCorrect}
        total={questions.length}
        onRetry={() => {
          setCurrent(0);
          setAnswered({});
          setScores({});
          setFinished(false);
        }}
        onDone={() => onDone(scores)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          {title} · {current + 1}/{questions.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-ink/35 hover:text-ink transition-colors"
          aria-label="Close quiz"
        >
          ✕
        </button>
      </div>

      <p className="font-serif text-xl leading-snug text-ink">{q.statement}</p>

      <div className="flex gap-3">
        {[true, false].map((val) => {
          const isChosen = hasAnswered && answered[current] === val;
          const isRight = val === q.answer;
          let cls =
            "flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ";
          if (!hasAnswered) {
            cls += "border-ink/15 text-ink hover:border-ink/35 hover:bg-ink/5";
          } else if (isChosen && wasCorrect) {
            cls += "border-emerald-400 bg-emerald-50 text-emerald-700";
          } else if (isChosen && !wasCorrect) {
            cls += "border-red-300 bg-red-50 text-red-700";
          } else if (!isChosen && isRight) {
            cls += "border-emerald-200 bg-emerald-50/50 text-emerald-600";
          } else {
            cls += "border-ink/8 text-ink/35";
          }
          return (
            <button
              key={String(val)}
              type="button"
              onClick={() => answer(val)}
              disabled={hasAnswered}
              className={cls}
            >
              {val ? "True" : "False"}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            wasCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{wasCorrect ? "✓ Correct!" : "✗ Not quite."}</p>
          <p className="mt-1 text-[13px] opacity-85">{q.explanation}</p>
        </div>
      )}

      {hasAnswered && (
        <button
          type="button"
          onClick={next}
          className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
        >
          {current < questions.length - 1 ? "Next question →" : "See my score →"}
        </button>
      )}
    </div>
  );
}

// ─── MCQ Quiz ──────────────────────────────────────────────────────────────────

function MCQQuiz({
  title,
  questions,
  onDone,
  onClose,
}: {
  title: string;
  questions: MCQQuestion[];
  onDone: (scores: Record<number, boolean>) => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  function pick(optionIdx: number) {
    if (current in selected) return;
    const correct = optionIdx === questions[current].correct;
    setSelected((prev) => ({ ...prev, [current]: optionIdx }));
    setScores((prev) => ({ ...prev, [current]: correct }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  }

  const q = questions[current];
  const hasPicked = current in selected;
  const totalCorrect = Object.values(scores).filter(Boolean).length;

  if (finished) {
    return (
      <ScoreScreen
        title={title}
        correct={totalCorrect}
        total={questions.length}
        onRetry={() => {
          setCurrent(0);
          setSelected({});
          setScores({});
          setFinished(false);
        }}
        onDone={() => onDone(scores)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          {title} · {current + 1}/{questions.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-ink/35 hover:text-ink transition-colors"
          aria-label="Close quiz"
        >
          ✕
        </button>
      </div>

      <p className="font-serif text-xl leading-snug text-ink">{q.q}</p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = hasPicked && selected[current] === i;
          const isCorrect = i === q.correct;
          let cls =
            "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ";
          if (!hasPicked) {
            cls += "border-ink/15 text-ink hover:border-ink/35 hover:bg-ink/5";
          } else if (isCorrect) {
            cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
          } else if (isSelected && !isCorrect) {
            cls += "border-red-300 bg-red-50 text-red-700";
          } else {
            cls += "border-ink/8 text-ink/35";
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={hasPicked}
              className={cls}
            >
              <span className="mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {hasPicked && (
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            scores[current] ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{scores[current] ? "✓ Correct!" : "✗ Not quite."}</p>
          <p className="mt-1 text-[13px] opacity-85">{q.explanation}</p>
        </div>
      )}

      {hasPicked && (
        <button
          type="button"
          onClick={next}
          className="w-full rounded-xl bg-ink py-3 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
        >
          {current < questions.length - 1 ? "Next question →" : "See my score →"}
        </button>
      )}
    </div>
  );
}

// ─── Score Screen ──────────────────────────────────────────────────────────────

function ScoreScreen({
  title,
  correct,
  total,
  onRetry,
  onDone,
}: {
  title: string;
  correct: number;
  total: number;
  onRetry: () => void;
  onDone: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  const { emoji, msg } =
    pct >= 80
      ? { emoji: "🏆", msg: "Excellent! You really know your stuff." }
      : pct >= 60
      ? { emoji: "👍", msg: "Good effort! A bit more reading and you'll nail it." }
      : { emoji: "📖", msg: "Keep learning — check out Clinkeys's guides to brush up." };

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-6 text-center space-y-4">
      <span className="text-5xl" role="img" aria-label="score">{emoji}</span>
      <div>
        <p className="font-serif text-4xl text-ink">
          {correct}
          <span className="text-ink/30 text-2xl">/{total}</span>
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45 mt-1">
          {pct}% score · {title}
        </p>
      </div>
      <p className="text-sm text-ink/65 leading-relaxed">{msg}</p>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-xl border border-ink/15 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-bone hover:bg-ink/90 transition-colors"
        >
          Done →
        </button>
      </div>
    </div>
  );
}

// ─── Stamp Duty Calculator ─────────────────────────────────────────────────────

function StampDutyCalc({ onClose }: { onClose: () => void }) {
  const [price, setPrice] = useState(350000);

  const duty = calcFTBDuty(price);
  const effectiveRate = price > 0 ? (duty / price) * 100 : 0;

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Stamp Duty · First-Time Buyer
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-ink/35 hover:text-ink transition-colors"
          aria-label="Close calculator"
        >
          ✕
        </button>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-ink/55">Property price</span>
          <span className="font-serif text-2xl text-ink">{fmtGBP(price)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={1000000}
          step={5000}
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-ink/30 mt-1">
          <span>£50k</span>
          <span>£500k</span>
          <span>£1m</span>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl bg-ink px-5 py-4 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-bone/50">
          Stamp duty payable
        </p>
        <p className="font-serif text-4xl text-bone mt-1">{fmtGBP(duty)}</p>
        <p className="text-sm text-bone/50 mt-1">
          Effective rate: {effectiveRate.toFixed(1)}%
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          How it&apos;s calculated
        </p>

        {price <= 300000 && (
          <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm">
            <span className="text-emerald-700">Up to £300,000 (0% — first-time buyer relief)</span>
            <span className="font-medium text-emerald-700">£0</span>
          </div>
        )}

        {price > 300000 && price <= 500000 && (
          <>
            <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm">
              <span className="text-emerald-700">First £300,000 (0% — FTB relief)</span>
              <span className="font-medium text-emerald-700">£0</span>
            </div>
            <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
              <span className="text-amber-700">£300k – {fmtGBP(price)} (5%)</span>
              <span className="font-medium text-amber-700">
                {fmtGBP((price - 300000) * 0.05)}
              </span>
            </div>
          </>
        )}

        {price > 500000 && (
          <>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
              ⚠ Over £500k — no first-time buyer relief. Standard rates apply.
            </p>
            {price > 125000 && (
              <div className="flex justify-between rounded-lg bg-ink/4 px-3 py-2 text-sm">
                <span className="text-ink/65">£125k – {fmtGBP(Math.min(price, 250000))} (2%)</span>
                <span className="font-medium text-ink">
                  {fmtGBP((Math.min(price, 250000) - 125000) * 0.02)}
                </span>
              </div>
            )}
            {price > 250000 && (
              <div className="flex justify-between rounded-lg bg-ink/4 px-3 py-2 text-sm">
                <span className="text-ink/65">£250k – {fmtGBP(Math.min(price, 925000))} (5%)</span>
                <span className="font-medium text-ink">
                  {fmtGBP((Math.min(price, 925000) - 250000) * 0.05)}
                </span>
              </div>
            )}
            {price > 925000 && (
              <div className="flex justify-between rounded-lg bg-ink/4 px-3 py-2 text-sm">
                <span className="text-ink/65">£925k – {fmtGBP(Math.min(price, 1500000))} (10%)</span>
                <span className="font-medium text-ink">
                  {fmtGBP((Math.min(price, 1500000) - 925000) * 0.10)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-[10px] text-ink/35 leading-relaxed">
        Indicative only. Rates for first-time buyers in England &amp; Northern Ireland from April 2025.
        Verify at gov.uk/stamp-duty-land-tax before relying on this figure.
      </p>
    </div>
  );
}
