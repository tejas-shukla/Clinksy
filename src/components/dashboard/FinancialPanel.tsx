"use client";

// FinancialPanel — property finances, SDLT calculator, and cost tracker
// Used on both Dashboard 1 and Dashboard 2.

import { useState, useEffect } from "react";

const FIRST_VISIT_KEY = "clinkeys_dashboard_seen_v1";

// ─── SDLT calculator — England & Northern Ireland (rates from April 2025) ─────
// Source: https://www.gov.uk/stamp-duty-land-tax/residential-property-rates
function calcSDLT(price: number, ftb: boolean): number {
  if (price <= 0) return 0;
  // First-time buyer relief: 0% up to £300k, 5% on £300k–£500k.
  // Over £500k → standard rates apply (no relief).
  if (ftb && price <= 500_000) {
    return price <= 300_000 ? 0 : (price - 300_000) * 0.05;
  }
  // Standard residential rates
  let t = 0;
  if (price > 125_000) t += (Math.min(price, 250_000) - 125_000) * 0.02;
  if (price > 250_000) t += (Math.min(price, 925_000) - 250_000) * 0.05;
  if (price > 925_000) t += (Math.min(price, 1_500_000) - 925_000) * 0.10;
  if (price > 1_500_000) t += (price - 1_500_000) * 0.12;
  return t;
}

function sdltRows(
  price: number,
  ftb: boolean,
): { band: string; rate: string; amount: number }[] {
  if (ftb && price <= 500_000) {
    const rows: { band: string; rate: string; amount: number }[] = [
      { band: "Up to £300,000", rate: "0%", amount: 0 },
    ];
    if (price > 300_000)
      rows.push({
        band: "£300,001 – £500,000",
        rate: "5%",
        amount: (Math.min(price, 500_000) - 300_000) * 0.05,
      });
    return rows;
  }
  const rows: { band: string; rate: string; amount: number }[] = [
    { band: "Up to £125,000", rate: "0%", amount: 0 },
  ];
  if (price > 125_000)
    rows.push({
      band: "£125,001 – £250,000",
      rate: "2%",
      amount: (Math.min(price, 250_000) - 125_000) * 0.02,
    });
  if (price > 250_000)
    rows.push({
      band: "£250,001 – £925,000",
      rate: "5%",
      amount: (Math.min(price, 925_000) - 250_000) * 0.05,
    });
  if (price > 925_000)
    rows.push({
      band: "£925,001 – £1.5m",
      rate: "10%",
      amount: (Math.min(price, 1_500_000) - 925_000) * 0.1,
    });
  if (price > 1_500_000)
    rows.push({
      band: "Over £1.5m",
      rate: "12%",
      amount: (price - 1_500_000) * 0.12,
    });
  return rows;
}

// ─── Cumulative professional fees spent up to & including each stage ──────────
// (Excludes deposit and SDLT — those are shown separately)
const FIXED_COSTS: Record<number, number> = {
  1: 0,      // Free — broker & credit check
  2: 0,      // Free — just your time
  3: 50,     // AML identity checks ~£50
  4: 550,    // Mortgage arrangement fee ~£500
  5: 2300,   // Solicitor fees ~£1,750
  6: 2950,   // Survey Level 2 ~£650
  7: 3250,   // Buildings insurance first year ~£300
  8: 3250,   // No new fixed costs at exchange
  9: 3850,   // Removal van ~£600
  10: 4200,  // Land Registry ~£350
};
const TOTAL_FIXED = 4200;

