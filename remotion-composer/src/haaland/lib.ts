import raw from "./data.json";

// Timing for the "১০০ সেকেন্ডে শিখি — হালান্ড" short, written by
// client-builds/haaland-100s/build_audio.py from the voiceover's word timings:
// sections, every spoken word, and named cues (e.g. cues.fra41 = the word
// "চার-এক"), so picture, captions and sound effects hit together.

export type Word = { w: string; s: number; e: number; sec: string };
type Data = { fps: number; total: number; frames: number; bpm: number; sections: { id: string; start: number; end: number }[]; words: Word[]; cues: Record<string, number> };
export const D = raw as unknown as Data;
export const Q = D.cues;
export const FPS = D.fps;
export const FRAMES = D.frames;
export const BEAT = 60 / D.bpm;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const backOut = (t: number) => { const x = clamp(t), c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t: number, a: number, d: number) => smooth((t - a) / d);
export const win = (t: number, a: number, b: number, d = 0.25) => Math.min(ramp(t, a - d * 0.5, d), 1 - ramp(t, b - d * 0.5, d));
export const pulse = (t: number, at: number, k = 6) => (t < at ? 0 : Math.exp(-(t - at) * k));
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const beatPulse = (t: number, k = 8) => Math.exp(-(((t % BEAT) + BEAT) % BEAT) * k);

const BN = "০১২৩৪৫৬৭৮৯";
export const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => BN[+d]);

export const C = {
  ink: "#0B0B14", night: "#0B1026", navy: "#152A5C", sky: "#6CABDD", red: "#EF2B2D", crimson: "#EF2B2D", white: "#FFFFFF",
  gold: "#FFC83D", sun: "#FFC83D", green: "#2BD97C", teal: "#2BD97C", cream: "#FFF6E6", orange: "#FF8A3D", magenta: "#FF4FA3",
  cyan: "#4FD8FF", violet: "#8E6CFF", blue: "#2F5DA8", bdGreen: "#006A4E",
  skin: "#C68A5A", skinD: "#A0683C", hair: "#16110E", lungiA: "#2E7D4F", lungiB: "#1E5A38", nordSkin: "#F1C7A8", blond: "#F2D16B",
};
