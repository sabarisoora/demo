import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, H, TOTAL, W } from "../home/lib";
import { Aff } from "./AffMain";

const Root: React.FC = () =>
  React.createElement(Composition, { id: "Aff", component: Aff as React.FC<any>, durationInFrames: TOTAL, fps: FPS, width: W, height: H, defaultProps: { audio: true } });
registerRoot(Root);
