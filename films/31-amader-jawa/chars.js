// chars.js — the two characters, drawn as cel puppets (parts on a rig, posed on 2s, boiling ink, off-register fills).
// AMI ("I"): the singer — flat cap with plaid, curls under the cap, moustache + goatee, cream tee, khaki trousers (from his character sheet).
// TUMI ("you"): long braid, sunny-yellow kameez, tomato-red orna.
// ghost: true draws the same figure as a dashed pencil outline with no colour — someone who was supposed to be there.
import { PI, DEG, clamp, lerp, ellipsePts, spline, shape, ink, fill, sh, hash } from './cel.js';
export const COL = { ink: '#1F1A17', red: '#E04A35', yellow: '#F2B632', cream: '#F3E9D2', paper: '#EFE3C8',
  skinA: '#C98B5E', skinT: '#C78762', cap: '#6E5A4C', khaki: '#B48A4A', tee: '#FAF3E3', salwar: '#F7EEDC', hair: '#1F1A17', shadow: 'rgba(31,26,23,.16)' };

function tube(a, b, w0, w1 = w0) {               // a limb segment as a closed outline
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  return [[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] + dx / d * w1 * 0.6, b[1] + dy / d * w1 * 0.6],
    [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0], [a[0] - dx / d * w0 * 0.4, a[1] - dy / d * w0 * 0.4]];
}
const at = (o, len, ang) => [o[0] + Math.sin(ang) * len, o[1] + Math.cos(ang) * len];   // angle 0 = straight down

// draw one part list with the shared style. ghost -> dashed outline only.
function drawParts(c, parts, k, id, ghost, s) {
  const w = 3.4 / Math.sqrt(s);
  for (const p of parts) {
    if (ghost) { if (p.ghost !== false) ink(c, [...p.pts, p.pts[0], p.pts[1]], w * 0.8, { id: id + p.id, k, closed: true, taper: 0.2, col: 'rgba(31,26,23,.62)', dash: [14, 10] }); continue; }
    if (p.fn) { p.fn(c, k); continue; }
    shape(c, p.pts, p.col, { w: (p.w || 1) * w, id: id + p.id, k, line: p.line !== false, reg: p.reg ?? 3 });
  }
}

