// "পূর্বাচলে প্লট কিনবেন? ৫টি ফ্যাক্ট" — editorial-collage explainer for Proyojon Abashon (9:16).
// Style from the client's reference: cream paper, cut-out clouds, a grey road swoosh, a floating land
// island, a charcoal map silhouette with a red pin, counting numbers and word-by-word captions.
import React from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import { FONT_CSS } from "../portfolio/fontcss";
import VO from "./vo.json";

export const FX_FPS = 30, FX_W = 1080, FX_H = 1920;
const LN = VO.lines, WD = VO.words;
const END = LN[LN.length - 1].e + 2.6;
export const FX_FRAMES = Math.ceil(END * FX_FPS);
const W = FX_W, H = FX_H;
const BN = "Anek, sans-serif", EN = "InterTight, Inter, sans-serif";
const C = { paper: "#f3efe6", ink: "#262321", grey: "#8f8c87", green: "#0f6a34", deep: "#0a3d1f", red: "#d7262e", gold: "#f2c14e", char: "#2e2c2a" };

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic), back = Easing.out(Easing.back(1.7));
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const bn = (s: string | number) => String(s).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const Ls = (i: number) => LN[i].s, Le = (i: number) => LN[i].e;
const B = (i: number) => (i <= 0 ? 0 : i >= LN.length ? END : (LN[i - 1].e + LN[i].s) / 2);
const Wt = (i: number, k: number) => WD.filter((w) => w.line === i)[k]?.s ?? Ls(i);
const SC = [0, B(1), B(3), B(5), B(7), B(9), B(11), END];      // hook, f1..f5, cta

const bez = (p: number[][], k: number) => { const u = 1 - k; return [0, 1].map((j) => u * u * u * p[0][j] + 3 * u * u * k * p[1][j] + 3 * u * k * k * p[2][j] + k * k * k * p[3][j]); };

// ---------------------------------------------------------------------------------------------
const Paper: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.25  0 0 0 0.07 0" /></filter>
    <rect width={W} height={H} fill={C.paper} /><rect width={W} height={H} filter="url(#grain)" />
  </svg>
);
const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={10} cy={46} rx={150} ry={16} fill="rgba(0,0,0,.08)" />
    {[[-90, 0, 52], [-30, -30, 70], [45, -20, 62], [100, 8, 44], [0, 12, 60], [-60, 20, 45]].map(([cx, cy, r], i) => (
      <g key={i}><circle cx={cx} cy={cy} r={r} fill="url(#cloudG)" /></g>
    ))}
  </g>
);
const Clouds: React.FC<{ t: number }> = ({ t }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <defs><radialGradient id="cloudG" cx="40%" cy="30%" r="70%"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#e4e2de" /><stop offset="1" stopColor="#c9c6c1" /></radialGradient></defs>
    <Cloud x={620 + Math.sin(t * 0.3) * 30 + t * 6} y={170} s={0.95} />
    <Cloud x={120 - t * 4} y={300} s={0.6} />
  </svg>
);
// the grey road swoosh that sweeps through every scene
const Swoosh: React.FC<{ d: string; k: number; w?: number }> = ({ d, k, w = 110 }) => (
  <g>
    <path d={d} fill="none" stroke="#c9c5bd" strokeWidth={w + 10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
    <path d={d} fill="none" stroke="#9b978f" strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
    <path d={d} fill="none" stroke="#f3efe6" strokeWidth={5} strokeDasharray="0.025 0.02" pathLength={1} strokeDashoffset={-k * 0.2} opacity={k > 0.99 ? 0.9 : 0} />
  </g>
);
const PinI: React.FC<{ x: number; y: number; k: number; s?: number; c?: string }> = ({ x, y, k, s = 1, c = C.red }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y - (1 - k) * 120}) scale(${s * Math.min(1, k * 1.3)})`} opacity={Math.min(1, k * 2)}>
    <ellipse cx={0} cy={4} rx={20} ry={6} fill="rgba(0,0,0,.25)" />
    <path d="M0 0 C -34 -40 -34 -78 0 -84 C 34 -78 34 -40 0 0 Z" fill={c} stroke="#7a1015" strokeWidth={3} />
    <circle cx={0} cy={-54} r={13} fill="#fff" />
  </g>
);
const Car: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={22} rx={60} ry={8} fill="rgba(0,0,0,.25)" />
    <path d="M -58 10 L -58 -8 Q -54 -18 -36 -20 L -20 -40 Q -14 -46 0 -46 L 26 -46 Q 36 -46 44 -36 L 54 -20 Q 62 -18 62 -6 L 62 10 Z" fill={C.red} stroke="#7a1015" strokeWidth={3} />
    <path d="M -14 -38 L -4 -38 L -4 -22 L -26 -22 Z M 4 -38 L 24 -38 Q 32 -38 38 -30 L 44 -22 L 4 -22 Z" fill="#cfe9f7" />
    {[-34, 38].map((wx) => <g key={wx}><circle cx={wx} cy={10} r={14} fill="#222" /><circle cx={wx} cy={10} r={6} fill="#bbb" /></g>)}
  </g>
);
const Clock: React.FC<{ x: number; y: number; k: number; spin: number }> = ({ x, y, k, spin }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={62} fill="#fff" stroke={C.ink} strokeWidth={8} /><circle r={6} fill={C.ink} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-50} x2={0} y2={-42} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-44} stroke={C.red} strokeWidth={6} strokeLinecap="round" transform={`rotate(${spin * 360})`} />
    <line x1={0} y1={0} x2={0} y2={-28} stroke={C.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${spin * 30})`} />
  </g>
);

