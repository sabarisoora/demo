import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Grain, ImpactOverlay, Shake, Vignette } from "./fx";
import { C, cl, ez, f, LINES, sceneWindow, Win } from "./lib";
import { Hook, Pain, Turn } from "./scenes/a";
import { Elite, Ess, Leak, Reveal, Tax, Who } from "./scenes/b";
import { Cta, End, Obj, Offer } from "./scenes/c";
import { Guide } from "./scenes/d";
import { Captions } from "./ui";

const SCENES: [string, React.FC<{ win: Win }>][] = [
  ["hook", Hook],
  ["pain", Pain],
  ["turn", Turn],
  ["reveal", Reveal],
  ["who", Who],
  ["ess", Ess],
  ["elite", Elite],
  ["tax", Tax],
  ["leak", Leak],
  ["guide", Guide],
  ["obj", Obj],
  ["offer", Offer],
  ["cta", Cta],
  ["end", End],
];
const XF = 10;
const KINDS = ["zoom", "whip", "zoom", "flash", "whip"] as const;

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["800 40px Poppins", "700 40px Poppins", "600 40px Poppins", "italic 700 40px 'Playfair Display'", "600 20px 'IBM Plex Mono'"].map((x) => document.fonts.load(x))).then(() => continueRender(h));
  }, [h]);
};

// scene entrance transitions: zoom-through, whip with motion blur, white flash
const Enter: React.FC<{ kind: (typeof KINDS)[number]; first: boolean; children: React.ReactNode }> = ({ kind, first, children }) => {
  const fr = useCurrentFrame();
  if (first) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(fr, [0, XF], [0, 1], { ...cl, easing: ez });
  const tr = kind === "zoom" ? `scale(${1.35 - 0.35 * p})` : kind === "whip" ? `translateX(${(1 - p) * 700}px)` : `scale(${1.08 - 0.08 * p})`;
  const blur = kind === "whip" ? (1 - p) * 24 : (1 - p) * 14;
  return (
    <AbsoluteFill style={{ opacity: p, transform: tr, filter: `blur(${blur}px)` }}>
      {children}
      {kind === "flash" && <AbsoluteFill style={{ background: "#fff", opacity: 1 - p }} />}
    </AbsoluteFill>
  );
};

// hide captions on dense on-screen-text moments? Keep them: the brief asks for synced subtitles throughout.
export const VSL: React.FC<{ captions: boolean }> = ({ captions }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Shake>
        {SCENES.map(([name, Scene], i) => {
          const win = sceneWindow(name);
          return (
            <Sequence key={name} from={win.from} durationInFrames={win.duration + (i < SCENES.length - 1 ? XF : 0)} name={name}>
              <Enter kind={KINDS[i % KINDS.length]} first={i === 0}>
                <Scene win={win} />
              </Enter>
            </Sequence>
          );
        })}
      </Shake>
      <ImpactOverlay />
      <Vignette />
      <Grain />
      {captions && <Captions />}
      <Audio src={staticFile("mix-1099.wav")} />
    </AbsoluteFill>
  );
};

export { f, LINES };
