import React from "react";
import { Composition, registerRoot } from "remotion";
import { BabluDhaka, BDProps } from "./BabluDhaka";

const defaults = { song: "bab/song.mp3", durationSec: 285.3, beats: [], bass: [], onset: [], lines: [], title: "ভালো আছি, বাকি আছে!", credits: [] } as BDProps;
const Root: React.FC = () => (
  <Composition id="BabluDhaka" component={BabluDhaka} width={1920} height={1080} fps={30} durationInFrames={8559} defaultProps={defaults}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.floor(props.durationSec * 30) })} />
);
registerRoot(Root);
