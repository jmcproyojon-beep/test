import React from "react";
import { C, HEAD, SANS, backOut, clamp, ease, easeOut, expoOut, lerp, rand, ramp, smooth, win } from "../bhangariwala/lib";
import { Dev, DevKind, Apartment, Shop, Palm, Rickshaw, House, Shield } from "../bhangariwala/icons";
import { Box, Check, Cross, Figure, Headphones, Mark, Mouse, PCB, PhoneFrame, T, Tray, Word, st } from "./kit";

// Parts 1-3: at home -> doorstep pickup -> sorting at the facility.
// Every part takes local time t (0..10, a little beyond at the seams).

export type Kind = DevKind | "headphones" | "mouse" | "pcb";
export const Item: React.FC<{ kind: Kind }> = ({ kind }) =>
  kind === "headphones" ? <Headphones /> : kind === "mouse" ? <Mouse /> : kind === "pcb" ? <PCB /> : <Dev kind={kind} old />;

type Pt = [number, number];
const bez = (a: Pt, c: Pt, b: Pt, u: number): Pt => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];

/** the rounded "diorama" card most scenes sit in */
export const Stage: React.FC<{ id: string; children: React.ReactNode; y0?: number; y1?: number }> = ({ id, children, y0 = 520, y1 = 1320 }) => (
  <g>
    <rect x={40} y={y0} width={1000} height={y1 - y0} rx={44} fill="#fff" filter="url(#jSh)" />
    <clipPath id={id}><rect x={40} y={y0} width={1000} height={y1 - y0} rx={44} /></clipPath>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={40} y={y0} width={1000} height={y1 - y0} rx={44} fill="none" stroke="#fff" strokeWidth={6} />
  </g>
);

/** hands of a figure at (fx, fy, scale s) holding a box whose front-bottom centre is (bx, by) at box scale bs */
const holdBox = (bx: number, by: number, bs: number, fx: number, fy: number, s: number) => ({
  l: [(bx - 70 * bs - fx) / s, (by - 60 * bs - fy) / s] as Pt,
  r: [(bx + 70 * bs - fx) / s, (by - 60 * bs - fy) / s] as Pt,
});

// ============================================================ PART 1 · at home
const P1_ITEMS: { kind: Kind; from: Pt; to: Pt; s0: number; s1: number }[] = [
  { kind: "laptop", from: [212, 792], to: [540, 878], s0: 0.95, s1: 1.45 },
  { kind: "router", from: [166, 948], to: [355, 762], s0: 0.8, s1: 1.1 },
  { kind: "headphones", from: [272, 944], to: [725, 762], s0: 0.75, s1: 1.1 },
  { kind: "phone", from: [792, 938], to: [335, 935], s0: 0.55, s1: 1.0 },
  { kind: "charger", from: [866, 942], to: [748, 935], s0: 0.5, s1: 1.0 },
  { kind: "cable", from: [938, 944], to: [452, 1032], s0: 0.5, s1: 0.95 },
  { kind: "mouse", from: [760, 948], to: [632, 1036], s0: 0.5, s1: 0.95 },
  { kind: "battery", from: [212, 935], to: [540, 724], s0: 0.55, s1: 0.85 },
];
const BOX1: Pt = [812, 1282], BIN1: Pt = [470, 1282];

/** steel almirah door hinged at hx, swinging toward camera by o (0..1) */
const Door: React.FC<{ hx: number; dir: number; o: number }> = ({ hx, dir, o }) => {
  const th = o * 1.95, w = 118 * Math.cos(th), d = Math.sin(th) * 22;
  const fx = hx + dir * w;
  const inner = Math.cos(th) < 0;
  return (
    <g>
      <path d={`M${hx} 652 L${fx} ${652 - d} L${fx} ${1140 + d} L${hx} 1140 Z`} fill={inner ? "#7F918E" : "#A9B8B5"} {...st} strokeWidth={4} />
      {!inner && <rect x={fx - dir * 22 - 4} y={880} width={8} height={56} rx={4} fill={C.ink} />}
      {!inner && <path d={`M${lerp(hx, fx, 0.2)} 690 L${lerp(hx, fx, 0.8)} 690 L${lerp(hx, fx, 0.8)} 840 L${lerp(hx, fx, 0.2)} 840 Z`} fill="none" stroke="#8C9C99" strokeWidth={3} />}
    </g>
  );
};

