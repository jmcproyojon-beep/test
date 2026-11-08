// Sets and props for «আরেকটু থাকো»: the picture house (hall, booth, pit), the projector, the upright piano, the clay tea cup,
// the ticket, the film can, the railway platform and train. Everything is a TONAL painting (grey = print density).
import { form, stroke, grey, rectPts, ellipsePts, mottle, catmull } from './engine/ink.js';
import { sky, contactShadow, rnd } from './sets.js';
export const W = 1440, H = 1080;
const loop = (p, n = 4) => catmull(p, true, n);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------- the projector (side view, lens to the right). returns the crank axis + lens tip
export function projector(g, x, y, k, crank, reel, o = {}) {
  // x,y = body top-left; k = scale; crank = crank angle (rad); reel = reel angle (rad)
  const P = (u, v) => [x + u * k, y + v * k];
  // stand: three legs
  form(g, [P(40, 220), P(60, 220), P(10, 560), P(-10, 560)], { v: .16, line: 2.2, seed: 801, shade: 3 });
  form(g, [P(200, 220), P(220, 220), P(260, 560), P(240, 560)], { v: .16, line: 2.2, seed: 802, shade: 3 });
  form(g, [P(120, 220), P(140, 220), P(135, 590), P(118, 590)], { v: .1, line: 2, seed: 803 });
  // lamp house (behind, left) with a chimney
  form(g, rectPts(...P(-150, -60), 140 * k, 190 * k), { v: .24, line: 2.4, grad: .2, seed: 804, shade: 6 });
  form(g, rectPts(...P(-110, -150), 60 * k, 92 * k), { v: .2, line: 2.2, seed: 805 });
  form(g, rectPts(...P(-130, -158), 100 * k, 14 * k), { v: .16, line: 2, seed: 806 });
  for (let i = 0; i < 4; i++) stroke(g, [P(-140, -30 + i * 30), P(-20, -30 + i * 30)], 1.4, { color: grey(.12), seed: 807 + i, alpha: .7 });
  if (o.lamp) { g.fillStyle = grey(.98, .8); g.fillRect(...P(-12, 20), 14 * k, 60 * k); }
  // body (the mechanism)
  form(g, rectPts(...P(0, 0), 240 * k, 220 * k), { v: .22, line: 2.6, grad: .22, seed: 808, shade: 7 });
  form(g, rectPts(...P(14, 14), 212 * k, 192 * k), { v: .3, line: 1.4, seed: 809 });
  // gate window + the lens barrel toward the port
  form(g, rectPts(...P(200, 70), 26 * k, 60 * k), { v: .9, line: 1.6, seed: 810 });
  form(g, [P(240, 80), P(400, 86), P(400, 114), P(240, 120)], { v: .3, line: 2.2, seed: 811, cyl: 0 });
  form(g, ellipsePts(...P(402, 100), 10 * k, 18 * k), { v: .75, line: 1.6, seed: 812 });
  // reels: feed (top) and take-up (bottom), spokes turn with `reel`
  const reelAt = (cx, cy, r, full, seed) => {
    form(g, ellipsePts(cx, cy, r, r, 0, 40), { v: .55, line: 2.4, grad: .15, seed, shade: 4 });
    form(g, ellipsePts(cx, cy, r * full, r * full, 0, 36), { v: .14, line: 1.6, hatch: .4, seed: seed + 1 });
    for (let i = 0; i < 3; i++) { const a = reel + i * Math.PI * 2 / 3; form(g, ellipsePts(cx + Math.cos(a) * r * .45, cy + Math.sin(a) * r * .45, r * .16, r * .16, 0, 18), { v: .8, line: 1.4, seed: seed + 2 + i }); }
    form(g, ellipsePts(cx, cy, r * .1, r * .1, 0, 14), { v: .6, line: 1.4, seed: seed + 6 });
  };
  const feed = o.feed ?? .85, take = o.take ?? .45;
  reelAt(...P(110, -150), 140 * k, Math.max(.2, feed) * .9, 820);
  reelAt(...P(110, 380), 140 * k, Math.max(.2, take) * .9, 830);
  // film path: feed reel → body → take-up reel
  stroke(g, [P(110 - 126 * feed, -150), P(-6, 30)], 2, { color: grey(.12), seed: 840 });
  stroke(g, [P(230, 210), P(110 + 126 * take, 380)], 2, { color: grey(.12), seed: 841 });
  // crank: a disc on the side facing us, its handle arm to the hand (drawn by the shot)
  const axis = P(60, 130);
  form(g, ellipsePts(axis[0], axis[1], 30 * k, 30 * k, 0, 24), { v: .45, line: 2, seed: 842 });
  return { axis, lens: P(404, 100), takeup: P(110, 380), feedC: P(110, -150), k };
}
export function crankArm(g, axis, hand) {
  stroke(g, [axis, hand], 7, { color: grey(.2), seed: 845 });
  g.fillStyle = grey(.6); g.beginPath(); g.arc(hand[0], hand[1], 7, 0, 7); g.fill();
}

