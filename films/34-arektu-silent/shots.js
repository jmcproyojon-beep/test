// «আরেকটু থাকো» — shots. Each paints a TONAL 4:3 frame (1440×1080, grey = print density); film.js inks and prints it.
// shot(g, lt, t): lt = seconds since the section started (hand-cranked), t = film time.
import { drawFigure, P0, walkPose, walkBob, runPose, runBob, mixPose, solve, projector as proj3, BODY } from './engine/figure.js';
import { form, stroke, grey, rectPts, ellipsePts, mottle, catmull } from './engine/ink.js';
import { contactShadow, rnd } from './sets.js';
import { EXPR } from './poses.js';
import { HIM, HER } from './cast.js';
import { projector, crankArm, piano, clayCup, filmCan, noteFold, wallClock, audienceRow, station, train, steam, screenBg, W, H } from './props.js';
import { SEC, HIT } from './timeline.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const seg = (x, a, b) => clamp((x - a) / (b - a));
const clone = p => mixPose(p, p, 0);
// eased keyframes (no pose pops): keys [[time, value]] with value a pose or fn(time) → pose
function poseAt(x, keys) {
  const val = v => typeof v === 'function' ? v(x) : v;
  if (x <= keys[0][0]) return clone(val(keys[0][1]));
  for (let i = 1; i < keys.length; i++) if (x < keys[i][0]) { const [a, A] = keys[i - 1], [b, B] = keys[i]; return mixPose(val(A), val(B), ss((x - a) / (b - a))); }
  return clone(val(keys[keys.length - 1][1]));
}
function numAt(x, keys, e = ss) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (x < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i]; return lerp(va, vb, e((x - a) / (b - a))); }
  return keys[keys.length - 1][1];
}
// where a figure's hand is (screen px), same placement as drawFigure
function handAt(ch, opt, side = 'R') {
  const B = BODY[ch.body || 'adult'], J = solve(opt.pose, B), s = opt.scale;
  const low = Math.min(J.legs.L.sole[1], J.legs.R.sole[1], J.legs.L.toe[1], J.legs.R.toe[1], J.legs.L.heel[1], J.legs.R.heel[1]);
  const pr = proj3(opt.x, opt.ground + low * s, s, opt.yaw);
  return { hand: pr.P(J.arms[side].hand), head: pr.P(J.head) };
}
const HER_SIT = { ...HER, skirt: null, leg: { v: .88, w: [.62, .52, .42] } };     // seated, the sari falls over the knees: no hanging skirt panel
const fig = (g, ch, o) => drawFigure(g, ch === HER && o.pose.L.hip > .9 ? HER_SIT : ch, o);

// ---------------- poses ----------------
const DEAD = EXPR.deadpan, SOFT = { open: .62, brow: .4, browA: .7, smile: .45, look: [0, -.2] }, SMILE = { open: .55, brow: .35, browA: .6, smile: .8, look: [-.2, -.5] };
const UPLOOK = { open: .85, brow: .5, browA: .4, smile: .1, look: [-.2, -.7] }, SAD = { open: .7, brow: .5, browA: .9, smile: -.25, look: [0, .3] };
function stand(e = DEAD) { const p = P0(); p.expr = e; return p; }
function crank(ph, k = 1, e = DEAD) {          // right hand on the crank handle, turning; the left on the machine
  const p = P0(); p.lean = .08; p.nod = .05;
  p.aR = { fl: .95 + .26 * Math.sin(ph) * k, abd: .12, el: .95 + .32 * Math.cos(ph) * k, wr: .2, hand: 'grip' };
  p.aL = { fl: .7, abd: .1, el: .9, wr: .1, hand: 'relax' };
  p.L = { hip: .08, abd: .1, knee: .12, ankle: 0 }; p.R = { hip: -.12, abd: .06, knee: .05, ankle: 0 };
  p.expr = e; return p;
}
function sit(ph = 0, playK = 1, e = DEAD) {     // at the piano; hands on the keys, wrists bob with the music
  const p = P0(); p.lean = .1; p.nod = .12;
  p.L = { hip: 1.45, abd: .08, knee: 1.45, ankle: .1 }; p.R = { hip: 1.4, abd: .1, knee: 1.5, ankle: .05 };
  const b = Math.sin(ph) * .06 * playK, c = Math.cos(ph * 1.3) * .06 * playK;
  p.aL = { fl: .95 + b, abd: .14, el: .9 - b, wr: .25, hand: 'relax' }; p.aR = { fl: .92 + c, abd: .12, el: .95 - c, wr: .25, hand: 'relax' };
  p.expr = e; return p;
}
function reach(e = DEAD) { const p = P0(); p.lean = .12; p.aR = { fl: 1.35, abd: .08, el: .12, wr: 0, hand: 'open' }; p.expr = e; return p; }
function fist(e = DEAD) { const p = reach(e); p.aR.hand = 'fist'; p.aR.el = .3; p.nod = .25; return p; }
function wave(ph, e = SOFT) { const p = P0(); p.aR = { fl: 2.5, abd: .55, el: .45 + .3 * Math.sin(ph), wr: .2, hand: 'open' }; p.expr = e; return p; }
function kneesBent(e = DEAD) { const p = P0(); p.lean = .75; p.nod = -.3; p.L = { hip: .65, abd: .1, knee: .7, ankle: .2 }; p.R = { hip: .6, abd: .1, knee: .7, ankle: .2 };
  p.aL = { fl: .75, abd: .15, el: .15, wr: 0, hand: 'open' }; p.aR = { ...p.aL }; p.expr = e; return p; }
