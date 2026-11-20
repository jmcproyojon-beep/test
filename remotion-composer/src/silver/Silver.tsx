// SILVER MARKET CRASH & RECOVERY — 12-clip cinematic financial documentary (9:16) + RUPMYK JEWELERS end card.
// Black / charcoal / silver palette, subtle red for crashes and green for recovery, English on-screen text,
// Bengali narration (vo.json: one clip per narration line). Everything is drawn in code: bullion, coins,
// charts, trading screens, globe, bond certificate, city skyline.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_CSS } from "../portfolio/fontcss";
import VO from "./vo.json";

export const SV_FPS = 30, SV_W = 1080, SV_H = 1920;
export const SV_FRAMES = Math.ceil(VO.total * SV_FPS);
const W = SV_W, H = SV_H;
const EN = "InterTight, Inter, sans-serif", EB = "Inter, sans-serif";
const C = { bg: "#060708", char: "#14161a", red: "#e2403f", green: "#35d07f", silver: "#d9dee5", dim: "#7d848e" };
const SILVER = "linear-gradient(180deg, #ffffff 0%, #dfe4ea 35%, #8e959f 55%, #eef1f5 80%, #b9bfc7 100%)";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic);
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- shared pieces ------------------------------------------------------------------------------
const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="agTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor="#c8ced6" /><stop offset="0.7" stopColor="#f4f6f8" /><stop offset="1" stopColor="#9aa1aa" /></linearGradient>
      <linearGradient id="agFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9edf1" /><stop offset="0.5" stopColor="#9ea5ae" /><stop offset="1" stopColor="#5d636b" /></linearGradient>
      <linearGradient id="agSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7f868f" /><stop offset="1" stopColor="#3e4349" /></linearGradient>
      <radialGradient id="coin" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor="#c3c9d1" /><stop offset="1" stopColor="#6c737c" /></radialGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="soft"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
  </svg>
);

