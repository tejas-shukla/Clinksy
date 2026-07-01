import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogIndex, type BlogPost } from "@/components/blog/BlogIndex";
import {
  DASHBOARD_STAGES,
  PHASE_NAMES,
  STAGE_ID_TO_PHASE,
} from "@/lib/journey-data";
import { TOPIC_GUIDES } from "@/lib/topic-guides";
import { NEWS_ITEMS, fetchLiveHeadlines } from "@/lib/news";

// Revalidate hourly so live headlines stay fresh without a rebuild.
export const revalidate = 3600;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clinkeys.com";

export const metadata: Metadata = {
  title:
    "The UK home buying blog — guides, costs & tips for first-time buyers",
  description:
    "Clinkeys's home buying blog: expert, plain-English guides on UK mortgages, conveyancing, surveys, stamp duty, and every stage of buying your first home. Free, no lead farm.",
  keywords: [
    "home buying blog",
    "first time buyer guide UK",
    "how to buy a house UK",
    "UK mortgage guide",
    "conveyancing explained",
    "stamp duty first time buyer",
    "cost of buying a house UK",
  ],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "The UK home buying blog — Clinkeys",
    description:
      "Expert, plain-English guides on UK mortgages, conveyancing, surveys, stamp duty, and every stage of buying your first home.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The UK home buying blog — Clinkeys",
    description:
      "Expert, plain-English guides on every stage of buying your first home in the UK.",
  },
};

// ── Categories (marketing phases + deep dives) ─────────────────────────
const CATEGORIES = [...PHASE_NAMES, "Deep dives"];

// ── Build a unified post list from stage + topic guides ────────────────
const stagePosts: BlogPost[] = DASHBOARD_STAGES.map((s) => ({
  slug: s.slug,
  title: s.guideTitle,
  description: s.metaDescription,
  category: PHASE_NAMES[STAGE_ID_TO_PHASE[s.id] - 1],
  kind: "Stage guide",
  meta: `${s.timescale} · ${s.cost}`,
  date: "2025-01-01",
}));

const topicPosts: BlogPost[] = TOPIC_GUIDES.map((g) => ({
  slug: g.slug,
  title: g.headline,
  description: g.metaDescription,
  category: "Deep dives",
  kind: "Deep dive",
  meta: "In-depth guide",
  date: g.publishDate,
}));

// Deep dives first (they're the strongest pillar content), then the journey.
const POSTS: BlogPost[] = [...topicPosts, ...stagePosts];

// ── FAQ set (one representative Q&A per stage guide) ───────────────────
const FAQS = DASHBOARD_STAGES.map((s) => s.faqs[0]).filter(Boolean);

export default async function BlogLanding() {
  const liveHeadlines = await fetchLiveHeadlines();

  // Blog schema with every article as a BlogPosting.
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog`,
    name: "The Clinkeys UK Home Buying Blog",
    description:
      "Expert, plain-English guides on every stage of buying a home in the UK.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Clinkeys",
      url: SITE_URL,
    },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}/guides/${p.slug}`,
      datePublished: p.date,
      articleSection: p.category,
      author: { "@type": "Organization", name: "Clinkeys" },
      publisher: { "@type": "Organization", name: "Clinkeys", url: SITE_URL },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Header />
      <main className="container-narrow py-14 sm:py-20 md:py-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-ink/45">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink/70">Blog</span>
        </nav>

        {/* Hero */}
        <p className="eyebrow mt-6">Home buying blog</p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tightish text-ink sm:text-5xl md:text-[60px]">
          Everything you need
          <br />
          to buy in the UK.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70 sm:text-xl">
          Expert, plain-English guides on mortgages, conveyancing, surveys,
          stamp duty, and every stage of buying your first home — what happens,
          how long it takes, what it costs, and what to watch out for. Free to
          read, no lead farm.
        </p>

        {/* Search + filter + grid (interactive) */}
        <BlogIndex posts={POSTS} categories={CATEGORIES} />

        {/* ── Latest home-buying news ─────────────────────────────── */}
        <section
          id="latest-news"
          className="mt-20 border-t border-ink/10 pt-12"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Latest news</p>
              <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
                Home-buying news, updated regularly
              </h2>
            </div>
            <span className="hidden flex-none items-center gap-1.5 text-xs text-ink/45 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
              Kept current
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/65">
            What's moving the UK property market right now — prices, mortgage
            rates, and support for first-time buyers.
          </p>

          {/* Curated headlines with summaries */}
          <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {NEWS_ITEMS.map((n) => (
              <li key={n.url + n.title} className="py-5">
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex items-center gap-2 text-xs text-ink/45">
                    <span className="font-medium text-ink/60">{n.source}</span>
                    {formatDate(n.date) && (
                      <>
                        <span aria-hidden>·</span>
                        <time dateTime={n.date}>{formatDate(n.date)}</time>
                      </>
                    )}
                  </div>
                  <p className="mt-1.5 font-serif text-xl leading-snug text-ink transition-colors group-hover:text-accent-400">
                    {n.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                    {n.summary}
                  </p>
                </a>
              </li>
            ))}
          </ul>

          {/* Live headlines from around the web (graceful if empty) */}
          {liveHeadlines.length > 0 && (
            <div className="mt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink/50">
                More headlines from around the web
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {liveHeadlines.map((h) => (
                  <li key={h.url}>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-xl border border-ink/10 bg-bone-50 p-4 transition-colors hover:border-ink/30"
                    >
                      <span className="text-[15px] leading-snug text-ink/85 group-hover:text-ink">
                        {h.title}
                      </span>
                      <span className="mt-2 text-xs text-ink/45">
                        {h.source}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink/40">
                Headlines via Google News. Clinkeys links out to the original
                publishers.
              </p>
            </div>
          )}
        </section>

        {/* Browse by stage — internal linking block for SEO */}
        <section className="mt-20 border-t border-ink/10 pt-12">
          <h2 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">
            Browse the whole journey
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/65">
            The UK buying process in order — click any stage to read the full
            guide.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {PHASE_NAMES.map((phaseName, i) => {
              const phase = i + 1;
              const stages = DASHBOARD_STAGES.filter(
                (s) => STAGE_ID_TO_PHASE[s.id] === phase,
              );
              return (
                <div
                  key={phaseName}
                  className="rounded-2xl border border-ink/10 bg-bone-50 p-5 sm:p-6"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-400">
                    Phase {phase} · {phaseName}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {stages.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/guides/${s.slug}`}
                          className="group flex items-baseline justify-between gap-3 text-ink/75 transition-colors hover:text-ink"
                        >
                          <span className="text-[15px] leading-snug group-hover:underline">
                            {s.title}
                          </span>
                          <span className="flex-none text-xs text-ink/40">
                            {s.cost}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ — on-page content backing the FAQPage schema */}
        <section className="mt-20 border-t border-ink/10 pt-12">
          <h2 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">
            UK home buying — frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {f.q}
                  <span
                    aria-hidden
                    className="flex-none text-ink/40 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-ink/10 bg-bone-50 p-6 sm:p-8">
          <p className="eyebrow">Make it personal</p>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">
            Get these guides tailored to your move.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
            Join the early-access list and your Clinkeys dashboard will surface
            the right stage for you — costs scaled to your purchase price and
            the right professional matched at the right time.
          </p>
          <div className="mt-5">
            <Link href="/start" className="btn-solid">
              Get early access
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
