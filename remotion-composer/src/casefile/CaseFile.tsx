// "The Rubel Case File" — 16:9 top-down investigation-board intro for Rapar Rubel.
// A dark teal concrete floor with white tape rooms; each room holds one venture's objects, chalk notes write
// themselves on, Dymo label tapes name them, one continuous camera glide follows the voiceover, a toy car drives a
// tape line, the camera pulls back to the network map, a phone wakes, then a hard cut to the glowing title.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import { FONT_CSS } from "../portfolio/fontcss";
import VO from "./vo.json";

export const CF_FPS = 30, CF_W = 1920, CF_H = 1080;
const LN = VO.lines;
const CUT = LN[LN.length - 1].e + 0.3;        // hard cut to the title
const TOTAL = CUT + 6.0;
export const CF_FRAMES = Math.ceil(TOTAL * CF_FPS);
const W = CF_W, H = CF_H, WW = 5200, WH = 3600;
const BN = "Anek, sans-serif", EN = "InterTight, Inter, sans-serif", MONO = "'DejaVu Sans Mono', monospace";
const TAPE = "#ecebe2", CHALK = "#e8efe9";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic);
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const Ls = (i: number) => LN[i].s;

// ---- rooms (world px) -----------------------------------------------------------------------
type Room = { x: number; y: number; w: number; h: number; door: "t" | "b" | "l" | "r" };
const R: Record<string, Room> = {
  cv: { x: 450, y: 520, w: 900, h: 700, door: "r" }, id: { x: 1560, y: 420, w: 720, h: 620, door: "b" },
  ai: { x: 2480, y: 430, w: 900, h: 700, door: "b" }, shop: { x: 3580, y: 600, w: 1150, h: 900, door: "l" },
  home: { x: 3550, y: 1980, w: 1150, h: 850, door: "t" }, mim: { x: 2500, y: 2300, w: 720, h: 700, door: "t" },
  course: { x: 1200, y: 2250, w: 950, h: 760, door: "r" }, phone: { x: 1080, y: 1430, w: 700, h: 640, door: "r" },
};
const ctr = (r: Room) => [r.x + r.w / 2, r.y + r.h / 2] as [number, number];
const HUB: [number, number] = [2600, 1640];
const CAR_PATH: [number, number][] = [[1650, 2120], [2300, 2120], [2300, 1350], [3360, 1350], [3360, 1900], [4300, 1900]];