// bullion bar in 3/4 view, centred at (x,y), width w
const Bar: React.FC<{ x: number; y: number; w: number; sweep?: number; dim?: number; tilt?: number; label?: boolean }> = ({ x, y, w, sweep = -1, dim = 0, tilt = 0, label = true }) => {
  const s = w / 600;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`} opacity={1 - dim * 0.6}>
      <ellipse cx={0} cy={150} rx={330} ry={34} fill="rgba(0,0,0,.6)" filter="url(#soft)" />
      <path d="M -300 60 L -250 -60 L 250 -60 L 300 60 Z" fill="url(#agTop)" />
      <path d="M -300 60 L 300 60 L 286 150 L -286 150 Z" fill="url(#agFront)" />
      <path d="M 300 60 L 250 -60 L 262 -40 L 310 70 L 286 150 Z" fill="url(#agSide)" opacity={0.9} />
      <path d="M -230 -40 L 230 -40 L 266 44 L -266 44 Z" fill="none" stroke="#8a919a" strokeWidth={3} opacity={0.6} />
      {label && <g fontFamily={EN} fontWeight={800} textAnchor="middle" fill="#7c838c" opacity={0.85}>
        <text x={0} y={-6} fontSize={40} letterSpacing={8}>FINE SILVER</text>
        <text x={0} y={34} fontSize={28} letterSpacing={6}>999.9 · 1 KG</text>
      </g>}
      {sweep >= 0 && <path d={`M ${-420 + sweep * 900} -70 l 70 0 l -60 230 l -70 0 Z`} fill="rgba(255,255,255,.55)" style={{ mixBlendMode: "screen" }} clipPath="url(#barclip)" />}
      <clipPath id="barclip"><path d="M -300 60 L -250 -60 L 250 -60 L 300 60 L 286 150 L -286 150 Z" /></clipPath>
      {dim > 0 && <path d="M -300 60 L -250 -60 L 250 -60 L 310 70 L 286 150 L -286 150 Z" fill="#000" opacity={dim * 0.5} />}
    </g>
  );
};
const Coin: React.FC<{ x: number; y: number; r: number; rot?: number; o?: number }> = ({ x, y, r, rot = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <circle r={r} fill="url(#coin)" stroke="#5a6068" strokeWidth={r * 0.06} />
    <circle r={r * 0.8} fill="none" stroke="#8b929b" strokeWidth={r * 0.04} strokeDasharray={`${r * 0.08} ${r * 0.06}`} />
    <text y={r * 0.25} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={r * 0.7} fill="#7a818a">Ag</text>
  </g>
);

// line chart: values 0..1, drawn up to progress k, inside box (x,y,w,h)
type Pt = number[];
function seriesPath(v: Pt, x: number, y: number, w: number, h: number, k: number) {
  const n = v.length - 1, m = Math.max(0.0001, k * n), last = Math.floor(m);
  const P = (i: number, val: number) => `${x + (i / n) * w},${y + h - val * h}`;
  const pts = []; for (let i = 0; i <= last; i++) pts.push(P(i, v[i]));
  let ex = x + (last / n) * w, ey = y + h - v[last] * h;
  if (last < n) { const f = m - last, vv = v[last] + (v[last + 1] - v[last]) * f; ex = x + (m / n) * w; ey = y + h - vv * h; pts.push(`${ex},${ey}`); }
  return { d: "M " + pts.join(" L "), ex, ey };
}
const Chart: React.FC<{ v: Pt; k: number; x: number; y: number; w: number; h: number; color: string; grid?: boolean; area?: boolean; sw?: number }> = ({ v, k, x, y, w, h, color, grid = true, area = true, sw = 7 }) => {
  const { d, ex, ey } = seriesPath(v, x, y, w, h, k);
  return (
    <g>
      {grid && <g stroke="#ffffff" opacity={0.07}>{Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1={x} x2={x + w} y1={y + (i * h) / 6} y2={y + (i * h) / 6} />)}{Array.from({ length: 9 }, (_, i) => <line key={"v" + i} x1={x + (i * w) / 8} x2={x + (i * w) / 8} y1={y} y2={y + h} />)}</g>}
      {area && <path d={`${d} L ${ex} ${y + h} L ${x} ${y + h} Z`} fill={color} opacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />
      <circle cx={ex} cy={ey} r={13} fill={color} filter="url(#glow)" />
    </g>
  );
};
// a smooth, deterministic price walk shaped by control points [[x0..1, y0..1], ...]
const walk = (ctrl: number[][], n = 120, noise = 0.02, seed = 1): Pt => Array.from({ length: n + 1 }, (_, i) => {
  const u = i / n; let j = 0; while (j < ctrl.length - 2 && u > ctrl[j + 1][0]) j++;
  const [x0, y0] = ctrl[j], [x1, y1] = ctrl[j + 1]; const f = Math.min(1, Math.max(0, (u - x0) / (x1 - x0)));
  const base = y0 + (y1 - y0) * (0.5 - 0.5 * Math.cos(f * Math.PI));
  return Math.min(1, Math.max(0, base + noise * (Math.sin(i * 1.7 + seed) * 0.6 + Math.sin(i * 4.3 + seed * 2) * 0.4)));
});
const Candles: React.FC<{ data: number[][]; k: number; x: number; y: number; w: number; h: number }> = ({ data, k, x, y, w, h }) => {
  const n = data.length, cw = w / n;
  return (<g>{data.map(([o, c, hi, lo], i) => { const a = iv(k * n, i, i + 1); if (a <= 0) return null; const up = c >= o;
    const Y = (v: number) => y + h - v * h, col = up ? C.green : C.red;
    return <g key={i} opacity={a}><line x1={x + i * cw + cw / 2} x2={x + i * cw + cw / 2} y1={Y(hi)} y2={Y(lo)} stroke={col} strokeWidth={4} />
      <rect x={x + i * cw + cw * 0.18} width={cw * 0.64} y={Y(Math.max(o, c))} height={Math.max(4, Math.abs(c - o) * h * a)} fill={col} rx={3} /></g>; })}</g>);
};
const Dust: React.FC<{ t: number; dir?: 1 | -1; n?: number; color?: string }> = ({ t, dir = 1, n = 70, color = "#dfe4ea" }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => { const sp = 30 + rnd(i) * 90, y = ((rnd(i + 5) * H + dir * t * sp) % H + H) % H, x = rnd(i + 9) * W + Math.sin(t * 0.6 + i) * 18;
      return <circle key={i} cx={x} cy={y} r={1 + rnd(i + 3) * 3.2} fill={color} opacity={0.15 + rnd(i + 1) * 0.45} />; })}
  </svg>
);
const Title: React.FC<{ lt: number; lines: { t: string; at: number; big?: boolean; color?: string }[]; top?: number }> = ({ lt, lines, top = 200 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
    {lines.map((l, i) => { const k = iv(lt, l.at, l.at + 0.7, 0, 1, out); if (k <= 0) return null;
      const style: React.CSSProperties = l.big ? { fontFamily: EN, fontWeight: 800, fontSize: 92, lineHeight: 1.04, letterSpacing: 2 + 10 * (1 - k), backgroundImage: l.color ? undefined : SILVER, WebkitBackgroundClip: l.color ? undefined : "text", color: l.color ?? "transparent", filter: `blur(${(1 - k) * 8}px) drop-shadow(0 6px 16px rgba(0,0,0,.8))` }
        : { fontFamily: EB, fontWeight: 700, fontSize: 40, letterSpacing: 8 + 6 * (1 - k), color: l.color ?? "#aeb5be", marginTop: 14, filter: `blur(${(1 - k) * 6}px)` };
      return <div key={i} style={{ ...style, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>{l.t}</div>; })}
  </div>
);
const Monitor: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; tint?: string }> = ({ x, y, w, h, children, tint = "#0b1016" }) => (
  <g><rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} rx={14} fill="#1b1e23" stroke="#33373d" strokeWidth={3} /><rect x={x} y={y} width={w} height={h} rx={6} fill={tint} />{children}</g>
);

// ---- clips -------------------------------------------------------------------------------------
const CRASH = walk([[0, .25], [.35, .55], [.55, .92], [.62, .78], [.75, .3], [1, .16]], 120, .025, 3);
const PB = walk([[0, .2], [.5, .85], [.6, .9], [1, .35]], 90, .03, 5);
const DOLLAR_DOWN = walk([[0, .8], [1, .25]], 60, .04, 7);
const YIELD_UP = walk([[0, .2], [1, .85]], 60, .03, 2);
const MARGIN = walk([[0, .75], [.4, .6], [.7, .35], [1, .05]], 100, .03, 9);
const H1980 = walk([[0, .08], [.45, .2], [.7, .9], [.76, .96], [.82, .35], [1, .2]], 120, .015, 4);
const H2011 = walk([[0, .2], [.35, .92], [.45, .6], [.6, .4], [1, .3]], 120, .03, 6);
const H2020 = walk([[0, .45], [.25, .4], [.35, .1], [.5, .3], [.75, .8], [1, .88]], 120, .02, 8);
const STAB = walk([[0, .7], [.3, .25], [.55, .45], [.8, .4], [1, .48]], 100, .03, 1);
const REC_C: number[][] = (() => {
  const shape = [.8, .72, .6, .5, .38, .3, .26, .34, .44, .4, .36, .42, .5, .58, .55, .64, .72, .8];
  return shape.map((c, i) => { const o = i ? shape[i - 1] : .85; return [o, c, Math.max(o, c) + .04, Math.min(o, c) - .04]; });
})();
const PANIC_C: number[][] = Array.from({ length: 16 }, (_, i) => { const o = .9 - i * .05, c = o - .04 - rnd(i) * .03; return [o, c, o + .02, c - .03]; });

type Clip = React.FC<{ lt: number; dur: number; vs: number; ve: number }>;

const C01: Clip = ({ lt, dur }) => {
  const k = iv(lt, .3, dur - 1.2, 0, 1, Easing.inOut(Easing.quad)), crashing = k > .6;
  return (<>
    <Dust t={lt} n={90} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1 + lt * 0.018})` }}>
      <Chart v={CRASH} k={k} x={70} y={640} w={940} h={520} color={crashing ? C.red : C.silver} />
      <Bar x={540} y={1360} w={720} sweep={(lt * 0.35) % 1.4} tilt={-3} />
      {crashing && Array.from({ length: 5 }, (_, i) => <text key={i} x={140 + i * 190} y={1600 + Math.sin(lt * 3 + i) * 6} fontFamily={EN} fontWeight={800} fontSize={44} fill={C.red} opacity={0.4 + 0.5 * (Math.sin(lt * 9 + i) > 0 ? 1 : 0.3)}>▼ {(-2 - rnd(i) * 9).toFixed(1)}%</text>)}
    </svg>
    {crashing && <AbsoluteFill style={{ background: C.red, opacity: 0.12 * Math.max(0, Math.sin(lt * 8)) }} />}
    <Title lt={lt} lines={[{ t: "SILVER MARKET", at: .4, big: true }, { t: "CRASH", at: .9, big: true, color: C.red }, { t: "WHY IS SILVER FALLING?", at: 2.4 }]} />
  </>);
};

