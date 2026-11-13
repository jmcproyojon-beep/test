// ---------- Nvidia CEO reel: shot list (times come from the voice's word timings) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const P = { hat: 'none', belt: false };
const HOST = C(P, { cols: ['#2e9e6a', '#2e9e6a'], hair: { style: 'tuft', col: '#1d1a1c' }, shirt: '#f6f1e8' });
const JENSEN = C(P, { cols: ['#232127', '#232127'], hair: { style: 'side', col: '#4a4a52' }, zip: '#5d5966' });
const TRUMP = C(P, { cols: ['#22306b', '#22306b'], hair: { style: 'swoop', col: '#f2c94c' }, shirt: '#fff', tie: '#d42a2a' });
const COOK = C(P, { cols: ['#3b3f48', '#3b3f48'], hair: { style: 'short', col: '#cfcfcf' }, glasses: true });
const KRESS = C(P, { cols: ['#2f63c9', '#2f63c9'], hair: { style: 'bob', col: '#e6c068' }, shirt: '#fff' });
const JONES = C(P, { cols: ['#4a4e5a', '#4a4e5a'], hair: { style: 'short', col: '#ececec' }, glasses: true, shirt: '#fff', tie: '#2f63c9' });
const TERNUS = C(P, { cols: ['#6f9fe0', '#6f9fe0'], hair: { style: 'neat', col: '#7a5434' } });
const OWNER = C(P, { cols: ['#e07b39', '#f6f1e8'], hair: { style: 'tuft', col: '#1d1a1c' } });
const HELPER = C(P, { cols: ['#7a4bc4', '#7a4bc4'], hair: { style: 'neat', col: '#2a2020' } });
const VIP = C(P, { cols: ['#d4a017', '#d4a017'], hair: { style: 'swoop', col: '#6b4a2e' }, glasses: 'shades' });
const CLIENT = C(P, { cols: ['#2f63c9', '#f6f1e8'], hair: { style: 'short', col: '#3a2a20' } });
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const SIT = { L: [1.25, -1.35], R: [1.25, -1.35] };

// line timing from the voice
const _L = {};
function Ln(i) { if (!_L[i]) { const ws = WORDS.filter(w => w.line === i); _L[i] = { s: ws[0].s, e: ws[ws.length - 1].e, w: ws.map(w => w.s) }; } return _L[i]; }
const NL = Math.max(...WORDS.map(w => w.line)) + 1;
const B = i => i <= 0 ? 0 : i >= NL ? Ln(NL - 1).e + .9 : (Ln(i - 1).e + Ln(i).s) / 2;
const Wt = (i, k) => Ln(i).w[k];
const on = (t, t0, d = .35) => clamp((t - t0) / d);

const SHOTS = [];
const S = (start, end, draw, tr = 'whip') => SHOTS.push({ start, end, tr, draw });

// ---------------- backgrounds ----------------
function studio(ctx, cam, t, screen) {
  room(ctx, cam, ['#ffe2b0', '#ffbf74'], '#5b4a7a');
  applyCam(ctx, cam, .75);
  tvScreen(ctx, 330, 470, 470, 290, screen || ((c, x, y, w, h) => {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1d3a8a'); g.addColorStop(1, '#2f63c9'); c.fillStyle = g; c.fillRect(x, y, w, h);
    globe(c, x + 110, y + h / 2, 80, t); text(c, 'টেক খবর', x + 320, y + h / 2 - 10, 54, '#fff', INK, 0, BN, 700);
    c.fillStyle = '#e0392f'; c.fillRect(x, y + h - 46, w, 46); text(c, 'যাচাই করা টেক ও AI খবর', x + w - ((t * 120) % (w + 520)), y + h - 22, 30, '#fff', INK, 0, BN, 700, 'left');
  }));
  applyCam(ctx, cam, 1);
}
const officeNV = (ctx, cam) => { room(ctx, cam, ['#eaf5d8', '#c9e39d'], '#5f646e'); applyCam(ctx, cam, .6); brandSign(ctx, 540, 330, .9, 'nv'); applyCam(ctx, cam, 1); };
const officeAP = (ctx, cam) => { room(ctx, cam, ['#f7f8fb', '#dde3ea'], '#c4ccd6'); applyCam(ctx, cam, .6); brandSign(ctx, 540, 330, .9, 'ap'); applyCam(ctx, cam, 1); };
function city(ctx, cam, t, night = 0) {
  skyBG(ctx, cam, mix('#3ea6ee', '#151a33', night), mix('#c9ecfb', '#3a3f63', night), t, night < .5);
  applyCam(ctx, cam, .35); const R = rng(8);
  for (let i = 0; i < 12; i++) { const x = -260 + i * 140, h = 250 + R() * 330; rrect(ctx, x, 1250 - h, 120, h + 10, 8); fillStroke(ctx, mix('#a9c7e0', '#2a3050', night), 5); }
  ground(ctx, cam, 1250, mix('#7cc35a', '#2c3b3a', night), mix('#5aa043', '#223030', night));
}
const host = (t, o) => C(HOST, Object.assign({ face: { eyes: 'normal', mouth: talkMouth(t) } }, o));

