import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY } from "../signal/fonts";
import { Globe, CAPITALS } from "./globe";
import {
  W, H, PaperDefs, Cut, Paper, Hero, Strip, Capitol, Kremlin, PalaceGate, IndiaGate, NYSkyline, Assembly,
  Person, Crowd, Suit, Jet, Dove, Sun, House, Cloud, Candle, Flag, FLAGS, FlagCode,
} from "./paper";
import { C, D, L, S, clamp, lerp, smooth, easeOut, backOut, ramp, win, pulse, rand, beatPulse, downbeatPulse, onTwos } from "./lib";

// Every scene is keyed to lyric lines (L("text")), so it lands on the sung
// words. Times below are line starts/ends from data.json.

export type SP = { t: number; a: number; b: number };
const st = (has: string, n = 0, sec?: string) => L(has, n, sec)?.s ?? 0;
const en = (has: string, n = 0, sec?: string) => L(has, n, sec)?.e ?? 0;

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} style={{ position: "absolute" }}><PaperDefs />{children}</svg>
);

/** Slow documentary camera: scale/translate between a and b. */
const Cam: React.FC<{ t: number; a: number; b: number; z?: [number, number]; x?: [number, number]; y?: [number, number]; children: React.ReactNode }> =
  ({ t, a, b, z = [1, 1.06], x = [0, 0], y = [0, 0], children }) => {
    const k = smooth((t - a) / Math.max(0.1, b - a));
    return <AbsoluteFill style={{ transform: `translate(${lerp(x[0], x[1], k)}px, ${lerp(y[0], y[1], k)}px) scale(${lerp(z[0], z[1], k)})` }}>{children}</AbsoluteFill>;
  };

// ===================================================================== OPENING
export const Opening: React.FC<SP> = ({ t, a, b }) => {
  const title = ramp(t, a + 2.5, 1.5) * (1 - ramp(t, b - 2.2, 1.2));
  return (
    <AbsoluteFill>
      <Paper tex="night" />
      <Cam t={t} a={a} b={b} z={[1.0, 1.12]}>
        <Svg>
          {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 5) * H * 0.7} r={1.5 + rand(i + 9) * 2} fill="#F4ECD8" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))} />)}
          <Globe cx={960} cy={1060} r={520} lon={60 + onTwos(t) * 2} lat={-25} borders={0} night={1} />
        </Svg>
      </Cam>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: title, paddingBottom: 260 }}>
        <div style={{ fontFamily: "SigMono, monospace", fontSize: 30, letterSpacing: 14, color: "#E9DCC0" }}>RAPARRUBEL PRESENTS</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 150, color: "#FBF6EA", textShadow: "6px 8px 0 rgba(0,0,0,0.5)", marginTop: 10 }}>মানবতার ডাক</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 50, color: C.gold, marginTop: 4 }}>শেষ আলো জ্বলবেই</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ======================================================================= INTRO
// One world, so many borders (inked red); one sky, so many flags; a faceless
// hand over the globe; peace flies away while the hero looks up.
export const IntroWorld: React.FC<SP> = ({ t, a, b }) => {
  const bord = ramp(t, st("কতগুলো সীমানা"), 1.6);
  const sky = ramp(t, st("একটা আকাশ") - 0.3, 1.2);
  const flags = clamp((t - st("কতগুলো পতাকা")) / 2.2);
  const hand = ramp(t, st("মানুষের হাতে"), 1.4);
  const peace = t >= st("তবু শান্তি") - 0.2;
  return (
    <AbsoluteFill>
      <Paper tex="kraft" tint={peace ? "#2A2A44" : undefined} tintO={0.45 * ramp(t, st("তবু শান্তি"), 1)} />
      <Cam t={t} a={a} b={b} z={[1, 1.04]} y={[0, 0]}>
        <Svg>
          <g transform={`translate(0 ${sky * 280})`}>
            <Globe cx={960} cy={560} r={400} lon={70 + onTwos(t) * 1.5} lat={-20} borders={bord} pins={[]} />
          </g>
          {/* the sky's flags */}
          {FLAGS.slice(0, 14).map((c, i) => {
            const k = clamp(flags * 14 - i);
            if (k <= 0) return null;
            const x = 120 + i * 130, y = 120 + (i % 3) * 40 - sky * 0;
            return <Cut key={c} t={t} id={i + 10} x={x} y={y + (1 - backOut(k)) * 200} s={0.55}><Flag code={c} x={0} y={0} w={140} wave={1} t={t} /></Cut>;
          })}
          {/* the hand of power */}
          {hand > 0 && (
            <g transform={`translate(${lerp(1600, 1220, hand)} ${lerp(-700, 60, hand)}) rotate(-22) scale(1.7)`} opacity={0.94}>
              <path d="M-90 -400 L-60 60 L60 60 L90 -400 Z" fill="#1E1E26" stroke={C.ink} strokeWidth={5} />
              <path d="M-70 40 Q-120 140 -80 200 L-40 180 L-40 260 L0 270 L10 180 L40 260 L70 240 L60 150 L100 190 L120 160 L70 60 Z" fill="#5A5650" stroke={C.ink} strokeWidth={5} />
              {[0, 1, 2, 3].map((i) => <line key={i} x1={-50 + i * 40} y1={270} x2={-50 + i * 40 + rand(i) * 20} y2={520} stroke="#F4ECD8" strokeWidth={2} opacity={0.7} />)}
            </g>
          )}
          {peace && <Cut t={t} id={3} x={lerp(700, 1500, clamp((t - st("তবু শান্তি")) / 4))} y={lerp(420, 150, clamp((t - st("তবু শান্তি")) / 4))} s={lerp(0.9, 0.3, clamp((t - st("তবু শান্তি")) / 4))}>
            <Dove x={0} y={0} flap={Math.sin(t * 9)} /></Cut>}
        </Svg>
      </Cam>
      {peace && <Hero t={t} img="head_3q" x={360} y={1080} h={lerp(380, 480, ramp(t, st("তবু শান্তি"), 3))} o={ramp(t, st("তবু শান্তি") - 0.2, 0.6)} />}
    </AbsoluteFill>
  );
};

