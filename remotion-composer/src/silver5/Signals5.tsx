// "5 Recovery Signals" — companion to the Silver Crash & Recovery documentary, cut to the client's own
// Bangla voiceover (vo.json, 14 lines aligned with Whisper). Same RUPMYK cinematic look and shared pieces.
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FONT_CSS } from "../portfolio/fontcss";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import { Defs, Bar, Coin, Chart, walk, Candles, Dust, Title, Monitor, Globe, Brand, C, EN, iv, CRASH, REC_C } from "../silver/Silver";
import VO from "./vo.json";

export const S5_FPS = 30, S5_W = 1080, S5_H = 1920;
const LN = VO.lines;
const BRAND = LN[LN.length - 1].e + 0.6;
const TOTAL = BRAND + 5.0;
export const S5_FRAMES = Math.ceil(TOTAL * S5_FPS);
const W = S5_W, H = S5_H;
const EB = "Inter, sans-serif", BN = "Anek, sans-serif";
const AMBER = "#f2b84b";
const B = (i: number) => (i <= 0 ? 0 : (LN[i - 1].e + LN[i].s) / 2);
const out = Easing.out(Easing.cubic);

// scenes: [start line, end line (exclusive)]
const SC: [number, number][] = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 13], [13, 14]];
const sceneStart = (k: number) => B(SC[k][0]);
const sceneEnd = (k: number) => (k + 1 < SC.length ? B(SC[k + 1][0]) : BRAND);

const YIELD_DOWN = walk([[0, .85], [1, .2]], 60, .03, 3);
const SILVER_UP = walk([[0, .25], [1, .8]], 60, .03, 4);
const ETF_FLOWS = [.2, .25, .22, .3, .36, .42, .5, .58, .66, .74];

