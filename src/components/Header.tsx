"use client";

import Link from "next/link";
import { useState } from "react";
import { ClinksyMark } from "@/components/ClinksyMark";

const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Advisors", href: "/advisor-portal" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-ink/10">
      <div className="container-narrow flex items-center justify-between py-4 sm:py-5">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Clinksy home"
          onClick={() => setOpen(false)}
        >
          <ClinksyMark className="h-8 w-8" />
          <span className="font-serif text-2xl lowercase tracking-tightish text-ink">
            clinksy
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-[15px] sm:flex sm:gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-ink/70 transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/start" className="btn-solid">
            See my next steps
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-ink/10 sm:hidden">
          <div className="container-narrow flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink/80 transition-colors hover:bg-ink/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/start"
              onClick={() => setOpen(false)}
              className="btn-solid mt-2 w-full"
            >
              See my next steps
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
