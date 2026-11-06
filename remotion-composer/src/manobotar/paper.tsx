import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DISPLAY } from "../signal/fonts";
import { C, clamp, lerp, rand, jit, smooth, easeOut, backOut } from "./lib";

// Paper-cutout kit: every shape is a cutout with a white paper edge and a
// soft drop shadow; the camera is steady, but each cutout jitters a little on
// twos (12 drawings a second), like stop-motion.

export const W = 1920, H = 1080;

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="cut" x="-10%" y="-10%" width="120%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="edge" />
      <feFlood floodColor="#FBF6EA" /><feComposite in2="edge" operator="in" result="white" />
      <feGaussianBlur in="edge" stdDeviation="5" result="blur" /><feOffset in="blur" dx="5" dy="8" result="sh" />
      <feComponentTransfer in="sh" result="shadow"><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
      <feMerge><feMergeNode in="shadow" /><feMergeNode in="white" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
  </defs>
);

/** A group drawn as a paper cutout (white edge + shadow), jittering on twos. */
export const Cut: React.FC<{ t: number; id: number; children: React.ReactNode; x?: number; y?: number; s?: number; r?: number; o?: number; still?: boolean }> =
  ({ t, id, children, x = 0, y = 0, s = 1, r = 0, o = 1, still }) => {
    const j = still ? { x: 0, y: 0, r: 0 } : jit(t, id);
    return <g filter="url(#cut)" opacity={o} transform={`translate(${x + j.x} ${y + j.y}) rotate(${r + j.r}) scale(${s})`}>{children}</g>;
  };

export const Paper: React.FC<{ tex?: "kraft" | "cream" | "night"; tint?: string; tintO?: number }> = ({ tex = "kraft", tint, tintO = 0.35 }) => (
  <AbsoluteFill>
    <Img src={staticFile(`manobotar/${tex}.jpg`)} style={{ width: W, height: H }} />
    {tint && <AbsoluteFill style={{ background: tint, opacity: tintO, mixBlendMode: "multiply" }} />}
  </AbsoluteFill>
);

/** The hero: a photo cutout from the artist's character sheet. */
export type View = "front" | "left" | "right" | "back";
export const HERO_SIZE: Record<string, [number, number]> = {
  hero_front: [393, 1163], hero_left: [260, 1163], hero_back: [408, 1159], hero_right: [309, 1161],
  head_front: [693, 578], head_left: [549, 575], head_right: [531, 576], head_3q: [609, 584],
};
export const Hero: React.FC<{ t: number; img: string; x: number; y: number; h: number; o?: number; r?: number; bob?: number; glow?: number; flip?: boolean }> =
  ({ t, img, x, y, h, o = 1, r = 0, bob = 0, glow = 0, flip }) => {
    const [iw, ih] = HERO_SIZE[img];
    const w = (iw / ih) * h;
    const j = jit(t, 99, 2);
    return (
      <div style={{ position: "absolute", left: x - w / 2 + j.x, top: y - h + j.y - bob, width: w, height: h, opacity: o,
        transform: `rotate(${r + j.r}deg) scaleX(${flip ? -1 : 1})`, transformOrigin: "50% 100%",
        filter: `drop-shadow(8px 12px 10px rgba(0,0,0,0.4))${glow > 0 ? ` drop-shadow(0 0 ${30 * glow}px rgba(255,200,90,${0.9 * glow}))` : ""}` }}>
        <Img src={staticFile(`manobotar/${img}.png`)} style={{ width: "100%", height: "100%" }} />
      </div>
    );
  };

