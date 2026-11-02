import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY, MONO, POSTER } from "../signal/fonts";
import { Slam, Bubble, Flash } from "../signal/kit";
import { Hero, P, Clock, Rickshaw, CNG, Crow } from "./cast";
import { Room, Skyline, Sun, SP } from "./scenes1";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, beatPulse, downbeatPulse,
  cuePulse, backOut, beatPhase,
} from "./lib";

const Stars: React.FC<{ x: number; y: number; t: number; n?: number }> = ({ x, y, t, n = 5 }) => (
  <g>{Array.from({ length: n }).map((_, i) => {
    const a = t * 4 + (i / n) * Math.PI * 2;
    return <path key={i} transform={`translate(${x + Math.cos(a) * 90} ${y + Math.sin(a) * 26}) scale(0.9)`}
      d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6 Z" fill={C.sun} stroke={C.ink} strokeWidth={3} />;
  })}</g>
);

// ==================================================================== KITCHEN
// 46.0 – 57.4 s (the bass drops out). Dizzy; the fridge holds one ice cream;
// the bell again; flies. He shouts down to দারোয়ান কাকা, who wakes on his
// plastic chair and switches on the water pump.

export const Kitchen: React.FC<SP> = ({ t, f }) => {
  const fridge = findLine("ফ্রিজে"), bell = findLine("বেল বাজে"), fly = findLine("মাছি"), kaka = findLine("দারোয়ান"), pump = findLine("পানি ছাড়ো");
  if (t >= kaka.s - 0.15) {
    const on = t >= pump.words[1].s;
    const water = clamp((t - pump.words[3].s) / 1.6);
    return (
      <AbsoluteFill style={{ background: "transparent" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Sun x={1700} y={150} r={80} t={t} angry={0.5} />
          {/* the building face, his window up top */}
          <rect x={160} y={0} width={900} height={1080} fill={C.violet} stroke={C.ink} strokeWidth={8} />
          {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={240 + c * 420} y={60 + r * 260} width={300} height={180} fill="#000" stroke={C.cyan} strokeWidth={6} />))}
          <rect x={240} y={60} width={300} height={180} fill="#000" stroke={C.ink} strokeWidth={6} />
          <Hero x={390} y={330} s={0.9} pose={P.shout()} face={{ mouth: "shout", eyes: "wide", brows: 1, spiky: 1 }} />
          <rect x={230} y={230} width={320} height={22} fill={C.magenta} stroke={C.ink} strokeWidth={5} />
          {/* the gate below */}
          <rect x={1060} y={760} width={860} height={320} fill={C.floor} />
          <rect x={1100} y={560} width={40} height={300} fill={C.cyan} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={1150 + i * 60} y={600} width={14} height={260} fill={C.cyan} stroke={C.ink} strokeWidth={3} />)}
          <rect x={1140} y={600} width={560} height={16} fill={C.cyan} stroke={C.ink} strokeWidth={4} />
          {/* plastic chair + kaka */}
          <rect x={1560} y={850} width={150} height={20} fill={C.crimson} stroke={C.ink} strokeWidth={4} />
          <rect x={1680} y={700} width={20} height={160} fill={C.crimson} stroke={C.ink} strokeWidth={4} />
          <Hero x={1620} y={t < kaka.words[1].s ? 922 : 922 - backOut((t - kaka.words[1].s) / 0.3) * 30} s={1.0} outfit="guard" cap mustache belly={1}
            pose={t < kaka.words[1].s ? P.sit() : on ? { ...P.stand(), armF: [1.5, 0.3] } : P.shock()} flip
            face={{ eyes: t < kaka.words[1].s ? "closed" : "wide", mouth: t < kaka.words[1].s ? "flat" : "o" }} />
          {/* pump + tank */}
          <g transform="translate(1300 900)"><rect x={-60} y={-60} width={120} height={70} rx={10} fill={C.blue} stroke={C.ink} strokeWidth={5}
            transform={on ? `translate(${Math.sin(t * 60) * 3} 0)` : undefined} />
            <rect x={-80} y={-20} width={30} height={14} fill="#555" />{on && <text x={-40} y={-80} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink}>ভররর</text>}</g>
          <g transform="translate(860 40)"><rect width={160} height={150} rx={10} fill={C.blue} stroke={C.ink} strokeWidth={6} />
            <rect x={10} y={140 - water * 120} width={140} height={water * 120} fill={C.sky} opacity={0.8} /></g>
          {water > 0 && <path d={`M940 190 L940 ${190 + water * 120}`} stroke={C.sky} strokeWidth={14} />}
        </svg>
        <Bubble t={t} at={kaka.s} out={pump.s - 0.05} x={620} y={160} text="কাকাআআ!" bg="#fff" color={C.ink} size={70} />
        <Bubble t={t} at={pump.s} x={620} y={160} text="পানি ছাড়েন!" bg="#fff" color={C.ink} size={66} />
        <Bubble t={t} at={pump.words[2].s} x={1880} y={620} side="r" text="দিতাসি, দিতাসি!" bg={C.sun} color={C.ink} size={56} />
      </AbsoluteFill>
    );
  }
  const door = easeOut((t - fridge.words[1].s) / 0.35) * (1 - ramp(t, bell.s - 0.1, 0.3));
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1920} height={800} fill={C.mint} />
        {Array.from({ length: 14 }).map((_, i) => Array.from({ length: 4 }).map((_, j) => <rect key={`${i}${j}`} x={i * 140} y={380 + j * 105} width={136} height={101} fill="rgba(255,255,255,0.06)" stroke={C.cyan} strokeWidth={2} />))}
        <rect x={0} y={800} width={1920} height={280} fill={C.floor} />
        {/* fridge */}
        <g transform="translate(1220 190)">
          <rect width={380} height={620} rx={24} fill={C.cyan} stroke={C.ink} strokeWidth={8} />
          <rect x={20} y={20} width={340} height={580} rx={12} fill={door > 0.05 ? "#FFF9DD" : C.cyan} />
          {door > 0.05 && <>
            <rect x={40} y={200} width={300} height={8} fill="#BBB" /><rect x={40} y={400} width={300} height={8} fill="#BBB" />
            <g transform={`translate(190 330) scale(${1 + beatPulse(t) * 0.1})`}>
              <path d="M-30 -20 L30 -20 L0 70 Z" fill="#D9A15C" stroke={C.ink} strokeWidth={5} />
              <circle cy={-36} r={34} fill={C.magenta} stroke={C.ink} strokeWidth={5} /><circle cx={-14} cy={-58} r={18} fill="#fff" stroke={C.ink} strokeWidth={4} />
            </g>
            <circle cx={190} cy={320} r={170} fill="#FFF3A8" opacity={0.35} />
          </>}
          <g transform={`translate(380 0) scale(${-Math.max(0.05, door)} 1)`}><rect width={380} height={620} rx={24} fill="#80F5FF" stroke={C.ink} strokeWidth={8} /></g>
          <rect x={door > 0.05 ? -40 : 330} y={200} width={18} height={140} rx={8} fill="#999" stroke={C.ink} strokeWidth={4} />
        </g>
        <Hero x={760} y={960} s={1.6} pose={t < fridge.s ? P.dizzy(t) : t < bell.s ? P.shock() : P.dizzy(t)}
          face={{ eyes: t < fridge.s ? "sleepy" : "wide", mouth: t < fridge.s ? "flat" : t < bell.s ? "o" : "sad", look: 1, sweat: 1 }} />
        {t < fridge.s + 0.3 && <Stars x={760} y={540} t={t} />}
        {/* wall bell */}
        <g transform={`translate(260 250) rotate(${Math.sin(t * 46) * 18 * Math.exp(-Math.max(0, t - bell.s) * 2.5) * (t > bell.s ? 1 : 0)})`}>
          <path d="M-60 40 Q-60 -60 0 -60 Q60 -60 60 40 Z" fill={C.sun} stroke={C.ink} strokeWidth={6} /><rect x={-70} y={36} width={140} height={16} rx={6} fill={C.sun} stroke={C.ink} strokeWidth={5} />
          <circle cy={66} r={14} fill={C.ink} />
        </g>
        {/* flies */}
        {t > fly.s - 0.2 && [0, 1, 2].map((i) => {
          const a = t * (7 + i) + i * 2;
          const x = 760 + Math.cos(a) * (160 + i * 30), y = 520 + Math.sin(a * 1.7) * 90;
          return <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={12} ry={9} fill={C.ink} />
            <ellipse cx={-6} cy={-12} rx={10} ry={6} fill="#CFE8FF" opacity={0.8} transform={`rotate(${Math.sin(t * 80) * 30})`} /><ellipse cx={6} cy={-12} rx={10} ry={6} fill="#CFE8FF" opacity={0.8} /></g>;
        })}
      </svg>
      <Slam text="ঝিমঝিম" t={t} at={findLine("মাথা করে").words[2].s} out={fridge.s} x={1000} y={300} size={110} color={C.sun} shadow={`6px 6px 0 ${C.ink}`} rot={-6} />
      <Slam text="ঠনঠন!" t={t} at={bell.words[2].s} out={fly.s} x={420} y={150} size={110} color={C.crimson} shadow={`6px 6px 0 ${C.ink}`} rot={8} />
      <Slam text="ভনভন" t={t} at={fly.words[2].s} out={kaka.s} x={1000} y={300} size={100} color={C.ink} shadow={`5px 5px 0 ${C.sun}`} rot={-4} />
    </AbsoluteFill>
  );
};

