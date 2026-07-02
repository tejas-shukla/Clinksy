import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  bullets?: string[];
  formNote?: string;
};

/**
 * Shared "coming soon" screen for sections that aren't live yet
 * (dashboard, adviser matching, guided start). Renders a plain
 * server-side email form that posts to /api/signup — no client JS,
 * no external assistant. Uses the site's existing design tokens so
 * the look and colour theme stay consistent with the rest of Clinkeys.
 */
export function ComingSoon({
  eyebrow,
  title,
  description,
  bullets,
  formNote,
}: Props) {
  return (
    <>
      <Header />
      <main className="center-on-mobile container-narrow py-20 sm:py-24 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-6">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 font-serif text-[40px] leading-[1.05] tracking-tight2 text-ink sm:text-[52px] md:text-[60px]">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
              {description}
            </p>

            {bullets && bullets.length > 0 && (
              <ul className="mt-8 space-y-3">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-ink/75">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-400"
                    />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-10 text-sm text-ink/55">
              In the meantime, our{" "}
              <Link
                href="/guides"
                className="text-ink underline underline-offset-2 hover:text-accent-400"
              >
                free home buying guides
              </Link>{" "}
              cover every stage of the UK process in plain English.
            </p>
          </div>

          <div className="md:col-span-6">
            <div className="rounded-2xl border border-ink/10 bg-white/40 p-7 sm:p-9">
              <p className="font-serif text-2xl tracking-tightish text-ink">
                Get early access
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                Join the list for our newsletter, the latest news, and a
                heads-up the moment the dashboard and adviser matching go live.
              </p>

              <form
                action="/api/signup"
                method="POST"
                aria-label="Early access email signup"
                className="mt-6 flex flex-col gap-3"
              >
                <input type="hidden" name="source" value="coming-soon" />
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-3 border-b border-ink/30 pb-2 focus-within:border-ink">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:outline-none"
                  />
                  <button type="submit" className="btn-solid">
                    Notify me
                  </button>
                </div>
                <p className="text-xs text-ink/45">
                  {formNote ?? "No spam. Unsubscribe in one click."}
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
