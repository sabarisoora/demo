import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bars, Card, DarkBg, Eyebrow, IllustrativeTag, Kinetic, LightBg, Wordmark, LogoMark } from "../components";
import { appear, C, ease, FONT, pop, sceneWindow } from "../lib";

type Win = ReturnType<typeof sceneWindow>;

// Crossfades between per-line headlines.
export const LineSwap: React.FC<{ win: Win; items: (React.ReactNode | null)[]; style?: React.CSSProperties }> = ({ win, items, style }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {win.lines.map((l, i) => {
        if (!items[i]) return null;
        const next = win.lines.slice(i + 1).find((_, j) => items[i + 1 + j]);
        const end = next ? next.s - 4 : win.duration;
        if (frame < l.s - 6 || frame > end + 10) return null;
        const out = interpolate(frame, [end, end + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: out, transform: `translateY(${(1 - out) * -20}px)`, ...style }}>
            {items[i]}
          </div>
        );
      })}
    </>
  );
};

const FILES = [
  { name: "sales_2024_FINAL_v3.xlsx", x: -560, y: -250, r: -9 },
  { name: "Invoices (unpaid?)", x: 520, y: -270, r: 7 },
  { name: "expenses_misc.csv", x: -640, y: 170, r: 6 },
  { name: "Receipts — shoebox", x: 600, y: 200, r: -6 },
  { name: "monthly_report_old.xlsx", x: -120, y: 320, r: 3 },
  { name: "Notes.txt", x: 180, y: -360, r: -4 },
  { name: "Copy of budget (2).xlsx", x: -300, y: -40, r: 11 },
  { name: "jobs_list.xlsx", x: 330, y: 20, r: -12 },
];

const FileTile: React.FC<{ name: string; dark?: boolean }> = ({ name }) => (
  <Card style={{ width: 330, padding: "18px 20px", borderRadius: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 26, height: 30, borderRadius: 4, background: "#e2edff", border: `2px solid ${C.brand2}` }} />
      <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.ink2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
    </div>
    <div style={{ display: "grid", gap: 10 }}>
      <Bars widths={[90, 60, 110]} />
      <Bars widths={[70, 120, 50]} />
      <Bars widths={[110, 40, 90]} />
    </div>
  </Card>
);