function holdUp(e = SOFT) { const p = P0(); p.nod = -.25; p.aL = { fl: 1.9, abd: .35, el: .7, wr: .2, hand: 'grip' }; p.aR = { fl: 1.9, abd: .35, el: .7, wr: .2, hand: 'grip' }; p.expr = e; return p; }
const walk = (ph, e = DEAD) => { const p = walkPose(ph, .9); p.expr = e; return p; };
const run = (ph, e = DEAD) => { const p = runPose(ph, 1); p.expr = e; return p; };

// ---------------- the film on the screen: projector speed → film time (freeze, rewind) ----------------
function speed(t) {
  if (t < HIT.slow) return 1;
  if (t < 90.9) return lerp(1, .3, (t - HIT.slow) / (90.9 - HIT.slow));
  if (t < HIT.freeze) return lerp(.3, 0, (t - 90.9) / (HIT.freeze - 90.9));
  if (t < HIT.rewind) return 0;
  if (t < HIT.rewind + .8) return lerp(0, -1.6, (t - HIT.rewind) / .8);
  if (t < SEC.CARD3.t0) return -1.6;
  return 0;
}
const FT = []; { let a = 0; for (let i = 0; i <= 3000; i++) { FT.push(a); a += speed(i * .05) * .05; } }
const ftRaw = t => { const i = clamp(t / .05, 0, 2999), k = Math.floor(i); return lerp(FT[k], FT[k + 1], i - k); };
const LOOPF = 8, OFF = (() => { const r = ftRaw(HIT.freeze); return LOOPF * .94 - (((r % LOOPF) + LOOPF) % LOOPF); })();
export const filmTime = t => ftRaw(t) + OFF;
export const crankRate = t => speed(t);       // the projector's speed (also drives the crank and the reels)
const INNER_MAN = { ...HIM, name: 'Actor', vest: { v: .1, shoulder: .6, bottom: .72 }, arm: { v: .12, w: [.38, .33, .28], sleeve: 1 }, leg: { v: .1, w: [.54, .44, .38], folds: true } };
const ic = document.createElement('canvas'); ic.width = 720; ic.height = 540; const ig = ic.getContext('2d');
function innerFilm(t, mode = 'walk') {
  ig.setTransform(1, 0, 0, 1, 0, 0);
  const w = 720, h = 540;
  screenBg(ig, w, h);
  if (mode === 'portrait') {                    // the one frame she left him: her at the piano, smiling
    piano(ig, 380, 150, .62);
    fig(ig, HER, { x: 300, ground: 490, scale: 46, yaw: 55, pose: (() => { const p = sit(0, 0, SMILE); p.headTurn = -.5; p.nod = -.05; return p; })(), t });
    return ic;
  }
  const ft = filmTime(t), ph = ((ft % LOOPF) + LOOPF) % LOOPF, u = ph / LOOPF, s = 52;
  const xm = lerp(w * .06, w * .43, u), xw = lerp(w * .94, w * .57, u);
  fig(ig, INNER_MAN, { x: xm, ground: h * .93, scale: s, yaw: 85, pose: walk(ft * .55, SOFT), t });
  fig(ig, HER, { x: xw, ground: h * .93, scale: s * .96, yaw: -85, pose: walk(ft * .55 + .5, SOFT), t });
  return ic;
}
function drawInto(g, src, tl, tr, bl) {          // map a canvas onto a parallelogram (the screen seen at an angle)
  const w = src.width, h = src.height;
  g.save(); g.transform((tr[0] - tl[0]) / w, (tr[1] - tl[1]) / w, (bl[0] - tl[0]) / h, (bl[1] - tl[1]) / h, tl[0], tl[1]); g.drawImage(src, 0, 0); g.restore();
}