type Sc = React.FC<{ lt: number; dur: number }>;
const S0: Sc = ({ lt, dur }) => (<>
  <Dust t={lt} n={80} />
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${1 + lt * .015})` }}>
    <Chart v={CRASH} k={iv(lt, .2, dur * .55, 0, 1)} x={70} y={640} w={940} h={500} color={lt < dur * .4 ? C.silver : C.red} />
    <Bar x={540} y={1380} w={680} sweep={(lt * .35) % 1.4} tilt={-3} />
  </svg>
  <Title lt={lt} lines={[{ t: "AFTER THE CRASH", at: .4, big: true }, { t: "IS SILVER READY TO RECOVER?", at: 1.6 }]} />
  {lt > LN[1].s - sceneStart(0) && <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", opacity: iv(lt, LN[1].s - sceneStart(0), LN[1].s - sceneStart(0) + .6),
    fontFamily: EN, fontWeight: 800, fontSize: 70, letterSpacing: 8, color: "#9ff0c4", textShadow: `0 0 26px ${C.green}88` }}>5 RECOVERY SIGNALS</div>}
</>);

const SigHead: React.FC<{ lt: number; n: number; title: string; sub: string; color?: string }> = ({ lt, n, title, sub, color }) => (
  <Title lt={lt} top={150} lines={[{ t: `SIGNAL ${n}`, at: .2, color: "#9ff0c4" }, { t: title, at: .5, big: true, color }, { t: sub, at: 1.8 }]} />
);

const S1: Sc = ({ lt, dur }) => {
  const weak = iv(lt, 1, 4);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Globe x={540} y={1020} r={340} t={lt} />
      <text x={540} y={1150 + weak * 60} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={520 - weak * 180} fill="#7ff0b1" opacity={1 - weak * .75}>$</text>
      {weak > .3 && Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, p = ((lt * .4 + i / 8) % 1); const r = 360 - p * 260;
        return <Coin key={i} x={540 + Math.cos(a) * r} y={1020 + Math.sin(a) * r * .5} r={26} o={Math.sin(p * Math.PI)} />; })}
      <Chart v={SILVER_UP} k={iv(lt, 2.5, dur - .4)} x={600} y={1460} w={400} h={200} color={C.green} grid={false} area={false} sw={5} />
      <text x={600} y={1450} fontFamily={EB} fontWeight={700} fontSize={22} fill="#8b929b">SILVER DEMAND</text>
      <Bar x={300} y={1590} w={340} sweep={(lt * .3) % 1.4} label={false} />
    </svg>
    <SigHead lt={lt} n={1} title="WEAK DOLLAR" sub="GLOBAL DEMAND CAN RISE" />
  </>);
};

const S2: Sc = ({ lt, dur }) => {
  const shift = iv(lt, 3, dur - .5);
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Monitor x={110} y={620} w={860} h={420}>
        <Chart v={YIELD_DOWN} k={iv(lt, .4, dur - 1)} x={140} y={670} w={800} h={340} color={C.red} />
        <text x={140} y={660} fontFamily={EB} fontWeight={800} fontSize={28} fill="#ff9c9c" letterSpacing={4}>BOND YIELD ▼  ·  RATE CUT ODDS ▲</text>
      </Monitor>
      <g transform="translate(290 1340)" opacity={1 - shift * .6}>
        <rect x={-170} y={-110} width={340} height={220} rx={10} fill="#e9e3d2" stroke="#b6a77c" strokeWidth={6} />
        <text y={-20} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={32} fill="#5a4d2c">BOND</text>
        <text y={40} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={46} fill="#5a4d2c">% ▼</text>
      </g>
      <g style={{ filter: `drop-shadow(0 0 ${shift * 50}px rgba(220,230,240,.6))` }}><Bar x={780} y={1360} w={400} sweep={shift > .2 ? (lt * .4) % 1.4 : -1} /></g>
      {Array.from({ length: 14 }, (_, i) => { const p = ((lt * .5 + i / 14) % 1); return shift > 0 ? <circle key={i} cx={420 + p * 300} cy={1340 - Math.sin(p * Math.PI) * 120} r={6} fill="#dfe4ea" opacity={shift * (1 - p)} /> : null; })}
    </svg>
    <SigHead lt={lt} n={2} title="LOWER YIELDS" sub="SILVER BECOMES ATTRACTIVE" />
  </>);
};

const S3: Sc = ({ lt, dur }) => (<>
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <Monitor x={110} y={600} w={860} h={560}>
      <text x={140} y={660} fontFamily={EN} fontWeight={800} fontSize={40} fill="#e6eaef" letterSpacing={4}>SILVER ETF HOLDINGS</text>
      {ETF_FLOWS.map((v, i) => { const a = iv(lt, .5 + i * .35, .9 + i * .35, 0, 1, out); return <rect key={i} x={150 + i * 80} y={1120 - v * 420 * a} width={56} height={v * 420 * a} rx={6} fill={i > 4 ? C.green : "#5f6670"} opacity={.9} />; })}
      <text x={930} y={720} textAnchor="end" fontFamily={EN} fontWeight={800} fontSize={44} fill={C.green} opacity={iv(lt, 3, 3.6)}>INFLOWS ▲</text>
    </Monitor>
    {Array.from({ length: 6 }, (_, i) => { const p = ((lt * .35 + i / 6) % 1); return lt > 2 ? <Coin key={i} x={150 + p * 760} y={1400 - Math.sin(p * Math.PI) * 140} r={34} rot={p * 360} o={Math.sin(p * Math.PI)} /> : null; })}
    <Bar x={540} y={1540} w={540} sweep={(lt * .3) % 1.4} />
  </svg>
  <SigHead lt={lt} n={3} title="ETF INFLOWS" sub="CONFIDENCE IS RETURNING" />
</>);

const Solar: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <path d="M -150 60 L -100 -80 L 150 -80 L 200 60 Z" fill="#102a4a" stroke="#c9d3df" strokeWidth={5} />
    {Array.from({ length: 5 }, (_, i) => <line key={"a" + i} x1={-150 + i * 70} y1={60} x2={-100 + i * 50} y2={-80} stroke="#5e8ac0" strokeWidth={2} />)}
    {Array.from({ length: 3 }, (_, i) => { const yy = -80 + (i + 1) * 35, l = -100 - (i + 1) * 12.5, r = 150 + (i + 1) * 12.5; return <line key={"b" + i} x1={l} y1={yy} x2={r} y2={yy} stroke="#5e8ac0" strokeWidth={2} />; })}
    <line x1={25} y1={60} x2={25} y2={140} stroke="#8b929b" strokeWidth={10} /><text y={200} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#c9ced6" letterSpacing={4}>SOLAR</text>
  </g>
);
const Chip: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    {Array.from({ length: 6 }, (_, i) => [-1, 1].map((sd) => <g key={i + "" + sd}><rect x={-95 + i * 34} y={sd * 100 - 12} width={14} height={24} fill="#c9ced6" /><rect x={sd * 100 - 12} y={-95 + i * 34} width={24} height={14} fill="#c9ced6" /></g>))}
    <rect x={-90} y={-90} width={180} height={180} rx={14} fill="#1c1f24" stroke="#c9ced6" strokeWidth={5} />
    <text y={22} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={64} fill="#dfe4ea">Ag</text>
    <text y={200} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#c9ced6" letterSpacing={4}>ELECTRONICS</text>
  </g>
);
const Gear: React.FC<{ x: number; y: number; k: number; t: number }> = ({ x, y, k, t }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
    <g transform={`rotate(${t * 30})`}>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={-14} y={-110} width={28} height={40} fill="#c9ced6" transform={`rotate(${i * 36})`} />)}<circle r={82} fill="#c9ced6" /><circle r={34} fill="#14161a" /></g>
    <text y={200} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#c9ced6" letterSpacing={4}>INDUSTRY</text>
  </g>
);
const S4: Sc = ({ lt }) => {
  const a = (d: number) => iv(lt, d, d + .6, 0, 1, Easing.out(Easing.back(1.6)));
  return (<>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Solar x={300} y={760} k={a(.9)} /><Chip x={790} y={790} k={a(1.6)} /><Gear x={540} y={1180} k={a(2.4)} t={lt} />
      {Array.from({ length: 18 }, (_, i) => { const p = ((lt * .4 + i / 18) % 1), tgt = [[300, 760], [790, 790], [540, 1180]][i % 3];
        return lt > 3 ? <circle key={i} cx={540 + (tgt[0] - 540) * p} cy={1620 + (tgt[1] - 1620) * p} r={6} fill="#dfe4ea" opacity={Math.sin(p * Math.PI)} /> : null; })}
      <Bar x={540} y={1530} w={500} sweep={(lt * .3) % 1.4} />
    </svg>
    <SigHead lt={lt} n={4} title="INDUSTRIAL DEMAND" sub="SOLAR · ELECTRONICS · INDUSTRY" />
  </>);
};

const S5: Sc = ({ lt, dur }) => {
  const k = iv(lt, .3, dur - .8), off = LN[11].s - sceneStart(5);
  const X = (i: number) => 80 + (i + 0.5) * (920 / REC_C.length), Y = (v: number) => 660 + 760 - v * 760;
  return (<>
    <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 60% 55%, rgba(53,208,127,${0.12 * iv(lt, off, off + 3)}), rgba(0,0,0,0) 70%)` }} />
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <Candles data={REC_C} k={k} x={80} y={660} w={920} h={760} />
      {lt > 2.4 && <g opacity={iv(lt, 2.4, 2.9)}><circle cx={X(6)} cy={Y(.22)} r={34} fill="none" stroke="#fff" strokeWidth={4} /><text x={X(6)} y={Y(.22) + 80} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill="#fff">NO NEW LOW</text></g>}
      {lt > off && <g opacity={iv(lt, off, off + .5)}><circle cx={X(10)} cy={Y(.32)} r={34} fill="none" stroke={C.green} strokeWidth={4} /><text x={X(10)} y={Y(.32) + 80} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={34} fill={C.green}>HIGHER LOW</text>
        <line x1={X(6)} y1={Y(.22)} x2={X(10)} y2={Y(.32)} stroke={C.green} strokeWidth={4} strokeDasharray="12 10" /></g>}
    </svg>
    <SigHead lt={lt} n={5} title="HIGHER LOWS" sub="A KEY TECHNICAL SIGNAL" />
  </>);
};