const Room: React.FC<{ t: number }> = ({ t }) => {
  const o = ease((t - 0.25) / 0.7), dr = ease((t - 0.4) / 0.6);
  return (
    <g>
      <defs>
        <linearGradient id="p1Wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFDF7" /><stop offset="1" stopColor="#F1ECE1" /></linearGradient>
        <linearGradient id="p1Floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6DCCB" /><stop offset="1" stopColor="#D8CCB7" /></linearGradient>
        <linearGradient id="p1Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CBE8F0" /><stop offset="1" stopColor="#ECF7F1" /></linearGradient>
        <linearGradient id="p1Wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C99F70" /><stop offset="1" stopColor="#B3875A" /></linearGradient>
      </defs>
      <rect x={40} y={520} width={1000} height={630} fill="url(#p1Wall)" />
      <rect x={40} y={1150} width={1000} height={180} fill="url(#p1Floor)" />
      {[-700, -380, -120, 120, 380, 700, 1050].map((dx) => <line key={dx} x1={540 + dx * 0.32} y1={1150} x2={540 + dx * 1.1} y2={1330} stroke="#CDBFA8" strokeWidth={3} />)}
      {[1190, 1245].map((y) => <line key={y} x1={40} y1={y} x2={1040} y2={y} stroke="#CDBFA8" strokeWidth={3} />)}
      <rect x={40} y={1138} width={1000} height={14} fill="#E3D8C5" />
      {/* window with a Dhaka-style grill and green curtains */}
      <rect x={420} y={566} width={240} height={226} rx={8} fill="url(#p1Sky)" stroke="#fff" strokeWidth={14} />
      <rect x={420} y={566} width={240} height={226} rx={8} fill="none" stroke={C.line} strokeWidth={3} />
      <g stroke="#9AA7AB" strokeWidth={4} fill="none">
        {[460, 500, 540, 580, 620].map((x) => <line key={x} x1={x} y1={574} x2={x} y2={786} />)}
        <path d="M428 680 Q540 616 652 680" /><path d="M428 700 Q540 636 652 700" />
      </g>
      <path d="M404 556 Q430 680 414 806 L446 806 Q428 680 448 556 Z" fill={C.mint2} />
      <path d="M676 556 Q650 680 666 806 L634 806 Q652 680 632 556 Z" fill={C.mint2} />
      <rect x={396} y={548} width={288} height={12} rx={6} fill={C.greenD} />
      {/* clock */}
      <g transform="translate(884 640)"><circle r={36} fill="#fff" {...st} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-22} {...st} strokeWidth={4} transform={`rotate(${t * 30})`} /><line x1={0} y1={0} x2={16} y2={0} {...st} strokeWidth={4} /></g>
      {/* almirah */}
      <rect x={84} y={628} width={252} height={24} rx={6} fill="#8FA19E" {...st} strokeWidth={4} />
      <rect x={92} y={652} width={236} height={488} fill="#33434A" {...st} strokeWidth={4} />
      <rect x={100} y={812} width={220} height={10} fill="#56676D" /><rect x={100} y={972} width={220} height={10} fill="#56676D" />
      <Door hx={92} dir={1} o={o} />
      <Door hx={328} dir={-1} o={o} />
      {/* drawer chest with a plant */}
      <rect x={708} y={892} width={304} height={18} rx={5} fill="#A57A50" {...st} strokeWidth={4} />
      <rect x={720} y={910} width={280} height={240} fill="url(#p1Wood)" {...st} strokeWidth={4} />
      {[1000, 1078].map((y) => <g key={y}><rect x={732} y={y} width={256} height={64} rx={6} fill="#C39769" stroke="#8B6A47" strokeWidth={3} /><circle cx={860} cy={y + 32} r={7} fill="#6B4E33" /></g>)}
      <g transform={`translate(0 ${dr * 46})`}>
        <rect x={730} y={916} width={260} height={30} fill="#5D4430" />
        <rect x={726} y={924 + 0} width={268} height={70} rx={6} fill="#CFA375" {...st} strokeWidth={4} transform={`translate(860 959) scale(${1 + dr * 0.04}) translate(-860 -959)`} />
        <circle cx={860} cy={960} r={8} fill="#6B4E33" />
      </g>
      <g transform="translate(764 892)"><path d="M-22 0 L-18 -40 H18 L22 0 Z" fill="#E7E2D8" {...st} strokeWidth={4} />
        {[-40, -10, 20, 45].map((a, i) => <path key={i} d={`M0 -40 Q${Math.sin((a * Math.PI) / 180) * 50} ${-80 - i * 6} ${Math.sin((a * Math.PI) / 180) * 70} ${-96 + Math.abs(a) * 0.5}`} fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round" />)}</g>
    </g>
  );
};

const ElectronicsBox: React.FC<{ t: number; open: number }> = ({ t, open }) => (
  <g>
    <Box x={BOX1[0]} y={BOX1[1]} s={1.1} open={open} />
  </g>
);

const Bin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={8} cy={4} rx={86} ry={12} fill="#0E2A1C" opacity={0.14} />
    <path d="M-66 -150 L-54 0 H54 L66 -150 Z" fill="#7B898E" {...st} strokeWidth={4} />
    <rect x={-76} y={-170} width={152} height={22} rx={8} fill="#5E6C71" {...st} strokeWidth={4} />
    {[-26, 0, 26].map((x) => <line key={x} x1={x} y1={-132} x2={x * 0.9} y2={-90} stroke="#5E6C71" strokeWidth={5} strokeLinecap="round" />)}
    <text y={-46} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={19} fill="#fff" letterSpacing={1}>REGULAR</text>
    <text y={-22} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={19} fill="#fff" letterSpacing={1}>WASTE</text>
  </g>
);

