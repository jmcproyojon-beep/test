import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, PLAY, MONO } from "../signal/fonts";
import { Hero, P } from "./cast";
import { Flag, Stadium, Card, FlagCode } from "./ui";
import { C, Q, clamp, lerp, smooth, easeOut, backOut, ramp, win, pulse, rand, bn, beatPulse } from "./lib";

export type SP = { t: number };
const W = 1080;

/** Big emoji/text stamp. */
const Pop: React.FC<{ t: number; at: number; out?: number; x: number; y: number; size?: number; children: React.ReactNode; rot?: number; color?: string }> =
  ({ t, at, out = Infinity, x, y, size = 120, children, rot = 0, color = "#fff" }) => {
    if (t < at) return null;
    const k = backOut((t - at) / 0.25), o = 1 - smooth((t - out) / 0.25);
    if (o <= 0) return null;
    return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.0, 1, k)})`, opacity: clamp((t - at) / 0.05) * o,
      fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap", textShadow: `6px 6px 0 ${C.ink}, 0 0 30px rgba(0,0,0,0.4)` }}>{children}</div>;
  };

const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 40, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#fff" stroke={C.ink} strokeWidth={r * 0.12} />
    <path d={`M0 ${-r * 0.35} L${r * 0.33} ${-r * 0.1} L${r * 0.2} ${r * 0.3} L${-r * 0.2} ${r * 0.3} L${-r * 0.33} ${-r * 0.1} Z`} fill={C.ink} />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={-r * 0.35} x2={0} y2={-r * 0.95} stroke={C.ink} strokeWidth={r * 0.08} transform={`rotate(${a})`} />)}
  </g>
);

const Net: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} fill="rgba(255,255,255,0.06)" />
    {Array.from({ length: Math.floor(w / 30) }).map((_, i) => <line key={i} x1={i * 30} y1={0} x2={i * 30} y2={h} stroke="#fff" strokeWidth={2} opacity={0.4} />)}
    {Array.from({ length: Math.floor(h / 30) }).map((_, i) => <line key={i} x1={0} y1={i * 30} x2={w} y2={i * 30} stroke="#fff" strokeWidth={2} opacity={0.4} />)}
    <path d={`M0 ${h} L0 0 L${w} 0 L${w} ${h}`} stroke="#fff" strokeWidth={14} fill="none" />
  </g>
);

const Trophy: React.FC<{ x: number; y: number; s?: number; col?: string }> = ({ x, y, s = 1, col = C.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 -170 L60 -170 Q60 -70 0 -60 Q-60 -70 -60 -170 Z" fill={col} stroke={C.ink} strokeWidth={7} />
    <path d="M-60 -150 Q-110 -150 -95 -110 Q-85 -85 -55 -95 M60 -150 Q110 -150 95 -110 Q85 -85 55 -95" stroke={C.ink} strokeWidth={7} fill="none" />
    <rect x={-12} y={-62} width={24} height={40} fill={col} stroke={C.ink} strokeWidth={6} />
    <rect x={-50} y={-24} width={100} height={24} rx={6} fill={col} stroke={C.ink} strokeWidth={6} />
  </g>
);

// ===================================================================== INTRO
export const Intro: React.FC<SP> = ({ t }) => {
  const nameOn = t >= Q.name - 0.1;
  const hostX = lerp(540, 300, ramp(t, Q.name - 0.2, 0.5));
  const typed = "Erling Haaland".slice(0, Math.max(0, Math.floor((t - Q.search - 0.3) * 9)));
  return (
    <AbsoluteFill>
      <Stadium t={t} />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(${hostX} ${1390}) scale(${backOut(t / 0.5)})`}>
          <Hero x={0} y={0} s={2.0} outfit="host" pose={t < Q.search ? { ...P.stand(), armF: [1.55, 0.05] } : P.shrug()}
            face={{ mouth: t < Q.search ? "grin" : "smile", eyes: "open", look: 0.4 }} />
        </g>
        {nameOn && (
          <g transform={`translate(${lerp(1300, 780, easeOut((t - Q.name) / 0.5))} 1330)`}>
            <Hero x={0} y={0} s={2.5} outfit="kit" bun num="9" pose={{ ...P.stand(), armB: [-2.6, -0.3], armF: [2.6, 0.3] }} face={{ mouth: "grin", eyes: "open", look: -0.4 }} />
          </g>
        )}
      </svg>
      <Card t={t} at={Q.title} out={Q.search - 0.15} y={470} size={86} bg={C.gold}>১০০ সেকেন্ডে শিখি 🔥</Card>
      {t >= Q.search && t < Q.name + 0.2 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 400, opacity: win(t, Q.search, Q.name, 0.3) }}>
          <div style={{ background: "#fff", borderRadius: 60, padding: "26px 40px", display: "flex", alignItems: "center", gap: 22, border: `5px solid ${C.ink}`,
            fontFamily: MONO, fontSize: 50, color: C.ink, boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
            <span style={{ fontSize: 48 }}>🔍</span>{typed}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span>
          </div>
          <div style={{ marginTop: 26, display: "flex", alignItems: "flex-end", gap: 14, height: 200, justifyContent: "center" }}>
            {[0.2, 0.3, 0.28, 0.45, 0.6, 0.8, 1].map((h, i) => (
              <div key={i} style={{ width: 60, height: 200 * h * ramp(t, Q.search + 0.6 + i * 0.12, 0.3), background: i === 6 ? C.red : C.sky, borderRadius: 10, border: `4px solid ${C.ink}` }} />
            ))}
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: C.gold, marginLeft: 14, opacity: ramp(t, Q.search + 1.6, 0.3) }}>#১ সার্চ</div>
          </div>
        </div>
      )}
      <Card t={t} at={Q.name} y={520} size={92} bg={C.sky}>আর্লিং হালান্ড ⚽</Card>
    </AbsoluteFill>
  );
};

