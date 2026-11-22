import React from "react";
import { blink, clamp, ease, easeOut, kf, lerp, noise, ramp, rand, win } from "../tuinei/lib";
import { INK, Person } from "../tuinei/chars";
import { CU } from "../tuinei/shotsA";
import { mouth } from "../tuinei/lips";
import { projector, CITIES } from "./map";
import { Glow, PAL, Tint, Title } from "./kit";

// The sixteen scenes of the Rapar Rubel journey, cut to "তুই নেই" (0:00-1:53.6). t = song clock (s).
export type Scene = { a: number; b: number; draw: (t: number) => React.ReactNode };
const P = PAL;

// ------------------------------------------------------------ Dhaka skyline (night / sunrise)
const Skyline: React.FC<{ t: number; px: number; sun?: number }> = ({ t, px, sun = 0 }) => {
  const sky = sun ? ["#F2B88A", "#F6D7B4", "#E9A27A"] : ["#081B20", "#173E46", "#2C5559"];
  return (
    <g>
      <defs>
        <linearGradient id={`sky${sun}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.65" stopColor={sky[1]} /><stop offset="1" stopColor={sky[2]} /></linearGradient>
        <linearGradient id={`lake${sun}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sun ? "#C98C6E" : "#1E4A52"} /><stop offset="1" stopColor={sun ? "#3D6A6E" : "#0A2226"} /></linearGradient>
      </defs>
      <rect width={1920} height={1080} fill={`url(#sky${sun})`} />
      {sun ? <><Glow x={1180} y={lerp(720, 520, sun)} r={420} color="#FFD9A0" /><circle cx={1180} cy={lerp(720, 520, sun)} r={70} fill="#FFF0D2" /></> :
        Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={rand(i) * 1920} cy={rand(i * 3) * 420} r={0.8 + rand(i * 7) * 1.6} fill="#F2E2C6" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))} />)}
      {/* far towers */}
      <g transform={`translate(${-px * 0.25} 0)`}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = -200 + i * 85, h = 150 + rand(i * 2.3) * 260;
          return <rect key={i} x={x} y={640 - h} width={70} height={h} fill={sun ? "#B9816C" : "#14343B"} />;
        })}
      </g>
      {/* near towers with lit windows, a mosque dome and minaret */}
      <g transform={`translate(${-px * 0.5} 0)`}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = -260 + i * 130, h = 220 + rand(i * 5.1) * 330, w = 104;
          return <g key={i}>
            <rect x={x} y={660 - h} width={w} height={h} fill={sun ? "#8E5E52" : "#0F2C33"} />
            {!sun && Array.from({ length: Math.floor(h / 34) * 3 }).map((_, k) => rand(i * 31 + k) > 0.55 && (
              <rect key={k} x={x + 12 + (k % 3) * 30} y={660 - h + 16 + Math.floor(k / 3) * 34} width={16} height={18} fill={P.orange2} opacity={0.55 + 0.45 * Math.abs(Math.sin(t * 0.3 + k + i))} />
            ))}
          </g>;
        })}
        <g transform="translate(1440 660)" fill={sun ? "#8E5E52" : "#0F2C33"}>
          <rect x={-90} y={-120} width={180} height={120} /><path d="M-80 -120 Q0 -250 80 -120 Z" /><rect x={110} y={-300} width={26} height={300} /><path d="M106 -300 L123 -340 L140 -300 Z" />
        </g>
      </g>
      {/* the curving lakeside bridge */}
      <g transform={`translate(${-px * 0.8} 0)`}>
        <path d="M-200 700 C300 650 700 760 1100 700 S1900 640 2400 690" fill="none" stroke={sun ? "#5A4A48" : "#091E22"} strokeWidth={22} />
        <path d="M-200 690 C300 640 700 750 1100 690 S1900 630 2400 680" fill="none" stroke={sun ? "#F2E2C6" : "#C8D6D0"} strokeWidth={4} opacity={0.8} />
        {Array.from({ length: 22 }).map((_, i) => { const x = -160 + i * 120, y = 690 + Math.sin(i * 0.6) * 20; return <g key={i}><line x1={x} y1={y} x2={x} y2={y - 46} stroke={sun ? "#5A4A48" : "#091E22"} strokeWidth={4} />{!sun && <circle cx={x} cy={y - 48} r={4} fill={P.gold} />}</g>; })}
      </g>
      <rect x={0} y={710} width={1920} height={370} fill={`url(#lake${sun})`} />
      {/* reflections */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = ((rand(i) * 2200 - px * 0.5) % 2200 + 2200) % 2200 - 140, y = 740 + rand(i * 9) * 300;
        return <rect key={i} x={x + Math.sin(t * 1.4 + i) * 8} y={y} width={30 + rand(i * 3) * 70} height={3} fill={sun ? "#FFE2B8" : P.orange2} opacity={sun ? 0.35 : 0.4} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------ props
const Crate: React.FC<{ x: number; y: number; w: number; h: number; c: string }> = ({ x, y, w, h, c }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={c} stroke={P.ink} strokeWidth={3} />
    {Array.from({ length: Math.floor(w / 22) }).map((_, i) => <line key={i} x1={x + 11 + i * 22} y1={y + 6} x2={x + 11 + i * 22} y2={y + h - 6} stroke="#000" strokeWidth={3} opacity={0.18} />)}
    <rect x={x} y={y} width={w} height={8} fill="#fff" opacity={0.12} /></g>
);
const Phone: React.FC<{ w?: number; h?: number; children?: React.ReactNode }> = ({ w = 260, h = 520, children }) => (
  <g><rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={40} fill="#11191C" stroke={INK} strokeWidth={4} />
    <clipPath id={`ph${w}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} /></clipPath>
    <g clipPath={`url(#ph${w})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#16262B" />{children}</g></g>
);
const Bubble: React.FC<{ x: number; y: number; k: number; me?: boolean; w?: number }> = ({ x, y, k, me, w = 170 }) => (
  <g transform={`translate(${x} ${y}) scale(${clamp(k)})`} opacity={clamp(k * 2)}>
    <rect x={me ? -w : 0} y={-26} width={w} height={52} rx={22} fill={me ? P.orange : P.cream} />
    {[0, 1].map((i) => <rect key={i} x={(me ? -w : 0) + 18} y={-12 + i * 14} width={w * (i ? 0.45 : 0.75)} height={7} rx={3} fill={me ? "#fff" : P.teal2} opacity={0.7} />)}
  </g>
);
const Kurti: React.FC<{ x: number; y: number; c: string; c2: string; sw?: number }> = ({ x, y, c, c2, sw = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${sw})`}>
    <path d="M0 -40 L0 -10 M-26 -10 Q0 -40 26 -10" fill="none" stroke="#C9B48A" strokeWidth={5} />
    <path d="M-50 0 L-90 60 L-70 80 L-46 50 L-56 300 L56 300 L46 50 L70 80 L90 60 L50 0 Q0 22 -50 0 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={-36 + (i % 4) * 24} cy={90 + Math.floor(i / 4) * 60} r={7} fill={c2} opacity={0.85} />)}
    <path d="M-50 260 H50" stroke={c2} strokeWidth={10} />
  </g>
);

// ------------------------------------------------------------ the scenes
export const SCENES: Scene[] = [
  // 0:00 Dhaka at night
  { a: 0, b: 9.3, draw: (t) => (
    <g transform={`translate(960 540) scale(${lerp(1, 1.06, t / 9.3)}) translate(-960 -540)`}>
      <Skyline t={t} px={t * 18} />
      <Title text="ঢাকা" t={t} a={2.9} b={8.6} x={1280} y={520} size={330} />
    </g>
  ) },
  // the rooftop, the dream
  { a: 9.3, b: 16.4, draw: (t) => {
    const ph = ease((t - 12.6) / 0.8);
    return <g>
      <g transform="translate(0 120)"><Skyline t={t} px={200} /></g>
      <rect x={0} y={860} width={1920} height={220} fill="#123038" />
      <rect x={0} y={840} width={1920} height={26} fill="#1F444C" /><rect x={0} y={840} width={1920} height={4} fill={P.orange2} opacity={0.35} />
      {/* black water tank, antenna, clothes line */}
      <g transform="translate(260 840)"><rect x={-70} y={-200} width={140} height={200} rx={18} fill="#0A1A1E" /><ellipse cx={0} cy={-200} rx={70} ry={14} fill="#16292E" />{[-150, -100, -50].map((y) => <line key={y} x1={-70} y1={y} x2={70} y2={y} stroke="#1C3238" strokeWidth={4} />)}</g>
      <path d="M1700 840 V560 M1660 600 H1740 M1670 640 H1730" stroke="#0A1A1E" strokeWidth={6} />
      <path d="M420 700 Q900 760 1500 690" fill="none" stroke="#0A1A1E" strokeWidth={3} />
      {[600, 760, 1180].map((x, i) => <path key={i} d={`M${x} ${716 + i * 6} l-40 8 l12 90 h56 l12 -90 Z`} fill={[P.rust, P.teal3, P.cream][i]} opacity={0.75} />)}
      <Person who="rubel" x={1080} y={1070} s={0.72} legs="sit" f={{ yaw: lerp(0.7, 0.2, ph), gazeY: ph * 0.8, smile: 0.2 + ph * 0.4, blink: blink(t, 3), light: 1 }}
        l={[-80, -300]} r={ph > 0.1 ? [lerp(80, 10, ph), lerp(-300, -560, ph)] : [80, -300]}
        hold={ph > 0.1 ? <g transform="rotate(-8)"><rect x={-26} y={-46} width={52} height={92} rx={10} fill="#11191C" /><rect x={-21} y={-40} width={42} height={80} rx={6} fill="#CFE6E8" opacity={ph} /></g> : undefined} />
      <Tint color="#2B5862" o={0.55} />
      {ph > 0 && <Glow x={1080} y={560} r={260} color="#BFE6EA" o={ph * 0.55} />}
    </g>;
  } },
  // the idea, sketched on the phone
  { a: 16.4, b: 21.7, draw: (t) => {
    const lt = t - 16.4, dr = (d: number, len: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - ease((lt - d) / 0.7)) });
    return <g>
      <rect width={1920} height={1080} fill={P.night} />
      <Glow x={960} y={520} r={700} color="#2C6670" o={0.8} />
      <g transform={`translate(960 560) rotate(${lerp(-4, -2, lt / 5)}) scale(1.75)`}>
        <Phone w={420} h={260}>
          <g stroke={P.cream} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-170 -10 h50 v50 h-50 Z M-170 -10 l14 -14 h50 l-14 14 M-106 -24 v50 l-14 14" style={dr(0.2, 260)} />
            <path d="M-90 20 H-40 m-14 -12 l14 12 l-14 12" style={dr(0.9, 90)} />
            <path d="M-30 40 h110 l-14 22 h-82 Z M0 40 v-40 h40 v40" style={dr(1.4, 330)} stroke={P.orange2} />
            <path d="M96 20 H140 m-14 -12 l14 12 l-14 12" style={dr(2.1, 80)} />
            <path d="M150 40 v-50 l30 -24 l30 24 v50 Z" style={dr(2.6, 230)} />
            <path d="M180 0 c-8 -10 -20 0 -12 10 l12 12 l12 -12 c8 -10 -4 -20 -12 -10" style={dr(3.3, 80)} stroke={P.orange} />
          </g>
        </Phone>
      </g>
      {/* his thumbs */}
      <g fill="#C98652" stroke={INK} strokeWidth={5}><ellipse cx={560} cy={850} rx={90} ry={60} transform="rotate(-30 560 850)" /><ellipse cx={1360} cy={860} rx={90} ry={60} transform="rotate(30 1360 860)" /></g>
    </g>;
  } },
  // the route from China
  { a: 21.7, b: 27.7, draw: (t) => {
    const lt = t - 21.7, route = ease((lt - 0.4) / 4.6);
    const path = "M1480 230 C1500 420 1320 560 1100 640 S760 760 640 640";
    return <g>
      <rect width={1920} height={1080} fill="#1C4C55" />
      {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M0 ${80 + i * 64} q240 ${Math.sin(t + i) * 8} 480 0 t480 0 t480 0 t480 0`} fill="none" stroke="#2C6670" strokeWidth={3} opacity={0.5} />)}
      <path d="M980 0 H1920 V420 C1760 400 1640 330 1560 260 C1440 160 1220 140 980 80 Z" fill={P.peach} />
      <path d="M980 0 H1920 V420 C1760 400 1640 330 1560 260 C1440 160 1220 140 980 80 Z" fill="none" stroke={P.ink} strokeWidth={4} />
      <path d="M0 520 C200 500 420 520 560 560 C640 600 620 700 700 760 C780 820 720 1080 720 1080 H0 Z" fill={P.peach} stroke={P.ink} strokeWidth={4} />
      <circle cx={1480} cy={230} r={14} fill={P.orange} /><circle cx={640} cy={640} r={14} fill={P.orange} />
      <path d={path} fill="none" stroke={P.cream} strokeWidth={6} strokeDasharray="16 14" pathLength={1000} style={{ strokeDasharray: `${route * 1000} 1000` }} />
      {(() => { const k = route, x = lerp(1480, 640, k), y = 230 + Math.sin(k * Math.PI) * 420 + (k * 410); return <g transform={`translate(${x} ${y}) rotate(${lerp(110, 160, k)})`}><path d="M-40 -14 H34 L48 0 L34 14 H-40 Z" fill={P.cream} stroke={P.ink} strokeWidth={3} />{[-30, -14, 2].map((dx) => <rect key={dx} x={dx} y={-10} width={14} height={20} fill={[P.orange, P.teal3, P.rust][(dx + 30) / 16]} />)}</g>; })()}
      <Title text="চীন থেকে" t={t} a={22.6} b={27.4} x={360} y={300} size={170} />
    </g>;
  } },
  // the port at dusk
  { a: 27.7, b: 34.55, draw: (t) => {
    const lt = t - 27.7, lower = ease((lt - 0.8) / 3.0);
    return <g transform={`translate(${-lt * 8} 0)`}>
      <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9875A" /><stop offset="0.7" stopColor="#F4CFAE" /><stop offset="1" stopColor="#F2B88A" /></linearGradient></defs>
      <rect x={-100} width={2200} height={1080} fill="url(#dusk)" />
      <Glow x={420} y={540} r={380} color="#FFE2B0" /><circle cx={420} cy={540} r={60} fill="#FFF0D2" />
      {[300, 900, 1500].map((x, i) => <g key={i} fill="#173E46"><rect x={x} y={220} width={28} height={560} /><rect x={x + 180} y={220} width={28} height={560} /><rect x={x - 160} y={210} width={560} height={34} /><rect x={x + 60} y={160} width={90} height={60} /></g>)}
      <path d={`M${1080} 244 V${lerp(300, 520, lower)}`} stroke="#0C242A" strokeWidth={4} />
      <g transform={`translate(980 ${lerp(300, 520, lower)})`}><Crate x={0} y={0} w={220} h={90} c={P.orange} /></g>
      <rect x={-100} y={780} width={2200} height={300} fill="#1F4A52" />
      {[[100, 610, P.teal2], [100, 700, P.rust], [330, 700, P.cream], [330, 610, P.orange2], [560, 700, P.teal3], [1300, 700, P.orange], [1530, 700, P.teal2], [1530, 610, P.cream], [1300, 610, P.rust]].map(([x, y, c], i) => <Crate key={i} x={x as number} y={y as number} w={220} h={90} c={c as string} />)}
      <Person who="rubel" x={1100} y={1180} s={0.62} f={{ yaw: -0.45, gazeY: -0.5, smile: 0.3, blink: blink(t, 3) }} r={[20, -560]}
        hold={<g transform="rotate(-10)"><rect x={-40} y={-60} width={80} height={110} rx={6} fill="#C9A06A" stroke={INK} strokeWidth={4} /><rect x={-30} y={-40} width={60} height={80} fill={P.cream} /></g>} />
      <Tint color="#F0A070" o={0.25} />
    </g>;
  } },
  // the shop: toys, stationery, bags; orders arriving
  { a: 34.55, b: 42.92, draw: (t) => {
    const lt = t - 34.55, tape = ease((lt - 1.2) / 1.6);
    return <g>
      <rect width={1920} height={1080} fill="#2A5059" />
      <Glow x={960} y={300} r={900} color="#F2B25C" o={0.35} />
      {[200, 430, 660].map((y, r) => <g key={r}><rect x={120} y={y + 130} width={1680} height={22} fill="#7A4B30" />
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 170 + i * 138, k = (i + r * 3) % 4;
          return <g key={i} transform={`translate(${x} ${y + 130})`}>
            {k === 0 && <g><circle cx={0} cy={-52} r={40} fill="#C98A52" stroke={INK} strokeWidth={3} /><circle cx={-28} cy={-86} r={14} fill="#C98A52" stroke={INK} strokeWidth={3} /><circle cx={28} cy={-86} r={14} fill="#C98A52" stroke={INK} strokeWidth={3} /><circle cx={0} cy={-104} r={30} fill="#C98A52" stroke={INK} strokeWidth={3} /></g>}
            {k === 1 && <g><rect x={-46} y={-52} width={92} height={36} rx={10} fill={P.orange} stroke={INK} strokeWidth={3} /><circle cx={-26} cy={-14} r={12} fill={INK} /><circle cx={26} cy={-14} r={12} fill={INK} /></g>}
            {k === 2 && <g>{[-30, -10, 10, 30].map((dx, j) => <rect key={j} x={dx - 8} y={-110 + j * 6} width={16} height={110 - j * 6} fill={[P.cream, P.teal3, P.gold, P.rust][j]} stroke={INK} strokeWidth={2} />)}</g>}
            {k === 3 && <g><path d="M-44 0 V-90 Q-44 -110 -24 -110 H24 Q44 -110 44 -90 V0 Z" fill={P.teal3} stroke={INK} strokeWidth={3} /><path d="M-20 -110 Q0 -140 20 -110" fill="none" stroke={INK} strokeWidth={6} /></g>}
          </g>;
        })}</g>)}
      <rect x={0} y={860} width={1920} height={220} fill="#5E3A26" />
      <g transform="translate(860 800)"><rect x={-160} y={-120} width={320} height={160} fill="#C9A06A" stroke={INK} strokeWidth={5} />
        <rect x={-160} y={-58} width={320 * tape} height={34} fill="#D8C8A8" opacity={0.95} /></g>
      <Person who="rubel" x={1260} y={1240} s={0.66} legs="hidden" f={{ yaw: -0.5, gazeY: 0.8, smile: 0.4, blink: blink(t, 3) }} l={[-420 + tape * 180, -560]} r={[-300, -520]} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = backK((t - 36.0 - i * 1.0) / 0.4);
        return <g key={i} transform={`translate(${1520 - (i % 2) * 120} ${640 - i * 92})`}><Bubble x={0} y={0} k={k} w={200} />
          {k > 0.5 && <g transform="translate(176 0)"><circle r={18} fill={P.orange} /><path d="M-8 0 l6 6 l10 -12" stroke="#fff" strokeWidth={4} fill="none" /></g>}</g>;
      })}
    </g>;
  } },
  // across Bangladesh
  { a: 42.92, b: 48.24, draw: (t) => {
    const pr = projector({ cx: 1100, cy: 560, s: 1.15, tilt: 18 });
    const [dx, dy] = pr.city("dhaka");
    const targets = ["ctg", "sylhet", "rajshahi", "khulna", "rangpur", "barishal", "mymensingh", "coxs", "comilla", "bogura"];
    return <g>
      <rect width={1920} height={1080} fill="#123A42" />
      <path d={pr.d} transform="translate(10 26)" fill="#081A1E" opacity={0.5} />
      <path d={pr.d} fill={P.teal3} stroke={P.cream} strokeWidth={3} />
      {targets.map((c, i) => {
        const [x, y] = pr.city(c), k = ease((t - 43.3 - i * 0.22) / 0.9);
        const mx = (dx + x) / 2 + (y - dy) * 0.2, my = (dy + y) / 2 - Math.abs(x - dx) * 0.25 - 30;
        return <g key={c}>
          <path d={`M${dx} ${dy} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={P.orange2} strokeWidth={4} pathLength={1} strokeDasharray={`${k} 1`} />
          {k >= 1 && <g><Glow x={x} y={y} r={40} color={P.orange2} /><circle cx={x} cy={y} r={8} fill={P.cream} /></g>}
        </g>;
      })}
      <Glow x={dx} y={dy} r={80} color={P.gold} /><circle cx={dx} cy={dy} r={12} fill={P.orange} stroke={P.cream} strokeWidth={4} />
      <Title text="সারা বাংলাদেশে" t={t} a={43.4} b={48.0} x={120} y={980} size={120} anchor="start" />
    </g>;
  } },
  // The AB Wardrobe: kurtis on the rail, a product shot
  { a: 48.24, b: 54.44, draw: (t) => {
    const lt = t - 48.24, slide = ease(lt / 5.5) * 520, shot = win(lt, 3.6, 4.0, 0.05, 0.25);
    return <g>
      <rect width={1920} height={1080} fill="#EBD4B8" />
      <rect x={0} y={760} width={1920} height={320} fill="#C99A78" />
      <Glow x={960} y={360} r={760} color="#FFF3DE" o={0.6} />
      <rect x={0} y={150} width={1920} height={16} fill="#6B4A33" />
      {Array.from({ length: 9 }).map((_, i) => <Kurti key={i} x={200 + i * 260 - slide} y={190} c={[P.teal2, P.orange, "#C9A04A", P.rust, "#7E9C8C", P.cream][i % 6]} c2={["#F2E2C6", "#173E46", "#9A3E22", "#F2B25C"][i % 4]} sw={Math.sin(t * 2 + i) * 2} />)}
      <Person who="rubel" x={1360} y={1260} s={0.72} legs="hidden" f={{ yaw: -0.55, smile: 0.4, blink: shot > 0.2 ? 0.6 : blink(t, 3) }} l={[-160, -760]} r={[-70, -730]}
        hold={<g transform="translate(-90 -20)"><rect x={-60} y={-100} width={110} height={180} rx={14} fill="#11191C" stroke={INK} strokeWidth={4} /></g>} />
      <rect width={1920} height={1080} fill="#fff" opacity={shot * 0.6} />
    </g>;
  } },
  // travel: to the sea
  { a: 54.44, b: 59.1, draw: (t) => {
    const lt = t - 54.44;
    return <g>
      <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F0A57A" /><stop offset="0.55" stopColor="#F6D2B0" /><stop offset="1" stopColor="#F2B88A" /></linearGradient></defs>
      <rect width={1920} height={1080} fill="url(#sea)" />
      <Glow x={1300} y={560} r={460} color="#FFE2B0" /><circle cx={1300} cy={600} r={80} fill="#FFF0D2" />
      <rect x={0} y={620} width={1920} height={220} fill="#3D7479" />
      {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M-100 ${660 + i * 30} ${Array.from({ length: 12 }).map((_, k) => `q90 ${(k + i) % 2 ? 10 : -10} 180 0`).join(" ")}`} fill="none" stroke="#F4CFAE" strokeWidth={3} opacity={0.5} transform={`translate(${Math.sin(t + i) * 30} 0)`} />)}
      <rect x={0} y={640} width={1920} height={30} fill="#FFE2B0" opacity={0.4} />
      <path d={`M0 820 Q480 ${800 + Math.sin(t * 1.2) * 12} 960 830 T1920 820 V1080 H0 Z`} fill="#E9C39A" />
      <path d={`M0 820 Q480 ${800 + Math.sin(t * 1.2) * 12} 960 830 T1920 820`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.6} />
      <Person who="rubel" x={lerp(500, 820, lt / 4.7)} y={1010} s={0.42} legs="stride" phase={t * 7} f={{ yaw: 0.6, smile: 0.5 }} bag />
      <Tint color="#E9A27A" o={0.18} />
    </g>;
  } },
  // property: the G+9 by the lake
  { a: 59.1, b: 63.88, draw: (t) => {
    const lt = t - 59.1, floors = Math.min(10, Math.floor(ease(lt / 3.6) * 10.99));
    return <g>
      <rect width={1920} height={1080} fill="#F2D6B4" />
      <Glow x={1500} y={300} r={500} color="#FFE7C2" />
      <rect x={0} y={760} width={1920} height={320} fill="#6F9C9C" />
      {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={0} y1={790 + i * 34} x2={1920} y2={790 + i * 34} stroke="#F2E2C6" strokeWidth={2} opacity={0.3} />)}
      <rect x={0} y={700} width={1920} height={70} fill="#8FA584" />
      <g transform="translate(1080 720)">
        {Array.from({ length: floors }).map((_, i) => <g key={i}><rect x={-160} y={-62 * (i + 1)} width={320} height={60} fill={i === floors - 1 ? P.cream : "#E9DBC2"} stroke={INK} strokeWidth={3} />
          {[-120, -50, 20, 90].map((x) => <rect key={x} x={x} y={-62 * (i + 1) + 14} width={44} height={32} fill="#3D7479" opacity={0.8} />)}</g>)}
        <path d={`M200 0 V${-62 * 11 - 40} H-60 M200 ${-62 * 11 - 40} H320`} stroke="#173E46" strokeWidth={10} fill="none" />
        <path d={`M-60 ${-62 * 11 - 40} V${-62 * floors - 30}`} stroke="#173E46" strokeWidth={3} />
      </g>
      <Person who="rubel" x={560} y={1120} s={0.66} f={{ yaw: 0.55, gazeY: -0.9, pitch: 0.5, smile: 0.5, blink: blink(t, 3) }} r={[40, -560]}
        hold={<rect x={-14} y={-90} width={28} height={180} rx={12} fill={P.cream} stroke={INK} strokeWidth={4} transform="rotate(30)" />} />
    </g>;
  } },
  // night desk, top-down: building with AI
  { a: 63.88, b: 69.86, draw: (t) => {
    const lt = t - 63.88, rise = ease((lt - 3.0) / 2.6);
    const tap = (i: number) => Math.max(0, Math.sin(t * 16 + i * 2)) * 10;
    return <g>
      <rect width={1920} height={1080} fill="#3B2418" />
      {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={0} y={i * 80} width={1920} height={4} fill="#000" opacity={0.15} />)}
      <Glow x={700} y={380} r={520} color="#F2B25C" o={0.55} />
      <g transform="translate(960 470) rotate(-6)">
        <rect x={-330} y={-220} width={660} height={300} rx={16} fill="#1A2226" stroke={INK} strokeWidth={5} />
        <rect x={-300} y={-196} width={600} height={252} fill="#0F2C33" />
        {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-280 + (i % 3) * 14} y={-180 + i * 26} width={120 + rand(i) * 300} height={10} rx={4} fill={i % 3 === 1 ? P.orange2 : "#6FB8BE"} opacity={0.75} />)}
        <rect x={-340} y={90} width={680} height={250} rx={16} fill="#2A3338" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 12 }).map((_, c) => <rect key={`${r}${c}`} x={-310 + c * 52} y={110 + r * 44} width={44} height={36} rx={5} fill="#3D474D" />))}
      </g>
      <g transform="translate(1460 760) rotate(10)"><rect x={-150} y={-110} width={300} height={220} fill={P.cream} stroke={INK} strokeWidth={4} />{Array.from({ length: 6 }).map((_, i) => <line key={i} x1={-120} y1={-80 + i * 30} x2={60 + rand(i) * 60} y2={-80 + i * 30} stroke={P.teal2} strokeWidth={4} />)}</g>
      <g transform="translate(460 800)"><circle r={60} fill="#E8EEF0" opacity={0.6} stroke="#8E9A9E" strokeWidth={4} /><circle r={48} fill="#B5642A" /><circle r={48} fill="none" stroke="#E9C9A0" strokeWidth={6} /></g>
      {/* his hands on the keys */}
      <g fill="#C98652" stroke={INK} strokeWidth={5}><ellipse cx={850} cy={700 - tap(0)} rx={70} ry={52} /><ellipse cx={1090} cy={690 - tap(1)} rx={70} ry={52} /></g>
      <g fill="#EFE6D2" stroke={INK} strokeWidth={5}><path d="M760 1080 L820 740 L900 760 L860 1080 Z" /><path d="M1200 1080 L1140 730 L1060 750 L1100 1080 Z" /></g>
      {/* the workflow rises off the screen */}
      {rise > 0 && Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + t * 0.4, r = 160 + (i % 2) * 80;
        const x = 960 + Math.cos(a) * r * rise, y = 260 + Math.sin(a) * r * 0.5 * rise - rise * 60;
        return <g key={i}><line x1={960} y1={330} x2={x} y2={y} stroke={P.orange2} strokeWidth={3} opacity={rise * 0.7} /><circle cx={x} cy={y} r={18 * rise} fill={P.cream} stroke={P.orange} strokeWidth={4} /></g>;
      })}
      <Tint color="#1A3A44" o={0.25} />
    </g>;
  } },
  // AI: on the sung "তুই"
  { a: 69.86, b: 75.42, draw: (t) => {
    const lt = t - 69.86, k = easeOut(lt / 1.4);
    const icons = ["chat", "doc", "chart", "cart", "mic", "drive", "cal", "mail"];
    return <g>
      <rect width={1920} height={1080} fill={P.night} />
      <Glow x={960} y={540} r={760 * k} color="#245861" />
      {icons.map((ic, i) => {
        const a = (i / icons.length) * Math.PI * 2 + lt * 0.25, r = 330 * k;
        const x = 960 + Math.cos(a) * r, y = 540 + Math.sin(a) * r * 0.62;
        return <g key={ic}>
          <line x1={960} y1={540} x2={x} y2={y} stroke={P.orange2} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={0.8} />
          <g transform={`translate(${x} ${y}) scale(${k})`}><circle r={52} fill={P.teal2} stroke={P.cream} strokeWidth={4} />
            {ic === "chat" && <path d="M-24 -16 h48 v28 h-30 l-12 12 v-12 h-6 Z" fill={P.cream} />}
            {ic === "doc" && <path d="M-18 -26 h26 l12 12 v40 h-38 Z" fill={P.cream} />}
            {ic === "chart" && <g fill={P.cream}><rect x={-22} y={0} width={10} height={20} /><rect x={-6} y={-14} width={10} height={34} /><rect x={10} y={-24} width={10} height={44} /></g>}
            {ic === "cart" && <path d="M-26 -18 h8 l8 30 h26 l6 -20 h-36" fill="none" stroke={P.cream} strokeWidth={5} />}
            {ic === "mic" && <g fill={P.cream}><rect x={-9} y={-26} width={18} height={32} rx={9} /><rect x={-2} y={8} width={4} height={14} /></g>}
            {ic === "drive" && <path d="M-26 14 L-6 -22 H10 L30 14 Z" fill="none" stroke={P.cream} strokeWidth={5} />}
            {ic === "cal" && <g><rect x={-22} y={-18} width={44} height={40} rx={5} fill={P.cream} /><rect x={-22} y={-18} width={44} height={10} fill={P.orange} /></g>}
            {ic === "mail" && <g><rect x={-24} y={-16} width={48} height={32} rx={4} fill={P.cream} /><path d="M-24 -16 L0 4 L24 -16" fill="none" stroke={P.teal2} strokeWidth={4} /></g>}
          </g>
        </g>;
      })}
      <circle cx={960} cy={540} r={120 * k} fill={P.orange} />
      <Title text="AI" t={t} a={69.86} b={75.1} x={960} y={600} size={170} color={P.cream} stagger={0.12} />
    </g>;
  } },
  // MimAI: the files come to the chat
  { a: 75.42, b: 80.8, draw: (t) => {
    const lt = t - 75.42;
    return <g>
      <rect width={1920} height={1080} fill="#173E46" />
      <Glow x={1240} y={560} r={600} color="#3D7479" />
      {Array.from({ length: 8 }).map((_, i) => {
        const k = ease((lt - 0.3 - i * 0.28) / 1.2), sx = 260 + (i % 4) * 150, sy = 280 + Math.floor(i / 4) * 300;
        const x = lerp(sx, 1240, k), y = lerp(sy, 560, k) - Math.sin(k * Math.PI) * 120;
        return k < 1 && <g key={i} transform={`translate(${x} ${y}) scale(${lerp(1, 0.3, k)}) rotate(${(1 - k) * (i % 2 ? 8 : -8)})`}>
          <path d="M-70 -40 H-20 L-8 -26 H70 V44 H-70 Z" fill={[P.gold, P.orange2, P.cream][i % 3]} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>;
      })}
      <g transform="translate(1240 560) scale(1.5)"><Phone w={280} h={520}>
        <rect x={-140} y={-260} width={280} height={60} fill={P.teal2} />
        <Bubble x={-120} y={-150} k={ramp(t, 76.2, 0.3)} w={190} />
        <Bubble x={120} y={-70} k={ramp(t, 77.3, 0.3)} me w={170} />
        <Bubble x={-120} y={10} k={ramp(t, 78.4, 0.3)} w={210} />
        {t > 79.1 && <g transform="translate(-30 100)"><path d="M-70 -30 H-26 L-16 -18 H70 V40 H-70 Z" fill={P.gold} stroke={INK} strokeWidth={3} /></g>}
      </Phone></g>
      <Title text="MimAI" t={t} a={75.8} b={80.5} x={180} y={900} size={170} anchor="start" />
    </g>;
  } },
  // teaching: AI Power User
  { a: 80.8, b: 86.24, draw: (t) => {
    const lt = t - 80.8;
    return <g>
      <rect width={1920} height={1080} fill="#0E2328" />
      <path d="M1700 80 L560 220 L560 700 L1700 860 Z" fill="#FFF1D6" opacity={0.08} />
      <rect x={300} y={120} width={1000} height={560} fill={P.cream} stroke={INK} strokeWidth={6} />
      <rect x={300} y={120} width={1000} height={560} fill={P.orange} opacity={0.12} />
      <g transform="translate(800 420)">
        <Title text="AI Power User" t={t} a={81.2} b={86.6} x={0} y={0} size={110} color={P.teal} stagger={0.05} />
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${-260 + i * 260} 120) scale(${backK((t - 82.4 - i * 0.3) / 0.4)})`}><circle r={46} fill={P.teal2} /><text y={18} textAnchor="middle" fontFamily="RRHead" fontWeight={800} fontSize={48} fill={P.cream}>{["১০", "২০", "৭০%"][i]}</text></g>)}
      </g>
      <Person who="rubel" x={1520} y={1150} s={0.6} f={{ yaw: -0.6, smile: 0.6, open: win(lt, 1, 4.5, 0.2, 0.3) * Math.abs(Math.sin(t * 7)) * 0.5, blink: blink(t, 3), light: -1 }}
        l={[-260, -820]} palm="l" palmS={0.9} />
      {/* students' heads in the dark foreground */}
      {Array.from({ length: 9 }).map((_, i) => <g key={i} fill="#061317"><circle cx={120 + i * 200 + (i % 2) * 40} cy={960 + (i % 3) * 20} r={86} /><rect x={20 + i * 200 + (i % 2) * 40} y={1000 + (i % 3) * 20} width={200} height={140} rx={60} /></g>)}
    </g>;
  } },
  // the music: singing in the studio
  { a: 86.24, b: 92.66, draw: (t) => {
    const m = mouth(t);
    return <g>
      <rect width={1920} height={1080} fill="#2A1C18" />
      <Glow x={600} y={300} r={700} color="#E2582A" o={0.5} />
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={0} y={i * 56} width={1920} height={28} fill="#000" opacity={0.08} />)}
      {Array.from({ length: 36 }).map((_, i) => { const h = (0.2 + Math.abs(noise(t * 6, i)) + m.open * 0.8) * 140; return <rect key={i} x={1180 + i * 20} y={540 - h / 2} width={10} height={h} rx={5} fill={P.orange2} opacity={0.6} />; })}
      <CU who="rubel" x={780} y={470} s={2.6} t={t} f={{ ...m, yaw: 0.25, sad: 0.2, blink: blink(t, 3), light: -1 }} />
      {/* headphones */}
      <g transform="translate(780 470) scale(2.6)" fill={P.ink}><path d="M-74 -10 C-80 -120 80 -130 74 -10" fill="none" stroke={P.ink} strokeWidth={10} /><rect x={-86} y={-24} width={28} height={56} rx={12} /><rect x={58} y={-24} width={28} height={56} rx={12} /></g>
      {/* mic with pop filter */}
      <g transform="translate(1150 820)"><line x1={0} y1={0} x2={240} y2={300} stroke={P.ink} strokeWidth={16} /><rect x={-34} y={-90} width={68} height={140} rx={34} fill="#3A3F44" stroke={INK} strokeWidth={5} /><circle cx={-60} cy={-120} r={62} fill="#1A1E22" opacity={0.45} stroke="#000" strokeWidth={6} /></g>
      <Title text="গান" t={t} a={86.6} b={92.3} x={1480} y={980} size={200} />
    </g>;
  } },
  // finale: RAPAR RUBEL over Dhaka at sunrise
  { a: 92.66, b: 120, draw: (t) => {
    const lt = t - 92.66, crane = ease(lt / 7), sun = ease(lt / 12);
    const letters = "RAPAR RUBEL".split("");
    const walk = clamp((lt - 6) / 4);
    return <g>
      <g transform={`translate(0 ${lerp(260, 0, crane)})`}>
        <Skyline t={t} px={lt * 6} sun={0.2 + sun * 0.8} />
        {/* the sign on the rooftops */}
        <g transform="translate(960 470)">
          <rect x={-760} y={40} width={1520} height={16} fill="#5A4A48" />
          {letters.map((ch, i) => {
            if (ch === " ") return null;
            const k = backK((lt - 2.2 - i * 0.22) / 0.5);
            const x = -690 + i * 138;
            return <g key={i} transform={`translate(${x} 40) scale(1 ${clamp(k)})`}>
              <path d={`M-40 0 L-30 -150 M40 0 L30 -150 M-36 -60 H36`} stroke="#5A4A48" strokeWidth={6} />
              <text x={0} y={-12} textAnchor="middle" fontFamily="RRHead" fontWeight={800} fontSize={190} fill={P.cream} stroke="#5A4A48" strokeWidth={3}>{ch}</text>
            </g>;
          })}
        </g>
      </g>
      {/* his rooftop in the foreground */}
      <rect x={0} y={1000} width={1920} height={80} fill="#3A2A28" />
      <rect x={0} y={990} width={1920} height={14} fill="#5A4A48" />
      <Person who="rubel" x={lerp(1700, 1220, ease(walk))} y={1180} s={0.62} legs={walk > 0 && walk < 1 ? "stride" : "stand"} phase={t * 7}
        f={{ yaw: lt > 11.5 ? lerp(1, -0.35, ease((lt - 11.5) / 0.8)) : 1, smile: lt > 12 ? 0.8 : 0.2, blink: blink(t, 3) }} />
      <Tint color="#F0A070" o={0.18} />
      {[0, 1, 2].map((i) => { const p = (lt * 0.07 + i * 0.21) % 1; return <path key={i} d={`M${200 + p * 1600} ${220 + i * 30 + Math.sin(p * 8) * 14} q12 -10 24 0 q12 -10 24 0`} fill="none" stroke="#5A4A48" strokeWidth={4} />; })}
    </g>;
  } },
];

function backK(x: number) { const c = 1.4, k = clamp(x); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
export { CITIES, kf };
