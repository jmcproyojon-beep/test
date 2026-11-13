// ---------- props for the tech-news reel (offices, towers, phone, storm, shop ...) ----------
const NV = '#76b900', NV_D = '#4e7d00', AP = '#c9ced6', AP_D = '#8d949e';
const BN = 'Hind';
const bnum = n => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);

// is the narrator speaking at time t (for lip-flap)
function talking(t) { return WORDS.some(w => t >= w.s && t < w.e); }
function talkMouth(t, rest = 'smile') { if (!talking(t)) return rest; return ['o', 'grin', 'flat', 'o', 'teeth'][Math.floor(t * 11) % 5]; }

function camAt(t, lt, o = {}) {
  const hh = shake(t * .35, o.hand == null ? 3.5 : o.hand, 1, 2);
  return { x: (o.x || 540) + hh[0] + (o.vx || 0) * lt, y: (o.y || 960) + hh[1] + (o.vy || 0) * lt, z: (o.z || 1) + (o.vz == null ? .025 : o.vz) * lt, r: (o.r || 0) + Math.sin(t * .5) * .004 };
}
// plain room: wall + floor
function room(ctx, cam, wall = ['#ffe7b8', '#ffd08a'], floor = '#e9b872', fy = 1250, o = {}) {
  applyCam(ctx, cam, .6);
  const g = ctx.createLinearGradient(0, -200, 0, fy); g.addColorStop(0, wall[0]); g.addColorStop(1, wall[1]);
  ctx.fillStyle = g; ctx.fillRect(-1500, -1500, 4080, fy + 1500);
  if (o.stripes !== false) { ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let x = -1500; x < 2600; x += 180) ctx.fillRect(x, -1500, 60, fy + 1500); }
  applyCam(ctx, cam, 1);
  ctx.fillStyle = floor; ctx.fillRect(-1500, fy, 4080, 2000);
  line(ctx, -1500, fy, 2600, fy, 8);
  ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < 6; i++) ctx.fillRect(-1500, fy + 30 + i * i * 22, 4080, 6);
}
function skyBG(ctx, cam, top = '#3ea6ee', bot = '#c9ecfb', t = 0, clouds = true) {
  applyCam(ctx, cam, .1); drawSky(ctx, top, bot, -600, 1300);
  if (clouds) { applyCam(ctx, cam, .2); drawCloud(ctx, 180 + t * 8, 330, 100, 1); drawCloud(ctx, 820 + t * 5, 220, 80, 2); drawCloud(ctx, 1100 + t * 6, 520, 60, 3, .9); }
}
function ground(ctx, cam, y = 1250, col = '#7cc35a', dark = '#5aa043') {
  applyCam(ctx, cam, 1); ctx.fillStyle = col; ctx.fillRect(-1500, y, 4080, 2000); ctx.fillStyle = dark; ctx.fillRect(-1500, y, 4080, 18); line(ctx, -1500, y, 2600, y, 7);
}
function nameTag(ctx, x, y, name, sub, a = 1, col = '#ffd23a') {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); const k = backOut(clamp(a)); ctx.scale(k, k); ctx.globalAlpha = clamp(a * 2);
  ctx.font = `700 46px ${BN}`; const w = Math.max(ctx.measureText(name).width, sub ? (ctx.font = `600 32px ${BN}`, ctx.measureText(sub).width) : 0) + 60;
  const h = sub ? 112 : 74; rrect(ctx, -w / 2, -h / 2, w, h, 22); fillStroke(ctx, '#fff', 6);
  rrect(ctx, -w / 2, -h / 2, 16, h, [22, 0, 0, 22]); ctx.fillStyle = col; ctx.fill();
  text(ctx, name, 8, sub ? -18 : 2, 46, INK, INK, 0, BN, 700);
  if (sub) text(ctx, sub, 8, 28, 32, '#6a5a6a', INK, 0, BN, 600);
  ctx.restore();
}
function label(ctx, str, x, y, size, fill = '#fff', a = 1, sw = 10, font = BN) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); text(ctx, str, x, y, size, fill, INK, sw, font, 700); text(ctx, str, x, y, size, fill, INK, 0, font, 700); ctx.restore();
}
function popIn(ctx, x, y, a, fn) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); const k = backOut(clamp(a)); ctx.scale(k, k); fn(ctx); ctx.restore(); }
function plate(ctx, x, y, w, h, str, bg = '#fff', fg = INK, size = 44, font = BN) {
  rrect(ctx, x - w / 2, y - h / 2, w, h, Math.min(20, h * .3)); fillStroke(ctx, bg, 6); text(ctx, str, x, y + 2, size, fg, INK, 0, font, 700);
}
// company sign: wordmark only (no logos)
function brandSign(ctx, x, y, s, which) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (which === 'nv') { rrect(ctx, -170, -55, 340, 110, 18); fillStroke(ctx, '#111', 7); text(ctx, 'NVIDIA', 0, 4, 66, NV, INK, 0, 'Poppins', 700); }
  else { rrect(ctx, -150, -55, 300, 110, 18); fillStroke(ctx, '#f7f7f9', 7); text(ctx, 'Apple', 0, 2, 66, '#2b2b30', INK, 0, 'Poppins', 700); }
  ctx.restore();
}
function tower(ctx, x, base, w, h, which, o = {}) {
  const body = which === 'nv' ? '#2c2f35' : '#e9edf2', win = which === 'nv' ? NV : '#9fd2f5', top = base - h;
  rrect(ctx, x - w / 2, top, w, h + 4, [24, 24, 0, 0]); fillStroke(ctx, body, 8);
  ctx.save(); rrect(ctx, x - w / 2, top, w, h, [24, 24, 0, 0]); ctx.clip();
  const R = rng(o.seed || 3);
  for (let yy = top + 150; yy < base - 60; yy += 70) for (let xx = x - w / 2 + 35; xx < x + w / 2 - 50; xx += 62) {
    const on = R() < (o.lit == null ? .7 : o.lit); rrect(ctx, xx, yy, 38, 40, 6); ctx.fillStyle = on ? win : (which === 'nv' ? '#3b4048' : '#cfd6de'); ctx.fill();
  }
  ctx.fillStyle = 'rgba(20,10,30,.14)'; ctx.fillRect(x + w * .18, top, w, h); ctx.restore();
  rrect(ctx, x - w / 2, top, w, h + 4, [24, 24, 0, 0]); fillStroke(ctx, null, 8);
  if (o.door !== false) { rrect(ctx, x - 55, base - 120, 110, 120, [14, 14, 0, 0]); fillStroke(ctx, which === 'nv' ? '#1a1c20' : '#cfe6f6', 6); }
  brandSign(ctx, x, top + 70, Math.min(1, w / 400), which);
}
function chair(ctx, x, y, s, col = '#2b2b33', plateStr = 'CEO', spin = 0, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) { ctx.save(); ctx.globalAlpha = glow; const g = ctx.createRadialGradient(0, -200, 20, 0, -200, 330); g.addColorStop(0, 'rgba(255,240,170,.9)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-400, -560, 800, 700); ctx.restore(); }
  const sx = Math.cos(spin);
  line(ctx, 0, -110, 0, -20, 14); for (const a of [-1, -.4, .4, 1]) { line(ctx, 0, -20, a * 90, 0, 10); circle(ctx, a * 90, 4, 12); fillStroke(ctx, '#444', 5); }
  rrect(ctx, -110, -150, 220, 50, 20); fillStroke(ctx, col, 7);
  ctx.save(); ctx.scale(sx || .02, 1); rrect(ctx, -100, -420, 200, 260, 40); fillStroke(ctx, col, 7);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; rrect(ctx, -75, -395, 40, 200, 20); ctx.fill();
  if (plateStr && sx > 0) { rrect(ctx, -70, -330, 140, 56, 10); fillStroke(ctx, '#f4d35e', 5); text(ctx, plateStr, 0, -300, 36, INK, INK, 0, plateStr.match(/[A-Z]/) ? 'Poppins' : BN, 700); }
  ctx.restore();
  for (const sd of [-1, 1]) { line(ctx, sd * 115, -150, sd * 125, -230, 10); rrect(ctx, sd * 125 - 25, -250, 50, 24, 10); fillStroke(ctx, col, 5); }
  ctx.restore();
}
function box(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -40, -150, 20, 70, 6); fillStroke(ctx, '#7fc35a', 5); circle(ctx, -30, -160, 26); fillStroke(ctx, '#5aa043', 5);
  rrect(ctx, 10, -140, 70, 50, 6); fillStroke(ctx, '#fff', 5); line(ctx, 20, -122, 70, -122, 5); line(ctx, 20, -106, 60, -106, 5);
  path(ctx, [[-120, -110], [120, -110], [105, 0], [-105, 0]]); fillStroke(ctx, '#c8955a', 7);
  path(ctx, [[-120, -110], [-150, -140], [-100, -110]]); fillStroke(ctx, '#d9a76a', 6); path(ctx, [[120, -110], [150, -140], [100, -110]]); fillStroke(ctx, '#d9a76a', 6);
  ctx.restore();
}
function clockFace(ctx, x, y, r, ang, fill = '#fff') {
  circle(ctx, x, y, r); fillStroke(ctx, fill, r * .1);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, x + Math.cos(a) * r * .88, y + Math.sin(a) * r * .88, r * .05); }
  line(ctx, x, y, x + Math.sin(ang / 12) * r * .45, y - Math.cos(ang / 12) * r * .45, r * .09);
  line(ctx, x, y, x + Math.sin(ang) * r * .7, y - Math.cos(ang) * r * .7, r * .06, '#e0392f');
  circle(ctx, x, y, r * .07); ctx.fillStyle = INK; ctx.fill();
}
function phone(ctx, x, y, w, h, fn) {
  rrect(ctx, x - w / 2, y - h / 2, w, h, w * .12); fillStroke(ctx, '#1d1b22', 8);
  ctx.save(); rrect(ctx, x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36, w * .08); ctx.clip(); ctx.fillStyle = '#f5f6fa'; ctx.fillRect(x - w, y - h, w * 2, h * 2);
  if (fn) fn(ctx, x - w / 2 + 18, y - h / 2 + 18, w - 36, h - 36);
  ctx.restore(); rrect(ctx, x - 50, y - h / 2 + 26, 100, 22, 11); ctx.fillStyle = '#1d1b22'; ctx.fill();
}
function avatar(ctx, x, y, r, ch) {
  circle(ctx, x, y, r); fillStroke(ctx, '#dbe6ff', 5); ctx.save(); circle(ctx, x, y, r); ctx.clip();
  drawStick(ctx, Object.assign({}, ch, { x, y: y + r * 2.6, s: r * 3, shadow: false, face: { eyes: 'normal', mouth: 'smirk' } })); ctx.restore(); circle(ctx, x, y, r); fillStroke(ctx, null, 5);
}
function speech(ctx, x, y, w, h, tail = [-.3, 1], fill = '#fff', a = 1) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); const k = backOut(clamp(a)); ctx.scale(k, k);
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 36);
  const tx = tail[0] * w / 2, ty = tail[1] > 0 ? h / 2 : -h / 2;
  ctx.moveTo(tx - 30, ty); ctx.lineTo(tx + tail[0] * 60 + (tail[0] < 0 ? -40 : 40), ty + Math.sign(tail[1]) * 70); ctx.lineTo(tx + 30, ty);
  fillStroke(ctx, fill, 7); ctx.beginPath(); ctx.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 32); ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}
