// Stand-alone entry: npx remotion render src/greencrest/index.tsx GreenCrest out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { GreenCrest, FRAMES, FPS, W, H } from "./GreenCrest";
const Root: React.FC = () => <Composition id="GreenCrest" component={GreenCrest} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />;
registerRoot(Root);
