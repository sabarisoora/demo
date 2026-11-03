import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Burst, Glitch, LightLeak, Shockwave, Streaks } from "./fx";
import { ap, C, cl, col, ez, findSheet, FONT, M, out, pop, S, tabOf, V, Win } from "./lib";
import { Counter, Cover, Eyebrow, FlyIn, Glass, Icon, LogoMark, PhotoBg, PhotoCard, Pop, Sheet, SheetTile, Slam, tabsAround, useLight } from "./ui";

// A block = one visual spanning lines i..j of a scene window.
export type B = { win: Win; i: number; j: number; v: V; a: number; b: number; A: (p: number) => number; L: (k: number, p?: number) => number };

export const Beat: React.FC<{ a: number; b: number; children: React.ReactNode; style?: React.CSSProperties; exit?: "up" | "zoom" | "left" }> = ({ a, b, children, style, exit = "up" }) => {
  const fr = useCurrentFrame();
  if (fr < a || fr > b + 9) return null;
  const o = out(fr, b, 8);
  const k = 1 - o;
  const tr = exit === "zoom" ? `scale(${1 + k * 0.6})` : exit === "left" ? `translateX(${-k * 300}px)` : `translateY(${-k * 80}px)`;
  return <AbsoluteFill style={{ opacity: o, transform: tr, filter: k > 0.01 ? `blur(${k * 10}px)` : undefined, alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>;
};

const Top: React.FC<{ y?: number; children: React.ReactNode }> = ({ y = 90, children }) => <div style={{ position: "absolute", top: y, width: "100%", display: "flex", justifyContent: "center" }}>{children}</div>;
const Note: React.FC<{ t?: string }> = ({ t }) => (t ? <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: FONT.sans, fontSize: 18, letterSpacing: "0.2em", color: C.muted, opacity: 0.85 }}>{t.toUpperCase()}</div> : null);
const big = (n: number, extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: FONT.sans, fontWeight: 800, fontSize: n, color: C.white, letterSpacing: "-0.04em", lineHeight: 1, ...extra });

// ---------- free templates ----------
const SlamT: React.FC<B> = ({ v, A, a }) => (
  <>
    {v.photo && <PhotoBg src={v.photo} at={a} dim={v.dim ?? 0.66} />}
    {v.eyebrow && <div style={{ marginBottom: 30 }}><Eyebrow at={A(0)} color={col(v.color)}>{v.eyebrow}</Eyebrow></div>}
    <Slam text={v.text} at={A(0)} size={v.size ?? 96} />
    {v.sub && <div style={{ marginTop: 34 }}><Slam text={v.sub} at={A(v.subAt ?? 0.5)} size={(v.size ?? 96) * 0.62} color={C.soft} /></div>}
  </>
);

const Notif: React.FC<{ at: number; head: string; label: string; amount: string; y: number; color: string }> = ({ at: a, head, label, amount, y, color }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, a, 300, 16);
  if (fr < a) return null;
  return (
    <div style={{ position: "absolute", left: 960 - 350, top: y, width: 700, transform: `translateY(${(1 - s) * -160}px) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.5) }}>
      <Glass style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 22 }} glow={color}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 36 }}>$</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 21, color: C.muted, letterSpacing: "0.04em" }}>{head} · {label}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.white }}>{amount}</div>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 20, color: C.muted }}>now</div>
      </Glass>
    </div>
  );
};
const NotifsT: React.FC<B> = ({ v, A, a }) => {
  const items: [string, string][] = v.items;
  return (
    <>
      {v.photo && <PhotoBg src={v.photo} at={a} dim={0.72} />}
      <Top y={80}><Slam text={v.text} at={A(0)} size={v.size ?? 80} /></Top>
      {items.map(([l, amt], k) => <Notif key={k} at={A(0.08 + (k * 0.62) / Math.max(1, items.length - 1))} head={v.head ?? "PAYMENT RECEIVED"} label={l} amount={amt} y={290 + k * 160} color={col(v.color ?? "green")} />)}
      <Note t={v.note ?? "illustrative"} />
    </>
  );
};

const CounterT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  return (
    <>
      {v.eyebrow && <div style={{ marginBottom: 20 }}><Eyebrow at={A(0)} color={col(v.color)}>{v.eyebrow}</Eyebrow></div>}
      <div style={{ ...big(v.bigSize ?? 210), color: col(v.color ?? "white"), transform: `scale(${1 + 0.06 * ap(fr, A(0), 60)})`, textShadow: v.color ? `0 0 70px ${col(v.color)}88` : undefined }}>
        <Counter to={v.to} at={A(0)} len={22} prefix={v.prefix ?? ""} suffix={v.suffix ?? ""} decimals={v.dec ?? 0} />
      </div>
      {v.text && <div style={{ marginTop: 26 }}><Slam text={v.text} at={A(0.45)} size={v.size ?? 84} /></div>}
      <Note t={v.note} />
    </>
  );
};

const BarsT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const bars: [string, number, string][] = v.bars;
  const n = bars.length + (v.q ? 1 : 0);
  const bw = n > 3 ? 210 : 260;
  return (
    <>
      {v.text && <Top y={70}><Slam text={v.text} at={A(0)} size={v.size ?? 70} /></Top>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 70, height: 560, marginTop: v.text ? 120 : 0 }}>
        {bars.map(([t, val, c], k) => {
          const g = ap(fr, A(0.05 + (k * 0.6) / n), 18);
          return (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div style={{ width: bw, height: 460 * val * g, borderRadius: 18, background: `linear-gradient(180deg, ${col(c)}, ${col(c)}55)`, boxShadow: `0 0 50px ${col(c)}66` }} />
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: C.white, opacity: g, textAlign: "center", maxWidth: bw + 40 }}>{t}</div>
            </div>
          );
        })}
        {v.q && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: ap(fr, A(0.8)), transform: `scale(${0.6 + 0.4 * pop(fr, A(0.8))})` }}>
            <div style={{ width: bw, height: 460 * (v.qv ?? 0.4), borderRadius: 18, border: `5px dashed ${C.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 90, color: C.cyan }}>?</div>
            <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 42, color: C.cyan }}>{v.q}</div>
          </div>
        )}
      </div>
      <Note t={v.note ?? "illustrative"} />
    </>
  );
};

