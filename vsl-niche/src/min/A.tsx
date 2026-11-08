import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { cf, cl, col, COLW, eIO, eOut, F, inn, io, le, li, lio, ls, M, MX, out } from "./lib";
import { Block, Cover, Enter, Label, Lockup, Rule, Say } from "./ui";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);
/** a scene head: the spoken line, top-left */
export const Head: React.FC<{ line: number; size?: number; maxWidth?: number; whole?: boolean; top?: number; align?: "left" | "center" }> = ({ line, size = 60, maxWidth = 1400, whole, top = 170, align = "left" }) => (
  <div style={{ position: "absolute", left: align === "left" ? MX : (1920 - maxWidth) / 2, top }}>
    <Say line={line} size={size} maxWidth={maxWidth} align={align} whole={whole} />
  </div>
);
/** text that rises out of a mask (for fixed words that are not narration) */
export const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; len?: number }> = ({ at, children, style, len = 20 }) => {
  const fr = useCurrentFrame();
  const p = inn(fr, at, len);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

// ================= HOOK =================
const LineClock: React.FC<{ hours: number; size: number; day: number }> = ({ hours, size, day }) => {
  const h = ((hours % 12) / 12) * 360, m = hours * 360;
  const R = 100;
  const arc = (p: number) => {
    if (p <= 0.001) return "";
    const a = Math.min(p, 0.9999) * Math.PI * 2;
    return `M0 0 L0 ${-R + 8} A ${R - 8} ${R - 8} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * (R - 8)} ${-Math.cos(a) * (R - 8)} Z`;
  };
  return (
    <svg width={size} height={size} viewBox="-110 -110 220 220">
      <circle r={R} fill={M.paper} stroke={M.ink} strokeWidth={1.2} />
      <path d={arc(day)} fill={M.accSoft} transform={`rotate(${(7 / 12) * 360})`} />
      {Array.from({ length: 60 }).map((_, k) => {
        const a = (k / 60) * Math.PI * 2, big = k % 5 === 0;
        return <line key={k} x1={Math.sin(a) * (R - (big ? 12 : 6))} y1={-Math.cos(a) * (R - (big ? 12 : 6))} x2={Math.sin(a) * (R - 2)} y2={-Math.cos(a) * (R - 2)} stroke={big ? M.ink : M.faint} strokeWidth={big ? 1.4 : 0.8} />;
      })}
      <line x1={0} y1={0} x2={Math.sin((h * Math.PI) / 180) * 52} y2={-Math.cos((h * Math.PI) / 180) * 52} stroke={M.ink} strokeWidth={3.2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((m * Math.PI) / 180) * 80} y2={-Math.cos((m * Math.PI) / 180) * 80} stroke={M.ink} strokeWidth={1.6} strokeLinecap="round" />
      <circle r={3.4} fill={M.acc} />
    </svg>
  );
};

export const Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const L0 = li("You open"), L1 = li("You close"), L2 = li("Jobs done"), L3 = li("So here's one quick"), L4 = li("How much did"), L5 = li("Not what came");
  const t1 = interpolate(fr, [cf(L0, "tick") - 10, cf(L0, "ding")], [0, 7], { ...cl, easing: eOut });
  const t2 = interpolate(fr, [cf(L1, "whoosh"), cf(L1, "ding") + 4], [0, 12], { ...cl, easing: eIO });
  const pm = fr >= cf(L1, "whoosh") + (cf(L1, "ding") - cf(L1, "whoosh")) / 2;
  const ROWS = [
    { t: "07:14", l: "Job done", s: "✓", at: cf(L2, "pop", 0) },
    { t: "10:32", l: "Invoice sent", s: "→", at: cf(L2, "pop", 1) },
    { t: "13:05", l: "Payment in", s: "+", at: cf(L2, "swish", 0) },
    { t: "16:48", l: "Payment out", s: "−", at: cf(L2, "swish", 1) },
  ];
  return (
    <>
      {/* open at seven, close at seven */}
      <Block a={ls(L0) - 8} b={ls(L2) - 8}>
        <div style={{ position: "absolute", left: MX, top: 380, width: 820 }}>
          <div style={{ overflow: "hidden", height: 30, marginBottom: 26 }}>
            <Label style={{ transform: `translateY(${fr < ls(L1) - 6 ? 0 : -100}%)`, transition: "none" }}>{fr < ls(L1) - 6 ? "Opens" : "Closes"}</Label>
          </div>
          <Say line={fr < ls(L1) - 6 ? L0 : L1} size={104} maxWidth={820} align="left" />
        </div>
        <Enter at={ls(L0) - 6} dy={20} style={{ position: "absolute", left: 1150, top: 250 }}>
          <LineClock hours={t1 + t2} size={480} day={t2 / 12} />
          <div style={{ textAlign: "center", marginTop: 26, fontFamily: F.serif, fontSize: 92, lineHeight: 1, color: M.ink }}>
            7:00 <span style={{ fontStyle: "italic", color: pm ? M.acc : M.ink }}>{pm ? "pm" : "am"}</span>
          </div>
        </Enter>
      </Block>
      {/* the busy day as a quiet ledger */}
      <Block a={ls(L2) - 8} b={ls(L3) - 8}>
        <div style={{ position: "absolute", left: MX, top: 330 }}>
          <Say line={L2} size={78} maxWidth={760} maxLines={4} align="left" whole />
        </div>
        <div style={{ position: "absolute", left: col(7), top: 290, width: 1800 - col(7) }}>
          <Label color={M.mute}>Today</Label>
          <Rule at={ls(L2)} w="100%" color={M.ink} style={{ marginTop: 18 }} />
          {ROWS.map((r, k) => (
            <Enter key={k} at={r.at} dy={14}>
              <div style={{ display: "flex", alignItems: "baseline", height: 104, borderBottom: `1.5px solid ${M.line}`, paddingTop: 34, boxSizing: "border-box" }}>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: M.mute, width: 130 }}>{r.t}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 42, letterSpacing: "-0.02em", color: M.ink, flex: 1 }}>{r.l}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 400, fontSize: 40, color: k === 2 ? M.acc : M.ink2 }}>{r.s}</div>
              </div>
            </Enter>
          ))}
        </div>
      </Block>
      <Block a={ls(L3) - 6} b={ls(L4) - 8}>
        <Center><Say line={L3} size={110} maxWidth={1500} whole /></Center>
      </Block>
      <Block a={ls(L4) - 6} b={ls(L5) - 8}>
        <Center><Say line={L4} size={124} maxWidth={1500} whole /></Center>
      </Block>
      {/* not what came in: what you kept */}
      <Block a={ls(L5) - 6} b={le(L5) + 8}>
        <Center style={{ flexDirection: "row", alignItems: "flex-end", gap: 170, paddingBottom: 40 }}>
          <div>
            <Rise at={ls(L5) - 4}><Label>Not</Label></Rise>
            <Rise at={ls(L5)} style={{ marginTop: 18 }}>
              <div style={{ position: "relative", fontFamily: F.sans, fontWeight: 500, fontSize: 150, letterSpacing: "-0.045em", color: fr >= cf(L5, "strike") ? M.mute : M.ink, lineHeight: 1 }}>
                came in
                <div style={{ position: "absolute", left: -8, right: -8, top: "56%", height: 5, background: M.ink, transformOrigin: "left", transform: `scaleX(${inn(fr, cf(L5, "strike"), 14)})` }} />
              </div>
            </Rise>
          </div>
          <div>
            <Rise at={cf(L5, "ding") - 10}><Label color={M.acc}>What you</Label></Rise>
            <Rise at={cf(L5, "ding") - 4} style={{ marginTop: 6 }}>
              <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 230, color: M.acc, lineHeight: 0.9, letterSpacing: "-0.01em" }}>kept.</div>
            </Rise>
            <Rule at={cf(L5, "ding") + 6} w={420} h={3} color={M.acc} style={{ marginTop: 14 }} />
          </div>
        </Center>
      </Block>
    </>
  );
};

