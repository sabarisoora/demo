import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Burst, Glitch, LightLeak, Shockwave, SpaceBg, Streaks } from "./fx";
import { ap, at, C, cl, ez, FONT, M, pop, S, V, VIS, Win } from "./lib";
import { Beat, NO_BEAT, Steps, TEMPLATES } from "./T";
import { Counter, Cover, DocPage, Eyebrow, Glass, Icon, LightCtx, LogoMark, PhotoCard, Pop, Slam, Wordmark } from "./ui";
import { LightBg } from "./fx";

const BG: [RegExp, string, string, boolean][] = [
  [/^pain|^cost/, "#7f1d1d", "#1e3a8a", true],
  [/^ess/, "#1e40af", "#155e75", false],
  [/^tax/, "#991b1b", "#1e3a8a", true],
  [/^leak|^risk/, "#7c2d12", "#4338ca", true],
  [/^obj/, "#1e3a8a", "#312e81", false],
  [/^elite|^ops|^money|^grow|^deep/, "#4338ca", "#0e7490", true],
];
const bgFor = (n: string) => BG.find((b) => b[0].test(n)) ?? [null, "#1d4ed8", "#0891b2", true];

type Block = { i: number; j: number; v: V };
export const blocksOf = (win: Win): Block[] => {
  const out: Block[] = [];
  win.lines.forEach((l, k) => {
    const v = VIS[l.idx];
    if (v || !out.length) out.push({ i: k, j: k, v: v ?? { t: "slam", text: l.sub } });
    else out[out.length - 1].j = k;
  });
  return out;
};

const FX: React.FC<{ v: V; at: number }> = ({ v, at: a }) => {
  const fx: string[] = v.fx ? (Array.isArray(v.fx) ? v.fx : [v.fx]) : [];
  return (
    <>
      {fx.includes("shock") && <Shockwave at={a} color={C.cyan} />}
      {fx.includes("shockred") && <Shockwave at={a} color={C.red} />}
      {fx.includes("burst") && <Burst at={a} color={C.cyan} n={30} />}
      {fx.includes("leak") && <LightLeak at={a} />}
      {fx.includes("streaks") && <Streaks at={a - 4} />}
    </>
  );
};

export const Flow: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const [, h1, h2, grid] = bgFor(win.name);
  const bl = blocksOf(win);
  const sheets = bl.map((b, k) => ({ ...b, k })).filter((b) => b.v.t === "sheet");
  const span = (b: Block) => {
    const a = L[b.i].s - 3;
    const e = L[b.j + 1] ? L[b.j + 1].s - 4 : win.duration;
    return [a, e] as const;
  };
  const stepItems = sheets.filter((b) => b.v.label).map((b) => { const [a, e] = span(b); return [a + 3, e, b.v.label as string, b.v.d as string | undefined] as [number, number, string, string?]; });
  const s0 = sheets.length ? span(sheets[0])[0] : 0;
  const s1 = sheets.length ? span(sheets[sheets.length - 1])[1] : 0;
  const light = ((S as any).themes ?? {})[win.name] === "light";
  return (
    <LightCtx.Provider value={light}>
    <AbsoluteFill>
      {light ? <LightBg /> : <SpaceBg hue={h1} hue2={h2} grid={grid} />}
      {bl.map((b, k) => {
        const [a, e] = span(b);
        if (fr < a - 2 || fr > e + 12) return null;
        const T = TEMPLATES[b.v.t];
        if (!T) throw new Error("unknown template " + b.v.t);
        const A = (p: number) => Math.round(L[b.i].s + (L[b.j].e - L[b.i].s) * p);
        const Lf = (q: number, p = 0) => at(win, q, p);
        const props = { win, i: b.i, j: b.j, v: b.v, a, b: e, A, L: Lf, k };
        let node = NO_BEAT.has(b.v.t) ? (fr <= e + 9 ? <T {...props} /> : null) : <Beat a={a} b={e} exit={b.v.exit ?? (k % 3 === 2 ? "zoom" : "up")}><T {...props} /></Beat>;
        if (b.v.t === "qa") node = <AbsoluteFill style={{ opacity: 1 - ap(fr, e, 8) }}>{node}</AbsoluteFill>;
        if (b.v.glitch !== undefined) node = <Glitch at={A(b.v.glitch)} len={9}>{node}</Glitch>;
        return (
          <React.Fragment key={k}>
            {node}
            <FX v={b.v} at={A(b.v.fxAt ?? 0)} />
          </React.Fragment>
        );
      })}
      {stepItems.length > 1 && fr >= s0 - 6 && fr <= s1 + 6 && <AbsoluteFill style={{ opacity: 1 - ap(fr, s1, 8) }}><Steps items={stepItems} /></AbsoluteFill>}
    </AbsoluteFill>
    </LightCtx.Provider>
  );
};

