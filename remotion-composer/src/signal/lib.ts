import raw from "./data.json";

// Everything the video reacts to was measured from the master by
// client-builds/signal-nai/export_data.py: word timings, the detected beat
// grid, per-frame loudness/bass/bands, and the section hits. Nothing assumes
// a tempo; every pulse is looked up from the detected beats.

export type Word = { w: string; s: number; e: number };
export type Line = { section: string; text: string; dialogue: boolean; s: number; e: number; words: Word[] };
type Hits = {
  bassIn: number; verse1: number; chorus1: number; drop: number; cut: number; verse2: number;
  breakdown: number; bridge: number; slam: number; final: number; callStop: number; back: number; end: number;
};
type Data = {
  fps: number; duration: number; frames: number;
  beats: number[]; downbeats: number[]; gaps: [number, number][];
  hits: Hits; chant: [number, number][]; tags: number[]; echoes: number[];
  lines: Line[]; rms: number[]; bass: number[]; onset: number[]; bands: number[][];
};

export const D = raw as unknown as Data;
export const H = D.hits;
export const FPS = D.fps;
export const FRAMES = D.frames;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const backOut = (t: number) => { const x = clamp(t), c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
/** 0→1 over [a, a+d] */
export const ramp = (t: number, a: number, d: number) => smooth((t - a) / d);
/** in at a, out at b, with fade d */
export const win = (t: number, a: number, b: number, d = 0.3) => Math.min(ramp(t, a - d * 0.5, d), 1 - ramp(t, b - d * 0.5, d));

export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const at = (arr: number[], f: number) => (arr[Math.min(arr.length - 1, Math.max(0, Math.round(f)))] ?? 0) / 99;
export const rms = (f: number) => at(D.rms, f);
export const bass = (f: number) => at(D.bass, f);
export const onset = (f: number) => at(D.onset, f);
export const band = (f: number, i: number) => (D.bands[Math.min(D.bands.length - 1, Math.max(0, Math.round(f)))]?.[i] ?? 0) / 99;
export const bassSmooth = (f: number, span = 3) => { let s = 0; for (let k = -span; k <= span; k++) s += bass(f + k); return s / (2 * span + 1); };

export const lastIndex = (arr: number[], t: number) => {
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
};
export const beatPulse = (t: number, decay = 9) => { const i = lastIndex(D.beats, t); return i < 0 ? 0 : Math.exp(-(t - D.beats[i]) * decay); };
export const downbeatPulse = (t: number, decay = 5) => { const i = lastIndex(D.downbeats, t); return i < 0 ? 0 : Math.exp(-(t - D.downbeats[i]) * decay); };
export const beatIndex = (t: number) => lastIndex(D.beats, t);
export const downbeatIndex = (t: number) => lastIndex(D.downbeats, t);
/** Continuous beat position: integer at each detected beat. */
export const beatPhase = (t: number) => {
  const i = lastIndex(D.beats, t);
  if (i < 0) return t / 0.464;
  const a = D.beats[i], b = D.beats[i + 1] ?? a + 0.464;
  return i + clamp((t - a) / (b - a));
};
export const cuePulse = (t: number, cue: number, decay = 6) => (t < cue ? 0 : Math.exp(-(t - cue) * decay));

export const lineAt = (t: number, sections?: string[], tail = 0.4) => {
  let best: Line | null = null;
  for (const l of D.lines) {
    if (sections && !sections.includes(l.section)) continue;
    if (l.s - 0.15 <= t && t < l.e + tail && (!best || l.s > best.s)) best = l;
  }
  return best;
};
export const findLine = (has: string, from = 0) => D.lines.find((l) => l.s >= from && l.text.includes(has))!;
export const wordTime = (has: string, needle: string, from = 0) => {
  const l = findLine(has, from);
  const w = l?.words.find((x) => x.w.includes(needle));
  return w ? w.s : Infinity;
};
export const inGap = (t: number) => D.gaps.some(([a, b]) => t >= a && t < b);

// Palette (paloananimatekor): obsidian / midnight against crimson, magenta,
// yellow, neon cyan — plus a warm analog set for the remembered afternoons.
export const C = {
  obsidian: "#0A0A0A", midnight: "#0B1033", navy: "#121A4A",
  crimson: "#E60023", magenta: "#FF2D95", yellow: "#FFD700", cyan: "#00E5FF",
  white: "#FFFFFF", cream: "#FFF3DC", paper: "#F2E6CF",
  amber: "#FFAA33", orange: "#FF6A2B", dusk: "#6A2C70", grass: "#2E7D4F", grassLit: "#5DBB63",
  ink: "#141018", cold: "#8FA3B8", coldBg: "#1B2433",
};
