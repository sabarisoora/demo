import { Easing, interpolate, spring } from "remotion";
// home/cur/ holds the variant being rendered (full or short), copied in by home/render.sh
import TL from "../../home/cur/timeline.json";
import CUES from "../../home/cur/cues.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// light-only palette: white, pastel washes, black-ish ink, magenta / purple / cyan accents
export const C = {
  bg: "#FFFFFF",
  ink: "#1B1530",
  ink2: "#5E5878",
  mute: "#9A94B5",
  line: "#ECE6FA",
  mag: "#FF3EA5",
  pur: "#8B5CF6",
  cya: "#06B6D4",
  magL: "#FFE1F1",
  purL: "#EFE8FF",
  cyaL: "#DDF9FE",
  yel: "#FFC94D",
  grn: "#10B981",
  grnL: "#DCFCEF",
  pink: "#FF5C8A",
  pinkL: "#FFE8EF",
};
export const GRAD = `linear-gradient(100deg, ${C.mag} 0%, ${C.pur} 50%, ${C.cya} 100%)`;
export const FONT = { sans: "'Poppins', system-ui, sans-serif", serif: "'Playfair Display', Georgia, serif" };

export type Word = { w: string; s: number };
export type Line = { scene: string; sub: string; start: number; end: number; words: Word[]; cues: [string, string][] };
export const LEAD: number = (TL as any).lead;
export const LINES: Line[] = (TL as any).lines;
export const TOTAL = Math.ceil((TL as any).duration * FPS);
export type Cue = { line: number; kind: string; t: number; word: number };
export const CUE: Cue[] = CUES as any;

export const f = (s: number) => Math.round(s * FPS);
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
/** index of the first line whose subtitle starts with `p` */
export const li = (p: string) => {
  const i = LINES.findIndex((l) => l.sub.startsWith(p));
  if (i < 0) throw new Error("no line " + p);
  return i;
};
/** like li, but -1 when the line is not in this variant */
export const lio = (p: string) => LINES.findIndex((l) => l.sub.startsWith(p));
/** frame where line i starts (picture leads the voice by LEAD) */
export const ls = (i: number) => f(LINES[i].start - LEAD);
export const le = (i: number) => f(LINES[i].end - LEAD);
/** frame of the n-th spoken occurrence of word w in line i */
export const wf = (i: number, w: string, n = 0) => {
  const hits = LINES[i].words.map((x, k) => (norm(x.w) === norm(w) ? k : -1)).filter((k) => k >= 0);
  const k = hits[Math.min(n, hits.length - 1)];
  if (k === undefined) throw new Error(`word ${w} not in ${LINES[i].sub}`);
  return f(LINES[i].words[k].s - LEAD);
};
/** frame of word index k of line i */
export const wk = (i: number, k: number) => f(LINES[i].words[Math.min(k, LINES[i].words.length - 1)].s - LEAD);
/** frame of the n-th cue of a kind on line i (same instant the sfx lands) */
export const cf = (i: number, kind: string, n = 0) => {
  const c = CUE.filter((x) => x.line === i && x.kind === kind)[n];
  if (!c) throw new Error(`cue ${kind}#${n} not on line ${i}`);
  return f(c.t);
};
export const SCENES = [...new Set(LINES.map((l) => l.scene))];
export const sceneStart = (s: string) => ls(LINES.findIndex((l) => l.scene === s)) - 10;
export const sceneEnd = (s: string) => {
  const k = SCENES.indexOf(s);
  return k + 1 < SCENES.length ? sceneStart(SCENES[k + 1]) : TOTAL;
};

export const ez = Easing.bezier(0.16, 1, 0.3, 1);
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ap = (fr: number, a: number, len = 10) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: ez });
export const pop = (fr: number, a: number, stiffness = 240, damping = 13) => spring({ frame: fr - a, fps: FPS, config: { damping, stiffness, mass: 0.6 } });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
