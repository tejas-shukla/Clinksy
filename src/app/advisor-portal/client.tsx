"use client";

// Advisor Portal — Phase 2
// Mortgage advisors log in, see client list, review/approve documents,
// leave notes, and upload documents on behalf of buyers.
// Auth stored in clinksy_advisor_v1. Shared doc store: clinksy_portal_v1.
// Demo clients seeded from clinksy_advisor_clients_v1 on first load.

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DASHBOARD_STAGES } from "@/lib/journey-data";
import { AdvisorChat } from "@/components/chat/AdvisorChat";
import {
  getApplication, getAllApplications,
  type MortgageApplication,
  EMPLOYMENT_LABEL, PROPERTY_TYPE_LABEL, DEPOSIT_SOURCE_LABEL,
} from "@/lib/mortgage-application-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type Advisor = { name: string; email: string };

type EmploymentType = "employed" | "self_employed" | "director" | "contractor";
type Ownership = "solo" | "joint";

type DocStatus = "not_started" | "uploaded" | "under_review" | "approved" | "needs_action";

type DocMessage = {
  from: "buyer" | "advisor";
  authorName: string;
  text: string;
  sentAt: string;
};

type DocRecord = {
  status: DocStatus;
  file?: { name: string; sizeKb: number; uploadedAt: string };
  messages: DocMessage[];
};

type PortalStore = { docs: Record<string, DocRecord> };

type Client = {
  id: string;
  name: string;
  email: string;
  stageId: number;
  employmentType: EmploymentType;
  ownership: Ownership;
  portalStore: PortalStore;
  lastActive: string;
};

type AdvisorStore = { clients: Client[] };

// ─── Storage keys ─────────────────────────────────────────────────────────────

const ADVISOR_AUTH_KEY    = "clinksy_advisor_v1";
const ADVISOR_CLIENTS_KEY = "clinksy_advisor_clients_v1";

// ─── Doc definitions (mirrors dashboard3) ─────────────────────────────────────

type DocDef = {
  id: string;
  label: string;
  required: boolean;
  stages: number[];
  employmentTypes: EmploymentType[] | "all";
};

const ALL_DOCS: DocDef[] = [
  { id: "photo_id",               label: "Photo ID",                    required: true,  stages: [1,4,5],   employmentTypes: "all" },
  { id: "proof_address_1",        label: "Proof of address",            required: true,  stages: [1,3,4,5], employmentTypes: "all" },
  { id: "proof_address_2",        label: "Second proof of address",     required: true,  stages: [4,5],     employmentTypes: "all" },
  { id: "payslips",               label: "Last 3 months' payslips",     required: true,  stages: [1,4],     employmentTypes: ["employed","director"] },
  { id: "p60",                    label: "Most recent P60",             required: true,  stages: [1,4],     employmentTypes: ["employed","director"] },
  { id: "employment_letter",      label: "Employer reference letter",   required: false, stages: [4],       employmentTypes: ["employed"] },
  { id: "contracts",              label: "Current & previous contracts",required: true,  stages: [1,4],     employmentTypes: ["contractor"] },
  { id: "invoices",               label: "12 months' invoices",         required: true,  stages: [1,4],     employmentTypes: ["contractor"] },
  { id: "sa302_1",                label: "SA302 — most recent year",    required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "sa302_2",                label: "SA302 — previous year",       required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "tax_year_overview",      label: "HMRC Tax Year Overview",      required: false, stages: [1,4],     employmentTypes: ["self_employed","director","contractor"] },
  { id: "bank_statements",        label: "3 months' bank statements",   required: true,  stages: [1,4,8],   employmentTypes: "all" },
  { id: "savings_statements",     label: "Savings account statements",  required: true,  stages: [4,8],     employmentTypes: "all" },
  { id: "gift_letter",            label: "Gifted deposit letter",       required: false, stages: [4],       employmentTypes: "all" },
  { id: "memorandum_sale",        label: "Memorandum of Sale",          required: true,  stages: [4,5],     employmentTypes: "all" },
  { id: "property_particulars",   label: "Property particulars",        required: false, stages: [5,6],     employmentTypes: "all" },
  { id: "loan_statements",        label: "Loan / finance statements",   required: false, stages: [4],       employmentTypes: "all" },
  { id: "credit_card_statements", label: "Credit card statements",      required: false, stages: [4],       employmentTypes: "all" },
];

