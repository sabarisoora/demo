import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot } from "remotion";
import { F, P, SH } from "../pure/lib";
import { Cover, Logo, Photo, Win } from "../pure/ui";

// trade label, Elite sheet count (from each niche spec)
export const NICHES: Record<string, [string, number]> = {
  "1099": ["1099 contractors", 26], airbnb: ["Airbnb hosts", 25], "auto-repair": ["Auto repair shops", 41], "cleaning-service": ["Cleaning services", 27],
  construction: ["Construction", 25], "dental-practice": ["Dental practices", 42], "digital-marketing-agency": ["Marketing agencies", 26], ecommerce: ["Online stores", 26],
  "electrical-contractor": ["Electrical contractors", 24], hvac: ["HVAC", 30], landscaping: ["Landscaping", 28], "lawn-care": ["Lawn care", 42], manufacturing: ["Manufacturing", 26],
  "pest-control": ["Pest control", 25], "plumbing-contractor": ["Plumbers", 48], "property-management": ["Property managers", 29], "rental-portfolio": ["Rental investors", 46],
  restaurant: ["Restaurants", 28], roofing: ["Roofing", 26], "small-business": ["Small business", 25], "trucking-owner-operator": ["Owner-operators", 26],
};

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { Promise.all(["500 40px 'Inter Tight'", "600 40px 'Inter Tight'"].map((x) => document.fonts.load(x))).then(() => continueRender(h)); }, [h]);
};
const Pill: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number }> = ({ children, dark, size = 24 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 999, padding: `${size * 0.5}px ${size * 0.95}px`, background: dark ? P.ink : P.tile, color: dark ? "#fff" : P.ink, fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{children}</div>
);
const Brand: React.FC = () => (
  <div style={{ position: "absolute", left: 64, top: 52, display: "flex", alignItems: "center", gap: 10 }}>
    <Logo size={34} />
    <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 28, letterSpacing: "-0.04em", color: P.ink }}>ProfitIQS</div>
  </div>
);
const Head: React.FC<{ lines: [string, boolean][]; size: number }> = ({ lines, size }) => (
  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.0, color: P.ink }}>
    {lines.map(([t, acc], k) => <div key={k} style={{ color: acc ? P.acc : P.ink }}>{t}</div>)}
  </div>
);

const NicheThumb: React.FC<{ slug: string }> = ({ slug }) => {
  const [trade, n] = NICHES[slug];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Brand />
      <div style={{ position: "absolute", left: 64, top: 150 }}>
        <Pill size={26}>{trade}</Pill>
        <div style={{ height: 26 }} />
        <Head size={86} lines={[[`${n} sheets.`, true], ["Every one,", false], ["walked through.", false]]} />
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 56 }}><Pill dark size={26}>Full walkthrough · sample data</Pill></div>
      <div style={{ position: "absolute", right: 48, top: 48, width: 520, height: 624, borderRadius: 40, overflow: "hidden", boxShadow: SH.deep }}>
        <Photo slug={slug} w={520} h={624} />
      </div>
      <div style={{ position: "absolute", right: 318, bottom: 40 }}><Cover slug={slug} tier="Elite" width={236} /></div>
    </AbsoluteFill>
  );
};

const HomeThumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff" }}>
    <Brand />
    <div style={{ position: "absolute", left: 64, top: 150 }}>
      <Pill size={26}>21 industries · 63 systems</Pill>
      <div style={{ height: 26 }} />
      <Head size={82} lines={[["Your business", false], ["already has", false], ["the numbers.", true]]} />
    </div>
    <div style={{ position: "absolute", left: 64, bottom: 56 }}><Pill dark size={26}>Business intelligence in Excel</Pill></div>
    <div style={{ position: "absolute", right: 36, top: 110 }}><Win shot="hvac/executive-dashboard" width={590} maxH={330} title="HVAC · Executive Dashboard.xlsx" /></div>
    <div style={{ position: "absolute", right: 70, bottom: 36, display: "flex", gap: 18 }}>
      {["plumbing-contractor", "dental-practice", "restaurant"].map((s) => <Cover key={s} slug={s} width={168} />)}
    </div>
  </AbsoluteFill>
);

const AffThumb: React.FC = () => {
  const ph = ["plumbing-contractor", "restaurant", "dental-practice", "trucking-owner-operator", "hvac", "rental-portfolio"];
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Brand />
      <div style={{ position: "absolute", left: 64, top: 150 }}>
        <Pill size={26}>Affiliate program</Pill>
        <div style={{ height: 26 }} />
        <Head size={96} lines={[["Promote", false], ["something", false], ["real.", true]]} />
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 56 }}><Pill dark size={26}>Approved on Digistore24</Pill></div>
      <div style={{ position: "absolute", right: 48, top: 48, display: "grid", gridTemplateColumns: "repeat(2, 256px)", gap: 14 }}>
        {ph.map((s) => (
          <div key={s} style={{ position: "relative", width: 256, height: 196, borderRadius: 28, overflow: "hidden", boxShadow: SH.soft }}><Photo slug={s} w={256} h={196} /></div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 330, bottom: 44 }}><Cover slug="hvac" tier="Elite" width={210} /></div>
    </AbsoluteFill>
  );
};

const Thumb: React.FC<{ kind: string; slug?: string }> = ({ kind, slug }) => {
  useFonts();
  return kind === "home" ? <HomeThumb /> : kind === "aff" ? <AffThumb /> : <NicheThumb slug={slug!} />;
};
registerRoot(() => <Composition id="Thumb" component={Thumb as React.FC<any>} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ kind: "niche", slug: "hvac" }} />);
