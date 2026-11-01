import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, POSTER, MONO, PLAY, PIXEL } from "./fonts";
import { Kinetic, Slam, BrickPhone, SmartPhone, Person, Spectrum, Hud, Flash, tornClip, Bubble } from "./kit";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, lineAt, beatPulse, downbeatPulse,
  bassSmooth, cuePulse, beatPhase, backOut, lastIndex, Line,
} from "./lib";
import { SceneProps } from "./scenesA";

// ======================================================================= DROP
// 124.6 – 140.3 s. The instrumental drop is a level of an 8-bit game: the boy
// runs the year 2004, jumping the Wi-Fi symbols on every downbeat, coins in
// the HUD, the spectrum as a pixel skyline. The bass cuts — the TV loses
// signal, "Signal! Signal!" — and "নাই!" slams.

const P = 12;
const SPRITE = [
  "...hhhh...", "..hhhhhh..", "..hsssss..", "..ssksks..", "..ssssss..", "...ssss...",
  "..rrrrrr..", ".rrrrrrrr.", ".srrrrrrs.", ".srrrrrrs.", "..bbbbbb..", "..bb..bb..",
];
const LEGS = [["..bb..bb..", ".kk....kk."], ["...bbbb...", "...kkkk..."]];
const COL: Record<string, string> = { h: "#2A1A10", s: "#F2B98A", k: "#111", r: C.crimson, b: "#2F5DA8" };

const Sprite: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const rows = [...SPRITE, ...LEGS[frame % 2]];
  return (
    <g transform={`translate(${x} ${y})`}>
      {rows.flatMap((r, j) => r.split("").map((c, i) => (c === "." ? null : <rect key={`${i}-${j}`} x={i * P} y={j * P} width={P} height={P} fill={COL[c]} />)))}
    </g>
  );
};

const WIFI = [".xxxxxxx.", "x.......x", "..xxxxx..", ".x.....x.", "...xxx...", "....x...."];

