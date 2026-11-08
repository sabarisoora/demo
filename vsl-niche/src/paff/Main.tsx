import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/geist-mono/500.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { lio, P, sceneEnd, sceneStart, SCENES } from "../pure/lib";
import { ACC, AChrome } from "./ui";
import { How, Money, Open, Problem, What, Why } from "./A";
import { Cta, Faq, Kit, Launch, Master, Rules } from "./B";

// at most a word or two per line in the accent colour
const A: [string, string[]][] = [
  ["If you've ever", ["problem."]], ["And when you finally", ["nothing", "real"]], ["This is the opposite", ["opposite."]],
  ["ProfitIQS makes", ["one", "industry."]], ["The owner enters", ["rest."]], ["And sample data means", ["moment"]],
  ["Here's why owners", ["want"]], ["A plumber", ["callbacks"]], ["A restaurant owner", ["prime", "cost"]], ["A landlord", ["dragging"]],
  ["A real problem", ["real"]], ["And that's exactly", ["stop"]], ["Four things make", ["honestly."]],
  ["Now, the commission", ["commission."]], ["How it works is simple", ["simple."]], ["And the good news", ["approved"]],
  ["Now, the part most", ["never"]], ["A complete kit", ["every"]], ["Every fact in it", ["verified"]], ["And the Master Kit", ["Master", "Kit"]],
  ["Here's your first week", ["first", "week."]], ["A few rules", ["rules"]], ["Quick, honest", ["honest"]], ["So here's your next", ["next"]],
  ["Pick your niche.", ["stand"]], ["ProfitIQS. Real products", ["Honest"]],
];
A.forEach(([p, w]) => { const i = lio(p); if (i >= 0) ACC[i] = w; });

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["400 40px 'Inter Tight'", "500 40px 'Inter Tight'", "600 40px 'Inter Tight'", "500 40px 'Geist Mono'"].map((x) => document.fonts.load(x))).then(() => continueRender(h));
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
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <AChrome />
      <Only s="open"><Open /></Only>
      <Only s="what"><What /></Only>
      <Only s="problem"><Problem /></Only>
      <Only s="why"><Why /></Only>
      <Only s="money"><Money /></Only>
      <Only s="how"><How /></Only>
      <Only s="kit"><Kit /></Only>
      <Only s="master"><Master /></Only>
      <Only s="launch"><Launch /></Only>
      <Only s="rules"><Rules /></Only>
      <Only s="faq"><Faq /></Only>
      <Only s="cta"><Cta /></Only>
      {audio && <Audio src={staticFile("mix.wav")} />}
    </AbsoluteFill>
  );
};
