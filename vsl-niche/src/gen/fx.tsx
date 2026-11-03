import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { C, cl, CUE_LIST, ez } from "./lib";

// ---------- camera shake + chroma from impact cues (global frame) ----------
const STRONG = new Set(["impact", "stamp", "alarm"]);
const SOFT = new Set(["hit", "error", "glitch", "cash"]);
export function impactAt(gf: number) {
  let shake = 0;
  let chroma = 0;
  let flash = 0;
  for (const c of CUE_LIST) {
    const d = gf - c.frame;
    if (d < 0 || d > 14) continue;
    if (STRONG.has(c.kind)) {
      shake = Math.max(shake, (1 - d / 14) * 13);
      chroma = Math.max(chroma, (1 - d / 8) * 10);
      flash = Math.max(flash, d < 4 ? (1 - d / 4) * 0.35 : 0);
    } else if (SOFT.has(c.kind)) {
      shake = Math.max(shake, (1 - d / 10) * 5);
      chroma = Math.max(chroma, (1 - d / 6) * 6);
    }
  }
  return { shake, chroma: Math.max(0, chroma), flash };
}

export const Shake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gf = useCurrentFrame();
  const { shake } = impactAt(gf);
  const dx = shake * (random(`x${gf}`) - 0.5) * 2;
  const dy = shake * (random(`y${gf}`) - 0.5) * 2;
  const r = shake * 0.03 * (random(`r${gf}`) - 0.5);
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${r}deg) scale(${1 + shake * 0.0015})` }}>{children}</AbsoluteFill>;
};

// RGB split copies of the whole frame are expensive; we fake chromatic aberration with tinted edge glows instead.
export const ImpactOverlay: React.FC = () => {
  const gf = useCurrentFrame();
  const { chroma, flash } = impactAt(gf);
  return (
    <>
      {chroma > 0.5 && (
        <AbsoluteFill style={{ pointerEvents: "none", boxShadow: `inset ${chroma * 2}px 0 ${chroma * 6}px rgba(255,0,80,${chroma / 40}), inset ${-chroma * 2}px 0 ${chroma * 6}px rgba(0,220,255,${chroma / 40})` }} />
      )}
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "overlay" }} />}
    </>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const gf = useCurrentFrame();
  return <Img src={staticFile(`fx/grain${gf % 6}.png`)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity, mixBlendMode: "overlay", pointerEvents: "none" }} />;
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)` }} />
);

// light leak sweeping across at a given (local) frame
export const LightLeak: React.FC<{ at: number; color?: string; len?: number }> = ({ at, color = "rgba(96,165,250,0.55)", len = 22 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > len) return null;
  const x = interpolate(d, [0, len], [-900, 2400], { ...cl, easing: ez });
  const o = Math.sin((d / len) * Math.PI);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o }}>
      <div style={{ position: "absolute", left: x, top: -300, width: 700, height: 1700, transform: "rotate(18deg)", background: `linear-gradient(90deg, transparent, ${color}, transparent)`, filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
};

// animated deep background with grid, glow orbs and drifting particles
export const SpaceBg: React.FC<{ hue?: string; hue2?: string; grid?: boolean }> = ({ hue = "#1d4ed8", hue2 = "#0891b2", grid = true }) => {
  const fr = useCurrentFrame();
  const a = fr / 90;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 960 + Math.cos(a) * 420 - 700, top: 300 + Math.sin(a * 1.3) * 160 - 700, width: 1400, height: 1400, borderRadius: 700, background: `radial-gradient(circle, ${hue}88 0%, transparent 62%)` }} />
      <div style={{ position: "absolute", left: 960 - Math.cos(a * 0.8) * 520 - 600, top: 760 + Math.cos(a) * 140 - 600, width: 1200, height: 1200, borderRadius: 600, background: `radial-gradient(circle, ${hue2}66 0%, transparent 60%)` }} />
      {grid && (
        <AbsoluteFill
          style={{
            transform: "perspective(900px) rotateX(62deg) translateY(380px) scale(2.2)",
            backgroundImage: "linear-gradient(rgba(96,165,250,0.16) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(96,165,250,0.16) 1.5px, transparent 1.5px)",
            backgroundSize: "80px 80px",
            backgroundPosition: `0 ${(fr * 3) % 80}px`,
            maskImage: "linear-gradient(180deg, transparent 0%, black 60%)",
          }}
        />
      )}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = random(`px${i}`) * 1920;
        const sp = 0.4 + random(`ps${i}`) * 1.4;
        const y = (1150 - ((fr * sp + random(`py${i}`) * 1200) % 1250));
        const s = 2 + random(`pz${i}`) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s, background: i % 3 ? "#93c5fd" : "#67e8f9", opacity: 0.25 + random(`po${i}`) * 0.4, }} />;
      })}
    </AbsoluteFill>
  );
};

