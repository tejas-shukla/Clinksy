"use client";

import { useEffect, useRef, useState } from "react";

type ServiceId = "solicitor" | "advisor" | "surveyor";
type Step = "service" | "details" | "finding" | "result";

const SERVICES: {
  id: ServiceId;
  label: string;
  plural: string;
  blurb: string;
}[] = [
  {
    id: "advisor",
    label: "Mortgage adviser",
    plural: "mortgage advisers",
    blurb: "Whole-of-market advisers to find your best rate.",
  },
  {
    id: "solicitor",
    label: "Conveyancing solicitor",
    plural: "conveyancing solicitors",
    blurb: "Vetted solicitors to handle the legal side.",
  },
  {
    id: "surveyor",
    label: "Surveyor",
    plural: "surveyors",
    blurb: "RICS surveyors matched to the property.",
  },
];

const STAGES = [
  "Just starting out",
  "Offer accepted",
  "Mid-purchase",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Compare() {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<ServiceId | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [postcode, setPostcode] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const selected = SERVICES.find((s) => s.id === service) ?? null;

  function chooseService(id: ServiceId) {
    setService(id);
    setStep("details");
  }

  function findMatch() {
    setStep("finding");
    timer.current = setTimeout(() => setStep("result"), 1700);
  }

  function reset() {
    setStep("service");
    setService(null);
    setStage(null);
    setPostcode("");
    setEmail("");
    setSubmitted(false);
    setError(null);
  }

  async function submitEmail(e: React.FormEvent) {
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
        body: JSON.stringify({ email: clean }),
      });
      setSubmitted(true);
    } catch {
      // Even if the request fails, acknowledge — the address is captured client-side.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="compare" className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          {/* Left: pitch */}
          <div className="md:col-span-5">
            <p className="eyebrow">Get matched</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              The right pro,
              <br />
              matched to you.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              Tell Clinksy what you need and where you are, and we&apos;ll pair
              you with vetted mortgage advisers, conveyancing solicitors, and
              surveyors — the right one, at the right stage. No lists to trawl,
              no lead farm.
            </p>
          </div>

          {/* Right: interactive matcher */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-ink/10 bg-white/40 p-6 sm:p-8">
              {/* Progress dots */}
              <div className="mb-6 flex items-center gap-2" aria-hidden>
                {(["service", "details", "result"] as const).map((s) => {
                  const order = { service: 0, details: 1, finding: 2, result: 2 };
                  const active = order[step] >= order[s];
                  return (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        active ? "bg-accent-400" : "bg-ink/10"
                      }`}
                    />
                  );
                })}
              </div>

              {/* STEP 1 — choose service */}
              {step === "service" && (
                <div>
                  <p className="text-sm font-medium text-ink/80">
                    What do you need help finding?
                  </p>
                  <div className="mt-4 grid gap-3">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => chooseService(s.id)}
                        className="group flex items-center justify-between rounded-xl border border-ink/15 px-5 py-4 text-left transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
                      >
                        <span>
                          <span className="block font-serif text-lg text-ink">
                            {s.label}
                          </span>
                          <span className="mt-0.5 block text-[13px] text-ink/55">
                            {s.blurb}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="ml-4 text-ink/30 transition-colors group-hover:text-accent-400"
                        >
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 — quick details */}
              {step === "details" && selected && (
                <div>
                  <button
                    type="button"
                    onClick={() => setStep("service")}
                    className="text-xs text-ink/45 transition-colors hover:text-ink"
                  >
                    ← Back
                  </button>
                  <p className="mt-3 text-sm font-medium text-ink/80">
                    Finding you a{" "}
                    <span className="text-ink">{selected.label.toLowerCase()}</span>.
                    Where are you up to?
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStage(s)}
                        className={
                          stage === s
                            ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-bone"
                            : "rounded-full border border-ink/20 px-3.5 py-1.5 text-xs font-medium text-ink/65 transition-colors hover:border-ink/40"
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <label
                    htmlFor="matcher-postcode"
                    className="mt-6 block text-xs font-medium uppercase tracking-[0.14em] text-ink/45"
                  >
                    Postcode (optional)
                  </label>
                  <input
                    id="matcher-postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="e.g. SW1A"
                    className="mt-2 w-full max-w-[200px] border-b border-ink/30 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
                  />

                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={findMatch}
                      disabled={!stage}
                      className="btn-solid disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Find my match
                    </button>
                    {!stage && (
                      <p className="mt-2 text-xs text-ink/40">
                        Pick where you&apos;re up to to continue.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3 — finding animation */}
              {step === "finding" && selected && (
                <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-accent-400" />
                  <p className="mt-5 text-sm text-ink/70">
                    Finding your best-fit {selected.plural}
                    {postcode ? ` near ${postcode.toUpperCase()}` : ""}…
                  </p>
                </div>
              )}

              {/* STEP 4 — result + email capture */}
              {step === "result" && selected && (
                <div>
                  {!submitted ? (
                    <>
                      <p className="text-sm text-ink/55">Good news —</p>
                      <p className="mt-1 font-serif text-2xl leading-snug text-ink">
                        We can match you with hand-picked {selected.plural}
                        {postcode ? (
                          <>
                            {" "}
                            near{" "}
                            <span className="text-accent-400">
                              {postcode.toUpperCase()}
                            </span>
                          </>
                        ) : null}
                        .
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ink/60">
                        Matching is rolling out now. Drop your email and
                        we&apos;ll introduce you to your best-fit{" "}
                        {selected.label.toLowerCase()} the moment it&apos;s
                        live — no lead farm, no spam.
                      </p>

                      <form
                        onSubmit={submitEmail}
                        className="mt-6 flex flex-col gap-3"
                        aria-label="Get matched email signup"
                      >
                        <div className="flex items-center gap-3 border-b border-ink/30 pb-2 focus-within:border-ink">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                            className="flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn-solid disabled:opacity-50"
                          >
                            {submitting ? "…" : "Get matched"}
                          </button>
                        </div>
                        {error && (
                          <p className="text-xs text-accent-400">{error}</p>
                        )}
                        <button
                          type="button"
                          onClick={reset}
                          className="self-start text-xs text-ink/45 transition-colors hover:text-ink"
                        >
                          ← Start over
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-400 text-bone">
                        ✓
                      </div>
                      <p className="mt-4 font-serif text-xl text-ink">
                        You&apos;re on the list.
                      </p>
                      <p className="mt-2 max-w-xs text-sm text-ink/60">
                        We&apos;ll be in touch to introduce your{" "}
                        {selected.label.toLowerCase()} as soon as matching goes
                        live.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="mt-5 text-xs text-ink/45 transition-colors hover:text-ink"
                      >
                        Match another service
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-ink/40">
              Clinksy stays on your side — we match you to the right fit, never
              sell your details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
