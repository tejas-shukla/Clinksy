export function PromiseSection() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-narrow grid gap-10 py-24 sm:py-28 md:grid-cols-12 md:gap-10 lg:gap-16">
        <div className="md:col-span-5">
          <p className="eyebrow">The promise</p>
          <h2 className="mt-5 font-serif text-[34px] leading-[1.08] tracking-tightish text-ink sm:text-4xl md:text-[44px] lg:text-[48px]">
            Buying a home
            <br />
            without the second job.
          </h2>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-ink/70 sm:text-xl">
            Mortgages, solicitors, surveys, offers, chains. Most first-time
            buyers piece it together from forums, friends, and forty open
            browser tabs.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink/70 sm:text-xl">
            Clinkeys gives you one place to ask anything, at any stage, and
            get an answer that&apos;s actually written for you — not a generic
            article from 2017.
          </p>
        </div>
      </div>
    </section>
  );
}
