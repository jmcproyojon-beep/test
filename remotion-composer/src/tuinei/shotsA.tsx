import React from "react";
import { blink, clamp, ease, easeOut, kf, lerp, noise, ramp, win } from "./lib";
import { CamHand, Face, Person, INK } from "./chars";
import { Canteen, Corridor, PersonAt, Stairs, STAIR_VP, Street, Rickshaw, TeaGlass, proj, stepAt, CAM0 } from "./envs";
import { mouth } from "./lips";

// Shots 0:00 - 1:32: the canteen photo, the corridor with memories, the staircase match cut, chorus 1.
// t is the song's clock (seconds). mem = old footage (warm, closer lens, handheld).

export type Shot = { a: number; b: number; mem?: boolean; settle?: [number, number]; draw: (t: number) => React.ReactNode };
export const sing = (t: number, extra: Face = {}, gain = 1): Face => ({ ...mouth(t, gain), ...extra });

/** close framing: head centre at (x, y), scale s (Rubel's head is ~170 units tall at s=1) */
export const CU: React.FC<{ who: any; x: number; y: number; s: number; t: number; f: Face; walk?: boolean; l?: [number, number]; r?: [number, number]; lean?: number; bodyYaw?: number; hold?: React.ReactNode }> = (p) => {
  const bob = p.walk ? Math.abs(Math.sin(p.t * 6.4)) * -8 : Math.sin(p.t * 1.3) * 2;
  return <Person who={p.who} x={p.x} y={p.y + 830 * p.s + bob * p.s} s={p.s} f={p.f} legs="hidden" lean={p.lean ?? (p.walk ? Math.sin(p.t * 6.4) * 1.2 : 0)} l={p.l} r={p.r} bodyYaw={p.bodyYaw} hold={p.hold} />;
};

// ------------------------------------------------------------ canteen seating (same layout every visit)
const SY = 1010, SS = 0.72;
const SEAT = { nusrat: 420, mitu: 660, rubel: 900, arif: 1160, shuvo: 1400 };
const onTable = (dx = 0): { l: [number, number]; r: [number, number] } => ({ l: [-42 + dx, -300], r: [42 + dx, -300] });

const PhoneProp: React.FC<{ ring?: number }> = ({ ring = 0 }) => (
  <g>
    <rect x={-22} y={-40} width={44} height={80} rx={8} fill="#1D2126" stroke={INK} strokeWidth={3} />
    <rect x={-18} y={-34} width={36} height={66} rx={5} fill="#3B4A57" />
    {ring > 0 && <circle cx={0} cy={0} r={11} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray={`${ring * 69} 69`} transform="rotate(-90)" />}
  </g>
);

