import "@fontsource/anton/400.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { EVENTS, FPS, fo, OUT_START, SEGMENTS, SPEECH_END, TOTAL_FRAMES } from "./edit";
import CAPTIONS from "./captions.json";

export const K = {
  black: "#0B0B0B",
  lime: "#C8FF2E",
  white: "#FFFFFF",
  red: "#FF3B30",
  green: "#22E07A",
};
const F = { big: "'Anton', Impact, sans-serif", ui: "'Poppins', system-ui, sans-serif" };
const ez = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ap = (f: number, at: number, len = 8) => interpolate(f, [at, at + len], [0, 1], { ...cl, easing: ez });
const sp = (f: number, at: number, stiff = 220) => spring({ frame: f - at, fps: FPS, config: { damping: 12, stiffness: stiff, mass: 0.6 } });

// ---------- events (source seconds) ----------
export const EV = EVENTS as Record<"approved" | "tough" | "approved2" | "notAll" | "structure" | "watch" | "research" | "question" | "digital" | "whatIs" | "twoTypes" | "versus", number>;
const at = (k: keyof typeof EV) => fo(EV[k]);

// shake amount at output frame f
function shake(f: number) {
  let a = 0;
  for (const k of ["approved", "tough", "notAll", "digital"] as const) {
    const d = f - at(k);
    if (d >= 0 && d < 10) a = Math.max(a, (1 - d / 10) * 18);
  }
  return a;
}

// ---------- the footage: segments with camera ----------
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: K.black }}>
      {SEGMENTS.map((g, i) => {
        const from = Math.round(OUT_START[i] * FPS);
        const dur = Math.round((g.e - g.s) * FPS);
        const lf = f - from;
        // zoom keys (hard cut between keys, like a camera shot change)
        let z = g.z[1];
        for (let k = 0; k < g.z.length; k += 2) if (g.s + lf / FPS >= g.z[k]) z = g.z[k + 1];
        const keyStarts = [from];
        for (let k = 2; k < g.z.length; k += 2) keyStarts.push(fo(g.z[k]));
        const lastKey = Math.max(...keyStarts.filter((s) => s <= f));
        const kick = interpolate(f - lastKey, [0, 6], [1.07, 1], { ...cl, easing: ez });
        const blur = interpolate(f - lastKey, [0, 5], [8, 0], cl);
        const drift = 1 + Math.min(0.03, (f - lastKey) * 0.0006);
        const s = shake(f);
        const dx = s * Math.sin(f * 2.7);
        const dy = s * Math.cos(f * 3.3);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z * kick * drift})`, transformOrigin: "540px 700px", filter: `blur(${blur}px) contrast(1.14) saturate(1.12) brightness(1.04) sepia(0.12) hue-rotate(-6deg)` }}>
              <OffthreadVideo src={staticFile("src.mp4")} startFrom={Math.round(g.s * FPS)} style={{ width: 1080, height: 1920 }} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {/* warm the teal room a little, and darken the lower third for captions */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,170,90,0.06), rgba(255,140,60,0.05))", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- flashes on cuts ----------
const Flash: React.FC<{ at: number; color?: string; len?: number }> = ({ at: a, color = "#fff", len = 5 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - a, [0, 1, len], [0, 0.85, 0], cl);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen" }} /> : null;
};

// ---------- graphics ----------
const Pill: React.FC<{ at: number; until: number; y: number; bg: string; color: string; children: React.ReactNode; rot?: number; size?: number }> = ({ at: a, until, y, bg, color, children, rot = -4, size = 84 }) => {
  const f = useCurrentFrame();
  if (f < a - 1 || f > until + 6) return null;
  const s = sp(f, a, 320);
  const o = 1 - ap(f, until, 6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${0.3 + 0.7 * s}) rotate(${rot * s}deg)`, background: bg, color, fontFamily: F.big, fontSize: size, letterSpacing: "0.02em", padding: "6px 34px 2px", borderRadius: 18, lineHeight: 1.1, boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>{children}</div>
    </div>
  );
};

const Stamp: React.FC<{ at: number; until: number }> = ({ at: a, until }) => {
  const f = useCurrentFrame();
  if (f < a || f > until + 6) return null;
  const s = interpolate(f - a, [0, 5], [2.6, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const o = Math.min(ap(f, a, 3), 1 - ap(f, until, 6));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `rotate(-9deg) scale(${s})`, border: `12px solid ${K.lime}`, color: K.lime, fontFamily: F.big, fontSize: 150, padding: "0 40px", borderRadius: 26, letterSpacing: "0.04em", background: "rgba(11,11,11,0.55)" }}>APPROVED ✓</div>
    </div>
  );
};

