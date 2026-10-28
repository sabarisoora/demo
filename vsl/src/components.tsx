import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { appear, C, ease, FONT, LINES, f, pop } from "./lib";
import SHEETS from "./sheets.json";

export const DarkBg: React.FC<{ glow?: boolean; hue?: string }> = ({ glow, hue = "#1e3a8a" }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 110) * 80;
  const dy = Math.cos(frame / 140) * 40;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1300px 820px at ${960 + dx}px ${(glow ? 470 : 330) + dy}px, ${glow ? "#1d4ed8" : hue} 0%, ${C.deep} 60%, #050913 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(148,180,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,180,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          backgroundPosition: `${-frame * 0.2}px ${-frame * 0.35}px`,
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 78%)",
        }}
      />
      <Particles />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 337) % 1920;
        const y = (1080 + ((i * 211) % 1080) - frame * (0.3 + (i % 5) * 0.12)) % 1200;
        const s = 2 + (i % 4);
        return <div key={i} style={{ position: "absolute", left: x, top: y < 0 ? y + 1200 : y, width: s, height: s, borderRadius: s, background: "#93c5fd", opacity: 0.12 + (i % 3) * 0.06 }} />;
      })}
    </AbsoluteFill>
  );
};

export const LightBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1500px 900px at ${900 + Math.sin(frame / 100) * 60}px 360px, #ffffff 0%, ${C.cream} 50%, #e6eefb 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(37,99,235,0.10) 1.4px, transparent 1.4px)`,
          backgroundSize: "34px 34px",
          backgroundPosition: `0 ${-frame * 0.2}px`,
          maskImage: "radial-gradient(ellipse at center, black 15%, transparent 72%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Words rise in one by one. [bracketed words] are set in the cover-style blue serif italic.
export const Kinetic: React.FC<{
  text: string;
  at: number;
  size?: number;
  color?: string;
  accent?: string;
  weight?: number;
  stagger?: number;
  align?: "center" | "left";
  maxWidth?: number;
}> = ({ text, at, size = 96, color = C.cream, accent = C.sky, weight = 700, stagger = 3, align = "center", maxWidth = 1560 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  let inAccent = false;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", maxWidth, gap: `0 ${size * 0.25}px`, lineHeight: 1.12 }}>
      {words.map((w, i) => {
        if (w.startsWith("[")) inAccent = true;
        const isAccent = inAccent;
        if (/\][.,?!:]*$/.test(w)) inAccent = false;
        const clean = w.replace(/[[\]]/g, "");
        const p = appear(frame, at + i * stagger, 16);
        return (
          <span
            key={i}
            style={{
              fontFamily: isAccent ? FONT.serif : FONT.display,
              fontStyle: isAccent ? "italic" : "normal",
              fontWeight: isAccent ? 700 : weight,
              fontSize: isAccent ? size * 1.06 : size,
              letterSpacing: isAccent ? "-0.01em" : "-0.03em",
              color: isAccent ? accent : color,
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.45}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
              display: "inline-block",
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; at: number; dark?: boolean }> = ({ children, at, dark = true }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at);
  const color = dark ? C.sky : C.brand2;
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: FONT.display,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color,
        background: dark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)",
        border: `1.5px solid ${color}55`,
        padding: "10px 24px",
        borderRadius: 999,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const LogoMark: React.FC<{ size?: number; draw?: number }> = ({ size = 120, draw = 1 }) => (
  <Img src={staticFile("logo.png")} style={{ height: size * 1.45, width: "auto", opacity: Math.min(1, draw * 1.6), transform: `translateY(${(1 - Math.min(1, draw)) * 16}px) scale(${0.9 + 0.1 * Math.min(1, draw)})` }} />
);

export const Wordmark: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.cream }) => (
  <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: size, letterSpacing: "-0.04em", color }}>
    Profit<span style={{ color: "#3b82f6" }}>IQS</span>
    <span style={{ fontSize: size * 0.3, verticalAlign: "top", fontWeight: 600, marginLeft: 4, opacity: 0.8 }}>™</span>
  </span>
);

