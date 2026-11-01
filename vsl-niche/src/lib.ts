import { Easing, interpolate, spring } from "remotion";
import TL from "./timeline-1099.json";
import CUES from "../script/1099-cues.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: "#050816",
  navy: "#0b1120",
  ink: "#0b1120",
  ink2: "#334155",
  blue: "#2563eb",
  blue2: "#3b82f6",
  sky: "#60a5fa",
  cyan: "#22d3ee",
  soft: "#dbeafe",
  white: "#f8fafc",
  muted: "#94a3b8",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  paper: "#ffffff",
  line: "#e2e8f0",
};

export const FONT = {
  sans: "'Poppins', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

export type Word = { w: string; s: number };
export type Line = { scene: string; sub: string; start: number; end: number; words: Word[] };
export const LINES = TL.lines as Line[];
export const TOTAL_FRAMES = Math.ceil(TL.duration * FPS);
export const f = (sec: number) => Math.round(sec * FPS);

export const SCENE_ORDER = [...new Set(LINES.map((l) => l.scene))];
export const SCENE_LEAD = 0.4;

export type Win = { name: string; from: number; duration: number; lines: (Line & { s: number; e: number; idx: number })[] };
export function sceneWindow(name: string): Win {
  const first = LINES.findIndex((l) => l.scene === name);
  const next = SCENE_ORDER[SCENE_ORDER.indexOf(name) + 1];
  const nextLine = next ? LINES.find((l) => l.scene === next)! : null;
  const from = f(Math.max(0, LINES[first].start - SCENE_LEAD));
  const to = nextLine ? f(nextLine.start - SCENE_LEAD) : TOTAL_FRAMES;
  const lines = LINES.map((l, idx) => ({ ...l, idx, s: f(l.start) - from, e: f(l.end) - from })).filter((l) => l.scene === name);
  return { name, from, duration: to - from, lines };
}
// frame (scene-relative) of line i at fraction p, or of the n-th word
export const at = (w: Win, i: number, p = 0) => Math.round(w.lines[i].s + (w.lines[i].e - w.lines[i].s) * p);
export const atWord = (w: Win, i: number, n: number) => f(w.lines[i].words[Math.min(n, w.lines[i].words.length - 1)].s) - w.from;

// Cues: [global line index, fraction of the line, kind]. Kinds drive both picture (shake/flash) and sound.
export type Cue = { frame: number; kind: string };
export const CUE_LIST: Cue[] = (CUES as [number, number, string][]).map(([i, p, kind]) => ({
  frame: f(LINES[i].start + (LINES[i].end - LINES[i].start) * p),
  kind,
}));

export const ez = Easing.bezier(0.16, 1, 0.3, 1);
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ap = (fr: number, a: number, len = 10) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: ez });
export const out = (fr: number, a: number, len = 8) => 1 - interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
export const pop = (fr: number, a: number, stiffness = 200, damping = 14) => spring({ frame: fr - a, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