// ============ THE HALL (wide, 3/4 from the back-left: the booth port high left, the screen on the right wall, the piano under it)
const PORT = [150, 170, 100, 74], SCR = { tl: [960, 96], tr: [1400, 46], bl: [960, 560], br: [1400, 600] };
function hallSet(g, t, o = {}) {
  const lit = o.lit ?? 0;                      // house lights (0 = show, 1 = lights up)
  g.fillStyle = grey(lerp(.36, .58, lit)); g.fillRect(0, 0, W, H);
  // ceiling + back wall with pilasters
  form(g, [[0, 0], [W, 0], [W, 40], [0, 130]], { v: lerp(.3, .48, lit), line: 1.6, seed: 1101 });
  for (let i = 0; i < 4; i++) form(g, rectPts(330 + i * 160, 120 - i * 18, 40, 560 + i * 18), { v: lerp(.44, .6, lit), line: 1.6, seed: 1102 + i, cyl: -Math.PI / 2 });
  mottle(g, 0, 0, W, 700, .08, 11);
  // the booth wall + its port
  form(g, rectPts(0, 0, 290, 760), { v: lerp(.32, .5, lit), line: 2.2, seed: 1110, shade: 6 });
  form(g, rectPts(...PORT), { v: o.portDark ? .3 : .97, line: 2, seed: 1111 });
  // screen frame on the right wall (seen at an angle) + the proscenium
  form(g, [[SCR.tl[0] - 30, SCR.tl[1] - 30], [SCR.tr[0] + 40, SCR.tr[1] - 36], [SCR.br[0] + 40, SCR.br[1] + 40], [SCR.bl[0] - 30, SCR.bl[1] + 30]], { v: .12, line: 2.4, seed: 1112, shade: 6 });
  if (o.screen) drawInto(g, o.screen, SCR.tl, SCR.tr, SCR.bl);
  else form(g, [SCR.tl, SCR.tr, SCR.br, SCR.bl], { v: o.white ? .99 : .9, line: 1.6, seed: 1113 });
  // the stage front / pit floor
  form(g, [[700, 640], [W, 600], [W, 700], [700, 720]], { v: lerp(.3, .46, lit), line: 2, seed: 1114 });
  form(g, [[0, 700], [W, 640], [W, H], [0, H]], { v: lerp(.4, .56, lit), line: 0, seed: 1115 });
  // the beam from the port to the screen (only while the show runs)
  if (!o.noBeam) {
    g.save(); g.globalAlpha = o.beam ?? .16; g.fillStyle = grey(.98);
    g.beginPath(); g.moveTo(PORT[0] + PORT[2], PORT[1] + 10); g.lineTo(SCR.tl[0], SCR.tl[1]); g.lineTo(SCR.bl[0], SCR.bl[1]); g.lineTo(PORT[0] + PORT[2], PORT[1] + PORT[3] - 10); g.closePath(); g.fill();
    g.globalAlpha = (o.beam ?? .16) * 1.4; for (let i = 0; i < 30; i++) { const u = rnd(i, 3), v = rnd(i, 4); const x = lerp(PORT[0] + 100, SCR.tl[0], u), y = lerp(PORT[1] + 30, lerp(SCR.tl[1], SCR.bl[1], v), u); g.fillRect(x + Math.sin(t * .7 + i) * 8, y + Math.cos(t * .5 + i) * 6, 2.5, 2.5); }
    g.restore();
  }
}
const HALL_PIANO = [1050, 470, .5];
function hallPianist(g, t, pose, x = 1010) {
  fig(g, HER, { x, ground: 760, scale: 34, yaw: 70, pose, t });
}
function portBust(g, t, pose) {                 // him in the port window, head and shoulders
  g.save(); g.beginPath(); g.rect(...PORT); g.clip();
  fig(g, HIM, { x: PORT[0] + 50, ground: PORT[1] + 260, scale: 34, yaw: 55, pose, t });
  g.restore();
  form(g, rectPts(PORT[0] - 8, PORT[1] + PORT[3], PORT[2] + 16, 10), { v: .3, line: 1.4, seed: 1120 });
}
function rows(g, s, o = {}) {
  for (let r = 0; r < 5; r++) { const y = 760 + r * 70, x0 = 260 - r * 60, x1 = 980 + r * 70; audienceRow(g, x0, x1, y, s + r * 2.4, 40 + r, { gone: o.gone ? (i => o.gone(r, i)) : null, dx: o.dx ? (i => o.dx(r, i)) : null }); }
}
export function hall1(g, lt, t) {
  hallSet(g, t, { screen: innerFilm(t) });
  piano(g, ...HALL_PIANO);
  hallPianist(g, t, sit(t * 6));
  portBust(g, t, crank(t * 11));
  rows(g, 16);
}
// the chain in one take: a clay cup slides down the string from the port to the piano; she catches it without looking;
// a note goes back up
const STR = { a: [PORT[0] + PORT[2] - 4, PORT[1] + PORT[3] - 8], b: [1080, 470] };
const strAt = u => { const x = lerp(STR.a[0], STR.b[0], u), y = lerp(STR.a[1], STR.b[1], u) + Math.sin(u * Math.PI) * 70; return [x, y]; };
export function tea(g, lt, t) {
  hallSet(g, t, { screen: innerFilm(t) });
  stroke(g, catmull(Array.from({ length: 9 }, (_, i) => strAt(i / 8)), false, 6), 1.6, { color: grey(.85), seed: 1130 });
  piano(g, ...HALL_PIANO);
  // the cup: hung at hang, released at release, eases into the sag, wobbles (the wait), slides on, caught at catch
  const u = t < HIT.release ? .02 : t < HIT.sag ? lerp(.02, .55, ss((t - HIT.release) / (HIT.sag - HIT.release))) : t < HIT.sag + 1.2 ? .55 : t < HIT.catch ? lerp(.55, .97, ss((t - HIT.sag - 1.2) / (HIT.catch - HIT.sag - 1.2))) : 1;
  const wob = t > HIT.sag && t < HIT.sag + 1.2 ? Math.sin((t - HIT.sag) * 22) * .18 * (1 - (t - HIT.sag) / 1.2) : 0;
  // she: playing; at catch her left hand goes up (no look); she sips; then folds a note and sends it up
  const pp = poseAt(t, [[HIT.catch - .6, sit(t * 6)], [HIT.catch - .1, (() => { const p = sit(t * 6, .4); p.aL = { fl: 1.6, abd: .3, el: .9, wr: .2, hand: 'grip' }; return p; })()],
    [HIT.sip, (() => { const p = sit(0, 0); p.aL = { fl: 1.2, abd: .2, el: 2.0, wr: .4, hand: 'grip' }; p.nod = -.1; return p; })()], [HIT.noteUp - .3, (() => { const p = sit(0, 0); p.aL = { fl: 1.7, abd: .3, el: .8, wr: .2, hand: 'grip' }; return p; })()],
    [HIT.noteUp + .6, sit(t * 6)]]);
  hallPianist(g, t, pp);
  if (t < HIT.catch) {
    const [x, y] = strAt(u);
    g.save(); g.translate(x, y); g.rotate(wob); stroke(g, [[0, 0], [0, 16]], 1.4, { seed: 1131 }); clayCup(g, 0, 30, 15, { steam: true }); g.restore();
  } else if (t < HIT.noteUp) {
    const h = handAt(HER, { x: 1010, ground: 760, scale: 34, yaw: 70, pose: pp }, 'L').hand; clayCup(g, h[0], h[1], 12, { steam: t < HIT.sip + 1 });
  }
  if (t > HIT.noteUp) { const v = lerp(.97, .02, ss((t - HIT.noteUp) / (HIT.noteIn - HIT.noteUp))); const [x, y] = strAt(v); stroke(g, [[x, y], [x, y + 12]], 1.2, { seed: 1132 }); noteFold(g, x, y + 22, 13, .2); }
  // him in the port: hangs the cup, watches it go, then (late) takes the note
  const bp = poseAt(t, [[HIT.hang - .5, crank(t * 11)], [HIT.hang, (() => { const p = stand(); p.aR = { fl: 1.4, abd: .3, el: .6, wr: 0, hand: 'grip' }; return p; })()],
    [HIT.release + .4, (() => { const p = stand(); p.headTurn = .3; p.nod = .25; return p; })()], [HIT.catch + 1, crank(t * 11)], [HIT.noteIn - .4, crank(t * 11)],
    [HIT.noteIn, (() => { const p = stand(); p.aR = { fl: 1.4, abd: .3, el: .6, wr: 0, hand: 'grip' }; return p; })()]]);
  portBust(g, t, bp);
  rows(g, 16);
}
export function hall2(g, lt, t) {               // the screen frozen; she stops, turns on the bench toward the booth
  hallSet(g, t, { screen: innerFilm(t) });
  piano(g, ...HALL_PIANO);
  const p = poseAt(t, [[HIT.turn - .6, sit(t * 6, .2)], [HIT.turn + .6, (() => { const q = sit(0, 0, UPLOOK); q.headTurn = -.9; q.nod = -.25; q.aL.fl = .5; q.aR.fl = .45; return q; })()]]);
  hallPianist(g, t, p);
  portBust(g, t, crank(0, 0));
  rows(g, 16, { dx: (r, i) => 0 });
}
export function empty(g, lt, t) {               // lights up, the white screen, the audience leaves (each row in turn)
  const lit = ss(lt / 2.5);
  hallSet(g, t, { lit, white: true, beam: .1 * (1 - lit) });
  piano(g, ...HALL_PIANO);
  hallPianist(g, t, sit(0, 0, SAD));
  portBust(g, t, stand());
  rows(g, 16, { dx: (r, i) => -Math.max(0, lt - 1.5 - r * .9 - i * .15) * 260, gone: (r, i) => lt - 1.5 - r * .9 - i * .15 > 4 });
}
export function aisle(g, lt, t) {               // he comes down the side aisle, through the empty hall, to the piano
  hallSet(g, t, { lit: 1, noBeam: true, portDark: true, white: true });
  rows(g, 16, { gone: () => true });
  piano(g, ...HALL_PIANO, { cover: true });
  const p = stand(SAD); p.aL = { fl: .1, abd: .1, el: .2, wr: 0, hand: 'relax' };
  fig(g, HER, { x: 1000, ground: 760, scale: 26, yaw: -30, pose: p, t });
  const u = ss(lt / 4.2), x = lerp(240, 880, u), y = lerp(1000, 790, u), sc = lerp(46, 28, u);
  fig(g, HIM, { x, ground: y + walkBob(lt * 1.6, sc), scale: sc, yaw: 60, pose: u < 1 ? walk(lt * 1.6) : stand(), t });
}
export function frameShot(g, lt, t) {           // the empty hall, lights down; on the screen, the one frame of her, held
  hallSet(g, t, { screen: innerFilm(t, 'portrait'), beam: .2 });
  rows(g, 16, { gone: () => true });
  piano(g, ...HALL_PIANO, { cover: true });
  portBust(g, t, (() => { const p = crank(0, 0, SOFT); p.nod = .2; return p; })());
}

