import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Burst, LightLeak, Shockwave, SpaceBg } from "../fx";
import { ap, at, C, FONT, pop, Win } from "../lib";
import { Cover, Eyebrow, Glass, Icon, LogoMark, Pop, Slam, Wordmark } from "../ui";
import { Beat } from "./a";

const QA: React.FC<{ win: Win; q: number; a: number; n: number; question: string; children: React.ReactNode }> = ({ win, q, a, n, question, children }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const start = L[q].s - 3;
  const end = L[a + 1] ? L[a + 1].s - 4 : win.duration;
  if (fr < start || fr > end + 9) return null;
  const o = 1 - ap(fr, end, 8);
  const lift = ap(fr, at(win, q, 0.45), 14);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380 - lift * 290, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${1 - lift * 0.35})` }}>
        <Eyebrow at={start}>Honest answer {n} of 4</Eyebrow>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 112, color: C.white, textAlign: "center", transform: `scale(${pop(fr, L[q].s, 260, 14)})` }}>“{question}”</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, opacity: lift, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>{children}</div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ at: number; children: React.ReactNode; tone?: string }> = ({ at: a, children, tone = C.green }) => (
  <Pop at={a} from={30}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.sans, fontWeight: 700, fontSize: 36, color: C.white, background: `${tone}22`, border: `1.5px solid ${tone}aa`, padding: "16px 30px", borderRadius: 999 }}>
      <Icon name="check" size={30} color={tone} />
      {children}
    </div>
  </Pop>
);

export const Obj: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1e3a8a" hue2="#312e81" grid={false} />
      <Beat win={win} i={0}>
        <Slam text="Honest answers to [real questions.]" at={L[0].s} size={92} />
      </Beat>
      <QA win={win} q={1} a={2} n={1} question="I just use my bank app.">
        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          <Pop at={at(win, 1, 0.55)}>
            <Glass style={{ width: 560, padding: 40, height: 360, boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Icon name="bank" size={60} color={C.muted} /><span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.white }}>Bank app</span></div>
              <div style={{ marginTop: 30, fontFamily: FONT.sans, fontSize: 34, color: C.muted, lineHeight: 1.5 }}>Money in<br />Money out</div>
            </Glass>
          </Pop>
          <Pop at={L[2].s}>
            <Glass style={{ width: 760, padding: 40, height: 360, boxSizing: "border-box" }} glow={C.cyan}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}><LogoMark size={40} /><span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.white }}>+ This system</span></div>
              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
                {["Client profitability", "Mileage", "Tax planning", "Year-end package"].map((t, i) => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", opacity: ap(fr, at(win, 2, 0.15 + i * 0.18)), fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, color: C.white }}><Icon name="check" size={26} color={C.green} />{t}</div>
                ))}
              </div>
            </Glass>
          </Pop>
        </div>
      </QA>
      <QA win={win} q={3} a={4} n={2} question="I'm not a spreadsheet person.">
        <div style={{ display: "flex", gap: 22 }}>
          <Chip at={at(win, 3, 0.6)}>You don't have to be</Chip>
          <Chip at={at(win, 4, 0.05)}>Everything's built</Chip>
          <Chip at={at(win, 4, 0.25)}>You just log</Chip>
        </div>
        <div style={{ display: "flex", gap: 46, alignItems: "flex-end" }}>
          {[["docs/fg-01.png", "Field Guide", at(win, 4, 0.6)], ["docs/qs-3.png", "Quick Start", at(win, 4, 0.78)]].map(([s, t, a]) => (
            <Pop key={t as string} at={a as number}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Img src={staticFile(s as string)} style={{ height: 330, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }} />
                <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 28, color: C.white }}>{t as string}</div>
              </div>
            </Pop>
          ))}
        </div>
      </QA>
      <QA win={win} q={5} a={6} n={3} question="Will it lower my taxes?">
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 64, color: C.white, opacity: ap(fr, at(win, 5, 0.55)) }}>No tool can promise that.</div>
        <div style={{ display: "flex", gap: 22 }}>
          <Chip at={at(win, 6, 0.08)} tone={C.cyan}>Deductions tracked</Chip>
          <Chip at={at(win, 6, 0.32)} tone={C.cyan}>Estimates planned</Chip>
          <Chip at={at(win, 6, 0.62)} tone={C.amber}>Your preparer decides</Chip>
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 24, color: C.muted, letterSpacing: "0.08em", opacity: ap(fr, at(win, 6, 0.7)) }}>Planning tool only — not tax, legal or financial advice.</div>
      </QA>
      <QA win={win} q={7} a={7} n={4} question="Is it a subscription?">
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 150, color: C.white, transform: `scale(${pop(fr, at(win, 7, 0.28), 300, 12)})` }}>No<span style={{ color: C.cyan }}>.</span></div>
        <div style={{ display: "flex", gap: 22 }}>
          <Chip at={at(win, 7, 0.38)}>One payment</Chip>
          <Chip at={at(win, 7, 0.55)}>No macros</Chip>
          <Chip at={at(win, 7, 0.68)}>No outside connections</Chip>
        </div>
        <Pop at={at(win, 7, 0.82)}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, color: C.white }}><Icon name="lock" size={54} color={C.cyan} />Your numbers stay in your file.</div>
        </Pop>
      </QA>
    </AbsoluteFill>
  );
};

const TIERS = [
  { t: "Essential" as const, price: 97, line: 1, pts: ["Clients & revenue", "Expenses & mileage", "Client performance", "Tax set-aside + dashboard"], sheets: "11 sheets" },
  { t: "Elite" as const, price: 197, line: 2, pts: ["Invoices & receivables", "Cash flow & profitability", "Forecasting", "Full tax center + year-end"], sheets: "26 sheets" },
  { t: "Complete" as const, price: 249, line: 3, pts: ["Both workbooks", "Both Field Guides", "Both Quick Starts", "Start simple, grow"], sheets: "11 + 26 sheets" },
];

export const Offer: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const guar = ap(fr, L[4].s - 4, 16);
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <div style={{ position: "absolute", top: 40, width: "100%", display: "flex", justifyContent: "center" }}>
        <Slam text="Which edition [fits you?]" at={L[0].s} size={72} />
      </div>
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, opacity: 1 - guar * 0.75, transform: `scale(${1 - guar * 0.08})` }}>
        {TIERS.map((tr, i) => {
          const a = L[tr.line].s;
          const on = fr >= a && fr < (L[tr.line + 1] ? L[tr.line + 1].s : 1e9);
          const s = pop(fr, a - 2, 200, 16);
          return (
            <div key={tr.t} style={{ width: 540, height: 760, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 120 - (on ? 18 : 0)}px) scale(${on ? 1.04 : 1})` }}>
              <Glass style={{ width: 540, height: 760, padding: 34, boxSizing: "border-box", position: "relative" }} glow={on ? C.cyan : undefined}>
                <div style={{ display: "flex", gap: 24 }}>
                  <Cover tier={tr.t} width={170} />
                  <div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: C.muted }}>{tr.sheets.toUpperCase()}</div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 56, color: C.white, letterSpacing: "-0.03em" }}>{tr.t}</div>
                    <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 104, color: C.cyan, letterSpacing: "-0.05em", lineHeight: 1, opacity: ap(fr, at(win, tr.line, 0.12)), transform: `scale(${0.6 + 0.4 * pop(fr, at(win, tr.line, 0.12), 320, 12)})`, transformOrigin: "left" }}>${tr.price}</div>
                  </div>
                </div>
                <div style={{ marginTop: 40, display: "grid", gap: 20 }}>
                  {tr.pts.map((p, j) => (
                    <div key={p} style={{ display: "flex", gap: 14, alignItems: "center", opacity: ap(fr, at(win, tr.line, 0.25 + j * 0.15)), fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, color: C.white }}>
                      <Icon name="check" size={30} color={C.green} />
                      {p}
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", left: 34, right: 34, bottom: 30, fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, color: C.sky, textAlign: "center", letterSpacing: "0.08em" }}>ONE-TIME PAYMENT · DESKTOP EXCEL</div>
              </Glass>
            </div>
          );
        })}
      </div>
      {guar > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: guar }}>
          <div style={{ position: "relative", width: 520, height: 580, transform: `scale(${pop(fr, at(win, 4, 0.5), 220, 12)})` }}>
            <svg width="520" height="580" viewBox="0 0 520 580" style={{ position: "absolute", filter: `drop-shadow(0 0 50px ${C.cyan})` }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#0e7490" /></linearGradient>
              </defs>
              <path d="M260 14 L494 92 V270 C494 418 392 520 260 566 C128 520 26 418 26 270 V92 Z" fill="url(#sg)" stroke="#a5f3fc" strokeWidth="6" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: FONT.sans, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 190, lineHeight: 0.9 }}>60</div>
              <div style={{ fontWeight: 800, fontSize: 44, letterSpacing: "0.12em" }}>DAY</div>
              <div style={{ fontWeight: 700, fontSize: 30, marginTop: 6 }}>money-back guarantee</div>
              <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 30, marginTop: 6, color: "#cffafe" }}>no questions asked</div>
            </div>
          </div>
        </AbsoluteFill>
      )}
      <Burst at={at(win, 4, 0.55)} color={C.cyan} n={40} r={800} />
      <Shockwave at={at(win, 4, 0.55)} color={C.cyan} />
    </AbsoluteFill>
  );
};

