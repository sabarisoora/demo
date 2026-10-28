import React from "react";
import { Composition, registerRoot } from "remotion";
import { FPS, TOTAL_FRAMES } from "./edit";
import { Reel } from "./Reel";

const Root: React.FC = () => React.createElement(Composition, { id: "Reel", component: Reel, durationInFrames: TOTAL_FRAMES, fps: FPS, width: 1080, height: 1920 });

registerRoot(Root);