// ---- camera ---------------------------------------------------------------------------------
const KEYS: [number, number, number, number][] = [ // t, cx, cy, zoom
  [0, 860, 880, 1.45], [Ls(1) - 0.3, 900, 870, 1.62],
  [Ls(1) + 0.4, 1920, 730, 1.7], [Ls(2) - 0.3, 1950, 740, 1.75],
  [Ls(2) + 0.5, 2930, 860, 1.5], [Ls(3) - 0.3, 2950, 870, 1.55],
  [Ls(3) + 0.6, 3900, 1030, 1.38], [Ls(4) - 0.4, 4350, 1080, 1.4],
  [Ls(4) + 0.6, 3850, 2470, 1.36], [Ls(5) - 0.4, 4300, 2480, 1.38],
  [Ls(5) + 0.6, 2860, 2720, 1.65], [Ls(6) - 0.3, 2860, 2730, 1.7],
  [Ls(6) + 0.6, 1680, 2680, 1.5], [Ls(7) - 0.2, 1660, 2600, 1.45],
  [Ls(8) - 0.2, 0, 0, 1.25],                                              // placeholder: car-tracking segment handled in camAt
  [Ls(8) + 1.6, 2620, 1720, 0.34], [Ls(9) - 0.5, 2620, 1720, 0.36],
  [Ls(9) + 0.7, 1600, 1760, 1.55], [CUT, 1600, 1770, 1.68],
];
const pathLen = CAR_PATH.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - CAR_PATH[i][0], p[1] - CAR_PATH[i][1]), 0);
function carAt(k: number) {
  let d = k * pathLen;
  for (let i = 1; i < CAR_PATH.length; i++) {
    const [ax, ay] = CAR_PATH[i - 1], [bx, by] = CAR_PATH[i], l = Math.hypot(bx - ax, by - ay);
    if (d <= l || i === CAR_PATH.length - 1) { const f = Math.min(1, d / l); return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) }; }
    d -= l;
  }
  return { x: CAR_PATH[0][0], y: CAR_PATH[0][1], a: 0 };
}
const carK = (t: number) => iv(t, Ls(7) + 0.2, Ls(8) - 0.3, 0, 1, Easing.inOut(Easing.sin));
function camAt(t: number) {
  if (t >= Ls(7) - 0.2 && t < Ls(8) - 0.2) {           // follow the car, eased in from the course room
    const c = carAt(carK(t)), e = iv(t, Ls(7) - 0.2, Ls(7) + 0.8);
    return { cx: 1660 + (c.x + Math.cos(c.a) * 200 - 1660) * e, cy: 2600 + (c.y + Math.sin(c.a) * 120 - 2600) * e, z: 1.45 - 0.2 * e };
  }
  const ks = KEYS.filter((k) => k[1] !== 0 || k[2] !== 0);
  if (t >= Ls(8) - 0.2 && t < Ls(8) + 1.6) {             // pull back from where the car stopped
    const c = carAt(1), k = iv(t, Ls(8) - 0.2, Ls(8) + 1.6, 0, 1, Easing.inOut(Easing.quad));
    return { cx: c.x + 200 + (2620 - c.x - 200) * k, cy: c.y + (1720 - c.y) * k, z: 1.25 * Math.pow(0.34 / 1.25, k) };
  }
  let i = 0; while (i < ks.length - 2 && t > ks[i + 1][0]) i++;
  const [t0, x0, y0, z0] = ks[i], [t1, x1, y1, z1] = ks[i + 1];
  const k = io(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  return { cx: x0 + (x1 - x0) * k + Math.sin(t * 0.3) * 6, cy: y0 + (y1 - y0) * k + Math.cos(t * 0.25) * 5, z: z0 * Math.pow(z1 / z0, k) };
}

// ---- drawing helpers --------------------------------------------------------------------------
const Tape: React.FC<{ r: Room }> = ({ r }) => {
  const g = 150, { x, y, w, h } = r, s = 20;
  const segs: number[][] = [];
  const top = r.door === "t" ? [[x, y, x + w / 2 - g / 2, y], [x + w / 2 + g / 2, y, x + w, y]] : [[x, y, x + w, y]];
  const bot = r.door === "b" ? [[x, y + h, x + w / 2 - g / 2, y + h], [x + w / 2 + g / 2, y + h, x + w, y + h]] : [[x, y + h, x + w, y + h]];
  const lef = r.door === "l" ? [[x, y, x, y + h / 2 - g / 2], [x, y + h / 2 + g / 2, x, y + h]] : [[x, y, x, y + h]];
  const rig = r.door === "r" ? [[x + w, y, x + w, y + h / 2 - g / 2], [x + w, y + h / 2 + g / 2, x + w, y + h]] : [[x + w, y, x + w, y + h]];
  segs.push(...top, ...bot, ...lef, ...rig);
  return <g>{segs.map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={TAPE} strokeWidth={s} strokeLinecap="square" opacity={0.92} filter="url(#tapeEdge)" />)}</g>;
};
const Label: React.FC<{ x: number; y: number; text: string; k: number; rot?: number }> = ({ x, y, text, k, rot = 0 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={Math.min(1, k * 2)}>
    <rect x={0} y={-30} width={(text.length * 25 + 40) * Math.min(1, k * 1.4)} height={52} rx={4} fill="#101213" />
    <text x={20} y={6} fontFamily={MONO} fontWeight={700} fontSize={34} fill="#e9ecea" letterSpacing={3} clipPath={undefined} opacity={iv(k, .5, 1)}>{text}</text>
  </g>
);
// chalk text that writes itself on (left-to-right wipe), with rough chalk edges
const Chalk: React.FC<{ x: number; y: number; text: string; k: number; size?: number; rot?: number; anchor?: "start" | "middle"; id: string; font?: string }> = ({ x, y, text, k, size = 64, rot = -3, anchor = "start", id, font = BN }) => {
  if (k <= 0) return null;
  const wEst = text.length * size * 0.62, x0 = anchor === "middle" ? -wEst / 2 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <clipPath id={`cw-${id}`}><rect x={x0 - 20} y={-size * 1.4} width={(wEst + 60) * k} height={size * 2.2} /></clipPath>
      <text clipPath={`url(#cw-${id})`} textAnchor={anchor} fontFamily={font} fontWeight={600} fontSize={size} fill={CHALK} opacity={0.88} filter="url(#chalk)">{text}</text>
    </g>
  );
};
const ChalkLine: React.FC<{ d: string; k: number; w?: number }> = ({ d, k, w = 6 }) => k <= 0 ? null : <path d={d} fill="none" stroke={CHALK} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} opacity={0.8} filter="url(#chalk)" />;
const shadow = "url(#objShadow)";