// ============ THE PIT (medium: she at the upright piano under the screen)
function pitSet(g, t, o = {}) {
  g.fillStyle = grey(.4); g.fillRect(0, 0, W, H);
  // the bottom of the screen, above: the film runs there
  if (o.screen) { g.save(); g.beginPath(); g.rect(160, 0, 1280, 300); g.clip(); g.drawImage(o.screen, 0, 140, 720, 400, 160, -40, 1280, 711); g.restore(); }
  else form(g, rectPts(160, 0, 1280, 300), { v: o.white ? .99 : .9, line: 0, seed: 1201 });
  form(g, rectPts(120, 296, 1340, 26), { v: .1, line: 2, seed: 1202 });
  form(g, rectPts(0, 320, W, 420), { v: .38, line: 1.4, seed: 1203 }); mottle(g, 0, 320, W, 420, .06, 7);     // the stage front (dark wood)
  for (let x = 40; x < W; x += 160) stroke(g, [[x, 330], [x, 730]], 1.2, { color: grey(.3), seed: 1204 + x, alpha: .6 });
  form(g, [[0, 740], [W, 740], [W, H], [0, H]], { v: .52, line: 1.6, seed: 1210 });
  // glow of the screen on the stage front
  const gr = g.createLinearGradient(0, 300, 0, 700); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 300, W, 400);
}
const PIT = { px: 840, py: 380, pk: 1.05, bx: 640, ground: 960, s: 64 };
function pitPiano(g, o = {}) { const p = piano(g, PIT.px, PIT.py, PIT.pk, o); form(g, rectPts(500, 822, 300, 22), { v: .2, line: 2, seed: 1220 }); for (const lx of [520, 760]) form(g, rectPts(lx, 840, 16, 120), { v: .16, line: 1.6, seed: 1221 + lx }); return p; }
const herPit = (pose, x = PIT.bx) => ({ x, ground: PIT.ground, scale: PIT.s, yaw: 78, pose });
export function pit1(g, lt, t) {
  pitSet(g, t, { screen: innerFilm(t) });
  pitPiano(g);
  // she plays; twice she glances up and back, toward the booth
  const gl = k => { const p = sit(t * 6, .6, SOFT); p.headTurn = -.7 * k; p.nod = -.25 * k; return p; };
  const p = poseAt(lt, [[0, sit(t * 6)], [3.6, sit(t * 6)], [4.2, gl(1)], [5.6, gl(1)], [6.2, sit(t * 6)]]);
  fig(g, HER, { ...herPit(p), t });
  audienceRow(g, -40, 560, 1010, 34, 71);
}
export function pit2(g, lt, t) {                // the film above her slows; she feels it in the music; looks up
  pitSet(g, t, { screen: innerFilm(t) });
  pitPiano(g);
  const k = ss((lt - 4) / 1.2);
  const p = mixPose(sit(t * 6 * speed(t), 1), (() => { const q = sit(t * 3, .3, UPLOOK); q.nod = -.45; q.headTurn = -.2; return q; })(), k);
  fig(g, HER, { ...herPit(p), t });
  audienceRow(g, -40, 560, 1010, 34, 71);
}
export function look(g, lt, t) {                // she turns on the bench toward the booth (behind us) and smiles
  pitSet(g, t, { screen: innerFilm(t) });
  pitPiano(g);
  const p = poseAt(t, [[SEC.LOOK.t0, (() => { const q = sit(0, 0, UPLOOK); q.headTurn = -.9; q.nod = -.25; return q; })()], [HIT.smile, (() => { const q = sit(0, 0, SMILE); q.headTurn = -1.1; q.nod = -.3; q.headTilt = .1; return q; })()]]);
  fig(g, HER, { ...herPit(p), yaw: 55, t });
}
export const herFaceLook = () => handAt(HER, { ...herPit((() => { const q = sit(0, 0, SMILE); q.headTurn = -1.1; q.nod = -.3; return q; })()), yaw: 55 }).head;
export function lid(g, lt, t) {                 // she lowers the fall-board, stands, takes her shawl from the piano
  pitSet(g, t, { white: true });
  const closed = t > HIT.lidDown;
  pitPiano(g, { cover: closed, lamp: true });
  const p = poseAt(t, [[SEC.LID.t0, sit(0, 0, SAD)], [HIT.lidDown - .5, (() => { const q = sit(0, 0, SAD); q.aR = { fl: 1.1, abd: .1, el: .5, wr: .2, hand: 'grip' }; return q; })()],
    [HIT.lidDown + .2, sit(0, 0, SAD)], [HIT.lidDown + 1.6, (() => { const q = stand(SAD); q.lean = .05; return q; })()],
    [HIT.lidDown + 3, (() => { const q = stand(SAD); q.aR = { fl: 1.5, abd: .2, el: .4, wr: 0, hand: 'grip' }; return q; })()],
    [HIT.lidDown + 4.4, (() => { const q = stand(SAD); q.aR = { fl: .9, abd: .5, el: 1.8, wr: 0, hand: 'grip' }; q.aL = { fl: .9, abd: .4, el: 1.7, wr: 0, hand: 'grip' }; return q; })()]]);
  const x = numAt(t, [[HIT.lidDown + .2, PIT.bx], [HIT.lidDown + 1.6, PIT.bx + 60]]);
  fig(g, HER, { x, ground: PIT.ground, scale: PIT.s, yaw: numAt(t, [[HIT.lidDown + .2, 78], [HIT.lidDown + 1.6, 30]]), pose: p, t });
  if (t < HIT.lidDown + 3.4) { form(g, [[1000, 360], [1180, 352], [1190, 384], [1000, 388]], { v: .62, line: 1.6, seed: 1240 }); }   // the folded shawl on the piano
}
export function miss(g, lt, t) {                // the near-miss: his hand closes where hers rested a frame ago
  pitSet(g, t, { white: true });
  pitPiano(g, { cover: true });
  const herOn = t < HIT.miss;                   // her hand on the piano lid until the very frame he arrives
  const hp = herOn ? (() => { const q = stand(SAD); q.aR = { fl: 1.25, abd: .15, el: .35, wr: .3, hand: 'relax' }; q.headTurn = .2; return q; })()
    : poseAt(t, [[HIT.miss, (() => { const q = stand(SAD); q.aR = { fl: 1.6, abd: .3, el: 1.6, wr: 0, hand: 'grip' }; return q; })()], [HIT.miss + 1.2, (() => { const q = stand(SAD); q.aR = { fl: .9, abd: .5, el: 1.8, wr: 0, hand: 'grip' }; q.aL = { fl: .9, abd: .4, el: 1.7, wr: 0, hand: 'grip' }; return q; })()]]);
  fig(g, HER, { x: 760, ground: PIT.ground, scale: PIT.s, yaw: 40, pose: hp, t });
  const mp = poseAt(t, [[SEC.MISS.t0, walk(lt * 1.6, SAD)], [HIT.reach - 1, stand(SAD)], [HIT.reach, reach(SAD)], [HIT.miss + .1, fist(SAD)], [HIT.miss + 1.5, fist(SAD)],
    [HIT.miss + 2.2, (() => { const q = fist(DEAD); q.nod = .45; q.aR.fl = .9; q.aR.el = 1.2; return q; })()]]);
  const x = numAt(t, [[SEC.MISS.t0, 120], [HIT.reach - 1, 470]]);
  fig(g, HIM, { x, ground: PIT.ground + 10, scale: PIT.s * 1.03, yaw: 80, pose: mp, t });
}
export function door(g, lt, t) {                // she walks out to the right; he stays where he is
  pitSet(g, t, { white: true });
  pitPiano(g, { cover: true });
  const x = numAt(lt, [[.4, 760], [3.4, 1600]], x => x);
  const p = walk(lt * 1.5, SAD); p.aR = { fl: .9, abd: .5, el: 1.8, wr: 0, hand: 'grip' }; p.aL = { fl: .9, abd: .4, el: 1.7, wr: 0, hand: 'grip' };
  fig(g, HER, { x, ground: PIT.ground + walkBob(lt * 1.5, PIT.s), scale: PIT.s, yaw: 85, pose: lt < .4 ? stand(SAD) : p, t });
  fig(g, HIM, { x: 470, ground: PIT.ground + 10, scale: PIT.s * 1.03, yaw: 70, pose: stand(DEAD), t });
}

