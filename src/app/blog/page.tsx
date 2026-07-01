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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clinksy.com";

export const metadata: Metadata = {
  title:
    "The UK home buying blog — guides, costs & tips for first-time buyers",
  description:
    "Clinksy's home buying blog: expert, plain-English guides on UK mortgages, conveyancing, surveys, stamp duty, and every stage of buying your first home. Free, no lead farm.",
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
    title: "The UK home buying blog — Clinksy",
    description:
      "Expert, plain-English guides on UK mortgages, conveyancing, surveys, stamp duty, and every stage of buying your first home.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The UK home buying blog — Clinksy",
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

export default function BlogLanding() {
  // Blog schema with every article as a BlogPosting.
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog`,
    name: "The Clinksy UK Home Buying Blog",
    description:
      "Expert, plain-English guides on every stage of buying a home in the UK.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Clinksy",
      url: SITE_URL,
    },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}/guides/${p.slug}`,
      datePublished: p.date,
      articleSection: p.category,
      author: { "@type": "Organization", name: "Clinksy" },
      publisher: { "@type": "Organization", name: "Clinksy", url: SITE_URL },
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
            Join the early-access list and your Clinksy dashboard will surface
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
