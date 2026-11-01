import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, POSTER, MONO, PLAY } from "./fonts";
import { Figure, Kinetic, Slam, Bars, BrickPhone, Bubble, Rings, Hud, Scanlines, Dust, Flash, rgba } from "./kit";
import {
  C, D, H, clamp, lerp, smooth, easeOut, rand, ramp, win, findLine, lineAt, beatPulse, downbeatPulse,
  bassSmooth, onset, band, cuePulse, beatIndex, backOut,
} from "./lib";

export type SceneProps = { t: number; f: number };

// ======================================================================= MODEM
// 0 – 13.5 s. A bedroom at night, sometime around 2004. A boy at a beige CRT
// dials in; the handshake squeals. The song's two opening "Signal নাই" tags
// slam across the screen. "ট্র্র্র... কিঁইই... টুং!" lands as comic stickers.

const STARS = Array.from({ length: 70 }).map((_, i) => ({ x: rand(i) * 1920, y: rand(i + 50) * 420, r: 0.6 + rand(i + 99) * 1.8 }));

const ScreenText: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    [0.6, "DIAL-UP NETWORKING"],
    [2.2, "Dialing 0171-555-2004 ..."],
    [5.0, "Waiting for answer ..."],
    [8.6, "Verifying user name ..."],
    [11.4, "Connecting at 56,000 bps"],
  ] as const;
  return (
    <>
      {rows.map(([at, s], i) => {
        if (t < at) return null;
        const n = Math.floor((t - at) * 28);
        return <text key={i} x={30} y={58 + i * 44} fontFamily={MONO} fontSize={i === 0 ? 30 : 25} fontWeight={i === 0 ? 700 : 400}
          fill={i === 0 ? C.yellow : C.cyan}>{s.slice(0, n)}{n < s.length && Math.floor(t * 4) % 2 ? "_" : ""}</text>;
      })}
    </>
  );
};

