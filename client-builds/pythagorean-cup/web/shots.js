// ---------- Pythagorean cup reel: shot list (times come from the voice's word timings) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const P = { hat: 'none', belt: false };
const HOST = C(P, { cols: ['#2e9e6a', '#2e9e6a'], hair: { style: 'tuft', col: '#1d1a1c' }, shirt: '#f6f1e8' });
const GREEDY = C(P, { cols: ['#e0392f', '#f6f1e8'], hair: { style: 'tuft', col: '#2a1d16' } });
const MODEST = C(P, { cols: ['#3fa35b', '#3fa35b'], hair: { style: 'neat', col: '#2a2020' } });
const beard = (ctx, hx, hy, hr) => {
  ctx.beginPath(); ctx.moveTo(hx - hr * .97, hy + hr * .05); ctx.quadraticCurveTo(hx - hr * .95, hy + hr * 1.45, hx, hy + hr * 1.75); ctx.quadraticCurveTo(hx + hr * .95, hy + hr * 1.45, hx + hr * .97, hy + hr * .05);
  ctx.quadraticCurveTo(hx + hr * .55, hy + hr * .9, hx, hy + hr * .82); ctx.quadraticCurveTo(hx - hr * .55, hy + hr * .9, hx - hr * .97, hy + hr * .05); ctx.closePath(); fillStroke(ctx, '#eeeeee', .014);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx, hy + hr * .36); ctx.quadraticCurveTo(hx + sd * hr * .3, hy + hr * .28, hx + sd * hr * .42, hy + hr * .44); ctx.lineWidth = .028; ctx.strokeStyle = '#eeeeee'; ctx.lineCap = 'round'; ctx.stroke(); }
};
const laurel = (ctx, hx, hy, hr, lw) => {
  for (let i = -5; i <= 5; i++) { if (!i) continue; const a = -Math.PI / 2 + i * .26; const x = hx + Math.cos(a) * hr * .98, y = hy + Math.sin(a) * hr * .98 + hr * .05; ellipse(ctx, x, y, .03, .014, a + Math.PI / 2 + Math.sign(i) * .5); fillStroke(ctx, '#5aa043', .008); }
};
const PYTH = C(P, { cols: ['#f4efe2', '#f4efe2'], vest: '#3b6fb6', hair: { style: 'short', col: '#eeeeee' }, hat: laurel, extra: beard });
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });

// line timing from the voice
const _L = {};
function Ln(i) { if (!_L[i]) { const ws = WORDS.filter(w => w.line === i); _L[i] = { s: ws[0].s, e: ws[ws.length - 1].e, w: ws.map(w => w.s) }; } return _L[i]; }
const NL = Math.max(...WORDS.map(w => w.line)) + 1;
const B = i => i <= 0 ? 0 : i >= NL ? Ln(NL - 1).e + .9 : (Ln(i - 1).e + Ln(i).s) / 2;
const Wt = (i, k) => Ln(i).w[k];
const on = (t, t0, d = .35) => clamp((t - t0) / d);
const SHOTS = [];
const S = (start, end, draw, tr = 'whip') => SHOTS.push({ start, end, tr, draw });
const host = (t, o) => C(HOST, Object.assign({ face: { eyes: 'normal', mouth: talkMouth(t) } }, o));
function studio(ctx, cam, t) {
  room(ctx, cam, ['#ffe2b0', '#ffbf74'], '#5b4a7a');
  applyCam(ctx, cam, .75);
  tvScreen(ctx, 330, 470, 470, 290, (c, x, y, w, h) => {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1d6a8a'); g.addColorStop(1, '#2fa3c9'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.save(); c.translate(x + 110, y + h / 2 + 10); c.scale(.28, .28); cupDraw(c, 0, 230, 1, { cut: 0 }); c.restore();
    text(c, 'মজার বিজ্ঞান', x + 310, y + h / 2 - 10, 50, '#fff', INK, 0, BN, 700);
    c.fillStyle = '#e0392f'; c.fillRect(x, y + h - 46, w, 46); text(c, 'রুবেল মিয়া  •  বিজ্ঞান ও প্রযুক্তি', x + w - ((t * 120) % (w + 520)), y + h - 22, 30, '#fff', INK, 0, BN, 700, 'left');
  });
  applyCam(ctx, cam, 1);
}
function greece(ctx, cam, t) {
  skyBG(ctx, cam, '#3ea6ee', '#e6f7ff', t); applyCam(ctx, cam, .15); drawSun(ctx, 860, 300, 80, t, .9);
  applyCam(ctx, cam, .35); ctx.fillStyle = '#2f9fd0'; ctx.fillRect(-1500, 900, 4080, 400); line(ctx, -1500, 900, 2600, 900, 5, '#1f7fae');
  for (const [x, w] of [[-60, 120], [160, 90], [900, 140]]) { path(ctx, [[x - w, 905], [x - w * .3, 820], [x + w * .2, 850], [x + w, 905]]); fillStroke(ctx, '#e9e2d0', 5); }
  applyCam(ctx, cam, .6);
  path(ctx, [[120, 520], [400, 400], [680, 520]]); fillStroke(ctx, '#f2ece0', 7); rrect(ctx, 110, 515, 580, 40, 6); fillStroke(ctx, '#e6dfcf', 6);
  for (let i = 0; i < 5; i++) { rrect(ctx, 140 + i * 120, 555, 50, 330, 6); fillStroke(ctx, '#f6f1e6', 6); }
  rrect(ctx, 100, 885, 600, 30, 6); fillStroke(ctx, '#e6dfcf', 6);
  ground(ctx, cam, 1250, '#e3cf9a', '#c9b37c');
}

