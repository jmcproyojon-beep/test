// Standalone entry for the Kimi / UK AI-security news video (renders offline:
// system Noto fonts only, no Root import).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { KimiNews, KimiNewsProps } from "./KimiNews";

const KimiRoot: React.FC = () => (
  <Composition
    id="KimiNews"
    component={KimiNews}
    durationInFrames={2550}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ music: "kimi/music.mp3", dateLabel: "", scenes: [], sentences: [] } as KimiNewsProps}
  />
);

registerRoot(KimiRoot);
