import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Clinkeys — Buying your first home, without the panic.",
    template: "%s · Clinkeys",
  },
  description:
    "Clinkeys helps first-time UK home buyers with plain-English guides for every stage, real cost estimates, and the right mortgage adviser, solicitor, or surveyor matched to you at the right time.",
  openGraph: {
    title: "Clinkeys — Buying your first home, without the panic.",
    description:
      "Plain-English UK home buying guides, real costs, and the right professional matched to you at the right time.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinkeys",
    description:
      "Plain-English UK home buying guides, real costs, and the right professional matched at the right time.",
  },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clinkeys.com";

// Entity structured data — helps Google's Knowledge Graph and AI engines
// (ChatGPT, Gemini, Perplexity) understand what Clinkeys is.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Clinkeys",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Clinkeys helps first-time buyers through the UK home buying process with plain-English guides and, soon, a personalised dashboard that matches the right mortgage adviser, solicitor, and surveyor at the right stage.",
  areaServed: { "@type": "Country", name: "United Kingdom" },
  knowsAbout: [
    "UK home buying",
    "first-time buyers",
    "mortgages",
    "conveyancing",
    "property surveys",
    "stamp duty",
    "Lifetime ISA",
    "shared ownership",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Clinkeys",
  url: SITE_URL,
  inLanguage: "en-GB",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${lora.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bone text-ink antialiased">
        {children}
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