// ---- objects (drawn at world coords) ----------------------------------------------------------
const Paper: React.FC<{ x: number; y: number; w: number; h: number; rot: number; children?: React.ReactNode }> = ({ x, y, w, h, rot, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} filter={shadow}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#f4f3ee" />{children}</g>
);
const lines = (x: number, y: number, n: number, w: number, gap = 18) => Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + i * gap} width={w * (0.6 + 0.4 * ((i * 37) % 10) / 10)} height={6} fill="#b9bcbd" />);
const CVStack: React.FC = () => (<g>
  {[[-60, 10, -8], [40, -10, 4]].map(([dx, dy, r], i) => <Paper key={i} x={760 + dx} y={880 + dy} w={330} h={440} rot={r}>{lines(-130, -140, 14, 240)}</Paper>)}
  <Paper x={720} y={860} w={330} h={440} rot={-2}>
    <image href={staticFile("casefile/portrait.jpg")} x={-140} y={-190} width={90} height={110} preserveAspectRatio="xMidYMid slice" />
    <text x={-35} y={-160} fontFamily={EN} fontWeight={800} fontSize={24} fill="#222">RUBEL MIAH</text>
    <text x={-35} y={-132} fontFamily={EN} fontWeight={700} fontSize={14} fill="#555">AI EXPERT · WORKFLOW BUILDER</text>
    <text x={-140} y={-55} fontFamily={EN} fontWeight={800} fontSize={16} fill="#333">CURRICULUM VITAE</text>
    {lines(-140, -38, 12, 270, 16)}
  </Paper>
</g>);
const LaptopClosed: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} filter={shadow}>
    <rect x={-190} y={-130} width={380} height={260} rx={18} fill="url(#alu)" stroke="#8c9196" strokeWidth={2} />
    <circle cx={0} cy={0} r={18} fill="none" stroke="#a9aeb3" strokeWidth={3} />
  </g>
);
const WaxSeal: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} filter={shadow}>
    <path d={Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2, r = 62 + (i % 3) * 5; return `${i ? "L" : "M"} ${Math.cos(a) * r} ${Math.sin(a) * r}`; }).join(" ") + " Z"} fill="#e9dcc0" />
    <circle r={46} fill="#ddcca9" stroke="#c9b48c" strokeWidth={3} /><text y={14} textAnchor="middle" fontFamily="serif" fontStyle="italic" fontWeight={700} fontSize={46} fill="#a88f5e">rr</text>
  </g>
);
const IDCard: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M ${x - 40} ${y - 170} C ${x - 160} ${y - 420} ${x + 220} ${y - 470} ${x + 60} ${y - 170}`} fill="none" stroke="#1f6f78" strokeWidth={26} filter={shadow} />
    <g transform={`translate(${x} ${y}) rotate(4)`} filter={shadow}>
      <rect x={-150} y={-190} width={300} height={420} rx={20} fill="#f7f7f4" />
      <rect x={-150} y={-190} width={300} height={70} rx={20} fill="#1f6f78" /><rect x={-150} y={-140} width={300} height={20} fill="#1f6f78" />
      <rect x={-22} y={-176} width={44} height={12} rx={6} fill="#0d3d42" />
      <text x={0} y={-132} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={20} fill="#fff" letterSpacing={4}>CASE FILE</text>
      <image href={staticFile("casefile/portrait.jpg")} x={-80} y={-100} width={160} height={190} preserveAspectRatio="xMidYMid slice" />
      <text x={0} y={130} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={30} fill="#1a1a1a">RUBEL MIAH</text>
      <text x={0} y={162} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={20} fill="#1f6f78" letterSpacing={3}>RAPAR RUBEL</text>
      <rect x={-110} y={182} width={220} height={22} fill="url(#barcode)" />
    </g>
  </g>
);
const LaptopOpen: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-150} rx={420 * k + 1} ry={260 * k + 1} fill="url(#screenSpill)" opacity={k} />
    <g filter={shadow}>
      <rect x={-230} y={0} width={460} height={290} rx={18} fill="url(#alu)" />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 12 }, (_, c) => <rect key={r + "-" + c} x={-200 + c * 34} y={30 + r * 32} width={28} height={26} rx={4} fill="#3a3e43" />))}
      <rect x={-70} y={200} width={140} height={70} rx={8} fill="#9ea3a8" />
      <g transform={`translate(0 0) scale(1 ${0.25 + 0.75 * k})`}>
        <rect x={-230} y={-300} width={460} height={300} rx={14} fill="#1b1d20" />
        <rect x={-212} y={-284} width={424} height={268} rx={6} fill={k > 0.2 ? "#f6f8fb" : "#0e1012"} opacity={0.3 + 0.7 * k} />
        {k > 0.5 && <g opacity={iv(k, .5, 1)}>
          <rect x={-195} y={-268} width={390} height={26} rx={6} fill="#e3e8ef" /><text x={-180} y={-249} fontFamily={EN} fontWeight={800} fontSize={16} fill="#5a6270">AI Assistant</text>
          <rect x={-195} y={-228} width={230} height={40} rx={14} fill="#dfe6f2" /><rect x={-35} y={-178} width={230} height={40} rx={14} fill="#1f6f78" />
          <rect x={-195} y={-128} width={260} height={56} rx={14} fill="#dfe6f2" />
          <rect x={-195} y={-60} width={390} height={30} rx={15} fill="#fff" stroke="#c9d1dc" />
          <rect x={-180 + ((t * 40) % 300)} y={-52} width={3} height={14} fill="#1f6f78" />
        </g>}
      </g>
    </g>
  </g>
);
const Sticky: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <g transform={`translate(${x} ${y}) rotate(6)`} filter={shadow}><rect x={-90} y={-90} width={180} height={180} fill="#f4d95c" /><rect x={-90} y={-90} width={180} height={28} fill="#e9c84a" />
    <text x={0} y={20} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={40} fill="#3b3420" fontStyle="italic">{text}</text></g>
);
const ImportBox: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <g filter={shadow}>
      <path d="M -200 -150 L -330 -230 L -200 -230 Z M 200 -150 L 330 -230 L 200 -230 Z M -200 150 L -320 230 L -200 230 Z" fill="#b9874f" />
      <rect x={-200} y={-150} width={400} height={300} fill="#8a5b2c" /><rect x={-185} y={-135} width={370} height={270} fill="#5c3a19" />
      <text x={0} y={-160} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={22} fill="#3e2a14">MADE IN CHINA · PROYOJON SHOP</text>
      {[[-110, -60, "#e64a3c"], [-30, -70, "#3ca0e6"], [50, -55, "#f2c14e"], [-100, 30, "#4cc26a"], [10, 40, "#b05ae6"]].map(([bx, by, c], i) => <rect key={i} x={(bx as number) - 32} y={(by as number) - 32} width={64} height={64} rx={8} fill={c as string} stroke="#00000033" strokeWidth={3} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={90 + i * 22} y={-40} width={14} height={150} rx={4} fill={["#f2c14e", "#e64a3c", "#3ca0e6"][i]} />)}
    </g>
    <g transform={`translate(230 120) rotate(${-18 + Math.sin(t) * 0.5})`} filter={shadow}>
      <path d="M -70 -20 Q 0 -100 70 -20" fill="none" stroke="#2b2b2b" strokeWidth={10} /><rect x={-90} y={-20} width={180} height={120} rx={16} fill="#c0392b" /><rect x={-90} y={10} width={180} height={10} fill="#962d22" />
    </g>
  </g>
);
const Kurti: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-4)`} filter={shadow}>
    <rect x={-150} y={-190} width={300} height={380} rx={10} fill="#7d1f3a" />
    <path d="M -60 -190 Q 0 -120 60 -190" fill="#6a1830" stroke="#d9a74a" strokeWidth={6} />
    {Array.from({ length: 5 }, (_, r) => Array.from({ length: 4 }, (_, c) => <circle key={r + "-" + c} cx={-100 + c * 66} cy={-90 + r * 64} r={14} fill="none" stroke="#d9a74a" strokeWidth={4} opacity={0.85} />))}
    <g transform="translate(150 -150) rotate(20)"><rect x={0} y={-20} width={110} height={160} rx={8} fill="#f3eee4" stroke="#bbb" /><circle cx={55} cy={0} r={8} fill="#222" />
      <text x={55} y={50} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={22} fill="#7d1f3a">The AB</text><text x={55} y={78} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={20} fill="#7d1f3a">Wardrobe</text></g>
  </g>
);
const Cap: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-20)`} filter={shadow}>
    <path d="M -150 20 Q -150 -170 0 -170 Q 150 -170 150 20 Z" fill="#1d2430" /><path d="M -170 20 Q 0 170 170 20 Z" fill="#141a22" />
    {[-60, 0, 60].map((a) => <path key={a} d={`M 0 -170 Q ${a} -70 ${a * 2.2} 20`} fill="none" stroke="#2c3646" strokeWidth={3} />)}
    <circle cx={0} cy={-170} r={10} fill="#2c3646" /><text x={0} y={-40} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={42} fill="#e9ecef">myook</text>
  </g>
);
const BoardingPass: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-8)`} filter={shadow}>
    <rect x={-260} y={-110} width={520} height={220} rx={12} fill="#f4f3ee" /><rect x={-260} y={-110} width={520} height={56} rx={12} fill="#1f6f78" /><rect x={-260} y={-70} width={520} height={16} fill="#1f6f78" />
    <text x={-240} y={-72} fontFamily={EN} fontWeight={800} fontSize={24} fill="#fff" letterSpacing={3}>BOARDING PASS · PROYOJON VROMON</text>
    <text x={-240} y={10} fontFamily={EN} fontWeight={800} fontSize={64} fill="#222">DAC</text><text x={-50} y={0} fontFamily={EN} fontWeight={800} fontSize={40} fill="#1f6f78">✈</text><text x={40} y={10} fontFamily={EN} fontWeight={800} fontSize={64} fill="#222">CXB</text>
    <line x1={130} y1={-50} x2={130} y2={110} stroke="#bbb" strokeWidth={3} strokeDasharray="8 8" /><rect x={-240} y={40} width={300} height={40} fill="url(#barcode)" />
  </g>
);
const TravelMap: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(6)`} filter={shadow}>
    {[0, 1, 2].map((i) => <rect key={i} x={-210 + i * 140} y={-150} width={140} height={300} fill={["#e8e4d4", "#dfdbca", "#e8e4d4"][i]} />)}
    <path d="M -180 -100 Q -60 -160 20 -60 T 190 40" fill="none" stroke="#c0392b" strokeWidth={5} strokeDasharray="12 10" />
    {[[-180, -100], [20, -60], [190, 40]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={10} fill="#c0392b" />)}
    <path d="M -200 60 Q -120 30 -60 80 T 60 120" fill="#a9d1e6" opacity={0.7} />
  </g>
);
const PlotModel: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <g filter={shadow}><rect x={-260} y={-220} width={520} height={440} fill="#e6eef5" />
      {Array.from({ length: 9 }, (_, i) => <line key={"g" + i} x1={-260 + i * 65} y1={-220} x2={-260 + i * 65} y2={220} stroke="#a7c3dd" strokeWidth={1.5} />)}
      {Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1={-260} y1={-220 + i * 73} x2={260} y2={-220 + i * 73} stroke="#a7c3dd" strokeWidth={1.5} />)}
      <rect x={-200} y={-160} width={400} height={320} fill="none" stroke="#2f5d8a" strokeWidth={5} strokeDasharray="18 10" />
      <text x={-240} y={200} fontFamily={EN} fontWeight={800} fontSize={20} fill="#2f5d8a">PLOT PLAN · PROYOJON ABASHON</text></g>
    <g filter={shadow}>
      <rect x={-110} y={-120} width={220} height={190} fill="#fbfbf8" stroke="#cfd3d6" strokeWidth={3} />
      <path d="M 110 -120 L 150 -90 L 150 100 L 110 70 Z" fill="#dcdfe2" /><path d="M -110 70 L 110 70 L 150 100 L -70 100 Z" fill="#c9cdd1" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => <rect key={r + "-" + c} x={-95 + c * 42} y={-105 + r * 42} width={30} height={30} fill="#b9d3e6" />))}
      <text x={0} y={140} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={26} fill="#2f5d8a">G+9</text>
    </g>
  </g>
);
const Phone: React.FC<{ x: number; y: number; rot?: number; children?: React.ReactNode; glow?: number }> = ({ x, y, rot = 0, children, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={300} ry={380} fill="url(#screenSpill)" opacity={0.6 * glow} />
    <g filter={shadow}><rect x={-150} y={-300} width={300} height={600} rx={40} fill="#0c0d0f" stroke="#3a3d42" strokeWidth={4} /><rect x={-135} y={-285} width={270} height={570} rx={30} fill="#111" />{children}<rect x={-40} y={-275} width={80} height={20} rx={10} fill="#000" /></g>
  </g>
);
const MimUI: React.FC<{ k: number }> = ({ k }) => (
  <g opacity={k}>
    <rect x={-135} y={-285} width={270} height={570} rx={30} fill="#f5f7fb" />
    <text x={-110} y={-215} fontFamily={EN} fontWeight={800} fontSize={34} fill="#1d2430">MimAI</text>
    <rect x={-110} y={-190} width={220} height={36} rx={18} fill="#e6ebf3" /><text x={-90} y={-166} fontFamily={EN} fontWeight={700} fontSize={16} fill="#8a94a6">Search your Drive…</text>
    {Array.from({ length: 9 }, (_, i) => { const c = i % 3, r = Math.floor(i / 3); return <g key={i} transform={`translate(${-75 + c * 75} ${-100 + r * 95})`} opacity={iv(k, .3 + i * .05, .5 + i * .05)}>
      <path d="M -26 -18 L -6 -18 L 0 -10 L 26 -10 L 26 22 L -26 22 Z" fill={["#4c8bf5", "#f2c14e", "#4cc26a", "#e64a3c", "#b05ae6", "#3ca0e6", "#f28c38", "#1f6f78", "#7b8794"][i]} />
      <rect x={-24} y={30} width={48} height={6} rx={3} fill="#c5ccd8" /></g>; })}
  </g>
);
const Notebook: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-6)`} filter={shadow}>
    <rect x={-170} y={-220} width={340} height={440} rx={10} fill="#1f3b5c" />
    {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={-170} cy={-200 + i * 31} rx={14} ry={8} fill="none" stroke="#c9ced6" strokeWidth={5} />)}
    <rect x={-120} y={-120} width={250} height={150} rx={8} fill="#f4f3ee" />
    <text x={5} y={-60} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={40} fill="#1f3b5c">AI POWER</text><text x={5} y={-12} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={40} fill="#c0392b">USER</text>
    <text x={5} y={140} textAnchor="middle" fontFamily={BN} fontWeight={600} fontSize={30} fill="#c9ced6">বাংলায় কোর্স</text>
  </g>
);
const Headphones: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(20)`} filter={shadow}>
    <path d="M -120 40 Q -130 -150 0 -150 Q 130 -150 120 40" fill="none" stroke="#18191b" strokeWidth={26} strokeLinecap="round" />
    {[-1, 1].map((s) => <g key={s}><ellipse cx={s * 125} cy={70} rx={62} ry={78} fill="#18191b" /><ellipse cx={s * 125} cy={70} rx={40} ry={52} fill="#2b2d31" /></g>)}
  </g>
);
const Mic: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-35)`} filter={shadow}>
    <rect x={-14} y={40} width={28} height={180} rx={10} fill="#2b2d31" /><ellipse cx={0} cy={230} rx={80} ry={30} fill="#18191b" />
    <rect x={-50} y={-90} width={100} height={150} rx={50} fill="#3a3d42" />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-40} x2={40} y1={-60 + i * 20} y2={-60 + i * 20} stroke="#55595f" strokeWidth={4} />)}
  </g>
);
const ToyCar: React.FC<{ x: number; y: number; a: number; lit: number }> = ({ x, y, a, lit }) => (
  <g transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}>
    <path d="M 70 -30 L 520 -150 L 520 150 L 70 30 Z" fill="url(#beam)" opacity={lit} />
    <g filter={shadow}>
      <rect x={-95} y={-45} width={190} height={90} rx={34} fill="url(#alu)" stroke="#8c9196" strokeWidth={3} />
      <rect x={-30} y={-36} width={70} height={72} rx={14} fill="#2b3036" /><rect x={-70} y={-34} width={30} height={68} rx={10} fill="#3a4048" />
      {[[70, -30], [70, 30]].map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r={9} fill="#fff8d8" />)}
      {[[-55, -48], [55, -48], [-55, 48], [55, 48]].map(([wx, wy], i) => <rect key={i} x={wx - 20} y={wy - 8} width={40} height={16} rx={6} fill="#141414" />)}
    </g>
  </g>
);
const HubCard: React.FC = () => (
  <g transform={`translate(${HUB[0]} ${HUB[1]}) rotate(-2)`} filter={shadow}>
    <rect x={-260} y={-170} width={520} height={340} fill="#f1ead7" /><rect x={-260} y={-170} width={520} height={60} fill="#c0392b" />
    <text x={0} y={-128} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={28} fill="#fff" letterSpacing={6}>CASE FILE · RR-001</text>
    <image href={staticFile("casefile/portrait.jpg")} x={-235} y={-90} width={170} height={210} preserveAspectRatio="xMidYMid slice" />
    <text x={-40} y={-40} fontFamily={EN} fontWeight={800} fontSize={44} fill="#1a1a1a">RAPAR</text><text x={-40} y={10} fontFamily={EN} fontWeight={800} fontSize={44} fill="#1a1a1a">RUBEL</text>
    <text x={-40} y={50} fontFamily={EN} fontWeight={700} fontSize={20} fill="#555">INDEPENDENT BUSINESS</text><text x={-40} y={76} fontFamily={EN} fontWeight={700} fontSize={20} fill="#555">ARCHITECT · DHAKA</text>
    <circle cx={200} cy={110} r={44} fill="none" stroke="#c0392b" strokeWidth={6} opacity={0.8} /><text x={200} y={122} textAnchor="middle" fontFamily="serif" fontStyle="italic" fontWeight={700} fontSize={36} fill="#c0392b" opacity={0.8}>rr</text>
  </g>
);

