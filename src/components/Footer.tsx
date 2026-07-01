import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";

const GUIDE_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "All guides", href: "/guides" },
  { label: "First-time buyer guide", href: "/guides/first-time-buyer-guide-uk" },
  { label: "Cost of buying a house", href: "/guides/cost-of-buying-a-house-uk" },
  { label: "Leasehold vs freehold", href: "/guides/leasehold-vs-freehold-uk" },
  { label: "What is conveyancing?", href: "/guides/what-is-conveyancing-uk" },
  { label: "How long does it take?", href: "/guides/how-long-does-buying-a-house-take-uk" },
];

const STAGE_LINKS = [
  { label: "Mortgage in principle", href: "/guides/mortgage-in-principle-uk" },
  { label: "Finding a home", href: "/guides/find-a-home-uk" },
  { label: "Making an offer", href: "/guides/make-an-offer-uk" },
  { label: "Property surveys", href: "/guides/property-survey-uk" },
  { label: "Conveyancing solicitor", href: "/guides/instruct-a-solicitor-uk" },
  { label: "Exchange of contracts", href: "/guides/exchange-contracts-uk" },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-ink/10">
      <div className="container-narrow py-14">
        {/* Top: brand + columns */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-serif text-2xl tracking-tightish text-ink">Clinksy</p>
            <p className="mt-1 text-xs text-ink/50">Made in the UK.</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/55">
              Plain-English guidance for first-time UK home buyers. Free, no lead farm.
            </p>
          </div>

          {/* Guides column */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/40">
              Guides
            </p>
            <ul className="mt-4 space-y-2.5">
              {GUIDE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/65 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stage guides column */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/40">
              By stage
            </p>
            <ul className="mt-4 space-y-2.5">
              {STAGE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/65 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink/40">
              Company
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "Get started", href: "/start" },
                { label: "Privacy policy", href: "/privacy" },
                { label: "Cookie settings", href: "/cookies" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/65 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsLink />
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ink/40">
          Clinksy is an information assistant, not a regulated advisor. For
          mortgage, legal, or financial decisions, always consult an
          appropriately qualified professional. © {new Date().getFullYear()} Clinksy.
        </p>
      </div>
    </footer>
  );
}