// ================= THE SAME BLIND SPOT =================
const TRADES = [
  { name: "Plumber", q: "Which callbacks are eating the margin?" },
  { name: "Restaurant owner", q: "Where did the prime cost really land?" },
  { name: "Dentist", q: "Why don't production and collections match?" },
  { name: "Trucker", q: "Which loads actually paid after fuel?" },
  { name: "Landlord", q: "Which property is dragging the rest down?" },
];
export const Blind: React.FC = () => {
  const fr = useCurrentFrame();
  const L6 = li("It doesn't matter"), Lx = [li("A plumber"), li("A restaurant"), li("A dentist"), li("A trucker"), li("A landlord")], L12 = li("Different trades");
  const merged = fr >= ls(L12) - 6;
  return (
    <Block a={ls(L6) - 8} b={le(L12) + 8}>
      {fr < ls(Lx[0]) - 8 ? (
        <Center><Say line={L6} size={110} maxWidth={1500} whole /></Center>
      ) : (
        <Head line={merged ? L12 : L6} size={64} whole />
      )}
      <div style={{ position: "absolute", left: MX, top: 330, width: 1680 }}>
        {TRADES.map((t, k) => {
          const at = cf(Lx[k], "pop") - 4;
          if (fr < at - 1) return null;
          const active = fr < (k < 4 ? ls(Lx[k + 1]) - 6 : ls(L12) - 6);
          const dim = merged ? 0.3 : active ? 1 : 0.42;
          return (
            <div key={k} style={{ position: "relative", height: 122 }}>
              <Rule at={at} w="100%" color={active && !merged ? M.ink : M.line} />
              <Enter at={at + 2} dy={18} style={{ display: "flex", alignItems: "baseline", paddingTop: 34 }}>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: M.mute, width: 100 }}>0{k + 1}</div>
                <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 40, letterSpacing: "-0.02em", color: M.ink, width: 480, opacity: dim }}>{t.name}</div>
                <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 58, lineHeight: 1, color: M.ink, opacity: dim }}>{t.q}</div>
              </Enter>
            </div>
          );
        })}
        {/* the one thread through every trade */}
        {merged && (
          <div style={{ position: "absolute", left: 556, top: 0 }}>
            <Rule at={cf(L12, "soft") - 6} w={5 * 122} h={3} vertical color={M.acc} len={26} />
          </div>
        )}
      </div>
    </Block>
  );
};