const Intro = (t: number, opts: { freeze?: boolean } = {}) => {
  // 0 - 9.75: setting up the photo. Nusrat at the window, Shuvo late with tea.
  const nusRun = ease((t - 5.7) / 1.6);
  const nusX = lerp(330, SEAT.nusrat, nusRun);
  const nusSit = t > 7.2;
  const shuvoX = lerp(2150, SEAT.shuvo + 30, easeOut((t - 5.8) / 2.6));
  const slide = t > 7.6;
  const flash = t >= 8.35;
  const l = t;
  return (
    <>
      {/* Nusrat: at the window, then running back to the bench */}
      {!nusSit ? (
        <Person who="nusrat" x={nusX} y={1030} s={0.74} legs={nusRun > 0 && nusRun < 1 ? "stride" : "stand"} phase={t * 11}
          f={{ yaw: nusRun > 0 ? 0.6 : -0.7, smile: 0.5, blink: blink(t, 1) }} bodyYaw={nusRun > 0 ? 0.5 : -0.6}
          l={nusRun > 0 ? undefined : [-150, -760]} r={nusRun > 0 ? undefined : [-90, -720]} />
      ) : (
        <Person who="nusrat" x={SEAT.nusrat} y={SY + lerp(-30, 0, ease((t - 7.2) / 0.5))} s={SS} legs="sit" f={{ yaw: 0.1, smile: 0.7, blink: blink(t, 1) }} lean={lerp(-10, 0, ease((t - 7.2) / 0.8))} />
      )}
      <Person who="mitu" x={SEAT.mitu} y={SY} s={SS} legs="sit" f={{ yaw: l < 5.6 ? 0.5 : 0.05, smile: 0.6, blink: blink(t, 2), open: l < 5.4 ? Math.max(0, Math.sin(t * 9)) * 0.35 : 0 }} {...onTable(-10)} />
      <Person who="rubel" x={SEAT.rubel} y={SY} s={SS} legs="sit"
        f={{ yaw: l < 5.6 ? -0.45 : l < 7.6 ? 0.55 : 0.6, smile: 0.7, laugh: ramp(t, 8.2, 0.3) * 0.6, blink: blink(t, 3), gazeX: l > 6 ? 1 : 0 }}
        l={[-42, -300]} r={l > 6 && l < 8.2 ? [190, -560 + Math.sin(t * 10) * 30] : [42, -300]} />
      <Person who="arif" x={SEAT.arif} y={SY} s={SS} legs="sit" f={{ yaw: -0.2, smile: 0.4, blink: blink(t, 4) }}
        l={[-42, -300]} r={l > 7.4 && l < 9 ? [10, -600] : [42, -300]} hold={l > 7.4 && l < 9 ? <g transform="translate(0 30) scale(1.4)"><TeaGlass x={0} y={0} t={t} steam={false} /></g> : undefined} />
      {/* Shuvo, late, sliding onto the end of the bench */}
      {t > 5.8 && (
        <Person who="shuvo" x={shuvoX} y={slide ? SY : 1030} s={slide ? SS : 0.74} legs={slide ? "sit" : "stride"} phase={t * 10} bag
          f={{ yaw: -0.5, smile: 0.5, brow: 0.6, blink: blink(t, 5) }} lean={slide ? -14 : 6} bodyYaw={-0.5}
          r={[60, slide ? -560 : -720]} hold={<g transform="scale(1.3)"><TeaGlass x={0} y={0} t={t} steam={false} /></g>} />
      )}
      {flash && !opts.freeze && null}
    </>
  );
};

const WindowPhone = (t: number) => {
  // close on the window sill: Nusrat props the phone against the grill and starts the timer
  const set = ease((t - 3.1) / 0.9);
  const tap = win(t, 4.25, 4.6, 0.08, 0.12);
  const away = ease((t - 4.8) / 0.6);
  const ring = clamp((t - 4.4) / 4.0);
  return (
    <g>
      <rect width={1920} height={1080} fill="#F4EAD0" />
      {[[300, 520, 260], [760, 420, 300], [1300, 560, 280], [1700, 380, 240]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t * 0.6 + i) * 6} cy={y} r={r} fill={i % 2 ? "#89AE76" : "#A3C28A"} />)}
      <g stroke="#2F4238" strokeWidth={26}>{Array.from({ length: 7 }).map((_, i) => <line key={i} x1={60 + i * 300} y1={0} x2={60 + i * 300} y2={1080} />)}<line x1={0} y1={330} x2={1920} y2={330} /></g>
      <rect x={0} y={760} width={1920} height={320} fill="#C9BDA2" stroke={INK} strokeWidth={6} />
      <rect x={0} y={760} width={1920} height={24} fill="#B3A688" />
      <g transform={`translate(${lerp(1100, 960, set)} ${lerp(980, 640, set)}) rotate(${lerp(-12, -4, set)}) scale(4.4)`}><PhoneProp ring={ring} /></g>
      {/* her hands (mustard sleeves) */}
      <g transform={`translate(${lerp(0, 260, away)} ${lerp(0, 380, away)})`} opacity={1 - ramp(t, 5.3, 0.3)}>
        <path d="M1500 1080 L1210 760" stroke="#C99B45" strokeWidth={120} strokeLinecap="round" />
        <circle cx={1190} cy={740 - tap * 20} r={52} fill="#C99069" stroke={INK} strokeWidth={5} />
        <path d={`M1150 ${700 - tap * 20} L${1070 + tap * 10} ${660 - tap * 26}`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <path d={`M1150 ${700 - tap * 20} L${1070 + tap * 10} ${660 - tap * 26}`} stroke="#C99069" strokeWidth={26} strokeLinecap="round" />
        <path d="M420 1080 L700 780" stroke="#C99B45" strokeWidth={120} strokeLinecap="round" />
        <circle cx={740} cy={760} r={52} fill="#C99069" stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};

