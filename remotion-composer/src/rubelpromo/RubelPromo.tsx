import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FONT_CSS } from "../portfolio/fontcss";
import { ANEK_CSS } from "./anekcss";
import raw from "./vo.json";

// Rapar Rubel promo (Bangla, ~2:36, 9:16) in the style of the client's agency reference:
// animated red-gradient / white scenes, kinetic Bangla type, cursor clicks, glossy icons,
// problem cards into a bin, orbiting service icons, brand panels, stat circles over a white wave.
// Content from rubelpublic.github.io; timing from vo.json (client-builds/rubel-promo/voice.py).
type Ln = { i: number; text: string; s: number; e: number };
type Wd = { w: string; s: number; e: number; line: number };
const D = raw as unknown as { total: number; lines: Ln[]; words: Wd[] };
export const RP_FPS = 30, RP_W = 1080, RP_H = 1920;
const END = D.lines[D.lines.length - 1].e + 0.5;
export const RP_TOTAL = END + 4.5;
export const RP_FRAMES = Math.round(RP_TOTAL * RP_FPS);
const L = (i: number) => D.lines[i];
const W = (i: number, k: number) => D.words.filter((w) => w.line === i)[k]?.s ?? L(i).s;
const B = (i: number) => (i <= 0 ? 0 : i >= D.lines.length ? END : (L(i - 1).e + L(i).s) / 2);

