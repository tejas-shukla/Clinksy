const beats = [
  {
    n: "01",
    title: "Tell us where you are",
    body:
      "Whether you've just started saving or you've had an offer accepted this morning, Clinkeys meets you at your stage.",
  },
  {
    n: "02",
    title: "Get clear next steps",
    body:
      "No 30-page guides. Just the next one or two things to do, written in plain English, with realistic costs in pounds.",
  },
  {
    n: "03",
    title: "Ask anything, anytime",
    body:
      "From “what does my solicitor actually do?” to “is £2,400 a fair survey quote?” — get a calm, considered answer in seconds.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="container-narrow py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-terracotta-400">
          How it works
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tightish text-navy sm:text-4xl">
          Three things, that&apos;s it.
        </h2>
      </div>

      <ol className="mt-14 grid gap-8 sm:grid-cols-3">
        {beats.map((b) => (
          <li
            key={b.n}
            className="rounded-2xl border border-navy-100/70 bg-cream-50 p-6"
          >
            <span className="font-serif text-3xl text-terracotta-400">
              {b.n}
            </span>
            <h3 className="mt-3 font-serif text-xl leading-snug text-navy">
              {b.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-navy/70">
              {b.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
