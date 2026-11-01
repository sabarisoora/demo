import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, H, TOTAL_FRAMES, W } from "./lib";
import { VSL } from "./Main";

const Root: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, { id: "VSL-1099", component: VSL as React.FC<any>, durationInFrames: TOTAL_FRAMES, fps: FPS, width: W, height: H, defaultProps: { captions: true } }),
    React.createElement(Composition, { id: "VSL-1099-NoCaptions", component: VSL as React.FC<any>, durationInFrames: TOTAL_FRAMES, fps: FPS, width: W, height: H, defaultProps: { captions: false } }),
  );

registerRoot(Root);