/** POV of the propped phone: the group at the table, frozen at the shutter */
const PhotoPOV = (t: number) => (
  <g>
    <Canteen t={8.35} cam={{ x: 40, y: -20, z: 1.12 }}>
      {Intro(8.35)}
      {/* Shuvo mid-slide: a motion ghost */}
      <g opacity={0.35} transform="translate(60 0)"><Person who="shuvo" x={SEAT.shuvo + 30} y={SY} s={SS} legs="sit" bag f={{ yaw: -0.5 }} lean={-14} /></g>
    </Canteen>
    <rect width={1920} height={1080} fill="#FFF8E8" opacity={0.12} />
    <rect width={1920} height={1080} fill="#fff" opacity={clamp(1 - (t - 8.35) / 0.28)} />
  </g>
);

// ------------------------------------------------------------ corridor
const KVP = { x: 1020, y: 430 };
const walkers = (t: number, base: number, singT: number | null) => {
  const ph = t * 6.4;
  return (
    <>
      <PersonAt X={-120} Z={base + 260} who="nusrat" f={{ yaw: 0.2, smile: 0.5, blink: blink(t, 1) }} legs="walk" phase={ph + 1} vp={KVP} />
      <PersonAt X={130} Z={base + 210} who="shuvo" bag f={{ yaw: -0.3, smile: 0.6, blink: blink(t, 5) }} legs="walk" phase={ph + 2} vp={KVP} />
      <PersonAt X={-70} Z={base + 120} who="mitu" f={{ yaw: 0.4, smile: 0.8, laugh: win(t, 23.5, 25.6, 0.2, 0.6) * 0.8, blink: blink(t, 2) }} legs="walk" phase={ph + 3} vp={KVP} />
      <PersonAt X={60} Z={base + 90} who="rubel" f={singT !== null ? sing(singT, { yaw: -0.1, smile: 0.35, blink: blink(t, 3) }) : { yaw: -0.2, smile: 0.6 }} legs="walk" phase={ph} vp={KVP} />
      {/* Arif walks backwards in front, finishing a joke */}
      <PersonAt X={-10} Z={base - 40} who="arif" f={{ yaw: 1 }} legs="walk" phase={ph + 1.5} vp={KVP}
        l={[-150 - Math.sin(t * 5) * 40, -760]} r={[160 + Math.sin(t * 4) * 50, -800]} />
    </>
  );
};

const Leaves: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => (
  <g opacity={0.09 * k}>{Array.from({ length: 26 }).map((_, i) => {
    const x = ((i * 173 + t * 40) % 2200) - 140, y = 300 + ((i * 97) % 780);
    return <ellipse key={i} cx={x + noise(t * 0.4, i) * 30} cy={y} rx={60 + (i % 4) * 20} ry={30 + (i % 3) * 14} fill="#2E3A1E" />;
  })}</g>
);