export const Tag: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark = true, style }) => (
  <div
    style={{
      position: "absolute",
      top: 34,
      right: 44,
      fontFamily: FONT.display,
      fontWeight: 600,
      fontSize: 17,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: dark ? "rgba(248,250,252,0.7)" : "rgba(11,17,32,0.6)",
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
      border: `1px solid ${dark ? "rgba(248,250,252,0.22)" : "rgba(11,17,32,0.15)"}`,
      borderRadius: 8,
      padding: "7px 14px",
      zIndex: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

// Burned-in subtitles: one narration line at a time, synced to the voice.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= f(l.start) - 2 && frame <= f(l.end) + 6);
  if (!line) return null;
  const p = appear(frame, f(line.start) - 2, 6);
  const out = interpolate(frame, [f(line.end), f(line.end) + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46, pointerEvents: "none", zIndex: 50 }}>
      <div
        style={{
          opacity: Math.min(p, out),
          maxWidth: 1540,
          textAlign: "center",
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.3,
          color: "#fff",
          background: "rgba(5,10,24,0.78)",
          padding: "11px 28px",
          borderRadius: 14,
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        {line.sub}
      </div>
    </AbsoluteFill>
  );
};

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; dark?: boolean }> = ({ style, children, dark }) => (
  <div
    style={{
      background: dark ? "rgba(255,255,255,0.06)" : C.paper,
      border: `1px solid ${dark ? "rgba(248,250,252,0.14)" : C.line}`,
      borderRadius: 22,
      boxShadow: dark ? "0 30px 80px rgba(0,0,0,0.35)" : "0 30px 70px -20px rgba(17,19,24,0.25), 0 4px 14px rgba(17,19,24,0.05)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Bars: React.FC<{ widths: number[]; color?: string; h?: number }> = ({ widths, color = "#cbd5e1", h = 14 }) => (
  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
    {widths.map((w, i) => (
      <div key={i} style={{ width: w, height: h, borderRadius: h, background: color }} />
    ))}
  </div>
);

export const Pop: React.FC<{ at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }> = ({ at, children, from = 40, style }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  return <div style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * from}px) scale(${0.92 + 0.08 * s})`, ...style }}>{children}</div>;
};

export const Cover: React.FC<{ niche: string; tier: "Essential" | "Elite" | "Complete"; width?: number; style?: React.CSSProperties }> = ({ niche, tier, width = 300, style }) => (
  <Img
    src={staticFile(`site/covers/${niche}_${tier}_2026_Cover.png`)}
    style={{ width, height: width * 1.334, borderRadius: width * 0.03, boxShadow: "0 30px 60px -18px rgba(5,10,30,0.45), 0 0 0 1px rgba(11,17,32,0.06)", display: "block", ...style }}
  />
);

export const COVER = {
  auto: "Auto_Repair_Shop_Profit_Intelligence_System",
  restaurant: "Restaurant_Profit_Intelligence_System",
  hvac: "HVAC_Profit_Intelligence_System",
  trucking: "Trucking_Owner_Operator_Financial_System",
  airbnb: "Airbnb_Profit_Intelligence_System",
};

type Rect = [number, number, number, number];
export type CamKey = { at: number; r: Rect };
export type Hi = { at: number; until?: number; r: Rect; label?: string; color?: string };

// Each key starts easing the camera toward its rect at its own `at` (26 frames), from wherever it was.
function camAt(frame: number, keys: CamKey[]): Rect {
  let cur = keys[0].r;
  for (let j = 1; j < keys.length; j++) {
    const t = interpolate(frame, [keys[j].at, keys[j].at + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
    if (t <= 0) break;
    cur = cur.map((v, k) => v + (keys[j].r[k] - v) * t) as Rect;
  }
  return cur;
}

// A real workbook sheet inside an Excel-style window, with camera moves and highlights.
export const Sheet: React.FC<{
  name: string;
  file: string;
  tabs: string[];
  active: string;
  w: number;
  h: number;
  cam: CamKey[];
  hi?: Hi[];
  style?: React.CSSProperties;
}> = ({ name, file, tabs, active, w, h, cam, hi = [], style }) => {
  const frame = useCurrentFrame();
  const [iw, ih] = (SHEETS as Record<string, number[]>)[name];
  const TOP = 50;
  const BOT = 44;
  const vw = w;
  const vh = h - TOP - BOT;
  const [rx, ry, rw, rh] = camAt(frame, cam);
  const scale = Math.min(vw / (rw * iw), vh / (rh * ih));
  const cx = (rx + rw / 2) * iw * scale;
  const cy = (ry + rh / 2) * ih * scale;
  const tx = vw / 2 - cx;
  const ty = vh / 2 - cy;
  return (
    <div style={{ width: w, height: h, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 50px 100px -30px rgba(5,10,30,0.55), 0 0 0 1px rgba(11,17,32,0.08)", position: "relative", ...style }}>
      <div style={{ height: TOP, background: "#1f6e43", display: "flex", alignItems: "center", padding: "0 18px", gap: 9 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
        ))}
        <div style={{ marginLeft: 14, width: 26, height: 26, borderRadius: 5, background: "#fff", color: "#1f6e43", fontFamily: FONT.display, fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>X</div>
        <div style={{ marginLeft: 6, fontFamily: FONT.body, fontWeight: 500, fontSize: 17, color: "rgba(255,255,255,0.92)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file}</div>
      </div>
      <div style={{ position: "absolute", top: TOP, left: 0, width: vw, height: vh, overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: tx, top: ty, width: iw * scale, height: ih * scale }}>
          <Img src={staticFile(`sheets/${name}.png`)} style={{ width: "100%", height: "100%", display: "block" }} />
          {hi.map((hl, i) => {
            const p = appear(frame, hl.at, 10);
            const o = hl.until ? 1 - appear(frame, hl.until, 8) : 1;
            if (p * o <= 0) return null;
            const col = hl.color ?? C.brand2;
            return (
              <div key={i} style={{ position: "absolute", left: hl.r[0] * iw * scale, top: hl.r[1] * ih * scale, width: hl.r[2] * iw * scale, height: hl.r[3] * ih * scale, border: `4px solid ${col}`, borderRadius: 10, background: `${col}14`, boxShadow: `0 0 0 6px ${col}22, 0 10px 30px ${col}33`, opacity: p * o, transform: `scale(${1.06 - 0.06 * p})` }}>
                {hl.label && (
                  <div style={{ position: "absolute", left: -4, top: -46, background: col, color: "#fff", fontFamily: FONT.display, fontWeight: 600, fontSize: 22, padding: "6px 14px", borderRadius: 8, whiteSpace: "nowrap" }}>{hl.label}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BOT, background: "#f3f4f6", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "stretch", paddingLeft: 12, gap: 2, overflow: "hidden" }}>
        {tabs.map((t) => {
          const on = t === active;
          return (
            <div key={t} style={{ fontFamily: FONT.body, fontWeight: on ? 600 : 500, fontSize: 15, padding: "0 16px", display: "flex", alignItems: "center", whiteSpace: "nowrap", background: on ? "#fff" : "transparent", color: on ? "#1f6e43" : "#6b7280", borderBottom: on ? "3px solid #1f6e43" : "3px solid transparent" }}>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 16, top: TOP + 14, fontFamily: FONT.display, fontWeight: 600, fontSize: 15, letterSpacing: "0.1em", color: "#fff", background: "rgba(11,17,32,0.72)", padding: "5px 12px", borderRadius: 6 }}>SAMPLE DATA</div>
    </div>
  );
};

export const ESS_FILE = "Auto_Repair_Shop_Business_Intelligence_System_Essential_2026.xlsx";
export const ELITE_FILE = "Auto_Repair_Shop_Business_Intelligence_System_Elite_2026.xlsx";
export const ESS_TABS = ["START HERE", "SETUP", "REPAIR ORDER ENTRY", "EXPENSE ENTRY", "TAX & DEDUCTIONS", "DASHBOARD", "ACCOUNTANT EXPORT", "BUSINESS HEALTH SNAPSHOT"];

// Step badge used during the product walkthrough.
export const Step: React.FC<{ n: string; title: string; at: number; dark?: boolean }> = ({ n, title, at, dark }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, s * 1.4), transform: `translateX(${(1 - s) * -40}px)` }}>
      <div style={{ width: 84, height: 84, borderRadius: 24, background: `linear-gradient(135deg, ${C.brand2}, ${C.brand})`, color: "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(37,99,235,0.35)" }}>{n}</div>
      <div>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, letterSpacing: "0.18em", color: dark ? C.sky : C.brand2 }}>STEP {n}</div>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", color: dark ? C.cream : C.ink, lineHeight: 1.05 }}>{title}</div>
      </div>
    </div>
  );
};

export const Callout: React.FC<{ at: number; until?: number; children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ at, until, children, dark, style }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  const o = until ? 1 - appear(frame, until, 8) : 1;
  if (s <= 0.001 || o <= 0) return null;
  return (
    <div style={{ opacity: Math.min(1, s * 1.4) * o, transform: `translateY(${(1 - s) * 24}px)`, fontFamily: FONT.display, fontWeight: 600, fontSize: 34, lineHeight: 1.25, color: dark ? C.cream : C.ink, ...style }}>
      {children}
    </div>
  );
};