function fmt(n: number) {
  return "£" + Math.round(n).toLocaleString("en-GB");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinancialPanel({ currentStageId }: { currentStageId: number }) {
  const [rawInput, setRawInput] = useState("350000");
  const [propVal, setPropVal] = useState(350_000);
  const [depositPct, setDepositPct] = useState(10);
  const [ftb, setFtb] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  // Collapsed by default; auto-expanded on the very first visit ever
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(FIRST_VISIT_KEY);
    if (!seen) {
      // First ever visit — expand and mark as seen
      setIsOpen(true);
      localStorage.setItem(FIRST_VISIT_KEY, "1");
    }
  }, []);

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setRawInput(digits);
    setPropVal(parseInt(digits, 10) || 0);
  }

  const depositAmt = propVal * depositPct / 100;
  const mortgage = propVal - depositAmt;
  const ltv = 100 - depositPct;
  const sdlt = calcSDLT(propVal, ftb);
  const standardSdlt = calcSDLT(propVal, false);
  const saving = ftb && propVal <= 500_000 ? standardSdlt - sdlt : 0;

  const spentSoFar = FIXED_COSTS[currentStageId] ?? 0;
  const remainingFees = TOTAL_FIXED - spentSoFar;
  const progressPct = TOTAL_FIXED > 0 ? Math.round((spentSoFar / TOTAL_FIXED) * 100) : 0;

  const rows = sdltRows(propVal, ftb);

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50">
      {/* ── Collapsible header ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 sm:p-5"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
            Property finances
          </span>
          {!isOpen && (
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/45">
              tap to expand
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-ink/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Collapsible body ── */}
      {isOpen && (
      <div className="border-t border-ink/10 p-4 sm:p-5">
      {/* ── FTB toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-ink/45">
          Configure your finances below to calculate stamp duty and costs.
        </p>
        {/* FTB toggle */}
        <label className="flex cursor-pointer select-none items-center gap-2">
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
              ftb ? "bg-accent-400" : "bg-ink/20"
            }`}
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                ftb ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
          <input
            type="checkbox"
            checked={ftb}
            onChange={(e) => setFtb(e.target.checked)}
            className="sr-only"
          />
          <span className="text-xs text-ink/60">First-time buyer</span>
        </label>
      </div>

      {/* ── Inputs ── */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Property value */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-ink/50">
            Property value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/40">
              £
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={rawInput ? parseInt(rawInput).toLocaleString("en-GB") : ""}
              onChange={handleValueChange}
              className="w-full rounded-xl border border-ink/15 bg-bone py-2.5 pl-7 pr-3 text-sm font-medium text-ink focus:border-ink/40 focus:outline-none"
              placeholder="350,000"
            />
          </div>
        </div>

        {/* Deposit slider */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-medium text-ink/50">Deposit</label>
            <span className="text-[11px] font-medium text-ink">
              {depositPct}% &nbsp;·&nbsp; {fmt(depositAmt)}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={depositPct}
            onChange={(e) => setDepositPct(parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer accent-ink"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-ink/30">
            <span>5%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* ── Key figures grid ── */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Mortgage needed", value: fmt(mortgage) },
          { label: "LTV ratio", value: `${ltv}%` },
          {
            label: "Stamp Duty",
            value: sdlt === 0 ? "£0 (relief)" : fmt(sdlt),
            accent: sdlt > 0,
          },
          { label: "Total deposit", value: fmt(depositAmt) },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-ink/10 bg-bone px-3 py-2.5"
          >
            <p className="text-[10px] text-ink/45">{label}</p>
            <p
              className={`mt-0.5 text-sm font-medium leading-tight ${
                accent ? "text-accent-500" : "text-ink"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── SDLT breakdown toggle ── */}
      <button
        onClick={() => setShowBreakdown((v) => !v)}
        className="mt-3 flex w-full items-center justify-between text-[11px] text-ink/45 transition-colors hover:text-ink/70"
      >
        <span>
          Stamp duty breakdown&nbsp;
          {ftb ? "(first-time buyer)" : "(standard rates)"}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          className={`shrink-0 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M1.5 3.5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showBreakdown && (
        <div className="mt-2 overflow-hidden rounded-xl border border-ink/10 text-[12px]">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-ink/8 px-3 py-2 last:border-0"
            >
              <span className="text-ink/55">
                {row.band} &nbsp;@&nbsp; {row.rate}
              </span>
              <span
                className={
                  row.amount > 0 ? "font-medium text-ink" : "text-ink/25"
                }
              >
                {row.amount > 0 ? fmt(row.amount) : "—"}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-ink/4 px-3 py-2 font-medium">
            <span className="text-ink">Total SDLT</span>
            <span className={sdlt > 0 ? "text-accent-500" : "text-ink/40"}>
              {sdlt > 0 ? fmt(sdlt) : "£0"}
            </span>
          </div>
          {ftb && propVal <= 500_000 && saving > 0 && (
            <div className="bg-accent-50/60 px-3 py-1.5 text-[11px] text-accent-500">
              First-time buyer relief applied — saving {fmt(saving)} vs standard rates
            </div>
          )}
          {ftb && propVal > 500_000 && (
            <div className="bg-ink/4 px-3 py-1.5 text-[11px] text-ink/50">
              Over £500k — standard rates apply (no first-time buyer relief)
            </div>
          )}
          <div className="border-t border-ink/10 px-3 py-1.5 text-[10px] text-ink/35">
            England &amp; Northern Ireland only. Scotland uses LBTT; Wales uses LTT.
          </div>
        </div>
      )}

      {/* ── Cost tracker ── */}
      <div className="mt-4 border-t border-ink/10 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">
              Fees paid so far
            </p>
            <p className="mt-1 font-serif text-2xl leading-none text-ink">
              {fmt(spentSoFar)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">
              Remaining fees
            </p>
            <p className="mt-1 font-serif text-2xl leading-none text-ink">
              {fmt(remainingFees)}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] text-ink/40">
            <span>Professional fees tracker</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-accent-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {/* Summary table */}
        <div className="mt-3 divide-y divide-ink/8 overflow-hidden rounded-xl border border-ink/10 text-[11px]">
          <div className="flex justify-between bg-bone px-3 py-2">
            <span className="text-ink/55">Deposit ({depositPct}%)</span>
            <span className="font-medium text-ink">{fmt(depositAmt)}</span>
          </div>
          <div className="flex justify-between bg-bone px-3 py-2">
            <span className="text-ink/55">Stamp Duty (at completion)</span>
            <span className="font-medium text-ink">{fmt(sdlt)}</span>
          </div>
          <div className="flex justify-between bg-bone px-3 py-2">
            <span className="text-ink/55">Professional fees (total)</span>
            <span className="font-medium text-ink">{fmt(TOTAL_FIXED)}</span>
          </div>
          <div className="flex justify-between bg-ink/4 px-3 py-2.5">
            <span className="font-medium text-ink">Total to budget</span>
            <span className="font-bold text-ink">
              {fmt(depositAmt + sdlt + TOTAL_FIXED)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-ink/35">
          Fees are estimates only. Mortgage in Principle (MIP) is free and a
          great first step for boosting offer credibility.
        </p>
      </div>
      </div>
      )}
    </div>
  );
}