// ------------------------------------------------------------ staircase (memory then present: same framing)
const STAIR_POSE = (t: number, mem: boolean) => {
  // memory: two steps down (63.9-65.9), turn (66.0-66.9), reach toward the lens (67.0-68.0) and hold.
  // present (69.86): the same pose; the smile fades, the hand lowers (73.0-73.8), he turns and goes down (74.0+).
  const down = mem ? clamp((t - 63.9) / 2.0) : 1;
  const step = mem ? lerp(0, 2, ease(down)) : t > 74.4 ? 2 + (t - 74.4) * 2.4 : 2;
  const turn = mem ? ease((t - 66.0) / 0.9) : t > 74.0 ? 1 - ease((t - 74.0) / 0.5) : 1;
  const reach = mem ? ease((t - 67.0) / 1.0) : 1 - ease((t - 73.0) / 0.8);
  const s = stepAt(step);
  const smile = mem ? 0.85 : kf(t, [[69.86, 0.85], [70.6, 0.85], [72.2, 0.1]]);
  return { s, turn, reach, smile, walking: mem ? down > 0 && down < 1 : t > 74.4 };
};
const StairShot = (t: number, mem: boolean) => {
  const p = STAIR_POSE(t, mem);
  const face: Face = { yaw: lerp(1, -0.12, p.turn), smile: p.smile, sad: mem ? 0 : ramp(t, 70.8, 1.2) * 0.55, blink: blink(t, 3), gazeY: -0.7, pitch: 0.5 * p.turn };
  const shuvoTurn = ease((t - 70.6) / 0.7);
  return (
    <Stairs t={t} below={
      <g>{[0, 1, 2].map((i) => { const x = ((t * (60 + i * 25) + i * 500) % 1300) + 300; const [, y, k] = proj(0, 524, 820 + i * 40, STAIR_VP); return <Person key={i} who="extra" x={x} y={y} s={(170 / 925) * k} legs="stride" phase={t * 6 + i} f={{ yaw: 0.6 }} dim={0.15} />; })}</g>
    }>
      {mem ? (
        <>
          {[["mitu", -60, 7], ["arif", 70, 8], ["nusrat", -20, 10], ["shuvo", 50, 11]].map(([w, X, k], i) => {
            const st = stepAt((k as number) + (t - 63.9) * 1.2);
            return <PersonAt key={i} who={w as any} X={X as number} Z={st.Z} floorY={st.Y} vp={STAIR_VP} f={{ yaw: 1 }} legs="walk" phase={t * 6 + i} bag={w === "shuvo"} />;
          })}
        </>
      ) : (
        (() => { const st = stepAt(9); return <PersonAt who="shuvo" X={-40} Z={st.Z} floorY={st.Y} vp={STAIR_VP} bag f={{ yaw: lerp(1, -0.05, shuvoTurn), smile: ramp(t, 72.4, 0.6) * 0.5, blink: blink(t, 5), gazeY: -0.6 }} legs={t > 74.8 ? "walk" : "stand"} phase={t * 6} />; })()
      )}
      <PersonAt who="rubel" X={40} Z={p.s.Z} floorY={p.s.Y} vp={STAIR_VP} f={face} legs={p.walking ? "walk" : "stand"} phase={t * 6}
        l={[lerp(-60, -250, p.reach), lerp(-440, -790, p.reach)]} palm={p.reach > 0.4 ? "l" : undefined} palmS={lerp(1, 1.5, p.reach)} bodyYaw={lerp(0.9, -0.1, p.turn)} />
    </Stairs>
  );
};

// ------------------------------------------------------------ the memory of the cap
const CapMemory = (t: number) => {
  const reach = win(t, 43.9, 45.5, 0.45, 0.4);
  const tilt = kf(t, [[44.3, 0], [44.85, -17], [46.9, -17], [47.6, -7]]);
  const laugh = win(t, 44.9, 47.0, 0.25, 0.6);
  return (
    <g>
      <Corridor t={t} travel={900} vp={{ x: 1500, y: 470 }} />
      <rect width={1920} height={1080} fill="#F3E2C0" opacity={0.25} />
      <CU who="rubel" x={900} y={470} s={2.7} t={t} f={{ yaw: -0.05, smile: 0.9, laugh, cap: tilt, blink: blink(t, 3), gazeX: 0, gazeY: 0 }}
        r={t > 46.7 && t < 47.8 ? [40, -1000] : undefined} />
      {reach > 0 && <CamHand x={lerp(2300, 1330, reach)} y={lerp(900, 300, reach)} a={-160} s={2.4} pinch={ramp(t, 44.4, 0.3)} />}
    </g>
  );
};

