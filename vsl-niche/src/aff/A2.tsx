import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ap, C, cf, cl, ez, FONT, GRAD, le, li, ls, pop, TOTAL } from "../home/lib";
import { Phase } from "../home/S1";
import { Card, Chip, Confetti, CoverImg, GText, Icon, IconBubble, KText, Logo, Pop, Rings, Sparkle, Wordmark } from "../home/ui";
import { cur, Mid, Top } from "./A1";
import { Floaters, KitBox, Stage } from "./three";

const Stamp: React.FC<{ at: number; text: string; size?: number; rot?: number }> = ({ at, text, size = 60, rot = -10 }) => {
  const fr = useCurrentFrame();
  if (fr < at - 1) return null;
  return <div style={{ transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * Math.min(1, pop(fr, at, 320, 14))})`, opacity: Math.min(1, pop(fr, at) * 2), border: `${size * 0.11}px solid ${C.mag}`, borderRadius: size * 0.3, padding: `0 ${size * 0.4}px`, fontFamily: FONT.sans, fontWeight: 800, fontSize: size, color: C.mag, background: "rgba(255,255,255,0.95)", whiteSpace: "nowrap" }}>{text}</div>;
};

// ================= MONEY =================
export const Money: React.FC = () => {
  const fr = useCurrentFrame();
  const [L35, L36, L37, L38, L39, L40, L41, L42, L43, L44w] = ["Now, the commission", "From the seventeenth of October", "From the seventeenth of January", "And from the seventeenth of April", "These rates are set", "To put that in", "At ninety percent", "But that's an illustration", "No earnings are promised", "And watch for the phase"].map(li);
  const PH = [
    { pct: 90, h: 0.9, label: "Launch", dates: "17 Oct 2026 – 16 Jan 2027", at: cf(L36, "cash"), c: C.mag },
    { pct: 85, h: 0.85, label: "Growth", dates: "17 Jan – 16 Apr 2027", at: cf(L37, "ding"), c: C.pur },
    { pct: 80, h: 0.8, label: "Standard", dates: "from 17 Apr 2027", at: cf(L38, "ding"), c: C.cya },
  ];
  const ROWS = [["Essential", "$97", "$87.30", cf(L41, "cash", 0)], ["Elite", "$197", "$177.30", cf(L41, "cash", 1)], ["Complete", "$249", "$224.10", cf(L41, "cash", 2)]] as const;
  return (
    <>
      <Phase a={ls(L35) - 6} b={ls(L40) - 4}>
        {fr < ls(L36) - 4 ? <Mid line={L35} size={100} /> : <Top line={cur(fr, [L36, L37, L38, L39])} size={46} y={100} />}
        {fr >= ls(L36) - 6 && (
          <AbsoluteFill style={{ perspective: 1800 }}>
            {/* real 3D columns (cuboids) on a pastel floor */}
            <div style={{ position: "absolute", left: 960, top: 760, width: 0, height: 0, transformStyle: "preserve-3d", transform: "rotateX(-14deg) rotateY(-26deg)" }}>
              <div style={{ position: "absolute", left: -760, top: -10, width: 1520, height: 520, transformOrigin: "50% 0%", transform: "rotateX(90deg)", borderRadius: 40, background: "#F6F6F7", border: `3px solid ${C.line}` }} />
              {PH.map((p, k) => {
                const g = interpolate(fr, [p.at - 4, p.at + 16], [0, 1], { ...cl, easing: ez });
                const H = Math.max(2, 430 * p.h * g), W2 = 230, D = 150;
                const x = (k - 1) * 430 - W2 / 2;
                const face = (st: React.CSSProperties, bg: string) => <div style={{ position: "absolute", background: bg, ...st }} />;
                return (
                  <div key={k} style={{ position: "absolute", left: x, top: 0, width: W2, height: 0, transformStyle: "preserve-3d", transform: `translateZ(${150}px)` }}>
                    {face({ left: 0, top: -H, width: W2, height: H, transform: `translateZ(${D / 2}px)`, borderRadius: "14px 14px 0 0" }, p.c)}
                    {face({ left: W2 / 2 - D / 2, top: -H, width: D, height: H, transform: `rotateY(90deg) translateZ(${W2 / 2}px)` }, `${p.c}99`)}
                    {face({ left: 0, top: -H - D / 2, width: W2, height: D, transform: `translateY(${0}px) rotateX(90deg)`, transformOrigin: "50% 100%", borderRadius: 14 }, "#FFD2B3")}
                    <div style={{ position: "absolute", left: -40, width: W2 + 80, top: -H - 150, textAlign: "center", transform: `translateZ(${D / 2}px) rotateY(26deg) rotateX(14deg)`, fontFamily: FONT.num, fontWeight: 900, fontSize: 80, letterSpacing: "-0.03em", opacity: g }}><GText>{p.pct}%</GText></div>
                  </div>
                );
              })}
            </div>
            {/* labels (flat, readable) */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 70 }}>
              {PH.map((p, k) => (
                <div key={k} style={{ width: 380, textAlign: "center", opacity: ap(fr, p.at + 4, 10) }}>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: C.ink }}>{p.label} · {p.pct}%</div>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 26, color: C.ink2 }}>{p.dates}</div>
                </div>
              ))}
            </div>
            {fr >= ls(L39) - 4 && <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}><Pop at={cf(L39, "pop")}><Chip col={C.pur} size={32}><Icon name="gear" size={38} color={C.pur} /> set manually in Digistore24 at each phase change</Chip></Pop></div>}
            {PH.map((p, k) => <Sparkle key={k} at={p.at + 8} x={560 + k * 420} y={480} n={8} r={160} />)}
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={ls(L40) - 4} b={le(L44w) + 8}>
        {fr < ls(L43) - 4 ? <Top line={cur(fr, [L40, L41, L42])} size={48} y={100} /> : fr < ls(L44w) - 4 ? <Mid line={L43} size={96} /> : <Top line={L44w} size={52} y={180} />}
        {fr >= ls(L44w) - 4 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 480, display: "flex", justifyContent: "center", gap: 50 }}>
            {[["17 January 2027", "90% → 85%", 0], ["17 April 2027", "85% → 80%", 1]].map(([d, ch, q]) => (
              <Pop key={d as string} at={cf(L44w, "ding", q as number)} from={60}>
                <Card style={{ width: 520, padding: "34px 40px", display: "flex", alignItems: "center", gap: 26 }} glow="rgba(255,94,26,0.4)">
                  <IconBubble name="spark" size={96} col={[C.mag, C.cya][q as number]} />
                  <div><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.ink }}>{d}</div><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40 }}><GText>{ch}</GText></div></div>
                </Card>
              </Pop>
            ))}
          </div>
        )}
        {fr < ls(L43) - 4 && (
          <div style={{ position: "absolute", left: 360, top: 260, width: 1200 }}>
            <Pop at={cf(L40, "swish")}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "#FFF4DC", border: "2px solid #F5C451", borderRadius: 999, padding: "10px 26px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 28, color: "#FFC94D", marginBottom: 26 }}>
                <Icon name="spark" size={32} color="#E0A100" /> ILLUSTRATIVE · at 90%, on the displayed price, before Digistore24 fees, taxes and refunds
              </div>
            </Pop>
            <Card style={{ padding: "18px 34px" }}>
              {ROWS.map(([t, price, com, at], k) => (
                <div key={t} style={{ display: "flex", alignItems: "center", padding: "22px 0", borderBottom: k < 2 ? `2px solid ${C.line}` : "none" }}>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink, flex: 1 }}>{t}</div>
                  <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.ink2, width: 220 }}>{price}</div>
                  <Icon name="spark" size={34} color={C.pur} />
                  <div style={{ width: 340, textAlign: "right", fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em", opacity: ap(fr, at - 3, 6), transform: `scale(${fr >= at - 3 ? 0.6 + 0.4 * pop(fr, at, 300, 12) : 0.6})`, transformOrigin: "right" }}><GText>{com}</GText></div>
                </div>
              ))}
            </Card>
            <div style={{ position: "absolute", right: -40, bottom: -60 }}><Stamp at={cf(L42, "stamp")} text="NOT A PAYOUT PROMISE" size={52} /></div>
          </div>
        )}
      </Phase>
    </>
  );
};

// ================= HOW IT WORKS =================
export const How: React.FC = () => {
  const fr = useCurrentFrame();
  const [L44, L45, L46, L47, L48, L49] = ["How it works is simple", "You promote", "A customer buys", "Digistore24 records", "And you see clicks", "One honest note"].map(li);
  const N = [
    { t: "Your affiliate link", i: "spark", at: cf(L45, "pop"), c: C.mag },
    { t: "Customer buys", i: "cart", at: cf(L46, "pop"), c: C.pur },
    { t: "Digistore24 records it", i: "doc", at: cf(L47, "pop"), c: C.cya },
    { t: "You see it in your dashboard", i: "dash", at: cf(L48, "ding"), c: C.grn },
  ];
  const k_ = N.reduce((a, n, k) => (fr >= n.at ? k : a), -1);
  return (
    <Phase a={ls(L44) - 6} b={le(L49) + 8}>
      {fr < ls(L45) - 4 ? <Mid line={L44} size={110} /> : <Top line={cur(fr, [L45, L46, L47, L48, L49])} size={50} y={100} />}
      {fr >= ls(L45) - 4 && (
        <>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {N.slice(0, 3).map((n, k) => {
              const g = interpolate(fr, [N[k + 1].at - 14, N[k + 1].at], [0, 1], { ...cl, easing: ez });
              const x1 = 290 + k * 445 + 170, x2 = 290 + (k + 1) * 445 - 30;
              return (
                <g key={k}>
                  <line x1={x1} y1={530} x2={x1 + (x2 - x1) * g} y2={530} stroke={C.mag} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 18" />
                  {g > 0 && g < 1 && <circle cx={x1 + (x2 - x1) * g} cy={530} r={14} fill={C.mag} />}
                </g>
              );
            })}
            
          </svg>
          {N.map((n, k) => (
            <Pop key={k} at={n.at} from={60} style={{ position: "absolute", left: 160 + k * 445, top: 380 }}>
              <Card style={{ width: 340, height: 300, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, transform: `scale(${k === k_ ? 1.06 : 1})`, border: k === k_ ? `3px solid ${n.c}` : `2px solid ${C.line}` }} glow={`${n.c}66`}>
                <IconBubble name={n.i} size={110} col={n.c} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink, textAlign: "center", lineHeight: 1.15 }}>{n.t}</div>
              </Card>
            </Pop>
          ))}
          {fr >= ls(L49) - 4 && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 24 }}>
              <Pop at={cf(L49, "pop")}><div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "#FFF4DC", border: "2px solid #F5C451", borderRadius: 999, padding: "14px 30px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: "#FFC94D" }}><span style={{ width: 18, height: 18, borderRadius: 9, background: "#FFC94D" }} /> Marketplace listing: submitted, pending approval</div></Pop>
            </div>
          )}
        </>
      )}
    </Phase>
  );
};

// ================= NICHE KIT =================
export const Kit: React.FC = () => {
  const fr = useCurrentFrame();
  const [L50, L51, L52, L53, L54, L55, L56, L57, L58, L59, L60, L61, L62, L54b] = ["Now the part most", "Every fact in it", "Each kit has the product", "A tier comparison", "Thirty short-form", "Ten full video", "A full social-media", "Five email swipes", "An eight-email", "Ready-to-paste", "Ten ready-made", "An audience and", "And a publishing", "Each hook is the first"].map(li);
  const open = interpolate(fr, [cf(L50, "box"), cf(L50, "box") + 20], [0, 1], { ...cl, easing: ez });
  const items = [
    { t: "Verified product facts", i: "check", at: cf(L52, "pop", 0), c: C.grn },
    { t: "Real checkout links", i: "spark", at: cf(L52, "pop", 1), c: C.mag },
    { t: "Tier comparison", i: "card", at: cf(L53, "pop"), c: C.pur },
    { t: "30 video hooks", i: "bolt", at: cf(L54, "pop"), c: C.cya },
    { t: "10 video scripts", i: "play", at: cf(L55, "pop"), c: C.mag },
    { t: "Social calendar + 5 carousels", i: "dash", at: cf(L56, "pop", 0), c: C.pur },
    { t: "5 email swipes", i: "mail", at: cf(L57, "pop"), c: C.cya },
    { t: "8-email cold sequence", i: "mail", at: cf(L58, "pop"), c: C.mag },
    { t: "Meta ad copy", i: "mega", at: cf(L59, "pop"), c: C.pur },
    { t: "10 graphics + screenshots", i: "spark", at: cf(L60, "pop", 0), c: C.cya },
    { t: "Audience & objections", i: "people", at: cf(L61, "pop"), c: C.mag },
    { t: "Publishing checklist", i: "check", at: cf(L62, "ding"), c: C.grn },
  ];
  const hookShow = fr >= cf(L54, "sparkle") - 4 && fr < ls(L55) - 2;
  return (
    <Phase a={ls(L50) - 6} b={le(L62) + 8}>
      <Top line={cur(fr, [L50, L51, L52, L53, L54, L54b, L55, L56, L57, L58, L59, L60, L61, L62])} size={44} y={92} />
      <AbsoluteFill style={{ opacity: 1 - ap(fr, le(L62) - 2, 10) * 0 }}>
        <Stage cam={[0, 0, 9]}><KitBox open={open} rotY={0.35 + Math.sin(fr / 70) * 0.1} y={-2.2} scale={0.52} /></Stage>
      </AbsoluteFill>
      {fr >= ls(L51) - 4 && fr < ls(L52) - 2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 30 }}>
          <Pop at={cf(L51, "pop", 0)}><Chip col={C.grn} size={40}><Icon name="check" size={44} color={C.grn} /> VERIFIED from the product files</Chip></Pop>
          <Pop at={cf(L51, "pop", 1)}><Chip col={C.pur} size={40}><Icon name="spark" size={44} color={C.pur} /> HYPOTHESIS: industry context</Chip></Pop>
        </div>
      )}
      {items.map((it, k) => {
        const s = pop(fr, it.at, 170, 14);
        if (fr < it.at - 1) return null;
        const col = k % 4, row = Math.floor(k / 4);
        const tx = 70 + col * 455, ty = 220 + row * 150;
        const x = interpolate(Math.min(1, s), [0, 1], [960 - 200, tx]);
        const y = interpolate(Math.min(1, s), [0, 1], [760, ty]);
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y, transform: `scale(${0.4 + 0.6 * Math.min(1.1, s)}) rotate(${(1 - Math.min(1, s)) * 25}deg)`, opacity: hookShow ? 0.25 : 1 }}>
            <Card style={{ width: 420, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }} glow={`${it.c}55`}>
              <IconBubble name={it.i} size={66} col={it.c} />
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: C.ink, lineHeight: 1.15 }}>{it.t}</div>
            </Card>
          </div>
        );
      })}
      {hookShow && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Pop at={cf(L54, "sparkle")}>
            <Card style={{ width: 1300, padding: "40px 54px" }} glow="rgba(255,94,26,0.4)">
              <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, letterSpacing: "0.25em", color: C.pur, marginBottom: 14 }}>HOOK #1 · HVAC KIT</div>
              <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 66, lineHeight: 1.2, color: C.ink }}>“Peak season made the year look great. <GText>What happened in the slow months?</GText>”</div>
              {fr >= ls(L54b) - 4 && <div style={{ display: "flex", gap: 20, marginTop: 26 }}><Pop at={cf(L54b, "pop", 0)}><Chip col={C.mag} size={30}><Icon name="bolt" size={34} color={C.mag} /> first 1–3 seconds</Chip></Pop><Pop at={cf(L54b, "pop", 1)}><Chip col={C.pur} size={30}><Icon name="play" size={34} color={C.pur} /> + a full script</Chip></Pop></div>}
            </Card>
          </Pop>
        </AbsoluteFill>
      )}
      <Sparkle at={cf(L50, "box")} x={960} y={700} n={12} r={300} />
    </Phase>
  );
};

// ================= MASTER KIT =================
export const Master: React.FC = () => {
  const fr = useCurrentFrame();
  const [L63, L64] = ["On top of that", "The commission guide"].map(li);
  const T = ["Commission guide", "Brand messaging", "Compliance guide", "Shared recruiting copy", "Launch checklist", "Cold-email playbook", "Asset inventory + all 63 checkout links"];
  return (
    <Phase a={ls(L63) - 6} b={le(L64) + 8}>
      <Top line={fr < ls(L64) - 4 ? L63 : L64} size={48} y={100} />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: "absolute", left: 960 - 160, top: 360, width: 320, height: 420, transformStyle: "preserve-3d" }}>
          {T.map((t, k) => {
            const at = cf(L64, "pop", k);
            const g = interpolate(fr, [at - 4, at + 12], [0, 1], { ...cl, easing: ez });
            const ang = (k - 3) * 16 * g;
            return (
              <div key={k} style={{ position: "absolute", inset: 0, transformOrigin: "50% 140%", transform: `rotateZ(${ang}deg) translateZ(${k * 4}px) translateY(${(1 - g) * 40}px)`, opacity: fr >= at - 4 ? 1 : 0 }}>
                <div style={{ width: 320, height: 420, borderRadius: 26, background: "#FFFFFF", border: `2px solid ${C.mag}`, boxShadow: "0 30px 60px -24px rgba(255,94,26,0.45)", padding: 26, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ width: 120, height: 34, borderRadius: 10, background: [C.magL, C.purL, C.cyaL][k % 3] }} />
                  <IconBubble name={["dollar", "spark", "check", "mega", "rocket", "mail", "doc"][k]} size={80} col={[C.mag, C.pur, C.cya][k % 3]} />
                  <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.15 }}>{t}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {fr < ls(L64) - 4 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 120 }}>
          <Pop at={cf(L63, "chime")}><Chip col={C.pur} size={50}><Icon name="briefcase" size={56} color={C.pur} /> Master Affiliate Kit</Chip></Pop>
          <Sparkle at={cf(L63, "chime")} x={960} y={600} n={12} r={360} />
        </AbsoluteFill>
      )}
    </Phase>
  );
};

// ================= LAUNCH =================
export const Launch: React.FC = () => {
  const fr = useCurrentFrame();
  const [L65, L66, L67, L68, L69, L70, L71, L72, L73, L74] = ["Here's how to launch", "Pick the niche your", "There are twenty-one", "Read that niche", "Pick your hooks", "Sign in to Digistore24", "Check the page", "Test your link", "Then publish", "And check your clicks"].map(li);
  const S = [
    ["Pick your niche", cf(L66, "up")], ["Read facts + tiers", cf(L68, "up")], ["Pick hooks, scripts, emails", cf(L69, "up")], ["Get your Digistore24 link", cf(L70, "up")],
    ["Check the page", cf(L71, "up")], ["Test once, privately", cf(L72, "up")], ["Publish + disclose", cf(L73, "up")], ["Check stats weekly", cf(L74, "up")],
  ] as const;
  const grid = fr >= ls(L67) - 4 && fr < ls(L68) - 2;
  const NM = ["1099 contractors", "Airbnb", "Auto repair", "Cleaning", "Construction", "Dental", "Agencies", "Ecommerce", "Electrical", "HVAC", "Pest control", "Landscaping", "Lawn care", "Manufacturing", "Plumbing", "Property mgmt", "Rental property", "Restaurants", "Roofing", "Small business", "Trucking"];
  return (
    <Phase a={ls(L65) - 6} b={le(L74) + 8}>
      {fr < ls(L66) - 4 ? <Mid line={L65} size={110} /> : <Top line={cur(fr, [L66, L67, L68, L69, L70, L71, L72, L73, L74])} size={44} y={92} />}
      {fr >= ls(L66) - 4 && !grid && (
        <div style={{ position: "absolute", left: 300, top: 250, width: 1320, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 40px" }}>
          {S.map(([t, at], k) => {
            const on = fr >= at;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 22, opacity: on ? 1 : 0.4, transform: `scale(${on ? 0.92 + 0.08 * Math.min(1, pop(fr, at)) : 0.96})` }}>
                <div style={{ width: 70, height: 70, borderRadius: 20, flex: "none", background: on ? C.grnL : "#FFFFFF", border: `3px solid ${on ? C.grn : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? pop(fr, at, 320, 12) : 1})` }}>
                  {on ? <Icon name="check" size={44} color={C.grn} /> : <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: C.mute }}>{k + 1}</span>}
                </div>
                <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: on ? C.ink : C.mute }}>{t}</div>
              </div>
            );
          })}
        </div>
      )}
      {grid && (
        <div style={{ position: "absolute", left: 110, top: 260, width: 1700, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 18 }}>
          {NM.map((t, k) => {
            const at = ls(L67) + 10 + k * Math.floor((le(L67) - ls(L67) - 20) / 21);
            const s = pop(fr, at, 300, 13);
            return (
              <div key={t} style={{ height: 150, borderRadius: 22, background: "#FFFFFF", border: fr >= at ? `2px solid ${C.mag}` : `1px solid ${C.line}`, boxShadow: "0 18px 36px -18px rgba(255,94,26,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 28, color: C.ink, textAlign: "center", padding: "0 10px", opacity: Math.min(1, s * 1.5), transform: `scale(${0.6 + 0.4 * Math.min(1.1, s)})` }}>{t}</div>
            );
          })}
        </div>
      )}
      <Sparkle at={cf(L67, "sparkle")} x={960} y={540} n={14} r={520} />
    </Phase>
  );
};

// ================= EMAIL LANES =================
export const Email: React.FC = () => {
  const fr = useCurrentFrame();
  const [L75, L76, L77, L78] = ["If you use email", "Your own list gets", "Cold outreach to", "Plus the legal"].map(li);
  const Lane: React.FC<{ x: number; t: string; sub: string; i: string; c: string; at: number; children?: React.ReactNode }> = ({ x, t, sub, i, c, at, children }) => (
    <Pop at={at} from={60} style={{ position: "absolute", left: x, top: 260 }}>
      <Card style={{ width: 760, minHeight: 560, padding: 40, display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }} glow={`${c}66`}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}><IconBubble name={i} size={100} col={c} /><div><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: C.ink }}>{t}</div><div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, color: C.ink2 }}>{sub}</div></div></div>
        {children}
      </Card>
    </Pop>
  );
  return (
    <Phase a={ls(L75) - 6} b={le(L78) + 8}>
      <Top line={cur(fr, [L75, L76, L77, L78])} size={46} y={100} />
      <Lane x={150} t="Your own list" sub="opt-in only · email swipes" i="mail" c={C.cya} at={cf(L75, "swish")}>
        {fr >= ls(L76) - 4 && <Pop at={cf(L76, "pop")}><Chip col={C.grn} size={36}><Icon name="check" size={40} color={C.grn} /> only people who opted in</Chip></Pop>}
        {fr >= ls(L76) - 4 && <Pop at={cf(L76, "pop") + 6}><Chip col={C.cya} size={36}><Icon name="mail" size={40} color={C.cya} /> the kit's 5 email swipes</Chip></Pop>}
      </Lane>
      <Lane x={1010} t="Cold outreach" sub="its own playbook · its own setup" i="rocket" c={C.mag} at={cf(L75, "swish") + 6}>
        {[["Separate sending domains", 0], ["Verified list", 1], ["SPF · DKIM · DMARC", 2], ["Weeks of warm-up first", 3]].map(([t, q]) => (
          fr >= ls(L77) - 4 ? <Pop key={t as string} at={cf(L77, "pop", q as number)}><Chip col={C.pur} size={36}><Icon name="check" size={40} color={C.pur} /> {t}</Chip></Pop> : null
        ))}
        {fr >= ls(L78) - 4 && [["Real postal address", 0], ["Working opt-out", 1]].map(([t, q]) => <Pop key={t as string} at={cf(L78, "pop", q as number)}><Chip col={C.cya} size={36}><Icon name="doc" size={40} color={C.cya} /> {t}</Chip></Pop>)}
      </Lane>
    </Phase>
  );
};

// ================= RULES =================
export const Rules: React.FC = () => {
  const fr = useCurrentFrame();
  const [L79, L80, L81, L82, L83, L84, L85, L86, L82b] = ["And the rules that", "Disclose clearly", "Describe the product", "No fake reviews", "No spam", "No discounts", "And no claims", "If you're ever unsure", "If you bought and used"].map(li);
  const DO = [["Disclose next to your link, and in videos", cf(L80, "pop")], ["Describe it honestly: needs desktop Excel", cf(L81, "pop")], ["Bought it? Share your own honest experience", cf(L82b, "pop")]] as const;
  const DONT = [["Fake reviews", cf(L82, "stamp", 0)], ["Income claims", cf(L82, "stamp", 1)], ["Spam", cf(L83, "stamp", 0)], ["Impersonation", cf(L83, "stamp", 1)], ["Brand-name ad bidding", cf(L83, "stamp", 2)], ["Unapproved discounts", cf(L84, "stamp")], ["AI / integration claims", cf(L85, "stamp")]] as const;
  return (
    <Phase a={ls(L79) - 6} b={le(L86) + 8}>
      {fr < ls(L80) - 4 ? <Mid line={L79} size={100} /> : <Top line={cur(fr, [L80, L81, L82, L82b, L83, L84, L85, L86])} size={46} y={92} />}
      {fr >= ls(L80) - 4 && (
        <>
          <div style={{ position: "absolute", left: 120, top: 260, width: 640, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 32, letterSpacing: "0.25em", color: C.grn }}>DO</div>
            {DO.map(([t, at]) => (
              <Pop key={t} at={at}><Card style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }} glow="rgba(16,185,129,0.35)"><IconBubble name="check" size={70} col={C.grn} /><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.2 }}>{t}</div></Card></Pop>
            ))}
            {fr >= ls(L86) - 4 && <Pop at={cf(L86, "ding")}><Card style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 20 }} glow="rgba(255,94,26,0.35)"><IconBubble name="mail" size={70} col={C.pur} /><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.ink }}>Unsure? Leave it out, or ask.</div></Card></Pop>}
          </div>
          <div style={{ position: "absolute", left: 960, top: 240, width: 820 }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 800, fontSize: 32, letterSpacing: "0.25em", color: C.mag, marginBottom: 24 }}>DON'T</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 760 }}>
              {DONT.map(([t, at]) => (
                fr >= at - 6 ? (
                  <div key={t} style={{ position: "relative" }}>
                    <Pop at={at - 6}><Card style={{ padding: "14px 26px", background: C.pinkL, border: "2px solid #F2A9A4", paddingRight: 150 }} glow="rgba(255,61,46,0.3)"><div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, color: C.ink2, textDecoration: fr >= at ? "line-through" : "none", textDecorationColor: C.pink, whiteSpace: "nowrap" }}>{t}</div></Card></Pop>
                    <div style={{ position: "absolute", right: 18, top: 6 }}><Stamp at={at} text="NO" size={42} /></div>
                  </div>
                ) : <div key={t} />
              ))}
            </div>
          </div>
        </>
      )}
    </Phase>
  );
};

// ================= FAQ =================
export const Faq: React.FC = () => {
  const fr = useCurrentFrame();
  const [L87, L88, L89, L90, L91] = ["A few honest answers", "Is the ninety percent", "Is it approved", "Can I offer", "And who looks after"].map(li);
  const QA = [
    { q: "Is the 90% for life?", a: "No: launch rate, then 85%, then 80%", line: L88, at: cf(L88, "stamp"), stamp: true },
    { q: "Approved on the marketplace?", a: "Submitted, pending. Check before you say so", line: L89, at: cf(L89, "pop") },
    { q: "Can I offer a discount or bonus?", a: "Only if it's on the sales page or approved in writing", line: L90, at: cf(L90, "pop") },
    { q: "Who looks after the customer?", a: "ProfitIQS: product support · Digistore24: orders, payments, refunds", line: L91, at: cf(L91, "pop", 0) },
  ];
  return (
    <Phase a={ls(L87) - 6} b={le(L91) + 8}>
      {fr < ls(L88) - 4 ? <Mid line={L87} size={110} /> : <Top line={cur(fr, [L88, L89, L90, L91])} size={44} y={92} />}
      {QA.map((x, k) => {
        if (fr < ls(x.line) - 4) return null;
        const s = pop(fr, ls(x.line), 200, 14);
        return (
          <div key={k} style={{ position: "absolute", left: 180, top: 250 + k * 175, width: 1560, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -200}px)` }}>
            <Card style={{ padding: "26px 36px", display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ fontFamily: FONT.serif, fontWeight: 700, fontSize: 64, lineHeight: 1 }}><GText>Q</GText></div>
              <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: C.ink, width: 620 }}>{x.q}</div>
              {x.stamp && <Stamp at={x.at} text="NO" size={52} />}
              <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: C.ink2, flex: 1, opacity: ap(fr, x.at + 2, 10) }}>{x.a}</div>
            </Card>
          </div>
        );
      })}
    </Phase>
  );
};