// ---- the floor ---------------------------------------------------------------------------------
const Floor: React.FC<{ t: number }> = ({ t }) => {
  const w = (i: number, d = 0.5, dur = 1.6) => iv(t, Ls(i) + d, Ls(i) + d + dur, 0, 1, Easing.inOut(Easing.quad));
  const tag = (i: number, d = 0.2) => iv(t, Ls(i) + d, Ls(i) + d + 0.35);
  const laptop = iv(t, Ls(2) + 0.2, Ls(2) + 1.6);
  const car = carAt(carK(t)), carOn = t > Ls(7) - 0.5;
  const net = iv(t, Ls(8) + 1.0, Ls(8) + 3.4);
  const wake = iv(t, Ls(9) + 0.6, Ls(9) + 1.2), notif = iv(t, Ls(10) - 0.2, Ls(10) + 0.4, 0, 1, out);
  return (
    <svg width={WW} height={WH} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <filter id="objShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={14} dy={22} stdDeviation={16} floodColor="#000" floodOpacity={0.55} /></filter>
        <filter id="chalk" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="5" result="d" />
          <feComponentTransfer in="n" result="m"><feFuncA type="linear" slope="2.2" intercept="-0.5" /></feComponentTransfer><feComposite in="d" in2="m" operator="in" /></filter>
        <filter id="tapeEdge"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="9" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
        <linearGradient id="alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3e6e9" /><stop offset="0.5" stopColor="#b6bbc0" /><stop offset="1" stopColor="#d4d8dc" /></linearGradient>
        <radialGradient id="screenSpill"><stop offset="0" stopColor="rgba(230,240,255,.35)" /><stop offset="1" stopColor="rgba(230,240,255,0)" /></radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(255,248,220,.55)" /><stop offset="1" stopColor="rgba(255,248,220,0)" /></linearGradient>
        <pattern id="barcode" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="10" fill="#222" /><rect x="5" width="2" height="10" fill="#222" /><rect x="9" width="1" height="10" fill="#222" /></pattern>
      </defs>
      {/* corridor tape along the car route */}
      <polyline points={CAR_PATH.map((p) => p.join(",")).join(" ")} fill="none" stroke={TAPE} strokeWidth={18} opacity={0.85} filter="url(#tapeEdge)" />
      {Object.values(R).map((r, i) => <Tape key={i} r={r} />)}
      {/* network chalk lines */}
      {Object.values(R).map((r, i) => { const [x, y] = ctr(r); return <ChalkLine key={i} d={`M ${HUB[0]} ${HUB[1]} Q ${(x + HUB[0]) / 2 + 80} ${(y + HUB[1]) / 2 - 60} ${x} ${y}`} k={iv(net, i * 0.08, 0.5 + i * 0.08)} w={9} />; })}
      {/* room 1: CV */}
      <CVStack /><LaptopClosed x={1110} y={760} rot={8} /><WaxSeal x={1120} y={1060} />
      <Label x={490} y={580} text="RR-001" k={tag(0, 0)} rot={-2} />
      <Chalk id="c0" x={500} y={1160} text="ফাইল নং: RR-001" k={w(0, 0.4, 1.2)} size={58} />
      {/* room 2: ID */}
      <IDCard x={1900} y={760} />
      <Label x={1600} y={480} text="ID" k={tag(1)} />
      <Chalk id="c1" x={2160} y={980} text="রুবেল মিয়া" k={w(1, 0.6, 0.9)} size={56} rot={-6} /><Chalk id="c1b" x={2120} y={1050} text="= র‍্যাপার রুবেল" k={w(1, 1.6, 1.0)} size={50} rot={-6} />
      {/* room 3: AI */}
      <LaptopOpen x={2880} y={760} k={laptop} t={t} /><Sticky x={3220} y={610} text="AI ✓" />
      <Label x={2520} y={490} text="AI EXPERT" k={tag(2)} />
      <Chalk id="c2" x={2530} y={1085} text="AI Expert · Workflow Builder · ঢাকা" k={w(2, 1.0, 1.8)} size={44} rot={-2} font={EN} />
      {/* room 4: shop + fashion */}
      <ImportBox x={3870} y={900} t={t} /><Kurti x={4380} y={1000} /><Cap x={4400} y={1330} />
      <Label x={3620} y={660} text="PROYOJON SHOP" k={tag(3)} /><Label x={4250} y={720} text="FASHION" k={tag(3, 2.5)} rot={3} />
      <Chalk id="c3" x={3640} y={1420} text="প্রয়োজন শপ · AB Wardrobe · myook" k={w(3, 1.4, 2.4)} size={46} rot={-2} />
      {/* room 5: travel + property */}
      <BoardingPass x={3900} y={2220} /><TravelMap x={3860} y={2580} /><PlotModel x={4380} y={2400} />
      <Label x={3590} y={2040} text="VROMON" k={tag(4)} /><Label x={4260} y={2060} text="ABASHON" k={tag(4, 2.0)} />
      <Chalk id="c4" x={3620} y={2790} text="প্রয়োজন ভ্রমণ · প্রয়োজন আবাসন" k={w(4, 1.0, 2.2)} size={46} rot={-2} />
      {/* room 6: MimAI */}
      <Phone x={2860} y={2640} rot={-6}><MimUI k={iv(t, Ls(5) + 0.3, Ls(5) + 1.2)} /></Phone>
      <Label x={2540} y={2360} text="MIMAI" k={tag(5)} />
      <Chalk id="c5" x={2540} y={2960} text="MimAI — Claude Code দিয়ে তৈরি" k={w(5, 1.2, 1.8)} size={40} rot={-3} />
      {/* room 7: course */}
      <Notebook x={1500} y={2600} /><Headphones x={1890} y={2480} /><Mic x={1900} y={2800} />
      <Label x={1240} y={2310} text="COURSE" k={tag(6)} />
      <Chalk id="c6" x={1240} y={2970} text="১০ ক্লাস · বাংলায়" k={w(6, 1.4, 1.2)} size={54} rot={-3} />
      {/* car route note */}
      <Chalk id="c7" x={3430} y={1660} text="নিজের ব্যবসায় টেস্টেড ✓" k={w(7, 1.9, 1.3)} size={58} rot={-4} />
      {/* hub + network caption */}
      <HubCard />
      <Chalk id="c8" x={2620} y={1210} anchor="middle" text="Strategy × AI × Product × Creative × Business" k={iv(net, .45, 1)} size={120} rot={-1} font={EN} />
      {/* room 8: contact phone */}
      <Phone x={1430} y={1760} glow={0.3 + 0.7 * wake}>
        <rect x={-135} y={-285} width={270} height={570} rx={30} fill="url(#lock)" opacity={wake} />
        <text x={0} y={-150} textAnchor="middle" fontFamily={EN} fontWeight={300} fontSize={86} fill="#fff" opacity={wake}>4:41</text>
        <text x={0} y={-110} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={18} fill="#e6eef0" opacity={wake}>Friday, 21 November</text>
        {notif > 0 && <g transform={`translate(0 ${-40 - (1 - notif) * 120})`} opacity={notif}>
          <rect x={-122} y={-10} width={244} height={150} rx={22} fill="rgba(255,255,255,.92)" />
          <rect x={-108} y={4} width={30} height={30} rx={8} fill="#25d366" /><text x={-68} y={26} fontFamily={EN} fontWeight={800} fontSize={17} fill="#1a1a1a">WhatsApp · now</text>
          <text x={-108} y={62} fontFamily={EN} fontWeight={800} fontSize={18} fill="#1a1a1a">Rapar Rubel</text>
          <text x={-108} y={90} fontFamily={BN} fontWeight={600} fontSize={20} fill="#333">চলুন কথা বলি 👋</text>
          <text x={-108} y={120} fontFamily={EN} fontWeight={700} fontSize={15} fill="#555">+880 1676-464807</text>
        </g>}
      </Phone>
      <defs><linearGradient id="lock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1f6f78" /><stop offset="1" stopColor="#0d2f3a" /></linearGradient></defs>
      <Label x={1120} y={1490} text="CONTACT" k={iv(t, Ls(9), Ls(9) + 0.35)} />
      <Chalk id="c9a" x={1690} y={1560} text="বেশি কাস্টমার" k={w(9, 0.4, 0.7)} size={50} rot={-5} />
      <Chalk id="c9b" x={1690} y={1650} text="কম ঝামেলা" k={w(9, 1.2, 0.6)} size={50} rot={-5} />
      <Chalk id="c9c" x={1690} y={1740} text="দ্রুত রেজাল্ট" k={w(9, 1.9, 0.6)} size={50} rot={-5} />
      <Chalk id="c10" x={1680} y={1880} text="rubel.public@gmail.com" k={w(10, 0.5, 1.2)} size={36} rot={-4} font={EN} />
      {/* the toy car */}
      {carOn && <ToyCar x={car.x} y={car.y} a={car.a} lit={iv(t, Ls(7) - 0.5, Ls(7) + 0.3)} />}
    </svg>
  );
};

