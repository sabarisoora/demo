import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Card, COVER, Cover, DarkBg, Eyebrow, Kinetic, LightBg, LogoMark, Pop, Tag, Wordmark } from "../components";
import { appear, C, FONT, pop } from "../lib";
import { at, LineSwap, NICHE_FILES, Win } from "./s1";

const NICHE_CARDS = [
  { key: "restaurant", label: "Restaurant", cover: COVER.restaurant, secs: ["Menu Cost Calculator", "Labor Tracker", "Food Waste Tracker", "Prime Cost Center"] },
  { key: "hvac", label: "HVAC", cover: COVER.hvac, secs: ["Work Order Center", "Technician Performance", "Maintenance Agreements", "Service Call Tracker"] },
  { key: "trucking", label: "Trucking", cover: COVER.trucking, secs: ["Load Revenue", "Load Profitability Analyzer", "Fuel Intelligence", "Mileage Tracker"] },
  { key: "airbnb", label: "Airbnb", cover: COVER.airbnb, secs: ["Booking Revenue", "Occupancy Tracker", "ADR RevPAR Analytics", "Property Profitability"] },
];

export const Niche: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const cardsIn = appear(frame, L[2].s - 6, 14);
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - cardsIn }}>
        <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic text="Now here's the [important part.]" at={L[0].s} size={84} color={C.ink} accent={C.brand2} />
        </div>
        <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          {frame > L[1].s - 4 && <Kinetic text="Every industry gets [its own system.]" at={L[1].s} size={64} color={C.ink2} accent={C.brand2} weight={600} />}
        </div>
      </div>
      {cardsIn > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: cardsIn }}>
          <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Eyebrow at={L[2].s - 4} dark={false}>Real sections from each Elite workbook</Eyebrow>
          </div>
          <div style={{ position: "absolute", top: 150, left: 70, right: 70, display: "flex", justifyContent: "space-between" }}>
            {NICHE_CARDS.map((n, i) => {
              const a = L[2 + i].s;
              const on = frame >= a && (i === 3 || frame < L[3 + i].s);
              const done = frame >= L[6].s;
              const s = pop(frame, a);
              return (
                <div key={n.key} style={{ width: 420, opacity: Math.min(1, s * 1.4) * (on || done ? 1 : 0.5), transform: `translateY(${(1 - s) * 80 - (on ? 14 : 0)}px) scale(${on ? 1.03 : 1})` }}>
                  <Card style={{ padding: 26, borderRadius: 24, border: on ? `3px solid ${C.brand2}` : `1px solid ${C.line}` }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Cover niche={n.cover} tier="Elite" width={210} />
                    </div>
                    <div style={{ marginTop: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: C.ink, textAlign: "center" }}>{n.label}</div>
                    <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                      {n.secs.map((t, j) => (
                        <div key={t} style={{ opacity: appear(frame, a + 10 + j * 5), fontFamily: FONT.body, fontWeight: 500, fontSize: 21, color: C.brand, background: C.soft, padding: "7px 12px", borderRadius: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
          {frame > L[6].s - 4 && (
            <div style={{ position: "absolute", top: 820, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <div style={{ transform: `scale(${pop(frame, L[6].s)}) rotate(-2deg)`, background: C.ink, color: "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 40, padding: "14px 36px", borderRadius: 14 }}>
                Not a <span style={{ textDecoration: "line-through", textDecorationColor: C.red, textDecorationThickness: 5, color: "#94a3b8" }}>generic template</span>. <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.sky }}>Your business.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Spoken order -> cover file
const SPOKEN: [number, number][] = [
  // [line, index into NICHE_FILES]
  [0, 2], [0, 9], [0, 14], [0, 8], [0, 18], [0, 4],
  [1, 3], [1, 10], [1, 11], [1, 13],
  [2, 17], [2, 5], [2, 7], [2, 6],
  [3, 15], [3, 16], [3, 1], [3, 20],
  [4, 12], [4, 0], [4, 19],
];

export const Niches: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const counts = [6, 4, 4, 4, 3];
  const W = 186;
  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{ position: "absolute", left: 960, top: 470, transform: "translate(-50%, -50%)", display: "grid", gridTemplateColumns: `repeat(7, ${W}px)`, gap: "22px 26px" }}>
        {SPOKEN.map(([line, idx], k) => {
          const before = SPOKEN.slice(0, k).filter(([l]) => l === line).length;
          const a = at(win, line, before / counts[line]);
          const s = pop(frame, a);
          const lit = frame >= a && frame < a + 26;
          return (
            <div key={idx} style={{ opacity: 0.25 + 0.75 * Math.min(1, s * 1.3), transform: `translateY(${(1 - s) * 40 - (lit ? 12 : 0)}px) scale(${lit ? 1.08 : 1})`, filter: lit ? "drop-shadow(0 0 28px rgba(96,165,250,0.85))" : "none" }}>
              <Cover niche={NICHE_FILES[idx]} tier="Essential" width={W} />
            </div>
          );
        })}
      </div>
      <Tag>21 industries · 63 systems</Tag>
    </AbsoluteFill>
  );
};

const Question: React.FC<{ n: number; q: string; at: number; small?: number }> = ({ n, q, at: a, small = 0 }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, a);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(small, [0, 1], [330, 90]), display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: `scale(${1 - small * 0.42})` }}>
      <div style={{ opacity: appear(frame, a - 4) }}>
        <Eyebrow at={a - 4}>Honest question {n} of 3</Eyebrow>
      </div>
      <div style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 104, color: C.cream, textAlign: "center", maxWidth: 1600, lineHeight: 1.1 }}>
        “{q}”
      </div>
    </div>
  );
};

const Chip: React.FC<{ at: number; children: React.ReactNode; tone?: "blue" | "green" }> = ({ at: a, children, tone = "blue" }) => (
  <Pop at={a} from={24}>
    <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 36, color: "#fff", background: tone === "green" ? "rgba(16,185,129,0.18)" : "rgba(96,165,250,0.16)", border: `1.5px solid ${tone === "green" ? "rgba(110,231,183,0.6)" : "rgba(147,197,253,0.5)"}`, padding: "16px 32px", borderRadius: 999, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ color: tone === "green" ? "#6ee7b7" : C.sky, fontWeight: 800 }}>✓</span>
      {children}
    </div>
  </Pop>
);

export const Obj1: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const small = appear(frame, L[2].s - 6, 20);
  return (
    <AbsoluteFill>
      <DarkBg hue="#172554" />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - appear(frame, L[1].s - 8, 10) }}>
        <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic text="A few [honest questions.]" at={L[0].s} size={96} />
        </div>
      </div>
      {frame > L[1].s - 8 && <Question n={1} q="I'm not an Excel person." at={L[1].s} small={small} />}
      {small > 0 && (
        <>
          <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
            <Chip at={at(win, 2, 0.2)}>You don't need to be</Chip>
            <Chip at={at(win, 2, 0.5)}>No macros</Chip>
            <Chip at={at(win, 2, 0.75)}>Plain formulas</Chip>
          </div>
          <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60 }}>
            {[
              ["docs/field-guide-01.png", "Field Guide", L[3].s],
              ["docs/qs-p3-3.png", "Quick Start", at(win, 3, 0.5)],
            ].map(([src, t, a]) => (
              <Pop key={t as string} at={a as number}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <Img src={staticFile(src as string)} style={{ height: 380, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }} />
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: C.cream }}>{t as string}</div>
                </div>
              </Pop>
            ))}
            <Pop at={L[5].s}>
              <Card dark style={{ width: 520, height: 380, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
                <div style={{ width: 70, height: 70, borderRadius: 14, background: "#1f6e43", color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>X</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: C.cream, lineHeight: 1.15 }}>Desktop Excel</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 30, color: "rgba(248,250,252,0.8)" }}>2019 · 2021 · Microsoft 365</div>
              </Card>
            </Pop>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Obj2: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const small = appear(frame, L[1].s - 6, 20);
  return (
    <AbsoluteFill>
      <DarkBg hue="#172554" />
      <Question n={2} q="Will it run my business for me?" at={L[0].s} small={small} />
      {small > 0 && (
        <>
          <div style={{ position: "absolute", top: 260, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 150, color: C.cream, transform: `scale(${pop(frame, L[1].s)})` }}>
              No<span style={{ color: C.sky }}>.</span>
            </div>
          </div>
          <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Pop at={L[2].s}>
              <Card dark style={{ padding: "38px 60px", maxWidth: 1400, borderLeft: `8px solid ${C.sky}` }}>
                <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 58, color: C.cream, lineHeight: 1.2 }}>“The workbook does the math. You still have to look at it.”</div>
                <div style={{ marginTop: 16, fontFamily: FONT.body, fontWeight: 500, fontSize: 24, color: "rgba(248,250,252,0.65)" }}>— from the Field Guide</div>
              </Card>
            </Pop>
          </div>
          <div style={{ position: "absolute", top: 780, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, alignItems: "center" }}>
            {["Open it weekly", "Enter your numbers", "Look"].map((t, i) => (
              <React.Fragment key={t}>
                <Chip at={at(win, 3, i * 0.22)} tone="green">{t}</Chip>
                {i < 2 && <div style={{ color: C.sky, fontSize: 40, opacity: appear(frame, at(win, 3, i * 0.22 + 0.1)) }}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Obj3: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const small = appear(frame, L[1].s - 6, 20);
  return (
    <AbsoluteFill>
      <DarkBg hue="#172554" />
      <Question n={3} q="Is this another subscription?" at={L[0].s} small={small} />
      {small > 0 && (
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
          {[
            [L[1].s, "One payment", "No subscription"],
            [L[2].s, "Instant delivery", "Files right after checkout"],
          ].map(([a, t, d]) => (
            <Pop key={t as string} at={a as number}>
              <Card dark style={{ width: 470, height: 360, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 60, color: C.cream, letterSpacing: "-0.03em" }}>{t as string}</div>
                <div style={{ marginTop: 12, fontFamily: FONT.body, fontWeight: 500, fontSize: 32, color: "rgba(248,250,252,0.75)" }}>{d as string}</div>
              </Card>
            </Pop>
          ))}
          <Pop at={L[3].s + 6}>
            <div style={{ width: 470, height: 360, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="330" height="360" viewBox="0 0 330 360" style={{ position: "absolute" }}>
                <path d="M165 10 L310 60 V170 C310 260 245 320 165 350 C85 320 20 260 20 170 V60 Z" fill="url(#g)" stroke="#93c5fd" strokeWidth="4" />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2563eb" />
                    <stop offset="1" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: "relative", textAlign: "center", color: "#fff", fontFamily: FONT.display }}>
                <div style={{ fontWeight: 800, fontSize: 110, lineHeight: 1 }}>60</div>
                <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: "0.06em" }}>DAY</div>
                <div style={{ fontWeight: 600, fontSize: 22, marginTop: 6 }}>money-back guarantee</div>
              </div>
            </div>
          </Pop>
        </div>
      )}
    </AbsoluteFill>
  );
};

const TIERS = [
  { t: "Essential" as const, price: "$97", line: 1, pts: ["Core entry & tracking sheets", "Dashboard", "Business Health Snapshot"] },
  { t: "Elite" as const, price: "$197", line: 3, pts: ["Deep KPI Scorecard", "Forecasting & benchmarking", "Business Health Score™"] },
  { t: "Complete" as const, price: "$249", line: 5, pts: ["Essential + Elite workbooks", "Both, in one purchase", "Don't have to choose"] },
];

export const Pricing: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kinetic text="Which edition [fits you?]" at={L[0].s} size={70} color={C.ink} accent={C.brand2} />
      </div>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {TIERS.map((tr, i) => {
          const a = L[tr.line].s;
          const s = pop(frame, a - 2);
          const on = frame >= a && frame < L[tr.line + 2 > 7 ? 7 : tr.line + 2].s;
          return (
            <div key={tr.t} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 70 - (on ? 12 : 0)}px)` }}>
              <Card style={{ width: 520, height: 600, padding: 34, boxSizing: "border-box", borderRadius: 28, border: on ? `3px solid ${C.brand2}` : `1px solid ${C.line}`, position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 26, alignItems: "flex-start" }}>
                  <Cover niche={COVER.auto} tier={tr.t} width={170} />
                  <div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, letterSpacing: "0.16em", color: C.muted }}>EDITION {i + 1}</div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 54, color: C.ink, letterSpacing: "-0.03em" }}>{tr.t}</div>
                    <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 92, color: C.brand2, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 8, transform: `scale(${0.6 + 0.4 * pop(frame, a + 14)})`, transformOrigin: "left", opacity: appear(frame, a + 12) }}>{tr.price}</div>
                  </div>
                </div>
                <div style={{ marginTop: 40, display: "grid", gap: 18 }}>
                  {tr.pts.map((p, j) => (
                    <div key={p} style={{ display: "flex", gap: 14, alignItems: "center", opacity: appear(frame, L[tr.line + 1].s + j * 6) }}>
                      <div style={{ width: 34, height: 34, borderRadius: 17, background: C.soft, color: C.brand2, fontWeight: 800, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display }}>✓</div>
                      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 28, color: C.ink2 }}>{p}</div>
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.brand, background: C.soft, padding: "12px 16px", borderRadius: 12, textAlign: "center", opacity: appear(frame, L[7].s + i * 5) }}>
                  + Field Guide & Quick Start
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Cta: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const url = "profitiqs.com";
  const typed = Math.round(interpolate(frame, [L[1].s + 2, L[1].s + 30], [0, url.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const steps = [
    { a: at(win, 2, 0), t: "Find your industry" },
    { a: at(win, 2, 0.5), t: "Compare the 3 editions" },
    { a: L[3].s, t: "Pick your depth" },
    { a: L[4].s, t: "Start with this month" },
  ];
  const active = steps.reduce((acc, s, i) => (frame >= s.a ? i : acc), -1);
  return (
    <AbsoluteFill>
      <DarkBg glow />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kinetic text="Your [next step.]" at={L[0].s} size={80} />
      </div>
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: appear(frame, L[1].s - 4), transform: `scale(${0.9 + 0.1 * pop(frame, L[1].s - 4)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#fff", borderRadius: 999, padding: "22px 48px", boxShadow: "0 30px 80px rgba(37,99,235,0.45)" }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, border: `3px solid ${C.muted}` }} />
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 76, color: C.ink, letterSpacing: "-0.03em" }}>
            {url.slice(0, typed)}
            <span style={{ opacity: Math.floor(frame / 15) % 2 ? 0 : 1, color: C.brand2 }}>|</span>
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 470, left: 120, right: 120, display: "flex", justifyContent: "space-between" }}>
        {steps.map((s, i) => {
          const p = pop(frame, s.a);
          const on = active === i;
          return (
            <div key={s.t} style={{ width: 380, opacity: Math.min(1, p * 1.4) * (on ? 1 : 0.6), transform: `translateY(${(1 - p) * 40 - (on ? 10 : 0)}px)` }}>
              <Card dark style={{ padding: 34, height: 260, boxSizing: "border-box", border: on ? `2px solid ${C.sky}` : undefined }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, background: on ? C.brand2 : "rgba(96,165,250,0.15)", color: "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ marginTop: 26, fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: C.cream, lineHeight: 1.15 }}>{s.t}</div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CtaButton: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 18, fontFamily: FONT.display, fontWeight: 700, fontSize: size, color: "#fff", background: `linear-gradient(135deg, ${C.brand2}, ${C.brand})`, padding: `${size * 0.55}px ${size * 1.1}px`, borderRadius: 999, boxShadow: "0 18px 50px rgba(37,99,235,0.5)" }}>
    Find Your System <span style={{ fontSize: size * 1.1 }}>→</span>
  </div>
);

export const End: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const ps = appear(frame, L[1].s - 4, 16);
  const btn = pop(frame, L[2].e + 6);
  return (
    <AbsoluteFill>
      <DarkBg glow />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${(0.85 + 0.15 * pop(frame, 0)) * (1 - ps * 0.25)})`, transformOrigin: "center top" }}>
          <LogoMark size={120} draw={appear(frame, 2, 26)} />
          <Wordmark size={130} />
        </div>
        <div style={{ marginTop: 24 - ps * 40 }}>
          <Kinetic text="Business Intelligence for [Better Decisions.]" at={12} size={58} weight={600} />
        </div>
        <div style={{ marginTop: 70, opacity: ps, transform: `translateY(${(1 - ps) * 30}px)`, textAlign: "center" }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 30, letterSpacing: "0.2em", color: C.sky }}>P.S.</div>
          <div style={{ marginTop: 14, fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 52, color: C.cream, maxWidth: 1400, lineHeight: 1.25 }}>
            Your business already produces the numbers.
            <span style={{ opacity: appear(frame, L[2].s) }}> ProfitIQS helps you finally see them.</span>
          </div>
        </div>
        <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 40, opacity: Math.min(1, btn * 1.4), transform: `scale(${0.85 + 0.15 * btn})` }}>
          <CtaButton />
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 40, color: C.cream }}>ProfitIQS.com</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export { LineSwap, Tag };
