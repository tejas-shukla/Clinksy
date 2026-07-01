"use client";

// DashboardGate — shown when no user is found in localStorage.
// Asks for email only to save progress and allow returning later.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type StoredUser } from "@/lib/user-store";

type Props = {
  onLogin: (user: StoredUser) => void;
};

export function DashboardGate({ onLogin }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    onLogin({ name: trimmedEmail.split("@")[0], email: trimmedEmail });
  }

  function skip() {
    router.push("/start");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-50 text-2xl">
            🏡
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center font-serif text-3xl leading-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink/60">
          Enter your email to pick up where you left off. No password needed.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-bone-50"
        >
          <div className="px-5 py-4">
            <label
              htmlFor="gate-email"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45"
            >
              Email address
            </label>
            <input
              id="gate-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-base text-ink placeholder-ink/25 focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="border-t border-ink/8 px-5 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="border-t border-ink/10 p-5">
            <button
              type="submit"
              className="btn-solid w-full py-3 text-base"
            >
              Open my dashboard →
            </button>
          </div>
        </form>

        {/* New user CTA */}
        <div className="mt-5 text-center">
          <p className="text-sm text-ink/50">
            First time here?{" "}
            <button
              type="button"
              onClick={skip}
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Tell us where you are in your journey →
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-ink/35">
          Your details are stored only in your browser.
        </p>
      </div>
    </div>
  );
}