// big serif-style number with a small caption above (reference: "Then I went to the / 43614")
const BigStat: React.FC<{ t: number; a: number; y: number; small: string; big: string; unit?: string; color?: string; size?: number }> = ({ t, a, y, small, big, unit, color = C.ink, size = 210 }) => {
  const o = iv(t, a, a + 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: o, transform: `translateY(${(1 - iv(t, a, a + 0.45, 0, 1, out)) * 40}px)` }}>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#5c5852" }}>{small}</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: -2 }}>{big}{unit && <span style={{ fontSize: size * 0.32, marginLeft: 14, color: C.green }}>{unit}</span>}</div>
    </div>
  );
};
const FactTag: React.FC<{ t: number; a: number; b: number; n: number }> = ({ t, a, b, n }) => {
  const o = Math.min(iv(t, a, a + 0.3), 1 - iv(t, b - 0.3, b)); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.ink, color: "#fff", borderRadius: 60, padding: "8px 30px 8px 10px", transform: `scale(${iv(t, a, a + 0.4, 0.6, 1, back)})` }}>
        <div style={{ width: 78, height: 78, borderRadius: 39, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BN, fontWeight: 800, fontSize: 54, lineHeight: 1 }}>{bn(n)}</div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 52, paddingBottom: 6 }}>ফ্যাক্ট</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
const PURBACHAL = "M120 180 L250 96 L410 128 L520 66 L676 140 L752 300 L716 452 L774 560 L640 662 L462 620 L322 684 L178 604 L84 462 L112 320 Z";
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const rise = iv(t, 0.2, 1.3, 1, 0, Easing.out(Easing.back(1.1)));
  const bob = Math.sin(t * 2.2) * 10;
  const five = Wt(0, 6);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Swoosh d="M -80 1500 C 300 1300 700 1650 1180 1180" k={iv(t, 0.1, 1.2)} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 74, color: C.ink, lineHeight: 1.15,
      clipPath: `inset(0 ${100 - iv(t, 0.3, 1.0, 0, 100, out)}% 0 0)` }}>পূর্বাচলে প্লট<br />কিনবেন ভাবছেন?</div>
    <div style={{ position: "absolute", left: 90, width: 900, top: 640 + rise * 900 + bob, height: 700, filter: "drop-shadow(0 40px 30px rgba(0,0,0,.25))" }}>
      <Img src={staticFile("facts/island.png")} style={{ width: "100%" }} />
    </div>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><PinI x={560} y={930 + bob} k={iv(t, 1.4, 1.9, 0, 1, Easing.out(Easing.bounce))} s={1.4} /></svg>
    {t > five - 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18, transform: `scale(${iv(t, five - 0.1, five + 0.3, 0.4, 1, back)})` }}>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 200, color: C.green, lineHeight: 1 }}>৫টি</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 96, color: C.ink }}>ফ্যাক্ট</div>
    </div>}
  </>);
};

