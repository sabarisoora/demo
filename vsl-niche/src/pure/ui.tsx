import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { cl, eIn, eOut, F, inn, LINES, MX, norm, out, P, SCENES, sceneStart, SH, SHOT, wk } from "./lib";

let _ctx: CanvasRenderingContext2D | null = null;
const measure = (text: string, font: string) => {
  const c = (_ctx ??= document.createElement("canvas").getContext("2d")!);
  c.font = font;
  return c.measureText(text).width;
};
export const ACC: Record<number, string[]> = {};

type Tok = { w: string; at: number; acc: boolean };
const font = (size: number, wt: number) => `${wt} ${size}px 'Inter Tight'`;
const wrapCount = (toks: Tok[], size: number, wt: number, maxW: number) => {
  const sp = measure(" ", font(size, wt)) + size * 0.06;
  let lines = 1, x = 0;
  for (const t of toks) {
    const w = measure(t.w, font(size, wt)) - t.w.length * size * 0.03;
    if (x > 0 && x + sp + w > maxW) { lines++; x = w; } else x += (x > 0 ? sp : 0) + w;
  }
  return lines;
};
const chunksOf = (toks: Tok[], maxWords: number) => {
  const res: Tok[][] = [];
  let cur: Tok[] = [];
  toks.forEach((t, k) => {
    cur.push(t);
    const end = /[.?!:]$/.test(t.w), comma = /,$/.test(t.w) && cur.length >= 7;
    if ((end || comma || cur.length >= maxWords) && k < toks.length - 1) { res.push(cur); cur = []; }
  });
  if (cur.length) res.push(cur);
  for (let k = res.length - 1; k > 0; k--) if (res[k].length <= 1 && res[k - 1].length < maxWords) { res[k - 1].push(...res[k]); res.splice(k, 1); }
  return res;
};

