import React from "react";
import { Composition, registerRoot, Still } from "remotion";
import { FPS, H, TOTAL_FRAMES, W } from "./lib";
import { Thumbnail, VSL } from "./Video";

const Root: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, { id: "VSL", component: VSL, durationInFrames: TOTAL_FRAMES, fps: FPS, width: W, height: H, defaultProps: { captions: true } }),
    React.createElement(Composition, { id: "VSL-NoCaptions", component: VSL, durationInFrames: TOTAL_FRAMES, fps: FPS, width: W, height: H, defaultProps: { captions: false } }),
    React.createElement(Still, { id: "Thumbnail", component: Thumbnail, width: W, height: H }),
  );

registerRoot(Root);
