import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import MatchClient from "./client";

export const metadata: Metadata = {
  title: "Get matched with the right professional",
  description:
    "Tell us about your purchase and we'll match you with a mortgage advisor, solicitor or surveyor who fits — verified, available, and right for your situation.",
};

export const dynamic = "force-dynamic";

export default function MatchPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          </div>
        }
      >
        <MatchClient />
      </Suspense>
      <Footer />
    </>
  );
}