const Burst: React.FC<{ at: number; color?: string; cx?: number; cy?: number }> = ({ at: a, color = K.lime, cx = 540, cy = 1330 }) => {
  const f = useCurrentFrame();
  const d = f - a;
  if (d < 0 || d > 22) return null;
  return (
    <>
      {Array.from({ length: 22 }).map((_, i) => {
        const ang = (i / 22) * Math.PI * 2 + i;
        const r = interpolate(d, [0, 22], [40, 330 + (i % 4) * 60], { ...cl, easing: ez });
        const sz = 14 + (i % 3) * 8;
        return <div key={i} style={{ position: "absolute", left: cx + Math.cos(ang) * r - sz / 2, top: cy + Math.sin(ang) * r - sz / 2, width: sz, height: sz, borderRadius: i % 2 ? sz : 3, background: i % 3 ? color : "#fff", opacity: 1 - d / 22, transform: `rotate(${d * 20 + i * 30}deg)` }} />;
      })}
    </>
  );
};

const SearchBar: React.FC<{ at: number; until: number }> = ({ at: a, until }) => {
  const f = useCurrentFrame();
  if (f < a - 1 || f > until + 6) return null;
  const q = "best products to sell online";
  const n = Math.round(interpolate(f, [a + 6, a + 36], [0, q.length], cl));
  const s = sp(f, a);
  const o = 1 - ap(f, until, 6);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1240, opacity: o, transform: `translateY(${(1 - s) * 120}px) scale(${0.8 + 0.2 * s})` }}>
      <div style={{ background: "#fff", borderRadius: 999, padding: "26px 40px", display: "flex", alignItems: "center", gap: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", border: `5px solid ${K.lime}` }}>
        <svg width="48" height="48" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" stroke="#0B0B0B" strokeWidth="3" fill="none" /><path d="M15 15 L22 22" stroke="#0B0B0B" strokeWidth="3" strokeLinecap="round" /></svg>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 46, color: K.black, whiteSpace: "nowrap" }}>
          {q.slice(0, n)}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: "#999" }}>|</span>
        </div>
      </div>
    </div>
  );
};

const Questions: React.FC<{ at: number; until: number }> = ({ at: a, until }) => {
  const f = useCurrentFrame();
  if (f < a || f > until + 6) return null;
  const spots = [
    [120, 620, -14],
    [880, 520, 12],
    [150, 1000, 8],
    [860, 960, -10],
  ];
  return (
    <>
      {spots.map(([x, y, r], i) => {
        const s = sp(f, a + i * 5, 260);
        const o = 1 - ap(f, until, 6);
        return <div key={i} style={{ position: "absolute", left: x - 60, top: y - 90, fontFamily: F.big, fontSize: 190, color: i % 2 ? K.lime : "#fff", opacity: o * Math.min(1, s), transform: `scale(${s}) rotate(${r + Math.sin(f / 5 + i) * 6}deg)`, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>?</div>;
      })}
    </>
  );
};

// full-screen punch card (covers the frame briefly)
const PunchCard: React.FC<{ at: number; len: number; children: React.ReactNode; bg?: string }> = ({ at: a, len, children, bg = K.lime }) => {
  const f = useCurrentFrame();
  const d = f - a;
  if (d < 0 || d > len) return null;
  const inP = interpolate(d, [0, 5], [0, 1], { ...cl, easing: ez });
  const outP = interpolate(d, [len - 5, len], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: bg, clipPath: `inset(${(1 - inP) * 50}% 0 ${(1 - inP) * 50}% 0)`, transform: `translateX(${outP * -1100}px)`, justifyContent: "center", alignItems: "center" }}>{children}</AbsoluteFill>
  );
};

const COVERS = ["Auto_Repair_Shop_Profit_Intelligence_System", "Restaurant_Profit_Intelligence_System", "HVAC_Profit_Intelligence_System", "Small_Business_Command_Center", "Ecommerce_Profit_Intelligence_System"];

