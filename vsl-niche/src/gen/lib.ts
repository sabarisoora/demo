import { Easing, interpolate, spring } from "remotion";
import { CUES, META, SPEC, SYNC, TL } from "./cur";

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
  violet: "#a78bfa",
  paper: "#ffffff",
  line: "#e2e8f0",
};
export const col = (c?: string) => (c ? ((C as Record<string, string>)[c] ?? c) : C.cyan);

export const FONT = {
  sans: "'Poppins', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

export type Word = { w: string; s: number };
export type Line = { scene: string; sub: string; start: number; end: number; words: Word[] };
export const LINES = (TL as { lines: Line[] }).lines;
export const TOTAL_FRAMES = Math.ceil((TL as { duration: number }).duration * FPS);
export const f = (sec: number) => Math.round(sec * FPS);

// ---------- spec ----------
export type V = Record<string, any> & { t: string };
export type SpecLine = [string, string, string | null, V | null];
export type Spec = {
  slug: string;
  name: string;
  short: string;
  file_ess: string;
  file_elite: string;
  cover: string;
  n_ess: number;
  n_elite: number;
  reveal: { chips: string[]; made: string };
  who: [string, string, string][];
  tiers: string[][];
  guide: { ess: number; elite: number };
  end: [string, string];
  lines: SpecLine[];
};
export const S = SPEC as unknown as Spec;
// word-sync from the audio step: block fractions at which each highlight / item is spoken
const SY = SYNC as unknown as Record<string, { hi?: number[]; at?: number[]; flip?: number[] }>;
export const VIS: (V | null)[] = S.lines.map((l, idx) => {
  const v = l[3];
  const sy = SY[String(idx)];
  if (!v || !sy) return v;
  const o: V = { ...v };
  if (sy.hi && Array.isArray(v.hi)) o.hi = v.hi.map((h: any[], k: number) => { const c = [...h]; while (c.length < 5) c.push(undefined); c[4] = sy.hi![k] ?? c[4]; return c; });
  if (sy.at) o.syncAt = sy.at;
  if (sy.flip) o.syncFlip = sy.flip;
  return o;
});

// ---------- generated asset metadata ----------
export type SheetMeta = { img: string; w: number; h: number; rows: [string, number, number, number, number][] };
export type Meta = { ess: string[]; elite: string[]; sheets: Record<string, SheetMeta>; docs: Record<string, string[]>; fg: Record<string, number[]> };
export const M = META as unknown as Meta;
export const sheetKey = (ed: string, tab: string) => `${ed}::${tab}`;
export function findSheet(ed: string, tab: string): SheetMeta {
  const k = sheetKey(ed, tab);
  if (M.sheets[k]) return M.sheets[k];
  const low = tab.toLowerCase();
  const hit = Object.keys(M.sheets).find((x) => x.startsWith(ed + "::") && x.toLowerCase().includes(low));
  if (!hit) throw new Error(`sheet not found: ${k}`);
  return M.sheets[hit];
}
export function tabOf(ed: string, tab: string) {
  const all = ed === "ess" ? M.ess : M.elite;
  return all.find((t) => t === tab) ?? all.find((t) => t.toLowerCase().includes(tab.toLowerCase())) ?? tab;
}

export const SCENE_ORDER = [...new Set(LINES.map((l) => l.scene))];
export const SCENE_LEAD = 0.4;
export const VIS_LEAD = 6; // frames the picture leads the voice (gen_audio.py LEAD = 0.2 s)

export type WLine = Line & { s: number; e: number; idx: number };
export type Win = { name: string; from: number; duration: number; lines: WLine[] };
export function sceneWindow(name: string): Win {
  const first = LINES.findIndex((l) => l.scene === name);
  const next = SCENE_ORDER[SCENE_ORDER.indexOf(name) + 1];
  const nextLine = next ? LINES.find((l) => l.scene === next)! : null;
  const from = f(Math.max(0, LINES[first].start - SCENE_LEAD));
  const to = nextLine ? f(nextLine.start - SCENE_LEAD) : TOTAL_FRAMES;
  const lines = LINES.map((l, idx) => ({ ...l, idx, s: Math.max(0, f(l.start) - from - VIS_LEAD), e: f(l.end) - from - VIS_LEAD })).filter((l) => l.scene === name);
  return { name, from, duration: to - from, lines };
}
export const at = (w: Win, i: number, p = 0) => Math.round(w.lines[i].s + (w.lines[i].e - w.lines[i].s) * p);

export type Cue = { frame: number; kind: string };
export const CUE_LIST: Cue[] = (CUES as [number, number, string][]).map(([i, p, kind]) => ({
  frame: f(LINES[i].start + (LINES[i].end - LINES[i].start) * p) - VIS_LEAD,
  kind,
}));

export const ez = Easing.bezier(0.16, 1, 0.3, 1);
export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ap = (fr: number, a: number, len = 10) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: ez });
export const out = (fr: number, a: number, len = 8) => 1 - interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
export const pop = (fr: number, a: number, stiffness = 200, damping = 14) => spring({ frame: fr - a, fps: FPS, config: { damping, stiffness, mass: 0.7 } });