const CardsT: React.FC<B> = ({ v, A }) => {
  const cards: [string, string, string?][] = v.cards;
  const w = cards.length > 3 ? 400 : 470;
  return (
    <>
      <Top y={v.y ?? 100}><Slam text={v.text} at={A(0)} size={v.size ?? 80} /></Top>
      <div style={{ display: "flex", gap: 40, marginTop: 150 }}>
        {cards.map(([src, t, c], k) => (
          <Pop key={k} at={A(0.25 + (k * 0.6) / Math.max(1, cards.length))}>
            <PhotoCard src={src} w={w} h={460} label={t} color={col(c ?? ["amber", "sky", "red", "green"][k % 4])} />
          </Pop>
        ))}
      </div>
    </>
  );
};

const RowsT: React.FC<B> = ({ v, A }) => {
  const rows: [string, string, string][] = v.rows;
  return (
    <>
      {v.photo && <PhotoBg src={v.photo} at={A(0) - 3} dim={0.74} />}
      {v.text && <Top y={80}><Slam text={v.text} at={A(0)} size={v.size ?? 72} /></Top>}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: v.text ? 90 : 0 }}>
        {rows.map(([n, st, c], k) => (
          <Pop key={k} at={A(0.1 + (k * 0.7) / rows.length)} from={-60}>
            <Glass style={{ width: 980, padding: "24px 34px", display: "flex", alignItems: "center", justifyContent: "space-between" }} glow={col(c)}>
              <div style={{ display: "flex", gap: 22, alignItems: "center" }}><Icon name={v.icon ?? "file"} size={50} color={C.white} /><span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: C.white }}>{n}</span></div>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, color: "#fff", background: col(c), padding: "8px 20px", borderRadius: 10, whiteSpace: "nowrap" }}>{st}</span>
            </Glass>
          </Pop>
        ))}
      </div>
      <Note t={v.note ?? "illustrative"} />
    </>
  );
};

const ZeroT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const c = col(v.color ?? "red");
  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {v.photo && <PhotoBg src={v.photo} at={A(0) - 3} dim={0.78} />}
      <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: C.muted, letterSpacing: "0.2em", position: "relative" }}>{v.eyebrow?.toUpperCase()}</div>
      <div style={{ ...big(v.bigSize ?? 260), color: c, transform: `scale(${pop(fr, A(0.2), 280, 12)})`, textShadow: `0 0 60px ${c}`, position: "relative", marginTop: 10 }}>{v.big}</div>
      {v.text && <div style={{ marginTop: 26, position: "relative" }}><Slam text={v.text} at={A(0.55)} size={v.size ?? 76} /></div>}
    </div>
  );
};