// ---------------- the cup (local units: base centre at 0, y up negative) ----------------
const TERRA = '#b8673c', TERRA_D = '#94502c', INSIDE = '#f2dfc8', WATER = '#3fa9f5', WATER_D = '#2a86cc';
const MARK = -440, TUBE_TOP = -500, FLOOR = -262, GAP = -290;
function cupOuterPath(ctx) {
  const R = [[170, 0], [170, -26], [62, -42], [44, -64], [46, -228]];
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(170, 0);
  for (const [x, y] of R.slice(1)) ctx.lineTo(x, y);
  ctx.quadraticCurveTo(70, -262, 160, -274); ctx.quadraticCurveTo(220, -290, 223, -360); ctx.lineTo(228, -520); ctx.quadraticCurveTo(232, -600, 306, -655); ctx.lineTo(294, -670); ctx.lineTo(286, -662);
  ctx.lineTo(-286, -662); ctx.lineTo(-294, -670); ctx.lineTo(-306, -655); ctx.quadraticCurveTo(-232, -600, -228, -520); ctx.lineTo(-223, -360); ctx.quadraticCurveTo(-220, -290, -160, -274); ctx.quadraticCurveTo(-70, -262, -46, -228);
  for (const [x, y] of R.slice(1).reverse()) ctx.lineTo(-x, y);
  ctx.closePath();
}
function cavityPath(ctx) {
  ctx.beginPath(); ctx.moveTo(-150, FLOOR); ctx.lineTo(150, FLOOR); ctx.quadraticCurveTo(201, -268, 204, -330); ctx.lineTo(209, -520); ctx.quadraticCurveTo(214, -600, 286, -662);
  ctx.lineTo(-286, -662); ctx.quadraticCurveTo(-214, -600, -209, -520); ctx.lineTo(-204, -330); ctx.quadraticCurveTo(-201, -268, -150, FLOOR); ctx.closePath();
}
const sleevePath = (ctx) => { ctx.beginPath(); ctx.moveTo(-52, GAP); ctx.lineTo(-52, -508); ctx.arc(0, -508, 52, Math.PI, 0); ctx.lineTo(52, GAP); ctx.closePath(); };
const sleeveIn = (ctx) => { ctx.beginPath(); ctx.moveTo(-38, FLOOR + 2); ctx.lineTo(-38, -508); ctx.arc(0, -508, 38, Math.PI, 0); ctx.lineTo(38, FLOOR + 2); ctx.closePath(); };
// st: {cut 0..1 wipe, L, La, boreTop, boreBot, out (stream strength 0..1), basin 0..1, glowSleeve, glowU, mark}
function cupDraw(ctx, x, y, s, st = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const cut = st.cut == null ? 1 : st.cut;
  const outer = () => {
    cupOuterPath(ctx); fillStroke(ctx, TERRA, 7);
    ctx.save(); cupOuterPath(ctx); ctx.clip();
    ctx.fillStyle = '#231a18'; ctx.fillRect(-320, -585, 640, 60); ctx.fillStyle = TERRA;
    for (let i = -6; i < 6; i++) { const bx = i * 55; ctx.fillRect(bx + 8, -575, 34, 8); ctx.fillRect(bx + 34, -575, 8, 34); ctx.fillRect(bx + 18, -549, 24, 8); ctx.fillRect(bx + 18, -560, 8, 19); }
    ctx.fillStyle = '#231a18'; ctx.fillRect(-320, -330, 640, 22); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-200, -640, 40, 600);
    ctx.fillStyle = 'rgba(60,20,0,.18)'; ctx.fillRect(90, -700, 300, 720); ctx.restore();
    cupOuterPath(ctx); fillStroke(ctx, null, 7);
  };
  const section = () => {
    cupOuterPath(ctx); fillStroke(ctx, TERRA, 7);
    cavityPath(ctx); ctx.fillStyle = INSIDE; ctx.fill(); ctx.save(); cavityPath(ctx); ctx.clip(); ctx.fillStyle = 'rgba(120,60,20,.10)'; ctx.fillRect(60, -700, 300, 500);
    const L = st.L == null ? FLOOR : st.L;
    if (L < FLOOR) { ctx.fillStyle = WATER; ctx.fillRect(-320, L, 640, 400); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-320, L, 640, 6); ctx.fillStyle = 'rgba(0,40,90,.12)'; ctx.fillRect(80, L, 300, 400); }
    ctx.restore(); cavityPath(ctx); fillStroke(ctx, null, 5);
    if (st.mark !== false) { ctx.save(); ctx.setLineDash([16, 12]); line(ctx, -205, MARK, 205, MARK, 5, '#e0392f'); ctx.restore(); for (const sd of [-1, 1]) line(ctx, sd * 230, MARK, sd * 205, MARK, 8, '#e0392f'); }
    if (st.glowSleeve) { ctx.save(); ctx.globalAlpha = st.glowSleeve; sleevePath(ctx); ctx.lineWidth = 30; ctx.strokeStyle = '#ffd23a'; ctx.stroke(); ctx.restore(); }
    sleevePath(ctx); fillStroke(ctx, TERRA, 6);
    sleeveIn(ctx); ctx.fillStyle = INSIDE; ctx.fill();
    const La = st.La == null ? L : st.La;
    if (La < FLOOR) { ctx.save(); sleeveIn(ctx); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(-60, La, 120, 400); ctx.restore(); }
    rrect(ctx, -26, TUBE_TOP, 52, FLOOR - TUBE_TOP + 4, [10, 10, 0, 0]); fillStroke(ctx, TERRA, 5);
    rrect(ctx, -12, TUBE_TOP - 2, 24, -TUBE_TOP + 2, 3); ctx.fillStyle = INSIDE; ctx.fill();
    if (st.boreBot != null && st.boreBot > st.boreTop) { ctx.fillStyle = WATER; ctx.fillRect(-12, st.boreTop, 24, st.boreBot - st.boreTop); }
    line(ctx, -12, TUBE_TOP, -12, 0, 4); line(ctx, 12, TUBE_TOP, 12, 0, 4);
    if (st.glowU) { const k = st.glowU; ctx.save(); ctx.setLineDash([22, 16]); ctx.lineDashOffset = -(st.t || 0) * 90; ctx.beginPath(); ctx.moveTo(-31, FLOOR - 10); ctx.lineTo(-31, -508); ctx.quadraticCurveTo(-31, -535, 0, -536); ctx.quadraticCurveTo(0, -520, 0, -500); ctx.lineTo(0, -500 + 520 * k); ctx.lineWidth = 9; ctx.strokeStyle = st.flowCol || '#ffd23a'; ctx.stroke(); ctx.restore(); }
  };
  if (cut >= 1) section(); else if (cut <= 0) outer();
  else { outer(); ctx.save(); ctx.beginPath(); ctx.rect(-340, -720 + 760 * (1 - cut), 680, 800); ctx.clip(); section(); ctx.restore(); const yy = -720 + 760 * (1 - cut); line(ctx, -340, yy, 340, yy, 8, '#ffd23a'); }
  // outflow stream from the base hole
  if (st.out > 0) { const w = 18 * st.out; rrect(ctx, -w / 2, 0, w, 210, w / 2); ctx.fillStyle = WATER; ctx.fill(); for (let i = 0; i < 3; i++) { const yy = 20 + ((st.t || 0) * 600 + i * 70) % 190; ellipse(ctx, 0, yy, w * .3, 12); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill(); } }
  ctx.restore();
}
function stand(ctx, x, y, s, basin = 0) { // wooden stand under the cup + basin below
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sd of [-1, 1]) { line(ctx, sd * 150, 4, sd * 230, 330, 16, '#6b4a2e'); }
  rrect(ctx, -190, 0, 380, 22, 8); fillStroke(ctx, '#8a5a34', 6); rrect(ctx, -40, -2, 80, 26, 6); ctx.fillStyle = '#3a2a20'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-170, 230); ctx.lineTo(170, 230); ctx.quadraticCurveTo(160, 330, 0, 335); ctx.quadraticCurveTo(-160, 330, -170, 230); fillStroke(ctx, '#c9ced6', 7);
  if (basin > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(-170, 230); ctx.lineTo(170, 230); ctx.quadraticCurveTo(160, 330, 0, 335); ctx.quadraticCurveTo(-160, 330, -170, 230); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(-200, 335 - 100 * basin, 400, 200); ctx.restore(); }
  ellipse(ctx, 0, 230, 170, 22); fillStroke(ctx, 'rgba(255,255,255,.0)', 6);
  ctx.restore();
}
function jug(ctx, x, y, s, tilt) { // spout at (x, y)
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, -30); ctx.quadraticCurveTo(170, -60, 190, 40); ctx.quadraticCurveTo(200, 170, 120, 200); ctx.lineTo(70, 200); ctx.quadraticCurveTo(10, 150, 40, 30); ctx.closePath(); fillStroke(ctx, '#e8c04a', 7);
  ctx.beginPath(); ctx.arc(205, 90, 55, -1.2, 1.4); ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 9; ctx.strokeStyle = '#e8c04a'; ctx.stroke();
  ctx.fillStyle = '#231a18'; ctx.fillRect(50, 70, 150, 26); ctx.restore();
}

