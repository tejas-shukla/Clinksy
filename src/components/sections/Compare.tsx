const stages = ["Solicitors", "Mortgage brokers", "Surveyors", "Removals"];

const sample = [
  {
    name: "Aurora Legal",
    detail: "London · 4.8★ · On all major lender panels",
    price: "£1,150",
    sub: "fixed fee",
  },
  {
    name: "Greenfield & Co.",
    detail: "Manchester · 4.7★ · 14-day average exchange",
    price: "£985",
    sub: "fixed fee",
  },
  {
    name: "Coastline Conveyancing",
    detail: "Bristol · 4.6★ · Specialists in leasehold",
    price: "£1,290",
    sub: "fixed fee",
  },
];

export function Compare() {
  return (
    <section id="compare" className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">Compare</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Every option,
              <br />
              every stage.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">
              At each stage, Clinksy shows you the credible choices side by
              side — with real prices — so you can pick what fits your
              situation. No more juggling tabs.
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="flex flex-wrap gap-2">
              {stages.map((s, i) => (
                <span
                  key={s}
                  className={
                    i === 0
                      ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-bone"
                      : "rounded-full border border-ink/20 px-3.5 py-1.5 text-xs font-medium text-ink/65"
                  }
                >
                  {s}
                </span>
              ))}
            </div>

            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {sample.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="font-serif text-xl leading-snug text-ink">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[15px] text-ink/55">{item.detail}</p>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="font-serif text-xl leading-none text-ink">
                        {item.price}
                      </p>
                      <p className="mt-1 text-xs text-ink/45">{item.sub}</p>
                    </div>
                    <button type="button" className="btn-ghost text-xs">
                      Shortlist
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-center text-xs text-ink/40">
              Sample data — your real comparison is tailored to your postcode
              and stage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
