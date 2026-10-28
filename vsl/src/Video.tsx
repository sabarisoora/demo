import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, DarkBg, LogoMark, Wordmark } from "./components";
import { C, FONT, sceneWindow } from "./lib";
import { Hook, Problem, Realize } from "./scenes/opening";
import { Editions, Intro, NicheSpecific, Product } from "./scenes/middle";
import { Cta, CtaButton, End, Niches, Pricing } from "./scenes/closing";

const SCENES: [string, React.FC<{ win: ReturnType<typeof sceneWindow> }>][] = [
  ["hook", Hook],
  ["problem", Problem],
  ["realize", Realize],
  ["intro", Intro],
  ["product", Product],
  ["editions", Editions],
  ["niche", NicheSpecific],
  ["niches", Niches],
  ["pricing", Pricing],
  ["cta", Cta],
  ["end", End],
];

const XF = 12; // crossfade frames between scenes

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

const Fade: React.FC<{ duration: number; first: boolean; children: React.ReactNode }> = ({ duration, first, children }) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  const z = interpolate(frame, [0, XF], [first ? 1 : 1.03, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${z})` }}>{children}</AbsoluteFill>;
};

export const VSL: React.FC<{ captions: boolean }> = ({ captions }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {SCENES.map(([name, Scene], i) => {
        const win = sceneWindow(name);
        return (
          <Sequence key={name} from={win.from} durationInFrames={win.duration + (i < SCENES.length - 1 ? XF : 0)} name={name}>
            <Fade duration={win.duration} first={i === 0}>
              <Scene win={win} />
            </Fade>
          </Sequence>
        );
      })}
      {captions && <Captions />}
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <DarkBg glow />
      <AbsoluteFill style={{ padding: "110px 120px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <LogoMark size={96} />
          <Wordmark size={84} />
        </div>
        <div>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 132, lineHeight: 1.0, letterSpacing: "-0.035em", color: C.cream, maxWidth: 1500 }}>
            A clearer view of <span style={{ color: C.gold }}>your business numbers.</span>
          </div>
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 44, color: "rgba(244,241,233,0.82)", marginTop: 34 }}>Business Intelligence Systems™ built for 21 niches</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <CtaButton size={38} />
          <div style={{ width: 92, height: 92, borderRadius: 46, background: "rgba(244,241,233,0.14)", border: "2px solid rgba(244,241,233,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `32px solid ${C.cream}`, marginLeft: 8 }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
