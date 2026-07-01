"use client";

// MortgagePortalClient — Phase One: Buyer-facing document hub.
// Buyers upload documents; each doc has a message thread for advisor notes.
// Advisor-facing view (Phase Two) will be built separately and linked here.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardGate } from "@/components/DashboardGate";
import { useUser } from "@/lib/user-store";
import { AdvisorChat } from "@/components/chat/AdvisorChat";
import { getApplication } from "@/lib/mortgage-application-store";

// ─── Document definitions ─────────────────────────────────────────────────────

type DocDef = {
  id: string;
  label: string;
  desc: string;
  required: boolean;
};

type Section = {
  id: string;
  title: string;
  icon: string;
  note?: string;
  docs: DocDef[];
};

const SECTIONS: Section[] = [
  {
    id: "identity",
    title: "Identity & Address",
    icon: "🪪",
    docs: [
      {
        id: "photo_id",
        label: "Photo ID",
        desc: "Passport or full UK driving licence (not provisional)",
        required: true,
      },
      {
        id: "proof_address_1",
        label: "Proof of address — document 1",
        desc: "Utility bill, council tax bill, or bank statement dated within 3 months",
        required: true,
      },
      {
        id: "proof_address_2",
        label: "Proof of address — document 2",
        desc: "A second document from a different provider, same 3-month requirement",
        required: true,
      },
    ],
  },
  {
    id: "income",
    title: "Income & Employment",
    icon: "💷",
    docs: [
      {
        id: "payslips",
        label: "Last 3 months' payslips",
        desc: "From your current employer — must clearly show gross and net pay",
        required: true,
      },
      {
        id: "p60",
        label: "Most recent P60",
        desc: "Issued by your employer at the end of each tax year (April)",
        required: true,
      },
      {
        id: "bank_statements",
        label: "3 months' bank statements",
        desc: "Main current account — must show regular salary credits and outgoings",
        required: true,
      },
      {
        id: "employment_letter",
        label: "Employer reference letter",
        desc: "Required if you have been in your current role for less than 6 months",
        required: false,
      },
    ],
  },
  {
    id: "self_employed",
    title: "Self-Employed Income",
    icon: "📊",
    note: "Only required if you are self-employed, a sole trader, or a company director",
    docs: [
      {
        id: "sa302_1",
        label: "SA302 — most recent tax year",
        desc: "HMRC tax calculation document, or equivalent prepared by your accountant",
        required: false,
      },
      {
        id: "sa302_2",
        label: "SA302 — previous tax year",
        desc: "Most lenders require two consecutive years of self-employed income evidence",
        required: false,
      },
      {
        id: "tax_year_overview",
        label: "HMRC Tax Year Overview",
        desc: "Must match the tax years shown on your SA302 documents exactly",
        required: false,
      },
    ],
  },
  {
    id: "deposit",
    title: "Deposit & Savings",
    icon: "🏦",
    docs: [
      {
        id: "savings_statements",
        label: "Savings account statements",
        desc: "Showing the full deposit amount — last 3 months minimum required",
        required: true,
      },
      {
        id: "gift_letter",
        label: "Gifted deposit letter",
        desc: "Required if any portion of your deposit has been gifted to you by a family member",
        required: false,
      },
    ],
  },
  {
    id: "property",
    title: "Property Details",
    icon: "🏡",
    docs: [
      {
        id: "memorandum_sale",
        label: "Memorandum of Sale",
        desc: "Issued by the estate agent once your offer has been formally accepted",
        required: true,
      },
      {
        id: "property_particulars",
        label: "Property particulars",
        desc: "Estate agent listing showing address, asking price, and property details",
        required: false,
      },
    ],
  },
  {
    id: "existing_commitments",
    title: "Existing Financial Commitments",
    icon: "💳",
    note: "Required if you have any outstanding loans, finance agreements, or credit cards",
    docs: [
      {
        id: "loan_statements",
        label: "Loan or finance statements",
        desc: "Most recent statement for any personal loans, car finance, or other credit",
        required: false,
      },
      {
        id: "credit_card_statements",
        label: "Credit card statements",
        desc: "Last 3 months' statements if you carry a regular balance",
        required: false,
      },
    ],
  },
];

const ALL_DOCS = SECTIONS.flatMap((s) => s.docs);
const REQUIRED_IDS = new Set(ALL_DOCS.filter((d) => d.required).map((d) => d.id));

// ─── localStorage store ───────────────────────────────────────────────────────

const PORTAL_KEY = "clinkeys_portal_v1";

type DocStatus =
  | "not_started"
  | "uploaded"
  | "under_review"
  | "approved"
  | "needs_action";

