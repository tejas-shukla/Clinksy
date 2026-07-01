// Latest home-buying news.
//
// NEWS_ITEMS is a curated list rendered on /blog — real on-page text, good for
// SEO. It is refreshed on a schedule by the "news + blog" agent (see
// AGENT.md). `fetchLiveHeadlines()` additionally pulls fresh headlines from a
// public news feed at runtime; it fails gracefully (returns []) so the page
// always renders the curated list even if the feed is unavailable.

export type NewsItem = {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string; // ISO date, e.g. "2026-06-16"
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    title:
      "Average asking price falls 0.6% in June — biggest June drop in 14 years",
    summary:
      "New sellers trimmed asking prices to £376,191 as buyer caution grew ahead of expected tax and spending decisions, according to Rightmove's latest House Price Index.",
    source: "Rightmove",
    url: "https://www.rightmove.co.uk/news/house-price-index/",
    date: "2026-06-16",
  },
  {
    title: "House prices up 1.4% year-on-year as most regions return to growth",
    summary:
      "Zoopla reports every region except the South East is now flat or growing, helped by easing mortgage rates and resilient demand.",
    source: "Zoopla",
    url: "https://www.zoopla.co.uk/discover/property-news/house-price-index/",
    date: "2026-06-10",
  },
  {
    title: "Mortgage rates ease back to around 4.8% after the spring peak",
    summary:
      "Average fixed rates edged lower in May from an April peak of nearly 5%, taking some pressure off monthly repayments for new buyers.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/advice/guides-for-homeowners/for-owners/mortgage-rate-forecast/",
    date: "2026-06-05",
  },
  {
    title: "Lenders widen support for first-time buyers with low-deposit deals",
    summary:
      "More flexible affordability checks and a growing range of low-deposit and 95% mortgages are helping first-time buyers, whose prices are up a modest 0.3% year-on-year.",
    source: "Zoopla",
    url: "https://www.zoopla.co.uk/discover/property-news/whats-happening-with-house-prices-in-the-uk/",
    date: "2026-06-10",
  },
  {
    title: "Buyer demand cools: enquiries down ~15% as market takes a breath",
    summary:
      "Sales agreed are running about 7% below last year and buyer enquiries around 15% lower, with many buyers taking a wait-and-see approach.",
    source: "Rightmove",
    url: "https://www.rightmove.co.uk/news/house-price-index/",
    date: "2026-06-16",
  },
];

export type LiveHeadline = {
  title: string;
  url: string;
  source: string;
  date: string;
};

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/**
 * Pull fresh headlines from Google News RSS for UK home-buying topics.
 * Returns [] on any error so the page never breaks. Cached for an hour.
 */
export async function fetchLiveHeadlines(): Promise<LiveHeadline[]> {
  const feed =
    "https://news.google.com/rss/search?q=UK%20(%22first-time%20buyer%22%20OR%20%22house%20prices%22%20OR%20mortgage%20OR%20conveyancing)&hl=en-GB&gl=GB&ceid=GB:en";
  try {
    const res = await fetch(feed, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "ClinksyBot/1.0 (+https://clinksy.com)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 6)
      .map((m) => {
        const block = m[1];
        const rawTitle = decodeXml(
          block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "",
        );
        const url = decodeXml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
        const date = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "").trim();
        const source = decodeXml(
          block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "",
        );
        // Google News titles look like "Headline - Source" — strip the suffix.
        const title =
          source && rawTitle.endsWith(`- ${source}`)
            ? rawTitle.slice(0, -(source.length + 2)).trim()
            : rawTitle;
        return { title, url, source, date };
      })
      .filter((i) => i.title && i.url);
    return items;
  } catch {
    return [];
  }
}
