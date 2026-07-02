// Decorative on-page hero banner for guide articles. Brand-coloured, with a
// keyring watermark — gives each guide a visual header without duplicating the
// H1. (The search/social thumbnail is the per-guide OpenGraph PNG.)
export function GuideHero({ label }: { label: string }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-400 to-[#8f3f2c] px-6 py-8 sm:px-8 sm:py-10">
      <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-bone/85">
        {label}
      </span>
      <p className="mt-2 max-w-md font-serif text-xl leading-snug text-bone sm:text-2xl">
        Your plain-English guide to buying a home in the UK.
      </p>

      {/* Keyring watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -right-4 -top-6 h-44 w-44 opacity-20 sm:h-52 sm:w-52"
        fill="none"
      >
        <path
          d="M28 75 L20 75 L20 40 L50 14 L80 40 L80 66"
          stroke="#FAFAF7"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g
          transform="rotate(-26 47 47)"
          stroke="#FAFAF7"
          fill="none"
          strokeLinecap="round"
        >
          <circle cx="47" cy="47" r="13" strokeWidth="5" />
          <line x1="47" y1="60" x2="47" y2="90" strokeWidth="5" />
          <line x1="47" y1="80" x2="59" y2="80" strokeWidth="4.5" />
          <line x1="47" y1="89" x2="56" y2="89" strokeWidth="4.5" />
        </g>
      </svg>
    </div>
  );
}
