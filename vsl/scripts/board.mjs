// Renders one still per narration line (near its end) for review: out/board/NN.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/timeline.json")));
const only = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const browserExecutable = "/opt/pw-browsers/chromium";
const comp = await selectComposition({ serveUrl, id: "VSL", browserExecutable });
fs.mkdirSync(path.join(root, "out/board"), { recursive: true });
const frames = tl.lines.map((l, i) => [i, Math.round((l.end - 0.1) * 30)]);
for (const [i, frame] of frames) {
  if (only.length && !only.includes(i)) continue;
  await renderStill({ serveUrl, composition: comp, frame, output: path.join(root, `out/board/${String(i).padStart(2, "0")}.png`), browserExecutable, scale: 0.5 });
}
console.log("board done");
