import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import RequestClient from "./client";

export const metadata: Metadata = {
  title: "Client request — Clinkeys",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default function ProfessionalRequestPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <RequestClient assignmentId={params.id} />
      <Footer />
    </>
  );
}