// ===================================================================== SEARCH
// 57.4 – 69.0 s. Full beat. Shirt, shoes — gone. The mirror asks him back.
// The laptop under the pillow. One night, and the room spins into a mess.

export const Search: React.FC<SP> = ({ t, f }) => {
  const l1 = findLine("জামা কই"), l2 = findLine("আমি কই, তুমি"), l3 = findLine("ল্যাপটপ"), l4 = findLine("খুঁজি"), l5 = findLine("এক রাতে"), l6 = findLine("এলোমেলো");
  const spin = smooth((t - l5.s) / (l6.e - l5.s)) * 360;
  const mess = ramp(t, l5.s, 1.5);
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `rotate(${spin}deg) scale(${1 + Math.sin((spin / 360) * Math.PI) * 0.25})` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Room t={t} mess={mess} />
          {/* mirror */}
          <g transform="translate(1440 160)">
            <rect width={300} height={460} rx={150} fill="#80F5FF" stroke={C.magenta} strokeWidth={18} />
            <svg width={300} height={460}><g opacity={0.85}>
              <Hero x={150} y={560} s={1.2} pose={t >= l2.s ? P.shrug() : P.stand()} flip face={{ eyes: "wide", mouth: "o", look: -1 }} />
            </g></svg>
          </g>
          {/* bed + pillow */}
          <rect x={160} y={640} width={720} height={140} rx={12} fill={C.magenta} stroke={C.ink} strokeWidth={7} />
          <rect x={150} y={600} width={740} height={56} rx={20} fill={C.sun} stroke={C.ink} strokeWidth={7} />
          {t >= l3.s && <g transform="translate(220 600)"><rect x={0} y={-48} width={170} height={10} fill="#333" stroke={C.ink} strokeWidth={4} />
            <rect x={10} y={-150} width={150} height={102} rx={8} fill="#333" stroke={C.ink} strokeWidth={5} /><rect x={20} y={-140} width={130} height={82} fill={C.cyan} opacity={0.8} /></g>}
          <g transform={`translate(${200 + (t > l3.s ? easeOut((t - l3.s) / 0.5) * 180 : 0)} ${590 - (t > l3.s ? Math.sin(clamp((t - l3.s) / 0.6) * Math.PI) * 260 : 0)}) rotate(${t > l3.s ? (t - l3.s) * 200 : 0} 100 0)`}>
            <rect x={0} y={-60} width={200} height={70} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} /></g>
          {/* flying shirt and shoes */}
          {t > l1.s && [0, 1, 2, 3, 4].map((i) => {
            const dt = t - l1.s - i * 0.25;
            if (dt < 0) return null;
            const x = 960 + (i - 2) * 140 + dt * (i - 2) * 160, y = 760 - dt * 900 + dt * dt * 900;
            const shape = i % 2 ? <path d="M-40 -30 L40 -30 L60 -10 L40 0 L40 40 L-40 40 L-40 0 L-60 -10 Z" fill={[C.blue, C.crimson][i % 2]} stroke={C.ink} strokeWidth={5} />
              : <path d="M-36 10 L-36 -16 L0 -16 L10 -4 L40 0 L40 10 Z" fill={C.ink} stroke={C.ink} strokeWidth={4} />;
            return <g key={i} transform={`translate(${x} ${y}) rotate(${dt * 400})`} opacity={1 - ramp(dt, 1.1, 0.3)}>{shape}</g>;
          })}
          <Hero x={960} y={960} s={1.5} pose={t >= l5.s ? P.dizzy(t) : P.search(t)} face={{ eyes: "wide", mouth: t >= l2.s && t < l3.s ? "o" : "flat", look: Math.sin(t * 4), sweat: 1 }} />
          {t >= l4.s && t < l5.s && (
            <g transform={`translate(${960 + Math.sin(t * 5) * 300} ${520 + Math.cos(t * 3) * 80})`}>
              <circle r={80} fill="#CFE8FF" opacity={0.5} stroke={C.ink} strokeWidth={10} /><line x1={56} y1={56} x2={140} y2={140} stroke={C.magenta} strokeWidth={22} strokeLinecap="round" />
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {[["জামা কই?", l1.s, 520, 200, -6], ["জুতো কই?", l1.words[2].s, 1360, 220, 6], ["আমি কই?", l2.s, 560, 200, -4], ["তুমি কই?", l2.words[2].s, 1400, 120, 5]].map(([txt, at, x, y, r], i) => (
        <Slam key={i} text={txt as string} t={t} at={at as number} out={(i < 2 ? l2.s : l3.s) - 0.05} x={x as number} y={y as number} rot={r as number} size={96} color={C.sun} shadow={`6px 6px 0 ${C.ink}`} />
      ))}
      <Slam text="এলোমেলো!" t={t} at={l6.words[2].s} out={l6.e + 0.3} x={960} y={200} size={150} color={C.sun} shadow={`8px 8px 0 ${C.crimson}`} />
    </AbsoluteFill>
  );
};

