import React from "react";
import { p1Hero } from "./part1";
import { QMark, Air, Arrow, Badge, Bin, Chip, DataFile, Dev, DevKind, Dismantle, Flame, House, Office, Person, Sack, Soil, WarnRing, Water, Apartment } from "./icons";
import { C, HEAD, SANS, at, backOut, clamp, ease, easeOut, lerp, ramp } from "./lib";

// PART 2 (10-20 s): where the problem begins - three common paths, and what
// unsafe handling can touch (air, water, soil, data). Educational, calm.

const T = {
  out: 10.0,
  split: 10.85,
  path0: at("মিশে") - 0.2,
  path1: at("মিশে") + 0.6,
  path2: at("সাধারণ") + 0.6,
  chain: 14.65,
  fx: [at("unsafe"), at("পরিবেশ"), at("স্বাস্থ্য"), at("data")],
  zoom: 17.85,
  q: 18.45,
};
export const P2_Q = { x: 540, y: 860, t: T.q };

const ROWS = [
  { y: 560, label: "HOME", bn: "বাসা", dest: "MIXED HOUSEHOLD WASTE", destBn: "সাধারণ বর্জ্যে মিশে যাওয়া" },
  { y: 890, label: "SHOP", bn: "দোকান", dest: "UNORGANIZED COLLECTION", destBn: "অগোছালো সংগ্রহ" },
  { y: 1220, label: "OFFICE", bn: "অফিস", dest: "UNSAFE DISMANTLING", destBn: "অনিরাপদভাবে ভাঙা" },
];
const CW = 430, CH = 270, LX = 85, RX = 590, RW = 405;

const Room: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const w = (k: number) => Math.sin(t * 3 + k) * 2;
  const Item = ({ x, y, kind, s = 0.5, r = 0 }: { x: number; y: number; kind: DevKind; s?: number; r?: number }) =>
    <g transform={`translate(${x} ${y + w(x)}) rotate(${r}) scale(${s})`}><Dev kind={kind} /></g>;
  const floor = <><rect x={0} y={200} width={CW} height={70} fill="#E7ECEC" /><line x1={0} y1={200} x2={CW} y2={200} stroke={C.ink2} strokeWidth={3} /></>;
  if (i === 0) return (
    <g>{floor}
      <rect x={30} y={120} width={190} height={80} rx={18} fill="#9CC9AE" stroke={C.ink} strokeWidth={4} />
      <rect x={20} y={92} width={210} height={50} rx={16} fill="#B5D9C3" stroke={C.ink} strokeWidth={4} />
      <rect x={262} y={110} width={130} height={90} rx={6} fill="#E9DCC6" stroke={C.ink} strokeWidth={4} />
      <rect x={262} y={140} width={130} height={30} fill="#DCCBB0" stroke={C.ink} strokeWidth={3} />
      <Item x={290} y={80} kind="phone" s={0.42} r={-12} /><Item x={338} y={84} kind="charger" s={0.4} /><Item x={380} y={88} kind="battery" s={0.36} r={14} />
      <Item x={110} y={60} kind="phone" s={0.36} r={20} />
    </g>);
  if (i === 1) return (
    <g>{floor}
      {[60, 120].map((y) => <rect key={y} x={20} y={y} width={CW - 40} height={8} fill={C.ink2} />)}
      <Item x={70} y={34} kind="router" s={0.42} /><Item x={170} y={36} kind="phone" s={0.32} /><Item x={250} y={34} kind="battery" s={0.3} /><Item x={340} y={36} kind="cable" s={0.36} />
      <Item x={90} y={96} kind="charger" s={0.34} /><Item x={200} y={92} kind="laptop" s={0.36} /><Item x={330} y={96} kind="phone" s={0.32} r={8} />
      <rect x={40} y={150} width={CW - 80} height={60} rx={6} fill={C.green} stroke={C.ink} strokeWidth={4} />
      <rect x={40} y={150} width={CW - 80} height={14} fill={C.greenD} />
    </g>);
  return (
    <g>{floor}
      <rect x={40} y={140} width={300} height={16} rx={4} fill="#C9B79A" stroke={C.ink} strokeWidth={4} />
      <line x1={70} y1={156} x2={70} y2={210} stroke={C.ink} strokeWidth={6} /><line x1={310} y1={156} x2={310} y2={210} stroke={C.ink} strokeWidth={6} />
      <Item x={120} y={108} kind="laptop" s={0.5} /><Item x={250} y={100} kind="monitor" s={0.5} />
      <rect x={350} y={50} width={60} height={160} rx={6} fill="#E3E8E9" stroke={C.ink} strokeWidth={4} />
      <Item x={380} y={80} kind="router" s={0.3} /><Item x={380} y={150} kind="hdd" s={0.3} />
    </g>);
};

