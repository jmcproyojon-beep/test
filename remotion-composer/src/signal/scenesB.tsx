import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, POSTER, MONO, PLAY } from "./fonts";
import { Figure, Kinetic, Bars, BrickPhone, SmartPhone, Person, Hud, Dust, Flash, LightLeak, tornClip, rgba } from "./kit";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, lineAt, beatPulse, downbeatPulse,
  bassSmooth, cuePulse, beatPhase, backOut, Line,
} from "./lib";
import { SceneProps } from "./scenesA";

/** Lyric on a strip of torn yellow tape (verse collage). */
const Tape: React.FC<{ line: Line | null; t: number; y?: number; rot?: number }> = ({ line, t, y = 870, rot = -1.5 }) => {
  if (!line) return null;
  const k = easeOut((t - line.s + 0.15) / 0.25);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: `rotate(${rot}deg)` }}>
      <div style={{ background: C.yellow, padding: "10px 60px 18px", clipPath: tornClip(line.s * 10, "both", 10), transform: `scaleX(${k})`, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <Kinetic line={line} t={t} st={{ size: 92, color: C.ink, active: C.crimson, shadow: "none", mode: "pop", hideBefore: false, maxWidth: 1600 }} />
      </div>
    </div>
  );
};

const Halftone: React.FC<{ color?: string; opacity?: number; size?: number }> = ({ color = "#000", opacity = 0.08, size = 14 }) => (
  <AbsoluteFill style={{ opacity, backgroundImage: `radial-gradient(${color} 28%, transparent 30%)`, backgroundSize: `${size}px ${size}px` }} />
);

// ===================================================================== VERSE 1
// 56.4 – 78.9 s. A Y2K scrapbook the camera pans across, one page per
// couplet: coins and a heavy phone with home hidden in a missed call; a CD
// written on in blue ink spinning till dusk; the school field — whose crowd
// turns into floating online avatars, leaving an empty nest.