// ===================================================================== CHILD
export const Child: React.FC<SP> = ({ t }) => {
  const grow = easeOut((t - Q.giant) / 1.0);
  const showKids = t >= Q.small - 0.1;
  return (
    <AbsoluteFill>
      <Stadium t={t} tint="#1B3A6B" />
      {!showKids && (
        <svg width={W} height={1920} style={{ position: "absolute" }}>
          {t >= Q.leeds && t < Q.dad && <g opacity={ramp(t, Q.leeds, 0.3)}><Flag code="EN" x={200} y={520} w={170} /></g>}
          {t >= Q.bryne && t < Q.dad && <>
            <path d={`M200 600 Q 160 720 200 820`} stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray="20 14" strokeDashoffset={-t * 60} />
            <g opacity={ramp(t, Q.bryne, 0.3)}><Flag code="NO" x={200} y={900} w={170} /></g>
          </>}
        </svg>
      )}
      {!showKids && <>
        <Card t={t} at={Q.leeds} out={Q.dad - 0.1} x={640} y={520} size={54} from="r">জন্ম ২০০০ · লিডস, ইংল্যান্ড</Card>
        <Card t={t} at={Q.bryne} out={Q.dad - 0.1} x={640} y={900} size={54} from="r">বড় হয়েছে · ব্রাইন, নরওয়ে</Card>
        <Card t={t} at={Q.dad} out={Q.small - 0.1} y={620} size={56} w={860} bg={C.sky}>বাবা আলফ-ইঙ্গে হালান্ড<br /><span style={{ fontSize: 44 }}>খেলতেন প্রিমিয়ার লিগে ⚽</span></Card>
        <Card t={t} at={Q.easy} out={Q.small - 0.1} y={960} size={64} bg={C.red} color="#fff" rot={-3}>সব সহজ ছিল? না ভাই! ❌</Card>
      </>}
      {showKids && (
        <svg width={W} height={1920} style={{ position: "absolute" }}>
          {[0, 1, 3, 4].map((i) => (
            <Hero key={i} x={130 + i * 205} y={1330} s={1.55 * (1 - grow * 0.15)} outfit="kid" pose={P.stand()} face={{ mouth: t > Q.giant + 0.3 ? "o" : "smile", eyes: t > Q.giant + 0.3 ? "wide" : "open" }} />
          ))}
          <Hero x={130 + 2 * 205} y={1330} s={lerp(0.85, 2.6, grow)} outfit="kit" bun pose={grow > 0.5 ? { ...P.stand(), armB: [-0.4, 0.2], armF: [0.4, -0.2] } : P.stand()} face={{ mouth: grow > 0.5 ? "grin" : "flat" }} />
          {grow > 0 && (
            <g opacity={grow}>
              <line x1={1000} y1={1330} x2={1000} y2={1330 - 2.6 * 300 * grow} stroke={C.gold} strokeWidth={8} />
              {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={985} y1={1330 - i * 120 * grow} x2={1015} y2={1330 - i * 120 * grow} stroke={C.gold} strokeWidth={6} />)}
            </g>
          )}
        </svg>
      )}
      {showKids && <Pop t={t} at={Q.small + 0.3} out={Q.giant} x={540} y={520} size={70}>দলের সবচেয়ে ছোট? 🤏</Pop>}
      <Pop t={t} at={Q.giant} x={540} y={350} size={80} color={C.gold}>সাড়ে ৬ ফুট! 😂</Pop>
      <Card t={t} at={Q.giant + 1.2} y={465} size={50} bg="#fff">ছোট দিয়ে শুরু ≠ ছোট হয়ে থাকা</Card>
    </AbsoluteFill>
  );
};

