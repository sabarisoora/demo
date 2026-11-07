import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ap, C, cf, cl, ez, FONT, le, li, ls, pop, wf } from "./lib";
import { Card, Chip, Confetti, GText, Icon, IconBubble, KText, Logo, Pop, Rings, Sparkle, Wordmark } from "./ui";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);
/** show between frames a..b with a soft scale/fade in and out */
export const Phase: React.FC<{ a: number; b: number; children: React.ReactNode; style?: React.CSSProperties; exit?: "up" | "zoom" }> = ({ a, b, children, style, exit = "up" }) => {
  const fr = useCurrentFrame();
  if (fr < a - 1 || fr > b + 10) return null;
  const i = ap(fr, a, 10);
  const o = 1 - ap(fr, b, 9);
  const tr = exit === "zoom" ? `scale(${1 + (1 - o) * 0.25})` : `translateY(${(1 - o) * -60}px)`;
  return <AbsoluteFill style={{ opacity: Math.min(i, o), transform: `${tr} scale(${0.96 + 0.04 * i})`, ...style }}>{children}</AbsoluteFill>;
};

// ================= HOOK =================
const Clock: React.FC<{ size: number; spinA: number; spinB: number; turnsA: number; turnsB: number }> = ({ size, spinA, spinB, turnsA, turnsB }) => {
  const fr = useCurrentFrame();
  const t1 = interpolate(fr, [spinA, spinA + 22], [0, 1], { ...cl, easing: ez });
  const t2 = interpolate(fr, [spinB, spinB + 22], [0, 1], { ...cl, easing: ez });
  const hours = 7 * t1 + 12 * t2; // 12:00 -> 7:00 -> 7:00 again (12 h later)
  const hA = (hours % 12) * 30 + turnsA * 0;
  const mA = hours * 360 + turnsB * 0;
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200">
      <defs>
        <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor={C.mag} /><stop offset="0.5" stopColor={C.pur} /><stop offset="1" stopColor={C.cya} /></linearGradient>
      </defs>
      <circle r="92" fill="#FFFFFF" stroke="url(#ring)" strokeWidth="9" />
      {Array.from({ length: 12 }).map((_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <circle key={k} cx={Math.sin(a) * 74} cy={-Math.cos(a) * 74} r={k % 3 === 0 ? 5 : 3} fill={k % 3 === 0 ? C.pur : "#D9CCFF"} />;
      })}
      <line x1="0" y1="0" x2={Math.sin((hA * Math.PI) / 180) * 42} y2={-Math.cos((hA * Math.PI) / 180) * 42} stroke={C.ink} strokeWidth="8" strokeLinecap="round" />
      <line x1="0" y1="0" x2={Math.sin((mA * Math.PI) / 180) * 64} y2={-Math.cos((mA * Math.PI) / 180) * 64} stroke={C.mag} strokeWidth="5" strokeLinecap="round" />
      <circle r="7" fill={C.pur} />
    </svg>
  );
};

