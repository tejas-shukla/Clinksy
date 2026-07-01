# Deploying Clinkeys

A step-by-step guide to taking Clinkeys from your laptop to a live URL on its own
Vercel project — **separate** from Doorstep, so this stays independent.

## Prerequisites

1. A **GitHub account** (free).
2. A **Vercel account** (free) — sign up at [vercel.com](https://vercel.com) with GitHub.
3. (Optional) A **Resend API key** — only if you want signup emails actually sent. Get one at [resend.com](https://resend.com).

There is **no AI API key required** — the current release has no AI chat.

## Step 1 — Push Clinkeys to its own GitHub repo

Clinkeys has its own fresh git history, independent of Doorstep. From the Clinkeys
folder:

```bash
cd "/Users/tejas/Documents/Claude/Projects/New Home Website/Clinkeys"
git add .
git commit -m "Initial Clinkeys commit"
```

Create a **new** repository on GitHub called `clinkeys` (keep it separate from the
`doorstep` repo), then push:

```bash
git remote add origin https://github.com/<your-username>/clinkeys.git
git branch -M main
git push -u origin main
```

## Step 2 — Create a NEW Vercel project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository** and pick your **`clinkeys`** repo (not doorstep).
3. Vercel auto-detects Next.js. Leave the defaults.
4. Add the environment variables below.
5. Click **Deploy**.

This creates a brand-new project with its own URL, e.g.
`https://clinkeys-abc123.vercel.app`, completely separate from the Doorstep
deployment.

## Step 3 — Environment variables on Vercel

In the Vercel project, go to **Settings → Environment Variables**:

| Name                   | Value                                       | Required |
| ---------------------- | ------------------------------------------- | -------- |
| `NEXT_PUBLIC_SITE_URL` | Your live URL (the `.vercel.app` one, or your custom domain once added) | Yes |
| `RESEND_API_KEY`       | Your Resend key                             | Optional |

Redeploy after adding them so they take effect.

## Step 4 — Custom domain (Clinkeys)

Once you're happy with the `.vercel.app` preview:

1. In the Vercel project go to **Settings → Domains**.
2. Add your Clinkeys domain (e.g. `clinkeys.com`).
3. Follow Vercel's DNS instructions at your registrar.
4. Update `NEXT_PUBLIC_SITE_URL` to the custom domain and redeploy.

## Workflow: preview here, then promote

The whole point of Clinkeys is to be a safe copy: make and check changes here,
confirm they look right on the Clinkeys `.vercel.app`, and only then mirror the
approved changes into the production Doorstep site.
