import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Your buying dashboard — coming soon",
  description:
    "The Clinksy dashboard will track your whole home buying journey — next steps, costs, documents, and reminders. Join the list to hear when it launches.",
};

export default function DashboardPage() {
  return (
    <ComingSoon
      eyebrow="Coming soon"
      title={
        <>
          Your whole move,
          <br />
          <span className="text-accent-400">on one dashboard.</span>
        </>
      }
      description="We're building a single place to track your home purchase from mortgage in principle to picking up the keys — with next steps, real costs, document storage, and proactive reminders."
      bullets={[
        "A clear, personalised timeline for every stage",
        "Running cost estimates so there are no nasty surprises",
        "One tidy home for your documents and to-dos",
        "Reminders before deadlines, not after",
      ]}
    />
  );
}
