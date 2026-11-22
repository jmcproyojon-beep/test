// Shared maths for "তুই নেই" (Tui Nei). Frames are pure functions of time.
export const FPS = 24, W = 1920, H = 1080;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const ease = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const backOut = (t: number, c = 1.4) => { const x = clamp(t); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t: number, a: number, d: number, f = smooth) => f((t - a) / d);
export const win = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => Math.min(ramp(t, a, fin), 1 - ramp(t, b - fout, fout));
export const rand = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** smooth 1D value noise in [-1, 1] */
export const noise = (t: number, seed = 0) => {
  const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
  return lerp(rand(i + seed * 97.3) * 2 - 1, rand(i + 1 + seed * 97.3) * 2 - 1, u);
};
export const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, "0")).join("");
};
/** keyframes: [[t, v], ...] with easing between */
export const kf = (t: number, keys: [number, number][], f = ease) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, f((t - a) / (b - a))); }
  }
  return keys[keys.length - 1][1];
};
/** natural blinks: ~every 3-5 s, 0.14 s long */
export const blink = (t: number, seed = 0) => {
  const period = 3.6 + rand(seed) * 1.6, ph = ((t + seed * 1.37) % period) / period * period;
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
};