const Fact1: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[1], k = iv(t, a + 0.1, a + 0.7, 0, 1, back), grid = iv(t, Wt(1, 4), Wt(1, 4) + 1.4);
  const acres = Math.round(iv(t, Ls(2) + 0.2, Le(2) - 0.1, 0, 6200, Easing.out(Easing.quad)) / 10) * 10;
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Swoosh d="M -100 1420 C 260 1560 760 1280 1200 1500" k={iv(t, a, a + 0.9)} w={90} />
      <g transform={`translate(${W / 2} 1020) scale(${1.15 * k}) translate(-430 -380)`}>
        <ellipse cx={430} cy={720} rx={360} ry={30} fill="rgba(0,0,0,.12)" />
        <path d={PURBACHAL} fill={C.char} transform="translate(8 14)" opacity={0.35} />
        <path d={PURBACHAL} fill={C.char} />
        <clipPath id="pbClip"><path d={PURBACHAL} /></clipPath>
        <g clipPath="url(#pbClip)">
          {Array.from({ length: 12 }, (_, i) => <line key={"v" + i} x1={90 + i * 62} y1={40} x2={90 + i * 62} y2={720} stroke="#f3efe6" strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - iv(grid, i * 0.04, 0.5 + i * 0.04)} opacity={0.75} />)}
          {Array.from({ length: 11 }, (_, i) => <line key={"h" + i} x1={60} y1={80 + i * 58} x2={800} y2={80 + i * 58} stroke="#f3efe6" strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - iv(grid, 0.3 + i * 0.04, 0.8 + i * 0.04)} opacity={0.75} />)}
          {grid > 0.7 && [[300, 300], [520, 420], [380, 520], [600, 240]].map(([x, y], i) => <rect key={i} x={x} y={y} width={58} height={50} fill={C.green} opacity={iv(grid, 0.7 + i * 0.07, 0.85 + i * 0.07) * 0.9} />)}
        </g>
        <PinI x={440} y={360} k={iv(t, a + 0.7, a + 1.1, 0, 1, Easing.out(Easing.bounce))} s={1.6} />
      </g>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: iv(t, Wt(1, 3), Wt(1, 3) + 0.3) }}>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#5c5852" }}>রাজউকের পরিকল্পিত</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 96, color: C.ink, lineHeight: 1.1 }}>নতুন শহর</div>
    </div>
    {t > Ls(2) - 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", transform: `scale(${iv(t, Ls(2) - 0.1, Ls(2) + 0.3, 0.6, 1, back)})` }}>
      <span style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#5c5852" }}>প্রায় </span>
      <span style={{ fontFamily: BN, fontWeight: 800, fontSize: 150, color: C.green }}>{bn(acres.toLocaleString("en-US"))}</span>
      <span style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, color: C.ink }}> একর</span>
    </div>}
  </>);
};

const ROAD2 = [[120, 1430], [380, 1180], [560, 900], [880, 800]];
const Fact2: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[2], k = iv(t, a + 0.1, a + 1.0);
  const cp = iv(t, Wt(3, 4), Le(4) - 0.2, 0, 1, Easing.inOut(Easing.sin));
  const [cx, cy] = bez(ROAD2, cp), [nx, ny] = bez(ROAD2, Math.min(1, cp + 0.01));
  const d = `M ${ROAD2[0][0]} ${ROAD2[0][1]} C ${ROAD2[1][0]} ${ROAD2[1][1]} ${ROAD2[2][0]} ${ROAD2[2][1]} ${ROAD2[3][0]} ${ROAD2[3][1]}`;
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Swoosh d={d} k={k} w={150} />
      <path d={PURBACHAL} fill={C.char} transform={`translate(${880} ${760}) scale(${0.36 * iv(t, Ls(4), Ls(4) + 0.4, 0.001, 1, back)}) translate(-430 -380)`} />
      <PinI x={ROAD2[0][0]} y={ROAD2[0][1] - 40} k={iv(t, Wt(3, 2), Wt(3, 2) + 0.4, 0, 1, Easing.out(Easing.bounce))} s={1.3} c={C.ink} />
      <PinI x={ROAD2[3][0]} y={ROAD2[3][1] - 40} k={iv(t, Ls(4), Ls(4) + 0.4, 0, 1, Easing.out(Easing.bounce))} s={1.3} />
      {cp > 0 && <Car x={cx} y={cy - 16} rot={Math.atan2(ny - cy, nx - cx) * 57.3} s={1.15} />}
    </svg>
    <div style={{ position: "absolute", left: 40, top: 1450, fontFamily: BN, fontWeight: 800, fontSize: 56, color: C.ink, opacity: iv(t, Wt(3, 2), Wt(3, 2) + 0.3) }}>কুড়িল</div>
    <div style={{ position: "absolute", right: 60, top: 910, fontFamily: BN, fontWeight: 800, fontSize: 56, color: C.red, opacity: iv(t, Ls(4), Ls(4) + 0.3) }}>পূর্বাচল</div>
    <BigStat t={t} a={Wt(3, 4)} y={250} small="এক্সপ্রেসওয়ে" big="৩০০" unit="ফিট" />
    <div style={{ position: "absolute", left: 60, top: 1000, fontFamily: BN, fontWeight: 800, fontSize: 64, color: C.green, opacity: iv(t, Ls(4), Ls(4) + 0.3), transform: `rotate(-8deg) scale(${iv(t, Ls(4), Ls(4) + 0.4, 0.6, 1, back)})` }}>সরাসরি!</div>
  </>);
};

