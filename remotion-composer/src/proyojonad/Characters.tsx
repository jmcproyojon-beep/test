// Sabbir and Nusrat: rounded "family-film" cartoon characters drawn in SVG.
// Local space: feet at (0,0), y grows downward, the body is ~1000 units tall (big head proportions).
import React from "react";

export type Hand = "open" | "fist" | "point" | "thumb" | "snap" | "chest";
export type Pose = {
  la1: number; la2: number; ra1: number; ra2: number;  // screen-left / screen-right arm: shoulder and elbow angles (deg, 0 = hanging, + = outward/up)
  lh: Hand; rh: Hand; lf: number; rf: number;          // hand gestures and finger direction (deg, 0 = up)
  head: number; brow: number; smile: number; look: number; lean: number; hop: number; mouthO?: number;
};
export const REST: Pose = { la1: 8, la2: 6, ra1: 8, ra2: 6, lh: "open", rh: "open", lf: 0, rf: 0, head: 0, brow: 0, smile: 0.6, look: 0, lean: 0, hop: 0 };

const OUT = "#3b2418", SW = 5;
const SH_L: [number, number] = [-122, -652], SH_R: [number, number] = [122, -652];
const L1 = 160, L2 = 150;
const rad = (d: number) => (d * Math.PI) / 180;

function armPts(side: -1 | 1, a1: number, a2: number) {
  const s = side < 0 ? SH_L : SH_R;
  const d1 = [side * Math.sin(rad(a1)), Math.cos(rad(a1))], d2 = [side * Math.sin(rad(a1 + a2)), Math.cos(rad(a1 + a2))];
  const e: [number, number] = [s[0] + L1 * d1[0], s[1] + L1 * d1[1]];
  const h: [number, number] = [e[0] + L2 * d2[0], e[1] + L2 * d2[1]];
  return { s, e, h };
}

const HandG: React.FC<{ at: [number, number]; g: Hand; dir: number; skin: string; side: -1 | 1 }> = ({ at, g, dir, skin, side }) => {
  const [x, y] = at; const fx = Math.sin(rad(dir)), fy = -Math.cos(rad(dir));
  const finger = (len: number, w = 15, ang = dir) => <line x1={x} y1={y} x2={x + Math.sin(rad(ang)) * len} y2={y - Math.cos(rad(ang)) * len} stroke={skin} strokeWidth={w} strokeLinecap="round" />;
  const fingerO = (len: number, w = 15, ang = dir) => <line x1={x} y1={y} x2={x + Math.sin(rad(ang)) * len} y2={y - Math.cos(rad(ang)) * len} stroke={OUT} strokeWidth={w + SW * 2} strokeLinecap="round" />;
  if (g === "open" || g === "chest") return (<g>
    {[-38, -13, 12, 37].map((o, i) => <g key={i}>{fingerO(46 - Math.abs(o) / 4, 14, dir + o)}</g>)}
    <circle cx={x} cy={y} r={30} fill={skin} stroke={OUT} strokeWidth={SW} />
    {[-38, -13, 12, 37].map((o, i) => <g key={i}>{finger(46 - Math.abs(o) / 4, 14, dir + o)}</g>)}
    {fingerO(30, 15, dir - side * 80)}{finger(30, 15, dir - side * 80)}
  </g>);
  return (<g>
    {g === "point" && fingerO(62, 15)}{g === "thumb" && fingerO(46, 17, 0)}{g === "snap" && fingerO(40, 15, dir - 25)}
    <circle cx={x} cy={y} r={29} fill={skin} stroke={OUT} strokeWidth={SW} />
    {g === "point" && finger(62, 15)}{g === "thumb" && finger(46, 17, 0)}{g === "snap" && finger(40, 15, dir - 25)}
  </g>);
};

const Arm: React.FC<{ side: -1 | 1; a1: number; a2: number; sleeve: string; cuff: string; skin: string; g: Hand; dir: number }> = ({ side, a1, a2, sleeve, cuff, skin, g, dir }) => {
  const { s, e, h } = armPts(side, a1, a2);
  const cu: [number, number] = [h[0] + (e[0] - h[0]) * 0.18, h[1] + (e[1] - h[1]) * 0.18];
  return (<g>
    <polyline points={`${s[0]},${s[1]} ${e[0]},${e[1]} ${cu[0]},${cu[1]}`} fill="none" stroke={OUT} strokeWidth={62 + SW * 2} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points={`${s[0]},${s[1]} ${e[0]},${e[1]} ${cu[0]},${cu[1]}`} fill="none" stroke={sleeve} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
    <line x1={cu[0]} y1={cu[1]} x2={cu[0] + (e[0] - cu[0]) * 0.12} y2={cu[1] + (e[1] - cu[1]) * 0.12} stroke={cuff} strokeWidth={60} strokeLinecap="round" />
    <HandG at={h} g={g} dir={dir} skin={skin} side={side} />
  </g>);
};

