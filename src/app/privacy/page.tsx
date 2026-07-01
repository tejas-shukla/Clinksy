import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy",
  description:
    "How Clinksy handles your data — what we collect, why, how long we keep it, and your rights under UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container-narrow py-16 sm:py-20 md:py-24">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-tightish text-ink sm:text-5xl">
          Your data, your call.
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <Section title="Short version">
          <p>
            We collect the minimum we need to help you buy a home. We
            don&apos;t sell your data. We don&apos;t pass your details to
            estate agents or brokers unless you specifically ask us to.
            You can ask us to delete everything at any time.
          </p>
        </Section>

        <Section title="Who we are">
          <p>
            &ldquo;Clinksy&rdquo; refers to the operator of this website. For
            the purposes of UK GDPR, we are the data controller for any
            personal information you provide via the site.
          </p>
          <p>
            To get in touch about anything in this policy, including a data
            request, email <a href="mailto:privacy@clinksy.com" className="text-ink underline underline-offset-2">privacy@clinksy.com</a>.
          </p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li>
              <strong>Your email address</strong>, if you join our list. We
              use it to send you our newsletter, product news, and a heads-up
              when the dashboard and adviser matching launch.
            </li>
            <li>
              <strong>Your optional name</strong>, if you choose to share it,
              so we can address you properly in emails.
            </li>
            <li>
              <strong>Standard server logs</strong> (IP address, browser,
              timestamps) for security and debugging. Retained for up to 30
              days.
            </li>
          </ul>
          <p>
            We do not use advertising or marketing trackers. We do not buy or
            sell personal data.
          </p>
        </Section>

        <Section title="Why we collect it (legal basis)">
          <ul>
            <li>
              <strong>To keep you updated</strong> (our newsletter and launch
              announcements) — your consent, which you give when you join the
              list and can withdraw at any time.
            </li>
            <li>
              <strong>Security and abuse prevention</strong> — our legitimate
              interest in running a safe service.
            </li>
          </ul>
        </Section>

        <Section title="Who we share it with">
          <ul>
            <li>
              <strong>Vercel</strong> — our hosting provider. Hosts our code
              and processes incoming requests.
            </li>
            <li>
              <strong>Resend</strong> (if configured) — sends newsletter and
              welcome emails on our behalf.
            </li>
          </ul>
          <p>
            We never share or sell your data to estate agents, brokers,
            solicitors, or any other third party without your explicit
            request.
          </p>
        </Section>

        <Section title="How long we keep it">
          <ul>
            <li>
              <strong>Account data</strong>: as long as your account is
              active. Inactive accounts are deleted after 24 months of
              inactivity.
            </li>
            <li>
              <strong>Magic-link tokens</strong>: 12 months from issue.
            </li>
            <li>
              <strong>Server logs</strong>: up to 30 days.
            </li>
            <li>
              <strong>Chat conversations</strong>: not stored on our servers.
            </li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>Under UK GDPR you have the right to:</p>
          <ul>
            <li>Ask for a copy of the personal data we hold about you.</li>
            <li>Ask us to correct anything that&apos;s wrong.</li>
            <li>Ask us to delete your data (right to erasure).</li>
            <li>Ask us to restrict or stop processing your data.</li>
            <li>Object to processing (including for direct marketing — though we don&apos;t do that).</li>
            <li>Withdraw consent at any time, where consent is the legal basis.</li>
            <li>Lodge a complaint with the <a href="https://ico.org.uk" className="text-ink underline underline-offset-2">Information Commissioner&apos;s Office (ICO)</a> if you think we&apos;ve mishandled your data.</li>
          </ul>
          <p>
            To exercise any of these, email{" "}
            <a href="mailto:privacy@clinksy.com" className="text-ink underline underline-offset-2">privacy@clinksy.com</a>.
            We&apos;ll respond within 30 days.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            See the dedicated{" "}
            <a href="/cookies" className="text-ink underline underline-offset-2">cookie policy</a> for the full list of cookies we set and how to manage them.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If we change anything material, we&apos;ll update this page and
            notify signed-in users by email before the change takes effect.
          </p>
        </Section>

        <p className="mt-12 max-w-2xl rounded-2xl border border-ink/10 bg-bone-50 p-4 text-xs leading-relaxed text-ink/55">
          This policy is a working draft. Before launching publicly, have a
          UK solicitor review it against your final data handling and any
          third-party tooling you add (analytics, storage, email).
        </p>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 max-w-2xl">
      <h2 className="font-serif text-2xl leading-tight tracking-tightish text-ink sm:text-[28px]">
        {title}
      </h2>
      <div className="prose-body mt-4 space-y-4 text-[15px] leading-relaxed text-ink/75 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
