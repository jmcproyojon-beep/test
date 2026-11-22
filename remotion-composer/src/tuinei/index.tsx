// Stand-alone entry: npx remotion render src/tuinei/index.tsx TuiNei out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Sheet } from "./Sheet";
import { TuiNei, FRAMES } from "./TuiNei";
import { FPS } from "./lib";
const Root: React.FC = () => (
  <>
    <Composition id="TuiNei" component={TuiNei} durationInFrames={FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={24} width={1920} height={1080} />
  </>
);
registerRoot(Root);
