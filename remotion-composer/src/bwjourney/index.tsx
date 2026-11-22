// Stand-alone entry: npx remotion render src/bwjourney/index.tsx BWJourney out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Journey, FRAMES, FPS, W, H } from "./Journey";
const Root: React.FC = () => <Composition id="BWJourney" component={Journey} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />;
registerRoot(Root);
