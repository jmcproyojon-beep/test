import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY, MONO, POSTER } from "../signal/fonts";
import { Slam, Bubble, Flash } from "../signal/kit";
import { Hero, P, Clock, Crow } from "./cast";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, lineAt, beatPulse, downbeatPulse,
  cuePulse, backOut, beatPhase, bassSmooth,
} from "./lib";

export type SP = { t: number; f: number };

// shared: Dhaka skyline (flat blocks, water tanks, dish antennas, tangled wires)
const BLD = Array.from({ length: 16 }).map((_, i) => ({
  x: i * 128 - 20, w: 110 + rand(i) * 40, h: 260 + rand(i + 4) * 380, c: ["#FF1744", "#FF6D00", "#FFEA00", "#00E676", "#00E5FF", "#2979FF", "#D500F9", "#FF00A8"][i % 8],
  tank: rand(i + 9) > 0.5,
}));

export const Skyline: React.FC<{ t: number; base?: number; heat?: number }> = ({ t, base = 1080, heat = 0 }) => (
  <g>
    {BLD.map((b, i) => {
      const top = base - b.h;
      return (
        <g key={i}>
          <rect x={b.x} y={top} width={b.w} height={b.h + 10} fill={b.c} stroke={C.ink} strokeWidth={5} />
          {Array.from({ length: Math.floor(b.h / 80) }).map((_, j) => (
            <g key={j}>
              <rect x={b.x + 16} y={top + 24 + j * 80} width={30} height={40} fill="#000" stroke={C.ink} strokeWidth={3} />
              <rect x={b.x + b.w - 46} y={top + 24 + j * 80} width={30} height={40} fill="#000" stroke={C.ink} strokeWidth={3} />
              <rect x={b.x + 10} y={top + 66 + j * 80} width={b.w - 20} height={6} fill={C.ink} opacity={0.5} />
            </g>
          ))}
          {b.tank && <g><rect x={b.x + 20} y={top - 46} width={52} height={46} rx={6} fill={C.violet} stroke={C.ink} strokeWidth={4} /><rect x={b.x + 30} y={top - 56} width={32} height={12} fill={C.violet} stroke={C.ink} strokeWidth={3} /></g>}
        </g>
      );
    })}
    {/* tangled Dhaka wires */}
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M-20 ${base - 520 + i * 18} Q 480 ${base - 420 + i * 30 + Math.sin(t + i) * 6} 960 ${base - 500 + i * 14} T 1940 ${base - 480 + i * 20}`}
        stroke={C.ink} strokeWidth={3} fill="none" opacity={0.85} />
    ))}
    {heat > 0 && <rect x={0} y={0} width={1920} height={base} fill={C.orange} opacity={heat * 0.12} />}
  </g>
);

export const Sun: React.FC<{ x: number; y: number; r: number; t: number; face?: boolean; angry?: number }> = ({ x, y, r, t, face = true, angry = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 14 }).map((_, i) => (
      <path key={i} d={`M0 ${-r - 14} L${10} ${-r - 70 - 14 * Math.sin(t * 6 + i)} L${-10} ${-r - 70 - 14 * Math.sin(t * 6 + i)} Z`} fill={C.orange} stroke={C.ink} strokeWidth={4} transform={`rotate(${i * (360 / 14) + t * 20})`} />
    ))}
    <circle r={r} fill={C.sun} stroke={C.ink} strokeWidth={7} />
    {face && <>
      <path d={`M${-r * 0.42} ${-r * 0.2} l${r * 0.24} ${angry * 10}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <path d={`M${r * 0.42} ${-r * 0.2} l${-r * 0.24} ${angry * 10}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle cx={-r * 0.3} cy={-r * 0.02} r={r * 0.09} fill={C.ink} /><circle cx={r * 0.3} cy={-r * 0.02} r={r * 0.09} fill={C.ink} />
      <path d={`M${-r * 0.3} ${r * 0.35} Q0 ${r * (0.55 - angry * 0.35)} ${r * 0.3} ${r * 0.35}`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    </>}
  </g>
);

// ====================================================================== INTRO
// 0 – 6.0 s. Dhaka at noon: an angry sun over the water tanks and tangled
// wires, crows on the line. The title stamps on the first hit; the camera
// dives at one window.

export const Intro: React.FC<SP> = ({ t, f }) => {
  const dive = Math.pow(clamp((t - 4.9) / 1.1), 2.2);
  const title = H.start;
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <AbsoluteFill style={{ transform: `scale(${lerp(1, 6, dive)})`, transformOrigin: "36% 66%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Sun x={1560} y={210} r={110} t={t} angry={0.6} />
          <Skyline t={t} heat={0.5 + Math.sin(t * 3) * 0.2} />
          {[0, 1, 2].map((i) => <Crow key={i} x={380 + i * 160} y={590 + i * 8} s={1.4} t={t} caw={Math.max(0, Math.sin(t * 3 + i * 2))} flip={i === 1} />)}
          {/* heat shimmer lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${200 + i * 300} 400 q 20 -30 0 -60 q -20 -30 0 -60`} stroke={C.orange} strokeWidth={5} fill="none" opacity={0.5}
              transform={`translate(0 ${-((t * 60 + i * 40) % 120)})`} />
          ))}
        </svg>
      </AbsoluteFill>
      {t >= title - 0.05 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - ramp(t, 5.3, 0.4) }}>
          <div style={{ transform: `scale(${lerp(2, 1, backOut((t - title) / 0.25))}) rotate(-4deg)`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 250, color: C.sun,
            textShadow: `10px 10px 0 ${C.crimson}, 0 0 0 ${C.ink}`, WebkitTextStroke: `6px ${C.ink}` }}>সাড়ে বারো</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: "#fff", letterSpacing: 12, marginTop: 14, background: "#000", padding: "6px 26px", borderRadius: 10 }}>PABLO PIKASO</div>
        </AbsoluteFill>
      )}
      {t < title && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.ink, letterSpacing: 8, opacity: ramp(t, 0.6, 0.6) }}>ঢাকা · শুক্রবার · দুপুর</div>
        </AbsoluteFill>
      )}
      <Flash amount={cuePulse(t, title, 8) * 0.8} color={C.sun} />
    </AbsoluteFill>
  );
};