// ===================================================================== PALACE
// Behind palace doors faceless suits redraw the map; decisions fly from the
// sky as jets; the people on the ground below are afraid.
export const Palace: React.FC<SP> = ({ t, a, b }) => {
  const sky = t >= st("সিদ্ধান্ত আসে") - 0.2;
  const draw = clamp((t - st("নতুন মানচিত্র")) / 3);
  if (!sky) {
    return (
      <AbsoluteFill>
        <Paper tex="night" tint="#3A1A10" tintO={0.3} />
        <Cam t={t} a={a} b={b} z={[1.05, 1.15]}>
          <Svg>
            <path d="M960 -20 L760 380 L1160 380 Z" fill="#F5C04A" opacity={0.18} />
            <line x1={960} y1={0} x2={960 + Math.sin(t * 1.3) * 30} y2={300} stroke={C.ink} strokeWidth={4} />
            <Cut t={t} id={1} x={960 + Math.sin(t * 1.3) * 30} y={300}><path d="M-60 0 L60 0 L30 -40 L-30 -40 Z" fill="#5A4636" /></Cut>
            {[-1, 1].map((sd, i) => <Cut key={i} t={t} id={20 + i}><Suit x={960 + sd * 520} y={980} s={1.25} arm={0.4 + i * 0.3} /></Cut>)}
            <Cut t={t} id={2}><Suit x={960} y={1000} s={1.05} arm={0.9} /></Cut>
            {/* the table and the map */}
            <Cut t={t} id={5}>
              <path d="M300 760 L1620 760 L1760 1080 L160 1080 Z" fill="#5A3A24" />
              <path d="M520 720 L1400 720 L1480 900 L440 900 Z" fill="#E9DCC0" />
              {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${560 + i * 150} 740 q 40 60 0 140`} stroke="#B8A27A" strokeWidth={3} fill="none" />)}
              <path d="M540 820 L700 770 L860 840 L1020 760 L1180 850 L1340 780 L1440 860" stroke={C.red} strokeWidth={8} fill="none" strokeDasharray={1200} strokeDashoffset={1200 * (1 - draw)} />
            </Cut>
          </Svg>
        </Cam>
      </AbsoluteFill>
    );
  }
  const k = t - st("সিদ্ধান্ত আসে");
  const fear = t >= st("মাটির মানুষ") - 0.1;
  return (
    <AbsoluteFill>
      <Paper tex="cream" tint="#9A8A7A" tintO={0.35} />
      <Svg>
        {[0, 1, 2].map((i) => <Cloud key={i} x={((300 + i * 650 - t * 20) % 2300) - 200} y={160 + i * 40} s={0.8} dark />)}
        {[0, 1, 2].map((i) => {
          const x = lerp(-300, 2300, clamp((k - i * 0.6) / 3.2));
          return <Cut key={i} t={t} id={30 + i} x={x} y={260 + i * 90}><Jet x={0} y={0} s={0.9} /></Cut>;
        })}
        {[0, 1, 2, 3, 4].map((i) => <Cut key={i} t={t} id={40 + i}><House x={200 + i * 380} y={980} s={1.2} i={i} /></Cut>)}
        <rect x={0} y={970} width={W} height={110} fill="#7A6A4A" />
        <Crowd t={t} n={9} y={1060} s={1.05} arms={fear ? 0.15 : 0} seed={7} />
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================== CAPITALS
// Washington to Moscow, Beijing to Delhi: pins on the globe, then the
// landmarks as paper cutouts on a documentary pan, labelled.
const CAPS: [string, React.FC, string][] = [["washington", Capitol, "ওয়াশিংটন"], ["moscow", Kremlin, "মস্কো"], ["beijing", PalaceGate, "বেইজিং"], ["delhi", IndiaGate, "দিল্লি"]];
export const Capitals: React.FC<SP> = ({ t, a, b }) => {
  const l1 = L("ওয়াশিংটন"), l2 = L("বেইজিং থেকে");
  const pinT = [l1.s, l1.words[2]?.s ?? l1.s + 1, l2.s, l2.words[2]?.s ?? l2.s + 1];
  const call = t >= st("ক্ষমতার সব হিসাব") - 0.2;
  const lon = (() => {
    const lons = [-77, 37.6, 116.4, 77.2];
    let i = 0; pinT.forEach((p, k) => { if (t >= p - 0.4) i = k; });
    const prev = lons[Math.max(0, i - 1)], k = easeOut((t - (pinT[i] - 0.4)) / 0.8);
    return lerp(prev, lons[i], k);
  })();
  const heard = ramp(t, st("মানুষের ডাক শুনি"), 1);
  return (
    <AbsoluteFill>
      <Paper tex="cream" />
      <Svg>
        <g opacity={1 - ramp(t, st("ক্ষমতার সব হিসাব") - 0.3, 0.6) * 0.7}>
          <Globe cx={480} cy={540} r={380} lon={lon} lat={-30} borders={0.7} pins={["washington", "moscow", "beijing", "delhi"].filter((_, i) => t >= pinT[i] - 0.2)} pinK={1} />
        </g>
        {CAPS.map(([key, Land, name], i) => {
          if (t < pinT[i] - 0.1) return null;
          const k = backOut((t - pinT[i] + 0.1) / 0.4);
          const x = 1040 + (i % 2) * 460, y = 470 + Math.floor(i / 2) * 400;
          return (
            <Cut key={key} t={t} id={50 + i} x={x} y={y + (1 - clamp(k)) * 300} s={0.68}>
              <Land />
              <g transform="translate(-150 30)"><rect width={300} height={70} fill="#F4ECD8" stroke={C.ink} strokeWidth={4} />
                <text x={150} y={50} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink}>{name}</text></g>
            </Cut>
          );
        })}
        {/* the people's call rises from each city */}
        {call && CAPS.map((_, i) => {
          const x = 1040 + (i % 2) * 460, y = 470 + Math.floor(i / 2) * 400 - 200;
          return [0, 1, 2].map((r) => {
            const p = ((t * 0.8 + r / 3 + i * 0.2) % 1);
            return <circle key={`${i}${r}`} cx={x} cy={y} r={20 + p * 160} fill="none" stroke={C.gold} strokeWidth={6 * (1 - p)} opacity={heard * (1 - p)} />;
          });
        })}
      </Svg>
      {call && <Hero t={t} img="hero_front" x={300} y={1080} h={lerp(700, 860, ramp(t, st("ক্ষমতার সব হিসাব"), 4))} o={ramp(t, st("ক্ষমতার সব হিসাব") - 0.2, 0.6)} glow={heard * 0.5} />}
    </AbsoluteFill>
  );
};

// ===================================================================== CHILD
// The child looking for morning, the mother waiting on the road, their small
// paper world — torn by a jet's shadow.
export const SmallWorld: React.FC<SP> = ({ t, a, b }) => {
  const mom = t >= st("যে মা ফেরার") - 0.1;
  const tear = ramp(t, st("কেন যুদ্ধ"), 1.2);
  const shake = pulse(t, st("কেন যুদ্ধ"), 4) * 14;
  return (
    <AbsoluteFill style={{ transform: `translate(${(rand(Math.floor(t * 24)) - 0.5) * shake}px, 0)` }}>
      <Paper tex="cream" tint="#E9A23B" tintO={0.15 * (1 - tear)} />
      <Svg>
        <Sun x={1500} y={lerp(700, 380, ramp(t, a, 6))} r={90} t={t} o={1 - tear} />
        {/* left half: the child at the window */}
        <g transform={`translate(${-tear * 140} ${tear * 30}) rotate(${-tear * 4} 480 540)`}>
          <Cut t={t} id={60}><rect x={120} y={260} width={720} height={720} fill="#D9C29A" stroke={C.ink} strokeWidth={4} />
            <rect x={300} y={360} width={360} height={300} fill="#8FB3C9" stroke={C.ink} strokeWidth={8} />
            <path d="M300 360 L420 470 L380 520 L470 600" stroke={C.ink} strokeWidth={4} fill="none" /></Cut>
          <Cut t={t} id={61}><Person x={480} y={760} s={1.5} i={3} child facing={1} arms={0.15} /></Cut>
        </g>
        {/* right half: the mother on the road */}
        <g transform={`translate(${tear * 140} ${tear * 30}) rotate(${tear * 4} 1440 540)`} opacity={mom ? 1 : 0.0}>
          <Cut t={t} id={62}><path d="M1000 1080 L1300 520 L1420 520 L1860 1080 Z" fill="#9A8A6A" /></Cut>
          <Cut t={t} id={63}><Person x={1360} y={900} s={1.6} i={8} scarf facing={1} /></Cut>
          <Cut t={t} id={64}><rect x={1480} y={620} width={160} height={280} fill="#5A3A24" stroke={C.ink} strokeWidth={4} /></Cut>
        </g>
        {tear > 0 && (
          <g>
            <path d={`M960 0 ${Array.from({ length: 20 }).map((_, i) => `L${960 + (rand(i) - 0.5) * 60 * tear} ${i * 57}`).join(" ")} L960 1080`} stroke="#2A1A10" strokeWidth={30 * tear} fill="none" />
            <g transform={`translate(${lerp(-400, 2200, clamp((t - st("কেন যুদ্ধ")) / 1.6))} 520)`} opacity={0.6}><Jet x={0} y={0} s={3} /></g>
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================= PRE-CHORUS
// Darkness falls, the earth shakes — and hands join, nation by nation; the
// hero steps forward: "আমাদের কণ্ঠ থামবে না!"
export const HandsTogether: React.FC<SP & { second?: boolean }> = ({ t, a, b, second }) => {
  const quake = second ? 0 : win(t, st("কেঁপে ওঠে"), en("কেঁপে ওঠে") + 0.4, 0.3);
  const join = ramp(t, second ? a : st("আমরা তবু হাত"), 1.5);
  const hero = t >= (second ? st("ক্ষমতার চেয়ে") : st("আমাদের বিশ্বাস")) - 0.2;
  const sh = quake * 16;
  return (
    <AbsoluteFill style={{ transform: `translate(${(rand(Math.floor(t * 24)) - 0.5) * sh}px, ${(rand(Math.floor(t * 24) + 2) - 0.5) * sh}px)` }}>
      <Paper tex="night" tint={second ? "#3A2A5A" : undefined} />
      <Svg>
        {!second && [0, 1, 2, 3].map((i) => <Cloud key={i} x={((i * 560 + t * 30) % 2400) - 200} y={120 + (i % 2) * 70} s={1.1} dark />)}
        {second && Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M960 -40 L${700 + i * 65} 1080 L${740 + i * 65} 1080 Z`} fill={C.sun} opacity={0.08 + 0.04 * Math.sin(t * 2 + i)} />)}
        {!second && Array.from({ length: 7 }).map((_, i) => {
          const fall = ramp(t, st("কেঁপে ওঠে") + 0.3 + i * 0.12, 0.5) * (i % 2);
          return <Cut key={i} t={t} id={180 + i}><House x={140 + i * 280 + (rand(Math.floor(t * 24) + i) - 0.5) * quake * 20} y={900 + fall * 40} s={1.1} i={i} broken={fall} /></Cut>;
        })}
        {quake > 0.05 && <path d="M0 860 L300 900 L520 840 L760 920 L1000 850 L1300 930 L1600 860 L1920 900" stroke={C.gold} strokeWidth={6} fill="none" />}
        <rect x={0} y={900} width={W} height={180} fill="#14141E" />
        {/* a chain of people holding hands */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = lerp(-200, 120 + i * 155, join) + (onTwos(t) * 30) % 30;
          return <Cut key={i} t={t} id={70 + i} x={0} y={0}><Person x={x} y={1040} s={1.0} i={i * 5 + 1} arms={0.22} facing={0.3} /></Cut>;
        })}
        {second && Array.from({ length: 8 }).map((_, i) => <Candle key={i} x={180 + i * 220} y={1060} s={1.1} t={t} i={i} />)}
        {second && t >= st("এই কথা ছড়িয়ে") - 0.2 && Array.from({ length: 16 }).map((_, i) => {
          const k = clamp((t - st("এই কথা ছড়িয়ে") - i * 0.08) / 2.5);
          return <Cut key={i} t={t} id={90 + i} x={lerp(960, rand(i) * W, k)} y={lerp(700, rand(i + 3) * 500, k)} r={k * 360 * (rand(i) - 0.5)} s={0.6}>
            <rect x={-60} y={-40} width={120} height={80} fill="#FBF6EA" /><text x={0} y={10} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={20} fill={C.ink}>জীবন বড়</text></Cut>;
        })}
      </Svg>
      {hero && <Hero t={t} img={second ? "head_3q" : "hero_front"} x={second ? 1360 : 960} y={second ? 1000 : 1060} h={second ? 600 : lerp(720, 860, ramp(t, a, 8))} o={ramp(t, (second ? st("ক্ষমতার চেয়ে") : st("আমাদের বিশ্বাস")) - 0.2, 0.6)} glow={0.9} />}
      {second && !hero && <Hero t={t} img="head_3q" x={1360} y={1000} h={560} o={ramp(t, a, 0.8)} glow={0.6 + 0.3 * Math.sin(t * 2)} />}
    </AbsoluteFill>
  );
};

