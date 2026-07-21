"use client";

// Admin — verify and manage professionals.
// Gate: admin key checked against ADMIN_SECRET server-side on every call;
// kept in sessionStorage only so a refresh doesn't ask again mid-session.

import { useCallback, useEffect, useState } from "react";

type Professional = {
  id: string;
  role: "MORTGAGE_ADVISOR" | "SOLICITOR" | "SURVEYOR";
  status: "PENDING_VERIFICATION" | "ACTIVE" | "PAUSED" | "REJECTED";
  name: string;
  firmName?: string | null;
  email: string;
  phone?: string | null;
  registrationNumber: string;
  registrationBody: string;
  basePostcode?: string | null;
  coverageAreas: string[];
  nationwide: boolean;
  jurisdiction?: string | null;
  specialisations: string[];
  surveyTypes: string[];
  weeklyCapacity: number;
  consecutiveTimeouts: number;
  totalAccepted: number;
  totalDeclined: number;
  totalExpired: number;
  createdAt: string;
  _count: { assignments: number };
};

const KEY_STORAGE = "clinkeys_admin_key";

const ROLE_LABEL: Record<Professional["role"], string> = {
  MORTGAGE_ADVISOR: "Mortgage advisor",
  SOLICITOR: "Solicitor",
  SURVEYOR: "Surveyor",
};

const STATUS_STYLE: Record<Professional["status"], string> = {
  PENDING_VERIFICATION: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-slate-200 text-slate-700",
  REJECTED: "bg-red-100 text-red-700",
};

function registerUrl(p: Professional): string {
  if (p.registrationBody === "FCA")
    return `https://register.fca.org.uk/s/search?q=${encodeURIComponent(p.registrationNumber)}&type=Companies`;
  if (p.registrationBody === "SRA") return "https://www.sra.org.uk/consumers/register/";
  if (p.registrationBody === "CLC") return "https://www.clc-uk.org/lawyer-search/";
  return "https://www.ricsfirms.com/";
}

export default function AdminClient() {
  const [adminKey, setAdminKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [pros, setPros] = useState<Professional[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Professional["status"]>("PENDING_VERIFICATION");

  const load = useCallback(async (key: string) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/professionals", {
        headers: { "x-admin-key": key },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(KEY_STORAGE);
        setAdminKey("");
        setError("Wrong admin key.");
        return;
      }
      const json = await res.json();
      setPros(json.professionals);
    } catch {
      setError("Couldn't load professionals.");
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) {
      setAdminKey(saved);
      load(saved);
    }
  }, [load]);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;
    sessionStorage.setItem(KEY_STORAGE, key);
    setAdminKey(key);
    load(key);
  }

  async function setStatus(id: string, status: Professional["status"]) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Update failed.");
        return;
      }
      await load(adminKey);
    } catch {
      setError("Update failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!adminKey) {
    return (
      <main className="mx-auto max-w-sm px-6 py-24">
        <h1 className="text-2xl font-semibold text-ink">Admin</h1>
        <form onSubmit={unlock} className="mt-6 space-y-3">
          <input
            type="password"
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink focus:border-ink focus:outline-none"
            placeholder="Admin key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-full bg-ink px-6 py-3 font-medium text-white">
            Unlock
          </button>
        </form>
      </main>
    );
  }

  const filtered = (pros ?? []).filter((p) => filter === "all" || p.status === filter);
  const pendingCount = (pros ?? []).filter((p) => p.status === "PENDING_VERIFICATION").length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Professionals</h1>
          <p className="mt-1 text-ink-400">
            {pendingCount} awaiting verification · {(pros ?? []).length} total
          </p>
        </div>
        <button
          onClick={() => load(adminKey)}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink hover:border-ink/40"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["PENDING_VERIFICATION", "ACTIVE", "PAUSED", "REJECTED", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filter === f
                ? "border-ink bg-ink text-white"
                : "border-ink/15 bg-white text-ink hover:border-ink/40"
            }`}
          >
            {f === "all" ? "All" : f.replace(/_/g, " ").toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-4">
        {pros === null && <p className="text-ink-400">Loading…</p>}
        {pros !== null && filtered.length === 0 && (
          <p className="text-ink-400">Nothing here.</p>
        )}
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-ink">{p.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                    {p.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-400">
                  {ROLE_LABEL[p.role]}
                  {p.firmName ? ` · ${p.firmName}` : ""} · {p.email}
                  {p.phone ? ` · ${p.phone}` : ""}
                </p>
              </div>
              <a
                href={registerUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-ink/15 px-4 py-1.5 text-sm text-ink hover:border-ink/40"
              >
                Verify {p.registrationBody} {p.registrationNumber} ↗
              </a>
            </div>

            <div className="mt-3 grid gap-x-8 gap-y-1 text-sm text-ink-400 sm:grid-cols-2">
              <span>
                Coverage:{" "}
                {p.nationwide
                  ? "Nationwide"
                  : p.jurisdiction
                    ? p.jurisdiction.replace(/_/g, " & ").toLowerCase()
                    : p.coverageAreas.join(", ") || "—"}
                {p.basePostcode ? ` (base ${p.basePostcode})` : ""}
              </span>
              <span>Capacity: {p.weeklyCapacity}/week</span>
              <span className="sm:col-span-2">
                Specialisms:{" "}
                {[...p.specialisations, ...p.surveyTypes]
                  .map((s) => s.replace(/_/g, " ").toLowerCase())
                  .join(", ") || "—"}
              </span>
              <span>
                Track record: {p.totalAccepted} accepted · {p.totalDeclined} declined ·{" "}
                {p.totalExpired} timed out
                {p.consecutiveTimeouts > 0 ? ` (${p.consecutiveTimeouts} in a row)` : ""}
              </span>
              <span>
                {p._count.assignments} total requests · joined{" "}
                {new Date(p.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.status !== "ACTIVE" && (
                <button
                  onClick={() => setStatus(p.id, "ACTIVE")}
                  disabled={busy === p.id}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-ink-600 disabled:opacity-50"
                >
                  {p.status === "PAUSED" ? "Reactivate" : "Activate"}
                </button>
              )}
              {p.status === "ACTIVE" && (
                <button
                  onClick={() => setStatus(p.id, "PAUSED")}
                  disabled={busy === p.id}
                  className="rounded-full border border-ink/15 px-5 py-2 text-sm text-ink hover:border-ink/40 disabled:opacity-50"
                >
                  Pause
                </button>
              )}
              {p.status === "PENDING_VERIFICATION" && (
                <button
                  onClick={() => setStatus(p.id, "REJECTED")}
                  disabled={busy === p.id}
                  className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-600 hover:border-red-400 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
