// Standalone entry for the Daily AI News composition. It avoids importing Root,
// whose other compositions load Google Fonts at module level (needs network);
// AINews only uses locally installed Noto fonts.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { AINews, AINewsProps } from "./AINews";

const AINewsRoot: React.FC = () => (
  <Composition
    id="AINews"
    component={AINews}
    durationInFrames={2550}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{
      voice: "ainews/vo.mp3",
      music: "ainews/music.mp3",
      host: "ainews/host.png",
      amp: [],
      dateLabel: "",
      scenes: [],
      sentences: [],
    } as AINewsProps}
  />
);

registerRoot(AINewsRoot);
