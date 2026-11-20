// Stand-alone entry: npx remotion render src/silver5/index.tsx Signals5 out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Signals5, S5_FRAMES, S5_FPS, S5_W, S5_H } from "./Signals5";
const Root: React.FC = () => <Composition id="Signals5" component={Signals5} durationInFrames={S5_FRAMES} fps={S5_FPS} width={S5_W} height={S5_H} />;
registerRoot(Root);
