import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Burst, Glitch, LightLeak, Shockwave, SpaceBg, Streaks } from "../fx";
import { ap, at, C, cl, ez, FONT, out, pop, Win } from "../lib";
import { Counter, Eyebrow, Glass, Icon, Pop, Slam } from "../ui";

// show block i while line i is current (crossfade/slide)
export const Beat: React.FC<{ win: Win; i: number; until?: number; children: React.ReactNode; style?: React.CSSProperties; exit?: "up" | "zoom" | "left" }> = ({ win, i, until, children, style, exit = "up" }) => {
  const fr = useCurrentFrame();
  const a = win.lines[i].s - 3;
  const b = until ?? (win.lines[i + 1] ? win.lines[i + 1].s - 4 : win.duration);
  if (fr < a || fr > b + 9) return null;
  const o = out(fr, b, 8);
  const k = 1 - o;
  const tr = exit === "zoom" ? `scale(${1 + k * 0.6})` : exit === "left" ? `translateX(${-k * 300}px)` : `translateY(${-k * 80}px)`;
  return <AbsoluteFill style={{ opacity: o, transform: tr, filter: `blur(${k * 10}px)`, alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>;
};

const Notif: React.FC<{ at: number; amount: number; who: string; y: number }> = ({ at: a, amount, who, y }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, a, 300, 16);
  if (fr < a) return null;
  return (
    <div style={{ position: "absolute", left: 960 - 330, top: y, width: 660, transform: `translateY(${(1 - s) * -160}px) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.5) }}>
      <Glass style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 22 }} glow={C.green}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 36 }}>$</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 22, color: C.muted, letterSpacing: "0.04em" }}>PAYMENT RECEIVED · {who}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.white }}>+${amount.toLocaleString("en-US")}.00</div>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 20, color: C.muted }}>now</div>
      </Glass>
    </div>
  );
};

const Form1099: React.FC<{ at: number; x: number; r: number }> = ({ at: a, x, r }) => {
  const fr = useCurrentFrame();
  const d = fr - a;
  if (d < 0) return null;
  const sc = interpolate(d, [0, 6], [2.4, 1], { ...cl, easing: ez });
  return (
    <div style={{ position: "absolute", left: x, top: 330, width: 360, height: 440, transform: `rotate(${r}deg) scale(${sc})`, opacity: ap(fr, a, 3), background: "#fff", borderRadius: 8, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", padding: 26, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, color: "#b91c1c" }}><span>Form 1099-NEC</span><span>2026</span></div>
      <div style={{ marginTop: 18, height: 2, background: "#fca5a5" }} />
      {["PAYER", "RECIPIENT", "1 Nonemployee compensation", "4 Federal income tax withheld"].map((t, i) => (
        <div key={t} style={{ marginTop: 22, border: "1.5px solid #fca5a5", borderRadius: 4, padding: "8px 10px", fontFamily: FONT.mono, fontSize: 14, color: "#b91c1c" }}>
          {t}
          <div style={{ height: 14, marginTop: 8, width: `${[70, 55, 40, 30][i]}%`, background: "#e5e7eb", borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
};

export const Hook: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const amounts = [2400, 1850, 3200];
  const bars = [
    { t: "Hit your bank", v: 1, c: C.green, at: at(win, 2, 0.05) },
    { t: "− Expenses", v: 0.72, c: C.amber, at: at(win, 2, 0.35) },
    { t: "− Taxes", v: 0.46, c: C.red, at: at(win, 2, 0.68) },
  ];
  return (
    <AbsoluteFill>
      <SpaceBg />
      <Beat win={win} i={0} until={L[1].s - 2} exit="zoom">
        <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="You got paid [three times] this month." at={L[0].s} size={86} />
        </div>
        {amounts.map((a, i) => <Notif key={i} at={at(win, 0, [0.02, 0.36, 0.7][i])} amount={a} who={["CLIENT A", "CLIENT B", "CLIENT C"][i]} y={300 + i * 170} />)}
        <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: FONT.sans, fontSize: 18, letterSpacing: "0.2em", color: C.muted, opacity: 0.8 }}>ILLUSTRATIVE AMOUNTS</div>
      </Beat>
      <Beat win={win} i={1} exit="zoom">
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 210, color: C.white, letterSpacing: "-0.05em", transform: `scale(${1 + 0.06 * ap(fr, L[1].s, 60)})` }}>
          <Counter to={7450} at={L[1].s} len={22} prefix="$" />
        </div>
        <div style={{ marginTop: 10 }}>
          <Slam text="How much is actually [yours?]" at={at(win, 1, 0.55)} size={92} />
        </div>
      </Beat>
      <Beat win={win} i={2}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 70, height: 560 }}>
          {bars.map((b, i) => {
            const g = ap(fr, b.at, 18);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                <div style={{ width: 230, height: 480 * b.v * g, borderRadius: 18, background: `linear-gradient(180deg, ${b.c}, ${b.c}55)`, boxShadow: `0 0 50px ${b.c}66` }} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, color: C.white, opacity: g }}>{b.t}</div>
              </div>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: ap(fr, at(win, 2, 0.86)), transform: `scale(${0.6 + 0.4 * pop(fr, at(win, 2, 0.86))})` }}>
            <div style={{ width: 230, height: 480 * 0.46, borderRadius: 18, border: `5px dashed ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 90, color: C.cyan }}>?</div>
            <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 44, color: C.cyan }}>Yours</div>
          </div>
        </div>
      </Beat>
      <Beat win={win} i={3}>
        <Form1099 at={at(win, 3, 0.2)} x={400} r={-10} />
        <Form1099 at={at(win, 3, 0.45)} x={780} r={3} />
        <Form1099 at={at(win, 3, 0.7)} x={1160} r={12} />
        <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="Every client reports it on a [1099.]" at={L[3].s} size={80} />
        </div>
      </Beat>
      <Beat win={win} i={4}>
        <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center" }}>
          <Slam text="Who's tracking [everything else?]" at={L[4].s} size={84} />
        </div>
        <div style={{ display: "flex", gap: 46, marginTop: 120 }}>
          {[
            ["receipt", "Your expenses", at(win, 4, 0.42), C.amber],
            ["car", "Your miles", at(win, 4, 0.62), C.sky],
            ["alert", "Your tax bill", at(win, 4, 0.86), C.red],
          ].map(([ic, t, a, col]) => (
            <Pop key={t as string} at={a as number}>
              <Glass style={{ width: 420, height: 330, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }} glow={col as string}>
                <Icon name={ic as string} size={110} color={col as string} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.white }}>{t as string}</div>
              </Glass>
            </Pop>
          ))}
        </div>
        <Shockwave at={at(win, 4, 0.86)} x={960 + 466} y={640} color={C.red} />
      </Beat>
      <Beat win={win} i={5} exit="zoom">
        <div style={{ position: "relative", width: 380, height: 380 }}>
          <svg width="380" height="380" viewBox="0 0 380 380" style={{ position: "absolute" }}>
            <circle cx="190" cy="190" r="170" stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none" />
            <circle cx="190" cy="190" r="170" stroke={C.cyan} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={1068} strokeDashoffset={1068 * (1 - ap(fr, L[5].s, 50))} transform="rotate(-90 190 190)" style={{ filter: `drop-shadow(0 0 16px ${C.cyan})` }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 130, color: C.white, lineHeight: 1 }}>5</div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.cyan, letterSpacing: "0.2em" }}>MINUTES</div>
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <Slam text="If you work for yourself — [this is for you.]" at={at(win, 5, 0.1)} size={72} />
        </div>
      </Beat>
      <LightLeak at={L[3].s - 4} />
      <Burst at={at(win, 2, 0.86)} x={960 + 450} y={640} color={C.cyan} />
    </AbsoluteFill>
  );
};