const S6: Sc = ({ lt }) => {
  const items = ["WEAK DOLLAR", "LOWER YIELDS", "ETF INFLOWS", "INDUSTRIAL DEMAND", "HIGHER LOWS"];
  return (<>
    <Title lt={lt} top={170} lines={[{ t: "NO GUARANTEE", at: .3, big: true, color: AMBER }, { t: "EVEN WHEN SIGNALS ALIGN", at: 1.2 }]} />
    {items.map((it, i) => { const a = iv(lt, .5 + i * .25, .9 + i * .25, 0, 1, out);
      return <div key={i} style={{ position: "absolute", left: 140, right: 140, top: 600 + i * 150, height: 120, display: "flex", alignItems: "center", gap: 24, opacity: a * (1 - .35 * iv(lt, 2.8, 3.6)), transform: `translateX(${(1 - a) * -80}px)`,
        border: "2px solid rgba(220,226,234,.2)", borderRadius: 20, padding: "0 26px", background: "rgba(255,255,255,.04)" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, border: `3px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontFamily: EN, fontWeight: 800, fontSize: 40 }}>✓</div>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 46, color: "#dfe4ea" }}>{it}</div></div>; })}
    {lt > 2.8 && <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", opacity: iv(lt, 2.8, 3.4), transform: `rotate(-6deg) scale(${iv(lt, 2.8, 3.3, 1.6, 1, out)})` }}>
      <span style={{ fontFamily: EN, fontWeight: 800, fontSize: 70, color: AMBER, border: `6px solid ${AMBER}`, padding: "6px 26px", borderRadius: 12, letterSpacing: 4 }}>RECOVERY NOT CONFIRMED</span></div>}
  </>);
};

const S7: Sc = ({ lt, dur }) => (<>
  <AbsoluteFill style={{ background: "radial-gradient(45% 30% at 50% 60%, #2a2d33, #060708 70%)" }} />
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${iv(lt, 0, dur, 1.15, .95)})` }}>
    <Bar x={540} y={1180} w={660} sweep={iv(lt, 1, 4)} />
  </svg>
  <Title lt={lt} top={200} lines={[{ t: "PATIENCE", at: .4, big: true }, { t: "+ INFORMATION", at: 1.4, big: true, color: "#9ff0c4" }, { t: "THE MOST IMPORTANT TOOLS", at: 2.4 }]} />
</>);

const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7];

// Bangla subtitle of the line being spoken
const Sub: React.FC<{ t: number }> = ({ t }) => {
  const l = LN.find((x) => t >= x.s - .1 && t <= x.e + .2); if (!l) return null;
  const o = Math.min(iv(t, l.s - .1, l.s + .25), 1 - iv(t, l.e, l.e + .2));
  return <div style={{ position: "absolute", left: 50, right: 50, bottom: 56, textAlign: "center", opacity: o, fontFamily: BN, fontWeight: 600, fontSize: 40, lineHeight: 1.3, color: "#e6eaef", textShadow: "0 2px 10px #000" }}>{l.text.replace(/ — /g, " — ")}</div>;
};

export const Signals5: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px InterTight", "700 40px Inter", "600 40px Anek"].map((f) => document.fonts.load(f, "ABC অআ"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / S5_FPS;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      <Defs />
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 50%, #17191d 0%, #060708 75%)" }} />
      {SC.map((_, k) => {
        const a = sceneStart(k), b = sceneEnd(k); if (t < a - .01 || t > b + .45) return null;
        const lt = t - a, o = Math.min(iv(lt, 0, .4), 1 - iv(t, b, b + .45)); const Sc = SCENES[k];
        return <AbsoluteFill key={k} style={{ opacity: o, filter: o < .99 ? `blur(${(1 - o) * 10}px)` : undefined }}><Sc lt={lt} dur={b - a} /></AbsoluteFill>;
      })}
      {t >= BRAND && <Brand lt={t - BRAND} />}
      {t < BRAND && <Sub t={t} />}
      <div style={{ position: "absolute", right: 50, top: 70, fontFamily: EN, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: "#6b727b", opacity: t < BRAND ? 1 : 0 }}>RUPMYK · SILVER</div>
      <Img src={staticFile(`silver/grain${fr % 6}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: .22, mixBlendMode: "overlay", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "radial-gradient(85% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 100%)" }} />
      <Audio src={staticFile("silver/mix5.wav")} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, .5) + iv(t, TOTAL - .8, TOTAL) }} />
    </AbsoluteFill>
  );
};
export const S5_TOTAL = TOTAL;
