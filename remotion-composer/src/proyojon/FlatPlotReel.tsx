import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CREAM, F, GREEN, Ic, Row, Sz, Word, backOut, clamp, easeOut, on, shadow } from "./ProyojonReel";

// Proyojon Abashon "flat or plot" reel: the client's 30 s voiced clip (balcony -> office -> plot aerial)
// with the same kinetic-word look as ProyojonReel, info chips, logo card and a contact end card.
const FPS = 30;
const VIDEO_END = 30.0;
const TOTAL = 33.6;
export const FLATPLOT_FRAMES = Math.round(TOTAL * FPS);
const CUTS = [10.125, 20.2];

type Line = [string, number, Sz][];
type Phrase = { s: number; e: number; lines: Line[]; top?: number; extra?: "chips" | "call" | "logo" | "features" | "tagline" };
const PHRASES: Phrase[] = [
  { s: 0.0, e: 1.66, lines: [[["ঢাকায়", 0.05, "s"], ["আপনার", 0.7, "s"]], [["স্বপ্নের", 0.98, "b"]], [["ফ্ল্যাট", 1.42, "m"]]] },
  { s: 1.7, e: 3.36, lines: [[["কিংবা", 1.7, "s"], ["পছন্দের", 2.1, "s"]], [["প্লট", 2.64, "x"]], [["খুঁজছেন?", 2.88, "s"]]] },
  { s: 3.4, e: 6.46, lines: [], extra: "chips" },
  { s: 6.5, e: 10.05, lines: [[["সবকিছু", 6.5, "s"], ["মিলিয়ে", 7.18, "s"]], [["সঠিক", 7.66, "m"], ["প্রপার্টি", 8.1, "m"]], [["খোঁজা", 8.5, "s"]], [["সহজ", 8.8, "b"], ["না", 9.26, "b"]]] },
  { s: 10.4, e: 14.98, lines: [[["আপনার", 10.4, "s"], ["প্রয়োজন", 11.36, "s"], ["ও", 11.82, "s"]], [["বাজেট", 12.02, "s"], ["অনুযায়ী", 12.38, "s"]], [["সঠিক", 12.8, "b"]], [["লোকেশনে", 13.38, "m"]], [["প্রপার্টি", 13.94, "s"], ["খুঁজে", 14.38, "s"], ["নিতে", 14.68, "s"]]] },
  { s: 15.02, e: 18.9, lines: [[["যোগাযোগ", 15.06, "b"]], [["করুন", 16.12, "m"]], [["প্রয়োজন", 16.48, "s"], ["আবাসন", 17.06, "s"], ["লিমিটেডের", 17.54, "s"], ["সঙ্গে", 18.1, "s"]]], extra: "call" },
  { s: 20.18, e: 22.95, lines: [[["আপনার", 20.18, "s"], ["স্বপ্নের", 20.98, "s"]], [["ঠিকানা", 21.42, "b"]], [["খুঁজে", 21.78, "s"], ["নিন", 22.14, "s"]], [["আজই", 22.36, "x"]]] },
  { s: 23.1, e: 27.4, lines: [], extra: "features" },
  { s: 27.5, e: 30.3, lines: [], extra: "tagline" },
];

