import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Composition, continueRender, delayRender, interpolate, registerRoot, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ImpactOverlay, Shake } from "./fx";
import { C, cl, ez, FPS, H, SCENE_ORDER, sceneWindow, TOTAL_FRAMES, W, Win } from "./lib";
import { Cta, End, Flow, Guide, Offer, Reveal, Who } from "./Sc";
import { Captions } from "./ui";

const FIXED: Record<string, React.FC<{ win: Win }>> = { reveal: Reveal, who: Who, guide: Guide, offer: Offer, cta: Cta, end: End };
const XF = 10;
const KINDS = ["zoom", "whip", "zoom", "flash", "whip"] as const;

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["800 40px Poppins", "700 40px Poppins", "600 40px Poppins", "italic 700 40px 'Playfair Display'", "600 20px 'IBM Plex Mono'"].map((x) => document.fonts.load(x))).then(() => continueRender(h));
  }, [h]);
};

const Enter: React.FC<{ kind: (typeof KINDS)[number]; first: boolean; children: React.ReactNode }> = ({ kind, first, children }) => {
  const fr = useCurrentFrame();
  if (first || fr > XF) return <AbsoluteFill>{children}</AbsoluteFill>;
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

export const VSL: React.FC<{ captions: boolean }> = ({ captions }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Shake>
        {SCENE_ORDER.map((name, i) => {
          const win = sceneWindow(name);
          const Scene = FIXED[name] ?? Flow;
          return (
            <Sequence key={name} from={win.from} durationInFrames={win.duration + (i < SCENE_ORDER.length - 1 ? XF : 0)} name={name}>
              <Enter kind={KINDS[i % KINDS.length]} first={i === 0}>
                <Scene win={win} />
              </Enter>
            </Sequence>
          );
        })}
      </Shake>
      <ImpactOverlay />
      {captions && <Captions />}
      <Audio src={staticFile("mix.wav")} />
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="VSL" component={VSL as React.FC<any>} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ captions: true }} />
  </>
);
registerRoot(Root);
