import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";


import "@fontsource/geist-mono/500.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { lio, P, sceneEnd, sceneStart, SCENES } from "./lib";
import { ACC, Chrome } from "./ui";
import { Blind, DataScene, Hook, Reveal } from "./A";
import { Box, Cta, End, Honest, How, Inside, Showroom, Wall } from "./B";

// one accent word (italic serif, cobalt) per line, at most
const A: [string, string[]][] = [
  ["You open", ["seven."]], ["You close", ["seven."]], ["So here's one quick", ["question."]], ["How much did", ["keep"]],
  ["It doesn't matter", ["run."]], ["Different trades", ["blind", "spot."]], ["And here's the thing", ["already"]], ["Invoices. Receipts", ["apps"]],
  ["It's just never", ["one", "place,"]], ["Business intelligence", ["Excel."]], ["Not one generic", ["speaks"]], ["Built for people", ["trade,"]],
  ["Plumbers:", ["callbacks"]], ["Restaurants:", ["prime", "cost"]], ["Dental practices:", ["never"]], ["Owner-operators:", ["thin"]], ["Rental investors:", ["unknown?"]], ["Online stores:", ["mystery?"]],
  ["And that's just six", ["six"]], ["Every one built", ["actually"]], ["Every system comes", ["three"]], ["Essential, $97", ["$97."]], ["Elite, $197", ["$197."]], ["Complete, $249", ["$249."]],
  ["Start with Essential", ["ready."]], ["And inside every box", ["box:"]], ["And using it", ["simple."]], ["Step one", ["open"]], ["Step two", ["own"]], ["Step three", ["update"]],
  ["Quick, honest", ["honest"]], ["So here's your next", ["next"]], ["Find your industry", ["below"]], ["Each one has its own", ["every"]], ["Your business already", ["numbers."]], ["ProfitIQS shows you", ["mean."]],
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
      <Chrome />
      <Only s="hook"><Hook /></Only>
      <Only s="blind"><Blind /></Only>
      <Only s="data"><DataScene /></Only>
      <Only s="reveal"><Reveal /></Only>
      <Only s="show"><Showroom /></Only>
      <Only s="wall"><Wall /></Only>
      <Only s="box"><Box /></Only>
      <Only s="inside"><Inside /></Only>
      <Only s="how"><How /></Only>
      <Only s="honest"><Honest /></Only>
      <Only s="cta"><Cta /></Only>
      <Only s="end"><End /></Only>
      {audio && <Audio src={staticFile("mix.wav")} />}
    </AbsoluteFill>
  );
};
