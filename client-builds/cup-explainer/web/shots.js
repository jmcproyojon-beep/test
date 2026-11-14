// ---------- Pythagorean cup: diagram-style explainer (times come from the voice's word timings) ----------
const _L = {};
function Ln(i) { if (!_L[i]) { const ws = WORDS.filter(w => w.line === i); _L[i] = { s: ws[0].s, e: ws[ws.length - 1].e, w: ws.map(w => w.s) }; } return _L[i]; }
const NL = Math.max(...WORDS.map(w => w.line)) + 1;
const B = i => i <= 0 ? 0 : i >= NL ? Ln(NL - 1).e + 1.0 : (Ln(i - 1).e + Ln(i).s) / 2;
const Wt = (i, k) => Ln(i).w[k];
const on = (t, t0, d = .35) => clamp((t - t0) / d);
const SHOTS = [];
const S = (start, end, draw, tr = 'fade') => SHOTS.push({ start, end, tr, draw });
const cam0 = (t, lt, o = {}) => camAt(t, lt, Object.assign({ hand: 1.5, vz: .012 }, o));

// ---------------- water timeline ----------------
const TT = {};
function cupState(t) {
  if (!TT.f0) Object.assign(TT, { f0: Wt(8, 2), f1: Wt(8, 12) + .3, g0: Wt(11, 2), g1: Wt(11, 9), front: Wt(11, 14), end: Wt(16, 13), brk: Wt(16, 17) });
  TT.cross = TT.g0 + (TT.g1 - TT.g0) * (70 / 85);
  let L = FLOOR, pour = 0;
  if (t < TT.f0) L = FLOOR; else if (t < TT.f1) { L = lerp(FLOOR, -430, ease((t - TT.f0) / (TT.f1 - TT.f0))); pour = 1; }
  else if (t < TT.g0) L = -430; else if (t < TT.g1) { L = lerp(-430, -515, (t - TT.g0) / (TT.g1 - TT.g0)); pour = 1; }
  else if (t < TT.front) L = -515; else if (t < TT.end) { const k = (t - TT.front) / (TT.end - TT.front); L = lerp(-515, GAP + 4, 1 - Math.pow(1 - k, 1.6)); } else L = GAP + 4;
  const on_ = t >= TT.cross && t < TT.brk;
  const La = on_ ? -560 : L;
  let boreTop = TUBE_TOP, boreBot = TUBE_TOP;
  if (on_) boreBot = lerp(TUBE_TOP, 0, clamp((t - TT.cross) / (TT.front - TT.cross)));
  if (t >= TT.brk) { boreBot = 0; boreTop = lerp(TUBE_TOP, 0, clamp((t - TT.brk) / .6)); }
  const out = t >= TT.front && t < TT.brk + .6 ? clamp((t - TT.front) / .2) * (t > TT.brk ? 1 - (t - TT.brk) / .6 : 1) : 0;
  const basin = clamp((t - TT.front) / (TT.brk - TT.front + .6)) * .9;
  const bubbles = t > TT.end - .3 && t < TT.brk + 1.2 ? (t - TT.end + .3) / 1.2 : 0;
  return { L, La, boreTop, boreBot, out, basin, pour, bubbles, t, mode: 'section' };
}
function faucet(ctx, x, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a * 2); rrect(ctx, x - 90, 150, 110, 44, 12); ctx.fillStyle = '#9fb3c8'; ctx.fill(); rrect(ctx, x - 14, 170, 28, 60, 8); ctx.fill(); rrect(ctx, x - 70, 120, 40, 40, 8); ctx.fillStyle = '#c9d6e3'; ctx.fill(); ctx.restore(); }

