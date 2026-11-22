import React from "react";
import { C, HEAD, backOut, clamp, ease, easeOut, expoOut, lerp, rand, ramp, win } from "../bhangariwala/lib";
import { Dev, Recycle, Shield } from "../bhangariwala/icons";
import { BDMap, CITIES, projector } from "../bhangariwala/map";
import { Check, DataIcon, Gear, Ingot, Lock, Mark, PCB, Pellets, T, Word, st } from "./kit";
import { BVan, Stage } from "./partsA";

// Parts 4-6: data protection -> dismantling & recovery -> responsible recycling and the brand end.

type Pt = [number, number];

// ------------------------------------------------------------ laptop with see-through casing
/** open laptop seen from the front and a little above. clear 0..1 fades the casing to show the inside. */
const XLaptop: React.FC<{ clear: number }> = ({ clear }) => {
  const op = 1 - clear * 0.78;
  return (
    <g>
      <ellipse cx={8} cy={74} rx={120} ry={12} fill="#0E2A1C" opacity={0.12} />
      {/* lid */}
      <rect x={-84} y={-118} width={168} height={118} rx={12} fill="#DCE3E4" fillOpacity={op} {...st} />
      <rect x={-72} y={-106} width={144} height={92} rx={5} fill="#5F6E74" fillOpacity={op} />
      {clear > 0 && <g opacity={clear}><rect x={-72} y={-106} width={144} height={92} rx={5} fill="#BFE0EE" opacity={0.45} />
        <line x1={-60} y1={-30} x2={60} y2={-30} stroke="#E08A3C" strokeWidth={4} /><rect x={-66} y={-100} width={132} height={8} fill="#9AA7AB" /></g>}
      {/* deck */}
      <path d="M-84 0 H84 L112 64 H-112 Z" fill="#E4EAEB" fillOpacity={op} {...st} />
      {clear > 0 && (
        <g opacity={clear}>
          <g transform="translate(-40 34) scale(0.62 0.42)"><PCB w={110} h={76} /></g>
          <rect x={14} y={18} width={78} height={34} rx={5} fill="#3A4950" />
          {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 24} y={23} width={18} height={24} rx={3} fill={C.warn} opacity={0.85} />)}
          <circle cx={-92} cy={50} r={5} fill="#9AA7AB" /><circle cx={92} cy={56} r={5} fill="#9AA7AB" />
        </g>
      )}
      <g opacity={1 - clear}>
        {Array.from({ length: 3 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => (
          <rect key={`${r}-${c}`} x={-78 + c * 17.5 + r * 4} y={8 + r * 14} width={13} height={9} rx={2} fill="#C3CCCE" />
        )))}
      </g>
    </g>
  );
};

// ============================================================ PART 4 · data protection
const DEV4: { kind: "phone" | "laptop" | "hdd"; x: number; y: number; s: number }[] = [
  { kind: "phone", x: 262, y: 910, s: 2.2 }, { kind: "laptop", x: 540, y: 890, s: 2.3 }, { kind: "hdd", x: 818, y: 910, s: 2.0 },
];
const DATA: ("photo" | "doc" | "account" | "folder")[][] = [["photo", "account", "doc"], ["folder", "photo", "doc"], ["doc", "folder", "account"]];
const DOFF: Pt[] = [[-110, -250], [20, -296], [126, -214]];
const SHIELD_D = "M0 -70 L58 -48 V2 C58 40 30 62 0 76 C-30 62 -58 40 -58 2 V-48 Z";

