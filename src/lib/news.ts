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
      "Nationwide: annual house price growth picks up to 2.2% in June",
    summary:
      "Nationwide's index shows annual growth rising to 2.2% in June from 1.7% in May, with the average price at £277,484. Prices were broadly flat month-on-month; Northern Ireland remained the strongest region.",
    source: "Nationwide",
    url: "https://www.nationwide.co.uk/media/hpi/reports/annual-house-price-growth-edges-higher-in-june",
    date: "2026-07-01",
  },
  {
    title: "Mortgage approvals fall to lowest level since late 2023",
    summary:
      "Bank of England data shows house-purchase approvals dropped to 56,205 in May, down from 66,034 in April, while net mortgage borrowing fell to £2.9bn — signs of a cooling market as buyers weigh affordability.",
    source: "Bank of England",
    url: "https://www.bankofengland.co.uk/statistics/money-and-credit/2026/may-2026",
    date: "2026-06-30",
  },
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
    title: "First-time buyer fixed rates dip below 4.7% at 90% LTV",
    summary:
      "The lowest two-year fix for buyers with a 10% deposit has fallen to 4.69% (Coventry BS), with a five-year fix at 4.62%, as lenders keep trimming first-time buyer pricing through early July.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/first-time-buyer-mortgage-rates/",
    date: "2026-07-02",
  },
  {
    title: "Bank of England holds base rate at 3.75% in June",
    summary:
      "The Monetary Policy Committee voted 7-2 on 18 June to keep the base rate at 3.75%, with two members preferring a rise to 4%. Markets expect a further hold at the next meeting on 30 July.",
    source: "Bank of England",
    url: "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate",
    date: "2026-06-18",
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
      headers: { "User-Agent": "ClinkeysBot/1.0 (+https://clinkeys.com)" },
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
