import React from "react";
import { P2_Q } from "./part2";
import { BDMap, projector, CITIES } from "./map";
import { Badge, Dev, DevKind, House, LogoImg, LogoMark, Office, Person, QMark, Recycle, Shield, Van, Wordmark } from "./icons";
import { C, HEAD, SANS, backOut, clamp, ease, easeOut, lerp, rand, ramp, smooth, mix } from "./lib";

// PART 3 (20-30 s): the question becomes the BhangariWala mark; a clear
// customer journey (COLLECT -> PICKUP -> PROTECT -> RECOVER); the messy flow
// becomes an organised green collection network; brand end frame.

const T = { morph: 20.0, lock: 21.45, steps: [21.8, 22.7, 23.55, 24.4], net: 25.95, brand: 27.95 };
const STEPS = [
  { en: "COLLECT", bn: "০১  আলাদা করে সংগ্রহ" },
  { en: "PICKUP", bn: "০২  বাসা ও অফিস থেকে পিকআপ" },
  { en: "PROTECT", bn: "০৩  ডেটার নিরাপদ হ্যান্ডলিং" },
  { en: "RECOVER", bn: "০৪  দায়িত্বশীল প্রসেসিং" },
];

type Pose = { x: number; y: number; s: number };
const keyed = (t: number, a: Pose, b: Pose, c: Pose): Pose => {
  const u = ease((t - T.lock) / 0.45), w = ease((t - T.brand) / 0.55);
  const m = (k: keyof Pose) => lerp(lerp(a[k], b[k], u), c[k], w);
  return { x: m("x"), y: m("y"), s: m("s") };
};

const Progress: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  if (k <= 0) return null;
  const xs = [204, 428, 652, 876];
  return (
    <g opacity={k} transform={`translate(0 ${(1 - k) * -30})`}>
      {xs.map((x, i) => {
        const on = ramp(t, T.steps[i], 0.25);
        const done = i < 3 ? ramp(t, T.steps[i + 1], 0.25) : 0;
        return (
          <g key={i}>
            {i < 3 && <path d={`M${x + 100} 452 l14 0 m-8 -8 l8 8 l-8 8`} fill="none" stroke={on > 0.5 ? C.green : C.line} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
            <rect x={x - 94} y={426} width={188} height={52} rx={26} fill={mix(C.paper, C.green, on)} stroke={mix(C.line, C.green, on)} strokeWidth={3} />
            <text x={x} y={461} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={23} letterSpacing={2.5}
              fill={on > 0.5 ? "#fff" : C.mute} opacity={1 - done * 0.25}>{STEPS[i].en}</text>
          </g>
        );
      })}
    </g>
  );
};

const camX = (t: number) => T.steps.slice(1).reduce((x, s) => x + 1080 * ease((t - s + 0.15) / 0.45), 0);

const StepCollect: React.FC<{ t: number }> = ({ t }) => {
  const s = T.steps[0];
  const items: [DevKind, number, number][] = [["phone", 300, 1060], ["charger", 300, 1060], ["laptop", 820, 1000], ["battery", 820, 1000]];
  return (
    <g>
      <House x={210} y={1200} s={0.95} />
      <Office x={790} y={1200} w={170} h={430} />
      <rect x={0} y={1200} width={1080} height={12} fill={C.ink2} opacity={0.5} />
      {/* regular bin stays for regular waste */}
      <g transform="translate(720 1160) scale(0.5)"><path d="M-44 -30 H44 L36 60 H-36 Z" fill="#DCE3E4" stroke={C.ink} strokeWidth={6} /><rect x={-52} y={-44} width={104} height={14} rx={5} fill={C.gray} /></g>
      {/* the e-waste box */}
      <g transform="translate(545 1140)">
        <rect x={-118} y={-60} width={236} height={120} rx={14} fill={C.green} stroke={C.ink} strokeWidth={5} />
        <rect x={-128} y={-74} width={256} height={22} rx={8} fill={C.greenD} stroke={C.ink} strokeWidth={4} />
        <g transform="translate(-76 2) scale(0.3)"><Recycle r={60} color="#fff" sw={16} /></g>
        <text x={-44} y={12} fontFamily={HEAD} fontWeight={800} fontSize={30} fill="#fff">E-WASTE</text>
      </g>
      {items.map(([kind, sx, sy], i) => {
        const u = (t - s - 0.15 - i * 0.14) / 0.45;
        if (u <= 0) return null;
        const e = smooth(u);
        const x = lerp(sx, 545 + (i - 1.5) * 26, e), y = lerp(sy, 1080, e) - Math.sin(Math.PI * clamp(u)) * 160;
        return <g key={i} transform={`translate(${x} ${y}) scale(${lerp(0.42, 0.3, e)}) rotate(${(1 - e) * 30})`} opacity={u < 1 ? 1 : 0.9}><Dev kind={kind} old={false} /></g>;
      })}
      <Person x={335} y={1205} s={0.8} shirt="#5E8C9E" orna carry />
    </g>
  );
};

