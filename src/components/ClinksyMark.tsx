export function ClinksyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* House outline */}
      <path
        d="M28 75 L20 75 L20 40 L50 14 L80 40 L80 66"
        stroke="#C5644A"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Key (black ring inside the house) */}
      <g
        transform="rotate(-26 47 47)"
        stroke="#1c1c1c"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="47" cy="47" r="13" strokeWidth="6.5" />
        <line x1="47" y1="60" x2="47" y2="93" strokeWidth="6.5" />
        <line x1="47" y1="80" x2="59" y2="80" strokeWidth="5.5" />
        <line x1="47" y1="89" x2="56" y2="89" strokeWidth="5.5" />
      </g>
    </svg>
  );
}
