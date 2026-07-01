# Collecting email signups

Every email form on the site (the guide unlock gate, the homepage capture, and
the "coming soon" pages) posts to `/api/signup`. That endpoint saves each
signup with three fields:

- **Email** — the address entered
- **Source** — where it came from (`guide-gate`, `homepage`, `coming-soon`, …)
- **Date** — an ISO timestamp

It saves to **Airtable and/or a Google Sheet** — whichever you configure with
environment variables. If you set neither, signups are only written to the
server log (fine for testing, not for keeping a list). You can also set
`RESEND_API_KEY` to send a welcome email on top.

Pick **one** of the two options below.

---

## Option A — Google Sheet (simplest to view)

1. Create a new Google Sheet. In the first row add headers: `Date`, `Email`, `Source`.
2. Go to **Extensions → Apps Script** and paste this:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([data.date || new Date().toISOString(), data.email, data.source]);
     return ContentService
       .createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy → New deployment → Web app**. Set **Execute as: Me** and
   **Who has access: Anyone**. Deploy and copy the web-app URL.
4. In Vercel (**Settings → Environment Variables**) add:

   ```
   GOOGLE_SHEET_WEBHOOK_URL = <the web-app URL>
   ```

5. Redeploy. New signups now append rows to your sheet. Export any time with
   **File → Download → CSV**.

---

## Option B — Airtable

1. Create a base with a table (default name `Signups`) that has columns named
   exactly: **Email** (Single line text), **Source** (Single line text),
   **Date** (Single line text or Date).
2. Create a personal access token at
   [airtable.com/create/tokens](https://airtable.com/create/tokens) with the
   `data.records:write` scope and access to your base. Copy the token.
3. Find your **Base ID** (starts with `app…`) from
   [airtable.com/api](https://airtable.com/api) or the base URL.
4. In Vercel add:

   ```
   AIRTABLE_TOKEN   = <your token>
   AIRTABLE_BASE_ID = <appXXXXXXXXXXXXXX>
   AIRTABLE_TABLE   = Signups
   ```

5. Redeploy. New signups appear as rows in Airtable; export with
   **... → Download CSV**.

---

## Sending marketing later

Both options give you a clean, exportable list. When you're ready to send
campaigns, import that CSV into an email tool (Mailchimp, Kit, Brevo, Resend
Broadcasts) — or ask to have signups piped directly into one of those instead.

## A note on consent (UK)

You're marketing to UK residents, so under UK GDPR/PECR keep the consent you
already collect (the forms say "unsubscribe anytime") and include a working
unsubscribe link in every marketing email. Any of the email tools above handle
unsubscribes for you.