const MonthsT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  return (
    <>
      {v.photo && <PhotoBg src={v.photo} at={A(0) - 3} dim={0.76} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 150px)", gap: 18, position: "relative" }}>
        {"JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ").map((m, k) => {
          const on = fr >= A(0) + k * 2;
          return <div key={m} style={{ height: 120, borderRadius: 16, background: on ? "rgba(96,165,250,0.18)" : "rgba(255,255,255,0.04)", border: `2px solid ${on ? C.sky : "rgba(255,255,255,0.1)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, color: C.white }}>{m}<span style={{ fontSize: 22, color: C.muted }}>{v.cell ?? "busy"}</span></div>;
        })}
      </div>
      <div style={{ marginTop: 60, display: "flex", alignItems: "baseline", gap: 26, position: "relative" }}>
        <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 58, color: C.white }}>{v.text}</span>
        <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 110, color: C.red, opacity: ap(fr, A(0.6)) }}>{v.value ?? "???"}</span>
      </div>
    </>
  );
};

const StrikeT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const strike = ap(fr, A(0.3), 8);
  return (
    <>
      <div style={{ position: "relative", ...big(130), color: C.muted, opacity: 1 - 0.5 * strike, letterSpacing: "-0.03em" }}>
        {v.from}
        <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: 16, borderRadius: 8, background: C.red, transformOrigin: "left", transform: `scaleX(${strike}) rotate(-3deg)` }} />
      </div>
      <div style={{ transform: `scale(${pop(fr, A(0.7), 300, 12)})`, fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: v.toSize ?? 190, backgroundImage: `linear-gradient(100deg, ${C.sky}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 40px ${C.cyan}88)`, paddingRight: 20 }}>{v.to}</div>
    </>
  );
};

const ConvergeT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const conv = ap(fr, A(0.45), 30);
  const labels: string[] = v.labels ?? ["$", "#", "%", "?"];
  return (
    <>
      {Array.from({ length: 40 }).map((_, k) => {
        const sx = 960 + (random(`dx${k}`) - 0.5) * 1700;
        const sy = 540 + (random(`dy${k}`) - 0.5) * 900;
        const x = sx + (960 - sx) * conv;
        const y = sy + (520 - sy) * conv;
        return <div key={k} style={{ position: "absolute", left: x - 34, top: y - 30, minWidth: 68, height: 60, padding: "0 8px", boxSizing: "border-box", borderRadius: 14, background: "rgba(96,165,250,0.18)", border: `2px solid ${C.sky}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 19, color: C.white, opacity: 1 - conv * 0.9, transform: `scale(${1 - conv * 0.6})`, whiteSpace: "nowrap" }}>{labels[k % labels.length]}</div>;
      })}
      <div style={{ opacity: conv, transform: `scale(${0.5 + 0.5 * conv})`, width: 560, height: 320, borderRadius: 26, border: `4px solid ${C.cyan}`, background: "rgba(34,211,238,0.08)", boxShadow: `0 0 90px ${C.cyan}66`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 52, color: C.white, marginTop: 40 }}>{v.box ?? "One place."}</div>
      <Top y={110}><Slam text={v.text} at={A(0)} size={v.size ?? 70} /></Top>
    </>
  );
};

const SplitT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const side = (t: string, items: string[], good: boolean, a0: number) => (
    <Pop at={a0}>
      <Glass style={{ width: 720, padding: "36px 44px", minHeight: 470, boxSizing: "border-box" }} glow={good ? C.green : C.red}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: good ? C.green : C.red, marginBottom: 26 }}>{t}</div>
        {items.map((x, k) => (
          <div key={k} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, opacity: ap(fr, a0 + 6 + k * 5), fontFamily: FONT.sans, fontWeight: 600, fontSize: 32, color: C.white }}>
            <Icon name={good ? "check" : "x"} size={34} color={good ? C.green : C.red} />{x}
          </div>
        ))}
      </Glass>
    </Pop>
  );
  return (
    <>
      {v.text && <Top y={70}><Slam text={v.text} at={A(0)} size={v.size ?? 70} /></Top>}
      <div style={{ display: "flex", gap: 50, marginTop: v.text ? 110 : 0 }}>
        {side(v.left[0], v.left[1], false, A(0.08))}
        {side(v.right[0], v.right[1], true, A(v.rightAt ?? 0.5))}
      </div>
    </>
  );
};

