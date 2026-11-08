import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cf, cl, eOut, F, inn, io, le, li, ls, MX, P, SH } from "../pure/lib";
import { Block, Blur, Card, Center, Cover, Head, Label, Lockup, Phase, Photo, Pill, Say, Seq, Tile, TSub, TTitle, Win } from "./ui";

const BigSay: React.FC<{ line: number; size?: number; maxLines?: number }> = ({ line, size = 130, maxLines = 2 }) => (
  <Center><Say line={line} size={size} maxWidth={1600} maxLines={maxLines} whole /></Center>
);
const count = (fr: number, at: number, n: number) => Math.round(interpolate(fr, [at, at + 26], [0, n], { ...cl, easing: eOut }));

// ================= COLD OPEN =================
const HYPE = [
  { t: "$10K a month, guaranteed", s: "Sponsored" },
  { t: "My results (screenshot)", s: "Sponsored" },
  { t: "Secret system, 24 hours only", s: "Sponsored" },
];
export const Open: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("If you've ever"), L1 = li("Hype."), L2 = li("And when you finally"), L3 = li("This is the opposite");
  const st = [cf(L1, "strike", 0), cf(L1, "strike", 1), cf(L1, "strike", 2)];
  return (
    <Block a={ls(L0) - 8} b={le(L3) + 10} push={0.015}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={110} /></Phase>
      <Phase a={ls(L1) - 8} b={ls(L2) - 8}>
        <Head line={L1} size={60} maxWidth={1680} whole />
        <div style={{ position: "absolute", left: MX, top: 330, display: "flex", gap: 40 }}>
          {HYPE.map((h, k) => {
            const s = inn(fr, st[k], 12);
            return (
              <Blur key={k} at={ls(L1) - 4 + k * 4} dy={50}>
                <Card w={533} h={360} style={{ opacity: 1 - s * 0.45 }}>
                  <Label>{h.s}</Label>
                  <div style={{ position: "relative", marginTop: 70, fontFamily: F.sans, fontWeight: 600, fontSize: 52, letterSpacing: "-0.04em", lineHeight: 1.06, color: s > 0.5 ? P.soft : P.ink }}>
                    {h.t}
                  </div>
                  <svg style={{ position: "absolute", left: 0, top: 0 }} width={533} height={360}>
                    <line x1={40} y1={320} x2={493} y2={40} stroke={P.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray={540} strokeDashoffset={540 * (1 - s)} />
                  </svg>
                </Card>
              </Blur>
            );
          })}
        </div>
      </Phase>
      <Phase a={ls(L2) - 8} b={ls(L3) - 8}><BigSay line={L2} size={104} /></Phase>
      <Phase a={ls(L3) - 8}><BigSay line={L3} size={190} /></Phase>
    </Block>
  );
};

