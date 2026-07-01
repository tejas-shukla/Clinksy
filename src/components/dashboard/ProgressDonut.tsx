"use client";

// accent-400 = #C5644A, ink = #0A0A0A (from tailwind.config.ts)

interface Props {
  currentStageId: number;
  total: number;
  size?: number;
}

export function ProgressDonut({ currentStageId, total, size = 56 }: Props) {
  const pct         = Math.round(((currentStageId - 1) / (total - 1)) * 100);
  const sw          = 4.5;                         // stroke-width
  const r           = size / 2 - sw - 1;           // radius inside stroke
  const circ        = 2 * Math.PI * r;
  const dashFill    = ((pct / 100) * circ).toFixed(2);
  const dashGap     = circ.toFixed(2);
  const c           = size / 2;
  const done        = currentStageId === total;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${pct}% of home buying journey complete`}
    >
      {/* Track */}
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="rgba(10,10,10,0.10)"
        strokeWidth={sw}
      />

      {/* Progress arc */}
      {pct > 0 && (
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={done ? "#1a7a47" : "#C5644A"}
          strokeWidth={sw}
          strokeDasharray={`${dashFill} ${dashGap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
        />
      )}

      {/* Centre label */}
      {done ? (
        // Checkmark at 100%
        <text
          x={c}
          y={c + 4}
          textAnchor="middle"
          fontSize="15"
          fill="#1a7a47"
          aria-hidden="true"
        >
          ✓
        </text>
      ) : (
        <text
          x={c}
          y={c + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#0A0A0A"
          fontFamily="system-ui,-apple-system,sans-serif"
          aria-hidden="true"
        >
          {pct}%
        </text>
      )}
    </svg>
  );
}
