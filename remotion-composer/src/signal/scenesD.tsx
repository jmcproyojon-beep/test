import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, POSTER, MONO, PLAY } from "./fonts";
import { Figure, Kinetic, Slam, Bars, BrickPhone, SmartPhone, Person, Bubble, Hud, Flash, Dust, LightLeak, Rings } from "./kit";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, lineAt, beatPulse, downbeatPulse,
  bassSmooth, cuePulse, beatPhase, backOut, downbeatIndex,
} from "./lib";
import { SceneProps } from "./scenesA";

// ================================================================= BREAKDOWN
// 155.5 – 169.6 s. Tape stop. Everything warms to cassette brown. An old
// keypad phone dials a number from memory, digit by digit, and rings — and a
// warm voice finally answers: "কই ছিলি এতদিন?"

export const Breakdown: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Breakdown"]);
  const stop = clamp((t - H.breakdown) / 0.7);
  const l1 = findLine("পুরোনো সেই নম্বরটাতে"), l2 = findLine("ফোন দিলে"), l3 = findLine("কেউ একজন"), l4 = findLine("কই ছিলি");
  const num = "01711-2004";
  const typed = Math.floor(clamp((t - l1.s) / (l1.e - l1.s + 0.3)) * num.length);
  const ring = t > l3.s && t < l4.s;
  const answered = t >= l4.s;
  const silence = ramp(t, l4.e + 0.1, 0.4);
  const reel = t * lerp(400, 30, easeOut(stop));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 55% 45%, #8A4B22, #2A140A 80%)` }}>
      <AbsoluteFill style={{ transform: `scaleY(${lerp(0.94, 1, easeOut(stop))})`, filter: `saturate(${lerp(0.2, 1, stop)}) brightness(${lerp(0.6, 1, stop) * (1 - silence * 0.35)})` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <rect x={0} y={760} width={1920} height={320} fill="#4A2814" />
          {Array.from({ length: 8 }).map((_, i) => <line key={i} x1={0} y1={790 + i * 38} x2={1920} y2={780 + i * 40} stroke="#3A1E0E" strokeWidth={3} />)}
          {/* cassette on the table */}
          <g transform="translate(470 690) rotate(-8)">
            <rect x={-230} y={-140} width={460} height={280} rx={20} fill="#2B2420" />
            <rect x={-190} y={-110} width={380} height={90} rx={8} fill={C.paper} />
            <text x={0} y={-52} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={40} fill={C.ink}>বিকেলের গান</text>
            {[-90, 90].map((cx, i) => <g key={i} transform={`translate(${cx} 50) rotate(${reel})`}><circle r={40} fill={C.paper} /><circle r={14} fill="#2B2420" />
              {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-4} y={-15} width={8} height={9} fill={C.paper} transform={`rotate(${a})`} />)}</g>)}
          </g>
          {ring && <Rings cx={1300} cy={420} t={t} n={4} speed={1.4} max={500} color={C.amber} width={6} />}
          <g transform={`translate(${1300 + (ring ? Math.sin(t * 70) * 5 : 0)} 560)`}>
            <BrickPhone x={0} y={0} s={1.25} rot={4} glow={1} body="#3A3530">
              <text x={75} y={40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#1E3A12">{num.slice(0, typed)}{typed < num.length && Math.floor(t * 4) % 2 ? "_" : ""}</text>
              {t > l2.s && <text x={75} y={78} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={18} fill="#1E3A12">{answered ? "CONNECTED" : "CALLING" + ".".repeat(1 + Math.floor(t * 3) % 3)}</text>}
              {t > l2.s && <text x={75} y={106} textAnchor="middle" fontFamily={MONO} fontSize={15} fill="#1E3A12">{answered ? "▮▮▮▮" : "▮▯▯▯"}</text>}
            </BrickPhone>
          </g>
          {/* dialling finger */}
          {t > l1.s && t < l2.s + 0.5 && (() => {
            const k = (t * 5) % 1;
            return <circle cx={1300 - 60 + (Math.floor(t * 5) % 3) * 58} cy={600 + (Math.floor(t * 2.5) % 4) * 62 - (1 - Math.abs(k * 2 - 1)) * 20} r={30} fill="#D99A6C" opacity={0.95} />;
          })()}
        </svg>
        {line && !answered && (
          <div style={{ position: "absolute", left: 110, top: 140, width: 900 }}>
            <Kinetic line={line} t={t} st={{ size: 92, weight: 600, align: "left", color: C.cream, active: C.amber, shadow: "4px 4px 0 #2A140A", mode: "pop" }} />
          </div>
        )}
        {answered && (
          <Bubble t={t} at={l4.s} x={140} y={400} text={l4.text} bg={C.cream} color="#8A3A10" size={100} out={l4.e + 1.5} />
        )}
        {/* the harmonic: sparks in the silence */}
        {silence > 0 && Array.from({ length: 24 }).map((_, i) => {
          const a = rand(i) * Math.PI * 2, r = 120 + rand(i + 4) * 520 + (t - l4.e) * 60;
          return <div key={i} style={{ position: "absolute", left: 1300 + Math.cos(a) * r, top: 420 + Math.sin(a) * r * 0.6, width: 8, height: 8, borderRadius: 4, background: C.amber,
            opacity: silence * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i))), boxShadow: `0 0 18px ${C.amber}` }} />;
        })}
      </AbsoluteFill>
      <LightLeak t={t} amount={0.5} />
    </AbsoluteFill>
  );
};

