import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Burst, LightBg, LightLeak, Shockwave, SpaceBg, Streaks } from "../fx";
import { ap, at, C, cl, ez, FONT, pop, Win } from "../lib";
import { Cover, ELITE_FILE, ELITE_TABS, ESS_FILE, ESS_TABS, Eyebrow, FlyIn, Glass, Icon, LogoMark, PhotoCard, Pop, Sheet, SheetTile, Slam, tabsAround, Wordmark } from "../ui";
import { Beat } from "./a";

type R = [number, number, number, number];

export const Reveal: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const spin = interpolate(fr, [L[0].s, L[0].s + 40], [70, 0], { ...cl, easing: ez });
  const shift = ap(fr, L[1].s - 6, 26);
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${-shift * 430}px, ${-shift * 250}px) scale(${1 - shift * 0.15})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: ap(fr, L[0].s), transform: `scale(${pop(fr, L[0].s, 220, 14)})` }}>
          <LogoMark size={90} />
          <Wordmark size={96} />
        </div>
        <div style={{ marginTop: 26, maxWidth: 900, textAlign: "center" }}>
          <Slam text="1099 Contractor [Business Intelligence] System™" at={L[0].s + 10} size={64} maxWidth={900} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 1150, top: 120, width: 700, height: 760, perspective: 2000, opacity: shift }}>
        {(["Essential", "Elite", "Complete"] as const).map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 110 + (i - 1) * 190, top: 60 + Math.abs(i - 1) * 40, transform: `rotateY(${spin * (i - 1) + (i - 1) * -8}deg) rotate(${(i - 1) * 6}deg) translateY(${(1 - pop(fr, L[1].s + i * 5, 160, 16)) * 700}px)`, zIndex: i === 1 ? 3 : 1 }}>
            <Cover tier={t} width={320} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 200, top: 680, display: "flex", gap: 18, flexWrap: "wrap", width: 900 }}>
        {[
          ["Formulas", at(win, 2, 0.08)],
          ["Dashboards", at(win, 2, 0.38)],
          ["Reports", at(win, 2, 0.68)],
          ["Sample data included", at(win, 3, 0.1)],
        ].map(([t, a]) => (
          <Pop key={t as string} at={a as number} from={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: C.white, background: "rgba(34,197,94,0.14)", border: "1.5px solid rgba(134,239,172,0.6)", padding: "12px 24px", borderRadius: 999 }}>
              <Icon name="check" size={28} color={C.green} />
              {t as string}
            </div>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", left: 200, top: 560, opacity: ap(fr, L[1].s) }}>
        <Slam text="Made only for [1099 contractors.]" at={L[1].s} size={52} align="left" maxWidth={900} />
      </div>
      <Shockwave at={L[0].s} color={C.cyan} />
      <Burst at={L[0].s} color={C.sky} n={36} r={700} />
      <LightLeak at={L[0].s + 2} color="rgba(103,232,249,0.6)" />
    </AbsoluteFill>
  );
};

export const Who: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const P = [
    ["firstyear", "First-year freelancer", "figuring out quarterly taxes", C.green, "center"],
    ["consultant", "Solo consultant", "which clients are worth it?", C.sky, "center"],
    ["contractor", "On-the-road contractor", "every mile logged", C.amber, "center"],
    ["homedesk", "Side-hustler", "organized from day one", C.cyan, "center"],
  ];
  return (
    <AbsoluteFill>
      <SpaceBg grid={false} />
      <div style={{ position: "absolute", top: 80, width: "100%", display: "flex", justifyContent: "center" }}>
        <Eyebrow at={0}>Who it's for</Eyebrow>
      </div>
      <div style={{ position: "absolute", top: 190, left: 80, right: 80, display: "flex", gap: 28 }}>
        {P.map(([src, t, d, col, pos], i) => {
          const a = win.lines[i].s;
          const on = fr >= a && (i === 3 || fr < win.lines[i + 1].s);
          const all = fr > win.lines[3].e;
          return (
            <div key={t} style={{ flex: 1 }}><Pop at={a} from={140}>
              <div style={{ transform: `scale(${on ? 1.04 : 1})`, opacity: on || all ? 1 : 0.5, filter: on || all ? "none" : "grayscale(0.7)" }}>
                <PhotoCard src={src} w={418} h={640} label={t} sub={d} color={on ? col : "rgba(255,255,255,0.25)"} pos={pos} />
              </div>
            </Pop></div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// side label list for walkthroughs
const Steps: React.FC<{ items: [number, string, string?][]; dark?: boolean; top?: number }> = ({ items, dark, top = 150 }) => {
  const fr = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 50, top, width: 360, display: "grid", gap: 18 }}>
      {items.map(([a, t, d], i) => {
        const on = fr >= a && (i === items.length - 1 || fr < items[i + 1][0]);
        const p = ap(fr, a - 2, 10);
        return (
          <div key={t} style={{ opacity: p * (on ? 1 : 0.42), transform: `translateX(${(1 - p) * -40 + (on ? 10 : 0)}px)`, borderLeft: `6px solid ${on ? C.cyan : dark ? "rgba(255,255,255,0.15)" : C.line}`, paddingLeft: 20 }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 29, color: dark ? C.white : C.ink, lineHeight: 1.15 }}>{t}</div>
            {d && <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 20, color: dark ? C.muted : C.ink2 }}>{d}</div>}
          </div>
        );
      })}
    </div>
  );
};

