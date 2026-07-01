"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readConsent,
  writeConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

type Mode = "hidden" | "banner" | "customize";

export function CookieBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setMode("banner");
    }
    // Allow the footer "Cookie settings" link to reopen the banner.
    const onReopen = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setMode("customize");
    };
    window.addEventListener("ds-open-cookie-settings", onReopen);
    return () => {
      window.removeEventListener("ds-open-cookie-settings", onReopen);
    };
  }, []);

  if (mode === "hidden") return null;

  function accept(consent: Pick<CookieConsent, "analytics">) {
    writeConsent(consent.analytics);
    setMode("hidden");
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-6 sm:bottom-6"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-ink/10 bg-bone-50 shadow-[0_8px_32px_-8px_rgba(10,10,10,0.25)]">
        {mode === "banner" ? (
          <DefaultBanner onAcceptAll={() => accept({ analytics: true })} onEssentialOnly={() => accept({ analytics: false })} onCustomize={() => setMode("customize")} />
        ) : (
          <CustomizeBanner
            analytics={analytics}
            setAnalytics={setAnalytics}
            onSave={() => accept({ analytics })}
            onBack={() => setMode("banner")}
          />
        )}
      </div>
    </div>
  );
}

function DefaultBanner({
  onAcceptAll,
  onEssentialOnly,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onEssentialOnly: () => void;
  onCustomize: () => void;
}) {
  return (
    <div className="p-5 sm:p-6">
      <p
        id="cookie-banner-title"
        className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400"
      >
        About cookies
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
        Clinkeys uses a small sign-in cookie when you save your progress. That
        one is essential and doesn&apos;t need consent. Anything beyond that
        (analytics, etc.) only runs if you say yes.{" "}
        <Link
          href="/cookies"
          className="text-ink underline underline-offset-2 hover:text-ink-700"
        >
          Read the details
        </Link>
        .
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onEssentialOnly}
          className="btn-ghost"
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="btn-solid"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={onCustomize}
          className="ml-1 text-[13px] text-ink/60 underline-offset-4 hover:underline"
        >
          Customise
        </button>
      </div>
    </div>
  );
}

function CustomizeBanner({
  analytics,
  setAnalytics,
  onSave,
  onBack,
}: {
  analytics: boolean;
  setAnalytics: (v: boolean) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <div className="p-5 sm:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400">
        Customise your cookies
      </p>

      <div className="mt-4 space-y-3">
        <CookieRow
          title="Essential"
          description="Used to keep you signed in via your magic link. Required for the dashboard to work."
          enabled
          locked
        />
        <CookieRow
          title="Analytics"
          description="Helps us understand which guides are useful and which aren't. We don't use ad tracking or sell data."
          enabled={analytics}
          onToggle={() => setAnalytics(!analytics)}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={onBack} className="btn-ghost">
          Back
        </button>
        <button type="button" onClick={onSave} className="btn-solid">
          Save preferences
        </button>
      </div>
    </div>
  );
}

function CookieRow({
  title,
  description,
  enabled,
  locked,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ink/10 bg-bone p-3.5">
      <div>
        <p className="font-serif text-[15px] text-ink">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink/60">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title} cookies`}
        onClick={locked ? undefined : onToggle}
        disabled={locked}
        className={
          "relative mt-1 h-6 w-10 shrink-0 rounded-full border transition-colors " +
          (enabled
            ? "border-ink bg-ink"
            : "border-ink/30 bg-bone-200") +
          (locked ? " cursor-not-allowed opacity-80" : " cursor-pointer")
        }
      >
        <span
          aria-hidden="true"
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-bone transition-transform " +
            (enabled ? "translate-x-[18px]" : "translate-x-0.5")
          }
        />
      </button>
    </div>
  );
}
