// Stand-alone entry for the portfolio showcase (renders without the other compositions' assets):
//   npx remotion render src/portfolio/index.tsx PortfolioShowcase out.mp4
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PortfolioShowcase, PF_FRAMES, PF_FPS, PF_W, PF_H } from "./PortfolioShowcase";

const Root: React.FC = () => <Composition id="PortfolioShowcase" component={PortfolioShowcase} durationInFrames={PF_FRAMES} fps={PF_FPS} width={PF_W} height={PF_H} />;
registerRoot(Root);
