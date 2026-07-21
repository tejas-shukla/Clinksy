import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import JoinClient from "./client";

export const metadata: Metadata = {
  title: "Join Clinkeys as a professional",
  description:
    "Mortgage advisors, solicitors and surveyors: join Clinkeys and receive matched client requests — no directories, no bidding, just buyers who fit your expertise.",
};

export default function ProfessionalsJoinPage() {
  return (
    <>
      <Header />
      <JoinClient />
      <Footer />
    </>
  );
}
