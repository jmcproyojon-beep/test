import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SERIF, SANS } from "./fonts";
import { Figure, Karaoke, Stamp, Flash } from "./kit";
import {
  C, D, clamp, lerp, smooth, easeOut, rand, beatPulse, downbeatPulse, beatIndex, downbeatIndex,
  bass, bassSmooth, onset, band, lineAt, linesSoFar, wordTime, cuePulse,
} from "./lib";
import { SceneProps } from "./scenesA";

// =============================================================== NEWSPAPER
// Every chorus is a front page reporting him missing. The headline is the
// line being sung, inked word by word; the bass shakes the page. Chorus 1 and
// 2 stamp him নিরুদ্দেশ. In the final chorus the page turns gold, his face
// comes back on "আজকে পেলাম নিজের জবাব!", and নিরুদ্দেশ is struck out for
// ঠিকানা.

type Variant = "one" | "two" | "found";

const COLS = Array.from({ length: 5 }).map((_, c) =>
  Array.from({ length: 16 }).map((_, r) => 0.55 + rand(c * 40 + r) * 0.45));

export const Newspaper: React.FC<SceneProps & { v: Variant }> = ({ t, f, v }) => {
  const sections = v === "one" ? ["Chorus"] : v === "two" ? ["Chorus"] : ["Final Chorus"];
  const from = v === "one" ? 90 : v === "two" ? 205 : 285;
  const until = v === "one" ? 137.4 : v === "two" ? 238.6 : 331;
  // A front page never has an empty headline: hold each line until the next
  // one is sung, then hand over.
  const line = (() => {
    const sung = linesSoFar(t, sections).filter((l) => l.s >= from && l.s < until);
    const cur = sung[sung.length - 1];
    if (!cur) return null;
    const next = D.lines.find((l) => l.s > cur.s && sections.includes(l.section) && l.s < until);
    return { ...cur, e: (next ? next.s : until) - 0.14 };
  })();
  const start = v === "one" ? D.hits.chorus1 : v === "two" ? D.hits.chorus2 : D.hits.final;
  const b = bass(f);
  const shake = b * b * 9;
  const sx = (rand(f * 1.7) - 0.5) * shake, sy = (rand(f * 2.3) - 0.5) * shake;
  const punch = line ? cuePulse(t, line.s, 8) : 0;
  const rot = v === "two" ? -3.2 : v === "found" ? 1.2 : -1.2;
  const golden = v === "found";

  const nirTime = v === "one" ? wordTime("সেই আমিই আজ", "নিরুদ্দেশ", 100)
    : v === "two" ? wordTime("সেই আমিই আজ", "নিরুদ্দেশ", 205) : start + 0.2;
  const thikanaTime = wordTime("সেই আমিই আমার", "ঠিকানা", 285);
  const faceTime = wordTime("আজকে পেলাম", "জবাব", 285);
  const face = golden ? smooth((t - faceTime) / 0.7) : 0;
  const posterLeft = v !== "two";

  return (
    <AbsoluteFill style={{ background: golden ? "#2a1a05" : "#111" }}>
      <div style={{ position: "absolute", inset: -60,
        transform: `translate(${sx}px,${sy}px) rotate(${rot}deg) scale(${1.04 + punch * 0.025 + cuePulse(t, start, 5) * 0.12})` }}>
        <Img src={staticFile("nikhoj/paper.jpg")} style={{ position: "absolute", left: 60, top: 60, width: 1920, height: 1080 }} />
        {v === "two" && <div style={{ position: "absolute", left: 60, top: 60, width: 1920, height: 1080, background: "#ff9a85", mixBlendMode: "multiply", opacity: 0.32 }} />}
        {golden && <div style={{ position: "absolute", left: 60, top: 60, width: 1920, height: 1080, background: "#ffc35a", mixBlendMode: "multiply", opacity: 0.45 }} />}

        <div style={{ position: "absolute", left: 60, top: 60, width: 1920, height: 1080 }}>
          {/* masthead */}
          <div style={{ position: "absolute", top: 40, width: "100%", textAlign: "center", fontFamily: SERIF,
            fontWeight: 700, fontSize: 118, color: C.paperInk, letterSpacing: 2 }}>
            নিখোঁজ সংবাদ
          </div>
          <div style={{ position: "absolute", left: 90, right: 90, top: 210, borderTop: `6px solid ${C.paperInk}`, borderBottom: `2px solid ${C.paperInk}`, height: 10 }} />
          <div style={{ position: "absolute", top: 236, width: "100%", textAlign: "center", fontFamily: SANS,
            fontSize: 22, letterSpacing: 12, color: "#4a4136" }}>NIKHOJ SONGBAD · ESCAPE OF LIFE</div>

          {/* the poster */}
          <div style={{ position: "absolute", left: posterLeft ? 110 : 1360, top: 300, width: 450, height: 680,
            background: golden ? "#fff6e0" : "#f7f0de", border: `5px solid ${C.paperInk}`,
            transform: `rotate(${posterLeft ? -2.5 : 2.5}deg)`, boxShadow: "6px 10px 0 rgba(0,0,0,0.12)" }}>
            {/* Only the artist's own words go on screen. In the final chorus the
                same headline is struck through as his face comes back. */}
            <div style={{ position: "relative", fontFamily: SERIF, fontWeight: 700, fontSize: 92, textAlign: "center",
              color: C.red, marginTop: 10 }}>
              নিখোঁজ
              {golden && <div style={{ position: "absolute", left: 60, right: 60, top: "52%", height: 10,
                background: "#1d6b3a", transform: `scaleX(${face})`, transformOrigin: "left center" }} />}
            </div>
            <svg width={440} height={470} style={{ position: "absolute", top: 150, left: 0 }}>
              <rect x={40} y={0} width={360} height={430} fill={golden ? "#f2d9a0" : "#cfc4ae"} />
              <Figure x={220} y={600} scale={3.1} fill="#22201b" rim={golden ? C.amber : "#cfc4ae"}
                face={face} question={golden ? 1 - face : 1} />
            </svg>
          </div>

          {/* headline: the line being sung */}
          <div style={{ position: "absolute", left: posterLeft ? 640 : 120, top: 300, width: 1180, height: 400,
            display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            {line && <Karaoke line={line} t={t} st={{ size: v === "two" ? 118 : 108, align: "left", maxWidth: 1180,
              color: C.paperInk, active: golden ? "#a8650a" : C.red, dim: 0.13, shadow: "none", lineHeight: 1.3, rise: 18, pop: 0.12 }} />}
          </div>

          {/* body copy as ink bars — page texture, not words */}
          {COLS.map((col, c) => (
            <div key={c} style={{ position: "absolute", left: (posterLeft ? 640 : 120) + c * 240, top: 730, width: 210 }}>
              {col.map((w, r) => (
                <div key={r} style={{ height: 9, width: `${w * 100}%`, background: "#5b5246", opacity: 0.35, marginBottom: 7 }} />
              ))}
            </div>
          ))}

          <Stamp text="নিরুদ্দেশ" t={t} at={nirTime} x={posterLeft ? 335 : 1585} y={860} size={84} rot={-14} />
          {golden && t > thikanaTime && (
            <div style={{ position: "absolute", left: 175, top: 855, width: 330, height: 10, background: C.red,
              transform: `rotate(-14deg) scaleX(${easeOut((t - thikanaTime) / 0.2)})`, transformOrigin: "left center" }} />
          )}
          {golden && <Stamp text="ঠিকানা" t={t} at={thikanaTime + 0.15} x={335} y={735} size={100} rot={8} color="#1d6b3a" />}
        </div>
      </div>

      {golden && <Confetti t={t} />}
      <Flash amount={cuePulse(t, start, 9) * 0.85} />
    </AbsoluteFill>
  );
};

/** Paper scraps released on every downbeat of the final chorus. */
const Confetti: React.FC<{ t: number }> = ({ t }) => {
  const di = downbeatIndex(t);
  const pieces = [];
  for (let k = Math.max(0, di - 6); k <= di; k++) {
    const t0 = D.downbeats[k];
    if (t0 < D.hits.final) continue;
    const age = t - t0;
    for (let i = 0; i < 14; i++) {
      const s = k * 31 + i;
      const x = rand(s) * 1920 + Math.sin(age * 2 + s) * 40;
      const y = -40 + age * (260 + rand(s + 3) * 220);
      if (y > 1120) continue;
      const col = [C.gold, C.amber, C.cream, "#1d6b3a", C.red][i % 5];
      pieces.push(<div key={s} style={{ position: "absolute", left: x, top: y, width: 16, height: 26,
        background: col, opacity: 0.9, transform: `rotate(${age * 360 * (rand(s + 5) - 0.5)}deg) scaleX(${Math.cos(age * 6 + s)})` }} />);
    }
  }
  return <AbsoluteFill>{pieces}</AbsoluteFill>;
};

// =============================================================== DROP
// "নি-খোঁ-জ! সং-বাদ!" — then the massive bass drop. Syllables slam on the
// beat, a circular spectrum breathes with the real bands, and the faceless
// man splits into three colour ghosts on every transient.

const SYL = ["নি", "খোঁ", "জ", "সং", "বা", "দ"];

export const Drop: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Instrumental Drop"], 0.25);
  const bi = beatIndex(t);
  const bp = beatPulse(t, 7);
  const dp = downbeatPulse(t, 4);
  const o = onset(f);
  const after = t >= D.hits.drop;
  const ghost = 6 + o * 40;

  let shout: React.ReactNode = null;
  if (line && !after) {
    const parts = line.text.replace("!", "").split("-");
    const w = line.words[0];
    const span = Math.max(0.2, w.e - w.s);
    const shown = Math.min(parts.length, Math.floor((t - w.s) / (span / parts.length)) + 1);
    shout = (
      <div style={{ display: "flex", gap: 20, fontFamily: SERIF, fontWeight: 700, fontSize: 260, color: C.white }}>
        {parts.slice(0, Math.max(0, shown)).map((p, i) => <span key={i} style={{ color: i % 2 ? C.red : C.white }}>{p}</span>)}
        <span style={{ color: C.red }}>!</span>
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ background: after ? `radial-gradient(circle at center, ${dp > 0.6 ? "#3a0a14" : "#14060c"} 0%, #000 70%)` : "#000" }}>
      {/* the syllable of the beat, huge, behind everything */}
      {after && bi >= 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 620, lineHeight: 1,
            color: bi % 2 ? C.red : C.white, opacity: 0.1 + bp * 0.22,
            transform: `scale(${1 + bp * 0.08})` }}>{SYL[bi % 6]}</div>
        </AbsoluteFill>
      )}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {after && Array.from({ length: 64 }).map((_, i) => {
          const a = (i / 64) * Math.PI * 2;
          const k = Math.floor((Math.abs(Math.sin(a * 1.0)) * 7.99));
          const len = 30 + band(f, k) * 230 + bp * 30;
          const r0 = 230 + dp * 20;
          return <line key={i} x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0}
            x2={960 + Math.cos(a) * (r0 + len)} y2={540 + Math.sin(a) * (r0 + len)}
            stroke={i % 2 ? C.red : C.teal} strokeWidth={9} strokeLinecap="round" opacity={0.85} />;
        })}
        {after && <circle cx={960} cy={540} r={215 + dp * 20} fill="none" stroke={C.white} strokeWidth={4} opacity={0.6} />}
        {after && Array.from({ length: 22 }).map((_, i) => {
          const k = downbeatIndex(t);
          const age = t - (D.downbeats[k] ?? t);
          const a = rand(k * 9 + i) * Math.PI * 2;
          const d = 240 + age * (900 + rand(i) * 600);
          const x = 960 + Math.cos(a) * d, y = 540 + Math.sin(a) * d;
          return <polygon key={`s${i}`} points={`${x},${y} ${x + 26},${y + 10} ${x + 6},${y + 34}`}
            fill={i % 3 ? C.red : C.white} opacity={clamp(1 - age * 1.6)} transform={`rotate(${age * 400} ${x} ${y})`} />;
        })}
        {after && [[-ghost, C.cyan], [ghost, C.red], [0, C.ink]].map(([dx, col], i) => (
          <g key={i} opacity={i < 2 ? 0.55 : 1}>
            <Figure x={960 + (dx as number)} y={700} scale={1.55 + bp * 0.08} fill={col as string}
              rim={i < 2 ? (col as string) : C.white} question={i === 2 ? 1 : 0} />
          </g>
        ))}
      </svg>
      {shout && <AbsoluteFill style={{ alignItems: "center", justifyContent: "center",
        transform: `scale(${1 + bp * 0.08})` }}>{shout}</AbsoluteFill>}

      <Flash amount={cuePulse(t, D.hits.drop, 8) + dp * 0.12} />
    </AbsoluteFill>
  );
};

