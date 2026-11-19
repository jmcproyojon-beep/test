// Stand-alone entry: npx remotion render src/marine/index.tsx MarineReel out.mp4 --gl=swangle
import React from "react";
import { Composition, registerRoot } from "remotion";
import { MarineReel, MR_FRAMES, MR_FPS, MR_W, MR_H } from "./MarineReel";
const Root: React.FC = () => <Composition id="MarineReel" component={MarineReel} durationInFrames={MR_FRAMES} fps={MR_FPS} width={MR_W} height={MR_H} />;
registerRoot(Root);