export const Modem: React.FC<SceneProps> = ({ t, f }) => {
  const push = lerp(1, 1.16, smooth(t / 13.5));
  const modem = findLine("ট্র্র্র");
  const squeal = win(t, 11.5, 13.6, 0.2);
  // handshake waveform on the CRT, from the hi bands
  const wave = Array.from({ length: 90 }).map((_, i) => {
    const x = 30 + i * 5.2;
    const amp = 10 + band(f, 5 + (i % 3)) * 50 * (0.4 + squeal) + Math.sin(i * 0.9 + t * 30) * 6 * squeal;
    return `${x},${300 + Math.sin(i * 0.55 + t * 9) * amp * Math.sin(i * 0.11 + t)}`;
  }).join(" ");
  const leds = [0, 1, 2, 3, 4].map((i) => (onset(f - i) > 0.35 ? 1 : 0.25));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.midnight}, #070A1F 70%)` }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "62% 48%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {/* window with stars */}
          <rect x={160} y={110} width={520} height={420} fill="#0E1650" stroke="#2B3270" strokeWidth={14} />
          {STARS.filter((s) => s.x < 500 && s.y < 380).map((s, i) => (
            <circle key={i} cx={180 + s.x} cy={130 + s.y} r={s.r} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i))} />
          ))}
          <circle cx={560} cy={210} r={44} fill={C.cream} opacity={0.9} />
          <circle cx={578} cy={198} r={40} fill="#0E1650" />
          <line x1={420} y1={110} x2={420} y2={530} stroke="#2B3270" strokeWidth={10} />
          {/* poster on the wall */}
          <g transform="translate(1560 150) rotate(4)">
            <rect width={240} height={320} fill={C.crimson} />
            <text x={120} y={150} textAnchor="middle" fontFamily={POSTER} fontSize={80} fill={C.yellow}>Y2K</text>
            <text x={120} y={210} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="#fff">MIXTAPE VOL.1</text>
            <circle cx={120} cy={260} r={26} fill="none" stroke="#fff" strokeWidth={4} />
          </g>
          {/* desk */}
          <rect x={0} y={760} width={1920} height={320} fill="#1A1430" />
          <rect x={300} y={740} width={1460} height={30} fill="#3B2A4E" />
          <rect x={330} y={770} width={30} height={310} fill="#2A1E3C" />
          <rect x={1700} y={770} width={30} height={310} fill="#2A1E3C" />
          {/* CRT */}
          <g transform="translate(1180 470)">
            <path d="M-330 -260 L330 -260 L310 250 L-310 250 Z" fill="#CFC6B0" />
            <rect x={-280} y={-225} width={560} height={420} rx={30} fill="#08131A" />
            <rect x={-280} y={-225} width={560} height={420} rx={30} fill={C.cyan} opacity={0.08 + squeal * 0.1} />
            <g transform="translate(-280 -225)">
              <ScreenText t={t} />
              <polyline points={wave} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.85} />
            </g>
            <rect x={-200} y={250} width={400} height={20} fill="#B8AF98" />
            <rect x={-140} y={265} width={280} height={14} fill="#A39A84" />
          </g>
          {/* modem box */}
          <g transform="translate(1180 724)">
            <rect x={-170} y={-22} width={340} height={40} rx={8} fill="#2F2B3A" />
            {leds.map((l, i) => <circle key={i} cx={-120 + i * 40} cy={-2} r={7} fill={i % 2 ? C.yellow : "#6CFF7A"} opacity={l} />)}
            <text x={90} y={6} fontFamily={MONO} fontSize={18} fill="#8C86A0">56K</text>
          </g>
          {/* chair + boy */}
          <rect x={540} y={732} width={190} height={22} rx={8} fill="#2A2238" />
          <rect x={540} y={560} width={24} height={190} rx={8} fill="#2A2238" />
          <rect x={620} y={750} width={20} height={240} fill="#221B2F" />
          <Figure x={650} y={782} scale={2.25} pose={{ sit: true, bob: Math.sin(t * 2) * 1.5 }} fill="#0A0814" rim={C.cyan} />
        </svg>
        {/* screen glow on the room */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 40% at 61% 45%, ${rgba(C.cyan, 0.12 + squeal * 0.12)}, rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />
      </AbsoluteFill>
      {/* the two opening tags */}
      {D.tags.map((at, i) => (
        <React.Fragment key={i}>
          <Slam text="SIGNAL নাই" t={t} at={at} out={at + 1.25} size={190} font={POSTER} x={960} y={520} rot={i ? 3 : -4}
            color={i ? C.yellow : C.white} shadow={`10px 10px 0 ${C.crimson}, -6px -4px 0 ${C.cyan}`} />
          <Flash amount={cuePulse(t, at, 14) * 0.5} color={C.crimson} />
        </React.Fragment>
      ))}
      {/* modem noise as comic stickers */}
      {modem.words.map((w, i) => {
        if (t < w.s) return null;
        const k = backOut((t - w.s) / 0.2);
        const pos = [[470, 430, -10], [960, 330, 6], [1430, 450, -4]][i];
        const jag = Array.from({ length: 22 }).map((_, j) => {
          const a = (j / 22) * Math.PI * 2, r = j % 2 ? 120 : 165 + rand(j + i * 9) * 30;
          return `${Math.cos(a) * r * 1.5},${Math.sin(a) * r * 0.75}`;
        }).join(" ");
        return (
          <div key={i} style={{ position: "absolute", left: pos[0], top: pos[1], width: 0, height: 0, transform: `rotate(${pos[2]}deg) scale(${lerp(0.2, 1, k)})` }}>
            <svg width={600} height={340} style={{ position: "absolute", left: -300, top: -170 }}>
              <polygon points={jag} transform="translate(300 170)" fill={C.yellow} stroke={C.ink} strokeWidth={8} />
            </svg>
            <div style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, color: C.crimson, whiteSpace: "nowrap", textShadow: `4px 4px 0 ${C.ink}` }}>{w.w}</div>
          </div>
        );
      })}
      <Scanlines opacity={0.1} roll={(f * 2) % 5} />
    </AbsoluteFill>
  );
};