const Eyes: React.FC<{ y: number; dx: number; blink: number; look: number; lashes?: boolean; brow: number; browC: string; browW: number }> = ({ y, dx, blink, look, lashes, brow, browC, browW }) => {
  const ry = 34 * Math.max(0.06, 1 - blink);
  return (<g>
    {[-1, 1].map((s) => (<g key={s}>
      <ellipse cx={s * dx} cy={y} rx={28} ry={ry} fill="#fff" stroke={OUT} strokeWidth={4} />
      {blink < 0.7 && <>
        <circle cx={s * dx + look * 8} cy={y + 3} r={19} fill="#4a2a17" />
        <circle cx={s * dx + look * 8} cy={y + 3} r={10} fill="#140a05" />
        <circle cx={s * dx + look * 8 - 7} cy={y - 6} r={6.5} fill="#fff" />
        <circle cx={s * dx + look * 8 + 6} cy={y + 9} r={3} fill="#fff" opacity={0.8} />
      </>}
      {lashes && <path d={`M${s * dx - 26} ${y - ry * 0.75} Q ${s * dx} ${y - ry - 12} ${s * dx + 26} ${y - ry * 0.75} M${s * (dx + 22)} ${y - ry * 0.7} l ${s * 14} ${-10}`} fill="none" stroke="#1a0f0a" strokeWidth={6} strokeLinecap="round" />}
      <path d={`M${s * dx - 30} ${y - 46 - brow * 12 + (s > 0 ? 0 : 0)} Q ${s * dx} ${y - 60 - brow * 16} ${s * dx + 30} ${y - 46 - brow * 12}`} fill="none" stroke={browC} strokeWidth={browW} strokeLinecap="round"
        transform={`rotate(${s * -6 * brow} ${s * dx} ${y - 50})`} />
    </g>))}
  </g>);
};

const Mouth: React.FC<{ y: number; o: number; smile: number; lip: string }> = ({ y, o, smile, lip }) => {
  if (o < 0.07) {
    const c = 10 + 18 * smile;
    return <path d={`M -30 ${y - 4} Q 0 ${y + c} 30 ${y - 4}`} fill="none" stroke={lip} strokeWidth={7} strokeLinecap="round" />;
  }
  const w = 24 + 8 * o + 6 * smile, h = 8 + 34 * o;
  return (<g>
    <path d={`M ${-w} ${y - 2} Q 0 ${y - 6 - 4 * smile} ${w} ${y - 2} Q ${w * 0.9} ${y + h} 0 ${y + h} Q ${-w * 0.9} ${y + h} ${-w} ${y - 2} Z`} fill="#5a1a14" stroke={lip} strokeWidth={5} />
    {o > 0.3 && <path d={`M ${-w * 0.7} ${y} Q 0 ${y - 3} ${w * 0.7} ${y} L ${w * 0.6} ${y + 7} Q 0 ${y + 4} ${-w * 0.6} ${y + 7} Z`} fill="#fff" />}
    <ellipse cx={0} cy={y + h * 0.72} rx={w * 0.55} ry={h * 0.28} fill="#e0777a" />
  </g>);
};

export type CharProps = { x: number; y: number; s: number; p: Pose; talk: number; t: number; flip?: boolean; seed?: number };

function blinkAt(t: number, seed: number) {
  const period = 3.1 + (seed % 3) * 0.7, ph = ((t + seed * 1.37) % period) / period;
  return ph > 0.955 ? Math.sin(((ph - 0.955) / 0.045) * Math.PI) : 0;
}

