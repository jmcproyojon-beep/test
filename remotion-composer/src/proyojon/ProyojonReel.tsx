import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

// Proyojon Abashon plot reel: 3 lip-synced presenter clips cut in the style of the client's
// reference realtor reel (kinetic pop-in words over the presenter, zoom-blur cuts, phone UI card,
// agent contact card at the end). Times are output seconds; clip prep in client-builds/proyojon-reel.
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-bengali-800-normal.woff2"), weight: "800" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-bengali-600-normal.woff2"), weight: "600" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Inter", url: staticFile("bw/inter-700-normal.woff2"), weight: "700" });

export const FPS = 30;
const CLIPS = [{ src: "proyojon/c1.mp4", s: 0, e: 6.5 }, { src: "proyojon/c2.mp4", s: 6.5, e: 12.8 }, { src: "proyojon/c3.mp4", s: 12.8, e: 19.7 }];
const END = 19.7;
export const TOTAL = 24.2;
export const PROYOJON_FRAMES = Math.round(TOTAL * FPS);
const CREAM = "#fbeaa8", GREEN = "#0f6b2f", F = "Anek, Inter, sans-serif";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const on = (t: number, a: number, d = 0.25) => clamp((t - a) / d);
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const backOut = (x: number, c = 1.7) => { const k = clamp(x); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

// ---------------- kinetic words ----------------
type Sz = "s" | "m" | "b" | "x";
type Line = [string, number, Sz][];
type Phrase = { s: number; e: number; lines: Line[]; y?: number; extra?: "logo" | "plots" | "call" };
const PHRASES: Phrase[] = [
  { s: 0.05, e: 1.1, lines: [[["আসসালামু", 0.1, "s"]], [["আলাইকুম!", 0.68, "b"]]] },
  { s: 1.12, e: 3.2, lines: [[["আমি", 1.12, "s"]], [["প্রয়োজন", 1.76, "m"], ["আবাসন", 2.18, "m"]], [["থেকে", 2.54, "s"], ["বলছি", 2.8, "s"]]], extra: "logo" },
  { s: 3.24, e: 6.4, lines: [[["আজ", 3.24, "s"], ["আপনাদের", 3.98, "s"], ["দেখাব", 4.42, "s"]], [["আমাদের", 4.84, "s"], ["প্রজেক্টের", 5.34, "s"]], [["জমি", 5.9, "x"]]] },
  { s: 6.5, e: 8.35, lines: [[["জমিটা", 6.55, "s"], ["একদম", 7.08, "s"]], [["পাকা", 7.36, "b"]], [["রাস্তার", 7.7, "m"], ["পাশে", 8.06, "s"]]] },
  { s: 8.38, e: 10.18, lines: [[["পেছনে", 8.38, "s"]], [["লেক", 9.36, "x"]], [["আর", 9.6, "s"]]] },
  { s: 10.2, e: 12.7, lines: [[["চারপাশে", 10.22, "s"]], [["খোলা", 10.74, "b"], ["সবুজ", 11.06, "b"]], [["প্রকৃতি", 11.46, "m"]]] },
  { s: 12.9, e: 16.98, lines: [[["এখানে", 12.96, "s"]]], extra: "plots" },
  { s: 17.04, e: 19.65, lines: [[["জমি", 17.04, "s"], ["দেখতে", 17.74, "s"]], [["আজই", 18.08, "x"]], [["যোগাযোগ", 18.64, "m"], ["করুন", 19.1, "m"]]], extra: "call" },
];
const SIZE: Record<Sz, number> = { s: 58, m: 104, b: 150, x: 230 };
const shadow = "0 0 2px rgba(0,0,0,.6), 0 6px 0 rgba(0,0,0,.35), 0 10px 40px rgba(0,0,0,.55)";

const Word: React.FC<{ w: string; at: number; sz: Sz; t: number }> = ({ w, at, sz, t }) => {
  const k = on(t, at, 0.22); if (k <= 0) return null;
  const big = sz !== "s";
  return (
    <span style={{ display: "inline-block", fontFamily: F, fontWeight: big ? 800 : 600, fontSize: SIZE[sz], lineHeight: big ? 0.95 : 1.15, color: big ? CREAM : "#fff",
      textShadow: shadow, opacity: clamp(k * 2), filter: `blur(${(1 - k) * 8}px)`, transform: `scale(${big ? 1.5 - 0.5 * easeOut(k) : 0.8 + 0.2 * backOut(k)}) translateY(${(1 - easeOut(k)) * (big ? -20 : 16)}px)`,
      letterSpacing: big ? -2 : 0, margin: "0 12px" }}>{w}</span>
  );
};
const PLOTS: [string, number][] = [["৫", 13.56], ["১০", 13.98], ["১৫", 14.52], ["২০", 15.14], ["২৫", 15.82]];
const Plots: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 10 }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, width: 820 }}>
      {PLOTS.map(([n, at]) => {
        const k = on(t, at, 0.25); if (k <= 0) return <div key={n} style={{ width: 240, height: 120 }} />;
        return (
          <div key={n} style={{ width: 240, height: 120, borderRadius: 30, background: "rgba(255,255,255,.94)", boxShadow: "0 14px 40px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transform: `scale(${0.5 + 0.5 * backOut(k)}) rotate(${(1 - k) * -8}deg)`, opacity: clamp(k * 2) }}>
            <span style={{ fontFamily: F, fontWeight: 800, fontSize: 74, color: GREEN, paddingTop: 10 }}>{n}</span>
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: 40, color: "#333", paddingTop: 8 }}>কাঠা</span>
          </div>
        );
      })}
    </div>
    <div><Word w="প্লট" at={16.52} sz="b" t={t} /><Word w="আছে" at={16.78} sz="s" t={t} /></div>
  </div>
);
const CallCard: React.FC<{ t: number }> = ({ t }) => {
  const k = on(t, 18.64, 0.35); if (k <= 0) return null;
  const ring = Math.sin(t * 28) * 6 * (1 - on(t, 19.4, 0.3));
  return (
    <div style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 22, padding: "16px 18px 16px 34px", borderRadius: 60, background: "rgba(20,24,22,.82)", border: "2px solid rgba(255,255,255,.25)",
      boxShadow: "0 18px 50px rgba(0,0,0,.45)", transform: `translateY(${(1 - easeOut(k)) * 50}px) scale(${0.85 + 0.15 * backOut(k)})`, opacity: clamp(k * 2) }}>
      <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 46, color: "#fff", letterSpacing: 1 }}>+880 1323-280004</span>
      {[["#e5483b", 135], [`#27c24c`, 0]].map(([c, r], i) => (
        <div key={i} style={{ width: 84, height: 84, borderRadius: 42, background: c as string, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${i ? ring : 0}deg)` }}>
          <svg width={44} height={44} viewBox="0 0 24 24" style={{ transform: `rotate(${r}deg)` }}><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="#fff" /></svg>
        </div>
      ))}
    </div>
  );
};
const LogoCard: React.FC<{ t: number }> = ({ t }) => {
  const k = on(t, 1.76, 0.35) * (1 - on(t, 3.0, 0.2)); if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 540 - 290, top: 250, width: 580, padding: "18px 24px", borderRadius: 34, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.4)",
      transform: `translateY(${(1 - easeOut(k)) * -40}px) scale(${0.85 + 0.15 * backOut(k)})`, opacity: clamp(k * 2) }}>
      <Img src={staticFile("proyojon/logo_crop.png")} style={{ width: "100%", display: "block" }} />
    </div>
  );
};
const Kinetic: React.FC<{ t: number }> = ({ t }) => {
  const p = PHRASES.find((p) => t >= p.s && t < p.e); if (!p) return null;
  const out = on(t, p.e - 0.18, 0.18);
  return (
    <>
      {p.extra === "logo" && <LogoCard t={t} />}
      <div style={{ position: "absolute", left: 0, width: 1080, top: p.y ?? (p.extra === "plots" ? 780 : 900), display: "flex", flexDirection: "column", alignItems: "center",
        opacity: 1 - out, transform: `scale(${1 + out * 0.15})`, filter: `blur(${out * 10}px)` }}>
        {p.lines.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "center", alignItems: "baseline", flexWrap: "wrap" }}>{l.map(([w, at, sz], j) => <Word key={j} w={w} at={at} sz={sz} t={t} />)}</div>)}
        {p.extra === "plots" && <Plots t={t} />}
        {p.extra === "call" && <CallCard t={t} />}
      </div>
    </>
  );
};

// ---------------- presenter clips with zoom-blur cuts ----------------
const Clip: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const c = CLIPS[i]; const W = 0.22;
  const inK = i > 0 ? 1 - easeOut(on(t, c.s, W)) : 0, outK = i < CLIPS.length - 1 || true ? Math.pow(on(t, c.e - W, W), 2) : 0;
  const z = 1 + 0.28 * inK + 0.3 * outK + 0.03 * ((t - c.s) / (c.e - c.s));
  const blur = 16 * inK + 18 * outK;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sequence from={Math.round(c.s * FPS)} durationInFrames={Math.round((c.e - c.s) * FPS) + 1} layout="none">
        <OffthreadVideo src={staticFile(c.src)} muted style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, filter: `blur(${blur}px)` }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 40%, rgba(0,0,0,.35) 75%, rgba(0,0,0,.5) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 85% 8%, rgba(255,220,150,.22), rgba(255,220,150,0) 40%)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------------- end card ----------------
const Row: React.FC<{ icon: React.ReactNode; text: string; a: number; font?: string; size?: number }> = ({ icon, text, a, font = "Inter", size = 34 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: clamp(a * 2), transform: `translateX(${(1 - easeOut(a)) * 40}px)` }}>
    <div style={{ width: 58, height: 58, borderRadius: 29, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <span style={{ fontFamily: font, fontWeight: 700, fontSize: size, color: "#1d2a22", lineHeight: 1.2 }}>{text}</span>
  </div>
);
const Ic = ({ d }: { d: string }) => <svg width={30} height={30} viewBox="0 0 24 24"><path d={d} fill="#fff" /></svg>;
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - END; const k = on(lt, 0, 0.45);
  return (
    <AbsoluteFill>
      <Img src={staticFile("proyojon/endbg.jpg")} style={{ position: "absolute", width: 1080, height: 1920, objectFit: "cover", filter: "blur(28px) brightness(.55)", transform: "scale(1.15)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,40,20,.35), rgba(5,20,10,.7))" }} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, padding: "36px 40px", borderRadius: 40, background: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,.5)", transform: `translateY(${(1 - easeOut(k)) * 80}px) scale(${0.9 + 0.1 * backOut(k)})`, opacity: k }}>
        <Img src={staticFile("proyojon/logo_crop.png")} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 860, width: 900, padding: "40px 44px", borderRadius: 40, background: "rgba(255,255,255,.96)", boxShadow: "0 30px 80px rgba(0,0,0,.5)", opacity: on(lt, 0.35, 0.3), transform: `translateY(${(1 - easeOut(on(lt, 0.35, 0.45))) * 80}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 30 }}>
          <Img src={staticFile("proyojon/face.jpg")} style={{ width: 150, height: 150, borderRadius: 75, objectFit: "cover", border: `6px solid ${GREEN}` }} />
          <div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 52, color: GREEN, lineHeight: 1.1 }}>জমি দেখতে আজই</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 52, color: "#1d2a22", lineHeight: 1.1 }}>যোগাযোগ করুন</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Row a={on(lt, 0.7, 0.3)} size={44} text="+8801323280004" icon={<Ic d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />} />
          <Row a={on(lt, 0.9, 0.3)} text="proyojonabashon@gmail.com" icon={<Ic d="M3 5h18v14H3zM3 6l9 7 9-7" />} />
          <Row a={on(lt, 1.1, 0.3)} size={32} text="Level 4, House 23, Road 16, Nikunjo 2, Dhaka" icon={<Ic d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z" />} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1520, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 60, color: CREAM, textShadow: shadow, opacity: on(lt, 1.5, 0.3), transform: `scale(${0.8 + 0.2 * backOut(on(lt, 1.5, 0.35))})` }}>৫ থেকে ২৫ কাঠার প্লট</div>
    </AbsoluteFill>
  );
};

export const ProyojonReel: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const i = CLIPS.findIndex((c) => t >= c.s && t < c.e);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {i >= 0 ? <Clip i={i} t={t} /> : <EndCard t={t} />}
      {i >= 0 && <Kinetic t={t} />}
      {t >= END && t < END + 0.25 && <AbsoluteFill style={{ background: "#fff", opacity: 1 - on(t, END, 0.25) }} />}
    </AbsoluteFill>
  );
};
