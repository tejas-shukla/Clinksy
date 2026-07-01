import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  DASHBOARD_STAGES,
  PHASE_NAMES,
  SAMPLE_PROVIDERS,
  SERVICE_LABEL,
  STAGE_ID_TO_PHASE,
  stageBySlug,
} from "@/lib/journey-data";
import { TOPIC_GUIDES, topicGuideBySlug } from "@/lib/topic-guides";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://clinksy.com";

type Params = { slug: string };

// Pre-render every stage + every topic guide at build time.
export function generateStaticParams(): Params[] {
  return [
    ...DASHBOARD_STAGES.map((s) => ({ slug: s.slug })),
    ...TOPIC_GUIDES.map((g) => ({ slug: g.slug })),
  ];
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  // Check stage guides first.
  const stage = stageBySlug(params.slug);
  if (stage) {
    const url = `${SITE_URL}/guides/${stage.slug}`;
    return {
      title: stage.guideTitle,
      description: stage.metaDescription,
      alternates: { canonical: url },
      openGraph: {
        title: stage.guideTitle,
        description: stage.metaDescription,
        url,
        type: "article",
        locale: "en_GB",
      },
      twitter: {
        card: "summary_large_image",
        title: stage.guideTitle,
        description: stage.metaDescription,
      },
    };
  }

  // Check topic guides.
  const topic = topicGuideBySlug(params.slug);
  if (topic) {
    const url = `${SITE_URL}/guides/${topic.slug}`;
    return {
      title: topic.guideTitle,
      description: topic.metaDescription,
      alternates: { canonical: url },
      openGraph: {
        title: topic.guideTitle,
        description: topic.metaDescription,
        url,
        type: "article",
        locale: "en_GB",
      },
      twitter: {
        card: "summary_large_image",
        title: topic.guideTitle,
        description: topic.metaDescription,
      },
    };
  }

  return {};
}