export const Cta: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  const bob = Math.sin(fr / 5) * 16;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0891b2" />
      <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center" }}>
        <Slam text="Here's what to do [right now.]" at={L[0].s} size={84} />
      </div>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
        {[
          ["1", "Pick your edition", L[1].s],
          ["2", "Log this month", at(win, 2, 0.05)],
          ["3", "See your real numbers", at(win, 2, 0.6)],
        ].map(([n, t, a]) => (
          <Pop key={n as string} at={a as number}>
            <Glass style={{ width: 470, height: 230, padding: 34, boxSizing: "border-box" }} glow={C.cyan}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: C.blue, color: "#fff", fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{n as string}</div>
              <div style={{ marginTop: 22, fontFamily: FONT.sans, fontWeight: 800, fontSize: 42, color: C.white }}>{t as string}</div>
            </Glass>
          </Pop>
        ))}
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ap(fr, at(win, 1, 0.3)) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT.sans, fontWeight: 800, fontSize: 46, color: "#fff", background: `linear-gradient(135deg, ${C.blue}, #0891b2)`, padding: "26px 56px", borderRadius: 999, boxShadow: `0 20px 60px rgba(37,99,235,0.6), 0 0 ${30 + Math.sin(fr / 4) * 20}px ${C.cyan}` }}>
          Choose your edition below
        </div>
        <div style={{ transform: `translateY(${bob}px)`, color: C.cyan }}><Icon name="arrowDown" size={96} /></div>
      </div>
      <div style={{ position: "absolute", bottom: 130, width: "100%", display: "flex", justifyContent: "center" }}>
        {fr > L[3].s - 4 && <Slam text="Every month you wait is [another month of guessing.]" at={L[3].s} size={52} />}
      </div>
    </AbsoluteFill>
  );
};

