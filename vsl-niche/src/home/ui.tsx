import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { ap, C, cl, CUE, ez, f, FONT, LEAD, LINES, pop, sceneEnd, sceneStart, SCENES } from "./lib";

// ---------- background: white, drifting light-steel haze, rising sparks, faint grain ----------
export const Bg: React.FC = () => {
  const fr = useCurrentFrame();
  const haze = (x: number, y: number, r: number, sp: number, ph: number, o: number) => (
    <div style={{ position: "absolute", left: x + Math.sin(fr / sp + ph) * 160 - r, top: y + Math.cos(fr / (sp * 1.4) + ph) * 70 - r, width: r * 2, height: r * 1.2, borderRadius: "50%", background: "#E7E8EC", filter: "blur(110px)", opacity: o }} />
  );
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {haze(300, 280, 520, 160, 0, 0.7)}
      {haze(1600, 720, 560, 190, 2, 0.6)}
      <div style={{ position: "absolute", left: 160, right: 160, bottom: -300, height: 360, borderRadius: "50%", background: "#FFE1CF", filter: "blur(120px)", opacity: 0.55 + 0.1 * Math.sin(fr / 13) }} />
      {/* fine steel grid */}
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(#0B0B0C08 1px, transparent 1px), linear-gradient(90deg, #0B0B0C08 1px, transparent 1px)", backgroundSize: "80px 80px", backgroundPosition: `${-fr * 0.3}px 0px` }} />
      {/* sparks rising */}
      {Array.from({ length: 26 }).map((_, k) => {
        const x0 = random(`ex${k}`) * 1920, sp = 0.6 + random(`ev${k}`) * 1.6, s = 2 + random(`es${k}`) * 3.5;
        const y = 1100 - ((fr * sp + random(`ey${k}`) * 1200) % 1250);
        const x = x0 + Math.sin(fr / (18 + k) + k) * 30;
        const fl = 0.35 + 0.65 * Math.abs(Math.sin(fr / (5 + (k % 7)) + k));
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: k % 4 === 0 ? C.pur : C.mag, opacity: 0.55 * fl * Math.min(1, y / 500) }} />;
      })}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "multiply" }}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={fr % 50} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1920" height="1080" filter="url(#gr)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- accent text: solid molten orange ----------
export const GText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; col?: string }> = ({ children, style, col }) => (
  <span style={{ color: col ?? C.mag, ...style }}>{children}</span>
);

// ---------- kinetic trailer text: every word slams in exactly when it is spoken ----------
export const KText: React.FC<{ line: number; size?: number; align?: "center" | "left"; maxWidth?: number; color?: string; from?: number; dim?: number }> = ({ line, size = 84, align = "center", maxWidth = 1600, color = C.ink, from, dim }) => {
  const fr = useCurrentFrame();
  const l = LINES[line];
  const marks = (MARK[line] ?? "").split("|").filter(Boolean).map((x) => x.toLowerCase());
  const S = size * 1.12;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", gap: `0 ${S * 0.22}px`, maxWidth, lineHeight: 1.04 }}>
      {l.words.map((w, k) => {
        const a = (from ?? 0) + f(w.s - LEAD) - 2;
        const s = pop(fr, a, 420, 18);
        const p = Math.min(1, s * 1.6);
        const acc = marks.some((m) => w.w.toLowerCase().replace(/[^a-z0-9$-]/g, "").startsWith(m));
        const style: React.CSSProperties = {
          display: "inline-block",
          fontFamily: FONT.disp,
          fontWeight: 400,
          fontSize: acc ? S * 1.06 : S,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: acc ? C.mag : color,
          opacity: p * (dim ?? 1),
          transform: `translateY(${(1 - s) * -S * 0.35}px) scale(${1.9 - 0.9 * Math.min(1, s)})`,
          filter: `blur(${(1 - p) * 6}px)`,
        };
        return <span key={k} style={style}>{w.w}</span>;
      })}
    </div>
  );
};
export const MARK: Record<number, string> = {};