// ============ THE BOOTH (medium: him at the projector, the port on the right)
const PJ = { x: 720, y: 400, k: 1.0 };
function boothSet(g, t, o = {}) {
  g.fillStyle = grey(.48); g.fillRect(0, 0, W, H); mottle(g, 0, 0, W, H, .07, 21);
  for (let y = 40; y < 900; y += 46) stroke(g, [[0, y], [W, y + 4]], 1, { color: grey(.22), seed: 1300 + y, alpha: .5 });   // brick courses
  form(g, [[0, 880], [W, 880], [W, H], [0, H]], { v: .56, line: 1.6, seed: 1301 });
  // the port (bright: the screen far away) + the beam out of the lens
  form(g, rectPts(1230, 400, 170, 110), { v: o.white ? 1 : .97, line: 2.4, seed: 1302 });
  if (!o.dark) { g.save(); g.globalAlpha = .14; g.fillStyle = grey(1); g.beginPath(); g.moveTo(1130, 490); g.lineTo(1240, 405); g.lineTo(1240, 505); g.closePath(); g.fill(); g.restore(); }
  // shelf of film cans, the wall clock, a bare bulb
  form(g, rectPts(60, 420, 340, 18), { v: .45, line: 1.8, seed: 1303 });
  for (let i = 0; i < 4; i++) filmCan(g, 110 + i * 78, 404, 34);
  wallClock(g, 230, 200, 74, o.hh ?? 8, o.mm ?? 40);
  stroke(g, [[480, 0], [480, 120]], 2, { seed: 1304 }); form(g, ellipsePts(480, 140, 22, 28, 0, 20), { v: .97, line: 1.6, seed: 1305 });
  const gr = g.createRadialGradient(480, 140, 10, 480, 140, 520); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
const CA = []; { let a = 0; for (let i = 0; i <= 5000; i++) { CA.push(a); a += speed(i * .05) * .05 * 2 * Math.PI * 1.6; } }
const angAt = t => CA[clamp(Math.floor(t / .05), 0, 5000)];
function boothMachine(g, t, himPose, o = {}) {
  const ang = o.ang ?? angAt(t);
  const P = projector(g, PJ.x, PJ.y, PJ.k, ang, ang * .5, { lamp: !o.dark, feed: o.feed ?? lerp(.9, .3, clamp(t / 124)), take: o.take ?? lerp(.3, .9, clamp(t / 124)) });
  const opt = { x: 560, ground: 960, scale: 78, yaw: 70, pose: himPose, t };
  fig(g, HIM, opt);
  if (o.onCrank !== false) crankArm(g, P.axis, handAt(HIM, opt).hand);
  return P;
}
export function booth1(g, lt, t) {              // he cranks; glances down through the port; a small smile, then deadpan again
  boothSet(g, t);
  const a = angAt(t);
  const look = k => { const p = crank(a, 1, k > .5 ? SOFT : DEAD); p.headTurn = .5 * k; p.nod = .3 * k; return p; };
  boothMachine(g, t, poseAt(lt, [[0, crank(a)], [4.5, crank(a)], [5.2, look(1)], [7.4, look(1)], [8.2, crank(a)]]));
}
export function booth2(g, lt, t) {              // the ticket in his left hand; he looks at the clock; he cranks slower
  boothSet(g, t, { hh: 8, mm: 52 });
  const a = angAt(t);
  const atClock = (() => { const p = crank(a); p.headTurn = -.9; p.nod = -.15; return p; })();
  boothMachine(g, t, poseAt(lt, [[0, (() => { const p = stand(SAD); p.aL = { fl: 1.1, abd: .1, el: 1.2, wr: .2, hand: 'grip' }; p.nod = .35; return p; })()], [2.4, crank(a)], [3.5, atClock], [6.5, atClock], [7.6, crank(a)]]));
}
export function booth3(g, lt, t) {              // he stops the crank and holds it
  boothSet(g, t, { hh: 8, mm: 58 });
  const a = angAt(t);
  boothMachine(g, t, (() => { const p = crank(a, 1); p.lean = .14; p.nod = .2; return p; })());
}
export function booth4(g, lt, t) {              // he winds the film back (the crank turns the other way)
  boothSet(g, t, { hh: 9, mm: 0 });
  boothMachine(g, t, (() => { const p = crank(angAt(t), 1.2); p.lean = .16; return p; })());
}
export function runout(g, lt, t) {              // the reel runs out: the tail of the film flaps on the take-up reel
  boothSet(g, t, { white: true, hh: 9, mm: 5 });
  const a = 30 + lt * 30;
  const P = boothMachine(g, t, (() => { const p = stand(DEAD); p.headTurn = .2; p.nod = .2; return p; })(), { ang: a, onCrank: false, feed: .05, take: .95 });
  const [cx, cy] = P.takeup, fl = Math.floor(t * 16) % 2;
  for (let i = 0; i < 2; i++) { const b = a * 1.3 + i * Math.PI; stroke(g, [[cx + Math.cos(b) * 130, cy + Math.sin(b) * 130], [cx + Math.cos(b + .4) * (190 + fl * 30), cy + Math.sin(b + .4) * (190 + fl * 30)]], 3, { color: grey(.12), seed: 1350 + i }); }
}
export function alone(g, lt, t) {               // the booth, alone; he holds up one frame of film to the light, threads it, holds the crank still
  boothSet(g, t, { hh: 5, mm: 50 });
  const p = poseAt(lt, [[0, holdUp(SOFT)], [3.5, holdUp(SOFT)], [5.0, crank(0, 0, SOFT)]]);
  const P = boothMachine(g, t, p, { ang: 0, onCrank: lt > 5, feed: .1, take: .1 });
  if (lt < 4.6) { const h = handAt(HIM, { x: 560, ground: 960, scale: 78, yaw: 70, pose: p }).hand; form(g, rectPts(h[0] - 30, h[1] - 70, 60, 60), { v: .2, line: 1.6, seed: 1360 }); form(g, rectPts(h[0] - 22, h[1] - 62, 44, 44), { v: .8, line: 1.2, seed: 1361 }); }
}

// ============ THE SCREEN (seen from the stalls) + the burn
function screenShot(g, t, src, o = {}) {
  g.fillStyle = grey(.1); g.fillRect(0, 0, W, H);
  form(g, rectPts(150, 70, 1140, 820), { v: .08, line: 2, seed: 1401 });
  g.drawImage(src, 180, 96, 1080, 810);
  if (o.burn) o.burn(g);
  audienceRow(g, -60, W + 60, 980, 40, 81, { gone: o.empty ? () => true : null });
}
export function screen(g, lt, t) { screenShot(g, t, innerFilm(t)); }
export function burn(g, lt, t) {                // the held frame heats: a brown spot, a bubbling hole, then white
  const u = clamp((t - HIT.burn) / (HIT.white - HIT.burn));
  screenShot(g, t, innerFilm(t, 'portrait'), { empty: true, burn: gg => {
    if (t < HIT.burn) return;
    const cx = 760, cy = 420, r = 20 + u * u * 900;
    const pts = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2, k = 1 + .25 * Math.sin(a * 5 + t * 3) + .15 * Math.sin(a * 11 - t * 5); return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]; });
    gg.save(); gg.beginPath(); gg.rect(180, 96, 1080, 810); gg.clip();
    form(gg, catmull(pts.map(([x, y]) => [cx + (x - cx) * 1.25, cy + (y - cy) * 1.25]), true, 3), { v: .3, line: 0, seed: 1410 });   // the scorched ring
    form(gg, catmull(pts, true, 3), { v: 1, line: 3, seed: 1411 });                                                                     // the hole: lamp light
    gg.restore();
  } });
  if (t > HIT.white) { g.fillStyle = grey(1); g.fillRect(0, 0, W, H); }
}

