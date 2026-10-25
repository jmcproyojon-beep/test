import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
// @ts-ignore -- d3-geo ships no type declarations in this project
import { geoMercator, geoPath } from "d3-geo";
import {
  AINewsSentence,
  Background,
  BN,
  C,
  Captions,
  Chip,
  clamp,
  countries,
  EN,
  Globe,
  HostCard,
  Panel,
  Processor,
  Ticker,
  TopBar,
  useAppear,
} from "./AINews";

// ---------------------------------------------------------------------------
// Kimi K3.1 Pro safety limits + UK AI security investment (vertical, 85 s).
// Works with or without a voiceover: with `voice` + `host` the lower card is the
// presenter; without them it is a per-scene "key fact" card.
// ---------------------------------------------------------------------------

export type KimiNewsProps = {
  voice?: string;
  host?: string;
  amp?: number[];
  music: string;
  dateLabel: string;
  scenes: { start: number; end: number; tag: string }[];
  sentences: AINewsSentence[];
};

// --------------------------------------------------------------------------- small helpers

const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; delay?: number }> = ({
  children,
  size = 84,
  color = C.text,
  font = EN,
  delay = 0,
}) => {
  const a = useAppear(delay, 13);
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: 900,
        fontSize: size,
        color,
        textAlign: "center",
        opacity: a,
        transform: `translateY(${interpolate(a, [0, 1], [30, 0])}px)`,
        textShadow: `0 0 30px ${C.purple}`,
        lineHeight: 1.2,
      }}
    >
      {children}
    </div>
  );
};

const Shield: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const a = useAppear(delay);
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ opacity: a }}>
      <path
        d="M50 4 L92 20 V58 C92 86 72 106 50 116 C28 106 8 86 8 58 V20 Z"
        fill="rgba(59,130,246,0.25)"
        stroke={C.cyan}
        strokeWidth={3}
      />
      <path d="M32 60 L45 73 L70 46" fill="none" stroke={C.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={70} strokeDashoffset={interpolate(frame - delay, [10, 35], [70, 0], clamp)} />
      <circle cx={50} cy={60} r={48 + 3 * Math.sin(frame / 9)} fill="none" stroke={C.blue} strokeOpacity={0.35} />
    </svg>
  );
};

// --------------------------------------------------------------------------- scenes (inside the 1000x930 panel)

const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 300], [1, 1.1], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <div style={{ position: "absolute", left: 250, top: 140 }}>
        <Globe size={500} speed={0.35} trails />
      </div>
      <div style={{ position: "absolute", left: 410, top: 300, transform: `rotate(${frame * 0.3}deg)` }}>
        <Processor size={180} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 520 }}>
        <Shield size={150} delay={150} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690 }}>
        <Big font={BN} size={58} delay={10}>ক্ষমতা ইচ্ছা করে কমানো!</Big>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", gap: 18 }}>
        <Chip text="AI MODEL SAFETY" color={C.cyan} delay={40} />
        <Chip text="BIG AI INVESTMENT" color={C.amber} delay={180} />
      </div>
    </AbsoluteFill>
  );
};