// ---------- captions (dark pill, white words, orange current word) ----------
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
      <div style={{ opacity: Math.min(p, o), transform: `translateY(${(1 - p) * 10}px)`, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, background: "rgba(255,255,255,0.96)", padding: "8px 26px", borderRadius: 8, border: `2px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}` }}>
        {g.map((k) => {
          const w = ws[k];
          const next = ws[k + 1];
          const on = fr >= f(w.s) - 1;
          const now = on && (!next || fr < f(next.s) - 1);
          return <span key={k} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: now ? C.mag : on ? C.ink : C.mute, display: "inline-block" }}>{w.w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- smash-cut transition: white-hot flash + horizontal light streak ----------
export const Wipes: React.FC = () => {
  const fr = useCurrentFrame();
  const out: React.ReactNode[] = [];
  SCENES.slice(1).forEach((s) => {
    const a = sceneStart(s) - 4;
    const d = fr - a;
    if (d < 0 || d > 12) return;
    const flash = interpolate(d, [0, 2, 10], [0, 0.85, 0], cl);
    const sx = interpolate(d, [0, 10], [-400, 2300], { ...cl, easing: ez });
    out.push(
      <AbsoluteFill key={s} style={{ pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: C.mag, opacity: flash * 0.35 }} />
        <div style={{ position: "absolute", left: sx - 900, top: 500, width: 1800, height: 18, background: C.mag, opacity: 1 - d / 12, transform: "skewX(-30deg)" }} />
        <div style={{ position: "absolute", left: sx - 1300, top: 540, width: 1400, height: 6, background: C.ink, opacity: 1 - d / 12, transform: "skewX(-30deg)" }} />
      </AbsoluteFill>,
    );
  });
  return <>{out}</>;
};

// ---------- camera rig: slow push-in per scene + shake on every hit ----------
const HITS = new Set(["impact", "hit", "stamp", "cash", "doors", "box", "count"]);
export const Cam: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fr = useCurrentFrame();
  const sc = SCENES.filter((s) => fr >= sceneStart(s) - 4).pop() ?? SCENES[0];
  const a = sceneStart(sc), b = sceneEnd(sc);
  const push = 1 + 0.045 * interpolate(fr, [a, b], [0, 1], cl);
  let dx = 0, dy = 0;
  for (const c of CUE) {
    if (!HITS.has(c.kind)) continue;
    const d = fr - f(c.t);
    if (d < 0 || d > 12) continue;
    const amp = c.kind === "impact" ? 22 : c.kind === "count" ? 4 : 10;
    const k = 1 - d / 12;
    dx += Math.sin(d * 7.3 + c.t) * amp * k; dy += Math.cos(d * 9.1 + c.t) * amp * 0.6 * k;
  }
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${push})` }}>{children}</AbsoluteFill>;
};

// ---------- impact: flash + shake helper ----------
export const shake = (fr: number, at: number, amp = 18, len = 12) => {
  const d = fr - at;
  if (d < 0 || d > len) return "translate(0px,0px)";
  const k = 1 - d / len;
  return `translate(${Math.sin(d * 7.3) * amp * k}px, ${Math.cos(d * 9.1) * amp * 0.6 * k}px)`;
};
export const Flash: React.FC<{ at: number; col?: string; o?: number }> = ({ at, col = "#FF5E1A", o = 0.28 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 8) return null;
  return <AbsoluteFill style={{ background: col, opacity: interpolate(d, [0, 1, 8], [0, o, 0], cl), pointerEvents: "none" }} />;
};

// ---------- spark burst (replaces confetti): elongated hot sparks with gravity ----------
export const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number; spread?: number }> = ({ at, x = 960, y = 540, n = 70, spread = 900 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 45) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Flash at={at} />
      {Array.from({ length: n }).map((_, k) => {
        const ang = random(`ca${k}`) * Math.PI * 2;
        const v = (0.3 + random(`cv${k}`) * 0.7) * spread;
        const t = d / 45;
        const e = 1 - Math.pow(1 - t, 2.4);
        const px = x + Math.cos(ang) * v * e;
        const py = y + Math.sin(ang) * v * 0.65 * e + t * t * 380;
        const vx = Math.cos(ang) * v * (1 - t), vy = Math.sin(ang) * v * 0.65 * (1 - t) + t * 380;
        const rot = (Math.atan2(vy, vx) * 180) / Math.PI;
        const len = 10 + random(`cl${k}`) * 26;
        return <div key={k} style={{ position: "absolute", left: px, top: py, width: len * (1 - t * 0.6), height: 3, borderRadius: 2, background: k % 3 === 0 ? C.pur : k % 3 === 1 ? C.mag : C.ink, opacity: 1 - t, transform: `rotate(${rot}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- shockwave rings ----------
export const Rings: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 960, y = 540, n = 3 }) => {
  const fr = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const d = fr - at - k * 5;
        if (d < 0 || d > 30) return null;
        const r = interpolate(d, [0, 30], [30, 900], { ...cl, easing: ez });
        return <div key={k} style={{ position: "absolute", left: x - r, top: y - r * 0.45, width: r * 2, height: r * 0.9, borderRadius: "50%", border: `${5 - k}px solid ${k === 0 ? C.ink : C.mag}`, opacity: (1 - d / 30) * 0.9 }} />;
      })}
    </>
  );
};

