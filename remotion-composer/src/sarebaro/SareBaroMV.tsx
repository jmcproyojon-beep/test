import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../signal/fonts";
import { DISPLAY } from "../signal/fonts";
import { Grain, Vignette, Glitch } from "../signal/kit";
import { D, H, FPS, smooth, cuePulse, rand, clamp, easeOut, Line } from "./lib";
import { Intro, Bedroom, Wake, HookRoom } from "./scenes1";
import { Kitchen, Search, Late, Bang, Street, Office, Outro } from "./scenes2";
import { Trip, TripCfg } from "./trip";

// "সাড়ে বারো" — Pablo Pikaso, from the album "Lonka Kando".
// Music video by Rapar Rubel (Rubel Miah).
//
// Story: a Dhaka bachelor wakes to a scorching noon under his mosquito net —
// it's half past twelve, and it stays half past twelve on every clock. A kid
// rings the bell and runs; the flat is empty but for the clock; the fridge
// holds one ice cream; দারোয়ান কাকা is shouted awake to start the pump. The
// clothes hunt, the boss's calls, the run through rickshaws and CNGs — to an
// office whose shutter says "আজ শুক্রবার". He ends on the steps with the
// ice cream and the guard, laughing.
//
// Everything is drawn in code. Bangla CC runs along the bottom on the vocal
// timings (client-builds/sare-baro/timing.py); the same cues are exported as
// sare-baro.bn.srt for YouTube closed captions.

type Scene = { from: number; to: number; trip: TripCfg; render: (t: number, f: number) => React.ReactNode };

const S: Scene[] = [
  { from: 0, to: 6.0, trip: { mode: "rings", cx: 960, cy: 420, speed: 0.9 }, render: (t, f) => <Intro t={t} f={f} /> },
  { from: 6.0, to: 16.6, trip: { mode: "burst", cx: 1460, cy: 330, speed: 0.6, lobes: 16 }, render: (t, f) => <Bedroom t={t} f={f} /> },
  { from: 16.6, to: H.hook1, trip: { mode: "rings", cx: 760, cy: 420, speed: 1.2 }, render: (t, f) => <Wake t={t} f={f} /> },
  { from: H.hook1, to: 46.0, trip: { mode: "rings", cx: 960, cy: 330, speed: 1.8, lobes: 8 }, render: (t, f) => <HookRoom t={t} f={f} from={H.hook1} /> },
  { from: 46.0, to: H.full2, trip: { mode: "burst", cx: 960, cy: 1180, speed: 0.7 }, render: (t, f) => <Kitchen t={t} f={f} /> },
  { from: H.full2, to: H.bridge, trip: { mode: "rings", cx: 960, cy: 540, speed: 1.4, spin: 0.4 }, render: (t, f) => <Search t={t} f={f} /> },
  { from: H.bridge, to: H.bang, trip: { mode: "burst", cx: 960, cy: 1180, speed: 0.5, lobes: 14 }, render: (t, f) => <Late t={t} f={f} /> },
  { from: H.bang, to: H.hook2, trip: { mode: "burst", cx: 960, cy: 520, speed: 3.0, lobes: 22, amp: 0.26 }, render: (t, f) => <Bang t={t} f={f} /> },
  { from: H.hook2, to: H.hook3, trip: { mode: "burst", cx: 960, cy: 1250, speed: 1.6, lobes: 20 }, render: (t, f) => <Street t={t} f={f} /> },
  { from: H.hook3, to: H.outro, trip: { mode: "rings", cx: 740, cy: 690, speed: 1.2 }, render: (t, f) => <Office t={t} f={f} /> },
  { from: H.outro, to: D.duration + 1, trip: { mode: "burst", cx: 960, cy: 1250, speed: 0.6, lobes: 16 }, render: (t, f) => <Outro t={t} f={f} /> },
];

const IMPACTS: { at: number; kind: string }[] = [
  { at: H.start, kind: "s" }, { at: H.hook1, kind: "gs" }, { at: H.full2, kind: "s" }, { at: H.bridge, kind: "g" },
  { at: H.bang, kind: "igs" }, { at: H.hook2, kind: "gs" }, { at: H.hook3, kind: "s" },
  ...D.lines.filter((l) => l.text.startsWith("বাজে")).map((l) => ({ at: l.words[1].s, kind: "s" })),
];

/** Bangla closed captions: one line at a time, sung word in yellow. */
const CC: React.FC<{ t: number }> = ({ t }) => {
  let line: Line | null = null;
  for (const l of D.lines) if (l.s - 0.1 <= t && t < Math.max(l.e + 0.25, l.s + 1.0)) line = l;
  if (!line) return null;
  const nxt = D.lines[D.lines.indexOf(line) + 1];
  if (nxt && t >= nxt.s - 0.1) return null;
  const k = easeOut((t - line.s + 0.1) / 0.18);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ background: "rgba(16,12,10,0.78)", borderRadius: 18, padding: "10px 34px 16px", maxWidth: 1600, display: "flex", flexWrap: "wrap",
        justifyContent: "center", gap: "0 18px", fontFamily: DISPLAY, fontWeight: 600, fontSize: 58, lineHeight: 1.35, transform: `translateY(${(1 - k) * 16}px)` }}>
        {line.words.map((w, i) => {
          const on = t >= w.s, live = on && t < w.e + 0.05;
          return <span key={i} style={{ color: live ? "#FFD23F" : on ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

export const SareBaroMV: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const scene = S.find((s) => t >= s.from && t < s.to) ?? S[S.length - 1];
  let inv = false, gl = 0, sh = 0;
  for (const im of IMPACTS) {
    const dt = t - im.at;
    if (dt < -0.001 || dt > 0.5) continue;
    if (im.kind.includes("i") && dt < 0.1) inv = true;
    if (im.kind.includes("g")) gl = Math.max(gl, dt < 0.18 ? 1 - dt / 0.18 : 0);
    if (im.kind.includes("s")) sh = Math.max(sh, cuePulse(t, im.at, 10) * (im.kind === "s" ? 0.6 : 1));
  }
  const dx = (rand(f) - 0.5) * 36 * sh, dy = (rand(f + 7) - 0.5) * 26 * sh;
  const open = 1 - smooth(t / 0.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${1 + sh * 0.035})`, filter: inv ? "invert(1) hue-rotate(180deg)" : undefined }}>
        <Glitch amount={gl} seed={Math.floor(t * 30)}>
          <AbsoluteFill><Trip t={t} f={f} cfg={scene.trip} />{scene.render(t, f)}</AbsoluteFill>
        </Glitch>
      </AbsoluteFill>
      <Vignette strength={0.35} />
      <Grain frame={f} opacity={0.14} />
      <CC t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: clamp(open) }} />
    </AbsoluteFill>
  );
};
