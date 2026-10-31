import raw from "./data.json";

// Everything the video reacts to was measured from the master by
// client-builds/nikhoj-mv/export_data.py. Nothing here assumes a tempo: at a
// nominal 129.2 BPM a periodic beat drifts ~3 s against the real one by the
// end of this song, so every pulse is looked up from the detected beats.

export type Word = { w: string; s: number; e: number };
export type Line = { section: string; text: string; s: number; e: number; words: Word[] };

type Data = {
  fps: number;
  duration: number;
  frames: number;
  beats: number[];
  downbeats: number[];
  gaps: [number, number][];
  snaps: { intro: number; build: number; outro: number };
  hits: { chorus1: number; drop: number; verse2: number; chorus2: number; final: number };
  lines: Line[];
  rms: number[];
  bass: number[];
  onset: number[];
  bands: number[][];
};

export const D = raw as unknown as Data;
export const FPS = D.fps;
export const FRAMES = D.frames;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);

/** Deterministic pseudo-random in [0,1) — every render draws the same city. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const at = (arr: number[], frame: number) =>
  (arr[Math.min(arr.length - 1, Math.max(0, Math.round(frame)))] ?? 0) / 99;

export const rms = (f: number) => at(D.rms, f);
export const bass = (f: number) => at(D.bass, f);
export const onset = (f: number) => at(D.onset, f);
export const band = (f: number, i: number) =>
  (D.bands[Math.min(D.bands.length - 1, Math.max(0, Math.round(f)))]?.[i] ?? 0) / 99;

/** Bass smoothed over a few frames, for motion that should breathe, not jitter. */
export const bassSmooth = (f: number, span = 3) => {
  let s = 0;
  for (let k = -span; k <= span; k++) s += bass(f + k);
  return s / (2 * span + 1);
};

/** Index of the last time in `arr` at or before t (binary search), or -1. */
export const lastIndex = (arr: number[], t: number) => {
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans;
};

/** 1 on a detected beat, decaying to 0 — `decay` is per second. */
export const beatPulse = (t: number, decay = 9) => {
  const i = lastIndex(D.beats, t);
  return i < 0 ? 0 : Math.exp(-(t - D.beats[i]) * decay);
};
export const downbeatPulse = (t: number, decay = 5) => {
  const i = lastIndex(D.downbeats, t);
  return i < 0 ? 0 : Math.exp(-(t - D.downbeats[i]) * decay);
};
export const beatIndex = (t: number) => lastIndex(D.beats, t);
export const downbeatIndex = (t: number) => lastIndex(D.downbeats, t);

/** 1 at a single cue time, decaying after it; 0 before. */
export const cuePulse = (t: number, cue: number, decay = 6) =>
  t < cue ? 0 : Math.exp(-(t - cue) * decay);

/** The line being sung at t — or one that just ended, for its exit fade. */
export const lineAt = (t: number, sections?: string[], tail = 0.45) => {
  let best: Line | null = null;
  for (const l of D.lines) {
    if (sections && !sections.includes(l.section)) continue;
    if (l.s - 0.12 <= t && t < l.e + tail) {
      if (!best || l.s > best.s) best = l;
    }
  }
  return best;
};

/** All lines that have started by t, in a section set (newest last). */
export const linesSoFar = (t: number, sections: string[]) =>
  D.lines.filter((l) => sections.includes(l.section) && l.s - 0.15 <= t);

export const lineIndex = (l: Line) => D.lines.indexOf(l);

/** Time a word containing `needle` starts, inside the line containing `lineHas`. */
export const wordTime = (lineHas: string, needle: string, from = 0) => {
  for (const l of D.lines) {
    if (l.s < from || !l.text.includes(lineHas)) continue;
    const w = l.words.find((x) => x.w.includes(needle));
    if (w) return w.s;
  }
  return Infinity;
};

export const lineStart = (has: string, from = 0) => {
  const l = D.lines.find((x) => x.s >= from && x.text.includes(has));
  return l ? l.s : Infinity;
};

export const inGap = (t: number) => D.gaps.some(([a, b]) => t >= a && t < b);

// Palette — chosen for this video, not taken from any artwork.
export const C = {
  ink: "#0B0E14",
  night: "#0E1630",
  deep: "#151F45",
  teal: "#22E3D2",
  cyan: "#5CC8FF",
  magenta: "#FF3D8B",
  red: "#E8202A",
  amber: "#FFB23F",
  gold: "#F5C76B",
  cream: "#F3EAD7",
  paperInk: "#1B1712",
  white: "#FFFFFF",
};