/** small street map with the home and the pickup van, joined by a green route */
const RouteMap: React.FC<{ t: number; k: number; p: number; vanGo: number }> = ({ t, k, p, vanGo }) => {
  const route: Pt[] = [[250, 1150], [250, 1016], [600, 1016], [600, 870], [800, 870]];
  const lens = route.slice(1).map((q, i) => Math.hypot(q[0] - route[i][0], q[1] - route[i][1]));
  const tot = lens.reduce((a, b) => a + b, 0);
  let left = p * tot; const pts: Pt[] = [route[0]];
  for (let i = 0; i < lens.length && left > 0; i++) {
    const u = Math.min(1, left / lens[i]); left -= lens[i];
    pts.push([lerp(route[i][0], route[i + 1][0], u), lerp(route[i][1], route[i + 1][1], u)]);
  }
  const d = "M" + pts.map((q) => q.join(" ")).join(" L");
  return (
    <g opacity={k}>
      <rect x={40} y={520} width={1000} height={800} fill="#E9F2EC" />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => (
        <rect key={`${r}${c}`} x={70 + c * 196} y={560 + r * 196} width={168} height={160} rx={18} fill={(r * 5 + c) % 3 === 0 ? "#DCEBDF" : "#E1EAE5"} />
      )))}
      {[0, 1, 2].map((i) => <circle key={i} cx={160 + i * 330} cy={640 + (i % 2) * 400} r={30} fill={C.mint2} />)}
      <path d={d} fill="none" stroke={C.green} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.25} />
      <path d={d} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 18" strokeDashoffset={-t * 80} />
      <House x={250} y={1222} s={0.72} />
      <g transform="translate(250 1086)"><circle r={18} fill={C.green} stroke="#fff" strokeWidth={5} /></g>
      <g transform={`translate(${800 + vanGo * 420} 896) scale(0.5)`}><BVan t={t} /></g>
      <g transform="translate(800 790)" opacity={1 - vanGo}>
        <rect x={-92} y={-24} width={184} height={48} rx={24} fill={C.ink} />
        <text y={9} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={22} letterSpacing={2} fill="#fff">ON THE WAY</text>
      </g>
    </g>
  );
};

/** BhangariWala pickup van, side view facing right, with a sliding cargo door (door 0..1 = open) */
export const BVan: React.FC<{ t: number; door?: number; bounce?: number }> = ({ t, door = 0, bounce = 0 }) => {
  const dy = Math.sin(t * 22) * 1.6 * bounce;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={230} ry={16} fill="#0E2A1C" opacity={0.16} />
      <g transform={`translate(0 ${dy})`}>
        <path d="M-200 -48 V-236 Q-200 -250 -186 -250 H86 V-48 Z" fill="#FFFFFF" {...st} />
        <path d="M86 -200 H150 Q170 -200 182 -180 L214 -122 Q222 -108 222 -92 V-48 H86 Z" fill="#FFFFFF" {...st} />
        <path d="M104 -186 H146 Q156 -186 162 -176 L188 -128 H104 Z" fill="#BFE0EE" {...st} strokeWidth={4} />
        <rect x={-198} y={-108} width={418} height={26} fill={C.green} />
        <rect x={208} y={-96} width={14} height={20} rx={4} fill={C.warn} />
        {/* cargo door opening */}
        <rect x={-188} y={-232} width={94} height={180} rx={8} fill="#2B363B" />
        {door > 0.01 && <rect x={-180} y={-150} width={78} height={8} fill="#55666C" />}
        <g transform={`translate(${-door * 60} 0)`} opacity={1 - door}>
          <rect x={-188} y={-232} width={94} height={180} rx={8} fill="#F3F6F4" {...st} strokeWidth={4} />
          <rect x={-112} y={-160} width={8} height={36} rx={4} fill={C.ink} />
        </g>
        <g transform="translate(-4 -190)"><Mark size={72} /></g>
        <Word width={164} x={-4} y={-132} />
        {[-120, 140].map((cx) => <g key={cx} transform={`translate(${cx} -44)`}><circle r={40} fill={C.ink} /><circle r={17} fill="#CED6D8" />
          <line x1={0} y1={0} x2={Math.cos(t * 14) * 15} y2={Math.sin(t * 14) * 15} stroke={C.ink} strokeWidth={4} /></g>)}
      </g>
    </g>
  );
};