const S2Kimi: React.FC = () => {
  const frame = useCurrentFrame();
  const tiles = [
    { t: "Coding", c: C.purple },
    { t: "3D Creation", c: C.cyan },
    { t: "Document Analysis", c: C.amber },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0 }}>
        <div style={{ textAlign: "center", fontFamily: EN, fontSize: 34, color: C.muted, fontWeight: 700, opacity: useAppear(5) }}>
          Moonshot AI
        </div>
        <Big size={100} delay={12}>Kimi K3.1 Pro</Big>
      </div>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="1M CONTEXT" color={C.green} delay={40} size={38} />
      </div>
      <div style={{ position: "absolute", top: 440, left: 50, right: 50, display: "flex", gap: 20 }}>
        {tiles.map((x, i) => {
          const a = useAppear(200 + i * 25);
          return (
            <div
              key={x.t}
              style={{
                flex: 1,
                height: 330,
                borderRadius: 22,
                border: `2px solid ${x.c}`,
                background: `${x.c}1f`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "26px 10px",
                opacity: a,
                transform: `translateY(${interpolate(a, [0, 1], [50, 0])}px)`,
              }}
            >
              <svg width={200} height={190} viewBox="0 0 200 190">
                {i === 0 &&
                  ["def solve(task):", "  plan = agent()", "  return run(plan)", "✓ tests passed"].map((l, k) => (
                    <text key={k} x={10} y={40 + k * 40} fontFamily="monospace" fontSize={17}
                      fill={k === 3 ? C.green : C.cyan}
                      opacity={interpolate(frame, [230 + k * 15, 238 + k * 15], [0, 1], clamp)}>
                      {l}
                    </text>
                  ))}
                {i === 1 && (() => {
                  const r = frame / 25;
                  const pts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([x, y, z]) => {
                    const x1 = x * Math.cos(r) - z * Math.sin(r);
                    const z1 = x * Math.sin(r) + z * Math.cos(r);
                    const y1 = y * Math.cos(r * 0.6) - z1 * Math.sin(r * 0.6);
                    return [100 + x1 * 50, 95 + y1 * 50];
                  });
                  const e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
                  return e.map(([p, q], k) => (
                    <line key={k} x1={pts[p][0]} y1={pts[p][1]} x2={pts[q][0]} y2={pts[q][1]} stroke={C.cyan} strokeWidth={3} />
                  ));
                })()}
                {i === 2 && (
                  <g>
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x={40 + k * 12} y={20 + k * 12} width={110} height={140} rx={8} fill="#0f172a" stroke={C.amber} strokeWidth={2} />
                    ))}
                    {Array.from({ length: 6 }, (_, k) => (
                      <rect key={k} x={78} y={60 + k * 18} width={k % 2 ? 50 : 62} height={6} rx={3} fill={C.muted} opacity={0.7} />
                    ))}
                    <rect x={70} y={50 + ((frame * 2) % 110)} width={80} height={6} fill={C.amber} opacity={0.9} />
                  </g>
                )}
              </svg>
              <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 30, color: C.text, textAlign: "center" }}>{x.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const S3Limit: React.FC = () => {
  const frame = useCurrentFrame();
  const needle = interpolate(frame, [60, 150], [62, -10], clamp); // degrees: high -> lower
  const rows = [
    { t: "Misuse risk", s: "REDUCED", c: C.green, d: 160 },
    { t: "Effect in developer's own tests", s: "INTERNAL TEST", c: C.amber, d: 230 },
    { t: "Independent verification", s: "NOT YET", c: C.muted, d: 300 },
  ];
  return (
    <AbsoluteFill>
      <svg width={1000} height={420} style={{ position: "absolute", top: 110 }}>
        <defs>
          <linearGradient id="gauge" x1="0" x2="1">
            <stop offset="0%" stopColor={C.green} />
            <stop offset="55%" stopColor={C.amber} />
            <stop offset="100%" stopColor={C.red} />
          </linearGradient>
        </defs>
        <path d="M 230 360 A 270 270 0 0 1 770 360" fill="none" stroke="url(#gauge)" strokeWidth={34} strokeLinecap="round" opacity={useAppear(5)} />
        <g transform={`translate(500 360) rotate(${needle})`}>
          <line x1={0} y1={0} x2={0} y2={-230} stroke={C.text} strokeWidth={8} strokeLinecap="round" />
        </g>
        <circle cx={500} cy={360} r={20} fill={C.text} />
        <text x={500} y={412} textAnchor="middle" fontFamily={EN} fontWeight={800} fontSize={30} fill={C.muted}>
          CYBERSECURITY CAPABILITY
        </text>
      </svg>
      {rows.map((r, i) => {
        const a = useAppear(r.d);
        return (
          <div
            key={r.t}
            style={{
              position: "absolute",
              top: 560 + i * 100,
              left: 70,
              right: 70,
              height: 80,
              borderRadius: 16,
              background: "rgba(15,23,42,0.85)",
              border: `2px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              opacity: a,
              transform: `translateX(${interpolate(a, [0, 1], [60, 0])}px)`,
            }}
          >
            <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, color: C.text }}>{r.t}</div>
            <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 24, color: r.c, border: `2px solid ${r.c}`, borderRadius: 10, padding: "4px 12px" }}>
              {r.s}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const S4UK: React.FC = () => {
  const frame = useCurrentFrame();
  const proj = geoMercator().center([-3.5, 54.5]).scale(2300).translate([300, 470]);
  const path = geoPath(proj);
  const uk = countries.filter((f) => ["826", "372"].includes(String(f.id)));
  const amount = Math.round(interpolate(frame, [40, 130], [0, 600], clamp));
  const cats = [
    { t: "AI Security Research", c: C.cyan, d: 200 },
    { t: "Cybersecurity", c: C.blue, d: 300 },
    { t: "Biosecurity Research", c: C.green, d: 330 },
  ];
  return (
    <AbsoluteFill>
      <svg width={600} height={930} style={{ position: "absolute", left: 0, top: 0 }}>
        {uk.map((f, i) => (
          <path
            key={i}
            d={path(f) || ""}
            fill={String(f.id) === "826" ? `rgba(59,130,246,${0.35 + 0.15 * Math.sin(frame / 12)})` : "rgba(148,163,184,0.15)"}
            stroke={C.cyan}
            strokeWidth={2}
            opacity={useAppear(5)}
          />
        ))}
        {/* data-center pulses over the map */}
        {[[300, 560], [270, 420], [330, 650]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={10 + ((frame + i * 20) % 60) / 3} fill="none" stroke={C.amber}
            strokeWidth={3} opacity={1 - ((frame + i * 20) % 60) / 60} />
        ))}
      </svg>
      <div style={{ position: "absolute", right: 50, top: 160, width: 440, textAlign: "center" }}>
        <div style={{ fontFamily: BN, fontSize: 34, color: C.muted, fontWeight: 700 }}>প্রায়</div>
        <div style={{ fontFamily: EN, fontSize: 120, fontWeight: 900, color: C.amber, textShadow: `0 0 30px ${C.amber}` }}>
          £{amount}M
        </div>
        <div style={{ fontFamily: BN, fontSize: 32, color: C.text, fontWeight: 700 }}>বিনিয়োগ পরিকল্পনা</div>
      </div>
      <div style={{ position: "absolute", right: 50, top: 470, width: 440, display: "flex", flexDirection: "column", gap: 18 }}>
        {cats.map((c) => {
          const a = useAppear(c.d);
          return (
            <div key={c.t} style={{
              fontFamily: EN, fontWeight: 800, fontSize: 30, color: C.text, padding: "16px 20px", borderRadius: 14,
              border: `2px solid ${c.c}`, background: `${c.c}22`, opacity: a,
              transform: `translateX(${interpolate(a, [0, 1], [60, 0])}px)`,
            }}>
              {c.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const S5Lab: React.FC = () => {
  const frame = useCurrentFrame();
  const partners = ["OpenAI", "Anthropic"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 130, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
        {partners.map((p, i) => {
          const a = useAppear(10 + i * 15);
          return (
            <div key={p} style={{
              width: 400, height: 130, borderRadius: 22, border: `3px solid ${i ? C.amber : C.cyan}`,
              background: "rgba(15,23,42,0.9)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: EN, fontWeight: 900, fontSize: 50, color: C.text, opacity: a,
              transform: `translateY(${interpolate(a, [0, 1], [-40, 0])}px)`,
            }}>
              {p}
            </div>
          );
        })}
      </div>
      <svg width={1000} height={930} style={{ position: "absolute", left: 0, top: 0 }}>
        {[260, 740].map((x, i) => (
          <g key={i}>
            <line x1={x} y1={270} x2={500} y2={430} stroke={i ? C.amber : C.cyan} strokeWidth={4}
              strokeDasharray="10 10" strokeDashoffset={-frame * 2} opacity={useAppear(60)} />
          </g>
        ))}
        {/* molecule / data visualization */}
        {Array.from({ length: 9 }, (_, k) => {
          const ang = (k / 9) * Math.PI * 2 + frame / 60;
          const x = 500 + Math.cos(ang) * 190;
          const y = 700 + Math.sin(ang) * 90;
          return (
            <g key={k} opacity={useAppear(150 + k * 6)}>
              <line x1={500} y1={700} x2={x} y2={y} stroke={C.green} strokeOpacity={0.5} strokeWidth={2} />
              <circle cx={x} cy={y} r={14} fill="#052e16" stroke={C.green} strokeWidth={3} />
            </g>
          );
        })}
        <circle cx={500} cy={700} r={30 + 4 * Math.sin(frame / 8)} fill={`${C.green}55`} stroke={C.green} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", top: 430, left: 230, width: 540, height: 130, borderRadius: 22,
        border: `3px solid ${C.green}`, background: `${C.green}22`, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: EN, fontWeight: 900, fontSize: 44, color: C.text, opacity: useAppear(70) }}>
        AI Biosecurity Lab
      </div>
    </AbsoluteFill>
  );
};

const S6Takeaway: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { t: "AI Agent", s: "wants to act", c: C.purple },
    { t: "Permission check", s: "least privilege", c: C.cyan },
    { t: "Human review", s: "approve / reject", c: C.amber },
    { t: "Safe action", s: "logged", c: C.green },
  ];
  return (
    <AbsoluteFill>
      {steps.map((st, i) => {
        const a = useAppear(10 + i * 30);
        const y = 120 + i * 175;
        return (
          <React.Fragment key={st.t}>
            {i > 0 && (
              <div style={{ position: "absolute", left: 497, top: y - 55, width: 6, height: 55 * a,
                background: `linear-gradient(${steps[i - 1].c}, ${st.c})` }} />
            )}
            <div style={{
              position: "absolute", left: 220, width: 560, top: y, height: 120, borderRadius: 22,
              border: `3px solid ${st.c}`, background: `${st.c}22`, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", opacity: a,
              transform: `scale(${interpolate(a, [0, 1], [0.85, 1])})`,
              boxShadow: i === Math.floor(frame / 40) % 4 ? `0 0 30px ${st.c}` : "none",
            }}>
              <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 40, color: C.text }}>{st.t}</div>
              <div style={{ fontFamily: EN, fontSize: 24, color: C.muted }}>{st.s}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

const S7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 230, top: 120 }}>
        <Globe size={540} speed={0.5} trails />
      </div>
      <div style={{ position: "absolute", top: 690, left: 0, right: 0 }}>
        <Big size={76} delay={10}>DAILY AI NEWS</Big>
      </div>
      <div style={{ position: "absolute", top: 800, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Chip text="FOLLOW FOR MORE" color={C.pink} delay={40} />
      </div>
      <svg width={1000} height={930} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 6 }, (_, i) => {
          const x = ((frame * (8 + i * 2) + i * 170) % 1400) - 200;
          return <line key={i} x1={x} y1={100 + i * 130} x2={x + 180} y2={60 + i * 130}
            stroke={i % 2 ? C.purple : C.blue} strokeWidth={4} strokeLinecap="round" opacity={0.7} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const SCENES = [S1Hook, S2Kimi, S3Limit, S4UK, S5Lab, S6Takeaway, S7Outro];

// --------------------------------------------------------------------------- lower "key fact" card

const FACTS: { kicker: string; big: string; bigFont?: string; sub: string; color: string }[] = [
  { kicker: "আজকের খবর", big: "AI নিরাপত্তা", bigFont: BN, sub: "Kimi K3.1 Pro • যুক্তরাজ্যের বিনিয়োগ", color: C.cyan },
  { kicker: "Context window", big: "1M", sub: "Coding • 3D Creation • দীর্ঘ Document Analysis", color: C.green },
  { kicker: "স্বাধীন যাচাই", big: "এখনো হয়নি", bigFont: BN, sub: "ফলাফল নির্মাতার নিজস্ব পরীক্ষা থেকে", color: C.amber },
  { kicker: "যুক্তরাজ্য সরকার • ২৪ অক্টোবর", big: "≈ £600M", sub: "AI নিরাপত্তা ও গবেষণা", color: C.amber },
  { kicker: "OpenAI + Anthropic", big: "£200M পর্যন্ত", bigFont: BN, sub: "AI Credits ও প্রযুক্তিগত সহায়তা", color: C.green },
  { kicker: "আজকের শিক্ষা", big: "মানুষের নিয়ন্ত্রণ", bigFont: BN, sub: "AI যত শক্তিশালী, নিরাপত্তা তত জরুরি", color: C.purple },
  { kicker: "প্রতিদিন", big: "AI নিউজ", bigFont: BN, sub: "নতুন টুল • গুরুত্বপূর্ণ খবর • ব্যবহারিক টিপস", color: C.pink },
];

const FactCard: React.FC<{ i: number }> = ({ i }) => {
  const f = FACTS[i];
  const a = useAppear(6, 15);
  const b = useAppear(16, 13);
  return (
    <div style={{
      position: "absolute", top: 1100, left: 60, width: 960, height: 540, borderRadius: 30,
      border: `3px solid ${f.color}`, background: "rgba(15,23,60,0.82)",
      boxShadow: `0 0 50px ${f.color}55`, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18, opacity: a,
      transform: `translateY(${interpolate(a, [0, 1], [50, 0])}px)`,
    }}>
      <div style={{ fontFamily: BN, fontSize: 38, color: C.muted, fontWeight: 700 }}>{f.kicker}</div>
      <div style={{ fontFamily: f.bigFont ?? EN, fontSize: f.big.length > 8 ? 104 : 150, fontWeight: 900, color: f.color,
        textShadow: `0 0 30px ${f.color}`, transform: `scale(${interpolate(b, [0, 1], [0.7, 1])})`, opacity: b, lineHeight: 1.15 }}>
        {f.big}
      </div>
      <div style={{ fontFamily: BN, fontSize: 38, color: C.text, fontWeight: 700, textAlign: "center", padding: "0 30px", opacity: b }}>
        {f.sub}
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- composition

export const KimiNews: React.FC<KimiNewsProps> = ({ voice, host, amp, music, dateLabel, scenes, sentences }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const withPresenter = Boolean(voice && host);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <Background />
      {scenes.map((s, i) => {
        const Comp = SCENES[i];
        const from = Math.round(s.start * fps);
        const dur = Math.round((s.end - s.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Panel tag={s.tag}>
              <Comp />
            </Panel>
            {!withPresenter && <FactCard i={i} />}
          </Sequence>
        );
      })}
      <TopBar dateLabel={dateLabel} />
      {withPresenter && <HostCard host={host!} amp={amp ?? []} />}
      <Captions sentences={sentences} />
      <Ticker text="KIMI K3.1 PRO  •  SAFETY CONTROLS  •  UK AI SECURITY INVESTMENT  •  AI BIOSECURITY LAB  •  OPENAI + ANTHROPIC  •  POWERFUL AI NEEDS SAFETY  •  " />
      {voice && <Audio src={staticFile(voice)} />}
      <Audio
        src={staticFile(music)}
        volume={(f) =>
          (voice ? 0.13 : 0.5) *
          interpolate(f, [0, 20], [0, 1], clamp) *
          interpolate(f, [durationInFrames - 60, durationInFrames], [1, 0], clamp)
        }
      />
      <AbsoluteFill style={{ background: "black", opacity: interpolate(frame, [0, 10], [1, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
