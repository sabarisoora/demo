// One still per narration line (70% through) from a built bundle: build/<slug>/board/NN.png, then a contact sheet.
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [slug, ...only] = process.argv.slice(2);
const tl = JSON.parse(fs.readFileSync(path.join(root, `build/${slug}/timeline.json`)));
const serveUrl = path.join(root, `build/${slug}/bundle`);
const browserExecutable = "/opt/pw-browsers/chromium";
const composition = await selectComposition({ serveUrl, id: "VSL", browserExecutable, inputProps: { captions: true } });
const out = path.join(root, `build/${slug}/board`);
fs.mkdirSync(out, { recursive: true });
const sel = only.map(Number);
for (let i = 0; i < tl.lines.length; i++) {
  if (sel.length && !sel.includes(i)) continue;
  const l = tl.lines[i];
  const frame = Math.round((l.start + (l.end - l.start) * 0.72) * 30);
  try {
    await renderStill({ serveUrl, composition, frame, output: path.join(out, `${String(i).padStart(2, "0")}.png`), browserExecutable, scale: 0.3, inputProps: { captions: true } });
  } catch (e) { console.log("ERR line", i, String(e).slice(0, 300)); }
}
console.log("board done");
