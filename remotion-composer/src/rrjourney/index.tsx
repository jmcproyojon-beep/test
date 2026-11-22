// Stand-alone entry: npx remotion render src/rrjourney/index.tsx RRJourney out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { RRJourney, FRAMES, FPS } from "./Journey";
const Root: React.FC = () => <Composition id="RRJourney" component={RRJourney} durationInFrames={FRAMES} fps={FPS} width={1920} height={1080} />;
registerRoot(Root);
