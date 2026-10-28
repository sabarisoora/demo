import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Callout, Card, COVER, Cover, DarkBg, ELITE_FILE, ESS_FILE, ESS_TABS, Eyebrow, Kinetic, LightBg, Pop, Sheet, Step } from "../components";
import { appear, C, FONT, pop } from "../lib";
import ELITE_TABS from "../elite-tabs.json";
import { at, Win } from "./s1";

const SW = { left: 640, top: 110, w: 1200, h: 790 };
const elite = (n: string) => ELITE_TABS.find((t) => t.includes(n)) ?? n;
const ETABS = ELITE_TABS.slice(0, 12);

const Swap: React.FC<{ from: number; to?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, children, style }) => {
  const frame = useCurrentFrame();
  const i = appear(frame, from, 16);
  const o = to ? 1 - appear(frame, to, 12) : 1;
  if (i <= 0 || o <= 0) return null;
  return <div style={{ position: "absolute", opacity: i * o, transform: `translateY(${(1 - i) * 50}px) scale(${0.97 + 0.03 * i})`, ...style }}>{children}</div>;
};

const Side: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ position: "absolute", left: 90, top: 150, width: 500, display: "grid", gap: 34 }}>{children}</div>;

const Note: React.FC<{ at: number; until?: number; children: React.ReactNode; color?: string }> = ({ at: a, until, children, color = C.brand2 }) => (
  <Callout at={a} until={until}>
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ marginTop: 14, width: 14, height: 14, borderRadius: 7, background: color, flex: "0 0 auto" }} />
      <div style={{ fontSize: 36, fontWeight: 600, color: C.ink }}>{children}</div>
    </div>
  </Callout>
);

export const Setup: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const coverOut = appear(frame, L[1].s - 6, 18);
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - coverOut }}>
        <div style={{ position: "absolute", left: 260, top: 120, transform: `rotate(-4deg) scale(${0.9 + 0.1 * pop(frame, 0)})` }}>
          <Cover niche={COVER.auto} tier="Essential" width={430} />
        </div>
        <div style={{ position: "absolute", left: 900, top: 330, width: 820 }}>
          <Eyebrow at={4} dark={false}>Real product · sample data</Eyebrow>
          <div style={{ height: 28 }} />
          <Kinetic text="The Auto Repair Shop [system.]" at={8} size={84} color={C.ink} accent={C.brand2} align="left" maxWidth={820} />
        </div>
      </div>
      {coverOut > 0 && (
        <>
          <Side>
            <Step n="1" title="Setup" at={L[1].s} />
            <Note at={L[2].s}>Business name, your name, country</Note>
            <Note at={L[3].s}>Currency + tax reserve rate set for the whole system</Note>
          </Side>
          <Swap from={L[1].s - 4} style={{ left: SW.left + 160, top: SW.top }}>
            <Sheet name="setup" file={ESS_FILE} tabs={ESS_TABS} active="SETUP" w={880} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 1] }]} hi={[
              { at: L[2].s, r: [0, 0.135, 1, 0.155], label: "You enter" },
              { at: L[3].s, r: [0, 0.285, 1, 0.09], label: "Set automatically", color: C.green },
              { at: L[3].s + 8, r: [0, 0.825, 1, 0.08], color: C.green },
            ]} />
          </Swap>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Entry: React.FC<{ win: Win }> = ({ win }) => {
  const L = win.lines;
  const cols: [number, number, string][] = [
    [0.509, 0.091, "Parts revenue"],
    [0.6, 0.086, "Parts cost"],
    [0.686, 0.089, "Labor revenue"],
    [0.775, 0.107, "Labor cost"],
  ];
  return (
    <AbsoluteFill>
      <LightBg />
      <Side>
        <Step n="2" title="Enter your work" at={L[0].s} />
        <Note at={L[1].s}>One line per repair order</Note>
        <Note at={L[3].s} color={C.green}>Profit per job calculates itself</Note>
        <Note at={L[4].s}>Expenses, by category</Note>
      </Side>
      <Swap from={0} to={L[4].s - 6} style={{ left: SW.left, top: SW.top }}>
        <Sheet name="ro-entry" file={ESS_FILE} tabs={ESS_TABS} active="REPAIR ORDER ENTRY" w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.34] }, { at: L[2].s, r: [0.42, 0.03, 0.58, 0.22] }, { at: L[3].s + 4, r: [0.5, 0.03, 0.5, 0.2] }]} hi={[
          { at: L[1].s, until: L[2].s, r: [0, 0.071, 1, 0.019], label: "One repair order" },
          ...cols.map(([x, w, label], i) => ({ at: at(win, 2, i * 0.24), until: L[3].s, r: [x, 0.05, w, 0.19] as [number, number, number, number], label: i % 2 === 0 ? label : undefined })),
          { at: L[3].s, r: [0.882, 0.05, 0.118, 0.19], label: "RO profit", color: C.green },
        ]} />
      </Swap>
      <Swap from={L[4].s - 4} style={{ left: SW.left, top: SW.top }}>
        <Sheet name="expense-entry" file={ESS_FILE} tabs={ESS_TABS} active="EXPENSE ENTRY" w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.42] }]} />
      </Swap>
    </AbsoluteFill>
  );
};

