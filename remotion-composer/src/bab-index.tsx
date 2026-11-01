import React from "react";
import { Composition, registerRoot } from "remotion";
import { BhaloAchi, BAProps } from "./BhaloAchi";

const defaults = {
  song: "bab/song.mp3", durationSec: 285.3, beats: [], bass: [], rms: [], onset: [], lines: [], sections: [],
  title: "ভালো আছি, বাকি আছে!", credits: [],
} as BAProps;
const meta = ({ props }: { props: BAProps }) => ({ durationInFrames: Math.floor(props.durationSec * 30) });

const Root: React.FC = () => (
  <>
    <Composition id="BhaloAchiWide" component={BhaloAchi} width={1920} height={1080} fps={30} durationInFrames={8559} defaultProps={defaults} calculateMetadata={meta} />
    <Composition id="BhaloAchiVertical" component={BhaloAchi} width={1080} height={1920} fps={30} durationInFrames={8559} defaultProps={defaults} calculateMetadata={meta} />
  </>
);
registerRoot(Root);