// ======================= 0 title + intro =======================
S(0, B(2), (ctx, lt, t) => {
  const cam = cam0(t, lt, { vz: .02 }); blueprint(ctx, cam, t);
  ctx.save(); ctx.globalAlpha = .35; const g = ctx.createRadialGradient(540, 860, 50, 540, 860, 520); g.addColorStop(0, CY); g.addColorStop(1, 'rgba(79,209,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 1100); ctx.restore();
  cupDraw(ctx, 540, 1110, .78, { mode: 'solid', phase: t * 1.4 });
  ellipse(ctx, 540, 1112, 190, 22); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
  const ta = on(t, .2, .5); ctx.save(); ctx.globalAlpha = ta; txt(ctx, 'পিথাগোরীয় কাপ', 540, 330 + (1 - ta) * 30, 104, WH); txt(ctx, 'PYTHAGOREAN CUP', 540, 420, 34, CY, 'center', 700, 'Poppins'); ctx.restore();
  chipBox(ctx, 540, 1235, 'কীভাবে কাজ করে?', on(t, Wt(1, 6), .3), { size: 44, col: YE });
  const na = on(t, Wt(0, 2), .4) * (1 - on(t, Wt(1, 4), .4)); if (na > 0) { ctx.save(); ctx.globalAlpha = na; rrect(ctx, 80, 1150, 520, 130, 20); ctx.fillStyle = 'rgba(15,34,56,.95)'; ctx.fill(); ctx.fillStyle = YE; ctx.fillRect(80, 1150, 12, 130); txt(ctx, 'রুবেল মিয়া', 120, 1195, 52, WH, 'left'); txt(ctx, 'বিজ্ঞান ও প্রযুক্তি', 120, 1250, 32, CY, 'left', 600); ctx.restore(); }
});
// ======================= 1 history card =======================
S(B(2), B(3), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  medallion(ctx, 540, 600, 210, on(t, B(2), .5));
  const rows = [[Wt(2, 1), 'প্রাচীন গ্রিস', 'উৎপত্তি'], [Wt(2, 9), 'পিথাগোরাস', 'গণিতবিদ, সামোস দ্বীপ'], [Wt(2, 10) + .3, 'খ্রিস্টপূর্ব ৬ষ্ঠ শতক', 'প্রায় ২৫০০ বছর আগে']];
  rows.forEach(([t0, a, b], i) => { const k = on(t, t0, .35); if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; const y = 900 + i * 120 + (1 - k) * 20; rrect(ctx, 150, y - 48, 780, 100, 20); ctx.fillStyle = 'rgba(15,34,56,.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(79,209,255,.5)'; ctx.stroke(); circle(ctx, 200, y + 2, 14); ctx.fillStyle = [YE, CY, PK][i]; ctx.fill(); txt(ctx, a, 240, y - 10, 42, WH, 'left'); txt(ctx, b, 240, y + 28, 28, '#9fc4e0', 'left', 600); ctx.restore(); });
});
// ======================= 2 anatomy: three parts =======================
S(B(3), B(7), (ctx, lt, t) => {
  const z = kf(t, [[Wt(4, 0) - .3, 1], [Wt(4, 0) + .5, 1.35], [Wt(6, 0) - .2, 1.35], [Wt(6, 0) + .6, 1.0]]);
  const fy = kf(t, [[Wt(4, 0) - .3, 960], [Wt(4, 0) + .5, 760], [Wt(6, 0) - .2, 760], [Wt(6, 0) + .6, 960]]);
  const cam = cam0(t, lt, { z, y: fy, vz: 0, hand: 0 }); blueprint(ctx, cam, t);
  const scan = ease(on(t, Wt(3, 5), 1.0));
  const s = .9, cx = 540, cy = 1080;
  standBasin(ctx, cx, cy, s, 0);
  cupDraw(ctx, cx, cy, s, { scan, phase: t * .8, mark: false, glowSleeve: on(t, Wt(4, 0), .4) * (1 - on(t, Wt(5, 0), .4) * .7), glowU: on(t, Wt(5, 0), .3), glowU2: on(t, Wt(5, 3), 1.2) * .0 + (t > Wt(6, 0) ? on(t, Wt(6, 0), 1.6) : 0), glowHole: on(t, Wt(6, 9), .3), t });
  const P = (lx, ly) => [540 + (cx + lx * s - cam.x) * z, 960 + (cy + ly * s - cam.y) * z];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (scan >= 1) {
    const [a1x, a1y] = P(-52, -420); callout(ctx, a1x, a1y, 330, 470, 'ফাঁপা খুঁটি', on(t, Wt(4, 0), .6), { num: 1, col: CY, size: 36 });
    const [a2x, a2y] = P(0, -538); callout(ctx, a2x, a2y, 740, 400, 'উল্টো U নল', on(t, Wt(5, 0), .6), { num: 2, col: YE, size: 36 });
    const bk = on(t, Wt(5, 9), .4); if (bk > 0) { const [, by] = P(0, -500); ctx.save(); ctx.globalAlpha = bk; ctx.setLineDash([12, 10]); line(ctx, 140, by, 940, by, 4, YE); ctx.restore(); chipBox(ctx, 740, by + 70, 'বাঁকের উচ্চতা', bk, { size: 30, col: YE, align: 'left' }); }
    const [a3x, a3y] = P(0, 0); callout(ctx, a3x, a3y, 740, 1230, 'নিচের ছিদ্র', on(t, Wt(6, 9), .6), { num: 3, col: PK, size: 36 });
  }
  ctx.restore();
  chipBox(ctx, 540, 1235, 'ভেতরে ৩টি অংশ', on(t, Wt(3, 8), .3) * (1 - on(t, Wt(4, 0) - .3, .3)), { size: 42, col: YE });
});
// ======================= 3 step overview =======================
S(B(7), B(8), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  txt(ctx, 'ধাপে ধাপে', 540, 400, 80, WH);
  ['পানি ঢালা', 'বাঁক পার হওয়া', 'সাইফন চালু', 'সাইফন থামা'].forEach((s, i) => chipBox(ctx, 540, 560 + i * 150, s, on(t, B(7) + .15 + i * .18, .3), { num: i + 1, size: 48, col: [CY, YE, GR, PK][i] }));
});
// ======================= 4 the steps: one continuous diagram =======================
function stepScene(ctx, lt, t) {
  const cam = cam0(t, lt, { vz: .004 }); blueprint(ctx, cam, t);
  const st = cupState(t);
  const m = ease(on(t, B(13) - .3, .7)) * (1 - ease(on(t, B(16) - .4, .7)));
  const cx = lerp(540, 285, m), cy = lerp(1010, 950, m), s = lerp(.88, .6, m);
  const P = (lx, ly) => [cx + lx * s, cy + ly * s];
  standBasin(ctx, cx, cy, s, st.basin);
  cupDraw(ctx, cx, cy, s, Object.assign(st, { mark: t > Wt(10, 3) - .2, glowU: m > .5 ? 0 : (t > TT.cross && t < TT.brk ? .8 : 0), uCol: '#ffffff' }));
  const X = cx + 140 * s; faucet(ctx, X, st.pour ? 1 : 0); if (st.pour) { ctx.save(); ctx.shadowColor = CY; ctx.shadowBlur = 12; rrect(ctx, X - 7, 228, 14, cy + st.L * s - 228, 7); ctx.fillStyle = WATER; ctx.fill(); ctx.restore(); }
  // step 1 annotations
  const eq = on(t, Wt(8, 11), .35) * (1 - on(t, Wt(9, 5), .3));
  if (eq > 0) { const [lx, ly] = P(-160, st.L), [rx, ry] = P(-31, st.La); ctx.save(); ctx.globalAlpha = eq; for (const [xx, yy] of [[lx, ly], [rx, ry]]) { path(ctx, [[xx - 16, yy - 26], [xx + 16, yy - 26], [xx, yy - 4]]); ctx.fillStyle = YE; ctx.fill(); } ctx.restore(); chipBox(ctx, 540, 362, 'খুঁটির ভেতরে আর বাইরে: সমান উচ্চতা', eq, { size: 34, col: YE }); }
  const ann = on(t, Wt(8, 4), .4) * (1 - on(t, Wt(8, 11), .3)); if (ann > 0) { const [ax, ay] = P(-31, -380); callout(ctx, ax, ay, 330, 470, 'খুঁটির ভেতরেও পানি', ann, { col: CY, size: 32 }); }
  const bend = on(t, Wt(9, 2), .4) * (1 - on(t, B(11), .3)); if (bend > 0) { ctx.save(); ctx.globalAlpha = bend; ctx.setLineDash([12, 10]); const [x0, y0] = P(-250, TUBE_TOP), [x1] = P(250, TUBE_TOP); line(ctx, x0, y0, x1, y0, 4, YE); ctx.restore(); chipBox(ctx, P(250, 0)[0] + 20, P(0, TUBE_TOP)[1], 'বাঁক', bend, { size: 32, col: YE, align: 'left' }); }
  chipBox(ctx, 540, 362, 'কিছুই ঘটে না', on(t, Wt(9, 6), .3) * (1 - on(t, Wt(10, 0), .3)), { size: 40, col: GR });
  const mk = on(t, Wt(10, 3), .35) * (1 - on(t, B(11), .3)); if (mk > 0) {
    chipBox(ctx, P(-250, 0)[0] - 20, P(0, MARK)[1], 'দাগ', mk, { size: 32, col: PK, align: 'right' });
    const gk = on(t, Wt(10, 6), .35); if (gk > 0) { const [bx, by0] = P(250, TUBE_TOP), [, by1] = P(0, MARK); ctx.save(); ctx.globalAlpha = gk; line(ctx, bx + 20, by0, bx + 20, by1, 5, WH); line(ctx, bx + 8, by0, bx + 32, by0, 5, WH); line(ctx, bx + 8, by1, bx + 32, by1, 5, WH); ctx.restore(); chipBox(ctx, bx + 45, (by0 + by1) / 2 + 60, 'একটু নিচে', gk, { size: 30, col: WH, align: 'left' }); }
  }
  // step 2
  const sp = on(t, Wt(11, 9), .25) * (1 - on(t, Wt(12, 0), .4)); if (sp > 0) { const [bx, by] = P(0, -540); ctx.save(); ctx.globalAlpha = sp; burst(ctx, bx, by, 70 * backOut(sp), 10, YE, 6); ctx.restore(); chipBox(ctx, 540, 362, 'বাঁক ডিঙিয়ে নলের লম্বা অংশে', sp, { size: 36, col: YE }); }
  // step 3
  chipBox(ctx, 540, 362, 'সাইফন চালু!', on(t, Wt(12, 3), .3) * (1 - on(t, B(13) - .4, .3)), { size: 46, col: GR });
  if (m > 0) siphonPanel(ctx, t, m);
  // step 4
  const air = on(t, Wt(16, 10), .35) * (1 - on(t, B(17), .3)); if (air > 0) { const [ax, ay] = P(-45, GAP + 6); callout(ctx, ax, ay, 330, 560, 'ঢোকার মুখ', air, { col: PK, size: 32 }); }
  chipBox(ctx, 540, 362, 'বাতাস ঢুকলো, সাইফন বন্ধ', on(t, Wt(16, 17), .3) * (1 - on(t, B(17), .3)), { size: 38, col: PK });
  chipBox(ctx, 540, 362, 'কাপ প্রায় খালি!', on(t, Wt(17, 1), .3), { size: 46, col: PK });
}
function siphonPanel(ctx, t, m) {
  const a = m; ctx.save(); ctx.globalAlpha = 1; panel(ctx, 545, 300, 500, 940, a, 'কেন পানি চলতেই থাকে?');
  if (a < .6) { ctx.restore(); return; }
  ctx.globalAlpha = clamp((a - .6) / .4);
  const surf = 650 + 30 * clamp((t - B(13)) / (B(16) - B(13)));
  beaker(ctx, 595, 580, 210, 260, (840 - surf) / 260);
  // tube
  const tube = () => { ctx.beginPath(); ctx.moveTo(700, 800); ctx.lineTo(700, 560); ctx.quadraticCurveTo(700, 500, 760, 500); ctx.lineTo(880, 500); ctx.quadraticCurveTo(940, 500, 940, 560); ctx.lineTo(940, 1090); };
  tube(); ctx.lineWidth = 34; ctx.strokeStyle = 'rgba(200,225,250,.9)'; ctx.stroke(); tube(); ctx.lineWidth = 24; ctx.strokeStyle = WATER; ctx.stroke();
  ctx.save(); ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 110; tube(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke(); ctx.restore();
  rrect(ctx, 933, 1090, 14, 70, 7); ctx.fillStyle = WATER; ctx.fill(); beaker(ctx, 880, 1160, 120, 60, .5);
  // long leg = heavier
  const lk = on(t, Wt(13, 1), .4); if (lk > 0) { glowLine(ctx, () => { ctx.beginPath(); ctx.moveTo(940, 520); ctx.lineTo(940, 1090); }, YE, 10, lk); darrow(ctx, 1000, 760, 1000, 980, YE, 9, lk); chipBox(ctx, 1015, 700, 'লম্বা বাহু', lk, { size: 28, col: YE, align: 'right' }); }
  const sk = on(t, Wt(13, 4), .4); if (sk > 0) { glowLine(ctx, () => { ctx.beginPath(); ctx.moveTo(700, surf); ctx.lineTo(700, 520); }, CY, 10, sk); chipBox(ctx, 600, 470, 'ছোট বাহু', sk, { size: 28, col: CY, align: 'left' }); chipBox(ctx, 1015, 1040, 'ভারী, তাই নামে', on(t, Wt(13, 6), .3), { size: 26, col: YE, align: 'right' }); }
  // air pressure
  const pk = on(t, Wt(14, 8), .4); if (pk > 0) { for (const x of [630, 770]) darrow(ctx, x, surf - 110, x, surf - 10, PK, 8, pk); chipBox(ctx, 700, 395, 'বাতাসের চাপ', pk, { size: 30, col: PK }); }
  const ck = on(t, Wt(15, 3), .35); if (ck > 0) chipBox(ctx, 795, 1220, 'অবিচ্ছিন্ন স্রোত', ck, { size: 28, col: GR });
  ctx.restore();
}
for (let i = 8; i < 18; i++) S(B(i), B(i + 1), (ctx, lt, t) => stepScene(ctx, lt, t), i === 17 ? 'fade' : 'seam');
// ======================= 5 the rule =======================
function miniSiphon(ctx, x, y, outY, t, flows) {
  beaker(ctx, x - 120, y, 160, 200, .7);
  const surf = y + 200 - 140;
  ctx.beginPath(); ctx.moveTo(x - 40, y + 170); ctx.lineTo(x - 40, y - 40); ctx.quadraticCurveTo(x - 40, y - 80, x, y - 80); ctx.lineTo(x + 60, y - 80); ctx.quadraticCurveTo(x + 100, y - 80, x + 100, y - 40); ctx.lineTo(x + 100, outY);
  ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(200,225,250,.9)'; ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = flows ? WATER : '#16263a'; ctx.stroke();
  if (flows) { ctx.save(); ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 90; ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); rrect(ctx, x + 94, outY, 12, 60, 6); ctx.fillStyle = WATER; ctx.fill(); }
  ctx.save(); ctx.setLineDash([10, 8]); line(ctx, x - 160, surf, x + 180, surf, 4, YE); ctx.restore();
  circle(ctx, x + 100, outY, 12); ctx.fillStyle = flows ? GR : PK; ctx.fill();
}
S(B(18), B(19), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  txt(ctx, 'মনে রাখার সূত্র', 540, 340, 64, WH);
  const a = on(t, Wt(18, 3), .4), b = on(t, Wt(18, 12), .4);
  ctx.save(); ctx.globalAlpha = a; miniSiphon(ctx, 300, 640, 1010, t, true); checkMark(ctx, 300, 1130, 1.3, on(t, Wt(18, 12), .5)); txt(ctx, 'মুখ নিচে: চলে', 300, 1220, 36, GR); ctx.restore();
  ctx.save(); ctx.globalAlpha = b; miniSiphon(ctx, 760, 640, 690, t, false); xMark(ctx, 760, 1130, 1.3, on(t, Wt(18, 12) + .3, .5)); txt(ctx, 'মুখ ওপরে: থামে', 760, 1220, 36, PK); ctx.restore();
  chipBox(ctx, 540, 470, 'বের হওয়ার মুখ < পানির উপরিতল', on(t, Wt(18, 6), .35), { size: 34, col: YE });
});
// ======================= 6 try it at home =======================
S(B(19), B(20), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  txt(ctx, 'নিজে করে দেখুন', 540, 340, 62, WH);
  rrect(ctx, 110, 820, 330, 30, 8); ctx.fillStyle = '#3a5674'; ctx.fill(); line(ctx, 150, 850, 150, 1240, 10, '#3a5674'); line(ctx, 400, 850, 400, 1240, 10, '#3a5674');
  const fl = on(t, Wt(19, 8), .3), lv = clamp((t - Wt(19, 8)) / 4);
  beaker(ctx, 140, 560, 250, 260, .78 - .25 * lv); beaker(ctx, 700, 1060, 260, 180, .1 + .55 * lv);
  ctx.beginPath(); ctx.moveTo(250, 780); ctx.lineTo(250, 520); ctx.quadraticCurveTo(250, 470, 310, 470); ctx.lineTo(560, 470); ctx.quadraticCurveTo(620, 470, 640, 540); ctx.lineTo(800, 1120);
  ctx.lineWidth = 30; ctx.strokeStyle = 'rgba(160,220,140,.9)'; ctx.stroke(); ctx.lineWidth = 18; ctx.strokeStyle = fl > 0 ? WATER : '#16263a'; ctx.stroke();
  if (fl > 0) { ctx.save(); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 120; ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); }
  ['পাইপ পানিতে ভরে নিন', 'এক মুখ উঁচু বালতিতে', 'অন্য মুখ নিচের পাত্রে'].forEach((s, i) => chipBox(ctx, 1000, 600 + i * 110, s, on(t, Wt(19, [2, 8, 11][i]), .3), { num: i + 1, size: 30, col: [CY, YE, GR][i], align: 'right' }));
  chipBox(ctx, 540, 1235, 'মুখ দিয়ে টানবেন না', on(t, Wt(19, 13), .3), { size: 32, col: PK });
});
// ======================= 7 legend =======================
S(B(20), B(21), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  medallion(ctx, 540, 560, 180, on(t, B(20), .4));
  chipBox(ctx, 540, 800, 'কথিত আছে: পরিমিতিবোধের শিক্ষা', on(t, Wt(20, 6), .35), { size: 34, col: YE });
  const bars = [[Wt(20, 11), 'ইতিহাস', .35, CY], [Wt(20, 15), 'লোককথা', .85, PK]];
  bars.forEach(([t0, s, v, col], i) => { const k = ease(on(t, t0, .6)); const y = 940 + i * 140; txt(ctx, s, 200, y, 40, WH, 'left'); rrect(ctx, 400, y - 30, 560, 60, 30); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); if (k > 0) { rrect(ctx, 400, y - 30, 560 * v * k, 60, 30); ctx.fillStyle = col; ctx.fill(); } });
});
// ======================= 8 the lesson =======================
S(B(21), B(22), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  const k = on(t, Wt(21, 3), .4);
  cupDraw(ctx, 290, 1000, .5, { mode: 'section', L: -430, mark: true, t }); cupDraw(ctx, 790, 1000, .5, { mode: 'section', L: GAP + 4, mark: true, t });
  checkMark(ctx, 290, 1110, 1.2, k); xMark(ctx, 790, 1110, 1.2, k);
  txt(ctx, 'পরিমিত', 290, 1200, 40, GR); txt(ctx, 'লোভ', 790, 1200, 40, PK);
  const pa = on(t, Wt(21, 3), .35); ctx.save(); ctx.globalAlpha = pa; panel(ctx, 90, 300, 900, 240, 1); txt(ctx, 'বেশি লোভ করলে', 540, 380, 58, YE); txt(ctx, 'যা আছে তাও হারাতে হয়', 540, 465, 54, WH); ctx.restore();
});
// ======================= 9 outro =======================
S(B(22), B(23), (ctx, lt, t) => {
  const cam = cam0(t, lt); blueprint(ctx, cam, t);
  cupDraw(ctx, 540, 860, .6, { mode: 'solid', phase: t * 1.4 });
  txt(ctx, 'রুবেল মিয়া', 540, 1000, 78, WH); txt(ctx, 'সহজ ভাষায় বিজ্ঞান', 540, 1075, 38, CY, 'center', 600);
  const pr = t > Wt(22, 5) + .25; const fa = on(t, Wt(22, 4), .3);
  if (fa > 0) { ctx.save(); ctx.translate(540, 1200); const kk = .8 + .2 * backOut(fa); ctx.scale(kk * (pr ? .95 : 1), kk * (pr ? .95 : 1)); rrect(ctx, -170, -55, 340, 110, 55); ctx.fillStyle = pr ? '#4a5d72' : '#e0392f'; ctx.fill(); txt(ctx, pr ? 'ফলো করা হয়েছে' : 'ফলো', 0, 3, pr ? 38 : 56, '#fff'); ctx.restore(); }
}, 'cut');