const RED = "#d3001a", DRED = "#5a0008", BN = "Anek, Inter, sans-serif";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => { const k = clamp(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x: number) => Math.pow(clamp(x), 3);
const backOut = (x: number, c = 1.7) => { const k = clamp(x); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const on = (t: number, a: number, d = 0.4) => clamp((t - a) / d);
const win = (t: number, a: number, b: number, f = 0.3) => Math.min(on(t, a, f), 1 - on(t, b - f, f));
const bn = (n: number | string) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

// ---------------- backgrounds ----------------
const RedBG: React.FC<{ t: number; dark?: number }> = ({ t, dark = 0 }) => (
  <AbsoluteFill style={{ background: mixBg(dark) }}>
    {[[0.2, 0.25, 900, "#ff2438", 0.9], [0.85, 0.6, 1000, "#3a0006", 1], [0.4, 0.95, 800, "#ff1a2b", 0.7], [0.9, 0.05, 700, "#2a0004", 0.9]].map(([x, y, r, c, a], i) => (
      <div key={i} style={{ position: "absolute", left: (x as number) * RP_W + Math.sin(t * 0.35 + i * 2) * 160 - (r as number) / 2, top: (y as number) * RP_H + Math.cos(t * 0.3 + i) * 200 - (r as number) / 2, width: r as number, height: r as number, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, rgba(0,0,0,0) 68%)`, opacity: a as number, filter: "blur(30px)" }} />
    ))}
  </AbsoluteFill>
);
const mixBg = (d: number) => `linear-gradient(160deg, ${d > 0.5 ? "#7a000c" : "#b8001a"} 0%, #6e000c 60%, #2a0004 100%)`;
const WhiteBG: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f4f1f1 100%)" }} />;

// ---------------- pieces ----------------
const Cursor: React.FC<{ x: number; y: number; click?: number; a?: number }> = ({ x, y, click = 0, a = 1 }) => a <= 0 ? null : (
  <div style={{ position: "absolute", left: x, top: y, opacity: a, zIndex: 50 }}>
    {click > 0 && click < 1 && <div style={{ position: "absolute", left: -40 * click, top: -40 * click, width: 80 * click, height: 80 * click, borderRadius: "50%", border: "4px solid rgba(255,255,255,.9)", opacity: 1 - click }} />}
    <svg width={70} height={80} viewBox="0 0 24 28" style={{ transform: `scale(${1 - 0.15 * Math.sin(Math.PI * clamp(click * 2))})`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))" }}><path d="M2 2l18 11-8 1.5 4.5 9-3 1.5-4.5-9L3 21z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" /></svg>
  </div>
);
const Glossy: React.FC<{ size: number; children: React.ReactNode; red?: boolean }> = ({ size, children, red }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: red ? "radial-gradient(circle at 35% 30%, #ff6b78, #c4001a 55%, #6a000b)" : "radial-gradient(circle at 35% 28%, #ffffff, #f7e4e6 55%, #d9b1b6)",
    boxShadow: `0 ${size * 0.12}px ${size * 0.25}px rgba(60,0,8,.45), inset 0 -${size * 0.06}px ${size * 0.12}px rgba(150,0,20,.25), inset 0 ${size * 0.05}px ${size * 0.08}px rgba(255,255,255,.9)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
    {children}
    <div style={{ position: "absolute", left: "18%", top: "10%", width: "44%", height: "26%", borderRadius: "50%", background: "linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,0))" }} />
  </div>
);
const IC: Record<string, string> = {
  target: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 4a2 2 0 100 4 2 2 0 000-4z",
  chip: "M8 3v2H6a1 1 0 00-1 1v2H3v2h2v4H3v2h2v2a1 1 0 001 1h2v2h2v-2h4v2h2v-2h2a1 1 0 001-1v-2h2v-2h-2v-4h2V8h-2V6a1 1 0 00-1-1h-2V3h-2v2h-4V3zM8 8h8v8H8z",
  browser: "M3 4h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm1 5v9h16V9zm1-3.2a.9.9 0 100 1.8.9.9 0 000-1.8zm3 0a.9.9 0 100 1.8.9.9 0 000-1.8z",
  pen: "M3 17.3V21h3.7L17.8 9.9l-3.7-3.7zM20.7 7a1 1 0 000-1.4l-2.3-2.3a1 1 0 00-1.4 0l-1.8 1.8 3.7 3.7z",
  case: "M9 3h6a2 2 0 012 2v2h3a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h3V5a2 2 0 012-2zm0 4h6V5H9z",
  clock: "M12 2a10 10 0 110 20 10 10 0 010-20zm-1 5v6l5 3 1-1.6-4-2.4V7z",
  lang: "M12 2a10 10 0 110 20 10 10 0 010-20zm0 2c-1 1.3-1.8 3.3-2 6h4c-.2-2.7-1-4.7-2-6zm-4 8H4.1a8 8 0 005 6.3C8.4 17 8 14.7 8 12zm8 0c0 2.7-.4 5-1.1 6.3a8 8 0 005-6.3z",
  down: "M3 5h2v12h16v2H3zm4 2l4 4 3-3 5 5V9h2v8h-8v-2h4l-3-3-3 3-6-6z",
  mail: "M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1.5l8 5 8-5V7z",
  phone: "M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z",
  people: "M8 11a4 4 0 110-8 4 4 0 010 8zm8 0a3 3 0 110-6 3 3 0 010 6zM1 20c0-3.3 3.1-6 7-6s7 2.7 7 6zm15 0c0-1.9-.7-3.6-2-4.8 3.6-.5 8 1.2 8 4.8z",
  book: "M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4zm16 0h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z",
  hand: "M9 2a1.5 1.5 0 013 0v7h1V3.5a1.5 1.5 0 013 0V10h1V5.5a1.5 1.5 0 013 0V15a7 7 0 01-7 7h-1a7 7 0 01-6-3.4L3 12.5a1.5 1.5 0 012.5-1.6L7 13V4.5a1.5 1.5 0 012 0z",
  check: "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z",
};
const Icon: React.FC<{ n: string; s?: number; c?: string }> = ({ n, s = 60, c = RED }) => <svg width={s} height={s} viewBox="0 0 24 24"><path d={IC[n]} fill={c} /></svg>;
const Pop: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; from?: number }> = ({ t, at, children, style, from = 40 }) => {
  const k = on(t, at, 0.45); if (k <= 0) return null;
  return <div style={{ opacity: clamp(k * 2), transform: `translateY(${(1 - easeOut(k)) * from}px) scale(${0.85 + 0.15 * backOut(k)})`, ...style }}>{children}</div>;
};
const Head: React.FC<{ t: number; at: number; text: string; size?: number; color?: string; italic?: boolean; weight?: number; style?: React.CSSProperties }> = ({ t, at, text, size = 96, color = "#fff", weight = 800, style }) => {
  const k = on(t, at, 0.5); if (k <= 0) return null;
  return <div style={{ fontFamily: BN, fontWeight: weight, fontSize: size, lineHeight: 1.12, color, textAlign: "center", clipPath: `inset(0 ${100 - easeOut(k) * 100}% 0 0)`, transform: `translateX(${(1 - easeOut(k)) * -30}px)`, textShadow: color === "#fff" ? "0 8px 30px rgba(60,0,8,.45)" : "none", ...style }}>{text}</div>;
};
const Center: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 0 }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, paddingTop: top }}>{children}</AbsoluteFill>
);
const Pill: React.FC<{ text: string; icon?: string; red?: boolean; size?: number }> = ({ text, icon, red, size = 46 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: `${size * 0.36}px ${size * 0.7}px`, borderRadius: 80, background: red ? RED : "linear-gradient(180deg, #ffffff, #f2e6e7)", boxShadow: "0 18px 40px rgba(60,0,8,.35), inset 0 -4px 10px rgba(150,0,20,.12)",
    fontFamily: BN, fontWeight: 800, fontSize: size, color: red ? "#fff" : "#2a0a0e", paddingTop: size * 0.46 }}>
    {icon && <Icon n={icon} s={size * 1.1} c={red ? "#fff" : RED} />}{text}
  </div>
);

// ---------------- subtitles ----------------
const Subs: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => {
  const line = D.lines.find((l) => t >= l.s - 0.05 && t < l.e + 0.25); if (!line) return null;
  const ws = D.words.filter((w) => w.line === line.i);
  const chunks: Wd[][] = []; let cur: Wd[] = [];
  ws.forEach((w) => { cur.push(w); if (cur.length >= 4 || /[,।?!]$/.test(w.w)) { chunks.push(cur); cur = []; } }); if (cur.length) chunks.push(cur);
  const ch = chunks.find((c, k) => t < (chunks[k + 1]?.[0].s ?? line.e + 0.3)) || chunks[chunks.length - 1];
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 220, display: "flex", justifyContent: "center" }}><div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 14px", padding: "14px 30px 6px", borderRadius: 40, background: dark ? "rgba(30,0,4,.45)" : "rgba(255,255,255,.85)", boxShadow: dark ? "none" : "0 8px 24px rgba(0,0,0,.08)" }}>
      {ch.map((w, k) => { const act = t >= w.s && t < w.e + 0.08; return <span key={k} style={{ fontFamily: BN, fontWeight: 800, fontSize: 50, color: act ? (dark ? "#ffd23a" : RED) : dark ? "#fff" : "#2a0a0e", opacity: t >= w.s - 0.05 ? 1 : 0.5, textShadow: dark ? "0 3px 12px rgba(0,0,0,.6)" : "none" }}>{w.w.replace(/[,।]$/, "")}</span>; })}
    </div></div>
  );
};

// ---------------- scenes ----------------
type SC = React.FC<{ t: number }>;
const S_Hook: SC = ({ t }) => {
  const cx = lerp(820, 640, ease(on(t, 1.4, 0.7))), cy = lerp(1300, 1010, ease(on(t, 1.4, 0.7)));
  return (
    <>
      <RedBG t={t} />
      <Center>
        <Head t={t} at={0.6} text="প্রতিটা ব্যবসা শুরু হয়" size={84} />
        <div style={{ position: "relative" }}>
          <Head t={t} at={1.5} text="একটা প্রয়োজন থেকে" size={110} />
          <div style={{ position: "absolute", left: 230, right: 10, bottom: -8, height: 8, background: "#fff", transform: `scaleX(${easeOut(on(t, 2.25, 0.4))})`, transformOrigin: "0 50%" }} />
        </div>
      </Center>
      <Cursor x={cx} y={cy} click={on(t, 2.2, 0.4)} a={on(t, 1.2, 0.3)} />
    </>
  );
};
const S_Stuck: SC = ({ t }) => (
  <>
    <WhiteBG />
    <Center>
      <Head t={t} at={B(1) + 0.15} text="কিন্তু বেশিরভাগ ব্যবসা" size={64} color="#555" weight={600} />
      <Pop t={t} at={W(1, 3)}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 190, color: "#3a3a3a", lineHeight: 1 }}>আটকে যায়</div></Pop>
      <Pop t={t} at={W(1, 5)}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 80, color: RED, fontStyle: "italic" }}>একই জায়গায়</div></Pop>
    </Center>
  </>
);
const S_Problems: SC = ({ t }) => {
  const cards = [["হাতে করা কাজ", "clock", W(2, 0)], ["শুধু ইংরেজি বোঝে", "lang", W(3, 7)], ["বিক্রি নেই", "down", W(4, 0)]] as const;
  const drop = on(t, L(4).e + 0.15, 0.55);
  return (
    <>
      <RedBG t={t} dark={1} />
      {cards.map(([txt, ic, at], i) => {
        const k = on(t, at, 0.5); if (k <= 0) return null;
        const y = 640 + i * -38 - (1 - easeOut(k)) * 300 + easeIn(drop) * (980 + i * 40);
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: `rotate(${(i - 1) * 3 + drop * (i - 1) * 25}deg) scale(${1 - drop * 0.3})`, opacity: clamp(k * 2) * (1 - on(drop, 0.85, 0.15)), zIndex: i }}><Pill text={txt} icon={ic} size={56} /></div>;
      })}
      <div style={{ position: "absolute", left: 540 - 240, top: 1210, width: 480, height: 330, transform: `translateY(${(1 - easeOut(on(t, B(2), 0.6))) * 400}px)` }}>
        <div style={{ position: "absolute", left: -20, top: 0, width: 520, height: 50, borderRadius: 12, background: "#140003", transform: `rotate(${-14 * Math.sin(Math.PI * clamp(drop * 1.2))}deg)`, transformOrigin: "0 50%" }} />
        <div style={{ position: "absolute", left: 20, top: 60, width: 440, height: 270, borderRadius: "0 0 30px 30px", background: "linear-gradient(180deg, #1c0004, #0a0002)", display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>{[0, 1, 2].map((k) => <div key={k} style={{ width: 22, height: 190, borderRadius: 11, background: "#e0001f" }} />)}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 62, color: "#fff", opacity: on(t, B(2), 0.4) }}>সমস্যাগুলো চেনা?</div>
    </>
  );
};
const S_Intro: SC = ({ t }) => {
  const sel = on(t, W(5, 2) + 0.2, 0.6);
  return (
    <>
      <WhiteBG />
      <Center>
        <Head t={t} at={B(5) + 0.1} text="ঠিক এখানেই আসে" size={70} color="#666" weight={600} />
        <div style={{ position: "relative", padding: "10px 30px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sel * 100}%`, background: RED, border: "3px dashed #8a0010" }} />
          <div style={{ position: "relative", fontFamily: "InterTight", fontWeight: 800, fontSize: 150, letterSpacing: -6, color: sel > 0.98 ? "#fff" : "#222", opacity: on(t, W(5, 2), 0.3) }}>Rapar Rubel</div>
        </div>
      </Center>
      <Cursor x={lerp(160, 960, ease(sel))} y={1080} click={on(t, W(5, 2) + 0.15, 0.3)} a={on(t, W(5, 2), 0.2)} />
    </>
  );
};
const S_Who: SC = ({ t }) => {
  const k = easeOut(on(t, B(6), 0.7));
  return (
    <>
      <RedBG t={t} />
      <div style={{ position: "absolute", left: 540 - 270, top: 300, width: 540, height: 540, borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 80px rgba(40,0,6,.6), 0 0 0 14px rgba(255,255,255,.95)", transform: `scale(${0.7 + 0.3 * k})`, opacity: k }}>
        <Img src={staticFile("rubelpromo/portrait.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + 0.05 * Math.sin(t * 0.5)})` }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Head t={t} at={W(6, 1)} text="রুবেল মিয়া" size={110} />
        <Pop t={t} at={W(6, 5)}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#ffd9dd" }}>AI এক্সপার্ট · AI ওয়ার্কফ্লো বিল্ডার · ঢাকা</div></Pop>
        {t > B(7) && <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 30 }}>
          <Pop t={t} at={W(7, 3)}><Pill text="AI" icon="chip" size={52} /></Pop>
          <Pop t={t} at={W(7, 3) + 0.2}><svg width={120} height={40}><path d="M5 20h100M85 5l20 15-20 15" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="160" strokeDashoffset={160 * (1 - on(t, W(7, 3) + 0.2, 0.5))} /></svg></Pop>
          <Pop t={t} at={W(7, 6)}><Pill text="গ্রোথ" icon="down" red size={52} /></Pop>
        </div>}
        {t > B(8) && <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 10, padding: "0 40px" }}>
          {[["বেশি কাস্টমার", "people", W(8, 0)], ["কম ঝামেলা", "hand", W(8, 2)], ["দ্রুত রেজাল্ট", "clock", W(8, 5)]].map(([s, ic, at]) => <Pop key={s as string} t={t} at={at as number}><Pill text={s as string} icon={ic as string} size={40} /></Pop>)}
        </div>}
      </div>
      {t > B(9) && <div style={{ position: "absolute", right: 70, top: 260, transform: `rotate(-12deg) scale(${backOut(on(t, W(9, 4), 0.4))})`, opacity: on(t, W(9, 4), 0.2) }}>
        <div style={{ padding: "18px 30px 10px", border: "6px solid #fff", borderRadius: 18, fontFamily: BN, fontWeight: 800, fontSize: 44, color: "#fff", background: "rgba(255,255,255,.08)" }}>নিজের ব্যবসায় প্রমাণিত ✓</div>
      </div>}
    </>
  );
};
const SERV = [
  { n: "স্ট্র্যাটেজি", ic: "target", line: 11, chips: ["বিজনেস মডেল", "প্রাইসিং", "অফার"] },
  { n: "AI", ic: "chip", line: 12, chips: ["AI এজেন্ট", "অটোমেশন", "বাংলা ও বাংলিশ"] },
  { n: "প্রোডাক্ট", ic: "browser", line: 13, chips: ["ওয়েবসাইট", "ওয়েব অ্যাপ", "ইন্টারনাল টুল"] },
  { n: "কনটেন্ট", ic: "pen", line: 14, chips: ["অডিয়েন্স রিসার্চ", "ব্র্যান্ড সাইকোলজি", "বাংলিশ কনটেন্ট"] },
  { n: "অপারেশন", ic: "case", line: 15, chips: ["টিম", "ভেন্ডর", "ডেলিভারি"] },
];
const S_Services: SC = ({ t }) => {
  const act = SERV.findIndex((s, i) => t >= B(s.line) && (i === SERV.length - 1 || t < B(SERV[i + 1].line)));
  return (
    <>
      <RedBG t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}><Head t={t} at={B(10) + 0.1} text="পাঁচটা জায়গায় কাজ" size={78} /></div>
      {/* core */}
      <div style={{ position: "absolute", left: 540 - 150, top: 820 - 150, transform: `scale(${backOut(on(t, B(10), 0.6))})` }}>
        <Glossy size={300} red><div style={{ fontFamily: "InterTight", fontWeight: 800, fontSize: 130, color: "#fff", letterSpacing: -8, zIndex: 2 }}>rr</div></Glossy>
      </div>
      {SERV.map((s, i) => {
        const a0 = -Math.PI / 2 + (i / SERV.length) * Math.PI * 2 + t * 0.12;
        const R = 360, ap = on(t, B(10) + 0.3 + i * 0.15, 0.5);
        const isA = i === act; const big = isA ? easeOut(on(t, B(s.line), 0.4)) : 0;
        const x = 540 + Math.cos(a0) * R, y = 820 + Math.sin(a0) * R * 0.9;
        return (
          <div key={i} style={{ position: "absolute", left: x - 85, top: y - 85, transform: `scale(${(0.5 + 0.5 * backOut(ap)) * (1 + big * 0.35)})`, opacity: clamp(ap * 2) * (act >= 0 && !isA ? 0.6 : 1), zIndex: isA ? 5 : 1 }}>
            <Glossy size={170}><Icon n={s.ic} s={80} /></Glossy>
            <div style={{ marginTop: 10, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 38, color: "#fff", width: 170 }}>{s.n}</div>
          </div>
        );
      })}
      {act >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, padding: "0 50px" }}>
          {SERV[act].chips.map((c, k) => <Pop key={act + c} t={t} at={B(SERV[act].line) + 0.6 + k * 0.45}><Pill text={c} size={40} /></Pop>)}
        </div>
      )}
    </>
  );
};
const S_Approach: SC = ({ t }) => {
  const steps = [["শুনি", W(17, 1)], ["বুঝি", W(17, 3)], ["অ্যাঙ্গেল", W(17, 5)], ["বানাই", W(17, 9)], ["টেস্ট", W(17, 11)]] as const;
  const cur = steps.filter((s) => t >= s[1]).length - 1;
  const p2 = t >= B(18);
  return (
    <>
      <WhiteBG />
      {!p2 && <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Head t={t} at={B(16) + 0.1} text="কনটেন্ট শুরু হয়" size={72} color="#333" weight={600} />
          <Head t={t} at={W(16, 2)} text="অডিয়েন্সের মাথা থেকে" size={96} color={RED} />
          <Pop t={t} at={W(16, 5)}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 48, color: "#888", textDecoration: "line-through" }}>ব্র্যান্ডের পেজ থেকে না</div></Pop>
        </div>
        <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 820 }}>
          <path d="M120 450 C 300 150, 780 150, 960 450" fill="none" stroke="#f0c9ce" strokeWidth={10} strokeDasharray="18 16" />
        </svg>
        {steps.map(([s, at], i) => {
          const a = (i / 4) * Math.PI; const x = 540 - Math.cos(a) * 370, y = 1270 - Math.sin(a) * 300;
          const done = i <= cur;
          return <div key={s} style={{ position: "absolute", left: x - 110, top: y - 110, opacity: on(t, B(17) - 0.2 + i * 0.08, 0.4), transform: `scale(${done ? 1 + 0.15 * (1 - on(t, at, 0.3)) : 0.85})` }}>
            <Glossy size={220} red={done}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 48, color: done ? "#fff" : RED, zIndex: 2, paddingTop: 8 }}>{s}</div></Glossy>
            <div style={{ position: "absolute", left: -10, top: -10, width: 64, height: 64, borderRadius: 32, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BN, fontWeight: 800, fontSize: 34, color: RED, paddingTop: 4 }}>{bn(i + 1)}</div>
          </div>;
        })}
        {cur >= 0 && (() => { const [s, at] = steps[cur]; const a = (cur / 4) * Math.PI; return <Cursor x={540 - Math.cos(a) * 370 + 30} y={1270 - Math.sin(a) * 300 + 20} click={on(t, at, 0.35)} />; })()}
      </>}
      {p2 && <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 54, color: "#999" }}>উদাহরণ: জমির ক্রেতা</div>
        <Pop t={t} at={W(18, 4)} style={{ position: "absolute", left: 110, top: 400 }}>
          <div style={{ padding: "34px 44px 26px", borderRadius: "48px 48px 48px 8px", background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.15)", fontFamily: BN, fontWeight: 800, fontSize: 66, color: "#222" }}>“দলিল ঠিক আছে তো?”</div>
          <div style={{ marginTop: 12, fontFamily: BN, fontWeight: 600, fontSize: 36, color: "#999" }}>যা তিনি বলেন</div>
        </Pop>
        <Pop t={t} at={W(19, 1)} style={{ position: "absolute", right: 90, top: 720 }}>
          <div style={{ padding: "34px 44px 26px", borderRadius: "48px 48px 8px 48px", background: RED, boxShadow: "0 20px 50px rgba(150,0,20,.35)", fontFamily: BN, fontWeight: 800, fontSize: 56, color: "#fff", maxWidth: 760, lineHeight: 1.25 }}>ভয়: পরিবারের সঞ্চয় নিয়ে একটা ভুল সিদ্ধান্ত</div>
          <div style={{ marginTop: 12, textAlign: "right", fontFamily: BN, fontWeight: 600, fontSize: 36, color: "#999" }}>যা তিনি আসলে ভাবেন</div>
        </Pop>
        <Pop t={t} at={W(20, 2)} style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "30px 46px", borderRadius: 40, background: "linear-gradient(180deg,#fff,#f6eaeb)", boxShadow: "0 24px 60px rgba(60,0,8,.2)" }}>
            <Glossy size={120} red><Icon n="book" s={64} c="#fff" /></Glossy>
            <div><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 36, color: "#888" }}>শিক্ষামূলক সিরিজ</div><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 76, color: RED }}>ক্রেতা সুরক্ষা</div></div>
          </div>
        </Pop>
      </>}
    </>
  );
};
const BRANDS = [
  { line: 22, name: "Proyojon Shop", tag: "রিটেইল · ইমপোর্ট", sub: "চীন থেকে সারা বাংলাদেশে", chips: ["খেলনা", "স্টেশনারি", "ব্যাগ"], bg: "#1b2a6b", fg: "#fff", acc: "#ffd23a" },
  { line: 23, name: "The AB Wardrobe", tag: "ফ্যাশন", sub: "কুর্তি ও টু-পিস, বিজ্ঞাপন বাংলিশে", chips: ["কুর্তি", "টু-পিস", "বাংলিশ অ্যাড"], bg: "#f3e4de", fg: "#3a1f1a", acc: "#b8654b" },
  { line: 24, name: "Proyojon Vromon", tag: "ট্রাভেল", sub: "ভ্রমণ হোক প্রয়োজন", chips: ["গল্প", "হোটেল", "টিকিট"], bg: "#0f4c5c", fg: "#fff", acc: "#7fe0d0" },
  { line: 25, name: "Proyojon Abashon", tag: "প্রপার্টি", sub: "আগামীর নিশ্চিত ঠিকানা", chips: ["ল্যান্ড শেয়ার", "প্রপার্টি ম্যানেজমেন্ট"], bg: "#0f3d2e", fg: "#fff", acc: "#9be27a" },
  { line: 26, name: "Proyojon Prozukti", tag: "টেকনোলজি · গ্রোথ", sub: "Business. Technology. Growth.", chips: ["ওয়েব", "মার্কেটিং", "AI অটোমেশন"], bg: "#2a1b4d", fg: "#fff", acc: "#c9a7ff" },
  { line: 27, name: "Proyojon Solutions", tag: "লিগ্যাল-টেক", sub: "AI লিগ্যাল ইনটেক ও ডকুমেন্ট", chips: ["ইনটেক", "ডকুমেন্ট AI", "পরামর্শ"], bg: "#1e2140", fg: "#fff", acc: "#ff8a9a" },
];
const S_Brands: SC = ({ t }) => {
  if (t < B(22)) return (<><RedBG t={t} /><Center><Head t={t} at={B(21) + 0.1} text="আমার নিজের ব্র্যান্ডগুলোই" size={72} /><Pop t={t} at={W(21, 3)}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 190, color: "#fff", lineHeight: 1 }}>আমার ল্যাব</div></Pop></Center></>);
  const i = BRANDS.findIndex((b, k) => t >= B(b.line) && (k === BRANDS.length - 1 || t < B(BRANDS[k + 1].line)));
  const b = BRANDS[i]; const lt = t - B(b.line); const k = easeOut(on(lt, 0, 0.5));
  return (
    <AbsoluteFill style={{ background: b.bg, clipPath: `circle(${k * 140}% at 50% 50%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 40, letterSpacing: 6, color: b.acc, opacity: on(lt, 0.2, 0.3) }}>{b.tag}</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 560, textAlign: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: b.name.length > 15 ? 112 : 128, letterSpacing: -4, lineHeight: 1, color: b.fg, transform: `scale(${0.8 + 0.2 * backOut(on(lt, 0.15, 0.5))})`, opacity: on(lt, 0.15, 0.3) }}>{b.name}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 860, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 58, color: b.fg, opacity: on(lt, 0.5, 0.4) }}>{b.sub}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", padding: "0 60px" }}>
        {b.chips.map((c, j) => <Pop key={b.name + c} t={lt} at={0.9 + j * 0.3}><div style={{ padding: "16px 32px 10px", borderRadius: 40, background: b.acc, color: b.bg, fontFamily: BN, fontWeight: 800, fontSize: 42, transform: `rotate(${(j - 1) * 4}deg)`, boxShadow: "0 14px 30px rgba(0,0,0,.25)" }}>{c}</div></Pop>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 14 }}>{BRANDS.map((_, j) => <div key={j} style={{ width: j === i ? 50 : 16, height: 16, borderRadius: 8, background: j === i ? b.acc : "rgba(255,255,255,.35)" }} />)}</div>
    </AbsoluteFill>
  );
};
const S_Products: SC = ({ t }) => {
  const stage = t < B(29) ? -1 : t < B(30) ? 0 : t < B(31) ? 1 : 2;
  return (
    <>
      <RedBG t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Head t={t} at={B(28) + 0.1} text="আমার AI প্রোডাক্ট" size={84} /></div>
      {stage === -1 && <Center><div style={{ display: "flex", gap: 30 }}>{["chip", "book", "people"].map((n, i) => <Pop key={n} t={t} at={W(28, 2) + i * 0.15}><Glossy size={190}><Icon n={n} s={90} /></Glossy></Pop>)}</div></Center>}
      {stage === 0 && <Pop t={t} at={B(29)} style={{ position: "absolute", left: 110, right: 110, top: 470 }}>
        <div style={{ borderRadius: 40, background: "#14161c", boxShadow: "0 40px 90px rgba(0,0,0,.5)", padding: 46 }}>
          <div style={{ fontFamily: "InterTight", fontWeight: 800, fontSize: 96, color: "#fff" }}>MimAI <span style={{ fontFamily: BN, fontSize: 64, color: "#ff8a9a" }}>মিমাই</span></div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: "#aab", margin: "10px 0 30px" }}>নিজের Google Drive-এর AI ফাইল অ্যাসিস্ট্যান্ট</div>
          {["› আমার ইনভয়েসগুলো খোঁজো", "› find my tax file", "› gotokaler meeting notes dao"].map((q, j) => <div key={q} style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: j === 0 ? "#7fe0a0" : j === 1 ? "#7fc4ff" : "#ffd27a", opacity: on(t, B(29) + 0.8 + j * 0.9, 0.3), marginBottom: 14, whiteSpace: "nowrap", overflow: "hidden", width: `${clamp((t - B(29) - 0.8 - j * 0.9) / 0.8) * 100}%` }}>{q}</div>)}
          <div style={{ display: "flex", gap: 14, marginTop: 24 }}>{["বাংলা", "বাংলিশ", "English"].map((c, j) => <Pop key={c} t={t} at={W(29, 9) + j * 0.25}><div style={{ padding: "12px 26px 6px", borderRadius: 30, background: RED, fontFamily: BN, fontWeight: 800, fontSize: 36, color: "#fff" }}>{c}</div></Pop>)}</div>
          <div style={{ marginTop: 26, fontFamily: "Inter", fontWeight: 600, fontSize: 28, color: "#778" }}>Built with Claude Code · mimai.onrender.com</div>
        </div>
      </Pop>}
      {stage === 1 && <Pop t={t} at={B(30)} style={{ position: "absolute", left: 110, right: 110, top: 520 }}>
        <div style={{ borderRadius: 40, background: "#2b0d1a", boxShadow: "0 40px 90px rgba(0,0,0,.5)", padding: 46, textAlign: "center" }}>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 110, color: "#fff" }}>গান বানাই</div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#ffb3c7", marginBottom: 30 }}>আইডিয়া থেকে গানের দিকনির্দেশনা</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 18, height: 220 }}>{Array.from({ length: 9 }).map((_, j) => <div key={j} style={{ width: 48, borderRadius: "24px 24px 6px 6px", height: 60 + 150 * Math.abs(Math.sin(t * 5 + j * 0.8)), background: "linear-gradient(180deg,#ff9fb3,#ff4f7a)" }} />)}</div>
        </div>
      </Pop>}
      {stage === 2 && <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <Pop t={t} at={B(31)}><Glossy size={260}><div style={{ width: 150, height: 150, borderRadius: 75, background: "radial-gradient(circle at 35% 30%, #a98bff, #5b2bd6)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: 90, color: "#fff", zIndex: 2 }}>P</div></Glossy></Pop>
        <Head t={t} at={W(31, 1)} text="পালোয়ান" size={120} />
        <Pop t={t} at={W(31, 3)}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#ffd9dd" }}>আমার নিজের AI এজেন্ট</div></Pop>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", padding: "0 60px" }}>{[["রিসার্চ", W(31, 7)], ["কনটেন্ট", W(31, 8)], ["প্ল্যানিং", W(31, 10)]].map(([c, at]) => <Pop key={c as string} t={t} at={at as number}><Pill text={c as string} size={44} /></Pop>)}</div>
      </div>}
    </>
  );
};
const S_Teach: SC = ({ t }) => {
  const stats = [["১০", "ক্লাস", "book", W(34, 0)], ["১৮–২০", "ঘণ্টা", "clock", W(34, 2)], ["৭০%", "হাতে-কলমে", "hand", W(34, 7)]] as const;
  const cur = Math.max(0, stats.filter((s) => t >= s[3]).length - 1);
  const show = t >= W(34, 0) - 0.2;
  const wave = (ph: number) => { let d = "M0 0 "; for (let x = 0; x <= 1080; x += 30) d += `L${x} ${60 + Math.sin(x / 160 + ph) * 40}`; return d + "L1080 900 L0 900Z"; };
  return (
    <>
      <RedBG t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Head t={t} at={B(32) + 0.1} text="আর আমি শেখাই" size={84} />
        <Pop t={t} at={B(33)}><div style={{ fontFamily: "InterTight", fontWeight: 800, fontSize: 96, color: "#fff", letterSpacing: -3, marginTop: 10 }}>AI Power User</div></Pop>
        <Pop t={t} at={W(33, 4)}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#ffd9dd" }}>বাংলায় প্র্যাকটিক্যাল AI কোর্স</div></Pop>
      </div>
      {show && <>
        <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 1180 + (1 - easeOut(on(t, W(34, 0) - 0.2, 0.6))) * 500 }}><path d={wave(t * 1.5)} fill="#fff" /></svg>
        {stats.map(([n, u, ic, at], i) => { if (i !== cur) return null; const k = on(t, at, 0.4); return (
          <div key={n} style={{ position: "absolute", left: 90, top: 820, display: "flex", alignItems: "center", gap: 36, opacity: clamp(k * 2), transform: `translateX(${(1 - easeOut(k)) * -80}px)` }}>
            <Glossy size={280}><Icon n={ic} s={130} /></Glossy>
            <div><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 150, color: "#fff", lineHeight: 1 }}>{n}</div><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 60, color: "#ffd9dd", fontStyle: "italic" }}>{u}</div></div>
          </div>); })}
        <Pop t={t} at={B(35)} style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center" }}><Pill text="প্রতিটা মডিউল: নিজে কিছু বানানো" icon="check" red size={42} /></Pop>
      </>}
    </>
  );
};
const S_Result: SC = ({ t }) => {
  const words = [["বেশি কাস্টমার", 37], ["কম ঝামেলা", 38], ["দ্রুত রেজাল্ট", 39]] as const;
  return (
    <>
      <WhiteBG />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center" }}><Head t={t} at={B(36) + 0.05} text="ফলাফল?" size={90} color="#999" weight={600} /></div>
      {words.map(([w, li], i) => { const k = on(t, B(li), 0.35); if (k <= 0) return null; return (
        <div key={w} style={{ position: "absolute", left: 0, right: 0, top: 700 + i * 200, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 130, color: RED, opacity: clamp(k * 2), transform: `translateX(${(1 - easeOut(k)) * (i % 2 ? 300 : -300)}px)` }}>{w}</div>); })}
    </>
  );
};
const S_Contact: SC = ({ t }) => {
  const lt = t - B(40);
  const ring = ["Shop", "Wardrobe", "Vromon", "Abashon", "Prozukti", "Solutions", "MimAI", "CAP ON HEAD", "Myook"];
  return (
    <>
      <RedBG t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Head t={t} at={W(40, 4)} text="কোনো প্রয়োজন আছে?" size={80} />
        <Pop t={t} at={W(40, 6)}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 150, color: "#fff", lineHeight: 1.05 }}>চলুন কথা বলি</div></Pop>
      </div>
      {ring.map((r, i) => { const a = (i / ring.length) * Math.PI * 2 + lt * 0.15; const k = on(lt, 0.2 + i * 0.08, 0.4); return (
        <div key={r} style={{ position: "absolute", left: 540 + Math.cos(a) * 380 - 110, top: 900 + Math.sin(a) * 200 - 50, width: 220, height: 100, borderRadius: 22, background: "rgba(40,0,6,.55)", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: r.length > 8 ? 28 : 34, color: "#fff", opacity: clamp(k * 2) * 0.9, transform: `scale(${0.6 + 0.4 * backOut(k)}) rotate(${Math.sin(a) * 6}deg)` }}>{r}</div>); })}
      <div style={{ position: "absolute", left: 540 - 130, top: 900 - 70, width: 260, height: 140, borderRadius: 30, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: 54, color: RED, boxShadow: "0 20px 50px rgba(0,0,0,.3)", opacity: on(lt, 0.4, 0.3) }}>Brands</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Pop t={t} at={W(41, 0)}><Pill text="rubel.public@gmail.com" icon="mail" size={42} /></Pop>
        <Pop t={t} at={W(41, 3)}><Pill text="+880 1676-464807" icon="phone" red size={42} /></Pop>
      </div>
      <Cursor x={lerp(980, 760, ease(on(t, W(41, 3), 0.5)))} y={lerp(1600, 1335, ease(on(t, W(41, 3), 0.5)))} click={on(t, W(41, 5), 0.35)} a={on(t, W(41, 2), 0.3)} />
    </>
  );
};
const S_Grow: SC = ({ t }) => {
  const k1 = on(t, W(42, 1), 0.35), k2 = on(t, W(42, 2), 0.35);
  return (
    <>
      <RedBG t={t} dark={1} />
      <Center>
        <Head t={t} at={B(42) + 0.05} text="চলুন, একসাথে" size={84} />
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 330, lineHeight: 0.95, color: "#ff5a68", mixBlendMode: "screen", opacity: k1, transform: `scale(${1.4 - 0.4 * easeOut(k1)})` }}>বড়</div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 330, lineHeight: 0.95, color: "#fff", opacity: k2, transform: `scale(${1.4 - 0.4 * easeOut(k2)})` }}>হই</div>
      </Center>
    </>
  );
};
const S_End: SC = ({ t }) => {
  const lt = t - END; const k = easeOut(on(lt, 0.1, 0.7));
  return (
    <>
      <WhiteBG />
      <div style={{ position: "absolute", left: 540 - 90, top: 470, transform: `scale(${backOut(on(lt, 0, 0.5))})` }}><Glossy size={180} red><div style={{ fontFamily: "InterTight", fontWeight: 800, fontSize: 84, color: "#fff", letterSpacing: -5, zIndex: 2 }}>rr</div></Glossy></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: "InterTight", fontWeight: 800, fontSize: 140, letterSpacing: -6, lineHeight: 1, color: "#222", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>Rapar<br /><span style={{ color: RED }}>Rubel</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#777", opacity: on(lt, 0.5, 0.4) }}>AI এক্সপার্ট · AI ওয়ার্কফ্লো বিল্ডার</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: on(lt, 0.8, 0.4) }}>
        {["rubelpublic.github.io", "rubel.public@gmail.com", "+880 1676-464807"].map((s, i) => <div key={s} style={{ fontFamily: "Inter", fontWeight: i ? 600 : 700, fontSize: i ? 38 : 46, color: i ? "#555" : RED }}>{s}</div>)}
      </div>
    </>
  );
};

const SCENES: [number, SC, boolean][] = [
  [0, S_Hook, true], [B(1), S_Stuck, false], [B(2), S_Problems, true], [B(5), S_Intro, false], [B(6), S_Who, true], [B(10), S_Services, true],
  [B(16), S_Approach, false], [B(21), S_Brands, true], [B(28), S_Products, true], [B(32), S_Teach, true], [B(36), S_Result, false], [B(40), S_Contact, true], [B(42), S_Grow, true], [END, S_End, false],
];

export const RubelPromo: React.FC = () => {
  const t = useCurrentFrame() / RP_FPS;
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px Anek", "600 40px Anek", "800 60px InterTight", "700 40px Inter", "600 40px Inter"].map((f) => document.fonts.load(f, "অআ abc"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const idx = SCENES.reduce((a, s, i) => (t >= s[0] ? i : a), 0);
  const [st, Scene, dark] = SCENES[idx];
  const into = on(t, st, 0.35);
  const brandPanel = Scene === S_Brands && t >= B(22);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.08 * (1 - easeOut(into))})`, filter: into < 1 ? `blur(${(1 - easeOut(into)) * 12}px)` : undefined }}><Scene t={t} /></AbsoluteFill>
      {t < END && <Subs t={t} dark={(dark || brandPanel) && !(Scene === S_Teach && t >= W(34, 0) - 0.2) && !(Scene === S_Brands && t >= B(23) && t < B(24))} />}
    </AbsoluteFill>
  );
};
