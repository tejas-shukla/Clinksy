"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/user-store";
import {
  blankApplication, blankApplicant, blankFinancial,
  saveApplication, getApplication,
  type MortgageApplication, type Address, type Applicant,
  EMPLOYMENT_LABEL, PROPERTY_TYPE_LABEL, DEPOSIT_SOURCE_LABEL,
} from "@/lib/mortgage-application-store";

const TOTAL_STEPS = 9;

export default function MortgageApplicationPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState(1);
  const [app, setApp] = useState<MortgageApplication | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Load or initialise application once user is known
  useEffect(() => {
    if (!isLoaded) return;
    const email = user?.email ?? "guest@clinkeys.com";
    const existing = getApplication(email);
    if (existing) {
      setApp(existing);
      if (existing.status === "submitted") setSubmitted(true);
    } else {
      setApp(blankApplication(email));
    }
  }, [isLoaded, user]);

  function patch(partial: Partial<MortgageApplication>) {
    setApp((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      saveApplication(next);
      return next;
    });
  }

  function patchA1(partial: Partial<Applicant>) {
    setApp((prev) => {
      if (!prev) return prev;
      const next = { ...prev, applicant1: { ...prev.applicant1, ...partial } };
      saveApplication(next);
      return next;
    });
  }

  function patchA2(partial: Partial<Applicant>) {
    setApp((prev) => {
      if (!prev) return prev;
      const next = { ...prev, applicant2: { ...prev.applicant2, ...partial } };
      saveApplication(next);
      return next;
    });
  }

  function handleSubmit() {
    if (!app) return;
    const final = { ...app, status: "submitted" as const, submittedAt: new Date().toISOString() };
    saveApplication(final);
    setApp(final);
    setSubmitted(true);
  }

  const isJoint = app?.mortgageType === "joint";

  if (!isLoaded || !app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  if (submitted) {
    return <SuccessView onPortal={() => router.push("/mortgage-portal")} />;
  }

  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <header className="border-b border-ink/10">
        <div className="container-narrow flex items-center justify-between py-4">
          <Link href="/" className="font-serif text-2xl tracking-tightish text-ink">
            Clinkeys
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-ink/50">
              Step <span className="font-medium text-ink">{step}</span> of {TOTAL_STEPS}
            </p>
            <Link href="/mortgage-portal" className="text-xs text-ink/40 hover:text-ink/70">
              Save &amp; exit
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-ink/8">
          <div
            className="h-full bg-accent-400 transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </header>

      <main className="container-narrow py-10 sm:py-14">
        {step === 1 && <Step1Type app={app} patch={patch} onNext={() => setStep(2)} />}
        {step === 2 && <Step2Personal app={app} patchA1={patchA1} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3Residency app={app} patchA1={patchA1} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4Addresses app={app} patch={patch} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
        {step === 5 && <Step5Employment app={app} patchA1={patchA1} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
        {step === 6 && <Step6Income app={app} patchA1={patchA1} onNext={() => setStep(7)} onBack={() => setStep(5)} />}
        {step === 7 && <Step7Financial app={app} patch={patch} onNext={() => setStep(8)} onBack={() => setStep(6)} />}
        {step === 8 && <Step8Property app={app} patch={patch} onNext={() => setStep(isJoint ? 8.5 as unknown as number : 9)} onBack={() => setStep(7)} />}
        {(step as number) === 8.5 && isJoint && <Step8bJointApplicant app={app} patchA2={patchA2} onNext={() => setStep(9)} onBack={() => setStep(8)} />}
        {step === 9 && <StepReview app={app} onBack={() => setStep(isJoint ? 8.5 as unknown as number : 8)} onSubmit={handleSubmit} />}
      </main>
    </div>
  );
}

// ─── Step 1: Mortgage Type ────────────────────────────────────────────────────

function Step1Type({ app, patch, onNext }: { app: MortgageApplication; patch: (p: Partial<MortgageApplication>) => void; onNext: () => void }) {
  return (
    <StepLayout eyebrow="Step 1 of 9" title="What type of mortgage are you applying for?">
      <div className="space-y-3">
        <OptionCard
          active={app.mortgageType === "single"}
          onClick={() => patch({ mortgageType: "single", relationship: "" })}
          title="Single applicant"
          sub="Just you on the mortgage."
        />
        <OptionCard
          active={app.mortgageType === "joint"}
          onClick={() => patch({ mortgageType: "joint" })}
          title="Joint applicant"
          sub="Two people on the mortgage — partner, family member, or friend."
        />
      </div>

      {app.mortgageType === "joint" && (
        <div className="mt-6">
          <Label>Relationship to second applicant</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {([
              ["spouse", "Spouse"],
              ["civil_partner", "Civil partner"],
              ["partner", "Partner"],
              ["family", "Family member"],
              ["friend", "Friend"],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => patch({ relationship: val })}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  app.relationship === val
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 text-ink/70 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <NavRow
        onNext={onNext}
        nextDisabled={!app.mortgageType || (app.mortgageType === "joint" && !app.relationship)}
      />
    </StepLayout>
  );
}

// ─── Step 2: Personal Details ─────────────────────────────────────────────────

function Step2Personal({ app, patchA1, onNext, onBack }: StepProps) {
  const a = app.applicant1;
  return (
    <StepLayout eyebrow="Step 2 of 9" title="Your personal details">
      <div className="space-y-5">
        <TextField label="Full legal name" value={a.fullName} onChange={(v) => patchA1!({ fullName: v })} placeholder="As it appears on your passport" />
        <TextField label="Date of birth" type="date" value={a.dateOfBirth} onChange={(v) => patchA1!({ dateOfBirth: v })} />
        <TextField label="National Insurance number" value={a.niNumber} onChange={(v) => patchA1!({ niNumber: v })} placeholder="e.g. AB 12 34 56 C" />
        <TextField label="Phone number" type="tel" value={a.phone} onChange={(v) => patchA1!({ phone: v })} placeholder="+44 7700 000000" />
        <div>
          <Label>Marital status</Label>
          <SelectField
            value={a.maritalStatus}
            onChange={(v) => patchA1!({ maritalStatus: v })}
            options={[
              ["", "Select…"],
              ["single", "Single"],
              ["married", "Married"],
              ["civil_partner", "Civil partnership"],
              ["separated", "Separated"],
              ["divorced", "Divorced"],
              ["widowed", "Widowed"],
            ]}
          />
        </div>
        <div>
          <Label>Number of financial dependants</Label>
          <SelectField
            value={a.dependants}
            onChange={(v) => patchA1!({ dependants: v })}
            options={[["0","None"],["1","1"],["2","2"],["3","3"],["4","4 or more"]]}
          />
        </div>
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!a.fullName || !a.dateOfBirth || !a.niNumber || !a.phone} />
    </StepLayout>
  );
}

// ─── Step 3: Nationality & Residency ─────────────────────────────────────────

function Step3Residency({ app, patchA1, onNext, onBack }: StepProps) {
  const a = app.applicant1;
  return (
    <StepLayout eyebrow="Step 3 of 9" title="Nationality & right to reside">
      <div className="space-y-6">
        <YesNoField
          label="Are you a UK citizen?"
          value={a.isUkCitizen}
          onChange={(v) => patchA1!({ isUkCitizen: v })}
        />
        <YesNoField
          label="Were you born in the UK?"
          value={a.bornInUk}
          onChange={(v) => patchA1!({ bornInUk: v })}
        />

        {a.bornInUk === false && (
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">Non-UK born details</p>
            <TextField label="Country of birth" value={a.countryOfBirth} onChange={(v) => patchA1!({ countryOfBirth: v })} placeholder="e.g. India" />
            <TextField label="Date arrived in UK" type="month" value={a.arrivalDate} onChange={(v) => patchA1!({ arrivalDate: v })} />
          </div>
        )}

        {a.isUkCitizen === false && (
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">Immigration status</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {([
                ["ilr", "Indefinite Leave to Remain"],
                ["eu_settled", "EU Settled Status"],
                ["work_visa", "Work visa"],
                ["student_visa", "Student visa"],
                ["other", "Other"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => patchA1!({ immigrationStatus: val })}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    a.immigrationStatus === val
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/15 text-ink/70 hover:border-ink/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <NavRow
        onNext={onNext}
        onBack={onBack}
        nextDisabled={a.isUkCitizen === null || a.bornInUk === null}
      />
    </StepLayout>
  );
}

// ─── Step 4: Address History ──────────────────────────────────────────────────

function Step4Addresses({ app, patch, onNext, onBack }: StepProps) {
  const addresses = app.addressHistory;

  function addAddress() {
    patch!({
      addressHistory: [
        ...addresses,
        { line1: "", line2: "", city: "", postcode: "", fromMonth: "", toMonth: addresses.length === 0 ? "present" : "" },
      ],
    });
  }

  function updateAddress(idx: number, partial: Partial<Address>) {
    const next = addresses.map((a, i) => (i === idx ? { ...a, ...partial } : a));
    patch!({ addressHistory: next });
  }

  function removeAddress(idx: number) {
    patch!({ addressHistory: addresses.filter((_, i) => i !== idx) });
  }

  const hasEnough = addresses.length > 0 && addresses[0].line1 && addresses[0].postcode;

  return (
    <StepLayout eyebrow="Step 4 of 9" title={<>Address history<br /><span className="text-accent-400">last 5 years</span></>}>
      <p className="text-sm text-ink/55 -mt-4 mb-6">Add all addresses you have lived at in the past 5 years, starting with your current address.</p>

      {addresses.length === 0 && (
        <p className="mb-4 text-sm text-ink/40 italic">No addresses added yet.</p>
      )}

      <div className="space-y-4">
        {addresses.map((addr, idx) => (
          <div key={idx} className="rounded-2xl border border-ink/10 bg-bone-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
                {idx === 0 ? "Current address" : `Previous address ${idx}`}
              </p>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeAddress(idx)}
                  className="text-xs text-ink/35 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="space-y-3">
              <TextField label="Address line 1" value={addr.line1} onChange={(v) => updateAddress(idx, { line1: v })} placeholder="House number and street" />
              <TextField label="Address line 2 (optional)" value={addr.line2} onChange={(v) => updateAddress(idx, { line2: v })} placeholder="Flat, building, etc." />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="City / Town" value={addr.city} onChange={(v) => updateAddress(idx, { city: v })} />
                <TextField label="Postcode" value={addr.postcode} onChange={(v) => updateAddress(idx, { postcode: v })} placeholder="e.g. SW1A 1AA" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="From (month/year)" type="month" value={addr.fromMonth} onChange={(v) => updateAddress(idx, { fromMonth: v })} />
                {idx === 0 ? (
                  <div>
                    <Label>To</Label>
                    <p className="mt-2 text-sm text-ink/60">Present</p>
                  </div>
                ) : (
                  <TextField label="To (month/year)" type="month" value={addr.toMonth} onChange={(v) => updateAddress(idx, { toMonth: v })} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addAddress}
        className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-ink/20 px-4 py-3 text-sm text-ink/55 hover:border-ink/40 hover:text-ink/75 transition-colors"
      >
        <span className="text-lg leading-none">+</span>
        {addresses.length === 0 ? "Add your current address" : "Add previous address"}
      </button>

      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!hasEnough} />
    </StepLayout>
  );
}

// ─── Step 5: Employment ───────────────────────────────────────────────────────

function Step5Employment({ app, patchA1, onNext, onBack }: StepProps) {
  const a = app.applicant1;
  const isEmployed = a.employmentStatus === "employed" || a.employmentStatus === "director";
  const isSelfEmployed = a.employmentStatus === "self_employed" || a.employmentStatus === "contractor";

  return (
    <StepLayout eyebrow="Step 5 of 9" title="Employment">
      <div className="space-y-5">
        <div>
          <Label>Employment status</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.entries(EMPLOYMENT_LABEL) as [keyof typeof EMPLOYMENT_LABEL, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => patchA1!({ employmentStatus: val })}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  a.employmentStatus === val
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 text-ink/70 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isEmployed && (
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Employer details</p>
            <TextField label="Employer name" value={a.employerName} onChange={(v) => patchA1!({ employerName: v })} />
            <TextField label="Job title" value={a.jobTitle} onChange={(v) => patchA1!({ jobTitle: v })} />
            <TextField label="Employment start date" type="month" value={a.employmentStartDate} onChange={(v) => patchA1!({ employmentStartDate: v })} />
            <div>
              <Label>Contract type</Label>
              <div className="mt-2 flex gap-2">
                {([
                  [true, "Permanent"],
                  [false, "Fixed term / temporary"],
                ] as const).map(([val, label]) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => patchA1!({ isPermanent: val })}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      a.isPermanent === val
                        ? "border-ink bg-ink text-bone"
                        : "border-ink/15 text-ink/70 hover:border-ink/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isSelfEmployed && (
          <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Self-employment details</p>
            <TextField label="Business / trading name" value={a.businessName} onChange={(v) => patchA1!({ businessName: v })} />
            <TextField label="Years trading" type="number" value={a.yearsTrading} onChange={(v) => patchA1!({ yearsTrading: v })} placeholder="e.g. 3" />
          </div>
        )}
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!a.employmentStatus} />
    </StepLayout>
  );
}

// ─── Step 6: Income ───────────────────────────────────────────────────────────

function Step6Income({ app, patchA1, onNext, onBack }: StepProps) {
  const a = app.applicant1;
  return (
    <StepLayout eyebrow="Step 6 of 9" title="Income">
      <div className="space-y-5">
        <CurrencyField
          label="Annual gross salary / income"
          value={a.annualGrossSalary}
          onChange={(v) => patchA1!({ annualGrossSalary: v })}
          hint="Before tax. Use your average if it varies."
        />
        <CurrencyField
          label="Annual bonus (if any)"
          value={a.annualBonus}
          onChange={(v) => patchA1!({ annualBonus: v })}
          hint="Average over last 3 years. Leave blank if none."
        />
        <CurrencyField
          label="Other income (annual)"
          value={a.otherIncome}
          onChange={(v) => patchA1!({ otherIncome: v })}
          hint="Rental income, dividends, maintenance payments, etc."
        />
        {a.otherIncome && Number(a.otherIncome.replace(/,/g, "")) > 0 && (
          <TextField
            label="Source of other income"
            value={a.otherIncomeSource}
            onChange={(v) => patchA1!({ otherIncomeSource: v })}
            placeholder="e.g. Rental property"
          />
        )}
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!a.annualGrossSalary} />
    </StepLayout>
  );
}

// ─── Step 7: Financial Commitments ───────────────────────────────────────────

function Step7Financial({ app, patch, onNext, onBack }: StepProps) {
  const f = app.financial;

  function pf(partial: Partial<typeof f>) {
    patch!({ financial: { ...f, ...partial } });
  }

  return (
    <StepLayout eyebrow="Step 7 of 9" title={<>Financial history<br />&amp; outgoings</>}>
      <div className="space-y-5">

        {/* Existing mortgage */}
        <CommitmentBlock
          label="Do you have an existing mortgage?"
          hint="On another property you own"
          active={f.hasExistingMortgage}
          onToggle={(v) => pf({ hasExistingMortgage: v })}
        >
          <CurrencyField label="Lender name" value={f.existingMortgageLender} onChange={(v) => pf({ existingMortgageLender: v })} isCurrency={false} />
          <CurrencyField label="Outstanding balance" value={f.existingMortgageBalance} onChange={(v) => pf({ existingMortgageBalance: v })} />
          <CurrencyField label="Monthly payment" value={f.existingMortgageMonthly} onChange={(v) => pf({ existingMortgageMonthly: v })} />
        </CommitmentBlock>

        {/* Personal loans */}
        <CommitmentBlock
          label="Personal loans or credit agreements?"
          hint="Including buy-now-pay-later schemes"
          active={f.hasPersonalLoans}
          onToggle={(v) => pf({ hasPersonalLoans: v })}
        >
          <CurrencyField label="Total outstanding balance" value={f.personalLoanBalance} onChange={(v) => pf({ personalLoanBalance: v })} />
          <CurrencyField label="Total monthly payment" value={f.personalLoanMonthly} onChange={(v) => pf({ personalLoanMonthly: v })} />
        </CommitmentBlock>

        {/* Car finance */}
        <CommitmentBlock
          label="Car finance or hire purchase?"
          active={f.hasCarFinance}
          onToggle={(v) => pf({ hasCarFinance: v })}
        >
          <CurrencyField label="Monthly payment" value={f.carFinanceMonthly} onChange={(v) => pf({ carFinanceMonthly: v })} />
        </CommitmentBlock>

        {/* Credit cards */}
        <CommitmentBlock
          label="Credit cards?"
          hint="Include store cards and charge cards"
          active={f.hasCreditCards}
          onToggle={(v) => pf({ hasCreditCards: v })}
        >
          <CurrencyField label="Total balance across all cards" value={f.creditCardBalance} onChange={(v) => pf({ creditCardBalance: v })} />
          <CurrencyField label="Total monthly minimum payment" value={f.creditCardMonthlyMin} onChange={(v) => pf({ creditCardMonthlyMin: v })} />
        </CommitmentBlock>

        {/* Student loan */}
        <CommitmentBlock
          label="Student loan?"
          active={f.hasStudentLoan}
          onToggle={(v) => pf({ hasStudentLoan: v })}
        >
          <CurrencyField label="Monthly repayment" value={f.studentLoanMonthly} onChange={(v) => pf({ studentLoanMonthly: v })} />
        </CommitmentBlock>

        {/* Mandatory outgoings */}
        <div className="rounded-2xl border border-ink/10 bg-bone-50 p-5 space-y-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">Monthly outgoings</p>
          <CurrencyField label="Childcare" value={f.childcareCosts} onChange={(v) => pf({ childcareCosts: v })} hint="Nursery, childminder, after-school care" />
          <CurrencyField label="Council tax" value={f.councilTax} onChange={(v) => pf({ councilTax: v })} />
          <CurrencyField label="Utilities (gas, electricity, water)" value={f.utilities} onChange={(v) => pf({ utilities: v })} />
          <CurrencyField label="Other regular outgoings" value={f.otherOutgoings} onChange={(v) => pf({ otherOutgoings: v })} hint="Insurance, subscriptions, etc." />
        </div>
      </div>
      <NavRow onNext={onNext} onBack={onBack} />
    </StepLayout>
  );
}

// ─── Step 8: Property Details ─────────────────────────────────────────────────

function Step8Property({ app, patch, onNext, onBack }: StepProps) {
  const p = app.property;
  function pp(partial: Partial<typeof p>) {
    patch!({ property: { ...p, ...partial } });
  }

  return (
    <StepLayout eyebrow="Step 8 of 9" title="Property details">
      <div className="space-y-5">
        <TextField label="Property address (if known)" value={p.propertyAddress} onChange={(v) => pp({ propertyAddress: v })} placeholder="e.g. 12 Oak Lane, London, E1 6RF" />
        <CurrencyField label="Purchase price" value={p.purchasePrice} onChange={(v) => pp({ purchasePrice: v })} hint="Or your target budget if not yet agreed" />
        <CurrencyField label="Deposit amount" value={p.depositAmount} onChange={(v) => pp({ depositAmount: v })} />

        <div>
          <Label>Source of deposit</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.entries(DEPOSIT_SOURCE_LABEL) as [string, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => pp({ depositSource: val as typeof p.depositSource })}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  p.depositSource === val
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 text-ink/70 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Property type</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.entries(PROPERTY_TYPE_LABEL) as [string, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => pp({ propertyType: val as typeof p.propertyType })}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  p.propertyType === val
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 text-ink/70 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Tenure</Label>
          <div className="mt-2 flex gap-2">
            {([["freehold", "Freehold"], ["leasehold", "Leasehold"], ["unknown", "Not yet known"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => pp({ tenure: val })}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  p.tenure === val
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 text-ink/70 hover:border-ink/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!p.purchasePrice || !p.depositAmount} />
    </StepLayout>
  );
}

// ─── Step 8b: Joint Applicant ─────────────────────────────────────────────────

function Step8bJointApplicant({ app, patchA2, onNext, onBack }: StepProps) {
  const a2 = app.applicant2 as Partial<Applicant>;
  const blankA2 = blankApplicant();

  function set(partial: Partial<Applicant>) {
    patchA2!(partial);
  }

  const a = { ...blankA2, ...a2 };

  return (
    <StepLayout eyebrow="Step 8b of 9" title={<>Second applicant<br /><span className="text-accent-400">details</span></>}>
      <p className="text-sm text-ink/55 -mt-4 mb-6">Key details for the second person on the mortgage.</p>
      <div className="space-y-5">
        <TextField label="Full legal name" value={a.fullName} onChange={(v) => set({ fullName: v })} />
        <TextField label="Date of birth" type="date" value={a.dateOfBirth} onChange={(v) => set({ dateOfBirth: v })} />
        <TextField label="National Insurance number" value={a.niNumber} onChange={(v) => set({ niNumber: v })} />
        <TextField label="Email address" type="email" value={a.email} onChange={(v) => set({ email: v })} />
        <YesNoField label="UK citizen?" value={a.isUkCitizen ?? null} onChange={(v) => set({ isUkCitizen: v })} />
        {a.isUkCitizen === false && (
          <TextField label="Date arrived in UK" type="month" value={a.arrivalDate} onChange={(v) => set({ arrivalDate: v })} />
        )}
        <div>
          <Label>Employment status</Label>
          <SelectField
            value={a.employmentStatus ?? ""}
            onChange={(v) => set({ employmentStatus: v as Applicant["employmentStatus"] })}
            options={[["", "Select…"], ...Object.entries(EMPLOYMENT_LABEL)]}
          />
        </div>
        <CurrencyField label="Annual gross income" value={a.annualGrossSalary} onChange={(v) => set({ annualGrossSalary: v })} />
      </div>
      <NavRow onNext={onNext} onBack={onBack} nextDisabled={!a.fullName || !a.dateOfBirth} />
    </StepLayout>
  );
}

// ─── Step 9: Review & Submit ──────────────────────────────────────────────────

function StepReview({ app, onBack, onSubmit }: { app: MortgageApplication; onBack: () => void; onSubmit: () => void }) {
  const a = app.applicant1;
  const p = app.property;
  const f = app.financial;

  return (
    <StepLayout eyebrow="Step 9 of 9" title={<>Review &amp; submit</>}>
      <p className="text-sm text-ink/55 -mt-4 mb-6">
        Check everything looks right before submitting to your mortgage advisor.
      </p>

      <div className="space-y-4">
        <ReviewSection title="Mortgage type">
          <ReviewRow label="Type" value={app.mortgageType === "joint" ? `Joint (${app.relationship})` : "Single applicant"} />
        </ReviewSection>

        <ReviewSection title="Personal details">
          <ReviewRow label="Name" value={a.fullName} />
          <ReviewRow label="Date of birth" value={a.dateOfBirth} />
          <ReviewRow label="NI number" value={a.niNumber} />
          <ReviewRow label="Phone" value={a.phone} />
          <ReviewRow label="Marital status" value={a.maritalStatus} />
          <ReviewRow label="Dependants" value={a.dependants} />
        </ReviewSection>

        <ReviewSection title="Residency">
          <ReviewRow label="UK citizen" value={a.isUkCitizen === true ? "Yes" : a.isUkCitizen === false ? "No" : "—"} />
          <ReviewRow label="Born in UK" value={a.bornInUk === true ? "Yes" : a.bornInUk === false ? "No" : "—"} />
          {a.bornInUk === false && <ReviewRow label="Country of birth" value={a.countryOfBirth} />}
          {a.bornInUk === false && <ReviewRow label="Arrived in UK" value={a.arrivalDate} />}
          {a.isUkCitizen === false && <ReviewRow label="Immigration status" value={a.immigrationStatus} />}
        </ReviewSection>

        <ReviewSection title="Address history">
          {app.addressHistory.length === 0 ? (
            <p className="text-sm text-ink/40 italic">No addresses added</p>
          ) : (
            app.addressHistory.map((addr, i) => (
              <ReviewRow
                key={i}
                label={i === 0 ? "Current" : `Previous ${i}`}
                value={[addr.line1, addr.city, addr.postcode].filter(Boolean).join(", ")}
              />
            ))
          )}
        </ReviewSection>

        <ReviewSection title="Employment">
          <ReviewRow label="Status" value={a.employmentStatus ? EMPLOYMENT_LABEL[a.employmentStatus] : "—"} />
          {a.employerName && <ReviewRow label="Employer" value={a.employerName} />}
          {a.jobTitle && <ReviewRow label="Job title" value={a.jobTitle} />}
          {a.businessName && <ReviewRow label="Business name" value={a.businessName} />}
        </ReviewSection>

        <ReviewSection title="Income">
          <ReviewRow label="Annual gross income" value={a.annualGrossSalary ? `£${a.annualGrossSalary}` : "—"} />
          {a.annualBonus && <ReviewRow label="Annual bonus" value={`£${a.annualBonus}`} />}
          {a.otherIncome && <ReviewRow label="Other income" value={`£${a.otherIncome} (${a.otherIncomeSource})`} />}
        </ReviewSection>

        <ReviewSection title="Financial commitments">
          <ReviewRow label="Existing mortgage" value={f.hasExistingMortgage ? `Yes — £${f.existingMortgageMonthly}/mo` : "None"} />
          <ReviewRow label="Personal loans" value={f.hasPersonalLoans ? `Yes — £${f.personalLoanMonthly}/mo` : "None"} />
          <ReviewRow label="Car finance" value={f.hasCarFinance ? `£${f.carFinanceMonthly}/mo` : "None"} />
          <ReviewRow label="Credit cards" value={f.hasCreditCards ? `Balance £${f.creditCardBalance}, min £${f.creditCardMonthlyMin}/mo` : "None"} />
          <ReviewRow label="Student loan" value={f.hasStudentLoan ? `£${f.studentLoanMonthly}/mo` : "None"} />
          {f.councilTax && <ReviewRow label="Council tax" value={`£${f.councilTax}/mo`} />}
          {f.utilities && <ReviewRow label="Utilities" value={`£${f.utilities}/mo`} />}
          {f.childcareCosts && <ReviewRow label="Childcare" value={`£${f.childcareCosts}/mo`} />}
          {f.otherOutgoings && <ReviewRow label="Other outgoings" value={`£${f.otherOutgoings}/mo`} />}
        </ReviewSection>

        <ReviewSection title="Property">
          {p.propertyAddress && <ReviewRow label="Address" value={p.propertyAddress} />}
          <ReviewRow label="Purchase price" value={p.purchasePrice ? `£${p.purchasePrice}` : "—"} />
          <ReviewRow label="Deposit" value={p.depositAmount ? `£${p.depositAmount}` : "—"} />
          <ReviewRow label="Deposit source" value={p.depositSource ? DEPOSIT_SOURCE_LABEL[p.depositSource] : "—"} />
          <ReviewRow label="Property type" value={p.propertyType ? PROPERTY_TYPE_LABEL[p.propertyType] : "—"} />
          <ReviewRow label="Tenure" value={p.tenure || "—"} />
        </ReviewSection>

        {app.mortgageType === "joint" && app.applicant2.fullName && (
          <ReviewSection title="Second applicant">
            <ReviewRow label="Name" value={app.applicant2.fullName ?? "—"} />
            <ReviewRow label="DOB" value={app.applicant2.dateOfBirth ?? "—"} />
            <ReviewRow label="Income" value={app.applicant2.annualGrossSalary ? `£${app.applicant2.annualGrossSalary}` : "—"} />
          </ReviewSection>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-bone-50 p-5">
        <p className="text-sm text-ink/65 leading-relaxed">
          By submitting this form, you confirm the information is accurate to the best of your knowledge. Your advisor will review the details and may request further information. Nothing submitted here constitutes a formal mortgage application.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onSubmit} className="btn-solid">
          Submit to my advisor →
        </button>
        <button type="button" onClick={onBack} className="text-sm text-ink/55 underline-offset-2 hover:underline">
          ← Back to review
        </button>
      </div>
    </StepLayout>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessView({ onPortal }: { onPortal: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-3xl">
        ✅
      </div>
      <h1 className="font-serif text-3xl text-ink">Application submitted</h1>
      <p className="mt-3 max-w-sm text-base text-ink/60 leading-relaxed">
        Your mortgage advisor can now see your full application. Upload your supporting documents to complete your file.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onPortal} className="btn-solid">
          Go to document portal →
        </button>
        <Link href="/dashboard" className="btn-ghost">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Shared types ─────────────────────────────────────────────────────────────

type StepProps = {
  app: MortgageApplication;
  patch?: (p: Partial<MortgageApplication>) => void;
  patchA1?: (p: Partial<Applicant>) => void;
  patchA2?: (p: Partial<Applicant>) => void;
  onNext: () => void;
  onBack: () => void;
};

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function StepLayout({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-[32px] leading-tight tracking-tightish text-ink sm:text-[42px]">
        {title}
      </h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function NavRow({ onNext, onBack, nextDisabled, nextLabel = "Continue →" }: {
  onNext: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-solid disabled:opacity-40"
      >
        {nextLabel}
      </button>
      {onBack && (
        <button type="button" onClick={onBack} className="text-sm text-ink/55 underline-offset-2 hover:underline">
          ← Back
        </button>
      )}
    </div>
  );
}

function OptionCard({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
        active ? "border-ink bg-bone-50" : "border-ink/10 hover:border-ink/30"
      }`}
    >
      <span
        className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
          active ? "border-ink bg-ink" : "border-ink/30"
        }`}
      >
        {active && <span className="block h-2 w-2 rounded-full bg-bone" />}
      </span>
      <span>
        <span className="block font-serif text-xl text-ink">{title}</span>
        {sub && <span className="mt-1 block text-sm text-ink/55">{sub}</span>}
      </span>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">{children}</p>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text", hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">{label}</span>
      {hint && <span className="block mt-0.5 text-[12px] text-ink/40">{hint}</span>}
      <span className="mt-1.5 block border-b border-ink/15 focus-within:border-ink/40">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2 text-base text-ink placeholder:text-ink/30 focus:outline-none"
        />
      </span>
    </label>
  );
}

function CurrencyField({ label, value, onChange, hint, isCurrency = true }: {
  label: string; value: string; onChange: (v: string) => void;
  hint?: string; isCurrency?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">{label}</span>
      {hint && <span className="block mt-0.5 text-[12px] text-ink/40">{hint}</span>}
      <span className="mt-1.5 flex items-center gap-2 border-b border-ink/15 focus-within:border-ink/40">
        {isCurrency && <span className="text-ink/40 text-base">£</span>}
        <input
          type={isCurrency ? "number" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          className="w-full bg-transparent py-2 text-base text-ink placeholder:text-ink/30 focus:outline-none"
        />
      </span>
    </label>
  );
}

function SelectField({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 w-full border-b border-ink/15 bg-transparent py-2 text-base text-ink focus:outline-none"
    >
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function YesNoField({ label, value, onChange }: {
  label: string; value: boolean | null; onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-2">
        {([true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-xl border px-6 py-2.5 text-sm transition-colors ${
              value === v
                ? "border-ink bg-ink text-bone"
                : "border-ink/15 text-ink/70 hover:border-ink/30"
            }`}
          >
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function CommitmentBlock({ label, hint, active, onToggle, children }: {
  label: string; hint?: string; active: boolean;
  onToggle: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-bone-50">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          {hint && <p className="text-[12px] text-ink/45">{hint}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => onToggle(v)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                active === v
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/15 text-ink/60 hover:border-ink/30"
              }`}
            >
              {v ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>
      {active && children && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-ink/8">
          {children}
        </div>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 overflow-hidden">
      <div className="border-b border-ink/8 bg-bone-50 px-4 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">{title}</p>
      </div>
      <div className="divide-y divide-ink/6 px-4">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <p className="text-[13px] text-ink/50 shrink-0">{label}</p>
      <p className="text-[13px] text-ink text-right">{value}</p>
    </div>
  );
}
