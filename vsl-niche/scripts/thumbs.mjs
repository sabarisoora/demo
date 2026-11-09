// render VSL thumbnails: node scripts/thumbs.mjs <outdir> [kind:slug,...]
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
const serveUrl = "build/thumb-bundle", browserExecutable = "/opt/pw-browsers/chromium";
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const all = ["home:", "aff:", ...["1099","airbnb","auto-repair","cleaning-service","construction","dental-practice","digital-marketing-agency","ecommerce","electrical-contractor","hvac","landscaping","lawn-care","manufacturing","pest-control","plumbing-contractor","property-management","rental-portfolio","restaurant","roofing","small-business","trucking-owner-operator"].map((s) => "niche:" + s)];
const list = process.argv[3] ? process.argv[3].split(",") : all;
for (const item of list) {
  const [kind, slug] = item.split(":");
  const inputProps = { kind, slug };
  const composition = await selectComposition({ serveUrl, id: "Thumb", browserExecutable, inputProps });
  const name = kind === "home" ? "ProfitIQS-Home-VSL" : kind === "aff" ? "ProfitIQS-Affiliate-VSL" : `ProfitIQS-${slug}-VSL`;
  await renderStill({ serveUrl, composition, frame: 0, output: `${out}/${name}-thumbnail.png`, browserExecutable, scale: 1.5, inputProps, imageFormat: "png" });
  console.log("ok", name);
}
