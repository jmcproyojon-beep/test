// Stand-alone entry: npx remotion render src/tribute/index.tsx Tribute out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Tribute, TB_FRAMES, TB_FPS, TB_W, TB_H } from "./Tribute";
const Root: React.FC = () => <Composition id="Tribute" component={Tribute} durationInFrames={TB_FRAMES} fps={TB_FPS} width={TB_W} height={TB_H} />;
registerRoot(Root);