// ---------------- the upright piano (seen from its keyboard end, 3/4 side) + optional key cover state
export function piano(g, x, y, k, o = {}) {
  // x,y = top-left of the case; keyboard toward the left (the player sits on the left)
  const P = (u, v) => [x + u * k, y + v * k];
  form(g, rectPts(...P(60, 0), 360 * k, 520 * k), { v: .2, line: 2.6, grad: .22, seed: 860, shade: 8 });          // case
  form(g, rectPts(...P(80, 30), 320 * k, 180 * k), { v: .26, line: 1.6, seed: 861 });                               // upper panel
  for (let i = 0; i < 3; i++) stroke(g, [P(110 + i * 100, 60), P(150 + i * 100, 180)], 1.2, { color: grey(.4), seed: 862 + i, alpha: .6 });
  form(g, rectPts(...P(80, 340), 320 * k, 160 * k), { v: .24, line: 1.6, seed: 866 });                              // lower panel
  // keyboard shelf, sticking out toward the player
  form(g, [P(-10, 250), P(60, 250), P(60, 300), P(-10, 300)], { v: .22, line: 2.2, seed: 867 });
  form(g, [P(-30, 236), P(60, 236), P(60, 252), P(-30, 252)], { v: o.cover ? .22 : .9, line: 1.6, seed: 868 });     // keys (or the closed fall-board)
  if (!o.cover) for (let i = 0; i < 7; i++) stroke(g, [P(-26 + i * 12, 238), P(-24 + i * 12, 250)], 1.1, { color: grey(.15), seed: 869 + i });
  // the music rest with a sheet of music
  form(g, [P(40, 140), P(60, 140), P(60, 240), P(30, 236)], { v: .18, line: 1.6, seed: 877 });
  form(g, [P(0, 150), P(52, 140), P(56, 230), P(4, 236)], { v: .92, line: 1.4, seed: 878 });
  for (let i = 0; i < 5; i++) stroke(g, [P(8, 160 + i * 14), P(48, 152 + i * 14)], .9, { color: grey(.4), seed: 879 + i, alpha: .8 });
  // legs + pedals
  form(g, rectPts(...P(-6, 300), 20 * k, 220 * k), { v: .18, line: 2, seed: 885 });
  for (let i = 0; i < 2; i++) form(g, rectPts(...P(70 + i * 30, 505), 16 * k, 8 * k), { v: .7, line: 1.2, seed: 886 + i });
  // a candle-holder lamp on the top
  if (o.lamp !== false) { form(g, rectPts(...P(260, -50), 16 * k, 50 * k), { v: .5, line: 1.4, seed: 888 }); form(g, ellipsePts(...P(268, -64), 22 * k, 26 * k), { v: .95, line: 1.4, seed: 889 }); }
  return { top: P(60, 0), keys: P(10, 240), shawl: P(150, -6) };
}