// ---------- reveal ----------
export const Reveal: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const n = L.length;
  const spin = interpolate(fr, [L[0].s, L[0].s + 40], [70, 0], { ...cl, easing: ez });
  const shift = ap(fr, L[Math.min(1, n - 1)].s - 6, 26);
  const chips = S.reveal.chips;
  const chipAt = (k: number) => (n >= 3 ? at(win, Math.min(n - 1, 2 + Math.floor((k * (n - 2)) / chips.length)), ((k * (n - 2)) / chips.length) % 1 * 0.9 + 0.05) : at(win, n - 1, 0.2 + k * 0.18));
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${-shift * 430}px, ${-shift * 250}px) scale(${1 - shift * 0.15})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: ap(fr, L[0].s), transform: `scale(${pop(fr, L[0].s, 220, 14)})` }}>
          <LogoMark size={90} />
          <Wordmark size={96} />
        </div>
        <div style={{ marginTop: 26, maxWidth: 960, textAlign: "center" }}>
          <Slam text={S.reveal.title ?? S.name} at={L[0].s + 10} size={62} maxWidth={960} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 1150, top: 120, width: 700, height: 760, perspective: 2000, opacity: shift }}>
        {(["Essential", "Elite", "Complete"] as const).map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 110 + (i - 1) * 190, top: 60 + Math.abs(i - 1) * 40, transform: `rotateY(${spin * (i - 1) + (i - 1) * -8}deg) rotate(${(i - 1) * 6}deg) translateY(${(1 - pop(fr, L[Math.min(1, n - 1)].s + i * 5, 160, 16)) * 700}px)`, zIndex: i === 1 ? 3 : 1 }}>
            <Cover tier={t} width={320} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 200, top: 680, display: "flex", gap: 18, flexWrap: "wrap", width: 900 }}>
        {chips.map((t, k) => (
          <Pop key={t} at={chipAt(k)} from={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: C.white, background: "rgba(34,197,94,0.14)", border: "1.5px solid rgba(134,239,172,0.6)", padding: "12px 24px", borderRadius: 999 }}>
              <Icon name="check" size={28} color={C.green} />
              {t}
            </div>
          </Pop>
        ))}
      </div>
      {n > 1 && <div style={{ position: "absolute", left: 200, top: 560, opacity: ap(fr, L[1].s) }}><Slam text={S.reveal.made} at={L[1].s} size={52} align="left" maxWidth={900} /></div>}
      <Shockwave at={L[0].s} color={C.cyan} />
      <Burst at={L[0].s} color={C.sky} n={36} r={700} />
      <LightLeak at={L[0].s + 2} color="rgba(103,232,249,0.6)" />
    </AbsoluteFill>
  );
};