// ==================================================================== BEDROOM
// 6.0 – 16.6 s. Inside: he is asleep under a mosquito net while the sun's
// beam crawls across the bed. Outside the window the sun zips up the sky;
// চাঁদমামা, in a nightcap, yawns and sinks behind the buildings.

export const Room: React.FC<{ t: number; mess?: number }> = ({ t, mess = 0 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={800} fill={C.mint} />
    <rect x={0} y={800} width={1920} height={280} fill={C.floor} />
    {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 170} y1={800} x2={i * 170 - 120} y2={1080} stroke={C.cyan} strokeWidth={3} opacity={0.5} />)}
    <rect x={0} y={792} width={1920} height={14} fill={C.magenta} stroke={C.ink} strokeWidth={4} />
    {/* calendar + switchboard */}
    <g transform="translate(140 220)"><rect width={130} height={170} fill="#fff" stroke={C.ink} strokeWidth={5} /><rect width={130} height={40} fill={C.crimson} stroke={C.ink} strokeWidth={5} />
      <text x={65} y={120} textAnchor="middle" fontFamily={POSTER} fontSize={70} fill={C.ink}>শুক্র</text></g>
    <rect x={1760} y={430} width={90} height={60} rx={6} fill="#fff" stroke={C.ink} strokeWidth={4} />
    {mess > 0 && Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={300 + rand(i) * 1300} y={840 + rand(i + 3) * 180} width={50 + rand(i + 5) * 60} height={18 + rand(i + 7) * 20} rx={6}
        fill={[C.crimson, C.blue, C.sun, "#fff", C.teal][i % 5]} stroke={C.ink} strokeWidth={4} transform={`rotate(${rand(i + 2) * 60 - 30} ${400 + i * 120} 900)`} opacity={mess} />
    ))}
  </g>
);

