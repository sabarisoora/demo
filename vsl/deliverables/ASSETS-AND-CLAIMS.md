# ProfitIQS VSL: missing assets, unsupported features, claims to verify

The video was built only from the supplied script and what is in this repository. The production
container could not reach profitiqs.com, and no workbook files, covers or screen recordings were supplied.
Every scene without genuine footage is labelled **"Illustrative visual"** on screen.

## 1. Missing assets (swap them in via `src/assets.ts`, then re-render)

| Asset | Where it goes | Current stand-in |
|---|---|---|
| Screen recording of a real ProfitIQS workbook (data entry, tracking sheets, summaries) | Scene 4, product centrepiece (`productDemo`) | Neutral spreadsheet illustration: soft bars, no numbers, tabs "Records / Tracking / Review" |
| Screen recording of profitiqs.com: niche directory → niche page → edition comparison | Scene 7, CTA browser (`websiteDemo`) | Neutral grid of placeholder tiles, URL typed in |
| Workbook cover images for Essential, Elite, Complete | Scenes 4 and 6, edition cards (`editionCovers`) | Name-only cards |
| Product covers for each of the 21 niches | Scene 5 niche montage | Text tiles |
| Official logo files (SVG/PNG) | Throughout | Rebuilt from `src/app/icon.svg` in this repo, with "ProfitIQS™" set in Archivo |
| Full list of all 21 niche names | Scene 5 | Only the 13 niches named in the script are shown, plus "…and more / See all 21 at ProfitIQS.com" |
| Owner-recorded or professional human voiceover | Whole video | AI voice (Kokoro TTS, "af_heart"). Lines and timings are in `script/lines.json` and `deliverables/subtitles.srt` |
| Licensed music | Whole video | Original ambient bed synthesized for this video, so there are no licensing issues |

## 2. Features not shown because they could not be verified
- What each edition contains, and how Essential, Elite and Complete differ. The cards show only the name and price, plus "See what's included at ProfitIQS.com".
- Specific dashboards, reports, charts, metrics or calculations inside the workbooks.
- Which niches have which editions.
- "Most popular" or "best value" badges. None were used.

## 3. Claims that need sign-off before publishing
| Claim | Source | Status |
|---|---|---|
| Essential $97, Elite $197, Complete $249 | Supplied script | **Verify against current checkout pricing.** The web app in this repo describes Essential as free and Elite as a Digistore24 subscription. That is a different product from the workbooks, so make sure viewers can't confuse the two. |
| "21 business niches" | Supplied script | This repo only contains the auto-repair niche, so verify the count on the live site. |
| Niche names (auto repair, HVAC, plumbing, roofing, landscaping, ecommerce, digital marketing, restaurants, dental practices, property management, trucking, contractors, cleaning businesses) | Supplied script | Verify that each one is live. |
| "Business Intelligence Systems™" / "ProfitIQS™" trademark marks | Supplied script | Confirm that the ™ use is intended. |
| Pronunciation "Profit-I-Q-S" | Voice choice | Confirm how the brand is said. If it's different, change `say` in `script/lines.json` and re-run `make_vo.py`. |

No testimonials, revenue results, integrations, or "guaranteed profit" claims appear anywhere in the video.