// ================= CTA =================
export const Cta: React.FC = () => {
  const fr = useCurrentFrame();
  const [L92, L93, L94, L95] = ["So here's your next", "Ask the ProfitIQS team", "Pick your niche", "ProfitIQS. Real products"].map(li);
  const hit = cf(L95, "impact");
  const close = interpolate(fr, [ls(L94) - 4, ls(L94) + 22], [1, 0], { ...cl, easing: ez });
  return (
    <Phase a={ls(L92) - 6} b={TOTAL + 20}>
      <AbsoluteFill>
        <Stage><Floaters fr={fr} spread={1.05} />{fr < hit && <KitBox open={close} rotY={0.4 + Math.sin(fr / 60) * 0.1} y={-1.1} scale={0.8} bow={ap(fr, cf(L94, "chime"), 10)} />}</Stage>
      </AbsoluteFill>
      {fr < hit - 2 && (fr < ls(L93) - 4 ? <Mid line={L92} size={110} /> : <Top line={fr < ls(L94) - 4 ? L93 : L94} size={50} y={110} />)}
      {fr >= ls(L93) - 4 && fr < hit - 2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 26 }}>
          <Pop at={cf(L93, "pop", 0)}><Chip col={C.mag} size={38}><Icon name="spark" size={42} color={C.mag} /> Ask for your Affiliate Hub link</Chip></Pop>
          <Pop at={cf(L93, "pop", 1)}><Chip col={C.pur} size={38}><Icon name="mail" size={42} color={C.pur} /> support@profitiqs.com · subject: Affiliate</Chip></Pop>
        </div>
      )}
      {fr >= hit - 2 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Rings at={hit} x={960} y={380} n={4} />
          <div style={{ display: "flex", alignItems: "center", gap: 30, transform: `scale(${0.5 + 0.5 * pop(fr, hit, 200, 12)})`, marginTop: -120 }}><Logo size={210} /><Wordmark size={150} /></div>
          <div style={{ marginTop: 40 }}><KText line={L95} size={70} maxWidth={1600} /></div>
          <div style={{ marginTop: 40, display: "flex", gap: 24, opacity: ap(fr, hit + 20, 14) }}>
            <Chip col={C.mag} size={34}><Icon name="mail" size={38} color={C.mag} /> support@profitiqs.com · "Affiliate"</Chip>
            <Chip col={C.cya} size={34}>21 niches · 63 products · a kit for each</Chip>
          </div>
          <Confetti at={hit} x={960} y={400} n={100} spread={1200} />
        </AbsoluteFill>
      )}
    </Phase>
  );
};
export const _u = [CoverImg];
