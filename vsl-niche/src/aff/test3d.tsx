import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame, interpolate } from "remotion";
import { KitBox, Floaters, Stage } from "./three";
const Scene: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#FFF0F8,#F5F0FF 50%,#EEFCFF)" }}>
      <Stage><Floaters fr={fr} /><KitBox open={interpolate(fr, [0, 40], [0, 1], { extrapolateRight: "clamp" })} rotY={0.55} y={-0.6} /></Stage>
    </AbsoluteFill>
  );
};
registerRoot(() => <Composition id="T3" component={Scene} durationInFrames={60} fps={30} width={1920} height={1080} />);
