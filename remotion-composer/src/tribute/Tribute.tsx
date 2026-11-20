// "ফিরে এসে কাকে ডাকি?" — documentary-style music video (1920x1080).
// Look follows the client's vintage documentary reference: dark grunge paper with faint handwriting,
// sepia photographs in acetate frames with tape, slow layered parallax, gold titles, film grain,
// scratches and light leaks. Every shot is keyed to a lyric line in lyrics.json.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import LYR from "./lyrics.json";
import PH from "./photos.json";

export const TB_FPS = 30, TB_W = 1920, TB_H = 1080;
export const TB_FRAMES = Math.ceil(LYR.total * TB_FPS);
const W = TB_W, H = TB_H;
const LN = LYR.lines;
const BN = "Anek, sans-serif";
const GOLD = "linear-gradient(180deg, #fff1c4 0%, #e9c46a 38%, #b8862f 62%, #f4d98d 100%)";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic);
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const aspect = (p: number) => { const d = (PH as Record<string, number[]>)[String(p)]; return d ? d[0] / d[1] : 1.4; };
const src = (p: number) => staticFile(`tribute/p${String(p).padStart(2, "0")}.jpg`);
const OLD = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 49]);

// ---- shot list ------------------------------------------------------------------------------
type Kind = "open" | "hero" | "stack" | "full" | "card" | "title" | "bars" | "clip" | "plane" | "london" | "calendar" | "sky" | "collage" | "triptych" | "end";
type Shot = { at: number; off?: number; kind: Kind; p?: number[]; big?: string; small?: string; dir?: 1 | -1; from?: number; to?: number; words?: string[] };
const A = (i: number, kind: Kind, o: Partial<Shot> = {}): Shot => ({ at: i, kind, ...o });
const SHOTS: Shot[] = [
  { at: -1, kind: "open", big: "ফিরে এসে কাকে ডাকি?", small: "এক জীবনের ইতিহাস" },
  A(0, "hero", { p: [4], small: "২০ নভেম্বর" }),
  A(1, "stack", { p: [13, 3] }),
  A(2, "hero", { p: [1] }),
  A(3, "stack", { p: [9, 2] }),
  A(3, "stack", { off: 8.6, p: [10, 5] }),
  A(4, "hero", { p: [5], big: "শৈশব", small: "বাবার হাসি, মায়ের গান" }),
  A(5, "stack", { p: [6, 8] }),
  A(6, "card", { big: "১৯৮১", small: "বদলে গেল সব", p: [7] }),
  A(6, "hero", { off: 3.2, p: [7] }),
  A(7, "hero", { p: [10] }),
  A(8, "stack", { p: [9, 0] }),
  A(9, "hero", { p: [2] }),
  A(10, "hero", { p: [11] }),
  A(11, "hero", { p: [13] }),
  A(12, "stack", { p: [3, 4, 1] }),
  A(13, "hero", { p: [5] }),
  A(14, "hero", { p: [0] }),
  A(15, "stack", { p: [6, 8] }),
  A(16, "title", { big: "ফিরে এসে কাকে ডাকি?", p: [7] }),
  A(17, "hero", { p: [11] }),
  A(18, "card", { big: "মার্চ ২০০৭", small: "কঠিন কাল" }),
  A(19, "bars", { big: "গ্রেপ্তার আর বন্দিজীবন" }),
  A(20, "clip", { words: ["কত অভিযোগ", "কত মামলা", "কত প্রশ্নের ভিড়"] }),
  A(21, "sky", { big: "ছাড়তে হলো নীড়", dir: -1 }),
  A(22, "plane", { big: "২০০৮", small: "দূর বিদেশে", dir: 1 }),
  A(23, "sky", { big: "দেশের আকাশ", dir: 1 }),
  A(24, "calendar", { big: "১৭ বছর", from: 2008, to: 2016 }),
  A(25, "calendar", { from: 2016, to: 2020 }),
  A(26, "london", { big: "লন্ডন", small: "শীতের রাত, জানালাতে বৃষ্টি" }),
  A(27, "london", {}),
  A(28, "hero", { p: [21] }),
  A(29, "calendar", { from: 2020, to: 2025 }),
  A(29, "london", { off: 5.2 }),
  A(29, "card", { off: 15.5, big: "অপেক্ষা", small: "দূর থেকে দেশের দিকে", p: [15] }),
  A(30, "card", { big: "জানুয়ারি ২০১৫", small: "এলো শোকের খবর" }),
  A(31, "hero", { p: [9], big: "কোকো", small: "ছোট ভাই" }),
  A(32, "hero", { p: [2] }),
  A(33, "hero", { p: [0] }),
  A(34, "stack", { p: [3, 9, 6] }),
  A(35, "hero", { p: [2] }),
  A(36, "title", { big: "ফিরে এসে কাকে ডাকি?", p: [11] }),
  A(37, "hero", { p: [8] }),
  A(38, "plane", { big: "২৫ ডিসেম্বর ২০২৫", small: "ঘরে ফেরা", dir: -1 }),
  A(39, "full", { p: [22] }),
  A(40, "full", { p: [25] }),
  A(40, "full", { off: 1.7, p: [26] }),
  A(41, "stack", { p: [12, 28] }),
  A(42, "full", { p: [27] }),
  A(43, "card", { big: "৩০ ডিসেম্বর", small: "মা চলে গেলেন", p: [20] }),
  A(44, "hero", { p: [23] }),
  A(45, "hero", { p: [14] }),
  A(46, "hero", { p: [3] }),
  A(47, "hero", { p: [4] }),
  { at: 47, off: 7.0, kind: "collage", big: "স্মৃতি অমলিন", p: [5, 7, 13, 1, 9, 3, 6, 2, 0, 10, 4, 8] },
  A(48, "card", { big: "১৭ ফেব্রুয়ারি", small: "নতুন অধ্যায়", p: [19] }),
  A(49, "hero", { p: [19] }),
  A(50, "stack", { p: [30, 33] }),
  A(51, "stack", { p: [37, 39] }),
  A(52, "stack", { p: [31, 29] }),
  A(53, "stack", { p: [34, 35, 41] }),
  A(53, "full", { off: 8.6, p: [24] }),
  A(54, "full", { p: [38] }),
  A(55, "stack", { p: [36, 42] }),
  A(56, "title", { big: "ফিরে এসে কাকে ডাকি?", p: [28] }),
  A(57, "hero", { p: [32] }),
  A(58, "hero", { p: [15], big: "শুভ জন্মদিন" }),
  A(59, "hero", { p: [21] }),
  { at: 59, off: 4.2, kind: "collage", big: "প্রার্থনা", p: [12, 22, 30, 33, 19, 38, 41, 25] },
  A(60, "card", { big: "২০ নভেম্বর", small: "আরেক সকাল", p: [4] }),
  A(61, "hero", { p: [19] }),
  A(62, "triptych", { p: [7, 3, 9] }),
  A(63, "hero", { p: [5] }),
  A(64, "end", { big: "শুভ জন্মদিন", small: "তারেক রহমান" }),
];
const startOf = (s: Shot) => (s.at < 0 ? 0 : Math.max(0, LN[s.at].s - 0.45 + (s.off ?? 0)));
const STARTS = SHOTS.map(startOf);
const FADE = 0.7;

