// «আরেকটু থাকো» Stay a Little Longer — Rapar Rubel. The whole film as data: both boards, every stroke with its time,
// the one wipe, the sliding panel, the drying streak, the camera, the board texts for readcheck and the sound events.
// Units: world = the slate (x 0…6400, y 0…1700). FL (his board, the front-left panel) is stored in panel-local units and
// moves with slideX(t); FR (her board, right) and BK (the back board behind FL) are in world units.
// Picture is timed to the song: LINES (js/lines.js) are the sung lines' times in the master.
import { clamp, lerp, ss, eio } from '/core/lib.js';
import { Stroke, catmull, rng } from './chalk.js';
import { writeLatin, latinWidth } from './hand.js';
import { writeBn, writeBnWord, bnTextWidth } from './bangla.js';
import { LINES } from './lines.js';
import { PW } from './stage.js';

const NEED = txt => { let n = 0; for (const c of txt) if (!/\s/.test(c)) n++; return Math.max(1.5, n / 15 + 1.5); };
export const ROWC = { top: 1236, base: 1420 };                       // the painted ruling of the chorus row (FL and the back board)

export function build(W = 1920, H = 1080) {
  const S = [], TX = [], EV = [], T = {};
  const L = i => LINES[i].t0, E = i => LINES[i].t1;
  const add = (arr, layer, phase = 'pre') => { arr.forEach(s => { s.layer = layer; s.phase = phase; S.push(s); }); return arr; };
  const text = (id, txt, layer, strokes, t1 = 1e9, pad = 8) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of strokes) for (const [x, y] of s.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    TX.push({ id, text: txt, layer, box: [x0 - pad, y0 - pad, x1 + pad, y1 + pad], t0: strokes[0].t0, t1 });
  };
  // a drawn line (not lettering): pts, options, start, duration
  const ln = (pts, o, t0, dur) => { const s = new Stroke(o.smooth ? catmull(pts, 10) : pts, { kind: 'write', w: 8, taper: .2, taperLen: .2, land: .6, skip: .14, endSpecks: true, specks: .6, ...o }); s.t0 = t0; s.t1 = t0 + dur; return s; };
  const ell = (cx, cy, rx, ry, a0, a1, o, t0, dur) => { const p = []; for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return ln(p, { wob: 1.4, ...o }, t0, dur); };
  const lat = (txt, x, by, cap, t, o = {}) => writeLatin(txt, x, by, cap, t, { lspeed: 60, ...o });
  const latC = (txt, cx, by, cap, t, o = {}) => lat(txt, cx - latinWidth(txt, cap, o.hand === 'child' ? 'child' : 'main') / 2, by, cap, t, o);
  const seq = (...groups) => groups.reduce((a, g) => a.concat(g), []);
  const R = rng(3);

  // ───────── already on the board when the film opens (his board, top right): the day, in small chalk
  const day = add(lat('a rainy afternoon', 2420, 170, 40, -20, { seed: 2, lspeed: 4000 }), 'FL');
  day.forEach(s => { s.t0 = -20; s.t1 = -19.9; });
  text('day', 'a rainy afternoon', 'FL', day);

  // ───────── INTRO · the bell over the room; the title on her board; a window and rain on his
  EV.push({ t: .3, type: 'bell' });
  T.title = 4.0;
  const tW = bnTextWidth('আরেকটু থাকো', 230), tx0 = 4800 - tW / 2;
  const ti1 = add(writeBnWord('আরেকটু', tx0, 1400, 230, T.title, { seed: 4, speed: 3.0 }), 'FR');
  const ti2 = add(writeBnWord('থাকো', ti1.x + 230 * .3, 1400, 230, ti1.end + .1, { seed: 5, speed: 3.0, color: 'orange' }), 'FR');
  const tiA = add(latC('Rapar Rubel', 4800, 1545, 54, ti2.end + .25, { seed: 6 }), 'FR');
  text('title', 'আরেকটু থাকো', 'FR', seq(ti1, ti2)); text('artist', 'Rapar Rubel', 'FR', tiA);
  // the window: frame, cross bars, sill
  T.win = 12.3;
  const WX0 = 820, WX1 = 1180, WY0 = 300, WY1 = 620;
  const win = add([
    ln([[WX0, WY0], [WX1, WY0 - 4]], {}, T.win, .22), ln([[WX1, WY0 - 4], [WX1 + 3, WY1]], {}, T.win + .25, .22),
    ln([[WX1 + 3, WY1], [WX0, WY1 + 3]], {}, T.win + .5, .22), ln([[WX0, WY1 + 3], [WX0, WY0]], {}, T.win + .75, .22),
    ln([[(WX0 + WX1) / 2, WY0 + 2], [(WX0 + WX1) / 2 + 2, WY1]], { w: 6 }, T.win + 1.05, .18), ln([[WX0 + 2, (WY0 + WY1) / 2], [WX1, (WY0 + WY1) / 2 - 2]], { w: 6 }, T.win + 1.28, .18),
    ln([[WX0 - 30, WY1 + 26], [WX1 + 34, WY1 + 22]], { w: 7 }, T.win + 1.5, .2),
  ], 'FL');
  // rain inside the panes, one drop-line on every beat (161.5 bpm → 0.3715 s), slanted by the wind
  const BEAT = 60 / 161.5, rain = (t0, t1, k0) => { const out = []; let k = k0; for (let t = t0; t < t1; t += BEAT, k++) {
    const x = WX0 + 25 + ((k * 0.618) % 1) * (WX1 - WX0 - 60), y = WY0 + 25 + ((k * 0.382 + .2) % 1) * (WY1 - WY0 - 90);
    if (Math.abs(x - (WX0 + WX1) / 2) < 14 || Math.abs(y + 20 - (WY0 + WY1) / 2) < 22) continue;
    out.push(ln([[x, y], [x - 16, y + 46]], { w: 4.5, taper: .5 }, t, .07)); } return add(out, 'FL'); };
  rain(T.win + 2.2, 24.3, 0);

  // ───────── VERSE 1 · his memories, left to right across his board (row A, baseline 560)
  const A = 560, SZ = 200;
  const v1 = add(writeBn('বিকেল', 150, A, SZ, L(0) + .15, { seed: 11 }), 'FL');
  const v1e = add(lat('afternoon', 165, 665, 44, v1.end + .05, { seed: 12 }), 'FL');
  text('bikel', 'বিকেল', 'FL', v1); text('bikel-en', 'afternoon', 'FL', v1e);
  const v2 = add(writeBn('বৃষ্টি', 1250, A, SZ, L(1) + .2, { seed: 13 }), 'FL');
  const v2e = add(lat('rain', 1262, 665, 44, v2.end + .05, { seed: 14 }), 'FL');
  text('brishti', 'বৃষ্টি', 'FL', v2); text('brishti-en', 'rain', 'FL', v2e);
  rain(v2e.end + .1, E(1) + .3, 40);
  const v3 = add(writeBn('কথা', 1720, A - 10, SZ, L(2) + .2, { seed: 15 }), 'FL');
  const bub = add([ell(1888, 455, 250, 150, Math.PI * .62, Math.PI * 2.5, { w: 7, wob: 2 }, v3.end + .05, .55), ln([[1770, 590], [1720, 670], [1830, 600]], { w: 7, taper: .3 }, v3.end + .62, .2)], 'FL');
  const v3e = add(lat('your words', 1800, 690, 40, bub[1].t1 + .05, { seed: 16 }), 'FL');
  text('kotha', 'কথা', 'FL', v3); text('kotha-en', 'your words', 'FL', v3e);
  const v4 = add(writeBn('দূরে', 2300, A, SZ, L(3) + .15, { seed: 17 }), 'FL');
  const v4e = add(lat('far away', 2310, 665, 44, v4.end + .05, { seed: 18, lspeed: 90 }), 'FL');
  const ar = add([ln([[2640, 470], [2850, 462], [3110, 468]], { w: 8, smooth: true, taper: .05 }, v4e.end + .05, .4), ln([[3070, 440], [3112, 468], [3068, 498]], { w: 8, taper: .2 }, v4e.end + .47, .12)], 'FL');
  text('dure', 'দূরে', 'FL', v4); text('dure-en', 'far away', 'FL', v4e);

  // ───────── VERSE 2 · on her board (row A): the tea, the photographs, the dusk; then her own hand answers (row B)
  T.slide0 = L(24) - 2.4; T.slide1 = T.slide0 + 1.2;            // (needed now: her board is covered at the bridge)
  const FRold = [];
  const fr = (arr) => { add(arr, 'FR'); FRold.push(...arr); return arr; };
  let t = L(4) + .1;
  const cup = fr([
    ln([[3455, 405], [3705, 401]], { w: 7 }, t, .16),
    ln([[3458, 405], [3470, 520], [3510, 572], [3580, 584], [3650, 572], [3690, 520], [3702, 402]], { w: 7, smooth: true }, t + .18, .42),
    ell(3720, 470, 42, 46, -Math.PI * .45, Math.PI * .45, { w: 6 }, t + .62, .18),
    ln([[3530, 380], [3515, 345], [3540, 305], [3522, 270]], { w: 5, smooth: true, taper: .5 }, t + .84, .2),
    ln([[3610, 378], [3595, 340], [3620, 302], [3602, 262]], { w: 5, smooth: true, taper: .5 }, t + 1.0, .2),
  ]);
  const cha = fr(writeBn('চা', 3780, A, SZ, t + 1.25, { seed: 21 }));
  const teaE = fr(lat('tea', 3790, 665, 44, cha.end + .05, { seed: 22 }));
  text('cha', 'চা', 'FR', cha, T.slide1); text('cha-en', 'tea', 'FR', teaE, T.slide1);
  t = L(5) + .1;
  const fram = fr([
    ln([[4100, 330], [4420, 326], [4424, 600], [4098, 604], [4100, 330]], { w: 7 }, t, .55),
    ell(4205, 440, 38, 42, -Math.PI / 2, Math.PI * 1.5, { w: 5 }, t + .6, .2), ell(4315, 445, 38, 42, -Math.PI / 2, Math.PI * 1.5, { w: 5 }, t + .82, .2),
    ell(4205, 560, 70, 60, Math.PI * 1.05, Math.PI * 1.95, { w: 5 }, t + 1.04, .16), ell(4315, 565, 70, 60, Math.PI * 1.05, Math.PI * 1.95, { w: 5 }, t + 1.22, .16),
  ]);
  const p1 = fr(writeBn('ছবি', 4480, A, SZ, t + 1.45, { seed: 23 }));
  const p1e = fr(lat('photos', 4492, 665, 44, p1.end + .05, { seed: 24 }));
  text('chobi', 'ছবি', 'FR', p1, T.slide1); text('chobi-en', 'photos', 'FR', p1e, T.slide1);
  t = L(6) + .1;
  const sun = fr([
    ln([[4870, 585], [5270, 580]], { w: 7 }, t, .25), ell(5070, 583, 115, 110, Math.PI, Math.PI * 2, { w: 7 }, t + .28, .35),
    ln([[4930, 430], [4955, 455]], { w: 5 }, t + .66, .06), ln([[5070, 385], [5070, 418]], { w: 5 }, t + .76, .06), ln([[5210, 430], [5185, 455]], { w: 5 }, t + .86, .06),
  ]);
  const s1 = fr(writeBn('সন্ধ্যা', 5340, A, SZ, t + 1.0, { seed: 25 }));
  const s1e = fr(lat('dusk', 5352, 665, 44, s1.end + .05, { seed: 26 }));
  text('sondha', 'সন্ধ্যা', 'FR', s1, T.slide1); text('sondha-en', 'dusk', 'FR', s1e, T.slide1);
  // her hand (pale yellow): «ভাবো?» you do?  «যেতে হবে» I have to go
  const h1 = fr(writeBn('ভাবো?', 3600, 1000, 230, L(7) + .4, { hand: 'child', seed: 31 }));
  const h1e = fr(lat('you do?', 3615, 1095, 44, h1.end + .05, { hand: 'child', seed: 32 }));
  text('her1', 'ভাবো?', 'FR', h1, T.slide1); text('her1-en', 'you do?', 'FR', h1e, T.slide1);
  const h2 = fr(writeBn('যেতে হবে', 4560, 1000, 230, L(8) + .05, { hand: 'child', seed: 33, speed: 14 }));
  const h2e = fr(lat('I have to go', 4575, 1095, 44, h2.end + .03, { hand: 'child', seed: 34, lspeed: 120 }));
  text('her2', 'যেতে হবে', 'FR', h2, T.slide1); text('her2-en', 'I have to go', 'FR', h2e, T.slide1);
  [...FRold, ...ti1, ...ti2, ...tiA].forEach(s => s.hideAt = T.slide1);
  for (const q of TX) if (q.layer === 'FR' && q.t1 > 1e8) q.t1 = T.slide1;

  // ───────── PRE-CHORUS · what he wants to believe, the one wipe, the truth in the same place (his board, row B right)
  const B = 1000;
  T.wish = h2.end + .1;
  const w1 = add(writeBn('সময় থামবে', 1900, B, SZ, T.wish, { seed: 41, speed: 16, gap: .008, wgap: .03 }), 'FL');
  const w1e = [];                                                   // (no English under the wish: it is up too briefly to read; the plate carries it)
  T.wipe0 = Math.max(w1.end + .4, L(9) + .05); T.wipe1 = T.wipe0 + .75;
  EV.push({ t: T.wipe0, type: 'wipe', d: .75 });
  const wipe = { t0: T.wipe0, t1: T.wipe1, w: 330, path: catmull([[1800, 975], [2300, 962], [2800, 958], [3110, 966]], 12) };
  w1.forEach(s => s.wiped = true);
  text('wish', 'সময় থামবে', 'FL', w1, T.wipe0 + .3);
  const tr = add(writeBn('সময় থামবে না', 1900, B, SZ, T.wipe1 + .05, { seed: 43, speed: 14, gap: .008, wgap: .03 }), 'FL', 'post');
  const tre = add(lat("time won't stop", 1912, 1095, 44, tr.end + .03, { seed: 44, lspeed: 150 }), 'FL', 'post');
  text('truth', 'সময় থামবে না', 'FL', tr); text('truth-en', "time won't stop", 'FL', tre);
  T.truth = tre.end; T.her2 = h2.end; T.w1 = w1.end; T.v1 = v1.end; T.v4 = v4e.end; T.h1 = h1e.end;
  // the instrumental: the room seen wide, the rain still falling in the chalk window
  rain(E(7) + .7, L(8) - .4, 80);

  // ───────── PRE-CHORUS 2 · this heart; «বিদায়» (goodbye) written and struck out; «একটা কথা…» (one thing…)
  t = L(10) + .3;
  const heart = add([ln([[330, 1005], [262, 930], [258, 880], [295, 850], [330, 880]], { w: 7, smooth: true }, t, .3), ln([[330, 880], [365, 850], [402, 880], [398, 930], [330, 1005]], { w: 7, smooth: true }, t + .32, .3)], 'FL');
  const g1 = add(writeBn('বিদায়', 520, B, SZ, L(11) + .1, { seed: 51 }), 'FL');
  const g1e = add(lat('goodbye', 532, 1095, 44, g1.end + .05, { seed: 52 }), 'FL');
  const strike = add([ln([[505, 905], [745, 898], [985, 890]], { w: 9, smooth: true }, Math.max(g1e.end + .15, L(11) + 1.4), .28)], 'FL');
  text('bidai', 'বিদায়', 'FL', g1); text('bidai-en', 'goodbye', 'FL', g1e);
  const k1 = add(writeBn('একটা কথা...', 1080, B, 165, L(13) + .05, { seed: 53, speed: 11 }), 'FL');
  const k1e = add(lat('one thing...', 1092, 1095, 44, k1.end + .03, { seed: 54, lspeed: 140 }), 'FL');
  text('ekta', 'একটা কথা...', 'FL', k1); text('ekta-en', 'one thing...', 'FL', k1e);

  // ───────── CHORUS 1 · «আরেকটু থাকো»; «থাকো» in the one accent chalk (row C, on the painted ruling)
  const C = ROWC.base, CS = 260;
  const c1a = add(writeBnWord('আরেকটু', 300, C, CS, L(14) + .05, { seed: 61, speed: 7 }), 'FL');
  const c1b = add(writeBnWord('থাকো', c1a.x + CS * .3, C, CS, c1a.end + .08, { seed: 62, speed: 7, color: 'orange' }), 'FL');
  const c1e = add(lat('stay a little longer', 312, 1560, 50, c1b.end + .05, { seed: 63, lspeed: 70 }), 'FL');
  text('cho1', 'আরেকটু থাকো', 'FL', seq(c1a, c1b)); text('cho1-en', 'stay a little longer', 'FL', c1e);
  const THX = [c1b[0].pts[0][0], c1b.x];                                   // where «থাকো» sits on his board (x range)
  const TH0 = Math.min(...c1b.flatMap(s => s.pts.map(p => p[0])));
  add([ln([[TH0 - 10, 1462], [(TH0 + c1b.x) / 2, 1458], [c1b.x + 12, 1452]], { w: 9, color: 'orange', smooth: true, taper: .1 }, L(16) + .25, .32)], 'FL');
  T.thakoFL = [TH0, c1b.x];
  const m1 = add(writeBn('এই মুহূর্তটা', 2150, C, 180, L(21) + .1, { seed: 64, speed: 8 }), 'FL');
  add([ln([[2140, 1462], [2500, 1458], [m1.x + 10, 1455]], { w: 8, smooth: true, taper: .1 }, m1.end + .05, .3)], 'FL');
  const m1e = add(lat('this moment', 2162, 1560, 46, m1.end + .4, { seed: 65 }), 'FL');
  text('muhurto', 'এই মুহূর্তটা', 'FL', m1); text('muhurto-en', 'this moment', 'FL', m1e);
  const thC = (TH0 + c1b.x) / 2;
  add([ell(thC, 1330, (c1b.x - TH0) / 2 + 70, 150, Math.PI * .9, Math.PI * 2.85, { w: 8, color: 'orange', wob: 3 }, L(22) + .4, .6)], 'FL');

  // ───────── BRIDGE · the front panel slides away (her board goes behind it); the clean back board
  EV.push({ t: T.slide0, type: 'slide', d: T.slide1 - T.slide0 });
  const pW = bnTextWidth('তোমার পথ তোমারই', 220), px0 = 1600 - pW / 2;
  const b1 = add(writeBnWord('তোমার', px0, 700, 220, L(24) + .3, { seed: 71, speed: 10 }), 'BK');
  const b2 = add(writeBnWord('পথ', b1.x + 66, 700, 220, b1.end + .1, { seed: 72, speed: 10 }), 'BK');
  const b3 = add(writeBnWord('তোমারই', b2.x + 66, 700, 220, b2.end + .1, { seed: 73, speed: 10 }), 'BK');
  const b1e = add(latC('your path is yours', 1600, 830, 50, b3.end + .08, { seed: 74 }), 'BK');
  text('poth', 'তোমার পথ তোমারই', 'BK', seq(b1, b2, b3)); text('poth-en', 'your path is yours', 'BK', b1e);
  // the line that sews the two boards: from «থাকো» on his panel, across the seam, to «পথ» — he lets her go
  T.thread = Math.max(L(26), b1e.end + .1);
  const pathC = [(Math.min(...b2.flatMap(s => s.pts.map(p => p[0]))) + b2.x) / 2, 745];
  const thFL = ln([[TH0 - 30, 1440], [TH0 - 160, 1612], [700, 1628], [0, 1618]], { w: 9, color: 'orange', smooth: true, taper: .02, wob: 1.2 }, T.thread, .8);
  const thBK = ln([[PW, 1618], [2750, 1560], [2380, 1200], [2050, 900], [pathC[0] + 40, pathC[1] + 20]], { w: 9, color: 'orange', smooth: true, taper: .05, wob: 1.2 }, T.thread + .8, .75);
  thFL.ease = thBK.ease = u => u;
  add([thFL], 'FL'); add([thBK], 'BK');
  const thHead = add([ln([[pathC[0] + 85, pathC[1] + 10], [pathC[0] + 40, pathC[1] + 20], [pathC[0] + 75, pathC[1] + 55]], { w: 9, color: 'orange', taper: .2 }, T.thread + 1.56, .12)], 'BK');
  EV.push({ t: T.thread, type: 'thread', d: 1.68 });
  // time going too fast: a chalk clock; «দুজন» (the two of us) and two smiles
  t = Math.max(L(27) + .1, thHead[0].t1 + .3);
  const ck = [ell(520, 990, 140, 140, -Math.PI / 2, Math.PI * 1.5, { w: 8, wob: 2 }, t, .5)];
  [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2; ck.push(ln([[520 + Math.cos(a) * 112, 990 + Math.sin(a) * 112], [520 + Math.cos(a) * 128, 990 + Math.sin(a) * 128]], { w: 6 }, t + .52 + i * .06, .05)); });
  ck.push(ln([[520, 990], [600, 930]], { w: 8 }, t + .8, .12), ln([[520, 990], [520, 885]], { w: 7 }, t + .95, .12));
  add(ck, 'BK');
  const d1 = add(writeBn('দুজন', 1300, 1080, SZ, L(29) + .1, { seed: 75 }), 'BK');
  const smile = (cx, t0) => [ell(cx, 1010, 62, 62, -Math.PI / 2, Math.PI * 1.5, { w: 6 }, t0, .3), ln([[cx - 20, 990], [cx - 18, 996]], { w: 7 }, t0 + .32, .03), ln([[cx + 20, 990], [cx + 22, 996]], { w: 7 }, t0 + .38, .03), ell(cx, 1018, 32, 24, Math.PI * .15, Math.PI * .85, { w: 5 }, t0 + .45, .14)];
  const sm = add([...smile(1900, d1.end + .1), ...smile(2110, d1.end + .75)], 'BK');
  const d1e = add(lat('we both smile', 1310, 1170, 42, sm[sm.length - 1].t1 + .05, { seed: 76 }), 'BK');
  text('dujon', 'দুজন', 'BK', d1); text('dujon-en', 'we both smile', 'BK', d1e);

  // ───────── FINAL CHORUS · «আরেকটু থাকো» again, on the back board, at the same height and size, faster
  const f1a = add(writeBnWord('আরেকটু', 300, C, CS, L(32) + .05, { seed: 81, speed: 10 }), 'BK');
  const f1b = add(writeBnWord('থাকো', f1a.x + CS * .3, C, CS, f1a.end + .05, { seed: 82, speed: 10, color: 'orange' }), 'BK');
  const f1e = add(lat('stay a little longer', 312, 1560, 50, f1b.end + .05, { seed: 83, lspeed: 90 }), 'BK');
  text('cho2', 'আরেকটু থাকো', 'BK', seq(f1a, f1b)); text('cho2-en', 'stay a little longer', 'BK', f1e);
  const FH0 = Math.min(...f1b.flatMap(s => s.pts.map(p => p[0])));
  add([ln([[FH0 - 10, 1462], [(FH0 + f1b.x) / 2, 1458], [f1b.x + 12, 1452]], { w: 9, color: 'orange', smooth: true, taper: .1 }, L(34) + .25, .3)], 'BK');
  add([ell((FH0 + f1b.x) / 2, 1330, (f1b.x - FH0) / 2 + 70, 150, Math.PI * .9, Math.PI * 2.85, { w: 8, color: 'orange', wob: 3 }, L(40) + .4, .55)], 'BK');

  // ───────── OUTRO · the panel slides back; her board was wiped while it was hidden; the damp streak dries
  // and gives back the one thing she left: «আবার দেখা হবে» (see you again). He answers once, small, in orange.
  T.back0 = Math.max(E(41) + 1.2, 198.4); T.back1 = T.back0 + 1.2;
  EV.push({ t: T.back0, type: 'slide', d: T.back1 - T.back0 });
  const wet = { x0: 700, y0: 640, y1: 1110, xEnd: 2520, bx0: 720, t0: T.back1 + .5, t1: T.back1 + 8.5, tShow: T.back0, layer: 'FR' };
  const nW = bnTextWidth('আবার দেখা হবে', 200, { hand: 'child' }), nx0 = PW + 1600 - nW / 2;
  const note = add(writeBn('আবার দেখা হবে', nx0, 900, 200, -50, { hand: 'child', seed: 91 }), 'FR');
  const noteE = add(lat('see you again', nx0 + 15, 1000, 46, -40, { hand: 'child', seed: 92 }), 'FR');
  // revealed by the drying edge, not written: each stroke appears as the front passes its right end
  const frontAt = x => { const p = clamp((x - PW - wet.bx0) / (wet.xEnd + 20 - wet.bx0)); return wet.t0 + (1 - Math.pow(1 - p, 2 / 3)) * (wet.t1 - wet.t0); };
  [...note, ...noteE].forEach(s => { const xm = Math.max(...s.pts.map(p => p[0])); s.t1 = frontAt(xm); s.t0 = s.t1 - .02; s.dried = true; });
  text('note', 'আবার দেখা হবে', 'FR', note); text('note-en', 'see you again', 'FR', noteE);
  T.dry = wet.t1;
  const last = add(writeBnWord('থাকো', nx0 + nW + 70, 900, 140, L(44) + .5, { seed: 93, speed: 3.0, color: 'orange' }), 'FR');
  text('last', 'থাকো', 'FR', last);
  // credits, small, under her note
  T.cred = Math.max(E(44) + 1.0, last.end + 1.2);
  const cr1 = add(writeBn('কণ্ঠ ও কথা', 4010, 1340, 120, T.cred, { seed: 95, speed: 4.5 }), 'FR');
  const cr1e = add(lat('- Rapar Rubel (Rubel Miah)', cr1.x + 30, 1340, 52, cr1.end + .05, { seed: 96, lspeed: 90 }), 'FR');
  const cr2 = add(writeBn('সম্পাদনা', 4010, 1530, 120, cr1e.end + .2, { seed: 97, speed: 4.5 }), 'FR');
  const cr2e = add(lat('- Paloan', cr2.x + 30, 1530, 52, cr2.end + .05, { seed: 98, lspeed: 90 }), 'FR');
  text('cr1', 'কণ্ঠ ও কথা', 'FR', cr1); text('cr1e', '- Rapar Rubel (Rubel Miah)', 'FR', cr1e);
  text('cr2', 'সম্পাদনা', 'FR', cr2); text('cr2e', '- Paloan', 'FR', cr2e);
  T.wideEnd = cr2e.end + 2.6; T.b3 = b3.end; T.c1 = c1b.end; T.f1 = f1b.end; T.m1 = m1.end; T.k1 = k1e.end; T.g1 = g1e.end; T.d1 = d1e.end; T.last = last.end;
  T.DUR = 243.6;
  EV.push({ t: T.DUR - 7.5, type: 'bell' });

  // ───────── the sliding panel: away for the bridge, back for the outro
  const slideX = tt => PW * (eio(clamp((tt - T.slide0) / (T.slide1 - T.slide0))) - eio(clamp((tt - T.back0) / (T.back1 - T.back0))));

  // ───────── camera: keys [t, cx, cy, s] (s for a 1920-wide frame); each shot cuts to its own keys
  const WIDE = [3200, 700, .28], HERO = [3300, 950, .42];
  const k = (t, a, s2) => [t, a[0], a[1], s2 ?? a[2]];
  const shots = [
    { t0: 0, keys: [k(0, WIDE, .27), k(3.4, WIDE, .285)] },
    { t0: 3.5, keys: [[3.5, 4800, 1380, .9], [T.win - .3, 4800, 1370, .95]] },
    { t0: T.win - .2, keys: [[T.win, 1000, 470, 1.2], [L(0) - .4, 960, 470, 1.25]] },
    { t0: L(0) - .3, keys: [[L(0) - .3, 720, 520, 1.05], [L(1) - .3, 800, 520, 1.05], [L(1) + .6, 1230, 520, 1.05], [L(2) - .2, 1380, 520, 1.05], [L(2) + .5, 1880, 520, 1.05],
      [L(3) - .2, 1980, 520, 1.05], [L(3) + .5, 2560, 520, 1.0], [L(4) - .4, 2900, 520, 1.0], [L(4) + .5, 3700, 520, 1.05], [L(5) - .2, 3820, 520, 1.05], [L(5) + .6, 4380, 520, 1.05],
      [L(6) - .2, 4520, 520, 1.05], [L(6) + .6, 5240, 520, 1.05], [L(7) - .4, 5300, 520, 1.05]] },
    { t0: L(7) - .3, keys: [[L(7) - .3, 4420, 960, .78], [E(7) + .5, 4440, 960, .78]] },
    { t0: E(7) + .6, keys: [k(E(7) + .6, WIDE), k(L(8) - .4, WIDE, .295)] },
    { t0: L(8) - .3, keys: [[L(8) - .3, 4460, 960, .78], [T.wish - .1, 4500, 960, .78]] },
    { t0: T.wish, keys: [[T.wish, 3570, 980, .5], [T.truth + 1.0, 3570, 980, .51]] },
    { t0: Math.min(T.truth + 1.0, L(10) - .2), keys: [[Math.min(T.truth + 1.0, L(10) - .2), 1600, 980, .6], [L(11) - .4, 1600, 980, .6], [L(11) + .4, 1000, 960, .95], [L(13) + 2.6, 1240, 960, .95]] },
    { t0: L(14) - .25, keys: [[L(14) - .25, 1100, 1330, .95], [L(16) + .6, 1150, 1330, .95], [L(18), 1600, 1050, .6], [L(21) - .3, 1600, 1060, .6], [L(21) + .2, 2350, 1340, .95],
      [L(22) - .4, 2350, 1340, .95], [L(22) + .4, thC, 1330, 1.25], [L(23) - .3, thC, 1330, 1.3], [L(23) + .5, 1600, 850, .58], [E(23) + .4, 1600, 850, .59]] },
    { t0: E(23) + .5, keys: [k(E(23) + .5, WIDE), k(T.slide1 + .6, WIDE, .285)] },
    { t0: T.slide1 + .7, keys: [[T.slide1 + .7, 1600, 700, .85], [T.thread - .4, 1600, 700, .85]] },
    { t0: T.thread - .3, keys: [k(T.thread - .3, HERO), k(T.thread + 2.4, HERO, .43)] },
    { t0: T.thread + 2.5, keys: [[T.thread + 2.5, 1300, 1020, .85], [L(32) - .6, 1300, 1020, .85]] },
    { t0: L(32) - .4, keys: [[L(32) - .4, 2650, 1300, .4], [L(34) - .2, 2650, 1300, .4], [L(34) + .4, (FH0 + f1b.x) / 2 - 300, 1330, 1.0], [L(36) - .3, (FH0 + f1b.x) / 2 - 250, 1330, 1.0],
      k(L(36) + .4, HERO), k(L(39) - .3, HERO), [L(39) + .3, PW + 2500, 1350, .95], [L(40) - .3, PW + 2500, 1350, .95], [L(40) + .3, (FH0 + f1b.x) / 2 - 250, 1330, 1.0],
      [L(41) - .2, (FH0 + f1b.x) / 2 - 250, 1330, 1.0], k(L(41) + .5, HERO), k(T.back0 - .6, HERO, .43)] },
    { t0: T.back0 - .5, keys: [k(T.back0 - .5, WIDE), k(T.back1 + .3, WIDE)] },
    { t0: T.back1 + .4, keys: [[T.back1 + .4, 4800, 900, .75], [L(44) + 1.0, 4850, 900, .75]] },
    { t0: T.cred - .4, keys: [[T.cred - .4, 4900, 1380, .72], [T.wideEnd - .1, 4900, 1385, .72]] },
    { t0: T.wideEnd, keys: [[T.wideEnd, 3200, 720, .29], [T.DUR, 3200, 720, .28]] },
  ];
  shots.forEach((s, i) => s.t1 = i + 1 < shots.length ? shots[i + 1].t0 : 1e9);
  const camAt = tt => {
    let i = 0; while (i + 1 < shots.length && tt >= shots[i + 1].t0) i++;
    const K = shots[i].keys;
    let j = 0; while (j + 1 < K.length - 1 && tt > K[j + 1][0]) j++;
    const a = K[j], b = K[Math.min(K.length - 1, j + 1)], u = b[0] > a[0] ? eio(clamp((tt - a[0]) / (b[0] - a[0]))) : 1;
    return { cx: lerp(a[1], b[1], u), cy: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u), shot: i };
  };

  // ───────── subtitles: each sung line in Bangla with a free English translation, in and out with the voice
  const SUBS = LINES.map((l, i) => {
    const nx = i + 1 < LINES.length ? LINES[i + 1].t0 : 1e9;
    const t0 = l.t0 - .12, t1 = Math.min(nx - .08, Math.max(l.t1 + .3, t0 + 1.2));
    EV.push({ t: +t0.toFixed(3), type: 'sub', t1: +t1.toFixed(3), zh: l.bn, en: l.en });
    return { id: 'l' + i, t0, t1, zh: l.bn, en: l.en };
  });

  // ───────── chalk events for the sound: every stroke written on screen (dried-in strokes are silent)
  for (const st of S) {
    if (st.t1 <= 0 || st.t0 >= T.DUR || st.dried) continue;
    const c = camAt((st.t0 + st.t1) / 2), p = st.at(st.len / 2), x = p[0] + (st.layer === 'FL' ? slideX(st.t0) : 0);
    const sx = (x - c.cx) * c.s / W * 2;
    if (Math.abs(sx) > 1.3) continue;
    EV.push({ t: +st.t0.toFixed(3), type: 'chalk', d: +(st.t1 - st.t0).toFixed(3), len: Math.round(st.len * c.s), color: st.color, pan: +clamp(sx * .6, -.7, .7).toFixed(2), big: st.w > 9 ? 1 : 0 });
  }
  EV.sort((a, b) => a.t - b.t);
  return { S, TX, EV, SUBS, T, wet, wipe, slideX, camAt, shots, DUR: T.DUR, ROWC };
}