const Trader: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <g transform={`translate(${x} 1920) scale(${s})`} fill="#030304"><ellipse cx={0} cy={-330} rx={70} ry={84} /><path d="M -170 0 Q -170 -230 0 -240 Q 170 -230 170 0 Z" /></g>
);
const C02: Clip = ({ lt, dur }) => {
  const k = iv(lt, .2, dur - .8), sell = iv(lt, 3.2, 4.2);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1.02 + lt * 0.01})` }}>
      {[0, 1, 2].map((r) => [0, 1].map((c) => { const x = 70 + c * 480, y = 520 + r * 330;
        return <Monitor key={r + "-" + c} x={x} y={y} w={460} h={290}><Chart v={PB.map((v) => v * (0.8 + 0.2 * rnd(r * 2 + c)))} k={k} x={x + 20} y={y + 30} w={420} h={230} color={k > .6 ? C.red : C.green} grid={false} sw={5} />
          <text x={x + 20} y={y + 28} fontFamily={EB} fontWeight={700} fontSize={22} fill="#8b929b">XAG/USD</text></Monitor>; }))}
      <Trader x={200} s={1.05} /><Trader x={560} s={1.25} /><Trader x={900} s={1.1} />
    </svg>
    {[0, 1, 2, 3].map((i) => { const a = iv(lt, 3.3 + i * .45, 3.8 + i * .45, 0, 1, out); if (a <= 0) return null;
      return <div key={i} style={{ position: "absolute", left: 120 + (i % 2) * 420, top: 700 + i * 170, transform: `scale(${0.6 + 0.4 * a}) rotate(${(i % 2 ? 1 : -1) * 3}deg)`, opacity: a,
        background: "rgba(40,6,8,.88)", border: `3px solid ${C.red}`, borderRadius: 14, padding: "14px 26px", fontFamily: EN, fontWeight: 800, fontSize: 44, color: "#ffdede", boxShadow: `0 0 30px ${C.red}66` }}>SELL {(20 + i * 15)}K OZ</div>; })}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {[0, 1, 2].map((i) => { const p = ((lt * 0.35 + i * 0.33) % 1) * sell; return p > 0 ? <Bar key={i} x={140 + p * 800} y={1560} w={240} label={false} /> : null; })}
      <text x={60} y={1490} fontFamily={EB} fontWeight={700} fontSize={26} fill="#6b727b" letterSpacing={6} opacity={sell}>VAULT</text>
      <text x={900} y={1490} fontFamily={EB} fontWeight={700} fontSize={26} fill="#6b727b" letterSpacing={6} opacity={sell}>MARKET</text>
    </svg>
    <Title lt={lt} lines={[{ t: "PROFIT BOOKING", at: .5, big: true }, { t: "INVESTORS ARE SELLING", at: 1.6 }]} />
  </>);
};

const Globe: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y})`} stroke="#5c8fbf" fill="none" opacity={0.6}>
    <circle r={r} strokeWidth={3} />
    {Array.from({ length: 8 }, (_, i) => { const a = ((i / 8) * Math.PI + t * 0.25) % Math.PI; return <ellipse key={i} rx={Math.abs(Math.cos(a)) * r} ry={r} strokeWidth={1.5} />; })}
    {Array.from({ length: 5 }, (_, i) => { const yy = (i - 2) * r * 0.38; return <ellipse key={"l" + i} cy={yy} rx={Math.sqrt(r * r - yy * yy)} ry={Math.sqrt(r * r - yy * yy) * 0.12} strokeWidth={1.5} />; })}
  </g>
);
const C03: Clip = ({ lt, dur }) => {
  const rise = iv(lt, .4, 3.0, 0, 1, out), glow = iv(lt, 1, dur - 1);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1 + lt * 0.012})` }}>
      <Globe x={540} y={1000} r={360} t={lt} />
      <text x={540} y={1110 - rise * 180} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={520} fill="#7ff0b1" opacity={0.15 + 0.85 * rise} filter="url(#glow)" style={{ filter: `drop-shadow(0 0 ${20 + glow * 60}px rgba(80,230,150,${0.3 + glow * 0.5}))` }}>$</text>
      <Bar x={540} y={1560} w={520} dim={glow} />
      <Chart v={DOLLAR_DOWN} k={iv(lt, 1, dur - .8)} x={640} y={1650} w={380} h={180} color={C.red} grid={false} area={false} sw={5} />
      <text x={640} y={1640} fontFamily={EB} fontWeight={700} fontSize={22} fill="#8b929b">SILVER</text>
    </svg>
    <Title lt={lt} lines={[{ t: "STRONG", at: .4, big: true }, { t: "US DOLLAR", at: .7, big: true }, { t: "PRESSURE ON SILVER", at: 2.2 }]} />
  </>);
};

const C04: Clip = ({ lt, dur }) => {
  const k = iv(lt, .3, dur - .8), shift = iv(lt, 2, dur - 1);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform="translate(540 560)" fill="#2a2e34" stroke="#4a5058" strokeWidth={3} opacity={0.9}>
        <path d="M -260 -10 L 0 -120 L 260 -10 Z" />{[-200, -100, 0, 100, 200].map((x) => <rect key={x} x={x - 22} y={0} width={44} height={200} />)}<rect x={-290} y={200} width={580} height={30} />
      </g>
      <Monitor x={110} y={830} w={860} h={420}>
        <Chart v={YIELD_UP} k={k} x={140} y={880} w={800} h={340} color={C.green} grid />
        <text x={140} y={870} fontFamily={EB} fontWeight={800} fontSize={28} fill="#9ae6bd" letterSpacing={4}>10Y TREASURY YIELD ▲</text>
      </Monitor>
      <Bar x={270} y={1520} w={330} dim={shift} label={false} />
      <g transform="translate(800 1500)" opacity={0.35 + 0.65 * shift}>
        <rect x={-190} y={-120} width={380} height={240} rx={10} fill="#e9e3d2" stroke="#b6a77c" strokeWidth={6} style={{ filter: `drop-shadow(0 0 ${shift * 40}px rgba(255,240,190,.6))` }} />
        <rect x={-170} y={-100} width={340} height={200} rx={6} fill="none" stroke="#b6a77c" strokeWidth={2} />
        <text y={-40} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={36} fill="#5a4d2c">TREASURY BOND</text>
        <text y={10} textAnchor="middle" fontFamily={EB} fontWeight={700} fontSize={26} fill="#7a6b44">COUPON · INTEREST</text>
        <text y={70} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={44} fill="#5a4d2c">%</text>
      </g>
      {Array.from({ length: 16 }, (_, i) => { const p = ((lt * 0.5 + i / 16) % 1); return shift > 0 ? <circle key={i} cx={300 + p * 480} cy={1510 - Math.sin(p * Math.PI) * 120} r={6} fill="#dfe4ea" opacity={shift * (1 - p)} /> : null; })}
    </svg>
    <Title lt={lt} lines={[{ t: "HIGHER", at: .4, big: true }, { t: "INTEREST RATES", at: .7, big: true }, { t: "BONDS ATTRACT INVESTORS", at: 2.4 }]} top={150} />
  </>);
};

const C05: Clip = ({ lt, dur }) => {
  const k = iv(lt, .2, dur - .6, 0, 1, Easing.in(Easing.quad)), warn = lt > 3.2, liq = iv(lt, 5.4, 5.9, 0, 1, Easing.out(Easing.back(2)));
  const shake = warn ? Math.sin(lt * 40) * 4 * (1 - iv(lt, 7, 9)) : 0;
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px) scale(${1 + lt * 0.015})` }}>
      <Monitor x={80} y={560} w={920} h={620}><Chart v={MARGIN} k={k} x={110} y={600} w={860} h={540} color={C.red} /></Monitor>
      <g fontFamily={EB} fontWeight={700} fontSize={30}>
        {Array.from({ length: 9 }, (_, i) => { const y = 1300 + ((i * 64 - lt * 120) % 576 + 576) % 576; return lt > 4 ? <text key={i} x={120} y={y} fill={C.red} opacity={0.75}>SELL  XAG  {(5 + (i * 7) % 40)} LOTS  @ MKT</text> : null; })}
      </g>
    </svg>
    {warn && <div style={{ position: "absolute", left: 140, right: 140, top: 760, padding: "34px 30px", textAlign: "center", background: "rgba(25,4,5,.92)", border: `4px solid ${C.red}`, borderRadius: 20,
      boxShadow: `0 0 ${40 + 30 * Math.abs(Math.sin(lt * 6))}px ${C.red}`, opacity: 0.6 + 0.4 * Math.abs(Math.sin(lt * 6)) }}>
      <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 70, color: "#ffd9d9" }}>⚠ MARGIN CALL</div>
      <div style={{ fontFamily: EB, fontWeight: 700, fontSize: 30, color: "#ff9b9b", letterSpacing: 4, marginTop: 8 }}>EQUITY BELOW MAINTENANCE</div>
    </div>}
    {liq > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", transform: `rotate(-8deg) scale(${2 - liq})`, opacity: Math.min(1, liq) }}>
      <span style={{ fontFamily: EN, fontWeight: 800, fontSize: 96, color: C.red, border: `8px solid ${C.red}`, padding: "4px 30px", borderRadius: 12, letterSpacing: 6 }}>LIQUIDATED</span></div>}
    <Title lt={lt} lines={[{ t: "MARGIN CALL", at: .4, big: true, color: "#ffdcdc" }, { t: "FORCED LIQUIDATION", at: 1.4 }]} top={160} />
  </>);
};