export const Sabbir: React.FC<CharProps> = ({ x, y, s, p, talk, t, flip, seed = 1 }) => {
  const skin = "url(#skinS)", skinC = "#c98a5f";
  const nod = 2.5 * Math.sin(t * 9) * talk, mo = Math.max(talk, p.mouthO ?? 0);
  const breathe = 1 + 0.008 * Math.sin(t * 2.4);
  return (
    <g transform={`translate(${x} ${y - p.hop}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${p.lean} 0 -400)`}>
      <defs>
        <radialGradient id="skinS" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#e2a676" /><stop offset="1" stopColor="#b2734a" /></radialGradient>
        <linearGradient id="shirtS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bfe0ff" /><stop offset="1" stopColor="#7fb3e6" /></linearGradient>
        <linearGradient id="pantS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e8d6b4" /><stop offset="1" stopColor="#c7ad83" /></linearGradient>
      </defs>
      <ellipse cx={0} cy={4} rx={150} ry={26} fill="rgba(0,0,0,.18)" />
      {/* legs */}
      {[-1, 1].map((k) => <g key={k}>
        <path d={`M ${k * 8} -440 L ${k * 108} -440 L ${k * 98} -40 L ${k * 18} -40 Z`} fill="url(#pantS)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <ellipse cx={k * 62} cy={-24} rx={62} ry={28} fill="#4a2f22" stroke={OUT} strokeWidth={SW} />
      </g>)}
      <g transform={`translate(0 -440) scale(1 ${breathe}) translate(0 440)`}>
        {/* torso */}
        <path d="M -128 -660 Q -140 -560 -116 -440 L 116 -440 Q 140 -560 128 -660 Q 60 -700 0 -700 Q -60 -700 -128 -660 Z" fill="url(#shirtS)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={-118} y={-452} width={236} height={22} rx={6} fill="#6b4630" stroke={OUT} strokeWidth={4} />
        <rect x={-14} y={-450} width={28} height={18} rx={3} fill="#d9b25a" />
        <line x1={0} y1={-672} x2={0} y2={-454} stroke="#6f9fcf" strokeWidth={4} />
        {[-630, -580, -530, -485].map((by) => <circle key={by} cx={9} cy={by} r={5} fill="#fff" stroke="#6f9fcf" strokeWidth={2} />)}
        <rect x={-36} y={-735} width={72} height={60} fill={skinC} stroke={OUT} strokeWidth={SW} />
        <path d="M -46 -690 L 0 -655 L -12 -700 Z M 46 -690 L 0 -655 L 12 -700 Z" fill="#e6f3ff" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <Arm side={-1} a1={p.la1} a2={p.la2} sleeve="url(#shirtS)" cuff="#a9cdf2" skin={skinC} g={p.lh} dir={p.lf} />
      <Arm side={1} a1={p.ra1} a2={p.ra2} sleeve="url(#shirtS)" cuff="#a9cdf2" skin={skinC} g={p.rh} dir={p.rf} />
      {/* head */}
      <g transform={`rotate(${p.head + nod} 0 -720)`}>
        <circle cx={-114} cy={-842} r={25} fill={skinC} stroke={OUT} strokeWidth={SW} />
        <circle cx={114} cy={-842} r={25} fill={skinC} stroke={OUT} strokeWidth={SW} />
        <ellipse cx={0} cy={-850} rx={118} ry={132} fill={skin} stroke={OUT} strokeWidth={SW} />
        {/* beard */}
        <path d="M -114 -858 Q -112 -760 -60 -728 Q 0 -700 60 -728 Q 112 -760 114 -858 Q 96 -800 70 -778 Q 40 -760 0 -760 Q -40 -760 -70 -778 Q -96 -800 -114 -858 Z" fill="#241510" opacity={0.92} />
        <path d="M -40 -808 Q 0 -826 40 -808 Q 30 -796 0 -800 Q -30 -796 -40 -808 Z" fill="#241510" />
        {/* hair */}
        <path d="M -122 -858 Q -132 -960 -60 -992 Q 0 -1018 70 -996 Q 132 -970 122 -858 Q 112 -918 80 -932 Q 30 -950 -20 -942 Q -80 -936 -104 -906 Z" fill="#1d1410" stroke={OUT} strokeWidth={4} />
        <path d="M -30 -990 Q 20 -1030 70 -996 Q 30 -1000 0 -985 Z" fill="#2b1d16" />
        <Eyes y={-872} dx={46} blink={blinkAt(t, seed)} look={p.look} brow={p.brow} browC="#1d1410" browW={13} />
        <path d="M -6 -850 Q -16 -820 -4 -814 Q 8 -812 14 -818" fill="none" stroke="#8a5434" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-70} cy={-818} rx={20} ry={11} fill="#e88a7a" opacity={0.35} />
        <ellipse cx={70} cy={-818} rx={20} ry={11} fill="#e88a7a" opacity={0.35} />
        <Mouth y={-784} o={mo} smile={p.smile} lip="#5a2a1c" />
      </g>
    </g>
  );
};

