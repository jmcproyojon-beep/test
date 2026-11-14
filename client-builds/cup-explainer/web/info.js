// ---------- diagram-style explainer kit: blueprint background, shaded cup, callouts, panels ----------
const BG1 = '#0b1726', BG2 = '#13304b', CY = '#4fd1ff', YE = '#ffd23a', PK = '#ff7a9a', GR = '#3ddc84', WH = '#eef6ff', PANEL = '#0f2238';
const TERRA = '#b8673c', WATER = '#3fb4f5';
const MARK = -440, TUBE_TOP = -500, FLOOR = -262, GAP = -290;

function blueprint(ctx, cam, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG2); g.addColorStop(1, BG1); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  applyCam(ctx, cam, .5);
  for (let x = -1200; x < 2400; x += 60) { ctx.fillStyle = x % 300 === 0 ? 'rgba(120,200,255,.10)' : 'rgba(120,200,255,.045)'; ctx.fillRect(x, -1500, 2, 5000); }
  for (let y = -1500; y < 3500; y += 60) { ctx.fillStyle = y % 300 === 0 ? 'rgba(120,200,255,.10)' : 'rgba(120,200,255,.045)'; ctx.fillRect(-1200, y, 3600, 2); }
  applyCam(ctx, cam, 1);
}
function txt(ctx, s, x, y, size, col = WH, align = 'center', weight = 700, font = BN) { ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, x, y); }
function glowLine(ctx, draw, col, w, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = col; ctx.shadowBlur = 18; draw(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
function chipBox(ctx, x, y, s, a = 1, o = {}) {
  if (a <= 0) return; const size = o.size || 40, col = o.col || CY;
  ctx.save(); ctx.globalAlpha = clamp(a * 1.5); ctx.translate(x, y); const k = .8 + .2 * backOut(clamp(a)); ctx.scale(k, k);
  ctx.font = `700 ${size}px ${BN}`; const tw = ctx.measureText(s).width; const num = o.num != null; const w = tw + 48 + (num ? size * 1.3 : 0), h = size * 1.6;
  const x0 = o.align === 'left' ? 0 : o.align === 'right' ? -w : -w / 2;
  rrect(ctx, x0, -h / 2, w, h, h / 2); ctx.fillStyle = o.fill || PANEL; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
  if (num) { circle(ctx, x0 + h / 2, 0, h / 2 - 8); ctx.fillStyle = col; ctx.fill(); txt(ctx, bnum(o.num), x0 + h / 2, 3, size * .8, '#0b1726'); }
  txt(ctx, s, x0 + (num ? size * 1.3 : 0) + w / 2 - (num ? size * .65 : 0), 3, size, o.tcol || WH);
  ctx.restore();
}
// callout: anchor dot + leader line + label chip
function callout(ctx, ax, ay, lx, ly, s, a, o = {}) {
  if (a <= 0) return; const col = o.col || CY; const k = clamp(a * 2);
  const ex = lerp(ax, lx, k), ey = lerp(ay, ly, k);
  ctx.save(); ctx.globalAlpha = clamp(a * 3); circle(ctx, ax, ay, 12); ctx.fillStyle = col; ctx.fill();
  circle(ctx, ax, ay, 12 + 14 * ((a * 3) % 1)); ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.globalAlpha = .6 * (1 - (a * 3) % 1); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
  if (k >= 1) chipBox(ctx, lx, ly, s, clamp(a * 2 - 1), Object.assign({ col, align: lx < ax ? 'right' : 'left' }, o));
}
function panel(ctx, x, y, w, h, a = 1, title) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a * 1.4);
  rrect(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(15,34,56,.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(79,209,255,.6)'; ctx.stroke();
  if (title) { txt(ctx, title, x + w / 2, y + 48, 40, CY); line(ctx, x + 30, y + 86, x + w - 30, y + 86, 3, 'rgba(79,209,255,.35)'); }
  ctx.restore();
}
function darrow(ctx, x1, y1, x2, y2, col = YE, w = 10, k = 1) { // thin diagram arrow
  if (k <= 0) return; const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(ey - y1, ex - x1);
  line(ctx, x1, y1, ex - Math.cos(a) * w * 1.6, ey - Math.sin(a) * w * 1.6, w, col);
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); path(ctx, [[4, 0], [-w * 3, -w * 2], [-w * 3, w * 2]]); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
function checkMark(ctx, x, y, s, a, col = GR) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const k = clamp(a); ctx.beginPath(); ctx.moveTo(-30, 0); if (k < .4) ctx.lineTo(-30 + 25 * k / .4, 25 * k / .4); else { ctx.lineTo(-5, 25); ctx.lineTo(-5 + 45 * (k - .4) / .6, 25 - 60 * (k - .4) / .6); } ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
function xMark(ctx, x, y, s, a, col = PK) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const k1 = clamp(a * 2), k2 = clamp(a * 2 - 1); line(ctx, -28, -28, -28 + 56 * k1, -28 + 56 * k1, 12, col); if (k2 > 0) line(ctx, 28, -28, 28 - 56 * k2, -28 + 56 * k2, 12, col); ctx.restore(); }

// ---------------- cup geometry (local units: base centre at 0, y up negative) ----------------
function cupOuterPath(ctx) {
  const R = [[170, 0], [170, -26], [62, -42], [44, -64], [46, -228]];
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(170, 0); for (const [x, y] of R.slice(1)) ctx.lineTo(x, y);
  ctx.quadraticCurveTo(70, -262, 160, -274); ctx.quadraticCurveTo(220, -290, 223, -360); ctx.lineTo(228, -520); ctx.quadraticCurveTo(232, -600, 306, -655); ctx.lineTo(294, -670); ctx.lineTo(286, -662);
  ctx.lineTo(-286, -662); ctx.lineTo(-294, -670); ctx.lineTo(-306, -655); ctx.quadraticCurveTo(-232, -600, -228, -520); ctx.lineTo(-223, -360); ctx.quadraticCurveTo(-220, -290, -160, -274); ctx.quadraticCurveTo(-70, -262, -46, -228);
  for (const [x, y] of R.slice(1).reverse()) ctx.lineTo(-x, y); ctx.closePath();
}
function cavityPath(ctx) {
  ctx.beginPath(); ctx.moveTo(-150, FLOOR); ctx.lineTo(150, FLOOR); ctx.quadraticCurveTo(201, -268, 204, -330); ctx.lineTo(209, -520); ctx.quadraticCurveTo(214, -600, 286, -662);
  ctx.lineTo(-286, -662); ctx.quadraticCurveTo(-214, -600, -209, -520); ctx.lineTo(-204, -330); ctx.quadraticCurveTo(-201, -268, -150, FLOOR); ctx.closePath();
}
const sleevePath = (ctx) => { ctx.beginPath(); ctx.moveTo(-52, GAP); ctx.lineTo(-52, -508); ctx.arc(0, -508, 52, Math.PI, 0); ctx.lineTo(52, GAP); ctx.closePath(); };
const sleeveIn = (ctx) => { ctx.beginPath(); ctx.moveTo(-38, FLOOR + 2); ctx.lineTo(-38, -508); ctx.arc(0, -508, 38, Math.PI, 0); ctx.lineTo(38, FLOOR + 2); ctx.closePath(); };
const uPath = (ctx, k = 1) => { ctx.beginPath(); ctx.moveTo(-31, FLOOR - 8); ctx.lineTo(-31, -508); ctx.quadraticCurveTo(-31, -538, 0, -538); ctx.quadraticCurveTo(0, -520, 0, -500); ctx.lineTo(0, -500 + 500 * k); };

function terraGrad(ctx, phase = 0) {
  const g = ctx.createLinearGradient(-320, 0, 320, 0); const p = Math.sin(phase) * .08;
  g.addColorStop(0, '#5a2a14'); g.addColorStop(.25 + p, '#c47a4a'); g.addColorStop(.38 + p, '#efb084'); g.addColorStop(.55 + p, '#c06e40'); g.addColorStop(.85, '#7a3a1c'); g.addColorStop(1, '#4a200e'); return g;
}
function hatch(ctx, pathFn, col = 'rgba(255,230,210,.18)') { ctx.save(); pathFn(ctx); ctx.clip(); ctx.beginPath(); for (let x = -900; x < 900; x += 22) { ctx.moveTo(x, 40); ctx.lineTo(x + 700, -700); } ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); }