const SW = { x: 450, y: 76, w: 1410, h: 870 };
const Swap: React.FC<{ from: number; to?: number; children: React.ReactNode; dir?: "right" | "bottom" | "zoom"; x?: number; y?: number }> = ({ from, to, children, dir = "right", x = SW.x, y = SW.y }) => (
  <FlyIn at={from} until={to} from={dir} style={{ left: x, top: y }}>{children}</FlyIn>
);

export const Ess: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const kpi = (x: number, w: number, row = 0): R => [x, row ? 0.14 : 0.06, w, 0.072];
  const S = (n: string, a: string) => ({ file: ESS_FILE, tabs: tabsAround(ESS_TABS, a), active: a });
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1e40af" hue2="#155e75" grid={false} />
      <Beat win={win} i={0} until={L[1].s - 4}>
        <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
          <Pop at={L[0].s}><Cover tier="Essential" width={380} /></Pop>
          <div>
            <Eyebrow at={L[0].s}>Edition 1</Eyebrow>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: "-0.05em", lineHeight: 1 }}>Essential</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, opacity: ap(fr, at(win, 0, 0.78)), transform: `scale(${0.7 + 0.3 * pop(fr, at(win, 0, 0.78), 300, 12)})`, transformOrigin: "left" }}>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 200, color: C.cyan, lineHeight: 1 }}>11</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 60, color: C.white }}>sheets</span>
            </div>
          </div>
        </div>
      </Beat>
      <Beat win={win} i={1} until={L[2].s - 4} exit="zoom">
        <div style={{ position: "absolute", top: 70, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="You enter the facts. [It does the math.]" at={L[1].s} size={64} />
        </div>
        <div style={{ position: "absolute", top: 200, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 330px)", gap: 26 }}>
            {ESS_TABS.map((t, i) => {
              const name = "ess-" + t.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
              const input = ["SETUP", "CLIENT SETUP", "REVENUE ENTRY", "EXPENSE ENTRY", "MILEAGE LOG"].includes(t);
              const tagAt = input ? at(win, 1, 0.3) : at(win, 1, 0.68);
              const lit = fr >= tagAt;
              return (
                <Pop key={t} at={L[1].s + i * 2} from={40}>
                  <div style={{ transform: `scale(${lit && input && fr < at(win, 1, 0.68) ? 1.05 : 1})` }}>
                    <SheetTile name={name} title={t} w={330} tag={lit ? (t === "START HERE" ? "GUIDE" : input ? "YOU ENTER" : "AUTO") : undefined} tagColor={input ? C.green : t === "START HERE" ? C.amber : C.blue} dimmed={!input && fr >= at(win, 1, 0.3) && fr < at(win, 1, 0.68)} />
                  </div>
                </Pop>
              );
            })}
          </div>
        </div>
      </Beat>
      {fr >= L[2].s - 6 && (
        <>
          <Steps
            dark
            items={[
              [L[2].s, "Client Setup", "set up once"],
              [L[3].s, "Revenue + Expense Entry", "log every payment & expense"],
              [L[4].s, "Mileage Log", "IRS rate built in"],
              [L[5].s, "Client Performance", "who brings in the most"],
              [L[6].s, "Tax & Deductions", "what to set aside"],
              [L[7].s, "Dashboard", "everything, one screen"],
              [L[8].s, "Accountant Export", "clean summary"],
              [L[9].s, "Health Snapshot", "where you stand"],
            ]}
            top={110}
          />
          <Swap from={L[2].s - 4} to={L[3].s - 4}><Sheet name="ess-client-setup" {...S("", "CLIENT SETUP")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.38] }]} /></Swap>
          <Swap from={L[3].s - 4} to={at(win, 3, 0.5)}><Sheet name="ess-revenue-entry" {...S("", "REVENUE ENTRY")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.4] }]} /></Swap>
          <Swap from={at(win, 3, 0.5)} to={L[4].s - 4} dir="bottom"><Sheet name="ess-expense-entry" {...S("", "EXPENSE ENTRY")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.42] }]} /></Swap>
          <Swap from={L[4].s - 4} to={L[5].s - 4}>
            <Sheet name="ess-mileage-log" {...S("", "MILEAGE LOG")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.42] }, { at: at(win, 4, 0.45), r: [0.55, 0.03, 0.45, 0.3] }]} hi={[{ at: at(win, 4, 0.45), r: [0.79, 0.04, 0.1, 0.26], label: "IRS rate", side: "bottom" }, { at: at(win, 4, 0.72), r: [0.89, 0.04, 0.11, 0.26], label: "Deduction value", color: C.green }]} />
          </Swap>
          <Swap from={L[5].s - 4} to={L[6].s - 4}>
            <Sheet name="ess-client-performance" {...S("", "CLIENT PERFORMANCE")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.35] }]} hi={[{ at: at(win, 5, 0.4), r: [0.2, 0.05, 0.35, 0.3], label: "Revenue by client" }, { at: at(win, 5, 0.65), r: [0.8, 0.05, 0.2, 0.3], label: "Rank", color: C.green }]} />
          </Swap>
          <Swap from={L[6].s - 4} to={L[7].s - 4}>
            <Sheet name="ess-tax-deductions" {...S("", "TAX & DEDUCTIONS")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 1] }, { at: at(win, 6, 0.4), r: [0, 0.3, 0.6, 0.3] }]} hi={[{ at: at(win, 6, 0.45), r: [0, 0.425, 0.5, 0.03], label: "Total estimated tax liability", color: C.red }, { at: at(win, 6, 0.62), r: [0, 0.508, 0.5, 0.03], label: "Recommended tax reserve", color: C.green, side: "bottom" }]} />
          </Swap>
          <Swap from={L[7].s - 4} to={L[8].s - 4} dir="zoom">
            <Sheet name="ess-dashboard" {...S("", "DASHBOARD")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.5] }, { at: at(win, 7, 0.3), r: [0, 0.02, 1, 0.22] }]} hi={[
              { at: at(win, 7, 0.36), until: at(win, 7, 0.9), r: kpi(0, 0.25), label: "Revenue" },
              { at: at(win, 7, 0.46), until: at(win, 7, 0.9), r: kpi(0.25, 0.25) },
              { at: at(win, 7, 0.56), until: at(win, 7, 0.9), r: kpi(0.5, 0.25), label: "Net profit", color: C.green },
              { at: at(win, 7, 0.66), until: at(win, 7, 0.9), r: kpi(0.75, 0.25) },
              { at: at(win, 7, 0.76), r: kpi(0, 0.25, 1), label: "Tax liability", color: C.red, side: "bottom" },
              { at: at(win, 7, 0.88), r: kpi(0.5, 0.25, 1), label: "Miles", color: C.amber, side: "bottom" },
            ]} />
          </Swap>
          <Swap from={L[8].s - 4} to={L[9].s - 4}><Sheet name="ess-accountant-export" {...S("", "ACCOUNTANT EXPORT")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 1] }]} /></Swap>
          <Swap from={L[9].s - 4} dir="zoom"><Sheet name="ess-business-health-snapshot" {...S("", "BUSINESS HEALTH SNAPSHOT")} w={SW.w} h={520} cam={[{ at: 0, r: [0, 0, 1, 1] }]} /></Swap>
        </>
      )}
      <Streaks at={L[2].s - 6} />
    </AbsoluteFill>
  );
};

