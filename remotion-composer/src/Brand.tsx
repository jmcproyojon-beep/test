import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KimiNews, KimiNewsProps } from "./KimiNews";

// ---------------------------------------------------------------------------
// Rubel Miah brand intro / outro (colours, mark and fonts from rubelpublic.github.io),
// and a wrapper that puts them around the KimiNews story with one music bed.
// ---------------------------------------------------------------------------

const B = {
  ink: "#14121c",
  lavender: "#9C8CFF",
  lavenderSoft: "#B9A6FF",
  cream: "#EDE6D8",
  yellow: "#FFD23F",
  muted: "#a7a2b8",
};
const DISPLAY = "'Bricolage Grotesque', 'Noto Sans', sans-serif";
const BANGLA = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Load the brand webfonts from public/ before any frame renders. */
const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("brand fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Bricolage Grotesque", `url(${staticFile("brand/fonts/bricolage-grotesque-400-latin.woff2")})`),
      new FontFace("Hind Siliguri", `url(${staticFile("brand/fonts/hind-siliguri-500-bengali.woff2")})`, { weight: "500", unicodeRange: "U+0980-09FE" }),
      new FontFace("Hind Siliguri", `url(${staticFile("brand/fonts/hind-siliguri-500-latin.woff2")})`, { weight: "500" }),
    ];
    Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff))))
      .catch(() => undefined) // fall back to the system Noto fonts
      .finally(() => continueRender(handle));
  }, [handle]);
};

