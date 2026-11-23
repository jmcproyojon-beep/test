// Stand-alone entry: npx remotion render src/greencrest/index.tsx GreenCrest out.mp4   (16:9)
//                    npx remotion render src/greencrest/index.tsx GreenCrestV out.mp4  (9:16)
import React from "react";
import { Composition, registerRoot } from "remotion";
import { GreenCrest, FRAMES, FPS, W, H } from "./GreenCrest";
import { GreenCrestV } from "./GreenCrestV";
const Root: React.FC = () => (
  <>
    <Composition id="GreenCrest" component={GreenCrest} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="GreenCrestV" component={GreenCrestV} durationInFrames={FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
registerRoot(Root);