// ---------- who it's for ----------
export const Who: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const P = S.who;
  const n = P.length;
  const L = win.lines;
  const startOf = (k: number) => L[Math.min(L.length - 1, k + (L.length > n ? 1 : 0))].s;
  const cols = [C.green, C.sky, C.amber, C.cyan];
  const w = n > 3 ? 418 : 540;
  return (
    <AbsoluteFill>
      <SpaceBg grid={false} />
      <div style={{ position: "absolute", top: 80, width: "100%", display: "flex", justifyContent: "center" }}>
        <Eyebrow at={0}>Who it's for</Eyebrow>
      </div>
      <div style={{ position: "absolute", top: 190, left: 80, right: 80, display: "flex", gap: 28, justifyContent: "center" }}>
        {P.map(([src, t, d], k) => {
          const a = startOf(k);
          const nx = k < n - 1 ? startOf(k + 1) : 1e9;
          const on = fr >= a && fr < nx;
          const all = fr > L[L.length - 1].e;
          return (
            <div key={t} style={{ width: w }}><Pop at={a} from={140}>
              <div style={{ transform: `scale(${on ? 1.04 : 1})`, opacity: on || all ? 1 : 0.5, filter: on || all ? "none" : "grayscale(0.7)" }}>
                <PhotoCard src={src} w={w} h={640} label={t} sub={d} color={on ? cols[k % 4] : "rgba(255,255,255,0.25)"} />
              </div>
            </Pop></div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- guides ----------
const Tag: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at: a, children, color = C.cyan }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, a, 260, 14);
  if (fr < a) return null;
  return <div style={{ display: "inline-block", transform: `scale(${s})`, background: color, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, padding: "10px 22px", borderRadius: 12, boxShadow: `0 12px 30px ${color}66`, whiteSpace: "nowrap" }}>{children}</div>;
};
export const Guide: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const D = M.docs;
  const fe = M.fg.ess, fx = M.fg.elite;
  const q = (k: string, n: number) => `${k}/${D[k][Math.min(n, D[k].length - 1)]}`;
  return (
    <LightCtx.Provider value={true}>
    
    <AbsoluteFill>
      <LightBg />
      <Beat a={L[0].s - 3} b={L[1].s - 4} exit="zoom">
        <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="Never left [guessing.]" at={L[0].s} size={84} />
        </div>
        <div style={{ position: "absolute", top: 270, left: 0, right: 0, height: 560 }}>
          {[["efg-hi/p1.png", -14, -560], [q("eqs", 0), -5, -190], [q("xqs", 0), 5, 190], ["xfg-hi/p1.png", 14, 560]].map(([src, r, x], i) => {
            const s = pop(fr, L[0].s + i * 3, 180, 15);
            return (
              <div key={i} style={{ position: "absolute", left: 960 + (x as number) - 170, top: 20 + Math.abs(i - 1.5) * 26, transform: `translateY(${(1 - s) * 700}px) rotate(${(r as number) * s}deg)` }}>
                <DocPage src={src as string} w={340} />
              </div>
            );
          })}
        </div>
      </Beat>
      <Beat a={L[1].s - 3} b={L[2].s - 4} exit="left">
        <div style={{ position: "absolute", top: 70, width: "100%", display: "flex", justifyContent: "center" }}>
          <Eyebrow at={L[1].s}>Quick Start · every edition</Eyebrow>
        </div>
        <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
          {[[q("eqs", 0), "Quick Start", 0.02], [q("eqs", 2), "First session", 0.42], [q("eqs", 3), "First week", 0.62], [q("eqs", 4), "First 30 days", 0.82]].map(([src, label, p], i) => {
            const a = at(win, 1, p as number);
            const nextA = i < 3 ? at(win, 1, [0.42, 0.62, 0.82][i]) : 1e9;
            const on = fr >= a && fr < nextA;
            const s = pop(fr, a - (i === 0 ? 0 : 6), 200, 16);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 120}px) scale(${on ? 1.06 : 1})` }}>
                <DocPage src={src as string} w={360} style={{ boxShadow: on ? `0 0 0 4px ${C.blue}, 0 0 60px ${C.blue}66` : undefined }} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: on ? C.blue : C.ink }}>{label as string}</div>
              </div>
            );
          })}
        </div>
      </Beat>
      <Beat a={L[2].s - 3} b={L[3].s - 4} exit="zoom">
        {[0, 1].map((row) => {
          const k = row ? "xfg" : "efg";
          const st = Math.floor(D[k].length * (row ? 0.4 : 0.25));
          return (
            <div key={row} style={{ position: "absolute", top: row ? 640 : 40, left: 0, display: "flex", gap: 22, opacity: 0.32, transform: `translateX(${row ? -1400 + (fr - L[2].s) * 6 : -(fr - L[2].s) * 6}px)` }}>
              {Array.from({ length: 16 }).map((_, j) => <DocPage key={j} src={q(k, st + j)} w={260} />)}
            </div>
          );
        })}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(238,244,255,0.9) 30%, rgba(238,244,255,0.45) 80%)" }} />
        <div style={{ position: "absolute", top: 60, width: "100%", display: "flex", justifyContent: "center" }}>
          <Eyebrow at={L[2].s}>Field Guide · screen by screen</Eyebrow>
        </div>
        {[[`efg-hi/p${fe[0]}.png`, -480, -7, 0.1, "Every sheet"], [`efg-hi/p${fe[1]}.png`, 0, 0, 0.3, "Screen by screen"], [`efg-hi/p${fe[2] ?? fe[1]}.png`, 480, 7, 0.55, "Every formula"]].map(([src, x, r, p, label], i) => {
          const a = at(win, 2, p as number);
          const s = pop(fr, a, 170, 16);
          if (fr < a - 1) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 960 + (x as number) - 210, top: 150 + (i === 1 ? -10 : 30), transform: `translateY(${(1 - s) * 600}px) rotate(${r as number}deg) scale(${0.8 + 0.2 * s})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <DocPage src={src as string} w={420} />
              <div style={{ marginTop: -40 }}><Tag at={a + 10} color={[C.blue, C.cyan, "#7c3aed"][i]}>{label as string}</Tag></div>
            </div>
          );
        })}
      </Beat>
      <Beat a={L[3].s - 3} b={L[4] ? L[4].s - 4 : win.duration} exit="zoom">
        {[
          { side: -1, cover: "efg-hi/p1.png", base: "efg", n: S.guide.ess, label: "Essential Field Guide", a: L[3].s },
          { side: 1, cover: "xfg-hi/p1.png", base: "xfg", n: S.guide.elite, label: "Elite Field Guide", a: at(win, 3, 0.2) },
        ].map((g) => {
          const s = pop(fr, g.a, 180, 16);
          const slide = ap(fr, at(win, 3, 0.55), 16);
          const cx = 960 + g.side * (430 + slide * 220);
          return (
            <div key={g.base} style={{ position: "absolute", left: cx - 200, top: 150, opacity: Math.min(1, s * 1.5) * (1 - slide * 0.45), transform: `scale(${(0.7 + 0.3 * s) * (1 - slide * 0.2)})` }}>
              <div style={{ position: "relative", width: 400, height: 566 }}>
                {[5, 4, 3, 2, 1].map((k) => (
                  <div key={k} style={{ position: "absolute", left: k * 12 * s, top: k * -10 * s, transform: `rotate(${k * 1.6 * g.side}deg)` }}>
                    <DocPage src={q(g.base, k * 6)} w={400} />
                  </div>
                ))}
                <div style={{ position: "absolute", left: 0, top: 0 }}><DocPage src={g.cover} w={400} /></div>
              </div>
              <div style={{ marginTop: 34, textAlign: "center" }}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 110, color: C.ink, lineHeight: 1 }}>
                  <Counter to={g.n} at={g.a + 4} len={22} /> <span style={{ fontSize: 46, color: C.blue }}>pages</span>
                </div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.ink2 }}>{g.label}</div>
              </div>
            </div>
          );
        })}
        {fr >= at(win, 3, 0.55) - 1 && (
          <div style={{ position: "absolute", left: 960 - 230, top: 120, transform: `translateY(${(1 - pop(fr, at(win, 3, 0.55), 170, 16)) * 700}px)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <DocPage src={`xfg-hi/p${fx[fx.length - 1]}.png`} w={460} style={{ boxShadow: `0 0 0 4px ${C.green}, 0 0 70px ${C.green}77` }} />
            <div style={{ marginTop: -30 }}><Tag at={at(win, 3, 0.62)} color={C.green}>{S.guide.trouble ?? "When something looks wrong"}</Tag></div>
          </div>
        )}
      </Beat>
      <LightLeak at={L[0].s + 2} color="rgba(167,139,250,0.5)" />
    </AbsoluteFill>
    </LightCtx.Provider>
  );
};

// ---------- offer ----------
export const Offer: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const TIERS = [
    { t: "Essential" as const, price: 97, line: 1, pts: S.tiers[0], sheets: `${S.n_ess} sheets` },
    { t: "Elite" as const, price: 197, line: 2, pts: S.tiers[1], sheets: `${S.n_elite} sheets` },
    { t: "Complete" as const, price: 249, line: 3, pts: S.tiers[2], sheets: `${S.n_ess} + ${S.n_elite} sheets` },
  ];
  const gl = L.length > 4 ? 4 : L.length - 1;
  const guar = L.length > 4 ? ap(fr, L[gl].s - 4, 16) : 0;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <div style={{ position: "absolute", top: 40, width: "100%", display: "flex", justifyContent: "center", opacity: 1 - guar }}>
        <Slam text="Which edition [fits you?]" at={L[0].s} size={72} />
      </div>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, opacity: 1 - guar * 0.75, transform: `scale(${1 - guar * 0.08})` }}>
        {TIERS.map((tr) => {
          const a = L[tr.line].s;
          const on = fr >= a && fr < (L[tr.line + 1] ? L[tr.line + 1].s : 1e9);
          const s = pop(fr, a - 2, 200, 16);
          return (
            <div key={tr.t} style={{ width: 540, height: 760, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 120 - (on ? 18 : 0)}px) scale(${on ? 1.04 : 1})` }}>
              <Glass style={{ width: 540, height: 760, padding: 34, boxSizing: "border-box", position: "relative" }} glow={on ? C.cyan : undefined}>
                <div style={{ display: "flex", gap: 24 }}>
                  <Cover tier={tr.t} width={170} />
                  <div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: C.muted }}>{tr.sheets.toUpperCase()}</div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, color: C.white, letterSpacing: "-0.03em" }}>{tr.t}</div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 104, color: C.cyan, letterSpacing: "-0.05em", lineHeight: 1, opacity: ap(fr, at(win, tr.line, 0.12)), transform: `scale(${0.6 + 0.4 * pop(fr, at(win, tr.line, 0.12), 320, 12)})`, transformOrigin: "left" }}>${tr.price}</div>
                  </div>
                </div>
                <div style={{ marginTop: 40, display: "grid", gap: 20 }}>
                  {tr.pts.map((p, j) => (
                    <div key={p} style={{ display: "flex", gap: 14, alignItems: "center", opacity: ap(fr, at(win, tr.line, 0.25 + j * 0.15)), fontFamily: FONT.sans, fontWeight: 600, fontSize: 29, color: C.white }}>
                      <Icon name="check" size={30} color={C.green} />
                      {p}
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, color: C.sky, textAlign: "center", letterSpacing: "0.08em" }}>ONE-TIME PAYMENT · DESKTOP EXCEL</div>
              </Glass>
            </div>
          );
        })}
      </div>
      {guar > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: guar }}>
          <div style={{ position: "relative", width: 520, height: 580, transform: `scale(${pop(fr, at(win, gl, 0.5), 220, 12)})` }}>
            <svg width="520" height="580" viewBox="0 0 520 580" style={{ position: "absolute", filter: `drop-shadow(0 0 50px ${C.cyan})` }}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#0e7490" /></linearGradient></defs>
              <path d="M260 14 L494 92 V270 C494 418 392 520 260 566 C128 520 26 418 26 270 V92 Z" fill="url(#sg)" stroke="#a5f3fc" strokeWidth="6" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: FONT.sans, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 190, lineHeight: 0.9 }}>60</div>
              <div style={{ fontWeight: 800, fontSize: 44, letterSpacing: "0.12em" }}>DAY</div>
              <div style={{ fontWeight: 700, fontSize: 30, marginTop: 6 }}>money-back guarantee</div>
              <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 30, marginTop: 6, color: "#cffafe" }}>no questions asked</div>
            </div>
          </div>
        </AbsoluteFill>
      )}
      {L.length > 4 && <Burst at={at(win, gl, 0.55)} color={C.cyan} n={40} r={800} />}
      {L.length > 4 && <Shockwave at={at(win, gl, 0.55)} color={C.cyan} />}
    </AbsoluteFill>
  );
};