// ===================================================================== CHORUS
// Sunrise. The storm is pushed back; people of every nation rise with their
// arms up, the hero seen from behind facing the dawn; "শেষ আলো জ্বলবেই!"
export const Chorus: React.FC<SP & { n: number }> = ({ t, a, b, n }) => {
  const sec = ["Chorus", "Chorus 2", "Final Chorus", "Reprise"][n];
  const lines = D.lines.filter((l) => l.section === sec);
  const rise = easeOut((t - a) / 3);
  const db = downbeatPulse(t, 4);
  const flags = n >= 1;
  const morning = lines.find((l) => l.text.includes("সকাল") || l.text.includes("সূর্য"));
  const rebuilt = n === 2 ? ramp(t, st("ভাঙা পৃথিবী"), 2) : n === 3 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Paper tex="cream" tint="#E9A23B" tintO={0.25 + rise * 0.2} />
      <Svg>
        <Sun x={960} y={lerp(1000, 520, rise)} r={150 + db * 12} t={t} />
        {[0, 1, 2, 3].map((i) => <Cloud key={i} x={(i < 2 ? -1 : 1) * lerp(300, 1300, rise) + 960 + (i % 2) * 200 * (i < 2 ? -1 : 1)} y={260 + (i % 2) * 120} s={1.2} dark />)}
        {n >= 2 && <g opacity={rebuilt}>{[0, 1, 2, 3, 4, 5].map((i) => <Cut key={i} t={t} id={140 + i}><House x={140 + i * 330} y={800 + (1 - rebuilt) * 300} s={0.9} i={i} /></Cut>)}</g>}
        {flags && FLAGS.map((c, i) => (
          <Cut key={c} t={t} id={110 + i} x={60 + i * 95} y={620 + (i % 2) * 30 + (1 - rise) * 400} s={0.45}><Flag code={c} x={0} y={0} w={150} wave={1} t={t} /></Cut>
        ))}
        <Crowd t={t} n={13} y={1080} s={1.25} arms={rise * (0.7 + db * 0.3)} sing={1} seed={n * 40 + 3} rows={2} />
        {morning && t >= morning.s && n !== 2 && [0, 1, 2].map((i) => <Cut key={i} t={t} id={150 + i} x={lerp(-200, 1900, clamp((t - morning.s - i * 0.4) / 4))} y={200 + i * 60} s={0.6}><Dove x={0} y={0} flap={Math.sin(t * 10 + i)} /></Cut>)}
        {n >= 2 && Array.from({ length: n === 3 ? 18 : 10 }).map((_, i) => <Cut key={i} t={t} id={160 + i} x={((i * 260 + t * 120 * (1 + rand(i))) % 2300) - 200} y={150 + rand(i) * 300} s={0.45}><Dove x={0} y={0} flap={Math.sin(t * 10 + i)} /></Cut>)}
      </Svg>
      <Hero t={t} img={n === 1 || n === 3 ? "hero_front" : "hero_back"} x={960} y={1080} h={lerp(560, n === 3 ? 820 : 760, rise)} glow={0.7 + db * 0.3 + (n === 3 ? 0.3 : 0)} bob={db * 6} />
    </AbsoluteFill>
  );
};

