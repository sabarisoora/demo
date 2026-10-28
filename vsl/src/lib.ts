import { Easing, interpolate, spring } from "remotion";
import timeline from "./timeline.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  deep: "#0b1120",
  navy: "#111a33",
  brand: "#1d4ed8",
  brand2: "#2563eb",
  sky: "#60a5fa",
  soft: "#dbeafe",
  mint: "#93c5fd",
  cream: "#f8fafc",
  paper: "#ffffff",
  ink: "#0b1120",
  ink2: "#334155",
  muted: "#64748b",
  line: "#e2e8f0",
  gold: "#60a5fa",
  goldDeep: "#2563eb",
  red: "#ef4444",
  green: "#10b981",
  amber: "#f59e0b",
};

export const FONT = {
  display: "'Poppins', system-ui, sans-serif",
  body: "'Poppins', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

export type Line = { scene: string; sub: string; say: string; start: number; end: number };
export const LINES = timeline.lines as Line[];
export const TOTAL_FRAMES = Math.ceil(timeline.duration * FPS);

export const f = (sec: number) => Math.round(sec * FPS);

// Lines of one scene, with their start/end in frames relative to the scene's own start.
export const SCENE_LEAD = 0.5;
export function sceneWindow(name: string) {
  const idx = LINES.findIndex((l) => l.scene === name);
  const scenes = [...new Set(LINES.map((l) => l.scene))];
  const next = scenes[scenes.indexOf(name) + 1];
  const nextLine = next ? LINES.find((l) => l.scene === next)! : null;
  const from = f(Math.max(0, LINES[idx].start - SCENE_LEAD));
  const to = nextLine ? f(nextLine.start - SCENE_LEAD) : TOTAL_FRAMES;
  const lines = LINES.filter((l) => l.scene === name).map((l) => ({
    ...l,
    s: f(l.start) - from,
    e: f(l.end) - from,
  }));
  return { from, duration: to - from, lines };
}

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

export function appear(frame: number, at: number, len = 18) {
  return interpolate(frame, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

export function pop(frame: number, at: number, fps = FPS) {
  return spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
}

export function fadeOut(frame: number, duration: number, len = 14) {
  return interpolate(frame, [duration - len, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}
