import { Suspense } from "react";
import MortgagePortalClient from "./client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mortgage Portal | Clinksy",
  description:
    "Upload and track your mortgage application documents. Your advisor reviews each one and leaves notes directly in your portal.",
};

export default function MortgagePortalPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
          </div>
          <Footer />
        </>
      }
    >
      <MortgagePortalClient />
    </Suspense>
  );
}