// ===================================================================== STAIRS
const CLUBS: [string, FlagCode, string][] = [["ব্রাইন", "NO", "s_bryne"], ["মোল্ডে", "NO", "s_molde"], ["সালজবুর্গ", "AT", "s_salz"], ["ডর্টমুন্ড", "DE", "s_dort"], ["ম্যান সিটি", "EN", "s_city"]];
export const Stairs: React.FC<SP> = ({ t }) => {
  let step = -1;
  CLUBS.forEach(([, , k], i) => { if (t >= Q[k]) step = i; });
  const sx = (i: number) => 130 + i * 190, sy = (i: number) => 1360 - i * 150;
  const prev = Math.max(0, step - 1);
  const at = step >= 0 ? Q[CLUBS[step][2]] : 0;
  const k = easeOut((t - at) / 0.35);
  const px = step < 0 ? 40 : lerp(sx(prev) + 80, sx(step) + 80, k), py = step < 0 ? 1360 + 150 : lerp(sy(prev), sy(step), k) - Math.sin(k * Math.PI) * 60;
  return (
    <AbsoluteFill>
      <Stadium t={t} tint="#163063" />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {CLUBS.map(([name, code, key], i) => {
          const on = t >= Q[key];
          return (
            <g key={i}>
              <rect x={sx(i)} y={sy(i)} width={190} height={1920 - sy(i)} fill={on ? (i === 4 ? C.sky : "#2B4A8A") : "#1A2B55"} stroke={C.ink} strokeWidth={6} />
              {on && <g opacity={ramp(t, Q[key], 0.2)}>
                <Flag code={code} x={sx(i) + 95} y={sy(i) + 60} w={90} r={8} />
                <text x={sx(i) + 95} y={sy(i) + 150} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill="#fff">{name}</text>
              </g>}
            </g>
          );
        })}
        <Hero x={px} y={py} s={1.15} outfit={step >= 4 ? "kit" : "kit"} bun num="9" pose={k < 1 && step >= 0 ? P.run(t * 14) : { ...P.stand(), armB: [-2.4, -0.2], armF: [2.4, 0.2] }} face={{ mouth: "grin" }} />
        {/* the lift, crossed out */}
        {t >= Q.lift && (
          <g transform={`translate(860 560) scale(${backOut((t - Q.lift) / 0.3)})`}>
            <rect x={-90} y={-120} width={180} height={240} rx={14} fill="#B8C2D6" stroke={C.ink} strokeWidth={7} />
            <line x1={0} y1={-110} x2={0} y2={110} stroke={C.ink} strokeWidth={5} />
            <path d="M-50 -150 l20 -24 l20 24 Z M10 -174 l20 24 l20 -24 Z" fill={C.ink} />
            <line x1={-120} y1={-150} x2={120} y2={150} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
          </g>
        )}
      </svg>
      <Card t={t} at={Q.s_bryne} out={Q.lift - 0.1} y={420} size={44} w={980} bg="#fff">ব্রাইন → মোল্ডে → সালজবুর্গ → ডর্টমুন্ড → ম্যান সিটি</Card>
      <Pop t={t} at={Q.lift} x={380} y={500} size={82} color={C.gold}>লিফট না, সিঁড়ি! 🪜</Pop>
    </AbsoluteFill>
  );
};