export const Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("You open"), L1 = li("You close"), L2 = li("Jobs done"), L3 = li("So here's one quick"), L4 = li("How much did"), L5 = li("Not what came");
  const sunMoon = interpolate(fr, [cf(L1, "whoosh"), cf(L1, "whoosh") + 14], [0, 1], { ...cl, easing: ez });
  // clock slides to the corner when the day gets busy
  const corner = ap(fr, ls(L2) - 4, 16);
  const busySpin = Math.max(0, fr - ls(L2)) * 9;
  const notif = [
    { k: "Jobs", icon: "check", t: "Job done", col: C.grn },
    { k: "Invoices", icon: "mail", t: "Invoice sent", col: C.pur },
    { k: "Money", icon: "in", t: "Payment in", col: C.cya },
    { k: "out", icon: "out", t: "Payment out", col: C.mag },
  ];
  return (
    <>
      {/* clock + open/closed */}
      <Phase a={ls(L0) - 6} b={le(L2) + 4}>
        <div style={{ position: "absolute", left: interpolate(corner, [0, 1], [300, 120]), top: interpolate(corner, [0, 1], [230, 90]), transform: `scale(${1 - corner * 0.55})`, transformOrigin: "top left" }}>
          <div style={{ transform: `rotate(${corner > 0.99 ? busySpin * 0 : 0}deg)` }}>
            <Clock size={560} spinA={cf(L0, "tick")} spinB={cf(L1, "whoosh")} turnsA={0} turnsB={0} />
          </div>
          <div style={{ position: "absolute", right: -30, top: -20, transform: `rotate(${sunMoon * 200}deg) scale(${1 - 0.15 * Math.sin(sunMoon * Math.PI)})` }}>
            <div style={{ opacity: 1 - sunMoon, position: "absolute" }}><IconBubble name="sun" size={120} col="#F59E0B" bg="#FFF3D1" /></div>
            <div style={{ opacity: sunMoon }}><IconBubble name="moon" size={120} col={C.pur} /></div>
          </div>
        </div>
        {fr < ls(L2) + 6 && (
          <div style={{ position: "absolute", left: 980, top: 300, width: 820, opacity: 1 - ap(fr, ls(L2) - 6, 8) }}>
            <Pop at={cf(L0, "tick")}><Chip col={C.grn} size={34}><span style={{ color: C.grn }}>●</span> {fr < cf(L1, "whoosh") ? "OPEN" : "CLOSED"}</Chip></Pop>
            <div style={{ height: 34 }} />
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 150, letterSpacing: "-0.05em", color: C.ink, lineHeight: 1 }}>
              {fr < cf(L1, "whoosh") ? (fr >= cf(L0, "ding") - 2 ? <span style={{ display: "inline-block", transform: `scale(${pop(fr, cf(L0, "ding"))})` }}><GText>7:00</GText> am</span> : "") : fr >= cf(L1, "ding") - 2 ? <span style={{ display: "inline-block", transform: `scale(${pop(fr, cf(L1, "ding"))})` }}><GText>7:00</GText> pm</span> : ""}
            </div>
            <div style={{ height: 24 }} />
            <KText line={fr < ls(L1) - 4 ? L0 : L1} size={64} align="left" maxWidth={820} />
          </div>
        )}
        {/* the busy day: notifications stack */}
        {fr >= ls(L2) - 4 && (
          <div style={{ position: "absolute", left: 640, top: 150, width: 1100 }}>
            <div style={{ marginBottom: 40 }}><KText line={L2} size={60} align="left" maxWidth={1100} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {notif.map((n, k) => (
                <Pop key={k} at={cf(L2, ["pop", "pop", "swish", "swish"][k], k < 2 ? k : k - 2)} from={-40}>
                  <Card style={{ display: "flex", alignItems: "center", gap: 26, padding: "20px 30px", width: 640, marginLeft: k * 60 }} glow={`${n.col}55`}>
                    <IconBubble name={n.icon} size={72} col={n.col} />
                    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: C.ink }}>{n.t}</div>
                    <div style={{ marginLeft: "auto", fontFamily: FONT.sans, fontWeight: 600, fontSize: 24, color: C.mute }}>just now</div>
                  </Card>
                </Pop>
              ))}
            </div>
          </div>
        )}
      </Phase>
      {/* one quick question */}
      <Phase a={ls(L3) - 4} b={ls(L4) - 2} exit="zoom">
        <Center>
          <Pop at={cf(L3, "pop")} from={60}>
            <div style={{ width: 300, height: 300, borderRadius: "50%", background: "linear-gradient(135deg,#FFE1F1,#EFE8FF 50%,#DDF9FE)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 40px 90px -30px rgba(255,62,165,0.5)", transform: `rotate(${Math.sin(fr / 6) * 6}deg)` }}>
              <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 230, lineHeight: 1 }}><GText>?</GText></span>
            </div>
          </Pop>
          <div style={{ height: 40 }} />
          <KText line={L3} size={76} />
        </Center>
      </Phase>
      {/* how much did you keep */}
      <Phase a={ls(L4) - 4} b={ls(L5) - 4} exit="zoom">
        <Center>
          <div style={{ transform: `translateX(${fr >= cf(L4, "hit") && fr < cf(L4, "hit") + 8 ? Math.sin(fr * 3) * 10 : 0}px)` }}>
            <KText line={L4} size={128} maxWidth={1700} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Pop key={k} at={cf(L4, "hit") + k * 2} from={80} style={{ position: "absolute", left: 200 + k * 290, top: k % 2 ? 140 : 820 }}>
              <div style={{ transform: `rotate(${Math.sin(fr / 10 + k) * 14}deg)` }}><IconBubble name="dollar" size={86} col={[C.mag, C.pur, C.cya][k % 3]} /></div>
            </Pop>
          ))}
          <Sparkle at={cf(L4, "hit")} x={960} y={540} n={12} r={420} />
        </Center>
      </Phase>
      {/* came in vs kept */}
      <Phase a={ls(L5) - 4} b={le(L5) + 6}>
        <Center style={{ flexDirection: "row", gap: 160 }}>
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, letterSpacing: "0.2em", color: C.mute, marginBottom: 10 }}>NOT</div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 130, color: "#B7B1CC", letterSpacing: "-0.04em", position: "relative" }}>
              came in
              <div style={{ position: "absolute", left: -20, right: -20, top: "55%", height: 16, borderRadius: 8, background: C.pink, transformOrigin: "left", transform: `scaleX(${ap(fr, cf(L5, "strike"), 10)}) rotate(-4deg)` }} />
            </div>
          </div>
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, letterSpacing: "0.2em", color: C.pur, marginBottom: 10, opacity: ap(fr, cf(L5, "ding") - 6) }}>WHAT YOU</div>
            <Pop at={cf(L5, "ding")} from={40}>
              <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 170, lineHeight: 1 }}><GText>kept.</GText></div>
            </Pop>
            <svg width="520" height="260" viewBox="0 0 520 260" style={{ position: "absolute", left: -60, top: 10 }}>
              <ellipse cx="260" cy="140" rx="240" ry="105" fill="none" stroke={C.mag} strokeWidth="7" strokeLinecap="round" strokeDasharray="1600" strokeDashoffset={1600 * (1 - ap(fr, cf(L5, "ding") + 4, 16))} transform="rotate(-4 260 140)" />
            </svg>
          </div>
        </Center>
      </Phase>
    </>
  );
};