// ================================================================== HISTORY
// Those who write history in the name of war: a giant book inked red, chess
// pawns that are people; every breath of the earth asks them a question.
export const History: React.FC<SP> = ({ t, a, b }) => {
  const q = t >= st("তাদের কাছে প্রশ্ন") - 0.1;
  const ink = clamp((t - a) / 4);
  return (
    <AbsoluteFill>
      <Paper tex="kraft" tint="#5A2A1A" tintO={0.25} />
      <Cam t={t} a={a} b={b} z={[1, 1.08]}>
        <Svg>
          <Cut t={t} id={200}><path d="M260 300 L940 260 L960 900 L280 940 Z" fill="#F4ECD8" /><path d="M960 260 L1660 300 L1640 940 L960 900 Z" fill="#EFE6D2" /></Cut>
          {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={330} y1={360 + i * 60} x2={330 + 560 * clamp(ink * 9 - i)} y2={356 + i * 60} stroke={C.red} strokeWidth={10} strokeLinecap="round" />)}
          <text x={1300} y={420} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill={C.blood}>ক্ষমতার ইতিহাস</text>
          {/* chessboard of people */}
          <g transform="translate(1040 500)">
            {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={(i % 4) * 130} y={Math.floor(i / 4) * 90} width={130} height={90} fill={(i + Math.floor(i / 4)) % 2 ? "#5A3A24" : "#D9C29A"} />)}
            {[0, 1, 2, 3].map((i) => <Cut key={i} t={t} id={210 + i}><Person x={65 + i * 130} y={330} s={0.6} i={i * 11} arms={0} /></Cut>)}
          </g>
          <g transform={`translate(${lerp(1700, 1500, smooth(ink))} 200)`}><Suit x={0} y={600} s={0.9} arm={0.7} /></g>
          <g transform={`translate(${880 + Math.sin(t * 3) * 120} ${380 + ink * 400}) rotate(-35)`}>
            <path d="M0 0 L20 -260 L40 0 Z" fill="#FBF6EA" stroke={C.ink} strokeWidth={4} /><path d="M20 0 L20 30" stroke={C.red} strokeWidth={8} />
          </g>
          {q && Array.from({ length: 12 }).map((_, i) => {
            const k = clamp((t - st("তাদের কাছে প্রশ্ন") - i * 0.15) / 3);
            return <text key={i} x={200 + rand(i) * 1500} y={lerp(1100, 200 + rand(i + 3) * 400, easeOut(k))} fontFamily={DISPLAY} fontWeight={800} fontSize={90 + rand(i + 1) * 60} fill={C.ink} opacity={k}>?</text>;
          })}
        </Svg>
      </Cam>
    </AbsoluteFill>
  );
};

