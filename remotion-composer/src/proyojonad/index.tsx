// Stand-alone entry: npx remotion render src/proyojonad/index.tsx ProyojonAd out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { ProyojonAd, PA_FRAMES, PA_FPS, PA_W, PA_H } from "./ProyojonAd";
const Root: React.FC = () => <Composition id="ProyojonAd" component={ProyojonAd} durationInFrames={PA_FRAMES} fps={PA_FPS} width={PA_W} height={PA_H} />;
registerRoot(Root);
