# ProfitIQS — Business Intelligence web app

The SaaS version of the ProfitIQS™ Business Intelligence System workbooks. Owners log jobs and
expenses (or import a CSV) and get their true profit, a tax reserve, VAT/GST position, a health
score and an accountant export. **Essential is free; Elite is a paid Digistore24 subscription.**

First niche: **Auto Repair Shop**. The engine is shared, so adding a niche is one config file.

## What's included

| Essential (free) | Elite (paid) |
|---|---|
| Dashboard: revenue, expenses, net profit, margin, tax reserve, 12‑month chart, insights, monthly checklist | **Profit Leak Detector**: low‑margin jobs, parts/labor margin, overhead creep, rising expenses, weak service lines, unfunded tax, each with a $ impact |
| Repair orders (parts + labor revenue/cost) and expenses: add, edit, delete | **Service Profitability**: revenue, margins and profit per service category |
| Tax & Deductions: reserve rate for 50 countries, VAT/GST output/input/net, deductions by category | **6‑Month Forecast**: conservative / expected / aggressive scenarios |
| Health Snapshot (5 scores + overall) | |
| Accountant Export (print/PDF) + CSV export | |
| CSV import (auto‑matches column names) and one‑click sample data | |

Free users see Elite pages blurred, with a teaser computed from **their own data** ("we found 2
leaks worth $4,057"). The blurred preview is rendered from sample data, so paid details never
reach the browser.

The calculations match the Excel workbook: the unit tests check them against the values Excel
computed for the same sample data (`src/lib/metrics.test.ts`).

## Tech

Next.js 16 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Postgres via Drizzle ORM ·
email/password auth with database sessions (bcrypt, httpOnly cookies) · Digistore24 IPN.
Free to host: Vercel Hobby + Neon free Postgres.

## Deploy to Vercel (free)

1. **Import the repo** at vercel.com → *Add New → Project* → pick this GitHub repo. Framework is detected as Next.js; keep the defaults.
2. **Add a database**: in the project, *Storage → Create Database → Neon (Postgres)* → connect it to the project. This sets `DATABASE_URL` for you.
3. **Environment variables** (*Settings → Environment Variables*):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_APP_URL` | `https://app.profitiqs.com` (or your `*.vercel.app` URL) |
   | `NEXT_PUBLIC_DS24_ELITE_PRODUCT_ID` | Your Elite subscription's product ID in Digistore24 |
   | `DS24_ELITE_PRODUCT_IDS` | Optional: comma‑separated list if several products unlock Elite (e.g. monthly + yearly) |
   | `DS24_IPN_PASSPHRASE` | A long random string; enter the same one in Digistore24 (step 5) |
   | `NEXT_PUBLIC_ELITE_PRICE_LABEL` | e.g. `$29/mo` (optional, shown on pricing) |

4. **Deploy.** The build runs database migrations automatically (`npm run build` = migrate + `next build`). After changing a `NEXT_PUBLIC_*` variable, redeploy so it takes effect.
5. **Connect Digistore24**:
   - Create the Elite product as a **subscription** (monthly payment plan). Set its affiliate commission (first payment vs. follow‑up payments).
   - *Settings → Integrations (IPN) → New connection → Generic*: URL `https://YOUR-DOMAIN/api/ds24/ipn`, SHA passphrase = `DS24_IPN_PASSPHRASE`. Click *Test connection*; it should answer `OK`.
   - Product → *Thank you page*: `https://YOUR-DOMAIN/app/upgrade/thanks`.
6. **Custom domain** (optional): *Settings → Domains* → add `app.profitiqs.com`, then add the CNAME Vercel shows at your domain registrar.

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
npm test                      # unit tests (metrics, CSV, DS24 signature)
npm run lint                  # TypeScript check
```

## Adding a niche

1. Copy `src/niches/auto-repair.ts` to e.g. `src/niches/salon.ts` and change the labels (job name, the two revenue streams, categories, thresholds, landing copy).
2. Add sample data as `src/niches/samples/salon.json` (same shape: `orders` + `expenses`).
3. Register it in `src/niches/index.ts`.
4. Send that niche's traffic to `/signup?niche=salon`. A per‑niche landing page (`/salon`) is the next step.

## Project layout

```
src/
  app/
    page.tsx                 landing page (affiliate traffic lands here)
    (auth)/                  signup, login, logout
    app/                     the logged‑in product (dashboard, entries, tax, health, export, import, settings)
    app/elite/               Elite reports (gated)
    api/ds24/ipn/            Digistore24 webhook
    api/export/[kind]/       CSV downloads
  lib/metrics.ts             the calculation engine (pure, unit‑tested)
  lib/ds24.ts                IPN signature + checkout links
  lib/auth.ts                sessions and passwords
  niches/                    per‑niche config + sample data
  db/schema.ts               database tables
  proxy.ts                   affiliate cookie capture
drizzle/                     SQL migrations
```

## Known gaps / next steps

- **Password reset and email verification** need an email provider (e.g. Resend, free tier). Until then, reset passwords manually in the database. Without email verification, a pre‑signup purchase can be claimed by whoever registers that email first.
- **Login rate limiting** isn't implemented yet (add Vercel Firewall rules or Upstash).
- Per‑niche landing pages, more Elite reports from the workbook (technicians, inventory, receivables, benchmarks), and a yearly plan.
- Tax figures are planning estimates, not tax advice; the disclaimer is shown on every tax screen.
