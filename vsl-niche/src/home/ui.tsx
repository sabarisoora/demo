import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ap, C, cl, ez, f, FONT, GRAD, LEAD, LINES, pop, sceneStart, SCENES } from "./lib";

// ---------- background: white with slow pastel washes and a faint dot grid ----------
export const Bg: React.FC = () => {
  const fr = useCurrentFrame();
  const blob = (x: number, y: number, r: number, col: string, sp: number, ph: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(fr / sp + ph) * 120 - r, top: y + Math.cos(fr / (sp * 1.3) + ph) * 90 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: col, filter: "blur(90px)", opacity: 0.55 }} />
  );
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {blob(260, 180, 420, "#FFD3EC", 140, 0)}
      {blob(1650, 260, 460, "#E4D8FF", 170, 2)}
      {blob(1250, 980, 480, "#CDF6FD", 155, 4)}
      {blob(300, 1000, 380, "#EFE3FF", 190, 1)}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(139,92,246,0.10) 1.6px, transparent 1.6px)", backgroundSize: "44px 44px", backgroundPosition: `0 ${-fr * 0.4}px` }} />
      {Array.from({ length: 18 }).map((_, k) => {
        const x = random(`sx${k}`) * 1920, y0 = random(`sy${k}`) * 1080, s = 4 + random(`ss${k}`) * 6;
        const y = (y0 - fr * (0.3 + random(`sv${k}`) * 0.5) + 1080 * 4) % 1080;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(fr / 20 + k));
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: [C.mag, C.pur, C.cya][k % 3], opacity: 0.22 * tw }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- gradient text ----------
export const GText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", paddingRight: "0.06em", ...style }}>{children}</span>
);

// ---------- kinetic text: every word lands exactly when it is spoken ----------
// [bracketed] words get the gradient serif accent
export const KText: React.FC<{ line: number; size?: number; align?: "center" | "left"; maxWidth?: number; color?: string; from?: number; dim?: number }> = ({ line, size = 84, align = "center", maxWidth = 1600, color = C.ink, from, dim }) => {
  const fr = useCurrentFrame();
  const l = LINES[line];
  const marks = (MARK[line] ?? "").split("|").filter(Boolean).map((x) => x.toLowerCase());
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", gap: `0 ${size * 0.26}px`, maxWidth, lineHeight: 1.12 }}>
      {l.words.map((w, k) => {
        const a = (from ?? 0) + f(w.s - LEAD) - 2;
        const s = pop(fr, a, 300, 16);
        const p = Math.min(1, s * 1.5);
        const clean = w.w;
        const acc = marks.some((m) => clean.toLowerCase().replace(/[^a-z0-9$-]/g, "").startsWith(m));
        const style: React.CSSProperties = {
          display: "inline-block",
          fontFamily: acc ? FONT.serif : FONT.sans,
          fontStyle: acc ? "italic" : "normal",
          fontWeight: acc ? 700 : 800,
          fontSize: acc ? size * 1.08 : size,
          letterSpacing: acc ? "-0.01em" : "-0.035em",
          color,
          opacity: p * (dim ?? 1),
          transform: `translateY(${(1 - s) * size * 0.45}px) scale(${1.35 - 0.35 * Math.min(1, s)})`,
          filter: `blur(${(1 - p) * 8}px)`,
        };
        return acc ? <span key={k} style={style}><GText>{clean}</GText></span> : <span key={k} style={style}>{clean}</span>;
      })}
    </div>
  );
};
// words to accent per line (prefix match, lowercased, "|" separated) — filled by H.tsx
export const MARK: Record<number, string> = {};