// =============================================================== PHONE
// Verse 2: "সকাল মানে স্ক্রিনের আলো, রাত মানে নীল". He talks to himself on a
// phone — every line a chat bubble, alternating sides — while the metro map
// beside him loses the one station he meant to get off at.

const V2 = ["Verse 2"];

export const Phone: React.FC<SceneProps> = ({ t, f }) => {
  const lines = linesSoFar(t, V2);
  const bp = beatPulse(t, 8);
  const b = bassSmooth(f);
  const gone = wordTime("সেই স্টেশনটাই", "নাই", 150);
  const pwStart = wordTime("পাসওয়ার্ডে", "পাসওয়ার্ডে", 150);
  const pwLine = D.lines.find((l) => l.text.includes("পাসওয়ার্ডে"));
  const pwDots = t >= pwStart && pwLine && t < pwLine.e + 4 ? Math.min(8, beatIndex(t) - beatIndex(pwStart) + 1) : 0;
  const PX = 1180, PY = 540, PW = 600, PH = 1000;
  const STN = 7;
  const train = clamp((t - 157.3) / 36.8) * (STN - 1);

  // stack the last few bubbles upward from the bottom of the screen
  const recent = lines.slice(-5);
  let y = PY + PH / 2 - 120;
  const bubbles = [];
  for (let i = recent.length - 1; i >= 0; i--) {
    const l = recent[i];
    const idx = D.lines.indexOf(l);
    const mine = idx % 2 === 0;
    const k = easeOut((t - (l.s - 0.15)) / 0.3);
    const est = Math.ceil(l.text.length / 13) * 66 + 40;
    y -= est + 22;
    bubbles.push(
      <div key={idx} style={{ position: "absolute", top: y, left: mine ? PX - PW / 2 + 150 : PX - PW / 2 + 40,
        width: PW - 190, display: "flex", justifyContent: mine ? "flex-end" : "flex-start",
        transform: `scale(${lerp(0.6, 1, k)})`, transformOrigin: mine ? "right bottom" : "left bottom", opacity: k }}>
        <div style={{ background: mine ? "#1fb6a8" : "#2b3557", borderRadius: 28, padding: "14px 24px",
          borderBottomRightRadius: mine ? 6 : 28, borderBottomLeftRadius: mine ? 28 : 6 }}>
          <Karaoke line={{ ...l, e: l.e + 999 }} t={t} st={{ font: SANS, size: 44, weight: 400, maxWidth: 370,
            align: mine ? "right" : "left", color: C.white, active: mine ? "#fffbe0" : C.teal, dim: 0.35,
            shadow: "none", rise: 0, pop: 0.08, lineHeight: 1.5 }} />
        </div>
      </div>,
    );
  }

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #040c2a 0%, #0b2368 60%, #0a1640 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <circle key={i} cx={(rand(i) * 2200 + t * (8 + rand(i + 3) * 18)) % 2200 - 140} cy={rand(i + 7) * 1080}
            r={30 + rand(i + 11) * 90} fill={i % 3 ? C.cyan : C.magenta} opacity={0.05 + b * 0.08} />
        ))}
        {/* metro map */}
        <line x1={300} y1={170} x2={300} y2={910} stroke={C.cyan} strokeWidth={10} opacity={0.6} />
        {Array.from({ length: STN }).map((_, i) => {
          const sy = 170 + i * (740 / (STN - 1));
          const missing = i === 5 && t >= gone;
          const passed = train >= i;
          return (
            <g key={i}>
              <circle cx={300} cy={sy} r={26} fill={missing ? "none" : passed ? C.teal : "#0b2368"}
                stroke={missing ? "#556" : C.cyan} strokeWidth={6} strokeDasharray={missing ? "8 8" : undefined} />
              {missing && <text x={360} y={sy + 14} fontFamily={SANS} fontSize={40} fill="#8890b0">×</text>}
            </g>
          );
        })}
        <circle cx={300} cy={170 + train * (740 / (STN - 1))} r={16 + bp * 6} fill={C.white} />
        {/* the phone */}
        <rect x={PX - PW / 2} y={PY - PH / 2} width={PW} height={PH} rx={62} fill="#05070f" stroke="#2b3557" strokeWidth={6} />
        <rect x={PX - PW / 2 + 18} y={PY - PH / 2 + 18} width={PW - 36} height={PH - 36} rx={46} fill="#0c1124" />
        <rect x={PX - 70} y={PY - PH / 2 + 30} width={140} height={30} rx={15} fill="#05070f" />
        <rect x={PX - PW / 2 + 18} y={PY - PH / 2 + 80} width={PW - 36} height={90} fill="#121a36" />
        <Figure x={PX - PW / 2 + 80} y={PY - PH / 2 + 205} scale={0.42} rim={C.teal} question={1} />
        {Array.from({ length: pwDots }).map((_, i) => (
          <circle key={i} cx={PX - 40 + i * 30} cy={PY - PH / 2 + 125} r={9} fill={C.teal} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${PY - PH / 2 + 175}px ${1920 - PX - PW / 2 + 20}px ${1080 - PY - PH / 2 + 20}px ${PX - PW / 2 + 20}px round 40px)` }}>
        {bubbles}
      </div>
      <Flash amount={cuePulse(t, D.hits.verse2, 9) * 0.8} />
    </AbsoluteFill>
  );
};

// =============================================================== DOOR
// Pre-chorus 2: "একটা দরজা খোলা আছে চোখের আড়াল ঘরে, যেখানে সব না-বলা কথা
// বৃষ্টি হয়ে ঝরে." A door left ajar; warm light leaks out as the strings rise,
// the rain thickens, and he reaches for it on "একবার ফিরে পাও".

export const Door: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Pre-Chorus 2"]);
  const open = lerp(0.06, 0.62, smooth((t - 194.2) / 14.5));
  const rainAt = wordTime("বৃষ্টি হয়ে", "বৃষ্টি", 190);
  const rain = 0.35 + 0.65 * smooth((t - rainAt) / 1.5);
  const reachLine = D.lines.find((l) => l.text.includes("একবার ফিরে পাও"));
  const reach = reachLine ? smooth((t - reachLine.s) / (reachLine.e - reachLine.s)) : 0;
  const DX = 1240, DY = 300, DW = 360, DH = 640;
  const leafRight = DX + DW * (1 - open);
  const drops = [];
  for (let i = 0; i < 170; i++) {
    if (rand(i + 0.5) > rain) continue;
    const x = rand(i) * 2000 - 40;
    const sp = 1300 + rand(i + 2) * 700;
    const y = ((rand(i + 4) * 1200 + t * sp) % 1200) - 100;
    drops.push(<line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke="#9cc4ff" strokeWidth={2} opacity={0.35} />);
  }
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#070910 0%, #10142a 100%)" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={0} y={940} width={1920} height={140} fill="#05060c" />
        <polygon points={`${DX},${DY + DH} ${leafRight},${DY + DH} ${leafRight + 520 * open},1080 ${DX - 260 * open},1080`}
          fill={C.amber} opacity={0.25 + open * 0.35} />
        <rect x={DX - 18} y={DY - 18} width={DW + 36} height={DH + 18} fill="#1b1f33" />
        <rect x={DX} y={DY} width={DW} height={DH} fill={C.amber} opacity={0.35 + open * 0.6} />
        <polygon points={`${DX},${DY} ${leafRight},${DY + 20 * open} ${leafRight},${DY + DH - 20 * open} ${DX},${DY + DH}`}
          fill="#2a2f4d" stroke="#3a4066" strokeWidth={4} />
        <circle cx={leafRight - 30} cy={DY + DH / 2} r={9} fill={C.gold} />
        <Figure x={720} y={945} scale={2.1} rim={C.amber} pose={{ reach: reach * 0.9 }} />
        {drops}
      </svg>
      {line && (
        <div style={{ position: "absolute", top: 90, left: 100, width: 1050 }}>
          <Karaoke line={line} t={t} st={{ size: 70, align: "left", maxWidth: 1050, active: C.amber }} />
        </div>
      )}
    </AbsoluteFill>
  );
};