// ===================================================================== RECORD
export const Record: React.FC<SP> = ({ t }) => {
  const n = Math.min(36, Math.floor(clamp((t - Q.goals) / 1.4) * 36));
  const tro = [Q.treble, Q.treble + 0.6, Q.treble + 1.2];
  const cls = t >= Q.class - 0.1;
  return (
    <AbsoluteFill>
      <Stadium t={t} tint="#1B3A6B" />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {!cls && <>
          <Net x={140} y={700} w={800} h={380} />
          {t >= Q.goals && Array.from({ length: Math.min(n, 18) }).map((_, i) => (
            <Ball key={i} x={200 + (i % 9) * 85} y={1040 - Math.floor(i / 9) * 70 - (i === n - 1 ? 40 * Math.exp(-((t * 25) % 1) * 3) : 0)} r={32} rot={i * 40} />
          ))}
          {tro.map((at, i) => t >= at && (
            <g key={i} transform={`translate(0 ${-(1 - easeOut((t - at) / 0.35)) * 500})`}>
              <Trophy x={250 + i * 290} y={1340} s={1.05} col={[C.gold, "#E8E8F0", C.sky][i]} />
              <text x={250 + i * 290} y={1390} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={38} fill="#fff">{["লিগ", "এফএ কাপ", "চ্যাম্পিয়নস লিগ"][i]}</text>
            </g>
          ))}
        </>}
        {cls && (
          <g>
            <rect x={240} y={1080} width={600} height={30} fill="#8A5A3A" stroke={C.ink} strokeWidth={6} />
            <rect x={270} y={1110} width={24} height={220} fill="#6A4028" /><rect x={786} y={1110} width={24} height={220} fill="#6A4028" />
            <g transform="translate(540 1220) rotate(-8)"><Hero x={0} y={0} s={1.6} outfit="host" pose={{ ...P.sit(), armF: [2.2, 1.2], armB: [2.1, 1.4] }} face={{ eyes: "closed", mouth: "o" }} /></g>
            <text x={660} y={760} fontFamily={DISPLAY} fontWeight={800} fontSize={70} fill="#fff" opacity={0.8}>Z z z</text>
          </g>
        )}
      </svg>
      {!cls && t >= Q.goals && t < Q.trebleWord && (
        <div style={{ position: "absolute", top: 400, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, color: C.gold,
          textShadow: `8px 8px 0 ${C.ink}`, transform: `scale(${1 + pulse(t, Q.goals + 1.4, 5) * 0.25})` }}>{bn(n)} <span style={{ fontSize: 110, color: "#fff" }}>গোল</span></div>
      )}
      {!cls && <Card t={t} at={Q.trebleWord} y={520} size={64} bg={C.gold}>৩৬ গোল | ট্রেবল 🏆🏆🏆</Card>}
      {cls && <Card t={t} at={Q.class} y={560} size={60} w={860} bg="#fff">আমরা? ৩৬টা ক্লাসও করতে পারি না 😅</Card>}
    </AbsoluteFill>
  );
};

