// Stand-alone entry: npx remotion render src/facts/index.tsx Facts out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Facts, FX_FRAMES, FX_FPS, FX_W, FX_H } from "./Facts";
const Root: React.FC = () => <Composition id="Facts" component={Facts} durationInFrames={FX_FRAMES} fps={FX_FPS} width={FX_W} height={FX_H} />;
registerRoot(Root);