type UploadedFile = {
  name: string;
  sizeKb: number;
  uploadedAt: string; // ISO string
};

type Message = {
  from: "buyer" | "advisor";
  text: string;
  sentAt: string; // ISO string
};

type DocRecord = {
  status: DocStatus;
  file?: UploadedFile;
  messages: Message[];
};

type PortalStore = {
  docs: Record<string, DocRecord>;
};

function loadPortal(): PortalStore {
  try {
    const raw = localStorage.getItem(PORTAL_KEY);
    if (raw) return JSON.parse(raw) as PortalStore;
  } catch {}
  return { docs: {} };
}

function savePortal(data: PortalStore) {
  try {
    localStorage.setItem(PORTAL_KEY, JSON.stringify(data));
  } catch {}
}

function getDoc(store: PortalStore, id: string): DocRecord {
  return store.docs[id] ?? { status: "not_started", messages: [] };
}

// ─── Status display helpers ───────────────────────────────────────────────────

const STATUS_LABEL: Record<DocStatus, string> = {
  not_started: "Not uploaded",
  uploaded: "Uploaded",
  under_review: "Under review",
  approved: "Approved",
  needs_action: "Needs attention",
};

const STATUS_CHIP: Record<DocStatus, string> = {
  not_started: "bg-ink/6 text-ink/40",
  uploaded: "bg-blue-50 text-blue-600",
  under_review: "bg-amber-50 text-amber-600",
  approved: "bg-emerald-50 text-emerald-600",
  needs_action: "bg-red-50 text-red-500",
};

