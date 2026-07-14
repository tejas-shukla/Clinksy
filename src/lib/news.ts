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
      "Rightmove urges government to scrap stamp duty for first-time buyers",
    summary:
      "Rightmove called on the government to remove stamp duty for first-time buyers on both new-build and resale homes in the Autumn Budget, citing an average mortgage rate of 4.92% and an average new-build price of £393,000. Barratt Redrow backed a new government-and-developer support scheme.",
    source: "Mortgage Solutions",
    url: "https://www.mortgagesolutions.co.uk/mortgage-news/2026/07/10/removal-of-stamp-duty-could-improve-ftb-access-to-new-builds-rightmove/",
    date: "2026-07-10",
  },
  {
    title:
      "House prices rose 0.2% in June — first monthly rise in four months",
    summary:
      "The Lloyds House Price Index (formerly Halifax) reported a 0.2% monthly rise in June, the first increase in four months, taking the typical home to £299,330. Nationwide's index put annual growth at 2.2%, with prices broadly flat on the month.",
    source: "Lloyds",
    url: "https://www.lloydsbank.com/media-centre/house-price-index.html",
    date: "2026-07-07",
  },
  {
    title:
      "Mortgage price war continues as lenders keep cutting fixed rates in July",
    summary:
      "Nationwide cut selected fixed rates for a fourth time in a month and Yorkshire Building Society trimmed deals twice in a week, as lenders compete despite the base rate being held at 3.75%. Markets expect no change at the Bank of England's 30 July meeting.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/best-mortgage-rates/",
    date: "2026-07-13",
  },
  {
    title:
      "First-Time Buyer ISA consultation open until 18 August",
    summary:
      "The government is consulting on the new First-Time Buyer ISA that will replace the Lifetime ISA for house purchases. Proposals include no upper age limit, no 25% withdrawal penalty on savers' own money, and a bonus paid at purchase; the new product is expected around April 2028.",
    source: "GOV.UK",
    url: "https://www.gov.uk/government/consultations/first-time-buyer-isa-consultation",
    date: "2026-06-23",
  },
  {
    title:
      "MPs call for stamp duty reform to help first-time buyers onto the ladder",
    summary:
      "The cross-party Housing, Communities and Local Government Committee recommended the government consult on alternatives to stamp duty by the end of 2026, and warned the new First-Time Buyer ISA should avoid a static property price cap that could make it unusable in some regions.",
    source: "UK Parliament",
    url: "https://committees.parliament.uk/committee/17/housing-communities-and-local-government-committee/news/214163/reform-stamp-duty-to-help-get-firsttime-buyers-on-the-housing-ladder-says-housing-committee/",
    date: "2026-06-09",
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
