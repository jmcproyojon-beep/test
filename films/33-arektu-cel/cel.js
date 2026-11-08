// cel.js — hand-drawn cel toolkit for 31-amader-jawa. Every function is a pure function of its inputs (seeded noise only).
// Brush: centreline + pressure -> outline polygon. Boil: the same drawing redrawn with a different seeded jitter every 2 frames
// (4 variants, cycled), so still lines "breathe" like re-traced animation paper. Fills are hand-coloured slightly off-register.
export const PI = Math.PI, DEG = PI / 180;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const eOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const eIn = x => Math.pow(clamp(x), 3);
export const eIO = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eBack = x => { x = clamp(x); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export function hash(a, b = 0, c = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647) + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
}
export const sh = (a, b = 0, c = 0) => hash(a, b, c) * 2 - 1;     // signed
// ------------------------------------------------------------------ time on 1s / 2s / 3s (24 fps)
export const FPS = 24;
export const F = t => Math.floor(t * FPS + 1e-4);                   // frame index
export const on2 = t => Math.floor(F(t) / 2) * 2 / FPS;             // time snapped to 2s (12 drawings per second)
export const on3 = t => Math.floor(F(t) / 3) * 3 / FPS;
export const boilK = (t, hold = 2) => Math.floor(F(t) / hold) % 4;  // which of the 4 boil drawings is on screen
// ------------------------------------------------------------------ curves
export function bez(p0, p1, p2, p3, n = 14) {
  const out = [];
  for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u;
    out.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); }
  return out;
}
// smooth closed/open path through points (Catmull-Rom), n samples per segment
export function spline(pts, closed = false, n = 8) {
  const out = [], P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [a, b, c, d] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * ((2 * b[0]) + (-a[0] + c[0]) * u + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * u2 + (-a[0] + 3 * b[0] - 3 * c[0] + d[0]) * u3),
                0.5 * ((2 * b[1]) + (-a[1] + c[1]) * u + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * u2 + (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * u3)]); }
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}
export const ellipsePts = (cx, cy, rx, ry, n = 28, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * 2 * PI; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
// boil: displace every point by a smooth seeded jitter that changes per boil drawing
export function boil(pts, id, k, amp = 1.6) {
  return pts.map(([x, y], i) => {
    const j = i * 0.35;
    const nx = sh(id, Math.floor(j), k) * (1 - (j % 1)) + sh(id, Math.floor(j) + 1, k) * (j % 1);
    const ny = sh(id + 17, Math.floor(j), k) * (1 - (j % 1)) + sh(id + 17, Math.floor(j) + 1, k) * (j % 1);
    return [x + nx * amp, y + ny * amp];
  });
}
// variable-width ink stroke: pressure swells in the middle, tapers at the ends, wobbles a little per point
export function ink(c, pts, w = 4, o = {}) {
  const { id = 1, k = 0, amp = 1.4, col = '#1F1A17', taper = 0.85, closed = false, press = null, dash = null } = o;
  if (pts.length < 2) return;
  const P = amp ? boil(pts, id, k, amp) : pts, n = P.length;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const u = closed ? 0.5 : i / (n - 1);
    const pr = press ? press(u) : (1 - taper) + taper * Math.pow(Math.sin(PI * clamp(u * 0.94 + 0.03)), 0.55);
    const ww = w * pr * (0.86 + 0.28 * hash(id, i, k)) / 2;
    L.push([P[i][0] - dy * ww, P[i][1] + dx * ww]); R.push([P[i][0] + dy * ww, P[i][1] - dx * ww]);
  }
  c.fillStyle = col;
  if (dash) {                                     // dashed ink (an absence drawn in dotted pencil)
    const [on, off] = dash; let acc = 0;
    for (let i = 0; i < n - 1; i++) {
      const seg = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); const ph = acc % (on + off); acc += seg;
      if (ph < on) { c.beginPath(); c.moveTo(...L[i]); c.lineTo(...L[i + 1]); c.lineTo(...R[i + 1]); c.lineTo(...R[i]); c.closePath(); c.fill(); }
    }
    return;
  }
  c.beginPath(); c.moveTo(...L[0]);
  for (let i = 1; i < n; i++) c.lineTo(...L[i]);
  for (let i = n - 1; i >= 0; i--) c.lineTo(...R[i]);
  c.closePath(); c.fill();
  if (!closed) { for (const e of [0, n - 1]) { c.beginPath(); c.arc(P[e][0], P[e][1], w * 0.18, 0, 2 * PI); c.fill(); } }
}
// flat cel fill, hand-coloured: slightly off-register from the ink and boiling on its own
export function fill(c, pts, col, o = {}) {
  const { id = 1, k = 0, reg = 3, amp = 1.2 } = o;
  const dx = reg * (0.6 + 0.4 * sh(id, 1, 0)), dy = reg * (0.6 + 0.4 * sh(id, 2, 0));
  const P = boil(pts, id + 500, k, amp);
  c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy)); c.closePath();
  c.fillStyle = col; c.fill();
}
// a closed shape = off-register fill + boiling ink outline
export function shape(c, pts, col, o = {}) {
  const { w = 3.6, id = 1, k = 0, line = true, reg = 3, ic = '#1F1A17' } = o;
  if (col) fill(c, pts, col, { id, k, reg });
  if (line) ink(c, [...pts, pts[0], pts[1]], w, { id, k, closed: true, col: ic, taper: 0.25 });
}
// ------------------------------------------------------------------ cel FX (drawn, never particles-with-blur)
// smoke puff: a cluster of boiling cloud lobes that grows and thins, curling upward
export function puff(c, x, y, r, life, id, k, col = '#F3E9D2', ic = '#1F1A17') {
  if (life < 0 || life > 1) return;
  const rr = r * (0.55 + 0.6 * eOut(life)), up = -life * r * 1.4, n = 5;
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * PI + id, d = rr * 0.55, lr = rr * (0.48 + 0.18 * hash(id, i)) * (1 - life * 0.55);
    const pts = ellipsePts(x + Math.cos(a) * d, y + up + Math.sin(a) * d * 0.7, lr, lr * 0.85, 16, a);
    shape(c, pts, col, { w: 3 * (1 - life * 0.6), id: id * 7 + i, k, reg: 2, ic });
  }
}
// star / sparkle burst: 4-point stars that pop and shrink
export function star(c, x, y, r, id, k, col = '#F2B632', ic = '#1F1A17') {
  const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI - PI / 2, rr = i % 2 ? r * 0.32 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  shape(c, pts, col, { w: 2.6, id, k, reg: 1.5, ic });
}
export function sparks(c, x, y, R, life, id, k, n = 8, col = '#F2B632') {
  if (life < 0 || life > 1) return;
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * PI + hash(id, i) * 0.6, d = R * (0.3 + eOut(life) * (0.8 + 0.5 * hash(id + 1, i)));
    const s = (1 - life) * (10 + 10 * hash(id + 2, i));
    if (s > 1.5) star(c, x + Math.cos(a) * d, y + Math.sin(a) * d, s, id * 31 + i, k, col);
  }
}
// speed lines / motion lines (drawn on 1s for fast action)
export function speedLines(c, x, y, dir, len, spread, n, id, k, w = 3) {
  for (let i = 0; i < n; i++) {
    const o = (i / Math.max(1, n - 1) - 0.5) * spread, l = len * (0.5 + 0.5 * hash(id, i, k));
    const px = x - Math.sin(dir) * o, py = y + Math.cos(dir) * o;
    ink(c, [[px, py], [px - Math.cos(dir) * l, py - Math.sin(dir) * l]], w, { id: id + i, k, taper: 1 });
  }
}
// smear frame helper: stretch a drawing along its motion for exactly one frame
export function smear(c, x, y, dx, dy, amount, draw) {
  const a = Math.atan2(dy, dx);
  c.save(); c.translate(x, y); c.rotate(a); c.scale(1 + amount, 1 / (1 + amount * 0.35)); c.rotate(-a); draw(c); c.restore();
}
// hand-lettered text that boils: rendered once per boil drawing into an offscreen, sliced and nudged ("turbulent displace")
const _txt = new Map();
export function letter(c, text, x, y, o = {}) {
  const { size = 64, font = '"Atma"', weight = 600, col = '#1F1A17', k = 0, align = 'center', id = 1, amp = 1.1, rot = 0, maxW = 1700, stroke = null } = o;
  const key = `${text}|${size}|${font}|${weight}|${col}|${k}|${id}|${stroke}`;
  let cv = _txt.get(key);
  if (!cv) {
    const m = document.createElement('canvas').getContext('2d'); m.font = `${weight} ${size}px ${font}`;
    const tw = Math.min(maxW, m.measureText(text).width) + size, th = size * 1.9;
    const a = document.createElement('canvas'); a.width = Math.ceil(tw); a.height = Math.ceil(th);
    const ax = a.getContext('2d'); ax.font = `${weight} ${size}px ${font}`; ax.textBaseline = 'middle'; ax.textAlign = 'center';
    if (stroke) { ax.lineJoin = 'round'; ax.lineWidth = stroke[1]; ax.strokeStyle = stroke[0]; ax.strokeText(text, tw / 2, th / 2, maxW); }
    ax.fillStyle = col; ax.fillText(text, tw / 2, th / 2, maxW);
    cv = document.createElement('canvas'); cv.width = a.width + 8; cv.height = a.height + 8;
    const cx = cv.getContext('2d'), sl = 3;                      // slice rows and nudge them: hand wobble, different per boil drawing
    for (let yy = 0; yy < a.height; yy += sl) cx.drawImage(a, 0, yy, a.width, sl, 4 + sh(id, yy, k) * amp, 4 + yy + sh(id + 3, yy >> 3, k) * amp * 0.5, a.width, sl);
    cv.tw = tw; if (_txt.size > 900) _txt.clear(); _txt.set(key, cv);
  }
  c.save(); c.translate(x, y); c.rotate(rot + sh(id, 9, k) * 0.004);
  const ox = align === 'center' ? -cv.width / 2 : align === 'left' ? -size / 2 - 4 : -cv.width + size / 2 + 4;
  c.drawImage(cv, ox, -cv.height / 2); c.restore();
  return cv.tw - size;
}
export function textW(text, size, font = '"Atma"', weight = 600) {
  const m = textW.m || (textW.m = document.createElement('canvas').getContext('2d')); m.font = `${weight} ${size}px ${font}`; return m.measureText(text).width;
}
