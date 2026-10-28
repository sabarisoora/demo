import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/playfair-display/600-italic.css";
import "@fontsource/playfair-display/700-italic.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, COVER, Cover, DarkBg, LogoMark, Wordmark } from "./components";
import { C, FONT, sceneWindow } from "./lib";
import { Hook, Intro, Pain, Plan, Turn } from "./scenes/s1";
import { Dashboard, Elite, Entry, Health, Leak, Setup } from "./scenes/s2";
import { Cta, CtaButton, End, Niche, Niches, Obj1, Obj2, Obj3, Pricing } from "./scenes/s3";

const SCENES: [string, React.FC<{ win: ReturnType<typeof sceneWindow> }>][] = [
  ["hook", Hook],
  ["pain", Pain],
  ["turn", Turn],
  ["intro", Intro],
  ["plan", Plan],
  ["setup", Setup],
  ["entry", Entry],
  ["dashboard", Dashboard],
  ["health", Health],
  ["elite", Elite],
  ["leak", Leak],
  ["niche", Niche],
  ["niches", Niches],
  ["obj1", Obj1],
  ["obj2", Obj2],
  ["obj3", Obj3],
  ["pricing", Pricing],
  ["cta", Cta],
  ["end", End],
];

const XF = 12; // crossfade frames between scenes

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("700 40px Poppins"),
      document.fonts.load("600 40px Poppins"),
      document.fonts.load("italic 700 40px 'Playfair Display'"),
    ]).then(() => document.fonts.ready).then(() => continueRender(handle));
  }, [handle]);
};

const Fade: React.FC<{ first: boolean; children: React.ReactNode }> = ({ first, children }) => {
  const frame = useCurrentFrame();
  const o = first ? 1 : interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  const z = interpolate(frame, [0, XF], [first ? 1 : 1.035, 1], { extrapolateRight: "clamp" });
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
            <Fade first={i === 0}>
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
      <div style={{ position: "absolute", right: -10, top: 200, display: "flex", gap: 0 }}>
        {(["Essential", "Elite", "Complete"] as const).map((t, i) => (
          <div key={t} style={{ transform: `translateX(${i * -120}px) rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -20 : 30}px)`, zIndex: i === 1 ? 2 : 1 }}>
            <Cover niche={COVER.auto} tier={t} width={290} />
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ padding: "100px 110px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <LogoMark size={70} />
          <Wordmark size={78} />
        </div>
        <div style={{ maxWidth: 940 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 100, lineHeight: 1.04, letterSpacing: "-0.04em", color: C.cream }}>
            See the <span style={{ fontFamily: FONT.serif, fontStyle: "italic", color: C.sky }}>real numbers</span> behind your business.
          </div>
          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 36, color: "rgba(248,250,252,0.85)", marginTop: 26 }}>Excel Business Intelligence Systems™ · 21 industries</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <CtaButton size={36} />
          <div style={{ width: 92, height: 92, borderRadius: 46, background: "rgba(248,250,252,0.14)", border: "2px solid rgba(248,250,252,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "20px solid transparent", borderBottom: "20px solid transparent", borderLeft: `32px solid ${C.cream}`, marginLeft: 8 }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