function thoughtQ(ctx, x, y, r, a, t) { if (a <= 0) return; popIn(ctx, x, y + Math.sin(t * 3) * 8, a, c => { circle(c, 0, 0, r); fillStroke(c, '#fff', 7); text(c, '?', 0, 6, r * 1.3, '#e0392f', INK, 0, 'Poppins', 700); }); }
function qmarks(ctx, cx, cy, n, t, a = 1, spread = 300, seed = 4) {
  if (a <= 0) return; const R = rng(seed); ctx.save(); ctx.globalAlpha = clamp(a);
  for (let i = 0; i < n; i++) { const x = cx + (R() - .5) * spread * 2, y = cy + (R() - .5) * spread - ((t * 40 + R() * 200) % 200), sz = 60 + R() * 70; ctx.save(); ctx.translate(x, y); ctx.rotate((R() - .5) * .6 + Math.sin(t * 2 + i) * .1); text(ctx, '?', 0, 0, sz, ['#ffd23a', '#fff', '#8fd8ff'][i % 3], INK, sz * .12, 'Poppins', 700); text(ctx, '?', 0, 0, sz, ['#ffd23a', '#fff', '#8fd8ff'][i % 3], INK, 0, 'Poppins', 700); ctx.restore(); }
  ctx.restore();
}
function stormCloud(ctx, x, y, s, t, flash = 0, rain = true) {
  ctx.save();
  if (rain) { ctx.globalAlpha = .7; for (let i = 0; i < 22; i++) { const rx = x + (i / 21 - .5) * s * 2.4, ry = y + s * .4 + ((t * 900 + i * 137) % (s * 2.2)); line(ctx, rx, ry, rx - 12, ry + 40, 5, '#7fb2e6'); } ctx.globalAlpha = 1; }
  cloudShape(ctx, x, y, s, 9); ctx.lineWidth = s * .05; ctx.strokeStyle = INK; ctx.stroke(); cloudShape(ctx, x, y, s, 9); ctx.fillStyle = mix('#4a4f63', '#d9dcef', flash); ctx.fill();
  if (flash > .3) { const pts = [[x - 20, y + s * .4], [x + 30, y + s * .9], [x - 10, y + s * .95], [x + 40, y + s * 1.6], [x - 40, y + s * .85], [x - 5, y + s * .82]]; path(ctx, pts); fillStroke(ctx, '#ffe14d', 6); }
  ctx.restore();
}
function newspaper(ctx, x, y, w, h, head, sub, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rrect(ctx, -w / 2, -h / 2, w, h, 8); fillStroke(ctx, '#f6f1e3', 7);
  text(ctx, head, 0, -h / 2 + 70, Math.min(64, w / (head.length * .45)), INK, INK, 0, BN, 700); line(ctx, -w / 2 + 30, -h / 2 + 115, w / 2 - 30, -h / 2 + 115, 5);
  if (sub) text(ctx, sub, 0, -h / 2 + 165, 40, '#c0392b', INK, 0, BN, 700);
  rrect(ctx, -w / 2 + 30, -h / 2 + 200, w * .42, h - 240, 6); fillStroke(ctx, '#d9d2bf', 4);
  for (let i = 0; i < 7; i++) line(ctx, -w / 2 + w * .5 + 10, -h / 2 + 215 + i * 34, w / 2 - 30 - (i % 3) * 30, -h / 2 + 215 + i * 34, 6, '#b9b2a2');
  ctx.restore();
}
function folder(ctx, x, y, s, str, rot = 0, col = '#f2c14e') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  path(ctx, [[-130, -95], [-50, -95], [-30, -75], [130, -75], [130, 95], [-130, 95]]); fillStroke(ctx, mix(col, '#000000', .15), 7);
  rrect(ctx, -130, -60, 260, 155, 8); fillStroke(ctx, col, 7);
  if (str) text(ctx, str, 0, 18, 44, INK, INK, 0, BN, 700);
  ctx.restore();
}
function magnifier(ctx, x, y, r, ang = .7) {
  ctx.save(); ctx.translate(x, y);
  ctx.save(); ctx.rotate(ang); rrect(ctx, r * .95, -r * .16, r * 1.1, r * .32, r * .12); fillStroke(ctx, '#8a4f24', r * .08); ctx.restore();
  circle(ctx, 0, 0, r); ctx.fillStyle = 'rgba(190,230,255,.35)'; ctx.fill(); ctx.lineWidth = r * .16; ctx.strokeStyle = INK; ctx.stroke();
  circle(ctx, 0, 0, r * .92); ctx.lineWidth = r * .07; ctx.strokeStyle = '#c9ced6'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .65, 3.6, 4.4); ctx.lineWidth = r * .09; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
  ctx.restore();
}
function chip(ctx, x, y, s, glow = 0, str = 'AI') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 260); g.addColorStop(0, `rgba(150,255,120,${.6 * glow})`); g.addColorStop(1, 'rgba(150,255,120,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 600, 600); }
  for (let i = -3; i <= 3; i++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const px = dx ? dx * 120 : i * 28, py = dy ? dy * 120 : i * 28; line(ctx, px * .8, py * .8, px, py, 12, '#c9a14a'); }
  rrect(ctx, -100, -100, 200, 200, 22); fillStroke(ctx, '#2a2d33', 8);
  rrect(ctx, -66, -66, 132, 132, 14); fillStroke(ctx, '#3c424c', 5);
  text(ctx, str, 0, 4, 66, NV, INK, 0, 'Poppins', 700);
  ctx.restore();
}
function book(ctx, x, y, s, open = 1, title = 'পাঠ্যবই', fn) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  path(ctx, [[-300, -200], [0, -170], [300, -200], [300, 200], [0, 230], [-300, 200]]); fillStroke(ctx, '#b0412c', 8);
  path(ctx, [[-280, -185], [0, -155], [0, 210], [-280, 182]]); fillStroke(ctx, '#fffdf5', 6);
  path(ctx, [[280, -185], [0, -155], [0, 210], [280, 182]]); fillStroke(ctx, '#fffdf5', 6);
  text(ctx, title, -140, -110, 50, '#b0412c', INK, 0, BN, 700);
  for (let i = 0; i < 6; i++) line(ctx, -250, -40 + i * 40, -40, -30 + i * 40, 6, '#c9c1ad');
  if (fn) fn(ctx);
  ctx.restore();
}
function tick(ctx, x, y, s, a = 1, col = '#3fa35b') {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const k = clamp(a); ctx.beginPath(); ctx.moveTo(-30, 0); if (k < .4) ctx.lineTo(-30 + 25 * k / .4, 25 * k / .4); else { ctx.lineTo(-5, 25); ctx.lineTo(-5 + 45 * (k - .4) / .6, 25 - 60 * (k - .4) / .6); }
  ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
}
function cross(ctx, x, y, s, a = 1, col = '#e0392f') {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(a * 2);
  for (const [w, c] of [[24, INK], [13, col]]) { line(ctx, -32, -32, -32 + 64 * clamp(a * 2), -32 + 64 * clamp(a * 2), w, c); if (a > .5) line(ctx, 32, -32, 32 - 64 * clamp(a * 2 - 1), -32 + 64 * clamp(a * 2 - 1), w, c); }
  ctx.restore();
}
function clipboard(ctx, x, y, s, rows, t0, lt, title) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -230, -300, 460, 600, 30); fillStroke(ctx, '#b8875a', 8); rrect(ctx, -200, -260, 400, 540, 14); fillStroke(ctx, '#fff', 6);
  rrect(ctx, -80, -330, 160, 70, 16); fillStroke(ctx, '#c9ced6', 7);
  if (title) text(ctx, title, 0, -200, 46, INK, INK, 0, BN, 700);
  rows.forEach((r, i) => { const yy = -110 + i * 120; rrect(ctx, -170, yy - 34, 68, 68, 12); fillStroke(ctx, '#fff', 6); text(ctx, r, 45, yy, 40, INK, INK, 0, BN, 600); tick(ctx, -136, yy - 6, 1.1, clamp((lt - t0[i]) / .35)); });
  ctx.restore();
}
function gavel(ctx, x, y, s, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rrect(ctx, -110, 70, 220, 40, 12); fillStroke(ctx, '#8a4f24', 7);
  ctx.translate(0, 40); ctx.rotate(ang); rrect(ctx, -12, -200, 24, 210, 10); fillStroke(ctx, '#a0602c', 6); rrect(ctx, -80, -250, 160, 70, 18); fillStroke(ctx, '#7a4320', 7); ctx.restore();
}
function court(ctx, x, base, s, name = 'আদালত') {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  path(ctx, [[-330, -470], [0, -620], [330, -470]]); fillStroke(ctx, '#efe9dc', 8); rrect(ctx, -340, -480, 680, 50, 6); fillStroke(ctx, '#e3dccb', 7);
  for (let i = 0; i < 5; i++) { rrect(ctx, -280 + i * 140 - 26, -430, 52, 370, 8); fillStroke(ctx, '#f6f1e6', 6); }
  rrect(ctx, -360, -60, 720, 60, 6); fillStroke(ctx, '#e3dccb', 7);
  text(ctx, name, 0, -535, name.length > 8 ? 40 : 48, INK, INK, 0, BN, 700);
  ctx.restore();
}
function scales(ctx, x, y, s, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(ctx, 0, -180, 0, 120, 14); rrect(ctx, -70, 110, 140, 26, 10); fillStroke(ctx, '#e8c04a', 6);
  ctx.save(); ctx.translate(0, -170); ctx.rotate(tilt); line(ctx, -170, 0, 170, 0, 12);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 160, 0); ctx.rotate(-tilt); line(ctx, 0, 0, -50, 120, 5); line(ctx, 0, 0, 50, 120, 5); ctx.beginPath(); ctx.ellipse(0, 120, 70, 24, 0, 0, Math.PI); fillStroke(ctx, '#e8c04a', 6); ctx.restore(); }
  ctx.restore(); circle(ctx, 0, -180, 18); fillStroke(ctx, '#e8c04a', 6); ctx.restore();
}
function shop(ctx, x, base, w, h, name, shutter = 0, col = '#3fa35b') {
  rrect(ctx, x - w / 2, base - h, w, h, 10); fillStroke(ctx, '#f3e3c3', 7);
  rrect(ctx, x - w / 2 - 15, base - h - 10, w + 30, 90, 10); fillStroke(ctx, col, 7);
  text(ctx, name, x, base - h + 36, 46, '#fff', INK, 8, BN, 700); text(ctx, name, x, base - h + 36, 46, '#fff', INK, 0, BN, 700);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2 + i * w / 6, base - h + 80); ctx.arc(x - w / 2 + (i + .5) * w / 6, base - h + 80, w / 12, Math.PI, 0, true); fillStroke(ctx, i % 2 ? '#fff' : '#e0392f', 5); }
  const iy = base - h + 150; rrect(ctx, x - w / 2 + 40, iy, w - 80, h - 170, 6); fillStroke(ctx, '#6b4a2e', 6);
  const R = rng(5); for (let r = 0; r < 3; r++) { line(ctx, x - w / 2 + 40, iy + 70 + r * 80, x + w / 2 - 40, iy + 70 + r * 80, 6); for (let k = 0; k < 6; k++) { rrect(ctx, x - w / 2 + 60 + k * (w - 120) / 6, iy + 25 + r * 80, 40, 45, 6); fillStroke(ctx, ['#e0392f', '#f2b52a', '#2f63c9', '#3fa35b'][Math.floor(R() * 4)], 4); } }
  if (shutter > 0) { const sh = (h - 150) * clamp(shutter); ctx.save(); rrect(ctx, x - w / 2 + 25, iy - 10, w - 50, sh + 10, 4); fillStroke(ctx, '#9aa3ad', 6); ctx.clip(); for (let yy = iy; yy < iy + sh; yy += 22) line(ctx, x - w / 2, yy, x + w / 2, yy, 4, '#7d8690'); ctx.restore();
    if (shutter >= 1) { ctx.save(); ctx.translate(x, iy + sh * .55); ctx.rotate(-.06); plate(ctx, 0, 0, 200, 80, 'বন্ধ', '#e0392f', '#fff', 50); ctx.restore(); } }
}
function bdFlag(ctx, x, y, s, t) {
  line(ctx, x, y, x, y + 260 * s, 9 * s); ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 0; i <= 10; i++) ctx.lineTo(i * 18 * s, Math.sin(t * 5 + i * .6) * 6 * s); for (let i = 10; i >= 0; i--) ctx.lineTo(i * 18 * s, 110 * s + Math.sin(t * 5 + i * .6) * 6 * s); ctx.closePath(); fillStroke(ctx, '#0a6a42', 5 * s);
  circle(ctx, 80 * s, 55 * s + Math.sin(t * 5 + 2.7) * 6 * s, 30 * s); ctx.fillStyle = '#e0302f'; ctx.fill(); ctx.restore();
}
function laptop(ctx, x, y, s, fn) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -150, -200, 300, 190, 14); fillStroke(ctx, '#2b2b33', 7); rrect(ctx, -132, -184, 264, 158, 8); ctx.fillStyle = '#dff0ff'; ctx.fill();
  if (fn) fn(ctx); path(ctx, [[-180, 0], [180, 0], [160, -14], [-160, -14]]); fillStroke(ctx, '#c9ced6', 7); ctx.restore();
}
function spinner(ctx, x, y, r, t) { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 6; ctx.save(); ctx.globalAlpha = .2 + .8 * ((i / 8)); circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, r * .22); ctx.fillStyle = '#2f63c9'; ctx.fill(); ctx.restore(); } }
function baton(ctx, x, y, ang, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); rrect(ctx, -20, -70, 40, 140, 16); fillStroke(ctx, '#f2b52a', 6); rrect(ctx, -20, -18, 40, 36, 4); ctx.fillStyle = '#e0392f'; ctx.fill(); ctx.restore(); }
function gear(ctx, x, y, r, a, col = '#8fa3b8') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath();
  for (let i = 0; i < 20; i++) { const an = i / 20 * TAU, rr = i % 2 ? r : r * 1.2; const a1 = an - .12, a2 = an + .12; ctx.lineTo(Math.cos(a1) * rr, Math.sin(a1) * rr); ctx.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr); }
  ctx.closePath(); fillStroke(ctx, col, r * .08); circle(ctx, 0, 0, r * .35); fillStroke(ctx, '#fff', r * .08); ctx.restore();
}
function globe(ctx, x, y, r, t) {
  circle(ctx, x, y, r); fillStroke(ctx, '#4aa8e8', r * .06); ctx.save(); circle(ctx, x, y, r); ctx.clip();
  ctx.fillStyle = '#7cc35a'; for (const [a, b, rx, ry] of [[-.3, -.3, .35, .25], [.4, .1, .3, .4], [-.5, .45, .25, .2], [.1, -.6, .2, .12]]) { const px = x + ((a + t * .08 + 1.5) % 2 - 1) * r * 1.4; ellipse(ctx, px, y + b * r, rx * r, ry * r); ctx.fill(); ctx.lineWidth = r * .03; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore(); circle(ctx, x, y, r); fillStroke(ctx, null, r * .06);
  ctx.save(); ellipse(ctx, x - r * .35, y - r * .4, r * .3, r * .14, -.6); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(); ctx.restore();
}
function vault(ctx, x, y, s, open = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -260, -260, 520, 520, 40); fillStroke(ctx, '#8d949e', 9); rrect(ctx, -220, -220, 440, 440, 26); fillStroke(ctx, '#2a2d33', 7);
  ctx.save(); ctx.scale(Math.max(.05, 1 - open), 1); circle(ctx, 0, 0, 205); fillStroke(ctx, '#aeb5bf', 9); for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3 + open * 3); line(ctx, -110, 0, 110, 0, 18); ctx.restore(); } circle(ctx, 0, 0, 45); fillStroke(ctx, '#e8c04a', 7); ctx.restore();
  ctx.restore();
}
function shield(ctx, x, y, s, str) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -150); ctx.quadraticCurveTo(100, -110, 130, -120); ctx.quadraticCurveTo(140, 60, 0, 160); ctx.quadraticCurveTo(-140, 60, -130, -120); ctx.quadraticCurveTo(-100, -110, 0, -150); fillStroke(ctx, '#2f63c9', 9);
  if (str) text(ctx, str, 0, 0, 52, '#fff', INK, 0, BN, 700); ctx.restore();
}
function crown(ctx, x, y, s, col = '#ffd23a') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); path(ctx, [[-60, 30], [-70, -40], [-30, -5], [0, -55], [30, -5], [70, -40], [60, 30]]); fillStroke(ctx, col, 7); for (const px of [-70, 0, 70]) { circle(ctx, px, px ? -44 : -60, 10); fillStroke(ctx, '#e0392f', 4); } ctx.restore(); }
function pedestal(ctx, x, base, w, h, col = '#e9e2d0') { rrect(ctx, x - w / 2, base - h, w, h, 8); fillStroke(ctx, col, 7); rrect(ctx, x - w / 2 - 20, base - h - 26, w + 40, 30, 8); fillStroke(ctx, mix(col, '#ffffff', .3), 7); }
function spotlight(ctx, x, y0, y1, w0, w1, a = 1, col = '255,244,190') {
  if (a <= 0) return; ctx.save(); const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${col},${.05 * a})`); g.addColorStop(1, `rgba(${col},${.55 * a})`);
  ctx.fillStyle = g; path(ctx, [[x - w0 / 2, y0], [x + w0 / 2, y0], [x + w1 / 2, y1], [x - w1 / 2, y1]]); ctx.fill();
  ellipse(ctx, x, y1, w1 / 2, w1 * .1); ctx.fillStyle = `rgba(${col},${.6 * a})`; ctx.fill(); ctx.restore();
}
function megaphone(ctx, k, h, a, side) { if (k !== 'R') return; ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(-side * (a - Math.PI / 2) * 0 - .25); path(ctx, [[-.02, -.03], [.16, -.09], [.16, .09], [-.02, .03]]); fillStroke(ctx, '#e0392f', .012); ellipse(ctx, .16, 0, .025, .09); fillStroke(ctx, '#fff', .012); ctx.restore(); }
function holdPaper(col = '#f6f1e3') { return (ctx, k, h) => { if (k !== 'R') return; rrect(ctx, h[0] - .02, h[1] - .14, .16, .2, .01); fillStroke(ctx, col, .01); for (let i = 0; i < 4; i++) line(ctx, h[0] + .01, h[1] - .1 + i * .035, h[0] + .12, h[1] - .1 + i * .035, .008, '#b9b2a2'); }; }
function flash(ctx, a, col = '#fff') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function tint(ctx, col, a) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function bigNum(ctx, x, y, n, a, col = '#ffd23a') { popIn(ctx, x, y, a, c => { circle(c, 0, 0, 110); fillStroke(c, col, 10); text(c, bnum(n), 0, 8, 130, INK, INK, 0, BN, 700); }); }
function tvScreen(ctx, x, y, w, h, fn) { rrect(ctx, x - w / 2 - 22, y - h / 2 - 22, w + 44, h + 44, 26); fillStroke(ctx, '#26232c', 8); ctx.save(); rrect(ctx, x - w / 2, y - h / 2, w, h, 10); ctx.clip(); fn(ctx, x - w / 2, y - h / 2, w, h); ctx.restore(); rrect(ctx, x - w / 2, y - h / 2, w, h, 10); fillStroke(ctx, null, 6); }
function arrow(ctx, x1, y1, x2, y2, col = '#ffd23a', w = 26, k = 1) {
  if (k <= 0) return; const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(ey - y1, ex - x1);
  for (const [lw, c] of [[w + 14, INK], [w, col]]) line(ctx, x1, y1, ex - Math.cos(a) * w, ey - Math.sin(a) * w, lw, c);
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); path(ctx, [[10, 0], [-w * 2, -w * 1.5], [-w * 2, w * 1.5]]); fillStroke(ctx, col, 7); ctx.restore();
}
function zigzagBox(ctx, x, y, s, str, open = 0) { // shipping crate with chips
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rrect(ctx, -170, -140, 340, 140, 8); fillStroke(ctx, '#b07a44', 7);
  for (let i = 0; i < 4; i++) line(ctx, -170, -105 + i * 35, 170, -105 + i * 35, 4, '#8a5a2c');
  if (str) { ctx.save(); ctx.rotate(-.08); plate(ctx, 0, -70, 220, 64, str, '#fff', '#c0392b', 40); ctx.restore(); }
  ctx.restore();
}
function tape(ctx, x1, y1, x2, y2, str = 'তদন্ত চলছে') {
  ctx.save(); const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); ctx.translate(x1, y1); ctx.rotate(a);
  rrect(ctx, 0, -32, L, 64, 4); fillStroke(ctx, '#ffd23a', 6); ctx.save(); rrect(ctx, 0, -32, L, 64, 4); ctx.clip();
  for (let xx = 0; xx < L; xx += 460) { text(ctx, str, xx + 200, 2, 36, INK, INK, 0, BN, 700); path(ctx, [[xx + 380, -32], [xx + 420, -32], [xx + 380, 32], [xx + 340, 32]]); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore(); ctx.restore();
}
function bulb(ctx, x, y, s, on = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (on > 0) { ctx.save(); ctx.globalAlpha = on; burst(ctx, 0, -10, 120, 12, '#fff6b0', 3, .6); ctx.restore(); } circle(ctx, 0, -20, 60); fillStroke(ctx, on > .5 ? '#ffe14d' : '#f6f2ea', 8); rrect(ctx, -30, 35, 60, 40, 8); fillStroke(ctx, '#9aa3ad', 7); ctx.restore(); }
function pill(ctx, x, y, str, bg, fg = '#fff', size = 42, a = 1) { popIn(ctx, x, y, a, c => { c.font = `700 ${size}px ${BN}`; const w = c.measureText(str).width + 50; rrect(c, -w / 2, -size * .75, w, size * 1.5, size * .75); fillStroke(c, bg, 6); text(c, str, 0, 3, size, fg, INK, 0, BN, 700); }); }
