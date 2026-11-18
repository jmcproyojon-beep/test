// Stand-alone entry: npx remotion render src/moto/index.tsx MotoCinematic out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { MotoCinematic, MC_FRAMES, MC_FPS, MC_W, MC_H } from "./MotoCinematic";

const Root: React.FC = () => <Composition id="MotoCinematic" component={MotoCinematic} durationInFrames={MC_FRAMES} fps={MC_FPS} width={MC_W} height={MC_H} />;
registerRoot(Root);
