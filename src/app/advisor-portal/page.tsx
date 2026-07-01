import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Matched advisers, solicitors & surveyors — coming soon",
  description:
    "Clinkeys will match you with trusted mortgage advisers, solicitors, and surveyors at the right point in your journey. Join the list to hear when it launches.",
};

export default function AdvisorPortalPage() {
  return (
    <ComingSoon
      eyebrow="Coming soon"
      title={
        <>
          The right pro,
          <br />
          <span className="text-accent-400">at the right moment.</span>
        </>
      }
      description="As you move through buying, Clinkeys will match you with trusted mortgage advisers, conveyancing solicitors, and surveyors — with clear pricing and no lead-farm nonsense — while still guiding you at every step."
      bullets={[
        "Mortgage advisers when you're ready for an agreement in principle",
        "Conveyancing solicitors once your offer is accepted",
        "Surveyors matched to the property and survey level you need",
        "Side-by-side options with real prices — you stay in control",
      ]}
    />
  );
}