// ==================================================================== BRIDGE
// 169.6 – 185.6 s. Rain on the school field at sunset. He stands where the
// afternoon was left. On "তবু একটা পুরোনো গান" a cassette ribbon unspools
// out of the sky and becomes music notes that circle him.

const RAIN = Array.from({ length: 160 }).map((_, i) => ({ x: rand(i) * 2200, s: 0.7 + rand(i + 3) * 0.6, o: rand(i + 7) }));

export const Bridge: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Bridge"]);
  const song = findLine("তবু একটা পুরোনো গান").s;
  const rib = clamp((t - song) / 2.2);
  const push = lerp(1, 1.12, smooth((t - H.bridge) / 16));
  const rainAmt = ramp(t, findLine("বৃষ্টির").s - 1.5, 1.5) * 0.7 + 0.3;
  const ribbon = Array.from({ length: 60 }).map((_, i) => {
    const k = i / 59;
    return `${1500 - k * 600 + Math.sin(k * 9 + t * 2) * 60},${-40 + k * 640 + Math.cos(k * 7 + t) * 40}`;
  });
  const shown = Math.max(2, Math.floor(rib * 60));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(#3B1D5A 0%, #A23E5A 38%, #FF8A3D 62%, #FFC46B 72%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "60% 70%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <circle cx={1340} cy={700} r={150} fill="#FFE8A8" opacity={0.9} />
          <rect x={120} y={500} width={700} height={240} fill="#3A1A2A" />
          {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={150 + (i % 4) * 170} y={530 + Math.floor(i / 4) * 100} width={90} height={60} fill="#5A2A3A" />)}
          <rect x={0} y={740} width={1920} height={340} fill="#2A3A1E" />
          <rect x={0} y={740} width={1920} height={10} fill="#4A5A2E" />
          {/* puddles reflecting the sun */}
          <ellipse cx={1340} cy={900} rx={260} ry={26} fill="#FFC46B" opacity={0.35} />
          <ellipse cx={600} cy={960} rx={180} ry={18} fill="#FFC46B" opacity={0.2} />
          <path d="M1500 760 L1500 600 L1820 600 L1820 760" stroke="#1E1410" strokeWidth={12} fill="none" />
          <Figure x={1000} y={890} scale={2.1} pose={{ bob: Math.sin(t * 1.4) * 1.5 }} fill="#1A0E14" rim={C.amber} />
          {/* ribbon → notes */}
          {rib > 0 && <polyline points={ribbon.slice(0, shown).join(" ")} fill="none" stroke="#5A3A24" strokeWidth={10} strokeLinecap="round" />}
          {rib > 0.6 && Array.from({ length: 10 }).map((_, i) => {
            const a = t * 1.2 + (i / 10) * Math.PI * 2;
            const r = 260 * ramp(t, song + 1.3 + i * 0.05, 0.6);
            return <text key={i} x={1000 + Math.cos(a) * r * 1.4} y={700 + Math.sin(a) * r * 0.5} fontSize={70} fill={i % 2 ? C.yellow : C.cream}
              textAnchor="middle" opacity={0.9}>{i % 3 ? "♪" : "♫"}</text>;
          })}
          {/* rain */}
          {RAIN.map((r, i) => {
            const y = ((t * 1400 * r.s + r.o * 1300) % 1300) - 150;
            const x = (r.x - y * 0.18) % 2000;
            return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 70 * r.s} stroke="#E8E4FF" strokeWidth={2} opacity={rainAmt * (0.25 + r.o * 0.4)} />;
          })}
          {Array.from({ length: 18 }).map((_, i) => {
            const p = (t * 2 + rand(i)) % 1;
            return <ellipse key={i} cx={rand(i + 11) * 1920} cy={760 + rand(i + 5) * 300} rx={4 + p * 26} ry={1 + p * 6} fill="none" stroke="#E8E4FF" strokeWidth={2} opacity={rainAmt * (1 - p) * 0.6} />;
          })}
        </svg>
      </AbsoluteFill>
      {line && (
        <div style={{ position: "absolute", left: 100, top: 110, width: 1300 }}>
          <Kinetic line={line} t={t} st={{ size: 100, weight: 800, align: "left", color: C.cream, active: C.yellow, shadow: "5px 5px 0 #3B1D5A, 0 0 30px rgba(0,0,0,0.4)", mode: "pop" }} />
        </div>
      )}
      <Flash amount={cuePulse(t, H.bridge, 6) * 0.5} color={C.amber} />
    </AbsoluteFill>
  );
};