// st: {mode:'solid'|'section', scan 0..1, phase, L, La, boreTop, boreBot, out, glowSleeve, glowU, glowU2, glowHole, mark, bubbles, t}
function cupDraw(ctx, x, y, s, st = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const solid = () => {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; cupOuterPath(ctx); ctx.fillStyle = terraGrad(ctx, st.phase || 0); ctx.fill(); ctx.restore();
    ctx.save(); cupOuterPath(ctx); ctx.clip();
    const ph = ((st.phase || 0) * 60) % 55;
    ctx.fillStyle = 'rgba(28,16,12,.92)'; ctx.fillRect(-320, -588, 640, 62);
    ctx.fillStyle = '#d98a55'; for (let i = -7; i < 7; i++) { const bx = i * 55 + ph; ctx.fillRect(bx + 8, -578, 34, 8); ctx.fillRect(bx + 34, -578, 8, 34); ctx.fillRect(bx + 18, -552, 24, 8); ctx.fillRect(bx + 18, -563, 8, 19); }
    ctx.fillStyle = 'rgba(28,16,12,.9)'; ctx.fillRect(-320, -332, 640, 20);
    const sh = ctx.createLinearGradient(-320, 0, 320, 0); sh.addColorStop(0, 'rgba(0,0,0,.35)'); sh.addColorStop(.3, 'rgba(0,0,0,0)'); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = sh; ctx.fillRect(-320, -700, 640, 720);
    ctx.restore();
    ellipse(ctx, 0, -664, 292, 30); const ig = ctx.createLinearGradient(0, -694, 0, -634); ig.addColorStop(0, '#2a140a'); ig.addColorStop(1, '#6b341a'); ctx.fillStyle = ig; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#e9a676'; ctx.stroke();
    ellipse(ctx, 0, 0, 170, 18); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
  };
  const section = () => {
    const L = st.L == null ? FLOOR : st.L, La = st.La == null ? L : st.La;
    cupOuterPath(ctx); ctx.fillStyle = '#b8673c'; ctx.fill(); hatch(ctx, cupOuterPath); cupOuterPath(ctx); ctx.lineWidth = 4; ctx.strokeStyle = '#f2c39b'; ctx.stroke();
    cavityPath(ctx); ctx.fillStyle = '#16263a'; ctx.fill();
    ctx.save(); cavityPath(ctx); ctx.clip();
    if (L < FLOOR) { const wg = ctx.createLinearGradient(0, L, 0, FLOOR); wg.addColorStop(0, '#7fd6ff'); wg.addColorStop(1, '#1f7fd0'); ctx.fillStyle = wg; ctx.globalAlpha = .92; ctx.beginPath(); ctx.moveTo(-320, L); for (let xx = -320; xx <= 320; xx += 20) ctx.lineTo(xx, L + Math.sin(xx * .04 + (st.t || 0) * 4) * 3); ctx.lineTo(320, 40); ctx.lineTo(-320, 40); ctx.fill(); ctx.globalAlpha = 1; line(ctx, -320, L, 320, L, 4, 'rgba(220,245,255,.9)'); }
    ctx.restore(); cavityPath(ctx); ctx.lineWidth = 4; ctx.strokeStyle = '#f2c39b'; ctx.stroke();
    if (st.mark !== false) { ctx.save(); ctx.setLineDash([14, 10]); line(ctx, -205, MARK, 205, MARK, 4, PK); ctx.restore(); for (const sd of [-1, 1]) line(ctx, sd * 228, MARK, sd * 204, MARK, 8, PK); }
    if (st.glowSleeve) glowLine(ctx, () => sleevePath(ctx), CY, 12, st.glowSleeve);
    sleevePath(ctx); ctx.fillStyle = '#b8673c'; ctx.fill(); hatch(ctx, sleevePath); sleevePath(ctx); ctx.lineWidth = 3; ctx.strokeStyle = '#f2c39b'; ctx.stroke();
    sleeveIn(ctx); ctx.fillStyle = '#16263a'; ctx.fill();
    if (La < FLOOR) { ctx.save(); sleeveIn(ctx); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(-60, La, 120, 400); line(ctx, -40, La, 40, La, 3, 'rgba(220,245,255,.9)'); ctx.restore(); }
    rrect(ctx, -26, TUBE_TOP, 52, FLOOR - TUBE_TOP + 4, [10, 10, 0, 0]); ctx.fillStyle = '#b8673c'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#f2c39b'; ctx.stroke();
    ctx.fillStyle = '#16263a'; ctx.fillRect(-12, TUBE_TOP - 2, 24, -TUBE_TOP + 2);
    if (st.boreBot != null && st.boreBot > st.boreTop) { ctx.fillStyle = WATER; ctx.fillRect(-12, st.boreTop, 24, st.boreBot - st.boreTop); }
    line(ctx, -12, TUBE_TOP, -12, 0, 3, '#f2c39b'); line(ctx, 12, TUBE_TOP, 12, 0, 3, '#f2c39b');
    if (st.bubbles) for (let i = 0; i < 6; i++) { const ph = (st.bubbles * 1.6 + i * .17) % 1; if (st.bubbles * 1.6 < i * .17) continue; circle(ctx, (i % 2 ? -32 : 32), lerp(GAP + 10, -500, ph), 7 + (i % 3) * 2); ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.stroke(); }
    if (st.glowU) { ctx.save(); ctx.setLineDash([20, 14]); ctx.lineDashOffset = -(st.t || 0) * 100; glowLine(ctx, () => uPath(ctx, st.glowU2 == null ? 1 : st.glowU2), st.uCol || YE, 8, st.glowU); ctx.restore(); }
    if (st.glowHole) { const k = st.glowHole; ctx.save(); ctx.globalAlpha = k; circle(ctx, 0, 0, 22 + 14 * Math.sin((st.t || 0) * 6)); ctx.lineWidth = 6; ctx.strokeStyle = PK; ctx.stroke(); ctx.restore(); }
  };
  const scan = st.scan == null ? (st.mode === 'solid' ? 0 : 1) : st.scan;
  if (scan <= 0) solid(); else if (scan >= 1) section();
  else { solid(); const yy = -700 + 740 * (1 - scan); ctx.save(); ctx.beginPath(); ctx.rect(-360, yy, 720, 800); ctx.clip(); section(); ctx.restore(); glowLine(ctx, () => { ctx.beginPath(); ctx.moveTo(-360, yy); ctx.lineTo(360, yy); }, CY, 6, 1); }
  if (st.out > 0) { const w = 16 * st.out; ctx.save(); ctx.shadowColor = CY; ctx.shadowBlur = 14; rrect(ctx, -w / 2, 0, w, 205, w / 2); ctx.fillStyle = WATER; ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function standBasin(ctx, x, y, s, basin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sd of [-1, 1]) line(ctx, sd * 150, 4, sd * 230, 330, 8, 'rgba(160,190,220,.7)');
  rrect(ctx, -190, 0, 380, 16, 6); ctx.fillStyle = '#3a5674'; ctx.fill();
  const bp = () => { ctx.beginPath(); ctx.moveTo(-170, 228); ctx.lineTo(170, 228); ctx.quadraticCurveTo(160, 330, 0, 335); ctx.quadraticCurveTo(-160, 330, -170, 228); };
  bp(); ctx.fillStyle = 'rgba(160,200,240,.12)'; ctx.fill();
  if (basin > 0) { ctx.save(); bp(); ctx.clip(); ctx.fillStyle = WATER; ctx.fillRect(-200, 335 - 100 * basin, 400, 200); ctx.restore(); }
  bp(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,225,250,.85)'; ctx.stroke();
  ctx.restore();
}
function medallion(ctx, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a * 1.5); ctx.translate(x, y); const k = .85 + .15 * backOut(clamp(a)); ctx.scale(k, k);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#f1d9a8'); g.addColorStop(1, '#a57a3c'); circle(ctx, 0, 0, r); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = r * .06; ctx.strokeStyle = '#6b4a1e'; ctx.stroke();
  circle(ctx, 0, 0, r * .86); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(107,74,30,.6)'; ctx.stroke();
  ctx.scale(r / 200, r / 200); ctx.fillStyle = '#7a5524';
  ctx.beginPath(); ctx.moveTo(-70, -120); ctx.quadraticCurveTo(20, -160, 60, -90); ctx.lineTo(62, -55); ctx.lineTo(92, -18); ctx.lineTo(62, -8); ctx.lineTo(66, 10); ctx.lineTo(56, 18);
  ctx.quadraticCurveTo(70, 70, 40, 120); ctx.quadraticCurveTo(0, 150, -40, 110); ctx.lineTo(-50, 150); ctx.lineTo(-110, 150); ctx.lineTo(-90, 60); ctx.quadraticCurveTo(-130, -40, -70, -120); ctx.fill();
  ctx.fillStyle = '#5aa043'; for (let i = 0; i < 7; i++) { const a2 = -2.6 + i * .32; ellipse(ctx, -10 + Math.cos(a2) * 95, -40 + Math.sin(a2) * 95, 18, 8, a2 + 1.6); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,240,210,.5)'; ellipse(ctx, 30, -60, 10, 6); ctx.fill();
  ctx.restore();
}
function beaker(ctx, x, y, w, h, lvl, col = WATER) {
  ctx.save(); if (lvl > 0) { ctx.fillStyle = col; ctx.globalAlpha = .9; ctx.fillRect(x + 6, y + h - h * lvl, w - 12, h * lvl - 6); ctx.globalAlpha = 1; line(ctx, x + 6, y + h - h * lvl, x + w - 6, y + h - h * lvl, 3, 'rgba(220,245,255,.9)'); }
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(200,225,250,.9)'; ctx.stroke(); ctx.restore();
}
