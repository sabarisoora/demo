import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Card, COVER, Cover, DarkBg, Eyebrow, Kinetic, LightBg, LogoMark, Pop, Sheet, ESS_FILE, ESS_TABS, Wordmark } from "../components";
import { appear, C, ease, FONT, pop, sceneWindow } from "../lib";

export type Win = ReturnType<typeof sceneWindow>;
export const at = (w: Win, i: number, frac = 0) => Math.round(w.lines[i].s + (w.lines[i].e - w.lines[i].s) * frac);

// Shows items[i] while line i is the latest line with an item; crossfades between them.
export const LineSwap: React.FC<{ win: Win; items: (React.ReactNode | null)[]; style?: React.CSSProperties }> = ({ win, items, style }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {win.lines.map((l, i) => {
        if (!items[i]) return null;
        let nextS: number | null = null;
        for (let j = i + 1; j < win.lines.length; j++) if (items[j]) { nextS = win.lines[j].s; break; }
        const end = nextS !== null ? nextS - 4 : win.duration;
        if (frame < l.s - 6 || frame > end + 10) return null;
        const out = interpolate(frame, [end, end + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: out, transform: `translateY(${(1 - out) * -24}px)`, ...style }}>
            {items[i]}
          </div>
        );
      })}
    </>
  );
};

