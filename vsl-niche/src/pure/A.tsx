import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cf, cl, eOut, F, inn, io, le, li, lio, ls, MX, out, P, SH } from "./lib";
import { Block, Blur, Center, Cover, Head, Label, Lockup, Photo, Pill, Say, Seq, Win } from "./ui";

// ================= HOOK =================
const Time: React.FC<{ pm: boolean }> = ({ pm }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 26, fontFamily: F.sans, fontWeight: 600, letterSpacing: "-0.06em", color: P.ink, lineHeight: 1 }}>
    <span style={{ fontSize: 330, fontVariantNumeric: "tabular-nums" }}>7:00</span>
    <span style={{ fontSize: 110, color: pm ? P.acc : P.grey, letterSpacing: "-0.03em" }}>{pm ? "pm" : "am"}</span>
  </div>
);
const NOTE = [
  { g: "✓", t: "Job done", s: "Service call closed" },
  { g: "↗", t: "Invoice sent", s: "Awaiting payment" },
  { g: "+", t: "Payment in", s: "Deposited" },
  { g: "−", t: "Payment out", s: "Supplier paid" },
];
export const Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("You open"), L1 = li("You close"), L2 = li("Jobs done"), L3 = li("So here's one quick"), L4 = li("How much did"), L5 = li("Not what came");
  const sw = cf(L1, "whoosh");
  const roll = io(fr, sw, 16);
  const at = [cf(L2, "pop", 0), cf(L2, "pop", 1), cf(L2, "swish", 0), cf(L2, "swish", 1)];
  return (
    <>
      <Block a={ls(L0) - 8} b={ls(L2) - 8}>
        <Center style={{ paddingBottom: 30 }}>
          <Blur at={ls(L0) - 6}>
            <Pill size={26} style={{ background: P.tile, border: "none" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: fr < sw + 8 ? "#30B05A" : P.soft }} />
              {fr < sw + 8 ? "Open" : "Closed"}
            </Pill>
          </Blur>
          <div style={{ position: "relative", height: 330, width: 1100, overflow: "hidden", marginTop: 30, display: "flex", justifyContent: "center" }}>
            <Blur at={ls(L0) - 4} len={22} dy={60} style={{ position: "absolute", opacity: 1 - roll, transform: `translateY(${-roll * 120}px)`, filter: roll > 0 ? `blur(${roll * 14}px)` : undefined }}><Time pm={false} /></Blur>
            {roll > 0 && <div style={{ position: "absolute", opacity: roll, transform: `translateY(${(1 - roll) * 120}px)`, filter: roll < 1 ? `blur(${(1 - roll) * 14}px)` : undefined }}><Time pm /></div>}
          </div>
          <div style={{ marginTop: 50, position: "relative", width: 1400, height: 80 }}><Seq items={[[ls(L0) - 8, <Say line={L0} size={64} maxWidth={1400} whole />], [ls(L1) - 8, <Say line={L1} size={64} maxWidth={1400} whole />]]} /></div>
        </Center>
      </Block>
      <Block a={ls(L2) - 8} b={ls(L3) - 8}>
        <div style={{ position: "absolute", left: MX, top: 330 }}>
          <Say line={L2} size={84} maxWidth={760} maxLines={4} align="left" whole />
        </div>
        <div style={{ position: "absolute", left: 1010, top: 250, width: 790 }}>
          {NOTE.map((n, k) => {
            if (fr < at[k] - 6) return null;
            const p = inn(fr, at[k] - 6, 18);
            return (
              <div key={k} style={{ marginBottom: 22, opacity: p, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined, transform: `translateY(${(1 - p) * 40}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 26, background: "#FFFFFF", borderRadius: 30, padding: "26px 32px", boxShadow: `${SH.card}, 0 0 0 1px rgba(0,0,0,0.04)` }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, background: k === 2 ? P.acc : P.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.sans, fontWeight: 600, fontSize: 34 }}>{n.g}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 36, letterSpacing: "-0.03em", color: P.ink }}>{n.t}</div>
                    <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: P.grey, marginTop: 4 }}>{n.s}</div>
                  </div>
                  <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22, color: P.grey }}>now</div>
                </div>
              </div>
            );
          })}
        </div>
      </Block>
      <Block a={ls(L3) - 6} b={ls(L4) - 8}>
        <Center><Say line={L3} size={130} maxWidth={1600} whole /></Center>
      </Block>
      <Block a={ls(L4) - 6} b={ls(L5) - 8}>
        <Center><Say line={L4} size={150} maxWidth={1600} whole /></Center>
      </Block>
      <Block a={ls(L5) - 6} b={le(L5) + 8}>
        <Center>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 150 }}>
            <div>
              <Blur at={ls(L5) - 4}><Label>Not what</Label></Blur>
              <Blur at={ls(L5)} style={{ marginTop: 10 }}>
                <div style={{ position: "relative", fontFamily: F.sans, fontWeight: 600, fontSize: 170, letterSpacing: "-0.06em", lineHeight: 1, color: fr >= cf(L5, "strike") ? P.soft : P.ink }}>
                  came in
                  <div style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 8, borderRadius: 4, background: P.ink, transformOrigin: "left", transform: `scaleX(${inn(fr, cf(L5, "strike"), 14)})` }} />
                </div>
              </Blur>
            </div>
            <div>
              <Blur at={cf(L5, "ding") - 10}><Label color={P.acc}>What you</Label></Blur>
              <Blur at={cf(L5, "ding") - 6} style={{ marginTop: 10 }}>
                <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 250, letterSpacing: "-0.065em", lineHeight: 0.92, color: P.ink }}>kept.</div>
              </Blur>
            </div>
          </div>
        </Center>
      </Block>
    </>
  );
};

// ================= THE SAME BLIND SPOT =================
const TRADES = [
  { name: "Plumber", slug: "plumbing-contractor", q: "Which callbacks are eating the margin?" },
  { name: "Restaurant owner", slug: "restaurant", q: "Where did prime cost really land?" },
  { name: "Dentist", slug: "dental-practice", q: "Why don't production and collections match?" },
  { name: "Trucker", slug: "trucking-owner-operator", q: "Which loads actually paid after fuel?" },
  { name: "Landlord", slug: "rental-portfolio", q: "Which property is dragging the rest down?" },
];
const TILE_POS = [
  { x: 0, y: 0, w: 544 }, { x: 568, y: 0, w: 544 }, { x: 1136, y: 0, w: 544 },
  { x: 0, y: 324, w: 828 }, { x: 852, y: 324, w: 828 },
];
export const Blind: React.FC = () => {
  const fr = useCurrentFrame();
  const L6 = li("It doesn't matter"), Lx = [li("A plumber"), li("A restaurant"), li("A dentist"), li("A trucker"), li("A landlord")], L12 = li("Different trades");
  const gone = out(fr, ls(L12) - 18, 10);
  return (
    <Block a={ls(L6) - 8} b={le(L12) + 8}>
      <Seq items={[
        [ls(L6) - 8, <Center><Say line={L6} size={130} maxWidth={1600} whole /></Center>],
        [cf(Lx[0], "pop") - 14, <Head line={L6} size={60} whole />],
        [ls(L12) - 8, <Center><Say line={L12} size={130} maxWidth={1600} maxLines={2} whole /></Center>],
      ]} />
      {gone < 1 && fr >= cf(Lx[0], "pop") - 8 && (
        <div style={{ position: "absolute", left: MX, top: 300, width: 1680, height: 624, opacity: 1 - gone, filter: gone > 0 ? `blur(${gone * 12}px)` : undefined, transform: `translateY(${gone * 40}px)` }}>
          {TRADES.map((t, k) => {
            const at = cf(Lx[k], "pop") - 6;
            if (fr < at - 1) return null;
            const p = inn(fr, at, 18);
            const active = fr < (k < 4 ? ls(Lx[k + 1]) - 6 : ls(L12) - 6);
            const a = inn(fr, at + 4, 10) * (active ? 1 : 0);
            const pos = TILE_POS[k];
            return (
              <div key={k} style={{ position: "absolute", left: pos.x, top: pos.y, width: pos.w, height: 300, borderRadius: 36, overflow: "hidden", background: P.ink,
                boxShadow: active ? SH.deep : SH.soft, opacity: p, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined, transform: `translateY(${(1 - p) * 40 - a * 10}px)` }}>
                <Photo slug={t.slug} style={{ filter: active ? "none" : "grayscale(1)", transform: `scale(${1.04 + 0.04 * a})` }} />
                <div style={{ position: "absolute", inset: 0, background: `rgba(11,11,12,${active ? 0.38 : 0.66})` }} />
                <div style={{ position: "absolute", inset: 0, padding: 44, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Label color="rgba(255,255,255,0.72)">0{k + 1} · {t.name}</Label>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 46, letterSpacing: "-0.035em", lineHeight: 1.08, color: "#FFFFFF", opacity: active ? 1 : 0.8 }}>{t.q}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Block>
  );
};

// ================= THE DATA IS ALREADY THERE =================
const DOCS = [
  { tag: "Invoice", name: "Invoices", rows: [0.8, 0.55, 0.65, 0.4] },
  { tag: "Receipt", name: "Receipts", rows: [0.5, 0.7, 0.35, 0.6] },
  { tag: "Statement", name: "Bank statements", rows: [0.9, 0.9, 0.9, 0.9, 0.9] },
  { tag: "Export", name: "The apps you use", rows: [0.6, 0.45, 0.75, 0.5] },
];
const SCAT = [{ x: -10, y: 70, r: -6 }, { x: 30, y: -50, r: 5 }, { x: -30, y: 80, r: -4 }, { x: -50, y: -30, r: 3 }];
export const DataScene: React.FC = () => {
  const fr = useCurrentFrame();
  const L13 = li("And here's the thing"), L14 = li("Invoices. Receipts"), L15 = li("It's just never"), L16 = li("That's why we built");
  const hit = cf(L16, "impact");
  const scatter = io(fr, cf(L15, "glitch") - 4, 30);
  const gather = io(fr, ls(L16) - 4, hit - ls(L16) + 4);
  const W_ = 380, G = (1680 - 4 * 380) / 3;
  return (
    <Block a={ls(L13) - 8} b={hit - 2} push={0.02}>
      <Seq items={[
        [ls(L13) - 8, <Center><Say line={L13} size={124} maxWidth={1600} maxLines={2} whole /></Center>],
        [ls(L14) - 8, <Head line={L14} size={60} maxWidth={1600} whole />],
        [ls(L15) - 8, <Head line={L15} size={60} maxWidth={1600} whole />],
        [ls(L16) - 8, null],
      ]} />
      {DOCS.map((d, k) => {
        const at = cf(L14, "pop", k) - 6;
        if (fr < at - 1) return null;
        const p = inn(fr, at, 18);
        const x0 = MX + k * (W_ + G), y0 = 380;
        const sx = x0 + SCAT[k].x * scatter, sy = y0 + SCAT[k].y * scatter;
        const x = sx + (960 - W_ / 2 - sx) * gather, y = sy + (330 - sy) * gather + (1 - p) * 40;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, opacity: p * (1 - out(fr, hit - 12, 10)), filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined, transform: `rotate(${SCAT[k].r * scatter * (1 - gather)}deg)` }}>
            <div style={{ width: W_, height: 460, background: "#FFFFFF", borderRadius: 28, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: `${SH.card}, 0 0 0 1px rgba(0,0,0,0.04)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: P.tile }} />
                <Label size={22}>{d.tag}</Label>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 40 }}>
                {d.rows.map((w, q) => <div key={q} style={{ height: 12, width: `${w * 100}%`, background: P.tile, borderRadius: 6 }} />)}
              </div>
              <div style={{ marginTop: "auto", fontFamily: F.sans, fontWeight: 600, fontSize: 36, letterSpacing: "-0.035em", color: P.ink }}>{d.name}</div>
            </div>
          </div>
        );
      })}
    </Block>
  );
};