const Expo: React.FC<{ k: number; t: number }> = ({ k, t }) => (
  <g transform={`translate(540 1060) scale(${k}) translate(-540 -1060)`} opacity={Math.min(1, k * 2)}>
    <path d="M 120 1180 L 960 1180 L 900 1300 Q 540 1380 180 1300 Z" fill="#6b4a2f" />
    <path d="M 120 1180 L 960 1180 L 940 1210 Q 540 1240 140 1210 Z" fill="#79b553" />
    <rect x={190} y={1020} width={700} height={170} fill="#fdfcf8" stroke={C.ink} strokeWidth={6} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={210 + i * 48} y={1060} width={34} height={110} fill="#8fc5e6" stroke="#5b8fb0" strokeWidth={2} />)}
    <path d={`M 160 1030 ${Array.from({ length: 8 }, (_, i) => `Q ${195 + i * 95} ${950} ${245 + i * 95} 1030`).join(" ")} L 920 1030 L 920 1050 L 160 1050 Z`} fill={C.red} stroke="#7a1015" strokeWidth={5} strokeLinejoin="round" />
    <path d="M 420 1030 Q 540 880 660 1030 Z" fill="#fff" stroke={C.ink} strokeWidth={6} />
    {[230, 850].map((x, i) => <g key={i}><line x1={x} y1={1020} x2={x} y2={880} stroke={C.ink} strokeWidth={6} /><path d={`M ${x} 884 l ${70} ${14 + Math.sin(t * 6 + i) * 6} l -70 ${16} Z`} fill={i ? C.green : C.red} /></g>)}
    <path d={`M 230 900 ${Array.from({ length: 10 }, (_, i) => `L ${230 + (i + 0.5) * 62} ${936} L ${230 + (i + 1) * 62} ${905}`).join(" ")}`} fill="none" stroke={C.ink} strokeWidth={3} />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${236 + i * 62} 906 l 25 0 l -12 ${24 + Math.sin(t * 5 + i) * 3} Z`} fill={[C.red, C.gold, C.green, "#3f8fd8"][i % 4]} />)}
  </g>
);
const Fact3: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[3], k = iv(t, a + 0.15, a + 0.8, 0, 1, back), fair = Ls(6);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Swoosh d="M -100 1520 C 300 1400 700 1700 1180 1450" k={iv(t, a, a + 0.8)} w={90} />
      <Expo k={k} t={t} />
      {t > fair && [[130, 1240], [950, 1240], [250, 1340], [830, 1350]].map(([x, y], i) => { const s = iv(t, fair + 0.15 * i, fair + 0.15 * i + 0.4, 0, 1, back);
        return <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M -55 0 L 0 -60 L 55 0 Z" fill={i % 2 ? C.red : C.green} /><path d="M -55 0 L 0 -60 L -18 0 Z" fill="#fff" opacity={0.4} /><rect x={-45} y={0} width={90} height={56} fill="#fff" stroke={C.ink} strokeWidth={4} /></g>; })}
      {t > fair && Array.from({ length: 40 }, (_, i) => { const k2 = iv(t, fair, fair + 1.6), x = 540 + Math.cos(i * 2.4) * (100 + k2 * (300 + (i * 37) % 260)), y = 880 + Math.sin(i * 2.4) * k2 * 260 + k2 * k2 * 300;
        return <rect key={i} x={x} y={y} width={14} height={8} fill={[C.red, C.gold, C.green, "#3f8fd8"][i % 4]} transform={`rotate(${i * 40 + t * 300} ${x} ${y})`} opacity={1 - iv(t, fair + 1.2, fair + 1.8)} />; })}
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: iv(t, a + 0.3, a + 0.6) * (1 - iv(t, fair - 0.2, fair + 0.1)) }}>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#5c5852" }}>বাংলাদেশ-চায়না ফ্রেন্ডশিপ</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 104, color: C.ink, lineHeight: 1.05 }}>এক্সিবিশন<br />সেন্টার</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 52, color: C.green, marginTop: 8 }}>এখানেই</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", opacity: iv(t, fair, fair + 0.3), transform: `scale(${iv(t, fair, fair + 0.4, 0.7, 1, back)})` }}>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#5c5852" }}>ঢাকা আন্তর্জাতিক</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 118, color: C.red, lineHeight: 1.05 }}>বাণিজ্য মেলা</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 52, color: C.ink, marginTop: 8 }}>এখন এখানেই</div>
    </div>
  </>);
};

const Fact4: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[4], kuril = Wt(8, 4) - 0.2;
  const z = iv(t, kuril, kuril + 0.8, 1, 0.72), px = iv(t, kuril, kuril + 0.8, 0, 160);
  const line = iv(t, Wt(7, 9), Wt(7, 9) + 0.9), drive = iv(t, Ls(8), Wt(8, 2) + 0.3);
  const car1 = [250 + 520 * drive, 1060 - 120 * drive];
  const line2 = iv(t, kuril + 0.4, kuril + 1.2);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${W / 2 + px} 1000) scale(${z}) translate(${-W / 2} -1000)`}>
        <path d={PURBACHAL} fill={C.char} transform={`translate(250 1060) scale(${0.42 * iv(t, a + 0.1, a + 0.6, 0.001, 1, back)}) translate(-430 -380)`} />
        <PinI x={250} y={1040} k={iv(t, a + 0.5, a + 0.9, 0, 1, Easing.out(Easing.bounce))} s={1.1} c={C.ink} />
        {line > 0 && <line x1={250} y1={1060} x2={250 + 570 * line} y2={1060 - 130 * line} stroke={C.ink} strokeWidth={8} strokeDasharray="22 16" />}
        {drive > 0 && <Car x={car1[0]} y={car1[1] - 20} rot={-12} s={0.95} />}
        {line2 > 0 && <><Swoosh d="M -560 1340 C -300 1300 0 1200 250 1090" k={line2} w={70} /><PinI x={-560} y={1320} k={iv(t, kuril, kuril + 0.4, 0, 1, Easing.out(Easing.bounce))} s={1.4} c={C.ink} /></>}
      </g>
    </svg>
    <div style={{ position: "absolute", left: 470 + px * 0.2, top: 620, width: 560, height: 560, transform: `rotate(4deg) scale(${iv(t, Wt(7, 2), Wt(7, 2) + 0.4, 0.5, 1, back) * (0.85 + 0.15 * (z - 0.72) / 0.28)})`, opacity: iv(t, Wt(7, 2), Wt(7, 2) + 0.3),
      background: "#fff", padding: 12, boxShadow: "0 24px 50px rgba(0,0,0,.3)" }}>
      <Img src={staticFile("facts/site.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -64, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 46, color: C.red }}>মেরিন সিটি</div>
    </div>
    <div style={{ position: "absolute", left: 60, top: 1180, fontFamily: BN, fontWeight: 800, fontSize: 40, color: C.ink, opacity: iv(t, a + 0.5, a + 0.8) * (1 - iv(t, kuril, kuril + 0.4)) }}>পূর্বাচল নতুন শহর</div>
    <BigStat t={t} a={Wt(7, 9)} y={250} small="মাত্র" big="১" unit="কিলোমিটার" />
    {t > Ls(8) && t < kuril + 0.2 && <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: iv(t, Ls(8), Ls(8) + 0.3) * (1 - iv(t, kuril - 0.2, kuril + 0.2)) }}>
      <svg width={140} height={140} viewBox="-70 -70 140 140"><Clock x={0} y={0} k={1} spin={iv(t, Ls(8), Wt(8, 2) + 0.3) * 5 / 60} /></svg>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 96, color: C.ink }}>৫ মিনিট</div>
    </div>}
    {t > kuril && <div style={{ position: "absolute", left: 0, right: 0, top: 1320, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: iv(t, kuril + 0.3, kuril + 0.6) }}>
      <svg width={140} height={140} viewBox="-70 -70 140 140"><Clock x={0} y={0} k={1} spin={iv(t, kuril + 0.3, Le(8)) * 15 / 60} /></svg>
      <div><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: "#5c5852" }}>কুড়িল ফ্লাইওভার থেকে</div><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 96, color: C.red, lineHeight: 1 }}>১৫ মিনিট</div></div>
    </div>}
  </>);
};

