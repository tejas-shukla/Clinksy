"use client";

// DocumentsPanel — stage-aware, profile-aware document hub.
// First-time users complete a 2-step profile wizard (employment type + ownership).
// Shows ONLY docs relevant to the current stage that haven't been uploaded yet.
// Shares localStorage store with /mortgage-portal.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ─── Buyer profile ────────────────────────────────────────────────────────────

type EmploymentType = "employed" | "self_employed" | "director" | "contractor";
type Ownership = "solo" | "joint";

type BuyerProfile = {
  employmentType: EmploymentType;
  ownership: Ownership;
};

const PROFILE_KEY = "clinkeys_buyer_profile_v1";

function loadProfile(): BuyerProfile | null {
  try {
    const r = localStorage.getItem(PROFILE_KEY);
    return r ? (JSON.parse(r) as BuyerProfile) : null;
  } catch { return null; }
}
function saveProfile(p: BuyerProfile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

const EMP_LABELS: Record<EmploymentType, { label: string; desc: string }> = {
  employed:     { label: "Employed",      desc: "PAYE / salaried" },
  self_employed:{ label: "Self-Employed", desc: "Sole trader" },
  director:     { label: "Director",      desc: "Ltd company" },
  contractor:   { label: "Contractor",    desc: "Day-rate / CIS" },
};

// ─── Shared document store (synced with /mortgage-portal) ────────────────────

const PORTAL_KEY = "clinkeys_portal_v1";

type DocStatus = "not_started" | "uploaded" | "under_review" | "approved" | "needs_action";
type UploadedFile = { name: string; sizeKb: number; uploadedAt: string };
type Message     = { from: "buyer" | "advisor"; text: string; sentAt: string };
type DocRecord   = { status: DocStatus; file?: UploadedFile; messages: Message[] };
type PortalStore = { docs: Record<string, DocRecord> };

function loadPortal(): PortalStore {
  try { const r = localStorage.getItem(PORTAL_KEY); if (r) return JSON.parse(r); } catch {}
  return { docs: {} };
}
function savePortal(data: PortalStore) {
  try { localStorage.setItem(PORTAL_KEY, JSON.stringify(data)); } catch {}
}
function getDoc(store: PortalStore, id: string): DocRecord {
  return store.docs[id] ?? { status: "not_started", messages: [] };
}

// ─── Document definitions ─────────────────────────────────────────────────────

type DocDef = {
  id: string;
  label: string;
  desc: string;
  required: boolean;
  sectionId: string;
  stages: number[];
  employmentTypes: EmploymentType[] | "all";
};

const ALL_DOCS: DocDef[] = [
  // ── Identity ──────────────────────────────────────────────────────────────
  {
    id: "photo_id",
    label: "Photo ID",
    desc: "Passport or full UK driving licence",
    required: true,
    sectionId: "identity",
    stages: [1, 4, 5],
    employmentTypes: "all",
  },
  {
    id: "proof_address_1",
    label: "Proof of address",
    desc: "Utility bill, bank statement or council tax bill — dated within 3 months",
    required: true,
    sectionId: "identity",
    stages: [1, 3, 4, 5],
    employmentTypes: "all",
  },
  {
    id: "proof_address_2",
    label: "Second proof of address",
    desc: "A different document from a different provider — same 3-month requirement",
    required: true,
    sectionId: "identity",
    stages: [4, 5],
    employmentTypes: "all",
  },

  // ── Employed income ───────────────────────────────────────────────────────
  {
    id: "payslips",
    label: "Last 3 months' payslips",
    desc: "From your current employer — must show gross pay, tax, and NI",
    required: true,
    sectionId: "income",
    stages: [1, 4],
    employmentTypes: ["employed", "director"],
  },
  {
    id: "p60",
    label: "Most recent P60",
    desc: "End-of-year tax summary from your employer — issued each April",
    required: true,
    sectionId: "income",
    stages: [1, 4],
    employmentTypes: ["employed", "director"],
  },
  {
    id: "employment_letter",
    label: "Employer reference letter",
    desc: "Required only if you have been in your role for less than 6 months",
    required: false,
    sectionId: "income",
    stages: [4],
    employmentTypes: ["employed"],
  },

  // ── Contractor income ─────────────────────────────────────────────────────
  {
    id: "contracts",
    label: "Current and previous contracts",
    desc: "Signed day-rate or fixed-term contracts covering at least 12 months",
    required: true,
    sectionId: "income",
    stages: [1, 4],
    employmentTypes: ["contractor"],
  },
  {
    id: "invoices",
    label: "12 months' invoices",
    desc: "Consecutive invoices showing regular day-rate income",
    required: true,
    sectionId: "income",
    stages: [1, 4],
    employmentTypes: ["contractor"],
  },

  // ── Self-employed / director income ───────────────────────────────────────
  {
    id: "sa302_1",
    label: "SA302 — most recent tax year",
    desc: "HMRC tax calculation for the most recently completed tax year",
    required: false,
    sectionId: "income_se",
    stages: [1, 4],
    employmentTypes: ["self_employed", "director", "contractor"],
  },
  {
    id: "sa302_2",
    label: "SA302 — previous tax year",
    desc: "Most lenders need two consecutive years of self-employed evidence",
    required: false,
    sectionId: "income_se",
    stages: [1, 4],
    employmentTypes: ["self_employed", "director", "contractor"],
  },
  {
    id: "tax_year_overview",
    label: "HMRC Tax Year Overview",
    desc: "Must match the dates shown on your SA302 documents exactly",
    required: false,
    sectionId: "income_se",
    stages: [1, 4],
    employmentTypes: ["self_employed", "director", "contractor"],
  },

  // ── Bank statements ───────────────────────────────────────────────────────
  {
    id: "bank_statements",
    label: "3 months' bank statements",
    desc: "Main current account showing income and regular outgoings",
    required: true,
    sectionId: "income",
    stages: [1, 4, 8],
    employmentTypes: "all",
  },

  // ── Deposit & savings ─────────────────────────────────────────────────────
  {
    id: "savings_statements",
    label: "Savings account statements",
    desc: "Showing the full deposit amount — last 3 months minimum",
    required: true,
    sectionId: "deposit",
    stages: [4, 8],
    employmentTypes: "all",
  },
  {
    id: "gift_letter",
    label: "Gifted deposit letter",
    desc: "Required if any portion of your deposit has been gifted by a family member",
    required: false,
    sectionId: "deposit",
    stages: [4],
    employmentTypes: "all",
  },

  // ── Property ──────────────────────────────────────────────────────────────
  {
    id: "memorandum_sale",
    label: "Memorandum of Sale",
    desc: "Issued by the estate agent once your offer is formally accepted",
    required: true,
    sectionId: "property",
    stages: [4, 5],
    employmentTypes: "all",
  },
  {
    id: "property_particulars",
    label: "Property particulars",
    desc: "Estate agent listing showing address, price, and property details",
    required: false,
    sectionId: "property",
    stages: [5, 6],
    employmentTypes: "all",
  },

  // ── Existing commitments (only at full application stage) ─────────────────
  {
    id: "loan_statements",
    label: "Loan / finance statements",
    desc: "Most recent statement for any personal loans, car finance, or HP",
    required: false,
    sectionId: "commitments",
    stages: [4],
    employmentTypes: "all",
  },
  {
    id: "credit_card_statements",
    label: "Credit card statements",
    desc: "Last 3 months — required if you regularly carry a balance",
    required: false,
    sectionId: "commitments",
    stages: [4],
    employmentTypes: "all",
  },
];

const SECTIONS = [
  { id: "identity",   title: "Identity & Address",              icon: "🪪" },
  { id: "income",     title: "Income & Employment",             icon: "💷" },
  { id: "income_se",  title: "Self-Employed / Director Income", icon: "📊", onlyFor: ["self_employed", "director", "contractor"] as EmploymentType[] },
  { id: "deposit",    title: "Deposit & Savings",               icon: "🏦" },
  { id: "property",   title: "Property Details",                icon: "🏡" },
  { id: "commitments",title: "Existing Commitments",            icon: "💳" },
];

const STAGE_CONTEXT: Partial<Record<number, string>> = {
  1:  "Your broker needs these to get you a Mortgage in Principle.",
  3:  "Estate agents run AML identity checks on all buyers.",
  4:  "Full underwriting — your lender will verify all of these before issuing a mortgage offer.",
  5:  "Your solicitor runs their own separate AML check.",
  6:  "Have the property details to hand for your surveyor.",
  8:  "Refresh your bank and savings statements — lenders want them within 3 months.",
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<DocStatus, string> = {
  not_started:  "Not uploaded",
  uploaded:     "Uploaded",
  under_review: "Under review",
  approved:     "Approved",
  needs_action: "Needs attention",
};

const STATUS_CHIP: Record<DocStatus, string> = {
  not_started:  "bg-ink/6 text-ink/40",
  uploaded:     "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-600",
  approved:     "bg-emerald-50 text-emerald-600",
  needs_action: "bg-red-50 text-red-500",
};

const STATUS_DOT: Record<DocStatus, string> = {
  not_started:  "bg-ink/15",
  uploaded:     "bg-blue-400",
  under_review: "bg-amber-400",
  approved:     "bg-emerald-400",
  needs_action: "bg-red-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocumentsPanel({ currentStageId }: { currentStageId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [store, setStore] = useState<PortalStore>({ docs: {} });
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setStore(loadPortal());
    setProfileLoaded(true);
  }, []);

  function applyProfile(p: BuyerProfile) {
    saveProfile(p);
    setProfile(p);
    setEditingProfile(false);
  }

  function updateDoc(id: string, patch: Partial<DocRecord>) {
    setStore((prev) => {
      const next: PortalStore = {
        docs: { ...prev.docs, [id]: { ...getDoc(prev, id), ...patch } },
      };
      savePortal(next);
      return next;
    });
  }

  function handleUpload(docId: string, file: File) {
    updateDoc(docId, {
      status: "uploaded",
      file: { name: file.name, sizeKb: Math.round(file.size / 1024), uploadedAt: new Date().toISOString() },
    });
  }

  function sendMessage(docId: string) {
    const text = (drafts[docId] ?? "").trim();
    if (!text) return;
    updateDoc(docId, {
      messages: [...getDoc(store, docId).messages, { from: "buyer", text, sentAt: new Date().toISOString() }],
    });
    setDrafts((d) => ({ ...d, [docId]: "" }));
  }

  if (!profileLoaded) return null;

  // Docs for this stage + employment type
  const empType = profile?.employmentType ?? "employed";
  const stageDocs = ALL_DOCS.filter(
    (d) =>
      d.stages.includes(currentStageId) &&
      (d.employmentTypes === "all" || d.employmentTypes.includes(empType)),
  );

  // Split into: still needed (not uploaded) vs done
  const pendingDocs = stageDocs.filter((d) => {
    const s = getDoc(store, d.id).status;
    return s === "not_started" || s === "needs_action";
  });
  const doneDocs = stageDocs.filter((d) => {
    const s = getDoc(store, d.id).status;
    return s === "uploaded" || s === "under_review" || s === "approved";
  });

  // Overall progress for this employment type
  const relevantDocs = ALL_DOCS.filter(
    (d) => d.employmentTypes === "all" || d.employmentTypes.includes(empType),
  );
  const uploadedCount = relevantDocs.filter(
    (d) => getDoc(store, d.id).status !== "not_started",
  ).length;
  const needsActionCount = stageDocs.filter(
    (d) => getDoc(store, d.id).status === "needs_action",
  ).length;

  const visibleSections = SECTIONS.filter(
    (s) => !s.onlyFor || s.onlyFor.includes(empType),
  );

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50">
      {/* ── Header ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 sm:p-5"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink/45">
            Documents
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            needsActionCount > 0
              ? "bg-red-50 text-red-500"
              : uploadedCount > 0
              ? "bg-blue-50 text-blue-600"
              : "bg-ink/6 text-ink/40"
          }`}>
            {needsActionCount > 0
              ? `${needsActionCount} need attention`
              : profile
              ? `${uploadedCount}/${relevantDocs.length} uploaded`
              : "Set up profile"}
          </span>
          {!isOpen && profile && pendingDocs.length > 0 && (
            <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] text-accent-500">
              {pendingDocs.length} needed now
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
          className={`shrink-0 text-ink/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Body ── */}
      {isOpen && (
        <div className="border-t border-ink/10 p-4 sm:p-5">
          {/* Profile wizard or edit */}
          {(!profile || editingProfile) ? (
            <ProfileSetup
              initial={profile ?? undefined}
              onSave={applyProfile}
              onCancel={profile ? () => setEditingProfile(false) : undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Profile chip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-ink/15 bg-bone px-3 py-1 text-[12px] font-medium text-ink">
                    {EMP_LABELS[profile.employmentType].label}
                  </span>
                  <span className="rounded-full border border-ink/15 bg-bone px-3 py-1 text-[12px] font-medium text-ink">
                    {profile.ownership === "solo" ? "Solo purchase" : "Joint purchase"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="text-[11px] text-ink/40 hover:text-ink/70"
                >
                  Edit
                </button>
              </div>

              {/* Joint banner */}
              {profile.ownership === "joint" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-700">
                  <strong>Joint purchase</strong> — collect matching documents for your co-buyer. Your advisor will confirm what&apos;s needed for both applicants.
                </div>
              )}

              {/* Stage-specific docs */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent-500">
                      Needed at this stage
                    </p>
                    {STAGE_CONTEXT[currentStageId] && (
                      <p className="mt-0.5 text-[11px] text-ink/45">
                        {STAGE_CONTEXT[currentStageId]}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-ink/35">Stage {currentStageId}</span>
                </div>

                {stageDocs.length === 0 ? (
                  <div className="rounded-xl border border-ink/10 bg-bone px-4 py-3 text-[13px] text-ink/45">
                    No new documents required at this stage.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Pending */}
                    {pendingDocs.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-ink/10 divide-y divide-ink/8">
                        {pendingDocs.map((doc) => (
                          <DocRow
                            key={doc.id}
                            doc={doc}
                            record={getDoc(store, doc.id)}
                            isExpanded={expandedDoc === doc.id}
                            draft={drafts[doc.id] ?? ""}
                            onToggle={() => setExpandedDoc((v) => (v === doc.id ? null : doc.id))}
                            onUpload={(f) => handleUpload(doc.id, f)}
                            onDraftChange={(val) => setDrafts((d) => ({ ...d, [doc.id]: val }))}
                            onSend={() => sendMessage(doc.id)}
                            compact
                          />
                        ))}
                      </div>
                    )}

                    {/* Done */}
                    {doneDocs.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-emerald-100 divide-y divide-ink/8">
                        {doneDocs.map((doc) => (
                          <DocRow
                            key={doc.id}
                            doc={doc}
                            record={getDoc(store, doc.id)}
                            isExpanded={expandedDoc === doc.id}
                            draft={drafts[doc.id] ?? ""}
                            onToggle={() => setExpandedDoc((v) => (v === doc.id ? null : doc.id))}
                            onUpload={(f) => handleUpload(doc.id, f)}
                            onDraftChange={(val) => setDrafts((d) => ({ ...d, [doc.id]: val }))}
                            onSend={() => sendMessage(doc.id)}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* All documents accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAllDocs((v) => !v)}
                  className="flex w-full items-center justify-between text-[11px] text-ink/45 hover:text-ink/70 transition-colors"
                >
                  <span>All documents ({uploadedCount}/{relevantDocs.length} uploaded)</span>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                    className={`shrink-0 transition-transform ${showAllDocs ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showAllDocs && (
                  <div className="mt-3 space-y-2">
                    {visibleSections.map((section) => {
                      const sectionDocs = ALL_DOCS.filter(
                        (d) =>
                          d.sectionId === section.id &&
                          (d.employmentTypes === "all" || d.employmentTypes.includes(empType)),
                      );
                      if (sectionDocs.length === 0) return null;
                      const sectionUploaded = sectionDocs.filter(
                        (d) => getDoc(store, d.id).status !== "not_started",
                      ).length;
                      const sectionExpanded = expandedSection === section.id;

                      return (
                        <div key={section.id} className="overflow-hidden rounded-xl border border-ink/10">
                          <button
                            type="button"
                            onClick={() => setExpandedSection((v) => (v === section.id ? null : section.id))}
                            className="flex w-full items-center gap-3 bg-bone-50 px-4 py-3"
                          >
                            <span className="text-base" aria-hidden="true">{section.icon}</span>
                            <span className="flex-1 text-left text-[13px] font-medium text-ink">{section.title}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              sectionUploaded === sectionDocs.length ? "bg-emerald-50 text-emerald-600"
                              : sectionUploaded > 0 ? "bg-amber-50 text-amber-600"
                              : "bg-ink/6 text-ink/40"
                            }`}>
                              {sectionUploaded}/{sectionDocs.length}
                            </span>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                              className={`shrink-0 text-ink/35 transition-transform ${sectionExpanded ? "rotate-180" : ""}`} aria-hidden="true">
                              <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {sectionExpanded && (
                            <div className="divide-y divide-ink/8 border-t border-ink/8">
                              {sectionDocs.map((doc) => (
                                <DocRow
                                  key={doc.id}
                                  doc={doc}
                                  record={getDoc(store, doc.id)}
                                  isExpanded={expandedDoc === doc.id}
                                  draft={drafts[doc.id] ?? ""}
                                  onToggle={() => setExpandedDoc((v) => (v === doc.id ? null : doc.id))}
                                  onUpload={(f) => handleUpload(doc.id, f)}
                                  onDraftChange={(val) => setDrafts((d) => ({ ...d, [doc.id]: val }))}
                                  onSend={() => sendMessage(doc.id)}
                                  compact={false}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-ink/10 pt-3">
                <p className="text-[11px] text-ink/40">
                  Your advisor reviews documents in the full portal.
                </p>
                <Link href="/mortgage-portal" className="text-[11px] font-medium text-accent-500 hover:underline">
                  Full portal →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile setup wizard ─────────────────────────────────────────────────────

function ProfileSetup({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BuyerProfile;
  onSave: (p: BuyerProfile) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [ownership, setOwnership] = useState<Ownership | null>(initial?.ownership ?? null);
  const [empType, setEmpType] = useState<EmploymentType | null>(initial?.employmentType ?? null);

  const EMP_OPTIONS: { id: EmploymentType; label: string; desc: string; icon: string }[] = [
    { id: "employed",      label: "Employed",      desc: "You receive regular payslips from an employer",  icon: "💼" },
    { id: "self_employed", label: "Self-Employed",  desc: "Sole trader, freelancer, or partnership",        icon: "🛠️" },
    { id: "director",      label: "Director",       desc: "You own or direct a limited company",            icon: "🏢" },
    { id: "contractor",    label: "Contractor",     desc: "Day-rate, CIS, or fixed-term contracts",         icon: "📋" },
  ];

  function finish() {
    if (ownership && empType) onSave({ employmentType: empType, ownership });
  }

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <>
          <div>
            <p className="text-[13px] font-medium text-ink">Are you buying solo or with someone?</p>
            <p className="mt-0.5 text-[11px] text-ink/45">This determines which documents we&apos;ll ask for.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([["solo", "Solo purchase", "Just me", "🧍"], ["joint", "Joint purchase", "Me and a partner", "👥"]] as const).map(
              ([id, label, desc, icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOwnership(id)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-colors ${
                    ownership === id
                      ? "border-ink bg-ink text-bone"
                      : "border-ink/15 bg-bone text-ink hover:border-ink/30"
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <span className="text-[13px] font-medium">{label}</span>
                  <span className={`text-[11px] ${ownership === id ? "text-bone/60" : "text-ink/45"}`}>{desc}</span>
                </button>
              ),
            )}
          </div>
          <div className="flex items-center justify-between pt-1">
            {onCancel && (
              <button type="button" onClick={onCancel} className="text-[11px] text-ink/40 hover:text-ink/70">
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={!ownership}
              onClick={() => setStep(2)}
              className="ml-auto rounded-xl bg-ink px-4 py-2 text-[12px] font-medium text-bone disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-[13px] font-medium text-ink">What is your employment status?</p>
            <p className="mt-0.5 text-[11px] text-ink/45">This changes which income documents your lender will need.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EMP_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEmpType(opt.id)}
                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-colors ${
                  empType === opt.id
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/15 bg-bone text-ink hover:border-ink/30"
                }`}
              >
                <span className="text-xl" aria-hidden="true">{opt.icon}</span>
                <span className="text-[13px] font-medium">{opt.label}</span>
                <span className={`text-[11px] ${empType === opt.id ? "text-bone/60" : "text-ink/45"}`}>{opt.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => setStep(1)} className="text-[11px] text-ink/40 hover:text-ink/70">
              ← Back
            </button>
            <button
              type="button"
              disabled={!empType}
              onClick={finish}
              className="ml-auto rounded-xl bg-ink px-4 py-2 text-[12px] font-medium text-bone disabled:opacity-30"
            >
              Show my documents →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Doc row ──────────────────────────────────────────────────────────────────

function DocRow({
  doc, record, isExpanded, draft, compact,
  onToggle, onUpload, onDraftChange, onSend,
}: {
  doc: DocDef; record: DocRecord; isExpanded: boolean;
  draft: string; compact: boolean;
  onToggle: () => void; onUpload: (f: File) => void;
  onDraftChange: (v: string) => void; onSend: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasMessages = record.messages.length > 0;

  return (
    <div className="bg-bone">
      <div className="flex items-start gap-2.5 px-3.5 py-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[record.status]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13px] font-medium leading-snug text-ink">{doc.label}</p>
            {!doc.required && (
              <span className="rounded-full bg-ink/6 px-1.5 py-0.5 text-[9px] text-ink/40">Optional</span>
            )}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${STATUS_CHIP[record.status]}`}>
              {STATUS_LABEL[record.status]}
            </span>
          </div>
          {!compact && (
            <p className="mt-0.5 text-[11px] leading-snug text-ink/45">{doc.desc}</p>
          )}
          {record.file && (
            <p className="mt-0.5 text-[10px] text-ink/40">
              📎 {record.file.name} · {fmtDate(record.file.uploadedAt)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-ink/15 bg-bone-50 px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-ink/30"
          >
            {record.file ? "Replace" : "Upload"}
          </button>
          <input ref={fileRef} type="file" className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
          />
          <button type="button" onClick={onToggle} aria-expanded={isExpanded}
            className="relative grid h-7 w-7 place-items-center rounded-lg text-ink/35 transition-colors hover:bg-ink/6">
            {hasMessages && !isExpanded && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent-400" />
            )}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true"
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
              <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-ink/8 bg-bone-50 px-3.5 pb-3 pt-2.5">
          {record.messages.length === 0 ? (
            <p className="mb-2 text-[11px] italic text-ink/35">
              Your advisor will leave notes here after reviewing this document.
            </p>
          ) : (
            <div className="mb-2 space-y-1.5 max-h-40 overflow-y-auto">
              {record.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "buyer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-[12px] leading-relaxed ${
                    msg.from === "buyer" ? "bg-ink text-bone rounded-br-sm" : "border border-ink/10 bg-bone text-ink rounded-bl-sm"
                  }`}>
                    {msg.from === "advisor" && (
                      <p className="mb-0.5 text-[9px] font-medium uppercase tracking-widest opacity-50">Advisor</p>
                    )}
                    {msg.text}
                    <p className={`mt-0.5 text-[9px] ${msg.from === "buyer" ? "text-bone/50" : "text-ink/35"}`}>
                      {fmtTime(msg.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-1.5 border-t border-ink/8 pt-2">
            <input type="text" value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Note for your advisor…"
              className="flex-1 rounded-lg border border-ink/15 bg-bone px-3 py-1.5 text-[12px] text-ink placeholder-ink/30 focus:border-ink/35 focus:outline-none"
            />
            <button type="button" onClick={onSend} disabled={!draft.trim()}
              className="rounded-lg bg-ink px-3 py-1.5 text-[11px] font-medium text-bone disabled:opacity-30">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