// ===================================================================== BUILD
// 185.6 – 204.1 s. Split-screen call: him upstairs, his friend down on the
// street. "আজকে আর অনলাইন না!" slams — the phone is thrown, the screen reads
// OFFLINE — and he runs down the stairwell, floor by floor on the dhol hits,
// into the light of the street.

export const Build: React.FC<SceneProps> = ({ t, f }) => {
  const dlg = D.lines.filter((l) => l.section === "Final Build" && l.dialogue);
  const slamLine = findLine("আজকে আর অনলাইন");
  const runAt = 191.6;
  if (t < H.slam) {
    const sides = ["r", "l", "l", "r"] as const;
    return (
      <AbsoluteFill style={{ background: C.obsidian }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, background: `radial-gradient(circle at 50% 40%, ${C.navy}, ${C.midnight})` }}>
          <svg width={960} height={1080}>
            <rect x={80} y={160} width={300} height={360} fill="#0E1650" stroke="#2B3270" strokeWidth={10} />
            <Figure x={520} y={900} scale={2.4} pose={{ reach: 0.55 }} fill="#05040C" rim={C.cyan} />
            <rect x={520 + 50} y={900 - 300} width={30} height={52} rx={6} fill="#111" stroke={C.cyan} strokeWidth={3} />
          </svg>
          <Hud x={40} y={980} color={C.cyan}>৫ তলা · 5F</Hud>
        </div>
        <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, background: `linear-gradient(#FF9A4A, #A23E5A)` }}>
          <svg width={960} height={1080}>
            <rect x={0} y={860} width={960} height={220} fill="#3A1A20" />
            <circle cx={700} cy={300} r={90} fill="#FFE8A8" />
            {[0, 1, 2].map((i) => <Person key={i} x={260 + i * 170} y={900} s={1.5} fill="#2A0F1A" arm={i === 1 ? 0.75 : 0.1} />)}
          </svg>
          <Hud x={920} y={980} color="#2A0F1A" anchor="r">নিচে · STREET</Hud>
        </div>
        <div style={{ position: "absolute", left: 952, top: 0, width: 16, height: 1080, background: C.yellow }} />
        {dlg.map((l, i) => (
          <Bubble key={i} t={t} at={l.s} text={l.text} side={sides[i]} x={sides[i] === "l" ? 120 : 1800} y={[330, 480, 620, 330][i]} out={i === 3 ? 189 : 188.5}
            bg={sides[i] === "l" ? C.cyan : C.white} size={72} />
        ))}
        {t >= slamLine.s && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 120 }}>
            <Kinetic line={slamLine} t={t} st={{ size: 120, shadow: `7px 7px 0 ${C.crimson}` }} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }
  if (t < runAt) {
    const k = clamp((t - H.slam) / 1.4);
    return (
      <AbsoluteFill style={{ background: C.crimson, alignItems: "center", justifyContent: "center" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <g transform={`translate(${lerp(960, 1800, k)} ${lerp(820, 120, k) + k * k * 500}) rotate(${k * 720})`}>
            <rect x={-60} y={-110} width={120} height={220} rx={18} fill="#111" stroke="#fff" strokeWidth={6} />
            <text y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={C.yellow}>OFFLINE</text>
          </g>
        </svg>
        <div style={{ transform: `scale(${1 + cuePulse(t, H.slam, 4) * 0.3}) rotate(-3deg)` }}>
          <Kinetic line={{ ...slamLine, e: runAt }} t={t} st={{ size: 190, color: C.white, active: C.yellow, shadow: `12px 12px 0 ${C.obsidian}` }} />
        </div>
        <div style={{ position: "absolute", bottom: 90, fontFamily: POSTER, fontSize: 70, color: C.obsidian, letterSpacing: 8 }}>✈ AIRPLANE MODE: ON</div>
      </AbsoluteFill>
    );
  }
  // the stairwell
  const di = downbeatIndex(t) - downbeatIndex(runAt);
  const floors = ["৪ তলা", "৩ তলা", "২ তলা", "১ তলা", "নিচতলা"];
  const fl = floors[Math.min(floors.length - 1, Math.max(0, Math.floor(di / 1.5)))];
  const run = (t - runAt) * 330;
  const STEP_W = 90, STEP_H = 54;
  const door = ramp(t, 202.3, 1.2);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, #1B1440, #3A1450)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* painted floor number on the wall */}
        <text x={1500} y={420} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={210} fill={C.yellow} opacity={0.18 + downbeatPulse(t, 5) * 0.3}>{fl}</text>
        <g transform={`translate(${-run % (STEP_W * 2)} ${-(run * (STEP_H / STEP_W)) % (STEP_H * 2)})`}>
          {Array.from({ length: 34 }).map((_, i) => (
            <rect key={i} x={-200 + i * STEP_W} y={i * STEP_H} width={STEP_W + 2} height={1400} fill={i % 2 ? "#2A2050" : "#302660"} />
          ))}
          {Array.from({ length: 34 }).map((_, i) => <line key={i} x1={-200 + i * STEP_W} y1={i * STEP_H} x2={-200 + (i + 1) * STEP_W} y2={i * STEP_H} stroke={C.cyan} strokeWidth={4} opacity={0.6} />)}
          <line x1={-200} y1={-140} x2={-200 + 34 * STEP_W} y2={-140 + 34 * STEP_H} stroke={C.magenta} strokeWidth={10} />
        </g>
        <Figure x={900} y={((900 + 200) / STEP_W) * STEP_H - 4 - Math.abs(Math.sin(t * 11)) * 14} scale={2.3} pose={{ walk: t * 11, bob: 0 }} fill="#05040C" rim={C.yellow} />
        {/* the door at the bottom */}
        {door > 0 && <rect x={1920 - door * 900} y={0} width={door * 900 + 10} height={1080} fill="#FFE8B0" opacity={door} />}
      </svg>
      {D.echoes.map((at, i) => (
        <Slam key={i} text="আজকে!" t={t} at={at} out={at + 1.4} x={i ? 1350 : 520} y={i ? 300 : 220} size={150} rot={i ? 8 : -8}
          color={i ? C.yellow : C.white} shadow={`8px 8px 0 ${C.crimson}`} />
      ))}
      <Hud x={60} y={60} color={C.yellow} size={34}>▼ {fl}</Hud>
      <Flash amount={downbeatPulse(t, 12) * 0.18 + ramp(t, 203.5, 0.6)} color={t > 203 ? "#FFF6E0" : "#fff"} />
    </AbsoluteFill>
  );
};