// ---- pieces -------------------------------------------------------------------------------------
const grade = (p: number) => OLD.has(p) ? "sepia(.55) saturate(.75) contrast(1.08) brightness(.92)" : "sepia(.32) saturate(.8) contrast(1.06) brightness(.95)";

const Frame: React.FC<{ p: number; cx: number; cy: number; w: number; rot: number; k: number; from?: [number, number]; tape?: boolean }> = ({ p, cx, cy, w, rot, k, from = [0, 0], tape = true }) => {
  const h = w / aspect(p); const e = out(Math.min(1, Math.max(0, k)));
  const x = cx + from[0] * (1 - e), y = cy + from[1] * (1 - e);
  return (
    <div style={{ position: "absolute", left: x - w / 2 - 22, top: y - h / 2 - 22, width: w + 44, height: h + 44, transform: `rotate(${rot + (1 - e) * rot * 2}deg)`, opacity: e,
      background: "rgba(235,225,205,.08)", border: "1px solid rgba(255,240,210,.22)", boxShadow: "0 30px 60px rgba(0,0,0,.6), inset 0 0 30px rgba(255,240,210,.06)", backdropFilter: undefined }}>
      <div style={{ position: "absolute", left: 14, top: 14, right: 14, bottom: 14, background: "#efe6d2", padding: 8 }}>
        <Img src={src(p)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: grade(p) }} />
        <div style={{ position: "absolute", inset: 8, background: "radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,25,10,.45) 100%)" }} />
      </div>
      {tape && <>
        <div style={{ position: "absolute", left: -18, top: 6, width: 130, height: 38, background: "rgba(232,222,196,.55)", transform: "rotate(-32deg)", boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
        <div style={{ position: "absolute", right: -18, bottom: 8, width: 130, height: 38, background: "rgba(232,222,196,.5)", transform: "rotate(-30deg)", boxShadow: "0 2px 4px rgba(0,0,0,.2)" }} />
      </>}
    </div>
  );
};
const BlurBg: React.FC<{ p: number; o?: number; lt: number }> = ({ p, o = 0.35, lt }) => (
  <Img src={src(p)} style={{ position: "absolute", left: -80, top: -80, width: W + 160, height: H + 160, objectFit: "cover", filter: `${grade(p)} blur(18px) brightness(.55)`, opacity: o, transform: `scale(${1.05 + lt * 0.006})` }} />
);
const GoldText: React.FC<{ text: string; size: number; style?: React.CSSProperties }> = ({ text, size, style }) => (
  <div style={{ fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1.12, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
    filter: "drop-shadow(0 4px 6px rgba(0,0,0,.7))", whiteSpace: "pre-line", ...style }}>{text}</div>
);
const Caption: React.FC<{ big?: string; small?: string; lt: number; x?: number; y?: number; align?: "left" | "center" }> = ({ big, small, lt, x = 140, y = 760, align = "left" }) => {
  const o = iv(lt, 0.6, 1.4), dx = (1 - iv(lt, 0.6, 1.6, 0, 1, out)) * -40;
  if (!big && !small) return null;
  return (
    <div style={{ position: "absolute", left: align === "left" ? x : 0, right: align === "center" ? 0 : undefined, top: y, opacity: o, transform: `translateX(${dx}px)`, textAlign: align }}>
      {big && <GoldText text={big} size={92} />}
      {!big && small && <GoldText text={small} size={66} />}
      {big && small && <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: "#efe3c8", textShadow: "0 2px 8px rgba(0,0,0,.8)", marginTop: 4 }}>{small}</div>}
    </div>
  );
};