export const SHOTS_A: Shot[] = [
  // ---- the canteen photo (instrumental intro + chant)
  { a: 0, b: 2.89, draw: (t) => <Canteen t={t} cam={{ x: -20, y: 10, z: lerp(1.0, 1.05, t / 2.89) }}>{Intro(t)}</Canteen> },
  { a: 2.89, b: 5.62, draw: (t) => WindowPhone(t) },
  { a: 5.62, b: 8.35, draw: (t) => <Canteen t={t} cam={{ x: 10, y: 0, z: 1.02 }} fg={<g transform="translate(330 560) rotate(-4) scale(1.6)"><PhoneProp ring={clamp((t - 4.4) / 4.0)} /></g>}>{Intro(t)}</Canteen> },
  { a: 8.35, b: 9.75, draw: (t) => PhotoPOV(t) },
  { a: 9.75, b: 13.8, draw: (t) => {
    const lt = t - 9.75, shake = Math.sin(t * 22) * 6 * (1 - ramp(lt, 2.4, 1.4));
    return <Canteen t={t} cam={{ x: -110, y: -36, z: 2.15 }}>
      <Person who="mitu" x={SEAT.mitu} y={SY} s={SS} legs="sit" f={{ yaw: 0.45, laugh: 0.9, blink: blink(t, 2) }} lean={-6} l={[-60, -300]} r={[120, -470]} />
      <Person who="rubel" x={SEAT.rubel} y={SY + shake * 0.4} s={SS} legs="sit" lean={kf(lt, [[0, -4], [0.8, 8], [2.2, -6], [4, 0]])}
        f={{ yaw: kf(lt, [[0, 0.5], [1.2, 0.1], [3, -0.2]]), laugh: 1 - ramp(lt, 3.2, 0.8) * 0.4, pitch: 0.6 + shake * 0.05 }} l={[-70, -290]} r={[30, -820]} />
      <Person who="arif" x={SEAT.arif} y={SY} s={SS} legs="sit" f={{ yaw: -0.4, laugh: 0.7 * win(lt, 0.2, 3.0, 0.3, 0.6), blink: blink(t, 4) }} {...onTable()} />
    </Canteen>;
  } },
  { a: 13.8, b: 16.53, draw: (t) => {
    const lt = t - 13.8;
    return <Canteen t={t} cam={{ x: 260, y: -20, z: 1.6 }}>
      <Person who="mitu" x={SEAT.mitu} y={SY} s={SS} legs="sit" f={{ yaw: 0.5, laugh: 1 - ramp(lt, 2.1, 0.5), blink: blink(t, 2) }} lean={-5} {...onTable()} />
      <Person who="rubel" x={SEAT.rubel} y={SY} s={SS} legs="sit" f={{ yaw: 0.55, smile: 0.9, laugh: 0.3 * (1 - ramp(lt, 1.2, 0.6)), blink: blink(t, 3) }} {...onTable(20)} lean={6} />
      <Person who="arif" x={SEAT.arif} y={SY} s={SS} legs="sit" lean={10} f={{ yaw: 0.6, smile: 0.6, blink: blink(t, 4), gazeY: 0.6 }} {...onTable(30)} />
      <Person who="shuvo" x={SEAT.shuvo} y={SY} s={SS} legs="sit" bag f={{ yaw: -0.1, sad: 0.6, smile: 0.3, blink: blink(t, 5), gazeY: 0.9 }}
        l={[-40, -480]} r={[40, -480]} hold={<g transform="translate(-40 -20) rotate(-8) scale(1.5)"><PhoneProp /></g>} />
      <Person who="nusrat" x={1620} y={SY} s={SS} legs="sit" lean={-8} f={{ yaw: -0.6, smile: 0.6, blink: blink(t, 1), gazeY: 0.6 }} {...onTable(-30)} />
    </Canteen>;
  } },
  { a: 16.53, b: 19.3, draw: (t) => {
    const lt = t - 16.53;
    return <Canteen t={t} cam={{ x: -60, y: -40, z: lerp(2.2, 2.4, lt / 2.8) }}>
      <Person who="rubel" x={SEAT.rubel} y={SY} s={SS} legs="sit" {...onTable()}
        f={{ yaw: kf(t, [[16.5, 0.2], [18.0, 0.1], [18.4, 0.75]]), smile: kf(t, [[16.5, 0.9], [18.3, 0.7], [19.2, 0.35]]), laugh: 0.4 * (1 - ramp(lt, 0.2, 1.0)), blink: blink(t, 3), gazeX: t > 18.3 ? 1 : 0 }} />
    </Canteen>;
  } },
  { a: 19.3, b: 21.66, draw: (t) => (
    <Canteen t={t} cam={{ x: lerp(640, 690, (t - 19.3) / 2.4), y: 250, z: 2.9 }} sixth />
  ) },

  // ---- verse 1: the corridor (present, steady) with memories
  { a: 21.66, b: 27.72, draw: (t) => <Corridor t={t} travel={t * 140} vp={KVP}>{walkers(t, 380, t)}</Corridor> },
  { a: 27.72, b: 32.6, draw: (t) => (
    <Corridor t={t} travel={t * 140} vp={{ x: 1350, y: 420 }}>
      <PersonAt who="mitu" X={-160} Z={330} f={{ yaw: 0.5, smile: 0.6, blink: blink(t, 2) }} legs="walk" phase={t * 6.4 + 3} vp={{ x: 1350, y: 420 }} />
      <CU who="rubel" x={820} y={470} s={3.1} t={t} f={sing(t, { yaw: -0.15, smile: 0.25, blink: blink(t, 3) })} walk />
    </Corridor>
  ) },
  { a: 32.6, b: 34.56, mem: true, draw: (t) => (
    <Corridor t={t} travel={600} vp={{ x: 980, y: 420 }}>
      <PersonAt who="shuvo" X={-150} Z={330} bag f={{ yaw: 0.6, laugh: 0.8, blink: blink(t, 5) }} vp={{ x: 980, y: 420 }} />
      <PersonAt who="nusrat" X={150} Z={340} f={{ yaw: -0.6, laugh: 0.7 }} vp={{ x: 980, y: 420 }} />
      <PersonAt who="arif" X={-40} Z={300} f={{ yaw: 0.7, laugh: 1 }} vp={{ x: 980, y: 420 }} l={[-120, -700]} r={[150, -760 + Math.sin(t * 9) * 30]} />
      <PersonAt who="mitu" X={-110} Z={240} f={{ yaw: 0.6, laugh: 0.9, blink: blink(t, 2) }} vp={{ x: 980, y: 420 }} />
      <PersonAt who="rubel" X={70} Z={205} f={{ yaw: 0, smile: 1, gazeX: 0, blink: blink(t, 3) }} vp={{ x: 980, y: 420 }} />
    </Corridor>
  ) },
  { a: 34.56, b: 38.66, draw: (t) => {
    const give = ease((t - 35.4) / 1.0);
    const vp = { x: 900, y: 430 };
    return <Corridor t={t} travel={t * 120} vp={vp}>
      <PersonAt who="mitu" X={-90} Z={240} f={{ yaw: 0.6, smile: 0.6, blink: blink(t, 2), open: win(t, 34.8, 35.6, 0.1, 0.1) * Math.abs(Math.sin(t * 10)) * 0.4 }} legs="walk" phase={t * 6} vp={vp}
        r={give < 1 ? [lerp(80, 220, give), -560] : undefined} hold={give < 1 ? <rect x={-36} y={-50} width={72} height={92} rx={4} fill="#2F6F73" stroke={INK} strokeWidth={4} /> : undefined} />
      <PersonAt who="shuvo" X={90} Z={250} bag f={{ yaw: -0.5, smile: 0.4, gazeY: t > 36.6 ? 0.8 : 0, blink: blink(t, 5) }} legs="walk" phase={t * 6 + 2} vp={vp}
        l={give >= 1 ? [-60, -600] : [-150, -560]} r={t > 37.2 && t < 37.7 ? [10, -830] : give >= 1 ? [60, -600] : undefined}
        hold={give >= 1 && !(t > 37.2 && t < 37.7) ? <g><rect x={-90} y={-50} width={72} height={92} rx={4} fill="#2F6F73" stroke={INK} strokeWidth={4} /><rect x={-14} y={-50} width={72} height={92} rx={4} fill="#F4F1E8" stroke={INK} strokeWidth={4} /></g> : undefined} />
    </Corridor>;
  } },
  { a: 38.66, b: 42.92, draw: (t) => {
    const vp = { x: 960, y: 420 };
    const pull = ease((t - 40.0) / 0.5);
    const pass = clamp((t - 39.2) / 2.8);
    return <Corridor t={t} travel={t * 60} vp={vp}>
      {/* students carrying a rolled chart come through */}
      {[0, 1, 2].map((i) => <PersonAt key={i} who="extra" X={70 + i * 60} Z={lerp(1400, 120, pass) + i * 70} f={{ yaw: -0.2 }} legs="walk" phase={t * 8 + i} vp={vp}
        r={[120, -640]} hold={i === 1 ? <rect x={-200} y={-10} width={400} height={22} rx={10} fill="#F2E6CC" stroke={INK} strokeWidth={4} /> : undefined} />)}
      <PersonAt who="rubel" X={-150} Z={420} f={{ yaw: 0.4, smile: 0.7, laugh: ramp(t, 40.5, 0.3) * 0.6, blink: blink(t, 3) }} legs="walk" phase={t * 6} vp={vp} />
      <PersonAt who="mitu" X={-60} Z={440} f={{ yaw: 0.3, laugh: ramp(t, 40.4, 0.3) * 0.8 }} legs="walk" phase={t * 6 + 1} vp={vp} />
      <PersonAt who="nusrat" X={-110} Z={300} f={{ yaw: 0.5, brow: 0.6, smile: 0.4 }} legs="walk" phase={t * 6 + 2} vp={vp} r={[lerp(80, 240, win(t, 39.7, 41.2, 0.3, 0.4)), -640]} />
      <PersonAt who="arif" X={lerp(60, -50, pull)} Z={260} f={{ yaw: t < 40.2 ? 1 : 0.4, laugh: ramp(t, 40.5, 0.4), blink: blink(t, 4) }} legs="walk" phase={t * 6 + 1.5} vp={vp} lean={pull > 0 && pull < 1 ? -12 : 0}
        l={t < 40 ? [-150, -760] : undefined} r={t < 40 ? [160 + Math.sin(t * 4) * 50, -800] : undefined} />
    </Corridor>;
  } },
  { a: 42.92, b: 48.24, mem: true, draw: (t) => CapMemory(t) },
  { a: 48.24, b: 54.44, draw: (t) => {
    const vp = { x: 960, y: 440 };
    const glance = win(t, 50.6, 52.4, 0.4, 0.5);
    return <g><Corridor t={t} travel={-t * 110} vp={vp}>
      <PersonAt who="nusrat" X={-120} Z={560} f={{ yaw: 1 }} legs="walk" phase={t * 6 + 1} vp={vp} />
      <PersonAt who="shuvo" X={110} Z={600} bag f={{ yaw: 1 }} legs="walk" phase={t * 6 + 2} vp={vp} />
      <PersonAt who="arif" X={10} Z={640} f={{ yaw: 1 }} legs="walk" phase={t * 6 + 1.5} vp={vp} holdBall />
      <PersonAt who="rubel" X={50} Z={470} f={{ yaw: 1 }} legs="walk" phase={t * 6} vp={vp} />
      <PersonAt who="mitu" X={-70} Z={430} f={{ yaw: lerp(1, 0.35, glance), smile: glance * 0.6 }} legs="walk" phase={t * 6 + 3} vp={vp} />
    </Corridor><Leaves t={t} /></g>;
  } },
  { a: 54.44, b: 59.08, draw: (t) => (
    <g><Corridor t={t} travel={t * 100} vp={{ x: 620, y: 430 }}>
      <CU who="rubel" x={1080} y={480} s={3.2} t={t} f={sing(t, { yaw: 0.15, smile: 0.2, gazeX: kf(t, [[55.5, 0], [56.5, 1], [58.4, 1], [59, 0.3]]), blink: blink(t, 3) })} walk />
    </Corridor><Leaves t={t} k={0.6} /></g>
  ) },
  { a: 59.08, b: 63.88, mem: true, draw: (t) => (
    <Stairs t={t}>
      {[["mitu", -60, 3], ["arif", 70, 4], ["nusrat", -20, 6], ["shuvo", 50, 7]].map(([w, X, k], i) => {
        const st = stepAt((k as number) + (t - 59.1) * 1.4);
        return <PersonAt key={i} who={w as any} X={X as number} Z={st.Z} floorY={st.Y} vp={STAIR_VP} f={{ yaw: i % 2 ? 1 : 0.9 }} legs="walk" phase={t * 6 + i} bag={w === "shuvo"} />;
      })}
      {(() => { const st = stepAt(1 + (t - 59.1) * 0.3); return <PersonAt who="rubel" X={20} Z={st.Z} floorY={st.Y} vp={STAIR_VP} f={{ yaw: kf(t, [[59.1, 0.95], [60.4, 0.1], [62.4, 0.1], [63.2, 0.95]]), smile: 0.9, blink: blink(t, 3) }} legs="walk" phase={t * 5} />; })()}
    </Stairs>
  ) },
  { a: 63.88, b: 69.86, mem: true, settle: [68.4, 69.7], draw: (t) => StairShot(t, true) },
  // ---- chorus 1: on the sung "তুই", the present
  { a: 69.86, b: 75.44, draw: (t) => StairShot(t, false) },
  { a: 75.44, b: 80.78, draw: (t) => (
    <Canteen t={t} cam={{ x: -60, y: -48, z: 2.35 }} sixth={false}>
      <Person who="rubel" x={SEAT.rubel} y={SY} s={SS} legs="sit" f={sing(t, { yaw: -0.2, smile: 0.15, sad: 0.25, blink: blink(t, 3) })} {...onTable()} />
    </Canteen>
  ) },
  { a: 80.78, b: 86.24, draw: (t) => {
    const make = ease((t - 81.2) / 1.1);
    const sit = ease((t - 82.9) / 0.8);
    const tea = ease((t - 84.4) / 0.9);
    const rx = lerp(1560, SEAT.rubel + 120, ease((t - 80.9) / 1.6));
    return <Canteen t={t} cam={{ x: 120, y: -10, z: 1.35 }} sixth>
      <Person who="mitu" x={SEAT.mitu} y={SY} s={SS} legs="sit" f={{ yaw: 0.4, smile: 0.6, blink: blink(t, 2) }} {...onTable()} />
      <Person who="shuvo" x={lerp(SEAT.rubel + 100, SEAT.rubel - 70, make)} y={SY} s={SS} legs="sit" bag={make < 0.5}
        f={{ yaw: 0.5, smile: 0.6, blink: blink(t, 5) }} l={make > 0 && make < 1 ? [-200, -200] : [-70, -290]} r={t > 82.4 && t < 83.2 ? [200, -300] : [70, -290]} />
      {make > 0.4 && <g transform={`translate(${lerp(SEAT.rubel + 30, SEAT.rubel - 230, make)} 960)`}><rect x={-60} y={-110} width={120} height={120} rx={20} fill="#2E3F5C" stroke={INK} strokeWidth={5} /></g>}
      <Person who="arif" x={SEAT.arif + 60} y={SY} s={SS} legs="sit" f={{ yaw: -0.5, smile: 0.6, blink: blink(t, 4) }} l={[lerp(-70, -260, tea * (1 - ramp(t, 85.6, 0.4))), -290]} />
      <Person who="rubel" x={rx} y={lerp(1030, SY, sit)} s={lerp(0.74, SS, sit)} legs={sit > 0.5 ? "sit" : rx > SEAT.rubel + 125 ? "stride" : "stand"} phase={t * 9}
        f={{ yaw: lerp(-0.6, -0.2, sit), smile: lerp(0.2, 0.65, ramp(t, 83.6, 0.8)), blink: blink(t, 3) }} {...(sit > 0.5 ? onTable() : {})} />
      {tea > 0 && <TeaGlass x={lerp(SEAT.arif - 120, SEAT.rubel + 80, tea)} y={846} t={t} />}
    </Canteen>;
  } },
  { a: 86.24, b: 89.42, mem: true, draw: (t) => (
    <Street t={t} cam={{ x: 300, y: 40, z: 1.5 }} light="red">
      <g transform="translate(0 0)">
        <rect x={300} y={560} width={1400} height={80} fill="#2F6F73" stroke={INK} strokeWidth={6} />
        <PersonAt who="rubel" X={-30} Z={170} floorY={260} vp={{ x: 1100, y: 300 }} legs="sit"
          f={{ yaw: kf(t, [[86.3, 0.7], [87.2, 0.05]]), laugh: win(t, 87.0, 89.4, 0.3, 0.3), blink: blink(t, 3) }}
          l={[-120, -300]} r={t < 87.4 ? [260, -720] : [120, -320]} />
      </g>
    </Street>
  ) },
  { a: 89.42, b: 92.66, draw: (t) => (
    <Street t={t} cam={CAM0} light={t < 90.6 ? "red" : "green"} flow={t > 90.6 ? 1 : 0}>
      <g transform={`translate(${t > 90.8 ? (t - 90.8) * 120 : 0} 0)`}>
        <Rickshaw x={820} y={1000} s={0.9} t={t > 90.8 ? t : 0} />
        <Person who="arif" x={720} y={900} s={0.5} legs="sit" f={{ yaw: 1 }} />
        <Person who="rubel" x={920} y={900} s={0.5} legs="sit" f={{ yaw: 1 }} />
        <Person who="extra" x={830} y={1180} s={0.56} f={{ yaw: 1 }} legs={t > 90.8 ? "walk" : "stand"} phase={t * 5} />
      </g>
    </Street>
  ) },
];

export { SEAT, SY, SS, PhoneProp, onTable, KVP, Leaves };