// ================= THE PRODUCT =================
const PRICES = [
  { tier: "Essential" as const, p: "$97", d: "The core numbers", k: 0 },
  { tier: "Elite" as const, p: "$197", d: "The full system, deeper analysis", k: 1 },
  { tier: "Complete" as const, p: "$249", d: "Both editions, together", k: 2 },
];
export const What: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("ProfitIQS makes"), L1 = li("Twenty-one industries"), L2 = li("Every one is a ready-built"), L3 = li("The owner enters"), L4 = li("And sample data means"), L5 = li("Essential, $97"), L6 = li("One payment.");
  const rise = inn(fr, ls(L0) - 2, 34);
  const chips = [["Dashboards", cf(L2, "pop", 0)], ["Reports", cf(L2, "pop", 1)], ["Tax set-aside estimate", cf(L2, "pop", 2)]] as [string, number][];
  return (
    <Block a={ls(L0) - 8} b={le(L6) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 128 }}>
          <Blur at={ls(L0) - 6}><Lockup size={64} /></Blur>
          <div style={{ height: 30 }} />
          <Say line={L0} size={50} maxWidth={1680} maxLines={1} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 960 - 640, top: 350, perspective: 2400, opacity: rise, filter: rise < 1 ? `blur(${(1 - rise) * 10}px)` : undefined }}>
          <div style={{ transform: `translateY(${(1 - rise) * 260}px) rotateX(${(1 - rise) * 22}deg)`, transformOrigin: "50% 100%" }}>
            <Win shot="hvac/executive-dashboard" width={1280} maxH={560} title="HVAC · Executive Dashboard.xlsx" />
          </div>
        </div>
      </Phase>
      <Phase a={ls(L1) - 8} b={ls(L2) - 8}>
        <Center style={{ flexDirection: "row", gap: 32 }}>
          {[
            { n: count(fr, cf(L1, "count", 0), 21), l: "industries", s: "Each with its own systems", at: cf(L1, "count", 0) - 8, dark: true },
            { n: 3, l: "editions each", s: "Essential · Elite · Complete", at: cf(L1, "ding") - 8, dark: false },
            { n: count(fr, cf(L1, "count", 1), 63), l: "products", s: "Every one built for its trade", at: cf(L1, "count", 1) - 8, dark: false },
          ].map((x, k) => (
            <Blur key={k} at={x.at} dy={50}>
              <Tile w={540} h={560} dark={x.dark} pad={52} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <TSub dark={x.dark} size={28}>{x.s}</TSub>
                <div>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 260, letterSpacing: "-0.07em", lineHeight: 0.85, fontVariantNumeric: "tabular-nums" }}>{x.n}</div>
                  <TTitle size={50} dark={x.dark}>{x.l}</TTitle>
                </div>
              </Tile>
            </Blur>
          ))}
        </Center>
      </Phase>
      <Phase a={ls(L2) - 8} b={ls(L5) - 8}>
        <Seq items={[L2, L3, L4].map((l) => [ls(l) - 8, <div style={{ position: "absolute", left: MX, top: 300 }}><Say line={l} size={60} maxWidth={660} maxLines={5} align="left" whole /></div>] as [number, React.ReactNode])} />
        <Blur at={ls(L2) - 4} dy={60} len={24} style={{ position: "absolute", left: 860, top: 230 }}>
          <div style={{ position: "relative" }}>
            <Win shot="ecommerce/executive-dashboard" width={940} maxH={520} title="Ecommerce · Executive Dashboard.xlsx" />
            {fr >= cf(L3, "type") - 4 && fr < ls(L4) - 8 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 46 + ((Math.max(0, fr - cf(L3, "type")) * 3) % 460), height: 30, background: "rgba(36,72,216,0.14)", borderTop: `2px solid ${P.acc}`, borderBottom: `2px solid ${P.acc}` }} />
            )}
          </div>
        </Blur>
        <div style={{ position: "absolute", left: 860, top: 850, display: "flex", gap: 14 }}>
          {chips.map(([t, at], k) => <Blur key={k} at={at - 4} dy={16}><Pill size={26}>{t}</Pill></Blur>)}
          {fr >= ls(L4) - 8 && <Blur at={cf(L4, "sparkle") - 6} dy={16}><Pill dark size={26}>Sample data included</Pill></Blur>}
        </div>
      </Phase>
      <Phase a={ls(L5) - 8} b={ls(L6) - 8}>
        <div style={{ position: "absolute", left: MX, top: 200, width: 1680, display: "flex", gap: 40 }}>
          {PRICES.map((c) => (
            <Blur key={c.k} at={ls(L5) - 4 + c.k * 5} dy={60} len={22} style={{ flex: 1 }}>
              <Card w={533} h={720} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ alignSelf: "stretch" }}><TTitle size={40}>{c.tier}</TTitle></div>
                <div style={{ position: "relative", width: 290, height: 340, marginTop: 30 }}>
                  {c.tier === "Complete" ? (
                    <>
                      <Cover slug="hvac" tier="Essential" width={210} style={{ position: "absolute", left: 0, top: 30 }} />
                      <Cover slug="hvac" tier="Elite" width={210} style={{ position: "absolute", left: 80, top: 0 }} />
                    </>
                  ) : <Cover slug="hvac" tier={c.tier} width={236} style={{ position: "absolute", left: 27, top: 0 }} />}
                </div>
                <div style={{ height: 130, marginTop: 30 }}>
                  {fr >= cf(L5, "cash", c.k) - 8 && (
                    <Blur at={cf(L5, "cash", c.k) - 6} dy={20}>
                      <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 120, letterSpacing: "-0.06em", lineHeight: 1, color: P.ink }}>{c.p}</div>
                    </Blur>
                  )}
                </div>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, color: P.grey, opacity: inn(fr, cf(L5, "cash", c.k) + 4, 14), whiteSpace: "nowrap" }}>{c.d}</div>
              </Card>
            </Blur>
          ))}
        </div>
      </Phase>
      <Phase a={ls(L6) - 8}>
        <Center>
          <div style={{ display: "flex", gap: 24 }}>
            {[["One payment", cf(L6, "pop", 0), true], ["No subscription", cf(L6, "stamp"), false], ["Desktop Microsoft Excel", cf(L6, "pop", 1), false]].map(([t, at, d], k) => (
              <Blur key={k} at={(at as number) - 6} dy={30}><Pill dark={d as boolean} size={52} style={{ padding: "34px 60px" }}>{t as string}</Pill></Blur>
            ))}
          </div>
        </Center>
      </Phase>
    </Block>
  );
};

