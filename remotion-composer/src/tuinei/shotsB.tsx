import React from "react";
import { blink, clamp, ease, easeOut, kf, lerp, ramp, rand, win } from "./lib";
import { CamHand, Face, INK, Person } from "./chars";
import { BusWindow, CAM0, Field, Mist, Room, Steps, Street, TeaGlass, Veranda } from "./envs";
import { CU, PhoneProp, SHOTS_A, Shot, sing } from "./shotsA";

// Shots 1:32 - 3:45: the field break, the night (verse 2), the old photos (chorus 2), the last photograph.

// ------------------------------------------------------------ the steps by the field (one layout every visit)
const TIER = (i: number) => 740 + i * 90;           // seat line of tier i (Steps drawn at its default place)
const sitAt = (tier: number, s: number) => TIER(tier) + 300 * s * 0.97 - 20;
type Seat = { who: any; x: number; tier: number; s: number };
const FINAL: Record<string, Seat> = {
  arif: { who: "arif", x: 800, tier: 1, s: 0.46 }, nusrat: { who: "nusrat", x: 1070, tier: 1, s: 0.46 },
  shuvo: { who: "shuvo", x: 690, tier: 2, s: 0.52 }, rubel: { who: "rubel", x: 900, tier: 2, s: 0.52 }, mitu: { who: "mitu", x: 1110, tier: 2, s: 0.52 },
};
const sitP = (k: Seat, f: Face, extra: Partial<React.ComponentProps<typeof Person>> = {}) => (
  <Person who={k.who} x={k.x} y={sitAt(k.tier, k.s)} s={k.s} legs="sit" f={f} l={[-80, -268]} r={[80, -268]} bag={k.who === "shuvo"} {...extra} />
);

/** one frame of an earlier shot, for the photos on Rubel's phone */
const Frame: React.FC<{ at: number }> = ({ at }) => {
  const s = [...SHOTS_A, ...SHOTS_B].find((x) => at >= x.a && at < x.b);
  return <g>{s?.draw(at)}<rect width={1920} height={1080} fill="#FFB866" opacity={0.14} /></g>;
};
const PhoneScreen: React.FC<{ t: number; photos: number[]; every: number; t0: number; zoom?: number }> = ({ t, photos, every, t0, zoom = 1 }) => {
  const k = (t - t0) / every;
  const i = Math.min(photos.length - 1, Math.floor(k)), sw = ease((k - i - 0.78) / 0.22);
  const W = 620, H = 1100;
  return (
    <g>
      <rect x={-W / 2 - 26} y={-H / 2 - 26} width={W + 52} height={H + 52} rx={70} fill="#15181C" stroke={INK} strokeWidth={6} />
      <clipPath id="pscr"><rect x={-W / 2} y={-H / 2} width={W} height={H} rx={48} /></clipPath>
      <g clipPath="url(#pscr)">
        <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#0E0F12" />
        {[i, i + 1].map((j, n) => j < photos.length && (
          <g key={j} transform={`translate(${(n === 0 ? -sw : 1 - sw) * W} 0)`}>
            <svg x={-W / 2 - (n === 0 ? 0 : 0)} y={-175 * zoom} width={W} height={350 * zoom} viewBox={`${960 - 960 / zoom} ${540 - 540 / zoom} ${1920 / zoom} ${1080 / zoom}`} preserveAspectRatio="xMidYMid slice">
              <Frame at={photos[j]} />
            </svg>
          </g>
        ))}
      </g>
    </g>
  );
};

