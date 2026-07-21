"use client";

// Buyer match request form. No directory is shown — we match behind the
// scenes and email the buyer when a professional accepts.

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/user-store";
import { BUYER_TYPES, EMPLOYMENT_TYPES, SURVEY_TYPES } from "@/lib/matching/criteria";

type Role = "MORTGAGE_ADVISOR" | "SOLICITOR" | "SURVEYOR";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "MORTGAGE_ADVISOR", label: "Mortgage advisor" },
  { value: "SOLICITOR", label: "Solicitor / conveyancer" },
  { value: "SURVEYOR", label: "Surveyor" },
];

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink placeholder:text-ink-300 focus:border-ink focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";
const chipCls = (on: boolean) =>
  `cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
    on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
  }`;

export default function MatchClient() {
  const params = useSearchParams();
  const { user } = useUser();

  const initialRole = (["MORTGAGE_ADVISOR", "SOLICITOR", "SURVEYOR"] as const).includes(
    params.get("role") as Role,
  )
    ? (params.get("role") as Role)
    : "MORTGAGE_ADVISOR";

  const [role, setRole] = useState<Role>(initialRole);
  const [buyerName, setBuyerName] = useState(user?.name ?? "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [propertyPostcode, setPropertyPostcode] = useState("");
  const [propertyPrice, setPropertyPrice] = useState("");
  const [buyerType, setBuyerType] = useState("FIRST_TIME");
  const [employmentType, setEmploymentType] = useState("EMPLOYED");
  const [depositPercent, setDepositPercent] = useState("");
  const [creditIssues, setCreditIssues] = useState(false);
  const [sharedOwnership, setSharedOwnership] = useState(false);
  const [lender, setLender] = useState("");
  const [surveyType, setSurveyType] = useState("LEVEL_2");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/match-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          buyerName,
          buyerEmail,
          buyerPhone: buyerPhone || undefined,
          propertyPostcode,
          propertyPrice: propertyPrice ? Number(propertyPrice) : undefined,
          buyerType: role === "MORTGAGE_ADVISOR" ? buyerType : undefined,
          employmentType: role === "MORTGAGE_ADVISOR" ? employmentType : undefined,
          depositPercent: depositPercent ? Number(depositPercent) : undefined,
          creditIssues,
          schemeUsage: sharedOwnership ? "SHARED_OWNERSHIP" : undefined,
          lender: role === "SOLICITOR" ? lender || undefined : undefined,
          surveyType: role === "SURVEYOR" ? surveyType : undefined,
          timeline: timeline || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-ink">We&apos;re on it.</h1>
        <p className="mt-4 text-lg text-ink-400">
          We&apos;ve found your best match and sent them your request. You&apos;ll get an
          email the moment they accept — usually well within 24 hours. If they can&apos;t
          take it on, we automatically pass it to the next best match and keep you posted.
        </p>
      </main>
    );
  }

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)!.label.toLowerCase();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-accent-500">
        Find your professional
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-ink">
        We&apos;ll match you — no directories to trawl.
      </h1>
      <p className="mt-4 text-lg text-ink-400">
        Tell us about your purchase and we&apos;ll pair you with a verified {roleLabel} who
        fits your situation, location and timeline.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <div>
          <label className={labelCls}>I need a…</label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                className={chipCls(role === r.value)}
                onClick={() => setRole(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Your name</label>
            <input className={inputCls} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Phone (optional)</label>
            <input className={inputCls} value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Property postcode</label>
            <input
              className={inputCls}
              value={propertyPostcode}
              onChange={(e) => setPropertyPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Property price (optional)</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              placeholder="£"
            />
          </div>
          <div>
            <label className={labelCls}>Timeline (optional)</label>
            <input
              className={inputCls}
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. offer accepted, exchanging in 6 weeks"
            />
          </div>
        </div>

        {role === "MORTGAGE_ADVISOR" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Your situation</h2>
            <div>
              <label className={labelCls}>Buyer type</label>
              <div className="flex flex-wrap gap-2">
                {BUYER_TYPES.map((t) => (
                  <button key={t.value} type="button" className={chipCls(buyerType === t.value)} onClick={() => setBuyerType(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Employment</label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((t) => (
                  <button key={t.value} type="button" className={chipCls(employmentType === t.value)} onClick={() => setEmploymentType(t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Deposit % (optional)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={creditIssues} onChange={(e) => setCreditIssues(e.target.checked)} className="h-4 w-4 rounded border-ink/20" />
              I&apos;ve had credit issues (missed payments, defaults, CCJs)
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={sharedOwnership} onChange={(e) => setSharedOwnership(e.target.checked)} className="h-4 w-4 rounded border-ink/20" />
              I&apos;m buying through shared ownership / an affordable scheme
            </label>
          </div>
        )}

        {role === "SOLICITOR" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Your purchase</h2>
            <div>
              <label className={labelCls}>Your mortgage lender, if known (optional)</label>
              <input
                className={inputCls}
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                placeholder="e.g. Halifax"
              />
              <p className="mt-1 text-xs text-ink-300">
                We&apos;ll only match you with solicitors on your lender&apos;s panel.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={sharedOwnership} onChange={(e) => setSharedOwnership(e.target.checked)} className="h-4 w-4 rounded border-ink/20" />
              Shared ownership purchase
            </label>
          </div>
        )}

        {role === "SURVEYOR" && (
          <div>
            <label className={labelCls}>Survey type</label>
            <div className="flex flex-wrap gap-2">
              {SURVEY_TYPES.map((t) => (
                <button key={t.value} type="button" className={chipCls(surveyType === t.value)} onClick={() => setSurveyType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Anything else? (optional)</label>
          <textarea
            className={inputCls}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything that helps us match you well"
          />
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition hover:bg-ink-600 disabled:opacity-50"
        >
          {submitting ? "Matching…" : "Find my match"}
        </button>
        <p className="text-center text-xs text-ink-300">
          Free for buyers. Your contact details are only shared once a professional accepts.
        </p>
      </form>
    </main>
  );
}