// ================= THE PROBLEM IT SOLVES =================
const TRADE = [
  { p: "A plumber", a: "ProfitIQS gives him a Callback", slug: "plumbing-contractor", title: "Plumbing Contractor", sheets: [["Callback Tracker", "callback-tracker"], ["Job Profitability Center", "job-profitability-center"]] },
  { p: "A restaurant owner", a: "ProfitIQS gives her a Prime", slug: "restaurant", title: "Restaurant", sheets: [["Prime Cost Center", "prime-cost-center"], ["Menu Intelligence Center", "menu-intelligence-center"]] },
  { p: "A landlord", a: "ProfitIQS gives him cap", slug: "rental-portfolio", title: "Rental Property", sheets: [["Cap Rate Center", "cap-rate-center"], ["Cash-on-Cash Return", "cash-on-cash-return"], ["DSCR Center", "dscr-center"]] },
];
export const Problem: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Here's why owners"), L7 = li("A real problem"), L8 = li("And that's exactly");
  const starts = TRADE.map((t) => ls(li(t.p)) - 8);
  return (
    <Block a={ls(L0) - 8} b={le(L8) + 10} push={0.01}>
      <Phase a={ls(L0) - 8} b={starts[0]}><BigSay line={L0} size={130} /></Phase>
      {TRADE.map((t, k) => {
        const Lp = li(t.p), La = li(t.a);
        const chipAt = t.sheets.map((_, q) => cf(La, "pop", q) - 6);
        const cur = chipAt.reduce((acc, a, q) => (fr >= a ? q : acc), -1);
        const winIn = inn(fr, chipAt[0] - 4, 24);
        return (
          <Phase key={k} a={starts[k]} b={k < 2 ? starts[k + 1] : ls(L7) - 8}>
            <Blur at={starts[k] + 2} dy={40} style={{ position: "absolute", left: MX, top: 190 }}>
              <div style={{ position: "relative", width: 760, height: 430, borderRadius: 40, overflow: "hidden", boxShadow: SH.deep }}>
                <Photo slug={t.slug} w={760} h={430} zoom={1 + 0.03 * inn(fr, starts[k], 120)} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(11,11,12,0.18)" }} />
              </div>
            </Blur>
            <div style={{ position: "absolute", left: MX, top: 660 }}>
              <Say line={Lp} size={58} maxWidth={760} maxLines={3} align="left" whole />
            </div>
            {cur >= 0 && (
              <div style={{ position: "absolute", left: 960, top: 190, opacity: winIn, filter: winIn < 1 ? `blur(${(1 - winIn) * 12}px)` : undefined, transform: `translate(${(1 - winIn) * 120}px, 0)` }}>
                <Label color={P.acc} size={28}>The answer, in the {t.title} system</Label>
                <div style={{ position: "relative", marginTop: 24, height: 520 }}>
                  {t.sheets.map(([name, shot], q) => {
                    const v = q === cur ? (q === 0 ? 1 : inn(fr, chipAt[q] + 6, 12)) : q === cur - 1 ? 1 - inn(fr, chipAt[cur] - 3, 8) : 0;
                    if (v <= 0) return null;
                    return <div key={q} style={{ position: "absolute", left: 0, top: 0, opacity: v }}><Win shot={`${t.slug}/${shot}`} width={840} maxH={470} title={`${t.title} · ${name}`} /></div>;
                  })}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", width: 840 }}>
                  {t.sheets.map(([name], q) => <Blur key={q} at={chipAt[q]} dy={14}><Pill dark={q === cur} size={26}>{name}</Pill></Blur>)}
                </div>
              </div>
            )}
          </Phase>
        );
      })}
      <Phase a={ls(L7) - 8} b={ls(L8) - 8}><BigSay line={L7} size={96} maxLines={2} /></Phase>
      <Phase a={ls(L8) - 8}><BigSay line={L8} size={130} /></Phase>
    </Block>
  );
};

