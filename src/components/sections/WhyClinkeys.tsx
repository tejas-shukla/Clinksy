const cards = [
  {
    title: "Always free for buyers.",
    body:
      "We don't sell your data. We don't pass you to estate agents or brokers without your say-so. Clinkeys is funded by transparent partner fees — never by selling you out.",
  },
  {
    title: "Transparent, every step.",
    body:
      "See exactly where you are. What's done, what's next, what it cost. Proactive reminders before deadlines slip. No mystery, no surprises.",
  },
  {
    title: "One dashboard, always.",
    body:
      "From “thinking about buying” to “got the keys” — one page that remembers everything and shows you the next move every time you come back.",
  },
];

export function WhyClinkeys() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">Built different</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              No lead farm.
              <br />
              No paywall.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              Most home-buying sites exist to capture you as a lead and sell
              that on. Clinkeys is the opposite of that.
            </p>
          </div>

          <div className="md:col-span-7">
            {cards.map((c, i) => (
              <div
                key={c.title}
                className={
                  "py-6 " + (i > 0 ? "border-t border-ink/10" : "")
                }
              >
                <h3 className="font-serif text-2xl leading-tight tracking-tightish text-ink md:text-[28px]">
                  {c.title}
                </h3>
                <p className="mt-2 max-w-md text-base leading-relaxed text-ink/65">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