export const Dashboard: React.FC<{ win: Win }> = ({ win }) => {
  const L = win.lines;
  const k = (x: number, w: number, y = 0.09): [number, number, number, number] => [x, y, w, 0.09];
  return (
    <AbsoluteFill>
      <LightBg />
      <Side>
        <Step n="3" title="Open the Dashboard" at={L[0].s} />
        <Note at={L[1].s}>Revenue, expenses, net profit, margin</Note>
        <Note at={L[2].s}>Average profit per repair order</Note>
        <Note at={L[3].s}>How much to set aside for tax</Note>
        <Note at={L[5].s} color={C.green}>Plain-words insights</Note>
      </Side>
      <Swap from={0} style={{ left: SW.left, top: SW.top }}>
        <Sheet name="dashboard" file={ESS_FILE} tabs={ESS_TABS} active="DASHBOARD" w={SW.w} h={SW.h} cam={[
          { at: 0, r: [0, 0, 1, 0.7] },
          { at: L[1].s, r: [0, 0.02, 1, 0.3] },
          { at: L[4].s, r: [0, 0.3, 1, 0.38] },
          { at: L[5].s, r: [0, 0.62, 1, 0.34] },
        ]} hi={[
          { at: at(win, 1, 0), until: L[2].s, r: k(0, 0.25), label: "Revenue" },
          { at: at(win, 1, 0.25), until: L[2].s, r: k(0.25, 0.245) },
          { at: at(win, 1, 0.5), until: L[2].s, r: k(0.495, 0.247), label: "Net profit" },
          { at: at(win, 1, 0.75), until: L[2].s, r: k(0.742, 0.258) },
          { at: L[2].s, until: L[4].s, r: k(0.495, 0.247, 0.2), label: "Avg RO profit", color: C.green },
          { at: L[3].s, until: L[4].s, r: k(0, 0.25, 0.2), label: "Tax reserve needed", color: C.amber },
          { at: L[4].s + 10, until: L[5].s, r: [0.5, 0.33, 0.487, 0.33], label: "Revenue vs expenses" },
          { at: L[5].s + 10, r: [0, 0.68, 0.62, 0.16], label: "What this means", color: C.green },
        ]} />
      </Swap>
    </AbsoluteFill>
  );
};

