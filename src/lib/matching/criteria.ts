// criteria.ts — single source of truth for onboarding fields and match criteria.
// Used by the onboarding form, the professionals API and the matching engine.

export const ADVISOR_SPECIALISATIONS = [
  { value: "FIRST_TIME", label: "First-time buyers" },
  { value: "MOVER", label: "Home movers" },
  { value: "REMORTGAGE", label: "Remortgage" },
  { value: "BTL", label: "Buy-to-let" },
  { value: "LTD_BTL", label: "Limited company BTL" },
  { value: "SELF_EMPLOYED", label: "Self-employed / contractor income" },
  { value: "ADVERSE_CREDIT", label: "Adverse credit" },
  { value: "NEW_BUILD", label: "New-build" },
  { value: "SHARED_OWNERSHIP", label: "Shared ownership / affordable schemes" },
  { value: "HIGH_VALUE", label: "High-value lending" },
  { value: "EXPAT", label: "Expat / foreign national" },
  { value: "LATER_LIFE", label: "Later-life / RIO" },
] as const;

export const SOLICITOR_SPECIALISATIONS = [
  { value: "LEASEHOLD", label: "Leasehold" },
  { value: "NEW_BUILD", label: "New-build" },
  { value: "SHARED_OWNERSHIP", label: "Shared ownership" },
  { value: "AUCTION", label: "Auction" },
  { value: "TRANSFER_OF_EQUITY", label: "Transfer of equity" },
  { value: "UNREGISTERED_LAND", label: "Unregistered land" },
] as const;

export const SURVEYOR_SPECIALISMS = [
  { value: "LISTED", label: "Listed buildings" },
  { value: "NON_STANDARD", label: "Non-standard construction" },
  { value: "FLATS_LEASEHOLD", label: "Flats / leasehold" },
] as const;

export const SURVEY_TYPES = [
  { value: "LEVEL_1", label: "Level 1 — Condition Report" },
  { value: "LEVEL_2", label: "Level 2 — HomeBuyer Report" },
  { value: "LEVEL_3", label: "Level 3 — Building Survey" },
  { value: "VALUATION", label: "Valuation" },
  { value: "SNAGGING", label: "Snagging" },
] as const;

export const FEE_MODELS = [
  { value: "FEE_FREE", label: "Fee-free (commission only)" },
  { value: "FIXED", label: "Fixed fee" },
  { value: "PERCENTAGE", label: "Percentage of loan" },
] as const;

export const APPOINTMENT_MODES = [
  { value: "REMOTE", label: "Remote (phone / video)" },
  { value: "IN_PERSON", label: "In person" },
  { value: "BOTH", label: "Both" },
] as const;

export const JURISDICTIONS = [
  { value: "ENGLAND_WALES", label: "England & Wales" },
  { value: "SCOTLAND", label: "Scotland" },
  { value: "NORTHERN_IRELAND", label: "Northern Ireland" },
] as const;

export const BUYER_TYPES = [
  { value: "FIRST_TIME", label: "First-time buyer" },
  { value: "MOVER", label: "Home mover" },
  { value: "BTL", label: "Buy-to-let" },
  { value: "REMORTGAGE", label: "Remortgage" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "DIRECTOR", label: "Company director" },
] as const;

// How long a professional has to accept before the request passes on.
export const ACCEPT_WINDOW_HOURS = 24;
// Reminder email sent at this many hours after the offer.
export const REMINDER_AFTER_HOURS = 12;
// Consecutive timeouts before a profile is auto-paused.
export const AUTO_PAUSE_AFTER_TIMEOUTS = 2;

// Extract the postcode area (letters at the start): "SW1A 1AA" -> "SW".
export function postcodeArea(postcode: string): string {
  const m = postcode.trim().toUpperCase().match(/^([A-Z]{1,2})/);
  return m ? m[1] : "";
}

// Extract the outward code: "SW1A 1AA" -> "SW1A".
export function outwardCode(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  return cleaned.split(" ")[0] ?? cleaned;
}

// Map buyer situation -> the advisor specialisations that serve it.
// Used to derive required + desirable specialisations from buyer inputs.
export function advisorSpecialisationsForBuyer(input: {
  buyerType?: string | null;
  employmentType?: string | null;
  creditIssues?: boolean;
  schemeUsage?: string | null;
  propertyPrice?: number | null;
}): { required: string[]; desirable: string[] } {
  const required: string[] = [];
  const desirable: string[] = [];

  if (input.buyerType === "FIRST_TIME") desirable.push("FIRST_TIME");
  if (input.buyerType === "MOVER") desirable.push("MOVER");
  if (input.buyerType === "BTL") required.push("BTL");
  if (input.buyerType === "REMORTGAGE") desirable.push("REMORTGAGE");

  if (
    input.employmentType === "SELF_EMPLOYED" ||
    input.employmentType === "CONTRACTOR" ||
    input.employmentType === "DIRECTOR"
  ) {
    required.push("SELF_EMPLOYED");
  }
  if (input.creditIssues) required.push("ADVERSE_CREDIT");
  if (input.schemeUsage === "SHARED_OWNERSHIP") required.push("SHARED_OWNERSHIP");
  if ((input.propertyPrice ?? 0) >= 1_000_000) desirable.push("HIGH_VALUE");

  return { required, desirable };
}
