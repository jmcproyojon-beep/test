// Standalone entry for the Kimi / UK AI-security news video (renders offline:
// system Noto fonts only, no Root import).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { KimiNews, KimiNewsProps } from "./KimiNews";
import { BrandedKimi, BrandedKimiProps } from "./Brand";

const KimiRoot: React.FC = () => (
  <>
  <Composition
    id="KimiNews"
    component={KimiNews}
    durationInFrames={2550}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ music: "kimi/music.mp3", dateLabel: "", scenes: [], sentences: [] } as KimiNewsProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round((props.durationSec ?? 85) * 30),
    })}
  />
  <Composition
    id="BrandedKimi"
    component={BrandedKimi}
    durationInFrames={2600}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{ music: "", dateLabel: "", scenes: [], sentences: [], introSec: 5, mainSec: 75, outroSec: 6,
      introVoice: "", outroVoice: "", outroVoiceAt: 0.5, bedMusic: "" } as BrandedKimiProps}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round((props.introSec + props.mainSec + props.outroSec) * 30),
    })}
  />
  </>
);

registerRoot(KimiRoot);
