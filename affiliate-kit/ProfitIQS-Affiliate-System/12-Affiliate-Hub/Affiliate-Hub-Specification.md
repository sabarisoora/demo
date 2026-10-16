# ProfitIQS Affiliate Hub — Specification

The site's existing `/affiliates` portal (built earlier in this project, in `affiliates/` of the demo repository) already implements most of this hub: landing page, product directory with search and filters, one resource page per niche with copy buttons and downloads. This spec lists what to add so the hub matches this kit. Implementation is being done separately in VS Code; nothing here was deployed.

## URL: [AFFILIATE HUB URL — NEEDS CONFIRMATION]

## Navigation
Home · Commission · Niches · Resources · Tracking help · Compliance · Contact

## Pages and content

### 1. Welcome (`/affiliates/`)
- H1: "Partner With ProfitIQS. Promote Smarter Business Systems."
- Sub: "Industry-specific Excel business intelligence systems for 11 industries, with a ready-made promotion kit for every niche."
- Commission panel (from `config.json`): **90% launch commission** 17 October 2026 – 16 January 2027, then 85% (17 January 2027), then 80% standard (17 April 2027). Small print: "Planned schedule. Rates are set in Digistore24 at the time of sale. Illustrative amounts are not guaranteed payouts."
- Price row: Essential $97 · Elite $197 · Complete $249
- CTAs: "Browse niches" · "Download the master kit"

### 2. Master resources (`/affiliates/resources/`)
Downloads of the `00-Master-Affiliate-Kit` files: Program Overview, Commission Guide, Brand Messaging Guide, Launch Checklist, Compliance Guide, Shared Promotional Copy, brand mark.

### 3. Commission schedule (`/affiliates/commission/`)
The schedule table and illustrative table from `Commission-Guide.md`, with the "how payouts can differ" notes.

### 4. Niche directory (`/affiliates/#products`)
One card per niche: exact product name, three editions with prices, commission, "Open kit" link. Existing portal cards already do this; add prices.

### 5. Niche sections (`/affiliates/<slug>/`)
Existing pages plus: download link for the niche kit ZIP, the 30 hooks, 10 scripts, carousels and the 10 graphics from this kit.

| Niche | Slug | Kit folder |
|---|---|---|
| 1099 Contractor | `1099-contractor` | `01-1099-Contractor/` |
| Airbnb | `airbnb` | `02-Airbnb/` |
| Auto Repair Shop | `auto-repair` | `03-Auto-Repair-Shop/` |
| Cleaning Service | `cleaning-service` | `04-Cleaning-Service/` |
| Construction Job Cost | `construction` | `05-Construction-Job-Cost/` |
| Dental Practice | `dental` | `06-Dental-Practice/` |
| Digital Marketing Agency | `digital-marketing-agency` | `07-Digital-Marketing-Agency/` |
| Ecommerce | `ecommerce` | `08-Ecommerce/` |
| Electrical Contractor | `electrical-contractor` | `09-Electrical-Contractor/` |
| HVAC | `hvac` | `10-HVAC/` |
| Pest Control | `pest-control` | `11-Pest-Control/` |

### 6. Tracking and troubleshooting (`/affiliates/tracking/`)
- Where to find your link: Digistore24 account → the ProfitIQS product → promotion link. [NEEDS CONFIRMATION: exact Digistore24 menu path]
- My clicks are not showing: reporting can be delayed; test once from a private window; check you used the correct product's link.
- I clicked my own link and bought: do not — self-purchases may be rejected under Digistore24's terms. [NEEDS CONFIRMATION]
- Cookie duration, payout schedule, refund windows: see Digistore24 terms / your account. [NEEDS CONFIRMATION]

### 7. Compliance (`/affiliates/#guidelines`)
Content of `Compliance-Guide.md`, labeled "ProfitIQS guidelines — Digistore24's terms remain binding".

### 8. Contact and support
Affiliate questions: **support@profitiqs.com** (subject "Affiliate"). Account, tracking and payout questions: Digistore24 support.

## Implementation notes
- Keep commission values in one data file (the portal already uses `data/program.json`; mirror `config.json` here).
- Show the 90% launch rate only while the launch phase is active; switch automatically by date.
- Do not publish sales-page links or "approved" badges until confirmed.
