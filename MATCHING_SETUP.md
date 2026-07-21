# Professional matching — setup

The matching system (spec: `Clinkeys_Professional_Matching_Spec.docx`) onboards
mortgage advisors, solicitors and surveyors, matches buyer requests to the
best-fit professional, emails them the request, and passes it on if not
accepted within 24 hours.

## What was added

- `prisma/schema.prisma` + `prisma.config.ts` — Professional, MatchRequest, Assignment models (Prisma 7, Neon adapter)
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/matching/criteria.ts` — onboarding fields & match criteria (single source of truth)
- `src/lib/matching/engine.ts` — hard filters + weighted ranking (40% specialisation, 25% responsiveness, 20% rating, 15% load balancing)
- `src/lib/matching/lifecycle.ts` — offer → accept/decline/expire → pass-on; atomic accepts; auto-pause after 2 consecutive timeouts
- `src/lib/matching/emails.ts` — Resend emails (offer, 12h reminder, buyer matched/rematching/unmatched, ops alert)
- `/professionals/join` — onboarding form (all 3 roles)
- `/professionals/requests/[id]` — accept/decline page (buyer contact revealed only after accept)
- `/match` — buyer request form (link from dashboard with `?role=SOLICITOR` etc.)
- `/api/professionals`, `/api/match-requests`, `/api/assignments/[id]`, `/api/cron/matching`
- `vercel.json` — cron every 30 min (reminders + expiries)

## One-time setup

1. `npm install` (regenerates the Prisma client via postinstall)
2. Create a Neon database (free tier): https://neon.tech — or via the Vercel
   Marketplace integration, which sets `DATABASE_URL` automatically.
3. Add to `.env.local` and Vercel env vars:
   - `DATABASE_URL` — Neon connection string
   - `CRON_SECRET` — any long random string (protects the cron endpoint)
   - `ADMIN_SECRET` — key for the admin page at `/admin/professionals`
   - `OPS_ALERT_EMAIL` — where "pool exhausted" alerts go
   - `RESEND_API_KEY` — already used for magic links; emails log to console if unset
4. Create the tables: `npx prisma migrate dev --name matching_init`
   (or `npx prisma db push` for a quick start)

## Operating notes

- New professionals land as `PENDING_VERIFICATION`. Review them at
  `/admin/professionals` (unlock with `ADMIN_SECRET`) — each card links to the
  FCA/SRA/CLC/RICS register for the number they gave, with one-click
  Activate / Reject / Pause. Only ACTIVE profiles are matched.
- Buyers reach the matching form from the dashboard ("Get matched →" on the
  advisor, solicitor and surveyor cards) or directly at `/match`.
- A profile auto-pauses (`PAUSED`) after 2 consecutive timeouts.
- Accept window: 24h; reminder at 12h. Both in `src/lib/matching/criteria.ts`.