// one global timeline for the water
const T = {};
function cupState(t) {
  if (!T.f0) { T.f0 = Wt(8, 0) + .2; T.f1 = Wt(8, 6) - .1; T.g0 = Wt(9, 3); T.g1 = Wt(9, 9) + .15; T.cross = T.g0 + (T.g1 - T.g0) * (60 / 75); T.front = T.g1 + .7; T.end = Wt(12, 10); }
  let L = FLOOR, pour = 0;
  if (t < T.f0) L = FLOOR; else if (t < T.f1) { L = lerp(FLOOR, MARK, (t - T.f0) / (T.f1 - T.f0)); pour = 1; }
  else if (t < T.g0) L = MARK; else if (t < T.g1) { L = lerp(MARK, -515, (t - T.g0) / (T.g1 - T.g0)); pour = 1; }
  else if (t < T.front) L = -515; else if (t < T.end) L = lerp(-515, GAP + 2, ease((t - T.front) / (T.end - T.front)) * .4 + ((t - T.front) / (T.end - T.front)) * .6); else L = GAP + 2;
  const siphon = t >= T.cross && t < T.end;
  const La = siphon ? -560 : L;
  let boreTop = TUBE_TOP, boreBot = TUBE_TOP;
  if (t >= T.cross && t < T.end) boreBot = lerp(TUBE_TOP, 0, clamp((t - T.cross) / (T.front - T.cross)));
  if (t >= T.end) { boreBot = 0; boreTop = lerp(TUBE_TOP, 0, clamp((t - T.end) / .5)); }
  const out = t >= T.front && t < T.end + .5 ? clamp((t - T.front) / .2) * (t > T.end ? 1 - (t - T.end) / .5 : 1) : 0;
  const basin = clamp((t - T.front) / (T.end - T.front + .5)) * .85;
  return { L, La, boreTop, boreBot, out, basin, pour, t };
}
function cupScene(ctx, t, lt, camO = {}, extra = {}) {
  const cam = camAt(t, lt, Object.assign({ z: 1.0, vz: .015, hand: 2.5 }, camO));
  room(ctx, cam, ['#e9f4fb', '#c6e2f2'], '#7d8a99');
  applyCam(ctx, cam, 1);
  const st = Object.assign(cupState(t), extra);
  stand(ctx, 540, 930, 1.0, st.basin);
  cupDraw(ctx, 540, 930, 1.0, st);
  if (st.pour) { const sy = 930 + st.L; rrect(ctx, 683, 245, 16, sy - 245, 8); ctx.fillStyle = WATER; ctx.fill(); }
  if (st.pour || extra.showJug) jug(ctx, 690, 250, .85, st.pour ? -.6 : -.2);
  return { cam, st };
}

