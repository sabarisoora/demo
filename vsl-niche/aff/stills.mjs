import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("home/aff/timeline.json"));
const serveUrl = "build/aff-sb";
const browserExecutable = "/opt/pw-browsers/chromium";
const composition = await selectComposition({ serveUrl, id: "Aff", browserExecutable, inputProps: { audio: false }, chromiumOptions: { gl: "swangle" } });
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const frames = process.argv[3] ? process.argv[3].split(",").map(Number) : tl.lines.map((l) => Math.round((l.start + (l.end - l.start) * 0.75) * 30));
for (const [k, frame] of frames.entries()) {
  try { await renderStill({ serveUrl, composition, frame, output: `${out}/${String(k).padStart(3, "0")}.png`, browserExecutable, scale: 0.3, inputProps: { audio: false }, chromiumOptions: { gl: "swangle" } }); }
  catch (e) { console.log("ERR", k, frame, String(e).slice(0, 500)); }
}
console.log("stills done", frames.length);