// ==================================================================== VICTORY
// Which victory takes a home? Which win makes a mother cry? — and the flag
// that saves people stays high: the hero raises it.
export const Victory: React.FC<SP> = ({ t, a, b }) => {
  const flag = t >= st("যে পতাকা মানুষ") - 0.2;
  const fall = ramp(t, a + 0.4, 1.2);
  const raise = easeOut((t - st("সেই পতাকা উঁচু")) / 1.4);
  if (!flag) {
    return (
      <AbsoluteFill>
        <Paper tex="cream" tint="#5A5A6A" tintO={0.35} />
        <Svg>
          <rect x={0} y={900} width={W} height={180} fill="#7A6A4A" />
          <Cut t={t} id={220}><House x={600} y={920} s={2.2} i={1} broken={fall} /></Cut>
          {t >= st("কোন জয়ে") - 0.1 && <Cut t={t} id={221}><Person x={1300} y={1000} s={2.0} i={8} scarf facing={-1} /></Cut>}
          {t >= st("কোন জয়ে") && [0, 1, 2].map((i) => <path key={i} d={`M${1290 + i * 6} ${640 + ((t * 120 + i * 40) % 120)} q 4 10 0 16`} stroke="#8FB3C9" strokeWidth={6} fill="none" />)}
          {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={500 + rand(i) * 300} cy={900 - ((t * 60 + i * 40) % 500)} r={20 + rand(i) * 30} fill="#7A766E" opacity={0.25 * fall} />)}
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Paper tex="cream" tint="#E9A23B" tintO={0.15 + raise * 0.15} />
      <Svg>
        <Sun x={1500} y={300} r={110} t={t} o={raise} />
        <rect x={0} y={950} width={W} height={130} fill="#7A6A4A" />
        <g transform={`translate(1130 ${lerp(1100, 260, raise)})`}>
          <line x1={0} y1={0} x2={0} y2={900} stroke={C.ink} strokeWidth={12} />
          <Cut t={t} id={230}><path d={`M6 0 Q${120 + Math.sin(t * 4) * 20} ${20} 260 ${Math.sin(t * 4) * 12} L260 180 Q120 ${200 + Math.sin(t * 4 + 1) * 12} 6 180 Z`} fill="#FBF6EA" />
            <g transform="translate(130 90) scale(0.75)"><Dove x={0} y={0} /></g></Cut>
        </g>
      </Svg>
      <Hero t={t} img="hero_right" x={980} y={1080} h={820} glow={raise * 0.7} />
    </AbsoluteFill>
  );
};