// ======================================================================== CALL
// 13.5 – 16.6 s. Connected — and immediately not. A brick phone, the call
// bubbles, the bars draining to nothing, static.

export const Call: React.FC<SceneProps> = ({ t, f }) => {
  const lvl = lerp(4, 0, smooth((t - 13.7) / 2.6));
  const dead = ramp(t, 16.05, 0.2);
  const shake = beatPulse(t, 10) * 4;
  const lines = D.lines.filter((l) => l.section === "Intro" && l.dialogue);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 35% 55%, ${C.navy}, ${C.obsidian} 75%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Rings cx={640} cy={330} t={t} n={5} speed={0.9} max={900} color={C.cyan} width={5} opacity={1 - dead} />
        <g transform={`translate(${(rand(f) - 0.5) * shake} ${(rand(f + 1) - 0.5) * shake})`}>
          <BrickPhone x={640} y={640} s={1.45} rot={-8} glow={1 - dead}>
            <Bars x={12} y={34} h={26} level={lvl} color="#1E3A12" off="rgba(30,58,18,0.18)" />
            <text x={75} y={70} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={17} fill="#1E3A12">{dead > 0.5 ? "NO SIGNAL" : "CALLING"}</text>
            <text x={75} y={100} textAnchor="middle" fontFamily={MONO} fontSize={15} fill="#1E3A12">{dead > 0.5 ? "" : `00:0${Math.min(9, Math.floor(t - 13.5))}`}</text>
            {dead > 0 && Array.from({ length: 40 }).map((_, i) => (
              <rect key={i} x={rand(f * 3 + i) * 150} y={rand(f * 7 + i) * 120} width={8 + rand(i + f) * 30} height={3} fill="#1E3A12" opacity={dead * 0.7} />
            ))}
          </BrickPhone>
        </g>
      </svg>
      {lines.map((l, i) => (
        <Bubble key={i} t={t} at={l.s} text={l.text} side={i === 1 ? "r" : "l"} x={i === 1 ? 1760 : 1010} y={[400, 600, 820][i]}
          bg={i === 1 ? C.cyan : C.white} size={66} out={16.4} />
      ))}
      <Scanlines opacity={0.14} roll={f % 5} />
    </AbsoluteFill>
  );
};

// ======================================================================= CHANT
// 16.6 – 32.9 s. The connection drops — "Signal নাই!" — and the song chants it.
// A radio tower broadcasts to nobody; every chanted repeat is stamped onto its
// rings, and the camera rides the rings into the tower's beacon.

const TOWER = (() => {
  const segs: string[] = [];
  const top = 330, base = 1080, n = 9;
  for (let i = 0; i < n; i++) {
    const y0 = top + ((base - top) * i) / n, y1 = top + ((base - top) * (i + 1)) / n;
    const w0 = 20 + i * 22, w1 = 20 + (i + 1) * 22;
    segs.push(`M${960 - w0} ${y0} L${960 + w1} ${y1} M${960 + w0} ${y0} L${960 - w1} ${y1} M${960 - w1} ${y1} L${960 + w1} ${y1}`);
  }
  return { d: `M940 ${top} L${960 - 218} 1080 M980 ${top} L${960 + 218} 1080 ${segs.join(" ")}`, top };
})();