// ==================================================================== ROUTINE
export const Routine: React.FC<SP> = ({ t }) => {
  const us = t >= Q.us - 0.05;
  let panel = "sleep";
  if (t >= Q.food) panel = "food";
  if (t >= Q.zen) panel = "zen";
  return (
    <AbsoluteFill>
      <Stadium t={t} tint={us ? "#24124A" : "#1B3A6B"} />
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, color: "#fff", textShadow: `5px 5px 0 ${C.ink}` }}>
        <span style={{ color: us ? "#fff" : C.sky, opacity: us ? 0.45 : 1 }}>হালান্ড</span> 🆚 <span style={{ color: us ? C.gold : "#fff", opacity: us ? 1 : 0.45 }}>আমরা</span>
      </div>
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {!us && panel === "sleep" && (
          <g>
            <rect x={160} y={1020} width={760} height={150} rx={20} fill="#5B6FA8" stroke={C.ink} strokeWidth={7} />
            <rect x={180} y={980} width={170} height={60} rx={26} fill="#fff" stroke={C.ink} strokeWidth={6} />
            <g transform="translate(270 1030) rotate(-90)"><Hero x={0} y={0} s={1.25} outfit="kit" bun pose={P.stand()} face={{ eyes: "closed", mouth: "smile" }} /></g>
            <path d="M380 990 Q640 940 900 1000 L910 1040 L370 1040 Z" fill={C.sky} stroke={C.ink} strokeWidth={6} />
            <g transform={`translate(540 720)`}>
              <rect x={-140} y={-60} width={260} height={120} rx={18} fill="none" stroke="#fff" strokeWidth={10} /><rect x={124} y={-24} width={22} height={48} rx={6} fill="#fff" />
              <rect x={-126} y={-46} width={232 * ramp(t, Q.sleep, 1.2)} height={92} rx={10} fill={C.green} />
              <text x={-10} y={20} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={56} fill={C.ink}>{bn(Math.round(100 * ramp(t, Q.sleep, 1.2)))}%</text>
            </g>
          </g>
        )}
        {!us && panel === "food" && (
          <g transform={`translate(540 1000) scale(${backOut((t - Q.food) / 0.3)})`}>
            <ellipse rx={300} ry={120} fill="#fff" stroke={C.ink} strokeWidth={8} /><ellipse rx={230} ry={80} fill="#F2F2F2" stroke="#ccc" strokeWidth={4} />
            <path d="M-170 -10 Q-120 -80 -40 -40 Q0 -10 -60 30 Q-140 50 -170 -10 Z" fill="#7A1F1F" stroke={C.ink} strokeWidth={6} />
            <path d="M40 -30 Q80 -70 120 -30 Q100 0 130 30 Q80 60 50 20 Q30 0 40 -30 Z" fill="#8E2A2A" stroke={C.ink} strokeWidth={6} />
            <path d="M150 -20 Q190 -50 200 0 Q190 40 150 20 Z" fill="#8E2A2A" stroke={C.ink} strokeWidth={6} />
          </g>
        )}
        {!us && panel === "zen" && (
          <g>
            {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={960} r={180 + i * 70 + Math.sin(t * 2 + i) * 10} fill="none" stroke={C.sky} strokeWidth={6} opacity={0.5 - i * 0.12} />)}
            <Hero x={540} y={1180} s={1.9} outfit="kit" bun pose={{ ...P.sit(), armB: [0.9, 1.6], armF: [0.9, 1.6] }} face={{ eyes: "closed", mouth: "smile" }} />
          </g>
        )}
        {us && (
          <g>
            <circle cx={860} cy={640} r={60} fill={C.cream} /><circle cx={885} cy={625} r={55} fill="#24124A" />
            <rect x={160} y={1060} width={760} height={150} rx={20} fill="#3A2A6A" stroke={C.ink} strokeWidth={7} />
            <Hero x={540} y={1150} s={1.7} outfit="host" pose={{ ...P.sit(), armF: [2.4, 0.9], armB: [2.3, 1.0] }} face={{ eyes: t >= Q.mood ? "sleepy" : "wide", mouth: t >= Q.mood ? "sad" : "o", look: 0.2 }} />
            <g transform="translate(585 790)">
              <rect x={-40} y={-70} width={80} height={140} rx={12} fill="#111" stroke={C.ink} strokeWidth={5} />
              <rect x={-32} y={-60} width={64} height={120} rx={6} fill={[C.magenta, C.sky, C.gold, C.green][Math.floor(t * 6) % 4]} />
            </g>
            <text x={170} y={700} fontFamily={MONO} fontWeight={700} fontSize={70} fill={C.red}>{bn("3:00")} AM</text>
          </g>
        )}
      </svg>
      {!us && <Card t={t} at={Q.sleep} out={Q.food - 0.1} y={1300} size={58}>ঘুম: ফুল চার্জ 😴</Card>}
      {!us && <Card t={t} at={Q.food} out={Q.zen - 0.1} y={720} size={60} bg={C.gold}>কলিজা-গুর্দা 🍖</Card>}
      {!us && <Card t={t} at={Q.dadi} out={Q.zen - 0.1} y={1250} size={48} bg="#fff" rot={-3}>দাদি: আমি তো আগেই বলছিলাম! 👵</Card>}
      {!us && <Card t={t} at={Q.zen} out={Q.us - 0.1} y={1310} size={58}>গোলের পর ধ্যান 🧘</Card>}
      {us && <Card t={t} at={Q.reel} y={1300} size={52} bg={C.magenta} color="#fff">রাত ৩টা পর্যন্ত রিল 📱</Card>}
      {us && <Card t={t} at={Q.mood} y={560} size={64} bg="#fff" rot={3}>"আজ মুড নেই" 😩</Card>}
    </AbsoluteFill>
  );
};