const C06: Clip = ({ lt, dur }) => {
  const wave = iv(lt, .5, 5);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 12 * 9 }, (_, i) => { const c = i % 12, r = Math.floor(i / 12), x = 70 + c * 85, y = 560 + r * 70; const red = rnd(i) * 0.5 + (Math.hypot(c - 6, r - 4) / 8) * 0.5 < wave;
        return <g key={i} transform={`translate(${x} ${y + (red ? Math.sin(lt * 10 + i) * 3 : 0)})`} fill={red ? C.red : "#4a5058"} opacity={red ? 0.9 : 0.6}><circle cy={-14} r={10} /><path d="M -16 14 Q -16 -2 0 -2 Q 16 -2 16 14 Z" /></g>; })}
      <Candles data={PANIC_C} k={iv(lt, 1, dur - 1)} x={80} y={1200} w={920} h={420} />
      {Array.from({ length: 7 }, (_, i) => { const st = 2 + i * 0.8, p = lt - st; if (p < 0) return null; const x = 100 + ((i * 173) % 880) + p * 120, y = 1500 + p * p * 260;
        return <Coin key={i} x={x} y={y} r={46} rot={p * 400} o={Math.max(0, 1 - p / 2.2)} />; })}
    </svg>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 70%, #000 100%)" }} />
    <Title lt={lt} lines={[{ t: "FEAR", at: .3, big: true, color: C.red }, { t: "PANIC SELLING", at: 1.2, big: true }, { t: "MARKET PRESSURE", at: 3.0 }]} top={150} />
  </>);
};