export default function GuidePage({ params }: { params: Params }) {
  // Try stage guide first.
  const stage = stageBySlug(params.slug);
  if (stage) {
    const phaseIndex = STAGE_ID_TO_PHASE[stage.id] - 1;
    const phaseName = PHASE_NAMES[phaseIndex];
    const prev = DASHBOARD_STAGES.find((s) => s.id === stage.id - 1);
    const next = DASHBOARD_STAGES.find((s) => s.id === stage.id + 1);

    // Related stages: pick 3 others, prioritising same phase.
    const related = [
      ...DASHBOARD_STAGES.filter(
        (s) => s.id !== stage.id && STAGE_ID_TO_PHASE[s.id] === stage.id,
      ),
      ...DASHBOARD_STAGES.filter(
        (s) => s.id !== stage.id && STAGE_ID_TO_PHASE[s.id] !== stage.id,
      ),
    ].slice(0, 3);

    // Article JSON-LD.
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: stage.guideTitle,
      description: stage.metaDescription,
      url: `${SITE_URL}/guides/${stage.slug}`,
      inLanguage: "en-GB",
      author: { "@type": "Organization", name: "Clinksy" },
      publisher: { "@type": "Organization", name: "Clinksy", url: SITE_URL },
      image: `${SITE_URL}/opengraph-image`,
      datePublished: "2025-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/guides/${stage.slug}`,
      },
      articleSection: phaseName,
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: stage.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: stage.title, item: `${SITE_URL}/guides/${stage.slug}` },
      ],
    };

    return (
      <>
        <Header />
        <main className="container-narrow py-12 sm:py-16 md:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-ink/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-ink">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/guides" className="hover:text-ink">Guides</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink/80">Stage {stage.id}</li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-accent-50 px-2.5 py-1 font-medium uppercase tracking-[0.16em] text-accent-500">
              Stage {stage.id} of 10
            </span>
            <span className="rounded-full bg-ink-50 px-2.5 py-1 font-medium uppercase tracking-[0.16em] text-ink/65">
              {phaseName}
            </span>
            <span className="text-ink/45">·</span>
            <span className="text-ink/55">{stage.timescale}</span>
          </div>

          <h1 className="mt-5 font-serif text-[40px] leading-[1.04] tracking-tightish text-ink sm:text-5xl md:text-[58px]">
            {stage.guideTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">
            {stage.metaDescription}
          </p>

          {/* Key facts strip */}
          <dl className="mt-10 grid gap-4 rounded-2xl border border-ink/10 bg-bone-50 p-6 sm:grid-cols-3">
            <Fact label="Typical timescale" value={stage.timescale} />
            <Fact label="Approximate cost" value={stage.cost} />
            <Fact label="When in the journey" value={`Phase ${phaseIndex + 1} of 4 — ${phaseName}`} />
          </dl>

          {/* What happens */}
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
              What happens at this stage
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/75">{stage.whatHappens}</p>
          </section>

          {/* What to do */}
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
              What to do, in order
            </h2>
            <ol className="mt-6 space-y-4">
              {stage.actions.map((a, i) => (
                <li key={a} className="flex items-start gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-400 font-medium text-bone">
                    {i + 1}
                  </span>
                  <span className="text-base leading-relaxed text-ink/85">{a}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Watch out for */}
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
              Watch out for
            </h2>
            <ul className="mt-6 space-y-4">
              {stage.watchOutFor.map((w) => (
                <li key={w} className="flex items-start gap-3 text-base leading-relaxed text-ink/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Providers if relevant */}
          {stage.needs.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
                Who you&apos;ll need at this stage
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/70">
                Sample selection — your live dashboard will show postcode-matched providers with up-to-date prices.
              </p>
              <div className="mt-6 space-y-8">
                {stage.needs.map((srv) => {
                  const list = SAMPLE_PROVIDERS[srv];
                  return (
                    <div key={srv}>
                      <h3 className="font-serif text-xl text-ink">{SERVICE_LABEL[srv]}</h3>
                      <ul className="mt-3 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10">
                        {list.map((p) => (
                          <li key={p.name} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                              <p className="font-serif text-lg text-ink">{p.name}</p>
                              <p className="mt-0.5 text-sm text-ink/60">{p.location} · {p.rating} · {p.note}</p>
                            </div>
                            <p className="font-serif text-lg text-ink">{p.price}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="mt-12 max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
              Frequently asked
            </h2>
            <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10">
              {stage.faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-bone-50 sm:px-6">
                    <span className="font-serif text-lg leading-snug text-ink">{f.q}</span>
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition-transform group-open:rotate-45">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-base leading-relaxed text-ink/75 sm:px-6">{f.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 rounded-3xl border border-ink/10 bg-bone-50 p-6 sm:p-8">
            <p className="eyebrow">Your personalised version</p>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
              Want this as a checklist tailored to you?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
              Sign up free and Clinksy will track your progress through this stage, surface providers near your postcode, and remind you before deadlines slip.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/start" className="btn-solid">See my next steps</Link>
            </div>
          </section>

          {/* Prev / Next */}
          <nav aria-label="Stage navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/guides/${prev.slug}`} className="rounded-2xl border border-ink/10 p-5 transition-colors hover:bg-bone-50">
                <p className="text-xs text-ink/45">← Previous stage</p>
                <p className="mt-2 font-serif text-lg text-ink">Stage {prev.id} — {prev.title}</p>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/guides/${next.slug}`} className="rounded-2xl border border-ink/10 p-5 text-right transition-colors hover:bg-bone-50">
                <p className="text-xs text-ink/45">Next stage →</p>
                <p className="mt-2 font-serif text-lg text-ink">Stage {next.id} — {next.title}</p>
              </Link>
            ) : <div />}
          </nav>

          {/* Related guides */}
          <section className="mt-14">
            <p className="eyebrow">Related guides</p>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">Keep reading</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((s) => (
                <li key={s.id}>
                  <Link href={`/guides/${s.slug}`} className="block h-full rounded-2xl border border-ink/10 bg-bone-50 p-5 transition-colors hover:border-ink/30">
                    <p className="text-xs text-ink/45">Stage {s.id}</p>
                    <p className="mt-2 font-serif text-lg leading-snug text-ink">{s.title}</p>
                    <p className="mt-2 text-sm text-ink/60">{s.blurb}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-12 text-xs text-ink/45">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}{" "}
            · Clinksy is not a regulated advisor. For binding decisions, always confirm with a solicitor, broker, or surveyor.
          </p>
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </>
    );
  }

  // Try topic guide.
  const topic = topicGuideBySlug(params.slug);
  if (!topic) notFound();

  // Resolve related stage links for this topic guide.
  const relatedStages = DASHBOARD_STAGES.filter((s) =>
    topic.relatedStageIds.includes(s.id),
  ).slice(0, 6);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: topic.guideTitle,
    description: topic.metaDescription,
    url: `${SITE_URL}/guides/${topic.slug}`,
    inLanguage: "en-GB",
    author: { "@type": "Organization", name: "Clinksy" },
    publisher: { "@type": "Organization", name: "Clinksy", url: SITE_URL },
    image: `${SITE_URL}/opengraph-image`,
    datePublished: topic.publishDate,
    dateModified: new Date().toISOString().split("T")[0],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/${topic.slug}` },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: topic.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: topic.headline, item: `${SITE_URL}/guides/${topic.slug}` },
    ],
  };

  return (
    <>
      <Header />
      <main className="container-narrow py-12 sm:py-16 md:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-ink/55">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/guides" className="hover:text-ink">Guides</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink/80">{topic.headline}</li>
          </ol>
        </nav>

        <div className="mt-6">
          <span className="rounded-full bg-ink/8 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-ink/55">
            Deep dive
          </span>
        </div>

        <h1 className="mt-5 font-serif text-[40px] leading-[1.04] tracking-tightish text-ink sm:text-5xl md:text-[56px]">
          {topic.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">
          {topic.intro}
        </p>

        {/* Article body */}
        <div className="mt-12 max-w-3xl space-y-12">
          {topic.sections.map((section) => {
            const sectionRelated = section.relatedStageIds
              ? DASHBOARD_STAGES.filter((s) => section.relatedStageIds!.includes(s.id))
              : [];

            return (
              <section key={section.h2}>
                <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
                  {section.h2}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="text-base leading-relaxed text-ink/80">
                      {p}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-ink/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {sectionRelated.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {sectionRelated.map((s) => (
                      <Link
                        key={s.id}
                        href={`/guides/${s.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-sm text-ink/65 transition-colors hover:border-ink/40 hover:text-ink"
                      >
                        <span className="text-ink/40">→</span>
                        Stage {s.id}: {s.title}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="mt-14 max-w-3xl">
          <h2 className="font-serif text-3xl leading-tight tracking-tightish text-ink sm:text-4xl">
            Frequently asked
          </h2>
          <div className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10">
            {topic.faqs.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-bone-50 sm:px-6">
                  <span className="font-serif text-lg leading-snug text-ink">{f.q}</span>
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition-transform group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-base leading-relaxed text-ink/75 sm:px-6">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl border border-ink/10 bg-bone-50 p-6 sm:p-8">
          <p className="eyebrow">Get your personalised plan</p>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
            Ready to put this into action?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
            Sign up free and Clinksy will give you a dashboard that tracks exactly where you are — costs scaled to your purchase price, providers near your postcode, and the AI assistant ready to answer any of these questions in your specific context.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/start" className="btn-solid">See my next steps</Link>
          </div>
        </section>

        {/* Related stage guides */}
        {relatedStages.length > 0 && (
          <section className="mt-14">
            <p className="eyebrow">Stage guides</p>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
              Go deeper by stage
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStages.map((s) => (
                <li key={s.id}>
                  <Link href={`/guides/${s.slug}`} className="block h-full rounded-2xl border border-ink/10 bg-bone-50 p-5 transition-colors hover:border-ink/30">
                    <p className="text-xs text-ink/45">Stage {s.id}</p>
                    <p className="mt-2 font-serif text-lg leading-snug text-ink">{s.title}</p>
                    <p className="mt-2 text-sm text-ink/60">{s.blurb}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-xs text-ink/45">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}{" "}
          · Clinksy is not a regulated advisor. For binding decisions, always confirm with a solicitor, broker, or surveyor.
        </p>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45">{label}</dt>
      <dd className="mt-2 font-serif text-lg text-ink">{value}</dd>
    </div>
  );
}