// ============ THE TICKET (insert, inside an iris)
export function ticket(g, lt, t) {
  g.fillStyle = grey(.3); g.fillRect(0, 0, W, H); mottle(g, 0, 0, W, H, .12, 31);
  for (let i = 0; i < 9; i++) stroke(g, [[0, 120 * i + 30], [W, 120 * i + 50]], 1.4, { color: grey(.22), seed: 1500 + i, alpha: .6 });   // wood grain of the booth bench
  g.save(); g.translate(720, 540); g.rotate(-.05);
  form(g, rectPts(-440, -250, 880, 500), { v: .9, line: 3, grad: .12, seed: 1510, shade: 10 });
  form(g, rectPts(-410, -220, 820, 440), { v: .92, line: 1.6, seed: 1511 });
  g.fillStyle = grey(.12); g.textAlign = 'center';
  g.font = '700 40px "Playfair Display SC"'; g.fillText('EAST BENGAL RAILWAY', 0, -150);
  g.font = '700 62px "Noto Serif Bengali"'; g.fillText('ঢাকা → কলকাতা', 0, -50);
  g.font = '700 54px "Playfair Display SC"'; g.fillText('DACCA  →  CALCUTTA', 0, 40);
  g.font = 'italic 400 34px "Old Standard TT"'; g.fillText('Third Class · Single · Morning Mail', 0, 110);
  g.font = '400 30px "Old Standard TT"'; g.fillText('No. 0427', 300, 190); g.fillText('12 · III · 1927', -280, 190);
  stroke(g, [[-410, -110], [410, -110]], 2, { seed: 1512 }); stroke(g, [[-410, 150], [410, 150]], 2, { seed: 1513 });
  g.restore();
  // his thumb at the corner
  form(g, catmull([[1120, 800], [1160, 740], [1215, 735], [1245, 790], [1230, 900], [1150, 905]], true, 4), { v: .78, line: 2.4, grad: .2, seed: 1520 });
}