export const Chant: React.FC<SceneProps> = ({ t, f }) => {
  const intro = findLine("Signal নাই!");
  const dive = easeOut((t - 30.8) / 2.1);
  const zoom = lerp(1, 4.2, Math.pow(clamp((t - 30.6) / 2.3), 2.2));
  const speed = lerp(0.35, 1.6, smooth((t - 16.6) / 16));
  const COLORS = [C.crimson, C.yellow, C.cyan, C.magenta];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #1A1460, ${C.obsidian} 70%)` }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `50% ${(TOWER.top / 1080) * 100}%` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <Rings cx={960} cy={TOWER.top} t={t} n={8} speed={speed} max={1500} color={C.cyan} width={7} />
          <Rings cx={960} cy={TOWER.top} t={t + 0.5} n={4} speed={speed * 0.7} max={1500} color={C.magenta} width={3} opacity={0.6} />
          <path d={TOWER.d} stroke="#05040C" strokeWidth={9} fill="none" strokeLinecap="round" />
          <circle cx={960} cy={TOWER.top - 8} r={16 + beatPulse(t) * 14} fill={C.crimson} />
          <circle cx={960} cy={TOWER.top - 8} r={60 + beatPulse(t) * 40} fill={C.crimson} opacity={0.2} />
        </svg>
        {/* each chanted repeat stamped on the rings */}
        {D.chant.slice(1).map(([at], i) => {
          const ang = -150 + i * 41;
          const r = 290 + (i % 3) * 120;
          const x = 960 + Math.cos((ang * Math.PI) / 180) * r * 1.35;
          const y = TOWER.top + 120 + Math.sin((ang * Math.PI) / 180) * r * 0.75;
          const dim = 1 - 0.55 * ramp(t, at + 0.5, 0.4);
          return (
            <div key={i} style={{ opacity: dim }}>
              <Slam text="SIGNAL নাই" t={t} at={at} x={x} y={y} size={88} font={POSTER} rot={ang / 6}
                color={COLORS[i % 4]} shadow={`5px 5px 0 ${C.obsidian}`} />
            </div>
          );
        })}
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Bars x={1680} y={150} h={90} level={Math.floor(t * 3) % 2 ? 1 : 0} cross={1} />
      </svg>
      <Hud x={80} y={70} color={C.cyan}>NO SERVICE · SEARCHING{".".repeat(1 + (Math.floor(t * 3) % 3))}</Hud>
      {/* the impact line */}
      {t < intro.e + 0.4 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + cuePulse(t, intro.s, 4) * 0.15})` }}>
          <Kinetic line={intro} t={t} st={{ font: POSTER, size: 260, weight: 400, shadow: `14px 14px 0 ${C.crimson}, -8px -6px 0 ${C.cyan}`, spread: 0.18 }} />
        </AbsoluteFill>
      )}
      <Flash amount={dive * 0.9 * ramp(t, 32.5, 0.35)} color="#fff" />
      <Scanlines opacity={0.12} roll={f % 5} />
    </AbsoluteFill>
  );
};

// ======================================================================== HOOK
// 32.9 – 44.5 s. Bass in. Night rooftops; the boy holds his phone up hunting
// for a bar. The sky is wired with everyone's network — he is connected to
// all of it and to no one, not even his own reflection.

const ROOFS = Array.from({ length: 24 }).map((_, i) => ({
  x: i * 86 - 30 + rand(i) * 30, w: 70 + rand(i + 3) * 70, h: 120 + rand(i + 7) * 300, ant: rand(i + 11) > 0.35, dish: rand(i + 13) > 0.7,
}));
const NODES = ROOFS.filter((r) => r.ant).map((r) => ({ x: r.x + r.w / 2, y: 1080 - 170 - r.h - 70 }));
const EDGES = NODES.flatMap((a, i) => NODES.slice(i + 1).filter((b) => Math.abs(a.x - b.x) < 420 && rand(a.x + b.x) > 0.35).map((b) => [a, b] as const));

export const Hook: React.FC<SceneProps & { lyrics?: boolean }> = ({ t, f, lyrics = true }) => {
  const line = lineAt(t, ["Hook First"]);
  const web = ramp(t, findLine("নেটওয়ার্কে").s, 1.2);
  const self = findLine("নিজের সঙ্গে");
  const brk = self.words[3].s;
  const heart = ramp(t, findLine("মনটা কিন্তু").s, 0.3);
  const b = bassSmooth(f, 2);
  const cam = 1.04 + b * 0.02;
  const fx = 560, fy = 905, fs = 2.4;
  const hand = { x: fx + 62.7 * fs, y: fy - 185 * fs };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(#060A26 0%, ${C.navy} 55%, #3A1450 100%)` }}>
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t + i))} />)}
          {/* network web */}
          <g opacity={web}>
            {EDGES.map(([a, c], i) => {
              const len = Math.hypot(a.x - c.x, a.y - c.y);
              const draw = clamp(web * 1.6 - (i / EDGES.length) * 0.6);
              return <line key={i} x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={C.cyan} strokeWidth={2} opacity={0.5}
                strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />;
            })}
            {NODES.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={5 + beatPulse(t - i * 0.03) * 6} fill={C.cyan} />)}
          </g>
          {ROOFS.map((r, i) => {
            const top = 1080 - 170 - r.h;
            return (
              <g key={i}>
                <rect x={r.x} y={top} width={r.w} height={r.h + 200} fill="#0B0D24" />
                {Array.from({ length: Math.floor(r.h / 46) }).map((_, j) => (
                  <rect key={j} x={r.x + 12} y={top + 20 + j * 46} width={r.w - 24} height={14}
                    fill={rand(i * 31 + j) > 0.55 ? C.yellow : "#1C2050"} opacity={rand(i * 31 + j) > 0.55 ? 0.55 : 1} />
                ))}
                {r.ant && <path d={`M${r.x + r.w / 2} ${top} L${r.x + r.w / 2} ${top - 70} M${r.x + r.w / 2 - 22} ${top - 50} L${r.x + r.w / 2 + 22} ${top - 50} M${r.x + r.w / 2 - 14} ${top - 30} L${r.x + r.w / 2 + 14} ${top - 30}`} stroke="#0B0D24" strokeWidth={5} />}
                {r.dish && <path d={`M${r.x + 10} ${top} q 20 -40 44 -10`} stroke="#0B0D24" strokeWidth={8} fill="none" />}
              </g>
            );
          })}
          {/* his roof */}
          <rect x={0} y={905} width={1920} height={175} fill="#05060F" />
          <rect x={0} y={896} width={1920} height={12} fill="#1A1C3A" />
          <rect x={1300} y={760} width={150} height={140} fill="#0A0B1A" />
          <rect x={1290} y={748} width={170} height={16} fill="#1A1C3A" />
          {/* reflection: him, disconnected */}
          {t >= self.s - 0.1 && (
            <g opacity={0.55 * ramp(t, self.s, 0.4)}>
              <line x1={fx + 70} y1={fy - 260} x2={1100} y2={fy - 260} stroke={C.cyan} strokeWidth={5} strokeDasharray="18 14"
                transform={t > brk ? `translate(0 ${(t - brk) * 120}) rotate(${(t - brk) * 20} ${fx + 300} ${fy - 260})` : undefined} />
              <Figure x={1180} y={fy} scale={fs} fill="none" rim={C.cyan} flip />
            </g>
          )}
          <Figure x={fx} y={fy} scale={fs} pose={{ reach: 1, bob: Math.sin(t * 3) * 1.2 }} fill="#020208" rim={C.magenta} />
          {/* heart: the mind is not offline */}
          {heart > 0 && (
            <path transform={`translate(${fx} ${fy - 320}) scale(${heart * (1 + beatPulse(t) * 0.25)})`}
              d="M0 18 C -30 -6 -22 -30 0 -16 C 22 -30 30 -6 0 18 Z" fill={C.magenta} />
          )}
          {/* the phone held up */}
          <rect x={hand.x - 16} y={hand.y - 34} width={32} height={58} rx={6} fill="#111" stroke={C.cyan} strokeWidth={3} />
          <circle cx={hand.x} cy={hand.y - 5} r={60} fill={C.cyan} opacity={0.12 + beatPulse(t) * 0.1} />
          <Bars x={hand.x - 40} y={hand.y - 70} h={56} level={Math.floor(t * 4) % 3 === 0 ? 1 : 0} cross={0.9} />
        </svg>
      </AbsoluteFill>
      {lyrics && line && (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <Kinetic line={line} t={t} st={{ size: 124, active: C.yellow, shadow: `7px 7px 0 ${C.crimson}` }} />
        </AbsoluteFill>
      )}
      <Flash amount={cuePulse(t, H.bassIn, 7) * 0.85} />
      <Dust t={t} n={30} opacity={0.35} />
    </AbsoluteFill>
  );
};