// ======================================================================= WAIT
export const Wait: React.FC<SP> = ({ t }) => {
  const color = ramp(t, Q.double, 0.25);
  const mono = 0.85 * (1 - color);
  const yr = t < Q.y2026 ? 1998 : Math.round(lerp(1998, 2026, clamp((t - Q.y2026) / 1.2)));
  const flip = t >= Q.y2026 ? ((t - Q.y2026) * 24) % 1 : 0;
  const goal = t >= Q.double;
  return (
    <AbsoluteFill>
      <Stadium t={t} tint={goal ? "#0E6B3A" : "#1A2040"} top={goal ? "#063A20" : "#070A16"} mono={mono} />
      <AbsoluteFill style={{ filter: `grayscale(${mono}) contrast(${1 + mono * 0.1})` }}>
        <svg width={W} height={1920} style={{ position: "absolute" }}>
          {!goal && Array.from({ length: 70 }).map((_, i) => {
            const y = ((t * 900 * (0.7 + rand(i) * 0.6) + rand(i + 4) * 2000) % 2000) - 80;
            const x = rand(i + 9) * 1080 - y * 0.12;
            return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 60} stroke="#C9D6FF" strokeWidth={3} opacity={0.35} />;
          })}
          {t >= Q.y1998 && !goal && (
            <g transform={`translate(540 720) scale(0.85)`}>
              <rect x={-230} y={-200} width={460} height={420} rx={24} fill="#fff" stroke={C.ink} strokeWidth={8} />
              <rect x={-230} y={-200} width={460} height={110} rx={24} fill={C.red} stroke={C.ink} strokeWidth={8} />
              <text x={0} y={-125} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={54} fill="#fff">বিশ্বকাপ</text>
              <g transform={`scale(1 ${1 - flip * 0.9})`}><text x={0} y={110} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={128} fill={C.ink}>{bn(yr)}</text></g>
            </g>
          )}
          {t >= Q.noquit && !goal && t < Q.y2026 && (
            <g opacity={0.9}><Hero x={540} y={1400} s={1.4} outfit="norway" bun num="9" pose={P.run(t * 6)} face={{ mouth: "flat", eyes: "open", sweat: 1 }} /></g>
          )}
          {goal && (
            <g>
              <Net x={140} y={760} w={800} h={420} />
              {[0, 1].map((i) => {
                const k = easeOut((t - Q.double - i * 0.45) / 0.5);
                if (t < Q.double + i * 0.45) return null;
                return <Ball key={i} x={lerp(540, 380 + i * 320, k)} y={lerp(1800, 1000 + i * 40, k)} r={60} rot={t * 600} />;
              })}
              <Flag code="NO" x={300} y={600} w={200} /><Flag code="IQ" x={780} y={600} w={200} />
              <text x={540} y={620} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={60} fill="#fff">vs</text>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      <Card t={t} at={Q.wc22} out={Q.y1998 - 0.1} y={620} size={60} bg="#fff">২০২২ বিশ্বকাপ ❌</Card>
      <Card t={t} at={Q.euro} out={Q.y1998 - 0.1} y={840} size={60} bg="#fff">ইউরো ২০২৪ ❌</Card>
      <Card t={t} at={Q.noquit} out={Q.y2026 - 0.1} y={1000} size={50} bg="#fff">অভিযোগ নেই · হাল ছাড়েনি 💪</Card>
      <Card t={t} at={Q.y2026 + 0.9} out={Q.double - 0.05} y={560} size={52} w={900} bg={C.gold}>১৯৯৮ → ২০২৬ | ২৮ বছরের অপেক্ষা</Card>
      <Pop t={t} at={Q.double} x={540} y={430} size={110} color={C.gold}>ডাবল গোল! ⚽⚽</Pop>
    </AbsoluteFill>
  );
};

// ======================================================================== RUN
const MATCHES: [FlagCode, string, boolean, string][] = [["SN", "সেনেগাল", true, "sen"], ["FR", "ফ্রান্স", false, "fra"], ["CI", "আইভরি কোস্ট", true, "civ"], ["BR", "ব্রাজিল", true, "bra"], ["EN", "ইংল্যান্ড", false, "eng"]];
export const Run: React.FC<SP> = ({ t }) => {
  const shake = pulse(t, Q.fra41, 7) * 26;
  const boom = pulse(t, Q.nb21, 3);
  return (
    <AbsoluteFill style={{ transform: `translate(${(rand(Math.floor(t * 30)) - 0.5) * shake}px, ${(rand(Math.floor(t * 30) + 3) - 0.5) * shake}px)` }}>
      <Stadium t={t} tint={boom > 0.05 ? "#5A1A1A" : "#14306A"} />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {MATCHES.map(([code, name, win_, key], i) => {
          const at = Q[key];
          if (t < at) return null;
          const k = backOut((t - at) / 0.3);
          const res = key === "bra" ? t >= Q.nb21 : true;
          const y = 360 + i * 128;
          return (
            <g key={i} transform={`translate(${lerp(-900, 0, clamp(k))} 0)`}>
              <rect x={60} y={y} width={960} height={108} rx={22} fill={win_ ? (key === "bra" && res ? "#7A2A12" : "#0F3D2A") : "#4A1220"} stroke={C.ink} strokeWidth={6} />
              <Flag code="NO" x={150} y={y + 54} w={100} r={8} />
              <text x={230} y={y + 72} fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill="#fff">vs</text>
              <Flag code={code} x={350} y={y + 54} w={100} r={8} />
              <text x={430} y={y + 72} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill="#fff">{name}</text>
              {res && <text x={980} y={y + 76} textAnchor="end" fontSize={58}>{win_ ? (key === "bra" ? "✅🔥" : "✅") : "❌"}</text>}
              {(key === "fra" || key === "eng" || key === "bra") && res && (
                <text x={820} y={y + 72} textAnchor="end" fontFamily={DISPLAY} fontWeight={800} fontSize={46} fill={win_ ? C.gold : "#FF8A8A"}>{key === "fra" ? "১–৪" : key === "eng" ? "১–২" : "২–১"}</text>
              )}
            </g>
          );
        })}
        {/* the Brazil explosion */}
        {boom > 0.02 && Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2, r = (1 - boom) * 900;
          return <circle key={i} cx={540 + Math.cos(a) * r} cy={1150 + Math.sin(a) * r * 0.7} r={30 * boom + 6} fill={[C.gold, C.orange, C.red][i % 3]} opacity={boom} />;
        })}
        {t >= Q.min11 && t < Q.nb21 && (
          <g transform="translate(540 1140)">
            <rect x={-200} y={-80} width={400} height={160} rx={20} fill={C.ink} stroke="#fff" strokeWidth={6} />
            <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={96} fill={C.gold}>{bn(79 + Math.min(11, Math.floor((t - Q.min11) * 8)))}'</text>
          </g>
        )}
      </svg>
      <Pop t={t} at={Q.fra41} out={Q.start - 0.2} x={540} y={1120} size={150} color="#FF5A5A">৪–১ 😬</Pop>
      <Card t={t} at={Q.over} out={Q.start} y={1330} size={56} bg="#fff">সবাই বলল: গল্প শেষ!</Card>
      <Card t={t} at={Q.start} out={Q.civ + 0.6} y={1150} size={60} bg={C.sky} rot={-2}>হালান্ড: "ভাই, কেবল তো শুরু!"</Card>
      <Pop t={t} at={Q.min11} out={Q.brag} x={540} y={1300} size={60}>১১ মিনিট বাকি ⏱️</Pop>
      <Pop t={t} at={Q.nb21} out={Q.eng - 0.2} x={540} y={1130} size={110} color={C.gold}>নরওয়ে ২–১ ব্রাজিল 🔥</Pop>
      <Card t={t} at={Q.qf} out={Q.eng - 0.2} y={1320} size={46} w={940} bg={C.gold}>ইতিহাসে প্রথমবার বিশ্বকাপ কোয়ার্টার ফাইনাল!</Card>
      <Card t={t} at={Q.seven} y={1130} size={78} bg={C.gold}>হালান্ড: ৭ গোল ⚽</Card>
      <Pop t={t} at={Q.hero} x={540} y={1290} size={66}>সারা দুনিয়ার হিরো 🌍</Pop>
    </AbsoluteFill>
  );
};