const useSpring = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 110, mass: 0.9 } });
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${42 + 3 * Math.sin(frame / 40)}%, rgba(156,140,255,0.32) 0%, ${B.ink} 62%)`,
      }}
    >
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.35 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 197) % 1080;
          const y = ((i * 331) % 1920) - ((frame * (1 + (i % 4))) % 1920);
          return <circle key={i} cx={x} cy={(y + 1920) % 1920} r={1.5 + (i % 3)} fill={i % 5 ? B.lavenderSoft : B.yellow} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Mark: React.FC<{ width: number; delay?: number }> = ({ width, delay = 0 }) => {
  const a = useSpring(delay, 12);
  return (
    <Img
      src={staticFile("brand/mark.png")}
      style={{
        width,
        opacity: a,
        transform: `scale(${interpolate(a, [0, 1], [0.6, 1])})`,
        filter: `drop-shadow(0 0 ${20 * a}px rgba(156,140,255,0.8))`,
      }}
    />
  );
};

export const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const name = useSpring(18);
  const sub = useSpring(34);
  const sweep = interpolate(frame, [durationInFrames - 22, durationInFrames], [-1.2, 1.2], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
        <Mark width={260} />
        <div style={{ width: interpolate(frame, [10, 40], [0, 420], clamp), height: 6, borderRadius: 3, background: B.yellow }} />
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 108,
            color: B.cream,
            letterSpacing: interpolate(name, [0, 1], [40, 10]),
            opacity: name,
          }}
        >
          RUBEL MIAH
        </div>
        <div style={{ fontFamily: BANGLA, fontWeight: 500, fontSize: 58, color: B.lavenderSoft, opacity: sub }}>রুবেল মিয়া</div>
        <div
          style={{
            marginTop: 30,
            fontFamily: DISPLAY,
            fontSize: 46,
            color: B.ink,
            background: B.lavender,
            padding: "12px 34px",
            borderRadius: 40,
            opacity: useSpring(60),
            transform: `translateY(${interpolate(useSpring(60), [0, 1], [30, 0])}px)`,
          }}
        >
          presents DAILY AI NEWS
        </div>
      </AbsoluteFill>
      {/* lavender light sweep into the story */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, transparent 0%, rgba(156,140,255,0.0) 30%, rgba(185,166,255,0.95) 50%, rgba(156,140,255,0.0) 70%, transparent 100%)`,
          transform: `translateX(${sweep * 1080}px)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = useSpring(4, 13);
  const rows = [useSpring(16), useSpring(26), useSpring(40), useSpring(55), useSpring(70)];
  const pulse = 1 + 0.04 * Math.sin(frame / 7);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", flexDirection: "column", paddingTop: 230, gap: 26 }}>
        <div
          style={{
            width: 430,
            height: 430,
            borderRadius: "50%",
            padding: 10,
            background: `conic-gradient(from ${frame * 2}deg, ${B.lavender}, ${B.yellow}, ${B.lavender})`,
            transform: `scale(${interpolate(ring, [0, 1], [0.7, 1])})`,
            opacity: ring,
          }}
        >
          <Img
            src={staticFile("brand/portrait_sq.jpg")}
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: `6px solid ${B.ink}` }}
          />
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 40, color: B.muted, letterSpacing: 6, marginTop: 30, opacity: rows[0] }}>
          PRESENTED BY
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 104, color: B.cream, letterSpacing: 6, opacity: rows[1], lineHeight: 1 }}>
          Rubel Miah
        </div>
        <div style={{ fontFamily: BANGLA, fontWeight: 500, fontSize: 52, color: B.lavenderSoft, opacity: rows[1] }}>রুবেল মিয়া</div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: rows[2],
            transform: `translateY(${interpolate(rows[2], [0, 1], [30, 0])}px)`,
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontSize: 40, color: B.muted, letterSpacing: 4 }}>EDITED BY</div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 56,
              color: B.ink,
              background: B.lavender,
              padding: "8px 30px",
              borderRadius: 18,
            }}
          >
            Paloan
          </div>
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 44, color: B.cream, marginTop: 40, opacity: rows[3] }}>
          rubelpublic.github.io
        </div>
        <div
          style={{
            marginTop: 36,
            fontFamily: DISPLAY,
            fontSize: 54,
            color: B.ink,
            background: B.yellow,
            padding: "18px 54px",
            borderRadius: 50,
            opacity: rows[4],
            transform: `scale(${interpolate(rows[4], [0, 1], [0.6, 1]) * pulse})`,
            boxShadow: `0 0 40px rgba(255,210,63,0.5)`,
          }}
        >
          FOLLOW FOR MORE
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Mark width={120} delay={2} />
      </div>
    </AbsoluteFill>
  );
};

export type BrandedKimiProps = KimiNewsProps & {
  introSec: number;
  mainSec: number;
  outroSec: number;
  introVoice: string;
  outroVoice: string;
  outroVoiceAt: number;
  bedMusic: string;
};

export const BrandedKimi: React.FC<BrandedKimiProps> = (props) => {
  useBrandFonts();
  const { fps, durationInFrames } = useVideoConfig();
  const intro = Math.round(props.introSec * fps);
  const main = Math.round(props.mainSec * fps);
  const outro = durationInFrames - intro - main;
  return (
    <AbsoluteFill style={{ backgroundColor: B.ink }}>
      <Sequence durationInFrames={intro}>
        <BrandIntro />
        <Audio src={staticFile(props.introVoice)} />
      </Sequence>
      <Sequence from={intro} durationInFrames={main}>
        <KimiNews {...props} embedded />
      </Sequence>
      <Sequence from={intro + main} durationInFrames={outro}>
        <BrandOutro />
        <Sequence from={Math.round(props.outroVoiceAt * fps)}>
          <Audio src={staticFile(props.outroVoice)} />
        </Sequence>
      </Sequence>
      {/* one continuous music bed, ducked under speech */}
      <Audio
        src={staticFile(props.bedMusic)}
        volume={(f) => {
          const duck = interpolate(f, [intro - 15, intro, intro + main - 10, intro + main + 5], [0.3, 0.13, 0.13, 0.32], clamp);
          return (
            duck *
            interpolate(f, [0, 15], [0, 1], clamp) *
            interpolate(f, [durationInFrames - 45, durationInFrames], [1, 0], clamp)
          );
        }}
      />
    </AbsoluteFill>
  );
};
