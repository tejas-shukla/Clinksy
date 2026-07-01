import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Clinksy — Buying your first home, without the panic.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          color: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: -0.4,
            color: "#0A0A0A",
          }}
        >
          Clinksy
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
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
                fontWeight: 500,
              }}
            >
              Your AI home buying assistant
            </div>
            <div
              style={{
                fontSize: 92,
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
                fontSize: 92,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: "#C5644A",
              }}
            >
              without the panic.
            </div>
          </div>

          {/* Door + key mark */}
          <svg width="280" height="350" viewBox="0 0 320 400">
            <rect
              x="58"
              y="56"
              width="204"
              height="320"
              rx="2"
              fill="none"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              opacity="0.35"
            />
            <rect x="74" y="72" width="172" height="288" rx="1" fill="#0A0A0A" />
            <rect
              x="92"
              y="96"
              width="60"
              height="86"
              rx="1"
              fill="none"
              stroke="#FAFAF7"
              strokeWidth="0.75"
              opacity="0.35"
            />
            <rect
              x="168"
              y="96"
              width="60"
              height="86"
              rx="1"
              fill="none"
              stroke="#FAFAF7"
              strokeWidth="0.75"
              opacity="0.35"
            />
            <rect
              x="92"
              y="200"
              width="60"
              height="138"
              rx="1"
              fill="none"
              stroke="#FAFAF7"
              strokeWidth="0.75"
              opacity="0.35"
            />
            <rect
              x="168"
              y="200"
              width="60"
              height="138"
              rx="1"
              fill="none"
              stroke="#FAFAF7"
              strokeWidth="0.75"
              opacity="0.35"
            />
            <rect x="135" y="190" width="50" height="3" rx="1" fill="#FAFAF7" opacity="0.45" />
            <circle cx="218" cy="226" r="3.5" fill="#FAFAF7" opacity="0.85" />
            <g transform="translate(200 230) rotate(-14)">
              <circle cx="0" cy="0" r="11" fill="none" stroke="#C5644A" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3.5" fill="#FAFAF7" />
              <rect x="11" y="-2" width="34" height="4" fill="#C5644A" />
              <rect x="36" y="-2" width="4" height="9" fill="#C5644A" />
              <rect x="42" y="-2" width="4" height="6" fill="#C5644A" />
            </g>
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