// ---------- captions (light pill, black words, gradient current word) ----------
export const Captions: React.FC<{ hideIn?: [number, number][] }> = ({ hideIn = [] }) => {
  const fr = useCurrentFrame();
  if (hideIn.some(([a, b]) => fr >= a && fr <= b)) return null;
  const i = LINES.findIndex((l) => fr >= f(l.start) - 3 && fr <= f(l.end) + 8);
  if (i < 0) return null;
  const l = LINES[i];
  const ws = l.words;
  const groups: number[][] = [];
  let cur: number[] = [];
  ws.forEach((w, k) => {
    cur.push(k);
    const len = cur.map((q) => ws[q].w).join(" ").length;
    if (cur.length >= 6 || len > 36 || (cur.length >= 3 && /[.,?!:]$/.test(w.w))) { groups.push(cur); cur = []; }
  });
  if (cur.length) groups.push(cur);
  let g = groups[0];
  for (const gr of groups) if (fr >= f(ws[gr[0]].s) - 2) g = gr;
  const p = ap(fr, f(ws[g[0]].s) - 3, 5);
  const o = interpolate(fr, [f(l.end) + 2, f(l.end) + 8], [1, 0], cl);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 38, pointerEvents: "none" }}>
      <div style={{ opacity: Math.min(p, o), transform: `translateY(${(1 - p) * 10}px)`, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, background: "rgba(255,255,255,0.94)", padding: "10px 28px", borderRadius: 999, border: `2px solid ${C.line}`, boxShadow: "0 14px 40px rgba(139,92,246,0.16)" }}>
        {g.map((k) => {
          const w = ws[k];
          const next = ws[k + 1];
          const on = fr >= f(w.s) - 1;
          const now = on && (!next || fr < f(next.s) - 1);
          return (
            <span key={k} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, color: on ? C.ink : C.mute, transform: `scale(${now ? 1.06 : 1})`, display: "inline-block" }}>
              {now ? <GText>{w.w}</GText> : w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene-change wipe: a pastel gradient band sweeps across ----------
export const Wipes: React.FC = () => {
  const fr = useCurrentFrame();
  const out: React.ReactNode[] = [];
  SCENES.slice(1).forEach((s, k) => {
    const a = sceneStart(s) - 8;
    const d = fr - a;
    if (d < 0 || d > 18) return;
    const p = interpolate(d, [0, 18], [-1, 1], { ...cl, easing: ez });
    out.push(
      <AbsoluteFill key={s} style={{ pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -300, bottom: -300, left: p * 2600 - 300 + 960 - 600, width: 1200, transform: "rotate(14deg)", background: `linear-gradient(90deg, transparent, ${k % 2 ? "#E9DDFF" : "#FFD9EE"} 20%, #FFFFFF 50%, ${k % 2 ? "#D5F7FD" : "#EDE3FF"} 80%, transparent)`, opacity: 0.96 }} />
      </AbsoluteFill>,
    );
  });
  return <>{out}</>;
};

// ---------- confetti burst ----------
export const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number; spread?: number }> = ({ at, x = 960, y = 540, n = 70, spread = 900 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 70) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, k) => {
        const ang = random(`ca${k}`) * Math.PI * 2;
        const v = (0.35 + random(`cv${k}`) * 0.65) * spread;
        const t = d / 70;
        const px = x + Math.cos(ang) * v * (1 - Math.pow(1 - t, 3));
        const py = y + Math.sin(ang) * v * 0.7 * (1 - Math.pow(1 - t, 3)) + t * t * 260;
        const s = 8 + random(`cs${k}`) * 12;
        const col = [C.mag, C.pur, C.cya, C.yel, "#FF9ED2"][k % 5];
        return <div key={k} style={{ position: "absolute", left: px, top: py, width: k % 3 === 0 ? s * 2 : s, height: s, borderRadius: k % 2 ? s : 3, background: col, opacity: 1 - t * 0.9, transform: `rotate(${d * (8 + k) + k * 40}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- expanding gradient rings ----------
export const Rings: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 960, y = 540, n = 3 }) => {
  const fr = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const d = fr - at - k * 6;
        if (d < 0 || d > 40) return null;
        const r = interpolate(d, [0, 40], [40, 700], { ...cl, easing: ez });
        return <div key={k} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${6 - k}px solid ${[C.mag, C.pur, C.cya][k % 3]}`, opacity: 1 - d / 40 }} />;
      })}
    </>
  );
};