// ================= REVEAL =================
export const Reveal: React.FC = () => {
  const fr = useCurrentFrame();
  const L16 = li("That's why we built"), L17 = li("Business intelligence"), L18 = li("Twenty-one"), L19 = li("Not one generic"), L20 = li("Built for people");
  const hasData = lio("It's just never") >= 0;
  const hit = cf(L16, "impact");
  const up = io(fr, ls(L17) - 10, 24);
  const n21 = Math.round(interpolate(fr, [cf(L18, "count", 0), cf(L18, "count", 0) + 26], [0, 21], { ...cl, easing: eOut }));
  const n63 = Math.round(interpolate(fr, [cf(L18, "count", 1), cf(L18, "count", 1) + 26], [0, 63], { ...cl, easing: eOut }));
  const rise = inn(fr, ls(L17) - 2, 34);
  const FAN = [["plumbing-contractor", "Plumbing"], ["dental-practice", "Dental"], ["restaurant", "Restaurants"]];
  return (
    <>
      <Block a={ls(L16) - (hasData ? 0 : 8)} b={ls(L18) - 8} push={0.015}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: interpolate(up, [0, 1], [380, 130]) }}>
          <div style={{ opacity: 1 - up, height: interpolate(up, [0, 1], [70, 0]), overflow: "hidden" }}><Blur at={ls(L16) - 2}><Label size={34}>That's why we built</Label></Blur></div>
          <Blur at={hit - 6} len={24} dy={20}><Lockup size={interpolate(up, [0, 1], [190, 64])} /></Blur>
        </AbsoluteFill>
        {fr >= ls(L17) - 8 && (
          <>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 228 }}>
              <Say line={L17} size={54} maxWidth={1600} maxLines={1} />
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 960 - 640, top: 340, perspective: 2400, opacity: rise, filter: rise < 1 ? `blur(${(1 - rise) * 10}px)` : undefined }}>
              <div style={{ transform: `translateY(${(1 - rise) * 260}px) rotateX(${(1 - rise) * 22}deg)`, transformOrigin: "50% 100%" }}>
                <Win shot="hvac/executive-dashboard" width={1280} maxH={570} title="HVAC · Executive Dashboard.xlsx" />
              </div>
            </div>
          </>
        )}
      </Block>
      <Block a={ls(L18) - 8} b={ls(L19) - 8} push={0.02}>
        <Center style={{ flexDirection: "row", gap: 40 }}>
          {[{ n: n21, l: "industries", at: cf(L18, "count", 0) }, { n: n63, l: "systems", at: cf(L18, "count", 1) }].map((x, k) => (
            <Blur key={k} at={x.at - 8} dy={50} len={20}>
              <div style={{ width: 760, height: 580, borderRadius: 48, background: k === 0 ? P.ink : P.tile, boxShadow: k === 0 ? SH.deep : "none", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56, boxSizing: "border-box" }}>
                <Label size={32} color={k === 0 ? "#A1A1A6" : P.grey}>{k === 0 ? "One industry each" : "Three editions each"}</Label>
                <div>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 300, letterSpacing: "-0.07em", lineHeight: 0.85, color: k === 0 ? "#FFFFFF" : P.ink, fontVariantNumeric: "tabular-nums" }}>{x.n}</div>
                  <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 56, letterSpacing: "-0.04em", color: k === 0 ? "#FFFFFF" : P.ink, marginTop: 16 }}>{x.l}</div>
                </div>
              </div>
            </Blur>
          ))}
        </Center>
      </Block>
      <Block a={ls(L19) - 8} b={ls(L20) - 8} push={0.02}>
        <Head line={L19} size={64} maxWidth={1680} maxLines={1} />
        <Blur at={ls(L19)} dy={30} style={{ position: "absolute", left: MX, top: 300 }}>
          <div style={{ position: "relative", width: 440, height: 560, borderRadius: 36, background: P.tile, padding: 44, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
            <Label>Generic template</Label>
            {[0.9, 0.7, 0.8, 0.55, 0.75, 0.6, 0.85].map((w, k) => <div key={k} style={{ height: 14, width: `${w * 100}%`, background: "#E8E8EC", borderRadius: 7 }} />)}
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={440} height={560}>
              <line x1={70} y1={90} x2={370} y2={470} stroke={P.ink} strokeWidth={8} strokeLinecap="round" strokeDasharray={490} strokeDashoffset={490 * (1 - inn(fr, cf(L19, "stamp"), 14))} />
              <line x1={370} y1={90} x2={70} y2={470} stroke={P.ink} strokeWidth={8} strokeLinecap="round" strokeDasharray={490} strokeDashoffset={490 * (1 - inn(fr, cf(L19, "stamp") + 5, 14))} />
            </svg>
          </div>
        </Blur>
        <div style={{ position: "absolute", left: 680, top: 300, display: "flex", gap: 46 }}>
          {FAN.map(([s, n], k) => (
            <Blur key={s} at={cf(L19, "sparkle") - 10 + k * 5} dy={50} len={24}>
              <Cover slug={s} width={330} />
              <Label style={{ marginTop: 30, textAlign: "center" }} color={P.ink}>{n}</Label>
            </Blur>
          ))}
        </div>
      </Block>
      <Block a={ls(L20) - 8} b={le(L20) + 8}>
        <Center><Say line={L20} size={104} maxWidth={1600} maxLines={3} whole strike={["spreadsheets"]} /></Center>
      </Block>
    </>
  );
};