// ---- title card -----------------------------------------------------------------------------
const Title: React.FC<{ lt: number }> = ({ lt }) => {
  const a = iv(lt, 0.15, 1.4, 0, 1, out), streak = iv(lt, 0.4, 2.2, -0.2, 1.2, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill style={{ background: "#030303" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: a, filter: `blur(${(1 - a) * 10}px)` }}>
        <div style={{ fontFamily: "serif", fontStyle: "italic", fontWeight: 700, fontSize: 190, color: "#f4e7cc", lineHeight: 1, textShadow: "0 0 30px rgba(255,230,190,.55), 0 0 80px rgba(255,200,150,.3)" }}>rr</div>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 92, letterSpacing: 26, color: "#f4e7cc", marginTop: 18, textShadow: "0 0 24px rgba(255,230,190,.5)" }}>RAPAR RUBEL</div>
      </div>
      <div style={{ position: "absolute", left: `${streak * 100 - 30}%`, width: "30%", top: 652, height: 6, background: "linear-gradient(90deg, transparent, #ff4b3a, transparent)", filter: "blur(2px)", boxShadow: "0 0 30px #ff3a2a", opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 56, color: "#e9dcc4", opacity: iv(lt, 1.6, 2.6) }}>চলুন কথা বলি</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: EN, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: "#a9a091", opacity: iv(lt, 2.4, 3.4) }}>WhatsApp +880 1676-464807 · rubel.public@gmail.com</div>
    </AbsoluteFill>
  );
};