export const Part4: React.FC<{ t: number }> = ({ t }) => {
  const shield = ramp(t, 3.0, 0.8, ease), fill = ramp(t, 3.5, 0.5);
  const lockK = backOut((t - 3.9) / 0.45);
  const lanes = ramp(t, 5.9, 0.5);
  const shieldOut = ramp(t, 5.7, 0.5);
  return (
    <Stage id="p4stage">
      <defs>
        <linearGradient id="p4Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F1F8F2" /><stop offset="1" stopColor="#E0EEE3" /></linearGradient>
      </defs>
      <rect x={40} y={520} width={1000} height={800} fill="url(#p4Bg)" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={40 + i * 90} y1={520} x2={40 + i * 90} y2={1320} stroke="#D3E6D8" strokeWidth={2} />)}
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={40} y1={540 + i * 90} x2={1040} y2={540 + i * 90} stroke="#D3E6D8" strokeWidth={2} />)}
      {/* the shield */}
      {shield > 0 && (
        <g opacity={1 - shieldOut} transform={`translate(540 905) scale(${6.4 * lerp(1, 0.9, shieldOut)} ${5.15 * lerp(1, 0.9, shieldOut)})`}>
          <path d={SHIELD_D} fill={C.mint} fillOpacity={fill * 0.7} />
          <path d={SHIELD_D} fill="none" stroke={C.green} strokeWidth={1.6} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - shield} />
          <path d={SHIELD_D} fill="none" stroke={C.lime} strokeWidth={4} opacity={fill * 0.25} />
        </g>
      )}
      {lockK > 0 && <g transform={`translate(540 600) scale(${clamp(lockK) * (1 - shieldOut)})`}><circle r={46} fill={C.green} stroke="#fff" strokeWidth={6} /><Lock s={0.95} color="#fff" /></g>}
      {/* devices and their (abstract) data */}
      {DEV4.map((d, i) => {
        const inK = backOut((t - 0.05 - i * 0.12) / 0.55);
        // in the lanes phase the devices ride the secure lane (y 805): phone, hdd, then laptop
        const order = [0, 2, 1].indexOf(i);
        const t0 = 6.0 + order * 0.45;
        const ride = clamp((t - t0) / 2.4);
        let x = d.x, y = d.y, s = d.s * clamp(inK);
        if (t > 5.8) {
          const toLane = ease((t - 5.8 - order * 0.1) / 0.5);
          const laneX = lerp(130, 1080, ride);
          x = lerp(d.x, laneX, toLane); y = lerp(d.y, 790, toLane); s = lerp(d.s, 1.0, toLane);
        }
        let clear = 0;
        if (d.kind === "laptop" && t > 7.6) {
          // after the gate the laptop drops to the material lane, its casing turns see-through, and it rises to centre
          const drop = ease((t - 7.6) / 0.55), centre = ease((t - 8.6) / 0.9);
          const xg = lerp(130, 1080, clamp((7.6 - t0) / 2.4));
          x = lerp(lerp(xg, 640, drop), 540, centre); y = lerp(lerp(790, 1150, drop), 920, centre);
          s = lerp(1.0, 2.6, centre);
          clear = ramp(t, 8.2, 0.7);
        }
        const passed = t > t0 && x > 540;
        return (
          <g key={i}>
            {t < 3.9 && DATA[i].map((k, j) => {
              const u = easeOut((t - 0.75 - i * 0.2 - j * 0.12) / 0.6) * (1 - ease((t - 3.1 - j * 0.06) / 0.6));
              if (u <= 0) return null;
              const [ox, oy] = DOFF[j];
              const bob = Math.sin(t * 2 + i + j * 1.7) * 6;
              return (
                <g key={j}>
                  <line x1={d.x} y1={d.y - 40} x2={d.x + ox * u} y2={d.y + oy * u + bob} stroke={C.green} strokeWidth={3} strokeDasharray="6 8" opacity={u * 0.6} />
                  <g transform={`translate(${d.x + ox * u} ${d.y + oy * u + bob}) scale(${1.05 * u})`}><DataIcon kind={k} /></g>
                </g>
              );
            })}
            <g transform={`translate(${x} ${y}) scale(${s})`}>
              {d.kind === "laptop" && t > 7.6 ? <g transform={`scale(${1 / 1.8})`}><XLaptop clear={clear} /></g> : <Dev kind={d.kind} old />}
            </g>
            {passed && d.kind !== "laptop" && <g transform={`translate(${x + 40} ${y - 70})`}><Check r={22} k={ramp(t, t0 + 1.0, 0.3)} /></g>}
          </g>
        );
      })}
      {/* DATA -> SHIELD -> SECURE HANDLING */}
      {[["DATA", 250, 150], ["SHIELD", 480, 180], ["SECURE HANDLING", 780, 330]].map(([l, x, w], i) => {
        const k = backOut((t - 4.3 - i * 0.35) / 0.4) * (1 - shieldOut);
        if (k <= 0) return null;
        return (
          <g key={l as string}>
            {i > 0 && <path d={`M${(x as number) - (w as number) / 2 - 44} 1110 h26 m-12 -12 l12 12 l-12 12`} fill="none" stroke={C.greenD} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={clamp(k)} />}
            <g transform={`translate(${x} 1110) scale(${clamp(k)})`}>
              <rect x={-(w as number) / 2} y={-30} width={w as number} height={60} rx={30} fill={i === 2 ? C.green : "#fff"} stroke={C.green} strokeWidth={4} />
              <T x={0} y={10} size={26} w={800} font={HEAD} ls={1.5} color={i === 2 ? "#fff" : C.greenDD}>{l}</T>
            </g>
          </g>
        );
      })}
      {/* two lanes */}
      {lanes > 0 && (
        <g opacity={lanes * (1 - ramp(t, 8.55, 0.5))}>
          <Lane y={842} t={t} color={C.green} label="SECURE PROCESSING" lock dir={1} />
          <Lane y={1202} t={t} color="#8C9A9E" label="MATERIAL SORTING" dir={-1} />
          {/* scan gate on the secure lane */}
          <g transform="translate(540 842)">
            <path d="M-70 0 V-170 Q-70 -196 -44 -196 H44 Q70 -196 70 -170 V0" fill="none" stroke={C.greenDD} strokeWidth={14} />
            <rect x={-56} y={-182} width={112} height={182} fill={C.lime} opacity={0.12 + Math.abs(Math.sin(t * 5)) * 0.12} />
            <rect x={-56} y={-182 + ((t * 1.4) % 1) * 170} width={112} height={6} fill={C.lime} opacity={0.8} />
            <g transform="translate(0 -196)"><circle r={24} fill={C.green} stroke="#fff" strokeWidth={4} /><Lock s={0.5} color="#fff" /></g>
          </g>
        </g>
      )}
    </Stage>
  );
};