// ------------------------------------------------------------ the last photograph (phone POV on the steps)
const FinalPOV = (t: number, freeze = false) => {
  const T = freeze ? 199.38 : t;
  const tilt = kf(T, [[193.4, 0], [194.1, -16]]);
  const laugh = ramp(T, 194.5, 0.3);
  const mituHand = win(T, 193.0, 199.6, 0.4, 0.3);
  return (
    <Field t={T} cam={{ x: -60, y: 200, z: 1.72 }} cricket>
      <Steps />
      {sitP(FINAL.arif, { yaw: 0.1, smile: 0.7, blink: T > 199.15 ? 1 : blink(T, 4) })}
      {sitP(FINAL.nusrat, { yaw: lerp(0, -0.6, ramp(T, 198.6, 0.6)), smile: 0.8, blink: blink(T, 1) }, { lean: lerp(0, -10, ramp(T, 198.6, 0.6)) })}
      {sitP(FINAL.shuvo, { yaw: lerp(0.05, 0.55, ramp(T, 195.2, 0.5)), smile: 0.8, blink: blink(T, 5) }, { lean: 4 })}
      {sitP(FINAL.rubel, { yaw: lerp(0.05, 0.4, ramp(T, 194.1, 0.4)) - laugh * 0.25, laugh, cap: tilt, blink: 0, pitch: laugh * 0.5 }, { lean: laugh * kf(T, [[194.5, 0], [195.5, -6], [196.6, 4], [198, -3]]) })}
      {sitP(FINAL.mitu, { yaw: -0.45, smile: 0.9, laugh: laugh * 0.6, blink: blink(T, 2) }, mituHand > 0 ? { l: [lerp(-70, -330, mituHand), lerp(-330, -760, mituHand)] } : {})}
      {freeze && <g opacity={0.3}>{sitP(FINAL.nusrat, { yaw: -0.2, smile: 0.8 }, { lean: -4, x: FINAL.nusrat.x + 26 } as any)}</g>}
    </Field>
  );
};