// ============ THE STATION at dawn (locked extreme wide; undercranked when he runs)
export function stationShot(g, lt, t) {
  station(g, t);
  const go = Math.max(0, t - HIT.trainGo), tx = 1500 + go * go * 9;
  steam(g, tx - 100, 380, t, 6, 1);
  const win = train(g, tx, t);
  // she, at the window of the second coach (head and shoulders)
  const grabT = HIT.grab;
  const hp = poseAt(t, [[SEC.STATION.t0, stand(SAD)], [grabT - 1.4, stand(SAD)], [grabT - .5, (() => { const q = stand(SOFT); q.aR = { fl: 1.6, abd: .4, el: .2, wr: 0, hand: 'open' }; return q; })()],
    [grabT + .4, (() => { const q = stand(SMILE); q.aR = { fl: .9, abd: .3, el: 1.6, wr: 0, hand: 'grip' }; return q; })()], [grabT + 2.5, wave(t * 6)]]);
  const hopt = { x: win[0] + 42, ground: win[1] + 262, scale: 34, yaw: -25, pose: hp, t };
  g.save(); g.beginPath(); g.rect(win[0] + 3, win[1] + 3, win[2] - 6, win[3] - 6); g.clip();
  g.fillStyle = grey(.35); g.fillRect(win[0], win[1], win[2], win[3]);
  fig(g, HER, hopt);
  g.restore();
  // he: runs in with the film can, runs alongside, holds it up; she takes it; he slows, hands on knees, straightens, waves
  const runIn = SEC.STATION.t0 + 8.4, winX = tt => 1500 + Math.max(0, tt - HIT.trainGo) ** 2 * 9 - 1336;
  const hx = t < runIn ? -200 : t < grabT ? Math.min(lerp(-200, winX(t) - 120, ss((t - runIn) / (grabT - runIn) * 1.05)), winX(t) - 120) : winX(grabT) - 120 + 160 * ss((t - grabT) / 2);
  const ph = (t - runIn) * 2.6;
  const mp = poseAt(t, [[runIn, run(ph)], [grabT - 1.6, run(ph)], [grabT - .9, (() => { const q = run(ph); q.aR = { fl: 2.45, abd: .25, el: .15, wr: 0, hand: 'grip' }; return q; })()], [grabT, (() => { const q = run(ph); q.aR = { fl: 2.45, abd: .25, el: .15, wr: 0, hand: 'open' }; return q; })()],
    [grabT + .6, run(ph * .5)], [grabT + 2.4, kneesBent()], [grabT + 5.5, kneesBent()], [grabT + 6.6, stand(SOFT)], [grabT + 7.4, wave(t * 6)]]);
  const mopt = { x: hx, ground: 990 + (t < grabT + 2 ? runBob(ph, 70) : 0), scale: 70, yaw: 75, pose: mp, t };
  if (t > runIn) {
    fig(g, HIM, mopt);
    contactShadow(g, hx, 992, 70, 10, .3);
    if (t < grabT) { const h = handAt(HIM, mopt).hand; filmCan(g, h[0], h[1] - 12, 26, -.2); }
  }
  // the hand-over: from his raised hand up into the window, then it rides away in her hands
  if (t >= grabT && tx < 3600) {
    const h = handAt(HIM, { ...mopt, pose: poseAt(grabT, [[0, mp]]) }).hand, u = ss((t - grabT) / .35), wc = [win[0] + 40, win[1] + 70];
    const x = lerp(h[0], wc[0], u), y = lerp(h[1] - 12, wc[1], u); filmCan(g, x, y, lerp(26, 18, u), -.2);
  }
}
