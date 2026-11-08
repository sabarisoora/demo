import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cf, F, inn, le, li, ls, MX, P, SH, TOTAL } from "../pure/lib";
import { Block, Blur, Card, Center, Cover, Head, KitImg, Label, Lockup, Phase, Photo, Pill, Say, Seq, Tile, TSub, TTitle } from "./ui";

const BigSay: React.FC<{ line: number; size?: number; maxLines?: number }> = ({ line, size = 130, maxLines = 2 }) => (
  <Center><Say line={line} size={size} maxWidth={1600} maxLines={maxLines} whole /></Center>
);
const ALL = ["plumbing-contractor", "hvac", "electrical-contractor", "roofing", "landscaping", "lawn-care", "pest-control", "cleaning-service", "construction", "auto-repair", "manufacturing", "digital-marketing-agency", "airbnb", "ecommerce", "dental-practice", "restaurant", "trucking-owner-operator", "property-management", "rental-portfolio", "1099", "small-business"];

// ================= THE NICHE KITS =================
export const Kit: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Now, the part most"), L1 = li("A complete kit"), L2 = li("Every fact in it"), L3 = li("Product facts, and"), L4 = li("A tier comparison"), L5 = li("Thirty short-form"), L6 = li("A social calendar"), L7 = li("Five email swipes"), L8 = li("Ad copy for Meta"), L9 = li("Plus an objections");
  const cw = (1680 - 3 * 24) / 4, rh = 208;
  const X = (c: number) => MX + c * (cw + 24), Y = (r: number) => 262 + r * (rh + 24);
  const T: React.FC<{ c: number; r: number; w?: number; h?: number; at: number; dark?: boolean; title: string; sub: string; children?: React.ReactNode }> = ({ c, r, w = 1, h = 1, at, dark, title, sub, children }) => (
    <Blur at={at - 6} dy={40} len={20} style={{ position: "absolute", left: X(c), top: Y(r) }}>
      <Tile w={w * cw + (w - 1) * 24} h={h * rh + (h - 1) * 24} dark={dark} pad={34}>
        <TTitle size={34} dark={dark}>{title}</TTitle>
        <TSub dark={dark} size={22}>{sub}</TSub>
        {children}
      </Tile>
    </Blur>
  );
  return (
    <Block a={ls(L0) - 8} b={le(L9) + 10} push={0.01}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={124} /></Phase>
      <Phase a={ls(L1) - 8} b={ls(L2) - 8}>
        <Head line={L1} size={60} maxWidth={1680} align="center" whole top={170} maxLines={1} />
        {[ALL.slice(0, 11), ALL.slice(11)].map((row, r) => (
          <div key={r} style={{ position: "absolute", left: 0, right: 0, top: 360 + r * 240, display: "flex", justifyContent: "center", gap: 22 }}>
            {row.map((s, k) => <Blur key={s} at={cf(L1, "box") - 10 + (r * 11 + k) * 1.3} dy={40}><Cover slug={s} width={130} /></Blur>)}
          </div>
        ))}
      </Phase>
      <Phase a={ls(L2) - 8} b={ls(L3) - 8}>
        <Center style={{ paddingBottom: 40 }}>
          <Say line={L2} size={78} maxWidth={1500} maxLines={3} whole />
          <div style={{ display: "flex", gap: 20, marginTop: 60 }}>
            <Blur at={cf(L2, "stamp") - 6} dy={16}><Pill dark size={32}>✓ Verified from the product files</Pill></Blur>
            <Blur at={cf(L2, "stamp") + 14} dy={16}><Pill size={32}>General industry context</Pill></Blur>
          </div>
        </Center>
      </Phase>
      <Phase a={ls(L3) - 8}>
        <Seq items={[L3, L4, L5, L6, L7, L8, L9].map((l) => [ls(l) - 8, <Head line={l} size={50} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])} />
        <T c={0} r={0} h={3} at={cf(L5, "pop", 0)} dark title="30 video hooks" sub="Each with its angle and a visual">
          <KitImg src="story-1-curiosity.png" width={cw - 68} ratio={1920 / 1080} style={{ position: "absolute", left: 34, top: 150 }} />
        </T>
        <T c={1} r={0} at={cf(L3, "pop")} title="Product facts" sub="Real checkout links, all three editions" />
        <T c={2} r={0} at={cf(L4, "pop")} title="Tier comparison" sub="Recommend the right edition">
          <KitImg src="comparison.png" width={120} ratio={1350 / 1080} radius={8} style={{ position: "absolute", right: 30, bottom: -76 }} />
        </T>
        <T c={3} r={0} at={cf(L5, "pop", 1)} title="10 video scripts" sub="20 to 45 seconds, phone-ready" />
        <T c={1} r={1} w={2} at={cf(L6, "pop", 0)} title="Social calendar" sub="Five carousel decks, already designed">
          <div style={{ position: "absolute", right: 30, bottom: 26, display: "flex", gap: 12 }}>
            {["square-1-problem.png", "square-3-kpi.png", "launch-announcement.png"].map((s, k) => <Blur key={s} at={cf(L6, "pop", 1) - 6 + k * 3} dy={20}><KitImg src={s} width={104} ratio={1} radius={10} /></Blur>)}
          </div>
        </T>
        <T c={3} r={1} at={cf(L7, "pop", 0)} title="5 email swipes" sub="For your own opt-in list" />
        <T c={1} r={2} at={cf(L7, "pop", 1)} title="Cold outreach" sub="An eight-email sequence" />
        <T c={2} r={2} at={cf(L8, "pop", 0)} title="Meta ad copy" sub="Ready to paste into Ads Manager" />
        <T c={3} r={2} at={cf(L8, "pop", 1)} dark title="10 graphics" sub="Plus real workbook screenshots">
        </T>
        {fr >= ls(L9) - 8 && (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 958 }}>
            <div style={{ display: "flex", gap: 14 }}>
              <Blur at={cf(L9, "pop", 0) - 6} dy={12}><Pill dark size={24}>Audience & objections guide</Pill></Blur>
              <Blur at={cf(L9, "pop", 1) - 6} dy={12}><Pill dark size={24}>Publishing checklist</Pill></Blur>
            </div>
          </AbsoluteFill>
        )}
      </Phase>
    </Block>
  );
};

