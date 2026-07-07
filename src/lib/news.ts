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
      "Nationwide's index shows annual growth rising to 2.2% in June from 1.7% in May, with the average price at £277,484. Prices were broadly flat month-on-month; Northern Ireland remained the strongest region at 8.6% a year.",
    source: "Nationwide",
    url: "https://www.nationwide.co.uk/media/hpi/reports/annual-house-price-growth-edges-higher-in-june",
    date: "2026-07-01",
  },
  {
    title: "Bank of England holds base rate at 3.75% in June",
    summary:
      "The Monetary Policy Committee voted 7-2 on 18 June to keep the base rate at 3.75%, with two members preferring a rise to 4%. As of early July, markets expected the Bank to hold rates for the rest of the year.",
    source: "MoneySavingExpert",
    url: "https://www.moneysavingexpert.com/news/2026/06/base-rate-held-bank-of-england/",
    date: "2026-06-18",
  },
  {
    title:
      "Average asking price falls 0.6% in June — biggest June drop in 14 years",
    summary:
      "Rightmove's House Price Index shows new sellers cut the average asking price by £2,113 to £376,191, now 0.5% below a year ago, as record supply for the time of year forces sharper pricing.",
    source: "Rightmove",
    url: "https://www.rightmove.co.uk/news/house-price-index/",
    date: "2026-06-16",
  },
  {
    title: "Best first-time buyer fix at 90% LTV sits at 4.67% in July",
    summary:
      "HomeOwners Alliance data shows the best two-year fix for a 10% deposit at 4.67% and the best five-year fix at 4.62%, while 95% (5% deposit) rates start from 5.20%, as lenders keep trimming pricing.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/first-time-buyer-mortgage-rates/",
    date: "2026-07-02",
  },
  {
    title: "Energy-efficient homes fetch a modest price premium — Nationwide",
    summary:
      "Nationwide research found homes rated EPC A or B sell for about 1.6% (roughly £4,500) more than a comparable D-rated home, while F or G-rated homes sell for about 1.4% less. The effect is far larger for buy-to-let.",
    source: "Nationwide",
    url: "https://www.nationwide.co.uk/media/hpi/reports/energy-efficiency-ratings-have-limited-impact-on-owner-occupied-house-prices-despite-increased-interest-in-going-green",
    date: "2026-07-01",
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