// ======================= 0 intro =======================
S(0, B(1), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .035 }); studio(ctx, cam, t);
  const wave = Math.sin(t * 9) * .35;
  drawStick(ctx, host(t, { x: 690, y: 1250, s: 640, arms: { L: [.3, -.1], R: [2.55 + wave, .5] }, face: { eyes: lt < .4 ? 'happy' : 'normal', mouth: talkMouth(t, 'grin') }, bob: Math.sin(t * 4) * .004 }));
  nameTag(ctx, 330, 1165, 'রুবেল মিয়া', 'টেক ও AI খবর', on(t, Wt(0, 3), .4), '#2e9e6a');
}, 'cut');
// ======================= 1 breaking =======================
S(B(1), B(2), (ctx, lt, t) => {
  const hit = on(t, Wt(1, 6), .2); const hh = shake(t, 12 * (1 - on(t, Wt(1, 6) + .1, .5)) * (hit > 0 ? 1 : 0), 3);
  const cam = camAt(t, lt, { z: 1.05, vz: .03, x: 540 + hh[0], y: 960 + hh[1] }); room(ctx, cam, ['#20234a', '#3a2f6b'], '#1b1730');
  tvScreen(ctx, 540, 640, 880, 620, (c, x, y, w, h) => {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0f2466'); g.addColorStop(1, '#2f63c9'); c.fillStyle = g; c.fillRect(x, y, w, h);
    globe(c, x + w / 2, y + h / 2 + 30, 190, t);
    const bx = kf(t, [[B(1), -w], [B(1) + .45, 0, easeOut]]);
    c.fillStyle = '#e0392f'; c.fillRect(x + bx, y + 40, w, 110); text(c, 'ব্রেকিং নিউজ', x + bx + w / 2, y + 97, 70, '#fff', INK, 0, BN, 700);
    c.fillStyle = '#ffd23a'; c.fillRect(x, y + h - 70, w, 70); text(c, 'Nvidia  •  Apple  •  CEO  •  AI', x + w - ((t * 160) % (w + 700)), y + h - 34, 40, INK, INK, 0, 'Poppins', 700, 'left');
  });
  if (hit > 0) burst(ctx, 900, 330, 120 * backOut(hit), 12, '#ffd23a', 4);
  drawStick(ctx, host(t, { x: 860, y: 1260, s: 420, arms: { L: { ik: [-.35, -.75] }, R: [.4, -.2] }, face: { eyes: 'wide', look: [-.7, -.4], mouth: talkMouth(t, 'o') } }));
});
// ======================= 2 Jensen resigns =======================
S(B(2), Wt(2, 8) - .1, (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03, vx: 25 }); city(ctx, cam, t, .15);
  tower(ctx, 300, 1250, 440, 980, 'nv');
  const x = kf(t, [[B(2), 300], [Wt(2, 7), 760]], x => x);
  drawStick(ctx, C(JENSEN, { x, y: 1250, s: 520, legs: walkLegs(t, 8, .45), arms: { L: { ik: [-.16, -.43], bend: 1 }, R: { ik: [.16, -.43], bend: -1 } }, face: { eyes: 'normal', look: [.6, 0], mouth: 'flat', browAng: .15 } }));
  box(ctx, x, 1250 - .3 * 520, 1.05);
  nameTag(ctx, 640, 1170, 'জেনসেন হুয়াং', 'Nvidia-র প্রতিষ্ঠাতা', on(t, B(2) + .25, .4), NV);
  pill(ctx, 700, 520, 'পদত্যাগ', '#e0392f', '#fff', 64, on(t, Wt(2, 2), .3));
  const ca = on(t, Wt(2, 5), .3); if (ca > 0) popIn(ctx, 860, 330, ca, c => clockFace(c, 0, 0, 95, (t - Wt(2, 5)) * 25));
});
// ======================= 3 Trump names the next CEO =======================
S(Wt(2, 8) - .1, B(3), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.02, vz: .035 }); room(ctx, cam, ['#2a3f8f', '#3c56b0'], '#7a2a33', 1250, { stripes: false });
  applyCam(ctx, cam, .6); for (let i = 0; i < 7; i++) star5(ctx, 120 + i * 150, 260 + (i % 2) * 60, 30, 0, '#fff'); applyCam(ctx, cam, 1);
  rrect(ctx, 250, 1000, 300, 250, 12); fillStroke(ctx, '#8a4f24', 8); rrect(ctx, 230, 980, 340, 40, 10); fillStroke(ctx, '#a0602c', 7);
  drawStick(ctx, C(TRUMP, { x: 400, y: 1190, s: 560, arms: { L: [.5, -.3], R: [2.0 + Math.sin(t * 6) * .08, -.35] }, prop: megaphone, face: { eyes: 'normal', mouth: talking(t) ? (Math.floor(t * 9) % 2 ? 'o' : 'teeth') : 'flat', browAng: -.2, look: [.6, 0] } }));
  nameTag(ctx, 400, 1150, 'ডোনাল্ড ট্রাম্প', 'মার্কিন প্রেসিডেন্ট', on(t, Wt(2, 9), .4), '#e0392f');
  speech(ctx, 760, 520, 500, 330, [-.6, 1], '#fff', on(t, Wt(2, 13) - .1, .35));
  if (t > Wt(2, 13) - .1) { popIn(ctx, 760, 520, on(t, Wt(2, 13) - .1, .35), c => { brandSign(c, 0, -70, .8, 'nv'); text(c, 'পরের CEO?', 0, 60, 62, INK, INK, 0, BN, 700); }); }
});
// ======================= 4 his pick: Tim Cook =======================
S(B(3), B(4), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .05 }); officeAP(ctx, cam); tint(ctx, '#0b0a18', .35 * (1 - on(t, Wt(3, 3), .3)));
  spotlight(ctx, 660, 0, 1250, 120, 560, on(t, Wt(3, 3), .25));
  drawStick(ctx, C(COOK, { x: 660, y: 1250, s: 600, arms: POSE.idle.arms, face: { eyes: on(t, Wt(3, 3), .1) ? 'wide' : 'normal', mouth: on(t, Wt(3, 4), .1) ? 'o' : 'smile', look: [-.5, 0] } }));
  drawStick(ctx, C(TRUMP, { x: 170, y: 1300, s: 420, arms: { L: [.4, -.2], R: { ik: [.4, -.62] } }, face: { eyes: 'normal', mouth: 'grin', look: [.8, 0] } }));
  for (let i = 0; i < 5; i++) sparkle(ctx, 660 + Math.cos(i * 1.3 + t) * 300, 640 + Math.sin(i * 2.1 + t) * 220, 26, on(t, Wt(3, 3) + .1 * i, .3));
  nameTag(ctx, 690, 1165, 'টিম কুক', 'Apple', on(t, Wt(3, 3), .4), AP_D);
});
// ======================= 5 funny =======================
S(B(4), B(5), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.12, vz: .05, y: 900 }); studio(ctx, cam, t);
  const sh = Math.sin(t * 28) * .006;
  drawStick(ctx, host(t, { x: 560, y: 1260, s: 720, bob: sh, lean: Math.sin(t * 14) * .02, arms: { L: [.9, -2.2], R: [.9, -2.2] }, face: { eyes: 'happy', mouth: 'grin' } }));
  sweat(ctx, 400, 560 + (lt * 60) % 80, 28, .9); sweat(ctx, 720, 560 + (lt * 50) % 80, 24, .9);
}, 'cut');
// ======================= 6 a question =======================
S(B(5), B(6), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t);
  newspaper(ctx, 360, 800, 470, 560, 'টেক খবর', 'Nvidia-র CEO পদত্যাগ', -.05 + Math.sin(t) * .01);
  const q = on(t, Wt(5, 8), .3);
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, headTilt: q ? -.12 : 0, arms: { L: { ik: [-.42, -.5] }, R: q ? { ik: [.05, -.78], bend: -1 } : [.3, -.1] }, face: { eyes: 'normal', look: [-.7, .2], mouth: talkMouth(t, 'flat'), browOne: q ? 1 : 0 } }));
  thoughtQ(ctx, 800, 420, 90, q, t);
});
// ======================= 7 two giants =======================
S(B(6), B(7), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02, y: 960, vy: -10 }); city(ctx, cam, t);
  const ra = ease(on(t, Wt(6, 0) - .2, .8)), rn = ease(on(t, Wt(6, 2) - .2, .8));
  ctx.save(); ctx.beginPath(); ctx.rect(-500, -1000, 2100, 2250); ctx.clip();
  tower(ctx, 300, 1250 + (1 - ra) * 1000, 380, 880, 'ap', { seed: 2 }); tower(ctx, 780, 1250 + (1 - rn) * 1050, 380, 940, 'nv', { seed: 5 });
  ctx.restore();
  const cr = on(t, Wt(6, 5), .35); crown(ctx, 300, 300 - Math.sin(t * 3) * 8, cr ? backOut(cr) * 1.3 : 0); crown(ctx, 780, 240 - Math.sin(t * 3 + 1) * 8, cr ? backOut(cr) * 1.3 : 0);
  if (rn > .9 && rn < 1) puff(ctx, 780, 1240, 140, t, '#efe3cf', 3, 1 - rn);
});
// ======================= 8 opposite pictures =======================
function splitAN(ctx, t, lt, cam, leftK = 1, rightK = 1, storm = 0) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 540, H); ctx.clip();
  skyBG(ctx, cam, '#3ea6ee', '#d9f2ff', t); applyCam(ctx, cam, .1); drawSun(ctx, 280, 330, 70, t, .9);
  ground(ctx, cam, 1250); tower(ctx, 270, 1250, 300, 720, 'ap', { door: false });
  const hk = on(t, lt, 1); drawStick(ctx, C(COOK, { x: 170, y: 1250, s: 300, arms: { L: [.3, -.1], R: { ik: [.36, -.5] } }, face: { eyes: 'happy', mouth: 'smile' } }));
  drawStick(ctx, C(TERNUS, { x: 380, y: 1250, s: 300, arms: { L: { ik: [-.36, -.5] }, R: [.3, -.1] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, 0] } }));
  baton(ctx, 275, 1250 - .5 * 300, Math.PI / 2, .7);
  tint(ctx, '#ffffff', .2 * (1 - leftK));
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(540, 0, 540, H); ctx.clip();
  const fl = storm > 0 ? (Math.sin(t * 23) > .7 ? 1 : 0) * storm : 0;
  skyBG(ctx, cam, mix('#20253f', '#c8cce8', fl), '#4a4f6b', t, false); ground(ctx, cam, 1250, '#3c4a47', '#2a3634');
  tower(ctx, 810, 1250, 300, 760, 'nv', { door: false, lit: .4 });
  stormCloud(ctx, 810, 420, 170, t, fl);
  chair(ctx, 930, 1250, .55, '#2b2b33', 'CEO', t * 6);
  for (let i = 0; i < 2; i++) { const x = 640 + i * 120 + Math.sin(t * 12 + i) * 20; drawStick(ctx, C(P, { cols: PAL.yellow, x, y: 1250, s: 220, arms: POSE.handsUp.arms, legs: walkLegs(t + i, 18, .6), face: { eyes: 'wide', mouth: 'teeth' } })); }
  tint(ctx, '#000', .25 * (1 - rightK));
  ctx.restore();
  applyCam(ctx, cam, 1); ctx.beginPath(); ctx.moveTo(540, -200); for (let y = -200; y < 2200; y += 120) ctx.lineTo(540 + ((y / 120) % 2 ? 26 : -26), y); ctx.lineWidth = 16; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
}
S(B(7), B(8), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); const fl = on(t, Wt(7, 8), .15);
  splitAN(ctx, t, lt, cam, 1, 1, fl);
  if (fl > 0) { const hh = shake(t, 10, 4); ctx.save(); ctx.setTransform(1, 0, 0, 1, hh[0], hh[1]); ctx.restore(); }
  thoughtQ(ctx, 540, 1060, 95, on(t, Wt(7, 9), .3), t);
});
// ======================= 9 what did Trump say =======================
S(B(8), B(9), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 }); studio(ctx, cam, t);
  const py = kf(t, [[B(8), 2300], [B(8) + .7, 820, backOut]]);
  phone(ctx, 540, py, 560, 960, (c, x, y, w, h) => { c.fillStyle = '#5b3fd0'; c.fillRect(x, y, w, 120); text(c, 'Truth Social', x + w / 2, y + 70, 44, '#fff', INK, 0, 'Poppins', 700); spinner(c, x + w / 2, y + h / 2, 50, t); });
  drawStick(ctx, host(t, { x: 900, y: 1300, s: 420, arms: { L: { ik: [-.35, -.6] }, R: [.3, -.1] }, face: { eyes: 'normal', look: [-.8, -.2], mouth: talkMouth(t) } }));
});
// ======================= 10-11 the post =======================
function post(ctx, t, cam) {
  applyCam(ctx, cam, 1);
  phone(ctx, 540, 700, 740, 1060, (c, x, y, w, h) => {
    c.fillStyle = '#5b3fd0'; c.fillRect(x, y, w, 130); text(c, 'Truth Social', x + w / 2, y + 75, 50, '#fff', INK, 0, 'Poppins', 700);
    avatar(c, x + 90, y + 220, 52, TRUMP); text(c, 'ডোনাল্ড ট্রাম্প', x + 165, y + 205, 44, INK, INK, 0, BN, 700, 'left'); text(c, '@realDonaldTrump', x + 165, y + 250, 28, '#8a8494', INK, 0, 'Poppins', 700, 'left');
    const rows = [[Wt(9, 7), 'জেনসেন হুয়াং'], [Wt(9, 8), '"দারুণ কাজ" করেছেন।'], [Wt(10, 1), 'তাঁর জায়গা নিতে পারেন'], [Wt(10, 5), '"একজনই মানুষ":'], [Wt(10, 7), 'টিম কুক।'], [Wt(11, 3), '"এক কিংবদন্তির জায়গায়'], [Wt(11, 6), 'আরেক কিংবদন্তি!"']];
    rows.forEach(([t0, s], i) => { const a = on(t, t0 - .05, .25); if (a <= 0) return; c.save(); c.globalAlpha = a; text(c, s, x + 50, y + 340 + i * 78 + (1 - a) * 20, 48, i === 4 ? '#2f63c9' : INK, INK, 0, BN, 700, 'left'); c.restore(); });
    text(c, '(বাংলা অনুবাদ)', x + w - 40, y + h - 50, 28, '#8a8494', INK, 0, BN, 600, 'right');
  });
}
S(B(9), B(10), (ctx, lt, t) => { const cam = camAt(t, lt, { z: 1.0, vz: .02, hand: 2.5 }); room(ctx, cam, ['#ece6ff', '#cfc3ff'], '#5b4a7a'); post(ctx, t, cam); }, 'cut');
S(B(10), B(11), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.25, vz: .03, y: 860, hand: 2.5 }); room(ctx, cam, ['#ece6ff', '#cfc3ff'], '#5b4a7a'); post(ctx, t, cam);
  const a = on(t, Wt(10, 7), .3); if (a > 0) popIn(ctx, 880, 1080, a, c => { circle(c, 0, 0, 120); fillStroke(c, '#fff', 8); c.save(); circle(c, 0, 0, 120); c.clip(); drawStick(c, C(COOK, { x: 0, y: 330, s: 360, shadow: false, face: { eyes: 'wide', mouth: 'o' } })); c.restore(); circle(c, 0, 0, 120); fillStroke(c, null, 8); });
}, 'cut');
// ======================= 12 legend replaces legend =======================
S(B(11), B(12), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#3a2f6b', '#6a4bb0'], '#2b2240', 1250, { stripes: false });
  spotlight(ctx, 540, 0, 980, 160, 520, 1);
  pedestal(ctx, 540, 1250, 360, 270, '#e9e2d0'); text(ctx, 'কিংবদন্তি', 540, 1125, 50, INK, INK, 0, BN, 700);
  const sw = on(t, Wt(11, 5), .5), dropT = Wt(11, 6) - .15;
  const jx = 540 - ease(sw) * 760;
  drawStick(ctx, C(JENSEN, { x: jx, y: 954, s: 470, legs: sw > 0 && sw < 1 ? walkLegs(t, 12) : undefined, face: { eyes: 'normal', mouth: 'smile', look: [sw > 0 ? -.8 : 0, 0] } }));
  if (t > dropT) { const cy = kf(t, [[dropT, -300], [dropT + .35, 954, easeIn]]); const sq = kf(t, [[dropT + .35, .8], [dropT + .6, 1, backOut]]); drawStick(ctx, C(COOK, { x: 540, y: cy, s: 470, squash: sq, face: { eyes: 'happy', mouth: 'grin' }, arms: POSE.handsUp.arms })); if (t > dropT + .35) puff(ctx, 540, 960, 120 * (1 + (t - dropT)), t, '#efe3cf', 3, 1 - on(t, dropT + .35, .6)); }
  const cr = on(t, Wt(11, 3), .4); crown(ctx, 540, 380 + Math.sin(t * 3) * 10, cr * 1.4);
  for (let i = 0; i < 6; i++) sparkle(ctx, 540 + Math.cos(i * 1.05 + t * .8) * 330, 520 + Math.sin(i * 1.05 + t * .8) * 160, 28, cr);
});
// ======================= 13 not serious =======================
S(B(12), B(13), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t, (c, x, y, w, h) => { c.fillStyle = '#fff6e0'; c.fillRect(x, y, w, h); });
  const cx = 330, cy = 545, r = 175; applyCam(ctx, cam, .75);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI + i * Math.PI / 3, Math.PI + (i + 1) * Math.PI / 3); ctx.lineWidth = 46; ctx.strokeStyle = ['#e0392f', '#f2b52a', '#3fa35b'][i]; ctx.stroke(); }
  text(ctx, 'সিরিয়াস মিটার', cx, cy + 42, 30, INK, INK, 0, BN, 700);
  const ang = kf(t, [[Wt(12, 1), -.1], [Wt(12, 2) + .2, -1.35, backOut]]) + Math.sin(t * 20) * .02;
  line(ctx, cx, cy, cx + Math.cos(Math.PI / 2 + ang - Math.PI) * 0 + Math.sin(ang) * r * .85, cy - Math.cos(ang) * r * .85, 12); circle(ctx, cx, cy, 16); fillStroke(ctx, INK, 0);
  applyCam(ctx, cam, 1);
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, headTilt: Math.sin(t * 7) * .12 * on(t, Wt(12, 4), .2), arms: { L: [.9, -2.2], R: [.9, -2.2] }, face: { eyes: 'half', mouth: talkMouth(t, 'smirk'), look: [-.5, 0] } }));
});
// ======================= 14 Cook is executive chairman =======================
S(B(13), B(14), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 }); officeAP(ctx, cam);
  const k = ease(on(t, Wt(13, 1), 1.2));
  chair(ctx, 260, 1250, .9, '#3b3f48', 'CEO', 0, 0); chair(ctx, 800, 1250, 1.1, '#7a2a33', 'চেয়ারম্যান', 0, on(t, Wt(13, 4), .4));
  const x = lerp(260, 800, k);
  drawStick(ctx, C(COOK, { x, y: 1250, s: 560, legs: k > 0 && k < 1 ? walkLegs(t, 9) : undefined, face: { eyes: 'normal', mouth: 'smile', look: [.7, 0] } }));
  const off = on(t, Wt(13, 5), .4); if (off > 0) cross(ctx, 260, 860, 1.6, off);
  nameTag(ctx, 540, 1170, 'টিম কুক', 'নির্বাহী চেয়ারম্যান, Apple', on(t, Wt(13, 3), .4), AP_D);
});
// ======================= 15 no comment =======================
S(B(14), B(15), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); city(ctx, cam, t);
  tower(ctx, 270, 1250, 380, 860, 'nv');
  speech(ctx, 300, 560, 220, 140, [.3, 1], '#fff', on(t, Wt(14, 0), .3)); if (t > Wt(14, 0)) text(ctx, '...', 300, 545, 80, INK, INK, 0, 'Poppins', 700);
  drawStick(ctx, C(COOK, { x: 790, y: 1250, s: 520, arms: { L: [.3, -.1], R: { ik: [.08, -.68], bend: -1 } }, face: { eyes: 'normal', mouth: 'flat', look: [-.3, 0] } }));
  for (let i = 0; i < 3; i++) { const a = on(t, B(14) + .2 + i * .15, .3); const bx = [560, 1080, 1000][i], by = [1500, 1400, 820][i]; ctx.save(); ctx.globalAlpha = a; line(ctx, bx + 300, by + 200, bx + (i === 2 ? 10 : 0), by - 60, 14, '#3b3f48'); rrect(ctx, bx - 30 + (i === 2 ? 10 : 0), by - 140, 60, 100, 26); fillStroke(ctx, '#222', 7); ctx.restore(); }
  pill(ctx, 540, 360, 'কোনো মন্তব্য নেই', '#fff', INK, 56, on(t, Wt(14, 6), .3));
});
// ======================= 16 Nvidia's own announcement =======================
S(B(15), B(16), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 }); city(ctx, cam, t);
  tower(ctx, 540, 1250, 520, 1000, 'nv');
  const k = on(t, Wt(15, 5), .6), e = easeOut(k);
  if (k > 0) { ctx.save(); ctx.translate(540, lerp(700, 760, e)); ctx.rotate((1 - e) * 4); ctx.scale(lerp(.15, 1, e), lerp(.15, 1, e));
    rrect(ctx, -330, -400, 660, 800, 14); fillStroke(ctx, '#fff', 8); ctx.fillStyle = NV; ctx.fillRect(-326, -396, 652, 120);
    text(ctx, 'NVIDIA', 0, -335, 60, '#111', INK, 0, 'Poppins', 700); text(ctx, 'আনুষ্ঠানিক ঘোষণা', 0, -200, 56, INK, INK, 0, BN, 700);
    for (let i = 0; i < 7; i++) line(ctx, -260, -100 + i * 60, 260 - (i % 3) * 60, -100 + i * 60, 10, '#c9ced6'); ctx.restore(); }
});
// ======================= 17 Kress takes the chair =======================
S(B(16), B(17), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .035 }); officeNV(ctx, cam);
  spotlight(ctx, 560, 0, 1250, 100, 520, .8);
  chair(ctx, 560, 1250, 1.05, '#2b2b33', 'CEO');
  const tS = Wt(16, 3); const x = kf(t, [[B(16), -150], [tS - .1, 560]]); const sit = on(t, tS - .1, .3);
  drawStick(ctx, C(KRESS, { x, y: 1250 - sit * 70, s: 560, legs: sit > .5 ? SIT : (x < 560 ? walkLegs(t, 9) : undefined), arms: sit > .5 ? { L: [.6, -.4], R: [.6, -.4] } : walkArms(t, 9, .3), face: { eyes: 'normal', mouth: 'smile', look: [x < 560 ? .7 : 0, 0] } }));
  nameTag(ctx, 540, 1175, 'কোলেট ক্রেস', 'অন্তর্বর্তী CEO, Nvidia', on(t, Wt(16, 4), .4), NV);
});
// ======================= 18 CEO + CFO =======================
const twoHats = (n) => (ctx, hx, hy, hr) => {
  const labels = ['CEO', 'CFO'].slice(0, n);
  labels.forEach((s, i) => { const y = hy - hr - .055 - i * .085; rrect(ctx, hx - .11, y - .035, .22, .07, .02); fillStroke(ctx, i ? '#ffd23a' : NV, .01); ctx.save(); ctx.translate(hx, y + .003); ctx.scale(.001, .001); text(ctx, s, 0, 0, 52, INK, INK, 0, 'Poppins', 700); ctx.restore(); });
};
S(B(17), B(18), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeNV(ctx, cam);
  const n = t > Wt(17, 6) - .05 ? 2 : 1;
  drawStick(ctx, C(KRESS, { x: 420, y: 1250, s: 600, hat: twoHats(n), arms: { L: [.4, -.2], R: { ik: [.36, -.4] } }, face: { eyes: n > 1 ? 'happy' : 'normal', mouth: 'smile', look: [.5, .2] } }));
  rrect(ctx, 620, 960, 420, 290, 12); fillStroke(ctx, '#8a5a34', 8);
  rrect(ctx, 680, 860, 150, 110, 10); fillStroke(ctx, '#c9ced6', 6); text(ctx, '১২৩', 755, 895, 34, INK, INK, 0, BN, 700);
  for (let s = 0; s < 3; s++) for (let i = 0; i < 3 + s; i++) { ellipse(ctx, 900 + s * 50 - 50, 950 - i * 22, 34, 12); fillStroke(ctx, '#f2c230', 5); }
  for (let i = 0; i < 4; i++) { const a = (t * .8 + i * .25) % 1; ctx.save(); ctx.globalAlpha = 1 - a; text(ctx, '৳', 760 + i * 70, 820 - a * 220, 54, '#3fa35b', INK, 8, BN, 700); text(ctx, '৳', 760 + i * 70, 820 - a * 220, 54, '#3fa35b', INK, 0, BN, 700); ctx.restore(); }
  pill(ctx, 760, 420, 'দুই দায়িত্ব একসাথে', '#fff', INK, 50, on(t, Wt(17, 8), .3));
});
// ======================= 19 career timeline =======================
S(B(18), B(19), (ctx, lt, t) => {
  const cx = kf(t, [[B(18), 1100], [Wt(18, 5) - .2, 1100], [Wt(18, 12) + .4, 120], [B(19), 60]]);
  const cam = camAt(t, lt, { x: cx, z: .95, vz: .0 });
  skyBG(ctx, cam, '#3ea6ee', '#d9f2ff', t); ground(ctx, cam, 1250);
  applyCam(ctx, cam, 1); rrect(ctx, -900, 1050, 3000, 130, 0); fillStroke(ctx, '#6b6f78', 7); for (let x = -900; x < 2100; x += 120) line(ctx, x, 1115, x + 60, 1115, 8, '#fff');
  const post_ = (x, str, col, fg, font) => { line(ctx, x, 1060, x, 780, 12); ctx.font = `700 54px ${font}`; const w = ctx.measureText(str).width + 60; rrect(ctx, x - w / 2, 690, w, 100, 16); fillStroke(ctx, col, 7); text(ctx, str, x, 742, 54, fg, INK, 0, font, 700); };
  post_(-260, 'Cisco', '#1ba0d7', '#fff', 'Poppins'); post_(250, 'Microsoft', '#fff', INK, 'Poppins');
  line(ctx, 860, 1060, 860, 700, 12); ctx.beginPath(); ctx.moveTo(860, 700); ctx.lineTo(1040, 740); ctx.lineTo(860, 790); fillStroke(ctx, '#e0392f', 7); text(ctx, '২০১৩', 935, 746, 44, '#fff', INK, 0, BN, 700);
  brandSign(ctx, 1260, 760, .9, 'nv'); line(ctx, 1260, 815, 1260, 1060, 12);
  const br = on(t, Wt(18, 7), .5); if (br > 0) { ctx.save(); ctx.globalAlpha = br; line(ctx, -460, 560, 450, 560, 10); line(ctx, -460, 560, -460, 620, 10); line(ctx, 450, 560, 450, 620, 10); pill(ctx, 0, 480, 'প্রায় ২৫ বছর', '#ffd23a', INK, 56, br); ctx.restore(); }
  const kx = kf(t, [[B(18), 1100], [Wt(18, 5), 1150], [Wt(18, 12), 1180]]);
  drawStick(ctx, C(KRESS, { x: cx + 230, y: 1250, s: 420, legs: walkLegs(t, 8, .4), face: { eyes: 'normal', mouth: 'smile', look: [-.5, 0] } }));
});
// ======================= 20 search inside & outside =======================
S(B(19), B(20), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 }); city(ctx, cam, t);
  rrect(ctx, 40, 640, 470, 610, 16); fillStroke(ctx, '#2c2f35', 8); rrect(ctx, 70, 700, 410, 560, 10); fillStroke(ctx, '#eaf5d8', 6); brandSign(ctx, 275, 640, .6, 'nv');
  for (let i = 0; i < 3; i++) drawStick(ctx, C(P, { cols: PAL.green, x: 150 + i * 120, y: 1250, s: 250, face: { eyes: 'normal', mouth: 'smile', look: [Math.sin(t + i) * .5, 0] } }));
  for (let i = 0; i < 3; i++) drawStick(ctx, C(P, { cols: [PAL.blue, PAL.purple, PAL.red][i], x: 640 + i * 140, y: 1250, s: 280, face: { eyes: 'normal', mouth: 'smile', look: [Math.sin(t * 1.3 + i) * .5, 0] } }));
  pill(ctx, 275, 590, 'ভেতরে', '#fff', INK, 46, on(t, Wt(19, 5), .3)); pill(ctx, 780, 830, 'বাইরে', '#fff', INK, 46, on(t, Wt(19, 5) + .3, .3));
  chair(ctx, 540, 520, .55, '#2b2b33', 'CEO'); pill(ctx, 540, 260, 'স্থায়ী CEO?', '#ffd23a', INK, 56, on(t, Wt(19, 0), .3));
  const mx = kf(t, [[B(19), 200], [Wt(19, 5), 260], [Wt(19, 7), 820], [B(20), 860]]); magnifier(ctx, mx, 1020 + Math.sin(t * 3) * 20, 120);
});
// ======================= 21 first separate chairman =======================
S(B(20), B(21), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeNV(ctx, cam);
  drawStick(ctx, C(JONES, { x: 540, y: 1010, s: 460, arms: { L: [.3, -.1], R: [.3, -.1] }, face: { eyes: 'normal', mouth: 'smile' } }));
  ellipse(ctx, 540, 1130, 470, 120); fillStroke(ctx, '#8a5a34', 8); ellipse(ctx, 540, 1110, 440, 95); ctx.fillStyle = '#a06a3e'; ctx.fill();
  for (let i = 0; i < 4; i++) { const x = [140, 300, 780, 940][i]; drawStick(ctx, C(P, { cols: PAL.navy, x, y: 1290, s: 330, shadow: false, face: { eyes: 'normal', mouth: 'smile', look: [x < 540 ? .7 : -.7, -.3] } })); }
  gavel(ctx, 700, 1070, .5, -.3 + Math.sin(Math.max(0, t - Wt(20, 5)) * 18) * .3 * (1 - on(t, Wt(20, 5) + .5, .4)));
  pill(ctx, 820, 450, 'এই প্রথম', '#ffd23a', INK, 54, on(t, Wt(20, 2), .3));
  nameTag(ctx, 540, 1180, 'হার্ভি সি. জোনস', 'বোর্ড চেয়ারম্যান, Nvidia', on(t, Wt(20, 7), .4), NV);
});
// ======================= 22 little time =======================
S(B(21), B(22), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeNV(ctx, cam);
  popIn(ctx, 270, 560, on(t, B(21), .3), c => clockFace(c, 0, 0, 150, t * 9));
  const pg = Math.floor(Math.max(0, t - B(21)) * 3);
  rrect(ctx, 620, 410, 300, 300, 18); fillStroke(ctx, '#fff', 8); ctx.fillStyle = '#e0392f'; ctx.fillRect(624, 414, 292, 70); text(ctx, 'নভেম্বর', 770, 452, 40, '#fff', INK, 0, BN, 700); text(ctx, bnum(12 + Math.min(pg, 6)), 770, 600, 120, INK, INK, 0, BN, 700);
  const rep = on(t, Wt(21, 5), .4); if (rep > 0) popIn(ctx, 760, 960, rep, c => { rrect(c, -190, -150, 380, 300, 14); fillStroke(c, '#fff', 7); text(c, 'আয়ের হিসাব', 0, -100, 44, INK, INK, 0, BN, 700); for (let i = 0; i < 4; i++) { const h = [60, 100, 80, 150][i] * clamp(rep * 1.2); rrect(c, -130 + i * 75, 120 - h, 50, h, 6); fillStroke(c, NV, 5); } });
  drawStick(ctx, C(KRESS, { x: 280, y: 1260, s: 460, face: { eyes: 'wide', mouth: 'teeth', look: [.6, -.4] } })); sweat(ctx, 400, 840 + (t * 80) % 60, 30, 1);
});
// ======================= 23 a desk full of trouble =======================
S(B(22), B(23), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeNV(ctx, cam);
  rrect(ctx, 160, 1000, 760, 250, 12); fillStroke(ctx, '#8a5a34', 8);
  const g = on(t, Wt(22, 5), 1);
  for (let s = 0; s < 3; s++) { const n = 3 + Math.floor(g * (4 + s * 2)); for (let i = 0; i < n; i++) { const wob = Math.sin(t * 6 + s) * i * 1.4 * g; rrect(ctx, 230 + s * 230 + wob, 960 - i * 46, 200, 44, 6); fillStroke(ctx, ['#fff', '#f6f1e3', '#ffe9a8'][i % 3], 5); } }
  for (let i = 0; i < 5; i++) { const a = on(t, Wt(22, 5) + i * .12, .25); if (a > 0) popIn(ctx, 200 + i * 170, 380 + (i % 2) * 90, a, c => { c.rotate((i - 2) * .12); rrect(c, -60, -50, 120, 100, 8); fillStroke(c, ['#ffe14d', '#ff9fb3', '#8fd8ff'][i % 3], 5); text(c, '!', 0, 4, 70, '#e0392f', INK, 0, 'Poppins', 700); }); }
  drawStick(ctx, C(P, { sil: '#2b2b33', x: kf(t, [[B(22), 1250], [B(23), 930]]), y: 1250, s: 480 }));
  pill(ctx, 830, 650, 'নতুন CEO?', '#ffd23a', INK, 46, on(t, Wt(22, 0), .3));
});
// ======================= 24 Semafor: DOJ probes =======================
S(B(23), Wt(23, 8) - .1, (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); skyBG(ctx, cam, '#5d7fb8', '#d6e2f5', t); ground(ctx, cam, 1250, '#9aa3ad', '#7d8690');
  court(ctx, 540, 1250, 1.05, 'মার্কিন বিচার বিভাগ');
  const sp = on(t, B(23), .55); if (sp > 0) { ctx.save(); ctx.translate(540, 400); ctx.rotate((1 - easeOut(sp)) * 9); const k = easeOut(sp) * .8; ctx.scale(k, k); newspaper(ctx, 0, 0, 520, 380, 'Semafor', 'রিপোর্ট', -.05); ctx.restore(); }
  const fo = on(t, Wt(23, 6), .9); if (fo > 0) { ctx.save(); ctx.globalAlpha = clamp(fo * 3); for (let i = 0; i < 3; i++) folder(ctx, 230 + i * 310, 1080 - Math.sin(Math.min(1, fo * 3 - i * .3) * Math.PI) * 40, .8, 'তদন্ত', (i - 1) * .1); ctx.restore(); }
});
// ======================= 25 could reach Nvidia; antitrust =======================
S(Wt(23, 8) - .1, B(24), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); city(ctx, cam, t, .2);
  tower(ctx, 400, 1250, 440, 950, 'nv');
  const mx = 400 + Math.sin(t * 1.6) * 120, my = 700 + Math.cos(t * 1.3) * 120; magnifier(ctx, mx, my, 150, .8);
  pill(ctx, 820, 560, 'তদন্তের আওতায়?', '#ffd23a', INK, 44, on(t, Wt(23, 9), .3));
  const sc = on(t, Wt(23, 14), .35); if (sc > 0) popIn(ctx, 830, 930, sc, c => { scales(c, 0, 0, .9, Math.sin(t * 2) * .15); });
  pill(ctx, 820, 1160, 'প্রতিযোগিতা আইন', '#fff', INK, 42, on(t, Wt(23, 14), .3));
});
// ======================= 26 Megaspeed =======================
S(B(24), B(25), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); skyBG(ctx, cam, '#121633', '#2c3260', t, false); applyCam(ctx, cam, .2); circle(ctx, 820, 330, 70); fillStroke(ctx, '#fff6d8', 6); ground(ctx, cam, 1250, '#3b4048', '#2b2f35');
  spotlight(ctx, 470, 120, 1250, 120, 700, 1);
  for (let i = 0; i < 3; i++) zigzagBox(ctx, 300 + i * 170 - (i === 2 ? 80 : 0), 1250 - (i === 2 ? 140 : 0), .9, i === 1 ? 'Megaspeed' : null);
  for (let i = 0; i < 3; i++) chip(ctx, 220 + i * 190, 1010 - (i === 1 ? 140 : 0) - Math.abs(Math.sin(t * 2 + i)) * 20, .38);
  arrow(ctx, 640, 600, 920, 420, '#e0392f', 22, on(t, Wt(24, 0), .5)); pill(ctx, 930, 330, 'চীন', '#e0392f', '#fff', 54, on(t, Wt(24, 0) + .3, .3));
  pill(ctx, 320, 380, 'অভিযোগ', '#fff', INK, 50, on(t, Wt(24, 3), .3)); pill(ctx, 330, 480, 'Megaspeed অস্বীকার করেছে', '#fff', '#6a5a6a', 34, on(t, Wt(24, 5), .3));
  const tp = on(t, Wt(24, 7), .4); if (tp > 0) tape(ctx, -100, 1050 - tp * 250, 1180, 900 - tp * 250, 'তদন্ত চলছে');
});
// ======================= 27 now look at Apple =======================
S(B(25), B(26), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .04 }); skyBG(ctx, cam, '#3ea6ee', '#e6f7ff', t); applyCam(ctx, cam, .15); drawSun(ctx, 820, 330, 90, t, 1); ground(ctx, cam, 1250);
  tower(ctx, 540, 1250, 520, 900, 'ap');
  for (let i = 0; i < 3; i++) { const bx = 160 + ((t * 90 + i * 260) % 900), by = 520 + i * 60 + Math.sin(t * 4 + i) * 10; ctx.beginPath(); ctx.moveTo(bx - 20, by); ctx.quadraticCurveTo(bx - 10, by - 14 * Math.abs(Math.sin(t * 8 + i)), bx, by); ctx.quadraticCurveTo(bx + 10, by - 14 * Math.abs(Math.sin(t * 8 + i)), bx + 20, by); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
  drawStick(ctx, host(t, { x: 900, y: 1300, s: 400, arms: { L: { ik: [-.38, -.62] }, R: [.3, -.1] }, face: { eyes: 'normal', look: [-.8, -.3], mouth: talkMouth(t) } }));
});
// ======================= 28 planned, unhurried =======================
S(B(26), B(27), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeAP(ctx, cam);
  clipboard(ctx, 540, 820, 1.15, ['উত্তরসূরি তৈরি', 'সময় নিয়ে বদল', 'পরিকল্পনা মাফিক'], [Wt(26, 3), Wt(26, 4), Wt(26, 5)], t, 'নেতা বদল');
});
// ======================= 29 Cook hands over to Ternus =======================
S(B(27), B(28), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeAP(ctx, cam);
  const hand = on(t, Wt(27, 6), .6), side = on(t, Wt(27, 10), .6);
  const bx = lerp(430, 640, ease(hand));
  const cx = lerp(300, 370, side);
  drawStick(ctx, C(COOK, { x: cx, y: 1250, s: 560, badge: side > .5 ? 'চেয়ারম্যান' : null, arms: { L: [.3, -.1], R: hand < 1 ? { ik: [(bx - cx) / 560, -.5] } : (side > 0 ? { ik: [(700 - cx - 80) / 560, -.62] } : [.3, -.1]) }, face: { eyes: hand >= 1 ? 'happy' : 'normal', mouth: 'smile', look: [.7, 0] } }));
  drawStick(ctx, C(TERNUS, { x: 760, y: 1250, s: 560, badge: hand >= 1 ? 'CEO' : null, arms: { L: hand > .5 ? { ik: [(bx - 760) / 560, -.5] } : [.3, -.1], R: [.3, -.1] }, face: { eyes: hand >= 1 ? 'wide' : 'normal', mouth: hand >= 1 ? 'grin' : 'smile', look: [-.7, 0] } }));
  baton(ctx, bx, 1250 - .5 * 560 + 2, Math.PI / 2, 1);
  if (hand >= 1) for (let i = 0; i < 4; i++) sparkle(ctx, 640 + Math.cos(i * 1.6) * 120, 900 + Math.sin(i * 1.6) * 80, 26, 1 - on(t, Wt(27, 6) + .6, .8));
  nameTag(ctx, 760, 1170, 'জন টার্নাস', 'Apple-এর নতুন CEO', on(t, Wt(27, 3), .4), AP_D);
});
// ======================= 30 textbook =======================
S(B(28), B(29), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .04 }); room(ctx, cam, ['#fff1d6', '#ffd99a'], '#c8955a');
  book(ctx, 540, 760, 1.45, 1, 'পাঠ্যবই', c => {
    drawStick(c, C(COOK, { x: 90, y: 150, s: 180, arms: { L: [.3, -.1], R: { ik: [.4, -.5] } }, face: { eyes: 'happy', mouth: 'smile' } }));
    drawStick(c, C(TERNUS, { x: 210, y: 150, s: 180, arms: { L: { ik: [-.3, -.5] }, R: [.3, -.1] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, 0] } }));
    baton(c, 158, 60, Math.PI / 2, .45); text(c, 'অধ্যায় ১: হস্তান্তর', 150, -120, 30, INK, INK, 0, BN, 700);
  });
  const st = on(t, Wt(28, 6), .3); if (st > 0) popIn(ctx, 860, 420, st, c => { star5(c, 0, 0, 110, Math.sin(t) * .1, '#ffd23a'); });
});
// ======================= 31 and Nvidia? =======================
S(B(29), B(30), (ctx, lt, t) => {
  const fl = on(t, Wt(29, 1), .08) * (1 - on(t, Wt(29, 1) + .15, .3)); const hh = shake(t, 14 * fl, 3);
  const cam = camAt(t, lt, { z: 1.0, vz: .06, x: 540 + hh[0], y: 960 + hh[1] }); city(ctx, cam, t, .9);
  tower(ctx, 540, 1250, 520, 860, 'nv', { lit: .3 }); stormCloud(ctx, 560, 200, 190, t, fl); flash(ctx, fl * .5);
}, 'cut');
// ======================= 32 storm, overnight, no successor =======================
S(B(30), B(31), (ctx, lt, t) => {
  const night = on(t, Wt(30, 3), .5); const fl = Math.sin(t * 13) > .93 ? 1 : 0;
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); city(ctx, cam, t, .6 + .35 * night);
  if (night > 0) { applyCam(ctx, cam, .2); ctx.save(); ctx.globalAlpha = night; circle(ctx, 860, 300, 60); fillStroke(ctx, '#fff6d8', 6); circle(ctx, 885, 285, 50); ctx.fillStyle = mix('#3ea6ee', '#151a33', .95); ctx.fill(); ctx.restore(); applyCam(ctx, cam, 1); }
  tower(ctx, 300, 1250, 400, 900, 'nv', { lit: .3 }); stormCloud(ctx, 300, 300, 170, t, fl);
  popIn(ctx, 820, 560, on(t, Wt(30, 3), .3), c => clockFace(c, 0, 0, 100, t * 30));
  const em = on(t, Wt(30, 7), .3); spotlight(ctx, 780, 600, 1250, 80, 380, em); if (em > 0) { chair(ctx, 780, 1250, .75, '#2b2b33', 'CEO'); pill(ctx, 780, 880, 'উত্তরসূরি নেই', '#e0392f', '#fff', 46, em); }
  flash(ctx, fl * .25);
});
// ======================= 33 33 years =======================
S(B(31), B(32), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#1f2a1a', '#36502a'], '#202420', 1250, { stripes: false });
  spotlight(ctx, 330, 0, 1250, 100, 460, 1);
  drawStick(ctx, C(JENSEN, { x: 330, y: 1250, s: 560, face: { eyes: 'normal', mouth: 'smile', look: [.4, 0] } }));
  const n = Math.round(33 * ease(on(t, Wt(31, 1) - .1, .8)));
  label(ctx, bnum(n), 760, 470, 220, NV, on(t, Wt(31, 1) - .2, .2), 18); label(ctx, 'বছর', 760, 640, 80, '#fff', on(t, Wt(31, 2), .2), 12);
  const q = on(t, Wt(31, 7), .3); if (q > 0) { drawStick(ctx, C(P, { sil: '#55595f', x: 790, y: 1250, s: 420, alpha: q })); thoughtQ(ctx, 790, 800, 70, q, t); }
  const pb = on(t, Wt(31, 11), .3); if (pb > 0) popIn(ctx, 330, 470, pb, c => { rrect(c, -170, -130, 340, 260, 12); fillStroke(c, '#fff', 7); text(c, 'পরের পরিকল্পনা', 0, -80, 36, INK, INK, 0, BN, 700); text(c, '?', 0, 40, 120, '#e0392f', INK, 0, 'Poppins', 700); });
});
// ======================= 34 system, not a person =======================
S(B(32), B(33), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t, (c, x, y, w, h) => { c.fillStyle = '#fff6e0'; c.fillRect(x, y, w, h); gear(c, x + w / 2 - 70, y + h / 2, 80, t * on(t, Wt(32, 6), .3) * 2, '#8fa3b8'); gear(c, x + w / 2 + 70, y + h / 2 - 50, 55, -t * on(t, Wt(32, 6), .3) * 3, NV); });
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, arms: { L: { ik: [-.4, -.5] }, R: [.3, -.1] }, face: { eyes: 'normal', mouth: talkMouth(t), look: [-.6, -.2] } }));
  pill(ctx, 250, 860, 'মানুষ', '#fff', INK, 60, on(t, Wt(32, 4), .3)); cross(ctx, 250, 860, 1.4, on(t, Wt(32, 5), .35));
  pill(ctx, 300, 1030, 'ব্যবস্থা', '#3fa35b', '#fff', 66, on(t, Wt(32, 6), .3)); tick(ctx, 470, 1010, 1.2, on(t, Wt(32, 6) + .2, .35));
});
// ======================= 35 an institution that plans =======================
S(B(33), B(34), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); skyBG(ctx, cam, '#3ea6ee', '#e6f7ff', t); ground(ctx, cam, 1250);
  rrect(ctx, 200, 860, 680, 120, 12); fillStroke(ctx, '#e9edf2', 8); text(ctx, 'প্রতিষ্ঠান', 540, 922, 56, INK, INK, 0, BN, 700);
  for (let i = 0; i < 5; i++) { rrect(ctx, 230 + i * 140, 980, 60, 270, 8); fillStroke(ctx, '#cfd6de', 6); gear(ctx, 260 + i * 140, 1110, 30, t * (i % 2 ? 2 : -2), '#8fa3b8'); }
  const sw = on(t, Wt(33, 15) - .3, .8);
  drawStick(ctx, C(P, { cols: PAL.blue, hair: { style: 'short', col: '#999' }, x: lerp(540, 1000, ease(sw)), y: 860 + (sw > .45 ? (sw - .45) * 700 : 0), s: 330, face: { eyes: 'happy', mouth: 'smile' } }));
  drawStick(ctx, C(P, { cols: PAL.green, hair: { style: 'neat', col: '#2a2020' }, x: lerp(80, 540, ease(sw)), y: sw < .55 ? 1250 - sw * 0 : lerp(1250, 860, ease((sw - .55) / .45)), s: 330, face: { eyes: 'normal', mouth: 'grin' }, legs: sw > 0 && sw < 1 ? walkLegs(t, 10) : undefined }));
  speech(ctx, 540, 380, 700, 190, [0, 1], '#fff', on(t, Wt(33, 0), .3) * (1 - on(t, Wt(33, 6), .2))); if (t > Wt(33, 0) && t < Wt(33, 6)) text(ctx, 'আমি না থাকলে কে সামলাবে?', 540, 372, 50, INK, INK, 0, BN, 700);
  const nw = on(t, Wt(33, 18), .35); if (nw > 0) popIn(ctx, 840, 470, nw, c => newspaper(c, 0, 0, 300, 230, 'খবর', null, .08));
});
// ======================= 36 everything on one person =======================
S(B(34), B(35), (ctx, lt, t) => {
  const st = on(t, Wt(34, 9), .4), shk = on(t, Wt(34, 12), .2);
  const hh = shake(t, 16 * shk, 3);
  const cam = camAt(t, lt, { z: 1.0, vz: .03, x: 540 + hh[0], y: 960 + hh[1] }); skyBG(ctx, cam, mix('#3ea6ee', '#4a4f6b', st), mix('#e6f7ff', '#8a90a8', st), t, st < .5); ground(ctx, cam, 1250);
  const wob = Math.sin(t * 9) * .05 * shk;
  ctx.save(); ctx.translate(540, 720); ctx.rotate(wob); rrect(ctx, -330, -360, 660, 360, 14); fillStroke(ctx, '#e9edf2', 8);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { rrect(ctx, -290 + c * 100, -320 + r * 100, 60, 60, 6); ctx.fillStyle = '#9fd2f5'; ctx.fill(); }
  text(ctx, 'কোম্পানি', 0, -40, 54, INK, INK, 0, BN, 700); ctx.restore();
  drawStick(ctx, C(OWNER, { x: 540 + Math.sin(t * 10) * 10 * shk, y: 1250, s: 520, lean: wob, arms: { L: { ik: [-.22, -1.0] }, R: { ik: [.22, -1.0] } }, armLen: 1.2, face: { eyes: st > .5 ? 'wide' : 'squint', mouth: 'teeth', browAng: .3 } }));
  sweat(ctx, 680, 820, 30, 1);
  if (st > 0) { ctx.save(); ctx.globalAlpha = st; stormCloud(ctx, 760, 360, 110, t, Math.sin(t * 17) > .8 ? 1 : 0); ctx.restore(); pill(ctx, 300, 300, 'ব্যক্তিগত ঝড়', '#4a4f6b', '#fff', 46, st); }
});
// ======================= 37 one more thing =======================
S(B(35), B(36), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.1, vz: .04, y: 920 }); studio(ctx, cam, t);
  drawStick(ctx, host(t, { x: 600, y: 1260, s: 680, arms: { L: [.3, -.1], R: { ik: [.25, -1.0], bend: -1 } }, face: { eyes: 'normal', mouth: talkMouth(t), browOne: 1 } }));
  bulb(ctx, 840, 420, 1.1, on(t, Wt(35, 2), .2));
}, 'cut');
// ======================= 38 a president picks a CEO =======================
S(B(36), B(37), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); city(ctx, cam, t);
  tower(ctx, 820, 1250, 380, 900, 'nv');
  rrect(ctx, 130, 1020, 260, 230, 12); fillStroke(ctx, '#22306b', 8); text(ctx, 'প্রেসিডেন্ট', 260, 1130, 38, '#fff', INK, 0, BN, 700);
  const pt = on(t, Wt(36, 8), .4);
  drawStick(ctx, C(TRUMP, { x: 260, y: 1000, s: 460, arms: { L: [.4, -.2], R: pt > 0 ? { ik: [.42, -.7] } : [.4, -.2] }, face: { eyes: 'normal', mouth: pt ? 'grin' : 'smirk', look: [.7, 0] } }));
  chair(ctx, 820, 1250, .75, '#2b2b33', 'CEO', 0, pt);
  if (pt > 0) { ctx.save(); ctx.setLineDash([24, 18]); ctx.lineDashOffset = -t * 120; ctx.beginPath(); ctx.moveTo(470, 640); ctx.quadraticCurveTo(650, 450, 800 * pt + 470 * (1 - pt), 900); ctx.lineWidth = 10; ctx.strokeStyle = '#ffd23a'; ctx.stroke(); ctx.restore(); }
  pill(ctx, 540, 300, 'প্রকাশ্যে', '#e0392f', '#fff', 56, on(t, Wt(36, 3), .3)); pill(ctx, 820, 470, 'বেসরকারি কোম্পানি', '#fff', INK, 40, on(t, Wt(36, 5), .3));
});
// ======================= 39 AI chips: strategic asset =======================
S(B(37), B(38), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); const k = ease(on(t, Wt(37, 11), .7));
  room(ctx, cam, [mix('#fff1d6', '#1a2340', k), mix('#ffd99a', '#2f3f73', k)], mix('#c8955a', '#1b1f2e', k));
  if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k; rrect(ctx, 100, 1000, 880, 30, 6); fillStroke(ctx, '#8a5a34', 6); for (let i = 0; i < 3; i++) if (i !== 1) chip(ctx, 250 + i * 290, 900, .45); ctx.restore(); }
  const cx = lerp(540, 540, k), cy = lerp(900, 720, k);
  if (k > 0) { globe(ctx, 540, 720, 360 * k, t); vault(ctx, 540, 720, .9 * k, 1 - k); }
  chip(ctx, cx, cy, lerp(.45, .9, k), k);
  if (k < .5) { ctx.save(); ctx.globalAlpha = 1 - k * 2; ctx.translate(640, 790); ctx.rotate(.2); rrect(ctx, -80, -36, 160, 72, 14); fillStroke(ctx, '#ffd23a', 6); text(ctx, 'পণ্য', 0, 2, 40, INK, INK, 0, BN, 700); ctx.restore(); cross(ctx, 640, 790, 1.2, on(t, Wt(37, 10), .3)); }
  const sh = on(t, Wt(37, 13), .35); if (sh > 0) popIn(ctx, 540, 1130, sh, c => { c.font = `700 56px ${BN}`; rrect(c, -260, -55, 520, 110, 30); fillStroke(c, '#2f63c9', 7); text(c, 'কৌশলগত সম্পদ', 0, 3, 56, '#fff', INK, 0, BN, 700); });
});
// ======================= 40 unknowns =======================
S(B(38), B(39), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.05, vz: .03 }); studio(ctx, cam, t);
  drawStick(ctx, host(t, { x: 560, y: 1260, s: 640, arms: { L: [1.6, -1.6], R: [1.6, -1.6] }, face: { eyes: 'normal', mouth: talkMouth(t, 'flat'), browAng: -.2, look: [0, -.5] } }));
  qmarks(ctx, 540, 520, 8, t, on(t, B(38), .5), 380);
});
// ======================= 41 when? =======================
S(B(39), B(40), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); officeNV(ctx, cam);
  spotlight(ctx, 540, 0, 1250, 100, 460, .7); chair(ctx, 540, 1250, 1.0, '#2b2b33', 'CEO');
  popIn(ctx, 280, 600, on(t, Wt(39, 2), .3), c => { rrect(c, -130, -130, 260, 260, 16); fillStroke(c, '#fff', 7); c.fillStyle = '#e0392f'; c.fillRect(-126, -126, 252, 60); text(c, '?', 0, 50, 140, INK, INK, 0, 'Poppins', 700); });
  popIn(ctx, 820, 600, on(t, Wt(39, 4), .3), c => clockFace(c, 0, 0, 110, t * 4));
});
// ======================= 42 names are guesses =======================
S(B(40), B(41), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#e8e2f7', '#c9bfe9'], '#5b4a7a');
  for (let i = 0; i < 4; i++) { const x = 170 + i * 250, j = Math.sin(t * 5 + i * 2) * 10; drawStick(ctx, C(P, { sil: '#4a4458', x, y: 1250, s: 360 })); popIn(ctx, x, 720 + j, on(t, B(40) + i * .12, .3), c => { rrect(c, -70, -80, 140, 160, 14); fillStroke(c, '#fff', 6); text(c, '?', 0, 6, 100, ['#e0392f', '#2f63c9', '#3fa35b', '#7a4bc4'][i], INK, 0, 'Poppins', 700); }); }
  pill(ctx, 540, 420, 'সবই অনুমান', '#ffd23a', INK, 64, on(t, Wt(40, 3), .3));
});
// ======================= 43 probe details not out =======================
S(B(41), B(42), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .04 }); room(ctx, cam, ['#dfe4ea', '#b9c2cd'], '#6b6f78');
  folder(ctx, 540, 760, 2.2, 'তদন্ত', -.04);
  popIn(ctx, 800, 930, on(t, Wt(41, 1), .3), c => { c.beginPath(); c.arc(0, -70, 60, Math.PI, 0); c.lineWidth = 22; c.strokeStyle = INK; c.stroke(); c.lineWidth = 12; c.strokeStyle = '#c9ced6'; c.stroke(); rrect(c, -90, -70, 180, 140, 16); fillStroke(c, '#e8c04a', 8); circle(c, 0, -10, 16); c.fillStyle = INK; c.fill(); });
  for (let i = 0; i < 5; i++) puff(ctx, 200 + i * 170 + Math.sin(t + i) * 30, 1180 - (i % 2) * 40, 110, t, 'rgba(240,240,248,.9)', 10 + i, .7);
  pill(ctx, 540, 420, 'বিস্তারিত জানা যায়নি', '#fff', INK, 52, on(t, Wt(41, 2), .3));
});
// ======================= 44 not proven in court =======================
S(B(42), B(43), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); skyBG(ctx, cam, '#5d7fb8', '#d6e2f5', t); ground(ctx, cam, 1250, '#9aa3ad', '#7d8690');
  court(ctx, 540, 1250, 1.05, 'আদালত');
  popIn(ctx, 540, 520, on(t, Wt(42, 4), .3), c => { rrect(c, -240, -70, 480, 140, 20); fillStroke(c, '#fff', 7); text(c, 'অভিযোগ', 0, 4, 64, INK, INK, 0, BN, 700); });
  gavel(ctx, 880, 1180, .6, -.4 + Math.sin(Math.max(0, t - Wt(42, 7)) * 16) * .3 * (1 - on(t, Wt(42, 7) + .5, .4)));
  pill(ctx, 540, 1130, 'প্রমাণিত নয়', '#e0392f', '#fff', 64, on(t, Wt(42, 8), .3));
});
// ======================= 45 our country =======================
S(B(43), B(44), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03, vx: 20 }); skyBG(ctx, cam, '#3ea6ee', '#e6f7ff', t); ground(ctx, cam, 1250, '#c9b48a', '#a8956e');
  shop(ctx, 220, 1250, 380, 640, 'রহিম স্টোর', 0, '#3fa35b'); shop(ctx, 640, 1250, 400, 700, 'করিম ট্রেডার্স', 0, '#2f63c9'); shop(ctx, 1060, 1250, 380, 620, 'মা ফার্মেসি', 0, '#e0392f');
  bdFlag(ctx, 470, 420, .9, t);
  drawStick(ctx, C(OWNER, { x: 640, y: 1250, s: 380, arms: POSE.hips.arms, face: { eyes: 'normal', mouth: 'smile' } }));
  pill(ctx, 640, 300, 'এক মানুষের ব্যবসা', '#ffd23a', INK, 50, on(t, Wt(43, 5), .3));
});
// ======================= 46 owner sick =======================
S(B(44), Wt(44, 5) - .12, (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#e6f0ff', '#c4d6f2'], '#9aa3ad');
  rrect(ctx, 60, 1030, 520, 120, 16); fillStroke(ctx, '#fff', 7); rrect(ctx, 40, 950, 40, 300, 10); fillStroke(ctx, '#8a5a34', 6);
  ctx.save(); ctx.translate(200, 1010); ctx.rotate(-Math.PI / 2); drawStick(ctx, C(OWNER, { x: 0, y: 250, s: 330, shadow: false, face: { eyes: 'x', mouth: 'frown' } })); ctx.restore();
  rrect(ctx, 150, 970, 420, 90, 30); fillStroke(ctx, '#8fb7e6', 7); line(ctx, 105, 930, 75, 880, 8, '#e0392f'); sweat(ctx, 130, 870, 24, 1);
  shop(ctx, 840, 1250, 380, 640, 'রহিম স্টোর', on(t, Wt(44, 3), .5), '#3fa35b');
});
// ======================= 47 founder away, client stuck =======================
S(Wt(44, 5) - .12, B(45), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 });
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 540, H); ctx.clip(); skyBG(ctx, cam, '#3ea6ee', '#fff1c4', t); applyCam(ctx, cam, .15); drawSun(ctx, 120, 330, 60, t, 1); ground(ctx, cam, 1250, '#f2d38a', '#d8b56a'); applyCam(ctx, cam, .3); drawSea(ctx, 960, t);
  applyCam(ctx, cam, 1); drawStick(ctx, C(P, { cols: PAL.yellow, hair: { style: 'neat', col: '#2a2020' }, glasses: 'shades', x: 280, y: 1250, s: 380, arms: POSE.hips.arms, face: { eyes: 'normal', mouth: 'grin' } }));
  rrect(ctx, 400, 1080, 110, 160, 14); fillStroke(ctx, '#e0392f', 7); pill(ctx, 280, 560, 'ছুটিতে', '#fff', INK, 46, on(t, Wt(44, 6), .3)); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(540, 0, 540, H); ctx.clip(); room(ctx, cam, ['#eef1f5', '#d0d8e2'], '#7d8690');
  laptop(ctx, 830, 1080, 1.0, c => spinner(c, 0, -105, 40, t)); drawStick(ctx, C(CLIENT, { x: 760, y: 1250, s: 380, arms: { L: [.9, -2.2], R: [.9, -2.2] }, face: { eyes: 'half', mouth: 'frown', look: [.5, .3] } }));
  pill(ctx, 810, 560, 'কাজ আটকে', '#e0392f', '#fff', 46, on(t, Wt(44, 10), .3)); ctx.restore();
  applyCam(ctx, cam, 1); line(ctx, 540, -400, 540, 2400, 10);
}, 'cut');
// ======================= 48 three lessons =======================
S(B(45), B(46), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); room(ctx, cam, ['#2a4a3a', '#2f6b4f'], '#5b3a22', 1250, { stripes: false });
  rrect(ctx, 80, 330, 920, 820, 20); fillStroke(ctx, '#244b38', 10); rrect(ctx, 80, 330, 920, 820, 20); ctx.lineWidth = 26; ctx.strokeStyle = '#a0602c'; ctx.stroke();
  brandSign(ctx, 330, 450, .6, 'ap'); brandSign(ctx, 750, 450, .6, 'nv');
  label(ctx, 'থেকে ৩টি শিক্ষা', 540, 600, 66, '#fff', on(t, Wt(45, 4), .3), 10);
  for (let i = 0; i < 3; i++) bigNum(ctx, 250 + i * 290, 880, i + 1, on(t, Wt(45, 6) + i * .2, .35), ['#ffd23a', '#8fd8ff', '#ff9fb3'][i]);
});
// ======================= 49 lesson 1 =======================
S(B(46), B(47), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); room(ctx, cam, ['#fff1d6', '#ffd99a'], '#c8955a');
  bigNum(ctx, 170, 330, 1, on(t, B(46), .3));
  pill(ctx, 620, 330, 'আগেই উত্তরসূরি ঠিক করুন', '#fff', INK, 44, on(t, Wt(46, 1), .3));
  const st = [[600, 1250], [700, 1150], [800, 1050], [900, 950]];
  for (let i = 0; i < 4; i++) { rrect(ctx, 560 + i * 100, 1250 - (i + 1) * 100, 400 - i * 100, (i + 1) * 100 + 4, 6); fillStroke(ctx, '#e9e2d0', 6); }
  const cl = clamp((t - Wt(46, 7)) / (Wt(46, 13) - Wt(46, 7))); const step = Math.min(3, Math.floor(cl * 4));
  const hp = cl >= 1 ? st[3] : [lerp(st[step][0], st[Math.min(3, step + 1)][0], (cl * 4) % 1), lerp(st[step][1], st[Math.min(3, step + 1)][1], easeOut((cl * 4) % 1)) - Math.sin(((cl * 4) % 1) * Math.PI) * 60];
  drawStick(ctx, C(OWNER, { x: 260, y: 1250, s: 500, arms: { L: [.3, -.1], R: { ik: [.4, -.62] } }, face: { eyes: 'happy', mouth: 'smile', look: [.7, -.3] } }));
  drawStick(ctx, C(HELPER, { x: cl > 0 ? hp[0] : 480, y: cl > 0 ? hp[1] - 100 : 1250, s: 360 + cl * 120, badge: cl >= 1 ? 'দ্বিতীয়' : null, face: { eyes: 'normal', mouth: 'grin', look: [-.4, 0] } }));
  for (let i = 0; i < 3; i++) { const a = on(t, Wt(46, 11) + i * .2, .3); if (a > 0) popIn(ctx, 900 + i * 0, 780 - i * 90, a, c => { rrect(c, -95, -32, 190, 64, 14); fillStroke(c, '#ffd23a', 5); text(c, ['চাবি', 'হিসাব', 'ক্লায়েন্ট'][i], 0, 2, 34, INK, INK, 0, BN, 700); }); }
});
// ======================= 50 lesson 2 =======================
S(B(47), B(48), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); room(ctx, cam, ['#e6f0ff', '#c4d6f2'], '#7d8690');
  bigNum(ctx, 170, 330, 2, on(t, B(47), .3), '#8fd8ff');
  const half = on(t, Wt(47, 7) - .1, .25);
  if (half < 1) { ctx.save(); ctx.globalAlpha = 1 - half;
    drawStick(ctx, C(OWNER, { x: 540, y: 1250, s: 520, arms: { L: [2.3 + Math.sin(t * 12) * .3, .3], R: [2.3 - Math.sin(t * 12) * .3, .3] }, face: { eyes: 'spiral', mouth: 'teeth' }, t }));
    for (let i = 0; i < 6; i++) { const a = t * 5 + i * TAU / 6; ellipse(ctx, 540 + Math.cos(a) * 230, 520 + Math.sin(a) * 110, 50, 50); fillStroke(ctx, ['#e0392f', '#f2b52a', '#2f63c9', '#3fa35b', '#7a4bc4', '#ff9fb3'][i], 6); }
    pill(ctx, 640, 330, 'সব সিদ্ধান্ত এক হাতে', '#fff', INK, 44, on(t, Wt(47, 1), .3)); cross(ctx, 900, 1000, 1.6, on(t, Wt(47, 5), .3)); ctx.restore(); }
  if (half > 0) { ctx.save(); ctx.globalAlpha = half;
    ellipse(ctx, 540, 1120, 360, 90); fillStroke(ctx, '#8a5a34', 8);
    drawStick(ctx, C(OWNER, { x: 540, y: 1000, s: 400, face: { eyes: 'normal', mouth: 'smile' } }));
    for (let i = 0; i < 3; i++) { const x = [190, 890, 540][i], y = [1220, 1220, 1290][i]; drawStick(ctx, C(P, { cols: [PAL.blue, PAL.purple, PAL.green][i], hair: { style: 'short', col: '#555' }, x, y, s: 330, face: { eyes: 'normal', mouth: 'smile', look: [x < 540 ? .7 : x > 540 ? -.7 : 0, -.4] } })); speech(ctx, x + (x < 540 ? 60 : x > 540 ? -60 : 160), 660 - (i === 2 ? 60 : 0), 120, 90, [x > 540 ? .4 : -.4, 1], '#fff', on(t, Wt(47, 10) + i * .2, .3)); }
    pill(ctx, 640, 330, 'পরামর্শ দেওয়ার মানুষ', '#fff', INK, 44, half); ctx.restore(); }
});
// ======================= 51 lesson 3 =======================
S(B(48), B(49), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); room(ctx, cam, ['#fff0f3', '#ffd1db'], '#8a5a6a');
  bigNum(ctx, 170, 330, 3, on(t, B(48), .3), '#ff9fb3');
  const dec = on(t, Wt(48, 6), .3);
  drawStick(ctx, C(VIP, { x: 260, y: 1250, s: 520, arms: { L: [.4, -.2], R: [2.0, -.3] }, prop: megaphone, face: { eyes: 'normal', mouth: talking(t) && dec < 1 ? 'o' : 'smile' } }));
  star5(ctx, 150, 640, 50, t, '#ffd23a');
  drawStick(ctx, C(OWNER, { x: 800, y: 1250, s: 520, arms: dec < 1 ? { L: { ik: [-.2, -.78], bend: 1 }, R: [.3, -.1] } : { L: [.3, -.1], R: { ik: [.3, -.55] } }, face: { eyes: dec < 1 ? 'normal' : 'happy', mouth: 'smile', look: [dec < 1 ? -.8 : .6, 0] } }));
  if (dec > 0) clipboard(ctx, 830, 560, .42, ['নিজের দরকার'], [Wt(48, 10)], t, 'সিদ্ধান্ত');
  pill(ctx, 640, 330, 'শুনুন, তবে নিজে বুঝে', '#fff', INK, 44, on(t, Wt(48, 1), .3));
});
// ======================= 52 headlines =======================
S(B(49), B(50), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .05 }); room(ctx, cam, ['#20234a', '#3a2f6b'], '#1b1730', 1250, { stripes: false });
  for (let i = 0; i < 3; i++) { const a = on(t, B(49) + i * .2, .35); if (a > 0) popIn(ctx, 540 + (i - 1) * 60, 760 + (i - 1) * 40, a, c => newspaper(c, 0, 0, 640, 760, 'শিরোনাম', 'ট্রাম্পের মন্তব্য', (i - 1) * .08)); }
  const f = (Math.sin(t * 9) > .85 ? 1 : 0) * on(t, Wt(49, 4), .1); flash(ctx, f * .35);
  for (let i = 0; i < 3; i++) if (Math.sin(t * 9 + i * 2) > .85) burst(ctx, 160 + i * 380, 300 + (i % 2) * 900, 70, 10, '#fff', i);
});
// ======================= 53 planned vs forced =======================
S(B(50), B(51), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .02 });
  const lk = on(t, Wt(50, 3), .4), rk = on(t, Wt(50, 8), .4);
  splitAN(ctx, t, lt, cam, .3 + .7 * lk, .3 + .7 * rk, rk);
  pill(ctx, 270, 330, 'পরিকল্পিত', '#3fa35b', '#fff', 52, lk); pill(ctx, 810, 330, 'বাধ্য হয়ে', '#e0392f', '#fff', 52, rk);
});
// ======================= 54 inside or outside? =======================
S(B(51), B(52), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .025 }); officeNV(ctx, cam);
  const li = on(t, Wt(51, 7), .3), ro = on(t, Wt(51, 12), .3);
  for (const [x, str, a] of [[230, 'ভেতর থেকে', li], [850, 'বাইরে থেকে', ro]]) { if (a > 0) { ctx.save(); ctx.globalAlpha = a * .8; spotlight(ctx, x, 400, 1250, 60, 340, 1); ctx.restore(); } rrect(ctx, x - 130, 760, 260, 490, [20, 20, 0, 0]); fillStroke(ctx, a > 0 ? '#ffe9a8' : '#8a5a34', 8); circle(ctx, x + 90, 1020, 14); fillStroke(ctx, '#e8c04a', 5); pill(ctx, x, 690, str, '#fff', INK, 40, Math.max(.001, a) > 0 ? 1 : 0); }
  chair(ctx, 540, 1250, .8, '#2b2b33', 'CEO'); thoughtQ(ctx, 540, 640, 80, on(t, Wt(51, 4), .3), t);
  const cm = on(t, Wt(51, 14), .35); if (cm > 0) { popIn(ctx, 540, 380, cm, c => { rrect(c, -300, -90, 600, 180, 40); fillStroke(c, '#fff', 8); c.beginPath(); c.moveTo(-160, 85); c.lineTo(-200, 150); c.lineTo(-100, 88); fillStroke(c, '#fff', 8); rrect(c, -296, -86, 592, 172, 36); c.fillStyle = '#fff'; c.fill(); text(c, 'কমেন্টে জানান', 0, 4, 66, INK, INK, 0, BN, 700); }); arrow(ctx, 900, 520, 900, 1150, '#ffd23a', 24, on(t, Wt(51, 15), .4)); }
});
// ======================= 55 follow =======================
S(B(52), B(53), (ctx, lt, t) => {
  const cam = camAt(t, lt, { z: 1.0, vz: .03 }); studio(ctx, cam, t);
  pill(ctx, 280, 620, 'গুজব', '#fff', INK, 60, on(t, Wt(52, 0), .3)); cross(ctx, 280, 620, 1.3, on(t, Wt(52, 1), .3));
  pill(ctx, 330, 790, 'যাচাই করা খবর', '#3fa35b', '#fff', 52, on(t, Wt(52, 2), .3));
  const fp = on(t, Wt(52, 9), .3), pressed = t > Wt(52, 9) + .25;
  drawStick(ctx, host(t, { x: 760, y: 1260, s: 600, arms: { L: fp > 0 ? { ik: [-.3, -.62] } : [.3, -.1], R: [2.6 + Math.sin(t * 9) * .3, .5] }, face: { eyes: pressed ? 'happy' : 'normal', mouth: talkMouth(t, 'grin') } }));
  popIn(ctx, 360, 970, on(t, Wt(52, 8), .3), c => { c.save(); if (pressed) c.scale(.94, .94); rrect(c, -170, -60, 340, 120, 60); fillStroke(c, pressed ? '#8a8494' : '#e0392f', 8); text(c, pressed ? 'ফলো করা হয়েছে' : 'ফলো', 0, 3, pressed ? 40 : 60, '#fff', INK, 0, BN, 700); c.restore(); });
  if (pressed) { const r = Math.sin(t * 20) * .3 * (1 - on(t, Wt(52, 9) + .8, .5)); ctx.save(); ctx.translate(760, 430); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-60, 40); ctx.quadraticCurveTo(-60, -70, 0, -70); ctx.quadraticCurveTo(60, -70, 60, 40); ctx.lineTo(75, 55); ctx.lineTo(-75, 55); ctx.closePath(); fillStroke(ctx, '#ffd23a', 8); circle(ctx, 0, 72, 16); fillStroke(ctx, '#ffd23a', 6); ctx.restore(); }
  nameTag(ctx, 300, 1180, 'রুবেল মিয়া', 'টেক ও AI খবর', on(t, Wt(52, 0), .4), '#2e9e6a');
}, 'cut');