export const Health: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const rows = ["Profit", "Cash", "Tax readiness", "Expenses", "Revenue trend"];
  return (
    <AbsoluteFill>
      <LightBg />
      <Side>
        <Eyebrow at={0} dark={false}>Also in Essential</Eyebrow>
        <Callout at={L[0].s + 6}>
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em" }}>Business Health Snapshot</span>
        </Callout>
        <Note at={L[2].s}>Accountant Export — ready to hand over</Note>
      </Side>
      <Swap from={0} to={L[2].s - 6} style={{ left: SW.left, top: SW.top + 150 }}>
        <Sheet name="health-snapshot" file={ESS_FILE} tabs={ESS_TABS} active="BUSINESS HEALTH SNAPSHOT" w={SW.w} h={520} cam={[{ at: 0, r: [0, 0, 1, 1] }]} hi={[
          ...rows.map((t, i) => ({ at: at(win, 1, i * 0.18), until: at(win, 1, i * 0.18 + 0.18) + 8, r: [0, 0.41 + 0.084 * i, 1, 0.084] as [number, number, number, number], label: t })),
          { at: L[1].e, r: [0, 0.895, 0.6, 0.1], label: "Overall score", color: C.green },
        ]} />
      </Swap>
      <Swap from={L[2].s - 4} to={L[3].s - 4} style={{ left: SW.left + 260, top: SW.top }}>
        <Sheet name="accountant" file={ESS_FILE} tabs={ESS_TABS.slice(4)} active="ACCOUNTANT EXPORT" w={700} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 1] }]} />
      </Swap>
      {frame > L[3].s - 6 && (
        <div style={{ position: "absolute", left: SW.left + 300, top: 120, opacity: appear(frame, L[3].s - 4) }}>
          <div style={{ position: "relative", transform: `rotate(3deg) scale(${0.85 + 0.15 * pop(frame, L[3].s - 4)})` }}>
            <Cover niche={COVER.auto} tier="Essential" width={520} />
            <div style={{ position: "absolute", right: -40, top: -30, width: 130, height: 130, borderRadius: 65, background: C.green, color: "#fff", fontFamily: FONT.display, fontWeight: 800, fontSize: 70, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, L[3].s + 6)})`, boxShadow: "0 20px 40px rgba(16,185,129,0.4)" }}>✓</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Elite: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const introOut = appear(frame, L[1].s - 6, 14);
  return (
    <AbsoluteFill>
      <DarkBg glow />
      {introOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - introOut }}>
          <div style={{ position: "absolute", left: 130, top: 140, transform: `rotate(-4deg) scale(${0.85 + 0.15 * pop(frame, 0)})` }}>
            <Cover niche={COVER.auto} tier="Elite" width={430} />
          </div>
          <div style={{ position: "absolute", left: 700, top: 150, width: 1100 }}>
            <Kinetic text="Elite goes [much deeper.]" at={L[0].s} size={92} align="left" maxWidth={1100} />
          </div>
          <div style={{ position: "absolute", left: 700, top: 330, width: 1120, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {ELITE_TABS.map((t, i) => {
              const p = appear(frame, L[0].s + 12 + i * 2.2, 8);
              return (
                <div key={t} style={{ opacity: p, transform: `scale(${0.6 + 0.4 * p})`, fontFamily: FONT.body, fontWeight: 500, fontSize: 17, color: C.cream, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(147,197,253,0.3)", padding: "6px 12px", borderRadius: 8 }}>
                  {t}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {introOut > 0 && (
        <>
          <div style={{ position: "absolute", left: 90, top: 150, width: 500, display: "grid", gap: 30 }}>
            {[
              [L[1].s, "Executive Command Center", "12 months on one screen"],
              [L[2].s, "Technician Performance", "Productivity + efficiency per tech"],
              [L[3].s, "Comeback Tracker", "Repeat repairs, made visible"],
              [L[4].s, "Cash flow · Receivables · Forecast", "Six months, three scenarios"],
            ].map(([a, t, d], i, arr) => {
              const on = frame >= (a as number) && (i === arr.length - 1 || frame < (arr[i + 1][0] as number));
              return (
                <Callout key={t as string} at={a as number} dark>
                  <div style={{ opacity: on ? 1 : 0.45, borderLeft: `5px solid ${on ? C.sky : "rgba(147,197,253,0.3)"}`, paddingLeft: 22 }}>
                    <div style={{ fontSize: 34, fontWeight: 700, color: C.cream }}>{t}</div>
                    <div style={{ fontSize: 24, fontWeight: 500, color: "rgba(248,250,252,0.7)" }}>{d}</div>
                  </div>
                </Callout>
              );
            })}
          </div>
          <Swap from={L[1].s - 4} to={L[2].s - 4} style={{ left: SW.left, top: SW.top }}>
            <Sheet name="command-center" file={ELITE_FILE} tabs={ETABS} active={elite("Executive Command")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 0.76, 0.32] }, { at: L[1].s + 50, r: [0, 0.32, 0.76, 0.6] }]} />
          </Swap>
          <Swap from={L[2].s - 4} to={L[3].s - 4} style={{ left: SW.left, top: SW.top }}>
            <Sheet name="technicians" file={ELITE_FILE} tabs={ELITE_TABS.slice(4, 14)} active={elite("Technician")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.45] }, { at: L[2].s + 40, r: [0.4, 0, 0.6, 0.4] }]} />
          </Swap>
          <Swap from={L[3].s - 4} to={L[4].s - 4} style={{ left: SW.left, top: SW.top }}>
            <Sheet name="comebacks" file={ELITE_FILE} tabs={ELITE_TABS.slice(8, 18)} active={elite("Comeback")} w={SW.w} h={SW.h} cam={[{ at: 0, r: [0, 0, 1, 0.3] }]} />
          </Swap>
          <Swap from={L[4].s - 4} style={{ left: SW.left, top: SW.top }}>
            <Sheet name="cashflow" file={ELITE_FILE} tabs={ELITE_TABS.slice(14, 22)} active={elite("Cash Flow")} w={SW.w} h={380} cam={[{ at: 0, r: [0, 0, 1, 1] }]} />
          </Swap>
          <Swap from={at(win, 4, 0.45)} style={{ left: SW.left + 120, top: SW.top + 330 }}>
            <Sheet name="forecast" file={ELITE_FILE} tabs={ELITE_TABS.slice(22, 30)} active={elite("Forecasting")} w={1080} h={470} cam={[{ at: 0, r: [0, 0, 1, 0.55] }, { at: at(win, 4, 0.45) + 30, r: [0.15, 0.35, 0.7, 0.65] }]} />
          </Swap>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Leak: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const leaks: [number, string][] = [
    [0, "Low-margin jobs"],
    [3, "Warranty losses"],
    [4, "Inventory waste"],
    [5, "Collection problems"],
  ];
  const scoreIn = appear(frame, L[3].s - 6, 14);
  return (
    <AbsoluteFill>
      <DarkBg hue="#1e1b4b" />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 1 - scoreIn }}>
        <Kinetic text="The Profit Leak [Detector™]" at={L[0].s} size={80} />
      </div>
      {scoreIn < 1 && (
        <div style={{ position: "absolute", left: 160, top: 230, opacity: 1 - scoreIn }}>
          <Pop at={L[0].s + 6}>
            <Sheet name="profit-leak" file={ELITE_FILE} tabs={ELITE_TABS.slice(20, 30)} active={elite("Profit Leak")} w={1600} h={600} cam={[{ at: 0, r: [0, 0, 0.8, 1] }]} hi={[
              ...leaks.map(([row, label], i) => ({ at: at(win, 1, i * 0.22), r: [0, 0.52 + 0.079 * row, 0.66, 0.079] as [number, number, number, number], label: undefined, color: C.red })),
              { at: L[2].s + 6, r: [0.66, 0.6, 0.11, 0.16], label: "HEALTHY", color: C.green },
              { at: at(win, 2, 0.55), r: [0.66, 0.76, 0.11, 0.24], color: C.red },
            ]} />
          </Pop>
          <div style={{ position: "absolute", left: 0, top: 640, display: "flex", gap: 18 }}>
            {leaks.map(([, t], i) => (
              <Pop key={t} at={at(win, 1, i * 0.22)} from={20}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: "#fff", background: "rgba(239,68,68,0.2)", border: "1.5px solid rgba(252,165,165,0.6)", padding: "10px 22px", borderRadius: 999 }}>⚠ {t}</div>
              </Pop>
            ))}
          </div>
        </div>
      )}
      {scoreIn > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: scoreIn }}>
          <div style={{ position: "absolute", left: 120, top: 150 }}>
            <Sheet name="health-score" file={ELITE_FILE} tabs={ELITE_TABS.slice(20, 30)} active={elite("Business Health Score")} w={1120} h={600} cam={[{ at: 0, r: [0, 0, 1, 1] }, { at: L[3].s + 40, r: [0.15, 0.6, 0.6, 0.4] }]} hi={[{ at: L[3].s + 50, r: [0.27, 0.87, 0.33, 0.12], label: "Business Health Score™", color: C.amber }]} />
          </div>
          <div style={{ position: "absolute", left: 1320, top: 230, width: 500 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: C.sky, opacity: appear(frame, L[3].s + 10) }}>ONE SCORE, OUT OF</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 200, color: C.cream, lineHeight: 1, opacity: appear(frame, L[3].s + 14), transform: `scale(${0.7 + 0.3 * pop(frame, L[3].s + 14)})`, transformOrigin: "left" }}>100</div>
            <div style={{ height: 40 }} />
            {frame > L[4].s - 4 && <Kinetic text="Stop guessing. [Know where to start.]" at={L[4].s} size={54} align="left" maxWidth={500} />}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export { Card };