// ---------- CTA + end ----------
export const Cta: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const bob = Math.sin(fr / 5) * 16;
  const n = L.length;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0891b2" />
      <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center" }}>
        <Slam text="Here's what to do [right now.]" at={L[0].s} size={84} />
      </div>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
        {[["1", "Pick your edition", L[Math.min(1, n - 1)].s], ["2", S.cta[0], at(win, Math.min(2, n - 1), 0.05)], ["3", S.cta[1], at(win, Math.min(2, n - 1), 0.6)]].map(([k, t, a]) => (
          <Pop key={k as string} at={a as number}>
            <Glass style={{ width: 470, height: 230, padding: 34, boxSizing: "border-box" }} glow={C.cyan}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: C.blue, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{k as string}</div>
              <div style={{ marginTop: 22, fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: C.white }}>{t as string}</div>
            </Glass>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ap(fr, at(win, Math.min(1, n - 1), 0.3)) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: "#fff", background: `linear-gradient(135deg, ${C.blue}, #0891b2)`, padding: "26px 56px", borderRadius: 999, boxShadow: `0 20px 60px rgba(37,99,235,0.6), 0 0 ${30 + Math.sin(fr / 4) * 20}px ${C.cyan}` }}>Choose your edition below</div>
        <div style={{ transform: `translateY(${bob}px)`, color: C.cyan }}><Icon name="arrowDown" size={96} /></div>
      </div>
      <div style={{ position: "absolute", bottom: 130, width: "100%", display: "flex", justifyContent: "center" }}>
        {n > 3 && fr > L[3].s - 4 && <Slam text={S.cta[2]} at={L[3].s} size={52} />}
      </div>
    </AbsoluteFill>
  );
};