// =================================================================== ASSEMBLY
// New York's assembly hall: talk and talk; outside, the people's prayer —
// candles that should be everyone's pledge.
export const AssemblyHall: React.FC<SP> = ({ t, a, b }) => {
  const prayer = t >= st("মানুষের এই প্রার্থনা") - 0.2;
  return (
    <AbsoluteFill>
      <Paper tex={prayer ? "night" : "cream"} />
      <Svg>
        {!prayer ? (
          <g>
            <Cut t={t} id={240} x={960} y={500} s={0.9}><NYSkyline /></Cut>
            <Cut t={t} id={241} x={960} y={1020} s={1.1}><Assembly /></Cut>
            {Array.from({ length: 8 }).map((_, i) => {
              const at = a + 0.4 + i * 0.5;
              if (t < at) return null;
              const k = backOut((t - at) / 0.3);
              return <g key={i} transform={`translate(${280 + (i % 4) * 440} ${620 + Math.floor(i / 4) * 140}) scale(${k})`}>
                <path d="M-90 -40 L90 -40 L90 30 L-40 30 L-70 60 L-60 30 L-90 30 Z" fill="#FBF6EA" stroke={C.ink} strokeWidth={4} />
                <text x={0} y={8} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.ink}>…</text></g>;
            })}
          </g>
        ) : (
          <g>
            <Cut t={t} id={242} x={960} y={620} s={0.8} o={0.5}><Assembly /></Cut>
            {Array.from({ length: 14 }).map((_, i) => <g key={i}><Person x={100 + i * 135} y={1060} s={1.0} i={i * 3 + 2} arms={0.35} />
              <Candle x={100 + i * 135 + 30} y={930} s={0.8} t={t} i={i} /></g>)}
          </g>
        )}
      </Svg>
    </AbsoluteFill>
  );
};