const ChecklistT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const items: string[] = v.items;
  const two = items.length > 5;
  return (
    <>
      {v.photo && <PhotoBg src={v.photo} at={A(0) - 3} dim={0.78} />}
      <Top y={80}><Slam text={v.text} at={A(0)} size={v.size ?? 74} /></Top>
      <div style={{ display: "grid", gridTemplateColumns: two ? "1fr 1fr" : "1fr", gap: "22px 60px", marginTop: 130, position: "relative" }}>
        {items.map((x, k) => {
          const a0 = A(0.12 + (k * 0.78) / items.length);
          return (
            <div key={k} style={{ display: "flex", gap: 20, alignItems: "center", opacity: ap(fr, a0), transform: `translateX(${(1 - ap(fr, a0)) * -40}px)`, fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.white }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `${col(v.color ?? "green")}33`, border: `2px solid ${col(v.color ?? "green")}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(fr, a0, 300, 12)})` }}><Icon name={v.icon ?? "check"} size={34} color={col(v.color ?? "green")} /></div>
              {x}
            </div>
          );
        })}
      </div>
    </>
  );
};

const RingT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  return (
    <>
      <div style={{ position: "relative", width: 380, height: 380 }}>
        <svg width="380" height="380" viewBox="0 0 380 380" style={{ position: "absolute" }}>
          <circle cx="190" cy="190" r="170" stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none" />
          <circle cx="190" cy="190" r="170" stroke={C.cyan} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={1068} strokeDashoffset={1068 * (1 - ap(fr, A(0), 50))} transform="rotate(-90 190 190)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={big(130)}>{v.n}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.cyan, letterSpacing: "0.2em" }}>{v.unit}</div>
        </div>
      </div>
      <div style={{ marginTop: 40 }}><Slam text={v.text} at={A(0.1)} size={v.size ?? 70} /></div>
    </>
  );
};

const CalendarT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const months: string[] = v.months ?? ["JAN", "FEB", "MAR", "APR"];
  const a = A(0);
  const idx = Math.min(months.length - 1, Math.floor(Math.max(0, fr - a) / 5));
  const last = idx === months.length - 1;
  const alarm = fr > a + 18 ? Math.sin(fr * 1.4) * 5 : 0;
  return (
    <>
      <div style={{ transform: `rotate(${alarm}deg) scale(${pop(fr, a)})`, width: 420, borderRadius: 30, overflow: "hidden", boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 ${last ? 80 : 0}px ${C.red}` }}>
        <div style={{ background: last ? C.red : C.blue, padding: "18px 0", textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, color: "#fff", letterSpacing: "0.1em" }}>{months[idx]}</div>
        <div style={{ background: "#fff", padding: "10px 0 24px", textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 200, color: C.ink, lineHeight: 1 }}>{v.day ?? 15}</div>
      </div>
      <div style={{ position: "absolute", bottom: 170, width: "100%", display: "flex", justifyContent: "center" }}><Slam text={v.text} at={a + 6} size={v.size ?? 74} /></div>
    </>
  );
};

const PapersT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const a = A(0);
  return (
    <>
      {v.photo && <PhotoBg src={v.photo} at={a - 3} dim={0.62} />}
      {Array.from({ length: 18 }).map((_, k) => {
        const t0 = a + k * 1.6;
        const s = pop(fr, t0, 260, 14);
        if (fr < t0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 300 + (k % 6) * 222, top: 250 + Math.floor(k / 6) * 230, width: 190, height: 210, borderRadius: 10, background: "linear-gradient(160deg, #fefce8, #e7e5e4)", transform: `scale(${s}) rotate(${(random(`rr${k}`) - 0.5) * 16}deg)`, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", padding: 16, boxSizing: "border-box" }}>
            {v.label && <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 600, color: "#57534e", marginBottom: 10 }}>{v.label}</div>}
            {Array.from({ length: 5 }).map((__, q) => <div key={q} style={{ height: 7, width: `${40 + random(`rw${k}${q}`) * 55}%`, background: "#a8a29e", borderRadius: 4, marginBottom: 14 }} />)}
          </div>
        );
      })}
      <Top y={90}><Slam text={v.text} at={a} size={v.size ?? 80} /></Top>
    </>
  );
};

const PhoneT: React.FC<B> = ({ v, A }) => (
  <>
    {v.photo && <PhotoBg src={v.photo} at={A(0) - 3} dim={0.66} />}
    <div style={{ display: "flex", alignItems: "center", gap: 120 }}>
      <Pop at={A(0)}>
        <div style={{ width: 360, height: 680, borderRadius: 56, border: "10px solid #1f2937", background: "linear-gradient(180deg, #0f172a, #111827)", boxShadow: "0 50px 100px rgba(0,0,0,0.6)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 80, left: 24, right: 24, display: "grid", gap: 18 }}>
            {(v.items ?? [[v.label, v.value]]).map(([l, val]: [string, string], k: number) => (
              <Pop key={k} at={A(0.1 + k * 0.15)}>
                <Glass style={{ padding: 18 }} glow={col(v.color ?? "green")}>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 17, color: C.muted }}>{l}</div>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: col(v.color ?? "green") }}>{val}</div>
                </Glass>
              </Pop>
            ))}
          </div>
        </div>
      </Pop>
      <div style={{ width: 760 }}><Slam text={v.text} at={A(0) + 4} size={v.size ?? 78} align="left" maxWidth={760} /></div>
    </div>
  </>
);

const QAT: React.FC<B> = ({ v, A, L, i, j }) => {
  const fr = useCurrentFrame();
  const lift = ap(fr, L(i, v.liftAt ?? 0.6), 14);
  const chips: string[] = v.chips ?? [];
  const ca = (k: number) => A(0.35 + (k * 0.5) / Math.max(1, chips.length));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380 - lift * 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${1 - lift * 0.4})`, transformOrigin: "top center" }}>
        <div style={{ transform: "scale(1.4)", marginBottom: 14 }}><Eyebrow at={A(0)}>{v.eyebrow ?? "Honest answer"}</Eyebrow></div>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: v.qSize ?? (v.q.length > 30 ? 90 : 104), color: C.white, textAlign: "center", maxWidth: 1600, transform: `scale(${pop(fr, A(0), 260, 14)})` }}>“{v.q}”</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: v.q.length > 30 ? 390 : 340, opacity: lift, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        {v.big && <div style={{ ...big(v.bigSize ?? 110), transform: `scale(${pop(fr, L(i, v.liftAt ?? 0.6), 300, 12)})` }}>{v.big}</div>}
        {v.answer && <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 58, color: C.white, textAlign: "center", maxWidth: 1500 }}>{v.answer}</div>}
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", maxWidth: 1700 }}>
          {chips.map((c, k) => (
            <Pop key={k} at={ca(k)} from={30}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: C.white, background: `${C.green}22`, border: `1.5px solid ${C.green}aa`, padding: "15px 28px", borderRadius: 999 }}>
                <Icon name="check" size={28} color={C.green} />{c}
              </div>
            </Pop>
          ))}
        </div>
        {v.foot && <Pop at={A(0.85)}><div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: C.white }}><Icon name={v.footIcon ?? "lock"} size={50} color={C.cyan} />{v.foot}</div></Pop>}
        {v.fine && <div style={{ fontFamily: FONT.sans, fontSize: 24, color: C.muted, letterSpacing: "0.06em", opacity: ap(fr, A(0.7)) }}>{v.fine}</div>}
      </div>
    </AbsoluteFill>
  );
};

