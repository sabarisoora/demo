import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cf, F, inn, io, le, li, ls, MX, out, P, SH, TOTAL } from "./lib";
import { Block, Blur, Center, Cover, Head, Label, Lockup, Phase, Photo, Pill, Say, Seq, Win } from "./ui";

// ================= SHOWROOM =================
type Sheet = { name: string; shot: string };
const NICHES: { slug: string; trade: string; title: string; n: number; p: string; a: string; sheets: Sheet[] }[] = [
  { slug: "plumbing-contractor", trade: "Plumbers", title: "Plumbing Contractor", n: 48, p: "Plumbers:", a: "Here's a Callback", sheets: [{ name: "Callback Tracker", shot: "callback-tracker" }, { name: "Job Profitability Center", shot: "job-profitability-center" }] },
  { slug: "restaurant", trade: "Restaurants", title: "Restaurant", n: 28, p: "Restaurants:", a: "Here's a Prime", sheets: [{ name: "Prime Cost Center", shot: "prime-cost-center" }, { name: "Menu Intelligence Center", shot: "menu-intelligence-center" }] },
  { slug: "dental-practice", trade: "Dental practices", title: "Dental Practice", n: 42, p: "Dental practices:", a: "Here's case", sheets: [{ name: "Case Acceptance Center", shot: "case-acceptance-center" }, { name: "Recall Tracker", shot: "recall-tracker" }, { name: "Provider Productivity", shot: "provider-productivity" }] },
  { slug: "trucking-owner-operator", trade: "Owner-operators", title: "Trucking Owner-Operator", n: 26, p: "Owner-operators:", a: "Here's profit on", sheets: [{ name: "Load Profitability Analyzer", shot: "load-profitability-analyzer" }, { name: "Mileage Tracker", shot: "mileage-tracker" }] },
  { slug: "rental-portfolio", trade: "Rental investors", title: "Rental Property", n: 46, p: "Rental investors:", a: "Here's cap rate", sheets: [{ name: "Cap Rate Center", shot: "cap-rate-center" }, { name: "Cash-on-Cash Return", shot: "cash-on-cash-return" }, { name: "DSCR Center", shot: "dscr-center" }] },
  { slug: "ecommerce", trade: "Online stores", title: "Ecommerce", n: 26, p: "Online stores:", a: "Here's profit by", sheets: [{ name: "SKU Profitability", shot: "sku-profitability" }, { name: "Ad Spend Tracker", shot: "ad-spend-tracker" }, { name: "Refunds & Returns", shot: "refunds-returns" }, { name: "Sales Channels", shot: "sales-channels" }] },
];
export const Showroom: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Come on in"), Lr = li("Every sheet name");
  const first = ls(li(NICHES[0].p)) - 12;
  const enterAt = (k: number) => ls(li(NICHES[k].p)) - 14;
  return (
    <>
      <Block a={ls(L0) - 8} b={first}>
        <Center style={{ paddingBottom: 60 }}>
          <Blur at={ls(L0) - 4}><Label size={34}>Come on in</Label></Blur>
          <Blur at={cf(L0, "chime") - 12} len={24} style={{ marginTop: 10 }}>
            <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 210, letterSpacing: "-0.065em", lineHeight: 0.95, color: P.ink }}>The Showroom</div>
          </Blur>
          <div style={{ display: "flex", gap: 34, marginTop: 64 }}>
            {NICHES.map((n, k) => (
              <Blur key={n.slug} at={cf(L0, "chime") - 2 + k * 3} dy={40}><Cover slug={n.slug} width={160} /></Blur>
            ))}
          </div>
          {fr >= ls(Lr) - 6 && (
            <Blur at={cf(Lr, "sparkle") - 8} dy={16} style={{ marginTop: 60 }}>
              <Pill dark size={26}>Every sheet name shown is real, from the actual workbooks</Pill>
            </Blur>
          )}
        </Center>
      </Block>
      <Block a={first} b={le(li(NICHES[5].a)) + 8} push={0}>
        {NICHES.map((n, k) => {
          const Lp = li(n.p), La = li(n.a);
          const e = io(fr, enterAt(k), 28);
          const l = k < 5 ? io(fr, enterAt(k + 1), 28) : 0;
          if (e <= 0 || l >= 1) return null;
          const x = (1 - e) * 1920 - l * 1920;
          const ans = fr >= ls(La) - 8;
          const chipAt = n.sheets.map((_, q) => cf(La, "pop", q) - 6);
          const cur = chipAt.reduce((acc, a, q) => (fr >= a ? q : acc), -1);
          const winIn = inn(fr, chipAt[0] - 4, 26);
          return (
            <div key={k} style={{ position: "absolute", left: x, top: 0, width: 1920, height: 1080 }}>
              <div style={{ position: "absolute", left: MX, top: 190, width: 600 }}>
                <Label>{String(k + 1).padStart(2, "0")} / 06 · {n.trade}</Label>
                <div style={{ height: 26 }} />
                <div style={{ opacity: ans ? 0.35 : 1 }}>
                  <Say line={Lp} size={64} maxWidth={600} maxLines={4} align="left" whole />
                </div>
                <div style={{ marginTop: 50, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
                  {n.sheets.map((s, q) => (
                    <Blur key={q} at={chipAt[q]} dy={16}>
                      <Pill dark={q === cur} size={28}>{s.name}</Pill>
                    </Blur>
                  ))}
                </div>
              </div>
              {/* product: the cover, then the real sheet comes forward */}
              <div style={{ position: "absolute", left: 760 - winIn * 30, top: 220, opacity: 1 - winIn * 0.1 }}>
                <Cover slug={n.slug} width={300} />
                <Label style={{ marginTop: 30, textAlign: "center" }}>Elite · {n.n} sheets</Label>
              </div>
              {cur >= 0 && (
                <div style={{ position: "absolute", left: 1090, top: 250, opacity: winIn, filter: winIn < 1 ? `blur(${(1 - winIn) * 12}px)` : undefined, transform: `translate(${(1 - winIn) * 160}px, ${(1 - winIn) * 30}px)` }}>
                  {n.sheets.map((s, q) => {
                    const v = q === cur ? (q === 0 ? 1 : inn(fr, chipAt[q] + 6, 12)) : q === cur - 1 ? 1 - inn(fr, chipAt[cur] - 3, 8) : 0;
                    if (v <= 0) return null;
                    return (
                      <div key={q} style={{ position: "absolute", left: 0, top: 0, opacity: v }}>
                        <Win shot={`${n.slug}/${s.shot}`} width={710} maxH={560} title={`${n.title} · ${s.name}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 990, display: "flex", justifyContent: "center", gap: 10 }}>
          {NICHES.map((_, k) => {
            const on = fr >= enterAt(k) + 14 && (k === 5 || fr < enterAt(k + 1) + 14);
            return <div key={k} style={{ width: on ? 40 : 10, height: 10, borderRadius: 5, background: on ? P.ink : P.line }} />;
          })}
        </div>
      </Block>
    </>
  );
};

// ================= ALL 21 =================
const SHOWN = ["Plumbing", "Restaurants", "Dental", "Trucking", "Rental property", "Ecommerce"];
const SLUG: Record<string, string> = {
  Plumbing: "plumbing-contractor", Restaurants: "restaurant", Dental: "dental-practice", Trucking: "trucking-owner-operator", "Rental property": "rental-portfolio", Ecommerce: "ecommerce",
  HVAC: "hvac", Electrical: "electrical-contractor", Roofing: "roofing", Landscaping: "landscaping", "Lawn care": "lawn-care", "Pest control": "pest-control", Cleaning: "cleaning-service",
  Construction: "construction", "Auto repair": "auto-repair", Manufacturing: "manufacturing", "Marketing agencies": "digital-marketing-agency", "Airbnb hosts": "airbnb",
  "Property managers": "property-management", "1099 contractors": "1099", "Small business": "small-business",
};
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
  const cw = (1680 - 6 * 20) / 7;
  return (
    <Block a={ls(L0) - 8} b={le(Le) + 8} push={0.02}>
      <Seq items={[[ls(L0) - 8, <Head line={L0} size={64} maxWidth={1250} whole />], [ls(Le) - 8, <Head line={Le} size={64} maxWidth={1250} whole />]]} />
      <div style={{ position: "absolute", right: MX, top: 120, display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 170, letterSpacing: "-0.07em", lineHeight: 1, color: P.ink, fontVariantNumeric: "tabular-nums" }}>{String(lit).padStart(2, "0")}</div>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 56, letterSpacing: "-0.04em", color: P.soft }}>/21</div>
      </div>
      <div style={{ position: "absolute", left: MX, top: 360, width: 1680, display: "grid", gridTemplateColumns: `repeat(7, ${cw}px)`, gap: 20 }}>
        {tiles.map((t, k) => {
          const p = inn(fr, t.at - 2, 14);
          return (
            <div key={k} style={{ position: "relative", height: 178, borderRadius: 28, overflow: "hidden", background: P.tile, boxShadow: p > 0.5 ? SH.card : "none", transform: `translateY(${-p * 6}px)` }}>
              <Photo slug={SLUG[t.t]} style={{ opacity: 0.18 + 0.82 * p, filter: `grayscale(${1 - p})`, transform: `scale(${1.15 - 0.1 * p})` }} />
              <div style={{ position: "absolute", inset: 0, background: `rgba(11,11,12,${0.05 + 0.5 * p})` }} />
              <div style={{ position: "absolute", inset: 0, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 20, color: p > 0.5 ? "rgba(255,255,255,0.7)" : P.grey }}>{String(k + 1).padStart(2, "0")}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 29, letterSpacing: "-0.03em", lineHeight: 1.05, color: p > 0.5 ? "#FFFFFF" : P.grey2 }}>{t.t}</div>
              </div>
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
    { tier: "Essential" as const, desc: "The core numbers", at: cf(L0, "whoosh"), price: cf(Le, "cash"), note: "Start here", noteAt: cf(Ls, "pop") - 4 },
    { tier: "Elite" as const, desc: "The full system, with deeper analysis", at: cf(L0, "whoosh") + 5, price: cf(Lx, "cash"), note: "Whenever you're ready", noteAt: cf(Ls, "whoosh") },
    { tier: "Complete" as const, desc: "Both editions, together", at: cf(L0, "whoosh") + 10, price: cf(Lc, "cash"), note: "", noteAt: 0 },
  ];
  return (
    <Block a={ls(L0) - 8} b={le(Ls) + 8} push={0.015}>
      <Seq items={[L0, Le, Lx, Lc, Ls].map((l) => [ls(l) - 8, <Head line={l} size={60} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])} />
      <div style={{ position: "absolute", left: MX, top: 270, width: 1680, display: "flex", gap: 40 }}>
        {COLS.map((c, k) => {
          const dim = path && k === 2 ? 0.4 : 1;
          const hl = path && k === 0;
          const live = fr >= c.price - 8 && !path;
          return (
            <Blur key={k} at={c.at - 6} dy={60} len={24} style={{ flex: 1 }}>
              <div style={{ position: "relative", height: 690, borderRadius: 44, background: "#FFFFFF", boxShadow: `${live || hl ? SH.deep : SH.card}, 0 0 0 ${hl ? 3 : 1}px ${hl ? P.ink : "rgba(0,0,0,0.06)"}`, padding: "44px 48px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", opacity: dim, transform: `translateY(${live || hl ? -10 : 0}px)` }}>
                <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 40, letterSpacing: "-0.04em", color: P.ink }}>{c.tier}</div>
                  {path && c.note && <Blur at={c.noteAt} dy={10}><Pill dark={k === 0} size={22}>{c.note}</Pill></Blur>}
                </div>
                <div style={{ position: "relative", width: 290, height: 330, marginTop: 30 }}>
                  {c.tier === "Complete" ? (
                    <>
                      <Cover slug="plumbing-contractor" tier="Essential" width={210} style={{ position: "absolute", left: 0, top: 30 }} />
                      <Cover slug="plumbing-contractor" tier="Elite" width={210} style={{ position: "absolute", left: 80, top: 0 }} />
                    </>
                  ) : (
                    <Cover slug="plumbing-contractor" tier={c.tier} width={232} style={{ position: "absolute", left: 29, top: 0 }} />
                  )}
                </div>
                <div style={{ height: 120, marginTop: 34 }}>
                  {fr >= c.price - 8 && (
                    <Blur at={c.price - 6} dy={20}>
                      <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 116, letterSpacing: "-0.06em", lineHeight: 1, color: P.ink, fontVariantNumeric: "tabular-nums" }}>{PRICE[c.tier]}</div>
                    </Blur>
                  )}
                </div>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, color: P.grey, opacity: inn(fr, c.price + 4, 14), textAlign: "center", whiteSpace: "nowrap" }}>{c.desc}</div>
              </div>
            </Blur>
          );
        })}
      </div>
    </Block>
  );
};

// ================= INSIDE EVERY BOX (bento) =================
export const Inside: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And inside every box"), L1 = li("Formulas, dashboards"), L2 = li("Sample data"), L3 = li("A tax set-aside"), L4 = li("Country-based"), L5 = li("A Quick Start");
  const lineNow = [L5, L4, L3, L2, L1].find((l) => fr >= ls(l) - 8);
  const cw = (1680 - 3 * 24) / 4, rh = 224;
  const X = (c: number) => MX + c * (cw + 24), Y = (r: number) => 270 + r * (rh + 24);
  const Tile: React.FC<{ c: number; r: number; w?: number; h?: number; at: number; dark?: boolean; title: string; sub: string; children?: React.ReactNode }> = ({ c, r, w = 1, h = 1, at, dark, title, sub, children }) => (
    <Blur at={at - 6} dy={40} len={20} style={{ position: "absolute", left: X(c), top: Y(r) }}>
      <div style={{ position: "relative", width: w * cw + (w - 1) * 24, height: h * rh + (h - 1) * 24, borderRadius: 36, background: dark ? P.ink : P.tile, boxShadow: dark ? SH.deep : "none", padding: 38, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 38, letterSpacing: "-0.035em", color: dark ? "#FFFFFF" : P.ink, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: dark ? "#A1A1A6" : P.grey, marginTop: 10 }}>{sub}</div>
        {children}
      </div>
    </Blur>
  );
  return (
    <Block a={ls(L0) - 8} b={le(L5) + 8} push={0.015}>
      <Seq items={[[ls(L0) - 8, <Center><Say line={L0} size={140} maxWidth={1600} whole /></Center>], ...[L1, L2, L3, L4, L5].map((l) => [ls(l) - 8, <Head line={l} size={56} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])]} />
      {lineNow !== undefined && (
        <Phase a={ls(L1) - 8}>
          <Tile c={0} r={0} w={2} h={2} at={cf(L1, "pop", 1)} dark title="Dashboards & reports" sub="Already built">
            <div style={{ position: "absolute", left: 38, top: 150 }}>
              <Win shot="ecommerce/executive-dashboard" width={760} maxH={400} title="Executive Dashboard.xlsx" />
            </div>
          </Tile>
          <Tile c={2} r={0} at={cf(L1, "pop", 0)} title="Formulas" sub="Every calculation done for you">
            <div style={{ position: "absolute", right: 34, bottom: 18, fontFamily: F.sans, fontWeight: 600, fontSize: 90, letterSpacing: "-0.05em", color: "#DEDEE3", fontStyle: "italic" }}>ƒx</div>
          </Tile>
          <Tile c={3} r={0} at={cf(L2, "pop")} title="Sample data" sub="Works the moment you open it" />
          <Tile c={2} r={1} at={cf(L3, "pop")} title="Tax set-aside estimate" sub="So you can plan for tax time" />
          <Tile c={3} r={1} at={cf(L4, "pop", 0)} title="Country tax-rate presets" sub="With room for your own rate" />
          <Tile c={0} r={2} at={cf(L5, "pop", 0)} title="Quick Start" sub="For day one" />
          <Tile c={1} r={2} w={3} at={cf(L5, "pop", 1)} title="Full Field Guide" sub="Every sheet, explained">
            <div style={{ position: "absolute", right: 60, top: 24, display: "flex", gap: 20 }}>
              {["plumbing-contractor", "dental-practice", "restaurant"].map((s) => <Cover key={s} slug={s} width={124} />)}
            </div>
          </Tile>
        </Phase>
      )}
    </Block>
  );
};

// ================= HOW IT WORKS =================
export const How: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And using it"), L1 = li("Step one"), L2 = li("Step two"), L3 = li("Step three");
  const act = fr >= ls(L3) - 8 ? 2 : fr >= ls(L2) - 8 ? 1 : fr >= ls(L1) - 8 ? 0 : -1;
  const type = cf(L2, "type"), upd = cf(L3, "ding");
  const STEPS = [
    { t: "Open it", s: "It already works, with sample data", at: ls(L1) - 8, shot: "hvac/executive-dashboard", title: "Executive Dashboard.xlsx" },
    { t: "Enter your numbers", s: "Replace the sample rows", at: ls(L2) - 8, shot: "plumbing-contractor/job-revenue-entry", title: "Job Revenue Entry.xlsx" },
    { t: "Everything updates", s: "Dashboards and reports, on their own", at: ls(L3) - 8, shot: "hvac/executive-dashboard", title: "Executive Dashboard.xlsx" },
  ];
  const cw = (1680 - 2 * 32) / 3;
  return (
    <Block a={ls(L0) - 8} b={le(L3) + 8} push={0.015}>
      <Seq items={[[ls(L0) - 8, <Center><Say line={L0} size={140} maxWidth={1600} whole /></Center>], ...[L1, L2, L3].map((l) => [ls(l) - 8, <Head line={l} size={56} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])]} />
      {act >= 0 && (
        <Phase a={ls(L1) - 8}>
          {STEPS.map((s, k) => {
            const on = act === k;
            return (
              <Blur key={k} at={s.at} dy={60} len={22} style={{ position: "absolute", left: MX + k * (cw + 32), top: 280 }}>
                <div style={{ width: cw, height: 660, borderRadius: 44, background: on ? "#FFFFFF" : P.tile, boxShadow: on ? `${SH.deep}, 0 0 0 1px rgba(0,0,0,0.05)` : "none", padding: 40, boxSizing: "border-box", opacity: on ? 1 : 0.55, transform: `translateY(${on ? -10 : 0}px)` }}>
                  <div style={{ width: 64, height: 64, borderRadius: 32, background: on ? P.ink : "#D8D8DD", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 600, fontSize: 32 }}>{k + 1}</div>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 44, letterSpacing: "-0.04em", color: P.ink, marginTop: 30 }}>{s.t}</div>
                  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 25, color: P.grey, marginTop: 8 }}>{s.s}</div>
                  <div style={{ position: "relative", marginTop: 40 }}>
                    <Win shot={s.shot} width={cw - 80} maxH={300} title={s.title} sample={k !== 1} />
                    {k === 1 && fr >= type - 4 && (
                      <div style={{ position: "absolute", left: 0, right: 0, top: 46 + ((Math.max(0, fr - type) * 2.2) % 240), height: 26, background: "rgba(36,72,216,0.14)", borderTop: `2px solid ${P.acc}`, borderBottom: `2px solid ${P.acc}` }} />
                    )}
                    {k === 2 && fr >= upd - 2 && (
                      <div style={{ position: "absolute", left: -10, right: -10, top: 30, bottom: -10, borderRadius: 18, border: `3px solid ${P.acc}`, opacity: inn(fr, upd, 10) * (1 - inn(fr, upd + 30, 30) * 0.6) }} />
                    )}
                  </div>
                </div>
              </Blur>
            );
          })}
        </Phase>
      )}
    </Block>
  );
};

// ================= HONEST ANSWERS =================
export const Honest: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Quick, honest"), L1 = li("Is it a subscription"), L2 = li("Do you need"), L3 = li("You'll just need"), L4 = li("It's a planning");
  const FAQ = [
    { q: "Is it a subscription?", d: "One payment.", at: cf(L1, "pop"), aAt: cf(L1, "stamp") },
    { q: "Do I need to be an Excel expert?", d: "You enter your numbers. The formulas do the rest.", at: cf(L2, "pop"), aAt: cf(L2, "stamp") },
  ];
  const NOTES = [
    { l: "You'll need", t: "The desktop version of Microsoft Excel", at: cf(L3, "pop") },
    { l: "What it is", t: "A planning tool, not tax advice", at: cf(L4, "pop", 0) },
    { l: "Your numbers", t: "Stay in your own file", at: cf(L4, "pop", 1) },
  ];
  const cw = (1680 - 2 * 24) / 3;
  return (
    <Block a={ls(L0) - 8} b={le(L4) + 8} push={0.015}>
      <Seq items={[[ls(L0) - 8, <Center><Say line={L0} size={140} maxWidth={1600} whole /></Center>], [ls(L1) - 8, null]]} />
      {fr >= ls(L1) - 8 && (
        <Phase a={ls(L1) - 8}>
          {FAQ.map((r, k) => (
            <Blur key={k} at={r.at - 6} dy={40} style={{ position: "absolute", left: MX, top: 180 + k * 196 }}>
              <div style={{ width: 1680, height: 172, borderRadius: 40, background: "#FFFFFF", boxShadow: `${SH.card}, 0 0 0 1px rgba(0,0,0,0.05)`, display: "flex", alignItems: "center", padding: "0 56px", boxSizing: "border-box", gap: 40 }}>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 50, letterSpacing: "-0.04em", color: P.ink, flex: 1 }}>{r.q}</div>
                {fr >= r.aAt - 6 && (
                  <Blur at={r.aAt - 4} dy={12} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <Pill dark size={34}>No</Pill>
                    <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, color: P.grey2, maxWidth: 680 }}>{r.d}</div>
                  </Blur>
                )}
              </div>
            </Blur>
          ))}
          {NOTES.map((n, k) => (
            <Blur key={k} at={n.at - 6} dy={40} style={{ position: "absolute", left: MX + k * (cw + 24), top: 600 }}>
              <div style={{ width: cw, height: 300, borderRadius: 40, background: P.tile, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Label>{n.l}</Label>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 44, letterSpacing: "-0.04em", lineHeight: 1.08, color: P.ink }}>{n.t}</div>
              </div>
            </Blur>
          ))}
        </Phase>
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
  const W_ = 126, G = 22;
  return (
    <Block a={ls(L0) - 8} b={le(L2) + 8} push={0.015}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><Center><Say line={L0} size={140} maxWidth={1600} whole /></Center></Phase>
      <Phase a={ls(L1) - 8} b={ls(L2) - 8}>
        <>
          <Head line={L1} size={70} maxWidth={1680} align="center" whole top={150} />
          {[ALL.slice(0, 11), ALL.slice(11)].map((row, r) => (
            <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 310 + r * 230, display: "flex", justifyContent: "center", gap: G }}>
              {row.map((s, k) => (
                <Blur key={s} at={ls(L1) - 4 + (r * 11 + k) * 1.4} dy={40}><Cover slug={s} width={W_} /></Blur>
              ))}
            </div>
          ))}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 830 }}>
            <Blur at={drop - 4} dy={20}>
              <Pill dark size={34} style={{ padding: "24px 44px" }}>
                Find your industry below
                <span style={{ display: "inline-block", transform: `translateY(${Math.abs(Math.sin((fr - drop) / 7)) * 6}px)` }}>↓</span>
              </Pill>
            </Blur>
          </AbsoluteFill>
        </>
      </Phase>
      <Phase a={ls(L2) - 8}>
        <>
          <Blur at={ls(L2) - 6} dy={50} len={24} style={{ position: "absolute", left: MX, top: 230 }}>
            <div style={{ position: "relative" }}>
              <Win shot="hvac/executive-dashboard" width={940} maxH={560} title="HVAC · Full walkthrough" sample />
              <div style={{ position: "absolute", left: 470 - 66, top: 330 - 66, width: 132, height: 132, borderRadius: 66, background: P.ink, boxShadow: SH.deep, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderLeft: "40px solid #FFFFFF", marginLeft: 10 }} />
              </div>
            </div>
          </Blur>
          <div style={{ position: "absolute", left: 1140, top: 250, width: 660 }}>
            <Say line={L2} size={60} maxWidth={660} maxLines={4} align="left" whole />
            <div style={{ height: 50 }} />
            {["One full walkthrough per industry", "Every sheet, shown", "Every sheet, explained"].map((t, q) => (
              <Blur key={q} at={cf(L2, "pop") + q * 5} dy={16} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F.sans, fontWeight: 600, fontSize: 32, letterSpacing: "-0.03em", color: P.ink }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: P.tile, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</div>
                  {t}
                </div>
              </Blur>
            ))}
          </div>
        </>
      </Phase>
    </Block>
  );
};

// ================= END =================
export const End: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Your business already"), L1 = li("ProfitIQS shows you");
  const hit = cf(L1, "impact");
  return (
    <Block a={ls(L0) - 8} b={TOTAL + 20} push={0.02}>
      <Phase a={ls(L0) - 8} b={hit - 8}><Center><Say line={L0} size={140} maxWidth={1600} whole /></Center></Phase>
      <Phase a={hit - 8}>
        <Center style={{ paddingBottom: 40 }}>
          <Blur at={hit - 6} len={26}><Lockup size={170} /></Blur>
          <div style={{ marginTop: 60 }}><Say line={L1} size={72} maxWidth={1500} whole /></div>
          <Blur at={cf(L1, "chime") + 10} dy={16} style={{ marginTop: 60 }}>
            <Pill size={26} style={{ background: P.tile, border: "none", color: P.grey2 }}>21 industries · 63 systems · profitiqs.com</Pill>
          </Blur>
        </Center>
      </Phase>
    </Block>
  );
};