const Receipts: React.FC<{ at: number }> = ({ at: a }) => {
  const fr = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const t0 = a + i * 1.6;
        const s = pop(fr, t0, 260, 14);
        if (fr < t0) return null;
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <div key={i} style={{ position: "absolute", left: 300 + col * 222, top: 250 + row * 230, width: 190, height: 210, borderRadius: 10, background: `linear-gradient(160deg, #fefce8, #e7e5e4)`, transform: `scale(${s}) rotate(${(random(`rr${i}`) - 0.5) * 16}deg)`, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", padding: 16, boxSizing: "border-box" }}>
            {Array.from({ length: 6 }).map((__, j) => <div key={j} style={{ height: 7, width: `${40 + random(`rw${i}${j}`) * 55}%`, background: "#a8a29e", borderRadius: 4, marginBottom: 14 }} />)}
          </div>
        );
      })}
    </>
  );
};

const Calendar: React.FC<{ at: number }> = ({ at: a }) => {
  const fr = useCurrentFrame();
  const months = ["JAN", "FEB", "MAR", "APR"];
  const idx = Math.min(3, Math.floor(Math.max(0, fr - a) / 5));
  const alarm = fr > a + 18 ? Math.sin(fr * 1.4) * 6 : 0;
  return (
    <div style={{ transform: `rotate(${alarm}deg) scale(${pop(fr, a)})`, width: 420, borderRadius: 30, overflow: "hidden", boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 ${fr > a + 18 ? 80 : 0}px ${C.red}` }}>
      <div style={{ background: idx === 3 ? C.red : C.blue, padding: "18px 0", textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, color: "#fff", letterSpacing: "0.1em" }}>{months[idx]}</div>
      <div style={{ background: "#fff", padding: "10px 0 24px", textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 200, color: C.ink, lineHeight: 1 }}>15</div>
    </div>
  );
};

export const Pain: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#7f1d1d" hue2="#1e3a8a" />
      <Glitch at={L[0].s} len={10}>
        <Beat win={win} i={0}>
          <Slam text="Here's how freelance money [usually works.]" at={L[0].s} size={96} />
        </Beat>
      </Glitch>
      <Beat win={win} i={1} exit="left">
        <Pop at={L[1].s}>
          <div style={{ width: 360, height: 680, borderRadius: 56, border: "10px solid #1f2937", background: "linear-gradient(180deg, #0f172a, #111827)", boxShadow: "0 50px 100px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 80, left: 24, right: 24 }}>
              <Glass style={{ padding: 20 }} glow={C.green}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 18, color: C.muted }}>BANK APP · INCOME</div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: C.green }}>+ deposits</div>
              </Glass>
            </div>
          </div>
        </Pop>
        <div style={{ position: "absolute", right: 260, top: 420 }}><Slam text="Income: [one app.]" at={L[1].s + 4} size={80} /></div>
      </Beat>
      <Beat win={win} i={2}>
        <Receipts at={L[2].s} />
        {[0.3, 0.45, 0.6].map((p) => {
          const d = fr - at(win, 2, p);
          return d >= 0 && d < 4 ? <AbsoluteFill key={p} style={{ background: "#fff", opacity: 0.8 * (1 - d / 4) }} /> : null;
        })}
        <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="Receipts: [your camera roll.]" at={L[2].s} size={80} /></div>
      </Beat>
      <Beat win={win} i={3}>
        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          <Pop at={L[3].s}><div style={{ color: C.sky }}><Icon name="head" size={380} /></div></Pop>
          <Pop at={at(win, 3, 0.5)}>
            <Glass style={{ padding: "40px 54px" }} glow={C.amber}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, color: C.muted, letterSpacing: "0.12em" }}>MILES DRIVEN</div>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 130, color: C.amber, filter: `blur(${2 + Math.sin(fr / 3) * 2}px)` }}>???</div>
              <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 40, color: C.white }}>…somewhere in your head</div>
            </Glass>
          </Pop>
        </div>
      </Beat>
      <Beat win={win} i={4}>
        {Array.from({ length: 22 }).map((_, i) => {
          const t0 = at(win, 4, 0.55) + i * 1.2;
          const d = fr - t0;
          if (d < 0) return null;
          const x = 960 + (random(`bx${i}`) - 0.5) * 300 + d * (random(`bv${i}`) - 0.5) * 70;
          const y = 520 - d * 18 + d * d * 0.9;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 150, height: 74, borderRadius: 8, background: "linear-gradient(135deg, #16a34a, #15803d)", border: "3px solid #bbf7d0", transform: `rotate(${d * 9 * (i % 2 ? 1 : -1)}deg)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: "#dcfce7" }}>$</div>;
        })}
        <div style={{ position: "absolute", top: 150, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="Feels like profit." at={L[4].s} size={100} /></div>
        <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="So you [spend it like profit.]" at={at(win, 4, 0.5)} size={84} /></div>
      </Beat>
      <Beat win={win} i={5}>
        <Calendar at={L[5].s} />
        <div style={{ position: "absolute", bottom: 170, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="The quarterly deadline [shows up.]" at={L[5].s + 6} size={76} /></div>
      </Beat>
      <Beat win={win} i={6}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.muted, letterSpacing: "0.2em" }}>TAXES WITHHELD BY AN EMPLOYER</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 280, color: C.red, lineHeight: 1, transform: `scale(${pop(fr, at(win, 6, 0.25), 280, 12)})`, textShadow: `0 0 60px ${C.red}` }}>$0</div>
          <div style={{ marginTop: 20 }}><Slam text="That bill is [all yours.]" at={at(win, 6, 0.62)} size={80} /></div>
        </div>
      </Beat>
      <Beat win={win} i={7}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 120 }}>
          {[
            { t: "Biggest client", v: 1, c: C.sky, lab: "most work" },
            { t: "Best client", v: 0.62, c: C.green, lab: "most profit?" },
          ].map((b, i) => {
            const g = ap(fr, L[7].s + i * 8, 16);
            const swap = ap(fr, at(win, 7, 0.6), 18);
            const v = i === 0 ? 1 - swap * 0.45 : 0.62 + swap * 0.38;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.muted }}>{b.lab}</div>
                <div style={{ width: 280, height: 520 * v * g, borderRadius: 20, background: `linear-gradient(180deg, ${b.c}, ${b.c}44)`, boxShadow: `0 0 50px ${b.c}55` }} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.white }}>{b.t}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: FONT.sans, fontSize: 18, letterSpacing: "0.2em", color: C.muted }}>ILLUSTRATIVE</div>
      </Beat>
      <Beat win={win} i={8}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {[["INV-1042", "DUE", C.sky, 0], ["INV-1043", "30 DAYS LATE", C.amber, 0.4], ["INV-1044", "60 DAYS LATE", C.red, 0.7]].map(([n, st, col, p]) => (
            <Pop key={n as string} at={at(win, 8, p as number)} from={-60}>
              <Glass style={{ width: 900, padding: "26px 34px", display: "flex", alignItems: "center", justifyContent: "space-between" }} glow={col as string}>
                <div style={{ display: "flex", gap: 22, alignItems: "center" }}><Icon name="file" size={52} color={C.white} /><span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 40, color: C.white }}>{n as string}</span></div>
                <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: "#fff", background: col as string, padding: "8px 20px", borderRadius: 10 }}>{st as string}</span>
              </Glass>
            </Pop>
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 150, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="Quietly — a [cash-flow problem.]" at={at(win, 8, 0.65)} size={64} /></div>
      </Beat>
      <Glitch at={at(win, 9, 0.62)} len={9}>
        <Beat win={win} i={9}>
          <Pop at={at(win, 9, 0.1)}>
            <Glass style={{ padding: "34px 44px", width: 760 }} glow={C.sky}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 24, color: C.muted }}>Message from your tax preparer</div>
              <div style={{ marginTop: 10, fontFamily: FONT.sans, fontWeight: 700, fontSize: 56, color: C.white }}>“Send me <span style={{ color: C.cyan }}>everything.</span>”</div>
            </Glass>
          </Pop>
          <div style={{ marginTop: 60 }}><Slam text="And [nothing] is organized." at={at(win, 9, 0.55)} size={84} /></div>
        </Beat>
      </Glitch>
      <Beat win={win} i={10}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 150px)", gap: 18 }}>
          {"JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ").map((m, i) => {
            const on = fr >= L[10].s + i * 2;
            return <div key={m} style={{ height: 120, borderRadius: 16, background: on ? "rgba(96,165,250,0.18)" : "rgba(255,255,255,0.04)", border: `2px solid ${on ? C.sky : "rgba(255,255,255,0.1)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, color: C.white }}>{m}<span style={{ fontSize: 22, color: C.muted }}>busy</span></div>;
          })}
        </div>
        <div style={{ marginTop: 60, display: "flex", alignItems: "baseline", gap: 26 }}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 60, color: C.white }}>Earned this year:</span>
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 110, color: C.red, opacity: ap(fr, at(win, 10, 0.6)) }}>???</span>
        </div>
      </Beat>
      <Streaks at={L[1].s - 4} />
      <Streaks at={L[7].s - 4} dir={-1} />
    </AbsoluteFill>
  );
};

export const Turn: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const strike = ap(fr, at(win, 0, 0.3), 8);
  const conv = ap(fr, at(win, 1, 0.45), 30);
  return (
    <AbsoluteFill>
      <SpaceBg />
      <Beat win={win} i={0}>
        <div style={{ position: "relative", fontFamily: FONT.sans, fontWeight: 800, fontSize: 130, color: C.muted, opacity: 1 - 0.5 * strike }}>
          Discipline
          <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: 16, borderRadius: 8, background: C.red, transformOrigin: "left", transform: `scaleX(${strike}) rotate(-3deg)` }} />
        </div>
        <div style={{ transform: `scale(${pop(fr, at(win, 0, 0.72), 300, 12)})`, fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 200, backgroundImage: `linear-gradient(100deg, ${C.sky}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 40px ${C.cyan}88)` }}>Visibility.</div>
      </Beat>
      <Beat win={win} i={1}>
        {Array.from({ length: 40 }).map((_, i) => {
          const sx = 960 + (random(`dx${i}`) - 0.5) * 1700;
          const sy = 540 + (random(`dy${i}`) - 0.5) * 900;
          const x = sx + (960 - sx) * conv;
          const y = sy + (500 - sy) * conv;
          const lbl = ["$", "mi", "%", "#", "tax"][i % 5];
          return <div key={i} style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 14, background: "rgba(96,165,250,0.18)", border: `2px solid ${C.sky}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, color: C.white, opacity: 1 - conv * 0.9, transform: `scale(${1 - conv * 0.6})` }}>{lbl}</div>;
        })}
        <div style={{ opacity: conv, transform: `scale(${0.5 + 0.5 * conv})`, width: 520, height: 320, borderRadius: 26, border: `4px solid ${C.cyan}`, background: "rgba(34,211,238,0.08)", boxShadow: `0 0 90px ${C.cyan}66`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 52, color: C.white }}>One place.</div>
        <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center" }}><Slam text="You have the data. You need [one place.]" at={L[1].s} size={70} /></div>
      </Beat>
    </AbsoluteFill>
  );
};
