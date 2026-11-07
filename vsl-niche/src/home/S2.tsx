import React from "react";
import { AbsoluteFill, interpolate, staticFile, Img, useCurrentFrame } from "remotion";
import { ap, C, cf, cl, ez, FONT, GRAD, le, li, LINES, ls, pop, TOTAL, wf } from "./lib";
import { Phase } from "./S1";
import { Card, Chip, Confetti, CoverImg, GText, Icon, IconBubble, KText, Logo, Pop, Rings, Sparkle, Wordmark } from "./ui";

// ================= EXPERTS IN THEIR TRADE (end of reveal) =================
export const Experts: React.FC = () => {
  const fr = useCurrentFrame();
  const L = li("Built for people");
  return (
    <Phase a={ls(L) - 4} b={le(L) + 6}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <KText line={L} size={70} maxWidth={1500} />
        <div style={{ display: "flex", gap: 60, marginTop: 80, alignItems: "center" }}>
          <Pop at={cf(L, "pop")}><Chip col={C.grn} size={44}><Icon name="check" size={44} color={C.grn} /> experts in their trade</Chip></Pop>
          <Pop at={cf(L, "swish")}><Chip col={C.pink} size={44}><span style={{ textDecoration: "line-through", textDecorationColor: C.pink, color: C.ink2 }}>spreadsheet experts</span></Chip></Pop>
        </div>
      </AbsoluteFill>
    </Phase>
  );
};

// ================= SHOWROOM =================
const NICHES = [
  { slug: "plumbing-contractor", trade: "PLUMBERS", icon: "wrench", n: 48, p: "Plumbers:", a: "Here's a Callback", chips: [["Callback", "Callback Tracker"], ["Job", "Job Profitability Center"]], col: C.cya },
  { slug: "restaurant", trade: "RESTAURANTS", icon: "plate", n: 28, p: "Restaurants:", a: "Here's a Prime", chips: [["Prime", "Prime Cost Center"], ["Menu", "Menu Intelligence Center"]], col: C.mag },
  { slug: "dental-practice", trade: "DENTAL PRACTICES", icon: "tooth", n: 42, p: "Dental practices:", a: "Here's case", chips: [["case", "Case Acceptance Center"], ["recall", "Recall Tracker"], ["provider", "Provider Productivity"]], col: C.pur },
  { slug: "trucking-owner-operator", trade: "OWNER-OPERATORS", icon: "truck", n: 26, p: "Owner-operators:", a: "Here's profit on", chips: [["profit", "Load Profitability Analyzer"], ["cost", "Mileage Tracker"]], col: C.cya },
  { slug: "rental-portfolio", trade: "RENTAL INVESTORS", icon: "house", n: 46, p: "Rental investors:", a: "Here's cap rate", chips: [["cap", "Cap Rate Center"], ["cash-on-cash,", "Cash-on-Cash Return"], ["DSCR,", "DSCR Center"]], col: C.mag },
  { slug: "ecommerce", trade: "ONLINE STORES", icon: "cart", n: 26, p: "Online stores:", a: "Here's profit by", chips: [["SKU,", "SKU Profitability"], ["ad", "Ad Spend Tracker"], ["returns,", "Refunds & Returns"], ["sales", "Sales Channels"]], col: C.pur },
];
const problemText = (sub: string) => sub.slice(sub.indexOf(":") + 1).trim();

