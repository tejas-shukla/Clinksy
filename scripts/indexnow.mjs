#!/usr/bin/env node
// Ping IndexNow so Bing (and DuckDuckGo, Yandex, Seznam, Naver) crawl new/updated
// Clinkeys URLs within ~24h. Usage:
//   node scripts/indexnow.mjs "https://clinkeys.com/guides/some-slug" [more urls...]
// If no URLs are passed, it submits the homepage, /blog and /guides.
//
// The key is public by design — IndexNow verifies it via the matching file at
// https://clinkeys.com/<key>.txt.

const KEY = "781728bb3e975636c9a1e47d9b5c8ab2";
const HOST = "clinkeys.com";
const SITE = `https://${HOST}`;
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

const urlList =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : [`${SITE}/`, `${SITE}/blog`, `${SITE}/guides`];

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URL(s)`);
  // 200 or 202 = accepted. Anything else, log for visibility.
  if (!res.ok) console.log(await res.text());
} catch (err) {
  console.error("IndexNow ping failed:", err);
  process.exit(0); // never fail the deploy over this
}
