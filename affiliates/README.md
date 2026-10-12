# ProfitIQS Affiliate Partner Portal

A self-contained affiliate portal for ProfitIQS: a landing page, a searchable product directory and a full promotion kit for every industry. It is plain HTML/CSS/JS generated from two data files: no framework, no build dependencies, no tracking scripts.

```
affiliates/
  data/program.json      commission rate, launch promotion switch, Digistore24 + support settings
  data/products.json     one entry per industry  <-- the single source of truth for products
  scripts/build.py       generates site/ from the data (Python 3 standard library only)
  scripts/promo_copy.py  marketing copy templates (headlines, emails, captions, scripts, FAQ)
  scripts/banners.py     renders banners + share image (needs Node.js + Playwright)
  scripts/qa.js          browser QA: every page, desktop + mobile, links, images, filters, copy buttons
  src/portal.css, src/portal.js
  assets/                brand mark, product images, banners (+ webp previews), share image
  site/                  THE BUILT PORTAL: deploy this folder at https://www.profitiqs.com/affiliates/
```

## Pages

| URL | What it is |
|---|---|
| `/affiliates/` | Hero, commission, why partner, product directory (search + filter by industry, edition, availability), how it works, promotion kit overview, guidelines, FAQ, contact |
| `/affiliates/<industry>/` | Product overview, edition comparison, affiliate link instructions, headlines, short/long descriptions, feature summary, 2 emails, 4 social captions, 2 video scripts, product image + 5 banner sizes (download), product FAQ |

Every text block has a working copy-to-clipboard button. Downloads only appear for files that exist; anything missing shows an "Unavailable" state.

## Commands

```bash
cd affiliates
python3 scripts/build.py                     # rebuild site/ after any data change
python3 scripts/banners.py [slug ...]        # re-render banners (all, or the given niches)
NODE_PATH=/path/to/node_modules node scripts/qa.js   # browser QA (Playwright)
```

## Update the commission rate

Edit `data/program.json` → `commission.standard_percent` (and `last_verified`), then run `python3 scripts/build.py`.
Every page, card, table and FAQ answer reads the rate from that one field.

## Enable a 30-day launch promotion

In `data/program.json` → `launch_promotion`, set:

```json
"launch_promotion": { "enabled": true, "verified": true, "percent": 90,
                      "start_date": "2026-11-01", "end_date": "2026-11-30" }
```

Then rebuild. The promotion is shown **only** when `enabled` and `verified` are both true and the build date is inside the window.
The page also removes the banner in the visitor's browser once `end_date` has passed, and the next build drops it entirely.
Set the same promotion up in Digistore24 first; the portal only announces it.

## Add a new industry

1. Copy one entry in `data/products.json`, then change `id`/`slug` (lowercase, hyphens), `industry`, `product_title`, `audience`, `audience_short`, `business_phrase`, `one_liner`, `questions`, highlights, sheet lists and `tiers`.
2. Add `assets/products/<slug>-dashboard.png` (1600×1000 screenshot of the Elite dashboard with sample data).
3. Run `python3 scripts/banners.py <slug>` and then `python3 scripts/build.py`.

The new industry appears in the directory, the filters, the counts and its own resource page automatically; no page code changes.
To override any generated text, put it in that product's `custom_copy` (same keys as `scripts/promo_copy.py` returns).

## Verifying a product (prices, links, approval)

For each edition in `tiers`, fill in when confirmed:
`price`, `currency`, `price_verified: true`, `sales_page_url`, `digistore24_product_id`, `affiliate_promo_url`.
For the product, set `approval_status: "approved"` and `promotion_available: true` once Digistore24 marketplace approval is confirmed.

- The status pill changes from "Approval pending" to "Available to promote".
- Prices appear on cards and in the comparison table only when `price_verified` is true.
- A niche page is added to `sitemap-affiliates.xml` and switched to `index,follow` only when it is approved **and** has a sales page URL. Until then it is `noindex`, so no half-finished page reaches search engines.

## Deploying

1. Upload the contents of `site/` to `/affiliates/` on the website (any static host or CMS file upload works; links are relative).
2. Add `/affiliates/sitemap-affiliates.xml` to the site's sitemap index (or robots.txt `Sitemap:` line).
3. Link to `/affiliates/` from the main site footer ("Affiliates" or "Partners").
4. If the site is not at `https://www.profitiqs.com`, change `site_url` in `data/program.json` and rebuild (canonical URLs, share image and sitemap use it).

## Information still to confirm (shown as pending / unavailable on the site)

- Prices for every edition (all 33 product editions): not shown until verified.
- Official sales-page URLs and Digistore24 product IDs / promotion links: none were available.
- Digistore24 marketplace approval and promotion availability for each product: all marked "Approval pending".
- Digistore24 vendor ID / marketplace page for ProfitIQS: `affiliate_platform.vendor_id` is null.
- Auto Repair product title: the shipped files say "Auto Repair Shop Business Intelligence System™"; confirm it matches the sales page.
- Cookie duration, payout schedule and refund rules: the portal points affiliates to Digistore24's terms and does not state them.
- The promotion guidelines are a draft; Digistore24's terms remain binding.

## Sources of the product facts

Titles, edition contents, sheet counts, guide page counts and feature highlights were read from the shipped 2026 product ZIPs
(workbooks, Field Guides and Quick Starts). Product images are real renders of each Elite workbook's dashboard with its sample data.
The marketing copy contains no prices, results, testimonials, earnings or tax-outcome claims.