const Pedestal: React.FC<{ slug: string; col: string; at: number; n: number }> = ({ slug, col, at, n }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, at, 160, 14);
  const bob = Math.sin(fr / 18) * 10;
  return (
    <div style={{ position: "relative", width: 520, height: 900 }}>
      {/* spotlight cone */}
      <div style={{ position: "absolute", left: 260 - 330, top: -120, width: 660, height: 980, background: `${col}26`, filter: "blur(26px)", clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", opacity: ap(fr, at - 6, 14) }} />
      {/* cover */}
      <div style={{ position: "absolute", left: 260 - 170, top: 90 + bob + (1 - s) * 200, transform: `perspective(1400px) rotateY(${Math.sin(fr / 30) * 10}deg) scale(${0.6 + 0.4 * Math.min(1.1, s)})`, opacity: Math.min(1, s * 1.5) }}>
        <CoverImg slug={slug} width={340} />
        <div style={{ position: "absolute", right: -26, top: -22 }}><Chip col={col} size={24}>Elite · {n} sheets</Chip></div>
      </div>
      {/* pedestal */}
      <div style={{ position: "absolute", left: 60, top: 640, width: 400, height: 230, borderRadius: "0 0 40px 40px", background: "#FFFFFF", border: `2px solid ${C.line}`, boxShadow: "0 40px 70px -30px rgba(255,94,26,0.35)" }} />
      <div style={{ position: "absolute", left: 50, top: 610, width: 420, height: 70, borderRadius: "50%", background: "#E2E2E6", border: `2px solid ${C.line}` }} />
      <div style={{ position: "absolute", left: 160, top: 860 - bob * 0.3, width: 200, height: 24, borderRadius: "50%", background: `${col}22`, filter: "blur(6px)" }} />
    </div>
  );
};

export const Showroom: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Come on in"), Lr = li("Every sheet name");
  const first = ls(li(NICHES[0].p));
  const doors = ap(fr, cf(L0, "doors"), 22);
  // which niche is on stage
  const idx = NICHES.reduce((acc, n, k) => (fr >= ls(li(n.p)) - 10 ? k : acc), -1);
  const slide = (k: number) => {
    const a = ls(li(NICHES[k].p)) - 10;
    return ap(fr, a, 18);
  };
  return (
    <>
      {/* doors + sign */}
      <Phase a={ls(L0) - 6} b={first - 10}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.8 + 0.2 * doors})`, opacity: ap(fr, cf(L0, "doors") + 6, 12), textAlign: "center" }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, letterSpacing: "0.5em", color: C.ink2, marginBottom: 10 }}>WELCOME TO THE</div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 210, lineHeight: 1 }}><GText>Showroom</GText></div>
            <div style={{ display: "flex", gap: 22, justifyContent: "center", marginTop: 40 }}>
              {["plumbing-contractor", "hvac", "dental-practice", "restaurant", "airbnb"].map((s, k) => (
                <Pop key={s} at={cf(L0, "chime") + k * 3} from={50}><CoverImg slug={s} width={150} /></Pop>
              ))}
            </div>
            {fr >= ls(Lr) - 4 && (
              <Pop at={cf(Lr, "sparkle")} style={{ marginTop: 40 }}>
                <Chip col={C.grn} size={36}><Icon name="check" size={40} color={C.grn} /> every sheet name is real, from the actual workbooks</Chip>
              </Pop>
            )}
          </div>
          <Sparkle at={cf(L0, "chime")} x={960} y={420} n={14} r={520} />
        </AbsoluteFill>
        {/* doors sliding open */}
        <div style={{ position: "absolute", left: -doors * 980, top: 0, width: 960, height: 1080, background: "#F6F6F7", borderRight: `10px solid ${C.mag}`, boxShadow: "20px 0 60px rgba(255,94,26,0.18)" }}>
          <div style={{ position: "absolute", right: 60, top: 500, width: 18, height: 120, borderRadius: 9, background: GRAD }} />
        </div>
        <div style={{ position: "absolute", left: 960 + doors * 980, top: 0, width: 960, height: 1080, background: "#F6F6F7", borderLeft: `10px solid ${C.mag}`, boxShadow: "-20px 0 60px rgba(255,94,26,0.18)" }}>
          <div style={{ position: "absolute", left: 60, top: 500, width: 18, height: 120, borderRadius: 9, background: GRAD }} />
        </div>
      </Phase>
      {/* the gallery */}
      <Phase a={first - 10} b={le(li(NICHES[5].a)) + 8}>
        {/* floor line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 890, height: 2, background: C.line }} />
        {NICHES.map((n, k) => {
          const Lp = li(n.p), La = li(n.a);
          const enter = slide(k);
          const leave = k < 5 ? slide(k + 1) : 0;
          if (k > idx + 1 || (k < idx - 1)) return null;
          const x = interpolate(enter, [0, 1], [1920, 0]) + interpolate(leave, [0, 1], [0, -1920]);
          if (enter < 0.001) return null;
          const answered = fr >= ls(La) - 4;
          return (
            <div key={k} style={{ position: "absolute", left: x, top: 0, width: 1920, height: 1080 }}>
              <div style={{ position: "absolute", left: 680, top: 24, transform: "scale(1.06)", transformOrigin: "50% 0%" }}><Pedestal slug={n.slug} col={n.col} at={ls(Lp)} n={n.n} /></div>
              {/* trade + problem (left) */}
              <div style={{ position: "absolute", left: 90, top: 250, width: 600 }}>
                <Pop at={ls(Lp)}><Chip col={n.col} size={38}><Icon name={n.icon} size={46} color={n.col} /> {n.trade}</Chip></Pop>
                <div style={{ height: 34 }} />
                <Pop at={cf(Lp, "pop")} from={40}>
                  <Card style={{ padding: "30px 32px", background: answered ? "#FFFFFF" : C.pinkL, border: `2px solid ${answered ? C.line : "#F2A9A4"}`, opacity: answered ? 0.55 : 1 }} glow="rgba(255,61,46,0.35)">
                    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                      <div style={{ width: 54, height: 54, borderRadius: 16, background: answered ? C.grnL : "#FDECEB", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={answered ? "check" : "x"} size={34} color={answered ? C.grn : C.pink} />
                      </div>
                      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 52, color: C.ink, lineHeight: 1.18, textDecoration: answered ? "line-through" : "none", textDecorationColor: C.pink }}>{problemText(LINES[Lp].sub)}</div>
                    </div>
                  </Card>
                </Pop>
              </div>
              {/* the answer: real sheet names (right) */}
              <div style={{ position: "absolute", left: 1270, top: 220, width: 610, display: "flex", flexDirection: "column", gap: 24 }}>
                {fr >= ls(La) - 4 && (
                  <Pop at={cf(La, "sparkle")}><div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 36, letterSpacing: "0.25em", color: n.col }}>THE ANSWER</div></Pop>
                )}
                {n.chips.map(([w, label], q) => (
                  <Pop key={q} at={cf(La, "pop", q)} from={40}>
                    <Card style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", borderLeft: `8px solid ${[C.mag, C.pur, C.cya, C.mag][q]}` }} glow={`${n.col}55`}>
                      <IconBubble name="sheet" size={76} col={[C.mag, C.pur, C.cya, C.mag][q]} />
                      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 42, color: C.ink, lineHeight: 1.15 }}>{label}</div>
                    </Card>
                  </Pop>
                ))}
              </div>
              {fr >= ls(La) - 4 && <Sparkle at={cf(La, "sparkle")} x={960} y={330} n={12} r={330} />}
            </div>
          );
        })}
        {/* progress dots */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", gap: 18 }}>
          {NICHES.map((n, k) => <div key={k} style={{ width: k === idx ? 46 : 16, height: 16, borderRadius: 8, background: k === idx ? GRAD : k < idx ? "#FFB48A" : C.line }} />)}
        </div>
      </Phase>
    </>
  );
};

// ================= WALL OF 21 =================
const SHOWN = [["Plumbing", "wrench"], ["Restaurants", "plate"], ["Dental", "tooth"], ["Trucking", "truck"], ["Rental property", "house"], ["Ecommerce", "cart"]];
const REST: [string, string, number, string][] = [
  ["HVAC", "snow", 0, "HVAC."], ["Electrical", "bolt", 0, "Electrical."], ["Roofing", "roof", 0, "Roofing."], ["Landscaping", "leaf", 0, "Landscaping."], ["Lawn care", "grass", 0, "Lawn"], ["Pest control", "bug", 0, "Pest"],
  ["Cleaning", "broom", 1, "Cleaning."], ["Construction", "hammer", 1, "Construction."], ["Auto repair", "car", 1, "Auto"], ["Manufacturing", "gear", 1, "Manufacturing."], ["Marketing agencies", "mega", 1, "Marketing"], ["Airbnb hosts", "bed", 1, "Airbnb"],
  ["Property managers", "building", 2, "Property"], ["1099 contractors", "briefcase", 2, "1099"], ["Small business", "store", 2, "small"],
];
export const Wall: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And that's just six"), Lw = [li("HVAC."), li("Cleaning."), li("Property managers")], Le = li("Every one built");
  const tiles = [...SHOWN.map(([t, i]) => ({ t, i, at: ls(L0) })), ...REST.map(([t, i, l, w]) => ({ t, i, at: cf(Lw[l], "up", REST.filter((r) => r[2] === l).findIndex((r) => r[3] === w)) }))];
  const done = fr >= ls(Le) - 2;
  return (
    <Phase a={ls(L0) - 6} b={le(Le) + 8}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
        <KText line={fr < ls(Lw[0]) - 4 ? L0 : done ? Le : L0} size={66} maxWidth={1700} dim={fr >= ls(Lw[0]) - 4 && !done ? 0 : 1} />
        {fr >= ls(Lw[0]) - 4 && !done && (
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 66, color: C.ink, letterSpacing: "-0.03em", marginTop: -84 }}>
            <GText>{tiles.filter((t) => fr >= t.at).length}</GText> of 21 industries
          </div>
        )}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 250, width: 1700, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 22 }}>
        {tiles.map((t, k) => {
          const lit = fr >= t.at - 1;
          const s = pop(fr, t.at, 300, 12);
          const pulse = done ? 1 + 0.05 * Math.sin((fr - ls(Le)) / 4 - k * 0.5) * Math.exp(-(fr - ls(Le)) / 40) : 1;
          return (
            <div key={k} style={{ height: 200, borderRadius: 26, background: lit ? "#FFFFFF" : "#F6F6F7", border: lit ? `3px solid ${C.mag}` : `2px dashed ${C.line}`, boxShadow: lit ? "0 20px 40px -18px rgba(255,94,26,0.45)" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transform: `scale(${(lit ? 0.85 + 0.15 * Math.min(1.12, s) : 0.92) * pulse})`, position: "relative" }}>
              <Icon name={t.i} size={64} color={lit ? [C.mag, C.pur, C.cya][k % 3] : "#B0B0B8"} />
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 25, color: lit ? C.ink : "#8A8A92", textAlign: "center", lineHeight: 1.1, padding: "0 8px" }}>{t.t}</div>
              {lit && <div style={{ position: "absolute", right: 12, top: 12, width: 32, height: 32, borderRadius: 16, background: C.grnL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={22} color={C.grn} /></div>}
            </div>
          );
        })}
      </div>
      <Confetti at={cf(Le, "sparkle")} x={960} y={560} n={80} spread={1200} />
    </Phase>
  );
};

// ================= THREE EDITIONS =================
const CYCLE = ["plumbing-contractor", "hvac", "dental-practice", "restaurant", "airbnb", "ecommerce", "roofing", "lawn-care", "auto-repair", "construction", "small-business", "1099"];
const TierCard: React.FC<{ tier: "Essential" | "Elite" | "Complete"; price: string; desc: string; enter: number; priceAt: number; col: string; k: number; ribbon?: string }> = ({ tier, price, desc, enter, priceAt, col, k, ribbon }) => {
  const fr = useCurrentFrame();
  const s = pop(fr, enter, 180, 14);
  const idx = Math.floor(Math.max(0, fr - enter) / 18 + k * 3) % CYCLE.length;
  const nxt = (idx + 1) % CYCLE.length;
  const xf = (Math.max(0, fr - enter) % 18) / 18;
  return (
    <div style={{ width: 470, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 200}px)` }}>
      <Card style={{ padding: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative" }} glow={`${col}66`}>
        {ribbon && <div style={{ position: "absolute", top: -26, right: 30, background: GRAD, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, padding: "8px 22px", borderRadius: 999, boxShadow: "0 12px 30px -10px rgba(255,94,26,0.6)" }}>{ribbon}</div>}
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 52, color: C.ink, letterSpacing: "-0.03em" }}>{tier}</div>
        <div style={{ position: "relative", width: 240, height: 320 }}>
          <div style={{ position: "absolute", opacity: 1 - (xf > 0.75 ? (xf - 0.75) * 4 : 0) }}><CoverImg slug={CYCLE[idx]} tier={tier} width={240} /></div>
          <div style={{ position: "absolute", opacity: xf > 0.75 ? (xf - 0.75) * 4 : 0 }}><CoverImg slug={CYCLE[nxt]} tier={tier} width={240} /></div>
        </div>
        <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 77, letterSpacing: "-0.03em", lineHeight: 1, transform: `scale(${fr >= priceAt - 1 ? 0.5 + 0.5 * pop(fr, priceAt, 300, 11) : 0})` }}><GText>{price}</GText></div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.ink2, textAlign: "center", minHeight: 80, opacity: ap(fr, priceAt + 4, 10) }}>{desc}</div>
      </Card>
      <Sparkle at={priceAt} x={235} y={560} n={8} r={180} />
    </div>
  );
};
export const Box: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Every system comes"), Le = li("Essential, $97"), Lx = li("Elite, $197"), Lc = li("Complete, $249"), Ls = li("Start with Essential");
  const up = ap(fr, ls(Ls) - 4, 14);
  return (
    <Phase a={ls(L0) - 6} b={le(Ls) + 8}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
        <KText line={fr < ls(Le) - 4 ? L0 : fr < ls(Ls) - 4 ? (fr < ls(Lx) - 4 ? Le : fr < ls(Lc) - 4 ? Lx : Lc) : Ls} size={58} maxWidth={1700} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center", gap: 54, alignItems: "flex-start" }}>
        <TierCard tier="Essential" price="$97" desc="The core numbers" enter={cf(L0, "whoosh")} priceAt={cf(Le, "cash")} col={C.cya} k={0} />
        <div style={{ transform: `translateY(${-24}px)` }}><TierCard tier="Elite" price="$197" desc="The full system, deeper analysis" enter={cf(L0, "whoosh") + 4} priceAt={cf(Lx, "cash")} col={C.pur} k={1} /></div>
        <TierCard tier="Complete" price="$249" desc="Both editions, together" enter={cf(L0, "whoosh") + 8} priceAt={cf(Lc, "cash")} col={C.mag} k={2} ribbon="BOTH" />
      </div>
      {up > 0.01 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: up, transform: `translateY(${(1 - up) * 40}px)` }}>
            <Pop at={cf(Ls, "pop")}><Chip col={C.cya} size={38}>Start with Essential</Chip></Pop>
            <Pop at={cf(Ls, "whoosh")}><Icon name="rocket" size={64} color={C.pur} /></Pop>
            <Pop at={cf(Ls, "whoosh") + 4}><Chip col={C.pur} size={38}>move up to Elite</Chip></Pop>
          </div>
        </AbsoluteFill>
      )}
    </Phase>
  );
};

