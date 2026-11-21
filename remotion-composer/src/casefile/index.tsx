// Stand-alone entry: npx remotion render src/casefile/index.tsx CaseFile out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { CaseFile, CF_FRAMES, CF_FPS, CF_W, CF_H } from "./CaseFile";
const Root: React.FC = () => <Composition id="CaseFile" component={CaseFile} durationInFrames={CF_FRAMES} fps={CF_FPS} width={CF_W} height={CF_H} />;
registerRoot(Root);