// ---------- glints ----------
export const Sparkle: React.FC<{ at: number; x: number; y: number; n?: number; r?: number }> = ({ at, x, y, n = 8, r = 140 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 22) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const ang = (k / n) * Math.PI * 2 + 0.3;
        const rr = interpolate(d, [0, 22], [r * 0.2, r], { ...cl, easing: ez });
        const L = interpolate(d, [0, 6, 22], [0, 46, 0], cl);
        return <div key={k} style={{ position: "absolute", left: x + Math.cos(ang) * rr, top: y + Math.sin(ang) * rr, width: L, height: 3, background: k % 2 ? C.pur : C.mag, transform: `rotate(${(ang * 180) / Math.PI}deg)`, transformOrigin: "left center", borderRadius: 2 }} />;
      })}
    </>
  );
};

// ---------- brand ----------
export const Logo: React.FC<{ size?: number }> = ({ size = 160 }) => <Img src={staticFile("logo.png")} style={{ width: size, height: size }} />;
export const Wordmark: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <span style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: size * 0.82, letterSpacing: "-0.03em", color: C.ink }}>
    Profit<GText>IQS</GText>
    <span style={{ fontSize: size * 0.28, verticalAlign: "top", fontWeight: 600, marginLeft: 4, color: C.ink2 }}>™</span>
  </span>
);
export const CoverImg: React.FC<{ slug: string; tier?: "Essential" | "Elite" | "Complete"; width?: number; style?: React.CSSProperties }> = ({ slug, tier = "Elite", width = 300, style }) => (
  <Img src={staticFile(`covers/${slug}/${tier}.png`)} style={{ width, height: width * 1.334, borderRadius: width * 0.03, boxShadow: `0 30px 60px -22px rgba(11,11,12,0.45), 0 0 0 1px rgba(11,11,12,0.08)`, display: "block", ...style }} />
);

// ---------- card + chip (dark steel) ----------
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: string }> = ({ children, style, glow }) => (
  <div style={{ background: C.surf, borderRadius: 12, border: `2px solid ${C.ink}`, boxShadow: `8px 8px 0 ${glow && glow.startsWith("#") ? glow.slice(0, 7) : C.ink}`, ...style }}>{children}</div>
);
export const Chip: React.FC<{ children: React.ReactNode; col?: string; size?: number; style?: React.CSSProperties }> = ({ children, col = C.mag, size = 30, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontWeight: 700, fontSize: size, color: C.ink, background: C.surf, border: `2px solid ${C.ink}`, borderRadius: 8, padding: `${size * 0.3}px ${size * 0.75}px`, boxShadow: `4px 4px 0 ${col}`, whiteSpace: "nowrap", ...style }}>{children}</div>
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
export const IconBubble: React.FC<{ name: string; size?: number; col?: string; bg?: string }> = ({ name, size = 90, col = C.mag, bg }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: `${col}18`, border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
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
