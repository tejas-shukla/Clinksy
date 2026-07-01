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
    default: "Clinksy — Buying your first home, without the panic.",
    template: "%s · Clinksy",
  },
  description:
    "Clinksy helps first-time UK home buyers with plain-English guides for every stage, real cost estimates, and the right mortgage adviser, solicitor, or surveyor matched to you at the right time.",
  openGraph: {
    title: "Clinksy — Buying your first home, without the panic.",
    description:
      "Plain-English UK home buying guides, real costs, and the right professional matched to you at the right time.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinksy",
    description:
      "Plain-English UK home buying guides, real costs, and the right professional matched at the right time.",
  },
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
      </body>
    </html>
  );
}
