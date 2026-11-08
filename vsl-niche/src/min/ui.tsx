import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { cl, eIn, eOut, F, inn, LINES, M, MX, norm, out, SCENES, sceneStart, TOTAL, wk } from "./lib";

// ---------- text measuring (fonts are loaded before the first frame) ----------
let _ctx: CanvasRenderingContext2D | null = null;
const ctx = () => (_ctx ??= document.createElement("canvas").getContext("2d")!);
export const measure = (text: string, font: string) => {
  const c = ctx();
  c.font = font;
  return c.measureText(text).width;
};

/** accent words per line (rendered in italic serif, accent colour) */
export const ACC: Record<number, string[]> = {};

type Tok = { w: string; at: number; acc: boolean };
const sansFont = (size: number, wt: number) => `${wt} ${size}px 'Inter Tight'`;
const serifFont = (size: number) => `italic 400 ${size * 1.14}px 'Instrument Serif'`;
const wrapCount = (toks: Tok[], size: number, wt: number, maxW: number) => {
  const sp = measure(" ", sansFont(size, wt));
  let lines = 1, x = 0;
  for (const t of toks) {
    const w = measure(t.w, t.acc ? serifFont(size) : sansFont(size, wt));
    if (x > 0 && x + sp + w > maxW) { lines++; x = w; } else x += (x > 0 ? sp : 0) + w;
  }
  return lines;
};

/** split a line into sentence-sized chunks so long lines never crowd the frame */
const chunksOf = (toks: Tok[], maxWords: number) => {
  const out_: Tok[][] = [];
  let cur: Tok[] = [];
  toks.forEach((t, k) => {
    cur.push(t);
    const end = /[.?!:]$/.test(t.w);
    const comma = /,$/.test(t.w) && cur.length >= 7;
    if ((end || comma || cur.length >= maxWords) && k < toks.length - 1) { out_.push(cur); cur = []; }
  });
  if (cur.length) out_.push(cur);
  // glue very short tails ("No.", "Yes.") onto their neighbour
  for (let k = out_.length - 1; k > 0; k--) if (out_[k].length <= 1 && out_[k - 1].length < maxWords) { out_[k - 1].push(...out_[k]); out_.splice(k, 1); }
  return out_;
};

/**
 * Spoken line as editorial type: each word rises out of a mask the moment it is said.
 * Long lines show one sentence at a time; the previous sentence lifts away.
 */