// ---- shot renderers -----------------------------------------------------------------------------
const ShotView: React.FC<{ s: Shot; lt: number; dur: number; idx: number }> = ({ s, lt, dur, idx }) => {
  const side = idx % 2 ? 1 : -1;
  const p = s.p ?? [];
  const push = 1 + 0.05 * (lt / Math.max(4, dur));
  const drift = (d: number) => `translate(${side * d * lt * 6}px, ${-d * lt * 2}px)`;
  switch (s.kind) {
    case "open": return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: iv(lt, 0.5, 2.5) }}>
          <GoldText text={s.big ?? ""} size={130} style={{ transform: `scale(${1 + lt * 0.006})` }} />
          <div style={{ marginTop: 18, fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#e8dcc0", letterSpacing: 4, opacity: iv(lt, 1.8, 3.2) }}>{s.small}</div>
          <div style={{ margin: "26px auto 0", width: iv(lt, 1.5, 3.5, 0, 520), height: 2, background: "linear-gradient(90deg, transparent, #d9b25e, transparent)" }} />
        </div>
      </AbsoluteFill>);
    case "hero": {
      const ar = aspect(p[0]); const w = Math.min(1180, 720 * ar);
      return (<AbsoluteFill>
        <BlurBg p={p[0]} lt={lt} />
        <div style={{ position: "absolute", inset: 0, transform: `scale(${push}) ${drift(1)}` }}>
          <Frame p={p[0]} cx={W / 2 + side * 120} cy={s.big || s.small ? 540 : 500} w={s.big || s.small ? w * 0.86 : w} rot={side * -2.2} k={iv(lt, 0, 1.0)} from={[side * -160, 40]} />
        </div>
        <Caption big={s.big} small={s.small} lt={lt} x={110} y={40} />
      </AbsoluteFill>);
    }
    case "stack": {
      const pos = p.length === 2 ? [[650, 470, 800, -4], [1290, 560, 720, 3.5]] : [[560, 430, 700, -5], [1360, 470, 640, 4], [960, 640, 620, -1.5]];
      return (<AbsoluteFill>
        <BlurBg p={p[0]} lt={lt} o={0.25} />
        <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
          {p.map((q, i) => { const [cx, cy, w0, r] = pos[i]; const w = Math.min(w0, 560 * aspect(q));
            return <div key={i} style={{ position: "absolute", inset: 0, transform: drift(0.6 + i * 0.5) }}><Frame p={q} cx={cx} cy={cy} w={w} rot={r} k={iv(lt, 0.2 + i * 0.55, 1.1 + i * 0.55)} from={[(i % 2 ? 1 : -1) * 260, 60]} /></div>; })}
        </div>
      </AbsoluteFill>);
    }
    case "full": return (
      <AbsoluteFill>
        <Img src={src(p[0])} style={{ position: "absolute", left: -60, top: -40, width: W + 120, height: H + 80, objectFit: "cover", filter: grade(p[0]), transform: `scale(${1.02 + 0.08 * lt / Math.max(4, dur)}) translateX(${side * lt * 5}px)` }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 90% at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,6,2,.75) 100%)" }} />
      </AbsoluteFill>);
    case "card": return (
      <AbsoluteFill>
        {p[0] !== undefined && <BlurBg p={p[0]} lt={lt} o={0.4} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
          <div style={{ margin: "0 auto 26px", width: iv(lt, 0.2, 1.4, 0, 640), height: 2, background: "linear-gradient(90deg, transparent, #d9b25e, transparent)" }} />
          <div style={{ opacity: iv(lt, 0.3, 1.2), transform: `scale(${1.08 - 0.08 * iv(lt, 0.3, 1.6, 0, 1, out)})` }}><GoldText text={s.big ?? ""} size={160} /></div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 50, color: "#efe3c8", marginTop: 10, opacity: iv(lt, 1.0, 1.8), letterSpacing: 2 }}>{s.small}</div>
          <div style={{ margin: "26px auto 0", width: iv(lt, 0.2, 1.4, 0, 640), height: 2, background: "linear-gradient(90deg, transparent, #d9b25e, transparent)" }} />
        </div>
      </AbsoluteFill>);
    case "title": return (
      <AbsoluteFill>
        {p[0] !== undefined && <BlurBg p={p[0]} lt={lt} o={0.45} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", opacity: iv(lt, 0.2, 1.0) }}>
          <div style={{ position: "relative", display: "inline-block", overflow: "hidden" }}>
            <GoldText text={s.big ?? ""} size={128} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${iv(lt, 0.8, 2.6, -30, 130)}%`, width: "16%", background: "linear-gradient(90deg, transparent, rgba(255,250,230,.5), transparent)", transform: "skewX(-20deg)", mixBlendMode: "screen" }} />
          </div>
        </div>
      </AbsoluteFill>);
    case "bars": return (
      <AbsoluteFill>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 70% at 50% 40%, rgba(255,214,150,.25), rgba(0,0,0,0) 70%)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 11 }, (_, i) => <rect key={i} x={140 + i * 165 + Math.sin(lt * 0.3) * 6} y={-40} width={34} height={H + 80} fill="#0b0705" opacity={0.85} />)}
          <rect x={0} y={250} width={W} height={26} fill="#0b0705" opacity={0.8} /><rect x={0} y={840} width={W} height={26} fill="#0b0705" opacity={0.8} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", opacity: iv(lt, 0.4, 1.4) }}><GoldText text={s.big ?? ""} size={96} /></div>
      </AbsoluteFill>);
    case "clip": return (
      <AbsoluteFill>
        {(s.words ?? []).map((wd, i) => { const k = iv(lt, 0.3 + i * 1.1, 0.9 + i * 1.1, 0, 1, out);
          return <div key={i} style={{ position: "absolute", left: 260 + i * 420, top: 260 + (i % 2) * 260, width: 560, padding: "28px 34px", background: "#e9dfc8", color: "#2a1d12", fontFamily: BN, fontWeight: 800, fontSize: 64,
            boxShadow: "0 20px 40px rgba(0,0,0,.6)", transform: `rotate(${(i - 1) * 4}deg) scale(${0.8 + 0.2 * k})`, opacity: k, filter: "sepia(.4)", borderTop: "6px double #2a1d12" }}>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 6, borderBottom: "2px solid #2a1d12", marginBottom: 10, paddingBottom: 6 }}>সংবাদ</div>{wd}
            <div style={{ marginTop: 12, height: 10, background: "repeating-linear-gradient(90deg, #8a7a62 0 60px, transparent 60px 74px)", opacity: 0.6 }} />
            <div style={{ marginTop: 10, height: 10, background: "repeating-linear-gradient(90deg, #8a7a62 0 90px, transparent 90px 104px)", opacity: 0.6 }} />
          </div>; })}
      </AbsoluteFill>);
    case "sky": {
      const dawn = s.dir === 1;
      return (<AbsoluteFill>
        <div style={{ position: "absolute", inset: 0, background: dawn ? "linear-gradient(180deg, #2a3550 0%, #8a6a58 55%, #e3a86a 85%, #f3cf8a 100%)" : "linear-gradient(180deg, #121722 0%, #3a3440 55%, #6a4a3a 100%)", opacity: 0.85, filter: "sepia(.35)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {[[300, 300, 1.2], [1200, 220, 1.6], [800, 420, 1]].map(([x, y, sc], i) => <g key={i} transform={`translate(${x + lt * (8 + i * 4)} ${y}) scale(${sc})`} opacity={0.22} filter="url(#cb)">
            {[[-90, 0, 60], [-20, -30, 80], [60, -10, 70], [120, 10, 50]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill="#f1e2c8" />)}</g>)}
          <defs><filter id="cb"><feGaussianBlur stdDeviation="14" /></filter></defs>
          <path d={`M0 ${H} L0 920 ${Array.from({ length: 30 }, (_, i) => `Q ${i * 66 + 33} ${860 - rnd(i) * 70} ${i * 66 + 66} ${915 - rnd(i + 9) * 20}`).join(" ")} L ${W} ${H} Z`} fill="#0b0805" opacity={0.92} />
          {Array.from({ length: 6 }, (_, i) => { const hh = 140 + rnd(i) * 70, lean = (rnd(i + 3) - 0.5) * 30;
            return <g key={"palm" + i} transform={`translate(${150 + i * 330 + rnd(i) * 80} 905)`}>
              <path d={`M 0 0 Q ${lean * 0.3} ${-hh / 2} ${lean} ${-hh}`} stroke="#0b0805" strokeWidth={9} fill="none" />
              {[[-1, 1.0], [-1, 0.55], [-1, 0.15], [1, 0.15], [1, 0.55], [1, 1.0]].map(([sd, droop], k) => <path key={k} d={`M ${lean} ${-hh} q ${sd * 40} ${-26 + droop * 10} ${sd * 85} ${-6 + droop * 40}`} stroke="#0b0805" strokeWidth={11 - k % 3 * 2} strokeLinecap="round" fill="none" />)}
            </g>; })}
          {!dawn && <g transform={`translate(${300 + lt * 120} ${560 - lt * 40}) rotate(-12)`} opacity={iv(lt, 0.5, 1.2)}><path d="M -60 0 L 60 0 L 80 -6 L 60 -10 L -40 -10 Z M -10 -10 L 20 -40 L 30 -40 L 20 -10 Z M -50 -8 L -62 -26 L -54 -26 L -40 -10 Z" fill="#e6d3ad" /></g>}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: iv(lt, 0.6, 1.6) }}><GoldText text={s.big ?? ""} size={110} /></div>
      </AbsoluteFill>);
    }
    case "plane": {
      const k = iv(lt, 0.8, Math.max(2.5, dur - 0.8), 0, 1, Easing.inOut(Easing.sin));
      const [a, b] = s.dir === 1 ? [[1500, 760], [420, 480]] : [[420, 480], [1500, 760]];
      const cx = (a[0] + b[0]) / 2, cy = Math.min(a[1], b[1]) - 260;
      const pt = (u: number) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * cx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * cy + u * u * b[1]];
      const [px, py] = pt(k), [nx, ny] = pt(Math.min(1, k + 0.01));
      return (<AbsoluteFill>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 13 }, (_, i) => <line key={"m" + i} x1={i * 160} y1={0} x2={i * 160} y2={H} stroke="#d9c49a" strokeWidth={1} opacity={0.08} />)}
          {Array.from({ length: 8 }, (_, i) => <line key={"p" + i} x1={0} y1={i * 150} x2={W} y2={i * 150} stroke="#d9c49a" strokeWidth={1} opacity={0.08} />)}
          <path d={`M ${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`} fill="none" stroke="#d9b25e" strokeWidth={4} strokeDasharray="14 12" pathLength={1} opacity={0.9} style={{ strokeDashoffset: 0 }} />
          {[[1500, 760, "ঢাকা"], [420, 480, "লন্ডন"]].map(([x, y, l], i) => <g key={i}><circle cx={x as number} cy={y as number} r={16} fill="#d9b25e" /><circle cx={x as number} cy={y as number} r={16 + (lt * 20) % 30} fill="none" stroke="#d9b25e" opacity={0.5} />
            <text x={x as number} y={(y as number) + 64} textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize={48} fill="#efe3c8">{l}</text></g>)}
          <g transform={`translate(${px} ${py}) rotate(${Math.atan2(ny - py, nx - px) * 57.3})`}><path d="M -40 0 L 40 0 L 54 -5 L 40 -9 L -26 -9 Z M -6 -9 L 16 -36 L 26 -36 L 18 -9 Z M -6 0 L 16 27 L 26 27 L 18 0 Z M -34 -8 L -44 -24 L -36 -24 L -24 -9 Z" fill="#f3e6c8" /></g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", opacity: iv(lt, 0.4, 1.2) }}><GoldText text={s.big ?? ""} size={104} /><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 42, color: "#efe3c8" }}>{s.small}</div></div>
      </AbsoluteFill>);
    }
    case "london": return (
      <AbsoluteFill>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #151a24 0%, #2a2a33 60%, #3a2c22 100%)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1 + lt * 0.006})` }}>
          <g fill="#0a0806" opacity={0.95}>
            <rect x={80} y={620} width={160} height={460} /><rect x={260} y={700} width={220} height={380} /><rect x={1500} y={640} width={200} height={440} /><rect x={1720} y={720} width={200} height={360} />
            <rect x={600} y={330} width={70} height={750} /><path d="M 590 330 L 635 220 L 680 330 Z" /><rect x={612} y={380} width={46} height={46} fill="#e7c98a" opacity={0.7} />
            <rect x={680} y={760} width={720} height={320} /><path d={`M 680 760 ${Array.from({ length: 12 }, (_, i) => `L ${710 + i * 60} 720 L ${740 + i * 60} 760`).join(" ")}`} />
            <circle cx={1300} cy={600} r={170} fill="none" stroke="#0a0806" strokeWidth={10} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1300} y1={600} x2={1300 + Math.cos(i * 0.52 + lt * 0.05) * 170} y2={600 + Math.sin(i * 0.52 + lt * 0.05) * 170} stroke="#0a0806" strokeWidth={4} />)}
          </g>
          {Array.from({ length: 40 }, (_, i) => <rect key={i} x={100 + (i * 47) % 1800} y={720 + (i * 31) % 300} width={12} height={16} fill="#e7c98a" opacity={0.25 + 0.4 * rnd(i)} />)}
        </svg>
        {/* rain on the window */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 90 }, (_, i) => { const x = rnd(i) * W, sp = 120 + rnd(i + 3) * 260, y = ((rnd(i + 7) * H + lt * sp) % (H + 60)) - 30;
            return <line key={i} x1={x} y1={y} x2={x - 2} y2={y + 14 + rnd(i) * 22} stroke="#cfd8e6" strokeWidth={2} opacity={0.35} />; })}
          {Array.from({ length: 30 }, (_, i) => <circle key={"d" + i} cx={rnd(i + 50) * W} cy={rnd(i + 80) * H} r={3 + rnd(i) * 6} fill="#cfd8e6" opacity={0.18} />)}
          <rect x={0} y={0} width={W} height={H} fill="none" stroke="#1a120c" strokeWidth={70} /><rect x={W / 2 - 16} y={0} width={32} height={H} fill="#1a120c" /><rect x={0} y={H / 2 - 12} width={W} height={24} fill="#1a120c" opacity={0.9} />
        </svg>
        <Caption big={s.big} small={s.small} lt={lt} x={140} y={120} />
      </AbsoluteFill>);
    case "calendar": {
      const from = s.from ?? 2008, to = s.to ?? 2025, k = iv(lt, 0.4, Math.max(1.5, dur - 0.6), 0, 1, Easing.inOut(Easing.quad));
      const v = from + (to - from) * k, y = Math.min(to, Math.floor(v)), frac = y >= to ? 0 : v - y;
      const bn = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
      const bnY = bn(Math.min(to, y + (frac > 0 ? 1 : 0)));
      return (<AbsoluteFill>
        <div style={{ position: "absolute", left: W / 2 - 300, top: 220, width: 600, height: 560, background: "#e8dcc2", boxShadow: "0 30px 60px rgba(0,0,0,.6)", filter: "sepia(.3)" }}>
          <div style={{ height: 120, background: "#7a2b1e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BN, fontWeight: 800, fontSize: 56, color: "#f3e6c8" }}>ক্যালেন্ডার</div>
          <div style={{ textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 210, color: "#2a1d12", marginTop: 40 }}>{bnY}</div>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ position: "absolute", left: 30 + i * 40, top: -18, width: 14, height: 40, borderRadius: 7, background: "#3a2a1c" }} />)}
        </div>
        {/* the page being torn off */}
        {frac > 0 && <div style={{ position: "absolute", left: W / 2 - 300, top: 340, width: 600, height: 440, background: "#e8dcc2", transformOrigin: "50% 0%", transform: `perspective(1200px) rotateX(${frac * 110}deg)`, backfaceVisibility: "hidden", opacity: frac > 0.8 ? 0 : 1 - frac * 0.6, boxShadow: "0 10px 20px rgba(0,0,0,.3)", filter: "sepia(.3)",
          textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 210, color: "#2a1d12", paddingTop: 40 }}>{bn(y)}</div>}
        {s.big && <Caption big={s.big} lt={lt} x={140} y={160} />}
      </AbsoluteFill>);
    }
    case "collage": {
      const n = p.length;
      return (<AbsoluteFill>
        <div style={{ position: "absolute", left: 0, top: 0, width: 3000, height: H, transform: `translateX(${-lt * 70}px)` }}>
          {p.map((q, i) => <Frame key={i} p={q} cx={300 + i * 330 + (i % 2) * 40} cy={i % 2 ? 640 : 400} w={Math.min(520, 380 * aspect(q))} rot={(rnd(i) - 0.5) * 12} k={iv(lt, i * 0.25, i * 0.25 + 0.8)} from={[0, 120]} />)}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,6,3,.7), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(10,6,3,.7))" }} />
        <Caption big={s.big} lt={lt} align="center" y={860} />
        {n === 0 && null}
      </AbsoluteFill>);
    }
    case "triptych": return (
      <AbsoluteFill>
        {p.map((q, i) => <div key={i} style={{ position: "absolute", inset: 0, transform: drift(0.4 + i * 0.3) }}>
          <Frame p={q} cx={420 + i * 540} cy={480} w={Math.min(500, 420 * aspect(q))} rot={(i - 1) * 3} k={iv(lt, 0.2 + i * 0.6, 1.0 + i * 0.6)} from={[0, 100]} /></div>)}
        {["বাবা", "মা", "ভাই"].map((l, i) => <div key={l} style={{ position: "absolute", left: 420 + i * 540 - 200, width: 400, top: 790, textAlign: "center", opacity: iv(lt, 1.0 + i * 0.6, 1.6 + i * 0.6) }}><GoldText text={l} size={64} /></div>)}
      </AbsoluteFill>);
    case "end": return (
      <AbsoluteFill>
        <BlurBg p={15} lt={lt} o={0.3} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
          <div style={{ opacity: iv(lt, 0.3, 1.5), transform: `scale(${1 + lt * 0.004})` }}><GoldText text={s.big ?? ""} size={150} /></div>
          <div style={{ opacity: iv(lt, 1.2, 2.4) }}><GoldText text={s.small ?? ""} size={110} /></div>
          <div style={{ margin: "30px auto 0", width: iv(lt, 1.5, 3.5, 0, 700), height: 2, background: "linear-gradient(90deg, transparent, #d9b25e, transparent)" }} />
          <div style={{ marginTop: 20, fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#e8dcc0", letterSpacing: 4, opacity: iv(lt, 2.5, 3.8) }}>২০ নভেম্বর</div>
        </div>
      </AbsoluteFill>);
  }
  return null;
};