// ---------- product templates ----------
const ed = (e?: string) => (e === "ess" ? "ess" : "elite");
const tierName = (e: string) => (e === "ess" ? "Essential" : "Elite");
const fileOf = (e: string) => (e === "ess" ? S.file_ess : S.file_elite);

const CoverT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const fg = useLight() ? C.ink : C.white;
  const e = ed(v.ed);
  const n = v.n ?? (e === "ess" ? S.n_ess : S.n_elite);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
      <Pop at={A(0)}><Cover tier={tierName(e) as "Essential" | "Elite"} width={380} /></Pop>
      <div>
        <Eyebrow at={A(0)}>{v.eyebrow ?? (e === "ess" ? "Edition 1" : "Edition 2")}</Eyebrow>
        <div style={big(150, { letterSpacing: "-0.05em", color: fg })}>{tierName(e)}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, opacity: ap(fr, A(v.nAt ?? 0.6)), transform: `scale(${0.7 + 0.3 * pop(fr, A(v.nAt ?? 0.6), 300, 12)})`, transformOrigin: "left" }}>
          <span style={{ ...big(200), color: C.cyan }}>{n}</span>
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 60, color: fg }}>sheets</span>
        </div>
        {v.sub && <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 34, color: useLight() ? C.ink2 : C.soft, opacity: ap(fr, A(v.subAt ?? 0.75)), maxWidth: 820, lineHeight: 1.3 }}>{v.sub}</div>}
        {v.price && <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.muted, opacity: ap(fr, A(0.8)) }}>{v.price}</div>}
      </div>
    </div>
  );
};

