// One still per narration line (at 70% through it) for review: out/board/NN.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [id, tlName, ...only] = process.argv.slice(2);
const tl = JSON.parse(fs.readFileSync(path.join(root, `src/${tlName}`)));
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browserExecutable = "/opt/pw-browsers/chromium";
const composition = await selectComposition({ serveUrl, id, browserExecutable });
fs.mkdirSync(path.join(root, "out/board"), { recursive: true });
const sel = only.map(Number);
for (let i = 0; i < tl.lines.length; i++) {
  if (sel.length && !sel.includes(i)) continue;
  const l = tl.lines[i];
  const frame = Math.round((l.start + (l.end - l.start) * 0.7) * 30);
  await renderStill({ serveUrl, composition, frame, output: path.join(root, `out/board/${String(i).padStart(2, "0")}.png`), browserExecutable, scale: 0.35 });
}
console.log("board done");