/** Lyric / title on a torn paper strip. */
export const Strip: React.FC<{ t: number; at: number; out?: number; x?: number; y: number; children: React.ReactNode; size?: number; bg?: string; color?: string; rot?: number; font?: string }> =
  ({ t, at, out = Infinity, x = W / 2, y, children, size = 64, bg = C.paper, color = C.ink, rot = -1.5, font = DISPLAY }) => {
    if (t < at - 0.1) return null;
    const k = easeOut((t - at + 0.1) / 0.35), o = 1 - smooth((t - out) / 0.4);
    if (o <= 0) return null;
    const j = jit(t, Math.round(at * 10), 1.4);
    const clip = (() => {
      const top: string[] = [], bot: string[] = [];
      for (let i = 0; i <= 24; i++) { const xx = (i / 24) * 100; top.push(`${xx}% ${rand(at * 13 + i) * 9}%`); bot.push(`${100 - xx}% ${100 - rand(at * 7 + i) * 9}%`); }
      return `polygon(${top.join(",")},${bot.join(",")})`;
    })();
    return (
      <div style={{ position: "absolute", left: x + j.x, top: y + j.y, transform: `translate(-50%,-50%) rotate(${rot + j.r}deg) scaleX(${k})`, opacity: o,
        filter: "drop-shadow(5px 8px 6px rgba(0,0,0,0.35))" }}>
        <div style={{ background: bg, color, clipPath: clip, padding: `${size * 0.32}px ${size * 0.7}px ${size * 0.42}px`, fontFamily: font, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", lineHeight: 1.2 }}>{children}</div>
      </div>
    );
  };

// ------------------------------------------------------------------ landmarks (paper silhouettes, generic)
export const Capitol: React.FC = () => (
  <g fill="#E9E2D0" stroke={C.ink} strokeWidth={4}>
    <rect x={-260} y={-90} width={520} height={90} /><rect x={-150} y={-170} width={300} height={80} />
    <path d="M-110 -170 Q-110 -330 0 -340 Q110 -330 110 -170 Z" /><rect x={-14} y={-380} width={28} height={44} /><circle cx={0} cy={-388} r={12} />
    {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={-230 + i * 46} y1={-88} x2={-230 + i * 46} y2={-4} />)}
  </g>
);
export const Kremlin: React.FC = () => (
  <g stroke={C.ink} strokeWidth={4}>
    <rect x={-280} y={-120} width={560} height={120} fill="#A8452E" />
    {[-200, -70, 70, 200].map((x, i) => (
      <g key={i}><rect x={x - 36} y={-240 - (i % 2) * 40} width={72} height={140 + (i % 2) * 40} fill="#B85A3A" />
        <path d={`M${x - 44} ${-240 - (i % 2) * 40} Q${x - 50} ${-310 - (i % 2) * 40} ${x} ${-340 - (i % 2) * 40} Q${x + 50} ${-310 - (i % 2) * 40} ${x + 44} ${-240 - (i % 2) * 40} Z`}
          fill={["#3A7A5A", "#E9B23B", "#3A5A9A", "#C84A3A"][i]} />
        <line x1={x} y1={-340 - (i % 2) * 40} x2={x} y2={-380 - (i % 2) * 40} /></g>
    ))}
  </g>
);
export const PalaceGate: React.FC = () => (
  <g stroke={C.ink} strokeWidth={4}>
    <rect x={-300} y={-120} width={600} height={120} fill="#B33A2A" />
    {[-160, 0, 160].map((x) => <path key={x} d={`M${x - 40} 0 L${x - 40} -70 Q${x} -110 ${x + 40} -70 L${x + 40} 0 Z`} fill="#3A2A20" />)}
    <rect x={-240} y={-210} width={480} height={90} fill="#C24A32" />
    <path d="M-330 -120 L-260 -170 L260 -170 L330 -120 Z" fill="#E9B23B" /><path d="M-280 -210 L-200 -270 L200 -270 L280 -210 Z" fill="#E9B23B" />
  </g>
);
export const IndiaGate: React.FC = () => (
  <g fill="#D9A878" stroke={C.ink} strokeWidth={4}>
    <path d="M-170 0 L-170 -330 L170 -330 L170 0 L80 0 L80 -170 Q0 -260 -80 -170 L-80 0 Z" />
    <rect x={-190} y={-370} width={380} height={40} /><rect x={-130} y={-410} width={260} height={40} /><rect x={-70} y={-440} width={140} height={30} />
  </g>
);
export const NYSkyline: React.FC = () => (
  <g stroke={C.ink} strokeWidth={4} fill="#9AA3AE">
    {[[-320, 260], [-250, 340], [-170, 220], [-90, 420], [0, 300], [80, 520], [170, 280], [250, 360], [320, 240]].map(([x, h], i) => (
      <rect key={i} x={x - 38} y={-h} width={76} height={h} fill={i % 2 ? "#8A95A2" : "#A9B2BC"} />
    ))}
    <path d="M42 -520 L80 -600 L118 -520 Z" /><line x1={80} y1={-600} x2={80} y2={-650} />
  </g>
);
export const Assembly: React.FC = () => (
  <g stroke={C.ink} strokeWidth={4}>
    {[0, 1, 2, 3].map((r) => <path key={r} d={`M${-640 + r * 70} 0 A ${640 - r * 70} ${300 - r * 40} 0 0 1 ${640 - r * 70} 0`} fill={["#3A4A6A", "#4A5A7A", "#5A6A8A", "#6A7A9A"][r]} />)}
    <rect x={-120} y={-260} width={240} height={150} fill="#E9E2D0" /><circle cx={0} cy={-185} r={48} fill="#8FB3C9" />
    <path d="M-30 -190 Q0 -230 30 -190 Q0 -150 -30 -190 Z" fill="#E9E2D0" />
  </g>
);

// ------------------------------------------------------------------ people
export const SKINS = ["#F1C9A5", "#D9A57E", "#B47A52", "#8E5A36", "#6A3E22", "#4A2A16"];
export const CLOTH = ["#B3261E", "#3A5A8A", "#5E7D4A", "#E9A23B", "#6A4A6A", "#2E6A6A", "#C8743A", "#EFE6D2", "#3A3A44", "#A8456A"];
/** A paper person: head, body, arms that can rise (0 down … 1 up), mouth open when singing. */
export const Person: React.FC<{ x: number; y: number; s?: number; i: number; arms?: number; sing?: number; facing?: number; child?: boolean; scarf?: boolean }> =
  ({ x, y, s = 1, i, arms = 0, sing = 0, facing = 0, child, scarf }) => {
    const sk = SKINS[Math.floor(rand(i * 3.1) * SKINS.length)], cl = CLOTH[Math.floor(rand(i * 7.7) * CLOTH.length)];
    const hair = ["#14100C", "#3A2A1A", "#6A4A2A", "#C9A86A", "#E9E2D0"][Math.floor(rand(i * 5.3) * 5)];
    const ss = child ? 0.7 : 1;
    const a = arms * 2.6;
    return (
      <g transform={`translate(${x} ${y}) scale(${s * ss})`}>
        <path d="M-34 0 L-30 -120 Q0 -140 30 -120 L34 0 Z" fill={cl} stroke={C.ink} strokeWidth={4} />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 28} -118) rotate(${sd * (12 + a * 60)})`}>
            <rect x={-8} y={0} width={16} height={74} rx={8} fill={cl} stroke={C.ink} strokeWidth={3.5} /><circle cx={0} cy={78} r={10} fill={sk} stroke={C.ink} strokeWidth={3} />
          </g>
        ))}
        <rect x={-8} y={-146} width={16} height={18} fill={sk} />
        <circle cx={facing * 4} cy={-168} r={28} fill={sk} stroke={C.ink} strokeWidth={4} />
        <path d={`M${-28 + facing * 4} -172 Q${facing * 4} -214 ${28 + facing * 4} -172 Q${facing * 4} -190 ${-28 + facing * 4} -172 Z`} fill={hair} />
        {scarf && <path d={`M-30 -186 Q0 -214 30 -186 L34 -150 Q0 -140 -34 -150 Z`} fill={CLOTH[(i + 3) % CLOTH.length]} stroke={C.ink} strokeWidth={3} />}
        <circle cx={-9 + facing * 6} cy={-170} r={3} fill={C.ink} /><circle cx={9 + facing * 6} cy={-170} r={3} fill={C.ink} />
        <ellipse cx={facing * 6} cy={-154} rx={7} ry={2 + sing * 7} fill="#3A1A10" />
      </g>
    );
  };

export const Crowd: React.FC<{ t: number; n: number; y: number; x0?: number; x1?: number; s?: number; arms?: number; sing?: number; seed?: number; rows?: number }> =
  ({ t, n, y, x0 = 0, x1 = W, s = 1, arms = 0, sing = 0, seed = 0, rows = 1 }) => (
    <g>
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: n }).map((_, k) => {
        const i = seed + r * 97 + k;
        const x = lerp(x0, x1, (k + 0.5 + (r % 2) * 0.5) / n) + (rand(i) - 0.5) * 30;
        const ar = arms * clamp(0.6 + rand(i + 1) * 0.6) * (0.85 + 0.15 * Math.sin(t * 4 + i));
        const sg = sing * (0.5 + 0.5 * Math.abs(Math.sin(t * 5 + i)));
        return <Person key={`${r}-${k}`} x={x} y={y - r * 70} s={s * (1 - r * 0.12)} i={i} arms={ar} sing={sg} facing={(rand(i + 4) - 0.5) * 0.6} />;
      }))}
    </g>
  );

/** The faceless power: a suited figure with no face (no real person). */
export const Suit: React.FC<{ x: number; y: number; s?: number; arm?: number }> = ({ x, y, s = 1, arm = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-80 0 L-70 -260 Q0 -300 70 -260 L80 0 Z" fill="#1E1E26" stroke={C.ink} strokeWidth={5} />
    <path d="M-18 -282 L0 -230 L18 -282 Z" fill="#EFE6D2" /><path d="M-6 -262 L0 -150 L6 -262 Z" fill={C.red} />
    <g transform={`translate(62 -250) rotate(${-20 - arm * 60})`}><rect x={-14} y={0} width={28} height={150} rx={12} fill="#1E1E26" stroke={C.ink} strokeWidth={4} /><circle cx={0} cy={158} r={16} fill="#8E8A80" /></g>
    <rect x={-14} y={-308} width={28} height={28} fill="#5A5650" />
    <ellipse cx={0} cy={-345} rx={44} ry={50} fill="#5A5650" stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-345} rx={44} ry={50} fill="#000" opacity={0.35} />
  </g>
);

// ------------------------------------------------------------------ war & peace props
export const Jet: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#4A4A52" stroke={C.ink} strokeWidth={4}>
    <path d="M-120 0 L100 -12 L130 0 L100 12 Z" /><path d="M-10 -6 L-60 -80 L-30 -80 L30 -6 Z" /><path d="M-10 6 L-60 80 L-30 80 L30 6 Z" />
    <path d="M-110 -2 L-140 -40 L-120 -40 L-90 -4 Z" />
  </g>
);
export const Dove: React.FC<{ x: number; y: number; s?: number; flap?: number }> = ({ x, y, s = 1, flap = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FBF6EA" stroke={C.ink} strokeWidth={4}>
    <path d="M-60 10 Q-10 -10 40 0 Q70 -4 80 -14 L70 4 Q60 20 30 24 Q-20 30 -60 10 Z" />
    <path d={`M-10 0 Q-30 ${-70 - flap * 30} 30 ${-90 - flap * 20} Q10 -40 20 0 Z`} />
    <circle cx={62} cy={-8} r={3} fill={C.ink} /><path d="M80 -14 L94 -10 L80 -6 Z" fill={C.gold} />
    <path d="M86 -8 Q110 -2 120 10" stroke={C.green} strokeWidth={5} fill="none" />
  </g>
);
export const Sun: React.FC<{ x: number; y: number; r: number; t: number; o?: number }> = ({ x, y, r, t, o = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {Array.from({ length: 18 }).map((_, i) => (
      <path key={i} d={`M-22 ${-r - 8} L0 ${-r - 140 - (i % 2) * 70} L22 ${-r - 8} Z`} fill={i % 2 ? C.sun : C.gold} transform={`rotate(${i * 20 + t * 4})`} />
    ))}
    <circle r={r} fill={C.sun} stroke={C.ink} strokeWidth={5} /><circle r={r * 0.75} fill="#F8D56A" />
  </g>
);
export const House: React.FC<{ x: number; y: number; s?: number; i: number; broken?: number }> = ({ x, y, s = 1, i, broken = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${broken * (rand(i) - 0.5) * 30})`} stroke={C.ink} strokeWidth={4}>
    <rect x={-70} y={-120} width={140} height={120} fill={["#D9C29A", "#C9A877", "#E0CBA8"][i % 3]} />
    <path d={`M-84 -120 L0 ${-200 + broken * 60} L84 -120 Z`} fill={["#A8452E", "#7A4A2E", "#8E3A2A"][i % 3]} />
    <rect x={-20} y={-60} width={40} height={60} fill="#5A3A24" /><rect x={-56} y={-100} width={26} height={26} fill="#F5D27A" opacity={1 - broken} /><rect x={30} y={-100} width={26} height={26} fill="#F5D27A" opacity={1 - broken} />
  </g>
);
export const Cloud: React.FC<{ x: number; y: number; s?: number; dark?: boolean }> = ({ x, y, s = 1, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={dark ? "#4A4A58" : "#F4F0E6"} stroke={C.ink} strokeWidth={4}>
    <path d="M-160 30 Q-170 -30 -100 -30 Q-90 -90 -20 -80 Q20 -130 80 -90 Q150 -100 150 -30 Q200 -20 180 30 Z" />
  </g>
);
export const Candle: React.FC<{ x: number; y: number; s?: number; t: number; i?: number }> = ({ x, y, s = 1, t, i = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-70} r={40} fill={C.sun} opacity={0.25 + 0.1 * Math.sin(t * 9 + i)} />
    <rect x={-10} y={-50} width={20} height={50} fill="#FBF6EA" stroke={C.ink} strokeWidth={3} />
    <path d={`M0 -86 Q${10 + Math.sin(t * 12 + i) * 3} -62 0 -52 Q-10 -62 0 -86 Z`} fill={C.gold} stroke={C.ink} strokeWidth={2} />
  </g>
);

// ------------------------------------------------------------------ flags (simplified, drawn)
export type FlagCode = "BD" | "IN" | "CN" | "RU" | "US" | "JP" | "BR" | "NG" | "KE" | "EG" | "TR" | "FR" | "DE" | "GB" | "MX" | "ID" | "NP" | "ZA" | "AR" | "IT";
export const FLAGS: FlagCode[] = ["BD", "IN", "CN", "RU", "US", "JP", "BR", "NG", "KE", "EG", "TR", "FR", "DE", "GB", "MX", "ID", "NP", "ZA", "AR", "IT"];
export const Flag: React.FC<{ code: FlagCode; x: number; y: number; w?: number; wave?: number; t?: number }> = ({ code, x, y, w = 160, wave = 0, t = 0 }) => {
  const h = w * 0.62;
  const h3 = (a: string, b: string, c: string) => [a, b, c].map((col, i) => <rect key={i} x={0} y={(i * h) / 3} width={w} height={h / 3 + 0.5} fill={col} />);
  const v3 = (a: string, b: string, c: string) => [a, b, c].map((col, i) => <rect key={i} x={(i * w) / 3} y={0} width={w / 3 + 0.5} height={h} fill={col} />);
  const body: Record<FlagCode, React.ReactNode> = {
    BD: <><rect width={w} height={h} fill="#006A4E" /><circle cx={w * 0.45} cy={h / 2} r={h * 0.3} fill="#F42A41" /></>,
    IN: <>{h3("#FF9933", "#fff", "#138808")}<circle cx={w / 2} cy={h / 2} r={h * 0.12} fill="none" stroke="#000080" strokeWidth={2.5} /></>,
    CN: <><rect width={w} height={h} fill="#DE2910" /><circle cx={w * 0.18} cy={h * 0.28} r={h * 0.1} fill="#FFDE00" />{[0, 1, 2, 3].map((i) => <circle key={i} cx={w * (0.3 + (i % 2) * 0.05)} cy={h * (0.12 + i * 0.1)} r={h * 0.035} fill="#FFDE00" />)}</>,
    RU: <>{h3("#fff", "#0039A6", "#D52B1E")}</>,
    US: <>{Array.from({ length: 7 }).map((_, i) => <rect key={i} y={(i * 2 * h) / 13} width={w} height={h / 13} fill="#B22234" />)}<rect width={w} y={h / 13} height={0} /><rect width={w * 0.4} height={h * 0.54} fill="#3C3B6E" /></>,
    JP: <><rect width={w} height={h} fill="#fff" /><circle cx={w / 2} cy={h / 2} r={h * 0.28} fill="#BC002D" /></>,
    BR: <><rect width={w} height={h} fill="#009C3B" /><path d={`M${w / 2} ${h * 0.1} L${w * 0.92} ${h / 2} L${w / 2} ${h * 0.9} L${w * 0.08} ${h / 2} Z`} fill="#FFDF00" /><circle cx={w / 2} cy={h / 2} r={h * 0.22} fill="#002776" /></>,
    NG: <>{v3("#008751", "#fff", "#008751")}</>,
    KE: <>{h3("#000", "#BB0000", "#006600")}<rect y={h / 3 - 3} width={w} height={6} fill="#fff" /><rect y={(2 * h) / 3 - 3} width={w} height={6} fill="#fff" /><ellipse cx={w / 2} cy={h / 2} rx={w * 0.08} ry={h * 0.32} fill="#BB0000" stroke="#000" strokeWidth={2} /></>,
    EG: <>{h3("#CE1126", "#fff", "#000")}<rect x={w * 0.45} y={h * 0.4} width={w * 0.1} height={h * 0.2} fill="#C09300" /></>,
    TR: <><rect width={w} height={h} fill="#E30A17" /><circle cx={w * 0.38} cy={h / 2} r={h * 0.25} fill="#fff" /><circle cx={w * 0.43} cy={h / 2} r={h * 0.2} fill="#E30A17" /></>,
    FR: <>{v3("#0055A4", "#fff", "#EF4135")}</>, DE: <>{h3("#000", "#DD0000", "#FFCE00")}</>, IT: <>{v3("#009246", "#fff", "#CE2B37")}</>,
    GB: <><rect width={w} height={h} fill="#012169" /><path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#fff" strokeWidth={h * 0.18} /><rect x={w * 0.42} width={w * 0.16} height={h} fill="#fff" /><rect y={h * 0.38} width={w} height={h * 0.24} fill="#fff" /><rect x={w * 0.45} width={w * 0.1} height={h} fill="#C8102E" /><rect y={h * 0.42} width={w} height={h * 0.16} fill="#C8102E" /></>,
    MX: <>{v3("#006847", "#fff", "#CE1126")}<circle cx={w / 2} cy={h / 2} r={h * 0.12} fill="#8A6A3A" /></>,
    ID: <><rect width={w} height={h / 2} fill="#CE1126" /><rect y={h / 2} width={w} height={h / 2} fill="#fff" /></>,
    NP: <><path d={`M0 0 L${w * 0.7} ${h * 0.45} L${w * 0.3} ${h * 0.45} L${w * 0.7} ${h} L0 ${h} Z`} fill="#DC143C" stroke="#003893" strokeWidth={5} /></>,
    ZA: <><rect width={w} height={h / 2} fill="#E03C31" /><rect y={h / 2} width={w} height={h / 2} fill="#001489" /><path d={`M0 0 L${w * 0.45} ${h / 2} L0 ${h} Z`} fill="#007749" stroke="#FFB81C" strokeWidth={5} /><rect y={h * 0.42} width={w} height={h * 0.16} fill="#007749" /></>,
    AR: <>{h3("#74ACDF", "#fff", "#74ACDF")}<circle cx={w / 2} cy={h / 2} r={h * 0.1} fill="#F6B40E" /></>,
  };
  const sk = wave ? Math.sin(t * 4 + x * 0.01) * 6 * wave : 0;
  return (
    <g transform={`translate(${x} ${y}) skewY(${sk * 0.5})`}>
      <line x1={0} y1={-10} x2={0} y2={h * 2.6} stroke={C.ink} strokeWidth={6} />
      <g transform="translate(3 0)"><clipPath id={`fl${code}${Math.round(x)}`}><rect width={w} height={h} /></clipPath>
        <g clipPath={`url(#fl${code}${Math.round(x)})`}>{body[code]}</g><rect width={w} height={h} fill="none" stroke={C.ink} strokeWidth={4} /></g>
    </g>
  );
};

export { rand, clamp, lerp, backOut };