// ==================================================================== LESSONS
const LESSONS = ["ছোট দিয়ে শুরু করা লজ্জার না", "সাফল্য ধাপে ধাপে, শর্টকাটে না", "সুযোগ দেরিতে এলেও প্রস্তুতি আগে", "একটা হার ≠ পুরো গল্প"];
export const Lessons: React.FC<SP> = ({ t }) => (
  <AbsoluteFill>
    <Stadium t={t} tint="#123A5A" />
    <Card t={t} at={Q.L0} y={380} size={72} bg={C.gold}>আজ কী শিখলাম? 📝</Card>
    {LESSONS.map((txt, i) => {
      const at = Q[`L${i + 1}`];
      if (t < at - 0.05) return null;
      const k = backOut((t - at) / 0.3);
      return (
        <div key={i} style={{ position: "absolute", left: 60, right: 60, top: 520 + i * 200, height: 170, display: "flex", alignItems: "center", gap: 26,
          background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 28, padding: "0 30px", boxShadow: "0 10px 0 rgba(0,0,0,0.35)",
          transform: `translateX(${(1 - clamp(k)) * -900}px)` }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.sky, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: C.ink, flexShrink: 0 }}>{bn(i + 1)}</div>
          <div style={{ flex: 1, fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, color: C.ink, lineHeight: 1.2 }}>{txt}</div>
          <div style={{ fontSize: 74, transform: `scale(${t >= at + 0.6 ? backOut((t - at - 0.6) / 0.25) : 0})` }}>✅</div>
        </div>
      );
    })}
  </AbsoluteFill>
);