export const LightBg: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(15,23,42,0.07) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px", backgroundPosition: `0 ${-fr * 0.5}px` }} />
    </AbsoluteFill>
  );
};

// radial burst of particles from a point
export const Burst: React.FC<{ at: number; x?: number; y?: number; color?: string; n?: number; r?: number }> = ({ at, x = 960, y = 540, color = C.cyan, n = 28, r = 520 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 26) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + random(`ba${i}`) * 0.4;
        const rr = interpolate(d, [0, 26], [20, r * (0.5 + random(`br${i}`) * 0.7)], { ...cl, easing: ez });
        const s = 6 + random(`bs${i}`) * 12;
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(ang) * rr - s / 2, top: y + Math.sin(ang) * rr - s / 2, width: i % 4 === 0 ? s * 3 : s, height: s, borderRadius: s, background: i % 3 ? color : "#fff", opacity: 1 - d / 26, transform: `rotate(${(ang * 180) / Math.PI}deg)`, boxShadow: `0 0 12px ${color}` }} />;
      })}
    </AbsoluteFill>
  );
};

export const Shockwave: React.FC<{ at: number; x?: number; y?: number; color?: string }> = ({ at, x = 960, y = 540, color = C.sky }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > 22) return null;
  return (
    <>
      {[0, 5].map((k) => {
        const dd = d - k;
        if (dd < 0) return null;
        const r = interpolate(dd, [0, 18], [20, 900], { ...cl, easing: ez });
        return <div key={k} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `${Math.max(1, 10 - dd * 0.5)}px solid ${color}`, opacity: Math.max(0, 1 - dd / 18), pointerEvents: "none" }} />;
      })}
    </>
  );
};

// horizontal glitch slices over children for `len` frames from `at`
export const Glitch: React.FC<{ at: number; len?: number; children: React.ReactNode }> = ({ at, len = 8, children }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > len) return <>{children}</>;
  const slices = 7;
  return (
    <AbsoluteFill>
      {Array.from({ length: slices }).map((_, i) => {
        const off = (random(`g${fr}-${i}`) - 0.5) * 120 * (1 - d / len);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${(i / slices) * 100}% 0 ${100 - ((i + 1) / slices) * 100}% 0)`, transform: `translateX(${off}px)`, filter: i % 2 ? "hue-rotate(40deg)" : "none" }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// speed lines (motion streaks) for whip moments
export const Streaks: React.FC<{ at: number; len?: number; dir?: 1 | -1 }> = ({ at, len = 10, dir = 1 }) => {
  const fr = useCurrentFrame();
  const d = fr - at;
  if (d < 0 || d > len) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: Math.sin((d / len) * Math.PI) }}>
      {Array.from({ length: 18 }).map((_, i) => {
        const y = random(`sy${i}`) * 1080;
        const w = 300 + random(`sw${i}`) * 700;
        const x = dir > 0 ? interpolate(d, [0, len], [-w, 1920], cl) : interpolate(d, [0, len], [1920, -w], cl);
        return <div key={i} style={{ position: "absolute", left: x + random(`sx${i}`) * 400, top: y, width: w, height: 2 + random(`sh${i}`) * 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)" }} />;
      })}
    </AbsoluteFill>
  );
};
