# Clinkeys

Home buying guides and a guided journey for first-time UK buyers.

Clinkeys helps first-time buyers understand the UK home buying process — mortgages,
solicitors, surveys, offers, chains, and negotiations — in plain English. The
current release is **guides-first**: a full library of stage-by-stage and
deep-dive articles, plus an email list for people who want early access to the
upcoming dashboard and adviser matching.

## What's live

- **Home** (`/`) — marketing landing page.
- **Guides** (`/guides`, `/guides/[slug]`) — the blog: 10 stage guides + deep-dive topic guides, fully SEO-optimised (sitemap, canonical URLs, JSON-LD).
- **Coming soon** (`/dashboard`, `/advisor-portal`, `/start`) — teaser pages with email capture for the dashboard and adviser/solicitor/surveyor matching.
- **Signup API** (`/api/signup`) — collects newsletter / early-access emails (optionally via Resend).
- **Privacy** (`/privacy`) and **Cookies** (`/cookies`).

## Tech

- Next.js 14 (App Router) + React 18
- Tailwind CSS
- TypeScript
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:4001.

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. Only two are used:

| Name                  | Purpose                                              | Required |
| --------------------- | ---------------------------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL`| Canonical / OpenGraph / sitemap base URL             | Yes (prod) |
| `RESEND_API_KEY`      | Sends newsletter / welcome emails (else logs to console) | No |

## Scripts

- `npm run dev` — local dev server on port 4001
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm run typecheck` — TypeScript check

See `DEPLOY.md` for deploying to Vercel.