const Flip: React.FC<{ text: string; lt: number; x: number; y: number }> = ({ text, lt, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 8 }}>
    {text.split("").map((ch, i) => { const settle = iv(lt, .6 + i * .12, 1.0 + i * .12); const shown = settle >= 1 ? ch : "0123456789$".charAt(Math.floor(lt * 20 + i * 3) % 11);
      return <div key={i} style={{ width: 70, height: 100, background: "#1c1a16", border: "2px solid #3a352c", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EN, fontWeight: 800, fontSize: 66, color: "#f2dfae" }}>{ch === " " ? "" : shown}</div>; })}
  </div>
);
const C07: Clip = ({ lt, dur }) => (
  <AbsoluteFill style={{ filter: "sepia(.85) contrast(1.05) brightness(.9)" }}>
    <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, #2b241a, #0b0906)" }} />
    <Flip text="SILVER $49" lt={lt} x={150} y={520} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Chart v={H1980} k={iv(lt, .8, dur - .6, 0, 1, Easing.inOut(Easing.quad))} x={80} y={700} w={920} h={560} color="#f2dfae" />
      {[0, 1, 2].map((r) => Array.from({ length: 4 - r }, (_, i) => <Bar key={r + "-" + i} x={300 + i * 160 + r * 80} y={1600 - r * 70} w={170} label={false} />))}
    </svg>
    <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px #000" }} />
    {rnd(Math.floor(lt * 12)) > 0.6 && <div style={{ position: "absolute", left: rnd(Math.floor(lt * 12) + 1) * W, top: 0, width: 2, height: H, background: "rgba(255,240,200,.35)" }} />}
    <Title lt={lt} lines={[{ t: "1980", at: .3, big: true }, { t: "THE HISTORIC SILVER CRASH", at: 1.2 }]} top={180} />
  </AbsoluteFill>
);

