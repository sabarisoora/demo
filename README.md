# ProfitIQS — Business Intelligence web app

The SaaS version of the ProfitIQS™ Business Intelligence System workbooks. For auto repair it is
a full **shop management app**: customers and vehicles, line-item repair orders, estimates,
invoices with a shareable link, parts inventory, service reminders and team logins, on top of
the profit, tax, health and Elite reports from the workbook. **Essential is free; Elite is a paid
Digistore24 subscription.**

First niche: **Auto Repair Shop**. The engine is shared, so adding a niche is one config file.

## Why it beats the Excel workbook

| Excel workbook | Web app |
|---|---|
| One file on one computer | Any phone, tablet or PC; install it to the home screen (PWA) |
| Retype totals for every RO | Line-item editor: pick a part from stock, add labor hours at your shop rate, tax and profit update as you type |
| No customer history per car | Customer and vehicle records with VIN, plate, mileage and full visit history |
| Print or email the sheet | Estimate → approve → in progress → completed; printable invoice and a private link the customer opens on their phone |
| Manually reduce inventory counts | Stock comes off the shelf when an RO is in progress or completed, and goes back if it's reopened or deleted |
| Scan for cars due a service | Service reminders list who's overdue or due soon, with a ready-to-send message |
| Shared file = overwrites and no access control | Team logins with Owner / Staff / Read-only roles |
| Start over in a new app | **Import the Essential or Elite workbook as is** (6,200 Elite ROs import in a few seconds) |

## What's included

| Essential (free) | Elite (paid) |
|---|---|
| Dashboard: revenue, expenses, net profit, margin, tax reserve, 12‑month chart, insights, monthly checklist | **Profit Leak Detector**: low‑margin jobs, parts/labor margin, overhead creep, rising expenses, weak service lines, unfunded tax, each with a $ impact |
| Repair orders (parts + labor revenue/cost) and expenses: add, edit, delete | **Service Profitability**: revenue, margins and profit per service category |
| Tax & Deductions: reserve rate for 50 countries, VAT/GST output/input/net, deductions by category | **6‑Month Forecast**: conservative / expected / aggressive scenarios |
| Health Snapshot (5 scores + overall) | **Customer Insights**: top 25, VIP/Core/Occasional segments, repeat rate, win‑back list of lapsed regulars (CSV) |
| Accountant Export (print/PDF) + CSV export | **Monthly Business Review**: any month vs. prior month and same month last year, printable |
| CSV import (auto‑matches column names) and one‑click sample data | **KPI Scorecard & Benchmarks**: editable yearly goals with progress, and your numbers vs. industry benchmarks |
| Weekly summary email (opt-out, one-click unsubscribe) | **Cash Flow**: money in/out per month, running cash position, runway |
| Optional job details: technician, hours, paid/unpaid, comeback | **Receivables**: unpaid balances aged Current/31–60/61–90/90+ days, chase list, mark paid |
| | **Technicians & Comebacks**: revenue, hours, effective labor rate and comeback rate per technician; comebacks by category |