// ================= SAME BLIND SPOT =================
const TRADES = [
  { k: "plumber", icon: "wrench", name: "Plumbers", q: "Which callbacks eat the margin?", col: C.cya },
  { k: "restaurant", icon: "plate", name: "Restaurants", q: "Where did prime cost land?", col: C.mag },
  { k: "dentist", icon: "tooth", name: "Dentists", q: "Why don't production and collections match?", col: C.pur },
  { k: "trucker", icon: "truck", name: "Truckers", q: "Which loads paid after fuel?", col: C.cya },
  { k: "landlord", icon: "house", name: "Landlords", q: "Which property drags the rest?", col: C.mag },
];
export const Blind: React.FC = () => {
  const fr = useCurrentFrame();
  const L6 = li("It doesn't matter"), Lx = [li("A plumber"), li("A restaurant"), li("A dentist"), li("A trucker"), li("A landlord")], L12 = li("Different trades");
  const merge = ap(fr, cf(L12, "soft") - 6, 18);
  return (
    <Phase a={ls(L6) - 6} b={le(L12) + 6}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        {fr < ls(L12) - 2 ? <KText line={L6} size={80} /> : <KText line={L12} size={92} />}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: interpolate(merge, [0, 1], [28, -150]) }}>
        {TRADES.map((t, k) => {
          const at = cf(Lx[k], "pop");
          const active = fr >= ls(Lx[k]) - 3 && fr < (k < 4 ? ls(Lx[k + 1]) - 3 : ls(L12) - 3);
          const s = pop(fr, at, 260, 14);
          if (fr < at - 1) return <div key={k} style={{ width: 320 }} />;
          return (
            <div key={k} style={{ width: 320, transform: `translateY(${(1 - s) * 80 + (active ? -26 : 0) + merge * Math.abs(k - 2) * 30}px) rotate(${merge * (k - 2) * 7}deg) scale(${(0.7 + 0.3 * Math.min(1.15, s)) * (active ? 1.06 : 1)})`, opacity: Math.min(1, s * 1.5), zIndex: active ? 5 : 1 }}>
              <Card style={{ padding: "34px 28px", height: 420, display: "flex", flexDirection: "column", gap: 24, border: active ? `3px solid ${t.col}` : `2px solid ${C.line}` }} glow={`${t.col}66`}>
                <IconBubble name={t.icon} size={100} col={t.col} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{t.name}</div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, color: C.ink2, lineHeight: 1.3 }}>{t.q}</div>
                <div style={{ marginTop: "auto", alignSelf: "flex-end", width: 64, height: 64, borderRadius: "50%", background: `${t.col}22`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 46, color: t.col, transform: `rotate(${Math.sin(fr / 8 + k) * 10}deg)` }}>?</div>
              </Card>
            </div>
          );
        })}
      </div>
      {merge > 0.01 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
          <Pop at={cf(L12, "soft")}>
            <Chip col={C.mag} size={44}><Icon name="search" size={44} color={C.mag} /> one blind spot</Chip>
          </Pop>
        </AbsoluteFill>
      )}
    </Phase>
  );
};