// ======================= 0 intro =======================
S(0, B(1), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .035 }); studio(ctx, cam, t);
  drawStick(ctx, host(t, { x: 690, y: 1250, s: 640, arms: { L: [.3, -.1], R: [2.55 + Math.sin(t * 9) * .35, .5] }, face: { eyes: lt < .4 ? 'happy' : 'normal', mouth: talkMouth(t, 'grin') } }));
  nameTag(ctx, 330, 1165, 'রুবেল মিয়া', 'বিজ্ঞান ও প্রযুক্তি', on(t, Wt(0, 3), .4), '#2e9e6a');
}, 'cut');
// ======================= 1 a 2500-year-old clever cup =======================
S(B(1), B(2), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .04 }); room(ctx, cam, ['#3a2f5b', '#5b4a8a'], '#2b2240', 1250, { stripes: false });
  spotlight(ctx, 470, 0, 1060, 140, 520, 1);
  pedestal(ctx, 470, 1250, 300, 190, '#e9e2d0');
  cupDraw(ctx, 470, 1034, .55, { cut: 0 });
  for (let i = 0; i < 4; i++) sparkle(ctx, 470 + Math.cos(i * 1.6 + t) * 230, 820 + Math.sin(i * 1.6 + t) * 150, 24, on(t, Wt(1, 7), .3));
  pill(ctx, 470, 420, '২৫০০ বছর আগের', '#ffd23a', INK, 56, on(t, Wt(1, 2), .3));
  drawStick(ctx, host(t, { x: 870, y: 1270, s: 440, arms: { L: { ik: [-.36, -.6] }, R: [.3, -.1] }, face: { eyes: 'wide', look: [-.8, 0], mouth: talkMouth(t, 'o') } }));
});
// ======================= 2 ancient Greece =======================
S(B(2), B(3), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); greece(ctx, cam, t);
  rrect(ctx, 600, 1020, 260, 230, 10); fillStroke(ctx, '#e9e2d0', 7);
  cupDraw(ctx, 730, 1020, .55, { cut: 0 });
  pill(ctx, 300, 330, 'প্রাচীন গ্রিস', '#3b6fb6', '#fff', 56, on(t, Wt(2, 1), .3));
  nameTag(ctx, 540, 1170, 'পিথাগোরীয় কাপ', 'Pythagorean Cup', on(t, Wt(2, 7), .4), TERRA);
});
// ======================= 3 looks ordinary =======================
S(B(3), B(4), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#fff1d6', '#ffd99a'], '#c8955a');
  rrect(ctx, 60, 1060, 960, 40, 8); fillStroke(ctx, '#8a5a34', 7);
  const plain = (x) => { ctx.save(); ctx.translate(x, 1060); ctx.scale(.42, .42); cupOuterPath(ctx); fillStroke(ctx, '#c97b4c', 9); ctx.restore(); };
  plain(220); cupDraw(ctx, 540, 1060, .42, { cut: 0 }); plain(860);
  for (let i = 0; i < 3; i++) { const a = on(t, Wt(3, 2) + i * .15, .3); popIn(ctx, 220 + i * 320, 650 + Math.sin(t * 3 + i) * 8, a, c => { circle(c, 0, 0, 60); fillStroke(c, '#fff', 6); text(c, '?', 0, 6, 80, '#2f63c9', INK, 0, 'Poppins', 700); }); }
  pill(ctx, 540, 380, 'কোনটা আলাদা?', '#fff', INK, 56, on(t, Wt(3, 0), .3));
});
// ======================= 4 reveal the inside =======================
S(B(4), B(5), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 }); room(ctx, cam, ['#e9f4fb', '#c6e2f2'], '#7d8a99'); applyCam(ctx, cam, 1);
  stand(ctx, 540, 930, 1.0, 0);
  const cut = ease(on(t, Wt(4, 2), .9));
  cupDraw(ctx, 540, 930, 1.0, { cut, mark: false });
  const mx = kf(t, [[B(4), 200], [Wt(4, 2), 330], [Wt(4, 5), 760]]); if (cut < 1) magnifier(ctx, mx, 600 + Math.sin(t * 3) * 30, 110);
  if (cut >= 1) for (let i = 0; i < 5; i++) sparkle(ctx, 540 + Math.cos(i * 1.25 + t) * 300, 600 + Math.sin(i * 1.25 + t) * 260, 26, on(t, Wt(4, 6), .3));
  pill(ctx, 540, 1130, 'পদার্থবিজ্ঞানের কৌশল', '#ffd23a', INK, 50, on(t, Wt(4, 5), .3));
});
// ======================= 5 column + inverted U tube =======================
S(B(5), B(6), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.25, y: 700, vz: .02 }, { glowSleeve: on(t, Wt(5, 3), .3) * (1 - on(t, Wt(5, 8), .3) * .6), glowU: on(t, Wt(5, 8), 1.0), mark: false });
  pill(ctx, 260, 330, 'খুঁটি', '#fff', INK, 56, on(t, Wt(5, 3), .3));
  pill(ctx, 800, 330, 'উল্টো U নল', '#ffd23a', INK, 56, on(t, Wt(5, 9), .3));
});
// ======================= 6 the two ends =======================
S(B(6), B(7), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.05, y: 880, vz: .015 }, { glowU: 1, mark: false });
  const a1 = on(t, Wt(6, 1), .4), a2 = on(t, Wt(6, 8), .4);
  arrow(ctx, 190, 520, 480, 650, '#ffd23a', 22, a1); pill(ctx, 230, 440, 'ঢোকার মুখ', '#fff', INK, 46, a1);
  arrow(ctx, 860, 1040, 575, 950, '#ff9fb3', 22, a2); pill(ctx, 820, 1100, 'বের হওয়ার ছিদ্র', '#fff', INK, 46, a2);
});
// ======================= 7 siphon =======================
S(B(7), B(8), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.12, y: 760, vz: .02 }, { glowU: 1, mark: false });
  popIn(ctx, 540, 300, on(t, Wt(7, 2) - .1, .3), c => { rrect(c, -250, -80, 500, 160, 40); fillStroke(c, '#2f63c9', 8); text(c, 'সাইফন', 0, -12, 72, '#fff', INK, 0, BN, 700); text(c, 'Siphon', 0, 50, 36, '#cfe3ff', INK, 0, 'Poppins', 700); });
});
// ======================= 8 fill to the mark: fine =======================
S(B(8), B(9), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.0, vz: .02 }, {});
  pill(ctx, 230, 400, 'দাগ', '#e0392f', '#fff', 50, on(t, Wt(8, 0), .3));
  const ok = on(t, Wt(8, 6), .35); if (ok > 0) { pill(ctx, 330, 1150, 'কোনো সমস্যা নেই', '#3fa35b', '#fff', 44, ok); tick(ctx, 95, 1150, 1.0, ok); }
});
// ======================= 9 pour more: over the bend =======================
S(B(9), B(10), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.0, vz: .02 }, {});
  pill(ctx, 230, 400, 'দাগ পেরিয়ে!', '#e0392f', '#fff', 50, on(t, Wt(9, 2), .3));
  const b = on(t, Wt(9, 9), .25); if (b > 0) { burst(ctx, 540, 400, 90 * backOut(b), 10, '#ffd23a', 6); text(ctx, '!', 540, 405, 90, '#e0392f', INK, 0, 'Poppins', 700); }
}, 'cut');
// ======================= 10 the siphon starts =======================
S(B(10), B(11), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.05, y: 920, vz: .02 }, {});
  pill(ctx, 540, 1090, 'সাইফন চালু!', '#2f63c9', '#fff', 56, on(t, Wt(10, 0), .3));
}, 'cut');
// ======================= 11 gravity pulls =======================
S(B(11), B(12), (ctx, lt, t) => {
  cupScene(ctx, t, lt, { z: 1.0, vz: .015 }, { glowU: 1, flowCol: '#fff' });
  const g = on(t, Wt(11, 4), .4); arrow(ctx, 880, 560, 880, 1000, '#ff9fb3', 26, g); pill(ctx, 870, 470, 'মাধ্যাকর্ষণ', '#fff', INK, 46, g);
  const p = on(t, Wt(11, 9), .4); pill(ctx, 250, 1110, 'পেছনের পানি টানে', '#ffd23a', INK, 40, p);
});
// ======================= 12 drains almost empty =======================
S(B(12), Wt(12, 7) - .1, (ctx, lt, t) => { cupScene(ctx, t, lt, { z: 1.0, vz: .015 }, {}); pill(ctx, 270, 400, 'গোপন নল', '#fff', INK, 50, on(t, Wt(12, 0), .3)); });
S(Wt(12, 7) - .1, B(13), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.05, vz: .04 }); room(ctx, cam, ['#fff1d6', '#ffd99a'], '#c8955a'); applyCam(ctx, cam, 1);
  const pd = on(t, Wt(12, 7) - .1, 1.2); ellipse(ctx, 560, 1255, 300 * pd, 40 * pd); fillStroke(ctx, WATER, 5);
  drawStick(ctx, C(GREEDY, { x: 560, y: 1250, s: 600, arms: { L: [.3, -.1], R: { ik: [.3, -.6] } }, face: { eyes: 'wide', mouth: 'o', look: [.5, -.2] } }));
  ctx.save(); ctx.translate(560 + .3 * 600, 1250 - .6 * 600 + 40); ctx.scale(.22, .22); cupDraw(ctx, 0, 0, 1, { cut: 0 }); ctx.restore();
  for (let i = 0; i < 4; i++) { const yy = 940 + ((t * 500 + i * 80) % 300); ellipse(ctx, 740, yy, 8, 14); ctx.fillStyle = WATER; ctx.fill(); }
  sweat(ctx, 430, 640, 30, 1);
  pill(ctx, 540, 380, 'প্রায় পুরো কাপ খালি!', '#e0392f', '#fff', 52, on(t, Wt(12, 12), .3));
});
// ======================= 13 the legend =======================
S(B(13), B(14), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); greece(ctx, cam, t);
  drawStick(ctx, C(PYTH, { x: 360, y: 1250, s: 600, arms: { L: [.3, -.1], R: { ik: [.42, -.55] } }, face: { eyes: 'normal', mouth: 'smile', look: [.6, 0] } }));
  ctx.save(); ctx.translate(360 + .42 * 600, 1250 - .55 * 600 + 30); ctx.scale(.2, .2); cupDraw(ctx, 0, 0, 1, { cut: 0 }); ctx.restore();
  for (let i = 0; i < 2; i++) drawStick(ctx, C(P, { cols: [PAL.yellow, PAL.purple][i], hair: { style: 'neat', col: '#3a2a20' }, x: 820 + i * 140, y: 1250, s: 380, face: { eyes: 'normal', mouth: 'smile', look: [-.7, 0] } }));
  pill(ctx, 300, 330, 'কথিত আছে', '#fff', INK, 54, on(t, Wt(13, 0), .3));
  nameTag(ctx, 360, 1170, 'পিথাগোরাস', 'গণিতবিদ, সামোস দ্বীপ', on(t, Wt(13, 3), .4), '#3b6fb6');
  pill(ctx, 800, 520, 'পরিমিতিবোধ', '#3fa35b', '#fff', 52, on(t, Wt(13, 7), .3));
});
// ======================= 14 more legend than history =======================
S(B(14), B(15), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#f6efe0', '#e6d6b6'], '#8a6a4a');
  const tl = kf(t, [[B(14), 0], [Wt(14, 7), .25, backOut]]);
  scales(ctx, 540, 820, 1.9, tl);
  const yL = 820 - 170 * 1.9 - Math.sin(tl) * 160 * 1.9 + 120 * 1.9, yR = 820 - 170 * 1.9 + Math.sin(tl) * 160 * 1.9 + 120 * 1.9;
  pill(ctx, 540 - 160 * 1.9, yL - 70, 'ইতিহাস', '#fff', INK, 50, on(t, Wt(14, 3), .3));
  pill(ctx, 540 + 160 * 1.9, yR - 70, 'লোককথা', '#ffd23a', INK, 50, on(t, Wt(14, 7), .3));
});
// ======================= 15 the greedy cup =======================
S(B(15), B(16), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.08, vz: .04 }); room(ctx, cam, ['#ffe6e6', '#ffc2c2'], '#8a5a6a'); applyCam(ctx, cam, 1);
  drawStick(ctx, C(GREEDY, { x: 540, y: 1250, s: 640, bob: Math.sin(t * 20) * .004, arms: { L: [.3, -.1], R: { ik: [.25, -.62] } }, face: { eyes: 'squint', mouth: 'frown', browAng: -.3 } }));
  ctx.save(); ctx.translate(540 + .25 * 640, 1250 - .62 * 640 + 40); ctx.scale(.24, .24); cupDraw(ctx, 0, 0, 1, { cut: 0 }); ctx.restore();
  for (const sd of [-1, 1]) { const yy = 700 + ((t * 300) % 200); ellipse(ctx, 540 + sd * 60, yy, 10, 16); ctx.fillStyle = '#8fd8ff'; ctx.fill(); }
  popIn(ctx, 540, 380, on(t, Wt(15, 4), .3), c => { rrect(c, -230, -75, 460, 150, 40); fillStroke(c, '#e0392f', 8); text(c, 'লোভী কাপ', 0, 4, 76, '#fff', INK, 0, BN, 700); });
});
// ======================= 16 siphons are familiar =======================
S(B(16), B(17), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.05, vz: .04 }); studio(ctx, cam, t);
  drawStick(ctx, host(t, { x: 620, y: 1260, s: 660, arms: { L: [.3, -.1], R: { ik: [.25, -1.0], bend: -1 } }, face: { eyes: 'normal', mouth: talkMouth(t), browOne: 1 } }));
  bulb(ctx, 860, 430, 1.0, on(t, Wt(16, 1), .2));
  pill(ctx, 300, 900, 'খুব চেনা!', '#ffd23a', INK, 50, on(t, Wt(16, 6), .3));
}, 'cut');
// ======================= 17 drum + pipe =======================
S(B(17), B(18), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#e6f0ff', '#c4d6f2'], '#9aa3ad'); applyCam(ctx, cam, 1);
  rrect(ctx, 80, 900, 420, 350, 8); fillStroke(ctx, '#8a5a34', 7);
  const fl = on(t, Wt(17, 2), .4), lvl = clamp((t - Wt(17, 3)) / 3);
  rrect(ctx, 120, 480, 340, 420, 30); fillStroke(ctx, '#2f63c9', 8);
  ctx.save(); rrect(ctx, 140, 500, 300, 380, 20); ctx.clip(); ctx.fillStyle = '#dbe9ff'; ctx.fillRect(140, 500, 300, 380); ctx.fillStyle = WATER; ctx.fillRect(140, 560 + lvl * 160, 300, 400); ctx.restore();
  for (const yy of [600, 780]) line(ctx, 120, yy, 460, yy, 8, '#1e4a9e');
  ctx.beginPath(); ctx.moveTo(330, 860); ctx.lineTo(330, 470); ctx.quadraticCurveTo(330, 420, 400, 420); ctx.quadraticCurveTo(560, 420, 600, 520); ctx.lineTo(760, 1080);
  ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 18; ctx.strokeStyle = '#7fc35a'; ctx.stroke();
  if (fl > 0) { ctx.save(); ctx.setLineDash([26, 22]); ctx.lineDashOffset = -t * 160; ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); rrect(ctx, 752, 1080, 16, 90, 8); ctx.fillStyle = WATER; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(640, 1080); ctx.lineTo(880, 1080); ctx.lineTo(860, 1250); ctx.lineTo(660, 1250); ctx.closePath(); fillStroke(ctx, '#e0392f', 7);
  ctx.save(); ctx.beginPath(); ctx.moveTo(640, 1080); ctx.lineTo(880, 1080); ctx.lineTo(860, 1250); ctx.lineTo(660, 1250); ctx.closePath(); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(600, 1250 - 150 * lvl, 300, 200); ctx.restore();
  drawStick(ctx, C(P, { cols: PAL.yellow, hair: { style: 'tuft', col: '#1d1a1c' }, x: 960, y: 1250, s: 420, arms: { L: { ik: [-.42, -.45] }, R: [.3, -.1] }, face: { eyes: 'happy', mouth: 'grin' } }));
  pill(ctx, 300, 330, 'ড্রাম থেকে পাইপ', '#fff', INK, 50, on(t, Wt(17, 0), .3));
  pill(ctx, 760, 330, 'এটাও সাইফন!', '#2f63c9', '#fff', 54, on(t, Wt(17, 11), .3));
});
// ======================= 18 the proverb =======================
S(B(18), B(19), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); room(ctx, cam, ['#fff1d6', '#ffd99a'], '#c8955a'); applyCam(ctx, cam, 1);
  const cardA = on(t, Wt(18, 0), .35);
  popIn(ctx, 540, 420, cardA, c => { rrect(c, -440, -150, 880, 300, 30); fillStroke(c, '#fff', 8); text(c, 'বেশি লোভ করলে', 0, -50, 66, '#e0392f', INK, 0, BN, 700); text(c, 'যা আছে তাও হারাতে হয়', 0, 50, 62, INK, INK, 0, BN, 700); });
  const k = on(t, Wt(18, 8), .4);
  drawStick(ctx, C(GREEDY, { x: 280, y: 1250, s: 440, face: { eyes: 'squint', mouth: 'frown' }, arms: { L: [.3, -.1], R: { ik: [.42, -.48] } } }));
  ctx.save(); ctx.translate(280 + .42 * 440, 1250 - .48 * 440 + 30); ctx.scale(.36, .36); cupDraw(ctx, 0, 0, 1, { cut: 1, L: GAP + 2, mark: true }); ctx.restore();
  drawStick(ctx, C(MODEST, { x: 800, y: 1250, s: 440, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: { ik: [-.42, -.48] }, R: [.3, -.1] } }));
  ctx.save(); ctx.translate(800 - .42 * 440, 1250 - .48 * 440 + 30); ctx.scale(.36, .36); cupDraw(ctx, 0, 0, 1, { cut: 1, L: MARK + 15, mark: true }); ctx.restore();
  cross(ctx, 280, 700, 1.2, k); tick(ctx, 800, 700, 1.4, k);
});
// ======================= 19 did you know? =======================
S(B(19), B(20), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t);
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, arms: { L: [1.6, -1.6], R: [.3, -.1] }, face: { eyes: 'normal', mouth: talkMouth(t), browOne: 1, look: [-.4, 0] } }));
  thoughtQ(ctx, 760, 520, 80, on(t, Wt(19, 6), .3), t);
  const cm = on(t, Wt(19, 7), .35); if (cm > 0) { popIn(ctx, 330, 940, cm, c => { rrect(c, -250, -80, 500, 160, 40); fillStroke(c, '#fff', 8); text(c, 'কমেন্টে জানান', 0, 4, 58, INK, INK, 0, BN, 700); }); arrow(ctx, 330, 1030, 330, 1200, '#ffd23a', 22, on(t, Wt(19, 8), .4)); }
});
// ======================= 20 follow =======================
S(B(20), B(21), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t);
  const pressed = t > Wt(20, 4) + .25;
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, arms: { L: on(t, Wt(20, 4), .3) > 0 ? { ik: [-.3, -.62] } : [.3, -.1], R: [2.6 + Math.sin(t * 9) * .3, .5] }, face: { eyes: pressed ? 'happy' : 'normal', mouth: talkMouth(t, 'grin') } }));
  popIn(ctx, 360, 950, on(t, Wt(20, 2), .3), c => { c.save(); if (pressed) c.scale(.94, .94); rrect(c, -170, -60, 340, 120, 60); fillStroke(c, pressed ? '#8a8494' : '#e0392f', 8); text(c, pressed ? 'ফলো করা হয়েছে' : 'ফলো', 0, 3, pressed ? 40 : 60, '#fff', INK, 0, BN, 700); c.restore(); });
  if (pressed) { const r = Math.sin(t * 20) * .3 * (1 - on(t, Wt(20, 4) + .8, .5)); ctx.save(); ctx.translate(760, 430); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-60, 40); ctx.quadraticCurveTo(-60, -70, 0, -70); ctx.quadraticCurveTo(60, -70, 60, 40); ctx.lineTo(75, 55); ctx.lineTo(-75, 55); ctx.closePath(); fillStroke(ctx, '#ffd23a', 8); circle(ctx, 0, 72, 16); fillStroke(ctx, '#ffd23a', 6); ctx.restore(); }
  nameTag(ctx, 300, 1180, 'রুবেল মিয়া', 'বিজ্ঞান ও প্রযুক্তি', on(t, B(20), .4), '#2e9e6a');
}, 'cut');
