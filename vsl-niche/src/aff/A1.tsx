import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { ap, C, cf, cl, ez, FONT, GRAD, le, li, LINES, ls, pop, SCENES, sceneStart } from "../home/lib";
import { Phase } from "../home/S1";
import { Card, Chip, Confetti, CoverImg, GText, Icon, IconBubble, KText, Logo, Pop, Rings, Sparkle, Wordmark } from "../home/ui";
import { Floaters, KitBox, Stage } from "./three";

const Top: React.FC<{ line: number; size?: number; y?: number }> = ({ line, size = 64, y = 120 }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: y }}><KText line={line} size={size} maxWidth={1700} sent maxLines={2} /></AbsoluteFill>
);
const Mid: React.FC<{ line: number; size?: number }> = ({ line, size = 110 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><KText line={line} size={size} maxWidth={1700} maxLines={3} /></AbsoluteFill>
);
/** the current line among a list (by start time) */
const cur = (fr: number, ls_: number[]) => [...ls_].reverse().find((l) => fr >= ls(l) - 4) ?? ls_[0];

// ================= CHAPTER RAIL + CARD =================
export const CH: [string, string][] = [["what", "The product"], ["problem", "The problem"], ["why", "Why promote it"], ["money", "Commission"], ["how", "How it works"], ["kit", "Niche kits"], ["master", "Master kit"], ["launch", "Launch"], ["email", "Email"], ["rules", "The rules"], ["faq", "Honest answers"], ["cta", "Join"]];
export const Rail: React.FC = () => {
  const fr = useCurrentFrame();
  const idx = CH.reduce((a, [s], k) => (SCENES.includes(s) && fr >= sceneStart(s) ? k : a), -1);
  if (idx < 0) return null;
  const inA = ap(fr, sceneStart("what"), 14);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 26, display: "flex", alignItems: "center", gap: 10, opacity: inA, transform: `translateY(${(1 - inA) * -30}px)` }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 24, color: C.ink, marginRight: 10, whiteSpace: "nowrap" }}><GText>{String(idx + 1).padStart(2, "0")}</GText> / 12</div>
      {CH.map(([s, t], k) => (
        <div key={s} style={{ flex: k === idx ? 3.2 : 1, height: k === idx ? 34 : 10, borderRadius: 17, background: k === idx ? GRAD : k < idx ? "#FFB48A" : "#E2E2E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "none" }}>
          {k === idx && <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 18, color: "#FFFFFF", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{t.toUpperCase()}</span>}
        </div>
      ))}
    </div>
  );
};
/** a 3D folder card flips in at each chapter start, then flies up into the rail */
export const ChapterCards: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <>
      {CH.map(([s, t], k) => {
        if (!SCENES.includes(s)) return null;
        const a = sceneStart(s) - 50;
        const d = fr - a;
        if (d < 0 || d > 40) return null;
        const flip = interpolate(d, [0, 12], [-95, 0], { ...cl, easing: ez });
        const fly = interpolate(d, [24, 40], [0, 1], { ...cl, easing: ez });
        return (
          <AbsoluteFill key={s} style={{ alignItems: "center", justifyContent: "center", perspective: 1600, pointerEvents: "none" }}>
            <div style={{ transform: `translateY(${fly * -470}px) scale(${1 - fly * 0.75}) rotateY(${flip}deg)`, opacity: 1 - fly, transformStyle: "preserve-3d" }}>
              <div style={{ position: "relative", width: 760, height: 300, borderRadius: 30, background: C.surf, border: `3px solid ${C.mag}`, boxShadow: "0 50px 90px -30px rgba(255,94,26,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ position: "absolute", top: -46, left: 40, width: 220, height: 56, borderRadius: "18px 18px 0 0", background: GRAD }} />
                <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 30, letterSpacing: "0.35em", color: C.pur }}>CHAPTER {String(k + 1).padStart(2, "0")}</div>
                <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 96, lineHeight: 1 }}><GText>{t}</GText></div>
              </div>
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

// ================= OPEN =================
const HYPE = [["$10K a month!", "dollar"], ["Secret system", "spark"], ["Only today!", "bolt"], ["Fake screenshot", "chart"]];
export const Open: React.FC = () => {
  const fr = useCurrentFrame();
  const [L0, L1, L2, L3, L4, L5] = ["If you've ever", "Half the offers", "And when you finally", "This is the opposite", "A real product", "Let me open"].map(li);
  const away = ap(fr, cf(L3, "whoosh"), 16);
  const drop = cf(L4, "impact");
  const openT = interpolate(fr, [cf(L5, "doors"), cf(L5, "doors") + 24], [0, 1], { ...cl, easing: ez });
  const boxIn = interpolate(fr, [drop - 14, drop], [6, 0], { ...cl, easing: Easing2 });
  const sq = fr >= drop && fr < drop + 10 ? 1 - Math.sin(((fr - drop) / 10) * Math.PI) * 0.12 : 1;
  const stamps = [cf(L1, "stamp", 0), cf(L1, "stamp", 1), cf(L1, "stamp", 1) + 4, cf(L1, "stamp", 2)];
  return (
    <>
      {/* 3D layer: floaters always, kit box from the drop */}
      <AbsoluteFill style={{ opacity: ap(fr, ls(L0) - 10, 20) }}>
        <Stage>
          <Floaters fr={fr} spread={1.32} />
          {fr >= drop - 16 && <KitBox open={openT} rotY={0.5 + Math.sin(fr / 60) * 0.12} y={-1.0 + boxIn} scale={0.95 * sq} />}
        </Stage>
      </AbsoluteFill>
      {fr >= cf(L5, "doors") && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 960 - 520, top: 40, width: 1040, height: 560, background: "#FF8A3D50", filter: "blur(60px)", borderRadius: "50%", opacity: openT, transform: `scaleY(${0.6 + 0.4 * openT})`, transformOrigin: "bottom" }} />
        </AbsoluteFill>
      )}
      <Rings at={drop} x={960} y={640} n={3} />
      <Confetti at={cf(L5, "chime")} x={960} y={420} n={90} spread={1100} />
      <Sparkle at={cf(L5, "chime")} x={960} y={380} n={14} r={420} />
      {/* text */}
      <Phase a={ls(L0) - 6} b={ls(L4) - 4}>
        {fr < ls(L1) - 4 ? <Mid line={L0} size={96} /> : <Top line={cur(fr, [L1, L2, L3])} size={64} y={110} />}
        {/* hype cards in 3D */}
        <AbsoluteFill style={{ perspective: 1800 }}>
          {HYPE.map(([t, ic], k) => {
            const at = ls(L1) + k * 5;
            const s = pop(fr, at, 200, 13);
            if (fr < at - 1 || fr < ls(L1) - 4) return null;
            const st = stamps[k];
            const x = 260 + k * 370 + away * (k - 1.5) * 900;
            const y = 420 + (k % 2) * 90 - away * 700;
            return (
              <div key={k} style={{ position: "absolute", left: x, top: y, transform: `rotateY(${(k - 1.5) * -14 + away * 200}deg) rotateZ(${(k - 1.5) * 4}deg) scale(${0.6 + 0.4 * Math.min(1.1, s)})`, opacity: Math.min(1, s * 1.5) * (1 - away) }}>
                <div style={{ width: 330, height: 310, borderRadius: 26, background: "#FFFFFF", border: "2px solid #E2E2E6", padding: 30, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 30px 60px -30px rgba(11,11,12,0.22)" }}>
                  <Icon name={ic} size={58} color="#8A8A92" />
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: "#6B6B73", lineHeight: 1.1 }}>{t}</div>
                </div>
                {fr >= st - 1 && (
                  <div style={{ position: "absolute", left: 60, top: 205, transform: `rotate(-8deg) scale(${2 - Math.min(1, pop(fr, st, 320, 14))})`, opacity: Math.min(1, pop(fr, st) * 2), border: `7px solid ${C.mag}`, borderRadius: 18, padding: "2px 24px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, color: C.mag, background: "rgba(255,255,255,0.95)" }}>NOPE</div>
                )}
              </div>
            );
          })}
          {fr >= cf(L2, "glitch") - 2 && fr < ls(L3) + 6 && (
            <div style={{ position: "absolute", left: 960 - 230, top: 760, opacity: ap(fr, cf(L2, "glitch") - 2, 8) * (1 - ap(fr, ls(L3), 6)), transform: `translateX(${fr < cf(L2, "glitch") + 8 ? Math.sin(fr * 5) * 8 : 0}px)` }}>
              <div style={{ width: 460, height: 120, borderRadius: 24, border: "4px dashed #C4C4CB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: "#6B6B73" }}>nothing real to promote with</div>
            </div>
          )}
        </AbsoluteFill>
      </Phase>
      <Phase a={ls(L4) - 4} b={le(L5) + 8}>
        <Top line={fr < ls(L5) - 4 ? L4 : L5} size={fr < ls(L5) - 4 ? 58 : 84} y={70} />
      </Phase>
    </>
  );
};
const Easing2 = (t: number) => 1 - Math.pow(1 - t, 3);

// ================= WHAT =================
export const What: React.FC = () => {
  const fr = useCurrentFrame();
  const L = ["ProfitIQS makes", "Twenty-one industries", "Every product is", "The owner enters", "It ships with", "And every edition", "Essential is", "One payment"].map(li);
  const LX = li("It's built for owners");
  const [L6, L7, L8, L9, L10, L11, L12, L13] = L;
  const cnt = (k: number, n: number) => Math.round(interpolate(fr, [cf(L7, "count", k), cf(L7, "count", k) + 16], [0, n], { ...cl, easing: ez }));
  const CYCLE = ["plumbing-contractor", "hvac", "dental-practice", "restaurant", "airbnb", "ecommerce", "roofing", "lawn-care", "auto-repair", "construction", "small-business", "1099"];
  return (
    <>
      <Phase a={ls(L6) - 6} b={ls(L7) - 4}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${0.5 + 0.5 * pop(fr, ls(L6), 200, 12)})` }}><Logo size={180} /><Wordmark size={130} /></div>
          <div style={{ height: 40 }} />
          <KText line={L6} size={58} maxWidth={1500} />
          <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
            <Pop at={cf(L6, "pop", 0)}><Chip col={C.grn} size={40}><Icon name="sheet" size={44} color={C.grn} /> Excel</Chip></Pop>
            <Pop at={cf(L6, "pop", 1)}><Chip col={C.mag} size={40}><Icon name="spark" size={44} color={C.mag} /> one industry each</Chip></Pop>
          </div>
        </AbsoluteFill>
      </Phase>
      <Phase a={ls(L7) - 4} b={ls(L8) - 4} exit="zoom">
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120, perspective: 1600 }}>
          {[{ n: cnt(0, 21), l: "industries", at: cf(L7, "count", 0) }, { n: 3, l: "editions each", at: cf(L7, "pop") }, { n: cnt(1, 63), l: "products", at: cf(L7, "count", 1) }].map((x, k) => {
            const r = interpolate(fr, [x.at - 2, x.at + 12], [-90, 0], { ...cl, easing: ez });
            return (
              <React.Fragment key={k}>
                {k > 0 && <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 96, color: "#FFB48A", opacity: ap(fr, x.at - 4, 6) }}>{k === 1 ? "×" : "="}</div>}
                <div style={{ textAlign: "center", transform: `rotateX(${r}deg)`, opacity: ap(fr, x.at - 3, 6) }}>
                  <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 208, letterSpacing: "-0.03em", lineHeight: 0.95 }}><GText>{x.n}</GText></div>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 48, color: C.ink }}>{x.l}</div>
                </div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      </Phase>
      <Phase a={ls(L8) - 4} b={ls(L12) - 4}>
        <Top line={cur(fr, [L8, L9, L10, L11, LX])} size={54} y={110} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 36 }}>
          {[{ t: "Dashboards", i: "dash", at: cf(L8, "pop", 0), c: C.mag }, { t: "Reports", i: "chart", at: cf(L8, "pop", 1), c: C.pur }, { t: "Tax set-aside estimate", i: "tax", at: cf(L8, "pop", 2), c: C.cya }, { t: "Formulas do the rest", i: "calc", at: cf(L9, "ding"), c: C.grn }].map((x, k) => (
            <Pop key={k} at={x.at} from={60}>
              <Card style={{ width: 380, height: 300, padding: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `perspective(1200px) rotateY(${(k - 1.5) * -6}deg)` }} glow={`${x.c}66`}>
                <IconBubble name={x.i} size={110} col={x.c} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: C.ink, lineHeight: 1.1 }}>{x.t}</div>
              </Card>
            </Pop>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", gap: 30 }}>
          {fr >= ls(L9) - 4 && <Pop at={cf(L9, "type")}><Chip col={C.pur} size={36}><Icon name="people" size={42} color={C.pur} /> the owner enters their numbers</Chip></Pop>}
          {fr >= ls(L10) - 4 && <Pop at={cf(L10, "pop")}><Chip col={C.cya} size={36}><Icon name="data" size={42} color={C.cya} /> sample data included</Chip></Pop>}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", gap: 30 }}>
          {fr >= ls(L11) - 4 && <Pop at={cf(L11, "pop", 0)}><Chip col={C.mag} size={36}><Icon name="rocket" size={42} color={C.mag} /> Quick Start</Chip></Pop>}
          {fr >= ls(L11) - 4 && <Pop at={cf(L11, "pop", 1)}><Chip col={C.pur} size={36}><Icon name="book" size={42} color={C.pur} /> Field Guide</Chip></Pop>}
          {fr >= ls(LX) - 4 && <Pop at={cf(LX, "pop")}><Chip col={C.grn} size={36}><Icon name="check" size={42} color={C.grn} /> for experts in their trade, not spreadsheets</Chip></Pop>}
        </div>
      </Phase>
      <Phase a={ls(L12) - 4} b={le(L13) + 8}>
        <Top line={fr < ls(L13) - 4 ? L12 : L13} size={54} y={100} />
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 60, perspective: 1800, paddingTop: 80 }}>
          {([["Essential", "$97", cf(L12, "cash", 0), C.cya], ["Elite", "$197", cf(L12, "cash", 1), C.pur], ["Complete", "$249", cf(L12, "cash", 2), C.mag]] as const).map(([t, p, at, col], k) => {
            const r = interpolate(fr, [at - 10, at + 6], [180, 0], { ...cl, easing: ez });
            const idx = Math.floor(Math.max(0, fr - at) / 16 + k * 4) % CYCLE.length;
            return (
              <div key={t} style={{ transform: `rotateY(${r}deg) translateY(${k === 1 ? -20 : 0}px)`, opacity: fr >= at - 10 ? 1 : 0, backfaceVisibility: "hidden" }}>
                <Card style={{ width: 420, padding: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }} glow={`${col}66`}>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink }}>{t}</div>
                  <CoverImg slug={CYCLE[idx]} tier={t} width={200} />
                  <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 74, letterSpacing: "-0.03em", lineHeight: 1 }}><GText>{p}</GText></div>
                </Card>
              </div>
            );
          })}
        </AbsoluteFill>
        {fr >= ls(L13) - 4 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", justifyContent: "center", gap: 26 }}>
            <Pop at={cf(L13, "pop", 0)}><Chip col={C.grn} size={32}><Icon name="check" size={36} color={C.grn} /> one payment</Chip></Pop>
            <Pop at={cf(L13, "stamp")}><Chip col={C.mag} size={32}><Icon name="x" size={36} color={C.mag} /> no subscription</Chip></Pop>
            <Pop at={cf(L13, "pop", 1)}><Chip col={C.cya} size={32}><Icon name="laptop" size={36} color={C.cya} /> desktop Microsoft Excel</Chip></Pop>
          </div>
        )}
      </Phase>
    </>
  );
};

// ================= PROBLEM =================
const PAIRS = [
  { p: "So a plumber", a: "ProfitIQS gives him a Callback", slug: "plumbing-contractor", trade: "PLUMBERS", icon: "wrench", prob: "Callbacks eating the margin", chips: ["Callback Tracker", "Job Profitability Center"], col: C.cya },
  { p: "A restaurant owner", a: "ProfitIQS gives her a Prime", slug: "restaurant", trade: "RESTAURANTS", icon: "plate", prob: "Where did prime cost land?", chips: ["Prime Cost Center", "Menu Intelligence Center"], col: C.mag },
  { p: "A landlord", a: "ProfitIQS gives him cap", slug: "rental-portfolio", trade: "LANDLORDS", icon: "house", prob: "Which property drags the rest?", chips: ["Cap Rate Center", "Cash-on-Cash Return", "DSCR Center"], col: C.pur },
  { p: "A dental practice", a: "ProfitIQS gives it a Case", slug: "dental-practice", trade: "DENTAL PRACTICES", icon: "tooth", prob: "Treatment presented, never accepted", chips: ["Case Acceptance Center", "Recall Tracker", "Provider Productivity"], col: C.cya },
  { p: "And an owner-operator", a: "ProfitIQS gives him profit", slug: "trucking-owner-operator", trade: "OWNER-OPERATORS", icon: "truck", prob: "Which loads actually paid?", chips: ["Load Profitability Analyzer", "Mileage Tracker"], col: C.mag },
];
const ALL21 = ["plumbing-contractor", "hvac", "electrical-contractor", "roofing", "landscaping", "lawn-care", "pest-control", "cleaning-service", "construction", "auto-repair", "manufacturing", "digital-marketing-agency", "airbnb", "ecommerce", "dental-practice", "restaurant", "trucking-owner-operator", "property-management", "rental-portfolio", "1099", "small-business"];
export const Problem: React.FC = () => {
  const fr = useCurrentFrame();
  const [L14, L15, L16, L27, L28] = ["Here's why owners", "Small-business owners", "The data exists", "That's the pattern", "Which matters to you"].map(li);
  const P = PAIRS.map((x) => ({ ...x, lp: li(x.p), la: li(x.a) }));
  const idx = P.reduce((a, x, k) => (fr >= ls(x.lp) - 8 ? k : a), -1);
  // 3D ring of the five covers, rotating the current one to the front
    const docs = [["Invoices", "doc", C.pur], ["Receipts", "receipt", C.mag], ["Bank statements", "bank", C.cya], ["Apps", "phone", C.pur]] as const;
  return (
    <>
      <Phase a={ls(L14) - 6} b={ls(P[0].lp) - 8}>
        {fr < ls(L15) - 4 ? <Mid line={L14} size={110} /> : <Top line={fr < ls(L16) - 4 ? L15 : L16} size={62} y={150} />}
        {fr >= ls(L16) - 4 && docs.map(([t, ic, c], k) => {
          const at = cf(L16, "pop", k);
          const ch = ap(fr, cf(L16, "glitch"), 18);
          return (
            <Pop key={k} at={at} from={60} style={{ position: "absolute", left: 230 + k * 390 + ch * Math.sin(fr / 6 + k) * 60, top: 520 + (k % 2) * 110 + ch * Math.cos(fr / 7 + k) * 50, transform: `rotate(${ch * (k % 2 ? 9 : -8)}deg)` }}>
              <Card style={{ width: 330, padding: 24, display: "flex", alignItems: "center", gap: 18 }} glow={`${c}55`}><IconBubble name={ic} size={76} col={c} /><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, color: C.ink }}>{t}</div></Card>
            </Pop>
          );
        })}
        {fr >= ls(L15) - 4 && fr < ls(L16) - 4 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 200 }}>
            <Pop at={cf(L15, "hit")}><div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 200 }}><GText>kept?</GText></div></Pop>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={ls(P[0].lp) - 8} b={ls(L27) - 4}>
        {/* one crisp, flat hero cover per trade: whips in from the right, old one exits left */}
        {P.map((x, k) => {
          const inT = interpolate(fr, [ls(x.lp) - 10, ls(x.lp) + 6], [0, 1], { ...cl, easing: ez });
          const nx = P[k + 1];
          const outT = nx ? interpolate(fr, [ls(nx.lp) - 10, ls(nx.lp) + 2], [0, 1], { ...cl, easing: ez }) : 0;
          if (inT <= 0 || outT >= 1) return null;
          const x0 = (1 - inT) * 900 - outT * 900;
          return (
            <div key={k} style={{ position: "absolute", left: 960 - 200 + x0, top: 230, width: 400, opacity: Math.min(inT * 1.5, 1 - outT), transform: `rotate(${(1 - inT) * 6 - outT * 6}deg)` }}>
              <div style={{ position: "absolute", left: 30, right: 30, bottom: -26, height: 40, borderRadius: "50%", background: "rgba(11,11,12,0.12)", filter: "blur(10px)" }} />
              <CoverImg slug={x.slug} width={400} />
            </div>
          );
        })}
        {P.map((x, k) => {
          if (k !== idx) return null;
          const answered = fr >= ls(x.la) - 4;
          return (
            <React.Fragment key={k}>
              <div style={{ position: "absolute", left: 80, top: 260, width: 520 }}>
                <Pop at={ls(x.lp)}><Chip col={x.col} size={32}><Icon name={x.icon} size={38} color={x.col} /> {x.trade}</Chip></Pop>
                <div style={{ height: 30 }} />
                <Pop at={cf(x.lp, "pop")} from={40}>
                  <Card style={{ padding: "30px 32px", background: answered ? "#FFFFFF" : C.pinkL, border: `2px solid ${answered ? C.line : "#F2A9A4"}`, opacity: answered ? 0.6 : 1 }} glow="rgba(255,61,46,0.35)">
                    <div style={{ display: "flex", gap: 18 }}>
                      <div style={{ width: 54, height: 54, borderRadius: 16, background: answered ? C.grnL : "#FDECEB", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={answered ? "check" : "x"} size={34} color={answered ? C.grn : C.pink} /></div>
                      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink, lineHeight: 1.15, textDecoration: answered ? "line-through" : "none", textDecorationColor: C.pink }}>{x.prob}</div>
                    </div>
                  </Card>
                </Pop>
              </div>
              <div style={{ position: "absolute", left: 1320, top: 250, width: 540, display: "flex", flexDirection: "column", gap: 22 }}>
                {answered && <Pop at={cf(x.la, "sparkle")}><div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 32, letterSpacing: "0.25em", color: x.col }}>THE ANSWER</div></Pop>}
                {x.chips.map((c, q) => (
                  <Pop key={q} at={cf(x.la, "pop", q)} from={40}>
                    <Card style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 24px", borderLeft: `8px solid ${[C.mag, C.pur, C.cya][q]}` }} glow={`${x.col}55`}>
                      <IconBubble name="sheet" size={66} col={[C.mag, C.pur, C.cya][q]} />
                      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.15 }}>{c}</div>
                    </Card>
                  </Pop>
                ))}
              </div>
              {answered && <Sparkle at={cf(x.la, "sparkle")} x={960} y={500} n={12} r={300} />}
            </React.Fragment>
          );
        })}
      </Phase>
      {/* all 21 covers on a spinning 3D ring */}
      <Phase a={ls(L27) - 4} b={le(L28) + 8}>
        <Top line={fr < ls(L28) - 4 ? L27 : L28} size={52} y={100} />
        {/* all 21 covers, flat and sharp, dealt onto a 7 x 3 grid */}
        <div style={{ position: "absolute", left: 960 - 597, top: 236, width: 1194, display: "flex", flexWrap: "wrap", gap: 24 }}>
          {ALL21.map((sl, k) => {
            const at = cf(L27, "chime") - 10 + k * 1.5;
            const t = interpolate(fr, [at, at + 10], [0, 1], { ...cl, easing: ez });
            return (
              <div key={sl} style={{ width: 150, opacity: t, transform: `translateY(${(1 - t) * 60}px) scale(${0.85 + 0.15 * t})` }}>
                <CoverImg slug={sl} width={150} />
              </div>
            );
          })}
        </div>
        {fr >= ls(L28) - 4 && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
            <Pop at={cf(L28, "pop")}><Chip col={C.mag} size={40}><Icon name="phone" size={44} color={C.mag} /> the problems people stop scrolling for</Chip></Pop>
          </AbsoluteFill>
        )}
      </Phase>
    </>
  );
};

// ================= WHY =================
export const Why: React.FC = () => {
  const fr = useCurrentFrame();
  const [L29, L30, L31, L32, L33, L34] = ["Four things make", "One: every product", "Two: three price", "Three: it's a one-time", "And four: the sample", "And every kit tells"].map(li);
  const R = [
    { n: 1, t: "One industry each", d: "match the niche to your audience", i: "spark", at: cf(L30, "pop"), c: C.mag },
    { n: 2, t: "Three price points", d: "Essential, Elite, Complete", i: "card", at: cf(L31, "pop"), c: C.pur },
    { n: 3, t: "One-time payment", d: "not a subscription", i: "check", at: cf(L32, "pop"), c: C.cya },
    { n: 4, t: "Demo-ready", d: "sample data, day one", i: "play", at: cf(L33, "pop"), c: C.mag },
  ];
  return (
    <Phase a={ls(L29) - 6} b={le(L34) + 8}>
      {fr < ls(L30) - 4 ? <Mid line={L29} size={100} /> : <Top line={cur(fr, [L30, L31, L32, L33, L34])} size={50} y={100} />}
      {fr >= ls(L30) - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: fr >= ls(L34) - 4 ? 260 : 300, display: "flex", justifyContent: "center", gap: 34, perspective: 1600 }}>
          {R.map((r, k) => {
            const flip = interpolate(fr, [r.at - 6, r.at + 10], [180, 0], { ...cl, easing: ez });
            const shown = fr >= r.at - 6;
            return (
              <div key={k} style={{ width: 400, height: 470, position: "relative", transformStyle: "preserve-3d", transform: `rotateY(${shown ? flip : 180}deg)` }}>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                  <Card style={{ height: "100%", padding: 30, display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }} glow={`${r.c}66`}>
                    <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 72, lineHeight: 1, letterSpacing: "-0.03em" }}><GText>{r.n}</GText></div>
                    <IconBubble name={r.i} size={80} col={r.c} />
                    <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 38, color: C.ink, lineHeight: 1.1 }}>{r.t}</div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, color: C.ink2 }}>{r.d}</div>
                  </Card>
                </div>
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 28, background: "#F3F3F5", border: `2px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.serif, fontWeight: 700, fontSize: 160, color: "#FFFFFF" }}>{r.n}</div>
              </div>
            );
          })}
        </div>
      )}
      {fr >= ls(L34) - 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 24 }}>
          {[["The owner-operator", "wrench"], ["The growing company", "people"], ["The office manager", "briefcase"]].map(([t, i], q) => (
            <Pop key={q} at={cf(L34, "pop", q)}><Chip col={[C.cya, C.pur, C.mag][q]} size={36}><Icon name={i} size={42} color={[C.cya, C.pur, C.mag][q]} /> {t}</Chip></Pop>
          ))}
        </div>
      )}
    </Phase>
  );
};
export { cur, Top, Mid };
export const _unused = [random, GRAD, LINES];
