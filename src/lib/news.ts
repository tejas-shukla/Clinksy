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
      "Rightmove's House Price Index shows new sellers cut the average asking price to £376,191, now 0.5% below a year ago, as record supply for the time of year forces sharper pricing.",
    source: "Rightmove",
    url: "https://www.rightmove.co.uk/news/house-price-index/",
    date: "2026-06-15",
  },
  {
    title: "Bank of England holds base rate at 3.75% for a fourth time",
    summary:
      "On 18 June the Monetary Policy Committee kept the base rate at 3.75%, its fourth consecutive hold, keeping mortgage pricing broadly stable for buyers.",
    source: "Bank of England",
    url: "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate",
    date: "2026-06-18",
  },
  {
    title: "Lenders keep cutting fixed rates as product choice tops 7,000",
    summary:
      "Moneyfacts data shows residential mortgage choice above 7,000 deals for the first time since March, with the average two-year fix around 5.55% as several major lenders trimmed rates through late June.",
    source: "Moneyfacts",
    url: "https://moneyfactscompare.co.uk/mortgages/",
    date: "2026-06-26",
  },
  {
    title: "Zoopla: house prices up 1.4% as most regions return to growth",
    summary:
      "Zoopla's June index puts the average UK home at around £271,900 and reports every region except the South East is now flat or growing, with first-time buyers staying active.",
    source: "Zoopla",
    url: "https://www.zoopla.co.uk/discover/property-news/house-price-index/",
    date: "2026-06-23",
  },
  {
    title: "5% deposit mortgage choice hits highest level since 2008",
    summary:
      "The number of 95% loan-to-value deals has risen past 7,500 — the most since March 2008 — widening options for first-time buyers, with average 95% two-year fixes near 5.4%.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/advice/guides-for-homeowners/i-am-buying/5-deposit-mortgages/",
    date: "2026-06-20",
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
