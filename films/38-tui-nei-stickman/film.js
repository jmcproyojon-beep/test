// THE FILM — «তুই নেই», a stickman story on the user's song. Pure function of t: every scene, pose and flourish is
// computed from the song clock (score.js), so parallel workers draw identical frames.
// Look: hand-inked stick figures that boil on twos, on paper. The present is cool grey paper with rain; memories are
// warm paper; the only colour that belongs to her is a red scarf (and her red umbrella).
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clock, SCENES, T, BEAT } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, GY = 880;                       // ground line
  const Hh = (...a) => U.hash(...a);
  const INK = '#221D18', RED = '#D23A2B', GOLD = '#E9B44C';
  const PAPER = { now: '#E4E3DE', then: '#F2E2C4', dream: '#1B2140', wind: '#EADBC0' };
  let ink = INK;                                             // swapped to cream on the night-sky scene
  const sm = (x) => x * x * (3 - 2 * x);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const beatPulse = (t, k = 7) => Math.exp(-clock.phase(t) * k);          // 1 on each beat, decays
  const barOf = (t) => Math.floor(clock.beatAt ? clock.beatAt(t) / 4 : 0);
  const L = (ctx, pts, lw, seed, o = {}) => G.line(ctx, pts, { color: o.color || ink, lw, seed, amp: o.amp ?? 1.3, step: o.step ?? 16, alpha: o.alpha ?? 1 });
  const ell = (ctx, x, y, rx, ry, o = {}) => G.ellipse(ctx, x, y, rx, ry, { stroke: o.stroke || ink, lw: o.lw ?? 4, fill: o.fill, seed: o.seed || 1, amp: o.amp ?? 1.2, alpha: o.alpha ?? 1 });
  const poly = (ctx, pts, o = {}) => G.poly(ctx, pts, { stroke: o.stroke || ink, lw: o.lw ?? 4, fill: o.fill, seed: o.seed || 1, amp: o.amp ?? 1.2, alpha: o.alpha ?? 1 });

  // ================================================================ the stick figure rig
  // angles are measured from straight down; + swings toward the way the figure faces (f = ±1)
  const V = (a, len, f) => [Math.sin(a) * len * f, Math.cos(a) * len];
  const P = {
    stand: () => ({ la: [0.14, 0.06], ra: [0.12, 0.1], ll: [0.06, 0], rl: [-0.07, 0] }),
    sad: () => ({ la: [0.05, 0.02], ra: [0.04, 0.02], ll: [0.05, 0], rl: [-0.05, 0], lean: 0.12, head: 0.35 }),
    walk: (ph, k = 1) => ({ la: [-0.45 * k * Math.sin(ph), 0.3], ra: [0.45 * k * Math.sin(ph), 0.3], ll: [0.42 * k * Math.sin(ph), -0.55 * k * Math.max(0, Math.cos(ph))], rl: [-0.42 * k * Math.sin(ph), -0.55 * k * Math.max(0, -Math.cos(ph))], lean: 0.05, bob: Math.abs(Math.cos(ph)) * 5 * k }),
    run: (ph) => ({ la: [-0.95 * Math.sin(ph), 1.5], ra: [0.95 * Math.sin(ph), 1.5], ll: [0.85 * Math.sin(ph), -1.25 * Math.max(0.15, Math.cos(ph))], rl: [-0.85 * Math.sin(ph), -1.25 * Math.max(0.15, -Math.cos(ph))], lean: 0.28, bob: Math.abs(Math.cos(ph)) * 10 }),
    sit: () => ({ hipH: 58, la: [0.55, 0.9], ra: [0.45, 1.0], ll: [1.45, -1.4], rl: [1.35, -1.3], lean: -0.04 }),
    floor: () => ({ hipH: 12, la: [0.95, 0.5], ra: [0.85, 0.6], ll: [1.05, -2.15], rl: [0.95, -2.0], lean: 0.08 }),
    kneel: () => ({ hipH: 58, la: [0.1, 0.05], ra: [0.15, 0.1], ll: [0.05, -1.6], rl: [-0.05, -1.55], lean: 0.35, head: 0.5 }),
    reach: () => ({ la: [0.2, 0.1], ra: [2.75, 0.05], ll: [0.06, 0], rl: [-0.07, 0], lean: -0.05, head: -0.35 }),
    wave: (t) => ({ la: [0.14, 0.06], ra: [2.55, 0.35 + 0.35 * Math.sin(t * 9)], ll: [0.06, 0], rl: [-0.07, 0] }),
  };
  // feet at (x, y); s = scale; f = facing; p = pose; who: 'him' | 'her'
  function fig(ctx, x, y, o) {
    const s = o.s || 1, f = o.f || 1, p = o.p || P.stand(), seed = o.seed || (o.who === 'her' ? 500 : 300);
    const lw = 6.5 * s, TH = 56 * s, SH = 56 * s, UA = 44 * s, FA = 42 * s, TOR = 96 * s, HR = 23 * s;
    const lean = p.lean || 0;
    const legPts = (lg) => { const k = V(lg[0], TH, f), a = V(lg[0] + lg[1], SH, f); return [k, [k[0] + a[0], k[1] + a[1]]]; };
    const LL = legPts(p.ll), RL = legPts(p.rl);
    const drop = p.hipH != null ? p.hipH * s : Math.max(LL[1][1], RL[1][1]);
    const hip = [x + (o.dx || 0), y - drop + (p.bob || 0) * s];
    const neck = [hip[0] + Math.sin(lean) * TOR * f, hip[1] - Math.cos(lean) * TOR];
    const hc = [neck[0] + Math.sin(lean + (p.head || 0)) * (HR + 4 * s) * f, neck[1] - Math.cos(lean + (p.head || 0)) * (HR + 4 * s)];
    const sh = [lerp(hip[0], neck[0], 0.9), lerp(hip[1], neck[1], 0.9)];
    const arm = (a) => { const e = V(a[0] - lean * 0.3, UA, f), h = V(a[0] + a[1], FA, f); return [sh, [sh[0] + e[0], sh[1] + e[1]], [sh[0] + e[0] + h[0], sh[1] + e[1] + h[1]]]; };
    const LA = arm(p.la), RA = arm(p.ra);
    const lg = (pts) => [hip, [hip[0] + pts[0][0], hip[1] + pts[0][1]], [hip[0] + pts[1][0], hip[1] + pts[1][1]]];
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.ghost) ctx.setLineDash([10 * s, 12 * s]);
    const col = o.color || ink;
    const back = { color: col, alpha: 0.8 };
    L(ctx, lg(RL), lw, seed + 1, back); L(ctx, RA, lw, seed + 2, back);
    // her red scarf tail flies behind her (drawn behind the body)
    if (o.who === 'her' && !o.noScarf) scarf(ctx, neck, -f, s, o.t || 0, o.wind ?? 1, seed);
    L(ctx, [hip, neck], lw, seed + 3, { color: col });
    L(ctx, lg(LL), lw, seed + 4, { color: col });
    // head
    if (o.who === 'her') ell(ctx, hc[0] - f * HR * 0.95, hc[1] - HR * 0.35, HR * 0.48, HR * 0.48, { fill: col, stroke: col, lw: 3 * s, seed: seed + 9 });
    ell(ctx, hc[0], hc[1], HR, HR, { fill: o.headFill || (ink === INK ? PAPER_NOW() : '#1B2140'), stroke: col, lw: 5 * s, seed: seed + 5 });
    if (o.who === 'him') for (let i = 0; i < 3; i++) L(ctx, [[hc[0] - 9 * s + i * 8 * s, hc[1] - HR + 2 * s], [hc[0] - 12 * s + i * 9 * s, hc[1] - HR - 9 * s]], 3.5 * s, seed + 20 + i, { color: col });
    if (!o.noFace) {
      const ex = hc[0] + f * 8 * s, ey = hc[1] - 3 * s, blink = Hh(seed, Math.floor((o.t || 0) * 0.7)) > 0.85 && ((o.t || 0) * 0.7 % 1) < 0.12;
      ctx.fillStyle = col;
      for (const dx of [-5, 6]) { ctx.beginPath(); if (blink || o.eyes === 'closed') ctx.rect(ex + dx * s - 3 * s, ey, 6 * s, 1.6 * s); else ctx.arc(ex + dx * s, ey, 2.4 * s, 0, 7); ctx.fill(); }
      const m = o.mouth || 'none', mx = hc[0] + f * 9 * s, my = hc[1] + 9 * s;
      if (m === 'smile') L(ctx, [[mx - 6 * s, my - 2 * s], [mx, my + 2 * s], [mx + 6 * s, my - 2 * s]], 2.6 * s, seed + 7, { color: col, amp: 0.4, step: 4 });
      if (m === 'sad') L(ctx, [[mx - 6 * s, my + 2 * s], [mx, my - 2 * s], [mx + 6 * s, my + 2 * s]], 2.6 * s, seed + 7, { color: col, amp: 0.4, step: 4 });
      if (m === 'open') ell(ctx, mx, my, 3.5 * s, 4.5 * s, { fill: col, stroke: col, lw: 1, seed: seed + 8, amp: 0.3 });
    }
    if (o.who === 'her' && !o.noScarf) L(ctx, [[neck[0] - 12 * s, neck[1] + 4 * s], [neck[0] + 12 * s, neck[1] + 6 * s]], 9 * s, seed + 31, { color: RED, amp: 0.8 });
    L(ctx, LA, lw, seed + 6, { color: col });
    ctx.restore();
    return { hip, neck, hc, hand: LA[2], handB: RA[2], sh };
  }
  const PAPER_NOW = () => curPaper;
  let curPaper = PAPER.now;
  function scarf(ctx, at, dir, s, t, wind, seed, n = 6, len = 15) {
    const pts = [[at[0], at[1] + 4 * s]];
    for (let i = 1; i <= n; i++) pts.push([at[0] + dir * i * len * s * (0.6 + 0.4 * wind), at[1] + 4 * s + i * 4 * s * (1.4 - wind) + Math.sin(t * 7 - i * 0.9) * i * 1.6 * s * wind]);
    L(ctx, pts, 8.5 * s, seed + 40, { color: RED, amp: 0.8, step: 8 });
  }

  // ================================================================ shared bits of world
  function sky(ctx, top, bottom) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function ground(ctx, y = GY, seed = 3) { L(ctx, [[-40, y], [W + 40, y + 2]], 5, seed, { step: 30 }); }
  function rain(ctx, t, n, amt, box = [0, 0, W, H], col = 'rgba(40,46,60,0.38)') {
    const [x0, y0, w, h] = box, burst = 1 + 0.6 * beatPulse(t, 5);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < n * amt; i++) {
      const sp = 900 + Hh(i, 2) * 500, x = x0 + ((Hh(i, 1) * (w + 200) + t * 120) % (w + 200)) - 100, y = y0 + ((Hh(i, 3) * (h + 200) + t * sp) % (h + 200)) - 100;
      const len = (22 + Hh(i, 4) * 26) * burst; ctx.moveTo(x, y); ctx.lineTo(x - len * 0.18, y + len);
    }
    ctx.stroke(); ctx.restore();
  }
  function steam(ctx, x, y, t, seed) {
    for (let k = 0; k < 2; k++) { const ph = (t * 0.6 + k * 0.5) % 1; const pts = []; for (let i = 0; i < 6; i++) pts.push([x + k * 10 + Math.sin(t * 2 + i * 0.9 + k) * 6, y - ph * 30 - i * 9]); L(ctx, pts, 2.5, seed + k, { alpha: 0.5 * (1 - ph), step: 6 }); }
  }
  function cup(ctx, x, y, s = 1, seed = 1) { poly(ctx, [[x - 14 * s, y - 26 * s], [x + 14 * s, y - 26 * s], [x + 11 * s, y], [x - 11 * s, y]], { fill: '#FBF7EE', lw: 3.5, seed }); L(ctx, [[x + 13 * s, y - 20 * s], [x + 22 * s, y - 16 * s], [x + 12 * s, y - 8 * s]], 3, seed + 1, { step: 5 }); }
  function heart(ctx, x, y, t, t0, s = 1) { const a = t - t0; if (a < 0 || a > 1.4) return; const k = ease.outBack(clamp(a / 0.3), 2.4) * s; ctx.save(); ctx.globalAlpha *= 1 - seg(a, 0.9, 1.4); G.heart(ctx, x, y - a * 50, 1.6 * k, { fill: RED, seed: 7 }); ctx.restore(); }
  function tree(ctx, x, y, s, seed) { L(ctx, [[x, y], [x + 2, y - 120 * s]], 6 * s, seed); ell(ctx, x, y - 160 * s, 55 * s, 50 * s, { fill: 'rgba(120,140,90,0.25)', seed, lw: 4 }); }
  function lamp(ctx, x, y, t, on = 1) {
    L(ctx, [[x, y], [x, y - 420], [x + 50, y - 440]], 6, 61); poly(ctx, [[x + 30, y - 440], [x + 80, y - 440], [x + 70, y - 420], [x + 40, y - 420]], { fill: '#F7E7B5', seed: 62 });
    const fl = on * (0.75 + 0.25 * beatPulse(t, 4));
    const g = ctx.createRadialGradient(x + 55, y - 420, 10, x + 55, y - 200, 360); g.addColorStop(0, `rgba(255,214,120,${0.42 * fl})`); g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 40, y - 420); ctx.lineTo(x + 70, y - 420); ctx.lineTo(x + 260, y + 20); ctx.lineTo(x - 150, y + 20); ctx.fill();
  }
  function bike(ctx, x, y, t, seed = 80) {
    const r = 46, a = t * 6;
    for (const wx of [x - 80, x + 80]) { ell(ctx, wx, y - r, r, r, { seed: seed + wx, lw: 4.5 }); for (let k = 0; k < 3; k++) { const q = a + k * 2.09; L(ctx, [[wx - Math.cos(q) * r * 0.9, y - r - Math.sin(q) * r * 0.9], [wx + Math.cos(q) * r * 0.9, y - r + Math.sin(q) * r * 0.9]], 2, seed + k, { amp: 0.3 }); } }
    L(ctx, [[x - 80, y - r], [x - 10, y - r - 70], [x + 50, y - r - 70], [x + 80, y - r]], 5, seed + 5); L(ctx, [[x - 10, y - r - 70], [x, y - r], [x + 50, y - r - 70]], 5, seed + 6);
    L(ctx, [[x + 50, y - r - 70], [x + 60, y - r - 100], [x + 80, y - r - 104]], 5, seed + 7); L(ctx, [[x - 20, y - r - 80], [x + 8, y - r - 80]], 6, seed + 8);
    L(ctx, [[x - 80, y - r - 60], [x - 20, y - r - 66]], 5, seed + 9);              // carrier
    return { seat: [x - 6, y - r - 82], carrier: [x - 55, y - r - 64], pedal: [x, y - r] };
  }

  // ================================================================ scenes
  const SC = {};
  SC.window = (ctx, t, u, lt) => {
    // a room at night: window right, rain outside; he sits at the table; two cups, one cold
    const wx = 1060, wy = 150, ww = 620, wh = 520;
    ctx.fillStyle = '#3B4257'; ctx.fillRect(wx, wy, ww, wh); rain(ctx, t, 140, 1, [wx, wy, ww, wh], 'rgba(220,228,240,0.55)');
    poly(ctx, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { lw: 7, seed: 11 }); L(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 6, 12); L(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 6, 13);
    ground(ctx, GY, 4);
    // table
    L(ctx, [[640, 690], [1180, 690]], 7, 21); L(ctx, [[690, 690], [700, GY]], 6, 22); L(ctx, [[1130, 690], [1120, GY]], 6, 23);
    cup(ctx, 860, 688, 1.1, 31); cup(ctx, 1010, 688, 1.1, 33); steam(ctx, 856, 656, t, 35);   // only his cup steams
    L(ctx, [[400, GY], [420, 760], [500, 760], [505, GY]], 5, 24); L(ctx, [[400, 760], [390, 600]], 5, 25);   // chair
    const look = lt > T(2) - S.SCENES[0].t0 ? 1 : 0;                   // bar 2: he looks at her empty cup
    const sip = Math.max(0, Math.sin(seg(lt, 4.5, 7.5) * Math.PI));
    const p = P.sit(); p.ra = [lerp(0.6, 2.2, sip), lerp(0.9, 1.6, sip)]; p.head = look ? 0.32 : -0.05 + 0.1 * sip; p.lean = look ? 0.1 : -0.04;
    fig(ctx, 460, GY, { who: 'him', p, f: 1, t, mouth: look ? 'sad' : 'none', s: 1.15 });
  };
  SC.fog = (ctx, t, u, lt, sc) => {
    // close on the misted glass: his finger writes the title; drops run through the letters
    ctx.fillStyle = '#4A5268'; ctx.fillRect(0, 0, W, H); rain(ctx, t, 220, 1, [0, 0, W, H], 'rgba(220,228,240,0.45)');
    ctx.fillStyle = 'rgba(214,220,226,0.82)'; ctx.fillRect(0, 0, W, H);
    L(ctx, [[W * 0.86, -20], [W * 0.86, H + 20]], 22, 14, { color: '#20242E' });
    const w0 = T(5) - sc.t0, w1 = T(7) - sc.t0, k = seg(lt, w0, w1);
    G.text(ctx, '', 0, 0, {});
    ctx.save(); ctx.font = '230px Galada'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText('তুই নেই').width, x0 = W / 2 - tw / 2;
    ctx.beginPath(); ctx.rect(x0 - 20, 0, (tw + 40) * k, H); ctx.clip();
    ctx.fillStyle = 'rgba(50,58,78,0.92)'; ctx.fillText('তুই নেই', W / 2, H / 2 - 20);
    ctx.restore();
    // drips from the letters after they are written
    for (let i = 0; i < 9; i++) { const d0 = w1 + 0.5 + i * 0.9; if (lt < d0) continue; const x = x0 + Hh(i, 7) * tw, len = Math.min(260, (lt - d0) * 70); L(ctx, [[x, H / 2 + 50], [x + 2, H / 2 + 50 + len]], 6, 70 + i, { color: 'rgba(50,58,78,0.6)', step: 10 }); }
    // the finger (his arm enters from below while writing)
    if (lt < w1 + 0.6) { const fx = x0 + tw * k, fy = H / 2 + Math.sin(lt * 14) * 30, out = seg(lt, w1, w1 + 0.6); L(ctx, [[fx + 160, H + 40 + out * 300], [fx + 60, fy + 150 + out * 300], [fx, fy + out * 300]], 26, 90, { color: INK }); }
  };
  SC.box = (ctx, t, u, lt, sc) => {
    ground(ctx, GY, 5);
    poly(ctx, [[1000, GY], [1240, GY], [1240, GY - 150], [1000, GY - 150]], { fill: '#E9DCC4', seed: 41, lw: 5 });        // box
    L(ctx, [[1000, GY - 150], [960, GY - 230]], 5, 42); L(ctx, [[1240, GY - 150], [1280, GY - 230]], 5, 43);
    const lift = sm(seg(lt, 2.5, 6.5));
    const p = P.floor(); p.ra = [lerp(0.9, 2.0, lift), lerp(0.4, 0.3, lift)]; p.head = lerp(0.25, -0.15, lift);
    const F = fig(ctx, 830, GY, { who: 'him', p, f: 1, t, s: 1.25, mouth: lift > 0.8 ? 'smile' : 'none' });
    // the scarf hangs from his hand
    const hx = lerp(1100, F.handB[0], lift), hy = lerp(GY - 140, F.handB[1], lift);
    const pts = []; for (let i = 0; i < 8; i++) pts.push([hx + Math.sin(t * 2 + i * 0.6) * 4 * i * 0.4, hy + i * 22]);
    L(ctx, pts, 12, 44, { color: RED, step: 8, amp: 0.8 });
    // it glows, and the glow carries us into the memory
    const g0 = T(12) - sc.t0, k = seg(lt, g0, sc.t1 - sc.t0);
    if (k > 0) { const r = 60 + 1500 * ease.inCubic(k); const g = ctx.createRadialGradient(hx, hy + 80, 0, hx, hy + 80, r); g.addColorStop(0, `rgba(255,226,170,${0.95 * k})`); g.addColorStop(0.6, `rgba(242,226,196,${0.8 * k})`); g.addColorStop(1, 'rgba(242,226,196,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  };
  SC.umbrella = (ctx, t, u, lt, sc) => {
    rain(ctx, t, 110, 1, [0, 0, W, H], 'rgba(90,80,60,0.3)'); ground(ctx);
    const arrive = sm(seg(lt, 0.5, 4.5)), go = sm(seg(lt, T(16) - sc.t0, sc.t1 - sc.t0));
    const herX = lerp(1750, 1060, arrive) - go * 900, himX = 880 - go * 900;
    const walking = arrive < 1 ? 1 : go > 0 ? 1 : 0;
    const ph = t * 5.6;
    fig(ctx, himX, GY, { who: 'him', p: go > 0 ? P.walk(ph) : arrive < 0.9 ? { ...P.sad(), la: [2.6, 1.2], ra: [2.5, 1.3] } : P.stand(), f: go > 0 ? -1 : 1, t, mouth: arrive >= 0.9 ? 'smile' : 'none', s: 1.2 });
    const F = fig(ctx, herX, GY, { who: 'her', p: walking && arrive < 1 || go > 0 ? { ...P.walk(ph + 1), ra: [2.2, 0.5] } : { ...P.stand(), ra: [2.2, 0.5] }, f: go > 0 ? -1 : -1, t, s: 1.2, mouth: 'smile' });
    // her red umbrella, held over both of them once she arrives
    const ux = lerp(F.handB[0], (F.handB[0] + himX) / 2 + 40, arrive) , uy = F.handB[1] - 150;
    L(ctx, [F.handB, [ux, uy]], 5, 51);
    ctx.save(); ctx.beginPath(); ctx.moveTo(ux - 190, uy + 40); ctx.quadraticCurveTo(ux, uy - 140, ux + 190, uy + 40); for (let i = 4; i >= 0; i--) ctx.quadraticCurveTo(ux - 190 + i * 95 + 47, uy + 10, ux - 190 + i * 95, uy + 40); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.restore();
    L(ctx, [[ux - 190, uy + 40], [ux, uy - 50], [ux + 190, uy + 40]], 4, 52, { amp: 0.6 });
    heart(ctx, ux, uy - 90, t, T(17));
  };
  SC.cycle = (ctx, t, u, lt) => {
    const scroll = lt * 420;
    for (let i = 0; i < 8; i++) { const x = ((i * 330 - scroll) % (W + 330) + W + 330) % (W + 330) - 160; tree(ctx, x, GY - 20, 1 + Hh(i, 3) * 0.3, 100 + i); }
    ground(ctx);
    for (let i = 0; i < 14; i++) { const x = ((i * 160 - scroll * 1.2) % (W + 160) + W + 160) % (W + 160) - 80; L(ctx, [[x, GY + 40], [x + 60, GY + 40]], 4, 120 + i, { alpha: 0.5 }); }
    const bx = 900 + Math.sin(lt * 0.8) * 40, bob = Math.sin(t * 12) * 2;
    const b = bike(ctx, bx, GY + bob, t);
    const ph = t * 6;
    fig(ctx, b.seat[0], b.seat[1], { who: 'him', p: { hipH: 0, la: [1.75, 0.2], ra: [1.65, 0.25], ll: [0.55 + 0.45 * Math.sin(ph), -1.0 + 0.5 * Math.cos(ph)], rl: [0.55 - 0.45 * Math.sin(ph), -1.0 - 0.5 * Math.cos(ph)], lean: 0.32 }, f: 1, t, mouth: 'smile', s: 1.05 });
    fig(ctx, b.carrier[0], b.carrier[1], { who: 'her', p: { hipH: 0, la: [1.3, 0.3], ra: [2.6 + 0.2 * Math.sin(t * 4), 0.3], ll: [1.4, -1.4], rl: [1.3, -1.3], lean: -0.08 }, f: 1, t, s: 1.05, wind: 1.3, mouth: 'open' });
  };
  SC.tea = (ctx, t, u, lt) => {
    ground(ctx);
    poly(ctx, [[1150, GY], [1650, GY], [1650, GY - 330], [1150, GY - 330]], { fill: '#EAD7B0', seed: 130, lw: 5 });
    for (let i = 0; i < 6; i++) poly(ctx, [[1120 + i * 90, GY - 330], [1210 + i * 90, GY - 330], [1210 + i * 90, GY - 400], [1120 + i * 90, GY - 400]], { fill: i % 2 ? '#F6EEDC' : '#D9B26A', seed: 131 + i, lw: 4 });
    L(ctx, [[1200, GY - 200], [1600, GY - 200]], 6, 140); ell(ctx, 1330, GY - 235, 40, 32, { fill: '#BFA98A', seed: 141 }); steam(ctx, 1325, GY - 270, t, 142);
    L(ctx, [[520, GY - 58], [1000, GY - 58]], 7, 145); L(ctx, [[560, GY - 58], [560, GY]], 5, 146); L(ctx, [[960, GY - 58], [960, GY]], 5, 147);   // bench
    const laugh = 0.08 * beatPulse(t, 6);
    const p1 = P.sit(); p1.ra = [1.9, 1.9]; p1.lean = -0.06 - laugh; p1.head = -0.2 - laugh * 2;
    const A = fig(ctx, 660, GY, { who: 'him', p: p1, f: 1, t, mouth: 'open', s: 1.1 });
    const p2 = P.sit(); p2.ra = [1.8, 2.0]; p2.lean = -0.04 - laugh; p2.head = -0.15 - laugh * 2;
    const B2 = fig(ctx, 880, GY, { who: 'her', p: p2, f: -1, t, mouth: 'open', s: 1.1 });
    cup(ctx, A.handB[0] + 8, A.handB[1] + 4, 0.8, 150); cup(ctx, B2.handB[0] - 8, B2.handB[1] + 4, 0.8, 152);
    steam(ctx, A.handB[0] + 6, A.handB[1] - 20, t, 154);
  };
  SC.kite = (ctx, t, u, lt) => {
    sky(ctx, '#F6E7C6', '#F2E2C4'); L(ctx, [[-20, GY - 60], [W + 20, GY - 60]], 7, 160); for (let i = 0; i < 12; i++) L(ctx, [[i * 170, GY - 60], [i * 170, GY + 200]], 4, 161 + i, { alpha: 0.5 });
    const tug = beatPulse(t, 3) * (clock.beatAt && Math.floor(clock.beatAt(t)) % 4 === 0 ? 1 : 0.3);
    const kx = 1350 + Math.sin(lt * 0.7) * 120, ky = 230 + Math.cos(lt * 0.9) * 40 - tug * 30;
    const F = fig(ctx, 760, GY - 60, { who: 'her', p: { ...P.stand(), ra: [2.4, 0.2 + tug * 0.2] }, f: 1, t, mouth: 'smile', s: 1.15 });
    fig(ctx, 600, GY - 60, { who: 'him', p: { ...P.stand(), ra: [2.2, 0.1], la: [0.3, 0.1] }, f: 1, t, mouth: 'open', s: 1.15 });
    ctx.save(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(F.handB[0], F.handB[1]); ctx.quadraticCurveTo((F.handB[0] + kx) / 2, ky + 260, kx, ky + 60); ctx.stroke(); ctx.restore();
    poly(ctx, [[kx, ky - 60], [kx + 50, ky], [kx, ky + 60], [kx - 50, ky]], { fill: GOLD, seed: 170, lw: 4 }); L(ctx, [[kx, ky - 60], [kx, ky + 60]], 3, 171); L(ctx, [[kx - 50, ky], [kx + 50, ky]], 3, 172);
    const tail = []; for (let i = 0; i < 7; i++) tail.push([kx - i * 12, ky + 60 + i * 18 + Math.sin(t * 5 + i) * 10]); L(ctx, tail, 3, 173, { step: 6 });
  };
  SC.boat = (ctx, t, u, lt) => {
    sky(ctx, '#F6DDB2', '#F2E2C4'); ell(ctx, 1500, 360, 90, 90, { fill: '#F2B565', stroke: 'rgba(0,0,0,0)', seed: 180, lw: 0 });
    for (let r = 0; r < 6; r++) { const y = 640 + r * 70, pts = []; for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.sin(x * 0.01 + t * 1.6 + r) * 8]); L(ctx, pts, 3.5, 190 + r, { alpha: 0.65 - r * 0.07 }); }
    const by = 700 + Math.sin(t * 1.6) * 8, bx = 900;
    poly(ctx, [[bx - 260, by - 40], [bx + 260, by - 40], [bx + 190, by + 40], [bx - 190, by + 40]], { fill: '#C79A62', seed: 200, lw: 5 });
    const row = Math.sin(t * Math.PI * 2 / (BEAT * 2));
    const A = fig(ctx, bx - 90, by - 40, { who: 'him', p: { hipH: 0, la: [1.6 + row * 0.4, 0.4], ra: [1.5 + row * 0.4, 0.5], ll: [1.4, -1.4], rl: [1.3, -1.3], lean: -0.1 + row * 0.12 }, f: 1, t, mouth: 'smile', s: 1.05 });
    L(ctx, [A.hand, [A.hand[0] - 120, by + 90]], 5, 210);
    fig(ctx, bx + 110, by - 40, { who: 'her', p: { hipH: 0, la: [0.4, 0.2], ra: [1.0, 0.3], ll: [1.4, -1.4], rl: [1.3, -1.3], lean: 0.05 }, f: -1, t, mouth: 'smile', s: 1.05, wind: 0.6 });
  };
  SC.fair = (ctx, t, u, lt) => {
    sky(ctx, '#F0D8B0', '#F2E2C4'); ground(ctx);
    const cx = 1250, cy = 430, R = 300, step = Math.floor(clock.beatAt ? clock.beatAt(t) : t / BEAT);   // the wheel clicks round one notch a beat
    const rot = (step + ease.outBack(clamp(clock.phase(t) * 3), 2)) * 0.13;
    ell(ctx, cx, cy, R, R, { seed: 220, lw: 5 }); ell(ctx, cx, cy, 24, 24, { fill: ink, seed: 221 });
    L(ctx, [[cx, cy], [cx - 200, GY]], 6, 222); L(ctx, [[cx, cy], [cx + 200, GY]], 6, 223);
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R; L(ctx, [[cx, cy], [px, py]], 3, 230 + i, { amp: 0.6 }); poly(ctx, [[px - 26, py + 4], [px + 26, py + 4], [px + 20, py + 44], [px - 20, py + 44]], { fill: i % 2 ? '#F6EEDC' : GOLD, seed: 240 + i, lw: 3.5 }); ctx.fillStyle = `rgba(255,200,90,${0.4 + 0.6 * beatPulse(t + i * 0.07, 5)})`; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill(); }
    fig(ctx, 600, GY, { who: 'him', p: P.stand(), f: 1, t, mouth: 'smile', s: 1.2, p: { ...P.stand(), la: [0.6, 0.2] } });
    fig(ctx, 720, GY, { who: 'her', p: { ...P.stand(), ra: [2.3, 0.1], la: [0.7, 0.2] }, f: 1, t, mouth: 'open', s: 1.2 });
  };
  SC.lamp = (ctx, t, u, lt) => {
    sky(ctx, '#2E2A3A', '#4A4256'); ink = '#F2E6CF'; ground(ctx); lamp(ctx, 900, GY, t);
    const spin = lt * 3.2, f = Math.cos(spin) >= 0 ? 1 : -1;
    fig(ctx, 1020, GY, { who: 'her', p: { ...P.stand(), la: [1.6, 0.2], ra: [1.6, 0.2], ll: [0.1, 0], rl: [-0.25, -0.2] }, f, t, mouth: 'smile', s: 1.2, headFill: '#4A4256', wind: 1.4 });
    const clap = beatPulse(t, 9);
    fig(ctx, 720, GY, { who: 'him', p: { ...P.stand(), la: [1.3 - clap * 0.3, 1.0], ra: [1.3 - clap * 0.3, 1.0] }, f: 1, t, mouth: 'smile', s: 1.2, headFill: '#4A4256' });
    const b0 = Math.floor(clock.beatAt ? clock.beatAt(t) : 0); for (let k = 0; k < 3; k++) { const bt = clock.beatAt ? null : null; }
    for (let k = 0; k < 4; k++) heart(ctx, 860 + k * 70, 520 - (k % 2) * 60, t, S.SCENES.find((s) => s.id === 'lamp').t0 + 0.4 + k * BEAT * 2, 0.7);
    ink = INK;
  };
  SC.alone = (ctx, t, u, lt, sc) => {
    rain(ctx, t, 80, 1); ground(ctx);
    const scroll = lt * 110;
    for (let i = 0; i < 4; i++) { const x = ((i * 640 - scroll * 0.6) % (W + 640) + W + 640) % (W + 640) - 300; lamp(ctx, x, GY, t, 0.6); }
    const stop = seg(lt, T(37) - sc.t0, sc.t1 - sc.t0);
    const ph = t * 4.2 * (1 - stop);
    const look = sm(seg(lt, T(35) - sc.t0, T(35) - sc.t0 + 0.8));
    const p = stop > 0 ? P.sad() : { ...P.walk(ph, 0.8), head: 0.18 - look * 0.1, lean: 0.12 };
    fig(ctx, 860, GY, { who: 'him', p, f: 1, t, mouth: 'sad', s: 1.2 });
    // her outline walks beside him, flickers, and is gone when he turns to her
    const g = seg(lt, T(32) - sc.t0, T(33) - sc.t0) * (1 - seg(lt, T(35) - sc.t0 + 0.3, T(35) - sc.t0 + 1.3));
    if (g > 0) fig(ctx, 1010, GY, { who: 'her', p: P.walk(ph + 0.4, 0.8), f: 1, t, ghost: true, alpha: g * (0.45 + 0.2 * Math.sin(t * 9)), s: 1.2, mouth: 'smile', wind: 0.7 });
    if (look > 0 && g < 0.95) L(ctx, [[0, 0], [0, 0]], 1, 1);
  };
  function train(ctx, x, y, seed = 300) {
    for (let c = 0; c < 4; c++) { const cx = x + c * 520; poly(ctx, [[cx, y - 300], [cx + 500, y - 300], [cx + 500, y - 40], [cx, y - 40]], { fill: '#D8C9A8', seed: seed + c, lw: 5 }); for (let w = 0; w < 4; w++) poly(ctx, [[cx + 30 + w * 118, y - 260], [cx + 120 + w * 118, y - 260], [cx + 120 + w * 118, y - 170], [cx + 30 + w * 118, y - 170]], { fill: '#F4ECD8', seed: seed + 10 + c * 4 + w, lw: 3.5 }); ell(ctx, cx + 90, y - 30, 26, 26, { seed: seed + 30 + c }); ell(ctx, cx + 410, y - 30, 26, 26, { seed: seed + 40 + c }); }
  }
  SC.station = (ctx, t, u, lt, sc) => {
    ground(ctx, GY + 40, 6); L(ctx, [[-20, GY - 6], [W + 20, GY - 6]], 5, 301);
    const dep = T(41) - sc.t0, mv = Math.max(0, lt - dep), tx = 300 + 40 * mv * mv;
    train(ctx, tx, GY - 6);
    const board = sm(seg(lt, T(40) - sc.t0, T(40, 2) - sc.t0));
    const hug = sm(seg(lt, T(39) - sc.t0, T(39) - sc.t0 + 0.6)) * (1 - board);
    if (board < 1) fig(ctx, lerp(980 - hug * 40, 720, board), GY - 6, { who: 'her', p: hug > 0.3 ? { ...P.stand(), la: [1.7, 0.9], ra: [1.6, 1.0] } : P.stand(), f: -1, t, s: 1.15, mouth: hug > 0.3 ? 'none' : 'smile', eyes: hug > 0.3 ? 'closed' : undefined });
    else { ctx.save(); ctx.beginPath(); ctx.rect(tx + 520 + 30 + 118, GY - 6 - 260, 90, 90); ctx.clip(); fig(ctx, tx + 520 + 30 + 118 + 45, GY - 66, { who: 'her', p: mv > 0.5 ? P.wave(t) : P.stand(), f: 1, t, s: 0.75, mouth: 'sad' }); ctx.restore(); }
    fig(ctx, 1100 + hug * 0, GY - 6, { who: 'him', p: hug > 0.3 ? { ...P.stand(), la: [1.7, 0.9], ra: [1.6, 1.0] } : mv > 0.5 ? P.wave(t) : P.stand(), f: -1, t, s: 1.15, mouth: mv > 0 ? 'sad' : 'none', eyes: hug > 0.3 ? 'closed' : undefined });
  };
  SC.chase = (ctx, t, u, lt, sc) => {
    const end = T(47) - sc.t0, run = lt < end;
    const cam = Math.min(lt, end) * 620;
    L(ctx, [[-20, GY - 6], [W + 20, GY - 6]], 5, 311);
    for (let i = 0; i < 12; i++) { const x = ((i * 260 - cam) % (W + 260) + W + 260) % (W + 260) - 130; L(ctx, [[x, GY - 6], [x, GY + 60]], 4, 312 + i, { alpha: 0.6 }); }
    ground(ctx, GY + 60, 7);
    const ahead = 900 + lt * 160 + lt * lt * 26; train(ctx, 700 + ahead - cam * 0.2, GY - 6, 320);
    if (run) fig(ctx, 760, GY - 6, { who: 'him', p: P.run(t * 10), f: 1, t, s: 1.15, mouth: 'open' });
    else fig(ctx, 760, GY - 6, { who: 'him', p: P.reach(), f: 1, t, s: 1.15, mouth: 'sad', p: { ...P.reach(), ra: [1.7, 0.05], head: 0.05 } });
  };
  SC.kneel = (ctx, t, u, lt) => {
    rain(ctx, t, 260, 1.2); ground(ctx);
    const F = fig(ctx, 880, GY, { who: 'him', p: { ...P.kneel(), ra: [0.9, 1.2] }, f: 1, t, s: 1.25, mouth: 'sad', eyes: 'closed' });
    // the phone rings out
    const px = F.handB[0] + 14, py = F.handB[1] - 20, ring = beatPulse(t, 4);
    poly(ctx, [[px - 18, py - 32], [px + 18, py - 32], [px + 18, py + 32], [px - 18, py + 32]], { fill: '#CFE3F2', seed: 330, lw: 3.5 });
    for (let k = 1; k <= 3; k++) { ctx.save(); ctx.globalAlpha = ring * (1 - k * 0.25); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 30 + k * 16, -0.9, -0.2); ctx.stroke(); ctx.restore(); }
  };
  SC.river = (ctx, t, u, lt, sc) => {
    sky(ctx, '#DCC9B4', '#E4E3DE');
    for (let r = 0; r < 4; r++) { const y = 560 + r * 50, pts = []; for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.sin(x * 0.012 + t * 1.2 + r) * 6]); L(ctx, pts, 3, 340 + r, { alpha: 0.5 }); }
    L(ctx, [[-20, 760], [W + 20, 740]], 5, 345);
    // her stick figure, drawn in the sand, stroke by stroke; then a wave takes it
    const d0 = 1.2, d1 = T(52) - sc.t0, wv = T(53) - sc.t0;
    const sx = 1120, sy = 860, pts = [[[sx, sy - 120], [sx, sy - 40]], [[sx, sy - 40], [sx - 30, sy + 20]], [[sx, sy - 40], [sx + 30, sy + 20]], [[sx, sy - 100], [sx - 40, sy - 60]], [[sx, sy - 100], [sx + 40, sy - 60]]];
    const k = seg(lt, d0, d1) * (pts.length + 1), wash = seg(lt, wv, wv + 1.6);
    ctx.save(); ctx.globalAlpha = 1 - wash;
    if (k > 0) ell(ctx, sx, sy - 145, 24, 24, { seed: 350, lw: 4, stroke: '#8A6E4E' });
    pts.forEach((sgm, i) => { const q = clamp(k - 1 - i); if (q > 0) L(ctx, [sgm[0], [lerp(sgm[0][0], sgm[1][0], q), lerp(sgm[0][1], sgm[1][1], q)]], 4, 351 + i, { color: '#8A6E4E' }); });
    ctx.restore();
    if (wash > 0 && wash < 1) { const wx = lerp(W + 100, 800, wash), pts2 = []; for (let y = 760; y <= H; y += 40) pts2.push([wx + Math.sin(y * 0.05 + t * 3) * 20, y]); L(ctx, pts2, 5, 361, { alpha: 0.7 }); }
    const F = fig(ctx, 900, 900, { who: 'him', p: { ...P.floor(), ra: [1.3, 0.2 + 0.25 * Math.sin(lt * 6) * (lt < d1 ? 1 : 0)] }, f: 1, t, s: 1.2, mouth: wash > 0 ? 'sad' : 'none' });
    L(ctx, [F.handB, [F.handB[0] + 60, F.handB[1] + 70]], 4, 362);
  };
  SC.wind = (ctx, t, u, lt, sc) => {
    // the wind takes the scarf; he chases it through the memories (a background per bar, faded)
    const bar = Math.floor(clock.beatAt ? clock.beatAt(t) / 4 : 0), which = ['tea', 'cycle', 'fair', 'kite', 'boat', 'lamp'][((bar - 54) % 6 + 6) % 6];
    ctx.save(); ctx.globalAlpha = 0.28; ink = '#6E5A44'; const sb = SC[which];
    ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); sb(ctx, t, u, lt - Math.floor(lt), sc); ctx.restore(); ink = INK; ctx.restore();
    for (let i = 0; i < 7; i++) { const y = 160 + i * 110, x = ((Hh(i, 8) * W + lt * 900) % (W + 400)) - 200, pts = []; for (let k = 0; k < 8; k++) pts.push([x + k * 34, y + Math.sin(k * 0.8 + t * 4 + i) * 14]); L(ctx, pts, 3, 400 + i, { alpha: 0.45, step: 8 }); }
    ground(ctx);
    const fly = lt < 0.8 ? 0 : 1;
    const hx = 760, F = fig(ctx, hx, GY, { who: 'him', p: fly ? P.run(t * 9) : { ...P.stand(), ra: [1.5, 0.1] }, f: 1, t, s: 1.15, mouth: 'open' });
    const sx = fly ? lerp(F.handB[0], 1280 + Math.sin(t * 1.3) * 120, sm(seg(lt, 0.8, 2.2))) : F.handB[0], sy = fly ? lerp(F.handB[1], 420 + Math.sin(t * 2.1) * 90, sm(seg(lt, 0.8, 2.2))) : F.handB[1];
    const pts = []; for (let i = 0; i < 9; i++) pts.push([sx - i * 20, sy + Math.sin(t * 8 - i * 0.8) * (6 + i * 2.5)]);
    L(ctx, pts, 13, 410, { color: RED, step: 7, amp: 0.7 });
  };
  SC.stars = (ctx, t, u, lt, sc) => {
    sky(ctx, '#121831', '#2A2F52'); ink = '#F2E6CF';
    for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,248,230,${0.25 + 0.35 * Hh(i, 2)})`; ctx.beginPath(); ctx.arc(Hh(i, 1) * W, Hh(i, 3) * 640, 1 + Hh(i, 4) * 1.6, 0, 7); ctx.fill(); }
    poly(ctx, [[-40, GY + 10], [500, GY - 70], [1000, GY - 20], [1500, GY - 90], [W + 40, GY - 30], [W + 40, H + 40], [-40, H + 40]], { fill: '#0E1226', seed: 420, lw: 4 });
    // the constellation: her stick figure, one star per beat
    const cx = 1240, cy = 320, sc2 = 1.7, wv = sm(seg(lt, T(63) - sc.t0, T(63) - sc.t0 + 0.6));
    const arm = (a) => [cx + Math.sin(a) * 80 * sc2 * 0.6, cy - 60 + Math.cos(a) * 80 * sc2 * 0.6];
    const stars = [[cx, cy - 150], [cx, cy - 70], [cx, cy + 60], [cx - 50, cy + 170], [cx + 50, cy + 170], arm(-0.5), arm(lerp(0.5, 2.6 + 0.3 * Math.sin(t * 6), wv))];
    const edges = [[0, 1], [1, 2], [2, 3], [2, 4], [1, 5], [1, 6]];
    const first = T(60, 2) - sc.t0, n = Math.floor((lt - first) / BEAT) + 1;
    edges.forEach(([a, b], i) => { if (n > Math.max(a, b) + 1) L(ctx, [stars[a], stars[b]], 2.5, 430 + i, { color: 'rgba(255,240,210,0.65)', amp: 0.5 }); });
    stars.forEach((p, i) => { if (n > i) { const a = lt - first - i * BEAT, k = ease.outBack(clamp(a / 0.3), 2.5); const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 40 * k); g.addColorStop(0, 'rgba(255,236,180,0.9)'); g.addColorStop(1, 'rgba(255,236,180,0)'); ctx.fillStyle = g; ctx.fillRect(p[0] - 40, p[1] - 40, 80, 80); G.star(ctx, p[0], p[1], 12 * k, { fill: '#FFF1D2', seed: 440 + i }); } });
    if (n > 1) { ctx.save(); ctx.globalAlpha = clamp((n - 1) / 3); ell(ctx, stars[0][0], stars[0][1], 34, 34, { stroke: 'rgba(255,240,210,0.6)', lw: 2.5, seed: 450 }); ctx.restore(); }
    // the scarf rises from his hand to become her red star
    const rise = sm(seg(lt, 0, T(60, 2) - sc.t0 + 2));
    const F = fig(ctx, 640, GY - 50, { who: 'him', p: lt > T(62) - sc.t0 ? P.reach() : P.stand(), f: 1, t, s: 1.2, mouth: lt > T(63) - sc.t0 ? 'smile' : 'none', headFill: '#0E1226' });
    const rx = lerp(F.handB[0], cx + 4, rise), ry = lerp(F.handB[1], cy - 70, rise);
    if (rise < 1) { const pts = []; for (let i = 0; i < 8; i++) pts.push([rx - i * 16 * (1 - rise * 0.8), ry + i * 10 + Math.sin(t * 6 + i) * 8]); L(ctx, pts, 11, 460, { color: RED, step: 7 }); }
    else { const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, 50); g.addColorStop(0, 'rgba(255,90,70,0.9)'); g.addColorStop(1, 'rgba(255,90,70,0)'); ctx.fillStyle = g; ctx.fillRect(rx - 50, ry - 50, 100, 100); }
    // a shooting star at bar 65
    const ss = seg(lt, T(65) - sc.t0, T(65) - sc.t0 + 0.9); if (ss > 0 && ss < 1) L(ctx, [[300 + ss * 700, 120 + ss * 200], [300 + ss * 700 - 140, 120 + ss * 200 - 40]], 3, 470, { color: 'rgba(255,248,230,0.9)' });
    ink = INK;
  };
  SC.dawn = (ctx, t, u, lt, sc) => {
    const wx = 1060, wy = 150, ww = 620, wh = 520;
    const g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#F7C99A'); g.addColorStop(1, '#F9E3C0'); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    ell(ctx, wx + ww * 0.7, wy + wh * 0.8, 70, 70, { fill: '#F4A85E', stroke: 'rgba(0,0,0,0)', seed: 480, lw: 0 });
    const bx = wx + ((lt * 60) % ww), by = wy + 120 + Math.sin(lt * 3) * 20; L(ctx, [[bx - 14, by - 6], [bx, by], [bx + 14, by - 6]], 3, 481, { amp: 0.4, step: 4 });
    poly(ctx, [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { lw: 7, seed: 11 }); L(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 6, 12); L(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 6, 13);
    ground(ctx, GY, 4);
    // he puts the red scarf on: she stays with him
    const wrap = sm(seg(lt, 2.5, 5));
    const p = { ...P.stand(), ra: [lerp(1.0, 2.9, wrap) - wrap * 0.0, lerp(1.2, 1.9, wrap)], la: [lerp(0.4, 2.6, wrap), lerp(0.6, 1.8, wrap)], head: -0.1 };
    const F = fig(ctx, 900, GY, { who: 'him', p, f: 1, t, s: 1.3, mouth: wrap > 0.6 ? 'smile' : 'none' });
    if (wrap < 0.95) { const pts = []; for (let i = 0; i < 7; i++) pts.push([lerp(F.hand[0], F.handB[0], i / 6), lerp(F.hand[1], F.handB[1], i / 6) + Math.sin(i / 6 * Math.PI) * 40]); L(ctx, pts, 11, 490, { color: RED, step: 8 }); }
    else { L(ctx, [[F.neck[0] - 14, F.neck[1] + 4], [F.neck[0] + 14, F.neck[1] + 6]], 11, 491, { color: RED }); scarf(ctx, F.neck, -1, 1.3, t, 0.5, 492, 4, 14); }
    // end card
    const ec = seg(lt, T(68) - sc.t0, T(68) - sc.t0 + 2);
    if (ec > 0) { ctx.save(); ctx.globalAlpha = ec; ctx.font = '150px Galada'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('তুই নেই', 520, 360); ctx.restore(); }
  };

  // ================================================================ the cut
  const XF = 0.45; // dissolve (paper) between scenes
  // camera per scene: [centre x, centre y, zoom] on the 1920x1080 stage
  const CAM = { window: [900, 560, 1.15], fog: [W / 2, H / 2, 1], box: [1000, 700, 1.45], umbrella: [1050, 620, 1.3], cycle: [880, 690, 1.5], tea: [820, 700, 1.45],
    kite: [960, 560, 1.12], boat: [920, 640, 1.45], fair: [1000, 560, 1.05], lamp: [880, 660, 1.5], alone: [920, 650, 1.4], station: [1000, 640, 1.2],
    chase: [860, 650, 1.35], kneel: [900, 690, 1.6], river: [1000, 740, 1.45], wind: [960, 600, 1.15], stars: [W / 2, H / 2, 1], dawn: [980, 560, 1.2] };
  function drawScene(ctx, i, t) {
    const sc = SCENES[i], lt = t - sc.t0, u = clamp(lt / (sc.t1 - sc.t0));
    curPaper = PAPER[sc.mood];
    ctx.fillStyle = curPaper; ctx.fillRect(0, 0, W, H);
    ctx.save();
    const c = CAM[sc.id] || [W / 2, H / 2, 1], z = c[2] * (1 + 0.05 * sm(u));   // each scene framed on its actors, with a slow push-in
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-c[0], -c[1]);
    SC[sc.id](ctx, t, u, lt, sc);
    ctx.restore();
    if (sc.mood === 'then') { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(246,226,190,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  Studio.film({
    async init() { await Studio.loadFont('Galada', 'assets/galada.woff2', '400'); },
    draw(ctx, t) {
      let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1].t0) i++;
      drawScene(ctx, i, t);
      const into = t - SCENES[i].t0;
      if (i > 0 && into < XF) { ctx.save(); ctx.globalAlpha = 1 - into / XF; const c = ctx.canvas, tmp = G.makeCanvas ? null : null; ctx.restore(); }
      // a soft paper flash on each scene change, on the bar line
      if (i > 0 && into < XF) { ctx.save(); ctx.fillStyle = SCENES[i].mood === 'dream' ? 'rgba(18,24,49,1)' : 'rgba(250,244,232,1)'; ctx.globalAlpha = (1 - into / XF) * 0.85; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      const out = SCENES[i].t1 - t; if (i + 1 < SCENES.length && out < XF * 0.6) { ctx.save(); ctx.fillStyle = SCENES[i + 1].mood === 'dream' ? 'rgba(18,24,49,1)' : 'rgba(250,244,232,1)'; ctx.globalAlpha = (1 - out / (XF * 0.6)) * 0.85; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
    post: { paper: true, vignette: 0.35, grain: true },
    fadeOut: 2.0,
  });
})();
