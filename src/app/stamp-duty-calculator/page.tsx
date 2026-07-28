import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import CalculatorClient from "./client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clinkeys.com";

export const metadata: Metadata = {
  title: "Stamp Duty calculator (2026) — England, Scotland & Wales",
  description:
    "Free UK Stamp Duty calculator with first-time buyer relief. Covers SDLT in England and Northern Ireland, LBTT in Scotland and LTT in Wales, with a full band breakdown.",
  alternates: { canonical: "/stamp-duty-calculator" },
};

const FAQS = [
  {
    q: "How much Stamp Duty does a first-time buyer pay?",
    a: "In England and Northern Ireland, first-time buyers pay no Stamp Duty on the first £300,000 and 5% on the portion between £300,001 and £500,000. Above £500,000 the relief is lost entirely and standard rates apply to the whole price. Scotland raises the nil-rate band to £175,000 for first-time buyers, and Wales has no separate first-time buyer relief.",
  },
  {
    q: "Is Stamp Duty calculated on the whole price?",
    a: "No. All three UK systems are 'slice' taxes: each rate applies only to the portion of the price that falls within that band. So a £300,000 purchase taxed at 2% between £125,000 and £250,000 pays that 2% only on the £125,000 in that band, not on the full price.",
  },
  {
    q: "When do I pay Stamp Duty?",
    a: "In England and Northern Ireland the return must be filed and the tax paid within 14 days of completion. Scotland and Wales allow 30 days. In practice your conveyancing solicitor files the return and collects the money as part of your completion funds, so you rarely deal with the revenue body yourself.",
  },
  {
    q: "Can I add Stamp Duty to my mortgage?",
    a: "Not usually. Stamp Duty is payable in cash on completion, so it needs to be budgeted alongside your deposit and legal fees rather than borrowed. Some buyers negotiate a lower purchase price to free up cash, but the tax itself is not normally lendable.",
  },
];

export default function StampDutyCalculatorPage() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Clinkeys Stamp Duty Calculator",
    url: `${SITE_URL}/stamp-duty-calculator`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: "en-GB",
    description:
      "Calculate UK property transaction tax — Stamp Duty (England & Northern Ireland), LBTT (Scotland) and LTT (Wales) — including first-time buyer relief.",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    publisher: { "@id": `${SITE_URL}/#organization` },
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
      <main className="container-narrow py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-accent-500">
          Free tool
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight2 text-ink sm:text-5xl">
          Stamp Duty calculator
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-400">
          Work out the tax on your purchase across all three UK systems — Stamp
          Duty in England and Northern Ireland, LBTT in Scotland, and LTT in
          Wales — with first-time buyer relief applied automatically.
        </p>

        <CalculatorClient />

        <section className="mt-16 max-w-2xl">
          <h2 className="font-serif text-2xl tracking-tightish text-ink">
            Common questions
          </h2>
          <div className="mt-6 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="font-medium text-ink">{f.q}</h3>
                <p className="mt-1.5 leading-relaxed text-ink-400">{f.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-ink-400">
            For the full picture — who counts as a first-time buyer, worked
            examples, and how the £500,000 cliff edge works — read our{" "}
            <Link
              href="/guides/stamp-duty-first-time-buyers-uk"
              className="font-medium text-ink underline underline-offset-2 hover:text-accent-400"
            >
              Stamp Duty guide for first-time buyers
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
