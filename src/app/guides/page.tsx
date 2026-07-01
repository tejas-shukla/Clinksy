import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DASHBOARD_STAGES, PHASE_NAMES, STAGE_ID_TO_PHASE } from "@/lib/journey-data";
import { TOPIC_GUIDES } from "@/lib/topic-guides";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://clinkeys.com";

export const metadata: Metadata = {
  title: "UK home buying guides — plain English for every stage",
  description:
    "Free, plain-English guides for every stage of buying a home in the UK. Costs, timelines, and the right questions to ask — written for first-time buyers.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "UK home buying guides — Clinkeys",
    description:
      "Plain-English guides for every stage of buying a home in the UK, from mortgage in principle to picking up the keys.",
    url: `${SITE_URL}/guides`,
    type: "website",
  },
};

export default function GuidesIndex() {
  // Group stage guides by marketing phase.
  const byPhase = PHASE_NAMES.map((phaseName, i) => {
    const phase = i + 1;
    const stages = DASHBOARD_STAGES.filter((s) => STAGE_ID_TO_PHASE[s.id] === phase);
    return { phase, phaseName, stages };
  });

  // Schema.org CollectionPage — all guides (stages + topics).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "UK Home Buying Guides",
    description: "Free, plain-English guides for every stage of buying a home in the UK.",
    url: `${SITE_URL}/guides`,
    publisher: { "@type": "Organization", name: "Clinkeys", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        ...DASHBOARD_STAGES.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/guides/${s.slug}`,
          name: s.guideTitle,
        })),
        ...TOPIC_GUIDES.map((g, i) => ({
          "@type": "ListItem",
          position: DASHBOARD_STAGES.length + i + 1,
          url: `${SITE_URL}/guides/${g.slug}`,
          name: g.guideTitle,
        })),
      ],
    },
  };

  return (
    <>
      <Header />
      <main className="container-narrow py-14 sm:py-20 md:py-24">
        <p className="eyebrow">Guides</p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tightish text-ink sm:text-5xl md:text-[60px]">
          UK home buying,
          <br />
          one stage at a time.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">
          Free, plain-English guides for every step of buying a home in the UK — what happens, how long it takes, what it costs, and what to watch out for.
          Free to read, no lead farm.
        </p>

        {/* ── Stage guides ─────────────────────────────────────────── */}
        {byPhase.map((group) => (
          <section key={group.phase} className="mt-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400">
              Phase {group.phase} · {group.phaseName}
            </p>
            <ul className="mt-5 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-bone-50">
              {group.stages.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/guides/${s.slug}`}
                    className="block px-5 py-5 transition-colors hover:bg-bone sm:px-6"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <div>
                        <p className="font-serif text-2xl leading-tight tracking-tightish text-ink">
                          Stage {s.id} — {s.title}
                        </p>
                        <p className="mt-1 text-sm text-ink/65">{s.blurb}</p>
                      </div>
                      <p className="text-xs text-ink/45 sm:shrink-0 sm:text-right">
                        {s.timescale}
                        <br />
                        {s.cost}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* ── Topic / deep-dive guides ─────────────────────────────── */}
        <section className="mt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink/50">
            Deep dives
          </p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/65">
            Longer guides that go deep on the topics buyers ask about most — costs, legal jargon, property types, and the UK timeline.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {TOPIC_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block h-full rounded-2xl border border-ink/10 bg-bone-50 p-5 transition-colors hover:border-ink/30 hover:bg-bone sm:p-6"
                >
                  <span className="inline-block rounded-full bg-ink/6 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/50">
                    Deep dive
                  </span>
                  <p className="mt-3 font-serif text-xl leading-snug tracking-tightish text-ink sm:text-2xl">
                    {g.headline}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{g.metaDescription}</p>
                  <p className="mt-4 text-xs font-medium text-ink/45">Read the guide →</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-ink/10 bg-bone-50 p-6 sm:p-8">
          <p className="eyebrow">Use the guides smarter</p>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
            Want a personalised version of this?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
            Sign up free and your dashboard will surface the right stage for you — costs scaled to your purchase price, providers near your postcode, and proactive reminders before deadlines.
          </p>
          <div className="mt-5">
            <Link href="/start" className="btn-solid">
              See my next steps
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