// ------------------------------------------------------------------ AMI
// pose: { aL, aR, eL, eR (elbow bend), tilt, view: 'front'|'back', walk (phase, radians), sit, blink, mouth (0..1), look (-1..1) }
export function ami(c, x, y, s, t, k, pose = {}, o = {}) {
  const { aL = 0.12, aR = 0.12, eL = 0.1, eR = 0.1, tilt = 0, view = 'front', walk = null, sit = false, blink = false, mouth = 0, look = 0 } = pose;
  const { ghost = false, id = 100, shadow = true } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (shadow && !ghost && !sit) { c.fillStyle = COL.shadow; c.beginPath(); c.ellipse(0, 4, 70, 12, 0, 0, 2 * PI); c.fill(); }
  const P = [];
  const sw = walk == null ? 0 : Math.sin(walk), bob = walk == null ? 0 : Math.abs(Math.cos(walk)) * -6;
  c.translate(0, bob);
  if (!sit) {                                           // legs (khaki trousers) + shoes
    for (const side of [-1, 1]) {
      const swing = side * sw * 26, hip = [side * 17, -205], ank = [side * 21 + swing, -16];
      P.push({ id: 10 + side, pts: tube(hip, ank, 19, 14), col: COL.khaki });
      P.push({ id: 14 + side, pts: ellipsePts(ank[0] + side * 4, ank[1] + 4, 22, 11, 14), col: COL.ink });
    }
  }
  // arms behind the torso in back view are drawn first
  const shL = [-55, -326], shR = [55, -326];
  const arm = (sh0, side, a, e, pid) => {
    const el = at(sh0, 66, side * a), ha = at(el, 62, side * (a + e));
    return [{ id: pid, pts: tube(sh0, el, 15, 12), col: COL.skinA }, { id: pid + 1, pts: tube(el, ha, 12, 10), col: COL.skinA },
      { id: pid + 2, pts: ellipsePts(ha[0], ha[1] + 4, 11, 13, 12), col: COL.skinA },
      { id: pid + 3, pts: tube(sh0, at(sh0, 36, side * a), 22, 19), col: COL.tee }];      // sleeve
  };
  const armsL = arm(shL, -1, aL, eL, 30), armsR = arm(shR, 1, aR, eR, 40);
  const torso = { id: 20, pts: spline([[-18, -348], [-58, -330], [-54, -262], [-50, sit ? -230 : -200], [50, sit ? -230 : -200], [54, -262], [58, -330], [18, -348], [0, -338]], true, 4), col: COL.tee };
  P.push(torso, ...armsL, ...armsR);
  P.push({ id: 25, pts: tube([0, -362], [0, -338], 11, 12), col: COL.skinA });       // neck
  drawParts(c, P, k, id, ghost, s);
  // ---- head
  c.save(); c.translate(0, -392); c.rotate(tilt); c.translate(look * 4, 0);
  const H = [];
  const curls = (pts, pid) => pts.forEach(([cx, cy, r], i) => H.push({ id: pid + i, pts: ellipsePts(cx, cy, r, r * 0.9, 10, i), col: COL.hair, w: 0.7, reg: 1.5 }));
  if (view === 'front') {
    curls([[-37, -6, 9], [-36, 9, 8], [-31, 22, 7], [37, -6, 9], [36, 9, 8], [31, 22, 7]], 60);
    H.push({ id: 52, pts: ellipsePts(-35, 2, 6, 10, 10), col: COL.skinA }, { id: 53, pts: ellipsePts(35, 2, 6, 10, 10), col: COL.skinA });
    H.push({ id: 50, pts: spline([[0, -38], [28, -30], [33, 0], [24, 30], [0, 42], [-24, 30], [-33, 0], [-28, -30]], true, 5), col: COL.skinA });
  } else {
    H.push({ id: 52, pts: ellipsePts(-34, 2, 6, 10, 10), col: COL.skinA }, { id: 53, pts: ellipsePts(34, 2, 6, 10, 10), col: COL.skinA });
    H.push({ id: 51, pts: spline([[0, -38], [30, -26], [34, 6], [22, 36], [0, 40], [-22, 36], [-34, 6], [-30, -26]], true, 5), col: COL.hair });
    curls([[-28, 30, 9], [-12, 38, 9], [6, 39, 9], [22, 33, 9], [-35, 14, 8], [35, 14, 8]], 70);
  }
  // flat cap: crown + brim; plaid lines are drawn inside (cel-style, a few lines that boil)
  const crown = spline([[-41, -12], [-42, -30], [-28, -46], [2, -51], [32, -46], [44, -30], [43, -12], [0, -6]], true, 5);
  H.push({ id: 80, pts: crown, col: COL.cap });
  if (view === 'front') H.push({ id: 81, pts: spline([[-44, -14], [0, -9], [46, -14], [40, -3], [0, 2], [-40, -3]], true, 4), col: '#5C4A3E' });
  drawParts(c, H, k, id + 200, ghost, s);
  if (!ghost) {
    c.save(); c.beginPath(); crown.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip();
    for (let i = -3; i <= 3; i++) { ink(c, [[i * 13 - 6, -54], [i * 13 + 4, -4]], 1.4, { id: id + 300 + i, k, col: 'rgba(224,74,53,.75)', taper: 0.4 });
      if (i % 2 === 0) ink(c, [[-48, -40 + i * 2.2 + 18], [48, -42 + i * 2.2 + 18]], 1.2, { id: id + 320 + i, k, col: 'rgba(242,182,50,.55)', taper: 0.4 }); }
    c.restore();
    if (view === 'front') {                          // face: dot eyes (blink = line), brows, nose, moustache, goatee, singing mouth
      const w = 3.4 / Math.sqrt(s);
      for (const sd of [-1, 1]) {
        if (blink) ink(c, [[sd * 12 - 5, 1], [sd * 12 + 5, 1]], w * 0.9, { id: id + 90 + sd, k });
        else { c.fillStyle = COL.ink; c.beginPath(); c.ellipse(sd * 12 + look * 2 + sh(id, sd, k) * 0.5, 0, 3.6, 4.4, 0, 0, 2 * PI); c.fill(); }
        ink(c, [[sd * 6, -10], [sd * 13, -12], [sd * 19, -10]], w * 0.9, { id: id + 94 + sd, k });
      }
      ink(c, [[1, 6], [4, 13], [0, 15]], w * 0.7, { id: id + 97, k });
      if (mouth > 0.05) { fill(c, ellipsePts(0, 25, 7, 3 + 6 * mouth, 12), '#5A2018', { id: id + 98, k, reg: 0 }); }
      ink(c, [[-15, 22], [-7, 18], [0, 19], [7, 18], [15, 22]], w * 1.7, { id: id + 99, k, taper: 0.8 });
      shape(c, [[-6, 31 + mouth * 4], [6, 31 + mouth * 4], [3, 41 + mouth * 3], [-3, 41 + mouth * 3]], COL.hair, { w: w * 0.6, id: id + 101, k, reg: 1 });
    }
  }
  c.restore(); c.restore();
}