const StepPickup: React.FC<{ t: number }> = ({ t }) => {
  const s = T.steps[1];
  const vx = lerp(-520, 470, easeOut((t - s + 0.1) / 0.6));
  const box = clamp((t - s - 0.5) / 0.35);
  return (
    <g>
      <rect x={60} y={1236} width={960} height={60} fill="#D5DCDD" />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={90 + i * 160} y={1262} width={80} height={8} rx={4} fill="#fff" />)}
      <Van x={vx} y={1238} s={1.1} t={t} />
      {box < 1 && (
        <g transform={`translate(${lerp(860, vx - 170, smooth(box))} ${lerp(1180, 1150, smooth(box)) - Math.sin(Math.PI * box) * 120}) scale(${lerp(0.7, 0.25, box)})`}>
          <rect x={-95} y={-60} width={190} height={120} rx={14} fill={C.green} stroke={C.ink} strokeWidth={6} />
          <text x={0} y={14} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={34} fill="#fff">E-WASTE</text>
        </g>
      )}
      <Person x={960} y={1235} s={0.78} shirt={C.green} wave={t * 7} />
    </g>
  );
};

const StepProtect: React.FC<{ t: number }> = ({ t }) => {
  const s = T.steps[2];
  const src: [DevKind, number, number][] = [["phone", 190, 820], ["laptop", 890, 860], ["hdd", 230, 1180]];
  const pulse = ((t - s) * 1.2) % 1;
  return (
    <g>
      <g transform="translate(540 980)">
        {t > s + 0.5 && <circle r={150 + pulse * 70} fill="none" stroke={C.green} strokeWidth={5} opacity={(1 - pulse) * 0.5} />}
        <g transform={`scale(${1.75 * backOut((t - s + 0.15) / 0.5)})`}><Shield k={ramp(t, s + 0.55, 0.3)} /></g>
      </g>
      {src.map(([kind, x, y], i) => {
        const u = clamp((t - s - 0.05 - i * 0.12) / 0.45);
        if (u >= 1) return null;
        const e = smooth(u);
        return <g key={i} transform={`translate(${lerp(x, 540, e)} ${lerp(y, 980, e)}) scale(${lerp(0.7, 0.1, e)})`} opacity={ramp(t, s - 0.2, 0.2)}><Badge r={80}><Dev kind={kind} old={false} /></Badge></g>;
      })}
      <g transform="translate(540 1250)" opacity={ramp(t, s + 0.55, 0.3)}>
        <rect x={-210} y={-34} width={420} height={68} rx={34} fill={C.ink} />
        <text y={12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} letterSpacing={3} fill="#fff">SECURE HANDLING</text>
      </g>
    </g>
  );
};