export const End: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const last = L[L.length - 1];
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${pop(fr, 0, 200, 14)})` }}>
          <LogoMark size={110} />
          <Wordmark size={120} />
        </div>
        <div style={{ marginTop: 40, fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: C.cyan, opacity: ap(fr, L[0].s) }}>P.S.</div>
        <div style={{ marginTop: 16 }}><Slam text={S.end[0]} at={L[0].s + 4} size={66} /></div>
        <div style={{ marginTop: 14 }}>{L.length > 1 && fr > L[1].s - 4 && <Slam text={S.end[1]} at={L[1].s} size={88} />}</div>
        <div style={{ marginTop: 60, display: "flex", gap: 30, alignItems: "center", opacity: ap(fr, last.e + 8) }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: "#fff", background: `linear-gradient(135deg, ${C.blue}, #0891b2)`, padding: "20px 46px", borderRadius: 999 }}>Choose your edition below ↓</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 34, color: C.white }}>ProfitIQS.com</div>
        </div>
        <div style={{ position: "absolute", bottom: 40, fontFamily: FONT.sans, fontSize: 18, color: C.muted, opacity: ap(fr, last.e + 14) }}>Planning tool only — not tax, legal or financial advice. Sample data shown. Requires desktop Microsoft Excel.</div>
      </AbsoluteFill>
      <Shockwave at={at(win, Math.min(1, L.length - 1), 0.08)} color={C.cyan} />
      <LightLeak at={2} />
    </AbsoluteFill>
  );
};