export const CaseFile: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["600 60px Anek", "800 60px InterTight", "700 40px Inter"].map((f) => document.fonts.load(f, "অআ ABC"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / CF_FPS;
  const { cx, cy, z } = camAt(t);
  return (
    <AbsoluteFill style={{ background: "#0e1a1b", overflow: "hidden" }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      {t < CUT && <>
        <div style={{ position: "absolute", left: 0, top: 0, width: WW, height: WH, transformOrigin: "0 0", transform: `translate(${W / 2 - cx * z}px, ${H / 2 - cy * z}px) scale(${z})`,
          backgroundImage: `url(${staticFile("casefile/floor.jpg")})`, backgroundSize: "1024px 1024px" }}>
          <Floor t={t} />
        </div>
        <AbsoluteFill style={{ background: "radial-gradient(70% 70% at 50% 45%, rgba(170,230,220,.10), rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(85% 85% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,8,8,.7) 100%)" }} />
        <AbsoluteFill style={{ background: "#0d3b3b", mixBlendMode: "soft-light", opacity: 0.45 }} />
      </>}
      {t >= CUT && <Title lt={t - CUT} />}
      <Img src={staticFile(`casefile/grain${fr % 6}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: 0.3, mixBlendMode: "overlay", objectFit: "cover" }} />
      <Audio src={staticFile("casefile/mix.wav")} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 0.6) + iv(t, TOTAL - 1.0, TOTAL) }} />
    </AbsoluteFill>
  );
};