// ===================================================================== OUTRO
// 233.0 – end. The music stops; the phone rings. "নেটওয়ার্ক পাইছিস?" When the
// music comes back the camera pulls out of the phone's signal icon — the
// four bars are his four friends on the rooftop steps, and he is the one who
// fills the last bar. "না রে... মানুষ পাইছি।" Then the cassette stops.

export const Outro: React.FC<SceneProps> = ({ t, f }) => {
  const dlg = D.lines.filter((l) => l.section === "Outro" && l.dialogue);
  const last = findLine("মানুষ পাইছি");
  const back = H.back;
  const off = clamp((t - H.end) / 0.5);
  if (t < back) {
    return (
      <AbsoluteFill style={{ background: C.obsidian }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <circle cx={960} cy={540} r={420} fill={C.cyan} opacity={0.06 + 0.04 * Math.sin(t * 9)} />
          <SmartPhone x={960} y={560} s={1.25} rot={-4} screen="#0F2A3A">
            <circle cx={150} cy={200} r={70} fill={C.yellow} />
            <text x={150} y={318} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={40} fill="#fff">দোস্ত</text>
            <text x={150} y={360} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="#8FA3B8">calling…</text>
            <circle cx={80} cy={520} r={40} fill="#E53935" /><circle cx={220} cy={520} r={40} fill="#4CD964" />
          </SmartPhone>
        </svg>
        {dlg.map((l, i) => (
          <Bubble key={i} t={t} at={l.s} text={l.text} side={i === 1 ? "r" : "l"} x={i === 1 ? 1780 : 140} y={[360, 520, 760][i]}
            bg={i === 1 ? C.white : C.cyan} size={74} />
        ))}
      </AbsoluteFill>
    );
  }
  const pull = easeOut((t - back) / 2.6);
  const scale = lerp(9, 1, pull);
  const title = ramp(t, 241.6, 0.4);
  const stepX = [560, 820, 1080, 1340], stepH = [120, 220, 320, 420];
  const joined = ramp(t, last.s - 0.6, 0.8);
  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      <AbsoluteFill style={{ transform: `scaleY(${off < 0.5 ? lerp(1, 0.004, off * 2) : 0.004}) scaleX(${off < 0.5 ? 1 : lerp(1, 0, (off - 0.5) * 2)})` }}>
        <AbsoluteFill style={{ background: `linear-gradient(#5A1E3C 0%, #FF7A3D 55%, #FFC46B 75%)` }}>
          <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "62% 72%" }}>
            <svg width={1920} height={1080} style={{ position: "absolute" }}>
              <circle cx={960} cy={560} r={260} fill="#FFE8A8" opacity={0.85} />
              {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={i * 70} y={720 - rand(i) * 260} width={64} height={400} fill="#4A1A2A" opacity={0.6} />)}
              <rect x={0} y={900} width={1920} height={180} fill="#1A0A12" />
              {stepX.map((x, i) => (
                <g key={i}>
                  <rect x={x - 110} y={900 - stepH[i]} width={220} height={stepH[i]} fill="#1A0A12" />
                  {(i < 3 || joined > 0.01) && (
                    <g opacity={i < 3 ? 1 : joined}>
                      <Person x={x} y={900 - stepH[i] - (i === 3 ? (1 - joined) * 60 : 0)} s={1.25} fill="#1A0A12"
                        arm={ramp(t, last.words[3].s, 0.3) * 0.8 + downbeatPulse(t, 4) * 0.15} jump={beatPulse(t - i * 0.06, 8) * 18} />
                    </g>
                  )}
                </g>
              ))}
              <rect x={440} y={890} width={1020} height={14} fill={C.yellow} opacity={0.5 + beatPulse(t) * 0.5} />
            </svg>
          </AbsoluteFill>
          {t > last.s - 0.2 && t < 241.6 && (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
              <Kinetic line={{ ...last, e: 241.5 }} t={t} st={{ size: 140, color: C.cream, active: C.white, shadow: `8px 8px 0 ${C.magenta}`, mode: "pop" }} />
            </AbsoluteFill>
          )}
          {title > 0 && (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 90, opacity: title }}>
              <div style={{ fontFamily: POSTER, fontSize: 230, color: C.white, textShadow: `12px 12px 0 ${C.crimson}, -6px -6px 0 ${C.cyan}`, transform: `scale(${lerp(1.3, 1, easeOut((t - 241.6) / 0.4))})` }}>SIGNAL নাই</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.white, letterSpacing: 14, marginTop: 10, textShadow: `4px 4px 0 ${C.crimson}, 0 0 20px rgba(0,0,0,0.8)` }}>RAPARRUBEL</div>
            </AbsoluteFill>
          )}
          <LightLeak t={t} amount={0.5} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Flash amount={cuePulse(t, back, 5) * 0.8} />
    </AbsoluteFill>
  );
};
