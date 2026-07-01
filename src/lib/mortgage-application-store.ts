// mortgage-application-store.ts
// Stores buyer mortgage applications in localStorage.
// Keyed by buyer email so the advisor portal can look them up.

export type MortgageType = "single" | "joint";
export type Relationship = "spouse" | "civil_partner" | "partner" | "family" | "friend";
export type EmploymentStatus = "employed" | "self_employed" | "contractor" | "director" | "retired" | "not_employed";
export type ImmigrationStatus = "ilr" | "work_visa" | "student_visa" | "eu_settled" | "other";
export type PropertyType = "terraced_house" | "semi_detached" | "detached" | "flat" | "maisonette" | "bungalow" | "new_build" | "other";
export type Tenure = "freehold" | "leasehold" | "unknown";
export type DepositSource = "savings" | "gift_family" | "equity_sale" | "help_to_buy" | "mixed" | "other";

export type Address = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  fromMonth: string; // YYYY-MM
  toMonth: string;   // YYYY-MM or "present"
};

export type Applicant = {
  // Personal
  fullName: string;
  dateOfBirth: string;       // YYYY-MM-DD
  niNumber: string;
  phone: string;
  email: string;
  maritalStatus: string;
  dependants: string;

  // Residency
  isUkCitizen: boolean | null;
  bornInUk: boolean | null;
  countryOfBirth: string;
  arrivalDate: string;       // YYYY-MM
  immigrationStatus: ImmigrationStatus | "";

  // Employment
  employmentStatus: EmploymentStatus | "";
  employerName: string;
  jobTitle: string;
  employmentStartDate: string; // YYYY-MM
  isPermanent: boolean | null;
  businessName: string;        // self-employed
  yearsTrading: string;

  // Income
  annualGrossSalary: string;
  annualBonus: string;
  otherIncome: string;
  otherIncomeSource: string;
};

export type FinancialProfile = {
  hasExistingMortgage: boolean;
  existingMortgageLender: string;
  existingMortgageBalance: string;
  existingMortgageMonthly: string;

  hasPersonalLoans: boolean;
  personalLoanBalance: string;
  personalLoanMonthly: string;

  hasCarFinance: boolean;
  carFinanceMonthly: string;

  hasCreditCards: boolean;
  creditCardBalance: string;
  creditCardMonthlyMin: string;

  hasStudentLoan: boolean;
  studentLoanMonthly: string;

  childcareCosts: string;
  councilTax: string;
  utilities: string;
  otherOutgoings: string;
};

export type PropertyDetails = {
  propertyAddress: string;
  purchasePrice: string;
  depositAmount: string;
  depositSource: DepositSource | "";
  propertyType: PropertyType | "";
  tenure: Tenure | "";
  isNewBuild: boolean;
};

export type MortgageApplication = {
  buyerEmail: string;
  submittedAt: string;
  status: "draft" | "submitted";

  mortgageType: MortgageType | "";
  relationship: Relationship | "";

  applicant1: Applicant;
  applicant2: Partial<Applicant>;

  addressHistory: Address[];     // applicant 1
  addressHistory2: Address[];    // applicant 2 (if joint)

  financial: FinancialProfile;
  financial2: Partial<FinancialProfile>; // applicant 2 if joint

  property: PropertyDetails;
};

export function blankApplicant(email = ""): Applicant {
  return {
    fullName: "", dateOfBirth: "", niNumber: "", phone: "", email,
    maritalStatus: "", dependants: "0",
    isUkCitizen: null, bornInUk: null, countryOfBirth: "", arrivalDate: "",
    immigrationStatus: "",
    employmentStatus: "", employerName: "", jobTitle: "", employmentStartDate: "",
    isPermanent: null, businessName: "", yearsTrading: "",
    annualGrossSalary: "", annualBonus: "", otherIncome: "", otherIncomeSource: "",
  };
}

export function blankFinancial(): FinancialProfile {
  return {
    hasExistingMortgage: false, existingMortgageLender: "", existingMortgageBalance: "", existingMortgageMonthly: "",
    hasPersonalLoans: false, personalLoanBalance: "", personalLoanMonthly: "",
    hasCarFinance: false, carFinanceMonthly: "",
    hasCreditCards: false, creditCardBalance: "", creditCardMonthlyMin: "",
    hasStudentLoan: false, studentLoanMonthly: "",
    childcareCosts: "", councilTax: "", utilities: "", otherOutgoings: "",
  };
}

export function blankApplication(email: string): MortgageApplication {
  return {
    buyerEmail: email,
    submittedAt: "",
    status: "draft",
    mortgageType: "",
    relationship: "",
    applicant1: blankApplicant(email),
    applicant2: {},
    addressHistory: [],
    addressHistory2: [],
    financial: blankFinancial(),
    financial2: {},
    property: {
      propertyAddress: "", purchasePrice: "", depositAmount: "",
      depositSource: "", propertyType: "", tenure: "", isNewBuild: false,
    },
  };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const APPS_KEY = "clinksy_mortgage_apps_v1";

type AppsStore = Record<string, MortgageApplication>;

function loadAll(): AppsStore {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    return raw ? (JSON.parse(raw) as AppsStore) : {};
  } catch { return {}; }
}

export function getApplication(email: string): MortgageApplication | null {
  if (typeof window === "undefined") return null;
  return loadAll()[email.toLowerCase()] ?? null;
}

export function saveApplication(app: MortgageApplication): void {
  if (typeof window === "undefined") return;
  const all = loadAll();
  all[app.buyerEmail.toLowerCase()] = app;
  try { localStorage.setItem(APPS_KEY, JSON.stringify(all)); } catch {}
}

export function getAllApplications(): MortgageApplication[] {
  if (typeof window === "undefined") return [];
  return Object.values(loadAll());
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export const EMPLOYMENT_LABEL: Record<EmploymentStatus, string> = {
  employed: "Employed (PAYE)",
  self_employed: "Self-employed",
  contractor: "Contractor",
  director: "Company director",
  retired: "Retired",
  not_employed: "Not currently employed",
};

export const IMMIGRATION_LABEL: Record<ImmigrationStatus, string> = {
  ilr: "Indefinite Leave to Remain",
  work_visa: "Work visa",
  student_visa: "Student visa",
  eu_settled: "EU Settled Status",
  other: "Other",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  terraced_house: "Terraced house",
  semi_detached: "Semi-detached house",
  detached: "Detached house",
  flat: "Flat / apartment",
  maisonette: "Maisonette",
  bungalow: "Bungalow",
  new_build: "New build",
  other: "Other",
};

export const DEPOSIT_SOURCE_LABEL: Record<DepositSource, string> = {
  savings: "Personal savings",
  gift_family: "Gift from family",
  equity_sale: "Equity from property sale",
  help_to_buy: "Help to Buy / Lifetime ISA",
  mixed: "Mixed sources",
  other: "Other",
};