// ================= WHY IT'S EASY TO PROMOTE =================
const WHY = [
  { t: "One industry each", s: "The message fits your audience" },
  { t: "Three price points", s: "Recommend the right edition, honestly" },
  { t: "One-time payment", s: "No subscription to explain" },
  { t: "Sample data", s: "Screen-record a working dashboard on day one" },
];
export const Why: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Four things make"), Lx = [li("One. Every product"), li("Two. Three price"), li("Three. A one-time"), li("Four. Sample data")];
  const act = Lx.reduce((a, l, k) => (fr >= ls(l) - 8 ? k : a), -1);
  return (
    <Block a={ls(L0) - 8} b={le(Lx[3]) + 10} push={0.012}>
      <Seq items={[[ls(L0) - 8, <BigSay line={L0} size={130} />], ...Lx.map((l) => [ls(l) - 8, <Head line={l} size={54} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])]} />
      {act >= 0 && (
        <Phase a={ls(Lx[0]) - 8}>
          <div style={{ position: "absolute", left: MX, top: 280, width: 1680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {WHY.map((w, k) => (
              <Blur key={k} at={cf(Lx[k], "pop") - 8} dy={40}>
                <Tile w={828} h={318} dark={act === k} pad={48} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translateY(${act === k ? -6 : 0}px)` }}>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 90, letterSpacing: "-0.06em", lineHeight: 0.9, color: act === k ? "#FFFFFF" : P.soft }}>0{k + 1}</div>
                  <div>
                    <TTitle size={48} dark={act === k}>{w.t}</TTitle>
                    <TSub dark={act === k} size={28}>{w.s}</TSub>
                  </div>
                </Tile>
              </Blur>
            ))}
          </div>
        </Phase>
      )}
    </Block>
  );
};

// ================= THE COMMISSION =================
const PHASES = [
  { pct: "90%", name: "Launch", d: "17 Oct 2026 – 16 Jan 2027" },
  { pct: "85%", name: "Growth", d: "17 Jan 2027 – 16 Apr 2027" },
  { pct: "80%", name: "Standard", d: "From 17 Apr 2027" },
];
const ILL = [
  { tier: "Essential", price: "$97", c: "$87.30" },
  { tier: "Elite", price: "$197", c: "$177.30" },
  { tier: "Complete", price: "$249", c: "$224.10" },
];
export const Money: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Now, the commission"), L1 = li("From the seventeenth of October"), L2 = li("Then eighty-five"), L3 = li("And from the seventeenth of April"), L4 = li("Rates are set"), L5 = li("As an illustration"), L6 = li("Elite, one seventy-seven"), L7 = li("Fees, taxes");
  const pAt = [ls(L1) + 6, cf(L2, "cash"), cf(L3, "cash")];
  const act = pAt.reduce((a, t, k) => (fr >= t - 8 ? k : a), -1);
  const cAt = [cf(L5, "cash"), cf(L6, "cash", 0), cf(L6, "cash", 1)];
  const cw = (1680 - 2 * 32) / 3;
  return (
    <Block a={ls(L0) - 8} b={le(L7) + 10} push={0.01}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={140} /></Phase>
      <Phase a={ls(L1) - 8} b={ls(L5) - 8}>
        <Seq items={[L1, L2, L3, L4].map((l) => [ls(l) - 8, <Head line={l} size={50} maxWidth={1680} maxLines={2} whole />] as [number, React.ReactNode])} />
        <div style={{ position: "absolute", left: MX, top: 330, display: "flex", gap: 32 }}>
          {PHASES.map((p, k) => {
            const on = act === k && fr < ls(L4) - 8;
            return (
              <Blur key={k} at={pAt[k] - 10} dy={50}>
                <Tile w={cw} h={480} dark={on} pad={50} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translateY(${on ? -8 : 0}px)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <TTitle size={36} dark={on}>{p.name}</TTitle>
                    <TSub dark={on} size={24}>Phase {k + 1}</TSub>
                  </div>
                  <div>
                    <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 210, letterSpacing: "-0.07em", lineHeight: 0.85, color: on ? "#FFFFFF" : P.ink }}>{p.pct}</div>
                    <TSub dark={on} size={30}>{p.d}</TSub>
                  </div>
                </Tile>
              </Blur>
            );
          })}
        </div>
        {fr >= ls(L4) - 8 && (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 880 }}>
            <Blur at={cf(L4, "pop") - 8} dy={16}><Pill size={28}>Set in Digistore24 at each phase change · the rate at the time of sale applies</Pill></Blur>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={ls(L5) - 8}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
          <Blur at={ls(L5) - 6} dy={16}>
            <Pill size={28} style={{ background: P.tile, border: "none" }}>Illustrative · at 90% · on the displayed price · before Digistore24 fees, taxes and refunds · not a guarantee</Pill>
          </Blur>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: MX, top: 280, display: "flex", gap: 32 }}>
          {ILL.map((c, k) => (
            <Blur key={k} at={cAt[k] - 10} dy={50}>
              <Card w={cw} h={460} pad={50} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <TTitle size={40}>{c.tier}</TTitle>
                  <TSub size={30}>{c.price} sale</TSub>
                </div>
                <div>
                  <TSub size={26}>Illustrative commission at 90%</TSub>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 116, letterSpacing: "-0.06em", lineHeight: 0.95, color: P.ink, marginTop: 14, fontVariantNumeric: "tabular-nums" }}>{c.c}</div>
                </div>
              </Card>
            </Blur>
          ))}
        </div>
        {fr >= ls(L7) - 8 && (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 800 }}>
            <Blur at={ls(L7) - 6} dy={16} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, color: P.grey2 }}>Digistore24 fees, taxes, refunds and chargebacks all apply</div>
              <Blur at={cf(L7, "stamp") - 6} dy={14}><Pill dark size={34}>No earnings are promised</Pill></Blur>
            </Blur>
          </AbsoluteFill>
        )}
      </Phase>
    </Block>
  );
};

// ================= HOW IT WORKS =================
const STEPS = [
  { t: "Share your link", s: "Your own Digistore24 affiliate link" },
  { t: "A customer buys", s: "Through your link" },
  { t: "Digistore24 records it", s: "Commission credited on eligible orders" },
  { t: "You see it", s: "Clicks, sales and refunds, in your dashboard" },
];
export const How: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("How it works is simple"), Lx = [li("You share your own"), li("A customer buys"), li("Digistore24 records"), li("And you see clicks")], La = li("And the good news");
  const at = [cf(Lx[0], "pop"), cf(Lx[1], "pop"), cf(Lx[2], "ding"), cf(Lx[3], "pop")];
  const act = at.reduce((a, t, k) => (fr >= t - 8 ? k : a), -1);
  const cw = (1680 - 3 * 28) / 4;
  return (
    <Block a={ls(L0) - 8} b={le(La) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(Lx[0]) - 8}><BigSay line={L0} size={140} /></Phase>
      <Phase a={ls(Lx[0]) - 8} b={ls(La) - 8}>
        <Seq items={Lx.map((l) => [ls(l) - 8, <Head line={l} size={54} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])} />
        <div style={{ position: "absolute", left: MX, top: 330, display: "flex", gap: 28 }}>
          {STEPS.map((s, k) => (
            <Blur key={k} at={at[k] - 10} dy={50}>
              <Tile w={cw} h={480} dark={act === k} pad={44} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translateY(${act === k ? -8 : 0}px)` }}>
                <div style={{ width: 72, height: 72, borderRadius: 36, background: act === k ? "#FFFFFF" : P.ink, color: act === k ? P.ink : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 600, fontSize: 34 }}>{k + 1}</div>
                <div>
                  <TTitle size={44} dark={act === k}>{s.t}</TTitle>
                  <TSub dark={act === k} size={26}>{s.s}</TSub>
                </div>
              </Tile>
            </Blur>
          ))}
        </div>
      </Phase>
      <Phase a={ls(La) - 8}>
        <Center style={{ paddingBottom: 40 }}>
          <Blur at={cf(La, "impact") - 10} dy={30} len={22}>
            <div style={{ width: 170, height: 170, borderRadius: 85, background: P.ink, boxShadow: SH.deep, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: F.sans, fontWeight: 600, fontSize: 96 }}>✓</div>
          </Blur>
          <div style={{ marginTop: 56 }}><Say line={La} size={84} maxWidth={1500} maxLines={2} whole /></div>
          <Blur at={cf(La, "chime") - 6} dy={16} style={{ marginTop: 50 }}><Pill dark size={32}>Approved on Digistore24 · start promoting today</Pill></Blur>
        </Center>
      </Phase>
    </Block>
  );
};