// lyric subtitle
const Lyric: React.FC<{ t: number }> = ({ t }) => {
  const l = LN.find((x) => t >= x.s - 0.15 && t <= x.e + 0.3); if (!l) return null;
  const o = Math.min(iv(t, l.s - 0.15, l.s + 0.35), 1 - iv(t, l.e, l.e + 0.3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, textAlign: "center", opacity: o }}>
      <div style={{ display: "inline-block", padding: "8px 30px 14px", background: "linear-gradient(90deg, rgba(0,0,0,0), rgba(10,6,2,.55) 15%, rgba(10,6,2,.55) 85%, rgba(0,0,0,0))",
        fontFamily: BN, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: "#f4e8cc", textShadow: "0 2px 6px rgba(0,0,0,.9)", whiteSpace: "pre-line" }}>{l.text}</div>
    </div>
  );
};

// handwriting texture: the lyrics themselves, faint, as a manuscript page
const HAND = LN.map((l) => l.text.replace(/\n/g, " ")).join("   ");
const Manuscript: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: -200, top: -200, width: W + 400, transform: `rotate(-6deg) translate(${-t * 4 % 400}px, ${-t * 1.5 % 200}px)`, fontFamily: BN, fontWeight: 600, fontSize: 34, lineHeight: 2.1,
    color: "#e9d3a8", opacity: 0.07, fontStyle: "italic", wordSpacing: 10 }}>{(HAND + "   ").repeat(3)}</div>
);