/** spoken line: each word assembles itself (blur + rise) the moment it is said */
export const Say: React.FC<{ line: number; size?: number; weight?: number; maxWidth?: number; maxLines?: number; align?: "left" | "center"; color?: string; whole?: boolean; strike?: string[]; style?: React.CSSProperties }> = ({ line, size = 76, weight = 600, maxWidth = 1500, maxLines = 2, align = "center", color = P.ink, whole = false, strike = [], style }) => {
  const fr = useCurrentFrame();
  const L = LINES[line];
  const acc = (ACC[line] ?? []).map(norm);
  const toks: Tok[] = L.words.map((w, k) => ({ w: w.w, at: wk(line, k), acc: acc.includes(norm(w.w)) }));
  const chunks = whole ? [toks] : chunksOf(toks, 12);
  let s = size;
  for (let g = 0; g < 30 && chunks.some((c) => wrapCount(c, s, weight, maxWidth) > maxLines); g++) s *= 0.95;
  const starts = chunks.map((c) => c[0].at);
  return (
    <div style={{ display: "grid", width: maxWidth, justifyItems: align === "center" ? "center" : "start", ...style }}>
      {chunks.map((c, ci) => {
        const a = starts[ci] - 2;
        const b = ci + 1 < chunks.length ? starts[ci + 1] - 9 : Infinity;
        if (fr < a - 30 || fr > b + 12) return null;
        const q = Number.isFinite(b) ? interpolate(fr, [b, b + 9], [0, 1], { ...cl, easing: eIn }) : 0;
        return (
          <div key={ci} style={{ gridArea: "1 / 1", textAlign: align, fontFamily: F.sans, fontWeight: weight, fontSize: s, lineHeight: 1.06, letterSpacing: "-0.03em", wordSpacing: "0.06em", color, maxWidth, opacity: 1 - q, filter: q > 0 ? `blur(${q * 10}px)` : undefined, transform: `translateY(${-q * 0.2}em)` }}>
            {c.map((t, k) => {
              const p = interpolate(fr, [t.at - 6, t.at + 10], [0, 1], { ...cl, easing: eOut });
              const st = strike.includes(norm(t.w));
              return (
                <React.Fragment key={k}>
                  <span style={{ display: "inline-block", position: "relative", opacity: p, filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined, transform: `translateY(${(1 - p) * 0.32}em)`, color: st ? P.soft : t.acc ? P.acc : undefined }}>
                    {t.w}
                    {st && <span style={{ position: "absolute", left: -4, right: -4, top: "54%", height: Math.max(3, s / 22), borderRadius: 4, background: P.ink, transformOrigin: "left", transform: `scaleX(${inn(fr, t.at + 8, 14)})` }} />}
                  </span>
                  {k < c.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** fixed (non-narrated) text that assembles in */
export const Blur: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; len?: number; dy?: number; leave?: number }> = ({ at, children, style, len = 18, dy = 30, leave }) => {
  const fr = useCurrentFrame();
  if (fr < at - 1) return null;
  const p = inn(fr, at, len);
  const q = leave === undefined ? 0 : out(fr, leave, 10);
  if (q >= 1) return null;
  const b = (1 - p) * 14 + q * 10;
  return <div style={{ opacity: p * (1 - q), filter: b > 0.05 ? `blur(${b}px)` : undefined, transform: `translateY(${(1 - p) * dy - q * 16}px)`, ...style }}>{children}</div>;
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = P.grey, size = 26, style }) => (
  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: size, letterSpacing: "-0.01em", color, ...style }}>{children}</div>
);
export const Pill: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties }> = ({ children, dark, size = 28, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, borderRadius: 999, padding: `${size * 0.5}px ${size * 0.95}px`, background: dark ? P.ink : P.bg, color: dark ? "#FFFFFF" : P.ink, border: dark ? "none" : `1.5px solid ${P.line}`, fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", boxShadow: dark ? SH.soft : "none", whiteSpace: "nowrap", ...style }}>{children}</div>
);

export const Cover: React.FC<{ slug: string; tier?: "Essential" | "Elite"; width: number; style?: React.CSSProperties }> = ({ slug, tier = "Elite", width, style }) => (
  <Img src={staticFile(`hicov/${slug}/${tier}.png`)} style={{ width, height: Math.round((width * 1544) / 1091), display: "block", borderRadius: Math.max(4, width * 0.018), boxShadow: SH.deep, ...style }} />
);

/** an Excel-style app window with a real workbook screenshot */
export const Win: React.FC<{ shot: string; width: number; maxH?: number; title?: string; style?: React.CSSProperties; sample?: boolean }> = ({ shot, width, maxH = 600, title, style, sample = true }) => {
  const [w, h] = SHOT[shot];
  const ih = Math.round((width * h) / w);
  const bar = Math.max(30, width * 0.042);
  return (
    <div style={{ width, borderRadius: Math.max(10, width * 0.016), background: "#FFFFFF", boxShadow: `${SH.deep}, 0 0 0 1px rgba(0,0,0,0.06)`, overflow: "hidden", ...style }}>
      <div style={{ height: bar, display: "flex", alignItems: "center", padding: `0 ${bar * 0.5}px`, gap: bar * 0.2, borderBottom: `1px solid ${P.line}`, background: "#FBFBFC" }}>
        {[0, 1, 2].map((k) => <div key={k} style={{ width: bar * 0.28, height: bar * 0.28, borderRadius: 99, background: "#DCDCE0" }} />)}
        <div style={{ flex: 1, textAlign: "center", fontFamily: F.sans, fontWeight: 500, fontSize: bar * 0.4, color: P.grey, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", padding: "0 12px" }}>{title}</div>
        {sample && <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: bar * 0.34, color: P.grey2, background: P.tile, borderRadius: 99, padding: `${bar * 0.08}px ${bar * 0.3}px` }}>Sample data</div>}
      </div>
      <div style={{ height: Math.min(ih, maxH), overflow: "hidden" }}>
        <Img src={staticFile(`shots/${shot}.png`)} style={{ width, height: ih, display: "block" }} />
      </div>
    </div>
  );
};

export const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("logo.png")} style={{ width: size, height: size, objectFit: "contain" }} />;
export const Lockup: React.FC<{ size: number; color?: string }> = ({ size, color = P.ink }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.26 }}>
    <Logo size={size * 1.05} />
    <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.05em", color, lineHeight: 1 }}>ProfitIQS</div>
  </div>
);

const SECTION: Record<string, string> = {
  hook: "The question", blind: "The blind spot", data: "The data", reveal: "ProfitIQS", show: "The showroom", wall: "21 industries",
  box: "Editions", inside: "Inside", how: "How it works", honest: "Honest answers", cta: "Next step", end: "",
};
export const Chrome: React.FC = () => {
  const fr = useCurrentFrame();
  const cur = SCENES.reduce((a, s, k) => (fr >= sceneStart(s) ? k : a), 0);
  const sc = SCENES[cur];
  const sw = inn(fr, sceneStart(sc) + 4, 16);
  const vis = inn(fr, 4, 20) * (1 - out(fr, sceneStart("end") - 4, 12));
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: MX, top: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <Logo size={32} />
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 26, letterSpacing: "-0.04em", color: P.ink }}>ProfitIQS</div>
      </div>
      <div style={{ position: "absolute", right: MX, top: 64, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: P.grey, opacity: sw, filter: sw < 1 ? `blur(${(1 - sw) * 8}px)` : undefined }}>{SECTION[sc]}</div>
    </AbsoluteFill>
  );
};

/** scene block: soft blur-fade in/out plus a slow continuous camera push */
export const Block: React.FC<{ a: number; b: number; children: React.ReactNode; push?: number; style?: React.CSSProperties }> = ({ a, b, children, push = 0.03, style }) => {
  const fr = useCurrentFrame();
  if (fr < a - 1 || fr > b + 12) return null;
  const p = inn(fr, a, 16);
  const q = out(fr, b, 12);
  const t = interpolate(fr, [a, b + 12], [0, 1], cl);
  const bl = q * 12;
  return <AbsoluteFill style={{ opacity: Math.min(p, 1 - q), filter: bl > 0.05 ? `blur(${bl}px)` : undefined, transform: `scale(${1 + push * t})`, ...style }}>{children}</AbsoluteFill>;
};
export const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);
export const Head: React.FC<{ line: number; size?: number; maxWidth?: number; whole?: boolean; top?: number; align?: "left" | "center"; maxLines?: number }> = ({ line, size = 64, maxWidth = 1500, whole, top = 150, align = "left", maxLines = 2 }) => (
  <div style={{ position: "absolute", left: align === "left" ? MX : (1920 - maxWidth) / 2, top }}>
    <Say line={line} size={size} maxWidth={maxWidth} align={align} whole={whole} maxLines={maxLines} />
  </div>
);