// ===================================================================== BRIDGE
// 69.0 – 89.6 s. The boss is calling; he struggles into a shirt; mice race in
// his stomach; he kicks the bucket — "ধ্যাততেরি!"; eyelids like lead; a
// bandaged right hand, the left holding tea hot as fire. He checks his watch.

export const Late: React.FC<SP> = ({ t, f }) => {
  const L = (s: string) => findLine(s, 68);
  const dheri = L("হয়েছে দেরি"), office = L("অফিসের"), rat = L("ইদুর"), dhat = L("ধ্যাততেরি"), ghum = L("চোখে জমা"), room = L("অগোছালো"),
    pain = L("ডান হাতে"), fire = L("বাম হাতে"), watch = L("ঘড়িতে");
  const dressed = t >= office.s;
  let pose = P.stand(), face: any = { eyes: "wide", mouth: "o" };
  if (t >= dhat.s && t < ghum.s) { pose = P.kick(clamp((t - dhat.words[3].s) / 0.25)); face = { eyes: "open", mouth: "shout", brows: 1 }; }
  else if (t >= ghum.s && t < room.s) { pose = P.dizzy(t * 0.4); face = { eyes: "sleepy", mouth: "flat" }; }
  else if (t >= pain.s && t < watch.s) { pose = P.hold(); face = { eyes: "open", mouth: t >= fire.s ? "shout" : "sad", brows: 1, sweat: 1 }; }
  else if (t >= watch.s) { pose = P.watch(); face = { eyes: "wide", mouth: "o", look: 1, spiky: ramp(t, watch.e - 0.4, 0.2) }; }
  else if (t >= rat.s) { pose = P.hold(); face = { eyes: "sleepy", mouth: "sad" }; }
  const zoomW = ramp(t, watch.s, 1.6);
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(1, 2.6, zoomW)})`, transformOrigin: "60% 38%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Room t={t} mess={t >= room.s ? 1 : 0.6} />
          {/* phone on the bed table with the boss */}
          {t < rat.s && (
            <g transform={`translate(1450 ${520 + Math.sin(t * 50) * 3})`}>
              <rect x={-110} y={-200} width={220} height={400} rx={30} fill="#111" stroke={C.ink} strokeWidth={6} />
              <rect x={-96} y={-180} width={192} height={360} rx={18} fill={dressed ? C.crimson : "#1A0030"} />
              <text x={0} y={-110} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#fff">BOSS</text>
              <text x={0} y={-70} textAnchor="middle" fontFamily={MONO} fontSize={20} fill="#fff">12 missed calls</text>
              <g transform="translate(0 40) scale(0.55)"><Hero x={0} y={140} outfit="boss" pose={P.stand()} face={{ eyes: "open", mouth: "shout", brows: 1.4 }} mustache /></g>
              {dressed && [0, 1].map((i) => <path key={i} d={`M${-40 + i * 80} -40 q -10 -30 0 -60`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} transform={`translate(0 ${-((t * 80) % 30)})`} />)}
            </g>
          )}
          {/* bucket */}
          {t >= dhat.s - 0.2 && (() => {
            const k = clamp((t - dhat.words[3].s) / 1.2);
            return <g transform={`translate(${lerp(1130, 1900, k)} ${880 - Math.sin(k * Math.PI) * 500}) rotate(${k * 540})`}>
              <path d="M-50 -50 L50 -50 L38 50 L-38 50 Z" fill={C.blue} stroke={C.ink} strokeWidth={6} /></g>;
          })()}
          <Hero x={960} y={980} s={1.55} outfit={dressed ? "office" : "home"} tie={dressed} watch={t >= watch.s} bandage={t >= pain.s} pose={pose} face={face} />
          {/* stomach X-ray with mice */}
          {t >= rat.s && t < dhat.s && (
            <g transform="translate(960 660)">
              <circle r={120} fill="#000" stroke={C.ink} strokeWidth={8} />
              <circle r={70} fill="none" stroke={C.cyan} strokeWidth={5} strokeDasharray="12 10" />
              {[0, 1, 2].map((i) => {
                const a = t * 5 + (i * Math.PI * 2) / 3;
                return <g key={i} transform={`translate(${Math.cos(a) * 70} ${Math.sin(a) * 70}) rotate(${(a * 180) / Math.PI + 90})`}>
                  <ellipse rx={20} ry={12} fill="#CCC" stroke="#fff" strokeWidth={2} /><circle cx={18} cy={-6} r={6} fill="#CCC" /><path d="M-20 0 q -14 6 -24 -4" stroke="#CCC" strokeWidth={3} fill="none" /></g>;
              })}
            </g>
          )}
          {/* tea on fire in the left hand */}
          {t >= fire.s && t < watch.s && (
            <g transform="translate(1100 700)">
              <path d="M-30 -30 L30 -30 L24 30 L-24 30 Z" fill="#fff" stroke={C.ink} strokeWidth={5} />
              {[0, 1, 2].map((i) => <path key={i} d={`M${-20 + i * 20} -34 Q${-30 + i * 20} -80 ${-10 + i * 20} ${-110 - Math.sin(t * 12 + i) * 20} Q${i * 20} -70 ${-20 + i * 20} -34 Z`} fill={i === 1 ? C.sun : C.orange} stroke={C.ink} strokeWidth={3} />)}
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {/* the watch face, close */}
      {zoomW > 0.7 && (
        <AbsoluteFill style={{ opacity: ramp(t, watch.s + 1.2, 0.4) }}>
          <svg width={1920} height={1080}><rect width={1920} height={1080} fill="rgba(0,0,0,0.35)" /><Clock x={960} y={540} r={300} spin={-(1 - clamp((t - watch.s - 1.2) / 0.9)) * 3} rim={C.sun} face={false} /></svg>
        </AbsoluteFill>
      )}
      <Slam text="ধ্যাততেরি!" t={t} at={dhat.words[3].s} out={ghum.s - 0.1} x={960} y={220} size={150} color={C.crimson} shadow={`8px 8px 0 ${C.ink}`} rot={-5} />
      <Slam text="উফ!" t={t} at={fire.words[3].s} out={watch.s} x={1300} y={300} size={120} color={C.orange} shadow={`6px 6px 0 ${C.ink}`} rot={8} />
    </AbsoluteFill>
  );
};

// ======================================================================= BANG
// 89.6 – 95.3 s. The loudest bar of the song: "বাজে সাড়ে বারো।" The clock
// fills the frame on speed lines, his scream in the corner.

export const Bang: React.FC<SP> = ({ t, f }) => {
  const k = t - H.bang;
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Clock x={960} y={520} r={330 + beatPulse(t, 8) * 30} wobble={Math.sin(k * 20) * 6 * Math.exp(-k * 2)} />
        <Hero x={260} y={1180} s={2.2} outfit="office" tie pose={P.shock()} face={{ eyes: "wide", mouth: "shout", spiky: 1, sweat: 1 }} />
        <Hero x={1680} y={1180} s={2.2} outfit="office" tie pose={P.shock()} flip face={{ eyes: "wide", mouth: "shout", spiky: 1, sweat: 1 }} />
      </svg>
      <Slam text="বাজে সাড়ে বারো!" t={t} at={H.bang} out={95.4} x={960} y={160} size={160} color="#fff" shadow={`10px 10px 0 ${C.ink}, -5px -5px 0 ${C.crimson}`} rot={-3} />
    </AbsoluteFill>
  );
};

// ===================================================================== STREET
// Hook 2, 95.3 – 107.3 s. He runs through Dhaka at noon: rickshaws, a CNG, a
// bus, the tea stall, a pharmacy — and every clock on every sign says 12:30.

const SHOPS = ["মায়ের দোয়া হোটেল", "চা · বিস্কুট", "নিউ ফার্মেসী", "মোবাইল সার্ভিসিং", "লংকা টেইলার্স", "ভাই ভাই স্টোর"];

export const Street: React.FC<SP> = ({ t, f }) => {
  const run = (t - H.hook2) * 620;
  const lines = D.lines.filter((l) => l.section === "Hook" && l.s > 95 && l.s < 107.4);
  const baje = lines.filter((l) => l.text.startsWith("বাজে"));
  const pop = baje.reduce((m, l) => Math.max(m, cuePulse(t, l.words[1].s, 5)), 0);
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Sun x={1600} y={140} r={70} t={t} angry={0.4} />
        <g transform={`translate(${-(run * 0.15) % 2048} 0) scale(1 0.7) translate(0 340)`}><Skyline t={t} base={1080} /><g transform="translate(2048 0)"><Skyline t={t} base={1080} /></g></g>
        {/* shop row */}
        <g transform={`translate(${-(run * 0.5) % (SHOPS.length * 420)} 0)`}>
          {[...SHOPS, ...SHOPS, ...SHOPS].map((name, i) => (
            <g key={i} transform={`translate(${i * 420} 380)`}>
              <rect width={400} height={420} fill="rgba(0,0,0,0.55)" stroke={C.ink} strokeWidth={6} />
              <rect x={10} y={10} width={380} height={90} fill={["#FF1744", "#FF6D00", "#FFEA00", "#00E676", "#00E5FF", "#2979FF", "#D500F9", "#FF00A8"][i % 8]} stroke={C.ink} strokeWidth={5} />
              <text x={200} y={72} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={44} fill="#fff">{name}</text>
              <rect x={40} y={160} width={320} height={260} fill="#000" stroke={C.ink} strokeWidth={5} />
              {Array.from({ length: 8 }).map((_, j) => <line key={j} x1={40} y1={170 + j * 30} x2={360} y2={170 + j * 30} stroke={C.violet} strokeWidth={4} />)}
              <g transform={`translate(330 135) scale(${1 + pop * 0.35})`}><Clock x={0} y={0} r={32} face={false} rim={C.sun} /></g>
            </g>
          ))}
        </g>
        {/* road */}
        <rect x={0} y={800} width={1920} height={280} fill="#0A0014" />
        <rect x={0} y={790} width={1920} height={20} fill={C.magenta} stroke={C.ink} strokeWidth={4} />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={((i * 220 - run) % 2640 + 2640) % 2640 - 220} y={950} width={120} height={14} fill="#fff" />)}
        {/* traffic behind him (slower than his run → they slide back) */}
        <Rickshaw x={((1500 - run * 0.55) % 2600 + 2600) % 2600 - 300} y={1000} s={0.85} t={t} />
        <CNG x={((2600 - run * 0.4) % 2800 + 2800) % 2800 - 400} y={1010} s={0.85} t={t} />
        <Rickshaw x={((800 - run * 0.7) % 2600 + 2600) % 2600 - 300} y={1060} s={0.9} t={t + 1} />
        <Hero x={760} y={1000} s={1.35} outfit="office" tie watch pose={P.run(t * 15)} face={{ eyes: "wide", mouth: "shout", sweat: 1, spiky: 1 }} />
        {[0, 1, 2].map((i) => <line key={i} x1={560 - i * 40} y1={720 + i * 60} x2={420 - i * 60} y2={720 + i * 60} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
        <Crow x={((300 - run * 0.1) % 2000 + 2000) % 2000} y={380} s={1.4} t={t} caw={Math.max(0, Math.sin(t * 4))} />
      </svg>
      {lines.map((l, i) => {
        if (!l.text.includes("সাড়ে বারো") || t < l.s) return null;
        const at = l.words[l.words.length - 2]?.s ?? l.s;
        const pos = l.text.startsWith("শুধু") ? [960, 180, -2] : l.text.startsWith("বাজে") ? (baje.indexOf(l) ? [1380, 230, 6] : [560, 230, -6]) : [960, 200, 0];
        return <Slam key={i} text={l.text.replace(/[,।…]/g, "")} t={t} at={at} out={l.e + 0.4} x={pos[0]} y={pos[1]} rot={pos[2]} size={110} color={C.sun} shadow={`8px 8px 0 ${C.crimson}`} />;
      })}
      <Flash amount={cuePulse(t, H.hook2, 7) * 0.6} color="#fff" />
    </AbsoluteFill>
  );
};

// ===================================================================== OFFICE
// Hook 3, 107.3 – 118.8 s. He skids up to the office gate — shutter down.
// "আজ শুক্রবার — অফিস বন্ধ". The office guard laughs over his tea; the
// mosque's loudspeaker calls the Jumma; every clock: half past twelve.

export const Office: React.FC<SP> = ({ t, f }) => {
  const lines = D.lines.filter((l) => l.section === "Hook" && l.s > 107.4);
  const baje = lines.filter((l) => l.text.startsWith("বাজে"));
  const arrive = clamp((t - H.hook3) / 1.6);
  const reveal = baje[0].s;
  const x = lerp(-200, 720, easeOut(arrive));
  const stopped = arrive >= 1;
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* mosque minaret, Jumma */}
        <g transform="translate(1700 160)">
          <rect x={-40} y={0} width={80} height={600} fill={C.cream} stroke={C.ink} strokeWidth={6} />
          <path d="M-60 0 Q0 -120 60 0 Z" fill={C.teal} stroke={C.ink} strokeWidth={6} /><rect x={-60} y={120} width={120} height={20} fill={C.cream} stroke={C.ink} strokeWidth={5} />
          <path d="M40 60 l40 -20 l0 50 z" fill="#888" stroke={C.ink} strokeWidth={4} />
          {[1, 2, 3].map((i) => <path key={i} d={`M${80 + i * 20} ${40 - i * 10} q ${16} ${25 + i * 8} 0 ${50 + i * 18}`} stroke={C.ink} strokeWidth={4} fill="none" opacity={0.3 + 0.7 * beatPulse(t - i * 0.08, 4)} />)}
        </g>
        {/* office building */}
        <rect x={160} y={60} width={1300} height={760} fill={C.blue} stroke={C.ink} strokeWidth={8} />
        {Array.from({ length: 3 }).map((_, r) => Array.from({ length: 6 }).map((_, c) => <rect key={`${r}${c}`} x={210 + c * 205} y={200 + r * 130} width={160} height={90} fill="#000" stroke={C.cyan} strokeWidth={5} />))}
        <rect x={360} y={80} width={900} height={90} fill={C.crimson} stroke={C.ink} strokeWidth={6} />
        <text x={810} y={145} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={58} fill="#fff">লংকা কাণ্ড লিমিটেড</text>
        <Clock x={1380} y={140} r={60} face={false} rim={C.sun} />
        {/* the shutter */}
        <rect x={420} y={590} width={640} height={230} fill="#3A0050" stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={420} y1={610 + i * 24} x2={1060} y2={610 + i * 24} stroke={C.magenta} strokeWidth={4} />)}
        <rect x={0} y={820} width={1920} height={260} fill={C.floor} />
        {t >= reveal - 0.1 && (
          <g transform={`translate(780 470) rotate(-4) scale(${backOut((t - reveal) / 0.3)})`}>
            <rect x={-260} y={-70} width={520} height={140} fill="#fff" stroke={C.ink} strokeWidth={7} />
            <text x={0} y={-12} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill={C.crimson}>আজ শুক্রবার</text>
            <text x={0} y={46} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={50} fill={C.ink}>অফিস বন্ধ</text>
          </g>
        )}
        {/* guard with tea, on a stool */}
        <rect x={1150} y={860} width={140} height={20} fill={C.crimson} stroke={C.ink} strokeWidth={4} />
        <Hero x={1220} y={932} s={1.1} outfit="guard" cap mustache belly={1} flip pose={t >= reveal ? { ...P.sit(), armF: [2.3 + Math.sin(t * 14) * 0.2, 0.6] } : P.sit()}
          face={{ eyes: t >= reveal ? "closed" : "open", mouth: t >= reveal ? "grin" : "flat" }} />
        <Hero x={x} y={1000} s={1.4} outfit="office" tie watch pose={stopped ? (t >= reveal ? P.shock() : P.stand()) : P.run(t * 15)}
          face={{ eyes: "wide", mouth: t >= reveal ? "shout" : "o", spiky: t >= reveal ? 1 : 0, sweat: 1 }} />
        {!stopped && [0, 1].map((i) => <ellipse key={i} cx={x - 120 - i * 70} cy={990} rx={40 - i * 10} ry={16} fill="#FFFFFF" opacity={0.7} />)}
      </svg>
      <Bubble t={t} at={baje[1]?.s ?? reveal + 3} x={1640} y={640} side="r" text="আজকে তো শুক্রবার, স্যার! হা হা" bg={C.sun} color={C.ink} size={50} out={118.6} />
      {lines.map((l, i) => {
        if (!l.text.includes("সাড়ে বারো") || t < l.s) return null;
        const at = l.words[l.words.length - 2]?.s ?? l.s;
        const pos = l.text.startsWith("শুধু") ? [960, 260, -2] : baje.indexOf(l) ? [1500, 300, 6] : [470, 300, -6];
        return <Slam key={i} text={l.text.replace(/[,।…]/g, "")} t={t} at={at} out={l.e + 0.4} x={pos[0]} y={pos[1]} rot={pos[2]} size={100} color={C.sun} shadow={`8px 8px 0 ${C.crimson}`} />;
      })}
    </AbsoluteFill>
  );
};

// ====================================================================== OUTRO
// 118.8 s – end. He gives up and sits on the office steps with the ice cream
// from the fridge, the guard beside him, the sun finally smiling. The credits.

const CREDITS: [string, string][] = [
  ["SHAREY BARO", "PABLO PIKASO"],
  ["From the Album", "“ LONKA KANDO ”"],
  ["Music Produced & Mixed-Mastered By", "Nuraet Prottay"],
  ["Produced By", "Titu Chaklader"],
  ["Studio", "Audio Cave"],
  ["Music Video by", "Rapar Rubel ( Rubel Miah )"],
];

export const Outro: React.FC<SP> = ({ t, f }) => {
  const k = t - H.outro;
  const card = easeOut((t - 119.3) / 0.7);
  const end = ramp(t, D.duration - 1.2, 1.0);
  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Sun x={260} y={200} r={90} t={t} angry={-0.4} />
        <Skyline t={t} base={760} />
        <rect x={0} y={740} width={1920} height={340} fill={C.floor} />
        {[0, 1, 2].map((i) => <rect key={i} x={140} y={760 + i * 70} width={1000} height={70} fill={[C.magenta, C.violet, C.blue][i]} stroke={C.ink} strokeWidth={5} />)}
        <Hero x={480} y={900} s={1.25} outfit="office" tie watch pose={{ ...P.sit(), armF: [2.4 + Math.sin(k * 3) * 0.1, 0.9] }} face={{ eyes: Math.floor(k * 2) % 4 === 0 ? "closed" : "open", mouth: "grin" }} />
        <g transform={`translate(${480 + 64} ${900 - 300})`}>
          <path d="M-18 -10 L18 -10 L0 50 Z" fill="#D9A15C" stroke={C.ink} strokeWidth={4} />
          <circle cy={-22} r={22} fill={C.magenta} stroke={C.ink} strokeWidth={4} /></g>
        <Hero x={760} y={900} s={1.2} outfit="guard" cap mustache belly={1} flip pose={P.sit()} face={{ eyes: "closed", mouth: "grin" }} />
        <Crow x={960} y={720} s={1.3} t={t} caw={Math.max(0, Math.sin(t * 2))} flip />
      </svg>
      {/* credits card */}
      <div style={{ position: "absolute", right: 70, top: 90, width: 760, padding: "40px 46px", background: C.cream, border: `7px solid ${C.ink}`, borderRadius: 26,
        boxShadow: `14px 14px 0 ${C.crimson}`, transform: `translateX(${(1 - card) * 1000}px) rotate(${(1 - card) * 8 + 1.5}deg)` }}>
        {CREDITS.map(([a, b], i) => (
          <div key={i} style={{ marginBottom: i === 0 ? 26 : 16, opacity: ramp(t, 119.5 + i * 0.3, 0.3) }}>
            <div style={{ fontFamily: MONO, fontSize: i === 0 ? 52 : 24, fontWeight: 700, color: i === 0 ? C.crimson : "#5A0080", letterSpacing: 2 }}>{a}</div>
            <div style={{ fontFamily: i === 0 ? POSTER : DISPLAY, fontWeight: 800, fontSize: i === 0 ? 60 : 40, color: C.ink, lineHeight: 1.15 }}>{b}</div>
          </div>
        ))}
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: end }} />
    </AbsoluteFill>
  );
};
