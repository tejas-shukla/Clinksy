"use client";

// Interactive Stamp Duty / LBTT / LTT calculator. All maths is client-side
// and pure — see src/lib/stamp-duty.ts.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  REGIONS,
  calculateStampDuty,
  formatGBP,
  FTB_RELIEF_CAP,
  type Region,
} from "@/lib/stamp-duty";

const chipCls = (on: boolean) =>
  `cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
    on
      ? "border-ink bg-ink text-white"
      : "border-ink/15 bg-white text-ink hover:border-ink/40"
  }`;

export default function CalculatorClient() {
  const [priceInput, setPriceInput] = useState("300000");
  const [region, setRegion] = useState<Region>("ENGLAND_NI");
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(true);

  const price = Number(priceInput.replace(/[^0-9]/g, "")) || 0;
  const result = useMemo(
    () => calculateStampDuty(price, region, firstTimeBuyer),
    [price, region, firstTimeBuyer],
  );

  // How much the relief cliff edge is costing at this price.
  const cliffEdgeCost = useMemo(() => {
    if (!result.reliefLostToCap) return null;
    const atCap = calculateStampDuty(FTB_RELIEF_CAP, region, true).total;
    return result.total - atCap;
  }, [result, region]);

  return (
    <div className="mt-10 grid gap-8 md:grid-cols-5">
      {/* Inputs */}
      <div className="md:col-span-2">
        <div className="space-y-6 rounded-2xl border border-ink/10 bg-white p-6">
          <div>
            <label
              htmlFor="price"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Property price
            </label>
            <div className="flex items-center rounded-xl border border-ink/10 bg-white px-4 focus-within:border-ink">
              <span className="text-lg text-ink-400">£</span>
              <input
                id="price"
                inputMode="numeric"
                className="w-full bg-transparent px-2 py-3 text-lg text-ink focus:outline-none"
                value={priceInput === "0" ? "" : Number(price).toLocaleString("en-GB")}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="300,000"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Where are you buying?
            </span>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={region === r.value}
                  className={chipCls(region === r.value)}
                  onClick={() => setRegion(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Are you a first-time buyer?
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={firstTimeBuyer}
                className={chipCls(firstTimeBuyer)}
                onClick={() => setFirstTimeBuyer(true)}
              >
                Yes
              </button>
              <button
                type="button"
                aria-pressed={!firstTimeBuyer}
                className={chipCls(!firstTimeBuyer)}
                onClick={() => setFirstTimeBuyer(false)}
              >
                No
              </button>
            </div>
            {region === "WALES" && firstTimeBuyer && (
              <p className="mt-2 text-xs text-ink-400">
                Wales has no separate first-time buyer relief — everyone pays the
                same rates. Its £225,000 nil-rate band is the most generous in the
                UK.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="md:col-span-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-ink-400">
            {result.taxName} to pay
          </p>
          <p
            className="mt-1 font-serif text-5xl tracking-tight2 text-ink"
            aria-live="polite"
          >
            {formatGBP(result.total)}
          </p>
          {price > 0 && (
            <p className="mt-2 text-sm text-ink-400">
              {result.total === 0
                ? "No tax due on this purchase."
                : `That's an effective rate of ${(result.effectiveRate * 100).toFixed(2)}% of the purchase price.`}
            </p>
          )}

          {result.reliefApplied && result.total === 0 && price > 0 && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              First-time buyer relief applied — the whole price sits within your
              nil-rate band.
            </p>
          )}

          {result.reliefLostToCap && (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong className="font-semibold">
                You&apos;ve lost first-time buyer relief.
              </strong>{" "}
              Relief is unavailable above {formatGBP(FTB_RELIEF_CAP)}, so standard
              rates apply to the whole price.
              {cliffEdgeCost !== null && cliffEdgeCost > 0 && (
                <>
                  {" "}
                  Buying at {formatGBP(FTB_RELIEF_CAP)} instead would cost{" "}
                  {formatGBP(cliffEdgeCost)} less in tax — worth knowing when
                  negotiating near that line.
                </>
              )}
            </div>
          )}

          {result.breakdown.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                How it breaks down
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 text-left text-ink-400">
                      <th className="py-2 pr-4 font-medium">Band</th>
                      <th className="py-2 pr-4 font-medium">Rate</th>
                      <th className="py-2 text-right font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((b) => (
                      <tr key={b.from} className="border-b border-ink/5">
                        <td className="py-2.5 pr-4 text-ink">
                          {formatGBP(b.from)} to{" "}
                          {b.to === null ? "above" : formatGBP(b.to)}
                        </td>
                        <td className="py-2.5 pr-4 text-ink-400">
                          {(b.rate * 100).toFixed(b.rate * 100 % 1 === 0 ? 0 : 1)}%
                        </td>
                        <td className="py-2.5 text-right font-medium text-ink">
                          {formatGBP(b.tax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Each rate applies only to the portion of the price within that
                band — not to the whole price.
              </p>
            </div>
          )}

          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="text-sm text-ink-400">
              Your solicitor files the return and collects this as part of
              completion.{" "}
              <Link
                href="/match?role=SOLICITOR"
                className="font-medium text-ink underline underline-offset-2 hover:text-accent-400"
              >
                Get matched with a conveyancing solicitor
              </Link>{" "}
              — free, and we never sell your details.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          This calculator covers single main-residence purchases. It does not
          include the additional-property surcharge (if you&apos;ll own more than
          one home), the non-UK-resident surcharge, or non-residential and
          mixed-use rates. Figures are an estimate to help you budget — your
          solicitor confirms the exact amount. Clinkeys is an information service,
          not a tax adviser.
        </p>
      </div>
    </div>
  );
}
