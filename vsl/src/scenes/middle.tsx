import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../assets";
import { Bars, Card, DarkBg, Eyebrow, IllustrativeTag, Kinetic, LightBg, LogoMark, Pop, Wordmark } from "../components";
import { appear, C, ease, FONT, pop, sceneWindow } from "../lib";
import { LineSwap } from "./opening";

type Win = ReturnType<typeof sceneWindow>;

const Chip: React.FC<{ at: number; children: React.ReactNode; dark?: boolean }> = ({ at, children, dark = true }) => (
  <Pop at={at} from={24}>
    <div
      style={{
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 34,
        color: dark ? C.cream : C.ink,
        background: dark ? "rgba(244,241,233,0.08)" : C.paper,
        border: `1px solid ${dark ? "rgba(244,241,233,0.2)" : C.line}`,
        padding: "16px 30px",
        borderRadius: 999,
      }}
    >
      {children}
    </div>
  </Pop>
);

export const Intro: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const up = appear(frame, L[4].s - 6, 24); // logo moves up for the niche list
  const pillarsOut = appear(frame, L[4].s - 10, 12);
  const pillars = ["Business-focused digital tools", "Organize key information", "Manage important numbers"];
  return (
    <AbsoluteFill>
      <DarkBg glow />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: interpolate(up, [0, 1], [210, 110]) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, transform: `scale(${interpolate(up, [0, 1], [1, 0.72])})` }}>
          <div style={{ transform: `scale(${pop(frame, 0)})` }}>
            <LogoMark size={150} draw={appear(frame, 4, 28)} />
          </div>
          <div style={{ opacity: appear(frame, 10, 20), transform: `translateX(${(1 - appear(frame, 10, 20)) * -30}px)` }}>
            <Wordmark size={150} />
          </div>
        </div>
        <div style={{ marginTop: 26, opacity: appear(frame, 26, 20), fontFamily: FONT.display, fontWeight: 600, fontSize: 50, color: C.cream, letterSpacing: "0.01em", transform: `scale(${interpolate(up, [0, 1], [1, 0.8])})` }}>
          Business Intelligence Systems<span style={{ fontSize: 22, verticalAlign: "top" }}>™</span>
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 80, opacity: 1 - pillarsOut }}>
          {pillars.map((t, i) => (
            <Pop key={t} at={L[1 + i].s}>
              <Card dark style={{ width: 430, padding: "34px 34px", borderRadius: 20 }}>
                <div style={{ width: 46, height: 6, borderRadius: 4, background: C.gold, marginBottom: 22 }} />
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 38, color: C.cream, lineHeight: 1.15 }}>{t}</div>
              </Card>
            </Pop>
          ))}
        </div>
        {pillarsOut > 0 && (
          <div style={{ position: "absolute", top: 470, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22, width: 1500 }}>
            <Chip at={L[4].s + 4}>Contractors</Chip>
            <Chip at={L[4].s + 22}>Cleaning businesses</Chip>
            <Chip at={L[5].s + 2}>Dental practices</Chip>
            <Chip at={L[5].s + 22}>Restaurants</Chip>
            <Chip at={L[5].s + 40}>Property managers</Chip>
            <Chip at={L[5].s + 66}>…and more</Chip>
          </div>
        )}
        {frame > L[6].s - 4 && (
          <div style={{ position: "absolute", top: 720 }}>
            <Kinetic text="Business-specific tools. [One organized solution.]" at={L[6].s + 4} size={58} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The centrepiece. With ASSETS.productDemo set this plays the real workbook recording;
// otherwise a neutral spreadsheet illustration (no invented numbers or features).
const SheetIllustration: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const cols = 7;
  const rows = 11;
  const filled = interpolate(frame, [L[2].s, L[2].s + 70], [0, rows], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const colHi = appear(frame, L[3].s, 16) * (1 - appear(frame, L[4].s - 4, 10));
  const sumHi = appear(frame, L[4].s, 18);
  const tab = frame < L[3].s ? 0 : frame < L[4].s ? 1 : 2;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 54, background: C.brand, display: "flex", alignItems: "center", padding: "0 22px", gap: 10 }}>
        {["#ec835a", "#fab219", "#9fd3f7"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85 }} />
        ))}
        <div style={{ marginLeft: 18, fontFamily: FONT.mono, fontSize: 18, color: "rgba(244,241,233,0.75)" }}>Your niche · business workbook</div>
      </div>
      <div style={{ flex: 1, position: "relative", background: "#ffffff" }}>
        <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${cols}, 1fr)`, gridAutoRows: 46 }}>
          {Array.from({ length: (rows + 1) * (cols + 1) }).map((_, k) => {
            const r = Math.floor(k / (cols + 1));
            const c = k % (cols + 1);
            const header = r === 0;
            const rowOn = r - 1 < filled;
            const inCol = c === 4 && r > 0;
            return (
              <div key={k} style={{ borderRight: "1px solid #e6edf7", borderBottom: "1px solid #e6edf7", background: header ? "#eef3fb" : inCol ? `rgba(79,176,255,${0.16 * colHi})` : "transparent", display: "flex", alignItems: "center", padding: "0 12px" }}>
                {c === 0 ? (
                  <span style={{ fontFamily: FONT.mono, fontSize: 15, color: C.muted }}>{r || ""}</span>
                ) : header ? (
                  <div style={{ height: 11, width: 50 + ((c * 17) % 40), borderRadius: 6, background: "#c5d3ea" }} />
                ) : (
                  <div style={{ height: 10, width: `${(rowOn ? 1 : 0) * (40 + ((r * 31 + c * 17) % 50))}%`, borderRadius: 6, background: inCol ? C.goldDeep : "#d3deef", transition: "none" }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 30, bottom: 30, width: 380, opacity: sumHi, transform: `translateY(${(1 - sumHi) * 30}px)` }}>
          <Card style={{ padding: 26, borderRadius: 16, border: `2px solid ${C.brand2}` }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: "0.1em", color: C.brand, marginBottom: 18 }}>REVIEW</div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <Bars widths={[[200, 150, 240][i], 60]} color={i === 0 ? C.brand2 : "#d3deef"} />
              </div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{ height: 46, background: "#eef3fb", borderTop: "1px solid #dde6f3", display: "flex", alignItems: "flex-end", paddingLeft: 70, gap: 6 }}>
        {["Records", "Tracking", "Review"].map((t, i) => (
          <div key={t} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 18, padding: "8px 22px", borderRadius: "8px 8px 0 0", background: tab === i ? "#ffffff" : "transparent", color: tab === i ? C.brand : C.muted, borderTop: tab === i ? `3px solid ${C.gold}` : "3px solid transparent" }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Product: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const enter = pop(frame, 0);
  const steps = [
    { at: L[0].s, t: "No starting from scratch" },
    { at: L[1].s, t: "Built for your business niche" },
    { at: L[2].s, t: "Organize relevant records" },
    { at: L[3].s, t: "Track the metrics your system supports" },
    { at: L[4].s, t: "Review information consistently" },
  ];
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", left: 90, top: 110, width: 1140, height: 760, transform: `perspective(2200px) rotateY(${(1 - enter) * 14 + 4}deg) translateY(${(1 - enter) * 60}px)`, opacity: Math.min(1, enter * 1.4) }}>
        <Card style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 22 }}>
          {ASSETS.productDemo ? <OffthreadVideo src={staticFile(ASSETS.productDemo)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <SheetIllustration win={win} />}
        </Card>
      </div>
      <div style={{ position: "absolute", left: 1300, top: 170, width: 540 }}>
        <Eyebrow at={6} color={C.brand} bg="rgba(11,79,208,0.07)">
          How it works
        </Eyebrow>
        <div style={{ marginTop: 40, display: "grid", gap: 24 }}>
          {steps.map((s, i) => {
            const p = appear(frame, s.at - 2, 16);
            const active = frame >= s.at && (i === steps.length - 1 || frame < steps[i + 1].at);
            return (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", opacity: p * (active ? 1 : 0.5), transform: `translateX(${(1 - p) * 30}px)` }}>
                <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 22, background: active ? C.brand : "transparent", border: `2px solid ${C.brand}`, color: active ? C.cream : C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.15, color: C.ink, paddingTop: 2 }}>{s.t}</div>
              </div>
            );
          })}
        </div>
      </div>
      {!ASSETS.productDemo && <IllustrativeTag dark={false} />}
    </AbsoluteFill>
  );
};

const EDITIONS = [
  { key: "essential", name: "Essential" },
  { key: "elite", name: "Elite" },
  { key: "complete", name: "Complete" },
] as const;

const EditionCard: React.FC<{ name: string; at: number; idx: number; price?: string; priceAt?: number; note?: string; light?: boolean; cover?: string | null }> = ({ name, at, idx, price, priceAt = 0, note, light, cover }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  const pp = price ? pop(frame, priceAt) : 0;
  const lit = price ? appear(frame, priceAt, 10) : 1;
  return (
    <div style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 60}px)` }}>
      <Card dark={!light} style={{ width: 470, height: price ? 520 : 300, padding: 44, boxSizing: "border-box", borderRadius: 26, position: "relative", overflow: "hidden", border: light ? `2px solid ${lit > 0.5 ? C.brand2 : C.line}` : undefined }}>
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 10, background: [C.mint, C.gold, C.brand2][idx] }} />
        {cover && <Img src={staticFile(cover)} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />}
        <div style={{ fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.16em", color: light ? C.muted : "rgba(244,241,233,0.6)", textTransform: "uppercase" }}>Edition {idx + 1}</div>
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em", color: light ? C.ink : C.cream, marginTop: 14 }}>{name}</div>
        {note && <div style={{ fontFamily: FONT.body, fontSize: 30, color: light ? C.ink2 : "rgba(244,241,233,0.75)", marginTop: 14 }}>{note}</div>}
        {price && (
          <div style={{ position: "absolute", left: 44, bottom: 50, transform: `scale(${0.7 + 0.3 * pp})`, transformOrigin: "left bottom", opacity: Math.min(1, pp * 1.5) }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 132, letterSpacing: "-0.04em", color: C.brand }}>{price}</span>
            <div style={{ fontFamily: FONT.body, fontSize: 24, color: C.muted, marginTop: 6 }}>See what's included at ProfitIQS.com</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export const Editions: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const d = L[0].e - L[0].s;
  const ats = [L[0].s + d * 0.42, L[0].s + d * 0.66, L[0].s + d * 0.84];
  const scale = appear(frame, L[1].s, 40);
  return (
    <AbsoluteFill>
      <DarkBg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
        <Eyebrow at={2}>Three editions</Eyebrow>
        <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
          {EDITIONS.map((e, i) => (
            <EditionCard key={e.key} name={e.name} idx={i} at={Math.round(ats[i])} cover={ASSETS.editionCovers[e.key]} />
          ))}
        </div>
        <div style={{ marginTop: 50, width: 1490, position: "relative", height: 60, opacity: scale }}>
          <div style={{ position: "absolute", top: 12, left: 0, height: 6, width: `${scale * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${C.mint}, ${C.gold}, ${C.brand2})` }} />
          <div style={{ position: "absolute", top: 34, left: 0, fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.12em", color: "rgba(244,241,233,0.7)" }}>STARTING POINT</div>
          <div style={{ position: "absolute", top: 34, right: 0, fontFamily: FONT.mono, fontSize: 20, letterSpacing: "0.12em", color: "rgba(244,241,233,0.7)" }}>MORE COMPREHENSIVE</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const NicheSpecific: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const strike = interpolate(frame, [L[1].s + 30, L[1].s + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const win2 = appear(frame, L[2].s, 18);
  return (
    <AbsoluteFill>
      <LightBg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <Kinetic text="Niche-specific, [not generic]." at={L[0].s} size={84} color={C.ink} accent={C.brand2} />
        <div style={{ display: "flex", gap: 70, marginTop: 80, alignItems: "center" }}>
          <Pop at={L[1].s}>
            <Card style={{ width: 640, height: 420, padding: 44, boxSizing: "border-box", position: "relative", opacity: 1 - win2 * 0.35, filter: `grayscale(${strike})` }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.14em", color: C.muted }}>GENERIC SPREADSHEET</div>
              <div style={{ marginTop: 34, display: "grid", gap: 18 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Bars key={i} widths={[120, 120, 120, 120]} color="#dde6f3" />
                ))}
              </div>
              <div style={{ position: "absolute", right: 44, top: 34, fontFamily: FONT.display, fontWeight: 800, fontSize: 80, color: C.muted }}>?</div>
              <div style={{ position: "absolute", left: 30, right: 30, top: "52%", height: 8, borderRadius: 4, background: C.red, transformOrigin: "left", transform: `scaleX(${strike}) rotate(-8deg)` }} />
            </Card>
          </Pop>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 60, color: C.muted, opacity: win2 }}>→</div>
          <div style={{ opacity: win2, transform: `scale(${0.9 + 0.1 * pop(frame, L[2].s)})` }}>
            <Card style={{ width: 640, height: 420, padding: 44, boxSizing: "border-box", border: `3px solid ${C.brand2}` }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.14em", color: C.brand }}>BUILT FOR YOUR INDUSTRY</div>
              <div style={{ marginTop: 30, fontFamily: FONT.display, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: C.ink, letterSpacing: "-0.02em" }}>
                Tools built around <span style={{ color: C.brand2 }}>your industry.</span>
              </div>
              <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 16 }}>
                <LogoMark size={56} />
                <Wordmark size={46} color={C.brand} />
              </div>
            </Card>
          </div>
        </div>
      </AbsoluteFill>
      <IllustrativeTag dark={false} />
    </AbsoluteFill>
  );
};

export { EditionCard, EDITIONS, LineSwap };