const Lane: React.FC<{ y: number; t: number; color: string; label: string; lock?: boolean; dir: number }> = ({ y, t, color, label, lock, dir }) => (
  <g>
    <rect x={40} y={y} width={1000} height={40} fill={color} />
    <rect x={40} y={y + 40} width={1000} height={16} fill="#1E2A30" opacity={0.18} />
    <g transform={`translate(${((t * 90 * dir) % 60) - 60} 0)`}>{Array.from({ length: 20 }).map((_, i) => <rect key={i} x={40 + i * 60} y={y + 8} width={30} height={6} rx={3} fill="#fff" opacity={0.35} />)}</g>
    <g transform={`translate(${dir > 0 ? 70 : 1010} ${y + 92})`}>
      {lock && <g transform="translate(14 -10) scale(0.55)"><Lock color={C.greenD} /></g>}
      <T x={dir > 0 ? (lock ? 40 : 0) : 0} y={0} size={26} w={800} font={HEAD} anchor={dir > 0 ? "start" : "end"} ls={2} color={dir > 0 ? C.greenDD : C.ink2}>{label}</T>
    </g>
  </g>
);

// ============================================================ PART 5 · dismantle & recover
type Layer = { id: string; label: string; lane: number; draw: () => React.ReactNode };
const ISO = "matrix(0.866 0.5 -0.866 0.5 0 0)";
const slab = (fill: string, side: string, inner?: React.ReactNode, h = 10) => (
  <g>
    <g transform={`translate(0 ${h})`}><g transform={ISO}><rect x={-150} y={-100} width={300} height={200} rx={12} fill={side} /></g></g>
    <g transform={ISO}><rect x={-150} y={-100} width={300} height={200} rx={12} fill={fill} stroke={C.ink} strokeWidth={3} />{inner}</g>
  </g>
);
const LAYERS: Layer[] = [
  { id: "display", label: "DISPLAY", lane: 4, draw: () => slab("#3B4A52", "#26333A", <g><rect x={-136} y={-86} width={272} height={172} rx={6} fill="#5E7884" /><path d="M-120 -70 L-40 -86 L-130 40 Z" fill="#fff" opacity={0.25} /></g>) },
  { id: "casing", label: "PLASTIC CASING", lane: 1, draw: () => slab("#E3E9EA", "#B7C1C4", <g>{Array.from({ length: 4 }).map((_, r) => Array.from({ length: 10 }).map((_, c) => <rect key={`${r}${c}`} x={-130 + c * 26} y={-70 + r * 26} width={20} height={20} rx={3} fill="#C7D0D2" />))}<rect x={-40} y={40} width={80} height={44} rx={6} fill="#D2DADC" /></g>) },
  { id: "board", label: "CIRCUIT BOARD", lane: 2, draw: () => slab("#2F7D45", "#1F5A30", <g stroke="#D9B55A" strokeWidth={4} fill="none"><path d="M-130 -60 H-20 V40 H120" /><path d="M-130 60 H-60 V-20" /><path d="M20 -90 V-10 H130" /><rect x={-30} y={-40} width={60} height={60} fill="#1E2A30" stroke="none" /><rect x={60} y={30} width={40} height={30} fill="#1E2A30" stroke="none" /></g>) },
  { id: "battery", label: "BATTERY", lane: 3, draw: () => slab("#3A4950", "#26333A", <g>{[0, 1, 2, 3].map((i) => <rect key={i} x={-128 + i * 66} y={-70} width={56} height={140} rx={10} fill={C.warn} stroke={C.ink} strokeWidth={3} />)}</g>) },
  { id: "frame", label: "METAL FRAME", lane: 0, draw: () => slab("#C9D1D4", "#98A4A8", <g><rect x={-120} y={-74} width={240} height={148} rx={8} fill="#E9EEEF" stroke="#98A4A8" strokeWidth={3} /><rect x={-20} y={-74} width={10} height={148} fill="#C9D1D4" /></g>, 6) },
  { id: "cables", label: "CABLES & OTHER", lane: 5, draw: () => (
    <g transform={ISO}><g fill="none" strokeLinecap="round" strokeWidth={8}><path d="M-140 -60 C-60 -100 0 40 140 -10" stroke="#E08A3C" /><path d="M-120 70 C-40 20 40 90 130 50" stroke={C.ink2} /></g>
      {[-100, -30, 50, 110].map((x, i) => <circle key={i} cx={x} cy={i % 2 ? 80 : -80} r={9} fill="#9AA7AB" stroke={C.ink} strokeWidth={2} />)}
      <g transform="translate(80 10)"><Gear r={20} color="#9AA7AB" /></g></g>
  ) },
];
const LANES5 = ["METAL", "PLASTIC", "CIRCUIT\nBOARD", "BATTERY", "GLASS", "OTHER\nMATERIAL"];
const RECOVERABLE = [true, true, true, false, true, false];
const binX = (i: number) => 126 + i * 166;
const Chunk: React.FC<{ lane: number }> = ({ lane }) => {
  switch (lane) {
    case 0: return <g><g transform="translate(-20 10)"><Ingot /></g><g transform="translate(26 -14) scale(0.9)"><Ingot /></g></g>;
    case 1: return <g transform="scale(1.3)"><Pellets color="#DCE3E4" /></g>;
    case 2: return <g transform="scale(0.7)"><PCB /></g>;
    case 3: return <g transform="scale(0.6)"><Dev kind="battery" old /></g>;
    case 4: return <g>{[[-24, 8, -20], [10, -10, 15], [26, 16, 40], [-6, 22, 0]].map(([x, y, r], i) => <path key={i} d="M-14 -10 L16 -14 L8 14 Z" fill="#CFE9F3" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${r})`} />)}</g>;
    default: return <g><path d="M-36 0 C-10 -30 10 30 36 0" fill="none" stroke="#E08A3C" strokeWidth={7} strokeLinecap="round" />{[-20, 4, 26].map((x) => <circle key={x} cx={x} cy={20} r={7} fill="#9AA7AB" stroke={C.ink} strokeWidth={2} />)}</g>;
  }
};

export const Part5: React.FC<{ t: number }> = ({ t }) => {
  const toIso = ramp(t, 0.9, 0.6);
  const ex = ease((t - 1.35) / 1.3);
  const lblOut = ramp(t, 4.0, 0.3);
  const binsK = (i: number) => backOut((t - 3.9 - i * 0.07) / 0.45);
  const glow = ramp(t, 6.5, 0.6);
  const cyc = ramp(t, 5.4, 3.0, ease);
  const STACK: Pt = [400, 900];
  return (
    <Stage id="p5stage">
      <rect x={40} y={520} width={1000} height={800} fill="#F4F8F6" />
      <ellipse cx={540} cy={900} rx={420} ry={330} fill="url(#jGlow)" opacity={0.5 * (1 - ramp(t, 4, 0.5)) + glow * 0.4} />
      {/* see-through laptop handed over from part 4 */}
      {toIso < 1 && <g opacity={1 - toIso} transform={`translate(540 880) scale(${2.6 / 1.8 * 1.8 * (1 + toIso * 0.1)})`}><XLaptop clear={1} /></g>}
      {/* big recovery loop */}
      {cyc > 0 && <g transform={`translate(540 744) rotate(${t * 14})`} opacity={0.95}><Recycle r={150} p={cyc} sw={26} color={C.green} /></g>}
      {cyc > 0.3 && <T x={540} y={758} size={40} w={800} font={HEAD} ls={3} color={C.greenDD} op={ramp(cyc, 0.3, 0.4)}>RECOVER</T>}
      {/* material lanes */}
      {LANES5.map((l, i) => {
        const k = binsK(i);
        if (k <= 0) return null;
        const x = binX(i), rec = RECOVERABLE[i];
        const filled = LAYERS.filter((L) => L.lane === i).some((L) => t > 4.25 + LAYERS.indexOf(L) * 0.28 + 0.55);
        const lines = l.split("\n");
        const ring = rec ? C.green : C.warn;
        return (
          <g key={i} transform={`translate(${x} 1160) scale(${clamp(k)})`}>
            <rect x={-72} y={-110} width={144} height={240} rx={22} fill="#fff" stroke={glow > 0 ? ring : C.line} strokeWidth={4 + glow * 3} />
            {rec && glow > 0 && <rect x={-72} y={-110} width={144} height={240} rx={22} fill={C.lime} opacity={glow * (0.22 + Math.sin(t * 5 + i) * 0.06)} />}
            {!rec && glow > 0 && <rect x={-72} y={-110} width={144} height={240} rx={22} fill={C.warnSoft} opacity={glow * 0.6} />}
            {lines.map((ln, j) => <T key={j} x={0} y={-74 + j * 24 + (lines.length === 1 ? 10 : 0)} size={20} w={800} font={HEAD} ls={1} color={C.ink}>{ln}</T>)}
            {filled && <g transform={`translate(0 14) scale(${backOut(clamp((t - 4.8 - i * 0.05) / 0.4))})`}><Chunk lane={i} /></g>}
            {glow > 0 && (rec
              ? <g transform="translate(0 92)" opacity={glow}><Recycle r={17} sw={6} p={1} color={C.green} /></g>
              : <g transform="translate(0 94)" opacity={glow}><rect x={-62} y={-17} width={124} height={34} rx={17} fill={C.warn} /><T x={0} y={7} size={16} w={800} font={HEAD} ls={1} color="#fff">SAFE CHANNEL</T></g>)}
          </g>
        );
      })}
      {/* exploded stack, then each layer flies to its lane */}
      {toIso > 0 && LAYERS.map((L, i) => {
        const n = LAYERS.length;
        const yStack = STACK[1] + (i - (n - 1) / 2) * 12;
        const yEx = STACK[1] + (i - (n - 1) / 2) * 96;
        let x = STACK[0], y = lerp(yStack, yEx, ex), s = 0.78 * lerp(0.92, 1, toIso);
        const f0 = 4.25 + i * 0.28;
        const f = ease((t - f0) / 0.6);
        if (f > 0) {
          const bx = binX(L.lane);
          x = lerp(x, bx, f); y = lerp(y, 1150, f) - Math.sin(f * Math.PI) * 80; s *= lerp(1, 0.28, f);
        }
        if (f >= 1) return null;
        const k = ramp(t, 2.1 + i * 0.12, 0.3, easeOut) * (1 - lblOut);
        return (
          <g key={L.id} opacity={toIso}>
            <g transform={`translate(${x} ${y}) scale(${s})`}>{L.draw()}</g>
            {k > 0 && (
              <g opacity={k}>
                <line x1={x + 140} y1={y} x2={lerp(x + 150, 690, k)} y2={y} stroke={C.greenD} strokeWidth={3} />
                <circle cx={x + 136} cy={y} r={6} fill={C.greenD} />
                <g transform={`translate(${690 + (1 - k) * 20} ${y})`}>
                  <rect x={0} y={-24} width={L.label.length * 15.5 + 34} height={48} rx={24} fill="#fff" stroke={C.green} strokeWidth={3} />
                  <T x={17} y={9} size={24} w={800} font={HEAD} anchor="start" ls={1.2} color={C.greenDD}>{L.label}</T>
                </g>
              </g>
            )}
          </g>
        );
      })}
    </Stage>
  );
};

// ============================================================ PART 6 · responsible recycling -> cleaner Bangladesh
const STREAMS: { from: string; to: string; warn?: boolean; icon: () => React.ReactNode; out: () => React.ReactNode }[] = [
  { from: "METAL", to: "Recovered material", icon: () => <Ingot />, out: () => <g><g transform="translate(-14 8) scale(0.8)"><Ingot /></g><g transform="translate(14 -10) scale(0.8)"><Ingot /></g></g> },
  { from: "PLASTIC", to: "Recycled material", icon: () => <Pellets color="#DCE3E4" />, out: () => <Pellets /> },
  { from: "ELECTRONIC\nCOMPONENTS", to: "Specialized recovery", icon: () => <g transform="scale(0.6)"><PCB /></g>, out: () => <Gear r={20} /> },
  { from: "BATTERY", to: "Separate safe processing", warn: true, icon: () => <g transform="scale(0.55)"><Dev kind="battery" old /></g>, out: () => <g transform="scale(0.42)"><Shield k={1} /></g> },
];
const NODES = ["OLD\nELECTRONICS", "PICKUP\nREQUEST", "COLLECTION", "SORTING", "DATA\nPROTECTION", "DISMANTLING", "MATERIAL\nRECOVERY", "RESPONSIBLE\nRECYCLING"];
const NODE_ICON: (() => React.ReactNode)[] = [
  () => <g transform="scale(0.36)"><Dev kind="phone" old /></g>,
  () => <g><rect x={-14} y={-22} width={28} height={44} rx={6} fill={C.ink2} /><circle cx={9} cy={-12} r={9} fill={C.green} stroke="#fff" strokeWidth={2} /></g>,
  () => <g transform="translate(0 14) scale(0.13)"><BVan t={0} /></g>,
  () => <g>{[0, 1, 2, 3].map((i) => <rect key={i} x={-20 + (i % 2) * 22} y={-20 + Math.floor(i / 2) * 22} width={18} height={18} rx={4} fill="none" stroke={C.green} strokeWidth={4} />)}</g>,
  () => <g transform="scale(0.34)"><Shield k={1} /></g>,
  () => <Gear r={14} color={C.ink2} />,
  () => <g transform="scale(0.5)"><Ingot /></g>,
  () => <Recycle r={17} sw={6} p={1} />,
];
const R6 = 262, CY6 = 930;
const nodeXY = (i: number): Pt => { const a = (-90 + i * 45) * (Math.PI / 180); return [540 + Math.cos(a) * R6, CY6 + Math.sin(a) * R6]; };
// trees, people and towers dotted over the map
const TREE_AT = ["rangpur", "dinajpur", "bogura", "rajshahi", "pabna", "tangail", "mymensingh", "sylhet", "jessore", "khulna", "barishal", "comilla", "noakhali", "coxs"];

export const Part6: React.FC<{ t: number }> = ({ t }) => {
  const streamsOut = ramp(t, 2.6, 0.45);
  const circIn = ramp(t, 2.75, 0.45);
  const arc = ramp(t, 3.05, 1.9, (x) => x);
  const collapse = ease((t - 5.05) / 0.55);
  const mapK = ramp(t, 5.3, 0.6);
  const brand = ramp(t, 7.05, 0.55);
  const v = { cx: 540, cy: 905, s: lerp(0.7, 0.86, easeOut(mapK)), tilt: 28 };
  const pr = projector(v);
  return (
    <g>
      <Stage id="p6stage">
        <rect x={40} y={520} width={1000} height={800} fill="#F4F8F6" />
        {/* streams */}
        {streamsOut < 1 && STREAMS.map((S, i) => {
          const k = easeOut((t - 0.1 - i * 0.28) / 0.5) * (1 - streamsOut);
          if (k <= 0) return null;
          const y = 640 + i * 182;
          const col = S.warn ? C.warn : C.green;
          const flow = ramp(t, 0.3 + i * 0.28, 0.7);
          return (
            <g key={i} opacity={k} transform={`translate(${(1 - k) * -30} 0)`}>
              <circle cx={160} cy={y} r={62} fill="#fff" stroke={col} strokeWidth={5} />
              <g transform={`translate(160 ${y})`}>{S.icon()}</g>
              {S.from.split("\n").map((l, j) => <T key={j} x={160} y={y + 90 + j * 21} size={19} w={800} font={HEAD} ls={1.2} color={C.ink2}>{l}</T>)}
              <path d={`M238 ${y} H${lerp(238, 556, flow)}`} stroke={col} strokeWidth={10} strokeLinecap="round" strokeDasharray="22 16" strokeDashoffset={-t * 90} />
              {flow > 0.95 && <path d={`M548 ${y - 18} L572 ${y} L548 ${y + 18}`} fill="none" stroke={col} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
              <g opacity={ramp(flow, 0.6, 0.4)}>
                <rect x={590} y={y - 58} width={428} height={116} rx={28} fill={S.warn ? "#FFF6E6" : "#fff"} stroke={col} strokeWidth={4} />
                <circle cx={662} cy={y} r={40} fill={S.warn ? C.warnSoft : C.mint} />
                <g transform={`translate(662 ${y})`}>{S.out()}</g>
                <T x={722} y={y + 11} size={S.to.length > 20 ? 23 : 26} w={700} anchor="start">{S.to}</T>
              </g>
            </g>
          );
        })}
        {/* the full journey as a loop */}
        {circIn > 0 && collapse < 1 && (
          <g opacity={circIn * (1 - collapse)}>
            <circle cx={540} cy={CY6} r={R6} fill="none" stroke={C.line} strokeWidth={8} />
            <circle cx={540} cy={CY6} r={R6} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${arc} 1`} transform={`rotate(-90 540 ${CY6})`} />
            <g transform={`translate(540 ${CY6}) scale(${lerp(0.6, 1, easeOut(circIn))})`}>
              <circle r={130} fill={C.mint} />
              <g transform={`rotate(${t * 20})`} opacity={0.35}><Recycle r={112} sw={14} p={1} /></g>
              <circle r={86} fill="#fff" />
              <Mark size={140} />
            </g>
            {NODES.map((n, i) => {
              const [x0, y0] = nodeXY(i);
              const x = lerp(x0, 540, collapse), y = lerp(y0, CY6, collapse);
              const lit = arc >= i / 8 - 0.001;
              const k = backOut((t - 2.85 - i * 0.06) / 0.4);
              const a = (-90 + i * 45) * (Math.PI / 180);
              const lx = 540 + Math.cos(a) * (R6 + 66), ly = CY6 + Math.sin(a) * (R6 + 62);
              const anchor = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
              const lines = n.split("\n");
              const ly0 = ly + (Math.sin(a) < -0.5 ? -(lines.length - 1) * 23 - 2 : Math.sin(a) > 0.5 ? 16 : 7 - ((lines.length - 1) * 23) / 2);
              return (
                <g key={i}>
                  <g transform={`translate(${x} ${y}) scale(${clamp(k)})`}>
                    {lit && <circle r={54} fill={C.lime} opacity={0.25} />}
                    <circle r={42} fill="#fff" stroke={lit ? C.green : C.line} strokeWidth={5} />
                    {NODE_ICON[i]()}
                  </g>
                  {lines.map((l, j) => (
                    <T key={j} x={lx} y={ly0 + j * 23} size={21} w={800} font={HEAD} anchor={anchor} ls={0.8} color={lit ? C.greenDD : C.mute} op={clamp(k) * (1 - collapse)}>{l}</T>
                  ))}
                </g>
              );
            })}
          </g>
        )}
        {/* cleaner Bangladesh */}
        {mapK > 0 && (
          <g opacity={mapK}>
            <defs><linearGradient id="p6Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DDF1F4" /><stop offset="1" stopColor="#F4FAF6" /></linearGradient></defs>
            <rect x={40} y={520} width={1000} height={800} fill="url(#p6Sky)" />
            <circle cx={900} cy={620} r={50} fill="#FFE9A8" /><circle cx={900} cy={620} r={70 + Math.sin(t * 3) * 4} fill="#FFE9A8" opacity={0.35} />
            {[[180, 610, 1], [360, 580, 0.8], [700, 640, 0.9]].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x + ((t * 18) % 60)} ${y}) scale(${s})`} opacity={0.95}>
                <ellipse cx={0} cy={0} rx={56} ry={20} fill="#fff" /><circle cx={-16} cy={-12} r={22} fill="#fff" /><circle cx={16} cy={-16} r={26} fill="#fff" />
              </g>
            ))}
            {/* clean water: bay waves */}
            {[0, 1, 2].map((i) => <path key={i} d={`M40 ${1222 + i * 30} ${Array.from({ length: 11 }).map((_, j) => `q50 ${(j + i) % 2 ? 14 : -14} 100 0`).join(" ")}`} fill="none" stroke="#7CC4E0" strokeWidth={6} opacity={0.6 - i * 0.15} transform={`translate(${Math.sin(t * 1.5 + i) * 14} 0)`} />)}
            <BDMap v={v} depth={20} top={C.mint2} t={t} cities={["dhaka", "ctg", "khulna", "rajshahi", "sylhet"]} cityK={[1, 1, 1, 1, 1].map((_, i) => ramp(t, 5.9 + i * 0.1, 0.4))} labels={false} />
            {TREE_AT.map((c, i) => {
              const [x, y] = pr.city(c);
              const k = backOut((t - 5.7 - i * 0.05) / 0.4);
              if (k <= 0) return null;
              const dx = (rand(i * 3.3) - 0.5) * 40, dy = (rand(i * 5.1) - 0.5) * 30;
              return <g key={c} transform={`translate(${x + dx} ${y + dy}) scale(${clamp(k) * 0.9})`}>
                <rect x={-3} y={-6} width={6} height={16} fill="#8B6A47" /><circle cy={-18} r={16} fill={C.green} /><circle cx={-8} cy={-24} r={10} fill={C.lime} />
              </g>;
            })}
            {/* modern Dhaka */}
            {(() => { const [x, y] = pr.city("dhaka"); const k = easeOut((t - 5.95) / 0.5);
              return <g transform={`translate(${x} ${y + 6})`}>{[[-34, 60, 22], [-10, 96, 26], [18, 74, 22], [42, 50, 18]].map(([dx, h, w], i) => (
                <rect key={i} x={dx - w / 2} y={-h * k} width={w} height={h * k} rx={3} fill="#fff" stroke={C.ink} strokeWidth={3} />))}</g>; })()}
            {/* healthy community, clean air, trees, water */}
            {[["Clean Air", 200, 700], ["Green Trees", 880, 760], ["Clean Water", 220, 1160], ["Healthy Community", 850, 1150]].map(([l, x, y], i) => {
              const k = backOut((t - 6.1 - i * 0.12) / 0.4);
              if (k <= 0) return null;
              const w = (l as string).length * 14 + 74;
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${clamp(k)})`}>
                  <rect x={-w / 2} y={-27} width={w} height={54} rx={27} fill="#fff" filter="url(#jSh)" />
                  <circle cx={-w / 2 + 28} cy={0} r={15} fill={i === 2 ? "#7CC4E0" : C.green} />
                  <T x={-w / 2 + 52} y={8} size={22} w={700} anchor="start">{l}</T>
                </g>
              );
            })}
          </g>
        )}
        {/* brand end frame */}
        {brand > 0 && (
          <g opacity={brand}>
            <rect x={40} y={520} width={1000} height={800} fill="#FFFFFF" />
            <ellipse cx={540} cy={760} rx={380} ry={300} fill="url(#jGlow)" opacity={0.7} />
            <g transform={`translate(540 ${724}) scale(${backOut((t - 7.2) / 0.6)})`}>
              <g transform={`rotate(${t * 12})`} opacity={0.18}><Recycle r={190} sw={18} p={1} /></g>
              <Mark size={270} />
            </g>
            <g opacity={ramp(t, 7.6, 0.4)} transform={`translate(0 ${(1 - ramp(t, 7.6, 0.4, easeOut)) * 20})`}><Word width={640} x={540} y={960} /></g>
            <g opacity={ramp(t, 8.0, 0.4)}>
              <T x={540} y={1080} size={42} w={800} font={HEAD}>পুরোনো Electronics? BhangariWala-কে দিন।</T>
            </g>
            <g opacity={ramp(t, 8.35, 0.4)}>
              <T x={540} y={1146} size={44} w={800} font={HEAD} color={C.greenD}>সুস্থ পরিবেশ, নিরাপদ ডেটা।</T>
            </g>
            <g transform={`translate(540 1236) scale(${backOut((t - 8.7) / 0.45)})`} opacity={ramp(t, 8.7, 0.2)}>
              <rect x={-330} y={-38} width={660} height={76} rx={38} fill={C.green} />
              <T x={0} y={12} size={33} w={800} font={HEAD} color="#fff" ls={0.5}>Collect Responsibly. Recycle Better.</T>
            </g>
          </g>
        )}
      </Stage>
    </g>
  );
};

export { CITIES, win, expoOut };