// ================= THE MASTER KIT =================
const MASTER = [["Commission guide", "commission"], ["Brand messaging", "brand"], ["Compliance guide", "compliance,"], ["Recruiting copy", "recruiting"], ["Launch checklist", "launch"], ["Cold-email playbook", "cold-email"], ["All 63 checkout links", "checkout"]];
export const Master: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("And the Master Kit"), L1 = li("the commission guide");
  const cw = (1680 - 3 * 24) / 4;
  return (
    <Block a={ls(L0) - 8} b={le(L1) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={124} /></Phase>
      <Phase a={ls(L1) - 8}>
        <Head line={L1} size={50} maxWidth={1680} maxLines={2} />
        <div style={{ position: "absolute", left: MX, top: 330, width: 1680, display: "grid", gridTemplateColumns: `repeat(4, ${cw}px)`, gap: 24 }}>
          {MASTER.map(([t], k) => {
            const at = cf(L1, "up", k);
            const on = inn(fr, at - 4, 10) > 0.5;
            return (
              <Tile key={k} w={cw} h={280} dark={on} pad={40} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translateY(${on ? -6 : 0}px)`, gridColumn: k === 6 ? "span 1" : undefined }}>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22, color: on ? "#8E8E93" : P.soft }}>{String(k + 1).padStart(2, "0")}</div>
                <TTitle size={40} dark={on}><span style={{ color: on ? "#FFFFFF" : P.soft }}>{t}</span></TTitle>
              </Tile>
            );
          })}
          <Tile w={cw} h={280} pad={40} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", opacity: inn(fr, cf(L1, "up", 6) + 6, 14) }}>
            <TTitle size={34}>Shared across all 21 niches</TTitle>
          </Tile>
        </div>
      </Phase>
    </Block>
  );
};

// ================= YOUR FIRST WEEK =================
const STEPS = [
  { t: "Pick the niche your audience lives in", l: "Pick the niche" },
  { t: "Read its product facts & tier comparison", l: "Read its product" },
  { t: "Choose hooks, scripts, emails & graphics", l: "Pick your hooks" },
  { t: "Copy your link · test it once, privately", l: "Copy your Digistore24" },
  { t: "Publish with a clear disclosure", l: "Then publish" },
  { t: "Check results weekly · keep what works", l: "And check clicks" },
];
const PICK = ALL;
export const Launch: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Here's your first week");
  const Ls = STEPS.map((s) => li(s.l));
  const act = Ls.reduce((a, l, k) => (fr >= ls(l) - 8 ? k : a), -1);
  const pw = 96, ph = 76;
  return (
    <Block a={ls(L0) - 8} b={le(Ls[5]) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(Ls[0]) - 8}><BigSay line={L0} size={140} /></Phase>
      <Phase a={ls(Ls[0]) - 8}>
        <div style={{ position: "absolute", left: MX, top: 170, width: 860 }}>
          {STEPS.map((s, k) => {
            const on = act >= k;
            const done = act > k;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 26, height: 118, borderBottom: `1.5px solid ${P.line}`, opacity: on ? 1 : 0.35 }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, flex: "none", background: done ? P.ink : "#FFFFFF", border: `2.5px solid ${on ? P.ink : P.soft}`, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 600, fontSize: 28 }}>
                  {done ? "✓" : <span style={{ color: on ? P.ink : P.soft }}>{k + 1}</span>}
                </div>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 38, letterSpacing: "-0.035em", color: P.ink, lineHeight: 1.1 }}>{s.t}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 1080, top: 190, width: 720 }}>
          <Label>21 niches · pick yours</Label>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${pw}px)`, gap: 8, marginTop: 24 }}>
            {PICK.map((s, k) => {
              const sel = s === "hvac" && act >= 0;
              const p = inn(fr, ls(Ls[0]) - 6 + k * 1.2, 14);
              return (
                <div key={s} style={{ position: "relative", width: pw, height: ph, borderRadius: 14, overflow: "hidden", opacity: p * (act >= 1 && !sel ? 0.35 : 1), boxShadow: sel ? SH.deep : "none", outline: sel ? `4px solid ${P.ink}` : "none", outlineOffset: 3, transform: `translateY(${(1 - p) * 20}px)` }}>
                  <Photo slug={s} w={pw} h={ph} style={{ filter: act >= 1 && !sel ? "grayscale(1)" : "none" }} />
                </div>
              );
            })}
          </div>
          {act >= 1 && <Blur at={ls(Ls[1]) - 6} dy={14} style={{ marginTop: 26 }}><Pill dark size={26}>Example: HVAC kit</Pill></Blur>}
        </div>
      </Phase>
    </Block>
  );
};

// ================= THE RULES =================
export const Rules: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("A few rules"), L1 = li("Disclose clearly"), L2 = li("No fake reviews"), L3 = li("No spam"), L4 = li("No unapproved"), L5 = li("Cold email has");
  const DO = [["Disclose clearly, next to your link and in videos", cf(L1, "pop")], ["Describe it honestly: an Excel system", cf(L1, "pop") + 12], ["Own list: email swipes · Cold: its own playbook", cf(L5, "pop", 0)]] as [string, number][];
  const DONT = [["Fake reviews or testimonials", cf(L2, "stamp", 0)], ["Income or results claims", cf(L2, "stamp", 1)], ["Spam", cf(L3, "stamp", 0)], ["Bidding on the ProfitIQS name", cf(L3, "stamp", 1)], ["Unapproved discounts or bonuses", cf(L4, "stamp", 0)], ["Claims of integrations, automation or AI", cf(L4, "stamp", 1)]] as [string, number][];
  const cw = (1680 - 32) / 2;
  const Row: React.FC<{ t: string; at: number; ok: boolean }> = ({ t, at, ok }) => (
    <Blur at={at - 6} dy={16}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, height: 92, borderBottom: `1.5px solid ${ok ? P.line : "rgba(255,255,255,0.12)"}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, flex: "none", background: ok ? P.ink : "#FFFFFF", color: ok ? "#FFFFFF" : P.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 600, fontSize: 24 }}>{ok ? "✓" : "✕"}</div>
        <div style={{ position: "relative", fontFamily: F.sans, fontWeight: 600, fontSize: 32, letterSpacing: "-0.03em", color: ok ? P.ink : "#FFFFFF" }}>
          {t}
          {!ok && <div style={{ position: "absolute", left: -4, right: -4, top: "54%", height: 3, background: "#FFFFFF", opacity: 0.85, transformOrigin: "left", transform: `scaleX(${inn(fr, at + 4, 12)})` }} />}
        </div>
      </div>
    </Blur>
  );
  return (
    <Block a={ls(L0) - 8} b={le(L5) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={140} /></Phase>
      <Phase a={ls(L1) - 8}>
        <Seq items={[L1, L2, L3, L4, L5].map((l) => [ls(l) - 8, <Head line={l} size={50} maxWidth={1680} maxLines={1} whole />] as [number, React.ReactNode])} />
        <div style={{ position: "absolute", left: MX, top: 260, display: "flex", gap: 32 }}>
          <Blur at={ls(L1) - 6} dy={40}>
            <Card w={cw} h={680} pad={48}>
              <TTitle size={44}>Do</TTitle>
              <div style={{ marginTop: 20 }}>{DO.map(([t, at], k) => <Row key={k} t={t} at={at} ok />)}</div>
            </Card>
          </Blur>
          <Blur at={ls(L2) - 6} dy={40}>
            <Tile w={cw} h={680} dark pad={48}>
              <TTitle size={44} dark>Never</TTitle>
              <div style={{ marginTop: 20 }}>{DONT.map(([t, at], k) => <Row key={k} t={t} at={at} ok={false} />)}</div>
            </Tile>
          </Blur>
        </div>
      </Phase>
    </Block>
  );
};

// ================= HONEST ANSWERS =================
export const Faq: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("Quick, honest"), L1 = li("Is the ninety percent"), L2 = li("Is it approved"), L3 = li("Can you offer"), L4 = li("Who looks after");
  const QA = [
    { q: "Is the 90% for life?", a: "No", d: "Launch rate, then 85%, then 80%.", at: cf(L1, "pop"), aAt: cf(L1, "stamp") },
    { q: "Approved on Digistore24?", a: "Yes", d: "Every product. Promote today.", at: cf(L2, "pop"), aAt: cf(L2, "stamp") },
    { q: "Can I offer a discount or bonus?", a: "Only if", d: "It's on the sales page, or approved in writing.", at: cf(L3, "pop"), aAt: cf(L3, "stamp") },
    { q: "Who looks after the customer?", a: "ProfitIQS", d: "Support. Digistore24: orders, payments, refunds.", at: cf(L4, "pop", 0), aAt: cf(L4, "pop", 1) },
  ];
  return (
    <Block a={ls(L0) - 8} b={le(L4) + 10} push={0.012}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={140} /></Phase>
      <Phase a={ls(L1) - 8}>
        {QA.map((r, k) => (
          <Blur key={k} at={r.at - 8} dy={40} style={{ position: "absolute", left: MX, top: 170 + k * 190 }}>
            <Card w={1680} h={166} pad={0} style={{ display: "flex", alignItems: "center", padding: "0 56px", gap: 40 }}>
              <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 48, letterSpacing: "-0.04em", color: P.ink, flex: 1 }}>{r.q}</div>
              {fr >= r.aAt - 6 && (
                <Blur at={r.aAt - 4} dy={12} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <Pill dark size={32}>{r.a}</Pill>
                  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, color: P.grey2, width: 600 }}>{r.d}</div>
                </Blur>
              )}
            </Card>
          </Blur>
        ))}
      </Phase>
    </Block>
  );
};

// ================= CALL TO ACTION =================
export const Cta: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("So here's your next"), L1 = li("Email support"), L2 = li("Pick your niche."), L3 = li("ProfitIQS. Real products");
  const hit = cf(L3, "impact");
  return (
    <Block a={ls(L0) - 8} b={TOTAL + 20} push={0.015}>
      <Phase a={ls(L0) - 8} b={ls(L1) - 8}><BigSay line={L0} size={150} /></Phase>
      <Phase a={ls(L1) - 8} b={ls(L2) - 8}>
        <Center style={{ paddingBottom: 30 }}>
          <Blur at={cf(L1, "drop") - 8} dy={16}><Label size={34}>Email the ProfitIQS team</Label></Blur>
          <Blur at={cf(L1, "drop") - 2} dy={30} len={22} style={{ marginTop: 20 }}>
            <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 140, letterSpacing: "-0.06em", color: P.ink, lineHeight: 1 }}>support@profitiqs.com</div>
          </Blur>
          <div style={{ display: "flex", gap: 20, marginTop: 60 }}>
            <Blur at={cf(L1, "pop") - 6} dy={16}><Pill dark size={34}>Subject: Affiliate</Pill></Blur>
            <Blur at={cf(L1, "pop") + 20} dy={16}><Pill size={34}>Ask for your Affiliate Hub link</Pill></Blur>
          </div>
        </Center>
      </Phase>
      <Phase a={ls(L2) - 8} b={hit - 8}>
        <Center>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[["Pick your niche", cf(L2, "pop", 0)], ["Open the kit", cf(L2, "pop", 1)], ["Promote what you stand behind", cf(L2, "ding")]].map(([t, at], k) => (
              <React.Fragment key={k}>
                {k > 0 && <Blur at={(at as number) - 8} dy={0}><div style={{ fontFamily: F.sans, fontSize: 56, color: P.soft }}>→</div></Blur>}
                <Blur at={(at as number) - 6} dy={30}><Pill dark={k === 2} size={44} style={{ padding: "30px 52px" }}>{t as string}</Pill></Blur>
              </React.Fragment>
            ))}
          </div>
        </Center>
      </Phase>
      <Phase a={hit - 8}>
        <Center style={{ paddingBottom: 40 }}>
          <Blur at={hit - 6} len={26}><Lockup size={170} /></Blur>
          <div style={{ marginTop: 60 }}><Say line={L3} size={72} maxWidth={1500} whole /></div>
          <Blur at={cf(L3, "chime") + 10} dy={16} style={{ marginTop: 60 }}>
            <Pill size={26} style={{ background: P.tile, border: "none", color: P.grey2 }}>Affiliate program · approved on Digistore24 · support@profitiqs.com</Pill>
          </Blur>
        </Center>
      </Phase>
    </Block>
  );
};