// ================= INSIDE EVERY BOX =================
export const Inside: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And inside every box"), L1 = li("Formulas, dashboards"), L2 = li("Sample data"), L3 = li("A tax set-aside"), L4 = li("Country-based"), L5 = li("A Quick Start");
  const open = ap(fr, cf(L0, "box"), 14);
  const items = [
    { t: "Formulas", i: "calc", at: cf(L1, "pop", 0), col: C.pur },
    { t: "Dashboards", i: "dash", at: cf(L1, "pop", 1), col: C.mag },
    { t: "Reports", i: "chart", at: cf(L1, "pop", 2), col: C.cya },
    { t: "Sample data", i: "data", at: cf(L2, "pop"), col: C.pur },
    { t: "Tax set-aside estimate", i: "tax", at: cf(L3, "pop"), col: C.mag },
    { t: "Country tax presets", i: "spark", at: cf(L4, "pop", 0), col: C.cya },
    { t: "Quick Start", i: "rocket", at: cf(L5, "pop", 0), col: C.pur },
    { t: "Field Guide", i: "book", at: cf(L5, "pop", 1), col: C.mag },
  ];
  const lineNow = [L5, L4, L3, L2, L1, L0].find((l) => fr >= ls(l) - 4) ?? L0;
  return (
    <Phase a={ls(L0) - 6} b={le(L5) + 8}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
        <KText line={lineNow} size={58} maxWidth={1700} />
      </AbsoluteFill>
      {/* the box */}
      <div style={{ position: "absolute", left: 960 - 190, top: 760, width: 380, height: 230 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "#E2E2E6", border: `3px solid #B0B0B8`, boxShadow: "0 40px 70px -30px rgba(255,94,26,0.5)" }} />
        <div style={{ position: "absolute", left: 150, top: 0, width: 80, height: 230, background: C.mag }} />
        <div style={{ position: "absolute", left: -10, top: -40, width: 200, height: 46, borderRadius: 14, background: "#D0D0D6", border: "3px solid #B0B0B8", transformOrigin: "left bottom", transform: `rotate(${-open * 120}deg)` }} />
        <div style={{ position: "absolute", left: 190, top: -40, width: 200, height: 46, borderRadius: 14, background: "#D0D0D6", border: "3px solid #B0B0B8", transformOrigin: "right bottom", transform: `rotate(${open * 120}deg)` }} />
        <div style={{ position: "absolute", left: 40, top: -160, width: 300, height: 200, background: "#FFB21E55", filter: "blur(40px)", borderRadius: "50%", opacity: open }} />
      </div>
      {items.map((it, k) => {
        const s = pop(fr, it.at, 170, 14);
        if (fr < it.at - 1) return null;
        const col = k % 4, row = Math.floor(k / 4);
        const tx = 110 + col * 435, ty = 220 + row * 250;
        const x = interpolate(Math.min(1, s), [0, 1], [960 - 180, tx]);
        const y = interpolate(Math.min(1, s), [0, 1], [760, ty]);
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, transform: `scale(${0.4 + 0.6 * Math.min(1.1, s)}) rotate(${(1 - Math.min(1, s)) * 30}deg)` }}>
            <Card style={{ width: 400, padding: "28px 28px", display: "flex", alignItems: "center", gap: 20 }} glow={`${it.col}55`}>
              <IconBubble name={it.i} size={86} col={it.col} />
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
            </Card>
          </div>
        );
      })}
      <Sparkle at={cf(L0, "box")} x={960} y={740} n={12} r={260} />
    </Phase>
  );
};

