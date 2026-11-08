// "Pure" premium theme: full white, near-black ink, Apple-style greys, one cobalt accent, deep layered shadows.
import { Easing, interpolate } from "remotion";
import META from "../../home/public/shots/meta.json";
export { FPS, W, H, LINES, TOTAL, LEAD, CUE, f, norm, li, lio, ls, le, wf, wk, cf, SCENES, sceneStart, sceneEnd } from "../home/lib";

export const P = {
  bg: "#FFFFFF",
  ink: "#0B0B0C",
  grey: "#86868B",
  grey2: "#6E6E73",
  soft: "#B8B8BD",
  tile: "#F5F5F7",
  line: "#E5E5EA",
  acc: "#2448D8",
};
export const F = {
  sans: "'Inter Tight', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};
export const SH = {
  card: "0 1px 2px rgba(0,0,0,0.04), 0 10px 28px -10px rgba(0,0,0,0.10), 0 44px 90px -36px rgba(0,0,0,0.22)",
  deep: "0 2px 6px rgba(0,0,0,0.05), 0 30px 60px -24px rgba(0,0,0,0.20), 0 90px 160px -50px rgba(0,0,0,0.32)",
  soft: "0 1px 2px rgba(0,0,0,0.03), 0 18px 40px -22px rgba(0,0,0,0.16)",
};
export const MX = 120;
export const SHOT: Record<string, [number, number]> = META as any;

export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const eOut = Easing.bezier(0.16, 1, 0.3, 1);
export const eIn = Easing.bezier(0.7, 0, 0.84, 0);
export const eIO = Easing.bezier(0.65, 0, 0.35, 1);
export const inn = (fr: number, a: number, len = 18) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eOut });
export const out = (fr: number, a: number, len = 10) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eIn });
export const io = (fr: number, a: number, len = 24) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eIO });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
