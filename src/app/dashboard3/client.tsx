"use client";

// Dashboard 3 — Simplified guided view. One stage at a time.
// Shows only: stage title, what to do, documents needed, who to call.
// No clutter. Designed for people who find the other dashboards overwhelming.

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardGate } from "@/components/DashboardGate";
import { ConversationsCard } from "@/components/chat/ConversationsCard";
import { FinancialPanel } from "@/components/dashboard/FinancialPanel";
import { useUser } from "@/lib/user-store";
import { DASHBOARD_STAGES, SAMPLE_PROVIDERS, SERVICE_LABEL } from "@/lib/journey-data";
import { TASK_TIPS } from "@/lib/task-tips";

// ─── Buyer profile (shared with DocumentsPanel) ───────────────────────────────

type EmploymentType = "employed" | "self_employed" | "director" | "contractor";
type Ownership = "solo" | "joint";
type BuyerProfile = { employmentType: EmploymentType; ownership: Ownership };

const PROFILE_KEY  = "clinkeys_buyer_profile_v1";
const PORTAL_KEY   = "clinkeys_portal_v1";

function loadProfile(): BuyerProfile | null {
  try { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveProfile(p: BuyerProfile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

type DocStatus = "not_started" | "uploaded" | "under_review" | "approved" | "needs_action";
type DocRecord  = { status: DocStatus; file?: { name: string; sizeKb: number; uploadedAt: string }; messages: unknown[] };
type PortalStore = { docs: Record<string, DocRecord> };

function loadPortal(): PortalStore {
  try { const r = localStorage.getItem(PORTAL_KEY); if (r) return JSON.parse(r); } catch {}
  return { docs: {} };
}
function savePortal(d: PortalStore) {
  try { localStorage.setItem(PORTAL_KEY, JSON.stringify(d)); } catch {}
}
function getDoc(store: PortalStore, id: string): DocRecord {
  return store.docs[id] ?? { status: "not_started", messages: [] };
}

// ─── Stage-specific doc list (mirrors DocumentsPanel) ────────────────────────

type DocDef = { id: string; label: string; required: boolean; stages: number[]; employmentTypes: EmploymentType[] | "all" };

const STAGE_DOCS: DocDef[] = [
  { id: "photo_id",              label: "Photo ID",                    required: true,  stages: [1,4,5],   employmentTypes: "all" },
  { id: "proof_address_1",       label: "Proof of address",            required: true,  stages: [1,3,4,5], employmentTypes: "all" },
  { id: "proof_address_2",       label: "Second proof of address",     required: true,  stages: [4,5],     employmentTypes: "all" },
  { id: "payslips",              label: "Last 3 months' payslips",     required: true,  stages: [1,4],     employmentTypes: ["employed","director"] },
  { id: "p60",                   label: "Most recent P60",             required: true,  stages: [1,4],     employmentTypes: ["employed","director"] },
  { id: "employment_letter",     label: "Employer reference letter",   required: false, stages: [4],       employmentTypes: ["employed"] },
  { id: "contracts",             label: "Current & previous contracts",required: true,  stages: [1,4],     employmentTypes: ["contractor"] },
  { id: "invoices",              label: "12 months' invoices",         required: true,  stages: [1,4],     employmentTypes: ["contractor"] },
  { id: "sa302_1",               label: "SA302 — most recent year",    required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "sa302_2",               label: "SA302 — previous year",       required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "tax_year_overview",     label: "HMRC Tax Year Overview",      required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "bank_statements",       label: "3 months' bank statements",   required: true,  stages: [1,4,8],   employmentTypes: "all" },
  { id: "savings_statements",    label: "Savings account statements",  required: true,  stages: [4,8],     employmentTypes: "all" },
  { id: "gift_letter",           label: "Gifted deposit letter",       required: false, stages: [4],       employmentTypes: "all" },
  { id: "memorandum_sale",       label: "Memorandum of Sale",          required: true,  stages: [4,5],     employmentTypes: "all" },
  { id: "property_particulars",  label: "Property particulars",        required: false, stages: [5,6],     employmentTypes: "all" },
  { id: "loan_statements",       label: "Loan / finance statements",   required: false, stages: [4],       employmentTypes: "all" },
  { id: "credit_card_statements",label: "Credit card statements",      required: false, stages: [4],       employmentTypes: "all" },
];

function getStageDocList(stageId: number, empType: EmploymentType): DocDef[] {
  return STAGE_DOCS.filter(
    (d) => d.stages.includes(stageId) &&
    (d.employmentTypes === "all" || d.employmentTypes.includes(empType))
  );
}

const STATUS_DOT: Record<DocStatus, string> = {
  not_started:  "bg-ink/15",
  uploaded:     "bg-blue-400",
  under_review: "bg-amber-400",
  approved:     "bg-emerald-400",
  needs_action: "bg-red-400",
};
const STATUS_LABEL: Record<DocStatus, string> = {
  not_started:  "Upload",
  uploaded:     "Uploaded ✓",
  under_review: "Under review",
  approved:     "Approved ✓",
  needs_action: "Needs attention",
};

const EMP_OPTIONS: { id: EmploymentType; label: string; icon: string; desc: string }[] = [
  { id: "employed",      label: "Employed",      icon: "💼", desc: "PAYE / salaried" },
  { id: "self_employed", label: "Self-Employed",  icon: "🛠️", desc: "Sole trader" },
  { id: "director",      label: "Director",       icon: "🏢", desc: "Ltd company" },
  { id: "contractor",    label: "Contractor",     icon: "📋", desc: "Day-rate / CIS" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard3Client() {
  const { user, setUser, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramStage = parseInt(searchParams.get("stage") ?? "", 10);
  const currentStageId =
    !isNaN(paramStage) && paramStage >= 1 && paramStage <= DASHBOARD_STAGES.length
      ? paramStage : 1;

  const currentStage = DASHBOARD_STAGES.find((s) => s.id === currentStageId)!;

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [store, setStore] = useState<PortalStore>({ docs: {} });
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [draftOwnership, setDraftOwnership] = useState<Ownership | null>(null);
  const [draftEmp, setDraftEmp] = useState<EmploymentType | null>(null);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setStore(loadPortal());
    setProfileLoaded(true);
  }, []);

  function applyProfile(p: BuyerProfile) {
    saveProfile(p);
    setProfile(p);
  }

  function handleUpload(docId: string, file: File) {
    setStore((prev) => {
      const next: PortalStore = {
        docs: {
          ...prev.docs,
          [docId]: {
            ...getDoc(prev, docId),
            status: "uploaded",
            file: { name: file.name, sizeKb: Math.round(file.size / 1024), uploadedAt: new Date().toISOString() },
          },
        },
      };
      savePortal(next);
      return next;
    });
  }

  const firstName = user?.name?.split(" ")[0] ?? "";
  const empType = profile?.employmentType ?? "employed";
  const docList = profile ? getStageDocList(currentStageId, empType) : [];
  const pendingDocs = docList.filter((d) => {
    const s = getDoc(store, d.id).status;
    return s === "not_started" || s === "needs_action";
  });
  const doneDocs = docList.filter((d) => {
    const s = getDoc(store, d.id).status;
    return s !== "not_started" && s !== "needs_action";
  });
  const progressPct = Math.round((currentStageId - 1) / (DASHBOARD_STAGES.length - 1) * 100);

  if (!isLoaded || !profileLoaded) {
    return (
      <>
        <Header />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {!user ? (
        <>
          <DashboardGate onLogin={setUser} />
          <Footer />
        </>
      ) : !profile ? (
        // ── Profile setup ──
        <>
          <main className="container-narrow flex min-h-[70vh] items-center justify-center py-10">
            <div className="w-full max-w-md">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                Quick setup · {setupStep} of 2
              </p>
              <h1 className="mt-3 text-center font-serif text-2xl text-ink">
                {setupStep === 1 ? "Are you buying solo or with someone?" : "What is your employment status?"}
              </h1>
              <p className="mt-2 text-center text-sm text-ink/50">
                {setupStep === 1
                  ? "This helps us know which documents to collect."
                  : "This determines which income evidence your lender needs."}
              </p>

              {setupStep === 1 ? (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {(["solo", "joint"] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setDraftOwnership(o)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-colors ${
                        draftOwnership === o
                          ? "border-ink bg-ink text-bone"
                          : "border-ink/15 bg-bone-50 text-ink hover:border-ink/30"
                      }`}
                    >
                      <span className="text-3xl" aria-hidden="true">{o === "solo" ? "🧍" : "👥"}</span>
                      <span className="text-[14px] font-medium">{o === "solo" ? "Solo purchase" : "Joint purchase"}</span>
                      <span className={`text-[11px] ${draftOwnership === o ? "text-bone/60" : "text-ink/45"}`}>
                        {o === "solo" ? "Just me" : "Me and a partner"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {EMP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraftEmp(opt.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-colors ${
                        draftEmp === opt.id
                          ? "border-ink bg-ink text-bone"
                          : "border-ink/15 bg-bone-50 text-ink hover:border-ink/30"
                      }`}
                    >
                      <span className="text-3xl" aria-hidden="true">{opt.icon}</span>
                      <span className="text-[14px] font-medium">{opt.label}</span>
                      <span className={`text-[11px] ${draftEmp === opt.id ? "text-bone/60" : "text-ink/45"}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                {setupStep === 2 && (
                  <button type="button" onClick={() => setSetupStep(1)}
                    className="text-sm text-ink/40 hover:text-ink/70">← Back</button>
                )}
                <button
                  type="button"
                  disabled={setupStep === 1 ? !draftOwnership : !draftEmp}
                  onClick={() => {
                    if (setupStep === 1) { setSetupStep(2); }
                    else if (draftOwnership && draftEmp) {
                      applyProfile({ ownership: draftOwnership, employmentType: draftEmp });
                    }
                  }}
                  className="ml-auto rounded-2xl bg-ink px-6 py-3 text-sm font-medium text-bone disabled:opacity-30"
                >
                  {setupStep === 1 ? "Next →" : "Let's go →"}
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </>
      ) : (
        // ── Main view ──
        <main className="container-narrow py-6 sm:py-10">
          <div className="mx-auto max-w-xl">

            {/* ── Top: name + profile chips ── */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                  Hi {firstName} 👋
                </p>
                <h1 className="mt-1 font-serif text-2xl leading-tight text-ink">
                  Your home buying journey
                </h1>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
              </div>
            </div>

            {/* Profile chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-ink/12 bg-bone px-2.5 py-1 text-[11px] text-ink/60">
                {EMP_OPTIONS.find((e) => e.id === profile.employmentType)?.icon}{" "}
                {EMP_OPTIONS.find((e) => e.id === profile.employmentType)?.label}
              </span>
              <span className="rounded-full border border-ink/12 bg-bone px-2.5 py-1 text-[11px] text-ink/60">
                {profile.ownership === "solo" ? "🧍 Solo" : "👥 Joint"}
              </span>
              <button
                type="button"
                onClick={() => { setProfile(null); setSetupStep(1); setDraftOwnership(null); setDraftEmp(null); }}
                className="text-[11px] text-ink/35 hover:text-ink/60"
              >
                Edit profile
              </button>
            </div>

            {/* ── Stage progress ── */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-ink/45 mb-1.5">
                <span>Stage {currentStageId} of {DASHBOARD_STAGES.length}</span>
                <span>{progressPct}% complete</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-accent-400 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {/* Stage nav */}
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                {DASHBOARD_STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/dashboard3?stage=${s.id}`)}
                    title={s.title}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                      s.id === currentStageId
                        ? "bg-ink text-bone"
                        : s.id < currentStageId
                        ? "bg-accent-400/20 text-accent-500"
                        : "bg-ink/6 text-ink/40 hover:bg-ink/12"
                    }`}
                  >
                    {s.id < currentStageId ? "✓" : s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Stage card ── */}
            <div className="mt-5 rounded-2xl border border-ink/10 bg-bone-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-500">
                    Stage {currentStageId}
                  </p>
                  <h2 className="mt-1 font-serif text-xl leading-snug text-ink">
                    {currentStage.title}
                  </h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-ink/45">{currentStage.timescale}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-ink">{currentStage.cost}</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
                {currentStage.blurb}
              </p>
            </div>

            {/* ── Property finances ── */}
            <div className="mt-4">
              <FinancialPanel currentStageId={currentStageId} />
            </div>

            {/* ── What to do now ── */}
            <div className="mt-4">
              <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                What to do now
              </p>
              <div className="space-y-2">
                {currentStage.actions.map((action, i) => {
                  const tipKey = `${currentStageId}-${i}`;
                  const tip = TASK_TIPS[tipKey];
                  const isExpanded = expandedAction === i;
                  const isDone = !!checkedActions[i];

                  return (
                    <div
                      key={i}
                      className={`overflow-hidden rounded-xl border transition-colors ${
                        isDone
                          ? "border-accent-400/30 bg-accent-400/5"
                          : isExpanded
                          ? "border-ink/20 bg-bone-50"
                          : "border-ink/10 bg-bone-50 hover:border-ink/20"
                      }`}
                    >
                      {/* Row header — tap to expand */}
                      <button
                        type="button"
                        onClick={() => setExpandedAction((prev) => (prev === i ? null : i))}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left"
                      >
                        {/* Tick circle — clicking ticks without collapsing */}
                        <span
                          role="checkbox"
                          aria-checked={isDone}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCheckedActions((prev) => ({ ...prev, [i]: !prev[i] }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.stopPropagation();
                              setCheckedActions((prev) => ({ ...prev, [i]: !prev[i] }));
                            }
                          }}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                            isDone
                              ? "border-accent-400 bg-accent-400 text-bone"
                              : "border-ink/25 hover:border-ink/50"
                          }`}
                        >
                          {isDone && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>

                        <span className={`flex-1 text-[14px] leading-snug ${isDone ? "text-ink/40 line-through" : "text-ink"}`}>
                          {action}
                        </span>

                        {/* Expand chevron */}
                        {tip && (
                          <span className={`mt-0.5 shrink-0 text-[10px] transition-transform text-ink/30 ${isExpanded ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        )}
                      </button>

                      {/* Tip panel */}
                      {tip && isExpanded && (
                        <div className="border-t border-ink/8 bg-ink/[0.02] px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 text-xl leading-none" aria-hidden="true">{tip.emoji}</span>
                            <div className="flex-1">
                              <p className="text-[13px] leading-relaxed text-ink/70">{tip.tip}</p>
                              {tip.linkHref && (
                                <a
                                  href={tip.linkHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-accent-500 hover:text-accent-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tip.linkLabel ?? tip.linkHref} ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Documents needed ── */}
            {docList.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                  Documents needed
                </p>

                {pendingDocs.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-ink/10 divide-y divide-ink/8">
                    {pendingDocs.map((doc) => (
                      <SimpleDocRow
                        key={doc.id}
                        doc={doc}
                        record={getDoc(store, doc.id)}
                        onUpload={(f) => handleUpload(doc.id, f)}
                      />
                    ))}
                  </div>
                )}

                {doneDocs.length > 0 && (
                  <div className={`overflow-hidden rounded-xl border border-emerald-100 divide-y divide-ink/8 ${pendingDocs.length > 0 ? "mt-2" : ""}`}>
                    {doneDocs.map((doc) => (
                      <SimpleDocRow
                        key={doc.id}
                        doc={doc}
                        record={getDoc(store, doc.id)}
                        onUpload={(f) => handleUpload(doc.id, f)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Who you need ── */}
            {currentStage.needs.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
                  Who you need at this stage
                </p>
                <div className="space-y-2">
                  {currentStage.needs.map((srv) => {
                    const provider = SAMPLE_PROVIDERS[srv]?.[0];
                    if (!provider) return null;
                    return (
                      <div key={srv} className="rounded-xl border border-ink/10 bg-bone-50 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink/40">
                          {SERVICE_LABEL[srv]}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[14px] font-medium text-ink">{provider.name}</p>
                            <p className="mt-0.5 text-[12px] text-ink/50">
                              {provider.location} · {provider.rating} · {provider.price}
                            </p>
                          </div>
                          <button type="button" className="shrink-0 rounded-xl border border-ink/15 px-3 py-1.5 text-[12px] font-medium text-ink hover:border-ink/30">
                            View →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="mt-6 flex items-center justify-between gap-3">
              {currentStageId > 1 ? (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard3?stage=${currentStageId - 1}`)}
                  className="btn-ghost text-sm"
                >
                  ← Stage {currentStageId - 1}
                </button>
              ) : <div />}


              {currentStageId < DASHBOARD_STAGES.length && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard3?stage=${currentStageId + 1}`)}
                  className="btn-solid text-sm"
                >
                  Stage {currentStageId + 1} →
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-ink/30">
              Want more detail?{" "}
              <a href="/dashboard" className="hover:text-ink/60 underline">Full dashboard →</a>
            </p>
          </div>

          {/* Your conversations */}
          <div className="mt-4">
            <ConversationsCard />
          </div>
        </main>
      )}
      {user && profile && <Footer />}
    </>
  );
}

// ─── Simple doc row (no message threads — keeps it clean) ─────────────────────

function SimpleDocRow({
  doc, record, onUpload,
}: {
  doc: DocDef;
  record: DocRecord;
  onUpload: (f: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isDone = record.status !== "not_started" && record.status !== "needs_action";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isDone ? "bg-emerald-50/30" : "bg-bone"}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[record.status]}`} />
      <p className={`flex-1 text-[13px] leading-snug ${isDone ? "text-ink/50" : "text-ink"} font-medium`}>
        {doc.label}
        {!doc.required && (
          <span className="ml-1.5 text-[10px] font-normal text-ink/35">Optional</span>
        )}
      </p>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
          isDone
            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
            : record.status === "needs_action"
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-ink/15 bg-bone-50 text-ink hover:border-ink/30"
        }`}
      >
        {STATUS_LABEL[record.status]}
      </button>
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
    </div>
  );
}
