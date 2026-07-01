const faqs = [
  {
    q: "Is Clinksy free to use?",
    a: "The assistant is free during our beta. We'll introduce a small monthly subscription for premium features later — anyone signed up to the early-access list gets a discount for life.",
  },
  {
    q: "Is the advice actually good?",
    a: "Our guides are written specifically for the UK home buying process and reviewed against current rules and costs. For anything legally or financially binding, we'll always tell you when to confirm with a regulated professional.",
  },
  {
    q: "Is it just for first-time buyers?",
    a: "We focus on first-time buyers because that's where the confusion is highest, but the assistant works for anyone moving home in the UK. Buy-to-let and shared ownership are coming soon.",
  },
  {
    q: "What about my data?",
    a: "Your conversations are private. We never sell your information, and we don't pass leads to estate agents or brokers without you explicitly asking us to.",
  },
  {
    q: "Are you regulated?",
    a: "Clinksy is not a mortgage broker, solicitor, or financial advisor — we're an information assistant. When a question needs a regulated answer, we'll tell you that and help you brief the right professional.",
  },
  {
    q: "Which countries do you cover?",
    a: "We're UK-only at launch (England, Wales, Scotland, and Northern Ireland — all four have different rules and we handle each). Other countries are on the roadmap.",
  },
];

export function FAQ() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-narrow py-24 sm:py-28">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
              Things people
              <br />
              usually ask.
            </h2>
          </div>

          <ul className="md:col-span-7">
            {faqs.map((f, i) => (
              <li
                key={f.q}
                className={i > 0 ? "border-t border-ink/10" : "border-t border-ink/10"}
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
                    <span className="font-serif text-xl leading-snug text-ink">
                      {f.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition-transform group-open:rotate-45"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M6 1.5v9M1.5 6h9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="pb-6 pr-12 text-base leading-relaxed text-ink/65">
                    {f.a}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
