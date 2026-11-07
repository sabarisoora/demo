import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/900.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/anton/400.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { lio, LINES, sceneEnd, sceneStart, SCENES } from "./lib";
import { Blind, DataScene, Hook, Reveal } from "./S1";
import { Box, Cta, End, Experts, Honest, How, Inside, Showroom, Wall } from "./S2";
import { Bg, Cam, Captions, MARK, Wipes } from "./ui";

// accent words (gradient serif) per line
const ACC: [string, string][] = [
  ["You open", "seven"], ["You close", "seven"], ["Jobs done", "all"], ["So here's one quick", "question"], ["How much did", "keep"], ["Not what came", "kept"],
  ["It doesn't matter", "run"], ["Different trades", "same|blind|spot"], ["And here's the thing", "already|there"], ["Invoices. Receipts", "apps"],
  ["It's just never", "one|place"], ["That's why we built", "profitiqs"], ["Business intelligence", "excel|industry"], ["Not one generic", "speaks|trade"],
  ["Built for people", "trade"], ["And that's just six", "twenty-one"], ["Every one built", "actually|runs"], ["Every system comes", "three"],
  ["Essential, $97", "$97"], ["Elite, $197", "$197"], ["Complete, $249", "$249"], ["Start with Essential", "ready"], ["And inside every box", "box"],
  ["Formulas, dashboards", "built"], ["Sample data", "works"], ["A tax set-aside", "plan"], ["Country-based", "own"], ["A Quick Start", "field|guide"],
  ["And using it", "simple"], ["Step one", "open"], ["Step two", "own"], ["Step three", "update"], ["Quick, honest", "honest"], ["Is it a subscription", "no"],
  ["Do you need", "no"], ["You'll just need", "desktop"], ["It's a planning", "own"], ["So here's your next", "next"], ["Find your industry", "below"],
  ["Each one has its own", "every"], ["Your business already", "numbers"], ["ProfitIQS shows you", "mean"],
];
ACC.forEach(([p, m]) => { const i = lio(p); if (i >= 0) MARK[i] = m; });

// captions only where the narration is not already the big on-screen text
const CAP_SCENES = new Set(["show", "wall"]);
const CAP_LINES = new Set(["A plumber", "A restaurant", "A dentist", "A trucker", "A landlord", "Twenty-one", "Come on in", "Every sheet name"].map(lio).filter((i) => i >= 0));

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["700 40px 'Space Grotesk'", "500 40px 'Space Grotesk'", "900 40px Unbounded", "700 40px Unbounded", "700 40px 'JetBrains Mono'", "400 40px Anton"].map((x) => document.fonts.load(x))).then(() => continueRender(h));
  }, [h]);
};

const Only: React.FC<{ s: string; children: React.ReactNode }> = ({ s, children }) => {
  const fr = useCurrentFrame();
  if (!SCENES.includes(s)) return null;
  if (fr < sceneStart(s) - 30 || fr > sceneEnd(s) + 30) return null;
  return <>{children}</>;
};

export const Home: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const fr = useCurrentFrame();
  const li_ = LINES.findIndex((l) => fr >= Math.round(l.start * 30) - 3 && fr <= Math.round(l.end * 30) + 8);
  const showCap = li_ >= 0 && (CAP_SCENES.has(LINES[li_].scene) || CAP_LINES.has(li_)) && !LINES[li_].sub.startsWith("And that's just six") && !LINES[li_].sub.startsWith("Every one built");
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      <Bg />
      <Cam>
      <Only s="hook"><Hook /></Only>
      <Only s="blind"><Blind /></Only>
      <Only s="data"><DataScene /></Only>
      <Only s="reveal"><Reveal /><Experts /></Only>
      <Only s="show"><Showroom /></Only>
      <Only s="wall"><Wall /></Only>
      <Only s="box"><Box /></Only>
      <Only s="inside"><Inside /></Only>
      <Only s="how"><How /></Only>
      <Only s="honest"><Honest /></Only>
      <Only s="cta"><Cta /></Only>
      <Only s="end"><End /></Only>
      </Cam>
      <Wipes />
      {showCap && <Captions />}
      {audio && <Audio src={staticFile("mix.wav")} />}
    </AbsoluteFill>
  );
};