export const Say: React.FC<{ line: number; size?: number; weight?: number; maxWidth?: number; maxLines?: number; align?: "left" | "center"; color?: string; whole?: boolean; until?: number; style?: React.CSSProperties; strike?: string[] }> = ({ line, size = 76, weight = 500, maxWidth = 1500, maxLines = 2, align = "center", color = M.ink, whole = false, until, style, strike = [] }) => {
  const fr = useCurrentFrame();
  const L = LINES[line];
  const acc = (ACC[line] ?? []).map(norm);
  const toks: Tok[] = L.words.map((w, k) => ({ w: w.w, at: wk(line, k), acc: acc.includes(norm(w.w)) }));
  const chunks = whole ? [toks] : chunksOf(toks, 12);
  // fit: shrink until every chunk fits in maxLines
  let s = size;
  for (let g = 0; g < 30 && chunks.some((c) => wrapCount(c, s, weight, maxWidth) > maxLines); g++) s *= 0.95;
  const starts = chunks.map((c) => c[0].at);
  const lineEnd = until ?? Infinity;
  return (
    <div style={{ display: "grid", width: maxWidth, justifyItems: align === "center" ? "center" : "start", ...style }}>
      {chunks.map((c, ci) => {
        const a = starts[ci] - 2;
        const b = ci + 1 < chunks.length ? starts[ci + 1] - 9 : lineEnd;
        if (fr < a - 30 || fr > b + 12) return null;
        return (
          <div key={ci} style={{ gridArea: "1 / 1", textAlign: align, fontFamily: F.sans, fontWeight: weight, fontSize: s, lineHeight: 1.12, letterSpacing: "-0.025em", color, maxWidth }}>
            {c.map((t, k) => {
              const p = interpolate(fr, [t.at - 5, t.at + 11], [0, 1], { ...cl, easing: eOut });
              const q = Number.isFinite(b) ? interpolate(fr, [b, b + 9], [0, 1], { ...cl, easing: eIn }) : 0;
              const st = strike.includes(norm(t.w));
              return (
                <React.Fragment key={k}>
                  <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.14em", marginBottom: "-0.14em", paddingRight: t.acc ? "0.06em" : 0 }}>
                    <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 108 - q * 108}%)`, position: "relative", ...(t.acc ? { fontFamily: F.serif, fontStyle: "italic", fontWeight: 400, fontSize: "1.14em", letterSpacing: "-0.01em", lineHeight: 1, color: M.acc } : {}), ...(st ? { color: M.mute } : {}) }}>
                      {t.w}
                      {st && <span style={{ position: "absolute", left: -4, right: -4, top: "54%", height: Math.max(2, s / 28), background: M.ink, transformOrigin: "left", transform: `scaleX(${inn(fr, t.at + 8, 14)})` }} />}
                    </span>
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

/** small mono label */
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = M.ink2, size = 20, style }) => (
  <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: size, letterSpacing: "0.14em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

/** hairline that draws itself */
export const Rule: React.FC<{ at: number; len?: number; w: number | string; color?: string; h?: number; vertical?: boolean; style?: React.CSSProperties; from?: "start" | "end" | "center" }> = ({ at, len = 22, w, color = M.line, h = 1.5, vertical, style, from = "start" }) => {
  const fr = useCurrentFrame();
  const p = inn(fr, at, len);
  const origin = from === "center" ? "center" : vertical ? (from === "start" ? "top" : "bottom") : from === "start" ? "left" : "right";
  return <div style={{ width: vertical ? h : w, height: vertical ? w : h, background: color, transformOrigin: origin, transform: vertical ? `scaleY(${p})` : `scaleX(${p})`, ...style }} />;
};

/** fade + small rise in, ease-in fade out; never scaled (keeps images and type crisp) */
export const Enter: React.FC<{ at: number; leave?: number; dy?: number; dx?: number; len?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, leave, dy = 26, dx = 0, len = 20, children, style }) => {
  const fr = useCurrentFrame();
  if (fr < at - 1) return null;
  const p = inn(fr, at, len);
  const q = leave === undefined ? 0 : out(fr, leave, 10);
  if (q >= 1) return null;
  return <div style={{ opacity: p * (1 - q), transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy - q * 14}px)`, ...style }}>{children}</div>;
};

/** product cover, rendered from the field-guide PDF at 1091 px wide: always shown at < half that, so it stays sharp */
export const Cover: React.FC<{ slug: string; tier?: "Essential" | "Elite"; width: number; style?: React.CSSProperties }> = ({ slug, tier = "Elite", width, style }) => (
  <Img src={staticFile(`hicov/${slug}/${tier}.png`)} style={{ width, height: Math.round((width * 1544) / 1091), display: "block", borderRadius: 3, boxShadow: "0 1px 2px rgba(24,24,27,0.08), 0 28px 56px -30px rgba(24,24,27,0.38)", ...style }} />
);

export const Logo: React.FC<{ size: number }> = ({ size }) => <Img src={staticFile("logo.png")} style={{ width: size, height: size, objectFit: "contain" }} />;
export const Lockup: React.FC<{ size: number; color?: string }> = ({ size, color = M.ink }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <Logo size={size * 1.05} />
    <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.04em", color, lineHeight: 1 }}>ProfitIQS</div>
  </div>
);

// ---------- chrome: wordmark, section index, progress hairline ----------
const SECTION: Record<string, string> = {
  hook: "The question", blind: "The blind spot", data: "The data", reveal: "ProfitIQS", show: "The showroom", wall: "21 industries",
  box: "Editions", inside: "Inside", how: "How it works", honest: "Honest answers", cta: "Next step", end: "ProfitIQS",
};
export const Chrome: React.FC = () => {
  const fr = useCurrentFrame();
  const cur = SCENES.reduce((a, s, k) => (fr >= sceneStart(s) ? k : a), 0);
  const sc = SCENES[cur];
  const sw = inn(fr, sceneStart(sc) + 4, 16);
  const fadeIn = inn(fr, 4, 20);
  const endFade = 1 - out(fr, sceneStart("end") - 4, 12);
  return (
    <AbsoluteFill style={{ opacity: fadeIn * endFade }}>
      <div style={{ position: "absolute", left: MX, top: 64, display: "flex", alignItems: "center", gap: 12 }}>
        <Logo size={30} />
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 24, letterSpacing: "-0.03em", color: M.ink }}>ProfitIQS</div>
      </div>
      <div style={{ position: "absolute", right: MX, top: 68, display: "flex", gap: 18, alignItems: "baseline", overflow: "hidden" }}>
        <Label color={M.mute}>{String(cur + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}</Label>
        <div style={{ overflow: "hidden" }}>
          <Label style={{ transform: `translateY(${(1 - sw) * 110}%)` }}>{SECTION[sc] ?? ""}</Label>
        </div>
      </div>
      <div style={{ position: "absolute", left: MX, right: MX, top: 1012, height: 1.5, background: M.line }}>
        <div style={{ position: "absolute", left: 0, top: -0.5, height: 2.5, width: `${(fr / TOTAL) * 100}%`, background: M.ink }} />
      </div>
    </AbsoluteFill>
  );
};

/** a scene block: visible from a to b with a calm fade (no zooms) */
export const Block: React.FC<{ a: number; b: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ a, b, children, style }) => {
  const fr = useCurrentFrame();
  if (fr < a - 1 || fr > b + 12) return null;
  const p = inn(fr, a, 14);
  const q = out(fr, b, 12);
  return <AbsoluteFill style={{ opacity: Math.min(p, 1 - q), transform: `translateY(${-q * 18}px)`, ...style }}>{children}</AbsoluteFill>;
};
