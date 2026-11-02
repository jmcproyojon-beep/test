import React from "react";
import { AbsoluteFill } from "remotion";
import { Hero, P, Clock, Rickshaw, CNG, Crow } from "./cast";
import { C } from "./lib";

// Dev-only reference sheet of the cast and props (not part of the video).
export const CastSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.mint }}>
    <svg width={1920} height={1080}>
      <Hero x={150} y={460} pose={P.stand()} face={{ mouth: "smile" }} />
      <Hero x={400} y={460} pose={P.shock()} face={{ eyes: "wide", mouth: "shout", spiky: 1, sweat: 1 }} />
      <Hero x={650} y={460} pose={P.walk(1)} face={{ eyes: "sleepy", mouth: "flat" }} />
      <Hero x={900} y={460} outfit="office" pose={P.run(1.2)} face={{ eyes: "wide", mouth: "o", brows: 1 }} tie watch />
      <Hero x={1150} y={460} outfit="guard" pose={P.stand()} face={{ mouth: "grin" }} cap mustache belly={1} />
      <Hero x={1350} y={460} s={0.6} outfit="kid" pose={P.run(2)} face={{ mouth: "grin" }} />
      <Hero x={1600} y={460} outfit="office" pose={P.watch()} face={{ look: 1, eyes: "wide", mouth: "o" }} watch bandage />
      <Clock x={1800} y={200} r={90} />
      <Rickshaw x={300} y={1040} s={0.9} t={0.4} />
      <CNG x={900} y={1040} s={0.9} t={0.4} />
      <Hero x={1300} y={1040} outfit="office" pose={P.sit()} face={{ mouth: "grin" }} />
      <Crow x={1600} y={900} s={2} t={0} caw={1} />
      <Hero x={1780} y={1040} outfit="office" pose={P.kick(1)} face={{ mouth: "shout", brows: 1 }} />
    </svg>
  </AbsoluteFill>
);
