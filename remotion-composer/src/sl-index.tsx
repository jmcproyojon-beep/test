import React from "react";
import { Composition, registerRoot } from "remotion";
import { SignalLost, SLProps } from "./SignalLost";

const defaults = { song: "sn/song.mp3", durationSec: 247.2, beats: [], bass: [], onset: [], lines: [], sections: [["cold", 0, 999]], credits: [] } as unknown as SLProps;
const Root: React.FC = () => (
  <Composition id="SignalLost" component={SignalLost} width={1920} height={1080} fps={30} durationInFrames={7416} defaultProps={defaults}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.floor(props.durationSec * 30) })} />
);
registerRoot(Root);