// ---------- sparkle glints ----------
export const Sparkle: React.FC<{ at: number; x: number; y: number; n?: number; r?: number }> = ({ at, x, y, n = 8, r = 140 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 28) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const ang = (k / n) * Math.PI * 2 + 0.3;
        const rr = interpolate(d, [0, 28], [r * 0.3, r], { ...cl, easing: ez });
        const s = interpolate(d, [0, 8, 28], [0, 1, 0], cl) * (14 + (k % 3) * 6);
        return (
          <svg key={k} width={s * 2} height={s * 2} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x + Math.cos(ang) * rr - s, top: y + Math.sin(ang) * rr - s }}>
            <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill={[C.mag, C.pur, C.cya, C.yel][k % 4]} />
          </svg>
        );
      })}
    </>
  );
};

// ---------- brand ----------
export const Logo: React.FC<{ size?: number }> = ({ size = 160 }) => <Img src={staticFile("logo.png")} style={{ width: size, height: size }} />;
export const Wordmark: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: size, letterSpacing: "-0.045em", color: C.ink }}>
    Profit<GText>IQS</GText>
    <span style={{ fontSize: size * 0.28, verticalAlign: "top", fontWeight: 600, marginLeft: 4, color: C.ink2 }}>™</span>
  </span>
);
export const CoverImg: React.FC<{ slug: string; tier?: "Essential" | "Elite" | "Complete"; width?: number; style?: React.CSSProperties }> = ({ slug, tier = "Elite", width = 300, style }) => (
  <Img src={staticFile(`covers/${slug}/${tier}.png`)} style={{ width, height: width * 1.334, borderRadius: width * 0.035, boxShadow: "0 30px 60px -18px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.10)", display: "block", ...style }} />
);

// ---------- card + chip ----------
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: string }> = ({ children, style, glow }) => (
  <div style={{ background: "#FFFFFF", borderRadius: 28, border: `2px solid ${C.line}`, boxShadow: `0 24px 60px -20px ${glow ?? "rgba(139,92,246,0.30)"}`, ...style }}>{children}</div>
);
export const Chip: React.FC<{ children: React.ReactNode; col?: string; size?: number; style?: React.CSSProperties }> = ({ children, col = C.pur, size = 30, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontWeight: 700, fontSize: size, color: C.ink, background: "#FFFFFF", border: `2px solid ${col}55`, borderRadius: 999, padding: `${size * 0.32}px ${size * 0.8}px`, boxShadow: `0 12px 30px -10px ${col}66`, whiteSpace: "nowrap", ...style }}>{children}</div>
);