export const Nusrat: React.FC<CharProps> = ({ x, y, s, p, talk, t, flip, seed = 2 }) => {
  const skinC = "#e2ad84";
  const nod = 2.5 * Math.sin(t * 8.5 + 1) * talk, mo = Math.max(talk, p.mouthO ?? 0);
  const breathe = 1 + 0.008 * Math.sin(t * 2.2 + 1);
  return (
    <g transform={`translate(${x} ${y - p.hop}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${p.lean} 0 -400)`}>
      <defs>
        <radialGradient id="skinN" cx="40%" cy="35%" r="75%"><stop offset="0" stopColor="#f2c39c" /><stop offset="1" stopColor="#cf9068" /></radialGradient>
        <linearGradient id="kamN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c8efbd" /><stop offset="1" stopColor="#8fcf86" /></linearGradient>
        <linearGradient id="blzN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c4377" /><stop offset="1" stopColor="#16244a" /></linearGradient>
        <linearGradient id="ornaN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3e3" /><stop offset="1" stopColor="#efd6bb" /></linearGradient>
      </defs>
      <ellipse cx={0} cy={4} rx={140} ry={24} fill="rgba(0,0,0,.18)" />
      {/* back hair */}
      <g transform={`rotate(${(p.head + nod) * 0.6} 0 -720)`}>
        <path d="M -128 -880 Q -150 -720 -120 -600 Q 0 -570 120 -600 Q 150 -720 128 -880 Z" fill="#1a110d" stroke={OUT} strokeWidth={4} />
      </g>
      {/* salwar + sandals */}
      {[-1, 1].map((k) => <g key={k}>
        <path d={`M ${k * 10} -330 L ${k * 92} -330 L ${k * 80} -52 L ${k * 26} -52 Z`} fill="#e9f6e2" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <ellipse cx={k * 54} cy={-26} rx={50} ry={22} fill="#b9734a" stroke={OUT} strokeWidth={SW} />
      </g>)}
      <g transform={`translate(0 -330) scale(1 ${breathe}) translate(0 330)`}>
        {/* kameez */}
        <path d="M -118 -662 Q -134 -500 -158 -300 L 158 -300 Q 134 -500 118 -662 Q 60 -700 0 -700 Q -60 -700 -118 -662 Z" fill="url(#kamN)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        {[-110, -50, 10, 70, 130].map((px, i) => <circle key={i} cx={px * 0.9} cy={-330} r={5} fill="#e8c35a" />)}
        {/* blazer panels */}
        <path d="M -122 -664 Q -136 -560 -126 -462 L -30 -462 L -26 -560 L -48 -680 Z" fill="url(#blzN)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 122 -664 Q 136 -560 126 -462 L 30 -462 L 26 -560 L 48 -680 Z" fill="url(#blzN)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={-36} y={-735} width={72} height={58} fill={skinC} stroke={OUT} strokeWidth={SW} />
        {/* orna over shoulders */}
        <path d="M -112 -672 Q -60 -640 -40 -560 L -66 -470 L -96 -476 L -84 -580 Q -100 -640 -128 -650 Z" fill="url(#ornaN)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 112 -672 Q 60 -640 40 -560 L 66 -470 L 96 -476 L 84 -580 Q 100 -640 128 -650 Z" fill="url(#ornaN)" stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -50 -690 Q 0 -640 50 -690" fill="none" stroke="url(#ornaN)" strokeWidth={22} strokeLinecap="round" />
      </g>
      <Arm side={-1} a1={p.la1} a2={p.la2} sleeve="url(#blzN)" cuff="#c8efbd" skin={skinC} g={p.lh} dir={p.lf} />
      <Arm side={1} a1={p.ra1} a2={p.ra2} sleeve="url(#blzN)" cuff="#c8efbd" skin={skinC} g={p.rh} dir={p.rf} />
      <g transform={`rotate(${p.head + nod} 0 -720)`}>
        <circle cx={-106} cy={-842} r={22} fill={skinC} stroke={OUT} strokeWidth={SW} />
        <circle cx={106} cy={-842} r={22} fill={skinC} stroke={OUT} strokeWidth={SW} />
        <circle cx={-106} cy={-814} r={8} fill="#e8c35a" stroke={OUT} strokeWidth={2} />
        <circle cx={106} cy={-814} r={8} fill="#e8c35a" stroke={OUT} strokeWidth={2} />
        <ellipse cx={0} cy={-850} rx={110} ry={128} fill="url(#skinN)" stroke={OUT} strokeWidth={SW} />
        {/* front hair: side part with a soft sweep */}
        <path d="M -118 -840 Q -132 -960 -40 -990 Q 40 -1012 100 -968 Q 136 -930 118 -840 Q 108 -900 70 -930 Q 20 -900 -40 -930 Q -80 -930 -104 -880 Z" fill="#1a110d" stroke={OUT} strokeWidth={4} />
        <path d="M -40 -930 Q 10 -960 70 -930" fill="none" stroke="#3a261c" strokeWidth={6} />
        <Eyes y={-868} dx={44} blink={blinkAt(t, seed)} look={p.look} brow={p.brow} browC="#24170f" browW={8} lashes />
        <path d="M -4 -846 Q -12 -822 -2 -816 Q 8 -815 12 -820" fill="none" stroke="#a96a46" strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-66} cy={-816} rx={20} ry={11} fill="#ef8f86" opacity={0.45} />
        <ellipse cx={66} cy={-816} rx={20} ry={11} fill="#ef8f86" opacity={0.45} />
        <Mouth y={-786} o={mo} smile={p.smile} lip="#c2525e" />
      </g>
    </g>
  );
};

// head-top position in local units (for speech bubbles)
export const HEAD_TOP = -1010;
