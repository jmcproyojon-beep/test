import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import raw from "./vo.json";

// BhangariWala e-waste explainer (3 x 10 s). Timing comes from the Bangla
// voiceover (client-builds/bhangariwala/vo.py writes vo.json); everything
// else is laid out on the brief's 0-2 / 2-5 / 5-8 / 8-10 s beats per part.

export type Word = { w: string; s: number; e: number; part: number };
type Data = { total: number; parts: { id: number; start: number; end: number; vo: [number, number] }[]; words: Word[] };
export const D = raw as unknown as Data;
export const FPS = 30;
export const FRAMES = Math.round(D.total * FPS);
export const W = 1080, H = 1920;

/** start time of the nth occurrence of a word (display spelling, prefix match) */
export const at = (needle: string, nth = 0, edge: "s" | "e" = "s") => {
  const hits = D.words.filter((w) => w.w.startsWith(needle));
  if (!hits[nth]) throw new Error(`no word ${needle}#${nth}`);
  return hits[nth][edge];
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const ease = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const expoOut = (t: number) => { const x = clamp(t); return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); };
export const backOut = (t: number, c = 1.7) => { const x = clamp(t); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t: number, a: number, d: number, f = smooth) => f((t - a) / d);
/** 0 -> 1 -> 0 window */
export const win = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => Math.min(ramp(t, a, fin), 1 - ramp(t, b - fout, fout));
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, "0")).join("");
};

const BND = "০১২৩৪৫৬৭৮৯";
export const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => BND[+d]);

// Modern green / white / dark-gray identity.
export const C = {
  bg: "#F3F6F5", paper: "#FFFFFF", ink: "#1E2A30", ink2: "#3A4950", mute: "#6B7A80", line: "#C9D3D6", soft: "#E4EAEB",
  green: "#6AAE22", greenD: "#4A8516", greenDD: "#2E5A0C", mint: "#EBF5DE", mint2: "#CDE6AE", lime: "#9CD35A", brand: "#78B728",
  warn: "#E3A13B", warnSoft: "#F7E3BE", red: "#C8574D", redSoft: "#F2D6D2", gray: "#9AA7AB", screen: "#2C3A41",
};

// Fonts: Inter / Inter Tight for Latin, Anek Bangla for Bengali, joined into
// families by unicode-range so mixed lines ("Electronic Waste আছে?") set cleanly.
const BN = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2248,U+FEFF,U+FFFD";
// Official BhangariWala logo, cut from the client's artwork (client-builds/bhangariwala/logo).
export const LOGO = { mark: staticFile("bw/logo-mark.png"), word: staticFile("bw/logo-word.png"), markAR: 645 / 648, wordAR: 1368 / 236 };
export const logoReady = Promise.all([LOGO.mark, LOGO.word].map((src) => new Promise<void>((res) => {
  const i = new Image(); i.onload = () => { i.decode().then(() => res(), () => res()); }; i.onerror = () => res(); i.src = src;
})));
export const SANS = "BwSans";
export const HEAD = "BwHead";
const f = (family: string, file: string, weight: string, unicodeRange: string) =>
  loadFont({ family, url: staticFile(`bw/${file}.woff2`), weight, unicodeRange });
export const fontsReady = Promise.all([
  f(SANS, "inter-500-normal", "500", LAT), f(SANS, "anek-bangla-bengali-600-normal", "500", BN),
  f(SANS, "inter-600-normal", "600", LAT), f(SANS, "anek-bangla-bengali-600-normal", "600", BN),
  f(SANS, "inter-700-normal", "700", LAT), f(SANS, "anek-bangla-bengali-800-normal", "700", BN),
  f(HEAD, "inter-tight-latin-800-normal", "800", LAT), f(HEAD, "anek-bangla-bengali-800-normal", "800", BN),
  f(HEAD, "inter-tight-latin-700-normal", "700", LAT), f(HEAD, "anek-bangla-bengali-600-normal", "700", BN),
]);
