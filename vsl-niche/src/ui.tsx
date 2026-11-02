import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ap, C, cl, ez, f, FONT, LINES, pop } from "./lib";
import SHEETS from "./sheets.json";

// Words slam in one by one. [bracketed words] get the serif-italic gradient accent.
export const Slam: React.FC<{ text: string; at: number; size?: number; color?: string; stagger?: number; align?: "center" | "left"; maxWidth?: number; weight?: number; accent?: string }> = ({
  text,
  at,
  size = 110,
  color = C.white,
  stagger = 3,
  align = "center",
  maxWidth = 1640,
  weight = 800,
  accent,
}) => {
  const fr = useCurrentFrame();
  let inA = false;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", alignItems: "baseline", gap: `0 ${size * 0.24}px`, maxWidth, lineHeight: 1.08 }}>
      {text.split(" ").map((w, i) => {
        if (w.startsWith("[")) inA = true;
        const isA = inA;
        if (/\][.,?!:…]*$/.test(w)) inA = false;
        const clean = w.replace(/[[\]]/g, "");
        const s = pop(fr, at + i * stagger, 260, 16);
        const p = Math.min(1, s * 1.4);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: isA ? FONT.serif : FONT.sans,
              fontStyle: isA ? "italic" : "normal",
              fontWeight: isA ? 700 : weight,
              fontSize: isA ? size * 1.08 : size,
              letterSpacing: isA ? "-0.01em" : "-0.035em",
              color: isA ? undefined : color,
              backgroundImage: isA ? `linear-gradient(100deg, ${accent ?? C.sky}, ${C.cyan})` : undefined,
              WebkitBackgroundClip: isA ? "text" : undefined,
              backgroundClip: isA ? "text" : undefined,
              WebkitTextFillColor: isA ? "transparent" : undefined,
              opacity: p,
              transform: `translateY(${(1 - s) * size * 0.5}px) scale(${1.5 - 0.5 * Math.min(1, s)})`,
              filter: `blur(${(1 - p) * 10}px)`,
              paddingRight: isA ? size * 0.06 : 0,
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{ at: number; children: React.ReactNode; color?: string; light?: boolean }> = ({ at, children, color, light }) => {
  const fr = useCurrentFrame();
  const p = ap(fr, at, 10);
  const col = color ?? (light ? C.blue : C.cyan);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily: FONT.sans, fontWeight: 700, fontSize: 22, letterSpacing: "0.24em", textTransform: "uppercase", color: col, padding: "10px 22px", borderRadius: 999, border: `1.5px solid ${col}66`, background: light ? "rgba(37,99,235,0.08)" : "rgba(34,211,238,0.08)" }}>
      <span style={{ width: 9, height: 9, borderRadius: 5, background: col, boxShadow: `0 0 12px ${col}` }} />
      {children}
    </div>
  );
};

export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; glow?: string }> = ({ style, children, glow }) => (
  <div style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 26, boxShadow: `0 30px 80px rgba(0,0,0,0.45)${glow ? `, 0 0 50px ${glow}55, inset 0 0 0 1.5px ${glow}88` : ""}`, ...style }}>{children}</div>
);

export const Paper: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "0 40px 90px -30px rgba(10,20,60,0.45)", ...style }}>{children}</div>
);

export const Pop: React.FC<{ at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties; until?: number }> = ({ at, children, from = 60, style, until }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, at, 240, 15);
  const o = until ? 1 - ap(fr, until, 8) : 1;
  if (fr < at - 1 || o <= 0) return null;
  return <div style={{ opacity: Math.min(1, s * 1.5) * o, transform: `translateY(${(1 - s) * from + (1 - o) * -30}px) scale(${0.85 + 0.15 * s})`, ...style }}>{children}</div>;
};