// ====================================================================== REWIND
// 44.5 – 56.4 s. "পুরোনো সেই দিনের মতো / আজকে একটু হারাই!" — the night is
// rewound like a VHS tape, then the years spin back to 2004 on a cassette.

export const Rewind: React.FC<SceneProps> = ({ t, f }) => {
  const line = lineAt(t, ["Hook First"]);
  const vhs = t < 49.2;
  const back = 44.5 - (t - 44.5) * 2.3;
  const warm = ramp(t, 46, 3);
  const k = clamp((t - 49.2) / 6.6);
  const year = Math.round(lerp(2026, 2004, smooth(k)));
  const reel = (t < 55.8 ? -1 : 0) * (lerp(40, 4, k) * t * 6);
  const play = t >= 55.95;
  return (
    <AbsoluteFill style={{ background: C.obsidian }}>
      {vhs ? (
        <AbsoluteFill style={{ filter: `sepia(${warm * 0.7}) saturate(${1 + warm * 0.4}) hue-rotate(${-warm * 15}deg)` }}>
          <Hook t={Math.max(33.6, back)} f={Math.max(1008, Math.round(back * 30))} lyrics={false} />
          {/* tracking bars */}
          {[0, 1, 2].map((i) => {
            const y = ((t * 380 + i * 360) % 1200) - 60;
            return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 26 + i * 10, background: "rgba(255,255,255,0.18)", transform: `translateX(${(rand(f + i) - 0.5) * 60}px)` }} />;
          })}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, #3A1E14, #120A08 75%)` }}>
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <g transform="translate(960 600)">
              <rect x={-470} y={-280} width={940} height={560} rx={36} fill="#2B2420" stroke="#11100E" strokeWidth={8} />
              <rect x={-400} y={-230} width={800} height={200} rx={14} fill={C.paper} />
              <rect x={-400} y={-230} width={800} height={60} rx={14} fill={C.orange} />
              <text x={0} y={-130} textAnchor="middle" fontFamily={PLAY} fontWeight={700} fontSize={64} fill={C.ink}>বিকেলের গান</text>
              <rect x={-280} y={-10} width={560} height={170} rx={85} fill="#14110F" />
              {[-170, 170].map((cx, i) => (
                <g key={i} transform={`translate(${cx} 75) rotate(${reel})`}>
                  <circle r={74} fill={C.paper} />
                  <circle r={30} fill="#14110F" />
                  {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x={-6} y={-30} width={12} height={16} fill={C.paper} transform={`rotate(${a})`} />)}
                </g>
              ))}
              <rect x={-150} y={40} width={300} height={70} fill="#5A3A24" />
            </g>
          </svg>
          <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: POSTER, fontSize: 260, color: C.yellow,
            textShadow: `12px 12px 0 ${C.crimson}`, transform: `scale(${1 + beatPulse(t, 12) * 0.06})` }}>{year}</div>
        </AbsoluteFill>
      )}
      <Hud x={90} y={80} size={54} color="#fff">{play ? "▶ PLAY" : "◀◀ REW"}</Hud>
      <Hud x={1830} y={80} size={40} color="#fff" anchor="r">{`SP  ${String(Math.floor((60 - t) / 60)).padStart(2, "0")}:${String(Math.floor(60 - t) % 60).padStart(2, "0")}`}</Hud>
      {line && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 110 }}>
          <Kinetic line={line} t={t} st={{ size: 116, color: C.cream, active: C.yellow, shadow: `6px 6px 0 ${C.crimson}`, mode: "pop" }} />
        </AbsoluteFill>
      )}
      <Scanlines opacity={0.22} roll={(f * 3) % 5} />
      <Flash amount={cuePulse(t, 49.2, 10) * 0.6} />
    </AbsoluteFill>
  );
};