export const Elite: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const ek = (col: number, row: number): R => [col / 6, row ? 0.155 : 0.085, 1 / 6, 0.06];
  const S = (a: string) => ({ file: ELITE_FILE, tabs: tabsAround(ELITE_TABS, a), active: a });
  return (
    <AbsoluteFill>
      <SpaceBg hue="#4338ca" hue2="#0e7490" />
      <Beat win={win} i={0} until={L[1].s - 4}>
        <div style={{ display: "flex", alignItems: "center", gap: 80, opacity: 1 - ap(fr, at(win, 0, 0.5), 8), transform: `scale(${1 - 0.2 * ap(fr, at(win, 0, 0.5), 10)})` }}>
          <Pop at={L[0].s}><Cover tier="Elite" width={360} /></Pop>
          <div style={{ width: 1000 }}>
            <Eyebrow at={L[0].s}>Edition 2</Eyebrow>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: "-0.05em" }}>Elite</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 150, color: C.cyan, transform: `scale(${pop(fr, at(win, 0, 0.36), 300, 12)})`, display: "inline-block" }}>26</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 50, color: C.white }}>sheets</span>
            </div>
          </div>
        </div>
        {fr >= at(win, 0, 0.48) && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 232px)", gap: 14 }}>
              {ELITE_TABS.map((t, i) => {
                const name = "elite-" + t.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
                const a0 = at(win, 0, 0.5) + (i % 7) + Math.floor(i / 7) * 2;
                const s = pop(fr, a0, 220, 16);
                return <div key={t} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 80}px) scale(${0.7 + 0.3 * s}) rotateX(${(1 - s) * 40}deg)` }}><SheetTile name={name} title={t} w={232} /></div>;
              })}
              <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, color: C.cyan, opacity: ap(fr, at(win, 0, 0.8)) }}>26 sheets</div>
            </div>
          </AbsoluteFill>
        )}
      </Beat>
      {fr >= L[1].s - 6 && fr < L[5].s + 6 && (
        <>
          <Steps
            dark
            top={150}
            items={[
              [L[1].s, "Executive Dashboard", "your business on one screen"],
              [L[2].s, "Invoices + Receivables", "who owes you, how long"],
              [L[3].s, "Cash Flow Center", "profit ≠ cash"],
              [L[4].s, "Client Profitability", "every client, ranked"],
            ]}
          />
          <Swap from={L[1].s - 4} to={L[2].s - 4} dir="zoom">
            <Sheet name="elite-02-executive-dashboard" {...S("02 Executive Dashboard")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.7] }, { at: at(win, 1, 0.2), r: [0, 0.03, 1, 0.24] }, { at: at(win, 1, 0.95), r: [0, 0.25, 1, 0.5] }]} hi={[
              { at: at(win, 1, 0.25), until: at(win, 1, 0.95), r: ek(0, 0), label: "Revenue" },
              { at: at(win, 1, 0.37), until: at(win, 1, 0.95), r: ek(2, 0), label: "Profit", color: C.green },
              { at: at(win, 1, 0.49), until: at(win, 1, 0.95), r: ek(0, 1), label: "Cash", side: "bottom" },
              { at: at(win, 1, 0.61), until: at(win, 1, 0.95), r: ek(1, 1), label: "Receivables", side: "bottom" },
              { at: at(win, 1, 0.73), until: at(win, 1, 0.95), r: ek(4, 0), label: "Taxes owed", color: C.red },
              { at: at(win, 1, 0.86), until: at(win, 1, 0.95), r: ek(5, 0), label: "Mileage deduction", color: C.amber },
            ]} />
          </Swap>
          <Swap from={L[2].s - 4} to={at(win, 2, 0.5)}><Sheet name="elite-08-invoice-tracker" {...S("08 Invoice Tracker")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.12] }]} /></Swap>
          <Swap from={at(win, 2, 0.5)} to={L[3].s - 4} dir="bottom">
            <Sheet name="elite-09-accounts-receivable" {...S("09 Accounts Receivable")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0.5, 1, 0.2] }]} hi={[{ at: at(win, 2, 0.62), r: [0.38, 0.54, 0.6, 0.13], label: "AR aging buckets", color: C.amber }]} />
          </Swap>
          <Swap from={L[3].s - 4} to={L[4].s - 4}>
            <Sheet name="elite-10-cash-flow-center" {...S("10 Cash Flow Center")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.55] }, { at: at(win, 3, 0.5), r: [0, 0.55, 1, 0.45] }]} hi={[{ at: at(win, 3, 0.25), until: at(win, 3, 0.5), r: [0.62, 0.1, 0.18, 0.44], label: "Cumulative cash", color: C.green }]} />
          </Swap>
          <Swap from={L[4].s - 4} to={L[5].s - 4} dir="zoom">
            <Sheet name="elite-12-client-profitability" {...S("12 Client Profitability")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.32] }]} hi={[{ at: at(win, 4, 0.35), r: [0.4, 0.065, 0.15, 0.25], label: "Revenue" }, { at: at(win, 4, 0.55), r: [0.79, 0.065, 0.11, 0.25], label: "Profit after costs", color: C.green }, { at: at(win, 4, 0.75), r: [0.9, 0.065, 0.1, 0.25], label: "Rank", color: C.cyan, side: "bottom" }]} />
          </Swap>
        </>
      )}
      {fr >= L[5].s - 6 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 520px)", gap: 30, marginTop: -40 }}>
            {[
              ["elite-05-revenue-center", "05 Revenue Center", 0.02],
              ["elite-06-expense-center", "06 Expense Center", 0.12],
              ["elite-07-mileage-center", "07 Mileage Center", 0.22],
              ["elite-11-monthly-profit-center", "11 Monthly Profit Center", 0.42],
              ["elite-13-service-profitability", "13 Service Profitability", 0.62],
              ["elite-19-insights-center", "19 Insights Center", 0.82],
            ].map(([n, t, p], i) => (
              <div key={n as string} style={{ position: "relative", width: 520, height: 364 }}>
                <FlyIn at={at(win, 5, p as number)} from={i % 2 ? "right" : "left"} style={{ left: 0, top: 0 }}>
                  <SheetTile name={n as string} title={t as string} w={520} />
                </FlyIn>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
      <Shockwave at={at(win, 0, 0.36)} x={1000} y={420} />
      <LightLeak at={L[0].s} />
    </AbsoluteFill>
  );
};

export const Tax: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const S = (a: string) => ({ file: ELITE_FILE, tabs: tabsAround(ELITE_TABS, a), active: a });
  return (
    <AbsoluteFill>
      <SpaceBg hue="#991b1b" hue2="#1e3a8a" />
      <Beat win={win} i={0} until={L[1].s - 4} exit="zoom">
        <Slam text="The part every contractor [dreads.]" at={L[0].s} size={84} />
        <div style={{ marginTop: 30, fontFamily: FONT.sans, fontWeight: 800, fontSize: 260, color: C.red, letterSpacing: "-0.04em", transform: `scale(${pop(fr, at(win, 0, 0.75), 320, 10)})`, textShadow: `0 0 80px ${C.red}` }}>TAXES.</div>
      </Beat>
      {fr >= L[1].s - 6 && (
        <>
          <Steps
            dark
            top={150}
            items={[
              [L[1].s, "Estimated Tax Center", "federal · self-employment · state"],
              [L[2].s, "Quarterly Tax Planner", "4 due dates, tracked"],
              [L[3].s, "Deduction Maximizer", "mapped to Schedule C"],
              [L[4].s, "Year-End Tax Package", "for your CPA"],
            ]}
          />
          <Swap from={L[1].s - 4} to={L[2].s - 4}>
            <Sheet name="elite-20-estimated-tax-center" {...S("20 Estimated Tax Center")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.45] }, { at: at(win, 1, 0.35), r: [0, 0.42, 1, 0.52] }]} hi={[
              { at: at(win, 1, 0.42), until: at(win, 1, 0.85), r: [0, 0.6, 1, 0.042], label: "Self-employment tax" },
              { at: at(win, 1, 0.55), until: at(win, 1, 0.85), r: [0, 0.7, 1, 0.042], label: "Federal" },
              { at: at(win, 1, 0.7), until: at(win, 1, 0.85), r: [0, 0.74, 1, 0.042], label: "State", side: "bottom" },
              { at: at(win, 1, 0.86), r: [0, 0.79, 1, 0.045], label: "Total estimated liability", color: C.red },
              { at: at(win, 1, 0.92), r: [0, 0.872, 1, 0.045], label: "Recommended reserve", color: C.green, side: "bottom" },
            ]} />
          </Swap>
          <Swap from={L[2].s - 4} to={L[3].s - 4} dir="zoom">
            <Sheet name="elite-21-quarterly-tax-planner" {...S("21 Quarterly Tax Planner")} w={SW.w} h={620} cam={[{ at: 0, r: [0, 0, 1, 1] }]} hi={[
              { at: at(win, 2, 0.45), r: [0.32, 0.415, 0.18, 0.085] },
              { at: at(win, 2, 0.56), r: [0.32, 0.5, 0.18, 0.085] },
              { at: at(win, 2, 0.67), r: [0.32, 0.585, 0.18, 0.085] },
              { at: at(win, 2, 0.78), r: [0.32, 0.67, 0.18, 0.085], label: "4 due dates", side: "bottom" },
              { at: at(win, 2, 0.88), r: [0.82, 0.415, 0.18, 0.34], label: "Paid?", color: C.green },
            ]} />
          </Swap>
          <Swap from={L[3].s - 4} to={L[4].s - 4}>
            <Sheet name="elite-22-deduction-maximizer" {...S("22 Deduction Maximizer")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 1] }]} hi={[{ at: at(win, 3, 0.5), r: [0.47, 0.2, 0.33, 0.64], label: "Schedule C lines", color: C.cyan }]} />
          </Swap>
          <Swap from={L[4].s - 4} dir="zoom">
            <Sheet name="elite-23-year-end-tax-package" {...S("23 Year-End Tax Package")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.5] }, { at: at(win, 4, 0.55), r: [0, 0.5, 1, 0.5] }]} hi={[{ at: at(win, 4, 0.2), until: at(win, 4, 0.55), r: [0, 0.07, 0.9, 0.04], label: "Auto-generated for your CPA", color: C.green, side: "bottom" }]} />
          </Swap>
        </>
      )}
      <Shockwave at={at(win, 0, 0.75)} color={C.red} />
      <Burst at={at(win, 0, 0.75)} color={C.red} n={30} />
    </AbsoluteFill>
  );
};

export const Leak: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const S = (a: string) => ({ file: ELITE_FILE, tabs: tabsAround(ELITE_TABS, a), active: a });
  const row = (k: number): R => [0, 0.5 + 0.08 * k, 1, 0.08];
  return (
    <AbsoluteFill>
      <SpaceBg hue="#7c2d12" hue2="#4338ca" />
      <div style={{ position: "absolute", top: 60, width: "100%", display: "flex", justifyContent: "center" }}>
        <Slam text="The Profit Leak [Detector™]" at={L[0].s} size={88} />
      </div>
      {fr < L[3].s + 6 && (
        <FlyIn at={L[0].s + 6} until={L[3].s - 4} from="zoom" style={{ left: 160, top: 220 }}>
          <Sheet name="elite-18-profit-leak-detector" {...S("18 Profit Leak Detector")} w={1600} h={620} cam={[{ at: 0, r: [0, 0, 1, 1] }]} hi={[
            { at: at(win, 1, 0.08), r: row(0), color: C.red },
            { at: at(win, 1, 0.33), r: row(2), color: C.amber },
            { at: at(win, 1, 0.58), r: row(3), color: C.amber },
            { at: at(win, 1, 0.84), r: row(4), color: C.sky },
            { at: at(win, 2, 0.12), r: [0.88, 0.5, 0.12, 0.08], label: "Red", color: C.red, side: "bottom" },
            { at: at(win, 2, 0.3), r: [0.88, 0.66, 0.12, 0.08], label: "Yellow", color: C.amber, side: "bottom" },
            { at: at(win, 2, 0.48), r: [0.88, 0.9, 0.12, 0.08], label: "Green", color: C.green, side: "bottom" },
          ]} />
        </FlyIn>
      )}
      {fr >= L[3].s - 6 && (
        <div style={{ position: "absolute", top: 230, left: 120, right: 120, display: "flex", gap: 26, justifyContent: "center" }}>
          {[
            ["elite-17-forecasting-center", "Forecasting", "17 Forecasting Center", [0, 0, 1, 0.5]],
            ["elite-14-kpi-scorecard", "KPI Scorecard", "14 KPI Scorecard", [0, 0, 1, 1]],
            ["elite-16-financial-goals-center", "Financial Goals", "16 Financial Goals Center", [0, 0, 1, 1]],
            ["elite-15-business-health-score", "Business Health Score™", "15 Business Health Score", [0, 0, 0.45, 1]],
          ].map(([n, t, tab, r], i) => (
            <FlyIn key={n as string} at={at(win, 3, [0.0, 0.18, 0.36, 0.54][i])} from="bottom" style={{ position: "relative" }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, color: C.white, marginBottom: 14, textAlign: "center" }}>{t as string}</div>
              <Sheet name={n as string} file={ELITE_FILE} tabs={[tab as string]} active={tab as string} w={400} h={460} cam={[{ at: 0, r: r as R }]} />
            </FlyIn>
          ))}
        </div>
      )}
      <Shockwave at={at(win, 3, 0.86)} color={C.cyan} />
    </AbsoluteFill>
  );
};

export { LightBg, Streaks };
