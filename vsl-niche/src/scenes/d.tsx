import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { LightLeak, SpaceBg } from "../fx";
import { ap, at, C, cl, ez, FONT, pop, Win } from "../lib";
import { Counter, DocPage, Eyebrow, Slam } from "../ui";
import { Beat } from "./a";

// The guides that ship with every edition: real Quick Start and Field Guide pages.
const pad = (n: number) => String(n).padStart(2, "0");
const Tag: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at: a, children, color = C.cyan }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, a, 260, 14);
  if (fr < a) return null;
  return <div style={{ display: "inline-block", transform: `scale(${s})`, background: color, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, padding: "10px 22px", borderRadius: 12, boxShadow: `0 12px 30px ${color}66`, whiteSpace: "nowrap" }}>{children}</div>;
};

export const Guide: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#7c3aed" grid={false} />

      {/* 0 — four real guide covers fan in */}
      <Beat win={win} i={0} until={L[1].s - 4} exit="zoom">
        <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="Never left [guessing.]" at={L[0].s} size={84} />
        </div>
        <div style={{ position: "absolute", top: 270, left: 0, right: 0, height: 560 }}>
          {[
            ["efg-hi/p1.png", -14, -560],
            ["eqs/p-1.png", -5, -190],
            ["xqs/p-1.png", 5, 190],
            ["xfg-hi/p1.png", 14, 560],
          ].map(([src, r, x], i) => {
            const s = pop(fr, L[0].s + i * 3, 180, 15);
            return (
              <div key={src as string} style={{ position: "absolute", left: 960 + (x as number) - 170, top: 20 + Math.abs(i - 1.5) * 26, transform: `translateY(${(1 - s) * 700}px) rotate(${(r as number) * s}deg)` }}>
                <DocPage src={src as string} w={340} />
              </div>
            );
          })}
        </div>
      </Beat>

      {/* 1 — Quick Start: first session, first week, first 30 days */}
      <Beat win={win} i={1} until={L[2].s - 4} exit="left">
        <div style={{ position: "absolute", top: 70, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Eyebrow at={L[1].s}>Quick Start · every edition</Eyebrow>
        </div>
        <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
          {[
            ["eqs/p-1.png", "Quick Start", 0.02],
            ["eqs/p-3.png", "First session", 0.42],
            ["eqs/p-4.png", "First week", 0.62],
            ["eqs/p-5.png", "First 30 days", 0.82],
          ].map(([src, label, p], i) => {
            const a = at(win, 1, p as number);
            const nextA = i < 3 ? at(win, 1, [0.42, 0.62, 0.82][i]) : 1e9;
            const on = fr >= a && fr < nextA;
            const s = pop(fr, a - (i === 0 ? 0 : 6), 200, 16);
            return (
              <div key={src as string} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 120}px) scale(${on ? 1.06 : 1})` }}>
                <DocPage src={src as string} w={360} style={{ boxShadow: on ? `0 0 0 4px ${C.cyan}, 0 0 60px ${C.cyan}88` : undefined }} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: on ? C.cyan : C.white }}>{label as string}</div>
              </div>
            );
          })}
        </div>
      </Beat>

      {/* 2 — Field Guide: every sheet, every formula, screen by screen */}
      <Beat win={win} i={2} until={L[3].s - 4} exit="zoom">
        {[0, 1].map((row) => (
          <div key={row} style={{ position: "absolute", top: row ? 640 : 40, left: 0, display: "flex", gap: 22, opacity: 0.32, transform: `translateX(${row ? -1400 + (fr - L[2].s) * 6 : -(fr - L[2].s) * 6}px)` }}>
            {Array.from({ length: 16 }).map((_, k) => <DocPage key={k} src={`${row ? "xfg" : "efg"}/p-${pad((row ? 23 : 12) + k)}.png`} w={260} />)}
          </div>
        ))}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(5,8,22,0.85) 30%, rgba(5,8,22,0.4) 80%)" }} />
        <div style={{ position: "absolute", top: 60, width: "100%", display: "flex", justifyContent: "center" }}>
          <Eyebrow at={L[2].s}>Field Guide · screen by screen</Eyebrow>
        </div>
        {[
          ["efg-hi/p15.png", -480, -7, 0.1, "Every sheet"],
          ["efg-hi/p26.png", 0, 0, 0.3, "Screen by screen"],
          ["efg-hi/p36.png", 480, 7, 0.55, "Every formula"],
        ].map(([src, x, r, p, label], i) => {
          const a = at(win, 2, p as number);
          const s = pop(fr, a, 170, 16);
          if (fr < a - 1) return null;
          return (
            <div key={src as string} style={{ position: "absolute", left: 960 + (x as number) - 210, top: 150 + (i === 1 ? -10 : 30), transform: `translateY(${(1 - s) * 600}px) rotate(${r as number}deg) scale(${0.8 + 0.2 * s})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <DocPage src={src as string} w={420} />
              <div style={{ marginTop: -40 }}><Tag at={a + 10} color={[C.blue, C.cyan, "#7c3aed"][i]}>{label as string}</Tag></div>
            </div>
          );
        })}
      </Beat>

      {/* 3 — 44 pages / 62 pages, troubleshooting included */}
      <Beat win={win} i={3} exit="zoom">
        {[
          { side: -1, cover: "efg-hi/p1.png", base: "efg", n: 44, label: "Essential Field Guide", a: L[3].s },
          { side: 1, cover: "xfg-hi/p1.png", base: "xfg", n: 62, label: "Elite Field Guide", a: at(win, 3, 0.2) },
        ].map((g) => {
          const s = pop(fr, g.a, 180, 16);
          const slide = ap(fr, at(win, 3, 0.55), 16);
          const cx = 960 + g.side * (430 + slide * 220);
          return (
            <div key={g.base} style={{ position: "absolute", left: cx - 200, top: 150, opacity: Math.min(1, s * 1.5) * (1 - slide * 0.45), transform: `scale(${(0.7 + 0.3 * s) * (1 - slide * 0.2)})` }}>
              <div style={{ position: "relative", width: 400, height: 566 }}>
                {[5, 4, 3, 2, 1].map((k) => (
                  <div key={k} style={{ position: "absolute", left: k * 12 * s, top: k * -10 * s, transform: `rotate(${k * 1.6 * g.side}deg)` }}>
                    <DocPage src={`${g.base}/p-${pad(k * 6)}.png`} w={400} />
                  </div>
                ))}
                <div style={{ position: "absolute", left: 0, top: 0 }}><DocPage src={g.cover} w={400} /></div>
              </div>
              <div style={{ marginTop: 34, textAlign: "center" }}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 110, color: C.white, lineHeight: 1 }}>
                  <Counter to={g.n} at={g.a + 4} len={22} /> <span style={{ fontSize: 46, color: C.cyan }}>pages</span>
                </div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.muted }}>{g.label}</div>
              </div>
            </div>
          );
        })}
        {fr >= at(win, 3, 0.55) - 1 && (
          <div style={{ position: "absolute", left: 960 - 230, top: 120, transform: `translateY(${(1 - pop(fr, at(win, 3, 0.55), 170, 16)) * 700}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <DocPage src="xfg-hi/p53.png" w={460} style={{ boxShadow: `0 0 0 4px ${C.green}, 0 0 70px ${C.green}77` }} />
            <div style={{ marginTop: -30 }}><Tag at={at(win, 3, 0.62)} color={C.green}>When something looks wrong</Tag></div>
          </div>
        )}
      </Beat>
      <LightLeak at={L[0].s + 2} color="rgba(167,139,250,0.5)" />
    </AbsoluteFill>
  );
};

export { cl, ez, interpolate };