// ---------------- extras ----------------
const PinI = "M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z";
const HomeI = "M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z";
const TakaI = "M7 4c1.7 0 3 1.3 3 3v1h4v2h-4v6c0 1.1.9 2 2 2s2-.9 2-2v-1h2v1a4 4 0 01-8 0v-6H6V8h2V7c0-.6-.4-1-1-1H6V4z";
const Chip: React.FC<{ icon: string; label: string; a: number; w?: number }> = ({ icon, label, a, w }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 34px 16px 16px", borderRadius: 60, background: "rgba(255,255,255,.95)", boxShadow: "0 16px 44px rgba(0,0,0,.35)", width: w,
    opacity: clamp(a * 2), transform: `scale(${0.5 + 0.5 * backOut(a)}) translateY(${(1 - easeOut(a)) * 30}px)` }}>
    <div style={{ width: 84, height: 84, borderRadius: 42, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={46} height={46} viewBox="0 0 24 24"><path d={icon} fill="#fff" /></svg></div>
    <span style={{ fontFamily: F, fontWeight: 800, fontSize: 58, color: "#17301f", paddingTop: 8 }}>{label}</span>
  </div>
);
const Chips: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
    <Chip icon={PinI} label="লোকেশন" a={on(t, 3.4, 0.3)} />
    <Chip icon={TakaI} label="বাজেট" a={on(t, 4.8, 0.3)} />
    <Chip icon={HomeI} label="নিজের প্রয়োজন" a={on(t, 5.44, 0.3)} />
  </div>
);
const Check = ({ s = 46 }) => <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Features: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
    {[["ফ্ল্যাট", 23.2], ["প্লট", 23.75], ["বাজেট অনুযায়ী", 24.3], ["সঠিক লোকেশন", 24.85]].map(([l, at]) => {
      const a = on(t, at as number, 0.3);
      return (
        <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 32px 12px 12px", borderRadius: 50, background: "rgba(15,40,25,.78)", border: "2px solid rgba(251,234,168,.6)",
          opacity: clamp(a * 2), transform: `translateX(${(1 - easeOut(a)) * -80}px)` }}>
          <div style={{ width: 66, height: 66, borderRadius: 33, background: "#27a148", display: "flex", alignItems: "center", justifyContent: "center" }}><Check /></div>
          <span style={{ fontFamily: F, fontWeight: 800, fontSize: 54, color: CREAM, paddingTop: 6 }}>{l}</span>
        </div>
      );
    })}
  </div>
);
const CallCard: React.FC<{ t: number }> = ({ t }) => {
  const k = on(t, 15.4, 0.35); if (k <= 0) return null;
  const ring = Math.sin(t * 28) * 6 * (1 - on(t, 16.2, 0.3));
  return (
    <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 22, padding: "16px 18px 16px 34px", borderRadius: 60, background: "rgba(20,24,22,.85)", border: "2px solid rgba(255,255,255,.25)",
      boxShadow: "0 18px 50px rgba(0,0,0,.45)", transform: `translateY(${(1 - easeOut(k)) * 50}px) scale(${0.85 + 0.15 * backOut(k)})`, opacity: clamp(k * 2) }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 46, color: "#fff", letterSpacing: 1 }}>+880 1323-280004</span>
      {[["#e5483b", 135], ["#27c24c", 0]].map(([c, r], i) => (
        <div key={i} style={{ width: 84, height: 84, borderRadius: 42, background: c as string, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${i ? ring : 0}deg)` }}>
          <svg width={44} height={44} viewBox="0 0 24 24" style={{ transform: `rotate(${r}deg)` }}><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="#fff" /></svg>
        </div>
      ))}
    </div>
  );
};
const LogoPop: React.FC<{ t: number; at: number; until: number; top: number; w: number }> = ({ t, at, until, top, w }) => {
  const k = on(t, at, 0.35) * (1 - on(t, until - 0.2, 0.2)); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top, width: w, padding: "18px 24px", borderRadius: 34, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.4)", boxSizing: "border-box",
      transform: `translateY(${(1 - easeOut(k)) * -40}px) scale(${0.85 + 0.15 * backOut(k)})`, opacity: clamp(k * 2) }}>
      <Img src={staticFile("proyojon/logo_crop.png")} style={{ width: "100%", display: "block" }} />
    </div>
  );
};
const Kinetic: React.FC<{ t: number }> = ({ t }) => {
  const p = PHRASES.find((p) => t >= p.s && t < p.e); if (!p) return null;
  const out = on(t, p.e - 0.18, 0.18);
  const top = p.top ?? (p.extra === "chips" || p.extra === "features" ? 820 : p.extra === "tagline" ? 1010 : 880);
  return (
    <>
      {p.extra === "call" && <LogoPop t={t} at={16.48} until={18.9} top={250} w={560} />}
      {p.extra === "tagline" && <LogoPop t={t} at={27.55} until={30.6} top={430} w={800} />}
      <div style={{ position: "absolute", left: 0, width: 1080, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out, transform: `scale(${1 + out * 0.15})`, filter: `blur(${out * 10}px)` }}>
        {p.lines.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "wrap" }}>{l.map(([w, at, sz], j) => <Word key={j} w={w} at={at} sz={sz} t={t} />)}</div>)}
        {p.extra === "chips" && <Chips t={t} />}
        {p.extra === "features" && <Features t={t} />}
        {p.extra === "call" && <CallCard t={t} />}
        {p.extra === "tagline" && <div style={{ display: "flex", justifyContent: "center" }}><Word w="আগামীর" at={29.08} sz="m" t={t} /><Word w="নিশ্চিত" at={29.42} sz="m" t={t} /></div>}
        {p.extra === "tagline" && <Word w="ঠিকানা" at={29.78} sz="b" t={t} />}
      </div>
    </>
  );
};

// ---------------- footage + end card ----------------
const Footage: React.FC<{ t: number }> = ({ t }) => {
  let z = 1 + 0.04 * (t / VIDEO_END), blur = 0;
  for (const c of CUTS) { const a = Math.pow(on(t, c - 0.2, 0.2), 2) * (t < c ? 1 : 0), b = t >= c ? 1 - easeOut(on(t, c, 0.25)) : 0; z += 0.25 * a + 0.25 * b; blur += 14 * a + 14 * b; }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("proyojon/fp.mp4")} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, filter: `blur(${blur}px)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,.05) 40%, rgba(0,0,0,.4) 75%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - VIDEO_END; const k = on(lt, 0, 0.45);
  return (
    <AbsoluteFill>
      <Img src={staticFile("proyojon/fp_end.jpg")} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", filter: "blur(28px) brightness(.55)", transform: "scale(1.15)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,40,20,.35), rgba(5,20,10,.7))" }} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, padding: "36px 40px", borderRadius: 40, background: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,.5)", boxSizing: "border-box", transform: `scale(${0.95 + 0.05 * backOut(k)})` }}>
        <Img src={staticFile("proyojon/logo_crop.png")} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 860, width: 900, padding: "40px 44px", borderRadius: 40, background: "rgba(255,255,255,.96)", boxShadow: "0 30px 80px rgba(0,0,0,.5)", boxSizing: "border-box", opacity: on(lt, 0.15, 0.3), transform: `translateY(${(1 - easeOut(on(lt, 0.15, 0.45))) * 80}px)` }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 54, color: GREEN, lineHeight: 1.15, marginBottom: 26 }}>ফ্ল্যাট বা প্লট: আজই যোগাযোগ করুন</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Row a={on(lt, 0.45, 0.3)} size={44} text="+8801323280004" icon={<Ic d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />} />
          <Row a={on(lt, 0.65, 0.3)} text="proyojonabashon@gmail.com" icon={<Ic d="M3 5h18v14H3zM3 6l9 7 9-7" />} />
          <Row a={on(lt, 0.85, 0.3)} size={32} text="Level 4, House 23, Road 16, Nikunjo 2, Dhaka" icon={<Ic d={PinI} />} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1500, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 60, color: CREAM, textShadow: shadow, opacity: on(lt, 1.2, 0.3), transform: `scale(${0.8 + 0.2 * backOut(on(lt, 1.2, 0.35))})` }}>আপনার স্বপ্নের ঠিকানা</div>
    </AbsoluteFill>
  );
};

export const FlatPlotReel: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < VIDEO_END ? <Sequence layout="none"><Footage t={t} /></Sequence> : <EndCard t={t} />}
      {t < VIDEO_END && <Kinetic t={t} />}
      {t >= VIDEO_END && t < VIDEO_END + 0.25 && <AbsoluteFill style={{ background: "#fff", opacity: 1 - on(t, VIDEO_END, 0.25) }} />}
    </AbsoluteFill>
  );
};