export const Hook: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const promise = appear(frame, L[4].s - 6, 30);
  return (
    <AbsoluteFill>
      <DarkBg />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - promise }}>
        <LineSwap
          win={win}
          items={[
            <div key="0" style={{ transform: `scale(${1 + 0.04 * appear(frame, L[0].s, 60)})` }}>
              <Kinetic text="Quick [question.]" at={L[0].s} size={150} />
            </div>,
            <Kinetic key="1" text="Which jobs actually [made you money] last month?" at={L[1].s} size={104} maxWidth={1500} />,
            <div key="2" style={{ display: "flex", gap: 90, alignItems: "center" }}>
              <div style={{ position: "relative", opacity: 0.55 + 0.45 * (1 - appear(frame, at(win, 2, 0.35))) }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 130, color: C.cream, letterSpacing: "-0.04em" }}>Revenue</span>
                <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 10, borderRadius: 6, background: C.red, transformOrigin: "left", transform: `scaleX(${appear(frame, at(win, 2, 0.3), 12)})` }} />
              </div>
              <div style={{ opacity: appear(frame, at(win, 2, 0.5)), transform: `scale(${0.6 + 0.4 * pop(frame, at(win, 2, 0.5))})` }}>
                <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 170, color: C.sky }}>Profit.</span>
              </div>
            </div>,
            <Kinetic key="3" text="Had to stop and think? [This is for you.]" at={L[3].s} size={96} />,
            null,
            null,
          ]}
        />
      </div>
      {promise > 0 && (
        <AbsoluteFill style={{ opacity: promise }}>
          <div style={{ position: "absolute", left: 110, top: 230, width: 760 }}>
            <Eyebrow at={L[4].s}>In the next few minutes</Eyebrow>
            <div style={{ height: 30 }} />
            <Kinetic text="See the [real numbers] behind your business." at={L[4].s + 8} size={76} align="left" maxWidth={760} />
            <div style={{ height: 34 }} />
            <Kinetic text="One Excel workbook. Built for [your industry.]" at={L[5].s} size={44} weight={600} align="left" maxWidth={760} color="rgba(248,250,252,0.85)" />
          </div>
          <div style={{ position: "absolute", left: 930, top: 150, transform: `perspective(2400px) rotateY(${-16 + 8 * appear(frame, L[4].s, 120)}deg) rotateX(4deg) translateY(${(1 - pop(frame, L[4].s + 4)) * 400}px)`, transformOrigin: "left center" }}>
            <Sheet name="dashboard" file={ESS_FILE} tabs={ESS_TABS} active="DASHBOARD" w={900} h={720} cam={[{ at: 0, r: [0, 0, 1, 0.68] }, { at: L[5].s, r: [0, 0.03, 1, 0.5] }]} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const CHAOS = [
  { t: "sales_FINAL_v3.xlsx", x: -620, y: -230, r: -9, k: "sheet" },
  { t: "Receipts (shoebox)", x: 560, y: -250, r: 7, k: "receipt" },
  { t: "Bank app", x: -680, y: 150, r: 6, k: "bank" },
  { t: "invoices_2026.xlsx", x: 620, y: 170, r: -6, k: "sheet" },
  { t: "Copy of budget (2).xlsx", x: -170, y: -320, r: 4, k: "sheet" },
  { t: "Receipt #4471", x: 200, y: 290, r: -11, k: "receipt" },
  { t: "jobs_list.xlsx", x: -300, y: 250, r: 10, k: "sheet" },
  { t: "Card statement", x: 330, y: -40, r: -4, k: "bank" },
];

const ChaosTile: React.FC<{ t: string; k: string }> = ({ t, k }) => (
  <Card style={{ width: 300, padding: "16px 18px", borderRadius: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: k === "sheet" ? "#1f6e43" : k === "bank" ? C.brand2 : C.amber, color: "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{k === "sheet" ? "X" : k === "bank" ? "$" : "R"}</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 18, color: C.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
    </div>
    <div style={{ display: "grid", gap: 9 }}>
      {[[80, 60, 100], [110, 40, 70], [60, 120, 40]].map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          {r.map((w, j) => (
            <div key={j} style={{ width: w * 0.8, height: 11, borderRadius: 6, background: "#e2e8f0" }} />
          ))}
        </div>
      ))}
    </div>
  </Card>
);

export const Pain: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const flow = ["Jobs done", "Invoices out", "Money in"];
  const chaosIn = appear(frame, L[3].s - 4, 20);
  const chaosOut = appear(frame, L[5].s - 6, 16);
  const blind = ["Margin by job or client", "Where costs are growing", "How cash is moving", "What needs attention next"];
  const taxIn = appear(frame, L[10].s - 4, 16);
  return (
    <AbsoluteFill>
      <DarkBg hue="#172554" />
      {/* 1. everything feels fine */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - chaosIn }}>
        <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic text="Here's what [usually happens.]" at={L[0].s} size={72} />
        </div>
        <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
          {flow.map((t, i) => (
            <Pop key={t} at={at(win, 1, [0, 0.33, 0.66][i])}>
              <Card dark style={{ padding: "30px 40px", display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, background: C.green, color: "#fff", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display }}>✓</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 44, color: C.cream }}>{t}</div>
              </Card>
            </Pop>
          ))}
        </div>
        <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: appear(frame, L[2].s) }}>
          <Kinetic text="Feels like things are [going fine.]" at={L[2].s} size={58} weight={600} />
        </div>
      </div>
      {/* 2. numbers everywhere */}
      {chaosIn > 0 && chaosOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: chaosIn * (1 - chaosOut) }}>
          {CHAOS.map((c, i) => {
            const p = pop(frame, L[3].s + i * 4);
            const jit = Math.sin((frame + i * 17) / 7) * 5;
            return (
              <div key={i} style={{ position: "absolute", left: 960 + c.x - 150, top: 560 + c.y * 0.85 - 70, transform: `rotate(${c.r + jit * 0.5}deg) scale(${p})`, opacity: Math.min(1, p * 1.3) }}>
                <ChaosTile t={c.t} k={c.k} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 960 - 210, top: 600, zIndex: 3, opacity: appear(frame, at(win, 4, 0.7)), transform: `scale(${pop(frame, at(win, 4, 0.7))})` }}>
            <div style={{ width: 300, height: 140, borderRadius: 70, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 52, color: C.ink, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>…your head</div>
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, paddingTop: 60, display: "flex", justifyContent: "center", background: "linear-gradient(180deg, rgba(11,17,32,0.95) 60%, rgba(11,17,32,0))", zIndex: 5 }}>
            <Kinetic text="Your numbers [live everywhere.]" at={L[3].s} size={66} />
          </div>
        </div>
      )}
      {/* 3. what you can and can't see */}
      {chaosOut > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: chaosOut * (1 - taxIn) }}>
          <div style={{ position: "absolute", left: 160, top: 200 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", color: C.sky, opacity: appear(frame, L[5].s) }}>YOU CAN SEE</div>
            <Pop at={L[5].s + 6}>
              <Card dark style={{ marginTop: 22, padding: "34px 46px", display: "flex", alignItems: "center", gap: 22, width: 470 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: C.cream }}>Revenue</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: C.green }}>✓</div>
              </Card>
            </Pop>
          </div>
          <div style={{ position: "absolute", left: 800, top: 200 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", color: "#fca5a5", opacity: appear(frame, L[6].s) }}>BUT NOT</div>
            <div style={{ marginTop: 22, display: "grid", gap: 18 }}>
              {blind.map((t, i) => {
                const s0 = L[6 + i].s;
                const p = pop(frame, s0);
                const lit = frame >= s0 && (i === 3 || frame < L[7 + i].s);
                return (
                  <div key={t} style={{ opacity: Math.min(1, p * 1.4) * (lit ? 1 : 0.55), transform: `translateX(${(1 - p) * 60}px) scale(${lit ? 1.03 : 1})`, transformOrigin: "left" }}>
                    <Card dark style={{ padding: "22px 34px", display: "flex", alignItems: "center", gap: 22, width: 900, border: lit ? "1.5px solid rgba(252,165,165,0.6)" : undefined }}>
                      <div style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(239,68,68,0.18)", color: "#fca5a5", fontFamily: FONT.display, fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
                      <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 44, color: C.cream, filter: `blur(${lit ? 0 : 1.2}px)` }}>{t}</div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* 4. tax season */}
      {taxIn > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: taxIn }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const t0 = L[11].s + i * 3;
            const y = interpolate(frame, [t0, t0 + 40], [-300, 520 + (i % 4) * 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            return (
              <div key={i} style={{ position: "absolute", left: 200 + ((i * 263) % 1500), top: y, transform: `rotate(${((i * 37) % 50) - 25}deg)`, width: 150, height: 210, background: "#fefce8", borderRadius: 6, boxShadow: "0 12px 30px rgba(0,0,0,0.35)", padding: 14, boxSizing: "border-box" }}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <div key={j} style={{ height: 7, width: `${50 + ((i + j) * 13) % 45}%`, background: "#d6d3d1", borderRadius: 4, marginBottom: 12 }} />
                ))}
              </div>
            );
          })}
          <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `rotate(-6deg) scale(${pop(frame, L[10].s)})`, border: `8px solid ${C.red}`, color: C.red, fontFamily: FONT.display, fontWeight: 800, fontSize: 110, padding: "6px 40px", borderRadius: 16, letterSpacing: "0.04em", background: "rgba(11,17,32,0.6)" }}>TAX SEASON</div>
          </div>
          <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Kinetic text="A week of [digging for receipts.]" at={L[11].s + 10} size={70} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Turn: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const no = ["More software", "Another subscription"];
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {no.map((t, i) => {
          const a = at(win, 0, i * 0.5);
          const strike = appear(frame, a + 14, 12);
          return (
            <Pop key={t} at={a}>
              <div style={{ position: "relative", padding: "24px 44px", borderRadius: 999, background: "#fff", border: `2px solid ${C.line}`, fontFamily: FONT.display, fontWeight: 600, fontSize: 48, color: C.muted, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.25)" }}>
                {t}
                <div style={{ position: "absolute", left: 30, right: 30, top: "50%", height: 6, background: C.red, borderRadius: 3, transformOrigin: "left", transform: `scaleX(${strike})` }} />
              </div>
            </Pop>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Kinetic text="Your own numbers, [organized the way your business works.]" at={L[1].s} size={84} color={C.ink} accent={C.brand2} maxWidth={1500} />
      </div>
    </AbsoluteFill>
  );
};

const NICHE_FILES = [
  "1099_Income_Intelligence_System", "Airbnb_Profit_Intelligence_System", "Auto_Repair_Shop_Profit_Intelligence_System", "Cleaning_Service_Profit_Intelligence_System",
  "Construction_Job_Cost_Intelligence_System", "Dental_Practice_Profit_Intelligence_System", "Digital_Marketing_Agency_Profit_Intelligence_System", "Ecommerce_Profit_Intelligence_System",
  "Electrical_Contractor_Profit_Intelligence_System", "HVAC_Profit_Intelligence_System", "Landscaping_Profit_Intelligence_System", "Lawn_Care_Profit_Intelligence_System",
  "Manufacturing_Profit_Intelligence_System", "Pest_Control_Profit_Intelligence_System", "Plumbing_Contractor_Profit_Intelligence_System", "Property_Management_Profit_Intelligence_System",
  "Rental_Portfolio_Intelligence_System", "Restaurant_Profit_Intelligence_System", "Roofing_Profit_Intelligence_System", "Small_Business_Command_Center", "Trucking_Owner_Operator_Financial_System",
];
export { NICHE_FILES };

export const Intro: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const wall = appear(frame, L[3].s - 6, 26);
  const zoom = appear(frame, L[4].s, 40);
  const tiers = ["Essential", "Elite", "Complete"] as const;
  const W = 150;
  return (
    <AbsoluteFill>
      <DarkBg glow />
      {/* logo + claims */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - wall, transform: `scale(${1 - wall * 0.1})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36, transform: `scale(${0.85 + 0.15 * pop(frame, 0)})` }}>
          <LogoMark size={140} draw={appear(frame, 2, 26)} />
          <div style={{ opacity: appear(frame, 10, 20) }}>
            <Wordmark size={150} />
          </div>
        </div>
        <div style={{ marginTop: 30, display: "flex", gap: 20, opacity: appear(frame, L[1].s) }}>
          <Kinetic text="Business Intelligence Systems™ — [made in Excel.]" at={L[1].s} size={50} weight={600} />
        </div>
        <div style={{ marginTop: 50, display: "flex", alignItems: "baseline", gap: 24, opacity: appear(frame, L[2].s) }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 130, color: C.sky, letterSpacing: "-0.05em" }}>{Math.round(interpolate(frame, [L[2].s, L[2].s + 30], [0, 21], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))}</span>
          <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 52, color: C.cream }}>kinds of business</span>
        </div>
      </AbsoluteFill>
      {/* wall of all 63 real covers */}
      {wall > 0 && (
        <AbsoluteFill style={{ opacity: wall }}>
          <div
            style={{
              position: "absolute",
              left: 960,
              top: 560,
              width: 21 * (W + 18),
              transform: `translate(-50%, -50%) perspective(2600px) rotateX(18deg) rotateZ(-6deg) scale(${0.62 - zoom * 0.04}) translateX(${interpolate(frame, [L[3].s, L[4].e], [140, -80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              display: "grid",
              gridTemplateColumns: `repeat(21, ${W}px)`,
              gap: 18,
            }}
          >
            {tiers.map((t, r) =>
              NICHE_FILES.map((n, c) => {
                const p = appear(frame, L[3].s - 4 + ((c * 3 + r * 7) % 24), 14);
                                return (
                  <div key={t + n} style={{ opacity: p * (1 - zoom * 0.8), transform: `translateY(${(1 - p) * 60}px)` }}>
                    <Cover niche={n} tier={t} width={W} />
                  </div>
                );
              }),
            )}
          </div>
          {zoom > 0 && (
            <div style={{ position: "absolute", left: 960 - 210, top: 120, opacity: zoom, transform: `scale(${0.7 + 0.3 * pop(frame, L[4].s)}) rotate(${-3 + 3 * zoom}deg)`, filter: "drop-shadow(0 0 60px rgba(96,165,250,0.6))" }}>
              <Cover niche={NICHE_FILES[2]} tier="Essential" width={420} />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, top: 80, display: "flex", justifyContent: "center", gap: 60, opacity: 1 - zoom }}>
            {[
              ["63", "systems"],
              ["21", "industries"],
              ["3", "editions each"],
            ].map(([n, t], i) => (
              <Pop key={t} at={L[3].s + i * 10}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, background: "rgba(11,17,32,0.7)", padding: "14px 30px", borderRadius: 18, border: "1px solid rgba(147,197,253,0.25)" }}>
                  <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: C.sky }}>{n}</span>
                  <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 32, color: C.cream }}>{t}</span>
                </div>
              </Pop>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const Plan: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const items = [
    { t: "The workbook", a: at(win, 0, 0.3) },
    { t: "The deeper tools", a: at(win, 0, 0.75) },
    { t: "Your questions", a: at(win, 1, 0.25) },
    { t: "Your edition", a: at(win, 1, 0.75) },
  ];
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Eyebrow at={2} dark={false}>Here's the plan</Eyebrow>
      </div>
      <div style={{ position: "absolute", top: 400, left: 150, right: 150, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", left: 60, right: 60, top: 60, height: 6, background: C.line, borderRadius: 3 }} />
        <div style={{ position: "absolute", left: 60, top: 60, height: 6, borderRadius: 3, background: C.brand2, width: `${interpolate(frame, [items[0].a, items[3].a + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * 1500}px` }} />
        {items.map((it, i) => {
          const s = pop(frame, it.a);
          return (
            <div key={it.t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, width: 300, zIndex: 2 }}>
              <div style={{ width: 126, height: 126, borderRadius: 63, background: frame >= it.a ? C.brand2 : "#fff", border: `4px solid ${frame >= it.a ? C.brand2 : C.line}`, color: frame >= it.a ? "#fff" : C.muted, fontFamily: FONT.display, fontWeight: 700, fontSize: 48, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.8 + 0.2 * s})`, boxShadow: frame >= it.a ? "0 20px 40px rgba(37,99,235,0.35)" : "none" }}>{i + 1}</div>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 38, color: frame >= it.a ? C.ink : C.muted, textAlign: "center" }}>{it.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export { COVER, Img, staticFile };
