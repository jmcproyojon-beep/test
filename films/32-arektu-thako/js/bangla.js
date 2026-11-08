// Bangla chalk handwriting from the centre-line data in bn.js (tools/bn_strokes.py): each letter's body left to right,
// then the মাত্রা (headline) across the word as one quick pressed stroke. Same contract as hand.js: Stroke[] with
// t0/t1 set, .end = time the last stroke ends, .x = pen position after the text.
import { clamp } from '/core/lib.js';
import { Stroke, smoothKeepCorners, rng } from './chalk.js';
import { BN } from './bn.js';
import { writeLatin } from './hand.js';

const sst = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const g2 = (x, k) => Math.exp(-(x / k) * (x / k));

// one word. o: { hand: 'teacher'|'child', color, seed, speed (size units per second), gap, R }
export function writeBnWord(word, x, by, size, clock, o = {}) {
  const child = o.hand === 'child', D = BN[(child ? 'child|' : 'teacher|') + word];
  if (!D) throw new Error('no Bangla stroke data for ' + word);
  const R = rng((o.seed ?? 1) * 7919 + word.length * 13), out = [];
  const wu = size * (o.w ?? (child ? .036 : .034)), spd = (o.speed ?? 5.5) * size;
  const tilt = (child ? (R() - .5) * 4 : (R() - .5) * .8) * Math.PI / 180;
  const P = ([px, py]) => { const X = px * size, Y = py * size; return [x + X * Math.cos(tilt) - Y * Math.sin(tilt), by + X * Math.sin(tilt) + Y * Math.cos(tilt)]; };
  const color = o.color || (child ? 'kid' : 'white');
  let t = clock;
  const push = (pts, kind) => {
    const isDot = kind === 'dot', isMatra = kind === 'matra';
    const wfn = isMatra ? ((s, L) => (1 + .25 * g2(s, wu * 1.6)) * (1 - .35 * sst(.75, 1, s / L)))
      : child ? ((s, L) => (1 + .1 * g2(s, wu * 1.5)) * (1 - .25 * sst(.85, 1, s / L)))
      : ((s, L) => (1 + .22 * g2(s, wu * 1.6)) * (1 - .3 * sst(.82, 1, s / L)));
    const st = new Stroke(pts, {
      kind: 'write', w: isDot ? wu * 1.25 : wu, color, wfn, taper: 0, land: .4,
      wob: child ? size * .006 : size * .002, wav: size * (child ? .35 : .6), skip: child ? .14 : .08, press: child ? .98 : 1.1,
      endSpecks: true, specks: child ? .6 : 1, seed: (o.seed ?? 1) * 31 + out.length * 7.7, R: o.R,
    });
    const d = isDot ? .05 : clamp(.012 + st.len / spd, .03, isMatra ? .3 : .55);
    if (out.length) { const pe = out[out.length - 1].end; t += (o.gap ?? .012) + Math.hypot(st.start[0] - pe[0], st.start[1] - pe[1]) / (spd * 3.5); }
    st.t0 = t; st.t1 = t + d; t += d; out.push(st);
  };
  for (const s of D.strokes) {
    const pts = s.map(P);
    if (pts.length === 2 && Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) < size * .12) push(pts, 'dot');
    else push(smoothKeepCorners(pts, 50, 6), 'body');
  }
  for (const [x0, x1, my] of D.matra) {       // the headline last, left to right, rising a hair
    const a = P([x0 - .02, my + .004]), b = P([x1 + .015, my - .006]);
    push([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - size * .003], b], 'matra');
  }
  out.end = t; out.x = x + D.w * size;
  return out;
}
export const bnWidth = (word, size, hand = 'teacher') => BN[hand + '|' + word].w * size;

// a run of words; non-Bangla tokens (?, …, —, Latin) go through the single-line SVG font
export function writeBn(text, x, by, size, clock, o = {}) {
  const out = []; let t = clock, X = x;
  const hand = o.hand === 'child' ? 'child' : 'teacher';
  text.split(' ').forEach((tok, i) => {
    if (i) X += size * (o.space ?? .3);
    const m = tok.match(/^([ঀ-৿‌‍]*)(.*)$/u), bn = m[1], rest = m[2];
    if (bn) { const s = writeBnWord(bn, X, by, size, t, { ...o, seed: (o.seed ?? 1) + i * 3 }); out.push(...s); t = s.end + (o.wgap ?? .06); X = s.x; }
    if (rest) { const s = writeLatin(rest, X + size * .04, by, size * .5, t, { ...o, lspeed: 30 }); out.push(...s); t = s.end; X = s.x; }
  });
  out.end = t; out.x = X;
  return out;
}
export function bnTextWidth(text, size, o = {}) {
  const hand = o.hand === 'child' ? 'child' : 'teacher';
  return text.split(' ').reduce((a, tok, i) => {
    const bn = tok.match(/^[ঀ-৿‌‍]*/u)[0], rest = tok.slice(bn.length);
    return a + (i ? size * (o.space ?? .3) : 0) + (bn ? BN[hand + '|' + bn].w * size : 0) + (rest ? size * .3 * rest.length : 0);
  }, 0);
}
