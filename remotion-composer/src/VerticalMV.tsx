import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MusicVideo, MVProps } from "./MusicVideo";

// ---------------------------------------------------------------------------
// Vertical (1080x1920) Reels cut of the music video: a window of the 16:9 film
// framed in the middle, with a title band on top and big wrapped lyrics below.
// ---------------------------------------------------------------------------

export type VerticalMVProps = MVProps & { cutStart: number; cutEnd: number };

const BN = "'Noto Sans Bengali', 'Noto Sans', sans-serif";
const BN_SERIF = "'Noto Serif Bengali', 'Noto Sans Bengali', serif";
const EN = "'Noto Sans', 'DejaVu Sans', sans-serif";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The 16:9 scene is drawn at this scale and centred, so its middle 1080 px show.
const SCALE = 1.06;
const SCENE_TOP = 330;

export const VerticalMV: React.FC<VerticalMVProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const start = Math.round(p.cutStart * fps);
  const t = p.cutStart + frame / fps; // song time
  const i = Math.min(start + frame, p.bass.length - 1);
  const bass = p.bass[i] ?? 0;
  const line = p.lines.find((l) => t >= l.start - 0.2 && t <= l.end + 0.5);
  const words = line ? line.text.split(/\s+/) : [];
  const fadeIn = interpolate(frame, [0, 12], [0, 1], clamp);
  const fadeOut = interpolate(frame, [durationInFrames - 24, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#07060d" }}>
      {/* the film, shifted to the cut's start and recentred */}
      <div
        style={{
          position: "absolute",
          top: SCENE_TOP,
          left: (1080 - 1920 * SCALE) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <Sequence from={-start} layout="none">
          <MusicVideo {...p} hideLyrics muted />
        </Sequence>
      </div>
      {/* soft edges where the scene meets the bands */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #07060d 0px, rgba(7,6,13,0) ${SCENE_TOP + 90}px, rgba(7,6,13,0) ${SCENE_TOP + 1080 * SCALE - 160}px, #07060d ${SCENE_TOP + 1080 * SCALE}px)`,
          pointerEvents: "none",
        }}
      />
      {/* title band */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: BN_SERIF, fontWeight: 900, fontSize: 104, color: "#fff",
          textShadow: `0 0 ${30 + bass * 30}px #ff3d8b, 0 0 70px #9b5cff` }}>
          {p.title}
        </div>
        <div style={{ fontFamily: EN, fontSize: 32, letterSpacing: 14, color: "#ffb547", marginTop: 6 }}>
          {p.subtitle.toUpperCase()}
        </div>
      </div>
      {/* lyrics band */}
      {line && (
        <div style={{ position: "absolute", top: 1480, left: 60, right: 60, textAlign: "center", fontFamily: BN, fontWeight: 800,
          fontSize: line.text.length > 40 ? 64 : 80, lineHeight: 1.35, color: "#fff",
          textShadow: `0 0 ${18 + bass * 18}px #ff3d8b, 0 4px 14px rgba(0,0,0,0.9)`,
          opacity: interpolate(t, [line.start - 0.2, line.start, line.end + 0.25, line.end + 0.5], [0, 1, 1, 0], clamp) }}>
          {words.map((w, k) => {
            const at = line.start + ((line.end - line.start) * k) / words.length;
            const q = interpolate(t, [at - 0.05, at + 0.18], [0, 1], clamp);
            return (
              <span key={k} style={{ display: "inline-block", marginRight: "0.28em", opacity: q,
                transform: `translateY(${(1 - q) * 24}px)`, color: q < 1 ? "#ff3d8b" : "#fff" }}>
                {w}
              </span>
            );
          })}
        </div>
      )}
      {/* credit strip */}
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontFamily: EN, fontSize: 30,
        color: "#cfc8e8", letterSpacing: 4 }}>
        {p.artist}  •  FULL SONG ON YOUTUBE
      </div>
      <Audio src={staticFile(p.song)} startFrom={start}
        volume={(f) => interpolate(f, [0, 12], [0, 1], clamp) * interpolate(f, [durationInFrames - 30, durationInFrames], [1, 0], clamp)} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeIn * fadeOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