export const Counter: React.FC<{ from?: number; to: number; at: number; len?: number; prefix?: string; suffix?: string; style?: React.CSSProperties; decimals?: number }> = ({ from = 0, to, at, len = 30, prefix = "", suffix = "", style, decimals = 0 }) => {
  const fr = useCurrentFrame();
  const v = interpolate(fr, [at, at + len], [from, to], { ...cl, easing: ez });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

export const LogoMark: React.FC<{ size?: number }> = ({ size = 120 }) => <Img src={staticFile("logo.png")} style={{ height: size * 1.45, width: "auto" }} />;

export const Wordmark: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.white }) => (
  <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.04em", color }}>
    Profit<span style={{ color: C.blue2 }}>IQS</span>
    <span style={{ fontSize: size * 0.3, verticalAlign: "top", fontWeight: 600, marginLeft: 4, opacity: 0.8 }}>™</span>
  </span>
);

export const Cover: React.FC<{ tier: "Essential" | "Elite" | "Complete"; width?: number; style?: React.CSSProperties; prefix?: string }> = ({ tier, width = 300, style, prefix = "1099_Income_Intelligence_System" }) => (
  <Img src={staticFile(`covers/${prefix}_${tier}_2026_Cover.png`)} style={{ width, height: width * 1.334, borderRadius: width * 0.03, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)", display: "block", ...style }} />
);

// ---------- icons (simple strokes) ----------
const P = (d: string, sw = 2) => <path d={d} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
export const ICON: Record<string, React.ReactNode> = {
  phone: <>{P("M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2")}</>,
  camera: <>{P("M4 7h3l2-3h6l2 3h3v13H4z")}<circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="2" /></>,
  car: <>{P("M3 13l2-6h14l2 6v5H3zM7 18v2M17 18v2M3 13h18")}<circle cx="7.5" cy="15.5" r="1.2" fill="currentColor" /><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor" /></>,
  calendar: <>{P("M4 6h16v15H4zM4 10h16M8 3v5M16 3v5")}</>,
  receipt: <>{P("M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4")}</>,
  sprout: <>{P("M12 22V11M12 11c0-4 3-7 8-7 0 5-3 7-8 7zM12 14c0-3-2-5-7-5 0 4 2 5 7 5z")}</>,
  briefcase: <>{P("M3 8h18v12H3zM8 8V5h8v3M3 13h18")}</>,
  moon: <>{P("M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z")}</>,
  bank: <>{P("M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18")}</>,
  lock: <>{P("M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4")}</>,
  book: <>{P("M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6M20 4v15h-6")}</>,
  shield: <>{P("M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6z")}{P("M8.5 12l2.5 2.5 4.5-5")}</>,
  check: <>{P("M5 12l5 5 9-10", 3)}</>,
  x: <>{P("M6 6l12 12M18 6L6 18", 3)}</>,
  alert: <>{P("M12 3l10 18H2zM12 10v5M12 18v.5")}</>,
  chart: <>{P("M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8")}</>,
  clock: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />{P("M12 7v5l3 3")}</>,
  arrowDown: <>{P("M12 4v16M5 13l7 7 7-7", 3)}</>,
  head: <>{P("M9 21v-3H6l-1-4-2-1 2-3c0-4 3-7 7-7 4 0 7 3 7 7 0 3-1 5-3 6v5")}</>,
  file: <>{P("M6 2h8l5 5v15H6zM14 2v5h5M9 13h7M9 17h7")}</>,
};
export const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 48, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, display: "block" }}>{ICON[name]}</svg>
);