// ------------------------------------------------------------------ TUMI
export function tumi(c, x, y, s, t, k, pose = {}, o = {}) {
  const { aL = 0.12, aR = 0.12, eL = 0.1, eR = 0.1, tilt = 0, view = 'front', walk = null, sit = false, blink = false, look = 0, smile = 1, braidSwing = 0 } = pose;
  const { ghost = false, id = 400, shadow = true } = o;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (shadow && !ghost && !sit) { c.fillStyle = COL.shadow; c.beginPath(); c.ellipse(0, 4, 62, 11, 0, 0, 2 * PI); c.fill(); }
  const sw = walk == null ? 0 : Math.sin(walk), bob = walk == null ? 0 : Math.abs(Math.cos(walk)) * -5;
  c.translate(0, bob);
  const P = [];
  if (!sit) for (const side of [-1, 1]) {
    const swing = side * sw * 22, hip = [side * 15, -170], ank = [side * 18 + swing, -14];
    P.push({ id: 10 + side, pts: tube(hip, ank, 16, 12), col: COL.salwar });
    P.push({ id: 14 + side, pts: ellipsePts(ank[0] + side * 3, ank[1] + 4, 17, 8, 12), col: COL.red });
  }
  const shL = [-46, -300], shR = [46, -300];
  const arm = (sh0, side, a, e, pid) => {
    const el = at(sh0, 60, side * a), ha = at(el, 56, side * (a + e));
    return [{ id: pid, pts: tube(sh0, el, 12, 10), col: COL.skinT }, { id: pid + 1, pts: tube(el, ha, 10, 8), col: COL.skinT },
      { id: pid + 2, pts: ellipsePts(ha[0], ha[1] + 3, 9, 11, 12), col: COL.skinT }, { id: pid + 3, pts: tube(sh0, el, 16, 13), col: COL.yellow }];
  };
  const back = view === 'back';
  if (back) {                                            // the braid hangs down the back, swinging on 2s
    const bx = braidSwing * 10, pts = [];
    for (let i = 0; i < 9; i++) pts.push([lerp(0, bx, i / 8) + (i % 2 ? 5 : -5), -330 + i * 22]);
    P.push({ fn: (cx, kk) => { pts.forEach(([px, py], i) => shape(cx, ellipsePts(px, py, 11 - i * 0.5, 13, 10, i), COL.hair, { w: 2.4, id: id + 600 + i, k: kk, reg: 1 })); }, pts: [[-12, -330], [12, -330], [bx + 8, -150], [bx - 8, -150]], id: 600 });
  }
  const kameez = { id: 20, pts: spline([[-16, -322], [-48, -302], [-50, -240], [-60, sit ? -200 : -96], [60, sit ? -200 : -96], [50, -240], [48, -302], [16, -322], [0, -312]], true, 4), col: COL.yellow };
  P.push(...(back ? [] : []), kameez, ...arm(shL, -1, aL, eL, 30), ...arm(shR, 1, aR, eR, 40));
  // orna: front — across the chest from the left shoulder; back — two ends falling behind the shoulders
  if (!back) P.push({ id: 50, pts: spline([[-50, -306], [-30, -318], [30, -290], [54, -236], [44, -226], [20, -268], [-42, -286]], true, 4), col: COL.red });
  else P.push({ id: 51, pts: spline([[-46, -304], [46, -304], [52, -250], [40, -150], [24, -150], [24, -250], [-24, -250], [-24, -150], [-40, -150], [-52, -250]], true, 3), col: COL.red });
  P.push({ id: 25, pts: tube([0, -338], [0, -314], 9, 10), col: COL.skinT });
  drawParts(c, P, k, id, ghost, s);
  c.save(); c.translate(0, -366); c.rotate(tilt);
  const H = [];
  if (!back) {
    H.push({ id: 52, pts: ellipsePts(-30, 4, 5, 9, 10), col: COL.skinT }, { id: 53, pts: ellipsePts(30, 4, 5, 9, 10), col: COL.skinT });
    H.push({ id: 60, pts: spline([[0, -34], [26, -26], [30, 2], [21, 28], [0, 38], [-21, 28], [-30, 2], [-26, -26]], true, 5), col: COL.skinT });
    H.push({ id: 61, pts: spline([[0, -32], [-14, -36], [-30, -28], [-34, -6], [-31, 14], [-26, 0], [-22, -18], [-6, -26], [0, -24], [6, -26], [22, -18], [26, 0], [31, 14], [34, -6], [30, -28], [14, -36]], true, 3), col: COL.hair });
  } else {
    H.push({ id: 62, pts: spline([[0, -36], [28, -28], [32, 4], [24, 30], [0, 36], [-24, 30], [-32, 4], [-28, -28]], true, 5), col: COL.hair });
  }
  drawParts(c, H, k, id + 200, ghost, s);
  if (!ghost && !back) {
    const w = 3.2 / Math.sqrt(s);
    for (const sd of [-1, 1]) {
      if (blink) ink(c, [[sd * 11 - 4, 2], [sd * 11 + 4, 2]], w * 0.8, { id: id + 90 + sd, k });
      else { c.fillStyle = COL.ink; c.beginPath(); c.ellipse(sd * 11 + look * 2, 2, 3.2, 4, 0, 0, 2 * PI); c.fill(); }
      c.fillStyle = 'rgba(224,74,53,.35)'; c.beginPath(); c.ellipse(sd * 17, 14, 6, 3.5, 0, 0, 2 * PI); c.fill();    // blush
      c.fillStyle = COL.yellow; c.beginPath(); c.arc(sd * 31, 16, 3, 0, 2 * PI); c.fill();                       // earrings
    }
    ink(c, [[-7, 22], [0, 22 + 4 * smile], [7, 22]], w * 0.9, { id: id + 99, k });
  }
  c.restore(); c.restore();
}