const C08: Clip = ({ lt, dur }) => {
  const k = iv(lt, .3, dur - 1.6, 0, 1, Easing.inOut(Easing.quad)), yrs = Math.round(iv(lt, 5.5, dur - .6, 2011, 2025));
  return (<>
    <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 40%, #12202c, #050608)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1.05 - lt * 0.004})` }}>
      <Monitor x={70} y={560} w={940} h={660} tint="#08121a"><Chart v={H2011} k={k} x={100} y={610} w={880} h={560} color={k > .45 ? "#ff8f8f" : "#bfe0ff"} /></Monitor>
      {k > .34 && <g opacity={iv(lt, 2.6, 3.2)}><line x1={100 + .35 * 880} x2={100 + .35 * 880} y1={610} y2={1170} stroke="#ffffff" strokeDasharray="10 10" opacity={0.5} />
        <text x={100 + .35 * 880 + 16} y={650} fontFamily={EN} fontWeight={800} fontSize={44} fill="#fff">≈ $50 / oz</text></g>}
      <Bar x={540} y={1520} w={460} sweep={(lt * 0.3) % 1.4} />
    </svg>
    {lt > 5.5 && <div style={{ position: "absolute", left: 0, right: 0, top: 1700, textAlign: "center", fontFamily: EN, fontWeight: 800, fontSize: 64, color: "#c9d0d8" }}>2011 → {yrs}<div style={{ fontFamily: EB, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: "#7d848e", marginTop: 6 }}>YEARS BEFORE SILVER RETURNED NEAR $50</div></div>}
    <Title lt={lt} lines={[{ t: "2011", at: .3, big: true }, { t: "A LONG ROAD TO RECOVERY", at: 1.2 }]} top={180} />
  </>);
};

