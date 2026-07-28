// stamp-duty.ts — property transaction tax across the three UK systems.
//
// England & Northern Ireland: Stamp Duty Land Tax (SDLT), HMRC.
// Scotland: Land and Buildings Transaction Tax (LBTT), Revenue Scotland.
// Wales: Land Transaction Tax (LTT), Welsh Revenue Authority.
//
// All three are "slice" taxes: each rate applies only to the portion of the
// price falling in that band, not to the whole price.
//
// Scope: single main-residence purchases. The additional-property surcharges
// (England 5%, Scotland ADS, Wales higher rates) and the non-UK-resident
// surcharge are deliberately not modelled — see the note rendered alongside
// the calculator.

export type Region = "ENGLAND_NI" | "SCOTLAND" | "WALES";

export const REGIONS: { value: Region; label: string; taxName: string }[] = [
  { value: "ENGLAND_NI", label: "England or N. Ireland", taxName: "Stamp Duty" },
  { value: "SCOTLAND", label: "Scotland", taxName: "LBTT" },
  { value: "WALES", label: "Wales", taxName: "LTT" },
];

/** A band charges `rate` on the portion of the price above `from`, up to `to`. */
type Band = { from: number; to: number | null; rate: number };

const SDLT_STANDARD: Band[] = [
  { from: 0, to: 125_000, rate: 0 },
  { from: 125_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 925_000, rate: 0.05 },
  { from: 925_000, to: 1_500_000, rate: 0.1 },
  { from: 1_500_000, to: null, rate: 0.12 },
];

// First-time buyer relief. Unavailable above £500,000 — see FTB_RELIEF_CAP.
const SDLT_FIRST_TIME: Band[] = [
  { from: 0, to: 300_000, rate: 0 },
  { from: 300_000, to: 500_000, rate: 0.05 },
];

const LBTT_STANDARD: Band[] = [
  { from: 0, to: 145_000, rate: 0 },
  { from: 145_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: null, rate: 0.12 },
];

// Scottish FTB relief simply lifts the nil-rate band to £175,000.
const LBTT_FIRST_TIME: Band[] = [
  { from: 0, to: 175_000, rate: 0 },
  { from: 175_000, to: 250_000, rate: 0.02 },
  { from: 250_000, to: 325_000, rate: 0.05 },
  { from: 325_000, to: 750_000, rate: 0.1 },
  { from: 750_000, to: null, rate: 0.12 },
];

// Wales has no dedicated first-time buyer relief — everyone pays these.
const LTT_STANDARD: Band[] = [
  { from: 0, to: 225_000, rate: 0 },
  { from: 225_000, to: 400_000, rate: 0.06 },
  { from: 400_000, to: 750_000, rate: 0.075 },
  { from: 750_000, to: 1_500_000, rate: 0.1 },
  { from: 1_500_000, to: null, rate: 0.12 },
];

/** Above this price, SDLT first-time buyer relief is lost entirely. */
export const FTB_RELIEF_CAP = 500_000;

export type BandBreakdown = {
  from: number;
  to: number | null;
  rate: number;
  taxableAmount: number;
  tax: number;
};

export type StampDutyResult = {
  total: number;
  /** Only bands that actually bear tax on this purchase. */
  breakdown: BandBreakdown[];
  effectiveRate: number;
  /** True when FTB relief was applied. */
  reliefApplied: boolean;
  /** True when the buyer is a FTB but the price exceeded the relief cap. */
  reliefLostToCap: boolean;
  taxName: string;
};

function bandsFor(region: Region, firstTimeBuyer: boolean, price: number): Band[] {
  if (region === "SCOTLAND") {
    return firstTimeBuyer ? LBTT_FIRST_TIME : LBTT_STANDARD;
  }
  if (region === "WALES") {
    return LTT_STANDARD; // no FTB relief in Wales
  }
  // England & NI: relief is unavailable above the cap.
  if (firstTimeBuyer && price <= FTB_RELIEF_CAP) return SDLT_FIRST_TIME;
  return SDLT_STANDARD;
}

export function calculateStampDuty(
  price: number,
  region: Region,
  firstTimeBuyer: boolean,
): StampDutyResult {
  const taxName = REGIONS.find((r) => r.value === region)!.taxName;

  const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
  const bands = bandsFor(region, firstTimeBuyer, safePrice);

  const breakdown: BandBreakdown[] = [];
  let total = 0;

  for (const band of bands) {
    if (safePrice <= band.from) break;
    const upper = band.to === null ? safePrice : Math.min(safePrice, band.to);
    const taxableAmount = upper - band.from;
    if (taxableAmount <= 0) continue;
    const tax = taxableAmount * band.rate;
    total += tax;
    if (band.rate > 0) {
      breakdown.push({ ...band, taxableAmount, tax });
    }
  }

  // Round to the penny, then to the pound as the revenue bodies do.
  total = Math.round(total);

  return {
    total,
    breakdown,
    effectiveRate: safePrice > 0 ? total / safePrice : 0,
    reliefApplied:
      firstTimeBuyer &&
      ((region === "ENGLAND_NI" && safePrice <= FTB_RELIEF_CAP) ||
        region === "SCOTLAND"),
    reliefLostToCap:
      firstTimeBuyer && region === "ENGLAND_NI" && safePrice > FTB_RELIEF_CAP,
    taxName,
  };
}

export function formatGBP(n: number): string {
  return n.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
}
