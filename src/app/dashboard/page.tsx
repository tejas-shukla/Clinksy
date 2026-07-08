import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Your home buying dashboard",
  description:
    "Track your whole home purchase in one place — next steps, real costs, documents, and reminders, from mortgage in principle to picking up the keys.",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
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
      <DashboardClient />
    </Suspense>
  );
}
