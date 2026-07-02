"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "clinkeys_unlocked";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Glassdoor-style content gate. Shows a blurred, clipped teaser of the
 * children and overlays an email-capture card. Once the visitor submits
 * their email (stored in localStorage) the full content is revealed and
 * stays unlocked across the site.
 *
 * SEO note: the full content is always rendered in the DOM — it is only
 * visually blurred/clipped with CSS — so search engines still index it.
 * The wrapper is marked `.gated-content` to pair with the paywall
 * (isAccessibleForFree:false / hasPart) structured data on the page.
 */
export function ContentGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, source: "guide-gate" }),
      });
    } catch {
      /* still unlock — the address is captured client-side */
    } finally {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setSubmitting(false);
      setUnlocked(true);
    }
  }

  // Once unlocked (or before hydration), show the content normally so there's
  // no flash of a gate for returning, already-unlocked visitors.
  if (unlocked) {
    return <div className="gated-content">{children}</div>;
  }

  return (
    <div className="gated-content relative">
      {/* Blurred, clipped teaser — real content, kept in the DOM for SEO */}
      <div className="gate-locked" aria-hidden={mounted ? "true" : undefined}>
        {children}
      </div>

      {/* Unlock card, pulled up over the faded teaser */}
      <div className="relative z-10 -mt-28 flex justify-center px-4 sm:-mt-32">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-ink/10 bg-bone p-6 text-center shadow-[0_8px_40px_-12px_rgba(10,10,10,0.18)] sm:p-8">
          <p className="eyebrow">Free to read</p>
          <h2 className="mt-3 font-serif text-2xl leading-snug tracking-tightish text-ink">
            Read the full guide free
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">
            Pop in your email to unlock this guide and every other Clinkeys
            home-buying guide — plus tips and updates as you go. No spam,
            unsubscribe anytime.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-ink/30 pb-2 focus-within:border-ink">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-solid disabled:opacity-50"
              >
                {submitting ? "…" : "Unlock"}
              </button>
            </div>
            {error && <p className="text-left text-xs text-accent-400">{error}</p>}
          </form>

          <p className="mt-4 text-xs text-ink/40">
            Free to read — we just ask for your email so we can keep the guides
            coming.
          </p>
        </div>
      </div>
    </div>
  );
}
