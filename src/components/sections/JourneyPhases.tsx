import Link from "next/link";

const phases = [
  {
    n: "01",
    title: "Get ready",
    body: "Sort your finances and lock in a mortgage in principle.",
  },
  {
    n: "02",
    title: "Find your home",
    body: "Search, view, and make an offer that actually sticks.",
  },
  {
    n: "03",
    title: "Make it official",
    body: "Solicitor, survey, and the formal mortgage offer.",
  },
  {
    n: "04",
    title: "Get the keys",
    body: "Exchange, complete, move in. The exciting part.",
  },
];

export function JourneyPhases() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">The journey</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Four phases.
              <br />
              That&apos;s the whole shape.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              You don&apos;t need to memorise this. Clinkeys guides you through
              each phase as you reach it — never all at once.
            </p>
            <div className="mt-8">
              <Link
                href="/guides"
                className="text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                Read all 10 stage guides →
              </Link>
            </div>
          </div>

          <ol className="md:col-span-7">
            {phases.map((p, i) => (
              <li
                key={p.n}
                className={
                  "grid grid-cols-12 gap-6 py-6 " +
                  (i > 0 ? "border-t border-ink/10" : "")
                }
              >
                <span className="col-span-2 font-serif text-xl text-ink/40">
                  {p.n}
                </span>
                <div className="col-span-10">
                  <h3 className="font-serif text-2xl leading-tight tracking-tightish text-ink md:text-[28px]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-ink/65">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
