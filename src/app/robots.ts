import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://clinkeys.com";

// Explicitly welcome AI search/answer crawlers so Clinkeys can be surfaced and
// cited by ChatGPT, Gemini, Perplexity, and Claude — as well as normal search.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI (training + ChatGPT knowledge)
  "OAI-SearchBot", // OpenAI search index
  "ChatGPT-User", // ChatGPT live browsing on a user's behalf
  "Google-Extended", // Google Gemini / AI Overviews grounding
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot", // Perplexity index
  "Perplexity-User",
  "Applebot-Extended", // Apple Intelligence
  "CCBot", // Common Crawl (feeds many LLMs)
];

export default function robots(): MetadataRoute.Robots {
  const shared = { allow: "/", disallow: ["/api/", "/auth/", "/dashboard"] };
  return {
    rules: [
      { userAgent: "*", ...shared },
      { userAgent: AI_CRAWLERS, ...shared },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