const STREAMS = [
  { x: 210, label: "METAL", color: "#8E9BA0" }, { x: 420, label: "PLASTIC", color: "#5B9BD5" },
  { x: 650, label: "CIRCUIT", color: C.green }, { x: 870, label: "BATTERY", color: C.warn },
];
const StepRecover: React.FC<{ t: number }> = ({ t }) => {
  const s = T.steps[3];
  const run = t - s;
  return (
    <g>
      {/* conveyor */}
      <rect x={110} y={820} width={600} height={46} rx={23} fill={C.ink2} />
      {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={140 + i * 68} cy={843} r={14} fill="#AEB9BC" stroke={C.ink} strokeWidth={3} />)}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = 120 + (((run * 260) + i * 150) % 600);
        return <g key={i} transform={`translate(${x} 782) scale(0.4)`}><Dev kind={(["laptop", "phone", "router", "battery"] as DevKind[])[i]} old={false} /></g>;
      })}
      {/* sorter */}
      <g transform="translate(760 840)"><rect x={-60} y={-80} width={120} height={150} rx={18} fill={C.paper} stroke={C.ink} strokeWidth={5} />
        <g transform={`rotate(${t * 140})`}><Recycle r={34} sw={10} /></g></g>
      {STREAMS.map((b, i) => {
        const k = backOut((t - s - 0.1 - i * 0.1) / 0.45);
        return (
          <g key={i}>
            {Array.from({ length: 5 }).map((_, j) => {
              const u = ((run * 1.1 + j / 5 + i * 0.13) % 1);
              if (run < 0.2) return null;
              const x = lerp(760, b.x, u), y = lerp(930, 1120, u) - Math.sin(Math.PI * u) * 90;
              return <rect key={j} x={x - 9} y={y - 9} width={18} height={18} rx={4} fill={b.color} transform={`rotate(${u * 200} ${x} ${y})`} />;
            })}
            <g transform={`translate(${b.x} 1180) scale(${k})`}>
              <path d="M-80 -60 H80 L68 70 H-68 Z" fill={C.paper} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <rect x={-80} y={-60} width={160} height={30} fill={b.color} stroke={C.ink} strokeWidth={5} />
              <text y={30} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={23} letterSpacing={1.5} fill={C.ink}>{b.label}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

const STEP_VIEWS = [StepCollect, StepPickup, StepProtect, StepRecover];

const NODES = ["rangpur", "dinajpur", "rajshahi", "bogura", "mymensingh", "sylhet", "tangail", "pabna", "jessore", "khulna", "barishal", "comilla", "noakhali", "ctg", "coxs"];

const Network: React.FC<{ t: number; k: number; dimK: number }> = ({ t, k, dimK }) => {
  const s = lerp(1.15, 0.95, ease((t - T.net) / 1.2));
  const v = { cx: 540, cy: lerp(950, 1180, ease((t - T.brand) / 0.6)), s: lerp(s, 0.78, ease((t - T.brand) / 0.6)), tilt: 30 };
  const pr = projector(v);
  const [hx, hy] = pr.city("dhaka");
  const clean = ease((t - T.net - 0.65) / 0.75);
  return (
    <g opacity={k * lerp(1, 0.32, dimK)}>
      <BDMap v={v} depth={24} t={t} cities={[]} />
      {NODES.map((c, i) => {
        const [x, y] = pr.city(c);
        const j = NODES[(i * 7 + 3) % NODES.length];
        const [jx, jy] = pr.city(j);
        // messy: wandering line to another node; clean: smooth arc to the hub
        const pts = Array.from({ length: 18 }).map((_, n) => {
          const u = n / 17;
          const mx = lerp(x, jx, u) + Math.sin(u * 9 + i) * 26 * (1 - u * 0.3), my = lerp(y, jy, u) + Math.cos(u * 7 + i * 2) * 22;
          const bend = Math.sin(Math.PI * u) * 40;
          const cx = lerp(x, hx, u) - (hy - y) * 0.0 + bend * 0.3, cy = lerp(y, hy, u) - bend * 0.5;
          return [lerp(mx, cx, clean), lerp(my, cy, clean)];
        });
        const d = "M" + pts.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join(" L");
        const draw = ramp(t, T.net + 0.1 + i * 0.02, 0.4);
        const col = mix(C.red, C.green, clean);
        const pulseU = ((t * 0.9 + i * 0.17) % 1);
        const pp = pts[Math.min(17, Math.floor(pulseU * 17))];
        return (
          <g key={c}>
            <path d={d} fill="none" stroke={col} strokeWidth={clean > 0.5 ? 5 : 4} strokeLinecap="round" strokeDasharray={clean < 0.5 ? "10 8" : "1000"}
              opacity={draw * lerp(0.75, 0.95, clean)} />
            {clean > 0.9 && <circle cx={pp[0]} cy={pp[1]} r={7} fill={C.lime} stroke="#fff" strokeWidth={2} />}
            <g transform={`translate(${x} ${y}) scale(${0.36 * v.s * backOut((t - T.net - i * 0.03) / 0.4)})`}>
              <circle r={44} fill={C.paper} stroke={mix(C.gray, C.green, clean)} strokeWidth={6} />
              {i % 3 === 0 ? <path d="M-22 18 V-6 L0 -24 L22 -6 V18 Z" fill={C.green} /> :
                i % 3 === 1 ? <rect x={-16} y={-24} width={32} height={44} rx={3} fill={C.ink2} /> :
                  <g><rect x={-22} y={-10} width={44} height={30} rx={3} fill={C.ink2} /><rect x={-26} y={-22} width={52} height={12} rx={3} fill={C.green} /></g>}
            </g>
          </g>
        );
      })}
      <g transform={`translate(${hx} ${hy - 40 * v.s})`}>
        <circle r={(70 + ((t * 0.8) % 1) * 60) * v.s} fill="none" stroke={C.green} strokeWidth={4} opacity={(1 - ((t * 0.8) % 1)) * 0.6} />
        <g transform={`scale(${0.6 * v.s * backOut((t - T.net - 0.3) / 0.5)})`}><LogoMark /></g>
      </g>
    </g>
  );
};

export const Part3: React.FC<{ t: number }> = ({ t }) => {
  const mk = keyed(t, { x: P2_Q.x, y: P2_Q.y, s: 1.05 }, { x: 318, y: 302, s: 0.42 }, { x: 540, y: 560, s: 1.1 });
  const wm = keyed(t, { x: 540, y: 1120, s: 1 }, { x: 608, y: 324, s: 0.6 }, { x: 540, y: 820, s: 1.02 });
  const morph = ramp(t, T.morph + 0.25, 0.75);
  const steps = ramp(t, T.steps[0] - 0.15, 0.35) * (1 - ramp(t, T.net - 0.1, 0.35));
  const net = ramp(t, T.net, 0.4);
  const brand = ramp(t, T.brand, 0.5);
  const cx = camX(t);
  return (
    <g>
      {/* stage for the four steps */}
      {steps > 0 && (
        <g opacity={steps}>
          <clipPath id="bwStageAll"><rect x={60} y={520} width={960} height={840} rx={40} /></clipPath>
          <rect x={60} y={520} width={960} height={840} rx={40} fill={C.paper} opacity={0.65} />
          <g clipPath="url(#bwStageAll)">
          {STEP_VIEWS.map((S, i) => {
            const off = i * 1080 - cx;
            if (Math.abs(off) > 1300) return null;
            return (
              <g key={i} transform={`translate(${off} 0)`}>
                <clipPath id={`bwStage${i}`}><rect x={60} y={520} width={960} height={840} /></clipPath>
                <g clipPath={`url(#bwStage${i})`}><S t={t} /></g>
                <text x={540} y={612} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={52} fill={C.ink}>{STEPS[i].bn}</text>
              </g>
            );
          })}
          </g>
          <rect x={60} y={520} width={960} height={840} rx={40} fill="none" stroke={C.line} strokeWidth={3} />
        </g>
      )}
      <Progress t={t} k={steps} />
      {net > 0 && <Network t={t} k={net} dimK={brand} />}
      {/* the mark: question -> recycling symbol -> lockup -> end frame */}
      <g transform={`translate(${mk.x} ${mk.y}) scale(${mk.s})`}>
        {t < T.lock + 0.4 && [0, 1].map((i) => {
          const p = clamp((t - T.morph - 0.6 - i * 0.25) / 0.9);
          return p > 0 && p < 1 ? <circle key={i} r={96 + p * 160} fill="none" stroke={C.green} strokeWidth={6} opacity={1 - p} /> : null;
        })}
        {brand > 0 && (
          <g transform={`rotate(${t * 40})`} opacity={brand}>
            <circle r={150} fill="none" stroke={C.mint2} strokeWidth={10} />
            <circle r={150} fill="none" stroke={C.green} strokeWidth={10} strokeDasharray="160 154" />
            {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a + 52}) translate(150 0)`} d="M-16 -4 L0 18 L16 -4 Z" fill={C.green} />)}
          </g>
        )}
        <circle r={lerp(96, 108, morph)} fill={mix(C.ink, "#FFFFFF", morph)} />
        <circle r={lerp(96, 108, morph)} fill="none" stroke={C.mint2} strokeWidth={5} opacity={morph} />
        <g transform={`rotate(${(1 - morph) * -90})`}><QMark p={1 - ramp(t, T.morph, 0.45)} /></g>
        {/* the "?" becomes the official mark: it spins in from the question */}
        <g transform={`rotate(${(1 - ease((t - T.morph - 0.3) / 0.8)) * -140}) scale(${backOut((t - T.morph - 0.3) / 0.7)})`} opacity={ramp(t, T.morph + 0.3, 0.3)}>
          <LogoImg size={188} />
        </g>
      </g>
      <g transform={`translate(${wm.x} ${wm.y}) scale(${wm.s})`}>
        <Wordmark k={ramp(t, T.morph + 0.7, 0.45)} size={96} />
      </g>
      {/* end frame copy */}
      {brand > 0 && (
        <g>
          <text x={540} y={1010} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={74} fill={C.ink}
            opacity={ramp(t, T.brand + 0.2, 0.35)} transform={`translate(0 ${(1 - easeOut((t - T.brand - 0.2) / 0.4)) * 24})`}>Electronic Waste আছে?</text>
          <text x={540} y={1112} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={84} fill={C.green}
            opacity={ramp(t, T.brand + 0.6, 0.35)} transform={`translate(0 ${(1 - easeOut((t - T.brand - 0.6) / 0.4)) * 24})`}>BhangariWala-কে দিন।</text>
          <g transform={`translate(540 1236) scale(${backOut((t - T.brand - 1.05) / 0.45)})`}>
            <rect x={-330} y={-46} width={660} height={92} rx={46} fill={C.ink} />
            <circle cx={-282} cy={0} r={22} fill={C.green} />
            <path d="M-292 0 l7 8 l14 -15" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            <text x={18} y={15} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={44} fill="#fff">সুস্থ পরিবেশ, নিরাপদ ডেটা।</text>
          </g>
        </g>
      )}
    </g>
  );
};

export { rand, CITIES };
