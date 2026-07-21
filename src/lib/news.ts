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
      "Mortgage rates see sharpest monthly decline in nearly two years",
    summary:
      "Moneyfacts reported the average two-year fixed rate fell 0.16 percentage points during June and the five-year average fell 0.11 points, both settling at 5.52% — the fastest monthly drop since October 2024, driven by falling swap rates.",
    source: "Mortgage Solutions",
    url: "https://www.mortgagesolutions.co.uk/mortgage-news/2026/07/13/mortgage-rates-see-sharpest-decline-in-nearly-two-years-moneyfacts/",
    date: "2026-07-13",
  },
  {
    title:
      "Barclays cuts fixed rates by up to 0.66 percentage points",
    summary:
      "Barclays reduced rates across its purchase and remortgage ranges, with a fee-free two-year fix at 90% LTV falling from 5.45% to 4.79%. Atom bank also cut across its Prime range, including 95% LTV deals aimed at low-deposit buyers.",
    source: "Mortgage Introducer",
    url: "https://www.mpamag.com/uk/mortgage-industry/guides/uk-mortgage-rates-and-product-changes-week-ending-10-july-2026/581237",
    date: "2026-07-10",
  },
  {
    title:
      "Bank of England expected to hold base rate at 3.75% on 30 July",
    summary:
      "Markets anticipate no change at the Bank of England's 30 July meeting, with the base rate staying at 3.75%. Lenders have continued cutting fixed rates regardless, as six major lenders — including Nationwide, Halifax and Virgin Money — trimmed deals within 24 hours of each other.",
    source: "HomeOwners Alliance",
    url: "https://hoa.org.uk/news/interest-rate-predictions-2/",
    date: "2026-07-15",
  },
  {
    title:
      "House prices rose 0.2% in June — first monthly rise in four months",
    summary:
      "The Lloyds House Price Index reported a 0.2% monthly rise in June, the first increase in four months, taking the typical home to £299,330. First-time buyer price growth remains subdued at around 0.3% annually.",
    source: "Lloyds",
    url: "https://www.lloydsbank.com/media-centre/house-price-index.html",
    date: "2026-07-07",
  },
  {
    title:
      "First-Time Buyer ISA consultation closes 18 August",
    summary:
      "Savers have until 18 August to respond to the government consultation on the First-Time Buyer ISA, which will replace the Lifetime ISA for house purchases. Proposals include no upper age limit and no 25% withdrawal penalty on savers' own money, with launch expected around April 2028.",
    source: "GOV.UK",
    url: "https://www.gov.uk/government/consultations/first-time-buyer-isa-consultation",
    date: "2026-06-23",
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
