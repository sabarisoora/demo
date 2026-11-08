import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cf, cl, col, eIO, F, inn, io, le, li, LINES, ls, M, MX, out, TOTAL } from "./lib";
import { Head, Rise } from "./A";
import { Block, Cover, Enter, Label, Lockup, Rule, Say } from "./ui";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);
const VLine: React.FC<{ x: number; at: number; top?: number; h?: number }> = ({ x, at, top = 300, h = 640 }) => (
  <div style={{ position: "absolute", left: x, top }}><Rule at={at} w={h} vertical color={M.line} len={26} /></div>
);

// ================= SHOWROOM =================
const NICHES = [
  { slug: "plumbing-contractor", trade: "Plumbers", n: 48, p: "Plumbers:", a: "Here's a Callback", chips: ["Callback Tracker", "Job Profitability Center"] },
  { slug: "restaurant", trade: "Restaurants", n: 28, p: "Restaurants:", a: "Here's a Prime", chips: ["Prime Cost Center", "Menu Intelligence Center"] },
  { slug: "dental-practice", trade: "Dental practices", n: 42, p: "Dental practices:", a: "Here's case", chips: ["Case Acceptance Center", "Recall Tracker", "Provider Productivity"] },
  { slug: "trucking-owner-operator", trade: "Owner-operators", n: 26, p: "Owner-operators:", a: "Here's profit on", chips: ["Load Profitability Analyzer", "Mileage Tracker"] },
  { slug: "rental-portfolio", trade: "Rental investors", n: 46, p: "Rental investors:", a: "Here's cap rate", chips: ["Cap Rate Center", "Cash-on-Cash Return", "DSCR Center"] },
  { slug: "ecommerce", trade: "Online stores", n: 26, p: "Online stores:", a: "Here's profit by", chips: ["SKU Profitability", "Ad Spend Tracker", "Refunds & Returns", "Sales Channels"] },
];
export const Showroom: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Come on in"), Lr = li("Every sheet name");
  const first = ls(li(NICHES[0].p)) - 12;
  const enterAt = (k: number) => ls(li(NICHES[k].p)) - 14;
  return (
    <>
      <Block a={ls(L0) - 8} b={first}>
        <Center style={{ paddingBottom: 80 }}>
          <Rise at={ls(L0) - 4}><Label>Come on in</Label></Rise>
          <Rise at={cf(L0, "chime") - 12} len={24} style={{ marginTop: 16 }}>
            <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 230, lineHeight: 0.95, letterSpacing: "-0.015em", color: M.ink }}>The Showroom</div>
          </Rise>
          <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
            {NICHES.map((n, k) => (
              <Enter key={n.slug} at={cf(L0, "chime") - 2 + k * 3} dy={24}><Cover slug={n.slug} width={150} /></Enter>
            ))}
          </div>
          {fr >= ls(Lr) - 6 && (
            <Enter at={cf(Lr, "sparkle") - 6} dy={12} style={{ marginTop: 48 }}>
              <Label color={M.acc}>Every sheet name shown is real — straight from the actual workbooks</Label>
            </Enter>
          )}
        </Center>
      </Block>
      <Block a={first} b={le(li(NICHES[5].a)) + 8}>
        {NICHES.map((n, k) => {
          const Lp = li(n.p), La = li(n.a);
          const e = io(fr, enterAt(k), 26);
          const l = k < 5 ? io(fr, enterAt(k + 1), 26) : 0;
          if (e <= 0 || l >= 1) return null;
          const x = (1 - e) * 1920 - l * 1920;
          const answered = fr >= ls(La) - 6;
          return (
            <div key={k} style={{ position: "absolute", left: x, top: 0, width: 1920, height: 1080 }}>
              <div style={{ position: "absolute", left: MX, top: 210, width: 560 }}>
                <Label color={M.mute}>0{k + 1} / 06</Label>
                <div style={{ height: 30 }} />
                <div style={{ opacity: answered ? 0.4 : 1 }}>
                  <Say line={Lp} size={64} maxWidth={560} maxLines={5} align="left" whole />
                </div>
              </div>
              <div style={{ position: "absolute", left: 770, top: 200 }}>
                <Cover slug={n.slug} width={400} />
                <Label style={{ marginTop: 28, textAlign: "center" }}>Elite · {n.n} sheets</Label>
              </div>
              <div style={{ position: "absolute", left: 1290, top: 210, width: 510 }}>
                {answered && <Rise at={cf(La, "sparkle") - 4}><Label color={M.acc}>The answer</Label></Rise>}
                <div style={{ height: 30 }} />
                {n.chips.map((c, q) => {
                  const at = cf(La, "pop", q) - 4;
                  if (fr < at - 1) return null;
                  return (
                    <div key={q}>
                      <Rule at={at} w="100%" color={M.ink} />
                      <Enter at={at + 2} dy={14} style={{ display: "flex", alignItems: "center", gap: 20, height: 104 }}>
                        <div style={{ width: 10, height: 10, background: M.acc, flex: "none" }} />
                        <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", color: M.ink, lineHeight: 1.1 }}>{c}</div>
                      </Enter>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 952, display: "flex", justifyContent: "center", gap: 10 }}>
          {NICHES.map((_, k) => {
            const on = fr >= enterAt(k) + 13 && (k === 5 || fr < enterAt(k + 1) + 13);
            return <div key={k} style={{ width: on ? 48 : 24, height: 3, background: on ? M.ink : M.faint }} />;
          })}
        </div>
      </Block>
    </>
  );
};

// ================= ALL 21 =================
const SHOWN = ["Plumbing", "Restaurants", "Dental", "Trucking", "Rental property", "Ecommerce"];
const REST: [string, number, string][] = [
  ["HVAC", 0, "HVAC."], ["Electrical", 0, "Electrical."], ["Roofing", 0, "Roofing."], ["Landscaping", 0, "Landscaping."], ["Lawn care", 0, "Lawn"], ["Pest control", 0, "Pest"],
  ["Cleaning", 1, "Cleaning."], ["Construction", 1, "Construction."], ["Auto repair", 1, "Auto"], ["Manufacturing", 1, "Manufacturing."], ["Marketing agencies", 1, "Marketing"], ["Airbnb hosts", 1, "Airbnb"],
  ["Property managers", 2, "Property"], ["1099 contractors", 2, "1099"], ["Small business", 2, "small"],
];
export const Wall: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And that's just six"), Lw = [li("HVAC."), li("Cleaning."), li("Property managers")], Le = li("Every one built");
  const tiles = [
    ...SHOWN.map((t, k) => ({ t, at: cf(L0, "swish") + k * 3 })),
    ...REST.map(([t, l, w]) => ({ t, at: cf(Lw[l], "up", REST.filter((r) => r[1] === l).findIndex((r) => r[2] === w)) })),
  ];
  const lit = tiles.filter((t) => fr >= t.at).length;
  const done = fr >= ls(Le) - 8;
  const cw = (1680 - 6 * 24) / 7;
  return (
    <Block a={ls(L0) - 8} b={le(Le) + 8}>
      <Head line={done ? Le : L0} size={60} maxWidth={1300} whole />
      <div style={{ position: "absolute", right: MX, top: 140, display: "flex", alignItems: "baseline", gap: 14 }}>
        <div style={{ fontFamily: F.serif, fontSize: 150, lineHeight: 1, color: lit === 21 ? M.acc : M.ink, fontVariantNumeric: "tabular-nums" }}>{String(lit).padStart(2, "0")}</div>
        <Label color={M.mute}>/ 21</Label>
      </div>
      <div style={{ position: "absolute", left: MX, top: 380, width: 1680, display: "grid", gridTemplateColumns: `repeat(7, ${cw}px)`, columnGap: 24, rowGap: 34 }}>
        {tiles.map((t, k) => {
          const on = fr >= t.at - 1;
          const p = inn(fr, t.at - 1, 14);
          const sweep = done ? inn(fr, cf(Le, "sparkle") - 6 + k * 2, 10) : 0;
          return (
            <div key={k} style={{ height: 150, position: "relative" }}>
              <div style={{ height: 1.5, background: M.line }} />
              <div style={{ position: "absolute", left: 0, top: -0.5, height: 2.5, width: `${p * 100}%`, background: sweep > 0 ? M.acc : M.ink, opacity: sweep > 0 ? sweep : 1 }} />
              <div style={{ fontFamily: F.mono, fontSize: 18, color: M.mute, marginTop: 20 }}>{String(k + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 10, color: on ? M.ink : M.faint, transform: `translateY(${(1 - p) * 8}px)` }}>{t.t}</div>
            </div>
          );
        })}
      </div>
    </Block>
  );
};

// ================= THREE EDITIONS =================
const PRICE = { Essential: "$97", Elite: "$197", Complete: "$249" } as const;
export const Box: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Every system comes"), Le = li("Essential, $97"), Lx = li("Elite, $197"), Lc = li("Complete, $249"), Ls = li("Start with Essential");
  const head = fr < ls(Le) - 8 ? L0 : fr < ls(Lx) - 8 ? Le : fr < ls(Lc) - 8 ? Lx : fr < ls(Ls) - 8 ? Lc : Ls;
  const path = fr >= ls(Ls) - 6;
  const COLS = [
    { tier: "Essential" as const, desc: "The core numbers", at: cf(L0, "whoosh"), price: cf(Le, "cash"), note: "Start here" },
    { tier: "Elite" as const, desc: "The full system, with deeper analysis", at: cf(L0, "whoosh") + 5, price: cf(Lx, "cash"), note: "Whenever you're ready" },
    { tier: "Complete" as const, desc: "Both editions, together", at: cf(L0, "whoosh") + 10, price: cf(Lc, "cash"), note: "" },
  ];
  const cw = 1680 / 3;
  return (
    <Block a={ls(L0) - 8} b={le(Ls) + 8}>
      <Head line={head} size={58} maxWidth={1680} whole />
      <VLine x={MX + cw} at={COLS[0].at} />
      <VLine x={MX + 2 * cw} at={COLS[1].at} />
      {COLS.map((c, k) => {
        const dim = path && k === 2 ? 0.32 : 1;
        return (
          <Enter key={k} at={c.at - 4} dy={30} len={24} style={{ position: "absolute", left: MX + k * cw, top: 280, width: cw, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ opacity: dim, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Label color={M.mute}>0{k + 1} — {c.tier}</Label>
              <div style={{ position: "relative", width: 300, height: 382, marginTop: 34, display: "flex", justifyContent: "center" }}>
                {c.tier === "Complete" ? (
                  <>
                    <Cover slug="plumbing-contractor" tier="Essential" width={240} style={{ position: "absolute", left: 0, top: 30 }} />
                    <Cover slug="plumbing-contractor" tier="Elite" width={240} style={{ position: "absolute", left: 60, top: 0 }} />
                  </>
                ) : (
                  <Cover slug="plumbing-contractor" tier={c.tier} width={270} />
                )}
              </div>
              <div style={{ height: 130, marginTop: 18 }}>
                {fr >= c.price - 8 && (
                  <Rise at={c.price - 6}>
                    <div style={{ fontFamily: F.serif, fontSize: 124, lineHeight: 1, color: k === 0 && path ? M.acc : M.ink }}>{PRICE[c.tier]}</div>
                  </Rise>
                )}
              </div>
              <div style={{ fontFamily: F.sans, fontWeight: 400, fontSize: 26, color: M.ink2, opacity: inn(fr, c.price + 4, 14), textAlign: "center", maxWidth: 530, whiteSpace: "nowrap" }}>{c.desc}</div>
            </div>
            {path && c.note && (
              <Enter at={k === 0 ? cf(Ls, "pop") - 4 : cf(Ls, "whoosh") + 2} dy={10} style={{ marginTop: 18 }}>
                <Label color={M.acc}>{k === 0 ? "→ " : ""}{c.note}</Label>
              </Enter>
            )}
          </Enter>
        );
      })}
    </Block>
  );
};

// ================= INSIDE EVERY BOX =================
export const Inside: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And inside every box"), L1 = li("Formulas, dashboards"), L2 = li("Sample data"), L3 = li("A tax set-aside"), L4 = li("Country-based"), L5 = li("A Quick Start");
  const items = [
    { t: "Formulas", at: cf(L1, "pop", 0) },
    { t: "Dashboards", at: cf(L1, "pop", 1) },
    { t: "Reports", at: cf(L1, "pop", 2) },
    { t: "Sample data", at: cf(L2, "pop") },
    { t: "Tax set-aside estimate", at: cf(L3, "pop") },
    { t: "Country tax-rate presets", at: cf(L4, "pop", 0) },
    { t: "Quick Start", at: cf(L5, "pop", 0) },
    { t: "Field Guide", at: cf(L5, "pop", 1) },
  ];
  const lineNow = [L5, L4, L3, L2, L1].find((l) => fr >= ls(l) - 8);
  return (
    <Block a={ls(L0) - 8} b={le(L5) + 8}>
      {lineNow === undefined ? (
        <Center><Say line={L0} size={124} maxWidth={1500} whole /></Center>
      ) : (
        <>
          <div style={{ position: "absolute", left: MX, top: 200, width: 640 }}>
            <Rise at={ls(L1) - 10}><div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 130, lineHeight: 0.95, color: M.ink }}>Inside</div></Rise>
            <Rise at={ls(L1) - 6}><div style={{ fontFamily: F.serif, fontSize: 130, lineHeight: 0.95, color: M.ink }}>every box</div></Rise>
            <div style={{ marginTop: 70 }}>
              <Say line={lineNow} size={46} weight={400} maxWidth={620} maxLines={3} align="left" color={M.ink2} whole />
            </div>
          </div>
          <div style={{ position: "absolute", left: col(6), top: 190, width: 1800 - col(6) }}>
            {items.map((it, k) => {
              if (fr < it.at - 5) return null;
              return (
                <div key={k}>
                  <Rule at={it.at - 4} w="100%" color={M.ink} />
                  <Enter at={it.at - 2} dy={12} style={{ display: "flex", alignItems: "center", height: 88 }}>
                    <div style={{ fontFamily: F.mono, fontSize: 20, color: M.mute, width: 90 }}>0{k + 1}</div>
                    <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", color: M.ink }}>{it.t}</div>
                    <div style={{ marginLeft: "auto", fontFamily: F.mono, fontSize: 18, color: M.acc, letterSpacing: "0.12em" }}>INCLUDED</div>
                  </Enter>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Block>
  );
};

// ================= HOW IT WORKS =================
const Win: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 440, height: 300, background: M.paper, border: `1.5px solid ${M.line}`, borderRadius: 4, position: "relative", overflow: "hidden" }}>
    <div style={{ height: 30, borderBottom: `1.5px solid ${M.line}`, display: "flex", alignItems: "center", gap: 7, paddingLeft: 12 }}>
      {[0, 1, 2].map((k) => <div key={k} style={{ width: 8, height: 8, borderRadius: 4, background: M.faint }} />)}
    </div>
    <div style={{ position: "absolute", left: 20, right: 20, top: 50, bottom: 20 }}>{children}</div>
  </div>
);
export const How: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And using it"), L1 = li("Step one"), L2 = li("Step two"), L3 = li("Step three");
  const act = fr >= ls(L3) - 8 ? 2 : fr >= ls(L2) - 8 ? 1 : fr >= ls(L1) - 8 ? 0 : -1;
  const click = cf(L1, "click"), type = cf(L2, "type"), upd = cf(L3, "ding");
  const cw = 1680 / 3;
  const STEPS = [
    { n: "1", t: "Open it", at: ls(L1) - 8 },
    { n: "2", t: "Enter your numbers", at: ls(L2) - 8 },
    { n: "3", t: "Everything updates", at: ls(L3) - 8 },
  ];
  const ROWS = 6;
  const art = (k: number) => {
    if (k === 0) return (
      <Win>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: ROWS }).map((_, r) => (
            <div key={r} style={{ display: "flex", gap: 10 }}>
              {[0.3, 0.45, 0.25].map((w, c) => <div key={c} style={{ flex: w, height: 14, background: M.line, opacity: inn(fr, click + r * 2, 10) }} />)}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, bottom: 0 }}><Label size={14} color={M.mute} style={{ opacity: inn(fr, click + 10, 10) }}>Sample data</Label></div>
      </Win>
    );
    if (k === 1) return (
      <Win>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: ROWS }).map((_, r) => (
            <div key={r} style={{ display: "flex", gap: 10 }}>
              {[0.3, 0.45, 0.25].map((w, c) => {
                const t = inn(fr, type + r * 7 + c * 2, 8);
                return (
                  <div key={c} style={{ flex: w, height: 14, background: M.line, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: M.ink, transformOrigin: "left", transform: `scaleX(${t})` }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Win>
    );
    return (
      <Win>
        <svg width={400} height={230} viewBox="0 0 400 230">
          {[0.35, 0.55, 0.45, 0.7, 0.6, 0.85].map((h, q) => {
            const g = inn(fr, upd + q * 3, 18);
            return <rect key={q} x={6 + q * 40} y={220 - 190 * h * g} width={24} height={190 * h * g} fill={q === 5 ? M.acc : M.ink} />;
          })}
          <circle cx={330} cy={90} r={48} fill="none" stroke={M.line} strokeWidth={10} />
          <circle cx={330} cy={90} r={48} fill="none" stroke={M.acc} strokeWidth={10} strokeDasharray={302} strokeDashoffset={302 * (1 - 0.72 * inn(fr, upd + 6, 24))} transform="rotate(-90 330 90)" />
        </svg>
      </Win>
    );
  };
  return (
    <Block a={ls(L0) - 8} b={le(L3) + 8}>
      {act < 0 ? (
        <Center><Say line={L0} size={124} maxWidth={1500} whole /></Center>
      ) : (
        <>
          <Head line={[L1, L2, L3][act]} size={54} maxWidth={1680} whole />
          <VLine x={MX + cw} at={STEPS[1].at} top={330} h={600} />
          <VLine x={MX + 2 * cw} at={STEPS[2].at} top={330} h={600} />
          {STEPS.map((s, k) => (
            <Enter key={k} at={s.at} dy={30} len={22} style={{ position: "absolute", left: MX + k * cw + (k === 0 ? 0 : 60), top: 330, opacity: act === k ? 1 : 0.4 }}>
              <div style={{ fontFamily: F.serif, fontSize: 150, lineHeight: 0.9, color: act === k ? M.acc : M.ink }}>{s.n}</div>
              <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", color: M.ink, marginTop: 20, marginBottom: 34 }}>{s.t}</div>
              {art(k)}
            </Enter>
          ))}
        </>
      )}
    </Block>
  );
};

// ================= HONEST ANSWERS =================
export const Honest: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Quick, honest"), L1 = li("Is it a subscription"), L2 = li("Do you need"), L3 = li("You'll just need"), L4 = li("It's a planning");
  const ROWS = [
    { q: "Is it a subscription?", a: "No.", d: "One payment.", at: cf(L1, "pop"), aAt: cf(L1, "stamp") },
    { q: "Do I need to be an Excel expert?", a: "No.", d: "You enter your numbers. The formulas do the rest.", at: cf(L2, "pop"), aAt: cf(L2, "stamp") },
    { q: "What you'll need", a: "", d: "The desktop version of Microsoft Excel.", at: cf(L3, "pop") - 6, aAt: cf(L3, "pop") },
    { q: "What it is", a: "", d: "A planning tool, not tax advice.", at: cf(L4, "pop", 0) - 6, aAt: cf(L4, "pop", 0) },
    { q: "Your numbers", a: "", d: "They stay in your own file.", at: cf(L4, "pop", 1) - 6, aAt: cf(L4, "pop", 1) },
  ];
  return (
    <Block a={ls(L0) - 8} b={le(L4) + 8}>
      {fr < ls(L1) - 8 ? (
        <Center><Say line={L0} size={124} maxWidth={1500} whole /></Center>
      ) : (
        <div style={{ position: "absolute", left: MX, top: 190, width: 1680 }}>
          {ROWS.map((r, k) => {
            if (fr < r.at - 5) return null;
            const faq = r.a !== "";
            return (
              <div key={k}>
                <Rule at={r.at - 4} w="100%" color={M.ink} />
                <div style={{ display: "flex", alignItems: "center", height: 148 }}>
                  <Enter at={r.at - 2} dy={12} style={{ width: 860 }}>
                    {faq ? (
                      <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 46, letterSpacing: "-0.02em", color: M.ink }}>{r.q}</div>
                    ) : (
                      <Label color={M.mute}>{r.q}</Label>
                    )}
                  </Enter>
                  <Enter at={r.aAt - 4} dy={12} style={{ display: "flex", alignItems: "baseline", gap: 22, flex: 1 }}>
                    {faq && <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 76, lineHeight: 1, color: M.acc }}>{r.a}</div>}
                    <div style={{ fontFamily: F.sans, fontWeight: faq ? 400 : 500, fontSize: faq ? 32 : 40, letterSpacing: "-0.015em", color: faq ? M.ink2 : M.ink, lineHeight: 1.2 }}>{r.d}</div>
                  </Enter>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Block>
  );
};

// ================= CTA =================
const ALL = ["plumbing-contractor", "hvac", "electrical-contractor", "roofing", "landscaping", "lawn-care", "pest-control", "cleaning-service", "construction", "auto-repair", "manufacturing", "digital-marketing-agency", "airbnb", "ecommerce", "dental-practice", "restaurant", "trucking-owner-operator", "property-management", "rental-portfolio", "1099", "small-business"];
export const Cta: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("So here's your next"), L1 = li("Find your industry"), L2 = li("Each one has its own");
  const drop = cf(L1, "drop");
  const swap = fr >= ls(L2) - 8;
  const W_ = 124, G = 18;
  return (
    <Block a={ls(L0) - 8} b={le(L2) + 8}>
      {fr < ls(L1) - 8 ? (
        <Center><Say line={L0} size={124} maxWidth={1500} whole /></Center>
      ) : !swap ? (
        <>
          <Head line={L1} size={64} maxWidth={1680} align="center" whole />
          {[ALL.slice(0, 11), ALL.slice(11)].map((row, r) => (
            <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 320 + r * 220, display: "flex", justifyContent: "center", gap: G }}>
              {row.map((s, k) => (
                <Enter key={s} at={ls(L1) - 4 + (r * 11 + k) * 1.4} dy={24}><Cover slug={s} width={W_} /></Enter>
              ))}
            </div>
          ))}
          <div style={{ position: "absolute", left: 959, top: 790 }}>
            <Rule at={drop - 4} w={150} vertical color={M.ink} h={2} len={18} />
            <svg width={30} height={20} style={{ position: "absolute", left: -14, top: 138, opacity: inn(fr, drop + 8, 8) }}>
              <polyline points="2,2 15,16 28,2" fill="none" stroke={M.ink} strokeWidth={2} />
            </svg>
          </div>
          <Enter at={drop + 4} dy={8} style={{ position: "absolute", left: 1000, top: 850 }}><Label color={M.acc}>Right below this video</Label></Enter>
        </>
      ) : (
        <>
          <Enter at={ls(L2) - 6} dy={30} len={24} style={{ position: "absolute", left: 300, top: 220 }}>
            <Cover slug="hvac" width={420} />
          </Enter>
          <div style={{ position: "absolute", left: 860, top: 250, width: 900 }}>
            <Label color={M.mute}>Every industry page</Label>
            <div style={{ height: 30 }} />
            <Say line={L2} size={64} maxWidth={900} maxLines={4} align="left" whole />
            <div style={{ height: 50 }} />
            {["One full walkthrough per industry", "Every sheet, shown", "Every sheet, explained"].map((t, q) => (
              <div key={q}>
                <Rule at={cf(L2, "pop") + q * 5} w="100%" color={M.ink} />
                <Enter at={cf(L2, "pop") + 2 + q * 5} dy={10} style={{ display: "flex", alignItems: "center", gap: 18, height: 76 }}>
                  <div style={{ width: 10, height: 10, background: M.acc }} />
                  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 34, letterSpacing: "-0.02em", color: M.ink }}>{t}</div>
                </Enter>
              </div>
            ))}
          </div>
        </>
      )}
    </Block>
  );
};

// ================= END =================
export const End: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Your business already"), L1 = li("ProfitIQS shows you");
  const hit = cf(L1, "impact");
  return (
    <Block a={ls(L0) - 8} b={TOTAL + 20}>
      {fr < hit - 8 ? (
        <Center><Say line={L0} size={124} maxWidth={1500} whole /></Center>
      ) : (
        <Center style={{ paddingBottom: 40 }}>
          <Rise at={hit - 6} len={24}><Lockup size={150} /></Rise>
          <div style={{ marginTop: 56 }}><Say line={L1} size={72} maxWidth={1500} whole /></div>
          <Rule at={cf(L1, "chime")} w={560} color={M.ink} style={{ marginTop: 60 }} from="center" len={30} />
          <Enter at={cf(L1, "chime") + 16} dy={10} style={{ marginTop: 40 }}>
            <Label>21 industries · 63 systems · profitiqs.com</Label>
          </Enter>
        </Center>
      )}
    </Block>
  );
};

