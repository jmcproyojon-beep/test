// Standalone entry for the "নিখোঁজ সংবাদ" music video (offline: system Noto fonts only).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { MusicVideo, MVProps } from "./MusicVideo";

const MVRoot: React.FC = () => (
  <Composition
    id="MusicVideo"
    component={MusicVideo}
    durationInFrames={10533}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ song: "mv/song.mp3", durationSec: 351.1, beats: [], bass: [], rms: [], onset: [], sections: [], lines: [],
      title: "নিখোঁজ সংবাদ", subtitle: "Escape of Life", artist: "", editor: "" } as MVProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.floor(props.durationSec * 30) })}
  />
);

registerRoot(MVRoot);
