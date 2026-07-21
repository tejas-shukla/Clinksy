"use client";

// Professional onboarding — mortgage advisors, solicitors, surveyors.
// Collects the matching criteria defined in src/lib/matching/criteria.ts.

import { useState } from "react";
import {
  ADVISOR_SPECIALISATIONS,
  SOLICITOR_SPECIALISATIONS,
  SURVEYOR_SPECIALISMS,
  SURVEY_TYPES,
  FEE_MODELS,
  APPOINTMENT_MODES,
  JURISDICTIONS,
} from "@/lib/matching/criteria";

type Role = "MORTGAGE_ADVISOR" | "SOLICITOR" | "SURVEYOR";

const ROLE_OPTIONS: { value: Role; label: string; reg: string; regBody: string }[] = [
  { value: "MORTGAGE_ADVISOR", label: "Mortgage advisor", reg: "FCA number", regBody: "FCA" },
  { value: "SOLICITOR", label: "Solicitor / conveyancer", reg: "SRA or CLC number", regBody: "SRA" },
  { value: "SURVEYOR", label: "Surveyor", reg: "RICS number", regBody: "RICS" },
];

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink placeholder:text-ink-300 focus:border-ink focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";
const chipCls = (on: boolean) =>
  `cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
    on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
  }`;

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={chipCls(selected.includes(o.value))}
          onClick={() => onToggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function JoinClient() {
  const [role, setRole] = useState<Role>("MORTGAGE_ADVISOR");
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [basePostcode, setBasePostcode] = useState("");
  const [coverageInput, setCoverageInput] = useState("");
  const [nationwide, setNationwide] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("ENGLAND_WALES");
  const [specialisations, setSpecialisations] = useState<string[]>([]);
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [wholeOfMarket, setWholeOfMarket] = useState(true);
  const [feeModel, setFeeModel] = useState("");
  const [feeStructure, setFeeStructure] = useState("FIXED");
  const [cqsAccredited, setCqsAccredited] = useState(false);
  const [appointmentMode, setAppointmentMode] = useState("BOTH");
  const [lenderPanelsInput, setLenderPanelsInput] = useState("");
  const [turnaroundDays, setTurnaroundDays] = useState("7");
  const [weeklyCapacity, setWeeklyCapacity] = useState("5");
  const [languagesInput, setLanguagesInput] = useState("English");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const roleMeta = ROLE_OPTIONS.find((r) => r.value === role)!;

  const toggle = (list: string[], set: (v: string[]) => void) => (v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          firmName,
          email,
          phone,
          registrationNumber,
          registrationBody: roleMeta.regBody,
          basePostcode,
          coverageAreas: coverageInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          nationwide,
          jurisdiction,
          specialisations,
          surveyTypes,
          wholeOfMarket,
          feeModel: feeModel || undefined,
          feeStructure,
          cqsAccredited,
          appointmentMode,
          lenderPanels: lenderPanelsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          turnaroundDays: Number(turnaroundDays) || undefined,
          weeklyCapacity: Number(weeklyCapacity) || 5,
          languages: languagesInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
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
        <h1 className="text-3xl font-semibold text-ink">You&apos;re in — almost.</h1>
        <p className="mt-4 text-lg text-ink-400">
          Thanks for registering. We verify every {roleMeta.label.toLowerCase()}&apos;s{" "}
          {roleMeta.reg} before profiles go live — usually within one working day. We&apos;ll
          email you as soon as you&apos;re active and client requests start coming your way.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-accent-500">
        For professionals
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-ink">Get matched with serious buyers.</h1>
      <p className="mt-4 text-lg text-ink-400">
        No directories, no bidding wars. Tell us what you do and where, and we&apos;ll send you
        client requests that fit — you accept only the ones you want.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-8">
        {/* Role */}
        <div>
          <label className={labelCls}>I am a…</label>
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

        {/* Identity */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Firm (optional)</label>
            <input className={inputCls} value={firmName} onChange={(e) => setFirmName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Phone (optional)</label>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{roleMeta.reg}</label>
            <input
              className={inputCls}
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="We verify this before your profile goes live"
              required
            />
          </div>
        </div>

        {/* Coverage */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Where you work</h2>
          {role === "SOLICITOR" ? (
            <div>
              <label className={labelCls}>Jurisdiction</label>
              <div className="flex flex-wrap gap-2">
                {JURISDICTIONS.map((j) => (
                  <button
                    key={j.value}
                    type="button"
                    className={chipCls(jurisdiction === j.value)}
                    onClick={() => setJurisdiction(j.value)}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>Base postcode</label>
                <input
                  className={inputCls}
                  value={basePostcode}
                  onChange={(e) => setBasePostcode(e.target.value)}
                  placeholder="e.g. SW1A"
                />
              </div>
              {role === "MORTGAGE_ADVISOR" && (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={nationwide}
                    onChange={(e) => setNationwide(e.target.checked)}
                    className="h-4 w-4 rounded border-ink/20"
                  />
                  I work with clients nationwide (remote)
                </label>
              )}
              {!(role === "MORTGAGE_ADVISOR" && nationwide) && (
                <div>
                  <label className={labelCls}>
                    Postcode areas you cover (comma-separated)
                  </label>
                  <input
                    className={inputCls}
                    value={coverageInput}
                    onChange={(e) => setCoverageInput(e.target.value)}
                    placeholder="e.g. SW, SE, BR"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Specialisations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">What you specialise in</h2>
          {role === "MORTGAGE_ADVISOR" && (
            <Chips
              options={ADVISOR_SPECIALISATIONS}
              selected={specialisations}
              onToggle={toggle(specialisations, setSpecialisations)}
            />
          )}
          {role === "SOLICITOR" && (
            <Chips
              options={SOLICITOR_SPECIALISATIONS}
              selected={specialisations}
              onToggle={toggle(specialisations, setSpecialisations)}
            />
          )}
          {role === "SURVEYOR" && (
            <>
              <div>
                <label className={labelCls}>Survey types you offer</label>
                <Chips
                  options={SURVEY_TYPES}
                  selected={surveyTypes}
                  onToggle={toggle(surveyTypes, setSurveyTypes)}
                />
              </div>
              <div>
                <label className={labelCls}>Property specialisms (optional)</label>
                <Chips
                  options={SURVEYOR_SPECIALISMS}
                  selected={specialisations}
                  onToggle={toggle(specialisations, setSpecialisations)}
                />
              </div>
              <div>
                <label className={labelCls}>Typical turnaround (days to report)</label>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={turnaroundDays}
                  onChange={(e) => setTurnaroundDays(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Role-specific business details */}
        {role === "MORTGAGE_ADVISOR" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">How you work</h2>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={wholeOfMarket}
                onChange={(e) => setWholeOfMarket(e.target.checked)}
                className="h-4 w-4 rounded border-ink/20"
              />
              Whole-of-market access
            </label>
            {!wholeOfMarket && (
              <div>
                <label className={labelCls}>Panel lenders (comma-separated)</label>
                <input
                  className={inputCls}
                  value={lenderPanelsInput}
                  onChange={(e) => setLenderPanelsInput(e.target.value)}
                  placeholder="e.g. Halifax, Nationwide, NatWest"
                />
              </div>
            )}
            <div>
              <label className={labelCls}>Fee model</label>
              <div className="flex flex-wrap gap-2">
                {FEE_MODELS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={chipCls(feeModel === f.value)}
                    onClick={() => setFeeModel(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Appointments</label>
              <div className="flex flex-wrap gap-2">
                {APPOINTMENT_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={chipCls(appointmentMode === m.value)}
                    onClick={() => setAppointmentMode(m.value)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {role === "SOLICITOR" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">How you work</h2>
            <div>
              <label className={labelCls}>
                Lender panels you&apos;re on (comma-separated)
              </label>
              <input
                className={inputCls}
                value={lenderPanelsInput}
                onChange={(e) => setLenderPanelsInput(e.target.value)}
                placeholder="e.g. Halifax, Nationwide, Santander"
              />
              <p className="mt-1 text-xs text-ink-300">
                Buyers with a known lender are only matched to solicitors on that lender&apos;s panel.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={cqsAccredited}
                onChange={(e) => setCqsAccredited(e.target.checked)}
                className="h-4 w-4 rounded border-ink/20"
              />
              CQS accredited
            </label>
            <div>
              <label className={labelCls}>Fee structure</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "FIXED", label: "Fixed fee" },
                  { value: "NO_SALE_NO_FEE", label: "No sale, no fee" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={chipCls(feeStructure === f.value)}
                    onClick={() => setFeeStructure(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Capacity + languages */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Max new clients per week</label>
            <input
              type="number"
              min={1}
              max={100}
              className={inputCls}
              value={weeklyCapacity}
              onChange={(e) => setWeeklyCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Languages (comma-separated)</label>
            <input
              className={inputCls}
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition hover:bg-ink-600 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Register — free to join"}
        </button>
        <p className="text-center text-xs text-ink-300">
          We verify every registration with the {roleMeta.regBody} before profiles go live.
        </p>
      </form>
    </main>
  );
}
