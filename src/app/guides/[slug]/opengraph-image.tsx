import { ImageResponse } from "next/og";
import {
  stageBySlug,
  PHASE_NAMES,
  STAGE_ID_TO_PHASE,
} from "@/lib/journey-data";
import { topicGuideBySlug } from "@/lib/topic-guides";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Clinkeys UK home buying guide";

// Per-guide social/search image (1200×630 PNG). Auto-generated for every guide,
// including future agent-published posts — used as the OpenGraph image and the
// Article schema image, so guides are eligible for thumbnails in search + socials.
export default function Image({ params }: { params: { slug: string } }) {
  const stage = stageBySlug(params.slug);
  const topic = stage ? undefined : topicGuideBySlug(params.slug);

  const title = stage
    ? stage.guideTitle
    : topic
      ? topic.headline
      : "UK home buying guide";
  const label = stage
    ? `Phase ${STAGE_ID_TO_PHASE[stage.id]} · ${PHASE_NAMES[STAGE_ID_TO_PHASE[stage.id] - 1]}`
    : "In-depth guide";

  const titleSize = title.length > 66 ? 54 : title.length > 44 ? 66 : 78;

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
          <svg width="46" height="46" viewBox="0 0 100 100" fill="none">
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
          <div style={{ fontSize: 30, letterSpacing: -0.4 }}>clinkeys</div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#C5644A",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: "#0A0A0A",
              marginTop: 22,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer strip */}
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
          Plain-English UK home buying guides · clinkeys.com
        </div>
      </div>
    ),
    { ...size },
  );
}
