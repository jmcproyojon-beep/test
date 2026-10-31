import React from "react";
import { AbsoluteFill } from "remotion";
import { SERIF, SANS } from "./fonts";
import { Figure, Karaoke, Bars, Flash } from "./kit";
import {
  C, D, Line, clamp, lerp, smooth, easeOut, rand, beatPulse, downbeatPulse, beatIndex,
  bassSmooth, onset, rms, lineAt, wordTime, cuePulse,
} from "./lib";

export type SceneProps = { t: number; f: number };

// =============================================================== MIRROR
// Opens and closes the video. Intro: the mirror speaks, and what stands in it
// is a flickering stranger — "তুমি নও। তোমার অভ্যাস।" Outro: the reflection
// finally matches, and the man has a face.

const MX = 1230, MY = 470, RX = 250, RY = 345;

const mirrorSpeaks = (l: Line) => !l.text.startsWith("আমি") && !l.text.startsWith("আয়না হাসল");

export const Mirror: React.FC<SceneProps & { outro?: boolean }> = ({ t, f, outro = false }) => {
  const sections = [outro ? "Outro" : "Intro"];
  const line = lineAt(t, sections);
  const warm = outro;
  const rimA = warm ? C.gold : "#9FB4C8";
  const rimB = warm ? "#8A5A1C" : "#3A4A5E";
  const sheenX = ((t * 0.12) % 1.6) - 0.3;
  const flicker = outro ? 1 : 0.32 + 0.5 * rand(Math.floor(f / 2)) + onset(f) * 0.4;
  const jitter = outro ? 0 : (rand(f * 3.1) - 0.5) * 26 * (0.3 + onset(f));
  const snap = outro ? D.snaps.outro : D.snaps.intro;
  const afterSnap = t >= snap;
  const glow = 0.25 + rms(f) * 0.5;

  return (
    <AbsoluteFill style={{ background: warm
      ? "radial-gradient(ellipse at 62% 42%, #3a2a1a 0%, #140f0b 55%, #070504 100%)"
      : "radial-gradient(ellipse at 62% 42%, #1a2740 0%, #0b0f1a 55%, #040509 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={`rim-${outro}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={rimA} /><stop offset="0.5" stopColor={rimB} /><stop offset="1" stopColor={rimA} />
          </linearGradient>
          <linearGradient id={`glass-${outro}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={warm ? "#5a4228" : "#1d2e44"} />
            <stop offset="1" stopColor={warm ? "#24170c" : "#070c14"} />
          </linearGradient>
          <clipPath id={`clip-${outro}`}><ellipse cx={MX} cy={MY} rx={RX} ry={RY} /></clipPath>
        </defs>
        {/* wallpaper stripes */}
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={i * 80} y={0} width={40} height={1080} fill={warm ? "#fff3" : "#9cf2"} opacity={0.05} />
        ))}
        {/* floor */}
        <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.5} />
        {/* mirror glow on the wall */}
        <ellipse cx={MX} cy={MY} rx={RX + 120} ry={RY + 120} fill={warm ? C.amber : C.cyan} opacity={glow * 0.12} />
        {/* glass + reflection */}
        <g clipPath={`url(#clip-${outro})`}>
          <rect x={MX - RX} y={MY - RY} width={RX * 2} height={RY * 2} fill={`url(#glass-${outro})`} />
          <g transform={`translate(${jitter} 0)`}>
            <Figure x={MX} y={MY + 330} scale={1.75} flip
              fill={outro ? C.ink : "#3b4c60"} rim={outro ? C.gold : "#7d93ab"}
              face={outro ? 1 : 0} opacity={outro ? 0.95 : flicker} />
          </g>
          {!outro && Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={MX - RX} y={MY - RY + rand(f * 7 + i) * RY * 2} width={RX * 2}
              height={2 + rand(f + i) * 5} fill="#cfe6ff" opacity={0.08 + onset(f) * 0.2} />
          ))}
          <rect x={MX - RX + sheenX * RX * 2} y={MY - RY - 40} width={90} height={RY * 2 + 80}
            fill="#fff" opacity={0.07} transform={`rotate(18 ${MX} ${MY})`} />
        </g>
        {line && mirrorSpeaks(line) && (
          <ellipse cx={MX} cy={MY} rx={RX + 6} ry={RY + 6} fill="none" stroke={warm ? C.gold : C.cyan}
            strokeWidth={22} opacity={0.35 + 0.35 * rms(f)} />
        )}
        <ellipse cx={MX} cy={MY} rx={RX} ry={RY} fill="none" stroke={`url(#rim-${outro})`} strokeWidth={30} />
        <ellipse cx={MX} cy={MY} rx={RX + 22} ry={RY + 22} fill="none" stroke={rimB} strokeWidth={4} opacity={0.8} />
        {/* the man, facing his mirror */}
        <Figure x={610} y={1000} scale={2.35} pose={{ bob: Math.sin(t * 1.6) * 2, reach: outro ? smooth((t - 342) / 2) * 0.6 : 0 }}
          face={outro ? 1 : 0} rim={outro ? C.gold : C.teal} />
        {/* vinyl / film scratches */}
        {!outro && Array.from({ length: 5 }).map((_, i) => rand(f * 13 + i) > 0.55 ? (
          <rect key={i} x={rand(f * 5 + i * 3) * 1920} y={0} width={1.5} height={1080} fill="#fff" opacity={0.12} />
        ) : null)}
      </svg>

      {/* Short things the mirror says appear IN the glass, written backwards
          and turning readable. Anything longer would be too small in there,
          so it goes up top — the rim lights up to show who is speaking. */}
      {line && mirrorSpeaks(line) && line.text.length <= 20 && (
        <div style={{ position: "absolute", left: MX - 220, top: MY - 315, width: 440, height: 240,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scaleX(${lerp(-1, 1, smooth((t - line.s) / 0.6))})` }}>
          <Karaoke line={line} t={t} st={{ size: 76, maxWidth: 420,
            color: warm ? C.cream : "#dbe9ff", active: warm ? C.gold : C.teal, weight: 700,
            shadow: warm ? "0 0 26px rgba(255,190,90,0.6)" : "0 0 26px rgba(90,200,255,0.6)" }} />
        </div>
      )}
      {line && (!mirrorSpeaks(line) || line.text.length > 20) && (
        <div style={{ position: "absolute", left: 100, top: 110, width: 1500 }}>
          <Karaoke line={line} t={t} st={{ font: mirrorSpeaks(line) ? SERIF : SANS, size: 66,
            weight: mirrorSpeaks(line) ? 700 : 400, align: "left", maxWidth: 1500,
            color: mirrorSpeaks(line) ? (warm ? C.cream : "#dbe9ff") : C.cream,
            active: warm ? C.gold : C.teal }} />
        </div>
      )}

      <Flash amount={cuePulse(t, snap, 7) * 0.9} />
      {outro && afterSnap && (
        <AbsoluteFill style={{ background: "#000", opacity: easeOut((t - snap) / 0.15),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 120, color: C.cream,
            opacity: smooth((t - snap - 0.2) / 0.5) }}>
            নিখোঁজ <span style={{ color: C.red }}>সংবাদ</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 10, color: "#cbbf9f",
            opacity: smooth((t - snap - 0.45) / 0.5) }}>RAPARRUBEL</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// =============================================================== TITLE
// The instrumental where the rubber bass enters. Title words land on
// downbeats; the faceless man walks in, one step per detected beat.

const nextDownbeat = (after: number) => D.downbeats.find((d) => d >= after) ?? after;

export const Title: React.FC<SceneProps> = ({ t, f }) => {
  const t1 = nextDownbeat(31.0), t2 = nextDownbeat(t1 + 0.2), t3 = nextDownbeat(36.5);
  const pulse = downbeatPulse(t, 4);
  const b = bassSmooth(f);
  const pop = (at: number) => (t < at ? 0 : 1 + 0.35 * Math.exp(-(t - at) * 7) * Math.cos((t - at) * 18));
  const exit = smooth((t - 57.6) / 1.2);
  const bi = beatIndex(t);
  const frac = bi >= 0 && bi + 1 < D.beats.length ? clamp((t - D.beats[bi]) / (D.beats[bi + 1] - D.beats[bi])) : 0;
  const phase = Math.PI * (bi + frac);
  const walkX = lerp(-150, 2070, clamp((t - 43) / 15.5));
  const split = 4 + b * 14;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, #1a1f4a 0%, #0b0d1e 60%, #04050b 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const r = 120 + i * 95 + pulse * 30 + ((t * 40) % 95);
          return <circle key={i} cx={960} cy={500} r={r} fill="none" stroke={i % 3 === 0 ? C.magenta : C.teal}
            strokeWidth={2 + pulse * 3} opacity={0.18 * (1 - i / 10)} />;
        })}
        <Bars frame={f} x={0} y={1080} w={1920} h={230} color={C.magenta} count={48} opacity={0.55} />
        <line x1={0} y1={930} x2={1920} y2={930} stroke={C.teal} strokeWidth={2} opacity={0.4} />
        {t > 43 && <Figure x={walkX} y={930} scale={1.25} pose={{ walk: phase }} rim={C.magenta} />}
      </svg>

      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontFamily: SANS,
        fontSize: 30, letterSpacing: 18, color: "#c9d3ff", opacity: smooth((t - 28.2) / 1.2) * (1 - smooth((t - 33.5) / 1)) }}>
        RAPARRUBEL &nbsp;PRESENTS
      </div>

      <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center",
        gap: 50, fontFamily: SERIF, fontWeight: 700, fontSize: 210, opacity: 1 - exit,
        transform: `scale(${1 + pulse * 0.035 + exit * 0.4})` }}>
        {[["নিখোঁজ", t1, C.white], ["সংবাদ", t2, C.red]].map(([w, at, col], i) => {
          const s = pop(at as number);
          if (s === 0) return null;
          return (
            <div key={i} style={{ position: "relative", transform: `scale(${s})` }}>
              <span style={{ position: "absolute", left: -split, color: C.cyan, opacity: 0.55, mixBlendMode: "screen" }}>{w as string}</span>
              <span style={{ position: "absolute", left: split, color: C.magenta, opacity: 0.55, mixBlendMode: "screen" }}>{w as string}</span>
              <span style={{ position: "relative", color: col as string, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>{w as string}</span>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", top: 620, width: "100%", textAlign: "center", fontFamily: SANS,
        fontSize: 40, letterSpacing: 14, color: C.teal, opacity: smooth((t - t3) / 0.8) * (1 - exit) }}>
        ESCAPE OF LIFE
      </div>
    </AbsoluteFill>
  );
};

// =============================================================== CITY
// Verse 1. "ঘড়ির পেটে বন্দি দুপুর" — a clock owns the sky; its second hand
// steps on every beat. "ক্যালেন্ডারে মরচে" — a calendar rusts page by page.
// A neon city where he is a guest in his own room.

const buildings = (seed: number, n: number, minH: number, maxH: number) => {
  const out: { x: number; w: number; h: number; s: number }[] = [];
  let x = -40;
  for (let i = 0; out.length < n && x < 2000; i++) {
    const w = 70 + rand(seed + i * 3.3) * 130;
    const h = minH + rand(seed + i * 7.7) * (maxH - minH);
    out.push({ x, w, h, s: seed + i });
    x += w + 6 + rand(seed + i) * 18;
  }
  return out;
};
const BACK = buildings(11, 40, 220, 520);
const FRONT = buildings(97, 40, 140, 380);

export const City: React.FC<SceneProps & { blue?: number }> = ({ t, f, blue = 0 }) => {
  const line = lineAt(t, ["Verse 1"]);
  const bi = Math.max(0, beatIndex(t));
  const bp = beatPulse(t, 10);
  const b = bassSmooth(f);
  const ground = 960;
  const calAt = wordTime("ক্যালেন্ডারে", "ক্যালেন্ডারে");
  const calLine = D.lines.find((l) => l.text.includes("ক্যালেন্ডারে"));
  const pagesTorn = calLine ? Math.max(0, beatIndex(Math.min(t, calLine.e + 3)) - beatIndex(calAt)) : 0;
  const walkX = lerp(-120, 2040, clamp((t - 59) / 22.3));
  const phase = Math.PI * (bi + clamp((t - (D.beats[bi] ?? 0)) / 0.465));

  const win = (bx: number, by: number, w: number, h: number, seed: number, front: boolean) => {
    const cells = [];
    const cols = Math.max(2, Math.floor(w / 22)), rows = Math.floor(h / 30);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const k = seed * 100 + r * 17 + c;
        const flick = rand(k + Math.floor(bi / 2) * 0.37) > 0.82;
        const lit = rand(k) > (front ? 0.62 : 0.7) !== flick;
        if (!lit) continue;
        const col = rand(k * 2) > 0.8 ? C.teal : rand(k * 3) > 0.7 ? C.magenta : C.amber;
        cells.push(<rect key={k} x={bx + 8 + c * (w - 12) / cols} y={by + 14 + r * 30} width={9} height={13}
          fill={col} opacity={front ? 0.9 : 0.5} />);
      }
    return cells;
  };

  return (
    <AbsoluteFill style={{ background: blue
      ? "linear-gradient(#071030 0%, #0c2a6b 55%, #12348a 100%)"
      : "linear-gradient(#090b1f 0%, #1a1446 55%, #3a1a55 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={rand(i) * 1920} cy={rand(i + 50) * 420} r={rand(i + 9) * 1.8 + 0.4}
            fill="#fff" opacity={0.3 + 0.5 * rand(i + Math.floor(t * 2))} />
        ))}
        {/* the clock */}
        {!blue && (
          <g transform={`translate(1520 300) scale(${1 + bp * 0.025})`}>
            <circle r={225} fill="#f3ead7" opacity={0.92} />
            <circle r={225} fill="none" stroke={C.amber} strokeWidth={10} />
            {Array.from({ length: 60 }).map((_, i) => (
              <line key={i} x1={0} y1={-205} x2={0} y2={i % 5 ? -195 : -175} stroke={C.paperInk}
                strokeWidth={i % 5 ? 2 : 6} transform={`rotate(${i * 6})`} />
            ))}
            <line x1={0} y1={20} x2={0} y2={-120} stroke={C.paperInk} strokeWidth={14} strokeLinecap="round"
              transform={`rotate(${(t / 351) * 360 * 2 + 30})`} />
            <line x1={0} y1={24} x2={0} y2={-170} stroke={C.paperInk} strokeWidth={9} strokeLinecap="round"
              transform={`rotate(${t * 6})`} />
            <line x1={0} y1={34} x2={0} y2={-188} stroke={C.red} strokeWidth={4}
              transform={`rotate(${bi * 6 + bp * 2})`} />
            <circle r={12} fill={C.red} />
          </g>
        )}
        {BACK.map((bd) => (
          <g key={`b${bd.s}`}>
            <rect x={bd.x} y={ground - 80 - bd.h} width={bd.w} height={bd.h + 80} fill={blue ? "#0a1a48" : "#141a3f"} />
            {win(bd.x, ground - 80 - bd.h, bd.w, bd.h, bd.s, false)}
          </g>
        ))}
        {FRONT.map((bd) => (
          <g key={`f${bd.s}`}>
            <rect x={bd.x} y={ground - bd.h} width={bd.w} height={bd.h} fill={blue ? "#06102e" : "#0b0e24"} />
            <rect x={bd.x} y={ground - bd.h} width={bd.w} height={4} fill={rand(bd.s) > 0.5 ? C.teal : C.magenta}
              opacity={0.5 + b * 0.5} />
            {win(bd.x, ground - bd.h, bd.w, bd.h, bd.s + 500, true)}
          </g>
        ))}
        <rect x={0} y={ground} width={1920} height={120} fill="#05060f" />
        <rect x={0} y={ground} width={1920} height={3} fill={C.teal} opacity={0.6} />
        {!blue && <Figure x={walkX} y={ground + 2} scale={1.6} pose={{ walk: phase }} rim={C.teal} />}
        {/* the rusting calendar */}
        {!blue && t >= calAt - 0.3 && (
          <g transform="translate(250 330)" opacity={smooth((t - calAt + 0.3) / 0.3) * (1 - smooth((t - (calLine?.e ?? 0) - 3) / 1))}>
            <rect x={-110} y={-130} width={220} height={250} rx={10} fill="#e9dcc2" />
            <rect x={-110} y={-130} width={220} height={60} rx={10} fill="#8f3b16" />
            <text x={0} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={110} fill="#5a2a12">
              {((pagesTorn % 30) + 1).toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}
            </text>
            <rect x={-110} y={-130} width={220} height={250} rx={10} fill="#a0521c" opacity={clamp(pagesTorn / 14) * 0.55} />
          </g>
        )}
      </svg>
      {line && (
        <div style={{ position: "absolute", left: 110, top: 130, width: 1150 }}>
          <Karaoke line={line} t={t} st={{ size: 78, align: "left", maxWidth: 1150, active: C.teal }} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// =============================================================== FORM
// Pre-chorus: "নাম আছে, ঠিকানা আছে, ছবিও আছে বেশ" — an identity form gets
// ticked field by field as each word is sung… and on "আসল রেশ?" the
// photograph empties out.

export const Form: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Pre-Chorus"]);
  const tName = wordTime("নাম আছে", "নাম");
  const tAddr = wordTime("নাম আছে", "ঠিকানা");
  const tPhoto = wordTime("নাম আছে", "ছবিও");
  const tLost = wordTime("আসল রেশ", "রেশ");
  const push = smooth((t - 81.3) / 15.5);
  const dip = smooth((t - 96.3) / 0.45);
  const tick = (at: number) => clamp((t - at) / 0.22);
  const lost = smooth((t - tLost) / 0.6);
  const fields: [string, number][] = [["নাম", tName], ["ঠিকানা", tAddr], ["ছবি", tPhoto]];

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #2a2e55 0%, #0c0e20 70%)" }}>
      <div style={{ position: "absolute", left: 960, top: 600, width: 1180, height: 620,
        transform: `translate(-50%,-50%) scale(${1 + push * 0.16}) rotate(${-2 + push * 3}deg)`,
        background: "#f1e7d2", borderRadius: 18, boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: C.red, borderRadius: "18px 18px 0 0" }} />
        {fields.map(([label, at], i) => (
          <div key={label} style={{ position: "absolute", left: 70, top: 110 + i * 150, width: 640, height: 110 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: C.paperInk }}>{label}</div>
            <div style={{ position: "absolute", left: 230, right: 0, top: 70, height: 4, background: "#3a3328", opacity: 0.6 }} />
            <svg width={120} height={120} style={{ position: "absolute", left: 560, top: -10 }}>
              <path d="M18 62 L48 92 L104 22" stroke={C.red} strokeWidth={14} fill="none" strokeLinecap="round"
                strokeLinejoin="round" strokeDasharray={170} strokeDashoffset={170 * (1 - tick(at))} />
            </svg>
          </div>
        ))}
        <div style={{ position: "absolute", right: 70, top: 90, width: 320, height: 420, border: "6px solid #3a3328",
          borderStyle: lost > 0.5 ? "dashed" : "solid", background: "#d8ccb3", overflow: "hidden" }}>
          <svg width={320} height={420}>
            <Figure x={160} y={560} scale={2.6} fill="#2b2620" rim="#d8ccb3" opacity={1 - lost} />
            <text x={160} y={250} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={220}
              fill={C.red} opacity={lost}>?</text>
          </svg>
        </div>
      </div>
      {line && (
        <div style={{ position: "absolute", top: 70, width: "100%", display: "flex", justifyContent: "center" }}>
          <Karaoke line={line} t={t} st={{ size: 70, maxWidth: 1600, active: C.amber }} />
        </div>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: dip }} />
    </AbsoluteFill>
  );
};
