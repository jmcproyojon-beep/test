// Standalone entry for the "সাড়ে বারো" music video (offline: system Noto fonts only).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { SareBaro, SBProps } from "./SareBaro";

const SBRoot: React.FC = () => (
  <>
  <Composition
    id="SareBaro"
    component={SareBaro}
    durationInFrames={3834}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ song: "sb/song.m4a", durationSec: 127.8, beats: [], bass: [], rms: [], onset: [], sections: [], lines: [],
      title: "সাড়ে বারো", artist: "", editor: "" } as SBProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.floor(props.durationSec * 30) })}
  />
  <Composition
    id="SareBaroWide"
    component={SareBaro}
    durationInFrames={3834}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ song: "sb/song.m4a", durationSec: 127.8, beats: [], bass: [], rms: [], onset: [], sections: [], lines: [],
      title: "সাড়ে বারো", artist: "", editor: "" } as SBProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.floor(props.durationSec * 30) })}
  />
  </>
);

registerRoot(SBRoot);