export const Part1: React.FC<{ t: number }> = ({ t }) => {
  const dim = ramp(t, 2.75, 0.4) * 0.5;
  const binK = backOut((t - 3.25) / 0.5);
  const custX = lerp(-60, 196, easeOut((t - 2.7) / 0.9));
  const walking = t > 2.7 && t < 3.6 ? t * 9 : 0;
  const phoneK = ramp(t, 5.9, 0.55, easeOut);
  const ui = ramp(t, 5.95, 0.5, (x) => backOut(x, 1.2));
  const tap = ramp(t, 6.75, 0.45, easeOut), press = win(t, 7.15, 7.45, 0.08, 0.12);
  const done = ramp(t, 7.4, 0.4);
  const mapK = ramp(t, 8.45, 0.4);
  const route = ramp(t, 8.6, 1.0, ease);
  const vanGo = ramp(t, 9.55, 0.8, (x) => x * x);
  const cta = ramp(t, 9.05, 0.35, easeOut);
  const boxOpen = ramp(t, 4.25, 0.3) * (1 - ramp(t, 5.75, 0.3));
  // the phone first tries the regular bin, gets a red X, then everything goes to the electronics box
  const tryBin = win(t, 3.75, 4.75, 0.35, 0.3);
  const xK = win(t, 4.1, 5.0, 0.2, 0.3);
  const okK = ramp(t, 5.45, 0.4);
  return (
    <g>
      <Stage id="p1stage">
        <g opacity={1 - mapK}>
          <Room t={t} />
          <rect x={40} y={520} width={1000} height={800} fill="#FFFFFF" opacity={dim} />
          <ellipse cx={540} cy={890} rx={340} ry={250} fill="url(#jGlow)" opacity={ramp(t, 1.4, 0.8) * (1 - ramp(t, 4.6, 0.6))} />
          {/* bins */}
          {binK > 0 && <g opacity={clamp(binK * 2)}>
            <g transform={`translate(${BIN1[0]} ${BIN1[1]}) scale(${binK}) translate(${-BIN1[0]} ${-BIN1[1]})`}><Bin x={BIN1[0]} y={BIN1[1]} /></g>
            <g transform={`translate(${BOX1[0]} ${BOX1[1]}) scale(${binK}) translate(${-BOX1[0]} ${-BOX1[1]})`}><ElectronicsBox t={t} open={boxOpen} /></g>
            <g transform={`translate(${BOX1[0] + 10} 1070)`}>
              <rect x={-128} y={-23} width={256} height={46} rx={23} fill={C.ink} />
              <text y={8} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={21} letterSpacing={1.5} fill="#fff">OLD ELECTRONICS</text>
            </g>
          </g>}
          <g transform={`translate(${BIN1[0]} 1060)`}><Cross r={40} k={xK} /></g>
          <g transform={`translate(${BOX1[0] + 104} 1128)`}><Check r={40} k={okK} /></g>
          {/* the family member */}
          {t > 2.6 && <Figure x={custX} y={1300} s={0.92} who="cust" walk={walking} look={1}
            pose={t > 3.5 && t < 5.6 ? { r: [lerp(52, 118, win(t, 3.6, 5.6, 0.3, 0.4)), lerp(-118, -214, win(t, 3.6, 5.6, 0.3, 0.4))] } : {}} blink={win(t, 4.6, 4.75, 0.05, 0.05)} />}
          {/* items: shelf -> floating group -> (phone tries the bin) -> electronics box */}
          {P1_ITEMS.map((it, i) => {
            const t0 = 0.55 + i * 0.13;
            const u = ease((t - t0) / 0.95);
            const p = bez(it.from, [lerp(it.from[0], it.to[0], 0.5), Math.min(it.from[1], it.to[1]) - 170], it.to, u);
            const bob = Math.sin(t * 2.2 + i * 1.3) * 7 * u;
            let x = p[0], y = p[1] + bob, s = lerp(it.s0, it.s1, u), rot = Math.sin(t * 1.7 + i) * 5 * u;
            if (i === 3) { x = lerp(x, BIN1[0], tryBin); y = lerp(y, 1110, tryBin); }
            const g0 = 4.55 + (i === 3 ? 0.5 : i * 0.1);
            const g = ease((t - g0) / 0.55);
            if (g > 0) {
              const q = bez([x, y], [lerp(x, BOX1[0], 0.5), Math.min(y, 1000) - 140], [BOX1[0] + 15, 1160], g);
              x = q[0]; y = q[1]; s *= lerp(1, 0.35, g); rot *= 1 - g;
            }
            if (g >= 1) return null;
            const vis = t < t0 ? 1 : 1;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={vis * (u > 0 || t < t0 ? 1 : 1) * (1 - ramp(g, 0.8, 0.2))}>
                {u > 0.3 && <ellipse cx={0} cy={70} rx={46} ry={9} fill="#0E2A1C" opacity={0.08 * u} />}
                <Item kind={it.kind} />
              </g>
            );
          })}
          {/* the app */}
          {phoneK > 0 && <rect x={40} y={520} width={1000} height={800} fill="#F3F8F4" opacity={phoneK * 0.88} />}
          {ui > 0 && (
            <g transform={`translate(540 ${lerp(1500, 918, ui)}) scale(${lerp(0.8, 1, ui)})`}>
              <PhoneFrame w={420} h={760}>
                <AppScreen t={t} press={press} done={done} />
              </PhoneFrame>
              {/* finger */}
              <g transform={`translate(${lerp(330, 70, tap)} ${lerp(560, 330, tap)}) scale(${1 - press * 0.12})`} opacity={tap * (1 - done)}>
                <circle r={34 + press * 30} fill={C.green} opacity={press * 0.3} />
                <path d="M-14 -8 V-62 A14 14 0 0 1 14 -62 V-14 L46 -6 Q60 -2 58 14 L50 62 H-6 L-40 12 Q-48 0 -36 -6 Z" fill="#E7B38E" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              </g>
            </g>
          )}
        </g>
        {mapK > 0 && <RouteMap t={t} k={mapK} p={route} vanGo={vanGo} />}
      </Stage>
      {cta > 0 && (
        <g transform={`translate(540 ${1438 + (1 - cta) * 20})`} opacity={cta}>
          <rect x={-430} y={-40} width={860} height={80} rx={40} fill={C.ink} />
          <text y={14} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={38} fill="#fff">পুরোনো Electronics? <tspan fill={C.lime}>BhangariWala-কে দিন।</tspan></text>
        </g>
      )}
    </g>
  );
};