export const SHOTS_B: Shot[] = [
  // ---- instrumental: campus life goes on around him
  { a: 92.66, b: 98.0, draw: (t) => {
    const lt = t - 92.66;
    const arrive = (d: number) => ease((lt - d) / 2.2);
    return <Field t={t} cam={{ x: lerp(-40, 60, lt / 5.3), y: 60, z: 1.05 }}>
      <Steps />
      <Person who="arif" x={lerp(-100, 1500, ease((lt - 0.4) / 4.2))} y={TIER(0) + 10} s={0.42} legs="stride" phase={t * 12} f={{ yaw: 0.6, smile: 0.8 }} holdBall />
      {[["mitu", 760, 0.2], ["nusrat", 900, 0.5], ["shuvo", 620, 0.9]].map(([w, x, d], i) => {
        const k = arrive(d as number);
        return k < 1 ? <Person key={i} who={w as any} x={lerp(-120, x as number, k)} y={TIER(0) + 10} s={0.42} legs="stride" phase={t * 8 + i} f={{ yaw: 0.5, smile: 0.5 }} bag={w === "shuvo"} />
          : <Person key={i} who={w as any} x={x as number} y={sitAt(1, 0.46)} s={0.46} legs="sit" f={{ yaw: i === 0 ? 0.5 : -0.4, smile: 0.6, blink: blink(t, i + 1) }} l={[-70, -330]} r={[70, -330]} bag={w === "shuvo"} />;
      })}
      {(() => { const k = arrive(1.6); return k < 1 ? <Person who="rubel" x={lerp(-120, 1180, k)} y={TIER(0) + 10} s={0.42} legs="stride" phase={t * 8} f={{ yaw: 0.6, smile: 0.3 }} />
        : <Person who="rubel" x={1180} y={sitAt(2, 0.52)} s={0.52} legs="sit" f={{ yaw: -0.3, smile: 0.3, blink: blink(t, 3) }} l={[-70, -330]} r={[70, -330]} />; })()}
    </Field>;
  } },
  { a: 98.0, b: 103.5, draw: (t) => {
    const lt = t - 98.0;
    const run = clamp(lt / 3.0), bowl = ease((lt - 3.0) / 0.5);
    return <Field t={t} cam={{ x: 0, y: 0, z: 1 }} cricket={false}>
      <rect x={-400} y={760} width={2800} height={60} fill="#D9C79A" opacity={0.7} />
      {[420, 1560].map((x) => <g key={x}>{[-12, 0, 12].map((d) => <rect key={d} x={x + d - 3} y={690} width={6} height={80} fill="#F1E9D6" stroke={INK} strokeWidth={2} />)}</g>)}
      <Person who="extra" x={380} y={800} s={0.34} f={{ yaw: 0.7 }} r={[120, -560]} hold={<rect x={-8} y={-120} width={16} height={150} rx={6} fill="#D9B47A" stroke={INK} strokeWidth={3} />} />
      <Person who="arif" x={lerp(1900, 1560, run)} y={800} s={0.36} legs={run < 1 ? "stride" : "stand"} phase={t * 12} f={{ yaw: -0.7, brow: 0.5 }} lean={bowl * -14}
        r={bowl > 0 ? [lerp(100, -60, bowl), lerp(-700, -1000, Math.sin(bowl * Math.PI))] : [100, -560]} holdBall={bowl < 0.6} />
      {bowl > 0.6 && (() => { const p = clamp((lt - 3.3) / 0.7); return <circle cx={lerp(1520, 440, p)} cy={720 + Math.sin(p * Math.PI) * -60 + (p > 0.7 ? (p - 0.7) * 100 : 0)} r={6} fill="#A3262A" />; })()}
      {/* Shuvo cheering from the boundary, the others in the distance */}
      <Person who="shuvo" x={1400} y={1180} s={0.62} f={{ yaw: 1 }} bag l={lt > 4.1 ? [-160, -1000] : undefined} r={lt > 4.1 ? [160, -1000] : undefined} />
      <Person who="rubel" x={260} y={1130} s={0.56} legs="sit" f={{ yaw: 0.9 }} />
    </Field>;
  } },
  { a: 103.5, b: 109.0, draw: (t) => {
    const lt = t - 103.5;
    const phone = win(lt, 0.8, 4.4, 0.6, 0.6);
    return <Field t={t} cam={{ x: 300, y: -80, z: 1.25 }}>
      <Steps />
      {[0, 1, 2].map((i) => { const p = (lt * 0.18 + i * 0.13) % 1; return <path key={i} d={`M${-200 + p * 2400} ${180 + i * 40 + Math.sin(p * 9) * 10} q12 -10 24 0 q12 -10 24 0`} fill="none" stroke="#2A2622" strokeWidth={4} />; })}
      <CU who="rubel" x={1000} y={500} s={1.9} t={t} f={{ yaw: lerp(0.5, 0.1, phone), smile: 0.1, sad: 0.4, gazeY: phone * 0.9, blink: blink(t, 3) }}
        r={phone > 0.1 ? [lerp(40, -20, phone), lerp(-470, -640, phone)] : undefined} hold={phone > 0.1 ? <g transform="translate(0 -20) scale(1.1) rotate(-10)"><PhoneProp /></g> : undefined} />
    </Field>;
  } },
  { a: 109.0, b: 113.6, draw: (t) => {
    const lt = t - 109.0, dusk = ease(lt / 4.4);
    const leave = (d: number) => clamp((lt - d) / 2.4);
    return <Field t={t} cam={{ x: 0, y: 60, z: 1.05 }} dusk={dusk} cricket={false}>
      <Steps />
      {[["mitu", 760, 0.4], ["nusrat", 900, 0.6], ["shuvo", 620, 0.2], ["arif", 520, 0.9]].map(([w, x, d], i) => {
        const k = leave(d as number);
        return k <= 0 ? <Person key={i} who={w as any} x={x as number} y={sitAt(1, 0.46)} s={0.46} legs="sit" f={{ yaw: 0.3 }} l={[-70, -330]} r={[70, -330]} bag={w === "shuvo"} />
          : <Person key={i} who={w as any} x={lerp(x as number, 2100, k)} y={TIER(0) + 10} s={0.42} legs="stride" phase={t * 8 + i} f={{ yaw: 0.6 }} bag={w === "shuvo"} />;
      })}
      {(() => { const k = clamp((lt - 3.2) / 1.6); return k <= 0 ? <Person who="rubel" x={1180} y={sitAt(2, 0.52)} s={0.52} legs="sit" f={{ yaw: 0.5, sad: 0.3 }} l={[-70, -330]} r={[70, -330]} />
        : <Person who="rubel" x={lerp(1180, 1700, k)} y={TIER(1) + 10} s={0.48} legs="stride" phase={t * 8} f={{ yaw: 0.6 }} />; })()}
    </Field>;
  } },

  // ---- verse 2: night
  { a: 113.6, b: 119.62, draw: (t) => (
    <Veranda t={t} cam={{ x: 120, y: 0, z: 1.1 }}>
      <g opacity={0.6}>{[["mitu", 60], ["arif", 210]].map(([w, x], i) => <Person key={i} who={w as any} x={x as number} y={800} s={0.5} legs="sit" f={{ yaw: 0.4, smile: 0.5, blink: blink(t, i + 2) }} dim={0.35} l={[-60, -330]} r={[60, -330]} />)}</g>
      <CU who="rubel" x={1060} y={470} s={1.55} t={t} f={sing(t, { yaw: 0.35, smile: 0.05, sad: 0.35, blink: blink(t, 3), light: 1 })} l={[-120, -340]} r={[120, -340]} />
    </Veranda>
  ) },
  { a: 119.62, b: 124.64, draw: (t) => (
    <Veranda t={t} cam={{ x: -200, y: -60, z: 1.25 }}>
      <CU who="rubel" x={820} y={470} s={2.9} t={t} f={sing(t, { yaw: 0.25, sad: 0.45, gazeY: -0.5, pitch: 0.3, blink: blink(t, 3), light: 1 })} />
    </Veranda>
  ) },
  { a: 124.64, b: 130.88, mem: true, draw: (t) => (
    <Veranda t={t} cam={{ x: 0, y: 0, z: 1.1 }}>
      {[["shuvo", 300, 0.4, 0.7], ["arif", 520, -0.3, 1], ["nusrat", 1500, -0.4, 0.8], ["mitu", 1700, -0.6, 0.9]].map(([w, x, y, l], i) => (
        <Person key={i} who={w as any} x={x as number} y={880} s={0.55} legs="sit" f={{ yaw: y as number, laugh: (l as number) * (0.5 + 0.5 * Math.sin(t * 1.3 + i)), blink: blink(t, i + 1) }} l={[-70, -330]} r={[70, -330]} bag={w === "shuvo"} />
      ))}
      {[380, 600, 1600].map((x, i) => <TeaGlass key={i} x={x} y={890} t={t} s={1.1} />)}
      <CU who="rubel" x={1000} y={480} s={1.7} t={t} f={{ yaw: kf(t, [[124.7, 0.5], [126.4, 0], [129.6, 0], [130.4, 0.5]]), smile: 1, blink: blink(t, 3), light: 1 }}
        r={t > 127.6 && t < 130 ? [260, -980] : undefined} />
    </Veranda>
  ) },
  { a: 130.88, b: 136.44, mem: true, draw: (t) => {
    const wake = kf(t, [[130.9, 1], [132.4, 0.8], [133.2, 0], [136.4, 0]]);
    return <Room t={t} cam={{ x: 0, y: 0, z: 1.05 }} warm={1}>
      <Person who="nusrat" x={520} y={1010} s={0.62} legs="sit" f={{ yaw: 0.3, smile: 0.5, blink: blink(t, 1) }} l={[-70, -330]} r={[70, -330]} />
      <Person who="mitu" x={700} y={1010} s={0.6} legs="sit" lean={-14} f={{ yaw: -0.3, blink: 1, smile: 0.4 }} l={[-70, -330]} r={[70, -330]} />
      <Person who="arif" x={1300} y={1010} s={0.62} legs="sit" f={{ yaw: -0.4, open: Math.abs(Math.sin(t * 7)) * 0.5, smile: 0.5, blink: blink(t, 4) }} l={[-170, -560 + Math.sin(t * 5) * 40]} r={[70, -330]} />
      <Person who="shuvo" x={1500} y={1010} s={0.6} legs="sit" lean={18} f={{ yaw: 0.6, blink: 1 }} r={[-30, -770]} hold={<rect x={-60} y={-60} width={120} height={84} rx={4} fill="#2F6F73" stroke={INK} strokeWidth={4} />} />
      <CU who="rubel" x={960} y={520} s={1.6} t={t} lean={-6} f={{ yaw: 0, blink: wake, smile: lerp(0.2, 0.9, ramp(t, 133.2, 0.8)), pitch: -0.3, gazeX: 0 }} />
    </Room>;
  } },
  { a: 136.44, b: 139.66, draw: (t) => {
    const make = ease((t - 136.9) / 1.0), enter = ease((t - 136.5) / 1.5), sit = ease((t - 138.1) / 0.8);
    return <Room t={t} cam={{ x: 0, y: 0, z: 1.05 }}>
      <Person who="nusrat" x={520} y={1010} s={0.62} legs="sit" f={{ yaw: 0.4, smile: 0.3, blink: blink(t, 1) }} l={[-30, -420]} r={[30, -420]} hold={<g transform="scale(1.3)"><TeaGlass x={0} y={10} t={t} /></g>} />
      <Person who="mitu" x={700} y={1010} s={0.6} legs="sit" f={{ yaw: 0.5, smile: 0.4, blink: blink(t, 2), gazeX: 1 }} l={[-70, -330]} r={[70, -330]} />
      <Person who="shuvo" x={lerp(1150, 1000, make)} y={1010} s={0.6} legs="sit" bag f={{ yaw: lerp(-0.2, 0.5, make), smile: 0.5, blink: blink(t, 5) }} l={[-60, -420]} r={[60, -420]}
        hold={<g><rect x={-110} y={-60} width={140} height={90} rx={6} fill="#2A2E34" stroke={INK} strokeWidth={4} /><rect x={-100} y={-52} width={120} height={70} fill="#8FB5D9" opacity={0.85} /></g>} />
      <Person who="arif" x={1420} y={1010} s={0.62} legs="sit" f={{ yaw: -0.3, smile: 0.3, gazeY: 0.8, blink: blink(t, 4) }} r={[-20, -560]} hold={<g transform="scale(1.4)"><PhoneProp /></g>} />
      <Person who="rubel" x={lerp(1900, 1200, enter)} y={lerp(1040, 1010, sit)} s={lerp(0.64, 0.6, sit)} legs={sit > 0.5 ? "sit" : enter < 1 ? "stride" : "stand"} phase={t * 8}
        f={{ yaw: -0.5, smile: lerp(0, 0.45, sit), blink: blink(t, 3) }} />
    </Room>;
  } },
  { a: 139.66, b: 143.74, mem: true, draw: (t) => {
    const sulk = 1 - ease((t - 141.6) / 0.6);
    return <BusWindow t={t}>
      <CU who="rubel" x={900} y={500} s={2.3} t={t} f={{ yaw: lerp(0.1, -0.55, sulk), sad: sulk * 0.6, smile: (1 - sulk) * 1, laugh: (1 - sulk) * 0.4, gazeX: sulk > 0.5 ? 1 : 0, blink: blink(t, 3) }}
        l={[-70, -430]} r={[60, -430]} hold={<g transform="translate(-40 -10) rotate(-6)"><rect x={-120} y={-30} width={200} height={130} rx={6} fill="#F4F1E8" stroke={INK} strokeWidth={5} />{[0, 1, 2].map((k) => <path key={k} d={`M-100 ${0 + k * 28} q40 -10 80 0 t80 0`} fill="none" stroke="#3B4A57" strokeWidth={4} />)}</g>} />
    </BusWindow>;
  } },
  { a: 143.74, b: 147.86, mem: true, draw: (t) => {
    const offer = ease((t - 144.2) / 0.9), take = win(t, 145.9, 147.9, 0.5, 0.3), gone = t > 146.9;
    return <Mist t={t}>
      <CU who="rubel" x={920} y={470} s={2.2} t={t} f={{ yaw: -0.05, smile: 0.9, blink: blink(t, 3) }} r={[lerp(80, 40, offer), lerp(-430, -620, offer)]}
        hold={!gone ? <g transform="scale(2)"><circle r={9} fill="#fff" stroke={INK} strokeWidth={2} /><rect x={-2} y={4} width={4} height={12} fill="#E0782C" /></g> : undefined} />
      {take > 0 && <CamHand x={lerp(2200, 1190, take)} y={lerp(1300, 780, take)} a={-150} s={2.2} pinch={gone ? 1 : 0} />}
      {gone && take > 0 && <g transform={`translate(${lerp(2200, 1190, take) - 120} ${lerp(1300, 780, take) - 70}) scale(2)`}><circle r={9} fill="#fff" stroke={INK} strokeWidth={2} /></g>}
    </Mist>;
  } },
  { a: 147.86, b: 152.62, draw: (t) => {
    const come = ease((t - 148.0) / 1.6), offer = ease((t - 149.8) / 0.6), took = t > 150.5;
    return <Veranda t={t} cam={{ x: 60, y: 0, z: 1.15 }}>
      <Person who="mitu" x={lerp(-200, 760, come)} y={1040} s={0.66} legs={come < 1 ? "stride" : "stand"} phase={t * 8} f={{ yaw: kf(t, [[148, 0.6], [150.8, 0.4], [151.6, 0.2]]), smile: 0.35, blink: blink(t, 2) }}
        l={[-60, -560]} r={took ? [60, -560] : [lerp(60, 230, offer), -560]} hold={!took ? <g transform="scale(1.6)"><TeaGlass x={0} y={10} t={t} /></g> : undefined} />
      <Person who="rubel" x={1080} y={1040} s={0.68} f={{ yaw: lerp(0.4, -0.4, ramp(t, 149.6, 0.5)), smile: lerp(0, 0.4, ramp(t, 150.6, 0.6)), sad: 0.3, blink: blink(t, 3) }}
        l={took ? [-60, -520] : [-90, -330]} r={[90, -330]} />
      {took && <g transform="translate(1010 650) scale(1.1)"><TeaGlass x={0} y={0} t={t} /></g>}
      <g transform="translate(700 660) scale(1.05)"><TeaGlass x={0} y={0} t={t} /></g>
    </Veranda>;
  } },
  { a: 152.62, b: 157.74, draw: (t) => (
    <Veranda t={t} cam={{ x: -260, y: -60, z: 1.3 }}>
      <CU who="rubel" x={960} y={460} s={3.1} t={t} f={sing(t, { yaw: -0.2, sad: 0.65, blink: blink(t, 3), light: -1 }, 1.1)} />
    </Veranda>
  ) },

  // ---- chorus 2: the photos on his phone
  { a: 157.74, b: 162.86, draw: (t) => (
    <Field t={t} cam={{ x: 200, y: 0, z: 1.6 }}>
      <rect x={-400} y={-400} width={2800} height={1800} fill="#2A2018" opacity={0.35} />
      <g transform={`translate(960 560) rotate(-3) scale(${lerp(0.86, 0.9, (t - 157.74) / 5)})`}>
        <PhoneScreen t={t} photos={[33.6, 133.5, 125.8, 142.6]} every={1.45} t0={157.74} />
      </g>
      <g transform="translate(1240 1010)"><circle r={60} fill="#C98652" stroke={INK} strokeWidth={5} /></g>
    </Field>
  ) },
  { a: 162.86, b: 165.64, draw: (t) => (
    <Field t={t} cam={{ x: 200, y: 0, z: 1.6 }}>
      <rect x={-400} y={-400} width={2800} height={1800} fill="#2A2018" opacity={0.35} />
      <g transform={`translate(960 560) rotate(-3) scale(${lerp(0.9, 1.2, ease((t - 162.86) / 2.8))})`}>
        <PhoneScreen t={t} photos={[45.6]} every={9} t0={162.86} zoom={1.7} />
      </g>
    </Field>
  ) },
  { a: 165.64, b: 168.2, draw: (t) => (
    <Field t={t} cam={{ x: -100, y: -60, z: 1.4 }}>
      <Steps />
      <CU who="rubel" x={960} y={470} s={2.8} t={t} f={{ yaw: kf(t, [[165.6, 0.05], [167.2, 0.05], [167.9, 0.5]]), smile: kf(t, [[165.6, 0.2], [166.8, 0.8]]), sad: 0.3, gazeY: kf(t, [[165.6, 0.8], [167, -0.2]]), blink: blink(t, 3) }} />
    </Field>
  ) },
  { a: 168.2, b: 173.78, draw: (t) => {
    const lt = t - 168.2;
    const call = win(lt, 0.3, 3.0, 0.3, 0.4);
    const come = (d: number) => ease((lt - d) / 3.0);
    return <Field t={t} cam={{ x: 0, y: 40, z: 1.08 }}>
      <Steps />
      <Person who="rubel" x={960} y={TIER(1) + 230} s={0.52} f={{ yaw: 0.2, smile: 0.9, open: call * Math.abs(Math.sin(t * 6)) * 0.6, blink: blink(t, 3) }}
        l={call > 0 ? [-200, -1000 + Math.sin(t * 9) * 60] : undefined} r={call > 0 ? [200, -1000 + Math.cos(t * 9) * 60] : undefined} />
      {[["arif", 1600, 640, 0.6], ["shuvo", 1820, 700, 1.0], ["mitu", 300, 700, 1.3], ["nusrat", 140, 680, 1.6]].map(([w, x0, y0, d], i) => {
        const k = come(d as number), tx = 960 + (i < 2 ? 1 : -1) * (140 + i * 40);
        return <Person key={i} who={w as any} x={lerp(x0 as number, tx, k)} y={lerp(y0 as number, TIER(1) + 230, k)} s={lerp(0.3, 0.5, k)} legs={k > 0 && k < 1 ? "stride" : "stand"} phase={t * 9 + i}
          f={{ yaw: (x0 as number) > 960 ? -0.6 : 0.6, smile: 0.7, blink: blink(t, i + 1) }} bag={w === "shuvo"} holdBall={w === "arif"} />;
      })}
    </Field>;
  } },
  { a: 173.78, b: 179.32, draw: (t) => {
    const x = (d: number) => lerp(-300 + d, 2100 + d, (t - 173.78) / 7.5);
    return <Street t={t} cam={{ x: 0, y: 30, z: 1.05 }} light="green" flow={0}>
      <rect x={-200} y={880} width={2400} height={200} fill="#8E8778" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-100 + i * 200} y={900} width={110} height={160} fill="#F1EDE4" opacity={0.85} />)}
      <Person who="nusrat" x={x(-260)} y={1060} s={0.58} legs="stride" phase={t * 8 + 1} f={{ yaw: 0.6, smile: 0.7, blink: blink(t, 1) }} />
      <Person who="shuvo" x={x(-120)} y={1062} s={0.6} legs="stride" phase={t * 8 + 2} bag f={{ yaw: 0.6, laugh: 0.5 }} />
      <Person who="rubel" x={x(40)} y={1064} s={0.6} legs="stride" phase={t * 8} f={{ yaw: 0.3, laugh: 0.9, blink: blink(t, 3) }} />
      <Person who="mitu" x={x(200)} y={1060} s={0.57} legs="stride" phase={t * 8 + 3} f={{ yaw: 0.2, laugh: 0.8 }} />
      <Person who="arif" x={x(380)} y={1062} s={0.58} legs="stride" phase={t * 8 + 1.5} f={{ yaw: -0.7, laugh: 1 }} l={[-160, -760 + Math.sin(t * 6) * 40]} r={[160, -780]} />
    </Street>;
  } },

  // ---- the final hook: the last photograph on the steps
  { a: 179.32, b: 184.72, draw: (t) => {
    const lt = t - 179.32, set = ease((lt - 2.2) / 1.2);
    return <Field t={t} cam={{ x: 40, y: 120, z: 1.3 }}>
      <Steps />
      {sitP(FINAL.arif, { yaw: 0.2, smile: 0.6, blink: blink(t, 4) })}
      {sitP(FINAL.nusrat, { yaw: -0.3, smile: 0.6, blink: blink(t, 1) }, { r: [lerp(70, 60, win(lt, 1, 2.6)), lerp(-330, -840, win(lt, 1, 2.6, 0.3, 0.4))] })}
      {sitP(FINAL.shuvo, { yaw: 0.3, smile: 0.6, blink: blink(t, 5) })}
      {sitP(FINAL.mitu, { yaw: -0.2, smile: 0.7, blink: blink(t, 2) })}
      {/* Rubel kneels in front, props the phone on a bag and sets the timer himself */}
      <rect x={760} y={1040} width={200} height={120} rx={22} fill="#2E3F5C" stroke={INK} strokeWidth={5} />
      <g transform={`translate(${lerp(1000, 860, set)} ${lerp(1180, 1000, set)}) rotate(${lerp(20, 4, set)}) scale(1.4)`}><PhoneProp ring={clamp((lt - 3.6) / 12)} /></g>
      <Person who="rubel" x={1040} y={1330} s={0.68} legs="hidden" f={{ yaw: 1 }} l={[-200, -620]} r={[-120, -560]} />
    </Field>;
  } },
  { a: 184.72, b: 190.08, draw: (t) => {
    const lt = t - 184.72;
    const run = ease(lt / 1.7), make = ease((lt - 0.7) / 0.8), sit = ease((lt - 1.7) / 0.6);
    return <Field t={t} cam={{ x: -60, y: 200, z: 1.72 }}>
      <Steps />
      {sitP(FINAL.arif, { yaw: 0.2, smile: 0.7, blink: blink(t, 4) })}
      {sitP(FINAL.nusrat, { yaw: lerp(-0.4, 0, ramp(lt, 2.2, 0.5)), smile: 0.7, blink: blink(t, 1) }, { r: lt > 3.2 && lt < 4.4 ? [60, -840] : [70, -330] })}
      {sitP({ ...FINAL.shuvo, x: lerp(FINAL.rubel.x - 40, FINAL.shuvo.x, make) }, { yaw: lerp(0.5, 0.1, ramp(lt, 2.0, 0.5)), smile: 0.7, blink: blink(t, 5) }, { lean: make > 0 && make < 1 ? -10 : 0 })}
      {sitP(FINAL.mitu, { yaw: -0.4, smile: 0.8, blink: blink(t, 2) })}
      {sit < 0.02 ? (
        <Person who="rubel" x={lerp(1060, FINAL.rubel.x, run)} y={lerp(1500, sitAt(2, 0.52) + 10, run)} s={lerp(1.0, 0.54, run)} legs="walk" phase={t * 12} f={{ yaw: 1 }} />
      ) : sitP(FINAL.rubel, { yaw: lerp(0.9, 0.1, sit), smile: 0.9, blink: blink(t, 3) })}
    </Field>;
  } },
  { a: 190.08, b: 195.64, draw: (t) => {
    const tilt = kf(t, [[193.4, 0], [194.1, -16]]), reach = win(t, 192.7, 195.0, 0.6, 0.6), laugh = ramp(t, 194.5, 0.3);
    return <Field t={t} cam={{ x: 80, y: 20, z: 1.5 }}>
      <Steps />
      <CU who="rubel" x={800} y={480} s={2.2} t={t} f={{ yaw: kf(t, [[190.1, 0.05], [194.1, 0.05], [194.5, 0.55]]), smile: 0.6, laugh, cap: tilt, pitch: laugh * 0.4, blink: t > 194 ? 0 : blink(t, 3) }}
        lean={laugh * Math.sin(t * 7) * 3} />
      <CU who="mitu" x={1240} y={520} s={1.9} t={t} f={{ yaw: -0.5, smile: kf(t, [[190.1, 0.6], [192.2, 0.95]]), gazeX: -1, gazeY: -0.3, laugh: laugh * 0.5, blink: blink(t, 2) }}
        lean={-10 * reach} l={[lerp(-120, -72, reach), lerp(-430, -993, reach)]} />
    </Field>;
  } },
  { a: 195.64, b: 199.38, draw: (t) => FinalPOV(t) },
  { a: 199.38, b: 230, draw: (t) => {
    const lt = t - 199.38;
    const push = 1 + 0.08 * easeOut(lt / 24);
    return <g>
      <g transform={`translate(960 540) scale(${push}) translate(-960 -540)`}>{FinalPOV(t, true)}</g>
      <rect width={1920} height={1080} fill="#FFF4DE" opacity={0.1} />
      <rect width={1920} height={1080} fill="#fff" opacity={clamp(1 - lt / 0.35)} />
      {/* the print's white border settles in */}
      <rect x={0} y={0} width={1920} height={1080} fill="none" stroke="#F6F1E6" strokeWidth={lerp(0, 70, ease((lt - 3) / 3))} />
    </g>;
  } },
];

export { rand, CAM0 };
