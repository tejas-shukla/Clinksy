import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Get started with Clinkeys",
  description:
    "Clinkeys guides first-time UK buyers through every step of buying a home. The personalised journey is coming soon — join the list and start with our free guides today.",
};

export default function StartPage() {
  return (
    <ComingSoon
      eyebrow="Get started"
      title={
        <>
          Buying your first home,
          <br />
          <span className="text-accent-400">without the panic.</span>
        </>
      }
      description="Clinkeys will walk you through the whole UK journey — from working out what you can afford to picking up the keys. Your personalised, guided journey is on the way. Add your email and we'll bring you in as soon as it opens."
      bullets={[
        "Plain-English next steps for exactly where you are",
        "Real cost estimates, no jargon",
        "Matched advisers, solicitors, and surveyors when you need them",
        "Newsletter and early access to the dashboard",
      ]}
    />
  );
}
