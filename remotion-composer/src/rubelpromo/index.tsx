// Stand-alone entry: npx remotion render src/rubelpromo/index.tsx RubelPromo out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { RubelPromo, RP_FRAMES, RP_FPS, RP_W, RP_H } from "./RubelPromo";

const Root: React.FC = () => <Composition id="RubelPromo" component={RubelPromo} durationInFrames={RP_FRAMES} fps={RP_FPS} width={RP_W} height={RP_H} />;
registerRoot(Root);