// ---------------- small props
export function clayCup(g, x, y, r, o = {}) {           // a bhaar: unglazed clay tea cup
  form(g, [[x - r, y - r * 1.2], [x + r, y - r * 1.2], [x + r * .7, y + r * .6], [x - r * .7, y + r * .6]], { v: .5, line: Math.max(1.2, r * .12), grad: .2, seed: 891, shade: r * .2 });
  form(g, ellipsePts(x, y - r * 1.2, r, r * .3, 0, 18), { v: .3, line: Math.max(1, r * .1), seed: 892 });
  if (o.steam) for (let i = 0; i < 2; i++) stroke(g, catmull([[x - r * .3 + i * r * .6, y - r * 1.5], [x - r * .5 + i * r * .6, y - r * 2.2], [x - r * .1 + i * r * .6, y - r * 2.9]], false, 6), Math.max(1, r * .1), { color: grey(.95), seed: 893 + i, alpha: .8 });
}
export function filmCan(g, x, y, r, rot = 0) {          // a round film can, seen at a slant
  form(g, ellipsePts(x, y, r, r * .55, rot, 30), { v: .62, line: Math.max(1.3, r * .07), grad: .3, seed: 895, shade: r * .12 });
  form(g, ellipsePts(x, y - r * .05, r * .82, r * .44, rot, 30), { v: .7, line: Math.max(1, r * .04), seed: 896 });
  form(g, ellipsePts(x, y - r * .05, r * .2, r * .11, rot, 16), { v: .4, line: 1, seed: 897 });
}
export function noteFold(g, x, y, s, rot = 0) {         // the folded note (the ticket inside)
  g.save(); g.translate(x, y); g.rotate(rot);
  form(g, [[-s, -s * .6], [s, -s * .66], [s * 1.04, s * .6], [-s * .96, s * .66]], { v: .93, line: Math.max(1, s * .1), seed: 898 });
  stroke(g, [[0, -s * .63], [0, s * .63]], Math.max(.8, s * .05), { color: grey(.6), seed: 899 });
  g.restore();
}
export function wallClock(g, x, y, r, hh, mm) {
  form(g, ellipsePts(x, y, r + 10, r + 10, 0, 40), { v: .22, line: 2.2, seed: 900, shade: 5 });
  form(g, ellipsePts(x, y, r, r, 0, 40), { v: .9, line: 1.6, grad: .1, seed: 901 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; stroke(g, [[x + Math.sin(a) * r * .8, y - Math.cos(a) * r * .8], [x + Math.sin(a) * r * .92, y - Math.cos(a) * r * .92]], 2, { seed: 902 + i }); }
  const am = mm / 60 * Math.PI * 2, ah = (hh + mm / 60) / 12 * Math.PI * 2;
  stroke(g, [[x, y], [x + Math.sin(ah) * r * .5, y - Math.cos(ah) * r * .5]], 5, { seed: 915 });
  stroke(g, [[x, y], [x + Math.sin(am) * r * .78, y - Math.cos(am) * r * .78]], 3, { seed: 916 });
  g.fillStyle = grey(.1); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
}
// the audience: a row of heads and shoulders (silhouettes). gone(i) → that seat is empty; dx(i) shifts a person (leaving)
export function audienceRow(g, x0, x1, y, s, seed, o = {}) {
  const n = Math.round((x1 - x0) / (s * 2.4));
  for (let i = 0; i < n; i++) {
    const x = x0 + (i + .5) * (x1 - x0) / n + (rnd(i, seed) - .5) * s * .4;
    form(g, [[x - s * 1.25, y + s * 1.6], [x - s * 1.1, y + s * .3], [x + s * 1.1, y + s * .3], [x + s * 1.25, y + s * 1.6]], { v: .2, line: 1.6, seed: seed * 10 + i });   // seat back
    if (o.gone && o.gone(i)) continue;
    const dx = o.dx ? o.dx(i) : 0, hx = x + dx, hy = y - s * .2 + (rnd(i, seed + 3) - .5) * s * .3;
    form(g, loop([[hx - s * 1.0, y + s * 1.0], [hx - s * .8, y - s * .1], [hx, y - s * .3], [hx + s * .8, y - s * .1], [hx + s * 1.0, y + s * 1.0]]), { v: .12, line: 1.4, seed: seed * 20 + i });
    form(g, ellipsePts(hx, hy - s * .55, s * .5, s * .6, 0, 20), { v: .1, line: 1.2, seed: seed * 30 + i });
    if (rnd(i, seed + 5) > .6) form(g, ellipsePts(hx, hy - s * .95, s * .7, s * .22, 0, 18), { v: .08, line: 1.1, seed: seed * 40 + i });   // a hat
  }
}

// ---------------- the railway platform at dawn + the train (x = locomotive front)
export function station(g, t) {
  sky(g, W, 620, 7, .9);
  // far roofs and a signal
  form(g, [[0, 560], [180, 520], [380, 540], [520, 500], [760, 530], [980, 505], [1200, 535], [1440, 520], [1440, 620], [0, 620]], { v: .72, line: 1.6, seed: 950 });
  form(g, rectPts(1330, 260, 12, 340), { v: .2, line: 1.6, seed: 951 }); form(g, rectPts(1300, 270, 70, 22), { v: .25, line: 1.6, seed: 952 });
  // the platform canopy on the left
  form(g, [[-20, 120], [620, 160], [620, 190], [-20, 160]], { v: .25, line: 2.4, seed: 953, shade: 5 });
  for (const px of [80, 300, 520]) form(g, rectPts(px, 175, 16, 600), { v: .2, line: 2, seed: 954 + px, cyl: -Math.PI / 2 });
  form(g, [[60, 300], [200, 300], [200, 360], [60, 360]], { v: .9, line: 2, seed: 960 });          // station board
  g.save(); g.font = '700 30px "Playfair Display SC"'; g.fillStyle = grey(.15); g.textAlign = 'center'; g.fillText('DACCA', 130, 342); g.restore();
  // track bed + platform
  form(g, [[0, 760], [W, 760], [W, 800], [0, 800]], { v: .4, line: 1.4, seed: 961 });
  form(g, [[0, 800], [W, 800], [W, H], [0, H]], { v: .7, line: 0, grad: .12, seed: 962 }); mottle(g, 0, 800, W, 280, .1, 4);
  form(g, [[0, 796], [W, 796], [W, 820], [0, 820]], { v: .88, line: 2, seed: 963 });
  for (let x = 0; x < W; x += 120) stroke(g, [[x, 820], [x - 40, H]], 1.1, { color: grey(.5), seed: 964 + x, alpha: .5 });
}
export function train(g, x, t, o = {}) {
  // locomotive front at x, coaches trailing to the left. returns window rects of coach 2 (for her)
  const y0 = 420, y1 = 780;
  // locomotive
  form(g, rectPts(x - 360, y0 + 60, 360, y1 - y0 - 80), { v: .14, line: 2.6, grad: .2, seed: 970, shade: 6 });
  form(g, rectPts(x - 360, y0 - 10, 160, 90), { v: .16, line: 2.4, seed: 971 });                    // cab
  form(g, rectPts(x - 120, y0 - 40, 50, 110), { v: .12, line: 2.2, seed: 972 });                    // chimney
  form(g, ellipsePts(x - 20, y0 + 180, 30, 60, 0, 24), { v: .2, line: 2, seed: 973 });
  for (const wx of [x - 300, x - 190, x - 80]) { form(g, ellipsePts(wx, y1 - 20, 46, 46, 0, 26), { v: .18, line: 2.2, seed: 974 + wx }); stroke(g, [[wx - 40, y1 - 20], [wx + 40, y1 - 20]], 3, { seed: 975 }); }
  // coaches
  const wins = [];
  for (let c = 0; c < 3; c++) {
    const cx1 = x - 380 - c * 620, cx0 = cx1 - 600;
    form(g, rectPts(cx0, y0 + 30, 600, y1 - y0 - 60), { v: .44, line: 2.4, grad: .18, seed: 980 + c, shade: 5 });
    form(g, [[cx0 - 10, y0 + 30], [cx1 + 10, y0 + 30], [cx1, y0 + 10], [cx0, y0 + 10]], { v: .2, line: 2, seed: 984 + c });
    for (let w = 0; w < 5; w++) {
      const wx = cx0 + 40 + w * 112, r = [wx, y0 + 90, 80, 100];
      form(g, rectPts(...r), { v: c === 1 && w === 2 ? .7 : .58, line: 1.8, seed: 990 + c * 5 + w });
      if (c === 1 && w === 2) wins.push(r);
    }
    for (const wx of [cx0 + 90, cx1 - 90]) form(g, ellipsePts(wx, y1 - 26, 34, 34, 0, 22), { v: .16, line: 2, seed: 1010 + wx });
  }
  return wins[0];
}
export function steam(g, x, y, t, n = 5, seed = 1) {
  for (let i = 0; i < n; i++) {
    const u = ((t * .35 + i / n) % 1), r = 30 + u * 120;
    form(g, ellipsePts(x - u * 260 + (rnd(i, seed) - .5) * 60, y - u * 260, r, r * .7, 0, 24), { v: .96, line: 1.2, grad: .1, seed: 1030 + i, fill: true });
  }
}

// ---------------- the film on the screen: two figures walk toward each other in front of a window (drawn by the shot)
export function screenBg(g, w, h) {
  g.fillStyle = grey(.86); g.fillRect(0, 0, w, h);
  form(g, rectPts(w * .36, h * .14, w * .28, h * .44), { v: .62, line: 2, seed: 1050 });      // a tall window behind them
  form(g, rectPts(w * .38, h * .17, w * .24, h * .38), { v: .95, line: 1.4, seed: 1051 });
  stroke(g, [[w * .5, h * .17], [w * .5, h * .55]], 3, { seed: 1052 }); stroke(g, [[w * .38, h * .36], [w * .62, h * .36]], 3, { seed: 1053 });
  form(g, [[0, h * .78], [w, h * .78], [w, h], [0, h]], { v: .66, line: 1.4, seed: 1054 });
}
export { lerp };
