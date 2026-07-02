import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { PromiseSection } from "@/components/sections/Promise";
import { JourneyPhases } from "@/components/sections/JourneyPhases";
import { Compare } from "@/components/sections/Compare";
import { Dashboard } from "@/components/sections/Dashboard";
import { WhyClinkeys } from "@/components/sections/WhyClinkeys";
import { FAQ } from "@/components/sections/FAQ";
import { EmailCapture } from "@/components/sections/EmailCapture";

export default function Home() {
  return (
    <>
      <Header />
      <main className="center-on-mobile">
        <Hero />
        <Dashboard />
        <PromiseSection />
        <JourneyPhases />
        <Compare />
        <WhyClinkeys />
        <FAQ />
        <EmailCapture />
      </main>
      <Footer />
    </>
  );
}
