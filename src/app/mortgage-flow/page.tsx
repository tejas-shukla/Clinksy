"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getApplication } from "@/lib/mortgage-application-store";
import { useUser } from "@/lib/user-store";

// ─── Advisor data ─────────────────────────────────────────────────────────────

export type Advisor = {
  id: string;
  name: string;
  location: string;
  rating: string;
  ratingCount: string;
  fee: string;
  feeNote: string;
  specialties: string[];
  availability: string;
  responseTime: string;
  about: string;
};

const ADVISORS: Advisor[] = [
  {
    id: "habito",
    name: "Habito",
    location: "Online · UK-wide",
    rating: "4.7",
    ratingCount: "11,200+",
    fee: "Free",
    feeNote: "Paid by the lender, not you",
    specialties: ["First-time buyers", "Remortgage", "Self-employed"],
    availability: "7 days a week",
    responseTime: "Same day",
    about: "Whole-of-market online broker. Simple digital process, human advisors. Free for buyers — the lender pays their fee.",
  },
  {
    id: "l-and-c",
    name: "London & Country",
    location: "Online · UK-wide",
    rating: "4.6",
    ratingCount: "9,800+",
    fee: "Free",
    feeNote: "Paid by the lender, not you",
    specialties: ["First-time buyers", "Help to Buy", "High-value mortgages"],
    availability: "Mon–Sat",
    responseTime: "Within 2 hours",
    about: "One of the UK's largest fee-free mortgage brokers. Access to deals not available on the high street.",
  },
  {
    id: "mab",
    name: "Mortgage Advice Bureau",
    location: "350+ UK branches",
    rating: "4.8",
    ratingCount: "23,000+",
    fee: "£300–£500",
    feeNote: "Fixed fee, no hidden charges",
    specialties: ["Complex income", "Contractors", "New build"],
    availability: "Mon–Sat + evenings",
    responseTime: "Same day",
    about: "Award-winning broker with local branches. Best for complex income situations, contractors, and new-build buyers.",
  },
  {
    id: "trussle",
    name: "Trussle",
    location: "Online · UK-wide",
    rating: "4.5",
    ratingCount: "6,400+",
    fee: "Free",
    feeNote: "Paid by the lender, not you",
    specialties: ["First-time buyers", "Digital-first", "Fast AIP"],
    availability: "7 days a week",
    responseTime: "Within 1 hour",
    about: "Fully digital broker. AIP in under 10 minutes. Ideal if you want speed and a fully online experience.",
  },
  {
    id: "local-broker",
    name: "Find a local broker",
    location: "Near you",
    rating: "Varies",
    ratingCount: "",
    fee: "Free–£500",
    feeNote: "Depends on broker",
    specialties: ["Local knowledge", "In-person meetings", "Complex cases"],
    availability: "Office hours",
    responseTime: "1–2 days",
    about: "A local whole-of-market broker offers in-person meetings and knows the local property market. Good for those who prefer face-to-face.",
  },
];

// ─── Selected advisor store ───────────────────────────────────────────────────

const ADVISOR_KEY = "clinksy_selected_advisor_v1";