// ====================================================================== OUTRO
export const Outro: React.FC<SP> = ({ t }) => {
  const open = t >= Q.o_wc + 2.0;
  const end = t >= Q.o_end - 0.2;
  return (
    <AbsoluteFill>
      <Stadium t={t} tint="#163063" />
      <svg width={W} height={1920} style={{ position: "absolute" }}>
        {[0, 1, 2].map((i) => <circle key={i} cx={540} cy={1060} r={200 + i * 80 + Math.sin(t * 2 + i) * 10} fill="none" stroke={C.gold} strokeWidth={6} opacity={(0.45 - i * 0.12) * (open ? 1 : 0.6)} />)}
        <Hero x={540} y={1300} s={2.2} outfit="host" pose={end ? { ...P.stand(), armF: [1.55, 0.05] } : { ...P.sit(), armB: [0.9, 1.6], armF: [0.9, 1.6] }}
          face={{ eyes: open ? "open" : "closed", mouth: open ? "grin" : "smile" }} />
      </svg>
      <Card t={t} at={Q.o_wc} out={Q.o_phone - 0.1} y={480} size={62} bg={C.gold}>তোমার বিশ্বকাপও আসছে! 💪</Card>
      <Card t={t} at={Q.o_phone} out={Q.o_tag - 0.1} y={480} size={56} bg="#fff">আজ ফোনটা তাড়াতাড়ি রাখো 😏📱</Card>
      <Card t={t} at={Q.o_tag} out={Q.o_me - 0.1} y={480} size={58} bg={C.magenta} color="#fff">রাত ৩টার বন্ধুকে ট্যাগ করো! 🏷️</Card>
      <Card t={t} at={Q.o_me} y={480} size={64} bg={C.sky}>রুবেল মিয়া · ১০০ সেকেন্ডে শিখি</Card>
      {t >= Q.o_end && (
        <div style={{ position: "absolute", left: 140, right: 140, top: 1580, display: "flex", justifyContent: "center", transform: `scale(${backOut((t - Q.o_end) / 0.35) * (1 + beatPulse(t, 6) * 0.04)})` }}>
          <div style={{ background: C.red, color: "#fff", border: `5px solid ${C.ink}`, borderRadius: 60, padding: "18px 40px 26px", fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, whiteSpace: "nowrap",
            boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>ফলো করো, পরের পর্ব আসছে 👉</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