const C09: Clip = ({ lt, dur }) => {
  const k = iv(lt, .4, dur - .8, 0, 1, Easing.inOut(Easing.quad)), stim = iv(lt, 4.2, 5.2), up = k > .45;
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g fill="#0e1014">{Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 92} y={1340 - 120 - rnd(i) * 360} width={86} height={700} />)}</g>
      {Array.from({ length: 12 }, (_, i) => Array.from({ length: 6 }, (_, r) => <rect key={i + "-" + r} x={i * 92 + 14 + (r % 2) * 34} y={1250 - rnd(i) * 360 + r * 50} width={20} height={26} fill="#f2d9a0" opacity={rnd(i * 7 + r) > 0.86 ? 0.5 : 0.04} />))}
      <rect x={0} y={1340} width={W} height={580} fill="#08090b" />
      {Array.from({ length: 6 }, (_, i) => <g key={i}><line x1={90 + i * 190} y1={1340} x2={90 + i * 190} y2={1180} stroke="#2a2d33" strokeWidth={6} /><circle cx={90 + i * 190} cy={1180} r={40} fill="#f2d9a0" opacity={0.08} /></g>)}
      <Chart v={H2020} k={k} x={80} y={560} w={920} h={520} color={up ? C.green : C.red} />
      {stim > 0 && Array.from({ length: 22 }, (_, i) => { const p = ((lt * 0.45 + i / 22) % 1); const y = 700 + (i % 6) * 100;
        return <path key={i} d={`M ${-100 + p * 1300} ${y} q 60 -30 120 0`} stroke={C.green} strokeWidth={4} fill="none" opacity={stim * 0.6 * Math.sin(p * Math.PI)} />; })}
    </svg>
    {stim > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", fontFamily: EN, fontWeight: 800, fontSize: 70, color: C.green, letterSpacing: 10, opacity: stim, textShadow: `0 0 30px ${C.green}` }}>STIMULUS</div>}
    <Title lt={lt} lines={[{ t: "2020", at: .3, big: true }, { t: up ? "CRASH → RECOVERY" : "CRASH", at: 1.1, color: up ? "#9ff0c4" : "#ff9c9c" }]} top={180} />
  </>);
};

const C10: Clip = ({ lt, dur }) => {
  const k = iv(lt, .3, dur - 1);
  const X = (i: number) => 80 + (i + 0.5) * (920 / REC_C.length), Y = (v: number) => 640 + 760 - v * 760;
  return (<>
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 60% 55%, rgba(53,208,127,${0.12 * iv(lt, 4, 8)}), rgba(0,0,0,0) 70%)` }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Candles data={REC_C} k={k} x={80} y={640} w={920} h={760} />
      {lt > 3.2 && <g opacity={iv(lt, 3.2, 3.7)}><circle cx={X(6)} cy={Y(.22)} r={34} fill="none" stroke="#fff" strokeWidth={4} /><text x={X(6)} y={Y(.22) + 80} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#fff">LOW</text></g>}
      {lt > 4.8 && <g opacity={iv(lt, 4.8, 5.3)}><circle cx={X(10)} cy={Y(.32)} r={34} fill="none" stroke={C.green} strokeWidth={4} /><text x={X(10)} y={Y(.32) + 80} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill={C.green}>HIGHER LOW</text>
        <line x1={X(6)} y1={Y(.22)} x2={X(10)} y2={Y(.32)} stroke={C.green} strokeWidth={4} strokeDasharray="12 10" /></g>}
      {lt > 6.4 && <path d={`M ${X(11)} ${Y(.45)} L ${X(17)} ${Y(.86)}`} stroke={C.green} strokeWidth={8} markerEnd="" opacity={iv(lt, 6.4, 7)} filter="url(#glow)" />}
    </svg>
    <Title lt={lt} lines={[{ t: "RECOVERY SIGNALS", at: .4, big: true }, { t: "HIGHER LOWS", at: 4.8, color: "#9ff0c4" }, { t: "BUYING RETURNS", at: 6.4, color: "#9ff0c4" }]} top={160} />
  </>);
};

const ICONS = ["$▼", "%▼", "ETF", "⚡", "↗"];
const C11: Clip = ({ lt, vs, ve }) => {
  const items = ["WEAK DOLLAR", "LOWER YIELDS", "ETF INFLOWS", "STRONG DEMAND", "BREAKOUT"];
  const a0 = vs + 1.8, step = (ve - a0) / 5;
  return (<>
    <Title lt={lt} lines={[{ t: "5 RECOVERY", at: .3, big: true }, { t: "SIGNALS", at: .6, big: true, color: "#9ff0c4" }]} top={170} />
    {items.map((it, i) => { const at = a0 + i * step, a = iv(lt, at, at + 0.5, 0, 1, out);
      return <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 560 + i * 210, height: 170, display: "flex", alignItems: "center", gap: 30, opacity: a, transform: `translateX(${(1 - a) * -120}px)`,
        background: "linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.02))", border: "2px solid rgba(220,226,234,.25)", borderRadius: 24, padding: "0 30px" }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "rgba(53,208,127,.14)", border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EN, fontWeight: 800, fontSize: 40, color: C.green }}>{ICONS[i]}</div>
        <div><div style={{ fontFamily: EB, fontWeight: 700, fontSize: 30, color: "#8b929b", letterSpacing: 6 }}>SIGNAL {i + 1}</div>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 64, backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent" }}>{it}</div></div>
      </div>; })}
  </>);
};

const C12: Clip = ({ lt, dur }) => {
  const pull = iv(lt, 0, dur, 1.25, 0.92, Easing.out(Easing.quad));
  return (<>
    <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 50% 62%, #2a2d33, #060708 70%)" }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${pull})` }}>
      <g opacity={0.5}><Chart v={STAB} k={iv(lt, .3, dur - 1.5)} x={80} y={560} w={920} h={480} color="#aeb5be" grid={false} sw={5} /></g>
      <Bar x={540} y={1240} w={680} sweep={iv(lt, 1.5, 5.5)} />
    </svg>
    <Title lt={lt} lines={[{ t: "A CRASH IS", at: .5, big: true }, { t: "NOT THE END.", at: .9, big: true }]} top={170} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", opacity: iv(lt, 4.5, 5.5), fontFamily: EN, fontWeight: 800, fontSize: 66, letterSpacing: 8, color: "#9ff0c4", textShadow: `0 0 26px ${C.green}88` }}>WATCH THE RECOVERY.</div>
  </>);
};