// ===================================================================== BRIDGE
// A child: "I'll go back to school". A mother: "my child will come home".
// A man: "I want to live without fear" — his chains break.
export const Voices: React.FC<SP> = ({ t, a, b }) => {
  const mom = t >= st("একটি মা") - 0.2, man = t >= st("একটি মানুষ বলুক") - 0.2;
  const chain = ramp(t, st("আমি ভয় ছাড়া"), 0.4);
  return (
    <AbsoluteFill>
      <Paper tex="cream" tint="#E9DCC0" tintO={0.2} />
      <Svg>
        {!mom && <g>
          <Cut t={t} id={250} x={1350} y={900} s={2.3}><House x={0} y={0} i={2} /><rect x={-90} y={-150} width={180} height={30} fill="#3A5A8A" /><text x={0} y={-128} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={22} fill="#fff">স্কুল</text></Cut>
          <rect x={0} y={900} width={W} height={180} fill="#9A8A6A" />
          <Cut t={t} id={251}><Person x={lerp(360, 940, clamp((t - a) / 6))} y={1040} s={2.6} i={4} child facing={1} arms={0.1} /></Cut>
        </g>}
        {mom && !man && <g>
          <Cut t={t} id={252} x={1150} y={1000} s={1.7}><rect x={-120} y={-360} width={240} height={360} fill="#5A3A24" /><rect x={-110} y={-350} width={220} height={340} fill="#F5C04A" opacity={ramp(t, st("আমার সন্তান"), 1)} /></Cut>
          <Cut t={t} id={253}><Person x={760} y={1040} s={2.6} i={8} scarf facing={1} arms={0.35} /></Cut>
          <Candle x={880} y={800} s={1.8} t={t} />
        </g>}
      </Svg>
      {man && <>
        <Hero t={t} img="hero_front" x={960} y={1080} h={860} glow={chain * 0.8} />
        <Svg>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${960 + sd * (110 + chain * 420)} ${640 + chain * 260}) rotate(${sd * chain * 70})`} opacity={1 - ramp(t, st("আমি ভয় ছাড়া") + 1.2, 0.8)}>
              {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={sd * i * 52} cy={0} rx={34} ry={18} fill="none" stroke="#3A3630" strokeWidth={12} />)}
            </g>
          ))}
        </Svg>
      </>}
    </AbsoluteFill>
  );
};

// One earth… one sky… one call — borders erase on the globe.
export const OneWorld: React.FC<SP> = ({ t, a, b }) => {
  const erase = ramp(t, st("একটি আকাশ") - 0.2, 2.5);
  const call = ramp(t, st("একটি মানবতার"), 0.8);
  return (
    <AbsoluteFill>
      <Paper tex="night" tint="#3A2A5A" tintO={0.3 * (1 - call)} />
      <Svg>
        <Globe cx={960} cy={560} r={lerp(300, 420, smooth((t - a) / (b - a)))} lon={80 + onTwos(t) * 6} lat={-20} borders={1} erase={erase} glow={call} />
        {call > 0 && Array.from({ length: 16 }).map((_, i) => {
          const an = (i / 16) * Math.PI * 2 + t * 0.3;
          return <Person key={i} x={960 + Math.cos(an) * 560} y={560 + Math.sin(an) * 470 + 120} s={0.55} i={i * 7} arms={1} sing={1} />;
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// The chants: each a nation's crowd under its flag; jets crumple, the suits fade.
const CHANTS: [string, FlagCode[]][] = [["যুদ্ধ নয়", ["BD", "IN", "NP"]], ["শান্তি চাই", ["RU", "US", "CN"]], ["ঘৃণা নয়", ["BR", "NG", "KE"]], ["ভালোবাসা চাই", ["FR", "DE", "JP"]], ["ক্ষমতা নয়", ["EG", "TR", "MX"]], ["মানুষ বাঁচুক", ["ID", "ZA", "AR"]]];
export const Chants: React.FC<SP> = ({ t, a, b }) => {
  let k = 0;
  CHANTS.forEach(([has], i) => { if (t >= st(has) - 0.15) k = i; });
  const [, fl] = CHANTS[k];
  const at = st(CHANTS[k][0]);
  const hit = pulse(t, at, 6);
  const crumple = ramp(t, st("যুদ্ধ নয়"), 3);
  const fade = ramp(t, st("ক্ষমতা নয়"), 1.5);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + hit * 0.04})` }}>
      <Paper tex="cream" tint={k % 2 ? "#E9A23B" : "#B3261E"} tintO={0.18} />
      <Svg>
        <g opacity={1 - fade}>{[-1, 1].map((sd, i) => <g key={i} transform={`translate(${960 + sd * 760} 900) scale(${1 - fade * 0.5})`}><Suit x={0} y={0} s={0.9} /></g>)}</g>
        {[0, 1].map((i) => <g key={i} transform={`translate(${400 + i * 1100} 200) scale(${1 - crumple * 0.8}) rotate(${crumple * 200})`} opacity={1 - crumple}><Jet x={0} y={0} s={1.2} /></g>)}
        {fl.map((c, i) => <Cut key={c + k} t={t} id={300 + i} x={420 + i * 540} y={170 + (1 - backOut((t - at) / 0.35)) * -300} s={0.95}><Flag code={c} x={0} y={0} w={200} wave={1} t={t} /></Cut>)}
        <Crowd t={t} n={15} y={1090} s={1.25} arms={0.6 + hit * 0.4} sing={1} seed={k * 30 + 5} rows={2} />
      </Svg>
    </AbsoluteFill>
  );
};

