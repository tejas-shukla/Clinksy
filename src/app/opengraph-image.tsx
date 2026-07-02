import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Clinkeys — Buying your first home, without the panic.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF7F2",
          color: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
            <path
              d="M28 75 L20 75 L20 40 L50 14 L80 40 L80 66"
              stroke="#C5644A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g
              transform="rotate(-26 47 47)"
              stroke="#1c1c1c"
              fill="none"
              strokeLinecap="round"
            >
              <circle cx="47" cy="47" r="13" strokeWidth="6.5" />
              <line x1="47" y1="60" x2="47" y2="90" strokeWidth="6.5" />
              <line x1="47" y1="80" x2="59" y2="80" strokeWidth="5.5" />
              <line x1="47" y1="89" x2="56" y2="89" strokeWidth="5.5" />
            </g>
          </svg>
          <div style={{ fontSize: 34, letterSpacing: -0.4 }}>clinkeys</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 48,
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#C5644A",
                fontWeight: 600,
              }}
            >
              Plain-English UK home buying guides
            </div>
            <div
              style={{
                fontSize: 88,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "#0A0A0A",
                marginTop: 24,
              }}
            >
              Buying your first home,
            </div>
            <div
              style={{
                fontSize: 88,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "#C5644A",
              }}
            >
              without the panic.
            </div>
          </div>

          {/* Keyring-in-house mark */}
          <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
            <path
              d="M28 75 L20 75 L20 40 L50 14 L80 40 L80 66"
              stroke="#C5644A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g
              transform="rotate(-26 47 47)"
              stroke="#1c1c1c"
              fill="none"
              strokeLinecap="round"
            >
              <circle cx="47" cy="47" r="13" strokeWidth="6.5" />
              <line x1="47" y1="60" x2="47" y2="90" strokeWidth="6.5" />
              <line x1="47" y1="80" x2="59" y2="80" strokeWidth="5.5" />
              <line x1="47" y1="89" x2="56" y2="89" strokeWidth="5.5" />
            </g>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "#0A0A0A",
            opacity: 0.55,
          }}
        >
          clinkeys.com
        </div>
      </div>
    ),
    { ...size },
  );
}
