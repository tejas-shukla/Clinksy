import { Suspense } from "react";
import Dashboard3Client from "./client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Journey | Clinksy",
  description: "A simple, focused view of your home buying stage — one step at a time.",
};

export default function Dashboard3Page() {
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
      <Dashboard3Client />
    </Suspense>
  );
}