const Brand: React.FC<{ lt: number }> = ({ lt }) => {
  const k = iv(lt, 0, 1.8, 0, 1, Easing.inOut(Easing.quad));
  const target = (i: number) => { const r = i % 3, c = Math.floor(i / 3) % 20; return [400 + c * 14, 820 + r * 20 + (c % 2) * 6]; };
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 120 }, (_, i) => { const [tx, ty] = target(i), sx = rnd(i) * W, sy = rnd(i + 50) * H; return <circle key={i} cx={sx + (tx - sx) * k} cy={sy + (ty - sy) * k} r={3} fill="#e6eaef" opacity={(1 - iv(lt, 1.6, 2.2)) * 0.8} />; })}
      <g opacity={iv(lt, 1.5, 2.3)}><Bar x={540} y={860} w={300} label={false} sweep={iv(lt, 2.2, 3.6)} /></g>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", opacity: iv(lt, 2.0, 3.0) }}>
      <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 92, letterSpacing: 10, backgroundImage: SILVER, WebkitBackgroundClip: "text", color: "transparent" }}>RUPMYK</div>
      <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 52, letterSpacing: 22, color: "#c9ced6", marginTop: 4 }}>JEWELERS</div>
      <div style={{ margin: "26px auto 18px", width: 360, height: 2, background: "linear-gradient(90deg, transparent, #c9ced6, transparent)" }} />
      <div style={{ fontFamily: EB, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: "#8b929b" }}>SILVER MARKET INSIGHTS</div>
    </div>
  </>);
};

const CLIPS: Clip[] = [C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12];

export const Silver: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px InterTight", "700 40px Inter"].map((f) => document.fonts.load(f, "ABC"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / SV_FPS;
  const ci = VO.clips.findIndex((c) => t >= c.s && t < c.s + c.dur);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <style>{FONT_CSS}</style>
      <Defs />
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 50%, #17191d 0%, #060708 75%)" }} />
      {VO.clips.map((c, i) => {
        if (t < c.s - 0.01 || t > c.s + c.dur + 0.5) return null;
        const lt = t - c.s, o = Math.min(iv(lt, 0, 0.45), 1 - iv(lt, c.dur, c.dur + 0.5));
        const Cl = CLIPS[i];
        return <AbsoluteFill key={i} style={{ opacity: o, filter: o < 0.99 ? `blur(${(1 - o) * 10}px)` : undefined }}><Cl lt={lt} dur={c.dur} vs={c.vs - c.s} ve={c.ve - c.s} /></AbsoluteFill>;
      })}
      {t >= VO.brand && <Brand lt={t - VO.brand} />}
      {ci >= 0 && <div style={{ position: "absolute", left: 50, top: 70, fontFamily: EB, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: "#6b727b" }}>{String(ci + 1).padStart(2, "0")} / 12</div>}
      {ci >= 0 && <div style={{ position: "absolute", right: 50, top: 70, fontFamily: EN, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: "#6b727b" }}>RUPMYK · SILVER</div>}
      <Img src={staticFile(`silver/grain${fr % 6}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: 0.22, mixBlendMode: "overlay", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "radial-gradient(85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%)" }} />
      <Audio src={staticFile("silver/mix.wav")} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 0.6) + iv(t, VO.total - 0.8, VO.total) }} />
    </AbsoluteFill>
  );
};