const DEST = [Bin, Sack, Dismantle];

const Paths: React.FC<{ t: number; out: number }> = ({ t, out }) => {
  const starts = [T.path0, T.path1, T.path2];
  return (
    <g opacity={1 - out} transform={`translate(0 ${-out * 80})`}>
      {ROWS.map((r, i) => {
        const k = ramp(t, T.split + i * 0.12, 0.45, easeOut);
        if (k <= 0) return null;
        const top = r.y - CH / 2;
        const a = ramp(t, starts[i], 0.6, ease);
        const dk = ramp(t, starts[i] + 0.45, 0.4, easeOut);
        const D = DEST[i];
        return (
          <g key={i}>
            <g transform={`translate(${LX - (1 - k) * 500} ${top})`} opacity={k}>
              <rect x={6} y={10} width={CW} height={CH} rx={26} fill="#0E2A1C" opacity={0.07} />
              <clipPath id={`bwRoom${i}`}><rect width={CW} height={CH} rx={26} /></clipPath>
              <rect width={CW} height={CH} rx={26} fill={C.paper} />
              <g clipPath={`url(#bwRoom${i})`}><g transform="translate(17 36) scale(0.92)"><Room i={i} t={t} /></g></g>
              <rect width={CW} height={CH} rx={26} fill="none" stroke={C.line} strokeWidth={3} />
              <g transform="translate(24 24)">
                <rect width={232} height={46} rx={23} fill={C.ink} />
                <text x={20} y={32} fontFamily={SANS} fontWeight={700} fontSize={26} letterSpacing={3} fill="#fff">{r.label}<tspan fill={C.lime} dx={10}>{r.bn}</tspan></text>
              </g>
            </g>
            <Arrow x1={LX + CW - 20} y1={r.y + 30} x2={RX + 40} y2={r.y + 10} p={a} t={t} bend={-0.18} color={C.red} sw={8} />
            {dk > 0 && (
              <g transform={`translate(${RX} ${top})`} opacity={dk}>
                <rect x={6} y={10} width={RW} height={CH} rx={26} fill="#0E2A1C" opacity={0.07} />
                <rect width={RW} height={CH} rx={26} fill="#FBF3F1" stroke={C.redSoft} strokeWidth={4} />
                <g transform={`translate(${RW / 2} ${112}) scale(${0.95 * backOut(dk)})`}><D t={t} /></g>
                <text x={RW / 2} y={CH - 50} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={2} fill={C.red}>{r.dest}</text>
                <text x={RW / 2} y={CH - 18} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={24} fill={C.ink2}>{r.destBn}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

const CELLS = [
  { cx: 300, cy: 640, src: "battery" as DevKind, Fx: Soil, label: "SOIL", bn: "মাটি" },
  { cx: 780, cy: 640, src: "monitor" as DevKind, Fx: Water, label: "WATER", bn: "পানি" },
  { cx: 300, cy: 1170, src: "cable" as DevKind, Fx: Air, label: "AIR", bn: "বাতাস", burn: true },
  { cx: 780, cy: 1170, src: "phone" as DevKind, Fx: DataFile, label: "DATA", bn: "ডেটা" },
];

const Chain: React.FC<{ t: number; z: number; fade: number }> = ({ t, z, fade }) => (
  <g transform={`translate(540 ${lerp(905, 860, z)}) scale(${lerp(1, 0.52, z)}) translate(-540 -905)`} opacity={1 - fade}>
    {CELLS.map((c, i) => {
      const a = T.fx[i];
      const k = ramp(t, a - 0.25, 0.4, easeOut);
      if (k <= 0) return null;
      const ar = ramp(t, a - 0.05, 0.4, ease);
      const fk = backOut((t - a + 0.0) / 0.45);
      const sx = c.cx - 120, sy = c.cy - 150, ex = c.cx + 40, ey = c.cy + 10;
      return (
        <g key={i} opacity={k} transform={`translate(${(c.cx - 540) * 0.45 * z} ${(c.cy - 905) * 0.3 * z})`}>
          <g transform={`translate(${sx} ${sy}) scale(${0.62 * lerp(0.6, 1, k)})`}>
            <Badge r={86}><g transform="scale(0.85)"><Dev kind={c.src} /></g></Badge>
            {c.burn && <g transform="translate(46 -40) scale(0.55)"><Flame t={t} /></g>}
          </g>
          <Arrow x1={sx + 40} y1={sy + 50} x2={ex - 80} y2={ey - 60} p={ar} t={t} color={C.gray} sw={6} bend={0.2} />
          {t > a && (
            <g transform={`translate(${ex} ${ey})`}>
              <WarnRing t={t} r={98} k={ramp(t, a + 0.25, 0.4)} />
              <g transform={`scale(${fk})`}><circle r={86} fill={C.paper} stroke={C.line} strokeWidth={3} /><g transform="scale(0.95)"><c.Fx t={t} /></g></g>
            </g>
          )}
          <Chip x={ex} y={ey + 150} text={c.label} k={ramp(t, a + 0.15, 0.3)} size={30} fill={C.ink} />
          <text x={ex} y={ey + 205} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} fill={C.mute} opacity={ramp(t, a + 0.3, 0.3)}>{c.bn}</text>
        </g>
      );
    })}
  </g>
);

/** people and places that gather around the question (18-20 s) */
const Around: React.FC<{ t: number; fade: number }> = ({ t, fade }) => {
  const k = (d: number) => ramp(t, T.zoom + 0.1 + d, 0.45, easeOut);
  return (
    <g opacity={1 - fade}>
      <g opacity={k(0)} transform={`translate(0 ${(1 - k(0)) * 60})`}>
        <House x={170} y={560} s={0.85} /><House x={910} y={560} s={0.85} tone="#EEF3F2" />
      </g>
      <g opacity={k(0.1)} transform={`translate(${(1 - k(0.1)) * 120} 0)`}><Office x={845} y={1330} w={150} h={360} /></g>
      <g opacity={k(0.05)} transform={`translate(${-(1 - k(0.05)) * 120} 0)`}><Apartment x={75} y={1330} w={150} h={300} seed={7} /></g>
      <g opacity={k(0.2)}>
        <Person x={330} y={1340} s={0.82} shirt={C.green} wave={t * 6} />
        <Person x={430} y={1340} s={0.76} shirt="#5E8C9E" orna />
        <Person x={510} y={1340} s={0.5} shirt="#E3A13B" />
        <Person x={640} y={1340} s={0.8} shirt="#3E5560" />
        <Person x={740} y={1340} s={0.74} shirt={C.lime} orna />
      </g>
    </g>
  );
};

export const Part2: React.FC<{ t: number }> = ({ t }) => {
  // opening: pull out from the old phone at the top of the pile
  const h = p1Hero(10);
  const o = ease((t - T.out) / 0.85);
  const ps = lerp(h.s * 6.5, 1.1, o);
  const px = lerp(h.x, 540, o), py = lerp(h.y, 860, o);
  const phoneK = 1 - ramp(t, T.split - 0.05, 0.3);
  const chainIn = ramp(t, T.chain, 0.4);
  const z = ease((t - T.zoom) / 0.7);
  const fade = ramp(t, 20.0, 0.35); // part 3 takes over
  return (
    <g>
      {phoneK > 0 && (
        <g transform={`translate(${px} ${py}) scale(${ps})`} opacity={phoneK}><Dev kind="phone" /></g>
      )}
      {t < T.chain + 0.5 && <Paths t={t} out={chainIn} />}
      {t > T.chain && <Chain t={t} z={z} fade={fade} />}
      {t > T.zoom && <Around t={t} fade={fade} />}
      {t > T.q && (
        <g>
          <g transform={`translate(${P2_Q.x} ${P2_Q.y}) scale(${backOut((t - T.q) / 0.5)})`} opacity={1 - ramp(t, 20.05, 0.2)}>
            <circle r={96} fill={C.ink} />
            <circle r={96} fill="none" stroke={C.green} strokeWidth={6} opacity={0.6} />
            <QMark p={ramp(t, T.q + 0.1, 0.4)} />
          </g>
          <g transform={`translate(540 ${370 + (1 - easeOut((t - T.q - 0.1) / 0.4)) * 30})`} opacity={ramp(t, T.q + 0.1, 0.3) * (1 - fade)}>
            <text textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={104} fill={C.ink}>সমাধান <tspan fill={C.green}>কী?</tspan></text>
          </g>
        </g>
      )}
    </g>
  );
};

export const P2_T = T;
export { clamp };
