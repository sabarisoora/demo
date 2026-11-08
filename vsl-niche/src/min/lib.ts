// Minimal / Swiss-editorial theme for the homepage VSL.
// Timing helpers come from the shared home timeline (home/cur/*.json); only the look lives here.
import { Easing, interpolate } from "remotion";
export { FPS, W, H, LINES, TOTAL, LEAD, CUE, f, norm, li, lio, ls, le, wf, wk, cf, SCENES, sceneStart, sceneEnd } from "../home/lib";

// warm off-white base, charcoal ink, one accent (the cobalt from the product covers), used sparingly
export const M = {
  bg: "#F3F1EC",
  paper: "#FBFAF7",
  ink: "#18181B",
  ink2: "#57575E",
  mute: "#A19D94",
  faint: "#CFCBC2",
  line: "#DDD9D0",
  acc: "#2448D8",
  accSoft: "#E3E8FB",
};
export const F = {
  sans: "'Inter Tight', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};
// margins of the 12-column grid
export const MX = 120;
export const COLW = (1920 - 2 * MX - 11 * 24) / 12;
export const col = (n: number) => MX + n * (COLW + 24);

export const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const eOut = Easing.bezier(0.16, 1, 0.3, 1); // entering: decelerate
export const eIn = Easing.bezier(0.7, 0, 0.84, 0); // leaving: accelerate
export const eIO = Easing.bezier(0.65, 0, 0.35, 1);
/** 0 -> 1 from frame a over len frames, ease-out */
export const inn = (fr: number, a: number, len = 18) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eOut });
/** 0 -> 1 from frame a over len frames, ease-in */
export const out = (fr: number, a: number, len = 10) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eIn });
export const io = (fr: number, a: number, len = 24) => interpolate(fr, [a, a + len], [0, 1], { ...cl, easing: eIO });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