// ====================================================================== OUTRO
// The globe again, borders gone; a child sets down a paper dove: "এই পৃথিবী
// আমাদের সবার". Credits.
export const Outro: React.FC<SP> = ({ t, a, b }) => {
  const dove = easeOut((t - a - 1) / 2.5);
  const credit = ramp(t, D.duration - 9, 1.2);
  return (
    <AbsoluteFill>
      <Paper tex="cream" />
      <Cam t={t} a={a} b={b} z={[1.1, 1]}>
        <Svg>
          <Globe cx={960} cy={560} r={360} lon={90 + onTwos(t) * 2} lat={-22} borders={0} glow={0.5} />
          <Cut t={t} id={400} x={lerp(1500, 1020, dove)} y={lerp(900, 220, dove)} s={0.9}><Dove x={0} y={0} flap={dove < 1 ? Math.sin(t * 8) : 0} /></Cut>
          <Cut t={t} id={401}><Person x={1460} y={1060} s={1.6} i={4} child arms={0.6 * (1 - dove) + 0.2} facing={-1} /></Cut>
        </Svg>
      </Cam>
      <Hero t={t} img="hero_left" x={420} y={1080} h={760} o={ramp(t, a + 1.5, 1)} />
      {credit > 0 && (
        <AbsoluteFill style={{ background: `rgba(20,14,10,${0.7 * credit})`, alignItems: "center", justifyContent: "center", opacity: credit }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, color: "#FBF6EA" }}>মানবতার ডাক</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 46, color: C.gold, marginTop: 6 }}>শেষ আলো জ্বলবেই</div>
          <div style={{ fontFamily: "SigMono, monospace", fontSize: 30, letterSpacing: 8, color: "#E9DCC0", marginTop: 30 }}>RAPARRUBEL (RUBEL MIAH)</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
