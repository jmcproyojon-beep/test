// THE FILM — «তুই নেই», vertical lyric story. Pure function of t (the song clock in score.js).
// Look (from the client's references): white paper, pencil-sketched rooms and streets in grey, stick figures with big
// round heads, white eyes and eyebrows that act; bold black words at the top; red is kept for the heart and for her.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clock, SCENES, LYRICS, BEAT } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, GY = 1430;
  const Hh = (...a) => U.hash(...a);
  const INK = '#1E1B18', PEN = 'rgba(60,58,56,0.55)', RED = '#D2283A', PAPER = '#F7F6F3';
  const sm = (x) => x * x * (3 - 2 * x);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const pulse = (t, k = 6) => Math.exp(-clock.phase(t) * k);
  const beatN = (t) => Math.floor(clock.beatAt(t));
  const L = (ctx, pts, lw, seed, o = {}) => G.line(ctx, pts, { color: o.color || INK, lw, seed, amp: o.amp ?? 1.1, step: o.step ?? 14, alpha: o.alpha ?? 1 });
  // pencil: two light passes, slightly apart
  const pen = (ctx, pts, seed, o = {}) => { L(ctx, pts, o.lw || 2.6, seed, { color: o.color || PEN, amp: 1.6, step: 18 }); L(ctx, pts, (o.lw || 2.6) * 0.7, seed + 77, { color: o.color || PEN, amp: 2.2, step: 22, alpha: 0.6 }); };
  const box = (ctx, x, y, w, h, seed, o = {}) => { if (o.fill) { ctx.fillStyle = o.fill; ctx.fillRect(x, y, w, h); } pen(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], seed, o); };
  const hatch = (ctx, x, y, w, h, seed, gap = 14) => { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); for (let k = -h; k < w; k += gap) L(ctx, [[x + k, y + h], [x + k + h, y]], 1.4, seed + k, { color: 'rgba(60,58,56,0.25)', amp: 0.8, step: 30 }); ctx.restore(); };
  const circ = (ctx, x, y, r, o = {}) => G.ellipse(ctx, x, y, r, r, { stroke: o.stroke || INK, lw: o.lw ?? 4, fill: o.fill, seed: o.seed || 3, amp: o.amp ?? 1, alpha: o.alpha ?? 1 });

  // ================================================================ the figure
  const V = (a, len, f) => [Math.sin(a) * len * f, Math.cos(a) * len];
  const P = {
    stand: () => ({ la: [0.12, 0.05], ra: [0.1, 0.08], ll: [0.07, 0], rl: [-0.07, 0] }),
    sad: () => ({ la: [0.04, 0.02], ra: [0.04, 0.02], ll: [0.05, 0], rl: [-0.05, 0], lean: 0.1, head: 0.25 }),
    walk: (ph, k = 1) => ({ la: [-0.4 * k * Math.sin(ph), 0.25], ra: [0.4 * k * Math.sin(ph), 0.25], ll: [0.4 * k * Math.sin(ph), -0.5 * k * Math.max(0, Math.cos(ph))], rl: [-0.4 * k * Math.sin(ph), -0.5 * k * Math.max(0, -Math.cos(ph))], lean: 0.04, bob: Math.abs(Math.cos(ph)) * 4 * k }),
    sit: () => ({ hipH: 70, la: [0.5, 0.9], ra: [0.45, 1.0], ll: [1.5, -1.5], rl: [1.4, -1.4], lean: -0.03 }),
    hug: () => ({ hipH: 14, la: [1.05, 0.55], ra: [0.95, 0.6], ll: [1.1, -2.3], rl: [1.0, -2.2], lean: 0.25, head: 0.35 }),
    hold: () => ({ la: [0.12, 0.05], ra: [1.4, 0.15], ll: [0.07, 0], rl: [-0.07, 0] }),
    point: () => ({ la: [0.12, 0.05], ra: [2.4, 0.05], ll: [0.07, 0], rl: [-0.07, 0], head: -0.2 }),
  };
  // eyes: 'open' | 'closed' | 'sad' | 'wide' ; brows: 'flat' | 'sad' | 'up' | 'angry' ; mouth: 'none'|'smile'|'sad'|'open'|'flat'|'hum'
  function fig(ctx, x, y, o) {
    const s = o.s || 1.5, f = o.f || 1, p = o.p || P.stand(), seed = o.seed || (o.her ? 500 : 300), t = o.t || 0;
    const lw = 6 * s, TH = 60 * s, SH = 60 * s, UA = 48 * s, FA = 44 * s, TOR = 100 * s, HR = 52 * s;
    const lean = p.lean || 0;
    const legPts = (lg) => { const k = V(lg[0], TH, f), a = V(lg[0] + lg[1], SH, f); return [k, [k[0] + a[0], k[1] + a[1]]]; };
    const LL = legPts(p.ll), RL = legPts(p.rl);
    const drop = p.hipH != null ? p.hipH * s : Math.max(LL[1][1], RL[1][1]);
    const hip = [x, y - drop + (p.bob || 0) * s];
    const neck = [hip[0] + Math.sin(lean) * TOR * f, hip[1] - Math.cos(lean) * TOR];
    const ha = lean + (p.head || 0);
    const hc = [neck[0] + Math.sin(ha) * (HR + 2 * s) * f, neck[1] - Math.cos(ha) * (HR + 2 * s)];
    const sh = [lerp(hip[0], neck[0], 0.88), lerp(hip[1], neck[1], 0.88)];
    const arm = (a) => { const e = V(a[0], UA, f), h = V(a[0] + a[1], FA, f); return [sh, [sh[0] + e[0], sh[1] + e[1]], [sh[0] + e[0] + h[0], sh[1] + e[1] + h[1]]]; };
    const LA = arm(p.la), RA = arm(p.ra);
    const lg = (pp) => [hip, [hip[0] + pp[0][0], hip[1] + pp[0][1]], [hip[0] + pp[1][0], hip[1] + pp[1][1]]];
    const col = o.color || INK;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.ghost) ctx.setLineDash([12 * s, 10 * s]);
    L(ctx, lg(RL), lw, seed + 1, { color: col }); L(ctx, RA, lw, seed + 2, { color: col });
    L(ctx, [hip, neck], lw, seed + 3, { color: col }); L(ctx, lg(LL), lw, seed + 4, { color: col });
    // head
    if (o.her) for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * 0.24; circ(ctx, hc[0] + Math.cos(a) * HR * 0.95 - f * 4 * s, hc[1] + Math.sin(a) * HR * 0.95, HR * 0.3, { fill: PAPER, stroke: col, lw: 3.2 * s, seed: seed + 60 + i }); }
    circ(ctx, hc[0], hc[1], HR, { fill: o.headFill || PAPER, stroke: col, lw: 4.5 * s, seed: seed + 5 });
    if (!o.her) for (let i = 0; i < 4; i++) L(ctx, [[hc[0] - 22 * s + i * 14 * s, hc[1] - HR + 3 * s], [hc[0] - 26 * s + i * 16 * s, hc[1] - HR - 14 * s]], 3.5 * s, seed + 20 + i, { color: col, amp: 0.6 });
    if (o.her && !o.noHeart) { L(ctx, [[neck[0] - 10 * s, neck[1] + 5 * s], [neck[0] + 10 * s, neck[1] + 6 * s]], 8 * s, seed + 31, { color: RED, amp: 0.6 }); }
    // face
    const ex = hc[0] + f * 12 * s, ey = hc[1] - 4 * s, eyes = o.eyes || 'open', look = (o.look ?? 0.4) * f, lookY = o.lookY || 0;
    const blink = Hh(seed, Math.floor(t * 0.8)) > 0.8 && (t * 0.8 % 1) < 0.1;
    for (const dx of [-17, 17]) {
      const cx = ex + dx * s;
      if (eyes === 'closed' || blink) { L(ctx, [[cx - 10 * s, ey + 2 * s], [cx, ey + 6 * s], [cx + 10 * s, ey + 2 * s]], 3 * s, seed + 40 + dx, { color: col, amp: 0.3, step: 5 }); }
      else { const r = (eyes === 'wide' ? 15 : 12.5) * s; G.ellipse(ctx, cx, ey, r * 0.85, r, { fill: '#FFFFFF', stroke: col, lw: 2.6 * s, seed: seed + 42 + dx, amp: 0.5 }); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + look * 5 * s, ey + 2 * s + lookY * 5 * s, (eyes === 'sad' ? 5 : 6) * s, 0, 7); ctx.fill(); if (eyes === 'sad') L(ctx, [[cx - 11 * s, ey - 3 * s], [cx + 11 * s, ey - 3 * s]], 2.4 * s, seed + 44 + dx, { color: col, amp: 0.2, step: 6 }); }
      const br = o.brows || 'flat', inner = dx * f < 0 ? 1 : -1;      // inner end of each brow
      const by = ey - 22 * s, dy = br === 'sad' ? 8 * s : br === 'angry' ? -8 * s : br === 'up' ? -4 * s : 0;
      const a = [cx - 11 * s, by + (inner > 0 ? 0 : 0)], b = [cx + 11 * s, by];
      if (br !== 'none') { const innerIsLeft = (dx < 0) !== (f < 0) ? false : false; void innerIsLeft; const lx = cx - 11 * s, rx = cx + 11 * s; const leftInner = (dx > 0) === (f > 0); L(ctx, [[lx, by - (leftInner ? dy : 0) + (br === 'up' ? -6 * s : 0)], [rx, by - (leftInner ? 0 : dy) + (br === 'up' ? -6 * s : 0)]], 3.4 * s, seed + 46 + dx, { color: col, amp: 0.3, step: 6 }); }
    }
    const m = o.mouth || 'none', mx = hc[0] + f * 12 * s, my = hc[1] + 24 * s;
    if (m === 'smile') L(ctx, [[mx - 12 * s, my - 3 * s], [mx, my + 4 * s], [mx + 12 * s, my - 3 * s]], 3 * s, seed + 7, { color: col, amp: 0.3, step: 5 });
    if (m === 'sad') L(ctx, [[mx - 11 * s, my + 4 * s], [mx, my - 3 * s], [mx + 11 * s, my + 4 * s]], 3 * s, seed + 7, { color: col, amp: 0.3, step: 5 });
    if (m === 'flat') L(ctx, [[mx - 9 * s, my], [mx + 9 * s, my + 1 * s]], 3 * s, seed + 7, { color: col, amp: 0.3, step: 5 });
    if (m === 'open') G.ellipse(ctx, mx, my, 7 * s, 9 * s, { fill: col, stroke: col, lw: 1, seed: seed + 8, amp: 0.3 });
    if (m === 'hum') G.ellipse(ctx, mx, my, 5 * s, 4 * s + 2 * s * Math.sin(t * 9), { fill: col, stroke: col, lw: 1, seed: seed + 8, amp: 0.2 });
    L(ctx, LA, lw, seed + 6, { color: col });
    ctx.restore();
    return { hip, neck, hc, hand: LA[2], handB: RA[2], HR };
  }

  // ================================================================ props and sets (pencil)
  function floor(ctx, y = GY) { pen(ctx, [[-20, y], [W + 20, y + 2]], 3, { lw: 3.4 }); }
  function wall(ctx) { pen(ctx, [[-20, GY - 520], [W + 20, GY - 520]], 5, { lw: 1.4 }); }
  function win(ctx, x, y, w, h, t, o = {}) {
    if (o.sky) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.sky[0]); g.addColorStop(1, o.sky[1]); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
    box(ctx, x, y, w, h, 10, { lw: 3.4 }); pen(ctx, [[x + w / 2, y], [x + w / 2, y + h]], 11); pen(ctx, [[x, y + h / 2], [x + w, y + h / 2]], 12);
    pen(ctx, [[x - 30, y - 20], [x + w + 30, y - 20]], 13); for (let i = 0; i < 6; i++) pen(ctx, [[x - 20 + i * 8, y - 18], [x - 30 + i * 10, y + h * 0.9]], 14 + i, { lw: 1.6 });   // curtain
  }
  function moonShape(ctx, x, y, r, k = 1, dim = 0) {
    if (k <= 0) return; ctx.save(); ctx.globalAlpha *= k;
    const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3); g.addColorStop(0, `rgba(255,244,205,${0.45 * (1 - dim)})`); g.addColorStop(1, 'rgba(255,244,205,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.fillStyle = dim ? '#D9D6CC' : '#FFF6D6'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, false); ctx.arc(x - r * 0.45, y, r * 0.88, Math.PI / 2, -Math.PI / 2, true); ctx.fill();
    pen(ctx, [[x, y - r], [x + r * 0.7, y - r * 0.7], [x + r, y], [x + r * 0.7, y + r * 0.7], [x, y + r]], 15); ctx.restore();
  }
  function bed(ctx, x, w = 520) { box(ctx, x, GY - 170, w, 120, 20, { fill: '#FFFFFF' }); box(ctx, x - 10, GY - 330, 40, 330, 21); box(ctx, x + 30, GY - 225, 150, 55, 22, { fill: '#FFFFFF' }); for (let i = 0; i < 5; i++) pen(ctx, [[x + 60 + i * 80, GY - 170], [x + 90 + i * 80, GY - 52]], 23 + i, { lw: 1.6 }); pen(ctx, [[x + 20, GY - 50], [x + 20, GY]], 28); pen(ctx, [[x + w - 20, GY - 50], [x + w - 20, GY]], 29); }
  function desk(ctx, x, w = 420) { box(ctx, x, GY - 300, w, 24, 30, { fill: '#FFFFFF' }); box(ctx, x + w - 150, GY - 276, 130, 276, 31); for (let i = 1; i < 3; i++) pen(ctx, [[x + w - 150, GY - 276 + i * 92], [x + w - 20, GY - 276 + i * 92]], 32 + i); pen(ctx, [[x + 20, GY - 276], [x + 20, GY]], 35); }
  function frame(ctx, x, y, w, h, seed, inner) { box(ctx, x, y, w, h, seed, { fill: '#FFFFFF', lw: 3 }); box(ctx, x + 12, y + 12, w - 24, h - 24, seed + 1, { lw: 1.6 }); if (inner) inner(x + 12, y + 12, w - 24, h - 24); }
  function guitar(ctx, x, y, rot = 0, s = 1, strum = 0, seed = 40) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.ellipse(ctx, 0, 40, 60, 66, { fill: '#E8D3B0', stroke: INK, lw: 3.5, seed }); G.ellipse(ctx, 0, -40, 46, 50, { fill: '#E8D3B0', stroke: INK, lw: 3.5, seed: seed + 1 });
    circ(ctx, 0, 0, 16, { fill: INK, seed: seed + 2 }); box(ctx, -9, -250, 18, 190, seed + 3, { fill: '#B48A5C', color: INK }); box(ctx, -14, -290, 28, 42, seed + 4, { fill: '#8A6440', color: INK });
    for (let i = 0; i < 4; i++) L(ctx, [[-6 + i * 4, -250], [-6 + i * 4 + Math.sin(strum * 30 + i) * strum * 2, 90]], 1, seed + 10 + i, { color: 'rgba(40,40,40,0.6)', amp: 0 });
    ctx.restore();
  }
  function heartAt(ctx, x, y, s, beat = 0) { G.heart(ctx, x, y, s * (1 + 0.12 * beat), { fill: RED, seed: 71 }); }
  function note(ctx, x, y, a, seed) { ctx.save(); ctx.globalAlpha *= a; circ(ctx, x, y, 13, { fill: INK, seed }); L(ctx, [[x + 12, y], [x + 12, y - 60], [x + 34, y - 48]], 4, seed + 1, { amp: 0.4 }); ctx.restore(); }
  function rain(ctx, t, n, col = 'rgba(70,70,80,0.35)') { const burst = 1 + 0.5 * pulse(t, 5); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i < n; i++) { const x = ((Hh(i, 1) * (W + 200) + t * 90) % (W + 200)) - 100, y = ((Hh(i, 3) * (H + 200) + t * (900 + Hh(i, 2) * 500)) % (H + 200)) - 100, len = (24 + Hh(i, 4) * 26) * burst; ctx.moveTo(x, y); ctx.lineTo(x - len * 0.15, y + len); } ctx.stroke(); ctx.restore(); }
  function buildings(ctx, t, scroll, seed = 80) {
    for (let i = 0; i < 9; i++) { const w = 180 + Hh(seed, i) * 140, h = 380 + Hh(seed, i, 2) * 520, x = ((i * 230 - scroll) % (W + 460) + W + 460) % (W + 460) - 230; box(ctx, x, GY - h, w, h, seed + i, { fill: '#FBFAF8' }); for (let r = 0; r < Math.floor(h / 110); r++) for (let c = 0; c < 2; c++) { const lit = Hh(seed, i, r, c) > 0.55; box(ctx, x + 30 + c * (w / 2 - 10), GY - h + 40 + r * 110, 50, 60, seed + i * 50 + r * 3 + c, { fill: lit ? '#FFF3CC' : null, lw: 1.6 }); } }
  }
  function lampPost(ctx, x, t, k = 1) { pen(ctx, [[x, GY], [x, GY - 760], [x + 70, GY - 790]], 90, { lw: 4 }); box(ctx, x + 40, GY - 800, 90, 26, 91, { fill: '#FFF6D2' }); const g = ctx.createRadialGradient(x + 85, GY - 780, 10, x + 85, GY - 420, 520); g.addColorStop(0, `rgba(255,224,140,${0.4 * k})`); g.addColorStop(1, 'rgba(255,224,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 50, GY - 776); ctx.lineTo(x + 120, GY - 776); ctx.lineTo(x + 380, GY); ctx.lineTo(x - 220, GY); ctx.fill(); }
  function bubble(ctx, x, y, r, k, seed, inner) { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 2); const rr = r * ease.outBack(clamp(k), 2); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; circ(ctx, x + Math.cos(a) * rr * 0.8, y + Math.sin(a) * rr * 0.55, rr * 0.38, { fill: '#FFFFFF', stroke: PEN, lw: 2.4, seed: seed + i }); } ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(x, y, rr * 0.92, rr * 0.66, 0, 0, 7); ctx.fill(); if (inner && k > 0.5) inner(x, y, rr); ctx.restore(); }

  // ================================================================ scenes (lt = seconds into the scene)
  const SC = {};
  const roomBase = (ctx, t, moonK = 0, sky = ['#3A4058', '#565C78']) => { wall(ctx); win(ctx, 600, 520, 340, 420, t, { sky }); moonShape(ctx, 820, 640, 46, moonK); floor(ctx); bed(ctx, 60); desk(ctx, 640, 400); frame(ctx, 690, GY - 430, 110, 130, 50, (x, y, w, h) => { fig(ctx, x + 28, y + h - 6, { s: 0.22, t: 0 }); fig(ctx, x + 70, y + h - 6, { s: 0.22, her: true, f: -1, t: 0 }); }); };
  SC.room = (ctx, t, lt) => {
    roomBase(ctx, t, 0); rain(ctx, t, 30, 'rgba(255,255,255,0.0)');
    const down = sm(seg(lt, 18, 21));
    const p = P.sit(); p.ra = [lerp(1.5, 0.5, down), lerp(1.3, 0.9, down)]; p.head = lerp(0.2, 0.05, down);
    const F = fig(ctx, 300, GY - 120, { p, t, eyes: down > 0.5 ? 'closed' : 'sad', brows: 'sad', mouth: 'flat', look: 0.6, lookY: 0.6 });
    if (down < 0.6) { box(ctx, F.handB[0] - 4, F.handB[1] - 52, 34, 60, 60, { fill: '#DDE8F4', lw: 2.4 }); ctx.save(); ctx.globalAlpha = 0.5; const g = ctx.createRadialGradient(F.handB[0] + 12, F.handB[1] - 30, 0, F.handB[0] + 12, F.handB[1] - 30, 110); g.addColorStop(0, 'rgba(180,210,255,0.5)'); g.addColorStop(1, 'rgba(180,210,255,0)'); ctx.fillStyle = g; ctx.fillRect(F.handB[0] - 120, F.handB[1] - 150, 260, 240); ctx.restore(); }
    // the title
    const k = seg(lt, 3, 4.5) * (1 - seg(lt, 12, 13.5));
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.font = '700 190px Galada'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('তুই নেই', W / 2, 430 + (1 - ease.outBack(clamp(k), 2)) * 40); ctx.restore(); }
  };
  SC.imagine = (ctx, t, lt, sc) => {
    const moonK = sm(seg(t, 37.1, 39));                                     // «আকাশে উঠতো এক ফালি চাঁদ»
    roomBase(ctx, t, moonK, [lerp(0, 1, 0) ? '#000' : '#3A4058', '#565C78']);
    const her = sm(seg(t, 34.0, 35.2)) * (1 - sm(seg(t, 43.5, 45.5)));
    if (her > 0) fig(ctx, 440, GY - 120, { p: { ...P.sit(), lean: -0.12, head: -0.25 }, f: -1, her: true, t, ghost: true, alpha: her * 0.75, eyes: 'closed', mouth: 'smile', brows: 'up' });
    fig(ctx, 300, GY - 120, { p: { ...P.sit(), head: her > 0.5 ? 0.15 : 0 }, t, eyes: her > 0.3 ? 'open' : 'sad', look: her > 0.3 ? 0.9 : 0.3, brows: her > 0.3 ? 'up' : 'sad', mouth: her > 0.3 ? 'smile' : 'flat' });
    if (her > 0.6) heartAt(ctx, 380, GY - 560, 2.2 * her, pulse(t, 6));
  };
  SC.search = (ctx, t, lt) => {
    wall(ctx); floor(ctx); win(ctx, 600, 520, 340, 420, t, { sky: ['#3A4058', '#565C78'] }); moonShape(ctx, 820, 640, 46, 1);
    box(ctx, 80, GY - 640, 230, 640, 70, { fill: '#FFFFFF' }); circ(ctx, 280, GY - 320, 10, { seed: 71 });                 // the door
    const ph = Math.floor(lt / BEAT) % 4, look = [-1, 1, -1, 1][ph];
    const x = lerp(520, 420, sm(seg(lt, 0, 3)));
    const F = fig(ctx, x, GY, { p: lt < 3 ? P.walk(t * 5, 0.8) : P.stand(), f: look, t, eyes: 'wide', look: 1, brows: 'sad', mouth: 'flat' });
    for (let i = 0; i < 3; i++) { const a = seg(lt, 4 + i * 1.6, 4.6 + i * 1.6) * (1 - seg(lt, 9, 10)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.font = '800 90px Anek'; ctx.fillStyle = INK; ctx.fillText('?', F.hc[0] - 120 + i * 90, F.hc[1] - 110 - i * 30); ctx.restore(); } }
  };
  SC.street = (ctx, t, lt, sc) => {
    const scroll = lt * 70;
    buildings(ctx, t, scroll, sc.second ? 120 : 80); floor(ctx);
    for (let i = 0; i < 3; i++) lampPost(ctx, ((i * 520 - scroll * 1.2) % (W + 520) + W + 520) % (W + 520) - 260, t, 0.8);
    const hum = (sc.second ? t >= 165.5 : t >= 67.6);
    fig(ctx, 520, GY, { p: P.walk(t * 4.6, 0.9), t, eyes: hum ? 'closed' : 'sad', brows: 'sad', mouth: hum ? 'hum' : 'flat', look: 0.6 });
    if (hum) for (let k = 0; k < 4; k++) { const b0 = beatN(t) - k, bt = clock.beatAt ? null : null; void bt; const a = clock.phase(t) + k; if (a < 3.5) note(ctx, 640 + a * 70 + Math.sin(a * 3 + k) * 20, 920 - a * 110, 1 - a / 3.5, 200 + ((b0 % 7) + 7) % 7); }
  };
  SC.court = (ctx, t, lt) => {
    // he is the judge and he is the accused
    wall(ctx); floor(ctx);
    box(ctx, 120, GY - 430, 840, 190, 100, { fill: '#F1ECE2' }); hatch(ctx, 120, GY - 430, 840, 190, 101); box(ctx, 380, GY - 300, 320, 300, 102, { fill: '#F1ECE2' });
    const J = fig(ctx, 540, GY - 440, { p: { ...P.stand(), ra: [2.2, -0.6 + 1.1 * pulse(t, 10)] }, s: 1.25, t, f: 1, eyes: 'sad', brows: 'angry', mouth: 'flat', look: 0 });
    L(ctx, [[J.hc[0] - 60, J.hc[1] - 40], [J.hc[0] - 70, J.hc[1] + 50]], 22, 103, { color: '#E9E4DA' });  // wig
    const gx = J.handB[0], gy = J.handB[1]; L(ctx, [[gx, gy], [gx + 40, gy - 30]], 7, 104); box(ctx, gx + 30, gy - 56, 50, 34, 105, { fill: '#8A6440', color: INK, lw: 3 });
    box(ctx, 600, GY - 280, 380, 280, 106, { fill: '#FFFFFF' });   // the dock
    fig(ctx, 790, GY - 120, { p: { ...P.sad(), la: [0.3, 0.6], ra: [0.3, 0.6] }, s: 1.2, f: -1, t, eyes: 'sad', brows: 'sad', mouth: 'sad', lookY: 0.5 });
    const bang = pulse(t, 8); if (bang > 0.3) for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.6; L(ctx, [[gx + 55 + Math.cos(a) * 60, gy - 40 + Math.sin(a) * 60], [gx + 55 + Math.cos(a) * 95, gy - 40 + Math.sin(a) * 95]], 4, 110 + i, { alpha: bang }); }
  };
  SC.turned = (ctx, t, lt) => {
    floor(ctx);
    const go = sm(seg(lt, 0.4, 2.4));
    fig(ctx, lerp(720, 1000, go), GY, { her: true, p: go > 0 && go < 1 ? P.walk(t * 4.5) : P.stand(), f: 1, t, eyes: 'closed', brows: 'flat', mouth: 'flat', alpha: 1 - seg(lt, 1.8, 2.4) });
    const F = fig(ctx, 360, GY, { p: { ...P.stand(), ra: [1.6, 0.1], la: [1.4, 0.2] }, f: 1, t, eyes: 'open', brows: 'sad', mouth: 'open', look: 1 });
    heartAt(ctx, F.handB[0] + 30, F.handB[1] - 20, 2.6, pulse(t, 6));
  };
  SC.bedouin = (ctx, t, lt) => {
    for (let r = 0; r < 3; r++) { const pts = []; for (let x = -40; x <= W + 40; x += 60) pts.push([x, GY - 120 - r * 160 + Math.sin(x * 0.006 + r * 2 + lt * 0.2) * 50]); pen(ctx, pts, 120 + r, { lw: 2.2 }); }
    circ(ctx, 820, 640, 90, { stroke: PEN, lw: 3, seed: 129 }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + lt * 0.2; pen(ctx, [[820 + Math.cos(a) * 115, 640 + Math.sin(a) * 115], [820 + Math.cos(a) * 160, 640 + Math.sin(a) * 160]], 130 + i, { lw: 2 }); }
    floor(ctx);
    const F = fig(ctx, 460 + lt * 40, GY, { p: { ...P.walk(t * 3.4, 0.8), ra: [0.3, -0.2] }, t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 0.8 });
    L(ctx, [F.handB, [F.handB[0] + 30, GY]], 5, 140);                                                    // walking stick
    box(ctx, F.neck[0] - 70, F.neck[1] + 10, 56, 110, 141, { fill: '#E6D8BE', color: INK, lw: 3 });       // backpack
    for (let i = 0; i < 6; i++) { const y = 900 + i * 70, x = ((Hh(i, 8) * W + lt * 600) % (W + 300)) - 150; pen(ctx, [[x, y], [x + 60, y - 6], [x + 110, y + 4]], 150 + i, { lw: 2 }); }
  };
  SC.signal = (ctx, t, lt) => {
    buildings(ctx, t, 300, 160); floor(ctx);
    for (let i = 0; i < 7; i++) box(ctx, 60 + i * 140, GY + 60, 90, 24, 170 + i, { fill: '#FFFFFF' });    // zebra crossing
    pen(ctx, [[820, GY], [820, GY - 820]], 171, { lw: 5 }); box(ctx, 770, GY - 1080, 100, 280, 172, { fill: '#3A3A3A', color: INK });
    const on = beatN(t) % 2;                                                                                // red / blue on alternate beats
    for (let k = 0; k < 2; k++) { const y = GY - 1010 + k * 130, lit = k === on, c = k === 0 ? '#E8343F' : '#3F7BE8'; if (lit) { const g = ctx.createRadialGradient(820, y, 0, 820, y, 160); g.addColorStop(0, c + 'AA'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.fillRect(660, y - 160, 320, 320); } circ(ctx, 820, y, 40, { fill: lit ? c : '#5A5A5A', stroke: INK, seed: 173 + k }); }
    fig(ctx, 420, GY, { p: P.sad(), t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 0.9, lookY: -0.6 });
  };
  SC.crowd = (ctx, t, lt) => {
    buildings(ctx, t, 600, 190); floor(ctx);
    for (let i = 0; i < 9; i++) { const dir = i % 2 ? 1 : -1, sp = 520 + Hh(i, 2) * 300, x = ((Hh(i, 1) * (W + 400) + dir * lt * sp) % (W + 400) + W + 400) % (W + 400) - 200, y = GY + (i % 3) * 24 - 30; fig(ctx, x, y, { p: P.walk(t * 9 + i, 1.1), f: dir, s: 1.15 + Hh(i, 3) * 0.2, color: 'rgba(120,118,114,0.75)', t, seed: 600 + i * 13, mouth: 'none', eyes: 'open', look: 1, brows: 'none' }); }
    fig(ctx, W / 2, GY + 10, { p: P.sad(), s: 1.6, t, eyes: 'closed', brows: 'sad', mouth: 'flat' });
  };
  SC.bench = (ctx, t, lt) => {
    rain(ctx, t, 140); floor(ctx); lampPost(ctx, 760, t, 1);
    box(ctx, 120, GY - 110, 520, 26, 200, { fill: '#FFFFFF' }); box(ctx, 120, GY - 230, 520, 22, 201); pen(ctx, [[160, GY - 84], [160, GY]], 202); pen(ctx, [[600, GY - 84], [600, GY]], 203);
    const look = sm(seg(lt, 5, 7));
    fig(ctx, 300, GY - 40, { p: { ...P.sit(), lean: 0.1, head: 0.3 - look * 0.4 }, t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 0.9, lookY: lerp(0.6, -0.8, look) });
  };
  SC.road = (ctx, t, lt) => {
    const vx = W / 2, vy = 980;
    pen(ctx, [[-100, GY + 300], [vx - 30, vy]], 210, { lw: 3 }); pen(ctx, [[W + 100, GY + 300], [vx + 30, vy]], 211, { lw: 3 }); pen(ctx, [[-40, vy], [W + 40, vy]], 212, { lw: 1.6 });
    for (let i = 0; i < 7; i++) { const k = ((i / 7) + lt * 0.04) % 1, z = Math.pow(k, 2.2); const y = lerp(vy, GY + 300, z), hh = lerp(30, 760, z); for (const side of [-1, 1]) { const x = vx + side * lerp(40, 640, z); pen(ctx, [[x, y], [x, y - hh]], 213 + i * 2 + (side > 0), { lw: lerp(1, 4, z) }); const g = ctx.createRadialGradient(x, y - hh, 0, x, y - hh, 30 + hh * 0.4); g.addColorStop(0, 'rgba(255,224,140,0.35)'); g.addColorStop(1, 'rgba(255,224,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - hh, y - hh * 1.5, hh * 2, hh * 2); } }
    const z = lerp(1, 0.5, sm(seg(lt, 0, 9)));
    fig(ctx, vx, lerp(GY + 120, vy + 200, sm(seg(lt, 0, 9))), { p: P.walk(t * 4, 0.7), s: 1.4 * z, t, f: 1, eyes: 'closed', brows: 'sad', look: 0 });
  };
  SC.deadmoon = (ctx, t, lt) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2C3046'); g.addColorStop(1, '#585C74'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.8; circ(ctx, 600, 720, 220, { fill: '#C9C6BC', stroke: '#8C897F', lw: 3, seed: 220 }); for (let i = 0; i < 6; i++) circ(ctx, 520 + Hh(i, 1) * 180, 640 + Hh(i, 2) * 170, 18 + Hh(i, 3) * 30, { stroke: '#9A978D', lw: 2, seed: 221 + i }); ctx.restore();
    pen(ctx, [[-20, GY - 40], [W + 20, GY - 60]], 230, { color: 'rgba(230,228,220,0.6)', lw: 3 });
    fig(ctx, 360, GY - 40, { p: P.sad(), t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 0.7, lookY: -1, headFill: '#3C4058', color: '#E8E4DA' });
  };
  SC.starsMem = (ctx, t, lt) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2E3456'); g.addColorStop(1, '#4E5478'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { const x = 80 + Hh(i, 1) * (W - 160), y = 560 + Hh(i, 2) * 560, tw = 0.5 + 0.5 * (beatN(t) % 26 === i ? pulse(t, 3) * 2 : Hh(i, 3)); G.star(ctx, x, y, 8 + 12 * tw, { fill: '#FFF1C8', seed: 240 + i }); }
    pen(ctx, [[-20, GY - 80], [W + 20, GY - 80]], 250, { color: 'rgba(240,236,226,0.7)', lw: 3 });
    fig(ctx, 380, GY - 80, { p: { ...P.sit(), hipH: 0, ll: [1.5, -1.3], rl: [1.4, -1.2], ra: [2.5, 0.1] }, t, eyes: 'open', look: 0.6, lookY: -1, brows: 'up', mouth: 'smile', headFill: '#3E4468', color: '#F2EEE4' });
    fig(ctx, 640, GY - 80, { p: { ...P.sit(), hipH: 0, ll: [1.5, -1.3], rl: [1.4, -1.2], lean: -0.15, head: -0.2 }, f: -1, her: true, t, eyes: 'closed', brows: 'up', mouth: 'smile', headFill: '#3E4468', color: '#F2EEE4' });
  };
  SC.sunMem = (ctx, t, lt) => {
    floor(ctx);
    circ(ctx, 760, 760, 120, { fill: '#FFE7A8', stroke: PEN, lw: 3, seed: 260 }); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + lt * 0.4; pen(ctx, [[760 + Math.cos(a) * 150, 760 + Math.sin(a) * 150], [760 + Math.cos(a) * (200 + 20 * pulse(t, 4)), 760 + Math.sin(a) * (200 + 20 * pulse(t, 4))]], 261 + i, { lw: 2.4 }); }
    const hop = Math.abs(Math.sin(t * Math.PI / BEAT)) * 16;
    fig(ctx, 360, GY - hop, { p: { ...P.stand(), la: [2.5, 0.2], ra: [0.6, 0.3] }, t, eyes: 'closed', brows: 'up', mouth: 'open' });
    fig(ctx, 640, GY - hop, { p: { ...P.stand(), la: [0.6, 0.3], ra: [2.5, 0.2] }, f: -1, her: true, t, eyes: 'closed', brows: 'up', mouth: 'open' });
  };
  SC.writing = (ctx, t, lt) => {
    wall(ctx); floor(ctx); win(ctx, 640, 600, 300, 300, t, { sky: ['#3A4058', '#565C78'] });
    desk(ctx, 330, 520); guitar(ctx, 170, GY - 120, -0.18, 0.95);
    const n = Math.min(24, beatN(t) - beatN(S.SCENES.find((s) => s.id === 'writing').t0));                      // one sheet a beat: the pile grows (as in the reference)
    for (let i = 0; i < n; i++) box(ctx, 560 + Math.sin(i * 1.7) * 10, GY - 300 - 18 - i * 14, 200, 14, 280 + i, { fill: '#FFFFFF', lw: 1.8 });
    const write = Math.sin(t * 14) * 0.08;
    fig(ctx, 430, GY - 90, { p: { ...P.sit(), ra: [1.45 + write, 0.5], lean: 0.18, head: 0.3 }, t, eyes: 'sad', brows: 'sad', mouth: 'flat', lookY: 1, look: 0.6 });
    box(ctx, 470, GY - 308, 120, 8, 300, { lw: 1.6 });
  };
  SC.flower = (ctx, t, lt) => {
    wall(ctx); floor(ctx);
    pen(ctx, [[640, GY], [650, GY - 150], [800, GY - 150], [800, GY]], 310); pen(ctx, [[650, GY - 150], [640, GY - 420]], 311);   // the empty chair
    const put = sm(seg(lt, 1.0, 2.2));
    const F = fig(ctx, 380, GY, { p: { ...P.stand(), ra: [lerp(1.4, 1.75, put), lerp(0.1, 0.3, put)], lean: put * 0.15, head: 0.2 }, t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 0.8, lookY: 0.4 });
    const fx = lerp(F.handB[0], 720, put), fy = lerp(F.handB[1], GY - 160, put);
    L(ctx, [[fx, fy], [fx + 6, fy - 110]], 4, 312, { color: '#4D7A4A' }); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; circ(ctx, fx + 6 + Math.cos(a) * 18, fy - 120 + Math.sin(a) * 18, 13, { fill: RED, stroke: '#8A1420', lw: 2, seed: 313 + i }); } circ(ctx, fx + 6, fy - 120, 9, { fill: '#F2C14B', seed: 320 });
  };
  SC.memories = (ctx, t, lt) => {
    wall(ctx); floor(ctx);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2 + lt * 0.7, r = 300 + 40 * Math.sin(lt * 2 + i), x = W / 2 + Math.cos(a) * r, y = 820 + Math.sin(a) * r * 0.7, k = seg(lt, i * 0.18, i * 0.18 + 0.4);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(x, y); ctx.rotate(Math.sin(lt * 1.3 + i) * 0.3);
      frame(ctx, -70, -85, 140, 170, 330 + i * 3, (fx, fy, fw, fh) => { if (i % 3 === 0) heartAt(ctx, fx + fw / 2, fy + fh / 2 + 10, 2.2); else { fig(ctx, fx + fw * 0.35, fy + fh - 6, { s: 0.26, t: 0, seed: 700 + i }); fig(ctx, fx + fw * 0.68, fy + fh - 6, { s: 0.26, her: true, f: -1, t: 0, seed: 720 + i }); } });
      ctx.restore();
    }
    fig(ctx, W / 2, GY, { p: { ...P.stand(), la: [2.4, 0.6], ra: [2.4, 0.6] }, t, eyes: 'wide', brows: 'sad', mouth: 'open', look: Math.sin(lt * 3), lookY: -0.5 });
  };
  SC.helpless = (ctx, t, lt) => {
    wall(ctx); floor(ctx);
    for (let i = 0; i < 9; i++) box(ctx, 600 + (i % 3) * 120 + Math.sin(i) * 20, GY - 30 - Math.floor(i / 3) * 26, 110, 20, 340 + i, { fill: '#FFFFFF', lw: 1.6 });
    fig(ctx, 360, GY, { p: P.hug(), s: 1.6, t, eyes: 'closed', brows: 'sad', mouth: 'sad' });
  };
  SC.solo = (ctx, t, lt, sc) => {
    // the long guitar break: rooftop, moon; memories pop up as thought bubbles on the downbeats; her outline listens
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2B3150'); g.addColorStop(1, '#4C5274'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,248,230,${0.3 + 0.4 * Hh(i, 2)})`; ctx.beginPath(); ctx.arc(Hh(i, 1) * W, 500 + Hh(i, 3) * 700, 1.5 + Hh(i, 4) * 2, 0, 7); ctx.fill(); }
    moonShape(ctx, 830, 640, 70, 1);
    pen(ctx, [[-20, GY - 40], [W + 20, GY - 40]], 360, { color: 'rgba(240,236,226,0.75)', lw: 4 });
    box(ctx, 200, GY - 110, 300, 70, 361, { fill: '#3A4062', color: 'rgba(240,236,226,0.75)' });   // the parapet he sits on
    const strum = pulse(t, 7);
    const F = fig(ctx, 330, GY - 40, { p: { ...P.sit(), hipH: 70, ra: [1.4 + strum * 0.25, 0.9], la: [1.9, 0.4] }, t, eyes: 'closed', brows: 'sad', mouth: 'hum', headFill: '#3A4062', color: '#F2EEE4' });
    guitar(ctx, F.hip[0] + 60, F.hip[1] - 40, -1.05, 0.8, strum);
    const her = sm(seg(lt, 13, 15)) * (1 - sm(seg(lt, 24, 26)));
    if (her > 0) fig(ctx, 640, GY - 40, { p: { ...P.sit(), hipH: 70, lean: -0.1, head: -0.2 }, f: -1, her: true, t, ghost: true, alpha: her * 0.7, eyes: 'closed', brows: 'up', mouth: 'smile', headFill: '#3A4062', color: '#F2EEE4' });
    // a thought bubble per bar, each holding one memory from the film
    const bar = Math.floor(clock.beatAt(t) / 4), b0 = Math.floor(clock.beatAt(sc.t0) / 4), i = bar - b0, inBar = (clock.beatAt(t) / 4) % 1;
    const icons = [(x, y) => heartAt(ctx, x, y + 10, 2.4), (x, y) => moonShape(ctx, x, y, 40, 1), (x, y) => { fig(ctx, x - 30, y + 60, { s: 0.3, t: 0 }); fig(ctx, x + 30, y + 60, { s: 0.3, her: true, f: -1, t: 0 }); }, (x, y) => G.star(ctx, x, y, 34, { fill: '#F2C14B', seed: 9 }), (x, y) => { for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; circ(ctx, x + Math.cos(a) * 20, y + Math.sin(a) * 20, 14, { fill: RED, stroke: '#8A1420', lw: 2, seed: 30 + k }); } }];
    if (i >= 0 && i % 2 === 0) bubble(ctx, 560 + (i % 4 ? 0 : -120), 760 + (i % 3) * 30, 170, Math.min(inBar * 3, 1) * (1 - seg(inBar, 0.85, 1)), 380 + i, (x, y) => icons[(i / 2) % icons.length](x, y));
  };
  SC.emptyBed = (ctx, t, lt) => {
    roomBase(ctx, t, 1);
    fig(ctx, 240, GY - 120, { p: { ...P.sit(), head: 0.2 }, t, eyes: 'sad', brows: 'sad', mouth: 'flat', look: 1, lookY: 0.4 });
    ctx.save(); ctx.setLineDash([10, 12]); pen(ctx, [[420, GY - 330], [560, GY - 330]], 400, { lw: 2 }); ctx.restore();   // where she used to sit
  };
  SC.photo = (ctx, t, lt) => {
    const z = 1 + 0.05 * lt;
    ctx.save(); ctx.translate(W / 2, 880); ctx.scale(z, z);
    frame(ctx, -330, -400, 660, 800, 410, (x, y, w, h) => { floor(ctx, 0); fig(ctx, x + w * 0.3, y + h - 40, { s: 1.4, t, eyes: 'closed', brows: 'up', mouth: 'smile', seed: 800 }); fig(ctx, x + w * 0.7, y + h - 40, { s: 1.4, her: true, f: -1, t, eyes: 'closed', brows: 'up', mouth: 'smile', seed: 820 }); heartAt(ctx, 0, y + 170, 3.2, pulse(t, 5)); });
    ctx.restore();
    // a crack runs across the glass on the third beat
    const c = seg(lt, BEAT * 2, BEAT * 2 + 0.3); if (c > 0) L(ctx, [[W / 2 - 300, 620], [W / 2 - 140, 760], [W / 2 - 40, 700], [W / 2 + 120, 900], [W / 2 + 300, 980]].slice(0, 1 + Math.ceil(c * 4)), 3, 420, { color: 'rgba(40,40,40,0.7)' });
  };
  SC.window = (ctx, t, lt) => {
    wall(ctx); floor(ctx); win(ctx, 300, 420, 480, 600, t, { sky: ['#2E3350', '#565C78'] }); moonShape(ctx, 620, 600, 60, 1);
    fig(ctx, 540, GY, { p: P.sad(), s: 1.7, t, eyes: 'closed', brows: 'sad', mouth: 'flat', f: 1 });
  };
  SC.endcard = (ctx, t, lt) => {
    ctx.fillStyle = RED; ctx.fillRect(0, 0, W, H);
    const k = seg(lt, 0.3, 1.6);
    ctx.save(); ctx.globalAlpha = k; ctx.font = '180px Galada'; ctx.textAlign = 'center'; ctx.fillStyle = '#2A0A0E'; ctx.fillText('তুই নেই', W / 2, 960); ctx.restore();
    if (k > 0.5) { ctx.save(); ctx.globalAlpha = (k - 0.5) * 2; G.heart(ctx, W / 2, 1100, 1.4 * (1 + 0.1 * pulse(t, 5)), { fill: '#2A0A0E', seed: 9 }); ctx.restore(); }
  };

  // ================================================================ words at the top (bold, as in the references)
  function lyric(ctx, t) {
    if (t >= 182.6) return lyricBig(ctx, t);
    const l = LYRICS.find((q) => t >= q.t0 - 0.12 && t < q.t1 + 0.25); if (!l) return;
    const a = Math.min(seg(t, l.t0 - 0.12, l.t0 + 0.12), 1 - seg(t, l.t1 + 0.05, l.t1 + 0.25)), pop = ease.outBack(clamp((t - l.t0 + 0.12) / 0.3), 2.2);
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let size = 100; ctx.font = `800 ${size}px Anek`;
    const words = l.text.split(' '), lines = ctx.measureText(l.text).width > W - 160 && words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [l.text];
    while (Math.max(...lines.map((q) => ctx.measureText(q).width)) > W - 160 && size > 56) { size -= 4; ctx.font = `800 ${size}px Anek`; }
    const y0 = lines.length > 1 ? 330 : 300; ctx.translate(W / 2, y0); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    lines.forEach((ln, i) => { const y = (i - (lines.length - 1) / 2) * size * 1.15; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineJoin = 'round'; ctx.strokeText(ln, 0, y); ctx.fillStyle = INK; ctx.fillText(ln, 0, y); });
    ctx.restore();
  }
  function lyricBig(ctx, t) {
    const l = LYRICS.find((q) => t >= q.t0 - 0.12 && t < q.t1 + 0.3 && q.t0 >= 182); if (!l || t > 193.4) return;
    const a = Math.min(seg(t, l.t0 - 0.12, l.t0 + 0.15), 1 - seg(t, l.t1, l.t1 + 0.3));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = '170px Galada'; ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.strokeText(l.text, W / 2, 340); ctx.fillStyle = INK; ctx.fillText(l.text, W / 2, 340); ctx.restore();
  }

  // ================================================================ the cut
  Studio.film({
    async init() { await Studio.loadFont('Galada', 'assets/galada.woff2', '400'); await Studio.loadFont('Anek', 'assets/anek.woff2', '800'); },
    draw(ctx, t) {
      let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1].t0) i++;
      const sc = SCENES[i], lt = t - sc.t0;
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.save(); const z = (sc.id === 'photo' || sc.id === 'endcard' ? 1 : 1.16) * (1 + 0.04 * sm(clamp(lt / (sc.t1 - sc.t0)))); ctx.translate(W / 2, 1230); ctx.scale(z, z); ctx.translate(-W / 2, -1160);
      SC[sc.id](ctx, t, lt, sc);
      ctx.restore();
      const memory = sc.id === 'starsMem' || sc.id === 'sunMem' || sc.id === 'turned';
      if (memory) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(250,232,200,0.5)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      // a quick paper flash on each cut
      if (i > 0 && lt < 0.28) { ctx.save(); ctx.fillStyle = PAPER; ctx.globalAlpha = (1 - lt / 0.28) * 0.9; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      if (sc.id !== 'endcard') lyric(ctx, t);
    },
    post: { paper: true, vignette: 0.2, grain: false },
    fadeOut: 1.5,
  });
})();
