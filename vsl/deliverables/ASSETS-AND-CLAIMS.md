# ProfitIQS VSL v2: sources, claims and open items

Runtime is 5:49. Every product visual is the real **Auto Repair Shop Complete 2026** package that the owner supplied.
The sheets were rendered straight from the `.xlsx` files and are labelled **SAMPLE DATA** on screen. The covers are the
63 real covers from profitiqs.com.

## Where each claim comes from

| Claim in the video | Source |
|---|---|
| 21 industries, 63 systems, 3 editions each | profitiqs.com home page and /products (63 product pages fetched) |
| Essential $97 · Elite $197 · Complete $249 | profitiqs.com /compare and every product page; confirmed by the owner |
| Essential = core entry, tracking and dashboard sheets plus Business Health Snapshot | /compare, the site FAQ, and the Essential workbook's tabs |
| Elite = deeper KPI tracking, forecasting, Business Health Score™ | /compare, the site FAQ, and the Elite workbook's tabs |
| Complete = both workbooks, so you don't have to choose | /compare ("Complete is for you if…"), the site FAQ |
| Every edition includes the Field Guide and Quick Start | each product page's "What's included" list (all 3 tiers) |
| Setup sets currency and tax reserve rate from business name, owner and country | Essential Quick Start p.3, SETUP sheet |
| One line per repair order (parts and labor revenue and cost); RO profit calculates | REPAIR ORDER ENTRY sheet |
| Dashboard: revenue, expenses, net profit, margin, avg RO profit, tax reserve, monthly chart, plain-words insights | DASHBOARD sheet |
| Health Snapshot scores profit, cash, tax readiness, expenses, revenue trend | BUSINESS HEALTH SNAPSHOT sheet |
| Accountant export | ACCOUNTANT EXPORT sheet |
| Elite: Executive Command Center, Technician Performance, Comeback Tracker, Cash Flow, Receivables, 6-month forecast in 3 scenarios | Elite sheets 02, 08, 14, 17, 18, 27 |
| Profit Leak Detector™ flags low-margin jobs, warranty losses, inventory waste, collection problems; Healthy/Review | Elite sheet 26 |
| Business Health Score™ out of 100 | Elite sheet 25 |
| Restaurant / HVAC / Trucking / Airbnb section names | each industry's Elite product page ("the real section list") |
| No macros; every calculation is a plain formula | Elite Field Guide ("MACROS — None.") |
| Desktop Excel 2019, 2021 or Microsoft 365 | Elite Field Guide |
| "The workbook does the math. You still have to look at it." | Elite Field Guide, "The honest version" |
| One payment, no subscription | profitiqs.com home page ("one payment, no subscription") |
| Files delivered right after checkout | site FAQ (Digistore24 Download Vault after payment confirms) |
| 60-day money-back guarantee | product pages ("60-day money-back guarantee, no questions asked") |

## Things to know or check

- **All numbers on screen are sample data** from the workbook, and every sheet window says so. No results, testimonials or income claims are made.
- **Guarantee wording:** product pages say "60-day money-back guarantee, no questions asked"; the FAQ says "60-day return window, processed through Digistore24". The video says "60-day money-back guarantee", so keep both pages consistent.
- **Auto Repair only:** the walkthrough uses the Auto Repair system. Other industries have different sheets, which the video says out loud ("In auto repair…", "Every industry gets its own system").
- **"Dozens of sheets" for Auto Repair Elite:** the workbook has 41 visible tabs, and the site lists 38 sections. The video avoids an exact number.
- **Voice** is AI (Kokoro "af_heart"). An owner or professional read of `deliverables/voiceover-script.txt` will raise trust. Re-time with `scripts/make_vo.py` after swapping in the recording.
- **Website scene** is a stylised URL bar and steps, not a screen recording of profitiqs.com.