const AppScreen: React.FC<{ t: number; press: number; done: number }> = ({ t, press, done }) => (
  <g>
    <T x={38} y={58} size={22} anchor="start" w={700}>9:41</T>
    <g transform="translate(0 0)" opacity={1 - done}>
      <rect x={0} y={78} width={420} height={96} fill="#fff" />
      <Mark size={60} x={56} y={126} />
      <Word width={220} x={208} y={126} />
      <T x={30} y={232} size={34} anchor="start" w={700}>Old Electronics</T>
      <T x={30} y={270} size={24} anchor="start" w={600} color={C.mute}>8 items ready for pickup</T>
      <rect x={22} y={296} width={376} height={206} rx={26} fill="#fff" stroke={C.soft} strokeWidth={3} />
      {(["laptop", "router", "headphones", "phone", "charger", "cable", "mouse", "battery"] as Kind[]).map((k, i) => (
        <g key={k} transform={`translate(${70 + (i % 4) * 93} ${352 + Math.floor(i / 4) * 98}) scale(0.5)`}>
          <circle r={72} fill={C.mint} /><g transform="scale(0.95)"><Item kind={k} /></g>
        </g>
      ))}
      <rect x={22} y={520} width={376} height={84} rx={24} fill="#fff" stroke={C.soft} strokeWidth={3} />
      <g transform="translate(66 562)"><path d="M0 22 C-18 0 -18 -6 -18 -10 A18 18 0 0 1 18 -10 C18 -6 18 0 0 22 Z" fill={C.green} /><circle cy={-10} r={7} fill="#fff" /></g>
      <T x={100} y={556} size={24} anchor="start" w={700}>Home pickup</T>
      <T x={100} y={586} size={20} anchor="start" w={600} color={C.mute}>Doorstep · Today</T>
      <g transform={`translate(210 670) scale(${1 - press * 0.04})`}>
        <rect x={-188} y={-46} width={376} height={92} rx={46} fill={press > 0 ? C.greenD : C.green} />
        <text y={12} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={34} fill="#fff">Pickup Request</text>
      </g>
    </g>
    {done > 0 && (
      <g opacity={done}>
        <circle cx={210} cy={318} r={lerp(40, 98, expoOut(done))} fill={C.mint} />
        <g transform="translate(210 318)"><Check r={70} k={ramp(done, 0.1, 0.9)} /></g>
        <T x={210} y={480} size={38} font={HEAD} w={800}>Request Received</T>
        <T x={210} y={524} size={23} w={600} color={C.mute}>A BhangariWala team is on the way</T>
        <g transform="translate(210 610)">
          <rect x={-150} y={-30} width={300} height={60} rx={30} fill={C.mint} />
          <T x={0} y={9} size={24} w={700} color={C.greenDD}>Pickup · Doorstep</T>
        </g>
      </g>
    )}
  </g>
);

// ============================================================ PART 2 · doorstep collection
const SPEED = 430;
/** road position: cruise, then ease to a stop at 3.0 s */
const roadX = (t: number) => {
  if (t < 2.2) return SPEED * t;
  const u = Math.min(t, 3.0) - 2.2;
  return SPEED * (2.2 + u - (u * u) / 1.6);
};
const STOP = roadX(3.0);
const DOOR_WX = STOP + 760;      // world x of the pickup apartment, so it stops at screen x 760

const Street: React.FC<{ t: number; off: number; vanX: number; door: number; bounce: number; rickshaw?: boolean }> = ({ t, off, vanX, door, bounce, rickshaw = true }) => (
  <g>
    <defs>
      <linearGradient id="p2Sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DDF0EC" /><stop offset="1" stopColor="#F6FAF8" /></linearGradient>
    </defs>
    <rect x={40} y={520} width={1000} height={800} fill="url(#p2Sky)" />
    <circle cx={880} cy={640} r={56} fill="#FFF3D6" />
    {/* far skyline */}
    <g transform={`translate(${-(off * 0.35) % 840} 0)`}>
      {Array.from({ length: 14 }).map((_, i) => {
        const h = 170 + rand(i * 3.1) * 200, w = 70 + rand(i * 7.7) * 60;
        return <rect key={i} x={i * 120 - 40} y={1150 - h} width={w} height={h} fill="#D6E6E0" />;
      })}
    </g>
    {/* near street */}
    <g transform={`translate(${-off} 0)`}>
      {Array.from({ length: 14 }).map((_, i) => {
        const wx = i * 300 - 100;
        if (wx > off + 1200 || wx < off - 400) return null;
        if (Math.abs(wx - DOOR_WX + 110) < 220) return null;
        const kind = i % 3;
        return kind === 0 ? <Apartment key={i} x={wx} y={1150} w={210} h={380 + (i % 4) * 30} seed={i} /> : kind === 1 ? <Shop key={i} x={wx} y={1150} w={220} /> : <g key={i}><Apartment x={wx} y={1150} w={180} h={300} seed={i + 4} tone="#EEF4F1" /><Palm x={wx + 230} y={1150} s={0.9} t={t} /></g>;
      })}
      {/* the pickup apartment */}
      <g>
        <Apartment x={DOOR_WX - 130} y={1150} w={260} h={500} seed={21} tone="#FFFFFF" />
        <rect x={DOOR_WX - 56} y={1060} width={112} height={90} rx={6} fill={C.green} opacity={0.18} />
      </g>
    </g>
    <rect x={40} y={1150} width={1000} height={26} fill="#D5DCD8" />
    <rect x={40} y={1176} width={1000} height={150} fill="#3A4950" />
    <g transform={`translate(${-(off % 120)} 0)`}>{Array.from({ length: 11 }).map((_, i) => <rect key={i} x={40 + i * 120} y={1246} width={60} height={8} rx={4} fill="#fff" opacity={0.7} />)}</g>
    {rickshaw && <g transform={`translate(${1200 - ((t * 260 + off * 0.6) % 1500)} 1236) scale(0.62)`}><Rickshaw x={0} y={0} t={t} /></g>}
    <g transform={`translate(${vanX} 1300) scale(0.78)`}><BVan t={off / 30} door={door} bounce={bounce} /></g>
  </g>
);

const HANDOVER: { label: string; draw: () => React.ReactNode }[] = [
  { label: "Customer", draw: () => <g><circle cx={0} cy={-12} r={14} fill={C.ink2} /><path d="M-24 22 Q0 -8 24 22 Z" fill={C.ink2} /></g> },
  { label: "BhangariWala", draw: () => <Mark size={64} /> },
  { label: "Secure", draw: () => <g transform="scale(0.5)"><Shield k={1} /></g> },
];