export const End: React.FC<{ win: Win }> = ({ win }) => {
  const fr = useCurrentFrame();
  const L = win.lines;
  return (
    <AbsoluteFill>
      <SpaceBg hue="#1d4ed8" hue2="#0e7490" />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${pop(fr, 0, 200, 14)})` }}>
          <LogoMark size={110} />
          <Wordmark size={120} />
        </div>
        <div style={{ marginTop: 40, fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.24em", color: C.cyan, opacity: ap(fr, L[0].s) }}>P.S.</div>
        <div style={{ marginTop: 16 }}>
          <Slam text="Your clients already report [what you earn.]" at={L[0].s + 4} size={70} />
        </div>
        <div style={{ marginTop: 14 }}>
          {fr > L[1].s - 4 && <Slam text="ProfitIQS shows you [what you keep.]" at={L[1].s} size={92} />}
        </div>
        <div style={{ marginTop: 60, display: "flex", gap: 30, alignItems: "center", opacity: ap(fr, L[1].e + 8) }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: "#fff", background: `linear-gradient(135deg, ${C.blue}, #0891b2)`, padding: "20px 46px", borderRadius: 999 }}>Choose your edition below ↓</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 34, color: C.white }}>ProfitIQS.com</div>
        </div>
        <div style={{ position: "absolute", bottom: 40, fontFamily: FONT.sans, fontSize: 18, color: C.muted, opacity: ap(fr, L[1].e + 14) }}>Planning tool only — not tax, legal or financial advice. Sample data shown. Requires desktop Microsoft Excel.</div>
      </AbsoluteFill>
      <Shockwave at={at(win, 1, 0.08)} color={C.cyan} />
      <LightLeak at={2} />
    </AbsoluteFill>
  );
};