// ---------- icons (stroke, colourable) ----------
const P = (d: string, sw = 2) => <path d={d} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
const ICON: Record<string, React.ReactNode> = {
  check: P("M5 12l5 5 9-10", 3),
  x: P("M6 6l12 12M18 6L6 18", 3),
  wrench: P("M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 1-2-2z"),
  plate: <>{P("M4 3v8a2 2 0 0 0 4 0V3M6 11v10M18 3c-2 0-3 2-3 6s1 4 3 4v8")}</>,
  tooth: P("M7 3c-3 0-4 3-3 6 1 3 1 6 2 9 1 3 3 3 3 0l1-4h4l1 4c0 3 2 3 3 0 1-3 1-6 2-9 1-3 0-6-3-6-2 0-3 1-5 1S9 3 7 3z"),
  truck: <>{P("M2 7h11v9H2zM13 10h4l3 3v3h-7")}<circle cx="6" cy="17.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="16.5" cy="17.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  house: P("M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5"),
  cart: <>{P("M3 4h2l2 11h11l2-8H7")}<circle cx="9" cy="19" r="1.5" fill="currentColor" /><circle cx="17" cy="19" r="1.5" fill="currentColor" /></>,
  doc: P("M6 2h8l5 5v15H6zM14 2v5h5M9 13h7M9 17h7"),
  receipt: P("M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4"),
  bank: P("M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"),
  phone: P("M7 2h10v20H7zM11 18h2"),
  search: <>{P("M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM15 15l5 5", 2.4)}</>,
  sheet: P("M3 4h18v16H3zM3 9h18M3 14h18M9 4v16M15 4v16"),
  chart: P("M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"),
  dash: P("M3 4h8v8H3zM13 4h8v5h-8zM13 11h8v9h-8zM3 14h8v6H3z"),
  calc: P("M5 3h14v18H5zM8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2"),
  data: P("M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zM4 6c0 2 16 2 16 0M4 12c0 2 16 2 16 0"),
  book: P("M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6M20 4v15h-6"),
  rocket: P("M12 2c4 3 5 8 4 13l-4 3-4-3c-1-5 0-10 4-13zM9 17l-3 4M15 17l3 4M12 9a1.5 1.5 0 1 0 0 3"),
  tax: P("M5 19L19 5M7 7a2 2 0 1 0 0 .01M17 17a2 2 0 1 0 0 .01"),
  mail: P("M3 6h18v12H3zM3 6l9 7 9-7"),
  in: P("M12 4v12M6 10l6 6 6-6M4 20h16"),
  out: P("M12 20V8M6 14l6-6 6 6M4 4h16"),
  sun: <>{P("M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1")}<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  moon: P("M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"),
  play: P("M8 5l11 7-11 7z"),
  arrowDown: P("M12 4v16M5 13l7 7 7-7", 3),
  laptop: P("M4 5h16v11H4zM2 19h20"),
  card: P("M3 6h18v12H3zM3 10h18"),
  spark: P("M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"),
  people: P("M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M16 11a3 3 0 1 0 0-6M18 15c2 0 4 2 4 5"),
  bolt: P("M13 2L4 14h7l-1 8 9-12h-7z"),
  leaf: P("M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l8-8"),
  bug: P("M8 9h8v7a4 4 0 0 1-8 0zM9 6a3 3 0 0 1 6 0M4 12h4M16 12h4M5 18l3-2M19 18l-3-2M5 7l3 2M19 7l-3 2"),
  roof: P("M2 13l10-8 10 8M5 11v9h14v-9"),
  snow: P("M12 2v20M3 7l18 10M21 7L3 17"),
  hammer: P("M14 4l6 6-3 3-6-6zM12 8L4 16l3 3 8-8"),
  car: P("M4 16V12l2-5h12l2 5v4zM4 16v2M20 16v2M7 13h1M16 13h1"),
  gear: P("M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"),
  mega: P("M3 10v4h4l6 4V6l-6 4zM16 9a4 4 0 0 1 0 6"),
  bed: P("M3 18V8M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3M7 11a1.5 1.5 0 1 0 0 .01"),
  building: P("M4 21V4h10v17M14 9h6v12M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1"),
  briefcase: P("M3 8h18v12H3zM8 8V5h8v3M3 13h18"),
  store: P("M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6"),
  broom: P("M14 3l-4 9M7 12h8l2 9H5z"),
  grass: P("M3 20h18M6 20c0-5 1-8 3-10M10 20c0-6 1-10 2-13M14 20c0-5 1-8 3-10M18 20c0-4 0-6 1-8"),
  dollar: P("M12 3v18M16 7c-1-2-7-2-7 1 0 4 8 2 8 6 0 3-6 3-8 1"),
};
export const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 48, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, display: "block" }}>{ICON[name]}</svg>
);
export const IconBubble: React.FC<{ name: string; size?: number; col?: string; bg?: string }> = ({ name, size = 90, col = C.pur, bg }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.32, background: bg ?? `${col}1F`, border: `2px solid ${col}55`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <Icon name={name} size={size * 0.56} color={col} />
  </div>
);

export const Pop: React.FC<{ at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties; until?: number }> = ({ at, children, from = 30, style, until }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, at);
  const o = until !== undefined ? 1 - ap(fr, until, 8) : 1;
  if (fr < at - 1) return null;
  return <div style={{ opacity: Math.min(1, s * 1.6) * o, transform: `translateY(${(1 - s) * from}px) scale(${0.7 + 0.3 * Math.min(1.2, s)})`, ...style }}>{children}</div>;
};