export const Bedroom: React.FC<SP> = ({ t, f }) => {
  const l2 = findLine("সূর্যটা"), l3 = findLine("চাঁদমামা");
  const sunUp = easeOut((t - l2.s) / 2.2);
  const moonDown = clamp((t - l3.s) / (l3.e - l3.s + 0.6));
  const beam = clamp((t - 6) / 10);
  const heat = ramp(t, 13.5, 2.5);
  const snore = Math.sin(t * 2.4);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Room t={t} />
        {/* window */}
        <g transform="translate(1180 120)">
          <rect width={560} height={420} fill={C.sky} stroke={C.ink} strokeWidth={10} />
          <svg width={560} height={420}>
            <g transform={`translate(0 ${lerp(40, 0, sunUp)})`}><Sun x={lerp(120, 400, sunUp)} y={lerp(480, 120, sunUp)} r={60} t={t} face angry={heat} /></g>
            {t > l3.s - 0.4 && (
              <g transform={`translate(${lerp(420, 470, moonDown)} ${lerp(110, 470, moonDown)}) rotate(${-moonDown * 30})`}>
                <circle r={46} fill={C.cream} stroke={C.ink} strokeWidth={5} />
                <circle cx={18} cy={-8} r={40} fill={C.sky} />
                <path d="M-20 -40 L20 -80 L30 -36 Z" fill={C.blue} stroke={C.ink} strokeWidth={4} /><circle cx={20} cy={-82} r={8} fill="#fff" stroke={C.ink} strokeWidth={3} />
                <path d="M-30 -2 q 6 6 12 0" stroke={C.ink} strokeWidth={4} fill="none" />
                <text x={40} y={-50} fontFamily={DISPLAY} fontWeight={800} fontSize={36} fill={C.night}>z z</text>
              </g>
            )}
            {[0, 1, 2].map((i) => <rect key={i} x={i * 200 - 20} y={300 - i * 40} width={170} height={200} fill={["#FF1744", "#00E676", "#D500F9"][i]} stroke={C.ink} strokeWidth={4} />)}
          </svg>
          <rect width={560} height={420} fill="none" stroke={C.ink} strokeWidth={10} />
          <line x1={280} y1={0} x2={280} y2={420} stroke={C.ink} strokeWidth={8} />
          {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={0} y1={i * 60} x2={560} y2={i * 60} stroke="#555" strokeWidth={4} />)}
        </g>
        {/* sun beam onto the bed */}
        <polygon points={`1180,140 1740,140 ${lerp(1300, 760, beam)},860 ${lerp(1500, 1000, beam)},860`} fill={C.sun} opacity={0.28 + heat * 0.15} />
        {/* bed */}
        <rect x={260} y={600} width={1000} height={170} rx={12} fill={C.violet} stroke={C.ink} strokeWidth={7} />
        <rect x={250} y={560} width={1020} height={60} rx={20} fill={C.sun} stroke={C.ink} strokeWidth={7} />
        <rect x={280} y={770} width={30} height={60} fill="#5A00A0" stroke={C.ink} strokeWidth={5} /><rect x={1210} y={770} width={30} height={60} fill="#5A00A0" stroke={C.ink} strokeWidth={5} />
        <rect x={430} y={500} width={190} height={70} rx={30} fill="#fff" stroke={C.ink} strokeWidth={6} />
        {/* him, lying, under a kantha */}
        <Hero x={880} y={565} s={1.25} rot={-90} pose={{ ...P.stand(), armF: [0.4, 0.6] }} face={{ eyes: "closed", mouth: snore > 0.6 ? "o" : "flat", sweat: heat }} />
        <path d="M760 500 Q960 450 1200 520 L1220 590 L740 590 Z" fill={C.crimson} stroke={C.ink} strokeWidth={6} />
        {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${790 + i * 80} 530 l20 20 l20 -20`} stroke={C.sun} strokeWidth={5} fill="none" />)}
        {/* mosquito net */}
        <path d="M240 200 L1280 200 L1280 600 L240 600 Z" fill="#fff" opacity={0.18} stroke="#fff" strokeWidth={4} />
        {Array.from({ length: 26 }).map((_, i) => <line key={i} x1={240 + i * 40} y1={200} x2={240 + i * 40} y2={600} stroke="#fff" strokeWidth={1.5} opacity={0.45} />)}
        {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={240} y1={200 + i * 40} x2={1280} y2={200 + i * 40} stroke="#fff" strokeWidth={1.5} opacity={0.45} />)}
        {/* zzz */}
        {[0, 1, 2].map((i) => {
          const p = ((t * 0.6 + i / 3) % 1);
          return <text key={i} x={520 + p * 120} y={400 - p * 220} fontFamily={DISPLAY} fontWeight={800} fontSize={40 + p * 40} fill={C.night} opacity={(1 - p) * (1 - heat)}>z</text>;
        })}
        {/* steam off him when the beam lands */}
        {heat > 0 && [0, 1, 2].map((i) => (
          <path key={i} d={`M${520 + i * 40} 440 q 14 -24 0 -48 q -14 -24 0 -48`} stroke="#fff" strokeWidth={6} fill="none" opacity={heat * 0.8} transform={`translate(0 ${-((t * 50 + i * 30) % 60)})`} />
        ))}
      </svg>
      {heat > 0.3 && <Slam text="ছ্যাঁৎ!" t={t} at={14.6} out={16.4} x={540} y={300} size={110} color={C.orange} shadow={`6px 6px 0 ${C.ink}`} rot={-8} />}
    </AbsoluteFill>
  );
};

// ======================================================================= WAKE
// 16.6 – 27.9 s. Eyes snap open, he leaps up (net and all). Question marks.
// The doorbell: টিং টং! He opens the door — nobody; a kid tears off down the
// stairs, giggling, one sandal left behind.

export const Wake: React.FC<SP> = ({ t, f }) => {
  const open = findLine("চোখ খুলে"), what = findLine("জানি না"), bell = findLine("ডোরবেল");
  const jump = t > open.words[3].s ? Math.sin(clamp((t - open.words[3].s) / 0.5) * Math.PI) * 120 : 0;
  const atDoor = t >= bell.s;
  if (!atDoor) {
    const close = t < open.words[2].s;
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Room t={t} />
          <rect x={260} y={600} width={1000} height={170} rx={12} fill={C.violet} stroke={C.ink} strokeWidth={7} />
          <rect x={250} y={560} width={1020} height={60} rx={20} fill={C.sun} stroke={C.ink} strokeWidth={7} />
          <Hero x={760} y={600 - jump} s={1.5} pose={t > open.words[3].s ? P.shock() : P.stand()}
            face={{ eyes: close ? "sleepy" : "wide", mouth: t > open.words[3].s ? "shout" : "flat", spiky: t > open.words[3].s ? 1 : 0, sweat: 1, look: Math.sin(t * 3) }} />
          {t > what.s && [0, 1, 2].map((i) => (
            <text key={i} x={560 + i * 220} y={240 + Math.sin(t * 5 + i) * 20} fontFamily={DISPLAY} fontWeight={800} fontSize={150 + i * 20} fill={[C.crimson, C.blue, C.orange][i]}
              stroke={C.ink} strokeWidth={5} opacity={ramp(t, what.words[i]?.s ?? what.s, 0.15)} transform={`rotate(${Math.sin(t * 4 + i) * 15} ${600 + i * 220} 200)`}>?</text>
          ))}
        </svg>
        {/* closeup eyes flash */}
        {t > open.words[1].s && t < open.words[3].s && (
          <AbsoluteFill style={{ background: C.skin, alignItems: "center", justifyContent: "center" }}>
            <svg width={1920} height={1080}>
              {[-260, 260].map((dx, i) => (
                <g key={i} transform={`translate(${960 + dx} 520)`}>
                  <ellipse rx={200} ry={lerp(20, 170, easeOut((t - open.words[1].s) / 0.2))} fill="#fff" stroke={C.ink} strokeWidth={14} />
                  <circle r={60} fill={C.ink} /><circle cx={20} cy={-20} r={18} fill="#fff" />
                </g>
              ))}
            </svg>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }
  const ding = bell.words[0];
  const doorOpen = easeOut((t - bell.words[2].s) / 0.4);
  const kidX = lerp(1150, 2100, clamp((t - bell.words[2].s) / 2.2));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* stairwell landing */}
        <rect x={0} y={0} width={1920} height={820} fill={C.mint} />
        <rect x={0} y={820} width={1920} height={260} fill={C.floor} />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={1180 + i * 120} y={820 - i * 60} width={760} height={60} fill={["#FF1744", "#FF6D00", "#FFEA00", "#00E676", "#00E5FF", "#2979FF"][i]} stroke={C.ink} strokeWidth={4} />)}
        <path d="M1180 700 L1900 340" stroke={C.ink} strokeWidth={10} />
        {/* door */}
        <rect x={300} y={160} width={420} height={660} fill="#000" stroke={C.ink} strokeWidth={8} />
        <g transform={`translate(300 160) scale(${1 - doorOpen * 0.8} 1)`}>
          <rect width={420} height={660} fill={C.orange} stroke={C.ink} strokeWidth={8} />
          <rect x={40} y={40} width={340} height={260} fill="none" stroke={C.ink} strokeWidth={5} /><rect x={40} y={340} width={340} height={280} fill="none" stroke={C.ink} strokeWidth={5} />
          <circle cx={370} cy={360} r={14} fill={C.sun} stroke={C.ink} strokeWidth={4} />
        </g>
        {doorOpen > 0.3 && <Hero x={520} y={830} s={1.35} pose={P.stand()} face={{ eyes: "wide", mouth: "o", look: 1, spiky: 1 }} />}
        {/* doorbell */}
        <g transform={`translate(800 380) rotate(${Math.sin(t * 50) * 14 * Math.exp(-Math.max(0, t - ding.s) * 3)})`}>
          <rect x={-34} y={-46} width={68} height={92} rx={12} fill="#fff" stroke={C.ink} strokeWidth={5} /><circle r={18} fill={C.crimson} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* the kid escaping */}
        {t > bell.words[2].s && <Hero x={kidX} y={830 - (kidX - 1150) * 0.5} s={0.75} outfit="kid" pose={P.run(t * 14)} face={{ mouth: "grin", look: 1 }} />}
        {t > bell.words[2].s + 0.3 && <path d="M1000 820 l50 -6 l6 12 l-50 6 z" fill="#FFB000" stroke={C.ink} strokeWidth={4} />}
      </svg>
      <Slam text="টিং টং!" t={t} at={ding.s} out={ding.s + 1.3} x={980} y={250} size={130} color={C.sun} shadow={`7px 7px 0 ${C.ink}`} rot={8} />
      {t > bell.words[3].s && <Slam text="হি হি হি" t={t} at={bell.words[3].s} out={bell.e + 0.8} x={1500} y={240} size={80} color={C.crimson} shadow={`5px 5px 0 ${C.ink}`} font={PLAY} rot={-6} />}
    </AbsoluteFill>
  );
};

// ======================================================================= HOOK
// The hook (28.0, 95.5 and 107.5 s): an empty flat — rice pot, almirah,
// plate, all empty — and only the clock, alive, dancing on the beat at half
// past twelve. "বাজে সাড়ে বারো" stamps on each bar.

export const HookRoom: React.FC<SP & { from: number }> = ({ t, f, from }) => {
  const k = t - from;
  const bp = beatPulse(t, 8), db = downbeatPulse(t, 6);
  const lines = D.lines.filter((l) => l.s >= from - 0.5 && l.s < from + 15 && (l.section === "Hook" || l.section === "Outro"));
  const baje = lines.filter((l) => l.text.startsWith("বাজে"));
  const zoom = 1 + ramp(k, 10.8, 3.5) * 0.6;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 36%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Room t={t} />
          {/* empty things */}
          <g opacity={1 - ramp(k, 10.5, 0.6)}>
            <g transform="translate(260 800)"><ellipse cx={0} cy={-60} rx={120} ry={30} fill="#999" stroke={C.ink} strokeWidth={6} />
              <path d="M-120 -60 Q-120 0 -60 0 L60 0 Q120 0 120 -60" fill="#BBB" stroke={C.ink} strokeWidth={6} /><text x={0} y={-90} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={36} fill={C.ink}>ভাত নাই</text></g>
            <g transform="translate(1500 300)"><rect width={300} height={500} fill={C.blue} stroke={C.ink} strokeWidth={7} />
              <g transform={`translate(150 0) scale(${-0.85 + Math.sin(k * 2) * 0.1} 1)`}><rect x={0} y={0} width={150} height={500} fill={C.violet} stroke={C.ink} strokeWidth={6} /></g>
              <rect x={10} y={240} width={140} height={10} fill={C.ink} /><path d="M20 20 L120 120 M20 120 L120 20 M70 10 L70 130 M10 70 L130 70" stroke="#888" strokeWidth={2} /><circle cx={70} cy={70} r={30} fill="none" stroke="#888" strokeWidth={2} /></g>
            <g transform="translate(560 800)"><ellipse rx={90} ry={22} fill="#fff" stroke={C.ink} strokeWidth={6} /><text x={0} y={-30} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={30} fill={C.ink}>খালি</text></g>
          </g>
          <Clock x={960} y={330} r={180 + db * 24} wobble={Math.sin(beatPhase(t) * Math.PI) * 10} spin={k < 0.6 ? (0.6 - k) * 6 : 0} />
          <Hero x={960} y={980} s={1.25} pose={baje.some((l) => t >= l.s && t < l.e) ? P.shock() : P.shrug()} face={{ eyes: "wide", mouth: baje.some((l) => t >= l.s && t < l.e) ? "shout" : "o", look: 0, sweat: 1, spiky: baje.some((l) => t >= l.s) ? 1 : 0 }} />
        </svg>
      </AbsoluteFill>
      {/* the stamped hook */}
      {lines.map((l, i) => {
        if (!l.text.includes("সাড়ে বারো") || t < l.s) return null;
        const pos = [[0, 0], [470, 610, -8], [1450, 610, 7], [960, 620, -3]];
        const p = l.text.startsWith("বাজে") ? (baje.indexOf(l) === 0 ? pos[1] : pos[2]) : l.text.startsWith("শুধু") ? [960, 140, 0] : pos[3];
        return (
          <Slam key={i} text={l.text.replace(/[,।…]/g, "")} t={t} at={l.words[l.words.length - 2]?.s ?? l.s} out={l.e + 0.5} x={p[0]} y={p[1]} rot={p[2] ?? 0}
            size={l.text.startsWith("বাজে") ? 120 : 110} color={C.sun} shadow={`8px 8px 0 ${C.crimson}`} />
        );
      })}
      <Flash amount={cuePulse(t, from, 7) * 0.6} color={C.sun} />
    </AbsoluteFill>
  );
};
