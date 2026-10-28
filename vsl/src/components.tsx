import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { appear, C, FONT, LINES, f, pop } from "./lib";

export const DarkBg: React.FC<{ glow?: boolean }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 800px at ${960 + drift}px ${glow ? 420 : 300}px, ${glow ? "#1458c8" : "#0f3a8a"} 0%, ${C.deep} 62%, #030a1c 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(244,241,233,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,233,0.035) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          backgroundPosition: `0 ${-frame * 0.25}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const LightBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1400px 900px at ${900 + Math.sin(frame / 100) * 50}px 380px, ${C.paper} 0%, ${C.cream} 55%, #e3ecfa 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(11,79,208,0.09) 1.4px, transparent 1.4px)`,
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Words rise in one by one. Wrap a word in [brackets] to set it in gold.
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
  serif?: boolean;
}> = ({ text, at, size = 96, color = C.cream, accent = C.gold, weight = 800, stagger = 3, align = "center", maxWidth = 1500 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  let inAccent = false;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", maxWidth, gap: `0 ${size * 0.26}px`, lineHeight: 1.08 }}>
      {words.map((w, i) => {
        if (w.startsWith("[")) inAccent = true;
        const isAccent = inAccent;
        if (w.endsWith("]") || w.endsWith("].") || w.endsWith("],") || w.endsWith("]?")) inAccent = false;
        const clean = w.replace(/[[\]]/g, "");
        const p = appear(frame, at + i * stagger, 16);
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT.display,
              fontWeight: weight,
              fontSize: size,
              letterSpacing: "-0.025em",
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

export const Eyebrow: React.FC<{ children: React.ReactNode; at: number; color?: string; bg?: string }> = ({ children, at, color = C.gold, bg = "rgba(79,176,255,0.12)" }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at);
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontWeight: 500,
        fontSize: 22,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        background: bg,
        border: `1px solid ${color}44`,
        padding: "10px 22px",
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
  <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: size, letterSpacing: "-0.035em", color }}>
    Profit<span style={{ color: C.gold }}>IQS</span>
    <span style={{ fontSize: size * 0.32, verticalAlign: "top", fontWeight: 600, marginLeft: 4, opacity: 0.8 }}>™</span>
  </span>
);

// Small honest label on any scene whose visuals are illustrations, not real product screens.
export const IllustrativeTag: React.FC<{ dark?: boolean }> = ({ dark = true }) => (
  <div
    style={{
      position: "absolute",
      top: 36,
      right: 44,
      fontFamily: FONT.mono,
      fontSize: 17,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: dark ? "rgba(244,241,233,0.55)" : "rgba(26,25,21,0.5)",
      border: `1px solid ${dark ? "rgba(244,241,233,0.22)" : "rgba(26,25,21,0.18)"}`,
      borderRadius: 6,
      padding: "6px 12px",
    }}
  >
    Illustrative visual
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
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54, pointerEvents: "none" }}>
      <div
        style={{
          opacity: Math.min(p, out),
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.3,
          color: "#fff",
          background: "rgba(4,12,30,0.72)",
          padding: "12px 28px",
          borderRadius: 12,
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
      border: `1px solid ${dark ? "rgba(244,241,233,0.14)" : C.line}`,
      borderRadius: 22,
      boxShadow: dark ? "0 30px 80px rgba(0,0,0,0.35)" : "0 30px 70px rgba(11,79,208,0.14), 0 4px 14px rgba(11,79,208,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

// A placeholder data row: soft bars instead of invented numbers.
export const Bars: React.FC<{ widths: number[]; color?: string; h?: number }> = ({ widths, color = "#d3deef", h = 14 }) => (
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