export const Drop: React.FC<SceneProps> = ({ t, f }) => {
  const sig = findLine("Signal! Signal!", 130), nai = findLine("নাই!", 139);
  const cut = t >= H.cut;
  const naiOn = t >= nai.s;
  const ph = beatPhase(t);
  const scroll = (t - H.drop) * 420;
  const groundY = 840;
  // jump on each downbeat
  const di = lastIndex(D.downbeats, t);
  const dj = di >= 0 ? t - D.downbeats[di] : 9;
  const jump = dj < 0.45 ? Math.sin((dj / 0.45) * Math.PI) * 190 : 0;
  const score = 2004 + Math.max(0, lastIndex(D.beats, t) - lastIndex(D.beats, H.drop)) * 50;
  if (naiOn) {
    return (
      <AbsoluteFill style={{ background: C.obsidian, alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${1 + cuePulse(t, nai.s, 5) * 0.4})`, fontFamily: DISPLAY, fontWeight: 800, fontSize: 520, color: C.crimson,
          textShadow: `16px 16px 0 ${C.yellow}, -10px -8px 0 ${C.cyan}` }}>নাই!</div>
      </AbsoluteFill>
    );
  }
  if (cut) {
    const bars = ["#C0C0C0", "#C0C000", "#00C0C0", "#00C000", "#C000C0", "#C00000", "#0000C0"];
    return (
      <AbsoluteFill>
        <div style={{ display: "flex", height: "100%" }}>{bars.map((b) => <div key={b} style={{ flex: 1, background: b }} />)}</div>
        <AbsoluteFill style={{ background: "rgba(0,0,40,0.45)" }} />
        <div style={{ position: "absolute", top: 80, width: "100%", textAlign: "center", fontFamily: PIXEL, fontSize: 40, color: "#fff" }}>NO SIGNAL</div>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Kinetic line={sig} t={t} st={{ font: PIXEL, weight: 400, size: 120, color: C.white, active: C.yellow, shadow: `8px 8px 0 ${C.obsidian}`, spread: 0.4 }} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#120A2E" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }} shapeRendering="crispEdges">
        {Array.from({ length: 60 }).map((_, i) => (
          <rect key={i} x={Math.round(((rand(i) * 1920 - scroll * 0.1) % 1920 + 1920) % 1920 / P) * P} y={Math.round(rand(i + 3) * 420 / P) * P} width={P / 2} height={P / 2}
            fill="#fff" opacity={(Math.floor(t * 4 + i) % 3) ? 0.9 : 0.3} />
        ))}
        {/* pixel moon */}
        {Array.from({ length: 64 }).map((_, i) => {
          const x = i % 8, y = Math.floor(i / 8), d = Math.hypot(x - 3.5, y - 3.5);
          return d < 4 && Math.hypot(x - 5, y - 2.5) > 2.6 ? <rect key={i} x={1500 + x * P} y={150 + y * P} width={P} height={P} fill={C.yellow} /> : null;
        })}
        {/* spectrum skyline */}
        <Spectrum f={f} x={0} y={groundY} w={1920} h={420} color="#3B1F78" count={32} pixel={P * 2} />
        <Spectrum f={f} x={30} y={groundY} w={1920} h={300} color={C.magenta} count={64} pixel={P} />
        {/* ground */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = ((i * 96 - scroll) % 2112 + 2112) % 2112 - 96;
          return <g key={i}><rect x={x} y={groundY} width={96} height={240} fill="#7A3B1E" /><rect x={x} y={groundY} width={96} height={P * 2} fill={C.grassLit} /><rect x={x + 90} y={groundY} width={6} height={240} fill="#5A2A12" /></g>;
        })}
        {/* wifi obstacles: one per downbeat ahead */}
        {D.downbeats.filter((d) => d > H.drop && d < H.cut + 1).map((d, i) => {
          const x = 560 + (d - t) * 420;
          if (x < -200 || x > 2000) return null;
          return <g key={i} transform={`translate(${x} ${groundY - WIFI.length * P - 4})`}>
            {WIFI.flatMap((r, j) => r.split("").map((c, k) => (c === "x" ? <rect key={`${k}-${j}`} x={k * P} y={j * P} width={P} height={P} fill={C.cyan} /> : null)))}
          </g>;
        })}
        {/* coins: one per beat, collected overhead */}
        {D.beats.filter((b) => b > H.drop && b < H.cut).map((b, i) => {
          const x = 620 + (b - t) * 420;
          if (x < 520 || x > 2000) return null;
          return <rect key={i} x={x} y={groundY - 330 - (i % 2) * 40} width={P * 3} height={P * 3} fill={C.yellow} stroke="#B8860B" strokeWidth={4} />;
        })}
        <Sprite x={560} y={groundY - 14 * P - jump} frame={Math.floor(ph * 2)} />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: PIXEL, fontSize: 30, color: "#fff", lineHeight: 1.7 }}>
        SCORE {String(score).padStart(6, "0")}<br />LEVEL 2004
      </div>
      <div style={{ position: "absolute", right: 60, top: 50, fontFamily: PIXEL, fontSize: 30, color: C.crimson, textAlign: "right", lineHeight: 1.7 }}>
        SIGNAL<br /><span style={{ color: "#555" }}>▯▯▯▯</span>
      </div>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: PIXEL, fontSize: 90, color: C.yellow,
        textShadow: `8px 8px 0 ${C.crimson}`, opacity: win(t, H.drop, H.drop + 2.2, 0.2), transform: `scale(${1 + downbeatPulse(t, 6) * 0.1})` }}>
        PLAYER 1
      </div>
      <Flash amount={cuePulse(t, H.drop, 6) * 0.8 + downbeatPulse(t, 14) * 0.12} />
    </AbsoluteFill>
  );
};

// ==================================================================== VERSE 2
// 140.3 – 155.5 s. Split screen, আগে (warm, analog) against এখন (cold,
// digital), one pairing per couplet. Then the chat ("ব্যস্ত আছি" / "হুম"), tea
// in a Zoom grid, a thousand contacts, and calendar pages tearing: "পরে আসে কাল".

const V2 = () => D.lines.filter((l) => l.section === "Verse 2");

const Half: React.FC<{ side: "l" | "r"; on: number; children: React.ReactNode; line?: Line; t: number }> = ({ side, on, children, line, t }) => {
  const warm = side === "l";
  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: warm ? 0 : 960, width: 960, overflow: "hidden",
      background: warm ? `radial-gradient(circle at 50% 40%, #FFE2A8, #E89A4A 90%)` : `radial-gradient(circle at 50% 40%, #2A3B55, ${C.coldBg} 90%)` }}>
      <div style={{ position: "absolute", top: 40, left: warm ? 50 : undefined, right: warm ? undefined : 50, fontFamily: POSTER, fontSize: 90,
        color: warm ? C.crimson : C.cyan, transform: `rotate(${warm ? -6 : 6}deg)`, textShadow: `5px 5px 0 ${warm ? C.ink : "#000"}` }}>{warm ? "আগে" : "এখন"}</div>
      <div style={{ position: "absolute", inset: 0, opacity: on, transform: `scale(${lerp(0.85, 1, backOut(on))})` }}>{children}</div>
      {line && (
        <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Kinetic line={line} t={t} st={{ size: 82, maxWidth: 900, color: warm ? C.ink : C.white, active: warm ? C.crimson : C.cyan,
            shadow: warm ? `4px 4px 0 ${C.yellow}` : `4px 4px 0 #000`, mode: "pop" }} />
        </div>
      )}
    </div>
  );
};

export const Verse2: React.FC<SceneProps> = ({ t, f }) => {
  const ls = V2();
  let idx = -1;
  ls.forEach((l, i) => { if (l.s - 0.12 <= t) idx = i; });
  idx = Math.max(0, idx);
  const pair = Math.floor(idx / 2);
  const A = ls[pair * 2], B = ls[pair * 2 + 1];
  const onA = ramp(t, A.s - 0.1, 0.18), onB = ramp(t, B.s - 0.1, 0.18);
  const hold = (l: Line) => ({ ...l, e: Math.max(l.e, (ls[pair * 2 + 2]?.s ?? 155.4) - 0.1) });
  const bump = beatPulse(t, 10);
  let left: React.ReactNode = null, right: React.ReactNode = null, full: React.ReactNode = null;
  if (pair === 0) {
    left = (
      <svg width={960} height={1080}>
        <g transform={`translate(${480 + Math.sin(t * 60) * 6 * bump} 520)`}><BrickPhone x={0} y={0} s={0.8} glow={1}>
          <text x={75} y={60} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={18} fill="#1E3A12">♪ RING ♪</text></BrickPhone></g>
        {[0, 1, 2].map((i) => <text key={i} x={250 + i * 220} y={300 - ((t * 120 + i * 60) % 160)} fontSize={80} fill={C.crimson}>♪</text>)}
      </svg>
    );
    right = (
      <svg width={960} height={1080}>
        <SmartPhone x={480} y={520} s={1.05}>
          {Array.from({ length: 12 }).map((_, i) => {
            const y = ((i * 170 - (t - B.s) * 2400) % 2040 + 2040) % 2040 - 200;
            return <g key={i}><rect x={16} y={y} width={268} height={150} rx={14} fill={["#3A4A66", "#5A3A66", "#2E5A5A"][i % 3]} />
              <circle cx={50} cy={y + 30} r={16} fill="#8FA3B8" /><rect x={76} y={y + 22} width={120} height={14} rx={7} fill="#8FA3B8" /></g>;
          })}
        </SmartPhone>
      </svg>
    );
  } else if (pair === 1) {
    const k = ((t - A.s) * 1.6) % 1;
    left = (
      <svg width={960} height={1080}>
        <rect x={0} y={700} width={960} height={380} fill={C.grass} />
        <path d="M620 700 L620 520 L900 520 L900 700" stroke="#fff" strokeWidth={10} fill="none" />
        <Person x={260} y={820} s={1.3} fill="#2A1A10" arm={0.3} />
        <circle cx={lerp(330, 760, k)} cy={780 - Math.sin(k * Math.PI) * 260} r={34} fill="#fff" stroke="#222" strokeWidth={5} />
      </svg>
    );
    right = (
      <svg width={960} height={1080}>
        <SmartPhone x={480} y={520} s={1.05}>
          <text x={150} y={90} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#fff">Recents</text>
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i} opacity={ramp(t, B.s + i * 0.08, 0.1)}><text x={24} y={160 + i * 62} fontFamily={MONO} fontSize={24} fill={C.crimson}>✆ Missed call</text>
              <text x={276} y={160 + i * 62} textAnchor="end" fontFamily={MONO} fontSize={20} fill="#8FA3B8">({12 - i})</text></g>
          ))}
        </SmartPhone>
      </svg>
    );
  } else if (pair === 2) {
    left = (
      <svg width={960} height={1080}>
        <g transform={`translate(480 480) rotate(${-12 + Math.sin(t * 3) * 3})`}>
          <rect x={-90} y={-220} width={180} height={340} rx={24} fill="#C9372C" />
          <rect x={-60} y={-300} width={120} height={90} fill="#D9D9D9" /><rect x={-36} y={-280} width={24} height={20} fill="#555" /><rect x={12} y={-280} width={24} height={20} fill="#555" />
          <rect x={-70} y={-100} width={140} height={110} rx={8} fill={C.paper} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={40} fill="#1E4FD8">গান ২</text>
        </g>
      </svg>
    );
    right = (
      <svg width={960} height={1080}>
        <g transform={`translate(480 ${460 - bump * 10})`}>
          <path d="M-220 60 Q-240 -60 -120 -60 Q-90 -170 30 -150 Q140 -200 180 -70 Q280 -60 250 60 Z" fill="#DCE6F2" />
          <path d="M0 40 L0 -70 M-40 -30 L0 -70 L40 -30" stroke={C.coldBg} strokeWidth={18} fill="none" strokeLinecap="round" />
        </g>
        <rect x={360} y={600} width={240} height={14} rx={7} fill="#8FA3B8" /><rect x={360} y={600} width={240 * clamp((t - B.s) / 0.8)} height={14} rx={7} fill={C.cyan} />
      </svg>
    );
  } else if (pair === 3) {
    left = (
      <svg width={960} height={1080}>
        <g transform={`translate(480 470) scale(${1 + bump * 0.05})`}>
          <circle r={210} fill="#F6C28B" />
          <circle cx={-70} cy={-50} r={22} fill={C.ink} /><circle cx={70} cy={-50} r={22} fill={C.ink} />
          <path d="M-120 40 Q0 170 120 40 Z" fill="#7A1E1E" /><path d="M-100 52 Q0 90 100 52" stroke="#fff" strokeWidth={18} fill="none" />
          <circle cx={-130} cy={30} r={30} fill="#FF9A8A" opacity={0.6} /><circle cx={130} cy={30} r={30} fill="#FF9A8A" opacity={0.6} />
        </g>
      </svg>
    );
    right = (
      <svg width={960} height={1080}>
        <SmartPhone x={480} y={520} s={1.05}>
          <rect x={150} y={330} width={130} height={110} rx={30} fill="#2F80ED" />
          <g transform={`translate(215 385) scale(${backOut((t - B.words[2].s) / 0.3)})`}><circle r={40} fill={C.yellow} /><circle cx={-13} cy={-8} r={5} fill="#333" /><circle cx={13} cy={-8} r={5} fill="#333" /><path d="M-16 10 Q0 24 16 10" stroke="#333" strokeWidth={5} fill="none" /></g>
          <text x={276} y={470} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#8FA3B8">Sent ✓✓</text>
        </SmartPhone>
      </svg>
    );
  } else if (pair === 4) {
    full = (
      <AbsoluteFill style={{ background: `linear-gradient(${C.coldBg}, #0D1420)` }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "#22324A", display: "flex", alignItems: "center", paddingLeft: 60, gap: 24, fontFamily: PLAY, fontWeight: 700, fontSize: 44, color: "#fff" }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.cyan }} /> বন্ধু <span style={{ fontFamily: MONO, fontSize: 24, color: "#8FA3B8" }}>last seen recently</span>
        </div>
        <Bubble t={t} at={A.words[2].s} x={160} y={460} text="ব্যস্ত আছি" bg="#2A3B55" color="#fff" size={96} />
        <Bubble t={t} at={B.words[2].s} x={1760} y={700} side="r" text="হুম" bg={C.cyan} color={C.ink} size={96} />
        <div style={{ position: "absolute", left: 160, top: 790, fontFamily: MONO, fontSize: 30, color: "#8FA3B8", opacity: win(t, A.s, B.words[2].s - 0.1, 0.1) }}>typing…</div>
      </AbsoluteFill>
    );
  } else if (pair === 5) {
    left = (
      <svg width={960} height={1080}>
        <rect x={0} y={640} width={960} height={440} fill="#7A4A2A" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${180 + i * 200} 600)`}>
            <path d="M-50 -90 L50 -90 L40 0 L-40 0 Z" fill="#fff" /><rect x={-46} y={-80} width={92} height={22} fill="#B5733C" />
            {[0, 1].map((j) => <path key={j} d={`M${-14 + j * 26} -110 q 14 -30 0 -60 q -14 -30 0 -60`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.5 + 0.4 * Math.sin(t * 4 + i + j)} transform={`translate(0 ${-((t * 30) % 20)})`} />)}
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => <Person key={i} x={180 + i * 200} y={1080} s={1.1} fill="#3A2214" arm={Math.max(0, Math.sin(t * 5 + i)) * 0.4} />)}
      </svg>
    );
    right = (
      <svg width={960} height={1080}>
        {[0, 1, 2, 3].map((i) => {
          const x = 110 + (i % 2) * 380, y = 200 + Math.floor(i / 2) * 330;
          return (
            <g key={i} opacity={ramp(t, B.s + i * 0.08, 0.12)}>
              <rect x={x} y={y} width={360} height={300} rx={14} fill="#1E2A3C" stroke={i === Math.floor(t * 3) % 4 ? "#4CD964" : "#33445E"} strokeWidth={6} />
              <circle cx={x + 180} cy={y + 120} r={50} fill="#8FA3B8" />
              <path d={`M${x + 160} ${y + 220} L${x + 200} ${y + 220} L${x + 196} ${y + 262} L${x + 164} ${y + 262} Z`} fill="#fff" />
              <text x={x + 20} y={y + 286} fontFamily={MONO} fontSize={22} fill={C.crimson}>🔇</text>
            </g>
          );
        })}
        <text x={480} y={880} textAnchor="middle" fontFamily={MONO} fontSize={30} fill={C.cyan}>Meeting: চা? · 45 min</text>
      </svg>
    );
  } else if (pair === 6) {
    const names = ["আবির", "অনিক", "বাবু", "চয়ন", "দীপু", "ফাহিম", "হাসান", "ইমন", "জয়", "কাজল", "লিটন", "মামুন", "নাদিম", "অপু", "পলাশ", "রনি", "সাকিব", "তানভীর", "উৎস", "ভাইয়া"];
    const sc = (t - A.s) * 1300;
    full = (
      <AbsoluteFill style={{ background: C.coldBg }}>
        <svg width={1920} height={1080}>
          <SmartPhone x={960} y={450} s={1.2}>
            <text x={150} y={60} textAnchor="middle" fontFamily={MONO} fontSize={24} fill="#fff">Contacts · 1,000+</text>
            <svg y={80} width={300} height={540}>
              {Array.from({ length: 60 }).map((_, i) => {
                const y = i * 64 - (sc % (64 * 40));
                return <g key={i}><circle cx={36} cy={y + 32} r={20} fill={[C.cyan, C.magenta, C.yellow][i % 3]} opacity={0.7} />
                  <text x={70} y={y + 42} fontFamily={PLAY} fontWeight={700} fontSize={26} fill="#fff">{names[i % names.length]}</text></g>;
              })}
            </svg>
          </SmartPhone>
          <text x={1450} y={560} fontFamily={DISPLAY} fontWeight={800} fontSize={300} fill={C.crimson} opacity={ramp(t, B.s, 0.2)}
            transform={`rotate(${Math.sin(t * 5) * 6} 1520 460)`}>?</text>
        </svg>
      </AbsoluteFill>
    );
  } else {
    const later = B.s;
    const torn = Math.max(0, Math.floor((t - A.s) * 6));
    full = (
      <AbsoluteFill style={{ background: C.coldBg }}>
        {Array.from({ length: Math.min(torn, 14) }).map((_, i) => {
          const dt = t - A.s - i / 6;
          return (
            <div key={i} style={{ position: "absolute", left: 760, top: 240, width: 400, height: 460, background: C.white, borderRadius: 14,
              transform: `translate(${dt * (300 + rand(i) * 500)}px, ${dt * dt * 900 - dt * 200}px) rotate(${dt * (200 + rand(i) * 300)}deg)`, opacity: clamp(1 - dt / 1.5),
              fontFamily: POSTER, fontSize: 240, color: C.ink, textAlign: "center", paddingTop: 110 }}>{(i + 1) % 31 || 31}</div>
          );
        })}
        <div style={{ position: "absolute", left: 760, top: 240, width: 400, height: 460, background: C.white, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 110, background: C.crimson, color: "#fff", fontFamily: MONO, fontSize: 44, textAlign: "center", paddingTop: 26 }}>পরে</div>
          <div style={{ fontFamily: POSTER, fontSize: 240, color: C.ink, textAlign: "center" }}>{(Math.min(torn, 14) + 1) % 31 || 31}</div>
        </div>
        <Bubble t={t} at={A.words[2].s} x={260} y={330} text="পরে কথা" bg="#2A3B55" color="#fff" size={70} out={later + 0.8} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      {full ? (
        <>
          {full}
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
            {[A, B].map((l, i) => (t >= l.s - 0.15 && (i === 1 || t < B.s - 0.12)) ? (
              <Kinetic key={i} line={hold(l)} t={t} st={{ size: 104, active: C.cyan, shadow: `6px 6px 0 ${C.crimson}`, mode: "slam" }} />
            ) : null)}
          </AbsoluteFill>
        </>
      ) : (
        <>
          <Half side="l" on={onA} line={hold(A)} t={t}>{left}</Half>
          <Half side="r" on={onB} line={hold(B)} t={t}>{right}</Half>
          <div style={{ position: "absolute", left: 944, top: 0, width: 32, height: 1080, background: C.crimson, clipPath: tornClip(pair, "both", 0) }} />
          <div style={{ position: "absolute", left: 960, top: 520, transform: `translate(-50%,-50%) rotate(${t * 90}deg)`, width: 110, height: 110, borderRadius: "50%",
            background: C.yellow, border: `6px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: POSTER, fontSize: 52, color: C.ink }}>VS</div>
        </>
      )}
      <Flash amount={cuePulse(t, A.s, 16) * 0.25} />
    </AbsoluteFill>
  );
};
