import {
  DASHBOARD_STAGES,
  PHASE_NAMES,
  STAGE_ID_TO_PHASE,
} from "@/lib/journey-data";
import { TOPIC_GUIDES } from "@/lib/topic-guides";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://clinkeys.com";

// llms.txt — an emerging standard (https://llmstxt.org) that gives AI engines a
// clean, curated map of the site so ChatGPT, Perplexity, Gemini, etc. can find
// and cite the right pages. Generated from live data so new guides appear
// automatically.
export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];

  lines.push("# Clinkeys");
  lines.push("");
  lines.push(
    "> Clinkeys helps first-time buyers through the UK home buying process with free, plain-English guides for every stage — mortgages, offers, surveys, conveyancing, stamp duty and completion. A personalised dashboard that matches the right mortgage adviser, solicitor, and surveyor at the right time is coming soon. UK-only (England, Wales, Scotland, Northern Ireland).",
  );
  lines.push("");
  lines.push(
    "All guidance is written for UK first-time buyers and reviewed against current rules and costs. Clinkeys is an information service, not a regulated adviser.",
  );
  lines.push("");

  lines.push("## Key pages");
  lines.push(`- [Home](${SITE_URL}/): what Clinkeys is and how it helps.`);
  lines.push(
    `- [Blog](${SITE_URL}/blog): home buying guides plus the latest UK property news.`,
  );
  lines.push(
    `- [All guides](${SITE_URL}/guides): the full UK home buying journey, stage by stage.`,
  );
  lines.push("");

  // Deep-dive topic guides (strongest, most citable content first).
  lines.push("## In-depth guides");
  for (const g of TOPIC_GUIDES) {
    lines.push(`- [${g.headline}](${SITE_URL}/guides/${g.slug}): ${g.metaDescription}`);
  }
  lines.push("");

  // Stage-by-stage guides, grouped by phase.
  lines.push("## The UK home buying journey, stage by stage");
  PHASE_NAMES.forEach((phaseName, i) => {
    const phase = i + 1;
    const stages = DASHBOARD_STAGES.filter(
      (s) => STAGE_ID_TO_PHASE[s.id] === phase,
    );
    for (const s of stages) {
      lines.push(
        `- [${s.guideTitle}](${SITE_URL}/guides/${s.slug}): ${s.metaDescription} (Phase ${phase}: ${phaseName}; typical cost ${s.cost}, ${s.timescale}.)`,
      );
    }
  });
  lines.push("");

  lines.push("## About");
  lines.push(
    `- [Privacy](${SITE_URL}/privacy)`,
  );
  lines.push(`- Contact: hello@clinkeys.com`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
