import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, H, TOTAL, W } from "./lib";
import { Home } from "./H";

const Root: React.FC = () =>
  React.createElement(Composition, { id: "Home", component: Home as React.FC<any>, durationInFrames: TOTAL, fps: FPS, width: W, height: H, defaultProps: { audio: true } });

registerRoot(Root);