const Fact5: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[5], k = iv(t, a + 0.1, a + 0.6, 0, 1, back), ho = Ls(10);
  const katha = Math.round(iv(t, Wt(9, 4), Wt(9, 7) + 0.3, 5, 25, Easing.inOut(Easing.quad)));
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><Swoosh d="M -100 1560 C 300 1450 760 1680 1180 1500" k={iv(t, a, a + 0.8)} w={90} /></svg>
    <div style={{ position: "absolute", left: 150, top: 560, width: 780, height: 900, background: "#fff", padding: 14, boxShadow: "0 30px 60px rgba(0,0,0,.3)", transform: `rotate(-3deg) scale(${k})`, opacity: Math.min(1, k * 2) }}>
      <Img src={staticFile("facts/plots.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%" }} />
    </div>
    {t > Wt(9, 4) - 0.1 && t < ho + 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: iv(t, Wt(9, 4) - 0.1, Wt(9, 4) + 0.2) * (1 - iv(t, ho - 0.2, ho + 0.1)) }}>
      <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#5c5852" }}>৫ থেকে ২৫ কাঠার প্লট</div>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 200, color: C.green, lineHeight: 1 }}>{bn(katha)}<span style={{ fontSize: 70, color: C.ink, marginLeft: 12 }}>কাঠা</span></div>
    </div>}
    {t > Wt(9, 6) && <div style={{ position: "absolute", left: 40, right: 40, top: 1490, display: "flex", justifyContent: "center", gap: 12 }}>
      {[5, 10, 15, 20, 25].map((n, i) => <div key={n} style={{ fontFamily: BN, fontWeight: 800, fontSize: 40, background: katha >= n ? C.green : "#fff", color: katha >= n ? "#fff" : C.ink, border: `3px solid ${C.green}`, borderRadius: 30, padding: "4px 20px 10px",
        transform: `scale(${iv(t, Wt(9, 6) + i * 0.08, Wt(9, 6) + i * 0.08 + 0.3, 0.3, 1, back)})` }}>{bn(n)}</div>)}
    </div>}
    {t > ho - 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center", transform: `scale(${iv(t, ho - 0.1, ho + 0.35, 0.5, 1, back)})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "#fff", borderRadius: 30, padding: "18px 36px", boxShadow: "0 20px 50px rgba(0,0,0,.2)" }}>
        <svg width={130} height={130} viewBox="0 0 130 130"><circle cx={42} cy={65} r={30} fill="none" stroke={C.gold} strokeWidth={14} /><path d="M 70 65 L 122 65 M 104 65 L 104 86 M 118 65 L 118 80" stroke={C.gold} strokeWidth={14} strokeLinecap="round" />
          <circle cx={100} cy={30} r={24} fill={C.green} /><path d="M 89 30 l 8 8 l 14 -16" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 42, color: "#5c5852" }}>সহজ</div><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 84, color: C.ink, lineHeight: 1 }}>হ্যান্ডওভার</div></div>
      </div>
    </div>}
  </>);
};

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const a = SC[6], tag = Ls(12), bob = Math.sin(t * 2.2) * 10;
  const r = (d: number) => iv(t, a + d, a + d + 0.45, 0, 1, out);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><Swoosh d="M -100 900 C 300 760 700 1000 1180 820" k={iv(t, a, a + 0.8)} w={80} /></svg>
    <div style={{ position: "absolute", left: 200, width: 680, top: 330 + (1 - r(0)) * 300 + bob, filter: "drop-shadow(0 30px 24px rgba(0,0,0,.25))", opacity: r(0) }}>
      <Img src={staticFile("facts/island.png")} style={{ width: "100%" }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 60, color: C.ink, opacity: r(0.1) * (1 - iv(t, tag - 0.2, tag + 0.1)) }}>বিস্তারিত জানতে আজই যোগাযোগ করুন</div>
    <div style={{ position: "absolute", left: 50, right: 50, top: 940, background: "#fff", borderRadius: 34, padding: "30px 36px", boxShadow: "0 30px 70px rgba(0,0,0,.2)", border: `4px solid ${C.green}`, opacity: r(0.3), transform: `translateY(${(1 - r(0.3)) * 120}px)` }}>
      <div style={{ display: "flex", justifyContent: "center" }}><Img src={staticFile("facts/logo.png")} style={{ height: 150, transform: `scale(${1 + 0.06 * iv(t, tag, tag + 0.4, 0, 1, back) - 0.06 * iv(t, tag + 0.4, tag + 0.8)})` }} /></div>
      <div style={{ marginTop: 22, background: C.green, borderRadius: 22, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: r(0.6) }}>
        <svg width={56} height={56} viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 66, color: "#fff" }}>+880 1323 280004</div>
      </div>
      <div style={{ marginTop: 18, textAlign: "center", fontFamily: EN, fontWeight: 700, fontSize: 44, color: C.deep, opacity: r(0.9) }}>🌐 www.proyojonabashon.com</div>
      <div style={{ marginTop: 8, textAlign: "center", fontFamily: EN, fontWeight: 700, fontSize: 34, color: "#4a5a4e", opacity: r(1.2) }}>📍 Level-4, House: 23, Road: 16, Nikunja-2, Dhaka</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1445, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 92, color: C.green, opacity: iv(t, Wt(12, 2) - 0.1, Wt(12, 2) + 0.25), transform: `scale(${iv(t, Wt(12, 2) - 0.1, Wt(12, 2) + 0.35, 0.6, 1, back)})` }}>আগামীর নিশ্চিত ঠিকানা</div>
  </>);
};

