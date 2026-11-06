import raw from "./data.json";

// Timing for "শেষ আলো জ্বলবেই / মানবতার ডাক", from
// client-builds/manobotar-dak/export_data.py: lyric lines with per-word
// timings (Whisper large-v3 as the clock, the artist's words), detected
// beats, per-frame loudness, and the section starts.

export type Word = { w: string; s: number; e: number };
export type Line = { section: string; text: string; s: number; e: number; words: Word[] };
type Data = { fps: number; duration: number; frames: number; beats: number[]; downbeats: number[]; sections: Record<string, number>; lines: Line[]; rms: number[]; bass: number[] };
export const D = raw as unknown as Data;
export const FPS = D.fps;
export const FRAMES = D.frames;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const backOut = (t: number) => { const x = clamp(t), c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t: number, a: number, d: number) => smooth((t - a) / d);
export const win = (t: number, a: number, b: number, d = 0.4) => Math.min(ramp(t, a - d * 0.5, d), 1 - ramp(t, b - d * 0.5, d));
export const pulse = (t: number, at: number, k = 6) => (t < at ? 0 : Math.exp(-(t - at) * k));
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** Stop-motion clock: time held for two frames at 24 → 12 drawings a second. */
export const onTwos = (t: number) => Math.floor(t * 12) / 12;
/** Per-drawing jitter for a cutout, seeded by its id. */
export const jit = (t: number, id: number, px = 1.6) => {
  const k = Math.floor(t * 12);
  return { x: (rand(k * 7.1 + id) - 0.5) * px, y: (rand(k * 3.3 + id * 1.7) - 0.5) * px, r: (rand(k * 5.9 + id * 2.3) - 0.5) * px * 0.25 };
};
const at = (arr: number[], f: number) => (arr[Math.min(arr.length - 1, Math.max(0, Math.round(f)))] ?? 0) / 99;
export const rms = (f: number) => at(D.rms, f);
export const bass = (f: number) => at(D.bass, f);
export const lastIndex = (arr: number[], t: number) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
export const beatPulse = (t: number, k = 8) => { const i = lastIndex(D.beats, t); return i < 0 ? 0 : Math.exp(-(t - D.beats[i]) * k); };
export const downbeatPulse = (t: number, k = 5) => { const i = lastIndex(D.downbeats, t); return i < 0 ? 0 : Math.exp(-(t - D.downbeats[i]) * k); };

export const lineAt = (t: number, sections?: string[], tail = 0.5) => {
  let best: Line | null = null;
  for (const l of D.lines) {
    if (sections && !sections.includes(l.section)) continue;
    if (l.s - 0.15 <= t && t < l.e + tail && (!best || l.s > best.s)) best = l;
  }
  return best;
};
/** The n-th line (0-based) containing `has`, optionally within a section. */
export const L = (has: string, n = 0, section?: string) => D.lines.filter((l) => l.text.includes(has) && (!section || l.section === section))[n];
export const S = (name: string) => D.sections[name];

// Paper palette
export const C = {
  ink: "#2A1A10", kraft: "#CDB083", cream: "#F4ECD8", paper: "#FBF6EA", red: "#B3261E", blood: "#8E1B14", gold: "#E9A23B", sun: "#F5C04A",
  sky: "#8FB3C9", dusk: "#6A4A6A", night: "#22243A", green: "#5E7D4A", grey: "#7A766E", shadow: "rgba(0,0,0,0.3)",
};
