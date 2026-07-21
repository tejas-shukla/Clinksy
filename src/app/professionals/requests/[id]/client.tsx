"use client";

// Accept/decline page for a matched client request.
// Buyer contact details are only revealed after acceptance.

import { useCallback, useEffect, useState } from "react";

type AssignmentView = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  expiresAt: string;
  professionalName: string;
  request: {
    role: string;
    propertyPostcode: string;
    propertyPrice?: number | null;
    buyerType?: string | null;
    employmentType?: string | null;
    depositPercent?: number | null;
    creditIssues?: boolean;
    schemeUsage?: string | null;
    lender?: string | null;
    surveyType?: string | null;
    timeline?: string | null;
    notes?: string | null;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string | null;
  };
};

const pretty = (v?: string | null) =>
  v ? v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : null;

export default function RequestClient({ assignmentId }: { assignmentId: string }) {
  const [data, setData] = useState<AssignmentView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Request not found.");
        return;
      }
      setData(json);
    } catch {
      setError("Couldn't load this request. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(action: "accept" | "decline") {
    setActing(true);
    setError(null);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, declineReason: declineReason || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
      }
      await load();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setActing(false);
      setDeclining(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Request unavailable</h1>
        <p className="mt-3 text-ink-400">{error}</p>
      </main>
    );
  }

  if (!data) return null;

  const r = data.request;
  const hoursLeft = Math.max(
    0,
    Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 3_600_000),
  );

  const rows: [string, string | null][] = [
    ["Property location", r.propertyPostcode],
    ["Property price", r.propertyPrice ? `£${r.propertyPrice.toLocaleString("en-GB")}` : null],
    ["Buyer type", pretty(r.buyerType)],
    ["Employment", pretty(r.employmentType)],
    ["Deposit", r.depositPercent != null ? `${r.depositPercent}%` : null],
    ["Credit issues", r.creditIssues ? "Yes" : null],
    ["Scheme", pretty(r.schemeUsage)],
    ["Lender", r.lender ?? null],
    ["Survey type", pretty(r.surveyType)],
    ["Timeline", r.timeline ?? null],
  ];

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-accent-500">
        Client request
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">
        {data.status === "PENDING" && "A buyer needs you."}
        {data.status === "ACCEPTED" && "Request accepted."}
        {data.status === "DECLINED" && "Request declined."}
        {data.status === "EXPIRED" && "This request has expired."}
      </h1>

      {data.status === "PENDING" && (
        <p className="mt-2 text-ink-400">
          Hi {data.professionalName} — respond within{" "}
          <span className="font-medium text-ink">{hoursLeft} hours</span> or this request
          passes to the next professional.
        </p>
      )}
      {data.status === "EXPIRED" && (
        <p className="mt-2 text-ink-400">
          It wasn&apos;t accepted within 24 hours, so it&apos;s been passed to another
          professional.
        </p>
      )}

      <div className="mt-8 divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-white">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
              <span className="text-ink-400">{k}</span>
              <span className="text-right font-medium text-ink">{v}</span>
            </div>
          ))}
        {r.notes && (
          <div className="px-5 py-3.5 text-sm">
            <span className="text-ink-400">Notes</span>
            <p className="mt-1 text-ink">{r.notes}</p>
          </div>
        )}
      </div>

      {data.status === "ACCEPTED" && r.buyerName && (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-bone-50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Your new client
          </h2>
          <p className="mt-2 text-lg font-medium text-ink">{r.buyerName}</p>
          <p className="text-ink">{r.buyerEmail}</p>
          {r.buyerPhone && <p className="text-ink">{r.buyerPhone}</p>}
          <p className="mt-3 text-sm text-ink-400">
            They&apos;ve been told you accepted — reach out within a working day.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {data.status === "PENDING" && !declining && (
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => respond("accept")}
            disabled={acting}
            className="flex-1 rounded-full bg-ink px-8 py-4 text-base font-medium text-white transition hover:bg-ink-600 disabled:opacity-50"
          >
            {acting ? "Working…" : "Accept request"}
          </button>
          <button
            onClick={() => setDeclining(true)}
            disabled={acting}
            className="rounded-full border border-ink/15 px-8 py-4 text-base font-medium text-ink transition hover:border-ink/40 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}

      {data.status === "PENDING" && declining && (
        <div className="mt-8 space-y-3">
          <label className="block text-sm font-medium text-ink">
            Why are you declining? (optional — helps us send you better matches)
          </label>
          <textarea
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-base text-ink focus:border-ink focus:outline-none"
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. At capacity this week, outside my patch…"
          />
          <div className="flex gap-3">
            <button
              onClick={() => respond("decline")}
              disabled={acting}
              className="flex-1 rounded-full bg-ink px-8 py-3.5 text-base font-medium text-white transition hover:bg-ink-600 disabled:opacity-50"
            >
              {acting ? "Working…" : "Confirm decline"}
            </button>
            <button
              onClick={() => setDeclining(false)}
              disabled={acting}
              className="rounded-full border border-ink/15 px-6 py-3.5 text-base text-ink"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