// word-by-word captions: the current chunk small, the spoken word big (reference style)
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const li = LN.findIndex((l) => t >= l.s - 0.05 && t <= l.e + 0.25); if (li < 0) return null;
  const ws = WD.filter((w) => w.line === li); const k = Math.max(0, ws.findIndex((w, j) => t >= w.s - 0.03 && (j === ws.length - 1 || t < ws[j + 1].s - 0.03)));
  const c0 = Math.floor(k / 3) * 3, chunk = ws.slice(c0, c0 + 3);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1650, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: 14 }}>
      {chunk.map((w, j) => { const on = c0 + j === k;
        return <span key={j} style={{ fontFamily: BN, fontWeight: 800, fontSize: on ? 84 : 46, color: on ? C.ink : "#7d7972", lineHeight: 1.1, textShadow: "0 2px 0 #f3efe6" }}>{w.w.replace(/[।,:?]/g, "")}</span>; })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
export const Facts: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px Anek", "600 40px Anek", "800 60px InterTight", "700 40px Inter"].map((f) => document.fonts.load(f, "অআ abc"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const t = useCurrentFrame() / FX_FPS;
  const si = Math.max(0, SC.findIndex((s, i) => t >= s && t < SC[i + 1]));
  const lt = t - SC[si];
  const enter = iv(lt, 0, 0.35, 0, 1, out), leave = SC[si + 1] - t;
  const scenes = [Hook, Fact1, Fact2, Fact3, Fact4, Fact5, CTA]; const Scene = scenes[si] ?? CTA;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      <Paper /><Clouds t={t} />
      <AbsoluteFill style={{ opacity: Math.min(enter, iv(leave, 0, 0.18)), transform: `scale(${1.06 - 0.06 * enter})`, filter: lt < 0.2 ? `blur(${(1 - enter) * 10}px)` : undefined }}>
        <Scene t={t} />
      </AbsoluteFill>
      {si >= 1 && si <= 5 && <FactTag t={t} a={SC[si]} b={SC[si + 1]} n={si} />}
      <Captions t={t} />
      <div style={{ position: "absolute", left: 36, top: 1830, opacity: si < 6 ? 0.9 : 0 }}><Img src={staticFile("facts/logo.png")} style={{ height: 54 }} /></div>
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 0.25) + iv(t, END - 0.5, END) }} />
    </AbsoluteFill>
  );
};