function getDocsForClient(client: Client): DocDef[] {
  return ALL_DOCS.filter(
    (d) =>
      d.stages.includes(client.stageId) &&
      (d.employmentTypes === "all" || d.employmentTypes.includes(client.employmentType))
  );
}

function getDoc(store: PortalStore, id: string): DocRecord {
  return store.docs[id] ?? { status: "not_started", messages: [] };
}

// ─── Demo seed data ───────────────────────────────────────────────────────────

function buildDemoClients(): Client[] {
  const base: Omit<Client, "portalStore">[] = [
    {
      id: "client-sara",
      name: "Sara Mitchell",
      email: "sara.mitchell@example.com",
      stageId: 4,
      employmentType: "employed",
      ownership: "solo",
      lastActive: "2025-05-12T10:23:00Z",
    },
    {
      id: "client-james",
      name: "James Okafor",
      email: "james.okafor@example.com",
      stageId: 1,
      employmentType: "self_employed",
      ownership: "joint",
      lastActive: "2025-05-14T08:55:00Z",
    },
    {
      id: "client-priya",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      stageId: 7,
      employmentType: "employed",
      ownership: "solo",
      lastActive: "2025-05-13T16:41:00Z",
    },
  ];

  // Sara — stage 4 employed: some docs uploaded, some approved
  const saraDocs: Record<string, DocRecord> = {
    photo_id:        { status: "approved",     messages: [], file: { name: "passport.pdf", sizeKb: 420, uploadedAt: "2025-05-05T09:12:00Z" } },
    proof_address_1: { status: "approved",     messages: [], file: { name: "utility_bill.pdf", sizeKb: 180, uploadedAt: "2025-05-05T09:14:00Z" } },
    proof_address_2: { status: "under_review", messages: [{ from: "buyer", authorName: "Sara Mitchell", text: "Uploaded council tax statement.", sentAt: "2025-05-10T11:20:00Z" }], file: { name: "council_tax.pdf", sizeKb: 240, uploadedAt: "2025-05-10T11:19:00Z" } },
    payslips:        { status: "uploaded",     messages: [], file: { name: "payslips_march_may.pdf", sizeKb: 610, uploadedAt: "2025-05-11T14:05:00Z" } },
    p60:             { status: "needs_action", messages: [{ from: "advisor", authorName: "Demo Advisor", text: "The P60 you uploaded appears to be from 2022–23. Please re-upload the 2023–24 version.", sentAt: "2025-05-12T10:23:00Z" }], file: { name: "p60_2022.pdf", sizeKb: 200, uploadedAt: "2025-05-08T09:30:00Z" } },
    bank_statements: { status: "not_started",  messages: [] },
    memorandum_sale: { status: "not_started",  messages: [] },
  };

  // James — stage 1 self-employed, joint: just getting started
  const jamesDocs: Record<string, DocRecord> = {
    photo_id:          { status: "uploaded", messages: [], file: { name: "drivers_licence.jpg", sizeKb: 850, uploadedAt: "2025-05-13T08:10:00Z" } },
    proof_address_1:   { status: "not_started", messages: [] },
    sa302_1:           { status: "not_started", messages: [] },
    sa302_2:           { status: "not_started", messages: [] },
    tax_year_overview: { status: "not_started", messages: [] },
    bank_statements:   { status: "not_started", messages: [] },
  };

  // Priya — stage 7, all stage docs approved
  const priyaDocs: Record<string, DocRecord> = {
    photo_id:        { status: "approved", messages: [], file: { name: "passport.pdf", sizeKb: 390, uploadedAt: "2025-04-20T10:00:00Z" } },
    proof_address_1: { status: "approved", messages: [], file: { name: "bank_letter.pdf", sizeKb: 145, uploadedAt: "2025-04-20T10:02:00Z" } },
    proof_address_2: { status: "approved", messages: [], file: { name: "council_tax_2024.pdf", sizeKb: 220, uploadedAt: "2025-04-21T09:15:00Z" } },
    payslips:        { status: "approved", messages: [], file: { name: "payslips.pdf", sizeKb: 590, uploadedAt: "2025-04-22T11:00:00Z" } },
    p60:             { status: "approved", messages: [], file: { name: "p60_2024.pdf", sizeKb: 190, uploadedAt: "2025-04-22T11:05:00Z" } },
    bank_statements: { status: "approved", messages: [], file: { name: "statements.pdf", sizeKb: 1200, uploadedAt: "2025-04-23T09:45:00Z" } },
    memorandum_sale: { status: "approved", messages: [], file: { name: "memo_of_sale.pdf", sizeKb: 310, uploadedAt: "2025-04-25T14:30:00Z" } },
  };

  return [
    { ...base[0], portalStore: { docs: saraDocs } },
    { ...base[1], portalStore: { docs: jamesDocs } },
    { ...base[2], portalStore: { docs: priyaDocs } },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadAdvisor(): Advisor | null {
  try { const r = localStorage.getItem(ADVISOR_AUTH_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveAdvisor(a: Advisor) {
  try { localStorage.setItem(ADVISOR_AUTH_KEY, JSON.stringify(a)); } catch {}
}

function loadAdvisorStore(): AdvisorStore {
  try {
    const r = localStorage.getItem(ADVISOR_CLIENTS_KEY);
    if (r) return JSON.parse(r);
  } catch {}
  const demo = buildDemoClients();
  const store: AdvisorStore = { clients: demo };
  try { localStorage.setItem(ADVISOR_CLIENTS_KEY, JSON.stringify(store)); } catch {}
  return store;
}
function saveAdvisorStore(s: AdvisorStore) {
  try { localStorage.setItem(ADVISOR_CLIENTS_KEY, JSON.stringify(s)); } catch {}
}

const STATUS_DOT: Record<DocStatus, string> = {
  not_started:  "bg-ink/15",
  uploaded:     "bg-blue-400",
  under_review: "bg-amber-400",
  approved:     "bg-emerald-400",
  needs_action: "bg-red-400",
};

const STATUS_LABEL: Record<DocStatus, string> = {
  not_started:  "Not started",
  uploaded:     "Uploaded",
  under_review: "Under review",
  approved:     "Approved",
  needs_action: "Needs action",
};

const STATUS_COLORS: Record<DocStatus, string> = {
  not_started:  "border-ink/15 text-ink/50",
  uploaded:     "border-blue-200 bg-blue-50 text-blue-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_action: "border-red-200 bg-red-50 text-red-600",
};

const EMP_LABEL: Record<EmploymentType, string> = {
  employed:      "Employed",
  self_employed: "Self-Employed",
  director:      "Director",
  contractor:    "Contractor",
};

function docSummary(docs: DocDef[], store: PortalStore) {
  const total = docs.length;
  const approved = docs.filter((d) => getDoc(store, d.id).status === "approved").length;
  const needsAction = docs.filter((d) => getDoc(store, d.id).status === "needs_action").length;
  const pending = docs.filter((d) => {
    const s = getDoc(store, d.id).status;
    return s === "uploaded" || s === "under_review";
  }).length;
  return { total, approved, needsAction, pending };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdvisorPortalClient() {
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [advisorStore, setAdvisorStore] = useState<AdvisorStore>({ clients: [] });

  // Login form state
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  // Navigation
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Note composer
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const a = loadAdvisor();
    setAdvisor(a);
    setAdvisorStore(loadAdvisorStore());
    setIsLoaded(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim()) return;
    const a: Advisor = { name: loginName.trim(), email: loginEmail.trim() };
    saveAdvisor(a);
    setAdvisor(a);
  }

  function handleLogout() {
    try { localStorage.removeItem(ADVISOR_AUTH_KEY); } catch {}
    setAdvisor(null);
    setSelectedClientId(null);
    setExpandedDocId(null);
  }

  function updateClientDoc(clientId: string, docId: string, patch: Partial<DocRecord>) {
    setAdvisorStore((prev) => {
      const clients = prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const existing = getDoc(c.portalStore, docId);
        return {
          ...c,
          portalStore: {
            ...c.portalStore,
            docs: {
              ...c.portalStore.docs,
              [docId]: { ...existing, ...patch },
            },
          },
        };
      });
      const next = { clients };
      saveAdvisorStore(next);
      return next;
    });
  }

  function handleStatusChange(clientId: string, docId: string, status: DocStatus) {
    updateClientDoc(clientId, docId, { status });
  }

  function handleAdvisorNote(clientId: string, docId: string) {
    if (!noteText.trim() || !advisor) return;
    const msg: DocMessage = {
      from: "advisor",
      authorName: advisor.name,
      text: noteText.trim(),
      sentAt: new Date().toISOString(),
    };
    setAdvisorStore((prev) => {
      const clients = prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const existing = getDoc(c.portalStore, docId);
        return {
          ...c,
          portalStore: {
            ...c.portalStore,
            docs: {
              ...c.portalStore.docs,
              [docId]: { ...existing, messages: [...existing.messages, msg] },
            },
          },
        };
      });
      const next = { clients };
      saveAdvisorStore(next);
      return next;
    });
    setNoteText("");
  }

  function handleAdvisorUpload(clientId: string, docId: string, file: File) {
    updateClientDoc(clientId, docId, {
      status: "uploaded",
      file: { name: file.name, sizeKb: Math.round(file.size / 1024), uploadedAt: new Date().toISOString() },
    });
  }

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

  // ── Auth gate ──────────────────────────────────────────────────────────────

  if (!advisor) {
    return (
      <>
        <Header />
        <main className="container-narrow flex min-h-[70vh] items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-bone text-xl">
                🏦
              </span>
              <h1 className="mt-4 font-serif text-2xl text-ink">Advisor Portal</h1>
              <p className="mt-1 text-sm text-ink/50">
                For registered mortgage advisors only.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-ink/60">Your name</label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Alex Thornton"
                  className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-2.5 text-[14px] text-ink placeholder-ink/30 outline-none focus:border-ink/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-ink/60">Work email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@yourfirm.co.uk"
                  className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-2.5 text-[14px] text-ink placeholder-ink/30 outline-none focus:border-ink/40"
                />
              </div>
              <button
                type="submit"
                className="mt-1 w-full rounded-2xl bg-ink py-3 text-sm font-medium text-bone hover:bg-ink/85 transition-colors"
              >
                Enter Advisor Portal →
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-ink/30">
              Not a registered advisor?{" "}
              <a href="/" className="underline hover:text-ink/60">Return to Clinksy</a>
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Client detail view ─────────────────────────────────────────────────────

  const selectedClient = advisorStore.clients.find((c) => c.id === selectedClientId);

  if (selectedClient) {
    const docs = getDocsForClient(selectedClient);
    const summary = docSummary(docs, selectedClient.portalStore);
    const stage = DASHBOARD_STAGES.find((s) => s.id === selectedClient.stageId);

    return (
      <>
        <Header />
        <main className="container-narrow py-6 sm:py-10">
          {/* Back + header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => { setSelectedClientId(null); setExpandedDocId(null); }}
                className="text-[12px] text-ink/40 hover:text-ink/70"
              >
                ← All clients
              </button>
              <h1 className="mt-2 font-serif text-2xl text-ink">{selectedClient.name}</h1>
              <p className="mt-0.5 text-sm text-ink/50">{selectedClient.email}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="rounded-xl border border-ink/10 bg-bone-50 px-3 py-2 text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink/40">Stage</p>
                <p className="mt-0.5 font-serif text-lg text-ink">{selectedClient.stageId}</p>
                <p className="text-[11px] text-ink/50">{stage?.title}</p>
              </div>
            </div>
          </div>

          {/* Profile chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-ink/12 bg-bone px-2.5 py-1 text-[11px] text-ink/60">
              {EMP_LABEL[selectedClient.employmentType]}
            </span>
            <span className="rounded-full border border-ink/12 bg-bone px-2.5 py-1 text-[11px] text-ink/60">
              {selectedClient.ownership === "solo" ? "🧍 Solo" : "👥 Joint purchase"}
            </span>
            <span className="rounded-full border border-ink/12 bg-bone px-2.5 py-1 text-[11px] text-ink/60">
              Last active {formatDate(selectedClient.lastActive)}
            </span>
          </div>

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "Total docs",   value: summary.total,      color: "text-ink" },
              { label: "Approved",     value: summary.approved,    color: "text-emerald-600" },
              { label: "Needs action", value: summary.needsAction, color: "text-red-500" },
              { label: "Pending",      value: summary.pending,     color: "text-amber-600" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-ink/8 bg-bone-50 p-3 text-center">
                <p className={`font-serif text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink/40">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-ink/40 mb-1">
              <span>Document progress</span>
              <span>{summary.total > 0 ? Math.round((summary.approved / summary.total) * 100) : 0}% approved</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: summary.total > 0 ? `${Math.round((summary.approved / summary.total) * 100)}%` : "0%" }}
              />
            </div>
          </div>

          {/* Mortgage Application */}
          <ClientApplicationPanel email={selectedClient.email} clientName={selectedClient.name} />

          {/* Chat with client */}
          <div className="mt-6">
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
              Chat with {selectedClient.name.split(" ")[0]}
            </p>
            <AdvisorChat
              buyerEmail={selectedClient.email}
              me="advisor"
              myName={advisor.name}
              counterpartName={selectedClient.name.split(" ")[0]}
            />
          </div>

          {/* Document list */}
          <div className="mt-6">
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
              Documents — Stage {selectedClient.stageId}
            </p>

            <div className="space-y-2">
              {docs.map((doc) => {
                const record = getDoc(selectedClient.portalStore, doc.id);
                const isExpanded = expandedDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      isExpanded ? "border-ink/20" : "border-ink/10"
                    }`}
                  >
                    {/* Doc row header */}
                    <button
                      type="button"
                      onClick={() => setExpandedDocId((prev) => (prev === doc.id ? null : doc.id))}
                      className="flex w-full items-center gap-3 bg-bone-50 px-4 py-3 text-left hover:bg-bone"
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[record.status]}`} />
                      <span className="flex-1 text-[14px] font-medium text-ink">
                        {doc.label}
                        {!doc.required && (
                          <span className="ml-1.5 text-[10px] font-normal text-ink/35">Optional</span>
                        )}
                      </span>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[record.status]}`}>
                        {STATUS_LABEL[record.status]}
                      </span>
                      {record.file && (
                        <span className="shrink-0 text-[11px] text-ink/35">{record.file.name}</span>
                      )}
                      <span className={`shrink-0 text-[10px] text-ink/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                    </button>

                    {/* Expanded advisor panel */}
                    {isExpanded && (
                      <div className="border-t border-ink/8 bg-white/40 p-4 space-y-4">

                        {/* File info */}
                        {record.file && (
                          <div className="rounded-xl border border-ink/8 bg-bone px-3 py-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">Uploaded file</p>
                            <div className="mt-1.5 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[13px] font-medium text-ink">{record.file.name}</p>
                                <p className="text-[11px] text-ink/45">{record.file.sizeKb} KB · {formatTime(record.file.uploadedAt)}</p>
                              </div>
                              <span className="text-lg">📄</span>
                            </div>
                          </div>
                        )}

                        {/* Status controls */}
                        <div>
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">Change status</p>
                          <div className="flex flex-wrap gap-2">
                            {(["under_review", "approved", "needs_action", "not_started"] as DocStatus[]).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleStatusChange(selectedClient.id, doc.id, s)}
                                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                                  record.status === s
                                    ? STATUS_COLORS[s] + " ring-1 ring-offset-1 ring-current"
                                    : "border-ink/12 text-ink/50 hover:border-ink/25"
                                }`}
                              >
                                {STATUS_LABEL[s]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Upload on behalf */}
                        <AdvisorUploadRow
                          onUpload={(f) => handleAdvisorUpload(selectedClient.id, doc.id, f)}
                        />

                        {/* Message thread */}
                        {record.messages.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">Thread</p>
                            {record.messages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`rounded-xl px-3 py-2.5 text-[13px] leading-relaxed ${
                                  msg.from === "advisor"
                                    ? "ml-6 border border-ink/10 bg-ink text-bone"
                                    : "mr-6 border border-ink/10 bg-bone text-ink"
                                }`}
                              >
                                <p className={`mb-1 text-[10px] font-medium uppercase tracking-[0.12em] ${msg.from === "advisor" ? "text-bone/50" : "text-ink/40"}`}>
                                  {msg.from === "advisor" ? "You" : msg.authorName} · {formatTime(msg.sentAt)}
                                </p>
                                {msg.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Leave a note */}
                        <div>
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">Leave a note for the buyer</p>
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              value={expandedDocId === doc.id ? noteText : ""}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="e.g. Please re-upload with all pages included."
                              className="flex-1 resize-none rounded-xl border border-ink/12 bg-bone px-3 py-2 text-[13px] text-ink placeholder-ink/30 outline-none focus:border-ink/30"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdvisorNote(selectedClient.id, doc.id)}
                              disabled={!noteText.trim()}
                              className="self-end rounded-xl bg-ink px-3 py-2 text-[12px] font-medium text-bone disabled:opacity-30 hover:bg-ink/85 transition-colors"
                            >
                              Send
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Client list view ───────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className="container-narrow py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
              Advisor Portal
            </p>
            <h1 className="mt-1 font-serif text-2xl text-ink">
              Welcome, {advisor.name.split(" ")[0]}
            </h1>
            <p className="mt-0.5 text-sm text-ink/50">{advisor.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bone text-sm font-medium">
              {advisor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[12px] text-ink/40 hover:text-ink/70"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Summary banner */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Active clients", value: advisorStore.clients.length },
            { label: "Docs pending review", value: advisorStore.clients.reduce((acc, c) => {
              const docs = getDocsForClient(c);
              return acc + docs.filter((d) => getDoc(c.portalStore, d.id).status === "uploaded" || getDoc(c.portalStore, d.id).status === "under_review").length;
            }, 0), highlight: true },
            { label: "Docs needing action", value: advisorStore.clients.reduce((acc, c) => {
              const docs = getDocsForClient(c);
              return acc + docs.filter((d) => getDoc(c.portalStore, d.id).status === "needs_action").length;
            }, 0), red: true },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-4 text-center ${stat.red ? "border-red-100 bg-red-50" : "border-ink/8 bg-bone-50"}`}>
              <p className={`font-serif text-3xl ${stat.red ? "text-red-500" : stat.highlight ? "text-amber-600" : "text-ink"}`}>{stat.value}</p>
              <p className={`mt-1 text-[10px] font-medium uppercase tracking-[0.12em] ${stat.red ? "text-red-400" : "text-ink/40"}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Client list */}
        <div className="mt-6">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
            Your clients
          </p>
          <div className="space-y-3">
            {advisorStore.clients.map((client) => {
              const docs = getDocsForClient(client);
              const summary = docSummary(docs, client.portalStore);
              const stage = DASHBOARD_STAGES.find((s) => s.id === client.stageId);
              const pct = summary.total > 0 ? Math.round((summary.approved / summary.total) * 100) : 0;

              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => { setSelectedClientId(client.id); setExpandedDocId(null); }}
                  className="w-full rounded-2xl border border-ink/10 bg-bone-50 p-4 text-left hover:border-ink/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-bone text-sm font-medium">
                        {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[15px] font-medium text-ink">{client.name}</p>
                        <p className="text-[12px] text-ink/45">{client.email}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-medium text-ink">Stage {client.stageId}</p>
                      <p className="text-[11px] text-ink/45">{stage?.title}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-ink/40 mb-1">
                      <span>{EMP_LABEL[client.employmentType]} · {client.ownership === "solo" ? "Solo" : "Joint"}</span>
                      <span>{pct}% docs approved</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-ink/8">
                      <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {summary.needsAction > 0 && (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        {summary.needsAction} needs action
                      </span>
                    )}
                    {summary.pending > 0 && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        {summary.pending} to review
                      </span>
                    )}
                    {summary.approved > 0 && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        {summary.approved} approved
                      </span>
                    )}
                    <span className="rounded-full border border-ink/12 px-2 py-0.5 text-[10px] text-ink/40">
                      Last active {formatDate(client.lastActive)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-[11px] text-ink/30">
          Demo data. In production, clients would be linked to your firm's account.
        </p>
      </main>
      <Footer />
    </>
  );
}

// ─── Client Application Panel ────────────────────────────────────────────────

function ClientApplicationPanel({ email, clientName }: { email: string; clientName: string }) {
  const [app, setApp] = useState<MortgageApplication | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const found = getApplication(email);
    setApp(found);
  }, [email]);

  if (app === undefined) return null;

  return (
    <div className="mt-6">
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-2xl border border-ink/10 bg-bone-50 px-4 py-3 sm:px-5"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink/45">
            Mortgage Application
          </span>
          {app?.status === "submitted" && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Submitted
            </span>
          )}
          {app?.status === "draft" && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Draft
            </span>
          )}
          {!app && (
            <span className="rounded-full border border-ink/12 bg-ink/4 px-2 py-0.5 text-[10px] text-ink/40">
              Not submitted
            </span>
          )}
        </div>
        <span className={`text-[10px] text-ink/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

      {open && (
        <div className="rounded-b-2xl border border-t-0 border-ink/10 bg-bone px-4 py-4 sm:px-5">
          {!app ? (
            <p className="text-sm text-ink/45 italic py-2">
              {clientName.split(" ")[0]} hasn&apos;t submitted a mortgage application yet.
            </p>
          ) : (
            <ApplicationView app={app} />
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationView({ app }: { app: MortgageApplication }) {
  const a = app.applicant1;
  const f = app.financial;
  const p = app.property;

  function fmt(iso: string) {
    return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  }

  return (
    <div className="space-y-5 text-sm">
      {/* Submitted banner */}
      {app.submittedAt && (
        <p className="text-[11px] text-ink/40">Submitted {fmt(app.submittedAt)}</p>
      )}

      {/* Mortgage type */}
      <AppSection title="Mortgage type">
        <AppRow label="Type" value={app.mortgageType === "joint" ? `Joint (${app.relationship})` : "Single applicant"} />
      </AppSection>

      {/* Personal */}
      <AppSection title="Personal details">
        <AppRow label="Full name" value={a.fullName} />
        <AppRow label="Date of birth" value={a.dateOfBirth} />
        <AppRow label="NI number" value={a.niNumber} />
        <AppRow label="Phone" value={a.phone} />
        <AppRow label="Email" value={a.email} />
        <AppRow label="Marital status" value={a.maritalStatus} />
        <AppRow label="Dependants" value={a.dependants} />
      </AppSection>

      {/* Residency */}
      <AppSection title="Nationality & residency">
        <AppRow label="UK citizen" value={a.isUkCitizen === true ? "Yes" : a.isUkCitizen === false ? "No" : "—"} />
        <AppRow label="Born in UK" value={a.bornInUk === true ? "Yes" : a.bornInUk === false ? "No" : "—"} />
        {a.bornInUk === false && <AppRow label="Country of birth" value={a.countryOfBirth} />}
        {a.bornInUk === false && <AppRow label="Arrived in UK" value={a.arrivalDate} />}
        {a.isUkCitizen === false && <AppRow label="Immigration status" value={a.immigrationStatus} />}
      </AppSection>

      {/* Address history */}
      {app.addressHistory.length > 0 && (
        <AppSection title="Address history (5 years)">
          {app.addressHistory.map((addr, i) => (
            <AppRow
              key={i}
              label={i === 0 ? "Current address" : `Previous ${i}`}
              value={[addr.line1, addr.line2, addr.city, addr.postcode].filter(Boolean).join(", ")}
            />
          ))}
        </AppSection>
      )}

      {/* Employment */}
      <AppSection title="Employment">
        <AppRow label="Status" value={a.employmentStatus ? EMPLOYMENT_LABEL[a.employmentStatus] : "—"} />
        {a.employerName && <AppRow label="Employer" value={a.employerName} />}
        {a.jobTitle && <AppRow label="Job title" value={a.jobTitle} />}
        {a.employmentStartDate && <AppRow label="Start date" value={a.employmentStartDate} />}
        {a.isPermanent !== null && <AppRow label="Contract" value={a.isPermanent ? "Permanent" : "Fixed term"} />}
        {a.businessName && <AppRow label="Business name" value={a.businessName} />}
        {a.yearsTrading && <AppRow label="Years trading" value={a.yearsTrading} />}
      </AppSection>

      {/* Income */}
      <AppSection title="Income">
        <AppRow label="Annual gross salary" value={a.annualGrossSalary ? `£${Number(a.annualGrossSalary).toLocaleString()}` : "—"} />
        {a.annualBonus && <AppRow label="Annual bonus" value={`£${Number(a.annualBonus).toLocaleString()}`} />}
        {a.otherIncome && <AppRow label="Other income" value={`£${Number(a.otherIncome).toLocaleString()} — ${a.otherIncomeSource}`} />}
      </AppSection>

      {/* Financial */}
      <AppSection title="Financial commitments & outgoings">
        <AppRow label="Existing mortgage" value={f.hasExistingMortgage ? `Yes — £${f.existingMortgageMonthly}/mo (${f.existingMortgageLender})` : "None"} />
        <AppRow label="Personal loans" value={f.hasPersonalLoans ? `Balance £${f.personalLoanBalance}, £${f.personalLoanMonthly}/mo` : "None"} />
        <AppRow label="Car finance" value={f.hasCarFinance ? `£${f.carFinanceMonthly}/mo` : "None"} />
        <AppRow label="Credit cards" value={f.hasCreditCards ? `Balance £${f.creditCardBalance}, min £${f.creditCardMonthlyMin}/mo` : "None"} />
        <AppRow label="Student loan" value={f.hasStudentLoan ? `£${f.studentLoanMonthly}/mo` : "None"} />
        {f.councilTax && <AppRow label="Council tax" value={`£${f.councilTax}/mo`} />}
        {f.utilities && <AppRow label="Utilities" value={`£${f.utilities}/mo`} />}
        {f.childcareCosts && <AppRow label="Childcare" value={`£${f.childcareCosts}/mo`} />}
        {f.otherOutgoings && <AppRow label="Other outgoings" value={`£${f.otherOutgoings}/mo`} />}
      </AppSection>

      {/* Property */}
      <AppSection title="Property details">
        {p.propertyAddress && <AppRow label="Address" value={p.propertyAddress} />}
        <AppRow label="Purchase price" value={p.purchasePrice ? `£${Number(p.purchasePrice).toLocaleString()}` : "—"} />
        <AppRow label="Deposit" value={p.depositAmount ? `£${Number(p.depositAmount).toLocaleString()}` : "—"} />
        {p.depositSource && <AppRow label="Deposit source" value={DEPOSIT_SOURCE_LABEL[p.depositSource]} />}
        {p.propertyType && <AppRow label="Property type" value={PROPERTY_TYPE_LABEL[p.propertyType]} />}
        {p.tenure && <AppRow label="Tenure" value={p.tenure} />}
      </AppSection>

      {/* Joint applicant */}
      {app.mortgageType === "joint" && app.applicant2?.fullName && (
        <AppSection title="Second applicant">
          <AppRow label="Name" value={app.applicant2.fullName ?? "—"} />
          <AppRow label="DOB" value={app.applicant2.dateOfBirth ?? "—"} />
          <AppRow label="NI number" value={app.applicant2.niNumber ?? "—"} />
          <AppRow label="Employment" value={app.applicant2.employmentStatus ? EMPLOYMENT_LABEL[app.applicant2.employmentStatus] : "—"} />
          <AppRow label="Gross income" value={app.applicant2.annualGrossSalary ? `£${Number(app.applicant2.annualGrossSalary).toLocaleString()}` : "—"} />
        </AppSection>
      )}
    </div>
  );
}

function AppSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/40">{title}</p>
      <div className="overflow-hidden rounded-xl border border-ink/8 divide-y divide-ink/6">{children}</div>
    </div>
  );
}

function AppRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <p className="text-[12px] text-ink/45 shrink-0">{label}</p>
      <p className="text-[12px] text-ink text-right">{value}</p>
    </div>
  );
}

// ─── Advisor upload row ────────────────────────────────────────────────────────

function AdvisorUploadRow({ onUpload }: { onUpload: (f: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/40">Upload on behalf of buyer</p>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 rounded-xl border border-dashed border-ink/20 px-4 py-2.5 text-[12px] text-ink/50 hover:border-ink/40 hover:text-ink/70 transition-colors"
      >
        <span>📎</span> Choose file to upload
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
    </div>
  );
}