// ================= THE DATA IS ALREADY THERE =================
const DOCS = [
  { tag: "Invoice", name: "Invoices", rows: [0.8, 0.55, 0.65, 0.4, 0.7] },
  { tag: "Receipt", name: "Receipts", rows: [0.5, 0.7, 0.35, 0.6] },
  { tag: "Statement", name: "Bank statements", rows: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9] },
  { tag: "Export", name: "The apps you use", rows: [0.6, 0.45, 0.75, 0.5, 0.65] },
];
const DocCard: React.FC<{ d: (typeof DOCS)[number] }> = ({ d }) => (
  <div style={{ width: 3 * COLW + 2 * 24, height: 400, background: M.paper, border: `1.5px solid ${M.line}`, borderRadius: 4, padding: "30px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: "0 24px 48px -32px rgba(24,24,27,0.3)" }}>
    <Label color={M.mute} size={18}>{d.tag}</Label>
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 34 }}>
      {d.rows.map((w, k) => <div key={k} style={{ height: 8, width: `${w * 100}%`, background: M.line, borderRadius: 1 }} />)}
    </div>
    <div style={{ marginTop: "auto", fontFamily: F.sans, fontWeight: 500, fontSize: 36, letterSpacing: "-0.02em", color: M.ink }}>{d.name}</div>
  </div>
);
const SCAT = [{ x: -40, y: 70, r: -5 }, { x: 30, y: -40, r: 4 }, { x: -20, y: 90, r: -3 }, { x: 50, y: -20, r: 6 }];
export const DataScene: React.FC = () => {
  const fr = useCurrentFrame();
  const L13 = li("And here's the thing"), L14 = li("Invoices. Receipts"), L15 = li("It's just never"), L16 = li("That's why we built");
  const hit = cf(L16, "impact");
  const scatter = io(fr, cf(L15, "glitch") - 4, 30);
  const gather = io(fr, ls(L16) - 4, hit - ls(L16) + 4);
  return (
    <Block a={ls(L13) - 8} b={hit - 2}>
      {fr < ls(L14) - 8 ? (
        <Center><Say line={L13} size={104} maxWidth={1500} maxLines={2} whole /></Center>
      ) : fr < ls(L16) - 8 ? (
        <Head line={fr < ls(L15) - 8 ? L14 : L15} size={60} whole />
      ) : null}
      {DOCS.map((d, k) => {
        const at = cf(L14, "pop", k) - 4;
        if (fr < at - 1) return null;
        const p = inn(fr, at, 20);
        const x0 = col(k * 3), y0 = 410;
        const sx = x0 + SCAT[k].x * scatter, sy = y0 + SCAT[k].y * scatter;
        const cx = 960 - (3 * COLW + 48) / 2, cy = 380;
        const x = sx + (cx - sx) * gather, y = sy + (cy - sy) * gather + (1 - p) * 30;
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, opacity: p * (1 - scatter * 0.4) * (1 - out(fr, hit - 10, 8)), transform: `rotate(${SCAT[k].r * scatter * (1 - gather)}deg)` }}>
            <DocCard d={d} />
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
  const up = io(fr, ls(L17) - 8, 22);
  const n21 = Math.round(interpolate(fr, [cf(L18, "count", 0), cf(L18, "count", 0) + 24], [0, 21], { ...cl, easing: eOut }));
  const n63 = Math.round(interpolate(fr, [cf(L18, "count", 1), cf(L18, "count", 1) + 24], [0, 63], { ...cl, easing: eOut }));
  const FAN = ["plumbing-contractor", "dental-practice", "restaurant"];
  const FANL = ["Plumbing", "Dental", "Restaurant"];
  return (
    <>
      {/* that's why we built ProfitIQS */}
      <Block a={ls(L16) - (hasData ? 0 : 8)} b={ls(L18) - 8}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: interpolate(up, [0, 1], [360, 200]) }}>
          <Rise at={ls(L16) - 2} style={{ opacity: 1 - up }}><Label>That's why we built</Label></Rise>
          <div style={{ height: interpolate(up, [0, 1], [40, 0]) }} />
          <Rise at={hit - 4} len={24}><Lockup size={interpolate(up, [0, 1], [150, 84])} /></Rise>
        </AbsoluteFill>
        {fr >= ls(L17) - 8 && (
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 420 }}>
            <Say line={L17} size={72} maxWidth={1500} maxLines={2} />
            <div style={{ display: "flex", gap: 24, marginTop: 70 }}>
              {[["Microsoft Excel", cf(L17, "pop", 0)], ["One industry each", cf(L17, "pop", 1)]].map(([t, at], k) => (
                <Enter key={k} at={(at as number) - 4} dy={16}>
                  <div style={{ border: `1.5px solid ${M.ink}`, borderRadius: 999, padding: "16px 30px" }}><Label color={M.ink}>{t}</Label></div>
                </Enter>
              ))}
            </div>
          </AbsoluteFill>
        )}
      </Block>
      {/* 21 / 63 */}
      <Block a={ls(L18) - 8} b={ls(L19) - 8}>
        <Center style={{ flexDirection: "row", gap: 0 }}>
          {[{ n: n21, l: "Industries", at: cf(L18, "count", 0) }, { n: n63, l: "Systems", at: cf(L18, "count", 1) }].map((x, k) => (
            <React.Fragment key={k}>
              {k === 1 && <Rule at={cf(L18, "count", 1) - 8} w={420} vertical color={M.ink} h={1.5} style={{ margin: "0 120px" }} />}
              <Enter at={x.at - 6} dy={20} style={{ width: 520, textAlign: "center" }}>
                <div style={{ fontFamily: F.serif, fontSize: 380, lineHeight: 0.86, letterSpacing: "-0.02em", color: k === 1 ? M.acc : M.ink, fontVariantNumeric: "tabular-nums" }}>{x.n}</div>
                <Label style={{ marginTop: 30 }}>{x.l}</Label>
              </Enter>
            </React.Fragment>
          ))}
        </Center>
      </Block>
      {/* not a generic template */}
      <Block a={ls(L19) - 8} b={ls(L20) - 8}>
        <Head line={L19} size={60} maxWidth={1680} />
        <Enter at={ls(L19)} dy={20} style={{ position: "absolute", left: MX, top: 340 }}>
          <div style={{ position: "relative", width: 400, height: 470, background: M.paper, border: `1.5px solid ${M.line}`, borderRadius: 4, padding: 34, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 22 }}>
            {[0.9, 0.7, 0.8, 0.55, 0.75, 0.6, 0.85].map((w, k) => <div key={k} style={{ height: 10, width: `${w * 100}%`, background: M.line }} />)}
            <svg style={{ position: "absolute", inset: 0 }} width={400} height={470}>
              <line x1={0} y1={0} x2={400} y2={470} stroke={M.ink} strokeWidth={2} strokeDasharray={620} strokeDashoffset={620 * (1 - inn(fr, cf(L19, "stamp"), 14))} />
              <line x1={400} y1={0} x2={0} y2={470} stroke={M.ink} strokeWidth={2} strokeDasharray={620} strokeDashoffset={620 * (1 - inn(fr, cf(L19, "stamp") + 5, 14))} />
            </svg>
          </div>
          <Label color={M.mute} style={{ marginTop: 26 }}>Generic template</Label>
        </Enter>
        <div style={{ position: "absolute", left: 640, top: 340, width: 1, height: 520, background: M.line }} />
        <div style={{ position: "absolute", left: 760, top: 340, display: "flex", gap: 44 }}>
          {FAN.map((s, k) => (
            <Enter key={s} at={cf(L19, "sparkle") - 8 + k * 5} dy={30} len={24}>
              <Cover slug={s} width={310} />
              <Label style={{ marginTop: 26 }}>{FANL[k]}</Label>
            </Enter>
          ))}
        </div>
      </Block>
      {/* experts in their trade */}
      <Block a={ls(L20) - 8} b={le(L20) + 8}>
        <Center><Say line={L20} size={92} maxWidth={1500} maxLines={3} whole strike={["spreadsheets"]} /></Center>
      </Block>
    </>
  );
};