const STATUS_DOT: Record<DocStatus, string> = {
  not_started: "bg-ink/15",
  uploaded: "bg-blue-400",
  under_review: "bg-amber-400",
  approved: "bg-emerald-400",
  needs_action: "bg-red-400",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MortgagePortalClient() {
  const { user, setUser, isLoaded } = useUser();
  const [store, setStore] = useState<PortalStore>({ docs: {} });
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [appStatus, setAppStatus] = useState<"none" | "draft" | "submitted">("none");

  useEffect(() => {
    if (user) {
      setStore(loadPortal());
      const app = getApplication(user.email);
      setAppStatus(app ? app.status : "none");
    }
  }, [user]);

  function updateDoc(id: string, patch: Partial<DocRecord>) {
    setStore((prev) => {
      const next: PortalStore = {
        docs: {
          ...prev.docs,
          [id]: { ...getDoc(prev, id), ...patch },
        },
      };
      savePortal(next);
      return next;
    });
  }

  function handleUpload(docId: string, file: File) {
    updateDoc(docId, {
      status: "uploaded",
      file: {
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  function sendMessage(docId: string) {
    const text = (drafts[docId] ?? "").trim();
    if (!text) return;
    const rec = getDoc(store, docId);
    updateDoc(docId, {
      messages: [
        ...rec.messages,
        { from: "buyer", text, sentAt: new Date().toISOString() },
      ],
    });
    setDrafts((d) => ({ ...d, [docId]: "" }));
  }

  // ── Progress stats ──
  const totalAll = ALL_DOCS.length;
  const uploadedAll = ALL_DOCS.filter(
    (d) => getDoc(store, d.id).status !== "not_started"
  ).length;
  const approvedAll = ALL_DOCS.filter(
    (d) => getDoc(store, d.id).status === "approved"
  ).length;
  const needsActionAll = ALL_DOCS.filter(
    (d) => getDoc(store, d.id).status === "needs_action"
  ).length;
  const requiredUploaded = [...REQUIRED_IDS].filter((id) => {
    const s = getDoc(store, id).status;
    return s !== "not_started";
  }).length;
  const progressPct =
    totalAll > 0 ? Math.round((uploadedAll / totalAll) * 100) : 0;

  const firstName = user?.name?.split(" ")[0] ?? "";

  if (!isLoaded) {
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
      ) : (
        <main className="container-narrow py-6 sm:py-10">

          {/* ── Page header ── */}
          <div className="border-b border-ink/10 pb-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
              Mortgage application portal
            </p>
            <h1 className="mt-2 font-serif text-2xl leading-tight text-ink sm:text-3xl">
              {firstName}&apos;s document hub
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/55">
              Upload your mortgage documents here. Your advisor reviews each one
              and leaves notes if anything needs attention. Documents are
              processed for UK mortgage applications only.
            </p>
          </div>

          {/* ── Application status card ── */}
          {appStatus === "none" && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">📋</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">Complete your mortgage application</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Before meeting an advisor, fill in your personal details, financial history, and property information. Takes about 10 minutes.
                  </p>
                </div>
              </div>
              <Link
                href="/mortgage-application"
                className="shrink-0 rounded-xl bg-amber-700 px-4 py-2 text-xs font-medium text-white hover:bg-amber-800 transition-colors"
              >
                Start →
              </Link>
            </div>
          )}

          {appStatus === "draft" && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">✏️</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">Application in progress</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-700">
                    You have a draft application saved. Continue filling it in and submit before your advisor meeting.
                  </p>
                </div>
              </div>
              <Link
                href="/mortgage-application"
                className="shrink-0 rounded-xl bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 transition-colors"
              >
                Continue →
              </Link>
            </div>
          )}

          {appStatus === "submitted" && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">✅</span>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Application submitted</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                    Your advisor can see your full application. Upload the documents below to complete your file.
                  </p>
                </div>
              </div>
              <Link
                href="/mortgage-application"
                className="shrink-0 rounded-xl border border-emerald-300 px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                View →
              </Link>
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Uploaded", value: uploadedAll, total: totalAll, color: "text-ink" },
              { label: "Required done", value: requiredUploaded, total: REQUIRED_IDS.size, color: "text-ink" },
              { label: "Approved", value: approvedAll, total: totalAll, color: "text-emerald-600" },
              { label: "Needs attention", value: needsActionAll, total: totalAll, color: needsActionAll > 0 ? "text-red-500" : "text-ink/30" },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="rounded-2xl border border-ink/10 bg-bone-50 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">
                  {label}
                </p>
                <p className={`mt-1 font-serif text-2xl leading-none ${color}`}>
                  {value}
                  <span className="ml-1 text-base text-ink/30">/ {total}</span>
                </p>
              </div>
            ))}
          </div>

          {/* ── Progress bar ── */}
          <div className="mt-4 rounded-2xl border border-ink/10 bg-bone-50 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between text-[11px] text-ink/45">
              <span>Overall upload progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full bg-accent-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* ── Advisor card ── */}
          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-ink/10 bg-bone-50 px-4 py-4 sm:px-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/8 text-sm font-medium text-ink/40">
              MA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">
                Your mortgage advisor
              </p>
              <p className="mt-0.5 text-sm text-ink/50">
                Awaiting advisor connection — share your portal link once you
                have selected an advisor.
              </p>
            </div>
            <div className="shrink-0">
              <span className="rounded-full bg-ink/6 px-2.5 py-1 text-[10px] font-medium text-ink/40">
                Phase 2
              </span>
            </div>
          </div>

          {/* ── Chat with your advisor ── */}
          {user && (
            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="font-serif text-lg text-ink">
                  Chat with your advisor
                </h2>
                <span className="text-[11px] text-ink/40">
                  Replies appear here automatically
                </span>
              </div>
              <AdvisorChat
                buyerEmail={user.email}
                me="buyer"
                myName={user.name}
                counterpartName="your advisor"
              />
            </div>
          )}

          {/* ── Document sections ── */}
          <div className="mt-6 space-y-4">
            {SECTIONS.map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                store={store}
                expandedDoc={expandedDoc}
                drafts={drafts}
                onToggle={(id) =>
                  setExpandedDoc((v) => (v === id ? null : id))
                }
                onUpload={handleUpload}
                onDraftChange={(id, val) =>
                  setDrafts((d) => ({ ...d, [id]: val }))
                }
                onSend={sendMessage}
              />
            ))}
          </div>

          {/* ── Footer note ── */}
          <div className="mt-8 rounded-2xl border border-ink/10 bg-bone-50 px-4 py-4 sm:px-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">
              About this portal
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink/50">
              This is Phase One of the Clinkeys mortgage portal. Documents are
              currently stored in your browser only. Phase Two will connect your
              advisor directly so they can review, annotate, and approve your
              documents within the platform. UK mortgage applications only —
              document requirements follow FCA-regulated lender standards.
            </p>
          </div>

        </main>
      )}
      {user && <Footer />}
    </>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  store,
  expandedDoc,
  drafts,
  onToggle,
  onUpload,
  onDraftChange,
  onSend,
}: {
  section: Section;
  store: PortalStore;
  expandedDoc: string | null;
  drafts: Record<string, string>;
  onToggle: (id: string) => void;
  onUpload: (docId: string, file: File) => void;
  onDraftChange: (id: string, val: string) => void;
  onSend: (id: string) => void;
}) {
  const uploaded = section.docs.filter(
    (d) => getDoc(store, d.id).status !== "not_started"
  ).length;
  const total = section.docs.length;
  const allDone = uploaded === total;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10">
      {/* Section header */}
      <div className="flex items-center gap-3 border-b border-ink/8 bg-bone-50 px-4 py-3 sm:px-5">
        <span className="text-lg" aria-hidden="true">
          {section.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-ink">{section.title}</p>
          {section.note && (
            <p className="mt-0.5 text-[11px] leading-snug text-ink/40">
              {section.note}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            allDone
              ? "bg-emerald-50 text-emerald-600"
              : uploaded > 0
              ? "bg-amber-50 text-amber-600"
              : "bg-ink/6 text-ink/40"
          }`}
        >
          {uploaded}/{total}
        </span>
      </div>

      {/* Doc rows */}
      <div className="divide-y divide-ink/8 bg-bone">
        {section.docs.map((doc) => (
          <DocRow
            key={doc.id}
            doc={doc}
            record={getDoc(store, doc.id)}
            isExpanded={expandedDoc === doc.id}
            draft={drafts[doc.id] ?? ""}
            onToggle={() => onToggle(doc.id)}
            onUpload={(file) => onUpload(doc.id, file)}
            onDraftChange={(val) => onDraftChange(doc.id, val)}
            onSend={() => onSend(doc.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Document row ─────────────────────────────────────────────────────────────

function DocRow({
  doc,
  record,
  isExpanded,
  draft,
  onToggle,
  onUpload,
  onDraftChange,
  onSend,
}: {
  doc: DocDef;
  record: DocRecord;
  isExpanded: boolean;
  draft: string;
  onToggle: () => void;
  onUpload: (file: File) => void;
  onDraftChange: (val: string) => void;
  onSend: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = record.messages.length > 0;
  const hasAdvisorMsg = record.messages.some((m) => m.from === "advisor");

  // Scroll to bottom of messages when expanded
  useEffect(() => {
    if (isExpanded && msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isExpanded, record.messages.length]);

  return (
    <div>
      {/* ── Main row ── */}
      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        {/* Status dot */}
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[record.status]}`}
        />

        {/* Label + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-medium leading-snug text-ink">
              {doc.label}
            </p>
            {!doc.required && (
              <span className="rounded-full bg-ink/6 px-1.5 py-0.5 text-[10px] text-ink/40">
                Optional
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[record.status]}`}
            >
              {STATUS_LABEL[record.status]}
            </span>
            {hasAdvisorMsg && (
              <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-medium text-accent-500">
                Advisor note
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] leading-snug text-ink/45">
            {doc.desc}
          </p>
          {record.file && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink/40">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 1h4l2 2v6H2V1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              {record.file.name}
              <span className="text-ink/25">·</span>
              {record.file.sizeKb > 0 ? `${record.file.sizeKb} KB` : "file"}
              <span className="text-ink/25">·</span>
              {fmt(record.file.uploadedAt)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-ink/15 bg-bone-50 px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-ink/30 hover:bg-bone"
          >
            {record.file ? "Replace" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />

          {/* Expand for messages */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse notes" : "View notes"}
            className="relative grid h-8 w-8 place-items-center rounded-xl text-ink/35 transition-colors hover:bg-ink/6 hover:text-ink"
          >
            {hasMessages && !isExpanded && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-400" />
            )}
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <path
                d="M2 4.5l4.5 4.5 4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Message thread (expanded) ── */}
      {isExpanded && (
        <div className="border-t border-ink/8 bg-bone-50 px-4 pb-4 pt-3 sm:px-5">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/35">
            Notes &amp; messages
          </p>

          {record.messages.length === 0 ? (
            <p className="mb-3 text-[13px] italic text-ink/35">
              No messages yet. Your advisor will leave notes here once they
              review this document.
            </p>
          ) : (
            <div className="mb-3 space-y-2 max-h-60 overflow-y-auto">
              {record.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "buyer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.from === "buyer"
                        ? "rounded-br-sm bg-ink text-bone"
                        : "rounded-bl-sm border border-ink/10 bg-bone text-ink"
                    }`}
                  >
                    {msg.from === "advisor" && (
                      <p className="mb-0.5 text-[9px] font-medium uppercase tracking-widest opacity-50">
                        Advisor
                      </p>
                    )}
                    <p>{msg.text}</p>
                    <p
                      className={`mt-0.5 text-[10px] ${
                        msg.from === "buyer" ? "text-bone/50" : "text-ink/35"
                      }`}
                    >
                      {fmtTime(msg.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 border-t border-ink/8 pt-3">
            <input
              type="text"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Add a note or question for your advisor…"
              className="flex-1 rounded-xl border border-ink/15 bg-bone px-3.5 py-2.5 text-[13px] text-ink placeholder-ink/30 focus:border-ink/35 focus:outline-none"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!draft.trim()}
              className="rounded-xl bg-ink px-4 py-2.5 text-[12px] font-medium text-bone transition-opacity disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
