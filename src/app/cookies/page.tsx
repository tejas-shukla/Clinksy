import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";

export const metadata = {
  title: "Cookies",
  description:
    "What cookies Clinkeys uses, why we use them, and how to change your preferences at any time.",
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="container-narrow py-16 sm:py-20 md:py-24">
        <p className="eyebrow">Cookies</p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tightish text-ink sm:text-5xl">
          What we set, and why.
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-12 max-w-2xl space-y-6 text-[15px] leading-relaxed text-ink/75">
          <p>
            We use the smallest set of cookies we can get away with. Two
            categories, with one cookie each at the moment.
          </p>
        </div>

        <div className="mt-10 max-w-3xl overflow-hidden rounded-2xl border border-ink/10 bg-bone-50">
          <Row
            name="ds_session"
            purpose="Keeps you signed in after you click your magic link, so the dashboard knows it's you."
            type="Essential"
            duration="12 months"
            badge="No consent needed"
          />
          <Row
            name="ds_cookie_consent (localStorage)"
            purpose="Remembers your cookie preferences so we don't show the banner every visit."
            type="Essential"
            duration="Until you clear it"
            badge="No consent needed"
            divider
          />
          <Row
            name="Analytics (none currently)"
            purpose="If you say yes, we may add privacy-friendly analytics (e.g. Plausible) to see which guides are useful. We do not use Google Analytics, advertising trackers, or social-media pixels."
            type="Analytics"
            duration="Opt-in only"
            badge="Off by default"
            divider
          />
        </div>

        <div className="mt-10 max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink/75">
          <h2 className="font-serif text-2xl leading-tight tracking-tightish text-ink sm:text-[28px]">
            Managing your preferences
          </h2>
          <p>
            You can change your mind at any time. Open the cookie settings
            from the footer of any page — or use this button:
          </p>
          <p>
            <span className="inline-flex rounded-full border border-ink/30 px-4 py-2 text-sm font-medium text-ink/80">
              <CookieSettingsLink />
            </span>
          </p>
          <p>
            You can also clear cookies and site data via your browser
            settings. We won&apos;t try to override that — if you say no, the
            answer stays no.
          </p>
        </div>

        <p className="mt-12 max-w-2xl rounded-2xl border border-ink/10 bg-bone-50 p-4 text-xs leading-relaxed text-ink/55">
          This page describes our current setup. As we add features (real
          analytics, persistent dashboard storage, optional integrations),
          we&apos;ll update both this page and the consent banner.
        </p>
      </main>
      <Footer />
    </>
  );
}

function Row({
  name,
  purpose,
  type,
  duration,
  badge,
  divider,
}: {
  name: string;
  purpose: string;
  type: string;
  duration: string;
  badge: string;
  divider?: boolean;
}) {
  return (
    <div className={"p-5 sm:p-6 " + (divider ? "border-t border-ink/10" : "")}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <code className="font-mono text-[13px] text-ink">{name}</code>
        <span className="rounded-full bg-bone px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">
          {type}
        </span>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{purpose}</p>
      <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-ink/55">
        <span>Duration: <span className="text-ink/75">{duration}</span></span>
        <span>{badge}</span>
      </div>
    </div>
  );
}