// ---------------- chapter chip + progress (drawn over every frame) ----------------
const CHAP = [[B(2), B(3), 'ইতিহাস'], [B(3), B(7), 'গঠন'], [B(8), B(11), 'ধাপ ১: পানি ঢালা', 1], [B(11), B(12), 'ধাপ ২: বাঁক পার', 2], [B(12), B(16), 'ধাপ ৩: সাইফন', 3], [B(16), B(18), 'ধাপ ৪: থেমে যাওয়া', 4], [B(18), B(19), 'সূত্র'], [B(19), B(20), 'পরীক্ষা'], [B(20), B(22), 'শিক্ষা']];
window.OVERLAY = (ctx, t) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const total = B(23); rrect(ctx, 90, 222, 900, 8, 4); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill(); rrect(ctx, 90, 222, 900 * clamp(t / total), 8, 4); ctx.fillStyle = CY; ctx.fill();
  const c = CHAP.find(c => t >= c[0] && t < c[1]); if (!c) return;
  const a = on(t, c[0], .3) * (1 - on(t, c[1] - .25, .25));
  ctx.save(); ctx.globalAlpha = a; ctx.font = `700 30px ${BN}`; const w = ctx.measureText(c[2]).width + 40; rrect(ctx, 90, 248, w, 50, 25); ctx.fillStyle = 'rgba(79,209,255,.18)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = CY; ctx.stroke(); txt(ctx, c[2], 110, 275, 30, WH, 'left');
  if (c[3]) for (let i = 1; i <= 4; i++) { circle(ctx, 90 + w + 30 + (i - 1) * 30, 273, 9); ctx.fillStyle = i <= c[3] ? YE : 'rgba(255,255,255,.25)'; ctx.fill(); }
  ctx.restore();
};
