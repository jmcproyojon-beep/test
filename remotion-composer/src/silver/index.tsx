// Stand-alone entry: npx remotion render src/silver/index.tsx Silver out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Silver, SV_FRAMES, SV_FPS, SV_W, SV_H } from "./Silver";
const Root: React.FC = () => <Composition id="Silver" component={Silver} durationInFrames={SV_FRAMES} fps={SV_FPS} width={SV_W} height={SV_H} />;
registerRoot(Root);
