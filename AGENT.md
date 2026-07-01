# Clinksy content agent

A scheduled Cowork task (`clinksy-news-blog-agent`) keeps the site's content
fresh for SEO. It runs **twice a week (Tuesday & Friday, ~07:00 local)**.

Each run it:

1. **Researches** the latest UK home-buying news and a trending first-time-buyer
   search topic (via web search), verifying figures against reputable sources.
2. **Refreshes the news section** — replaces `NEWS_ITEMS` in `src/lib/news.ts`
   with 5 current, sourced headlines shown on `/blog`.
3. **Writes one new blog post** — appends a new entry to `TOPIC_GUIDES` in
   `src/lib/topic-guides.ts`, which automatically appears on `/blog`, `/guides`,
   the sitemap, and gets its own Article + FAQ + Breadcrumb schema. It skips the
   post if it can't beat existing coverage (to avoid thin/duplicate content).
4. **Verifies** with `npx tsc --noEmit`.
5. **Publishes** — commits and pushes to `tejas-shukla/Clinksy`, which Vercel
   auto-deploys. If the automation lacks git credentials, it commits and asks
   you to run `git push`.

## Quality guardrails

- Every figure (rates, tax thresholds, scheme rules) is verified before use.
- Posts must be original, UK-specific, ~700+ words, genuinely useful.
- No duplicate slugs; skips rather than publishes thin content.

These guardrails matter: Google penalises low-value, mass-produced "scaled
content." Two solid, accurate posts a week is sustainable; spot-check them.

## Managing it

Edit or pause the task in the Cowork **Scheduled** panel, or ask to change the
cadence / publish mode.