// ================= THE DATA IS ALREADY THERE =================
const DOCS = [
  { k: "Invoices", icon: "doc", t: "Invoices", col: C.pur, x: 360, y: 470 },
  { k: "Receipts", icon: "receipt", t: "Receipts", col: C.mag, x: 790, y: 560 },
  { k: "Bank", icon: "bank", t: "Bank statements", col: C.cya, x: 1180, y: 450 },
  { k: "apps", icon: "phone", t: "Your apps", col: C.pur, x: 1530, y: 580 },
];
export const DataScene: React.FC = () => {
  const fr = useCurrentFrame();
  const L13 = li("And here's the thing"), L14 = li("Invoices. Receipts"), L15 = li("It's just never");
  const chaos = ap(fr, cf(L15, "glitch") - 4, 20);
  const end = sceneEndOf();
  return (
    <Phase a={ls(L13) - 6} b={end}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        {fr < ls(L15) - 2 ? <KText line={fr < ls(L14) - 2 ? L13 : L14} size={78} /> : <KText line={L15} size={84} />}
      </AbsoluteFill>
      {DOCS.map((d, k) => {
        const at = cf(L14, "pop", k);
        const jx = chaos * Math.sin(fr / (5 + k) + k) * 70 + chaos * (random(`dx${k}`) - 0.5) * 300;
        const jy = chaos * Math.cos(fr / (6 + k) + k * 2) * 60 + chaos * (random(`dy${k}`) - 0.5) * 220;
        return (
          <Pop key={k} at={at} from={60} style={{ position: "absolute", left: d.x - 170 + jx, top: d.y - 80 + jy, transform: `rotate(${chaos * (k % 2 ? 12 : -10)}deg)` }}>
            <Card style={{ width: 340, padding: "26px 26px", display: "flex", alignItems: "center", gap: 20 }} glow={`${d.col}55`}>
              <IconBubble name={d.icon} size={80} col={d.col} />
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.1 }}>{d.t}</div>
            </Card>
          </Pop>
        );
      })}
      {fr < ls(L14) && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 140 }}>
          <Pop at={cf(L13, "swish")}>
            <div style={{ transform: `rotate(${Math.sin(fr / 9) * 12}deg) translateX(${Math.sin(fr / 14) * 40}px)` }}><IconBubble name="search" size={220} col={C.pur} /></div>
          </Pop>
        </AbsoluteFill>
      )}
    </Phase>
  );
};
const sceneEndOf = () => ls(li("That's why we built")) - 2;