export const Hook: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const [a, b] = win.lines;
  const shrink = appear(frame, b.s - 4, 16);
  return (
    <AbsoluteFill>
      <DarkBg />
      {FILES.map((fl, i) => {
        const p = appear(frame, 6 + i * 5, 30);
        const bob = Math.sin((frame + i * 20) / 22) * 8;
        return (
          <div key={i} style={{ position: "absolute", left: 960 + fl.x * 1.15 - 165, top: 500 + fl.y * 1.1 - 80, opacity: p * 0.16, transform: `rotate(${fl.r}deg) translateY(${bob}px)`, filter: "blur(2px)" }}>
            <FileTile name={fl.name} />
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div style={{ transform: `scale(${1 - shrink * 0.32}) translateY(${shrink * 20}px)`, opacity: 1 - shrink * 0.45 }}>
          <Kinetic text="Running a business is hard enough." at={a.s - 2} size={104} />
        </div>
        {frame >= b.s - 3 && <Kinetic text="Finding your own [numbers] shouldn't be." at={b.s - 2} size={118} />}
        {frame >= b.s && (
          <div style={{ height: 6, width: interpolate(frame, [b.s + 10, b.s + 34], [0, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }), background: C.gold, borderRadius: 6 }} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GRID = (i: number) => ({ x: -540 + (i % 4) * 360, y: -110 + Math.floor(i / 4) * 240, r: 0 });

export const Problem: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const scatter = appear(frame, 0, 26);
  const clear = appear(frame, L[4].s, 22); // "You don't need more confusion."
  const order = appear(frame, L[5].s + 6, 34); // "organize the numbers that matter"
  return (
    <AbsoluteFill>
      <DarkBg />
      {FILES.map((fl, i) => {
        const jitter = (1 - order) * Math.sin((frame + i * 13) / 9) * 6;
        const g = GRID(i);
        const x = interpolate(order, [0, 1], [fl.x, g.x]);
        const y = interpolate(order, [0, 1], [fl.y * 0.78 + 120, g.y + 120]);
        const r = interpolate(order, [0, 1], [fl.r, 0]);
        const op = scatter * (order > 0 ? interpolate(order, [0, 1], [0.25, 1]) : interpolate(clear, [0, 1], [1, 0.25]));
        return (
          <div key={i} style={{ position: "absolute", left: 960 + x - 165, top: 470 + y - 80, opacity: Math.min(1, op), transform: `rotate(${r + jitter * 0.4}deg) translate(${jitter}px, ${(1 - scatter) * 200}px) scale(${0.9 + 0.1 * order})`, filter: `blur(${clear * (1 - order) * 3}px)` }}>
            <FileTile name={order > 0.6 ? ["Records", "Expenses", "Tracking", "Summary", "Records", "Expenses", "Tracking", "Summary"][i] : fl.name} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 240, paddingTop: 30, background: "linear-gradient(180deg, rgba(6,20,48,0.92) 55%, rgba(6,20,48,0))", zIndex: 5 }}>
        <LineSwap
          win={win}
          items={[
            <Kinetic key="0" text="Numbers [scattered] everywhere" at={L[0].s} size={70} />,
            <Kinetic key="1" text="Expenses: [hard to track]" at={L[1].s} size={70} />,
            <Kinetic key="2" text="Information: [too slow to find]" at={L[2].s} size={70} />,
            <Kinetic key="3" text="Confident decisions? [How?]" at={L[3].s} size={70} />,
            <Kinetic key="4" text="You don't need more [confusion]." at={L[4].s} size={70} />,
            <Kinetic key="5" text="Organize the numbers [that matter]." at={L[5].s} size={70} />,
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

const Panel: React.FC<{ at: number; style: React.CSSProperties; children?: React.ReactNode }> = ({ at, style, children }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at);
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 30}px)`, ...style }}>
      <Card style={{ width: "100%", height: "100%", padding: 24, boxSizing: "border-box", borderRadius: 18, boxShadow: "0 10px 30px rgba(11,79,208,0.08)" }}>{children}</Card>
    </div>
  );
};

export const Realize: React.FC<{ win: Win }> = ({ win }) => {
  const frame = useCurrentFrame();
  const L = win.lines;
  const toLogo = appear(frame, L[3].s - 4, 24);
  const chart = appear(frame, L[1].s + 6, 40);
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{ position: "absolute", left: 120, top: 200, width: 560, opacity: 1 - toLogo }}>
        <Eyebrow at={4} color={C.brand} bg="rgba(11,79,208,0.07)">
          Imagine
        </Eyebrow>
        <div style={{ height: 34 }} />
        <div style={{ position: "relative", height: 420 }}>
          <LineSwap
            win={win}
            style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
            items={[
              <Kinetic key="0" text="A more [structured] way to track your business." at={L[0].s} size={66} color={C.ink} accent={C.brand2} align="left" maxWidth={560} />,
              <Kinetic key="1" text="Your numbers, [understood] and organized." at={L[1].s} size={66} color={C.ink} accent={C.brand2} align="left" maxWidth={560} />,
              <Kinetic key="2" text="Designed around the business [you actually run]." at={L[2].s} size={66} color={C.ink} accent={C.brand2} align="left" maxWidth={560} />,
              null,
            ]}
          />
        </div>
      </div>
      <div style={{ position: "absolute", left: 760, top: 150, width: 1040, height: 700, opacity: 1 - toLogo, transform: `scale(${1 - toLogo * 0.08})` }}>
        <Card style={{ position: "absolute", inset: 0, borderRadius: 26, background: "#f6f9fe" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 190, background: C.brand, borderRadius: "26px 0 0 26px", padding: 26, boxSizing: "border-box" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(244,241,233,0.15)", marginBottom: 34 }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 14, width: [110, 80, 120, 90, 70][i], borderRadius: 8, background: i === 0 ? C.gold : "rgba(244,241,233,0.28)", marginBottom: 26, opacity: appear(frame, 8 + i * 4) }} />
          ))}
        </div>
        <Panel at={10} style={{ left: 220, top: 30, width: 250, height: 140 }}>
          <Bars widths={[90]} color="#c5d3ea" />
          <div style={{ height: 20 }} />
          <Bars widths={[160]} color={C.brand2} h={30} />
        </Panel>
        <Panel at={16} style={{ left: 490, top: 30, width: 250, height: 140 }}>
          <Bars widths={[110]} color="#c5d3ea" />
          <div style={{ height: 20 }} />
          <Bars widths={[130]} color={C.gold} h={30} />
        </Panel>
        <Panel at={22} style={{ left: 760, top: 30, width: 250, height: 140 }}>
          <Bars widths={[70]} color="#c5d3ea" />
          <div style={{ height: 20 }} />
          <Bars widths={[150]} color={C.brand2} h={30} />
        </Panel>
        <Panel at={L[1].s} style={{ left: 220, top: 196, width: 520, height: 300 }}>
          <svg width="470" height="250" viewBox="0 0 470 250">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" x2="470" y1={40 + i * 60} y2={40 + i * 60} stroke="#e6edf7" strokeWidth="2" />
            ))}
            <path d="M0 200 C 60 190, 90 150, 140 160 S 230 110, 280 120 S 380 60, 470 50" fill="none" stroke={C.brand2} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - chart} />
          </svg>
        </Panel>
        <Panel at={L[1].s + 10} style={{ left: 760, top: 196, width: 250, height: 300 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <Bars widths={[[160, 120, 140, 100, 150][i]]} color={i === 1 ? C.gold : "#d3deef"} />
            </div>
          ))}
        </Panel>
        <Panel at={L[2].s} style={{ left: 220, top: 522, width: 790, height: 150 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <Bars widths={[180, 120, 160, 140, 90]} color={i === 0 ? "#c5d3ea" : "#dde6f3"} />
            </div>
          ))}
        </Panel>
        <IllustrativeTag dark={false} />
      </div>
      {toLogo > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, opacity: toLogo }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 52, color: C.ink2, letterSpacing: "-0.01em" }}>That's the idea behind</div>
          <div style={{ display: "flex", alignItems: "center", gap: 32, transform: `scale(${0.9 + 0.1 * toLogo})` }}>
            <LogoMark size={150} draw={appear(frame, L[3].s + 6, 26)} />
            <Wordmark size={150} color={C.brand} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