export const Verse1: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Verse 1"]);
  const p2 = findLine("সিডির গায়ে").s, p3 = findLine("স্কুলের পরে").s;
  const page = ramp(t, p2 - 0.25, 0.5) + ramp(t, p3 - 0.25, 0.5);
  const camX = -page * 1920 - (t - 56.4) * 6;
  const thud = findLine("ফোনটা ছিল ভারী").words[2].s;
  const shake = cuePulse(t, thud, 12) * 14;
  const missed = findLine("মিসড কলের").s, home = findLine("লুকিয়ে").words[2].s;
  const write = findLine("সিডির গায়ে");
  const notes = findLine("নীল কালিতে").s, album = findLine("অ্যালবাম").s, dusk = ramp(t, findLine("কেটে যেত").s, 1.4);
  const online = findLine("সবাই অনলাইনে").s, nest = findLine("কোথায় নীড়").s;
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${camX + (rand(f) - 0.5) * shake}px, ${(rand(f + 3) - 0.5) * shake}px)` }}>
        {/* ---------------- page 1: pocket, coins, heavy phone */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
          <div style={{ position: "absolute", left: 80, top: 60, width: 900, height: 760, background: "#2F5DA8", clipPath: tornClip(3, "both", 3), transform: "rotate(-2deg)" }} />
          <div style={{ position: "absolute", left: 1040, top: 110, width: 780, height: 700, background: C.crimson, clipPath: tornClip(5, "both", 3), transform: "rotate(2deg)" }} />
          <Halftone />
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            {/* jeans pocket */}
            <path d="M260 230 L800 230 L760 700 Q530 790 300 700 Z" fill="#244A86" stroke="#F2C14E" strokeWidth={6} strokeDasharray="16 10" />
            <path d="M300 230 Q530 380 760 230" fill="none" stroke="#F2C14E" strokeWidth={6} strokeDasharray="16 10" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const at = 56.42 + i * 0.12;
              if (t < at) return null;
              const dt = t - at, vx = (rand(i) - 0.5) * 700, vy = -900 - rand(i + 2) * 400;
              let y = 300 + vy * dt + 1800 * dt * dt;
              const floor = 760 + rand(i + 5) * 40;
              let x = 530 + vx * Math.min(dt, 0.9);
              if (y > floor) { y = floor - Math.abs(Math.sin(dt * 9)) * 60 * Math.exp(-dt * 3); }
              x = Math.min(980, Math.max(120, x));
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${dt * 400 * (i % 2 ? 1 : -1)})`}>
                  <circle r={44} fill={C.yellow} stroke="#B8860B" strokeWidth={6} />
                  <text y={18} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={50} fill="#8A5A00">৳</text>
                </g>
              );
            })}
            {/* the heavy phone */}
            {t >= 58.2 && (() => {
              const k = clamp((t - 58.2) / (thud - 58.2));
              const y = lerp(-500, 470, k * k);
              const squash = cuePulse(t, thud, 10);
              return (
                <g transform={`translate(1430 ${y}) scale(${1 + squash * 0.08} ${1 - squash * 0.08})`}>
                  <BrickPhone x={0} y={0} s={1.3} rot={6} glow={t > missed ? 1 : 0.3}>
                    {t > missed && <>
                      <text x={75} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={16} fill="#1E3A12">1 MISSED CALL</text>
                      {t > home && (
                        <g transform={`translate(75 76) scale(${backOut((t - home) / 0.3)})`}>
                          <path d="M-30 0 L0 -26 L30 0 L22 0 L22 26 L-22 26 L-22 0 Z" fill="#1E3A12" />
                          <rect x={-6} y={8} width={12} height={18} fill="#D8FF8F" />
                        </g>
                      )}
                    </>}
                  </BrickPhone>
                  {t > thud && <text x={160} y={-120} fontFamily={DISPLAY} fontWeight={800} fontSize={70} fill={C.yellow} stroke={C.ink} strokeWidth={3}
                    opacity={1 - ramp(t, thud + 0.6, 0.3)}>ধপ!</text>}
                </g>
              );
            })()}
          </svg>
        </div>
        {/* ---------------- page 2: CD, blue ink, discman, dusk */}
        <div style={{ position: "absolute", left: 1920, top: 0, width: 1920, height: 1080 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${C.paper}, ${C.paper})` }} />
          <div style={{ position: "absolute", inset: 0, opacity: dusk, background: `linear-gradient(#3B1D5A 0%, ${C.dusk} 35%, ${C.orange} 70%, ${C.amber} 100%)` }} />
          <div style={{ position: "absolute", left: 1290, top: 520 + (1 - dusk) * 300, width: 260, height: 260, borderRadius: "50%", background: C.yellow, opacity: dusk, boxShadow: `0 0 120px ${C.amber}` }} />
          <div style={{ position: "absolute", left: 120, top: 80, width: 1000, height: 780, background: "#1A1A1A", clipPath: tornClip(11, "both", 3), transform: "rotate(-1.5deg)", opacity: 1 - dusk }} />
          {(() => {
            const inPlayer = ramp(t, album, 0.8);
            const cx = lerp(620, 1420, inPlayer), cy = lerp(460, 640, inPlayer), sc = lerp(1, 0.62, inPlayer);
            const spin = t * lerp(25, 420, inPlayer);
            return (
              <>
                {inPlayer > 0 && (
                  <div style={{ position: "absolute", left: 1420 - 280, top: 640 - 280, width: 560, height: 560, borderRadius: "50%", background: "#BFC3C9", border: "10px solid #8D9199", opacity: inPlayer }} />
                )}
                <div style={{ position: "absolute", left: cx - 300, top: cy - 300, width: 600, height: 600, transform: `scale(${sc}) rotate(${spin}deg)` }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, #e8e8f0, #9ff3ff, #ffe1fb, #fff7b0, #c9ffd6, #e8e8f0, #b8d4ff, #ffd0e8, #e8e8f0)" }} />
                  <div style={{ position: "absolute", left: 250, top: 250, width: 100, height: 100, borderRadius: "50%", background: C.paper, border: "18px solid #cfd3da" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: PLAY, fontWeight: 700, fontSize: 70, color: "#1E4FD8",
                    clipPath: `inset(0 ${100 - clamp((t - write.s) / (write.e - write.s)) * 100}% 0 0)`, transform: "rotate(-8deg)" }}>বিকেলের গান</div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: PLAY, fontWeight: 700, fontSize: 40, color: "#1E4FD8",
                    opacity: ramp(t, write.e - 0.3, 0.3) }}>— mix ২০০৪ —</div>
                </div>
              </>
            );
          })()}
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            {/* marker pen while writing */}
            {t > write.s - 0.2 && t < write.e + 0.3 && (() => {
              const k = clamp((t - write.s) / (write.e - write.s));
              return <g transform={`translate(${430 + k * 380} ${330 + Math.sin(k * 30) * 8}) rotate(-35)`}>
                <rect x={-14} y={-150} width={28} height={150} rx={6} fill="#1E4FD8" /><path d="M-14 0 L14 0 L0 26 Z" fill="#0B1E5C" />
              </g>;
            })()}
            {t > notes && [0, 1, 2, 3, 4].map((i) => {
              const dt = t - notes - i * 0.25;
              if (dt < 0) return null;
              const x = 700 + i * 110 + Math.sin(dt * 3 + i) * 30, y = 520 - dt * 140;
              return <text key={i} x={x} y={y} fontSize={80} fill="#1E4FD8" opacity={clamp(1 - dt / 3.5)}>{i % 2 ? "♪" : "♫"}</text>;
            })}
          </svg>
        </div>
        {/* ---------------- page 3: school field → avatars → empty nest */}
        <div style={{ position: "absolute", left: 3840, top: 0, width: 1920, height: 1080 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(#FFB45E 0%, #FFD89A 45%, ${C.paper} 100%)` }} />
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <circle cx={1500} cy={260} r={110} fill="#FFF0B8" />
            {/* school */}
            <rect x={160} y={360} width={760} height={330} fill="#B5533C" />
            {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={190 + (i % 5) * 145} y={400 + Math.floor(i / 5) * 140} width={90} height={90} fill="#F7E2B5" />)}
            <rect x={950} y={250} width={8} height={440} fill="#333" />
            <rect x={958} y={250} width={130} height={80} fill="#006A4E" /><circle cx={1015} cy={290} r={26} fill="#F42A41" />
            <rect x={0} y={680} width={1920} height={400} fill={C.grass} />
            <rect x={0} y={680} width={1920} height={14} fill={C.grassLit} />
            {/* goal */}
            <path d="M1380 700 L1380 560 L1720 560 L1720 700" stroke="#fff" strokeWidth={12} fill="none" />
            {/* friends playing, then lifting off as avatars */}
            {[0, 1, 2, 3].map((i) => {
              const lift = easeOut((t - online - i * 0.12) / 1.2);
              const x = 360 + i * 270 + Math.sin(t * 2 + i) * 40;
              const y = 890 - lift * (520 + i * 30);
              const cols = [C.crimson, C.cyan, C.yellow, C.magenta];
              if (lift < 0.5) {
                return <Person key={i} x={x} y={y} s={1.05} fill="#1B2A1E" arm={Math.max(0, Math.sin(t * 6 + i)) * 0.3} jump={Math.max(0, Math.sin(t * 6 + i * 1.7)) * 25} />;
              }
              return (
                <g key={i} transform={`translate(${x} ${y - 90}) scale(${lerp(0.6, 1, lift)})`}>
                  <circle r={70} fill="#fff" stroke={cols[i]} strokeWidth={10} />
                  <circle cy={-14} r={24} fill="#1B2A1E" /><path d="M-40 46 Q0 0 40 46" fill="#1B2A1E" />
                  <circle cx={50} cy={50} r={16} fill="#2EE36A" stroke="#fff" strokeWidth={5} />
                </g>
              );
            })}
            {t < online && (() => {
              const bp = beatPhase(t) % 2;
              return <circle cx={900 + Math.sin(t * 1.5) * 300} cy={860 - Math.abs(Math.sin(bp * Math.PI)) * 160} r={30} fill="#fff" stroke="#222" strokeWidth={5} />;
            })()}
            {/* the empty nest */}
            {t > nest - 0.2 && (
              <g opacity={ramp(t, nest - 0.2, 0.4)}>
                <path d="M1920 380 Q1700 420 1560 470" stroke="#5A3A24" strokeWidth={22} fill="none" strokeLinecap="round" />
                <ellipse cx={1610} cy={440} rx={110} ry={46} fill="#8A5A34" />
                <ellipse cx={1610} cy={426} rx={80} ry={24} fill="#3B2414" />
                {Array.from({ length: 14 }).map((_, i) => <line key={i} x1={1510 + i * 14} y1={430 + rand(i) * 30} x2={1540 + i * 14} y2={470 - rand(i + 4) * 30} stroke="#6B4423" strokeWidth={5} />)}
                <text x={1610} y={340} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={110} fill={C.crimson}
                  transform={`rotate(${Math.sin(t * 4) * 8} 1610 320)`}>?</text>
              </g>
            )}
            {t > online + 0.6 && <Figure x={960} y={900} scale={1.7} pose={{ shrug: ramp(t, nest, 0.4) }} fill="#1B2A1E" rim={C.yellow} question={ramp(t, nest, 0.4)} />}
          </svg>
        </div>
      </AbsoluteFill>
      <Tape line={line} t={t} />
      <Hud x={70} y={50} color={C.ink} size={24}>REC ● 2004 · SIDE A</Hud>
      <Flash amount={cuePulse(t, H.verse1, 9) * 0.7} />
    </AbsoluteFill>
  );
};

// ================================================================= PRE-CHORUS
// 78.9 – 93.8 s. Blurry photos with clear smiles; sharp photos with flat
// faces. The globe shrinks while the distance between two friends grows. A
// sun is rewound back up the sky: "একটা বিকেল ফিরিয়ে দাও".

const Face: React.FC<{ x: number; y: number; r: number; smile: number; col: string }> = ({ x, y, r, smile, col }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={col} />
    <circle cx={-r * 0.33} cy={-r * 0.15} r={r * 0.09} fill={C.ink} /><circle cx={r * 0.33} cy={-r * 0.15} r={r * 0.09} fill={C.ink} />
    <path d={`M${-r * 0.4} ${r * 0.28} Q0 ${r * 0.28 + smile * r * 0.45} ${r * 0.4} ${r * 0.28}`} stroke={C.ink} strokeWidth={r * 0.08} fill="none" strokeLinecap="round" />
  </g>
);

export const PreChorus: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Pre-Chorus"]);
  const m2 = findLine("এখন ছবি").s, m3 = findLine("পৃথিবীটা").s, m4 = findLine("একটা বিকেল ফিরিয়ে").s;
  const build = ramp(t, 86, 7.8);
  const b = bassSmooth(f, 2);
  let body: React.ReactNode;
  if (t < m2 - 0.1) {
    const sharp = ramp(t, findLine("মুখগুলো").s, 0.6);
    body = (
      <svg width={1920} height={1080}>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${560 + i * 800} ${470}) rotate(${i ? 6 : -5})`}>
            <rect x={-300} y={-300} width={600} height={680} fill="#FDFBF4" />
            <g style={{ filter: `blur(${lerp(9, 3, sharp)}px)` }}>
              <rect x={-260} y={-260} width={520} height={480} fill={i ? "#6FA8C7" : "#E09A55"} />
              <rect x={-260} y={60} width={520} height={160} fill={C.grass} />
            </g>
            {[0, 1, 2].map((j) => <Face key={j} x={-150 + j * 150} y={-20 + (j % 2) * 30} r={58} smile={lerp(0.6, 1, sharp)} col={["#F6C28B", "#E8A87C", "#D9935F"][j]} />)}
            <text x={0} y={330} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={38} fill="#1E4FD8">{i ? "পিকনিক '০৩" : "ক্লাস টেন"}</text>
          </g>
        ))}
        <rect x={500} y={150} width={120} height={36} fill="rgba(255,240,180,0.8)" transform="rotate(-20 560 168)" />
        <rect x={1300} y={150} width={120} height={36} fill="rgba(255,240,180,0.8)" transform="rotate(14 1360 168)" />
      </svg>
    );
  } else if (t < m3 - 0.1) {
    const crack = ramp(t, findLine("কেন কষ্ট").words[2].s, 0.15);
    body = (
      <svg width={1920} height={1080}>
        <SmartPhone x={960} y={500} s={1.3} rot={0} screen="#101722">
          <rect x={0} y={60} width={300} height={500} fill="#9DB7D6" />
          {[0, 1, 2].map((j) => <Face key={j} x={60 + j * 90} y={300} r={38} smile={-0.25} col={["#F6C28B", "#E8A87C", "#D9935F"][j]} />)}
          {[0, 1, 2].map((j) => <rect key={j} x={44 + j * 90} y={350} width={32} height={50} rx={6} fill="#111" />)}
          <text x={14} y={44} fontFamily={MONO} fontSize={22} fill="#fff">4K · HDR</text>
          <circle cx={150} cy={590} r={22} fill="#fff" />
          {crack > 0 && <path d="M40 120 L130 240 L110 300 L190 380 L170 450 L260 540 M130 240 L60 290 M190 380 L270 350" stroke="#fff" strokeWidth={4} fill="none" opacity={crack} />}
        </SmartPhone>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={560 + i * 220} y={120} width={140} height={14} fill={C.cyan} opacity={0.3} />)}
      </svg>
    );
  } else if (t < m4 - 0.1) {
    const k = clamp((t - m3) / (m4 - m3));
    const R = lerp(300, 80, k), gap = lerp(320, 860, k);
    body = (
      <svg width={1920} height={1080}>
        <g transform="translate(960 420)">
          <circle r={R} fill="#1E5AA8" stroke={C.cyan} strokeWidth={6} />
          {[-0.6, -0.2, 0.2, 0.6].map((m, i) => <ellipse key={i} rx={R * Math.abs(Math.cos(m * 2 + t))} ry={R} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.6} />)}
          {[-0.5, 0, 0.5].map((p, i) => <line key={i} x1={-R * Math.sqrt(1 - p * p)} x2={R * Math.sqrt(1 - p * p)} y1={p * R} y2={p * R} stroke={C.cyan} strokeWidth={2} opacity={0.6} />)}
        </g>
        <Person x={960 - gap} y={930} s={1.4} fill={C.white} />
        <Person x={960 + gap} y={930} s={1.4} fill={C.white} />
        <line x1={960 - gap + 40} y1={800} x2={960 + gap - 40} y2={800} stroke={C.yellow} strokeWidth={6} strokeDasharray="20 14" />
        <text x={960} y={780} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={C.yellow}>{Math.round(lerp(2, 9800, k * k)).toLocaleString("en")} km</text>
      </svg>
    );
  } else {
    const k = clamp((t - m4) / 2.0);
    const sunY = lerp(760, 300, easeOut(k));
    body = (
      <AbsoluteFill style={{ background: `linear-gradient(#FF8A3D 0%, #FFC46B ${lerp(60, 30, k)}%, #FFE3A8 100%)` }}>
        <svg width={1920} height={1080}>
          {[1, 2, 3, 4].map((i) => <circle key={i} cx={960} cy={sunY + i * 60} r={130} fill="#FFF3C4" opacity={0.18 / i} />)}
          <circle cx={960} cy={sunY} r={130} fill="#FFF3C4" />
          <text x={960} y={sunY + 24} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={64} fill={C.orange}>◀◀</text>
          <rect x={0} y={820} width={1920} height={260} fill="#3B2A1A" />
          {[0, 1, 2, 3, 4].map((i) => <Person key={i} x={420 + i * 270} y={860} s={1.1} fill="#2A1A10" arm={ramp(t, findLine("বাকি সবই").s, 0.4) * 0.8} />)}
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.navy}, ${C.obsidian} 80%)` }}>
      <AbsoluteFill style={{ transform: `scale(${1 + build * 0.08 + b * 0.015})` }}>{body}</AbsoluteFill>
      {line && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
          <Kinetic line={line} t={t} st={{ size: 104, shadow: `6px 6px 0 ${C.crimson}, 0 0 30px rgba(0,0,0,0.6)` }} />
        </AbsoluteFill>
      )}
      <Flash amount={ramp(t, 93.2, 0.6) * 0.9} />
    </AbsoluteFill>
  );
};

// ===================================================================== CHORUS
// 93.8 – 124.6 s (and the final chorus, warm, 204.1 – 233.0 s). A tunnel of
// signal rings flies at the camera on every beat. Each line brings its prop:
// a download bar filling with an afternoon, an airplane-mode switch flipped
// on, the friends waiting at the tunnel's end. In the final chorus they are
// on the roof with him, and the corner signal icon is made of people.

export const Chorus: React.FC<SceneProps & { final?: boolean }> = ({ t, f, final = false }) => {
  const sec = final ? "Final Chorus" : "Chorus";
  const base = final ? 109.9 : 0;
  const line = lineAt(t, [sec]);
  const ph = beatPhase(t);
  const b = bassSmooth(f, 1);
  const pal = final ? [C.yellow, C.orange, C.magenta, C.cream] : [C.crimson, C.magenta, C.cyan, C.yellow];
  const L = (has: string) => findLine(has, 90 + base);
  const dl = L("ডাউনলোড"), air = L("অফলাইন যাই"), friends = L("যেখানে সব"), mega = L("হাজার মেগার"), heart = L("কানেক্টেড");
  const tag1 = L("ও-ও-ও... Signal"), tag2 = L("ও-ও-ও... অফলাইন");
  const N = 14;
  const rings = Array.from({ length: N }).map((_, i) => {
    const z = ((i - ph * 0.5) % N + N) % N / N;      // 0 near … 1 far
    const s = 0.08 + Math.pow(1 - z, 3) * 3.2;
    return { s, i: (i % 4), z };
  }).sort((a, c) => c.z - a.z);
  const bgTop = final ? "#5A1E3C" : C.midnight, bgBot = final ? "#FF7A3D" : "#220A3A";
  const fr = ramp(t, friends.s, 0.6);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, ${bgBot}, ${bgTop} 70%)`, overflow: "hidden" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g transform={`translate(960 500) rotate(${Math.sin(t * 0.4) * 6})`}>
          {rings.map((r, k) => (
            <rect key={k} x={-480 * r.s} y={-300 * r.s} width={960 * r.s} height={600 * r.s} rx={120 * r.s} fill="none"
              stroke={pal[r.i]} strokeWidth={Math.max(2, 22 * r.s * (1 + b * 0.5))} opacity={clamp(1.2 - r.z) * 0.85} />
          ))}
          {/* wifi at the vanishing point */}
          {[1, 2, 3].map((i) => (
            <path key={i} d={`M${-40 * i} ${10 - 10 * i} A ${55 * i} ${55 * i} 0 0 1 ${40 * i} ${10 - 10 * i}`} stroke={C.white} strokeWidth={10} fill="none"
              opacity={0.25 + 0.75 * clamp(beatPulse(t - i * 0.08, 6))} strokeLinecap="round" />
          ))}
          <circle cy={18} r={12} fill={C.white} />
        </g>
        {/* 1000 MB flying out */}
        {t > mega.s && t < mega.e + 0.6 && Array.from({ length: 10 }).map((_, i) => {
          const p = ((t - mega.s) * 0.7 + i / 10) % 1;
          const a = rand(i) * Math.PI * 2;
          return <text key={i} x={960 + Math.cos(a) * p * 1100} y={500 + Math.sin(a) * p * 650} fontSize={20 + p * 90} fontFamily={MONO} fontWeight={700}
            fill={pal[i % 4]} textAnchor="middle" opacity={p}>{["1000MB", "4G", "5G", "∞ GB"][i % 4]}</text>;
        })}
        {/* friends at the tunnel end */}
        {fr > 0 && [0, 1, 2, 3].map((i) => (
          <Person key={i} x={960 + (i - 1.5) * lerp(40, 190, fr)} y={lerp(560, 960, fr)} s={lerp(0.25, 1.35, fr)} fill={final ? "#2A0F1A" : "#05030C"}
            arm={downbeatPulse(t, 4) * 0.7 + (i % 2) * 0.2} jump={beatPulse(t - i * 0.05, 7) * 30 * fr} />
        ))}
      </svg>
      {/* connected heart */}
      {t > heart.s && t < heart.e + 0.4 && (
        <svg width={1920} height={1080} style={{ position: "absolute", opacity: win(t, heart.s, heart.e + 0.3, 0.3) }}>
          <g transform={`translate(960 760) scale(${2.4 + beatPulse(t) * 0.5})`}>
            <path d="M0 22 C -36 -6 -26 -36 0 -18 C 26 -36 36 -6 0 22 Z" fill={C.magenta} />
            {[1, 2].map((i) => <path key={i} d={`M${-14 * i} ${-30 - 9 * i} A ${18 * i} ${18 * i} 0 0 1 ${14 * i} ${-30 - 9 * i}`} stroke={C.white} strokeWidth={4} fill="none" />)}
          </g>
        </svg>
      )}
      {/* download bar */}
      {t > dl.s - 0.2 && t < dl.e + 1.6 && (() => {
        const k = clamp((t - dl.s) / (dl.e - dl.s + 0.6));
        return (
          <div style={{ position: "absolute", left: 460, top: 690, width: 1000, opacity: win(t, dl.s - 0.1, dl.e + 1.4, 0.3), transform: `scale(${backOut((t - dl.s + 0.2) / 0.3)})` }}>
            <div style={{ fontFamily: MONO, fontSize: 34, color: C.white, marginBottom: 10 }}>⬇ বিকেল.mp4 &nbsp; {Math.round(k * 100)}%</div>
            <div style={{ height: 70, border: `6px solid ${C.white}`, borderRadius: 14, padding: 6, background: "rgba(0,0,0,0.4)" }}>
              <div style={{ height: "100%", width: `${k * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.dusk}, ${C.orange}, ${C.yellow})` }} />
            </div>
          </div>
        );
      })()}
      {/* airplane-mode switch */}
      {t > air.s - 0.2 && t < air.e + 0.8 && (() => {
        const on = smooth((t - air.words[2].s) / 0.2);
        return (
          <div style={{ position: "absolute", left: 960 - 230, top: 720, opacity: win(t, air.s - 0.1, air.e + 0.6, 0.3), display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ fontSize: 100, transform: `translateX(${on * 30}px) rotate(${-on * 20}deg)`, color: C.white }}>✈</div>
            <div style={{ width: 230, height: 120, borderRadius: 60, background: on > 0.5 ? C.yellow : "#555", position: "relative", border: `6px solid ${C.white}` }}>
              <div style={{ position: "absolute", top: 8, left: 10 + on * 110, width: 92, height: 92, borderRadius: "50%", background: C.white }} />
            </div>
          </div>
        );
      })()}
      {/* oh-oh tags */}
      {[tag1, tag2].map((tg, i) => {
        if (t < tg.s - 0.1 || t > tg.e + 0.5) return null;
        const oh = tg.words[0];
        if (t > tg.words[1].s - 0.05) return null;
        return (
          <div key={i} style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 200,
            color: pal[(Math.floor(beatPhase(t)) % 4)], textShadow: `10px 10px 0 ${C.obsidian}`, opacity: ramp(t, oh.s, 0.2),
            transform: `scale(${1 + beatPulse(t, 8) * 0.12}) rotate(${Math.sin(t * 5) * 4}deg)` }}>ও-ও-ও...</div>
        );
      })}
      {line && !(line.text.startsWith("ও-ও-ও") && t < line.words[1].s - 0.05) && (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: line.text.startsWith("ও") ? 380 : 120 }}>
          <Kinetic line={line.text.startsWith("ও") ? { ...line, words: line.words.slice(1) } : line} t={t}
            st={{ size: 150, color: C.white, active: final ? C.yellow : C.yellow, shadow: `9px 9px 0 ${final ? C.magenta : C.crimson}, 0 0 40px rgba(0,0,0,0.5)` }} />
        </AbsoluteFill>
      )}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Bars x={1690} y={170} h={100} level={final ? 4 : Math.floor(t * 4) % 2} cross={final ? 0 : 1} color={final ? C.yellow : C.white} people={final ? ramp(t, 206, 1) : 0} />
      </svg>
      {final && <LightLeak t={t} amount={0.5} />}
      {final && <Confetti t={t} from={H.final} />}
      <Dust t={t} n={26} opacity={0.4} />
      <Flash amount={cuePulse(t, final ? H.final : H.chorus1, 6) * 0.9} />
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  const cols = [C.yellow, C.magenta, C.cyan, C.crimson, C.white];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {Array.from({ length: 70 }).map((_, i) => {
        const dt = t - from - rand(i) * 3;
        if (dt < 0) return null;
        const y = ((-80 + dt * (160 + rand(i + 3) * 160)) % 1200);
        const x = rand(i + 7) * 1920 + Math.sin(dt * 2 + i) * 60;
        return <rect key={i} x={x} y={y} width={14} height={24} fill={cols[i % 5]} transform={`rotate(${dt * 300 + i * 40} ${x + 7} ${y + 12})`} />;
      })}
    </svg>
  );
};

export { rgba };