export const Tribute: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px Anek", "600 40px Anek"].map((f) => document.fonts.load(f, "অআ"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / TB_FPS;
  const flick = 1 + 0.03 * Math.sin(fr * 1.7) * Math.sin(fr * 0.37);
  const leak = 0.18 + 0.14 * Math.sin(t * 0.21) * Math.sin(t * 0.13 + 1);
  const scratch = rnd(Math.floor(fr / 3)) > 0.72;
  return (
    <AbsoluteFill style={{ background: "#0d0906", overflow: "hidden" }}>
      <style>{ANEK_CSS}</style>
      <Audio src={staticFile("tribute/song.mp3")} />
      <Img src={staticFile("tribute/bg.jpg")} style={{ position: "absolute", left: -240, top: -135, width: 2400, height: 1350, transform: `translate(${Math.sin(t * 0.05) * 120}px, ${Math.cos(t * 0.04) * 60}px)` }} />
      <Manuscript t={t} />
      {SHOTS.map((s, i) => {
        const a = STARTS[i], b = i + 1 < SHOTS.length ? STARTS[i + 1] : LYR.total;
        if (t < a - 0.01 || t > b + FADE) return null;
        const o = Math.min(iv(t, a, a + FADE), 1 - iv(t, b, b + FADE));
        return <AbsoluteFill key={i} style={{ opacity: o, filter: o < 0.98 ? `blur(${(1 - o) * 4}px)` : undefined }}><ShotView s={s} lt={t - a} dur={b - a} idx={i} /></AbsoluteFill>;
      })}
      <Lyric t={t} />
      {/* film look */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at ${30 + 20 * Math.sin(t * 0.07)}% 20%, rgba(255,150,60,${leak}), rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(75% 75% at 50% 50%, rgba(0,0,0,0) 50%, rgba(8,4,1,.75) 100%)" }} />
      <Img src={staticFile(`tribute/grain${fr % 6}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: 0.45, mixBlendMode: "overlay" }} />
      {scratch && <div style={{ position: "absolute", left: rnd(fr) * W, top: 0, width: 2, height: H, background: "rgba(240,230,210,.25)" }} />}
      <AbsoluteFill style={{ background: "#2a1a0a", opacity: Math.max(0, 1 - flick) * 6, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 1.2) + iv(t, LYR.total - 3, LYR.total) }} />
    </AbsoluteFill>
  );
};