const slugTab = (e: string, t: string) => findSheet(e, t).img;
const WallT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const e = ed(v.ed);
  const tabs = e === "ess" ? M.ess : M.elite;
  const n = tabs.length;
  const inputs: string[] = (v.inputs ?? []).map((t: string) => tabOf(e, t));
  let cols = Math.ceil(Math.sqrt(n * 1.9));
  let w = Math.min(330, (1760 - (cols - 1) * 14) / cols);
  while (Math.ceil(n / cols) * (w * 0.7 + 14) > (v.text ? 800 : 900)) { cols++; w = (1760 - (cols - 1) * 14) / cols; }
  const tagIn = A(v.inAt ?? 0.35);
  const tagAuto = A(v.autoAt ?? 0.68);
  return (
    <>
      {v.text && <Top y={60}><Slam text={v.text} at={A(0)} size={v.size ?? 62} /></Top>}
      <div style={{ position: "absolute", top: v.text ? 190 : 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap: 14 }}>
          {tabs.map((t, k) => {
            const input = inputs.includes(t);
            const guide = /start here|glossary|changelog|settings|reference/i.test(t);
            const a0 = A(0.02) + (k % cols) + Math.floor(k / cols) * 2;
            const s = pop(fr, a0, 220, 16);
            const tag = v.tags === false ? undefined : guide ? (fr >= tagIn ? "GUIDE" : undefined) : input ? (fr >= tagIn ? "YOU ENTER" : undefined) : fr >= tagAuto ? "AUTO" : undefined;
            const dim = v.tags !== false && !input && !guide && fr >= tagIn && fr < tagAuto;
            return (
              <div key={t} style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 80}px) scale(${(0.7 + 0.3 * s) * (input && fr >= tagIn && fr < tagAuto ? 1.05 : 1)})` }}>
                <SheetTile name={slugTab(e, t)} title={t} w={w} tag={tag} tagColor={guide ? C.amber : input ? C.green : C.blue} dimmed={dim} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const GridT: React.FC<B> = ({ v, A }) => {
  const e = ed(v.ed);
  const tabs: string[] = v.tabs.map((t: string) => tabOf(e, t));
  const cols = tabs.length > 6 ? 4 : 3;
  const w = cols === 4 ? 410 : 520;
  const h = Math.round(w * 0.7);
  return (
    <>
      {v.text && <Top y={56}><Slam text={v.text} at={A(0)} size={v.size ?? 60} /></Top>}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap: 28, marginTop: v.text ? 90 : -20 }}>
          {tabs.map((t, k) => (
            <div key={t} style={{ position: "relative", width: w, height: h }}>
              <FlyIn at={A(0.02 + (k * 0.85) / tabs.length)} from={k % 2 ? "right" : "left"} style={{ left: 0, top: 0 }}>
                <SheetTile name={slugTab(e, t)} title={t} w={w} />
              </FlyIn>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </>
  );
};

// ---------- sheet tour ----------
export const SW = { x: 450, y: 76, w: 1410, h: 870 };
type R = [number, number, number, number];
type Row = [string, number, number, number, number];
function findRow(rows: Row[], q: string): number {
  let nth = 0;
  const m = q.match(/^(.*)#(\d+)$/);
  if (m) { q = m[1]; nth = +m[2]; }
  const lq = q.toLowerCase();
  let hits = rows.map((r, k) => (r[0].includes(q) ? k : -1)).filter((k) => k >= 0);
  if (!hits.length) hits = rows.map((r, k) => (r[0].toLowerCase().includes(lq) ? k : -1)).filter((k) => k >= 0);
  if (!hits.length) throw new Error(`highlight not found: "${q}"`);
  return hits[Math.min(nth, hits.length - 1)];
}
function hiRect(rows: Row[], q: string, mode: string, ih: number, iw: number): R {
  const k = findRow(rows, q);
  const r = rows[k];
  let x0 = r[1], y0 = r[2], x1 = r[1] + r[3], y1 = r[2] + r[4];
  const cy = r[2] + r[4] / 2;
  if (mode === "row") {
    const same = rows.filter((o) => Math.abs(o[2] + o[4] / 2 - cy) < Math.max(o[4], r[4]) * 0.5 && o[1] >= r[1] - 0.005).sort((a, b) => a[1] - b[1]);
    for (const o of same) { if (o[1] - x1 < 0.09) { x1 = Math.max(x1, o[1] + o[3]); y0 = Math.min(y0, o[2]); y1 = Math.max(y1, o[2] + o[4]); } }
  } else if (mode === "kpi") {
    const cx = (x0 + x1) / 2;
    const below = rows.filter((o) => o[2] > r[2] + r[4] * 0.5 && o[2] - (r[2] + r[4]) < 0.08 && Math.abs(o[1] + o[3] / 2 - cx) < Math.max(r[3], o[3]) * 0.75).sort((a, b) => a[2] - b[2])[0];
    if (below) { x0 = Math.min(x0, below[1]); x1 = Math.max(x1, below[1] + below[3]); y1 = below[2] + below[4]; }
  } else if (mode === "block") {
    // label + the next few rows beneath it (a section)
    const below = rows.filter((o) => o[2] > r[2] && o[2] - r[2] < 0.3 && o[1] >= r[1] - 0.01).sort((a, b) => a[2] - b[2]).slice(0, 6);
    for (const o of below) { x1 = Math.max(x1, o[1] + o[3]); y1 = Math.max(y1, o[2] + o[4]); }
  }
  const px = 10 / iw, py = 8 / ih;
  return [Math.max(0, x0 - px), Math.max(0, y0 - py), Math.min(1, x1 - x0 + 2 * px), Math.min(1, y1 - y0 + 2 * py)];
}
const VIEW_A = SW.w / (SW.h - 86);
function topCam(iw: number, ih: number): R {
  const rh = Math.min(1, iw / VIEW_A / ih);
  return [0, 0, 1, rh];
}
function focusCam(u: R, iw: number, ih: number, minW = 0.5): R {
  let rw = Math.min(1, Math.max(u[2] + 0.1, minW, 1250 / iw));
  let rh = (rw * iw) / VIEW_A / ih;
  if (rh < u[3] + 0.06) { rh = Math.min(1, u[3] + 0.06); rw = Math.min(1, (rh * ih * VIEW_A) / iw); }
  const x = Math.max(0, Math.min(1 - rw, u[0] + u[2] / 2 - rw / 2));
  const y = Math.max(0, Math.min(Math.max(0, 1 - rh), u[1] + u[3] / 2 - rh / 2));
  return [x, y, rw, rh];
}

export const sheetProps = (v: V, A: (p: number) => number, w = SW.w, h = SW.h) => {
  const e = ed(v.ed);
  const sm = findSheet(e, v.tab);
  const tab = tabOf(e, v.tab);
  const all = e === "ess" ? M.ess : M.elite;
  const his: any[] = v.hi ?? [];
  const n = his.length;
  const hi = his.map((h0, k) => {
    const [q, label, c, mode, p] = h0 as [string, string?, string?, string?, number?];
    const r = hiRect(sm.rows as Row[], q, mode ?? "row", sm.h, sm.w);
    const pp = p ?? 0.28 + (n > 1 ? (k * 0.55) / (n - 1) : 0.1);
    return { at: A(pp), r, label, color: c ? col(c) : [C.blue, C.green, C.amber, C.cyan, C.red][k % 5], side: r[1] < 0.07 ? ("bottom" as const) : ("top" as const), until: v.hold === false ? A(Math.min(0.98, pp + 0.3)) : undefined };
  });
  let cam: { at: number; r: R }[];
  const start: R = v.cam === "full" ? [0, 0, 1, 1] : Array.isArray(v.cam) ? v.cam : topCam(sm.w, sm.h);
  cam = [{ at: 0, r: start }];
  if (hi.length && v.zoom !== false) {
    const u = hi.reduce<R>((acc, x) => { const x0 = Math.min(acc[0], x.r[0]), y0 = Math.min(acc[1], x.r[1]); return [x0, y0, Math.max(acc[0] + acc[2], x.r[0] + x.r[2]) - x0, Math.max(acc[1] + acc[3], x.r[1] + x.r[3]) - y0]; }, hi[0].r);
    cam.push({ at: Math.max(A(0.12), hi[0].at - 10), r: focusCam(u, sm.w, sm.h, v.minW ?? 0.5) });
  }
  if (v.pan) cam.push({ at: A(v.panAt ?? 0.6), r: v.pan === "bottom" ? [0, Math.max(0, 1 - start[3]), 1, start[3]] : v.pan });
  return { name: sm.img, iw: sm.w, ih: sm.h, file: fileOf(e), tabs: tabsAround(all, tab), active: tab, w, h, cam, hi };
};

const SheetT: React.FC<B & { k: number }> = ({ v, A, a, b, k }) => (
  <FlyIn at={a + 3} until={b} from={v.dir ?? (["right", "bottom", "zoom"] as const)[k % 3]} style={{ left: SW.x, top: SW.y }}>
    <Sheet {...sheetProps(v, A)} />
  </FlyIn>
);

export const Steps: React.FC<{ items: [number, number, string, string?][] }> = ({ items }) => {
  const fr = useCurrentFrame();
  const light = useLight();
  const cur = Math.max(0, items.findIndex(([a, b]) => fr >= a && fr < b + 4));
  const WIN = 9;
  const s0 = Math.max(0, Math.min(items.length - WIN, cur - 3));
  const vis = items.slice(s0, s0 + WIN);
  const n = vis.length;
  const fg = light ? C.ink : C.white;
  return (
    <div style={{ position: "absolute", left: 50, top: n > 7 ? 90 : 130, width: 370, display: "grid", gap: n > 7 ? 12 : 18 }}>
      {items.length > WIN && <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, color: light ? C.ink2 : C.muted, letterSpacing: "0.12em" }}>{String(cur + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</div>}
      {vis.map(([a, b, t, d], j) => {
        const k = s0 + j;
        const on = k === cur && fr >= a;
        const p = ap(fr, items[0][0] - 2 + j * 2, 10);
        return (
          <div key={k} style={{ opacity: p * (on ? 1 : 0.42), transform: `translateX(${(1 - p) * -40 + (on ? 10 : 0)}px)`, borderLeft: `6px solid ${on ? (light ? C.blue : C.cyan) : light ? "rgba(11,17,32,0.12)" : "rgba(255,255,255,0.15)"}`, paddingLeft: 20 }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: n > 7 ? 24 : 29, color: fg, lineHeight: 1.15 }}>{t}</div>
            {d && <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: n > 7 ? 17 : 20, color: light ? C.ink2 : C.muted }}>{d}</div>}
          </div>
        );
      })}
    </div>
  );
};

// a full-width single sheet with a headline (no side steps)
const HeroSheetT: React.FC<B> = ({ v, A, a, b }) => (
  <>
    {v.text && <Top y={46}><Slam text={v.text} at={A(0)} size={v.size ?? 70} /></Top>}
    <FlyIn at={a + 4} until={b} from="zoom" style={{ left: 160, top: v.text ? 190 : 90 }}>
      <Sheet {...sheetProps(v, A, 1600, v.text ? 800 : 880)} />
    </FlyIn>
  </>
);

// several small live sheets side by side with titles
const MiniT: React.FC<B> = ({ v, A }) => {
  const light = useLight();
  const items: any[] = v.items;
  const n = items.length;
  const w = n >= 4 ? 400 : 520;
  return (
    <>
      {v.text && <Top y={60}><Slam text={v.text} at={A(0)} size={v.size ?? 66} /></Top>}
      <div style={{ position: "absolute", top: 230, left: 60, right: 60, display: "flex", gap: 26, justifyContent: "center" }}>
        {items.map((it, k) => {
          const vv = { ed: v.ed, ...it, hi: it.hi ?? [] };
          return (
            <FlyIn key={k} at={A(0.04 + (k * 0.6) / n)} from="bottom" style={{ position: "relative" }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, color: light ? C.ink : C.white, marginBottom: 14, textAlign: "center" }}>{it.label}</div>
              <Sheet {...sheetProps({ ...vv, cam: it.cam ?? "full", zoom: false }, A, w, 480)} tabs={[tabOf(ed(v.ed), it.tab)]} />
            </FlyIn>
          );
        })}
      </div>
    </>
  );
};

const ChapterT: React.FC<B> = ({ v, A }) => {
  const fr = useCurrentFrame();
  const light = useLight();
  const fg = light ? C.ink : C.white;
  const items: string[] = v.items ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Eyebrow at={A(0)}>{v.eyebrow}</Eyebrow>
      <div style={{ ...big(180, { color: light ? C.blue : C.cyan }), transform: `scale(${pop(fr, A(0), 260, 13)})` }}>{v.num}</div>
      <Slam text={v.text} at={A(0.05)} size={v.size ?? 78} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", maxWidth: 1500, marginTop: 10 }}>
        {items.map((t, k) => (
          <Pop key={k} at={A(0.2 + (k * 0.6) / Math.max(1, items.length))} from={24}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, color: fg, padding: "10px 20px", borderRadius: 12, background: light ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${light ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.16)"}` }}>{t}</div>
          </Pop>
        ))}
      </div>
    </div>
  );
};

export const TEMPLATES: Record<string, React.FC<any>> = {
  slam: SlamT, notifs: NotifsT, counter: CounterT, bars: BarsT, cards: CardsT, rows: RowsT, zero: ZeroT, months: MonthsT, strike: StrikeT, converge: ConvergeT,
  split: SplitT, checklist: ChecklistT, ring: RingT, calendar: CalendarT, papers: PapersT, phone: PhoneT, qa: QAT, cover: CoverT, wall: WallT, grid: GridT, sheet: SheetT, hero: HeroSheetT, mini: MiniT, chapter: ChapterT,
};
export const NO_BEAT = new Set(["sheet", "qa"]);
export { Burst, Glitch, LightLeak, LogoMark, Shockwave, Streaks, cl, ez, interpolate };