const Doorway: React.FC<{ t: number }> = ({ t }) => {
  // box passes from the customer (x 470) to the representative (x 780)
  const h = ease((t - 3.95) / 0.7);
  const bx = lerp(520, 726, h), by = 1158 - Math.sin(h * Math.PI) * 26, bs = 0.78;
  const cust = { x: 440, y: 1300, s: 1 }, rep = { x: 800, y: 1306, s: 1 };
  const custHold = h < 0.62 ? holdBox(bx, by, bs, cust.x, cust.y, cust.s) : {};
  const repHold = h > 0.38 ? holdBox(bx, by, bs, rep.x, rep.y, rep.s) : {};
  const open = ramp(t, 4.75, 0.35);
  const list = win(t, 4.85, 5.95, 0.3, 0.3);
  const strip = ramp(t, 5.85, 0.4);
  const ITEMS: [Kind, string][] = [["phone", "Phones"], ["laptop", "Laptop"], ["charger", "Charger"], ["cable", "Cables"], ["router", "Router"]];
  return (
    <g>
      <rect x={40} y={520} width={1000} height={800} fill="#F5F0E7" />
      <rect x={40} y={1170} width={1000} height={160} fill="#E2D9C9" />
      <rect x={40} y={1160} width={1000} height={12} fill="#D3C8B4" />
      {/* door frame and open door */}
      <rect x={330} y={720} width={300} height={452} fill="#FFF7EA" />
      <rect x={330} y={1100} width={300} height={70} fill="#EFE5D3" />
      <path d="M346 736 L410 760 L410 1146 L346 1168 Z" fill="#B98A5E" {...st} strokeWidth={4} />
      <rect x={316} y={708} width={328} height={464} fill="none" stroke="#8B6A47" strokeWidth={22} />
      <rect x={452} y={676} width={56} height={24} rx={5} fill="#fff" stroke={C.line} strokeWidth={2} />
      <T x={480} y={695} size={18} w={700} font={HEAD}>4B</T>
      <g transform="translate(880 900)"><rect x={-60} y={-80} width={120} height={160} rx={10} fill="#fff" stroke={C.line} strokeWidth={3} /><Mark size={80} y={-10} /><T x={0} y={58} size={16} w={700} color={C.mute}>PICKUP</T></g>
      <Figure x={cust.x} y={cust.y} s={cust.s} who="cust" pose={custHold} look={1} blink={win(t, 5.2, 5.35, 0.05, 0.05)} />
      <Figure x={rep.x} y={rep.y} s={rep.s} who="rep" pose={repHold} look={-1} blink={win(t, 4.3, 4.45, 0.05, 0.05)} />
      <Box x={bx} y={by} s={bs} open={open}>
        {open > 0.3 && <g opacity={ramp(open, 0.3, 0.5)}>
          <g transform="translate(-10 -150) rotate(-12) scale(0.5)"><Dev kind="laptop" old /></g>
          <g transform="translate(44 -146) rotate(14) scale(0.5)"><Dev kind="phone" old /></g>
          <g transform="translate(-50 -134) scale(0.45)"><Dev kind="cable" old /></g>
        </g>}
      </Box>
      {/* checklist */}
      {list > 0 && (
        <g transform={`translate(806 ${790 + (1 - list) * 20})`} opacity={list}>
          <rect x={-150} y={-150} width={300} height={290} rx={24} fill="#fff" filter="url(#jSh)" />
          <T x={-122} y={-108} size={22} w={800} font={HEAD} anchor="start" ls={1.5} color={C.greenDD}>CHECKED</T>
          {ITEMS.map(([k, l], i) => {
            const c = ramp(t, 5.0 + i * 0.13, 0.25);
            return (
              <g key={k} transform={`translate(0 ${-62 + i * 44})`}>
                <g transform="translate(-112 0) scale(0.3)"><Item kind={k} /></g>
                <T x={-76} y={8} size={22} w={600} anchor="start">{l}</T>
                <g transform="translate(104 0)"><Check r={15} k={c} /></g>
              </g>
            );
          })}
        </g>
      )}
      {/* handover: customer -> BhangariWala -> secure */}
      {strip > 0 && (
        <g transform={`translate(0 ${(1 - strip) * 16})`} opacity={strip}>
          <rect x={150} y={556} width={780} height={150} rx={34} fill="#fff" filter="url(#jSh)" />
          {HANDOVER.map((hv, i) => {
            const k = backOut((t - 5.95 - i * 0.28) / 0.4);
            const x = 270 + i * 270;
            return (
              <g key={i}>
                {i > 0 && <path d={`M${x - 208} 614 H${lerp(x - 208, x - 62, ramp(t, 5.95 + i * 0.28 - 0.15, 0.3))}`} stroke={C.green} strokeWidth={7} strokeLinecap="round" />}
                {i > 0 && ramp(t, 5.95 + i * 0.28 + 0.1, 0.1) > 0 && <path d={`M${x - 74} 602 L${x - 56} 614 L${x - 74} 626`} fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />}
                <g transform={`translate(${x} 614) scale(${clamp(k)})`}>
                  <circle r={44} fill={i === 2 ? C.mint : C.soft} stroke={i === 0 ? C.line : C.green} strokeWidth={4} />
                  {hv.draw()}
                </g>
                <T x={x} y={688} size={21} w={700} op={clamp(k)}>{hv.label}</T>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

export const Part2: React.FC<{ t: number }> = ({ t }) => {
  // A: drive through the city (0-3.3) · B: at the door (3.3-6.9) · C: load and drive on (6.9-10)
  const zoom = ease((t - 2.95) / 0.5);
  const toB = ramp(t, 3.2, 0.3), toC = ramp(t, 6.8, 0.35);
  const off = roadX(t);
  const door = ramp(t, 7.05, 0.3) * (1 - ramp(t, 7.85, 0.3));
  const load = ease((t - 7.25) / 0.55);
  const drive = t > 8.2 ? (t - 8.2) ** 2 * 260 : 0;
  const route = ramp(t, 8.35, 1.4, ease);
  return (
    <Stage id="p2stage">
      {toB < 1 && (
        <g transform={`translate(760 1080) scale(${1 + zoom * 1.4}) translate(-760 -1080)`} opacity={1 - toB}>
          <Street t={t} off={off} vanX={540} door={0} bounce={t < 3 ? 1 : 0} />
          <path d={`M${740} 1262 H1040`} stroke={C.lime} strokeWidth={8} strokeDasharray="20 16" strokeDashoffset={-t * 120} opacity={0.9 * (1 - ramp(t, 2.6, 0.4))} />
        </g>
      )}
      {toB > 0 && toC < 1 && <g opacity={toB * (1 - toC)}><Doorway t={t} /></g>}
      {toC > 0 && (
        <g opacity={toC}>
          <Street t={t} off={STOP + drive} vanX={540} door={door} bounce={t > 8.2 ? 1 : 0} rickshaw={false} />
          {/* the representative loads the box */}
          {t < 8.4 && <g opacity={1 - ramp(t, 8.1, 0.3)}>
            <Figure x={268} y={1312} s={0.66} who="rep" look={1} pose={load < 1 ? holdBox(lerp(300, 430, load), lerp(1196, 1170, load), 0.5, 268, 1312, 0.66) : {}} />
            {load < 1 && <Box x={lerp(300, 420, load)} y={lerp(1196, 1168, load)} s={0.5 * (1 - ramp(load, 0.75, 0.25) * 0.4)} />}
          </g>}
          {/* home -> facility progress */}
          <g transform="translate(540 600)" opacity={ramp(t, 8.3, 0.4)}>
            <rect x={-400} y={-44} width={800} height={88} rx={44} fill="#fff" filter="url(#jSh)" />
            <circle cx={-340} cy={0} r={14} fill={C.green} />
            <T x={-312} y={8} size={22} w={700} anchor="start">Home</T>
            <line x1={-220} y1={0} x2={190} y2={0} stroke={C.line} strokeWidth={8} strokeLinecap="round" />
            <line x1={-220} y1={0} x2={lerp(-220, 190, route)} y2={0} stroke={C.green} strokeWidth={8} strokeLinecap="round" />
            <g transform={`translate(${lerp(-220, 190, route)} -4) scale(0.17)`}><BVan t={t} /></g>
            <circle cx={214} cy={0} r={14} fill={route > 0.98 ? C.green : C.line} />
            <T x={240} y={8} size={22} w={700} anchor="start">Facility</T>
          </g>
        </g>
      )}
    </Stage>
  );
};

// ============================================================ PART 3 · sorting
const TRAYS = ["PHONE", "LAPTOP", "OTHER\nELECTRONICS", "BATTERY", "CHARGER &\nCABLE", "ROUTER", "CIRCUIT\nBOARD", "ACCESSORIES"];
const TW = 222, TH = 216;
const trayXY = (i: number): Pt => [181 + (i % 4) * 240, i < 4 ? 650 : 1184];
const SORT: [Kind, number][] = [
  ["phone", 0], ["laptop", 1], ["hdd", 2], ["battery", 3], ["charger", 4], ["router", 5], ["pcb", 6], ["headphones", 7],
  ["phone", 0], ["cable", 4], ["battery", 3], ["laptop", 1], ["pcb", 6], ["mouse", 7], ["hdd", 2], ["router", 5],
  ["phone", 0], ["battery", 3], ["cable", 4], ["monitor", 2],
];
const PILE = SORT.map((_, i) => {
  const a = rand(i * 4.3) * Math.PI * 2, r = Math.sqrt(rand(i * 9.1));
  return { x: 540 + Math.cos(a) * r * 250, y: 918 + Math.sin(a) * r * 92, rot: (rand(i * 2.2) - 0.5) * 80 };
});
// slot of each item inside its tray
const SLOT = SORT.map(([, tr], i) => {
  const n = SORT.filter(([, x]) => x === tr).length, k = SORT.slice(0, i).filter(([, x]) => x === tr).length;
  const [tx, ty] = trayXY(tr);
  return { x: tx + (k - (n - 1) / 2) * 62, y: ty + 30 + (k % 2) * 8 };
});
// sorting order (shuffled so it looks like hands at work)
const ORDER = SORT.map((_, i) => i).sort((a, b) => rand(a * 1.7 + 3) - rand(b * 1.7 + 3));
const sortT = (i: number) => 3.05 + ORDER.indexOf(i) * 0.15;
const SECURE = [0, 1, 2];

const Facility: React.FC<{ t: number }> = ({ t }) => {
  const drop = t < 1.0 ? ease((t - 0.15) / 0.6) : 1;
  const bounce = Math.sin(clamp((t - 0.75) / 0.4) * Math.PI) * 18 * (1 - clamp((t - 0.75) / 0.4));
  const open = ramp(t, 1.05, 0.35);
  return (
    <g>
      <rect x={40} y={520} width={1000} height={800} fill="#F6FAF8" />
      <rect x={40} y={520} width={1000} height={130} fill={C.mint} />
      <g transform="translate(540 596)"><rect x={-260} y={-44} width={520} height={88} rx={22} fill="#fff" /><Mark size={64} x={-200} /><Word width={330} x={20} /></g>
      {[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${150 + i * 260} 790)`}>
        <rect x={-100} y={-70} width={200} height={140} rx={12} fill="#EAF1EE" stroke="#D3DED9" strokeWidth={3} />
        <rect x={-90} y={0} width={180} height={8} fill="#D3DED9" />
      </g>)}
      <Figure x={880} y={1250} s={0.95} who="rep" look={-1} pose={{ l: [-90, -190], r: [-30, -180] }} blink={win(t, 1.9, 2.05, 0.05, 0.05)} />
      {/* steel sorting table */}
      <path d="M200 1004 H880 L990 1150 H90 Z" fill="#E6ECEE" stroke="#B9C4C7" strokeWidth={4} />
      <path d="M90 1150 H990 V1184 H90 Z" fill="#C7D0D3" />
      <rect x={130} y={1184} width={22} height={130} fill="#AEB9BC" /><rect x={928} y={1184} width={22} height={130} fill="#AEB9BC" />
      {[0.3, 0.55, 0.8].map((u) => <line key={u} x1={lerp(200, 90, u)} y1={lerp(1004, 1150, u)} x2={lerp(880, 990, u)} y2={lerp(1004, 1150, u)} stroke="#fff" strokeWidth={3} opacity={0.6} />)}
      <Box x={540} y={lerp(560, 1112, drop) - bounce} s={0.95} open={open} />
      {SORT.map(([k], i) => {
        const u = ease((t - 1.35 - i * 0.04) / 0.6);
        if (u <= 0) return null;
        const p = PILE[i];
        const tx = lerp(540, p.x, 0.85), ty = lerp(1040, 1060 + (p.y - 918) * 0.5, 1);
        const q = bez([540, 1000], [lerp(540, tx, 0.5), 820 - rand(i) * 80], [tx, ty], u);
        return <g key={i} transform={`translate(${q[0]} ${q[1]}) rotate(${p.rot * u}) scale(${0.42})`}><Item kind={k} /></g>;
      })}
    </g>
  );
};

export const Part3: React.FC<{ t: number }> = ({ t }) => {
  const toTop = ramp(t, 2.35, 0.55);
  const push = ease((t - 7.55) / 1.9);
  const cx = lerp(540, 421, push), cy = lerp(900, 700, push), sc = lerp(1, 1.36, push);
  const dim = ramp(t, 7.1, 0.5);
  return (
    <Stage id="p3stage">
      {toTop < 1 && <g opacity={1 - toTop} transform={`translate(540 1060) scale(${1 + toTop * 0.35}) translate(-540 -1060)`}><Facility t={t} /></g>}
      {toTop > 0 && (
        <g opacity={toTop} transform={`translate(540 900) scale(${lerp(0.88, 1, easeOut(toTop)) * sc}) translate(${-cx} ${-cy})`}>
          {/* top-down table */}
          <rect x={40} y={520} width={1000} height={800} fill="#DFE6E8" />
          <rect x={58} y={538} width={964} height={764} rx={30} fill="#EEF2F3" stroke="#C3CDD0" strokeWidth={4} />
          {Array.from({ length: 18 }).map((_, i) => <line key={i} x1={70} y1={560 + i * 42} x2={1010} y2={560 + i * 42} stroke="#fff" strokeWidth={2} opacity={0.5} />)}
          {TRAYS.map((l, i) => {
            const [x, y] = trayXY(i);
            const hot = SORT.some(([, tr], j) => tr === i && t > sortT(j) + 0.5 && t < sortT(j) + 0.85) ? 1 : 0;
            const sec = SECURE.includes(i);
            return (
              <g key={i}>
                <Tray x={x} y={y} w={TW} h={TH} label={l} k={backOut((t - 2.7 - i * 0.05) / 0.45)} hot={hot + (sec ? ramp(t, 6.7, 0.3) * 0.6 : 0)} dim={sec ? 0 : dim} />
                {sec && <g transform={`translate(${x + TW / 2 - 18} ${y - TH / 2 + 8}) scale(${0.42 * backOut((t - 6.6 - i * 0.15) / 0.45)})`}><Shield k={ramp(t, 6.9 + i * 0.15, 0.4)} /></g>}
              </g>
            );
          })}
          {SORT.map(([k, tr], i) => {
            const t0 = sortT(i);
            const u = ease((t - t0) / 0.55);
            const p = PILE[i], s = SLOT[i];
            const lift = Math.sin(u * Math.PI);
            const x = lerp(p.x, s.x, u), y = lerp(p.y, s.y, u) - lift * 60;
            const sc2 = lerp(0.62, 0.46, u) * (1 + lift * 0.2);
            const dimK = SECURE.includes(tr) ? 0 : dim * 0.7;
            return (
              <g key={i} opacity={1 - dimK}>
                {lift > 0.05 && <ellipse cx={x} cy={lerp(p.y, s.y, u) + 34} rx={32} ry={8} fill="#0E2A1C" opacity={0.12 * lift} />}
                <g transform={`translate(${x} ${y}) rotate(${p.rot * (1 - u)}) scale(${sc2})`}><Item kind={k} /></g>
              </g>
            );
          })}
          {/* hands-free sorting cue: a green scan line sweeping the pile */}
          <rect x={300} y={lerp(800, 1040, (t * 0.8) % 1)} width={480} height={4} fill={C.lime} opacity={win(t, 2.9, 6.2, 0.3, 0.4) * 0.7} />
        </g>
      )}
    </Stage>
  );
};

export { smooth };
