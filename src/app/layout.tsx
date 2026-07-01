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
    "Clinksy is the AI assistant for first-time UK home buyers. Plain-English next steps, real costs, and a clean way to compare every solicitor, broker, and surveyor at every stage.",
  openGraph: {
    title: "Clinksy — Buying your first home, without the panic.",
    description:
      "AI home buying assistant for the UK. One place to ask anything and compare every option.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinksy",
    description:
      "AI home buying assistant for the UK. Calm guidance and a clean way to compare every option.",
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
