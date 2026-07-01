import Link from "next/link";

export function Hero() {
  return (
    <section className="container-narrow pt-5 pb-8 sm:pt-10 sm:pb-14 md:pt-14 md:pb-16">
      <div className="grid items-center gap-8 sm:gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
        <div className="md:col-span-7 lg:col-span-7">
          <p className="eyebrow">Your AI home buying assistant</p>
          <h1 className="mt-4 font-serif text-[40px] leading-[1.04] tracking-tight2 text-ink sm:text-[56px] md:text-[64px] lg:text-[80px]">
            Buying your first home,
            <br />
            <span className="text-accent-400">without the panic.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:mt-6 sm:text-lg md:text-xl">
            One dashboard for the whole journey — next steps, real costs,
            proactive reminders, and an assistant that simplifies as it talks.
            Always free. No lead farm.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Link href="/start" className="btn-solid">
              See my next steps
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 lg:col-span-5">
          <DoorMark />
        </div>
      </div>
    </section>
  );
}

function DoorMark() {
  return (
    <div className="relative aspect-[4/5] w-full max-w-[260px] mx-auto sm:max-w-[320px] md:mx-0 md:mr-auto md:max-w-[340px] lg:max-w-[380px]">
      <svg
        viewBox="0 0 320 400"
        className="h-full w-full"
        role="img"
        aria-label="A monochrome illustration of a front door with a brass key"
      >
        <rect x="58" y="56" width="204" height="320" rx="2" fill="none" stroke="#0A0A0A" strokeWidth="1" opacity="0.35" />
        <rect x="74" y="72" width="172" height="288" rx="1" fill="#0A0A0A" />
        <rect x="92"  y="96"  width="60" height="86"  rx="1" fill="none" stroke="#FAFAF7" strokeWidth="0.75" opacity="0.35" />
        <rect x="168" y="96"  width="60" height="86"  rx="1" fill="none" stroke="#FAFAF7" strokeWidth="0.75" opacity="0.35" />
        <rect x="92"  y="200" width="60" height="138" rx="1" fill="none" stroke="#FAFAF7" strokeWidth="0.75" opacity="0.35" />
        <rect x="168" y="200" width="60" height="138" rx="1" fill="none" stroke="#FAFAF7" strokeWidth="0.75" opacity="0.35" />
        <rect x="135" y="190" width="50" height="3" rx="1" fill="#FAFAF7" opacity="0.45" />
        <circle cx="218" cy="226" r="3.5" fill="#FAFAF7" opacity="0.85" />
        <g className="key-enter">
          <circle cx="0" cy="0" r="11" fill="none" stroke="#C5644A" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="3.5" fill="#FAFAF7" />
          <rect x="11" y="-2" width="34" height="4" fill="#C5644A" />
          <rect x="36" y="-2" width="4" height="9" fill="#C5644A" />
          <rect x="42" y="-2" width="4" height="6" fill="#C5644A" />
        </g>
      </svg>
    </div>
  );
}
