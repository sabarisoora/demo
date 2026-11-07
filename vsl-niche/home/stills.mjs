// stills at 70% of each line (or given frames) -> build/home-board/NN.png + contact sheet
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("home/timeline.json"));
const serveUrl = process.env.SB || "build/home-bundle";
const browserExecutable = "/opt/pw-browsers/chromium";
const composition = await selectComposition({ serveUrl, id: "Home", browserExecutable, inputProps: { audio: false } });
const out = process.argv[2] || "build/home-board"; fs.mkdirSync(out, { recursive: true });
const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : tl.lines.map((l) => Math.round((l.start + (l.end - l.start) * 0.72) * 30));
for (const [k, frame] of frames.entries()) {
  try { await renderStill({ serveUrl, composition, frame, output: `${out}/${String(k).padStart(2, "0")}.png`, browserExecutable, scale: 0.3, inputProps: { audio: false } }); }
  catch (e) { console.log("ERR", k, frame, String(e).slice(0, 400)); }
}
console.log("stills done", frames.length);