function loadSelectedAdvisor(): Advisor | null {
  try {
    const raw = localStorage.getItem(ADVISOR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSelectedAdvisor(a: Advisor) {
  try { localStorage.setItem(ADVISOR_KEY, JSON.stringify(a)); } catch {}
}

// ─── Flow types ───────────────────────────────────────────────────────────────

type FlowStage = "browsing" | "offer-placed";
type Step =
  | "entry-browsing"
  | "entry-offer-placed"
  | "mip-check"
  | "mip-explainer"
  | "advisor-list"
  | "app-prompt"
  | "result";

// ─── Main component ───────────────────────────────────────────────────────────

function MortgageFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const fromStage = (searchParams.get("stage") ?? "browsing") as FlowStage;

  const [step, setStep] = useState<Step>(
    fromStage === "offer-placed" ? "mip-check" : "entry-browsing"
  );
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [wantsApp, setWantsApp] = useState<boolean | null>(null);
  const [appStatus, setAppStatus] = useState<"none" | "draft" | "submitted">("none");

  useEffect(() => {
    if (isLoaded && user) {
      const app = getApplication(user.email);
      setAppStatus(app ? app.status : "none");
    }
    const saved = loadSelectedAdvisor();
    if (saved) setSelectedAdvisor(saved);
  }, [isLoaded, user]);

  function selectAdvisor(a: Advisor) {
    saveSelectedAdvisor(a);
    setSelectedAdvisor(a);
    setStep("app-prompt");
  }

  function handleAppPrompt(yes: boolean) {
    setWantsApp(yes);
    setStep("result");
  }

  const STEPS_ORDER: Step[] = fromStage === "browsing"
    ? ["entry-browsing", "advisor-list", "app-prompt", "result"]
    : ["mip-check", "advisor-list", "app-prompt", "result"];

  const currentIdx = STEPS_ORDER.indexOf(step);
  const progress = STEPS_ORDER.length > 1
    ? Math.round((Math.max(currentIdx, 0) / (STEPS_ORDER.length - 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <header className="border-b border-ink/10">
        <div className="container-narrow flex items-center justify-between py-4">
          <Link href="/" className="font-serif text-2xl tracking-tightish text-ink">
            Clinksy
          </Link>
          <Link href="/dashboard" className="text-xs text-ink/40 hover:text-ink/70">
            ← Back to dashboard
          </Link>
        </div>
        <div className="h-0.5 bg-ink/8">
          <div
            className="h-full bg-accent-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="container-narrow py-10 sm:py-14">

        {step === "entry-browsing" && (
          <EntryBrowsing onNext={() => setStep("advisor-list")} />
        )}

        {step === "mip-check" && (
          <MipCheck
            onHasMip={() => setStep("advisor-list")}
            onNoMip={() => setStep("mip-explainer")}
          />
        )}

        {step === "mip-explainer" && (
          <MipExplainer onNext={() => setStep("advisor-list")} />
        )}

        {step === "advisor-list" && (
          <AdvisorList
            onSelect={selectAdvisor}
            fromStage={fromStage}
            onBack={() => setStep(fromStage === "browsing" ? "entry-browsing" : "mip-check")}
          />
        )}

        {step === "app-prompt" && selectedAdvisor && (
          <AppPrompt
            advisor={selectedAdvisor}
            appStatus={appStatus}
            onYes={() => handleAppPrompt(true)}
            onNo={() => handleAppPrompt(false)}
            onBack={() => setStep("advisor-list")}
          />
        )}

        {step === "result" && selectedAdvisor && (
          <ResultScreen
            advisor={selectedAdvisor}
            wantsApp={wantsApp}
            appStatus={appStatus}
          />
        )}

      </main>
    </div>
  );
}

export default function MortgageFlowPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    }>
      <MortgageFlowInner />
    </Suspense>
  );
}

// ─── Step: Entry (browsing) ───────────────────────────────────────────────────

function EntryBrowsing({ onNext }: { onNext: () => void }) {
  return (
    <FlowLayout>
      <Eyebrow>Step 1 — Getting mortgage-ready</Eyebrow>
      <h1 className="mt-4 font-serif text-[36px] leading-tight tracking-tightish text-ink sm:text-[48px]">
        Before you start viewing,<br />
        <span className="text-accent-400">get your MIP sorted.</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">
        A <strong className="font-medium text-ink">Mortgage in Principle (MIP)</strong> is a free, no-obligation letter from a lender confirming roughly how much they'd lend you. Estate agents take you more seriously, and you can move fast when you find the right place.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "⚡", title: "Takes 15 minutes", sub: "With a broker, online or on the phone." },
          { icon: "🆓", title: "Usually free", sub: "Most whole-of-market brokers charge you nothing." },
          { icon: "📋", title: "Valid 30–90 days", sub: "Refresh it when you're close to making an offer." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-ink/10 bg-bone-50 p-4">
            <p className="text-2xl">{c.icon}</p>
            <p className="mt-2 font-medium text-ink">{c.title}</p>
            <p className="mt-1 text-sm text-ink/55">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button type="button" onClick={onNext} className="btn-solid">
          Find a mortgage advisor →
        </button>
      </div>
    </FlowLayout>
  );
}

// ─── Step: MIP Check (offer placed) ──────────────────────────────────────────

function MipCheck({ onHasMip, onNoMip }: { onHasMip: () => void; onNoMip: () => void }) {
  return (
    <FlowLayout>
      <Eyebrow>Quick check</Eyebrow>
      <h1 className="mt-4 font-serif text-[36px] leading-tight tracking-tightish text-ink sm:text-[48px]">
        Do you have a<br />
        <span className="text-accent-400">Mortgage in Principle?</span>
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65">
        A Mortgage in Principle (also called Agreement in Principle or AIP) is a letter from a lender confirming roughly how much they'd lend you. You'll need one to move forward with your mortgage application.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onHasMip}
          className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-bone-50 p-5 text-left hover:border-ink/30 transition-colors"
        >
          <span className="text-2xl">✅</span>
          <span>
            <span className="block font-serif text-xl text-ink">Yes, I have one</span>
            <span className="mt-1 block text-sm text-ink/55">Let's find you a mortgage advisor to take it to a full offer.</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onNoMip}
          className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-bone-50 p-5 text-left hover:border-ink/30 transition-colors"
        >
          <span className="text-2xl">❌</span>
          <span>
            <span className="block font-serif text-xl text-ink">Not yet</span>
            <span className="mt-1 block text-sm text-ink/55">No problem — we'll help you get one first.</span>
          </span>
        </button>
      </div>
    </FlowLayout>
  );
}

// ─── Step: MIP Explainer ──────────────────────────────────────────────────────

function MipExplainer({ onNext }: { onNext: () => void }) {
  return (
    <FlowLayout>
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        ⚠️ Action needed before your offer is accepted
      </div>
      <h1 className="mt-4 font-serif text-[36px] leading-tight tracking-tightish text-ink sm:text-[44px]">
        You'll need a MIP<br />to secure this offer.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65">
        Most sellers and estate agents won't accept an offer without proof you can get the mortgage. A Mortgage in Principle takes about 15 minutes with a broker and gives you that proof — without affecting your credit score.
      </p>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-3">
        {[
          "It's a soft credit check — won't affect your score",
          "Free with most whole-of-market brokers",
          "Shows sellers you're serious and ready to move",
          "Your broker will use the same info for your full mortgage application",
        ].map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm text-ink/75">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button type="button" onClick={onNext} className="btn-solid">
          Find a mortgage advisor →
        </button>
      </div>
    </FlowLayout>
  );
}

// ─── Step: Advisor List ───────────────────────────────────────────────────────

function AdvisorList({ onSelect, fromStage, onBack }: {
  onSelect: (a: Advisor) => void;
  fromStage: FlowStage;
  onBack: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <FlowLayout wide>
      <Eyebrow>Choose a mortgage advisor</Eyebrow>
      <h1 className="mt-4 font-serif text-[32px] leading-tight tracking-tightish text-ink sm:text-[42px]">
        {fromStage === "browsing"
          ? "Pick a broker to get your MIP"
          : "Pick a broker to progress your mortgage"}
      </h1>
      <p className="mt-3 text-base text-ink/55">
        All are whole-of-market — they compare across lenders to find you the best deal.
      </p>

      <div className="mt-6 space-y-3">
        {ADVISORS.map((advisor) => (
          <div
            key={advisor.id}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              expanded === advisor.id ? "border-ink/25" : "border-ink/10"
            }`}
          >
            {/* Summary row */}
            <div className="flex items-start gap-4 bg-bone-50 px-4 py-4 sm:px-5">
              {/* Avatar */}
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-bone text-sm font-bold">
                {advisor.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-lg text-ink">{advisor.name}</p>
                  {advisor.ratingCount && (
                    <span className="text-xs text-ink/45">
                      ★ {advisor.rating} ({advisor.ratingCount})
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-ink/55">{advisor.location}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-ink/10 px-2 py-0.5 text-[11px] text-ink/60">
                    {advisor.fee} {advisor.feeNote && `· ${advisor.feeNote}`}
                  </span>
                  <span className="rounded-full border border-ink/10 px-2 py-0.5 text-[11px] text-ink/60">
                    🕐 {advisor.responseTime}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(advisor)}
                  className="btn-solid text-sm"
                >
                  Select →
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => (v === advisor.id ? null : advisor.id))}
                  className="text-xs text-ink/40 hover:text-ink/70"
                >
                  {expanded === advisor.id ? "Less" : "More info"}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {expanded === advisor.id && (
              <div className="border-t border-ink/8 px-4 py-4 sm:px-5 space-y-3">
                <p className="text-sm text-ink/70 leading-relaxed">{advisor.about}</p>
                <div className="flex flex-wrap gap-1.5">
                  {advisor.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-medium text-accent-500">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <p className="text-ink/40">Availability</p>
                    <p className="font-medium text-ink">{advisor.availability}</p>
                  </div>
                  <div>
                    <p className="text-ink/40">Response time</p>
                    <p className="font-medium text-ink">{advisor.responseTime}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button type="button" onClick={onBack} className="text-sm text-ink/45 underline-offset-2 hover:underline">
          ← Back
        </button>
      </div>
    </FlowLayout>
  );
}

// ─── Step: Application Prompt ─────────────────────────────────────────────────

function AppPrompt({ advisor, appStatus, onYes, onNo, onBack }: {
  advisor: Advisor;
  appStatus: "none" | "draft" | "submitted";
  onYes: () => void;
  onNo: () => void;
  onBack: () => void;
}) {
  const alreadySubmitted = appStatus === "submitted";

  return (
    <FlowLayout>
      {/* Selected advisor confirmation */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-base">✅</span>
        <p className="text-sm text-emerald-800">
          <span className="font-medium">{advisor.name}</span> selected as your mortgage advisor
        </p>
      </div>

      <h1 className="mt-6 font-serif text-[32px] leading-tight tracking-tightish text-ink sm:text-[42px]">
        {alreadySubmitted
          ? "Your application is already submitted."
          : "Speed things up — complete your application first?"}
      </h1>

      {alreadySubmitted ? (
        <>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65">
            You've already submitted your mortgage application. Your advisor at{" "}
            <strong className="font-medium text-ink">{advisor.name}</strong> will be able to see your full details, income, and financial history when you get in touch. You're in great shape.
          </p>
          <div className="mt-8">
            <button type="button" onClick={onYes} className="btn-solid">
              Go to my advisor &amp; portal →
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/65">
            Completing your mortgage application before contacting{" "}
            <strong className="font-medium text-ink">{advisor.name}</strong> means they have everything they need upfront — no back-and-forth, faster AIP, and a smoother process.
          </p>

          <div className="mt-6 rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">What you'll provide</p>
            {[
              "Personal details & residency status",
              "Employment & income information",
              "Existing financial commitments",
              "Property & deposit details",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-ink/70">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                {item}
              </div>
            ))}
            <p className="pt-1 text-[12px] text-ink/40">Takes about 10 minutes. Saves at least 30 in back-and-forth.</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onYes}
              className="flex items-center justify-between rounded-2xl border border-ink bg-ink px-5 py-4 text-left transition-colors hover:bg-ink/90"
            >
              <div>
                <p className="font-medium text-bone">Yes, complete it now</p>
                <p className="mt-0.5 text-sm text-bone/60">~10 minutes · faster process</p>
              </div>
              <span className="text-bone/70">→</span>
            </button>

            <button
              type="button"
              onClick={onNo}
              className="flex items-center justify-between rounded-2xl border border-ink/15 px-5 py-4 text-left transition-colors hover:border-ink/30"
            >
              <div>
                <p className="font-medium text-ink">Not right now</p>
                <p className="mt-0.5 text-sm text-ink/50">Skip for now, contact advisor directly</p>
              </div>
              <span className="text-ink/30">→</span>
            </button>
          </div>

          <div className="mt-4">
            <button type="button" onClick={onBack} className="text-sm text-ink/45 underline-offset-2 hover:underline">
              ← Change advisor
            </button>
          </div>
        </>
      )}
    </FlowLayout>
  );
}

// ─── Step: Result Screen ──────────────────────────────────────────────────────

function ResultScreen({ advisor, wantsApp, appStatus }: {
  advisor: Advisor;
  wantsApp: boolean | null;
  appStatus: "none" | "draft" | "submitted";
}) {
  const showAppFirst = wantsApp === true && appStatus !== "submitted";

  return (
    <FlowLayout wide>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-50 text-xl">🎉</div>
        <div>
          <p className="font-medium text-ink">You're all set</p>
          <p className="text-sm text-ink/50">Here's your mortgage action plan</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">

        {/* Your advisor card */}
        <div className="rounded-2xl border border-ink/15 bg-bone-50 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Your selected advisor</p>
          <div className="mt-3 flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-bone text-sm font-bold">
              {advisor.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-serif text-xl text-ink">{advisor.name}</p>
              <p className="text-sm text-ink/55">{advisor.location} · ★ {advisor.rating}{advisor.ratingCount && ` (${advisor.ratingCount})`}</p>
              <p className="mt-1 text-sm text-ink/55">{advisor.fee} · Responds {advisor.responseTime}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/mortgage-portal"
              className="btn-solid text-sm"
            >
              Go to mortgage portal →
            </Link>
            <Link
              href="/advisor-portal"
              className="btn-ghost text-sm"
            >
              View advisor portal
            </Link>
          </div>
        </div>

        {/* Application card */}
        {showAppFirst && (
          <div className="rounded-2xl border border-accent-400/30 bg-accent-50/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent-500">Next step — recommended</p>
                <p className="mt-1.5 font-serif text-xl text-ink">Complete your mortgage application</p>
                <p className="mt-1.5 text-sm text-ink/60 leading-relaxed">
                  Fill in your personal details, income, and financial information so {advisor.name} has everything they need when you get in touch.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/mortgage-application" className="btn-solid text-sm">
                Start application → (~10 mins)
              </Link>
            </div>
          </div>
        )}

        {/* Application card (not submitted, user said no) */}
        {wantsApp === false && appStatus === "none" && (
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">Optional but recommended</p>
            <p className="mt-1.5 font-serif text-lg text-ink">Start your mortgage application when you're ready</p>
            <p className="mt-1 text-sm text-ink/55">You can complete it before your first call with {advisor.name} to save time.</p>
            <Link href="/mortgage-application" className="mt-3 inline-flex text-sm font-medium text-accent-500 underline-offset-2 hover:underline">
              Start application →
            </Link>
          </div>
        )}

        {/* Already submitted */}
        {appStatus === "submitted" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-600">Application submitted</p>
            <p className="mt-1.5 font-serif text-lg text-ink">Your advisor can see your full details</p>
            <p className="mt-1 text-sm text-ink/55">When you contact {advisor.name}, they'll already have your income, financial history, and property details.</p>
            <Link href="/mortgage-application" className="mt-3 inline-flex text-sm font-medium text-emerald-600 underline-offset-2 hover:underline">
              Review your application →
            </Link>
          </div>
        )}

        {/* In-progress app */}
        {appStatus === "draft" && wantsApp !== true && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-600">Application in progress</p>
            <p className="mt-1.5 font-serif text-lg text-ink">You have a draft application saved</p>
            <p className="mt-1 text-sm text-ink/55">Finish it before your first call to speed things up significantly.</p>
            <Link href="/mortgage-application" className="mt-3 inline-flex text-sm font-medium text-blue-600 underline-offset-2 hover:underline">
              Continue application →
            </Link>
          </div>
        )}

        {/* Document upload reminder */}
        <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">Also needed — documents</p>
          <p className="mt-1.5 font-serif text-lg text-ink">Upload your supporting documents</p>
          <p className="mt-1 text-sm text-ink/55">
            Payslips, bank statements, ID, and proof of address. Your advisor will need these alongside your application.
          </p>
          <Link href="/mortgage-portal" className="mt-3 inline-flex text-sm font-medium text-ink underline-offset-2 hover:underline">
            Go to document portal →
          </Link>
        </div>

        {/* Back to dashboard */}
        <div className="pt-2 text-center">
          <Link href="/dashboard" className="text-sm text-ink/40 underline-offset-2 hover:text-ink/70 hover:underline">
            ← Back to my dashboard
          </Link>
        </div>

      </div>
    </FlowLayout>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function FlowLayout({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto ${wide ? "max-w-2xl" : "max-w-xl"}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">{children}</p>
  );
}
