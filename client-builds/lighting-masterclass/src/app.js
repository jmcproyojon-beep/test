/* ক্যামেরা লাইটিং মাস্টারক্লাস — animated class (300 s, 1920x1080).
 * One GSAP master timeline drives everything: a clock tween (0 -> 300 s) feeds
 * render(t), which poses the instructor, the lights and the lit face from
 * keyframe tracks; GSAP fromTo tweens pop cards, labels and ticks on cue.
 * Cue times come from the voice-script lines (window.__LINES, built by
 * build.mjs from src/script.js), so the voiceover can be laid on later. */
(function () {
  "use strict";
  const LINES = window.__LINES, SCENES = window.__SCENES;
  const TOTAL = 300, NS = "http://www.w3.org/2000/svg";
  const C = { bg: "#0E0E10", bg2: "#16161A", bg3: "#1E1E24", line: "#2C2C34", cream: "#F3EBDD", mute: "#A39C90", amber: "#FFB347", blue: "#7FB8FF",
    red: "#FF6B5E", green: "#5FD38D", skin: "#B97C55", skinD: "#9A6442", tee: "#17171A", strap: "#7A5434" };
  const BN = "'Inter', 'Hind Siliguri', sans-serif";

  // ------------------------------------------------------------------ helpers
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ramp = (t, a, d) => smooth((t - a) / d);
  const win = (t, a, b, f = 0.35) => Math.min(ramp(t, a - f / 2, f), 1 - ramp(t, b - f / 2, f));
  const bell = (x, c, w) => Math.exp(-((x - c) * (x - c)) / (2 * w * w));
  const rad = (d) => (d * Math.PI) / 180;
  const EASE = { io: gsap.parseEase("power2.inOut"), o: gsap.parseEase("power3.out"), lin: (x) => x, back: gsap.parseEase("back.out(1.7)") };
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, str, o = {}) {
    const e = el("text", { x, y, "text-anchor": o.anchor || "start", fill: o.fill || C.cream }, parent);
    e.style.fontFamily = o.family || BN; e.style.fontSize = (o.size || 32) + "px"; e.style.fontWeight = o.weight || 600;
    if (o.ls) e.style.letterSpacing = o.ls + "px";
    e.textContent = str;
    return e;
  }
  /** keyframe track: [[t, v, ease?], ...] -> f(t) */
  function track(keys) {
    return (t) => {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        const [t1, v1, e] = keys[i];
        if (t <= t1) { const [t0, v0] = keys[i - 1]; const k = (EASE[e || "io"])((t - t0) / Math.max(1e-6, t1 - t0)); return v0 + (v1 - v0) * k; }
      }
      return keys[keys.length - 1][1];
    };
  }
  const cue = (sc, i) => LINES.find((l) => l.scene === sc && l.i === i).s;
  const cueE = (sc, i) => LINES.find((l) => l.scene === sc && l.i === i).e;
  const SC = (n) => SCENES.find((s) => s.n === n);
  const bnNum = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  function kelvin(K) {
    const t = K / 100; let r, g, b;
    if (t <= 66) { r = 255; g = 99.4708 * Math.log(t) - 161.1196; b = t <= 19 ? 0 : 138.5177 * Math.log(t - 10) - 305.0448; }
    else { r = 329.6987 * Math.pow(t - 60, -0.1332); g = 288.1222 * Math.pow(t - 60, -0.0755); b = 255; }
    return [r, g, b].map((v) => clamp(1 - (1 - clamp(v / 255)) * 1.25));
  }
  const hex = (c) => "#" + c.map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, "0")).join("");
  const mixc = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

  // ------------------------------------------------------------------ light power with click + flicker
  const FLICK = [[0, 0], [0.04, 0.95], [0.09, 0.12], [0.15, 0.8], [0.21, 0.3], [0.28, 1], [0.36, 0.72], [0.46, 1]];
  const flick = (dt) => { for (let i = 1; i < FLICK.length; i++) if (dt <= FLICK[i][0]) { const [a, va] = FLICK[i - 1], [b, vb] = FLICK[i]; return lerp(va, vb, (dt - a) / (b - a)); } return 1; };
  /** events [[t, power], ...] -> {p, click (0..1 burst progress or -1)} */
  function powerAt(evts, t) {
    let cur = 0, prev = 0, last = null;
    for (const e of evts) { if (t >= e[0]) { prev = cur; cur = e[1]; last = e; } }
    if (!last) return { p: 0, click: -1 };
    const dt = t - last[0];
    if (cur > prev + 0.3) return { p: prev + (cur - prev) * flick(dt), click: dt < 0.5 ? dt / 0.5 : -1 };
    return { p: prev + (cur - prev) * smooth(dt / 0.4), click: -1 };
  }

  // ------------------------------------------------------------------ stage
  const svg = document.getElementById("svg");
  const defs = el("defs", {}, svg);
  defs.innerHTML = `
    <filter id="glowL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="glowM" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18181C"/><stop offset="1" stop-color="#0B0B0D"/></linearGradient>
    <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFB347" stop-opacity="0.55"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>
    <radialGradient id="poolB" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#7FB8FF" stop-opacity="0.5"/><stop offset="1" stop-color="#7FB8FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="kbar" x1="0" y1="0" x2="1" y2="0"></linearGradient>`;
  const gBg = el("g", {}, svg), gScenes = el("g", {}, svg), gChar = el("g", {}, svg), gFx = el("g", {}, svg), gHud = el("g", {}, svg);
  el("rect", { width: 1920, height: 1080, fill: C.bg }, gBg);
  el("rect", { x: 0, y: 930, width: 1920, height: 150, fill: "url(#floorG)" }, gBg);
  el("line", { x1: 0, y1: 930, x2: 1920, y2: 930, stroke: "#222228", "stroke-width": 2 }, gBg);
  const scene = {};
  for (const s of SCENES) { scene[s.n] = el("g", { id: "scene" + s.n }, gScenes); gsap.set(scene[s.n], { autoAlpha: 0 }); }

  // ------------------------------------------------------------------ face engine (subject preview)
  let FID = 0;
  /** The model's head and shoulders, re-lit live. Albedo art is drawn once and
   *  reused: a dark ambient copy, then one copy per light, tinted by that
   *  light's colour x power and masked by where it lands (pool + shadows). */
  function makeFace(parent, x, y, s, o = {}) {
    const id = "f" + FID++;
    const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    const d = el("defs", {}, g);
    const art = el("g", { id: id + "art" }, d);
    art.innerHTML = `
      <path d="M95 205 Q88 78 200 68 Q312 78 305 205 L320 335 Q300 366 268 352 L268 232 L132 232 L132 352 Q100 366 80 335 Z" fill="#3A2418"/>
      <path d="M166 296 L234 296 L240 372 L160 372 Z" fill="#D9A37F"/>
      <path d="M36 480 Q48 390 130 370 L164 360 Q200 386 236 360 L270 370 Q352 390 364 480 Z" fill="#3E6A86"/>
      <path d="M164 360 Q200 392 236 360" fill="none" stroke="#2C4E66" stroke-width="5"/>
      <ellipse cx="112" cy="226" rx="13" ry="23" fill="#D9A37F"/><ellipse cx="288" cy="226" rx="13" ry="23" fill="#D9A37F"/>
      <ellipse cx="200" cy="215" rx="88" ry="112" fill="#E2AE88"/>
      <ellipse cx="150" cy="262" rx="22" ry="13" fill="#E9967F" opacity="0.35"/><ellipse cx="250" cy="262" rx="22" ry="13" fill="#E9967F" opacity="0.35"/>
      <path d="M106 196 Q108 90 200 86 Q292 90 296 196 Q276 138 238 124 Q205 158 152 148 Q124 160 106 196 Z" fill="#3A2418"/>
      <path d="M140 187 Q160 176 184 184" fill="none" stroke="#2A170E" stroke-width="7" stroke-linecap="round"/>
      <path d="M216 184 Q240 176 260 187" fill="none" stroke="#2A170E" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="162" cy="209" rx="18" ry="9.5" fill="#F4EFEA"/><ellipse cx="238" cy="209" rx="18" ry="9.5" fill="#F4EFEA"/>
      <circle cx="163" cy="209" r="8" fill="#4A2E1E"/><circle cx="237" cy="209" r="8" fill="#4A2E1E"/>
      <circle cx="163" cy="209" r="3.6" fill="#120A06"/><circle cx="237" cy="209" r="3.6" fill="#120A06"/>
      <path d="M143 205 Q162 196 181 205" fill="none" stroke="#2A170E" stroke-width="3.5"/><path d="M219 205 Q238 196 257 205" fill="none" stroke="#2A170E" stroke-width="3.5"/>
      <path d="M200 206 Q195 244 186 258 Q200 267 214 258" fill="none" stroke="#B57A58" stroke-width="4" stroke-linecap="round"/>
      <path d="M176 292 Q190 283 200 288 Q210 283 224 292 Q200 300 176 292 Z" fill="#B65E57"/>
      <path d="M178 293 Q200 313 222 293 Q200 300 178 293 Z" fill="#C86E65"/>`;
    const mk = (tag, a, p) => el(tag, a, p);
    // per-slot filters, masks
    const slots = [0, 1].map((k) => {
      const f = mk("filter", { id: `${id}t${k}`, "color-interpolation-filters": "sRGB" }, d);
      const cm = mk("feColorMatrix", { type: "matrix", values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" }, f);
      const m = mk("mask", { id: `${id}m${k}`, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 400, height: 480 }, d);
      mk("rect", { width: 400, height: 480, fill: "#000" }, m);
      const rg = mk("radialGradient", { id: `${id}p${k}`, gradientUnits: "userSpaceOnUse" }, d);
      const st = [0, 1, 2].map((i) => mk("stop", { offset: i / 2, "stop-color": i < 2 ? "#fff" : "#000" }, rg));
      mk("rect", { width: 400, height: 480, fill: `url(#${id}p${k})` }, m);
      const bf = mk("filter", { id: `${id}b${k}`, x: "-50%", y: "-50%", width: "200%", height: "200%" }, d);
      const blur = mk("feGaussianBlur", { stdDeviation: 4 }, bf);
      const sh = mk("g", { filter: `url(#${id}b${k})` }, m);
      const nose = mk("ellipse", { fill: "#000" }, sh);
      const eyes = mk("g", { fill: "#000" }, sh);
      mk("ellipse", { cx: 162, cy: 207, rx: 32, ry: 19 }, eyes); mk("ellipse", { cx: 238, cy: 207, rx: 32, ry: 19 }, eyes);
      const chin = mk("ellipse", { cx: 200, cy: 334, rx: 64, ry: 34, fill: "#000" }, sh);
      const tri = mk("path", { fill: "#fff" }, sh);
      return { cm, rg, st, blur, nose, eyes, chin, tri };
    });
    const rimF = mk("filter", { id: id + "tr", "color-interpolation-filters": "sRGB" }, d);
    const rimCM = mk("feColorMatrix", { type: "matrix", values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" }, rimF);
    const rimM = mk("mask", { id: id + "mr", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 400, height: 480 }, d);
    mk("rect", { width: 400, height: 480, fill: "#000" }, rimM);
    const rimBF = mk("filter", { id: id + "rb", x: "-20%", y: "-20%", width: "140%", height: "140%" }, d); mk("feGaussianBlur", { stdDeviation: 3.5 }, rimBF);
    const rimG = mk("g", { fill: "none", stroke: "#fff", "stroke-linecap": "round", filter: `url(#${id}rb)` }, rimM);
    mk("path", { d: "M92 235 Q84 76 200 66 Q316 76 308 235", "stroke-width": 13 }, rimG);
    mk("path", { d: "M318 330 L306 210", "stroke-width": 9 }, rimG); mk("path", { d: "M82 330 L94 210", "stroke-width": 9 }, rimG);
    mk("path", { d: "M40 470 Q52 394 132 372", "stroke-width": 12 }, rimG); mk("path", { d: "M360 470 Q348 394 268 372", "stroke-width": 12 }, rimG);
    const ambF = mk("filter", { id: id + "ta", "color-interpolation-filters": "sRGB" }, d);
    const ambCM = mk("feColorMatrix", { type: "matrix" }, ambF);
    // wall + wall light
    const wallG = mk("linearGradient", { id: id + "w", x1: 0, y1: 0, x2: 0, y2: 1 }, d);
    const w0 = mk("stop", { offset: 0 }, wallG), w1 = mk("stop", { offset: 1 }, wallG);
    const clip = mk("clipPath", { id: id + "c" }, d); mk("rect", { width: 400, height: 480, rx: 26 }, clip);
    const body = mk("g", { "clip-path": `url(#${id}c)` }, g);
    mk("rect", { width: 400, height: 480, fill: `url(#${id}w)` }, body);
    const wp = mk("ellipse", { cx: 280, cy: 150, rx: 190, ry: 150, fill: "url(#poolB)", opacity: 0 }, body);
    mk("use", { href: `#${id}art`, filter: `url(#${id}ta)` }, body);
    const uses = [0, 1].map((k) => { const u = mk("use", { href: `#${id}art`, filter: `url(#${id}t${k})`, mask: `url(#${id}m${k})` }, body); u.style.mixBlendMode = "screen"; return u; });
    const rimU = mk("use", { href: `#${id}art`, filter: `url(#${id}tr)`, mask: `url(#${id}mr)` }, body); rimU.style.mixBlendMode = "screen";
    const frame = mk("rect", { width: 400, height: 480, rx: 26, fill: "none", stroke: o.stroke || "#2E2E36", "stroke-width": 4 }, g);
    const matrix = (c, k) => `${c[0] * k} 0 0 0 0 0 ${c[1] * k} 0 0 0 0 0 ${c[2] * k} 0 0 0 0 0 1 0`;
    function setSlot(S, L) {
      if (!L || L.I <= 0.002) { S.cm.setAttribute("values", matrix([0, 0, 0], 0)); return; }
      const az = L.az, el_ = L.el || 0, soft = clamp(L.soft || 0);
      const front = clamp((Math.cos(rad(az)) + 0.5) / 0.5);
      const col = kelvin(L.K || 5600);
      S.cm.setAttribute("values", matrix(col, L.I * front * 1.08));
      const sa = Math.sin(rad(clamp(az, -110, 110)));
      const cx = 200 + 165 * sa, cy = 222 - 60 * Math.sin(rad(el_)), r = 235 + 65 * soft;
      S.rg.setAttribute("cx", cx); S.rg.setAttribute("cy", cy); S.rg.setAttribute("r", r);
      S.rg.setAttribute("fx", cx); S.rg.setAttribute("fy", cy);
      S.st[1].setAttribute("offset", lerp(0.44, 0.06, soft)); S.st[2].setAttribute("offset", lerp(0.6, 0.99, soft));
      const shadows = L.shadows !== false;
      const vis = shadows ? front : 0;
      S.blur.setAttribute("stdDeviation", 2 + soft * 10);
      const dx = -sa, dy = Math.sin(rad(el_)) * 0.9 + 0.12;
      const len = 16 + 48 * Math.abs(sa) * Math.cos(rad(el_)) + 14 * Math.sin(rad(el_));
      const ncx = 200 + dx * len * 0.55 - (dx < 0 ? 6 : -6) * Math.abs(sa), ncy = 254 + dy * len * 0.42;
      S.nose.setAttribute("cx", ncx); S.nose.setAttribute("cy", ncy);
      S.nose.setAttribute("rx", 9 + Math.abs(dx) * len * 0.42); S.nose.setAttribute("ry", Math.min(16, 7 + dy * len * 0.3));
      S.nose.setAttribute("opacity", vis * (1 - 0.55 * soft) * 0.95);
      S.eyes.setAttribute("opacity", vis * clamp((el_ - 48) / 30) * (1 - 0.65 * soft));
      S.chin.setAttribute("opacity", (shadows ? 0.3 : 0.15) + 0.5 * clamp(el_ / 60) * (1 - 0.4 * soft));
      const sg = az >= 0 ? 1 : -1, tx = 200 - sg * 42;
      S.tri.setAttribute("d", `M${tx - 13 * sg} 238 L${tx + 13 * sg} 236 L${tx + 3 * sg} 268 Z`);
      S.tri.setAttribute("opacity", 0.8 * vis * bell(Math.abs(az), 48, 16) * bell(el_, 34, 18) * (1 - 0.6 * soft));
    }
    return {
      g,
      update(st) {
        const amb = st.amb ?? 0.07;
        const ac = st.ambK ? kelvin(st.ambK) : [1, 1, 1.05];
        ambCM.setAttribute("values", matrix(ac, amb));
        setSlot(slots[0], st.key); setSlot(slots[1], st.fill);
        const rim = st.rim || { I: 0 };
        rimCM.setAttribute("values", matrix(kelvin(rim.K || 3300), (rim.I || 0) * 1.25));
        const w = st.wall || {};
        const wb = w.b ?? 0.25;
        const top = w.top || [0.2, 0.2, 0.22], bot = w.bottom || [0.12, 0.12, 0.13];
        w0.setAttribute("stop-color", hex(top.map((v) => v * wb))); w1.setAttribute("stop-color", hex(bot.map((v) => v * wb)));
        wp.setAttribute("opacity", clamp(w.pool || 0));
      },
    };
  }

  // ------------------------------------------------------------------ instructor (রুবেল মিয়া)
  /** Original flat character: light beard, black tee, camera strap. Feet at
   *  the origin, facing right toward the demo. update() returns hand points. */
  function makeRubel(parent) {
    const g = el("g", {}, parent);
    el("ellipse", { cx: 0, cy: 0, rx: 92, ry: 14, fill: "#000", opacity: 0.45 }, g);
    const body = el("g", {}, g);
    const leg = (x) => {
      const p = el("g", {}, body);
      el("path", { d: "M-24 0 L-20 244 Q0 252 20 244 L24 0 Z", fill: "#262E3C" }, p);
      el("path", { d: "M-26 236 L36 236 Q50 238 50 252 L50 262 L-26 262 Z", fill: "#111114", stroke: "#2A2A30", "stroke-width": 2 }, p);
      return { p, x };
    };
    const legB = leg(-14), legF = leg(14);
    const arm = (sx, sy, front) => {
      const sh = el("g", {}, body);
      el("path", { d: "M-24 -8 Q0 -16 24 -8 L22 62 L-22 62 Z", fill: C.tee, stroke: front ? "#2A2A30" : "none", "stroke-width": 2 }, sh);
      el("rect", { x: -15, y: 56, width: 30, height: 50, rx: 14, fill: front ? C.skin : C.skinD }, sh);
      const elb = el("g", {}, sh);
      el("rect", { x: -14, y: -6, width: 28, height: 98, rx: 13, fill: front ? C.skin : C.skinD }, elb);
      el("circle", { cx: 0, cy: 96, r: 17, fill: front ? C.skin : C.skinD }, elb);
      return { sh, elb, sx, sy };
    };
    const armB = arm(-50, -456, false);
    const torso = el("g", {}, body);
    el("path", { d: "M-72 -452 Q-78 -474 -40 -480 L44 -480 Q80 -474 76 -452 L66 -250 Q0 -238 -62 -250 Z", fill: C.tee }, torso);
    el("path", { d: "M-62 -250 Q0 -238 66 -250 L66 -236 Q0 -224 -62 -236 Z", fill: "#262E3C" }, torso);
    el("path", { d: "M-18 -480 Q4 -462 26 -480", fill: "none", stroke: "#2A2A30", "stroke-width": 4 }, torso);
    el("rect", { x: -14, y: -510, width: 34, height: 36, rx: 8, fill: C.skinD }, torso);
    // camera strap + camera
    el("path", { d: "M-34 -478 Q-40 -400 4 -372 M40 -478 Q50 -410 44 -372", fill: "none", stroke: C.strap, "stroke-width": 9, "stroke-linecap": "round" }, torso);
    el("rect", { x: -12, y: -392, width: 74, height: 50, rx: 9, fill: "#2B2E35", stroke: "#3C4048", "stroke-width": 2 }, torso);
    el("rect", { x: 0, y: -402, width: 22, height: 12, rx: 3, fill: "#2B2E35" }, torso);
    el("circle", { cx: 26, cy: -367, r: 19, fill: "#101114", stroke: "#4A4E57", "stroke-width": 4 }, torso);
    el("circle", { cx: 26, cy: -367, r: 8, fill: "#1E2C3A" }, torso);
    el("circle", { cx: 52, cy: -384, r: 3.5, fill: C.amber }, torso);
    const head = el("g", {}, body);
    el("ellipse", { cx: -34, cy: -572, rx: 11, ry: 17, fill: C.skinD }, head);
    el("ellipse", { cx: 8, cy: -575, rx: 60, ry: 72, fill: C.skin }, head);
    el("path", { d: "M-44 -560 Q-40 -504 14 -500 Q60 -504 66 -548 Q58 -522 22 -520 Q-18 -520 -44 -560 Z", fill: "#2C1D16", opacity: 0.62 }, head);
    el("path", { d: "M20 -546 Q38 -554 58 -546", fill: "none", stroke: "#2C1D16", "stroke-width": 6, "stroke-linecap": "round", opacity: 0.8 }, head);
    el("path", { d: "M-54 -592 Q-56 -660 10 -662 Q72 -660 70 -604 Q58 -626 24 -628 Q-14 -628 -36 -596 Q-42 -575 -46 -560 Z", fill: "#17110E" }, head);
    const brows = el("g", { fill: "none", stroke: "#17110E", "stroke-width": 6, "stroke-linecap": "round" }, head);
    const browA = el("path", { d: "M-4 -603 Q8 -610 20 -604" }, brows), browB = el("path", { d: "M34 -604 Q46 -610 58 -603" }, brows);
    const eyes = [[8, -585], [46, -585]].map(([ex, ey]) => {
      const e = el("g", {}, head);
      el("ellipse", { cx: ex, cy: ey, rx: 9.5, ry: 7, fill: "#F3EEE8" }, e);
      const pupil = el("circle", { cx: ex + 2, cy: ey, r: 4.6, fill: "#1A120D" }, e);
      return { e, pupil, ex, ey };
    });
    el("path", { d: "M62 -584 Q76 -566 62 -556", fill: "none", stroke: C.skinD, "stroke-width": 5, "stroke-linecap": "round" }, head);
    const mouthClosed = el("path", { fill: "none", stroke: "#3A1A14", "stroke-width": 4, "stroke-linecap": "round" }, head);
    const mouthOpen = el("g", {}, head);
    el("ellipse", { cx: 38, cy: -532, rx: 13, ry: 9, fill: "#4A1C16" }, mouthOpen);
    el("rect", { x: 28, y: -540, width: 20, height: 4, rx: 2, fill: "#F3EEE8" }, mouthOpen);
    const armF = arm(56, -456, true);
    const R = (a, L) => [-L * Math.sin(rad(a)), L * Math.cos(rad(a))];
    return {
      g,
      update(p) {
        const s = p.s || 1;
        g.setAttribute("transform", `translate(${p.x} ${p.y}) scale(${s})`);
        body.setAttribute("transform", `translate(0 ${p.bob || 0})`);
        legB.p.setAttribute("transform", `translate(${legB.x} -262) rotate(${-p.leg || 0})`);
        legF.p.setAttribute("transform", `translate(${legF.x} -262) rotate(${p.leg || 0})`);
        for (const [A, sh, eb] of [[armF, p.fs, p.fe], [armB, p.bs, p.be]]) {
          A.sh.setAttribute("transform", `translate(${A.sx} ${A.sy}) rotate(${sh})`);
          A.elb.setAttribute("transform", `translate(0 100) rotate(${eb})`);
        }
        head.setAttribute("transform", `rotate(${p.tilt || 0} 6 -505)`);
        const bl = p.blink || 0;
        for (const E of eyes) {
          E.e.setAttribute("transform", `translate(0 ${E.ey}) scale(1 ${1 - 0.9 * bl}) translate(0 ${-E.ey})`);
          E.pupil.setAttribute("cx", E.ex + (p.look ?? 2)); E.pupil.setAttribute("cy", E.ey + (p.lookY || 0));
        }
        const m = clamp(p.mouth || 0), sm = p.smile || 0;
        mouthOpen.setAttribute("transform", `translate(0 -532) scale(1 ${0.15 + m}) translate(0 532)`);
        mouthOpen.setAttribute("opacity", m > 0.08 ? 1 : 0);
        mouthClosed.setAttribute("d", `M24 ${-538 + sm * 2} Q37 ${-532 + sm * 8} 52 ${-538 + sm * 2}`);
        mouthClosed.setAttribute("opacity", m > 0.08 ? 0 : 1);
        browA.setAttribute("transform", `translate(0 ${-(p.brow || 0) * 4})`); browB.setAttribute("transform", `translate(0 ${-(p.brow || 0) * 4})`);
        const hand = (A, sh, eb) => {
          const [ax, ay] = R(sh, 100), [bx, by] = R(sh + eb, 96);
          return [p.x + s * (A.sx + ax + bx), p.y + s * (A.sy + ay + by + (p.bob || 0))];
        };
        return { front: hand(armF, p.fs, p.fe), back: hand(armB, p.bs, p.be) };
      },
    };
  }

  // ------------------------------------------------------------------ lights
  let LID = 0;
  /** A light fixture with on/off FX: click burst, flicker, glow bloom, cone. */
  function makeLamp(parent, type, o = {}) {
    const id = "l" + LID++;
    const color = o.color || C.amber;
    const g = el("g", {}, parent);
    const coneG = el("linearGradient", { id: id + "cg", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el("stop", { offset: 0, "stop-color": color, "stop-opacity": 0.42 }, coneG); el("stop", { offset: 1, "stop-color": color, "stop-opacity": 0 }, coneG);
    const cone = el("path", { fill: `url(#${id}cg)` }, g);
    const glow = el("ellipse", { fill: color, filter: "url(#glowL)", opacity: 0 }, g);
    const body = el("g", {}, g);
    const face = el("g", {}, g);
    const click = el("g", { opacity: 0 }, g);
    const ring = el("circle", { r: 20, fill: "none", stroke: C.cream, "stroke-width": 3 }, click);
    const rays = [];
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; rays.push([el("line", { stroke: color, "stroke-width": 4, "stroke-linecap": "round" }, click), a]); }
    let fw = 60, fh = 20, glowR = [70, 40];
    if (type === "softboxTop" || type === "ledTop") {
      const w = type === "ledTop" ? 66 : 96, h = type === "ledTop" ? 20 : 28;
      el("rect", { x: -w / 2, y: -h, width: w, height: h, rx: 5, fill: "#26262C", stroke: "#3A3A44", "stroke-width": 2 }, body);
      el("rect", { x: -6, y: -h - 16, width: 12, height: 18, rx: 3, fill: "#3A3A44" }, body);
      if (type === "ledTop") for (let i = 0; i < 6; i++) el("circle", { cx: -25 + i * 10, cy: -h / 2, r: 2.5, fill: "#55555F" }, body);
      el("rect", { x: -w / 2 + 3, y: -5, width: w - 6, height: 6, rx: 3, fill: "#444" }, body);
      fw = w - 6; fh = 6; glowR = [w * 0.8, 40];
      el("rect", { x: -w / 2 + 3, y: -5, width: w - 6, height: 6, rx: 3, fill: "#fff" }, face);
    } else if (type === "reflTop") {
      el("path", { d: "M-46 -6 Q0 12 46 -6", fill: "none", stroke: "#C9CED6", "stroke-width": 8, "stroke-linecap": "round" }, body);
      fw = 80; glowR = [50, 24];
      el("path", { d: "M-46 -6 Q0 12 46 -6", fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round" }, face);
    } else if (type === "softboxFront") {
      el("line", { x1: 0, y1: -400, x2: 0, y2: -80, stroke: "#2A2A30", "stroke-width": 4 }, body);
      el("path", { d: "M-120 -80 L120 -80 L96 0 L-96 0 Z", fill: "#232328", stroke: "#34343C", "stroke-width": 3 }, body);
      el("rect", { x: -104, y: -8, width: 208, height: 18, rx: 6, fill: "#3A3A40" }, body);
      el("rect", { x: -104, y: -8, width: 208, height: 18, rx: 6, fill: "#FFF6E8" }, face);
      glowR = [200, 70];
    } else if (type === "bulb") {
      el("line", { x1: 0, y1: -260, x2: 0, y2: -46, stroke: "#2A2A30", "stroke-width": 3 }, body);
      el("rect", { x: -12, y: -48, width: 24, height: 22, rx: 3, fill: "#5A5A62" }, body);
      el("circle", { cx: 0, cy: -8, r: 22, fill: "#3A3A40" }, body);
      el("circle", { cx: 0, cy: -8, r: 22, fill: "#FFF3D6" }, face);
      glowR = [80, 80];
    } else if (type === "softboxSide") {
      // tripod stand + softbox facing +x (used when the light is carried)
      el("path", { d: "M0 -230 L0 -20 M0 -40 L-46 0 M0 -40 L46 0 M0 -40 L0 0", stroke: "#3A3A44", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, body);
      el("path", { d: "M-34 -330 L26 -390 L26 -180 L-34 -240 Z", fill: "#232328", stroke: "#3A3A44", "stroke-width": 3, "stroke-linejoin": "round" }, body);
      el("rect", { x: 20, y: -392, width: 14, height: 214, rx: 5, fill: "#3A3A40" }, body);
      el("rect", { x: 20, y: -392, width: 14, height: 214, rx: 5, fill: "#FFF6E8" }, face);
      glowR = [70, 140];
    } else if (type === "panel") {
      el("rect", { x: -60, y: -42, width: 120, height: 84, rx: 8, fill: "#26262C", stroke: "#3A3A44", "stroke-width": 3 }, body);
      el("rect", { x: -52, y: -34, width: 104, height: 68, rx: 5, fill: "#3A3A40" }, body);
      el("rect", { x: -52, y: -34, width: 104, height: 68, rx: 5, fill: "#FFF6E8" }, face);
      el("line", { x1: 0, y1: 42, x2: 0, y2: 160, stroke: "#3A3A44", "stroke-width": 5 }, body);
      glowR = [100, 80];
    } else if (type === "spot") {
      el("line", { x1: 0, y1: -140, x2: 0, y2: -36, stroke: "#2A2A30", "stroke-width": 3 }, body);
      el("path", { d: "M-34 -36 L34 -36 L48 12 L-48 12 Z", fill: "#26262C", stroke: "#3A3A44", "stroke-width": 3 }, body);
      el("ellipse", { cx: 0, cy: 12, rx: 46, ry: 7, fill: "#FFF6E8" }, face);
      glowR = [80, 34];
    }
    return {
      g,
      /** x, y, rot (deg; 0 = beam toward +y in local space), power, click, cone {len, w0, w1} */
      update({ x, y, rot = 0, power = 0, click: clk = -1, cone: cn = null, s = 1 }) {
        g.setAttribute("transform", `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
        const p = clamp(power);
        face.setAttribute("opacity", p);
        glow.setAttribute("rx", glowR[0]); glow.setAttribute("ry", glowR[1]);
        glow.setAttribute("cx", type === "softboxSide" ? 40 : 0); glow.setAttribute("cy", type === "softboxSide" ? -285 : type === "bulb" ? -8 : 0);
        glow.setAttribute("opacity", p * 0.75);
        if (cn && p > 0.001) {
          const { len, w0 = fw, w1, ox = 0, oy = 0, axis = "y" } = cn;
          const d = axis === "y"
            ? `M${ox - w0 / 2} ${oy} L${ox + w0 / 2} ${oy} L${ox + w1 / 2} ${oy + len} L${ox - w1 / 2} ${oy + len} Z`
            : `M${ox} ${oy - w0 / 2} L${ox} ${oy + w0 / 2} L${ox + len} ${oy + w1 / 2} L${ox + len} ${oy - w1 / 2} Z`;
          coneG.setAttribute("x2", axis === "y" ? 0 : 1); coneG.setAttribute("y2", axis === "y" ? 1 : 0);
          coneEl(d, p);
        } else coneEl("", 0);
        if (clk >= 0) click_(clk); else clickG(0);
      },
    };
    function coneEl(d, p) { cone.setAttribute("d", d); cone.setAttribute("opacity", p * (o.coneK ?? 1)); }
    function clickG(v) { click.setAttribute("opacity", v); }
    function click_(k) {
      clickG(1 - k);
      const cy = type === "softboxSide" ? -285 : type === "bulb" ? -8 : 0, cx = type === "softboxSide" ? 40 : 0;
      ring.setAttribute("cx", cx); ring.setAttribute("cy", cy); ring.setAttribute("r", 24 + k * 90);
      for (const [ln, a] of rays) {
        const r0 = 40 + k * 70, r1 = r0 + 26 * (1 - k);
        ln.setAttribute("x1", cx + Math.cos(a) * r0); ln.setAttribute("y1", cy + Math.sin(a) * r0);
        ln.setAttribute("x2", cx + Math.cos(a) * r1); ln.setAttribute("y2", cy + Math.sin(a) * r1);
      }
    }
  }

  // ------------------------------------------------------------------ shared UI bits
  function heading(g, title, en) {
    const h = el("g", {}, g);
    txt(h, 1270, 104, title, { size: 46, weight: 700, anchor: "middle" });
    if (en) txt(h, 1270, 142, en, { size: 24, weight: 600, anchor: "middle", fill: C.amber, family: "'Inter', sans-serif", ls: 2 });
    return h;
  }
  function card(g, x, y, w, h, o = {}) {
    const c = el("g", { transform: `translate(${x} ${y})` }, g);
    el("rect", { width: w, height: h, rx: 22, fill: o.fill || C.bg2, stroke: o.stroke || C.line, "stroke-width": 2 }, c);
    return c;
  }
  function badge(g, x, y, ok, r = 34) {
    const b = el("g", { transform: `translate(${x} ${y})` }, g);
    el("circle", { r, fill: ok ? C.green : C.red }, b);
    el("path", { d: ok ? `M${-r * 0.45} 0 L${-r * 0.1} ${r * 0.38} L${r * 0.5} ${-r * 0.36}` : `M${-r * 0.38} ${-r * 0.38} L${r * 0.38} ${r * 0.38} M${r * 0.38} ${-r * 0.38} L${-r * 0.38} ${r * 0.38}`,
      fill: "none", stroke: "#0E0E10", "stroke-width": r * 0.24, "stroke-linecap": "round", "stroke-linejoin": "round" }, b);
    return b;
  }
  function icon(g, kind, x, y, s = 1, col = C.cream) {
    const i = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g);
    const st = { fill: "none", stroke: col, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" };
    if (kind === "softbox") { el("path", { d: "M-34 -22 L34 -22 L24 18 L-24 18 Z", ...st }, i); el("line", { x1: 0, y1: 18, x2: 0, y2: 40, ...st }, i); el("line", { x1: -26, y1: 22, x2: 26, y2: 22, ...st, stroke: C.amber }, i); }
    if (kind === "sun") { el("circle", { r: 16, ...st, stroke: C.amber }, i); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; el("line", { x1: Math.cos(a) * 26, y1: Math.sin(a) * 26, x2: Math.cos(a) * 36, y2: Math.sin(a) * 36, ...st, stroke: C.amber }, i); } }
    if (kind === "umbrella") { el("path", { d: "M-36 4 Q0 -46 36 4 Z", ...st }, i); el("path", { d: "M0 4 L0 36", ...st }, i); }
    if (kind === "cloth") { el("path", { d: "M-34 -26 Q-12 -34 10 -26 T34 -26 L30 26 Q8 18 -12 26 T-34 26 Z", ...st }, i); }
    if (kind === "ruler") { el("path", { d: "M-38 10 L38 10 M-38 0 L-38 20 M38 0 L38 20 M-20 10 L-20 2 M0 10 L0 2 M20 10 L20 2", ...st }, i); el("path", { d: "M-30 -14 L30 -14 M22 -22 L30 -14 L22 -6", ...st, stroke: C.amber }, i); }
    if (kind === "three") { [[-24, 14, C.amber], [24, 14, C.cream], [0, -20, C.blue]].forEach(([a, b, c]) => el("circle", { cx: a, cy: b, r: 11, fill: c }, i)); }
    if (kind === "bulb") { el("circle", { cy: -6, r: 18, ...st, stroke: "#FF9A3C" }, i); el("path", { d: "M-8 14 L8 14 M-6 22 L6 22", ...st }, i); }
    if (kind === "window") { el("rect", { x: -28, y: -30, width: 56, height: 60, rx: 4, ...st, stroke: C.blue }, i); el("path", { d: "M0 -30 L0 30 M-28 0 L28 0", ...st, stroke: C.blue }, i); }
    if (kind === "camera") { el("rect", { x: -34, y: -18, width: 68, height: 40, rx: 8, ...st }, i); el("circle", { cy: 2, r: 12, ...st }, i); el("rect", { x: -14, y: -28, width: 22, height: 10, rx: 3, ...st }, i); }
    return i;
  }
  /** pop-in for SVG groups/text on the timeline */
  const pops = [];
  function pop(node, at, o = {}) { pops.push({ node, at, o }); return node; }

  // ================================================================== SCENES
  const U = {}; // per-scene update(t)
  const RUBEL_X = [], POSES = [];  // filled per scene
  const HOLD = []; // [a, b, fn(t)->x] intervals where the character's x follows something

  // ---------------- Scene 1: intro (0-20)
  {
    const g = scene[1];
    const hero = makeLamp(g, "softboxFront", { color: "#FFE2B0" });
    const pool = el("ellipse", { cx: 1230, cy: 930, rx: 520, ry: 70, fill: "url(#pool)", opacity: 0 }, g);
    const T = el("g", {}, g);
    txt(T, 1230, 470, "ক্যামেরা লাইটিং মাস্টারক্লাস", { size: 88, weight: 700, anchor: "middle" });
    txt(T, 1230, 548, "স্টুডিও থেকে আউটডোর", { size: 54, weight: 600, anchor: "middle", fill: C.amber });
    const chip = el("g", { transform: "translate(1230 620)" }, T);
    el("rect", { x: -220, y: -30, width: 440, height: 60, rx: 30, fill: C.bg2, stroke: C.line, "stroke-width": 2 }, chip);
    txt(chip, 0, 11, "ইনস্ট্রাক্টর: রুবেল মিয়া", { size: 30, weight: 600, anchor: "middle" });
    pops.push({ node: T, at: 1.5, o: { from: { autoAlpha: 0, scale: 0.6, y: -120, svgOrigin: "1230 300" }, to: { autoAlpha: 1, scale: 1, y: 0, svgOrigin: "1230 300" }, dur: 1.4, ease: "expo.out" } });
    const pair = el("g", {}, g);
    icon(pair, "softbox", 1060, 760, 1.2); txt(pair, 1060, 830, "স্টুডিও", { size: 34, anchor: "middle" });
    el("path", { d: "M1170 752 L1290 752 M1186 738 L1170 752 L1186 766 M1274 738 L1290 752 L1274 766", fill: "none", stroke: C.mute, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, pair);
    icon(pair, "sun", 1400, 756, 1.2); txt(pair, 1400, 830, "আউটডোর", { size: 34, anchor: "middle" });
    pop(pair, cue(1, 2) + 1.0);
    const ON = [[0.9, 1]];
    U[1] = (t) => {
      const P = powerAt(ON, t);
      hero.update({ x: 1230, y: 250, power: P.p, click: P.click, cone: { len: 680, w0: 210, w1: 980, oy: 10 } });
      pool.setAttribute("opacity", P.p);
    };
    RUBEL_X.push([0, -260], [2.4, -260], [5.6, 330, "lin"]);
    POSES.push([0, "idle"], [5.7, "wave"], [8.0, "idle"], [cue(1, 2) + 0.6, "present"], [cue(1, 2) + 4.5, "idle"]);
  }

  // ---------------- Scene 2: four properties (20-50)
  {
    const g = scene[2], s0 = 20;
    heading(g, "আলোর চারটা বৈশিষ্ট্য", "4 PROPERTIES OF LIGHT");
    const CARDS = [
      { x: 690, y: 180, t: "তীব্রতা", en: "Intensity", d: "কতটা উজ্জ্বল" },
      { x: 1290, y: 180, t: "দিক", en: "Direction", d: "কোন দিক থেকে আসছে" },
      { x: 690, y: 540, t: "গুণমান", en: "Quality", d: "হার্ড নাকি সফট" },
      { x: 1290, y: 540, t: "রঙ", en: "Color Temperature", d: "কালার টেম্পারেচার (K)" },
    ];
    const W = 570, Hh = 330;
    const parts = CARDS.map((c, i) => {
      const cg = card(g, c.x, c.y, W, Hh);
      const ring = el("rect", { width: W, height: Hh, rx: 22, fill: "none", stroke: C.amber, "stroke-width": 4, opacity: 0 }, cg);
      el("rect", { x: 24, y: 24, width: 230, height: 282, rx: 16, fill: "#101013" }, cg);
      txt(cg, 290, 110, c.t, { size: 52, weight: 700 });
      txt(cg, 290, 156, c.en, { size: 28, weight: 600, fill: i === 3 ? C.blue : C.amber, family: "'Inter', sans-serif" });
      txt(cg, 290, 220, c.d, { size: 30, weight: 500, fill: C.mute });
      const demo = el("g", { transform: "translate(139 165)" }, cg);
      pop(cg, cue(2, i + 1), { from: { autoAlpha: 0, y: 40 }, to: { y: 0 } });
      return { cg, ring, demo };
    });
    // 1 dimmer
    const D1 = parts[0].demo;
    const b1g = el("circle", { cy: -50, r: 50, fill: C.amber, filter: "url(#glowM)" }, D1);
    el("circle", { cy: -50, r: 26, fill: "#FFF1D6" }, D1);
    el("rect", { x: -90, y: 70, width: 180, height: 10, rx: 5, fill: "#2E2E36" }, D1);
    const b1fill = el("rect", { x: -90, y: 70, width: 90, height: 10, rx: 5, fill: C.amber }, D1);
    const knob = el("circle", { cy: 75, r: 15, fill: C.cream }, D1);
    // 2 direction: sphere lit by an orbiting light
    const D2 = parts[1].demo;
    const sg = el("radialGradient", { id: "sph", cx: 0.5, cy: 0.5, r: 0.75 }, defs);
    el("stop", { offset: 0, "stop-color": "#FFE2B8" }, sg); el("stop", { offset: 0.55, "stop-color": "#7A5A40" }, sg); el("stop", { offset: 1, "stop-color": "#1A1410" }, sg);
    el("circle", { r: 70, fill: "url(#sph)" }, D2);
    const orb = el("circle", { r: 12, fill: C.amber }, D2);
    el("circle", { r: 108, fill: "none", stroke: "#2E2E36", "stroke-width": 2, "stroke-dasharray": "6 8" }, D2);
    // 3 quality: hard vs soft shadow
    const D3 = parts[2].demo;
    const shF = el("filter", { id: "qsoft", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    const qBlur = el("feGaussianBlur", { stdDeviation: 0 }, shF);
    el("ellipse", { cx: 22, cy: 92, rx: 70, ry: 16, fill: "#000", opacity: 0.85, filter: "url(#qsoft)" }, D3);
    el("circle", { cy: 30, r: 56, fill: "#CDBBA6" }, D3);
    const qLab = txt(D3, 0, -86, "HARD", { size: 26, weight: 700, anchor: "middle", family: "'Inter', sans-serif", fill: C.amber });
    // 4 colour: kelvin bar + swatch
    const D4 = parts[3].demo;
    const kg = el("linearGradient", { id: "kg2", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [3000, 4500, 5600, 7000, 8500].forEach((K, i) => el("stop", { offset: i / 4, "stop-color": hex(kelvin(K)) }, kg));
    el("rect", { x: -95, y: 70, width: 190, height: 16, rx: 8, fill: "url(#kg2)" }, D4);
    const kmark = el("rect", { x: -4, y: 62, width: 8, height: 32, rx: 3, fill: C.cream }, D4);
    const sw = el("circle", { cy: -36, r: 58 }, D4);
    const kTxt = txt(D4, 0, -110, "", { size: 24, weight: 700, anchor: "middle", family: "'Inter', sans-serif" });
    U[2] = (t) => {
      const lt = t - s0;
      const k = 0.55 + 0.45 * Math.sin(lt * 1.6);
      b1g.setAttribute("opacity", 0.15 + 0.85 * k); b1g.setAttribute("r", 30 + 36 * k);
      b1fill.setAttribute("width", 180 * k); knob.setAttribute("cx", -90 + 180 * k);
      const a = lt * 1.2; orb.setAttribute("cx", Math.cos(a) * 108); orb.setAttribute("cy", Math.sin(a) * 108);
      sg.setAttribute("cx", 0.5 + Math.cos(a) * 0.3); sg.setAttribute("cy", 0.5 + Math.sin(a) * 0.3);
      const soft = smooth((Math.sin(lt * 1.3) + 1) / 2);
      qBlur.setAttribute("stdDeviation", soft * 14); qLab.textContent = soft > 0.5 ? "SOFT" : "HARD"; qLab.setAttribute("fill", soft > 0.5 ? C.blue : C.amber);
      const K = 3000 + 5500 * (0.5 + 0.5 * Math.sin(lt * 0.9));
      kmark.setAttribute("x", -95 + 190 * ((K - 3000) / 5500) - 4); sw.setAttribute("fill", hex(kelvin(K)));
      kTxt.textContent = Math.round(K / 100) * 100 + "K"; kTxt.setAttribute("fill", hex(kelvin(K)));
      const all = win(t, cue(2, 5), cueE(2, 5) + 0.8, 0.5);
      parts.forEach((p) => p.ring.setAttribute("opacity", all * (0.55 + 0.45 * Math.sin(t * 5))));
    };
    POSES.push([s0, "idle"]);
    for (let i = 1; i <= 4; i++) POSES.push([cue(2, i) + 0.1, i % 2 ? "point" : "pointLow"], [cue(2, i) + 2.2, "idle"]);
    POSES.push([cue(2, 5) + 0.2, "present"], [cueE(2, 5), "idle"]);
  }

  // ---------------- Scene 3: inverse square law (50-95)
  const S3 = {};
  {
    const g = scene[3], s0 = 50;
    heading(g, "দূরত্বের খেলা", "INVERSE SQUARE LAW");
    const SUBJ = 1700, PPM = 220;
    const dx = (m) => SUBJ - 20 - m * PPM;
    // ruler
    const rul = el("g", {}, g);
    el("line", { x1: dx(4.2), y1: 918, x2: SUBJ - 20, y2: 918, stroke: "#3A3A44", "stroke-width": 3 }, rul);
    [1, 2, 3, 4].forEach((m) => { el("line", { x1: dx(m), y1: 906, x2: dx(m), y2: 928, stroke: m === 3 ? "#3A3A44" : C.mute, "stroke-width": 3 }, rul);
      if (m !== 3) txt(rul, dx(m), 898, `${bnNum(m)} মিটার`, { size: 24, weight: 600, anchor: "middle", fill: C.mute }); });
    // subject side view (on a stool)
    const sub = el("g", { transform: `translate(${SUBJ} 930)` }, g);
    el("path", { d: "M-40 0 L-30 -150 M40 0 L30 -150 M-44 -150 L44 -150", stroke: "#3A3A44", "stroke-width": 7, fill: "none" }, sub);
    el("path", { d: "M-46 -150 Q-52 -260 -20 -300 L30 -300 Q56 -260 52 -150 Z", fill: "#3E6A86" }, sub);
    el("rect", { x: -16, y: -330, width: 30, height: 34, fill: "#C99572" }, sub);
    const subHead = el("ellipse", { cx: -6, cy: -372, rx: 40, ry: 50, fill: "#E2AE88" }, sub);
    el("path", { d: "M-10 -424 Q40 -420 36 -360 L34 -300 Q14 -300 14 -330 Q16 -380 -10 -390 Z", fill: "#3A2418" }, sub);
    const subLit = el("ellipse", { cx: -30, cy: -372, rx: 26, ry: 46, fill: "#FFE6C4", filter: "url(#glowS)", opacity: 0 }, sub);
    // the stand + its light
    const lamp = makeLamp(g, "softboxSide", { color: "#FFE2B0", coneK: 0.8 });
    // meter + formula
    const met = el("g", { transform: "translate(320 0)" }, g);
    txt(met, 0, 230, "সাবজেক্টে আলো", { size: 32, weight: 600, anchor: "middle", fill: C.mute });
    const pct = txt(met, 0, 350, "100%", { size: 120, weight: 800, anchor: "middle", fill: C.amber, family: "'Inter', sans-serif" });
    el("rect", { x: -210, y: 380, width: 420, height: 20, rx: 10, fill: "#26262C" }, met);
    const bar = el("rect", { x: -210, y: 380, width: 420, height: 20, rx: 10, fill: C.amber }, met);
    const form = el("g", {}, g);
    txt(form, 320, 496, "দূরত্ব ২ গুণ = আলো ¼", { size: 48, weight: 700, anchor: "middle", fill: "#FFFFFF" });
    txt(form, 320, 544, "I ~ 1 / d²", { size: 34, weight: 600, anchor: "middle", fill: C.blue, family: "'Inter', sans-serif" });
    pop(form, cue(3, 3) + 0.2);
    // falloff comparison bars
    const cmp = el("g", { transform: "translate(70 610)" }, g);
    const row = (y, label) => { txt(cmp, 0, y + 20, label, { size: 26, weight: 600, fill: C.mute }); el("rect", { x: 175, y, width: 280, height: 24, rx: 12, fill: "#26262C" }, cmp); return el("rect", { x: 175, y, width: 280, height: 24, rx: 12, fill: C.amber }, cmp); };
    const barS = row(0, "সাবজেক্ট"), barB = row(52, "ব্যাকগ্রাউন্ড");
    barB.setAttribute("fill", C.blue);
    pop(cmp, cue(3, 4) + 0.6);
    const tagNear = el("g", { transform: "translate(290 780)" }, g);
    el("rect", { x: -240, y: -32, width: 480, height: 64, rx: 32, fill: C.bg2, stroke: C.amber, "stroke-width": 2 }, tagNear);
    const tagTxt = txt(tagNear, 0, 10, "", { size: 25, weight: 600, anchor: "middle" });
    pop(tagNear, cue(3, 4) + 1.2);
    const note = txt(g, 1670, 560, "এক্সপোজার মিলিয়ে দেখানো", { size: 22, weight: 500, anchor: "middle", fill: C.mute });
    pop(note, cue(3, 4) + 0.5);
    const face = makeFace(g, 1500, 112, 0.85);
    // distance track (metres)
    const dist = track([[s0, 1], [cue(3, 1) + 0.8, 1], [cue(3, 1) + 3.4, 2], [cue(3, 3) + 0.2, 2], [cue(3, 3) + 3.0, 4],
      [cue(3, 4) + 0.3, 4], [cue(3, 4) + 3.3, 1], [cue(3, 5) + 0.5, 1], [cue(3, 5) + 4.3, 4], [cue(3, 6) + 0.2, 4], [cue(3, 6) + 2.8, 1]]);
    const comp = (t) => ramp(t, cue(3, 4), 1.0); // exposure-compensated view
    S3.standX = (t) => dx(dist(t)) - 34;
    HOLD.push([cue(3, 0) + 2.9, SC(3).end - 0.9, (t) => S3.standX(t) - 139]);
    U[3] = (t) => {
      const d = dist(t), sx = S3.standX(t);
      lamp.update({ x: sx, y: 930, power: powerAt([[s0 + 0.4, 1]], t).p, click: powerAt([[s0 + 0.4, 1]], t).click,
        cone: { axis: "x", ox: 34, oy: -285, len: SUBJ - 60 - sx, w0: 200, w1: 200 + (SUBJ - sx) * 0.55 } });
      const raw = 1 / (d * d), c = comp(t);
      const I = lerp(raw, 1, c);
      pct.textContent = (raw >= 0.995 ? 100 : Math.max(1, Math.round(raw * 100))) + "%";
      bar.setAttribute("width", Math.max(14, 420 * raw));
      const wall = Math.pow(d / (d + 0.8), 2);
      barS.setAttribute("width", 280); barB.setAttribute("width", Math.max(16, 280 * wall));
      tagTxt.textContent = t < cue(3, 5) ? "কাছে: সাবজেক্ট উজ্জ্বল, পেছন অন্ধকার" : t < cue(3, 6) ? "দূরে: সাবজেক্ট আর পেছন প্রায় সমান" : "কাছে = বড় উৎস = সফট আলো";
      subLit.setAttribute("opacity", clamp(I) * 0.9);
      const soft = clamp(0.88 - (d - 1) * 0.26, 0.08, 0.9);
      face.update({ amb: 0.05, key: { I: I * 1.05, az: -38, el: 18, soft, K: 5200 }, fill: { I: 0.08 * I, az: 40, el: 0, soft: 1, shadows: false },
        wall: { b: lerp(0.35 * raw, 0.9 * wall, c) + 0.04, top: [0.55, 0.53, 0.5], bottom: [0.4, 0.39, 0.37] } });
    };
    RUBEL_X.push([s0 + 0.4, 330], [cue(3, 0) + 2.9, S3.standX(cue(3, 0) + 2.9) - 139, "io"]);
    POSES.push([s0 + 0.5, "idle"], [cue(3, 0) + 2.6, "grab"], [SC(3).end - 0.9, "idle"]);
  }

  // ---------------- Scene 4: hard vs soft (95-120)
  {
    const g = scene[4], s0 = 95;
    heading(g, "হার্ড লাইট বনাম সফট লাইট", "HARD LIGHT  vs  SOFT LIGHT");
    const fL = makeFace(g, 760, 190, 0.95), fR = makeFace(g, 1380, 190, 0.95);
    const bulb = makeLamp(g, "bulb", { color: "#FFE2B0" });
    const sbox = makeLamp(g, "panel", { color: "#FFF2DC" });
    const lab = (x, bn, en, col) => { const l = el("g", {}, g); txt(l, x, 712, bn, { size: 44, weight: 700, anchor: "middle" }); txt(l, x, 750, en, { size: 26, weight: 600, anchor: "middle", fill: col, family: "'Inter', sans-serif", ls: 1.5 }); return l; };
    const lL = lab(950, "হার্ড লাইট", "HARD LIGHT", C.amber), lR = lab(1570, "সফট লাইট", "SOFT LIGHT", C.blue);
    const nL = txt(g, 950, 800, "ছোট উৎস = ধারালো ছায়া", { size: 30, weight: 500, anchor: "middle", fill: C.mute });
    const nR = txt(g, 1570, 800, "বড় উৎস = নরম ছায়া", { size: 30, weight: 500, anchor: "middle", fill: C.mute });
    pop(lL, cue(4, 0) + 0.3); pop(nL, cue(4, 0) + 1.2); pop(lR, cue(4, 1) + 0.3); pop(nR, cue(4, 1) + 1.2);
    // diffuser cloth
    const cloth = el("path", { fill: "#F6F2EA", opacity: 0.82, stroke: "#FFFFFF", "stroke-width": 2 }, g);
    const clothTag = txt(g, 1120, 132, "ডিফিউজার", { size: 26, weight: 600, anchor: "middle", fill: C.cream });
    pop(clothTag, cue(4, 2) + 1.6);
    const row = el("g", {}, g);
    [["softbox", "সফটবক্স"], ["umbrella", "ছাতা"], ["cloth", "সাদা কাপড়"]].forEach(([k, l], i) => { icon(row, k, 1010 + i * 250, 872, 0.9); txt(row, 1060 + i * 250, 884, l, { size: 28, weight: 600 }); });
    pop(row, cue(4, 2) + 2.2);
    const fly = (t) => ease3((t - cue(4, 2) - 0.2) / 1.5);
    function ease3(x) { return EASE.o(clamp(x)); }
    U[4] = (t) => {
      const pB = powerAt([[s0 + 0.3, 1]], t), pS = powerAt([[cue(4, 1) - 0.4, 1]], t);
      bulb.update({ x: 1160, y: 300, power: pB.p, click: pB.click });
      sbox.update({ x: 1830, y: 270, power: pS.p, click: pS.click, s: 1.1 });
      const k = fly(t);
      const cx = lerp(560, 1120, k), cy = lerp(-160, 300, k), wv = Math.sin(t * 7) * (1 - k * 0.7) * 10;
      cloth.setAttribute("d", `M${cx - 70} ${cy - 60 + wv} Q${cx} ${cy - 70 - wv} ${cx + 70} ${cy - 60 + wv} L${cx + 64} ${cy + 64 - wv} Q${cx} ${cy + 54 + wv} ${cx - 64} ${cy + 64 - wv} Z`);
      cloth.setAttribute("opacity", t > cue(4, 2) + 0.15 ? 0.82 : 0);
      clothTag.setAttribute("y", cy - 84);
      const sL = clamp((t - cue(4, 2) - 1.4) / 1.2) * 0.85;
      fL.update({ amb: 0.05, key: { I: pB.p * (1.1 - sL * 0.15), az: 46, el: 32, soft: sL, K: 4300 }, wall: { b: 0.22 } });
      fR.update({ amb: 0.05, key: { I: pS.p * 1.05, az: 46, el: 32, soft: 0.95, K: 5600 }, wall: { b: 0.24 } });
      nL.textContent = sL > 0.4 ? "ডিফিউজার দিলে ছায়া নরম" : "ছোট উৎস = ধারালো ছায়া";
    };
    RUBEL_X.push([SC(3).end - 0.9, 330, "io"]);
    POSES.push([cue(4, 0) + 0.3, "point"], [cue(4, 0) + 2.6, "idle"], [cue(4, 1) + 0.3, "pointLow"], [cue(4, 1) + 2.6, "idle"], [cue(4, 2) + 0.4, "present"], [cue(4, 2) + 4.0, "idle"]);
  }

  // ---------------- Scene 5: three-point lighting (120-185)
  {
    const g = scene[5], s0 = 120;
    heading(g, "থ্রি-পয়েন্ট লাইটিং", "THREE-POINT LIGHTING");
    const box = el("g", {}, g);
    el("rect", { x: 680, y: 168, width: 580, height: 740, rx: 26, fill: "#121216", stroke: C.line, "stroke-width": 2 }, box);
    for (let i = 0; i < 14; i++) el("line", { x1: 700, y1: 200 + i * 50, x2: 1240, y2: 200 + i * 50, stroke: "#1B1B21", "stroke-width": 2 }, box);
    for (let i = 0; i < 11; i++) el("line", { x1: 720 + i * 50, y1: 186, x2: 720 + i * 50, y2: 890, stroke: "#1B1B21", "stroke-width": 2 }, box);
    el("rect", { x: 700, y: 200, width: 540, height: 14, rx: 4, fill: "#2A2A32" }, box);
    txt(box, 1220, 244, "দেয়াল", { size: 22, weight: 600, anchor: "end", fill: C.mute });
    const wallSpot = el("ellipse", { cx: 1090, cy: 214, rx: 90, ry: 26, fill: "url(#poolB)", opacity: 0 }, box);
    const SX = 965, SY = 560;
    // subject (top view) + camera
    el("ellipse", { cx: SX, cy: SY + 6, rx: 74, ry: 30, fill: "#3E6A86" }, box);
    el("circle", { cx: SX, cy: SY, r: 32, fill: "#3A2418" }, box);
    el("path", { d: `M${SX - 8} ${SY + 28} L${SX} ${SY + 42} L${SX + 8} ${SY + 28} Z`, fill: "#E2AE88" }, box);
    txt(box, SX, SY - 52, "সাবজেক্ট", { size: 24, weight: 600, anchor: "middle", fill: C.mute });
    const cam = el("g", { transform: `translate(${SX} 846)` }, box);
    el("path", { d: `M0 -20 L-160 -300 M0 -20 L160 -300`, stroke: "#2C2C36", "stroke-width": 2, "stroke-dasharray": "8 8" }, cam);
    el("rect", { x: -40, y: -22, width: 80, height: 44, rx: 8, fill: "#2B2E35", stroke: "#4A4E57", "stroke-width": 2 }, cam);
    el("rect", { x: -16, y: -40, width: 32, height: 20, rx: 4, fill: "#2B2E35", stroke: "#4A4E57", "stroke-width": 2 }, cam);
    txt(cam, 0, 52, "ক্যামেরা", { size: 22, weight: 600, anchor: "middle", fill: C.mute });
    const place = (deg, R) => [SX + R * Math.sin(rad(deg)), SY + R * Math.cos(rad(deg))];
    const aim = ([x, y]) => (Math.atan2(SY - y, SX - x) * 180) / Math.PI - 90;
    const P = { key: place(45, 250), fill: place(-45, 262), rim: [812, 330], bg: [1110, 340] };
    const L = {
      key: makeLamp(box, "softboxTop", { color: C.amber }), fill: makeLamp(box, "ledTop", { color: "#FFE9CC" }),
      rim: makeLamp(box, "ledTop", { color: C.amber }), bg: makeLamp(box, "ledTop", { color: C.blue }),
    };
    const lbl = (x, y, en, bn, col, at) => { const l = el("g", {}, box); txt(l, x, y, en, { size: 24, weight: 700, anchor: "middle", fill: col, family: "'Inter', sans-serif" }); txt(l, x, y + 30, bn, { size: 24, weight: 600, anchor: "middle", fill: C.cream }); pop(l, at); return l; };
    const EV = { key: [[cue(5, 1) + 0.5, 1]], fill: [[cue(5, 3) + 0.5, 1]], rim: [[cue(5, 6) + 0.5, 1]], bg: [[cue(5, 8) + 1.2, 1]] };
    lbl(P.key[0] + 18, P.key[1] + 62, "KEY LIGHT", "কী লাইট", C.amber, EV.key[0][0]);
    lbl(P.fill[0] - 10, P.fill[1] + 62, "FILL LIGHT", "ফিল লাইট", "#FFE9CC", EV.fill[0][0]);
    lbl(P.rim[0] - 10, P.rim[1] - 70, "BACK / RIM", "ব্যাক লাইট", C.amber, EV.rim[0][0]);
    lbl(P.bg[0] + 40, P.bg[1] + 56, "BACKGROUND", "ব্যাকগ্রাউন্ড লাইট", C.blue, EV.bg[0][0]);
    // 45 degree arc + height hint
    const arc = el("g", {}, box);
    el("path", { d: `M${SX} ${SY + 110} A110 110 0 0 0 ${SX + 110 * Math.sin(rad(45))} ${SY + 110 * Math.cos(rad(45))}`, fill: "none", stroke: C.amber, "stroke-width": 3 }, arc);
    el("line", { x1: SX, y1: SY, x2: SX, y2: SY + 160, stroke: C.amber, "stroke-width": 2, "stroke-dasharray": "5 6" }, arc);
    el("line", { x1: SX, y1: SY, x2: P.key[0], y2: P.key[1], stroke: C.amber, "stroke-width": 2, "stroke-dasharray": "5 6" }, arc);
    txt(arc, SX + 54, SY + 150, "45°", { size: 30, weight: 800, anchor: "middle", fill: C.amber, family: "'Inter', sans-serif" });
    pop(arc, cue(5, 2) + 0.3);
    const hint = el("g", { transform: `translate(${P.key[0] - 10} ${P.key[1] + 128})` }, box);
    el("rect", { x: -120, y: -26, width: 240, height: 52, rx: 26, fill: C.bg2, stroke: C.amber, "stroke-width": 2 }, hint);
    txt(hint, 0, 9, "↑ চোখের একটু উপরে", { size: 24, weight: 600, anchor: "middle" });
    pop(hint, cue(5, 2) + 2.4);
    // face + ratio meter
    const face = makeFace(g, 1300, 160, 1.4 * 0.82);
    const rat = el("g", { transform: "translate(1300 740)" }, g);
    el("rect", { width: 560, height: 150, rx: 22, fill: C.bg2, stroke: C.line, "stroke-width": 2 }, rat);
    txt(rat, 30, 46, "KEY : FILL", { size: 24, weight: 700, fill: C.mute, family: "'Inter', sans-serif", ls: 2 });
    const ratT = txt(rat, 30, 118, "2 : 1", { size: 64, weight: 800, fill: C.amber, family: "'Inter', sans-serif" });
    const ratL = txt(rat, 530, 118, "নরম লুক", { size: 32, weight: 700, anchor: "end" });
    const bK = el("rect", { x: 250, y: 30, width: 280, height: 18, rx: 9, fill: C.amber }, rat);
    const bF = el("rect", { x: 250, y: 58, width: 140, height: 18, rx: 9, fill: "#FFE9CC" }, rat);
    pop(rat, cue(5, 5) + 0.2);
    const fillI = track([[s0, 0.5], [cue(5, 5) + 3.2, 0.5], [cue(5, 5) + 4.4, 0.25], [cue(5, 6) - 0.2, 0.25], [cue(5, 6) + 0.6, 0.5]]);
    U[5] = (t) => {
      const st = {};
      for (const k of ["key", "fill", "rim", "bg"]) {
        st[k] = powerAt(EV[k], t);
        const pos = P[k];
        const rot = k === "bg" ? 180 : aim(pos);
        const len = k === "bg" ? 120 : Math.hypot(SX - pos[0], SY - pos[1]) - 40;
        L[k].update({ x: pos[0], y: pos[1], rot, power: st[k].p, click: st[k].click, cone: { len, w1: k === "key" ? 170 : 120 } });
      }
      wallSpot.setAttribute("opacity", st.bg.p);
      const fi = fillI(t);
      face.update({ amb: 0.045, key: { I: st.key.p * 1.05, az: 45, el: 26, soft: 0.35, K: 5000 }, fill: { I: st.fill.p * fi * 1.05, az: -48, el: 8, soft: 1, K: 5200, shadows: false },
        rim: { I: st.rim.p, K: 3200 }, wall: { b: 0.1 + 0.1 * st.bg.p, pool: st.bg.p } });
      const r = fi > 0.37 ? 2 : 4;
      ratT.textContent = `${r} : 1`; ratL.textContent = r === 2 ? "নরম লুক" : "ড্রামাটিক"; bF.setAttribute("width", 280 * fi);
    };
    POSES.push([s0, "idle"], [cue(5, 1) + 0.3, "point"], [cue(5, 2) + 3.5, "idle"], [cue(5, 3) + 0.3, "pointLow"], [cue(5, 4) + 2, "idle"],
      [cue(5, 5) + 0.3, "present"], [cueE(5, 5), "idle"], [cue(5, 6) + 0.3, "point"], [cue(5, 7) + 3, "idle"], [cue(5, 8) + 0.8, "point"], [cue(5, 8) + 4, "idle"]);
  }

  // ---------------- Scene 6: how many lights (185-215)
  {
    const g = scene[6], s0 = 185;
    heading(g, "কয়টা লাইট লাগে?", "HOW MANY LIGHTS?");
    const PAN = [
      { x: 690, t: "১টি লাইট + রিফ্লেক্টর", st: { key: { I: 1.05, az: 45, el: 26, soft: 0.6, K: 5400 }, fill: { I: 0.32, az: -50, el: 0, soft: 1, shadows: false, K: 5400 }, wall: { b: 0.18 } }, icons: ["softbox", "refl"] },
      { x: 1090, t: "২টি লাইট", st: { key: { I: 1.05, az: 45, el: 26, soft: 0.6, K: 5400 }, fill: { I: 0.5, az: -46, el: 6, soft: 1, shadows: false, K: 5400 }, wall: { b: 0.2 } }, icons: ["softbox", "softbox"] },
      { x: 1490, t: "৩টি লাইট", st: { key: { I: 1.05, az: 45, el: 26, soft: 0.6, K: 5400 }, fill: { I: 0.45, az: -46, el: 6, soft: 1, shadows: false, K: 5400 }, rim: { I: 1, K: 3200 }, wall: { b: 0.18, pool: 0.8 } }, icons: ["softbox", "softbox", "softbox"] },
    ];
    const faces = PAN.map((p, i) => {
      const c = card(g, p.x, 168, 380, 470);
      txt(c, 190, 50, p.t, { size: 32, weight: 700, anchor: "middle" });
      const f = makeFace(c, 46, 74, 0.72); f.update(p.st);
      const ic = el("g", { transform: "translate(190 440)" }, c);
      p.icons.forEach((k, j) => { const x = (j - (p.icons.length - 1) / 2) * 70; k === "refl" ? el("path", { d: `M${x - 22} -6 Q${x} 10 ${x + 22} -6`, fill: "none", stroke: "#C9CED6", "stroke-width": 7, "stroke-linecap": "round" }, ic) : icon(ic, "softbox", x, -8, 0.55, j === 0 ? C.amber : j === 2 ? C.blue : C.cream); });
      pop(c, cue(6, i + 1) + 0.2, { from: { autoAlpha: 0, y: 40 }, to: { y: 0 } });
      return f;
    });
    const PAT = [
      { k: "লুপ", en: "Loop", st: { key: { I: 1.05, az: 30, el: 30, soft: 0.3 }, fill: { I: 0.18, az: -40, soft: 1, shadows: false }, wall: { b: 0.15 } } },
      { k: "রেমব্রান্ট", en: "Rembrandt", st: { key: { I: 1.1, az: 52, el: 36, soft: 0.15 }, fill: { I: 0.08, az: -40, soft: 1, shadows: false }, wall: { b: 0.12 } } },
      { k: "বাটারফ্লাই", en: "Butterfly", st: { key: { I: 1.05, az: 0, el: 52, soft: 0.25 }, fill: { I: 0.16, az: 0, el: -10, soft: 1, shadows: false }, wall: { b: 0.15 } } },
      { k: "স্প্লিট", en: "Split", st: { key: { I: 1.1, az: 92, el: 6, soft: 0.15 }, fill: { I: 0.02, az: -40, soft: 1, shadows: false }, wall: { b: 0.1 } } },
    ];
    const l4 = LINES.find((l) => l.scene === 6 && l.i === 4);
    PAT.forEach((p, i) => {
      const c = card(g, 690 + i * 300, 660, 280, 250);
      const f = makeFace(c, 62, 14, 0.39); f.update(p.st);
      txt(c, 140, 222, `${p.k} · `, { size: 28, weight: 700, anchor: "end" });
      txt(c, 140, 222, p.en, { size: 24, weight: 600, fill: C.amber, family: "'Inter', sans-serif" });
      pop(c, l4.s + (l4.e - l4.s) * (0.42 + i * 0.14), { from: { autoAlpha: 0, y: 30 }, to: { y: 0 } });
    });
    U[6] = () => {};
    POSES.push([s0, "idle"], [cue(6, 1) + 0.3, "pointLow"], [cue(6, 1) + 2.6, "idle"], [cue(6, 2) + 0.3, "point"], [cue(6, 2) + 2.6, "idle"],
      [cue(6, 3) + 0.3, "point"], [cue(6, 3) + 2.4, "idle"], [cue(6, 4) + 1.5, "present"], [cueE(6, 4), "idle"]);
  }

  // ---------------- Scene 7: colour temperature (215-240)
  {
    const g = scene[7], s0 = 215;
    heading(g, "কালার টেম্পারেচার", "COLOR TEMPERATURE (KELVIN)");
    const A = el("g", { transform: "translate(0 44)" }, g);
    const KMIN = 2800, KMAX = 7600, X0 = 760, X1 = 1820;
    const kx = (K) => X0 + ((K - KMIN) / (KMAX - KMIN)) * (X1 - X0);
    const kb = document.getElementById("kbar");
    for (let i = 0; i <= 8; i++) { const K = KMIN + ((KMAX - KMIN) * i) / 8; el("stop", { offset: i / 8, "stop-color": hex(kelvin(K)) }, kb); }
    el("rect", { x: X0, y: 196, width: X1 - X0, height: 30, rx: 15, fill: "url(#kbar)" }, A);
    [3200, 5600, 7000].forEach((K) => { el("line", { x1: kx(K), y1: 232, x2: kx(K), y2: 250, stroke: C.mute, "stroke-width": 3 }, A); txt(A, kx(K), 280, K + "K", { size: 26, weight: 700, anchor: "middle", fill: C.mute, family: "'Inter', sans-serif" }); });
    const knob = el("g", {}, A);
    el("circle", { r: 26, fill: C.cream, stroke: C.bg, "stroke-width": 5 }, knob);
    const kRead = txt(knob, 0, -42, "", { size: 30, weight: 800, anchor: "middle", family: "'Inter', sans-serif" });
    const face = makeFace(A, 1380, 330, 0.95);
    const tagB = el("g", { transform: "translate(780 480)" }, A); icon(tagB, "bulb", 40, 0, 1.4); txt(tagB, 100, 12, "বাল্ব: প্রায় 3200K · উষ্ণ", { size: 36, weight: 700 });
    const tagS = el("g", { transform: "translate(780 640)" }, A); icon(tagS, "sun", 40, 0, 1.1); txt(tagS, 100, 12, "দিনের আলো: প্রায় 5600K · ঠান্ডা", { size: 36, weight: 700 });
    pop(tagB, cue(7, 1) + 0.4); pop(tagS, cue(7, 2) + 0.4);
    const Kt = track([[s0, 3200], [s0 + 0.6, 3200], [cue(7, 0) + 1.2, 5600], [cueE(7, 0) + 0.3, 7000], [cue(7, 1) + 0.9, 3200], [cue(7, 2) + 0.2, 3200], [cue(7, 2) + 1.4, 5600], [cue(7, 2) + 2.6, 7000], [cue(7, 3) - 0.1, 5600]]);
    // phase B: wrong vs right
    const B = el("g", {}, g);
    const mkPanel = (x, ok, title) => {
      const c = card(B, x, 180, 560, 700);
      txt(c, 280, 56, title, { size: 32, weight: 700, anchor: "middle", fill: ok ? C.green : C.red });
      const f = makeFace(c, 110, 110, 0.85);
      badge(c, 500, 140, ok, 36);
      return { c, f };
    };
    const W = mkPanel(690, false, "ভুল: দুই রঙ মিশে গেছে"), R = mkPanel(1300, true, "সঠিক: সব লাইট এক Kelvin-এ");
    icon(W.c, "window", 60, 300, 1.1); icon(W.c, "bulb", 500, 300, 1.3);
    txt(W.c, 60, 360, "5600K", { size: 22, weight: 700, anchor: "middle", fill: C.blue, family: "'Inter', sans-serif" });
    txt(W.c, 500, 360, "3200K", { size: 22, weight: 700, anchor: "middle", fill: "#FF9A3C", family: "'Inter', sans-serif" });
    icon(R.c, "softbox", 60, 300, 0.9); icon(R.c, "softbox", 500, 300, 0.9);
    txt(W.c, 280, 600, "জানালার নীল + বাল্বের কমলা", { size: 30, weight: 600, anchor: "middle", fill: C.mute });
    txt(W.c, 280, 640, "মুখে দুই রঙ", { size: 30, weight: 600, anchor: "middle", fill: C.mute });
    txt(R.c, 280, 600, "সব লাইট এক টেম্পারেচারে", { size: 30, weight: 600, anchor: "middle", fill: C.mute });
    txt(R.c, 60, 360, "5600K", { size: 22, weight: 700, anchor: "middle", fill: C.cream, family: "'Inter', sans-serif" });
    txt(R.c, 500, 360, "5600K", { size: 22, weight: 700, anchor: "middle", fill: C.cream, family: "'Inter', sans-serif" });
    W.f.update({ amb: 0.05, key: { I: 1.0, az: -55, el: 18, soft: 0.55, K: 12000 }, fill: { I: 0.95, az: 55, el: 18, soft: 0.55, K: 2400, shadows: false }, wall: { b: 0.2 } });
    R.f.update({ amb: 0.05, key: { I: 1.0, az: -45, el: 20, soft: 0.6, K: 5600 }, fill: { I: 0.5, az: 45, el: 10, soft: 1, K: 5600, shadows: false }, wall: { b: 0.22 } });
    const wb = el("g", { transform: "translate(1580 820)" }, B);
    el("rect", { x: -200, y: -38, width: 400, height: 76, rx: 38, fill: C.bg, stroke: C.green, "stroke-width": 3 }, wb);
    icon(wb, "camera", -140, 0, 0.8); txt(wb, -90, 12, "WB = 5600K", { size: 34, weight: 800, family: "'Inter', sans-serif" });
    pop(wb, cue(7, 4) + 3.6);
    const pB = cue(7, 3) - 0.1;
    pops.push({ node: A, at: pB, o: { from: { autoAlpha: 1 }, to: { autoAlpha: 0 }, dur: 0.5 } });
    pops.push({ node: B, at: pB + 0.3, o: { from: { autoAlpha: 0 }, to: { autoAlpha: 1 }, dur: 0.6 } });
    U[7] = (t) => {
      const K = Kt(t);
      knob.setAttribute("transform", `translate(${kx(K)} 211)`);
      kRead.textContent = Math.round(K / 100) * 100 + "K"; kRead.setAttribute("fill", hex(kelvin(K)));
      face.update({ amb: 0.05, key: { I: 1.05, az: 32, el: 22, soft: 0.6, K }, fill: { I: 0.35, az: -45, el: 6, soft: 1, K, shadows: false }, wall: { b: 0.22, top: kelvin(K).map((v) => v * 0.6), bottom: kelvin(K).map((v) => v * 0.4) } });
    };
    POSES.push([s0, "idle"], [cue(7, 0) + 0.4, "point"], [cue(7, 0) + 2.6, "idle"], [cue(7, 1) + 0.3, "pointLow"], [cue(7, 2) + 2.6, "idle"],
      [cue(7, 3) + 0.3, "no"], [cue(7, 3) + 2.4, "idle"], [cue(7, 4) + 0.3, "present"], [cueE(7, 4), "idle"]);
  }

  // ---------------- Scene 8: outdoor (240-280)
  const S8 = {};
  {
    const g = scene[8], s0 = 240;
    const skyG = el("linearGradient", { id: "sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    const sk0 = el("stop", { offset: 0 }, skyG), sk1 = el("stop", { offset: 1 }, skyG);
    el("rect", { width: 1920, height: 1080, fill: "url(#sky)" }, g);
    const sunG = el("g", {}, g);
    const sunGlow = el("circle", { r: 150, fill: "#FFE7A8", filter: "url(#glowL)", opacity: 0.8 }, sunG);
    const sunDisc = el("circle", { r: 54, fill: "#FFF3C9" }, sunG);
    const hills = el("path", { d: "M0 760 Q300 680 620 740 T1240 720 T1920 735 L1920 1080 L0 1080 Z", fill: "#6E9A5E" }, g);
    const field = el("rect", { x: 0, y: 820, width: 1920, height: 260, fill: "#5C8A4C" }, g);
    const shade = el("ellipse", { cx: 1230, cy: 930, rx: 230, ry: 40, fill: "#1E3A1A", opacity: 0.45 }, g);
    const tree = el("g", { transform: "translate(1230 930)" }, g);
    el("path", { d: "M-18 0 L-12 -260 L12 -260 L18 0 Z", fill: "#5A3E2A" }, tree);
    const canopy = el("g", {}, tree);
    [[-90, -300, 110], [70, -320, 120], [-10, -390, 130], [-120, -380, 80], [120, -400, 80]].forEach(([x, y, r]) => el("circle", { cx: x, cy: y, r, fill: "#3F7A3A" }, canopy));
    // model (full figure)
    const model = el("g", {}, g);
    const mRim = el("path", { d: "M-52 -280 Q-56 -350 0 -356 Q56 -350 52 -280 L58 -170 L44 0 L-44 0 L-58 -170 Z", fill: "none", stroke: "#FFC870", "stroke-width": 8, filter: "url(#glowS)", opacity: 0 }, model);
    el("path", { d: "M-30 0 L-24 -150 L24 -150 L30 0 Z", fill: "#2D3B4E" }, model);
    el("path", { d: "M-50 -150 Q-56 -250 -20 -280 L20 -280 Q56 -250 50 -150 Z", fill: "#3E6A86" }, model);
    el("ellipse", { cx: 0, cy: -312, rx: 32, ry: 40, fill: "#E2AE88" }, model);
    el("path", { d: "M-36 -310 Q-36 -360 0 -360 Q36 -360 36 -310 L40 -268 Q24 -276 28 -312 Q0 -330 -28 -312 Q-24 -276 -40 -268 Z", fill: "#3A2418" }, model);
    // studio walls that slide away
    const walls = [0, 1].map((i) => { const w = el("g", {}, g); el("rect", { x: i * 960, y: 0, width: 960, height: 1080, fill: "#121215" }, w);
      for (let k = 0; k < 6; k++) el("line", { x1: i * 960 + 80 + k * 160, y1: 0, x2: i * 960 + 80 + k * 160, y2: 1080, stroke: "#17171B", "stroke-width": 6 }, w); return w; });
    // scrim + reflector (held by Rubel)
    const scrim = el("g", { opacity: 0 }, g);
    const scrimR = el("rect", { width: 300, height: 26, rx: 6, fill: "#FFFFFF", opacity: 0.78 }, scrim);
    const scrimPole = el("line", { stroke: "#3A3A44", "stroke-width": 6 }, scrim);
    const refl = el("g", { opacity: 0 }, g);
    const reflD = el("ellipse", { rx: 18, ry: 70, fill: "#F2D27A", stroke: "#FFF2C0", "stroke-width": 4 }, refl);
    const bounce = el("path", { fill: "none", stroke: "#FFE7A8", "stroke-width": 4, "stroke-dasharray": "10 10", opacity: 0 }, g);
    const face = makeFace(g, 1470, 110, 0.85, { stroke: "#FFFFFF" });
    const flab = txt(g, 1640, 560, "ক্যামেরায় যেমন দেখাবে", { size: 24, weight: 600, anchor: "middle", fill: "#FFFFFF" });
    const flabBg = el("rect", { x: 1500, y: 532, width: 280, height: 40, rx: 20, fill: "#0E0E10", opacity: 0.55 }, g); g.insertBefore(flabBg, flab);
    const BAD = [
      [cue(8, 1) + 1.0, cue(8, 2) + 0.2, false, "কড়া ছায়া"], [cue(8, 2) + 2.0, cue(8, 3) + 0.1, true, "গোল্ডেন আওয়ার"],
      [cue(8, 3) + 2.2, cue(8, 4) + 0.1, true, "ডিফিউজার"], [cue(8, 4) + 2.4, cue(8, 5) + 0.1, true, "ওপেন শেড"],
      [cue(8, 5) + 1.6, cue(8, 6) + 0.1, true, "রিফ্লেক্টর = ফিল"], [cue(8, 6) + 2.4, SC(8).end, true, "রিম লাইট"],
    ].map(([a, b, ok, l]) => { const bg = el("g", { opacity: 0 }, g); badge(bg, 1800, 140, ok, 34); const tg = el("g", { transform: "translate(1640 620)" }, bg);
      el("rect", { x: -150, y: -30, width: 300, height: 60, rx: 30, fill: ok ? C.green : C.red }, tg); txt(tg, 0, 11, l, { size: 30, weight: 700, anchor: "middle", fill: "#0E0E10" }, tg); return { bg, a, b }; });
    // sun path: x, y, elevation for the face, golden-ness
    const phase = (t) => t < cue(8, 1) ? 0 : t < cue(8, 2) ? 1 : t < cue(8, 3) ? 2 : t < cue(8, 4) ? 3 : t < cue(8, 5) ? 4 : t < cue(8, 6) ? 5 : 6;
    const sx = track([[s0, 1060], [cue(8, 1), 1000], [cue(8, 1) + 1.2, 960], [cue(8, 2) + 0.4, 960], [cue(8, 2) + 2.6, 610], [cue(8, 3) + 0.1, 610], [cue(8, 3) + 1.6, 960], [cue(8, 5), 960], [cue(8, 5) + 1.2, 560], [cue(8, 6) + 0.2, 560], [cue(8, 6) + 2.4, 1060]]);
    const sy = track([[s0, 330], [cue(8, 1), 300], [cue(8, 1) + 1.2, 120], [cue(8, 2) + 0.4, 120], [cue(8, 2) + 2.6, 640], [cue(8, 3) + 0.1, 640], [cue(8, 3) + 1.6, 120], [cue(8, 5), 120], [cue(8, 5) + 1.2, 360], [cue(8, 6) + 0.2, 360], [cue(8, 6) + 2.4, 650]]);
    const gold = track([[s0, 0], [cue(8, 2) + 0.4, 0], [cue(8, 2) + 2.6, 1], [cue(8, 3) + 0.1, 1], [cue(8, 3) + 1.6, 0], [cue(8, 6) + 0.2, 0], [cue(8, 6) + 2.4, 0.75]]);
    const mx = track([[s0, 900], [cue(8, 4) + 0.2, 900], [cue(8, 4) + 2.4, 1190], [cue(8, 5) + 0.1, 1190], [cue(8, 5) + 2.0, 900]]);
    const wallsK = (t) => EASE.io(clamp((t - s0 - 0.2) / 1.6));
    S8.scrimK = (t) => win(t, cue(8, 3) + 0.4, cue(8, 4) + 0.6, 0.6);
    S8.reflK = (t) => win(t, cue(8, 5) + 0.5, SC(8).end - 0.4, 0.6);
    U[8] = (t, hands) => {
      const wk = wallsK(t);
      walls[0].setAttribute("transform", `translate(${-1000 * wk} 0)`); walls[1].setAttribute("transform", `translate(${1000 * wk} 0)`);
      const gk = gold(t), X = sx(t), Y = sy(t);
      sk0.setAttribute("stop-color", hex(mixc([0.36, 0.64, 0.92], [0.96, 0.55, 0.3], gk))); sk1.setAttribute("stop-color", hex(mixc([0.82, 0.91, 1], [1, 0.84, 0.6], gk)));
      sunG.setAttribute("transform", `translate(${X} ${Y})`); sunDisc.setAttribute("fill", hex(mixc([1, 0.97, 0.85], [1, 0.72, 0.35], gk)));
      hills.setAttribute("fill", hex(mixc([0.43, 0.6, 0.37], [0.6, 0.5, 0.28], gk))); field.setAttribute("fill", hex(mixc([0.36, 0.54, 0.3], [0.55, 0.45, 0.24], gk)));
      const M = mx(t); model.setAttribute("transform", `translate(${M} 930)`);
      const back = ramp(t, cue(8, 6) + 0.4, 1.6);
      mRim.setAttribute("opacity", back);
      const ph = phase(t);
      const sc = S8.scrimK(t), rk = S8.reflK(t);
      // scrim held over the model, reflector in front
      if (hands) {
        const [hx, hy] = hands.front;
        scrim.setAttribute("opacity", sc); scrimR.setAttribute("x", hx - 10); scrimR.setAttribute("y", hy - 90);
        scrimPole.setAttribute("x1", hx); scrimPole.setAttribute("y1", hy); scrimPole.setAttribute("x2", hx + 10); scrimPole.setAttribute("y2", hy - 70);
        refl.setAttribute("opacity", rk); refl.setAttribute("transform", `translate(${hx + 26} ${hy - 10}) rotate(${-14})`);
        const fx = M - 20, fy = 620;
        bounce.setAttribute("d", `M${X} ${Y} L${hx + 26} ${hy - 10} L${fx} ${fy}`); bounce.setAttribute("opacity", rk * 0.9);
      }
      const inShade = ph === 4 ? ramp(t, cue(8, 4) + 1.6, 0.8) : 0;
      const elv = lerp(lerp(84, 10, gk), 40, ph === 5 ? ramp(t, cue(8, 5) + 0.2, 1) : 0);
      const key = { I: (1.15 - 0.35 * sc) * (1 - inShade) * (1 - back * 0.98), az: lerp(lerp(6, -48, gk), lerp(-50, 170, back), ph >= 5 ? 1 : 0), el: elv * (1 - sc * 0.15), soft: lerp(lerp(0.05, 0.5, gk), 0.95, sc), K: lerp(5600, 3300, gk) };
      const fill = { I: lerp(0.18, 0.7, inShade) + rk * (0.5 + back * 0.15), az: lerp(lerp(0, 0, inShade), 30, rk), el: 10, soft: 1, K: lerp(lerp(6200, 6800, inShade), 3800, rk * back), shadows: false };
      face.update({ amb: 0.12 + 0.1 * inShade, ambK: 7000, key, fill, rim: { I: back * 1.15, K: 3000 },
        wall: { b: 1, top: mixc([0.5, 0.72, 0.95], [0.98, 0.7, 0.45], gk).map((v) => v * (1 - 0.3 * inShade)), bottom: mixc([0.36, 0.55, 0.32], [0.55, 0.45, 0.25], gk) } });
      for (const b of BAD) b.bg.setAttribute("opacity", win(t, b.a, b.b, 0.3));
    };
    RUBEL_X.push([s0, 330], [cue(8, 3) + 0.1, 330], [cue(8, 3) + 1.6, 620, "io"], [cue(8, 4) + 0.2, 620], [cue(8, 4) + 1.6, 430, "io"], [cue(8, 5) + 0.2, 430], [cue(8, 5) + 1.6, 560, "io"],
      [SC(8).end - 0.3, 560], [SC(9).start + 1.4, 330, "io"]);
    POSES.push([s0 + 1.0, "point"], [cue(8, 1) + 2.6, "idle"], [cue(8, 2) + 0.3, "present"], [cue(8, 2) + 3.0, "idle"], [cue(8, 3) + 0.4, "hold"], [cue(8, 4) + 0.6, "idle"],
      [cue(8, 4) + 1.8, "pointLow"], [cue(8, 4) + 3.6, "idle"], [cue(8, 5) + 0.5, "reflect"], [SC(8).end - 0.3, "idle"]);
  }

  // ---------------- Scene 9: recap + credits (280-300)
  {
    const g = scene[9], s0 = 280;
    heading(g, "রিক্যাপ", "RECAP");
    const L = [makeLamp(g, "spot", { color: C.amber }), makeLamp(g, "spot", { color: "#FFE9CC" }), makeLamp(g, "spot", { color: C.blue })];
    const LX = [900, 1270, 1640];
    const ITEMS = [["ruler", "দূরত্ব বদলালে আলো বদলায়"], ["softbox", "বড় উৎস = নরম আলো"], ["three", "কী + ফিল + ব্যাক = স্টুডিও"], ["sun", "বাইরে: ডিফিউজার + রিফ্লেক্টর"]];
    const list = el("g", {}, g);
    ITEMS.forEach(([k, label], i) => {
      const y = 330 + i * 132;
      const r = el("g", {}, list);
      el("rect", { x: 720, y: y - 52, width: 1110, height: 104, rx: 22, fill: C.bg2, stroke: C.line, "stroke-width": 2 }, r);
      el("circle", { cx: 790, cy: y, r: 40, fill: "#101013" }, r); icon(r, k, 790, y, 0.75);
      txt(r, 860, y + 14, label, { size: 40, weight: 700 });
      el("rect", { x: 1736, y: y - 30, width: 60, height: 60, rx: 12, fill: "none", stroke: C.mute, "stroke-width": 3 }, r);
      const tick = el("path", { d: `M1748 ${y} L1762 ${y + 16} L1786 ${y - 16}`, fill: "none", stroke: C.green, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": 70, "stroke-dashoffset": 70 }, r);
      pop(r, cue(9, i) + 0.05, { from: { autoAlpha: 0, x: 60 }, to: { x: 0 } });
      pops.push({ node: tick, at: cue(9, i) + 0.9, o: { from: { strokeDashoffset: 70 }, to: { strokeDashoffset: 0 }, dur: 0.4, ease: "power2.out", wrap: false } });
    });
    const offs = [cue(9, 5) + 0.9, cue(9, 5) + 1.6, cue(9, 5) + 2.3];
    pops.push({ node: list, at: offs[0], o: { from: { autoAlpha: 1 }, to: { autoAlpha: 0 }, dur: 0.8 } });
    const cred = el("g", {}, gHud);
    const credPool = el("ellipse", { cx: 1270, cy: 560, rx: 520, ry: 260, fill: "url(#pool)" }, cred);
    txt(cred, 1270, 440, "ক্যামেরা লাইটিং মাস্টারক্লাস", { size: 42, weight: 700, anchor: "middle", fill: C.amber });
    txt(cred, 1270, 540, "ইনস্ট্রাক্টর: রুবেল মিয়া", { size: 60, weight: 700, anchor: "middle" });
    txt(cred, 1270, 626, "সম্পাদনা: পালওয়ান (Paloan)", { size: 48, weight: 600, anchor: "middle", fill: C.cream });
    pops.push({ node: cred, at: offs[2] + 0.2, o: { from: { autoAlpha: 0, y: 20 }, to: { autoAlpha: 1, y: 0 }, dur: 1.0 } });
    U[9] = (t) => {
      L.forEach((l, i) => { const P = powerAt([[s0 + 0.3 + i * 0.25, 1], [offs[i], 0]], t); l.update({ x: LX[i], y: 150, power: P.p, click: P.click, cone: { len: 620, w0: 90, w1: 420, oy: 12 } }); });
      credPool.setAttribute("opacity", 0.6 + 0.1 * Math.sin(t * 2));
    };
    POSES.push([s0 + 0.2, "present"], [cue(9, 3) + 2, "idle"], [cue(9, 4) + 0.3, "wave"], [cue(9, 4) + 2.2, "idle"]);
  }

  // ------------------------------------------------------------------ character motion
  const rubel = makeRubel(gChar);
  RUBEL_X.sort((a, b) => a[0] - b[0]);
  const rubelX = track(RUBEL_X);
  POSES.sort((a, b) => a[0] - b[0]);
  const POSE = {
    idle: (t) => ({ fs: 6 + Math.sin(t * 1.3) * 2, fe: -10, bs: -6 + Math.sin(t * 1.3 + 1) * 2, be: -8 }),
    point: () => ({ fs: -112, fe: -8, bs: -4, be: -10 }),
    pointLow: () => ({ fs: -78, fe: -14, bs: -4, be: -10 }),
    present: (t) => ({ fs: -64, fe: -36 + Math.sin(t * 2) * 4, bs: 16, be: -30 }),
    wave: (t) => ({ fs: -158, fe: -18 + Math.sin(t * 10) * 26, bs: -4, be: -10 }),
    grab: () => ({ fs: -14, fe: -24, bs: -34, be: -40 }),
    hold: () => ({ fs: -150, fe: -14, bs: -140, be: -20 }),
    reflect: () => ({ fs: -86, fe: -34, bs: -70, be: -40 }),
    no: (t) => ({ fs: -96, fe: -20 + Math.sin(t * 12) * 12, bs: -4, be: -10 }),
  };
  function poseAt(t) {
    let i = POSES.length - 1;
    while (i > 0 && POSES[i][0] > t) i--;
    const cur = POSE[POSES[i][1]](t);
    if (i === 0) return cur;
    const k = smooth((t - POSES[i][0]) / 0.4);
    if (k >= 1) return cur;
    const prev = POSE[POSES[i - 1][1]](t);
    const o = {}; for (const key in cur) o[key] = lerp(prev[key], cur[key], k);
    return o;
  }
  function charX(t) {
    for (const [a, b, f] of HOLD) {
      if (t >= a && t <= b) return f(t);
      if (t > b && t < b + 1.6) return lerp(f(b), 330, EASE.io((t - b) / 1.6));
    }
    return rubelX(t);
  }
  const activeLine = (t) => LINES.find((l) => t >= l.s && t < l.e);
  function charState(t) {
    const x = charX(t), v = (x - charX(t - 0.05)) / 0.05;
    const moving = clamp(Math.abs(v) / 50);
    const ph = x / 34;
    const line = activeLine(t);
    let mouth = 0;
    if (line) {
      const u = t - line.s;
      mouth = (0.2 + 0.8 * Math.abs(Math.sin(u * 13.3 + Math.sin(u * 3.7)))) * (Math.sin(u * 2.1 + 0.6) > -0.82 ? 1 : 0.1) * clamp(u / 0.1) * clamp((line.e - t) / 0.1);
    }
    const bp = (t + 0.7) % 3.6, blink = bp < 0.13 ? Math.sin((bp / 0.13) * Math.PI) : (t > 40 && (t + 2.1) % 9.7 < 0.13 ? Math.sin((((t + 2.1) % 9.7) / 0.13) * Math.PI) : 0);
    const P = poseAt(t);
    const end = ramp(t, cue(9, 5) - 0.2, 0.5);
    return { x, y: 930, s: 1, leg: Math.sin(ph) * 24 * moving, bob: -Math.abs(Math.cos(ph)) * 8 * moving, ...P, mouth, blink,
      look: lerp(2.5, 0, end), lookY: 0, smile: Math.max(end, line ? 0 : 0.35), tilt: Math.sin(t * 0.7) * 1.5 * (1 - moving), brow: line ? 0.3 * Math.abs(Math.sin(t * 1.1)) : 0 };
  }

  // ------------------------------------------------------------------ HUD + dark overlay + subtitles
  const brand = el("g", { transform: "translate(36 28)" }, gHud);
  el("rect", { width: 520, height: 50, rx: 25, fill: "#0E0E10", stroke: C.line, "stroke-width": 2, opacity: 0.9 }, brand);
  el("circle", { cx: 28, cy: 25, r: 8, fill: C.amber }, brand);
  txt(brand, 46, 34, "ক্যামেরা লাইটিং মাস্টারক্লাস", { size: 24, weight: 600 });
  const sChip = el("g", { transform: "translate(1884 28)" }, gHud);
  const sChipR = el("rect", { x: -300, width: 300, height: 50, rx: 25, fill: "#0E0E10", stroke: C.line, "stroke-width": 2, opacity: 0.9 }, sChip);
  const sChipT = txt(sChip, -150, 34, "", { size: 24, weight: 600, anchor: "middle" });
  const dark = el("rect", { width: 1920, height: 1080, fill: "#000" }, gFx);
  el("rect", { width: 1920, height: 1080, fill: "url(#vig)" }, gFx);
  const darkK = track([[0, 1], [0.9, 1], [1.05, 0.6, "lin"], [1.3, 0.85, "lin"], [1.45, 0.4, "lin"], [3.2, 0]]);
  const darkEnd = track([[cue(9, 5) + 0.8, 0], [cue(9, 5) + 2.6, 0.62], [TOTAL, 0.62]]);
  const subEl = document.getElementById("sub"), subSpan = subEl.firstElementChild;
  let lastSub = null;

  // ------------------------------------------------------------------ render
  let lastScene = 0;
  function render() {
    const t = clock.t;
    const sc = SCENES.find((s) => t >= s.start && t < s.end) || SCENES[SCENES.length - 1];
    const cs = charState(t);
    const hands = rubel.update(cs);
    for (const s of SCENES) if (t > s.start - 0.8 && t < s.end + 0.8) U[s.n](t, hands);
    dark.setAttribute("opacity", Math.max(darkK(t), darkEnd(t)));
    if (sc.n !== lastScene) { sChipT.textContent = `সিন ${bnNum(sc.n)}/৯ · ${sc.title.split(":")[0]}`; lastScene = sc.n; onScene(sc); }
    const line = activeLine(t);
    if (line !== lastSub) { subSpan.textContent = line ? line.text : ""; subEl.style.opacity = line ? 1 : 0; lastSub = line; }
    onTime(t);
  }

  // ------------------------------------------------------------------ timeline
  const clock = { t: 0 };
  const tl = gsap.timeline({ paused: true, onUpdate: render });
  tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none" }, 0);
  for (const s of SCENES) {
    tl.fromTo(scene[s.n], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.out", immediateRender: false }, Math.max(0, s.start - (s.n === 1 ? 0 : 0.25)));
    if (s.end < TOTAL) tl.fromTo(scene[s.n], { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, ease: "power1.in", immediateRender: false }, s.end - 0.25);
  }
  for (const p of pops) {
    if (p.o.wrap !== false) { const w = el("g", {}); p.node.parentNode.insertBefore(w, p.node); w.appendChild(p.node); p.node = w; }
    const from = p.o.from || { autoAlpha: 0, y: 18 };
    const to = Object.assign({}, p.o.to || { autoAlpha: 1, y: 0 });
    if (!p.o.to && from.y === undefined) delete to.y;
    if (to.autoAlpha === undefined && from.autoAlpha !== undefined) to.autoAlpha = 1;
    gsap.set(p.node, from);
    tl.fromTo(p.node, from, Object.assign(to, { duration: p.o.dur || 0.55, ease: p.o.ease || "back.out(1.6)", immediateRender: false }), Math.min(TOTAL - (p.o.dur || 0.55), p.at));
  }
  if (Math.abs(tl.duration() - TOTAL) > 1e-6) console.warn("timeline duration", tl.duration());

  // ------------------------------------------------------------------ player UI
  const playBtn = document.getElementById("play"), scrub = document.getElementById("scrub"), timeEl = document.getElementById("time"), sceneEl = document.getElementById("scene");
  const chips = document.getElementById("chips");
  SCENES.forEach((s) => { const b = document.createElement("button"); b.textContent = bnNum(s.n); b.title = s.title; b.onclick = () => seek(s.start + 0.01); b.dataset.n = s.n; chips.appendChild(b); });
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4 L20 12 L7 20 Z" fill="currentColor"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor"/></svg>';
  playBtn.innerHTML = ICON_PLAY;
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  function onTime(t) { timeEl.textContent = `${fmt(t)} / ${fmt(TOTAL)}`; if (!scrubbing) scrub.value = t; }
  function onScene(s) {
    sceneEl.textContent = `সিন ${bnNum(s.n)}/৯ · ${s.title}`;
    for (const b of chips.children) b.classList.toggle("on", +b.dataset.n === s.n);
  }
  let scrubbing = false;
  function seek(t) { tl.seek(clamp(t, 0, TOTAL), false); render(); }
  function setPlaying(on) { if (on) { if (tl.progress() >= 1) tl.seek(0); tl.play(); } else tl.pause(); playBtn.innerHTML = on ? ICON_PAUSE : ICON_PLAY; playBtn.setAttribute("aria-label", on ? "Pause" : "Play"); }
  tl.eventCallback("onComplete", () => setPlaying(false));
  playBtn.onclick = () => setPlaying(tl.paused() || tl.progress() >= 1);
  scrub.oninput = () => { scrubbing = true; seek(+scrub.value); };
  scrub.onchange = () => { scrubbing = false; };
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); playBtn.click(); }
    if (e.code === "ArrowRight") seek(clock.t + 5);
    if (e.code === "ArrowLeft") seek(clock.t - 5);
  });
  function fit() {
    const stage = document.getElementById("stage"), wrap = document.getElementById("frame");
    const k = Math.min(window.innerWidth / 1920, (window.innerHeight - (document.body.classList.contains("capture") ? 0 : 96)) / 1080);
    stage.style.transform = `scale(${k})`; wrap.style.width = 1920 * k + "px"; wrap.style.height = 1080 * k + "px";
  }
  window.addEventListener("resize", fit);
  const q = new URLSearchParams(location.search);
  if (q.has("capture")) document.body.classList.add("capture");
  fit();
  // hooks for frame-accurate capture / voiceover alignment
  window.__seek = (t) => { seek(t); };
  window.__duration = TOTAL;
  window.__ready = document.fonts.ready.then(() => { seek(q.has("t") ? +q.get("t") : 0); if (q.get("autoplay") === "1") setPlaying(true); });
})();