// ================= REVEAL =================
export const Reveal: React.FC = () => {
  const fr = useCurrentFrame();
  const L16 = li("That's why we built"), L17 = li("Business intelligence"), L18 = li("Twenty-one"), L19 = li("Not one generic");
  const hit = cf(L16, "impact");
  const lift = ap(fr, ls(L17) - 4, 16);
  const c21 = Math.round(interpolate(fr, [cf(L18, "count", 0), cf(L18, "count", 0) + 16], [0, 21], { ...cl, easing: ez }));
  const c63 = Math.round(interpolate(fr, [cf(L18, "count", 1), cf(L18, "count", 1) + 16], [0, 63], { ...cl, easing: ez }));
  const fan = ap(fr, cf(L19, "sparkle") - 6, 22);
  const FAN = ["plumbing-contractor", "dental-practice", "restaurant", "hvac", "ecommerce", "rental-portfolio", "airbnb"];
  return (
    <>
      {/* incoming chips converge into the logo */}
      {fr < hit + 4 && fr >= ls(L16) - 6 && DOCS.map((d, k) => {
        const p = interpolate(fr, [ls(L16), hit], [0, 1], { ...cl, easing: ez });
        return (
          <div key={k} style={{ position: "absolute", left: d.x - 170 + (960 - d.x) * p, top: d.y - 80 + (520 - d.y) * p, transform: `scale(${1 - p * 0.8}) rotate(${p * 180}deg)`, opacity: 1 - p * 0.6 }}>
            <Card style={{ width: 340, padding: 26, display: "flex", alignItems: "center", gap: 20 }}><IconBubble name={d.icon} size={80} col={d.col} /><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink }}>{d.t}</div></Card>
          </div>
        );
      })}
      <Phase a={hit - 3} b={le(L19) + 6}>
        <Rings at={hit} x={960} y={interpolate(lift, [0, 1], [430, 210])} n={4} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: interpolate(lift, [0, 1], [210, 50]) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${(0.4 + 0.6 * pop(fr, hit, 200, 11)) * interpolate(lift, [0, 1], [1, 0.62])})` }}>
            <Logo size={250} />
            <Wordmark size={170} />
          </div>
        </AbsoluteFill>
        {fr < ls(L17) && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 230 }}>
            <KText line={L16} size={70} />
          </AbsoluteFill>
        )}
        {/* systems in Excel, one per industry */}
        <Phase a={ls(L17) - 4} b={ls(L18) - 4}>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 360 }}>
            <KText line={L17} size={70} maxWidth={1500} />
            <div style={{ display: "flex", gap: 30, marginTop: 60 }}>
              <Pop at={cf(L17, "pop", 0)}><Chip col={C.grn} size={40}><Icon name="sheet" size={44} color={C.grn} /> Excel</Chip></Pop>
              <Pop at={cf(L17, "pop", 1)}><Chip col={C.mag} size={40}><Icon name="spark" size={44} color={C.mag} /> one industry each</Chip></Pop>
            </div>
          </AbsoluteFill>
        </Phase>
        {/* 21 / 63 */}
        <Phase a={ls(L18) - 4} b={ls(L19) - 4} exit="zoom">
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 200, paddingTop: 140 }}>
            {[{ n: c21, l: "industries", at: cf(L18, "count", 0) }, { n: c63, l: "systems", at: cf(L18, "count", 1) }].map((x, k) => (
              <div key={k} style={{ textAlign: "center", opacity: ap(fr, x.at - 3, 6) }}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 300, letterSpacing: "-0.06em", lineHeight: 0.95, transform: `scale(${0.6 + 0.4 * pop(fr, x.at, 200, 12)})` }}><GText>{x.n}</GText></div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: "-0.02em" }}>{x.l}</div>
              </div>
            ))}
          </AbsoluteFill>
          <Sparkle at={cf(L18, "ding", 0)} x={680} y={520} n={10} r={260} />
          <Sparkle at={cf(L18, "ding", 1)} x={1240} y={520} n={10} r={260} />
        </Phase>
        {/* not a generic template */}
        <Phase a={ls(L19) - 4} b={le(L19) + 6}>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 330 }}>
            <KText line={L19} size={66} maxWidth={1600} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 960 - 170, top: 520, opacity: 1 - fan }}>
            <Card style={{ width: 340, height: 300, padding: 30, display: "flex", flexDirection: "column", gap: 18, background: "#FBFAFF" }}>
              {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ height: 24, borderRadius: 12, background: "#ECE8F6", width: `${90 - k * 12}%` }} />)}
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 26, color: C.mute, marginTop: "auto" }}>generic template</div>
            </Card>
            {fr >= cf(L19, "stamp") - 1 && (
              <div style={{ position: "absolute", left: 40, top: 80, transform: `rotate(-14deg) scale(${2 - pop(fr, cf(L19, "stamp"), 320, 14)})`, opacity: Math.min(1, pop(fr, cf(L19, "stamp")) * 2), border: `8px solid ${C.mag}`, borderRadius: 20, padding: "6px 30px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 80, color: C.mag, background: "rgba(255,255,255,0.85)" }}>NOPE</div>
            )}
          </div>
          {fan > 0.01 && FAN.map((s, k) => {
            const ang = (k - 3) * 11 * fan;
            return (
              <div key={s} style={{ position: "absolute", left: 960 - 130, top: 560, transformOrigin: "50% 160%", transform: `rotate(${ang}deg) translateY(${(1 - fan) * 120}px)`, opacity: fan }}>
                <CoverIn slug={s} />
              </div>
            );
          })}
          <Sparkle at={cf(L19, "sparkle")} x={960} y={640} n={14} r={460} />
        </Phase>
      </Phase>
      <Confetti at={hit} x={960} y={430} n={90} spread={1100} />
    </>
  );
};
import { CoverImg } from "./ui";
const CoverIn: React.FC<{ slug: string }> = ({ slug }) => <CoverImg slug={slug} width={260} />;