const Digital: React.FC = () => {
  const f = useCurrentFrame();
  const a = at("digital");
  const len = 46;
  const d = f - a;
  return (
    <PunchCard at={a} len={len} bg={K.black}>
      <div style={{ position: "absolute", top: 300, fontFamily: F.big, fontSize: 190, lineHeight: 0.95, color: "#fff", textAlign: "center", transform: `scale(${1 + d * 0.004})` }}>
        DIGITAL
        <br />
        <span style={{ color: K.lime }}>PRODUCTS</span>
      </div>
      {COVERS.map((c, i) => {
        const s = sp(f, a + 8 + i * 3, 260);
        const ang = (i - 2) * 11;
        return (
          <Img key={c} src={staticFile(`covers/${c}_Elite_2026_Cover.png`)} style={{ position: "absolute", top: 820, left: 540 - 150 + (i - 2) * 150, width: 300, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", transform: `translateY(${(1 - s) * 900}px) rotate(${ang * s}deg)`, transformOrigin: "50% 120%" }} />
        );
      })}
      <div style={{ position: "absolute", bottom: 470, fontFamily: F.ui, fontWeight: 800, fontSize: 40, color: K.lime, letterSpacing: "0.12em", opacity: ap(f, a + 22) }}>EXCEL BUSINESS SYSTEMS</div>
    </PunchCard>
  );
};

const Versus: React.FC = () => {
  const f = useCurrentFrame();
  const a = at("versus");
  const len = Math.round((SPEECH_END - (a / FPS)) * FPS) + 2;
  const d = f - a;
  if (d < 0 || d > len) return null;
  const l = interpolate(d, [0, 6], [-600, 0], { ...cl, easing: ez });
  const r = interpolate(d, [4, 10], [600, 0], { ...cl, easing: ez });
  const vs = sp(f, a + 8, 300);
  const box = (t: string, sub: string, bg: string, color: string, x: number, icon: React.ReactNode) => (
    <div style={{ position: "absolute", top: 1180, left: 60 + x, width: 450, height: 300, borderRadius: 30, background: bg, color, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
      {icon}
      <div style={{ fontFamily: F.big, fontSize: 76, lineHeight: 1 }}>{t}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 28, opacity: 0.85 }}>{sub}</div>
    </div>
  );
  return (
    <>
      <div style={{ transform: `translateX(${l}px)` }}>
        {box("PHYSICAL", "pen · PC · stock", "#fff", K.black, 0, <svg width="90" height="90" viewBox="0 0 24 24"><path d="M3 7 L12 3 L21 7 L21 17 L12 21 L3 17 Z M3 7 L12 11 L21 7 M12 11 L12 21" fill="none" stroke="#0B0B0B" strokeWidth="1.8" strokeLinejoin="round" /></svg>)}
      </div>
      <div style={{ transform: `translateX(${r}px)` }}>
        {box("DIGITAL", "files · Excel · courses", K.lime, K.black, 510, <svg width="90" height="90" viewBox="0 0 24 24"><path d="M6 2 H14 L19 7 V22 H6 Z M14 2 V7 H19 M9 12 H16 M9 15 H16 M9 18 H13" fill="none" stroke="#0B0B0B" strokeWidth="1.8" strokeLinejoin="round" /></svg>)}
      </div>
      <div style={{ position: "absolute", top: 1278, left: 540 - 60, width: 120, height: 120, borderRadius: 60, background: K.black, color: K.lime, fontFamily: F.big, fontSize: 60, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${vs}) rotate(${(1 - vs) * 180}deg)`, border: `5px solid ${K.lime}` }}>VS</div>
    </>
  );
};

// ---------- captions (Tanglish, word-timed) ----------
type W = { w: string; s: number; e: number };
const CHUNKS: W[][] = (() => {
  const ws = (CAPTIONS as W[]).filter((w) => w.w.trim());
  const out: W[][] = [];
  let cur: W[] = [];
  for (const w of ws) {
    const len = cur.map((x) => x.w).join(" ").length + w.w.length;
    const gap = cur.length ? w.s - cur[cur.length - 1].e : 0;
    if (cur.length && (cur.length >= 3 || len > 20 || gap > 0.25 || fo(w.s) - fo(cur[cur.length - 1].e) > 9)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
})();

const HIDE: [number, number][] = [
  [at("approved") - 2, at("approved") + 34],
  [at("digital"), at("digital") + 46],
  [at("versus"), 100000],
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  if (HIDE.some(([a, b]) => f >= a && f <= b)) return null;
  const idx = CHUNKS.findIndex((c, i) => {
    const a = fo(c[0].s) - 1;
    const nxt = CHUNKS[i + 1];
    const b = nxt ? Math.min(fo(nxt[0].s) - 1, fo(c[c.length - 1].e) + 12) : fo(c[c.length - 1].e) + 12;
    return f >= a && f < b;
  });
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const a0 = fo(c[0].s) - 1;
  const s = sp(f, a0, 380);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1255, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 22px", transform: `scale(${0.75 + 0.25 * s})` }}>
      {c.map((w, i) => {
        const on = f >= fo(w.s) - 1;
        const cur = on && (i === c.length - 1 || f < fo(c[i + 1].s) - 1);
        const ws = sp(f, fo(w.s) - 1, 420);
        return (
          <span key={i} style={{ fontFamily: F.ui, fontWeight: 900, fontSize: 84, lineHeight: 1.12, textTransform: "uppercase", letterSpacing: "-0.01em", color: cur ? K.black : "#fff", background: cur ? K.lime : "transparent", padding: "0 14px", borderRadius: 14, opacity: on ? 1 : 0.45, transform: `scale(${cur ? 1 + 0.12 * (1 - Math.min(1, ws)) + 0.04 : 1}) rotate(${cur ? -2 : 0}deg)`, display: "inline-block" }}>
            {w.w.trim()}
          </span>
        );
      })}
    </div>
  );
};

// ---------- end sting ----------
const Sting: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.round(SPEECH_END * FPS);
  const d = f - a;
  if (d < -2) return null;
  const wipe = interpolate(d, [-2, 6], [0, 1], { ...cl, easing: ez });
  const s = sp(f, a + 4, 240);
  return (
    <AbsoluteFill style={{ background: K.black, clipPath: `circle(${wipe * 120}% at 50% 50%)`, alignItems: "center", justifyContent: "center", gap: 30 }}>
      <Img src={staticFile("logo.png")} style={{ height: 260, transform: `scale(${s}) rotate(${(1 - s) * -30}deg)` }} />
      <div style={{ fontFamily: F.ui, fontWeight: 900, fontSize: 104, color: "#fff", letterSpacing: "-0.03em", opacity: ap(f, a + 8), transform: `translateY(${(1 - ap(f, a + 8)) * 40}px)` }}>
        Profit<span style={{ color: K.lime }}>IQS</span>
      </div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: K.lime, letterSpacing: "0.14em", opacity: ap(f, a + 16) }}>PROFITIQS.COM</div>
    </AbsoluteFill>
  );
};

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([document.fonts.load("40px Anton"), document.fonts.load("900 40px Poppins"), document.fonts.load("700 40px Poppins")]).then(() => continueRender(h));
  }, [h]);
};

export const Reel: React.FC = () => {
  useFonts();
  const cutFrames = OUT_START.slice(1).map((t) => Math.round(t * FPS));
  return (
    <AbsoluteFill style={{ background: K.black }}>
      <Footage />
      {cutFrames.map((c) => (
        <Flash key={c} at={c} len={4} color="rgba(255,255,255,0.5)" />
      ))}
      <Flash at={at("approved")} color={K.lime} len={7} />
      <Flash at={at("tough")} color={K.red} len={8} />
      <Flash at={at("approved2")} color={K.green} len={6} />
      <Stamp at={at("approved")} until={at("approved") + 34} />
      <Burst at={at("approved")} />
      <Pill at={at("tough")} until={at("tough") + 26} y={196} bg={K.red} color="#fff" rot={4}>ROMBA TOUGH</Pill>
      <Pill at={at("approved2")} until={at("notAll") - 2} y={196} bg={K.green} color={K.black}>APPROVED ✓</Pill>
      <Pill at={at("notAll")} until={at("notAll") + 30} y={196} bg={K.red} color="#fff" rot={5}>✗ NOT ALL</Pill>
      <Pill at={at("structure")} until={at("watch") - 2} y={196} bg={K.lime} color={K.black}>FULL STRUCTURE</Pill>
      <Pill at={at("watch")} until={at("watch") + 32} y={196} bg="#fff" color={K.black} rot={3}>WATCH TILL END</Pill>
      <SearchBar at={at("research")} until={at("question") - 2} />
      <Questions at={at("question")} until={fo(19.4)} />
      <Digital />
      <Pill at={at("whatIs")} until={at("twoTypes") - 2} y={196} bg={K.lime} color={K.black}>DIGITAL = ?</Pill>
      <Pill at={at("twoTypes")} until={at("versus") - 2} y={196} bg="#fff" color={K.black} size={110}>2 TYPES</Pill>
      <Versus />
      <Captions />
      <Sting />
      <Audio src={staticFile("sfx.wav")} />
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES };
