import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { ASSETS } from "../assets";
import { Card, DarkBg, Eyebrow, IllustrativeTag, Kinetic, LightBg, LogoMark, Wordmark } from "../components";
import { appear, C, ease, FONT, pop, sceneWindow } from "../lib";
import { EDITIONS, EditionCard } from "./middle";

type Win = ReturnType<typeof sceneWindow>;

// Only niches named in the approved script. ProfitIQS lists 21; the rest are covered by "and more".
const NICHES: { name: string; line: number; frac: number }[] = [
  { name: "Auto Repair", line: 1, frac: 0.02 },
  { name: "HVAC", line: 1, frac: 0.22 },
  { name: "Plumbing", line: 1, frac: 0.4 },
  { name: "Roofing", line: 1, frac: 0.6 },
  { name: "Landscaping", line: 1, frac: 0.78 },
  { name: "Ecommerce", line: 2, frac: 0.02 },
  { name: "Digital Marketing", line: 2, frac: 0.25 },
  { name: "Restaurants", line: 2, frac: 0.55 },
  { name: "Dental Practices", line: 2, frac: 0.75 },
  { name: "Property Management", line: 3, frac: 0.02 },
  { name: "Trucking", line: 3, frac: 0.45 },
  { name: "Contractors", line: 4, frac: 0.0 },
  { name: "Cleaning Businesses", line: 4, frac: 0.1 },
];

export const Niches: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const count = Math.round(interpolate(frame, [L[0].s + 4, L[0].s + 40], [0, 21], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const lift = appear(frame, L[1].s - 8, 22);
  const at = (n: (typeof NICHES)[number]) => Math.round(L[n.line].s + (L[n.line].e - L[n.line].s) * n.frac);
  const moreAt = Math.round(L[3].s + (L[3].e - L[3].s) * 0.72);
  const pulse = frame > L[4].s ? 1 + Math.sin((frame - L[4].s) / 8) * 0.012 : 1;
  return (
    <AbsoluteFill>
      <DarkBg />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${lift * -330}px) scale(${1 - lift * 0.55})` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 300, color: C.gold, letterSpacing: "-0.05em", lineHeight: 1 }}>{count}</span>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 96, color: C.cream, opacity: appear(frame, L[0].s + 10) }}>business niches</span>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 80, right: 80, top: 300, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 22, transform: `scale(${pulse})` }}>
        {NICHES.map((n, i) => {
          const s = pop(frame, at(n));
          return (
            <div key={n.name} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)` }}>
              <Card dark style={{ padding: "22px 26px", borderRadius: 16, height: 128, boxSizing: "border-box" }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.gold, letterSpacing: "0.1em" }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 31, color: C.cream, marginTop: 10, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{n.name}</div>
              </Card>
            </div>
          );
        })}
        <div style={{ gridColumn: "span 2", opacity: Math.min(1, pop(frame, moreAt) * 1.4), transform: `translateY(${(1 - pop(frame, moreAt)) * 40}px)` }}>
          <div style={{ padding: "26px 28px", borderRadius: 16, height: 128, boxSizing: "border-box", border: `2px dashed ${C.gold}88`, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 36, color: C.gold }}>…and more</div>
            <div style={{ fontFamily: FONT.body, fontSize: 24, color: "rgba(244,241,233,0.75)", marginTop: 6 }}>See all 21 at ProfitIQS.com</div>
          </div>
        </div>
      </div>
      {frame > L[4].s - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 830, display: "flex", justifyContent: "center" }}>
          <Kinetic text="Whatever your niche — [explore the system built for it.]" at={L[4].s + 14} size={52} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Pricing: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const prices = ["$97", "$197", "$249"];
  const priceAt = (i: number) => Math.round(L[1 + i].s + (L[1 + i].e - L[1 + i].s) * 0.55);
  const compare = appear(frame, L[4].s, 20);
  return (
    <AbsoluteFill>
      <LightBg />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <Kinetic text="Choose the edition [that works for you.]" at={L[0].s} size={72} color={C.ink} accent={C.brand2} />
        <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
          {EDITIONS.map((e, i) => (
            <EditionCard key={e.key} light name={e.name} idx={i} at={L[1 + i].s - 2} price={prices[i]} priceAt={priceAt(i)} cover={ASSETS.editionCovers[e.key]} />
          ))}
        </div>
        <div style={{ marginTop: 44, display: "flex", gap: 24, opacity: compare, transform: `translateY(${(1 - compare) * 20}px)` }}>
          {["Review what's included", "Compare the options", "Pick what fits your needs & budget"].map((t, i) => (
            <div key={t} style={{ opacity: appear(frame, L[4].s + i * 14), fontFamily: FONT.body, fontWeight: 600, fontSize: 28, color: C.brand, background: "rgba(11,79,208,0.08)", padding: "12px 24px", borderRadius: 999 }}>
              ✓ {t}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Cta: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const browser = pop(frame, L[1].s - 6);
  const url = "profitiqs.com";
  const typed = Math.round(interpolate(frame, [L[1].s + 4, L[1].s + 34], [0, url.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const steps = [
    { at: L[1].s + 30, t: "Find your industry" },
    { at: L[2].s, t: "Explore your system" },
    { at: L[3].s, t: "Choose your edition" },
  ];
  const active = steps.reduce((a, s, i) => (frame >= s.at ? i : a), -1);
  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center" }}>
        <Kinetic text="A [clearer view] of your numbers." at={L[0].s} size={76} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 250, width: 1060, height: 640, opacity: Math.min(1, browser * 1.4), transform: `translateY(${(1 - browser) * 60}px)` }}>
        <Card style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20 }}>
          <div style={{ height: 64, background: "#e6edf7", display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
            {["#ec835a", "#fab219", "#9fd3f7"].map((c) => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
            ))}
            <div style={{ marginLeft: 20, flex: 1, height: 38, borderRadius: 10, background: "#ffffff", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: FONT.mono, fontSize: 22, color: C.ink }}>
              {url.slice(0, typed)}
              <span style={{ opacity: Math.floor(frame / 15) % 2 ? 0 : 1, color: C.brand }}>|</span>
            </div>
          </div>
          {ASSETS.websiteDemo ? (
            <OffthreadVideo src={staticFile(ASSETS.websiteDemo)} muted style={{ width: "100%", height: 576, objectFit: "cover" }} />
          ) : (
            <div style={{ padding: 40, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {Array.from({ length: 9 }).map((_, i) => {
                const hi = active >= 0 && i === 4;
                return (
                  <div key={i} style={{ height: 140, borderRadius: 14, background: hi ? "rgba(11,79,208,0.1)" : "#eef3fb", border: `2px solid ${hi ? C.brand2 : "transparent"}`, opacity: appear(frame, L[1].s + 20 + i * 2), padding: 20, boxSizing: "border-box" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: hi ? C.brand2 : "#dde6f3" }} />
                    <div style={{ marginTop: 18, width: [140, 110, 160, 120, 150, 100, 130, 170, 115][i], height: 12, borderRadius: 6, background: hi ? C.brand : "#d3deef" }} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        {!ASSETS.websiteDemo && <IllustrativeTag dark={false} />}
      </div>
      <div style={{ position: "absolute", left: 1250, top: 300, width: 560, display: "grid", gap: 30 }}>
        {steps.map((s, i) => {
          const p = appear(frame, s.at - 2);
          const on = active === i;
          return (
            <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 24, opacity: p * (on ? 1 : 0.55), transform: `translateX(${(1 - p) * 30}px)` }}>
              <div style={{ width: 72, height: 72, borderRadius: 36, background: on ? C.gold : "transparent", border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: on ? C.deep : C.gold }}>{i + 1}</div>
              <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 46, color: C.cream }}>{s.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CtaButton: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: size, color: "#ffffff", background: `linear-gradient(135deg, ${C.brand2}, ${C.brand})`, padding: `${size * 0.55}px ${size * 1.1}px`, borderRadius: 999, boxShadow: "0 18px 50px rgba(10,108,240,0.45)" }}>
    Explore Your Business System <span style={{ fontSize: size * 1.1 }}>→</span>
  </div>
);

export const End: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const beats = [
    { at: L[1].s, t: "Find your niche." },
    { at: Math.round(L[1].s + (L[1].e - L[1].s) * 0.5), t: "Explore your system." },
    { at: L[2].s, t: "Decide with greater clarity." },
  ];
  const btn = pop(frame, L[2].e + 6);
  return (
    <AbsoluteFill>
      <DarkBg glow />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${0.85 + 0.15 * pop(frame, 0)})` }}>
          <LogoMark size={130} draw={appear(frame, 2, 26)} />
          <Wordmark size={130} />
        </div>
        <div style={{ marginTop: 28 }}>
          <Kinetic text="Business Intelligence for [Better Decisions.]" at={12} size={58} weight={700} />
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
          {beats.map((b) => (
            <div key={b.t} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 36, color: "rgba(244,241,233,0.88)", opacity: appear(frame, b.at), transform: `translateY(${(1 - appear(frame, b.at)) * 16}px)` }}>
              {b.t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 70, opacity: Math.min(1, btn * 1.4), transform: `scale(${0.85 + 0.15 * btn})` }}>
          <CtaButton />
        </div>
        <div style={{ marginTop: 34, fontFamily: FONT.mono, fontSize: 34, letterSpacing: "0.06em", color: C.cream, opacity: appear(frame, L[2].e + 16) }}>ProfitIQS.com</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export { Eyebrow };