// ---------- real sheet in an Excel window ----------
type Rect = [number, number, number, number];
export type CamKey = { at: number; r: Rect };
export type Hi = { at: number; until?: number; r: Rect; label?: string; color?: string; side?: "top" | "bottom" };
function camAt(fr: number, keys: CamKey[]): Rect {
  let cur = keys[0].r;
  for (let j = 1; j < keys.length; j++) {
    const t = interpolate(fr, [keys[j].at, keys[j].at + 24], [0, 1], { ...cl, easing: ez });
    if (t <= 0) break;
    cur = cur.map((v, k) => v + (keys[j].r[k] - v) * t) as Rect;
  }
  return cur;
}
export const Sheet: React.FC<{ name: string; file: string; tabs: string[]; active: string; w: number; h: number; cam: CamKey[]; hi?: Hi[]; style?: React.CSSProperties; tilt?: number }> = ({ name, file, tabs, active, w, h, cam, hi = [], style, tilt = 0 }) => {
  const fr = useCurrentFrame();
  const [iw, ih] = (SHEETS as Record<string, number[]>)[name];
  const TOP = 46;
  const BOT = 40;
  const vh = h - TOP - BOT;
  const [rx, ry, rw, rh] = camAt(fr, cam);
  const scale = Math.min(w / (rw * iw), vh / (rh * ih));
  const tx = w / 2 - (rx + rw / 2) * iw * scale;
  const ty = vh / 2 - (ry + rh / 2) * ih * scale;
  return (
    <div style={{ width: w, height: h, borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 60px 120px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1), 0 0 80px rgba(37,99,235,0.25)", position: "relative", transform: tilt ? `perspective(2400px) rotateY(${tilt}deg)` : undefined, ...style }}>
      <div style={{ height: TOP, background: "#1f6e43", display: "flex", alignItems: "center", padding: "0 16px", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
        <div style={{ marginLeft: 12, width: 24, height: 24, borderRadius: 5, background: "#fff", color: "#1f6e43", fontFamily: FONT.sans, fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>X</div>
        <div style={{ marginLeft: 4, fontFamily: FONT.sans, fontWeight: 500, fontSize: 16, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file}</div>
      </div>
      <div style={{ position: "absolute", top: TOP, left: 0, width: w, height: vh, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: tx, top: ty, width: iw * scale, height: ih * scale }}>
          <Img src={staticFile(`sheets/${name}.png`)} style={{ width: "100%", height: "100%", display: "block" }} />
          {hi.map((hl, i) => {
            const p = ap(fr, hl.at, 8);
            const o = hl.until ? 1 - ap(fr, hl.until, 6) : 1;
            if (p * o <= 0) return null;
            const col = hl.color ?? C.blue;
            const pulse = 1 + 0.25 * Math.max(0, Math.sin((fr - hl.at) / 4)) * Math.exp(-(fr - hl.at) / 20);
            return (
              <div key={i} style={{ position: "absolute", left: hl.r[0] * iw * scale, top: hl.r[1] * ih * scale, width: hl.r[2] * iw * scale, height: hl.r[3] * ih * scale, border: `4px solid ${col}`, borderRadius: 10, background: `${col}18`, boxShadow: `0 0 0 ${8 * pulse}px ${col}2a, 0 0 40px ${col}66`, opacity: p * o, transform: `scale(${1.08 - 0.08 * p})` }}>
                {hl.label && (
                  <div style={{ position: "absolute", left: -4, [hl.side === "bottom" ? "bottom" : "top"]: -50, background: col, color: "#fff", fontFamily: FONT.sans, fontWeight: 700, fontSize: 22, padding: "7px 14px", borderRadius: 8, whiteSpace: "nowrap", boxShadow: `0 8px 24px ${col}66` }}>{hl.label}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BOT, background: "#f3f4f6", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "stretch", paddingLeft: 10, gap: 2, overflow: "hidden" }}>
        {tabs.map((t) => {
          const on = t === active;
          return <div key={t} style={{ fontFamily: FONT.sans, fontWeight: on ? 700 : 500, fontSize: 14, padding: "0 14px", display: "flex", alignItems: "center", whiteSpace: "nowrap", background: on ? "#fff" : "transparent", color: on ? "#1f6e43" : "#6b7280", borderBottom: on ? "3px solid #1f6e43" : "3px solid transparent" }}>{t}</div>;
        })}
      </div>
      <div style={{ position: "absolute", right: 14, top: TOP + 12, fontFamily: FONT.sans, fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "#fff", background: "rgba(11,17,32,0.75)", padding: "5px 11px", borderRadius: 6 }}>SAMPLE DATA</div>
    </div>
  );
};

// a window that flies in with 3D and settles
export const FlyIn: React.FC<{ at: number; children: React.ReactNode; from?: "right" | "left" | "bottom" | "zoom"; style?: React.CSSProperties; until?: number; tilt?: number }> = ({ at, children, from = "right", style, until, tilt = 0 }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, at, 120, 18);
  const o = until ? 1 - ap(fr, until, 10) : 1;
  if (fr < at - 1 || o <= 0) return null;
  const k = 1 - Math.min(1, s);
  const tr =
    from === "right" ? `translateX(${k * 1300}px) rotateY(${-35 * k + tilt}deg)` : from === "left" ? `translateX(${-k * 1300}px) rotateY(${35 * k + tilt}deg)` : from === "bottom" ? `translateY(${k * 900}px) rotateX(${30 * k}deg)` : `scale(${0.4 + 0.6 * s}) rotateX(${20 * k}deg)`;
  return <div style={{ position: "absolute", opacity: Math.min(1, s * 1.6) * o, transform: `perspective(2400px) ${tr} translateY(${(1 - o) * -60}px) scale(${1 - (1 - o) * 0.1})`, filter: `blur(${k * 8}px)`, ...style }}>{children}</div>;
};

// ---------- captions: word-highlighted, bottom ----------
export const Captions: React.FC<{ hide?: (gf: number) => boolean }> = ({ hide }) => {
  const gf = useCurrentFrame();
  if (hide && hide(gf)) return null;
  const li = LINES.findIndex((l) => gf >= f(l.start) - 2 && gf <= f(l.end) + 6);
  if (li < 0) return null;
  const l = LINES[li];
  // chunk the line into groups of up to 6 words, show the group being spoken
  const ws = l.words;
  const groups: number[][] = [];
  let cur: number[] = [];
  ws.forEach((w, i) => {
    cur.push(i);
    const len = cur.map((k) => ws[k].w).join(" ").length;
    if (cur.length >= 6 || len > 34 || (cur.length >= 3 && /[.,?!:…]$/.test(w.w.replace(/[\]"”]/g, "")))) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  let g = groups[0];
  for (const gr of groups) if (gf >= f(ws[gr[0]].s) - 2) g = gr;
  const p = ap(gf, f(ws[g[0]].s) - 2, 5);
  const o = interpolate(gf, [f(l.end), f(l.end) + 6], [1, 0], cl);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40, pointerEvents: "none" }}>
      <div style={{ opacity: Math.min(p, o), transform: `translateY(${(1 - p) * 12}px)`, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, background: "rgba(3,7,20,0.72)", padding: "10px 26px", borderRadius: 16 }}>
        {g.map((k) => {
          const w = ws[k];
          const next = ws[k + 1];
          const on = gf >= f(w.s) - 1;
          const now = on && (!next || gf < f(next.s) - 1);
          return (
            <span key={k} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: now ? "#0b1120" : on ? "#fff" : "rgba(255,255,255,0.45)", background: now ? C.cyan : "transparent", borderRadius: 8, padding: "0 6px", transform: `scale(${now ? 1.06 : 1})`, display: "inline-block" }}>
              {w.w.replace(/[[\]]/g, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ESS_FILE = "1099_Contractor_Business_Intelligence_System_Essential_2026.xlsx";
export const ELITE_FILE = "1099_Contractor_Business_Intelligence_System_Elite_2026.xlsx";
export const ESS_TABS = ["START HERE", "SETUP", "CLIENT SETUP", "REVENUE ENTRY", "EXPENSE ENTRY", "MILEAGE LOG", "CLIENT PERFORMANCE", "TAX & DEDUCTIONS", "DASHBOARD", "ACCOUNTANT EXPORT", "BUSINESS HEALTH SNAPSHOT"];
export const ELITE_TABS = ["01 Start Here", "02 Executive Dashboard", "03 Executive Summary", "04 Client Database", "05 Revenue Center", "06 Expense Center", "07 Mileage Center", "08 Invoice Tracker", "09 Accounts Receivable", "10 Cash Flow Center", "11 Monthly Profit Center", "12 Client Profitability", "13 Service Profitability", "14 KPI Scorecard", "15 Business Health Score", "16 Financial Goals Center", "17 Forecasting Center", "18 Profit Leak Detector", "19 Insights Center", "20 Estimated Tax Center", "21 Quarterly Tax Planner", "22 Deduction Maximizer", "23 Year-End Tax Package", "24 Settings", "25 Glossary", "26 Changelog"];
export const tabsAround = (all: string[], active: string, n = 9) => {
  const i = all.indexOf(active);
  const s = Math.max(0, Math.min(all.length - n, i - 3));
  return all.slice(s, s + n);
};

// ---------- real photography (stock, CC/Unsplash licensed) ----------
// full-bleed photo with a slow push-in and a brand-tinted dark grade so type stays readable
export const PhotoBg: React.FC<{ src: string; at?: number; dim?: number; tint?: string; pos?: string; drift?: 1 | -1 }> = ({ src, at = 0, dim = 0.62, tint = "#050816", pos = "center", drift = 1 }) => {
  const fr = useCurrentFrame();
  const d = Math.max(0, fr - at);
  const sc = 1.14 - Math.min(1, d / 240) * 0.1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: ap(fr, at, 10) }}>
      <Img src={staticFile(`photos/${src}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${sc}) translateX(${drift * d * 0.12}px)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${tint}${Math.round(dim * 200).toString(16).padStart(2, "0")} 0%, ${tint}${Math.round(Math.min(1, dim + 0.18) * 255).toString(16).padStart(2, "0")} 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 30%, ${tint} 100%)`, opacity: 0.7 }} />
    </AbsoluteFill>
  );
};

// framed photo card with optional caption strip
export const PhotoCard: React.FC<{ src: string; w: number; h: number; label?: string; sub?: string; color?: string; pos?: string; style?: React.CSSProperties }> = ({ src, w, h, label, sub, color = C.cyan, pos = "center", style }) => {
  const fr = useCurrentFrame();
  return (
    <div style={{ width: w, height: h, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: `0 40px 90px -20px rgba(0,0,0,0.75), 0 0 0 2px ${color}88, 0 0 50px ${color}33`, ...style }}>
      <Img src={staticFile(`photos/${src}.jpg`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${1.08 - Math.min(1, fr / 400) * 0.06})` }} />
      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "70px 26px 22px", background: "linear-gradient(180deg, transparent, rgba(5,8,22,0.92))" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: Math.round(w / 9.5), color: C.white, lineHeight: 1.08 }}>{label}</div>
          {sub && <div style={{ marginTop: 8, fontFamily: FONT.serif, fontStyle: "italic", fontSize: Math.round(w / 15), color }}>{sub}</div>}
        </div>
      )}
    </div>
  );
};

// small real-sheet tile (top of the sheet) with its tab name
export const SheetTile: React.FC<{ name: string; title: string; w: number; tag?: string; tagColor?: string; dimmed?: boolean }> = ({ name, title, w, tag, tagColor = C.green, dimmed }) => (
  <div style={{ width: w, borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 24px 50px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)", opacity: dimmed ? 0.5 : 1, position: "relative" }}>
    <div style={{ height: Math.round(w * 0.075), background: "#1f6e43", display: "flex", alignItems: "center", paddingLeft: 10, fontFamily: FONT.sans, fontWeight: 700, fontSize: Math.max(11, Math.round(w * 0.042)), color: "#fff", whiteSpace: "nowrap", overflow: "hidden" }}>{title}</div>
    <Img src={staticFile(`sheets/thumb/${name}.jpg`)} style={{ width: w, height: Math.round(w * 0.625), objectFit: "cover", objectPosition: "top", display: "block" }} />
    {tag && <div style={{ position: "absolute", right: 8, bottom: 8, background: tagColor, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: Math.max(11, Math.round(w * 0.04)), padding: "4px 9px", borderRadius: 6, letterSpacing: "0.06em" }}>{tag}</div>}
  </div>
);

// a real guide page (A4 portrait)
export const DocPage: React.FC<{ src: string; w: number; style?: React.CSSProperties }> = ({ src, w, style }) => (
  <div style={{ width: w, height: Math.round(w * 1.414), borderRadius: 6, overflow: "hidden", background: "#fff", boxShadow: "0 30px 70px -18px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.08)", ...style }}>
    <Img src={staticFile(`docs/${src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
  </div>
);