// ================= HOW IT WORKS =================
export const How: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And using it"), L1 = li("Step one"), L2 = li("Step two"), L3 = li("Step three");
  const act = fr >= ls(L3) - 4 ? 2 : fr >= ls(L2) - 4 ? 1 : fr >= ls(L1) - 4 ? 0 : -1;
  const click = cf(L1, "click"), type = cf(L2, "type"), upd = cf(L3, "ding");
  const Step: React.FC<{ k: number; title: string; at: number; children: React.ReactNode }> = ({ k, title, at, children }) => {
    const s = pop(fr, at, 200, 14);
    const on = act === k;
    return (
      <div style={{ width: 520, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 120 + (on ? -20 : 0)}px) scale(${on ? 1.04 : 1})` }}>
        <Card style={{ padding: 30, height: 560, display: "flex", flexDirection: "column", gap: 20, border: on ? `3px solid ${C.mag}` : `2px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: FONT.num, fontWeight: 900, fontSize: 72, lineHeight: 1, letterSpacing: "-0.03em" }}><GText>{k + 1}</GText></div>
            <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.1 }}>{title}</div>
          </div>
          <div style={{ flex: 1, borderRadius: 20, background: "#F6F6F7", border: `2px solid ${C.line}`, position: "relative", overflow: "hidden" }}>{children}</div>
        </Card>
      </div>
    );
  };
  const rows = 6;
  return (
    <Phase a={ls(L0) - 6} b={le(L3) + 8}>
      {act < 0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><KText line={L0} size={130} maxWidth={1700} /></AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
          <KText line={[L0, L1, L2, L3][act + 1]} size={56} maxWidth={1700} />
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", gap: 50 }}>
        <Step k={0} title="Open it" at={ls(L1) - 4}>
          {/* file icon gets clicked, window opens on a live dashboard */}
          <div style={{ position: "absolute", left: 140, top: 60, opacity: 1 - ap(fr, click + 4, 8), transform: `scale(${fr >= click && fr < click + 4 ? 0.9 : 1})` }}>
            <IconBubble name="sheet" size={170} col={C.grn} bg="#E5F7EC" />
          </div>
          <div style={{ position: "absolute", left: 300 + Math.max(0, 40 - (fr - ls(L1)) * 2), top: 200 - Math.max(0, 40 - (fr - ls(L1)) * 2), opacity: 1 - ap(fr, click + 4, 8) }}><Icon name="play" size={56} color={C.ink} /></div>
          <div style={{ position: "absolute", inset: 20, opacity: ap(fr, click + 4, 10), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[C.mag, C.pur, C.cya, C.mag].map((c, q) => (
              <div key={q} style={{ borderRadius: 14, background: "#FFFFFF", border: `2px solid ${C.line}`, padding: 14, display: "flex", alignItems: "flex-end", gap: 8 }}>
                {[0.4, 0.7, 0.55, 0.9].map((h, z) => <div key={z} style={{ flex: 1, height: `${h * 100 * ap(fr, click + 8 + z * 2 + q * 3, 12)}%`, borderRadius: 6, background: c, opacity: 0.75 }} />)}
              </div>
            ))}
          </div>
        </Step>
        <Step k={1} title="Enter your numbers" at={ls(L2) - 4}>
          <div style={{ position: "absolute", inset: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {Array.from({ length: rows }).map((_, r) => {
              const t = Math.max(0, fr - type - r * 6);
              return (
                <div key={r} style={{ display: "flex", gap: 10 }}>
                  {[0.3, 0.45, 0.25].map((w, c) => (
                    <div key={c} style={{ height: 34, borderRadius: 8, background: "#FFFFFF", border: `2px solid ${C.line}`, flex: w, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 8, top: 10, height: 12, borderRadius: 6, width: `${Math.min(80, t * 9 - c * 25)}%`, background: [C.pur, C.ink2, C.mag][c], opacity: 0.55 }} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Step>
        <Step k={2} title="Everything updates" at={ls(L3) - 4}>
          <svg width="100%" height="100%" viewBox="0 0 460 330">
            {[0.35, 0.55, 0.45, 0.7, 0.6, 0.85].map((h, q) => {
              const g = ap(fr, upd + q * 3, 14);
              return <rect key={q} x={30 + q * 52} y={300 - 200 * h * g} width={36} height={200 * h * g} rx={8} fill={[C.mag, C.pur, C.cya][q % 3]} opacity={0.8} />;
            })}
            <circle cx={390} cy={110} r={56} fill="none" stroke={C.line} strokeWidth={16} />
            <circle cx={390} cy={110} r={56} fill="none" stroke={C.mag} strokeWidth={16} strokeLinecap="round" strokeDasharray={352} strokeDashoffset={352 * (1 - 0.72 * ap(fr, upd + 6, 20))} transform="rotate(-90 390 110)" />
          </svg>
          <Sparkle at={upd} x={230} y={160} n={10} r={160} />
        </Step>
      </div>
    </Phase>
  );
};

// ================= HONEST ANSWERS =================
export const Honest: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Quick, honest"), L1 = li("Is it a subscription"), L2 = li("Do you need"), L3 = li("You'll just need"), L4 = li("It's a planning");
  const lineNow = [L4, L3, L2, L1, L0].find((l) => fr >= ls(l) - 4) ?? L0;
  const QA: React.FC<{ q: string; a: string; at: number; stamp: number; y: number }> = ({ q, a, at, stamp, y }) => {
    const s = pop(fr, at, 200, 14);
    if (fr < at - 1) return null;
    return (
      <div style={{ position: "absolute", left: 240, top: y, width: 1440, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -200}px)` }}>
        <Card style={{ padding: "30px 40px", display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 70, lineHeight: 1 }}><GText>Q</GText></div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink, flex: 1 }}>{q}</div>
          {fr >= stamp - 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ transform: `rotate(-10deg) scale(${2.2 - 1.2 * Math.min(1, pop(fr, stamp, 320, 14))})`, opacity: Math.min(1, pop(fr, stamp) * 2), border: `7px solid ${C.mag}`, borderRadius: 18, padding: "2px 26px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, color: C.mag }}>NO</div>
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: C.ink2, maxWidth: 420, opacity: ap(fr, stamp + 6, 10) }}>{a}</div>
            </div>
          )}
        </Card>
      </div>
    );
  };
  return (
    <Phase a={ls(L0) - 6} b={le(L4) + 8}>
      {lineNow === L0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><KText line={L0} size={140} maxWidth={1700} /></AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
          <KText line={lineNow} size={54} maxWidth={1700} />
        </AbsoluteFill>
      )}
      <QA q="Is it a subscription?" a="One payment." at={cf(L1, "pop")} stamp={cf(L1, "stamp")} y={250} />
      <QA q="Do I need to be an Excel expert?" a="You enter numbers. Formulas do the rest." at={cf(L2, "pop")} stamp={cf(L2, "stamp")} y={440} />
      {fr >= ls(L3) - 4 && (
        <div style={{ position: "absolute", left: 240, top: 640, display: "flex", gap: 30 }}>
          <Pop at={cf(L3, "pop")}><Chip col={C.grn} size={36}><Icon name="laptop" size={44} color={C.grn} /> Desktop Microsoft Excel</Chip></Pop>
          {fr >= ls(L4) - 4 && <Pop at={cf(L4, "pop", 0)}><Chip col={C.pur} size={36}><Icon name="book" size={40} color={C.pur} /> Planning tool, not tax advice</Chip></Pop>}
          {fr >= ls(L4) - 4 && <Pop at={cf(L4, "pop", 1)}><Chip col={C.cya} size={36}><Icon name="doc" size={40} color={C.cya} /> Your numbers stay in your file</Chip></Pop>}
        </div>
      )}
    </Phase>
  );
};

// ================= CTA =================
export const Cta: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("So here's your next"), L1 = li("Find your industry"), L2 = li("Each one has its own");
  const drop = cf(L1, "drop");
  const rise = ap(fr, drop, 18);
  const ALL = ["plumbing-contractor", "hvac", "electrical-contractor", "roofing", "landscaping", "lawn-care", "pest-control", "cleaning-service", "construction", "auto-repair", "manufacturing", "digital-marketing-agency", "airbnb", "ecommerce", "dental-practice", "restaurant", "trucking-owner-operator", "property-management", "rental-portfolio", "1099", "small-business"];
  const zoom = ap(fr, cf(L2, "pop") - 4, 18);
  const lineNow = [L2, L1, L0].find((l) => fr >= ls(l) - 4) ?? L0;
  return (
    <Phase a={ls(L0) - 6} b={le(L2) + 8}>
      {lineNow === L0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><KText line={L0} size={130} maxWidth={1700} /></AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <KText line={lineNow} size={66} maxWidth={1700} />
        </AbsoluteFill>
      )}
      {fr >= drop - 2 && (
        <div style={{ position: "absolute", left: 960 - 50, top: 230 + Math.abs(Math.sin((fr - drop) / 5)) * 40, opacity: 1 - zoom }}>
          <IconBubble name="arrowDown" size={100} col={C.mag} />
        </div>
      )}
      <div style={{ position: "absolute", left: 120, top: interpolate(rise, [0, 1], [1100, 390]), width: 1680, display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 14, opacity: 1 - zoom * 0.85 }}>
        {ALL.map((s, k) => (
          <div key={s} style={{ transform: `translateY(${Math.sin(fr / 10 + k) * 4}px)` }}>
            <CoverImg slug={s} width={140} />
          </div>
        ))}
      </div>
      {zoom > 0.01 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 140 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 60, transform: `scale(${0.6 + 0.4 * zoom})`, opacity: zoom }}>
            <div style={{ position: "relative" }}>
              <CoverImg slug="hvac" width={300} />
              <div style={{ position: "absolute", left: 150 - 60, top: 200 - 60, width: 120, height: 120, borderRadius: 60, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px -10px rgba(255,94,26,0.6)", transform: `scale(${1 + 0.06 * Math.sin(fr / 5)})` }}><Icon name="play" size={64} color="#fff" /></div>
            </div>
            <Card style={{ padding: "34px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink }}>Full walkthrough</div>
              {["Every sheet, shown", "Every sheet, explained", "Real problems, real answers"].map((t, q) => (
                <Pop key={q} at={cf(L2, "pop") + 6 + q * 5}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: C.ink2 }}><Icon name="check" size={36} color={C.grn} />{t}</div></Pop>
              ))}
            </Card>
          </div>
        </AbsoluteFill>
      )}
    </Phase>
  );
};

// ================= END =================
export const End: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Your business already"), L1 = li("ProfitIQS shows you");
  const hit = cf(L1, "impact");
  return (
    <Phase a={ls(L0) - 6} b={TOTAL + 20}>
      {fr < hit + 2 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {["$", "%", "#", "$", "%", "#", "$", "%"].map((g, k) => (
            <div key={k} style={{ position: "absolute", left: 200 + k * 210, top: 250 + Math.sin(fr / 14 + k) * 60 + (k % 2) * 420, fontFamily: FONT.num, fontWeight: 900, fontSize: 88, color: [C.mag, C.pur, C.cya][k % 3], opacity: 0.22 * ap(fr, ls(L0) + k * 2, 10) }}>{g}</div>
          ))}
          <KText line={L0} size={96} maxWidth={1500} />
        </AbsoluteFill>
      )}
      {fr >= hit - 2 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Rings at={hit} x={960} y={400} n={4} />
          <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${0.5 + 0.5 * pop(fr, hit, 200, 12)})`, marginTop: -120 }}>
            <Logo size={220} />
            <Wordmark size={150} />
          </div>
          <div style={{ marginTop: 50 }}><KText line={L1} size={72} maxWidth={1600} /></div>
          <div style={{ marginTop: 30, height: 10, borderRadius: 5, background: GRAD, width: 900 * ap(fr, cf(L1, "chime"), 22) }} />
          <div style={{ marginTop: 40, opacity: ap(fr, cf(L1, "chime") + 14, 14), fontFamily: FONT.sans, fontWeight: 700, fontSize: 34, color: C.ink2, letterSpacing: "0.04em" }}>21 industries · 63 systems · profitiqs.com</div>
          <Confetti at={hit} x={960} y={420} n={90} spread={1200} />
        </AbsoluteFill>
      )}
    </Phase>
  );
};