Free users see Elite pages blurred, with a teaser computed from **their own data** ("we found 2
leaks worth $4,057"). The blurred preview is rendered from sample data, so paid details never
reach the browser.

**Accounts and operations:** email confirmation, forgot/reset password, change password, full
data export (JSON + CSV), self-serve account deletion, rate-limited login/signup/reset, an owner
**admin panel** (`/admin`: signups, Elite subscribers, signups per affiliate, Digistore24 event log,
manual Elite grant/revoke), Terms / Privacy / Refund pages, per-niche landing pages
(`/auto-repair`), sitemap, robots, 404/error pages and security headers.

The calculations match the Excel workbook: the unit tests check them against the values Excel
computed for the same sample data (`src/lib/metrics.test.ts`).

## Tech

Next.js 16 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Postgres via Drizzle ORM ·
email/password auth with database sessions (bcrypt, httpOnly cookies) · Digistore24 IPN.
Free to host: Vercel Hobby + Neon free Postgres.

## Deploy to Vercel (free)

1. **Import the repo** at vercel.com → *Add New → Project* → pick this GitHub repo. Framework is detected as Next.js; keep the defaults.
2. **Add a database**: in the project, *Storage → Create Database → Neon (Postgres)* → connect it to the project. This sets `DATABASE_URL` for you (`POSTGRES_URL` also works).
3. **Environment variables** (*Settings → Environment Variables*):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_APP_URL` | `https://app.profitiqs.com` (or your `*.vercel.app` URL) |
   | `NEXT_PUBLIC_DS24_ELITE_PRODUCT_ID` | Your Elite subscription's product ID in Digistore24 |
   | `DS24_ELITE_PRODUCT_IDS` | Optional: comma‑separated list if several products unlock Elite (e.g. monthly + yearly) |
   | `DS24_IPN_PASSPHRASE` | A long random string; enter the same one in Digistore24 (step 5) |
   | `NEXT_PUBLIC_ELITE_PRICE_LABEL` | e.g. `$29/mo` (optional, shown on pricing) |
   | `ADMIN_EMAILS` | Your email, e.g. `you@profitiqs.com`. Sign up with it and confirm it to open `/admin` |
   | `RESEND_API_KEY` | From resend.com (free). Needed for password reset and email confirmation |
   | `EMAIL_FROM` | e.g. `ProfitIQS <hello@profitiqs.com>` once your domain is verified in Resend |
   | `NEXT_PUBLIC_SUPPORT_EMAIL` | Shown in the app, emails and legal pages |
   | `NEXT_PUBLIC_COMPANY_NAME` | Your legal business name, shown on legal pages |
   | `NEXT_PUBLIC_GOVERNING_LAW` | Country whose law governs the Terms (default `India`) |
   | `NEXT_PUBLIC_REFUND_DAYS` | Money-back window in days; match your DS24 product (default `30`) |
   | `CRON_SECRET` | Any long random string. Turns on the weekly summary email job (Vercel sends it on cron calls) |

   Without `RESEND_API_KEY` the app still works, but emails (confirmation, password reset, team invitations, weekly summary) are only written to the Vercel function logs.

4. **Redeploy** (*Deployments → ⋯ → Redeploy*). The build creates the database tables automatically (`npm run build` = migrate + `next build`). The first deploy, before a database is connected, still succeeds: it skips migrations with a warning, and the landing page works, but signup needs the database. Redeploy after connecting it, and after changing any `NEXT_PUBLIC_*` variable.
5. **Connect Digistore24**:
   - Create the Elite product as a **subscription** (monthly payment plan). Set its affiliate commission (first payment vs. follow‑up payments).
   - *Settings → Integrations (IPN) → New connection → Generic*: URL `https://YOUR-DOMAIN/api/ds24/ipn`, SHA passphrase = `DS24_IPN_PASSPHRASE`. Click *Test connection*; it should answer `OK`.
   - Product → *Thank you page*: `https://YOUR-DOMAIN/app/upgrade/thanks`.
6. **Custom domain** (optional): *Settings → Domains* → add `app.profitiqs.com`, then add the CNAME Vercel shows at your domain registrar.

### Set up email (Resend, free)

1. Sign up at resend.com → *API Keys → Create* → put it in `RESEND_API_KEY` on Vercel.
2. *Domains → Add domain* → `profitiqs.com` → add the DNS records it shows at your domain registrar → wait for *Verified*.
3. Set `EMAIL_FROM` to `ProfitIQS <hello@profitiqs.com>` and redeploy.

Before the domain is verified, Resend's test sender only delivers to the email you signed up to Resend with. That's enough to confirm your own admin account, but customers won't get emails until the domain is verified.

### Weekly summary email

`vercel.json` schedules `/api/cron/weekly-digest` daily at 13:00 UTC. Each run emails anyone with a confirmed email, some data, and no summary in the last week (up to 150 per run, the rest the next day), so each user gets one per week. It needs `CRON_SECRET` and `RESEND_API_KEY`. Users can switch it off in Account or with the one-click unsubscribe link. Use **Admin → Send me a test weekly summary** to preview it.

### Team access (Elite)

The owner opens **Team** and invites people by email. The invitation link is valid for 7 days and
works once; the person creates a login (or signs in, if they already have one) and joins the shop.

| Role | Can |
|---|---|
| Owner | Everything, including Settings, imports, billing, deleting data and managing the team |
| Staff | Create and edit repair orders, customers, vehicles, expenses and inventory; see all reports |
| Read-only | View everything and export CSVs, change nothing (enforced on the server, not just hidden) |

Members use the owner's plan. If the owner's Elite subscription ends, members are paused (they see
a notice and exports are refused) and come back automatically when Elite is active again. Removing
a member signs them out everywhere.

### Moving from the Excel workbook

**Import data → Moving from the ProfitIQS Excel workbook**: upload the Essential or Elite `.xlsx`
exactly as sold. Essential brings in repair orders, expenses, business name, country and opening
cash. Elite also brings customers, vehicles, technicians and labor cost (hours × their pay),
comebacks and the parts inventory. "Closed" ROs come in as completed; "Open" / "Waiting parts" as
in progress. Choose *Add to my data* or *Replace everything*. Max file size is 4 MB.

### Legal pages

`/terms`, `/privacy` and `/refunds` are written for how this app actually works (Digistore24 as reseller, Vercel/Neon/Resend as processors, only essential cookies). Fill in the business env vars above, and have them reviewed for your country before launch. They're a solid starting point, not legal advice.

### How affiliate tracking works

1. An affiliate's link brings a visitor to the site with `?aff=<affiliate>` (and optionally `&cam=<campaign>`). `src/proxy.ts` stores it in a cookie for 60 days.
2. On signup the affiliate is saved on the account (`users.affiliate`).
3. The **Upgrade** button opens the Digistore24 order form with `aff`, `cam`, `custom=<user id>` and the user's email, so the affiliate is credited even if the upgrade happens weeks later on another device.
4. Digistore24 calls `/api/ds24/ipn` (signature‑checked). `on_payment` / `on_rebill_resumed` → Elite; `on_rebill_cancelled` → Elite stays active ~31 more days; `on_refund` / `on_chargeback` / `on_payment_missed` → back to free. The account is matched by `custom`, then by email. Someone who buys before signing up gets Elite when they register with that email. Every IPN call is logged in `ipn_events`.

> In your DS24 product, check that affiliate links pass `aff` to your sales page (or send affiliates to `https://YOUR-DOMAIN/?aff=THEIR_ID`). DS24 also tracks affiliates with its own cookie at checkout; the stored `aff` is a backup for upgrades that happen later.

## Run locally

```bash
cp .env.example .env          # set DATABASE_URL to a local or Neon Postgres
npm install
npm run db:migrate
npm run dev                   # http://localhost:3000
npm test                      # unit tests (metrics, CSV, DS24 signature, RO totals, stock, workbook import)
npm run lint                  # TypeScript check
```

## Adding a niche

From one of your Essential workbooks (same layout as the auto repair one):

```bash
pip install openpyxl
python3 scripts/niche-from-workbook.py "Hair_Salon_..._Essential_2026.xlsx"   # optional: --slug hair-salon
npm test        # checks the new niche's totals against the values Excel computed
```

The script reads the niche name, the job type ("Repair Order" → "RO-"), the two revenue streams,
both category lists, the planning threshold and the sample rows. It writes `src/niches/<slug>.ts`,
its sample data and Excel's totals, and registers it. The landing page is then live at `/<slug>`
and in the sitemap. Review the generated copy, segment thresholds and default goals. Industry
benchmarks are left out unless you add them from a real source.

## Project layout

```
src/
  app/
    page.tsx                 landing page (affiliate traffic lands here)
    (auth)/                  signup, login, logout
    app/                     the logged‑in product (dashboard, entries, tax, health, export, import, settings)
    app/jobs/                repair orders: list, line-item editor, invoice view
    app/customers/           customers & vehicles
    app/inventory/           parts inventory (Elite)
    app/reminders/           service reminders (Elite)
    app/team/                team members & invitations (Elite)
    app/elite/               Elite reports (gated)
    i/[token]/               public invoice link for customers
    api/ds24/ipn/            Digistore24 webhook
    api/export/[kind]/       CSV downloads
  lib/metrics.ts             the calculation engine (pure, unit‑tested)
  lib/ds24.ts                IPN signature + checkout links
  lib/auth.ts                sessions, passwords, shop membership and roles
  lib/shop.ts                RO totals, stock movements, service-due dates (pure, unit‑tested)
  lib/workbook.ts            Excel workbook import (Essential + Elite)
  niches/                    per‑niche config + sample data
  db/schema.ts               database tables
  proxy.ts                   affiliate cookie capture
drizzle/                     SQL migrations
```

## Known gaps / next steps

- Changing the account email is handled by support for now (admin panel shows the user; update it in the database).
- Equipment tracking and the yearly plan from the Elite workbook.
- Reminders are copy-and-send (text/WhatsApp/email from your phone); automatic SMS would need a paid SMS provider.
- Online card payments on invoices (e.g. Stripe/Razorpay payment links) are not built in yet.
- Tax figures are planning estimates, not tax advice; the disclaimer is shown on every tax screen.
