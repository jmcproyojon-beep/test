import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

// "The Green Crest" by Proyojon Abashon: a 63 s 16:9 property film for the website, YouTube, social and
// clients. Built from the client's render, site photos and site videos (prepared by client-builds/green-crest/prep.py),
// with an original music bed (music.py). Facts are only those the client gave.

export const FPS = 30, W = 1920, H = 1080, DUR = 63, FRAMES = DUR * FPS;
const G = { green: "#1F6B2E", greenD: "#0F3F1B", greenL: "#5FA864", cream: "#F7F3EA", ink: "#14211A", gold: "#D9B46A" };
const BN = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+2248,U+FEFF,U+FFFD";
const ff = (fam: string, file: string, w: number, r: string) => `@font-face{font-family:${fam};font-weight:${w};src:url(${staticFile(`bw/${file}.woff2`)}) format("woff2");unicode-range:${r};}`;
const FONT_CSS = [ff("GCSans", "inter-600-normal", 600, LAT), ff("GCSans", "inter-700-normal", 700, LAT), ff("GCSans", "anek-bangla-bengali-600-normal", 600, BN), ff("GCSans", "anek-bangla-bengali-800-normal", 700, BN),
  ff("GCHead", "inter-tight-latin-800-normal", 800, LAT), ff("GCHead", "anek-bangla-bengali-800-normal", 800, BN)].join("");
const SANS = "GCSans", HEAD = "GCHead";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const ease = (t: number) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const ramp = (t: number, a: number, d: number, f = ease) => f((t - a) / d);
const rise = (t: number, a: number, d = 0.6): React.CSSProperties => ({ opacity: clamp((t - a) / (d * 0.7)), transform: `translateY(${(1 - easeOut((t - a) / d)) * 40}px)` });
const full: React.CSSProperties = { position: "absolute", inset: 0, width: W, height: H };

// ------------------------------------------------------------ shared pieces
const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 40, background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.45)",
    color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3, backdropFilter: "blur(6px)", ...style }}>{children}</div>
);
const Dot: React.FC<{ c?: string }> = ({ c = G.greenL }) => <span style={{ width: 12, height: 12, borderRadius: 6, background: c, display: "inline-block" }} />;
const Light: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const p = clamp((t - a) / 1.1);
  if (p <= 0 || p >= 1) return null;
  return <div style={{ ...full, background: `linear-gradient(105deg, transparent ${p * 140 - 30}%, rgba(255,255,255,0.35) ${p * 140 - 15}%, transparent ${p * 140}%)` }} />;
};

// ------------------------------------------------------------ icons (line, cream)
const Icon: React.FC<{ k: "area" | "bed" | "bath" | "balcony" | "pin" | "phone" | "calendar" | "tools"; s?: number; c?: string }> = ({ k, s = 64, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none" stroke={c} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
    {k === "area" && <g><rect x={8} y={8} width={48} height={48} rx={4} /><path d="M8 22 H20 M42 8 V20 M56 42 H44 M22 56 V44" /><path d="M24 40 L40 24 M30 24 H40 V34" /></g>}
    {k === "bed" && <g><path d="M6 48 V18 M6 38 H58 V48 M58 38 V30 Q58 26 54 26 H28 V38" /><circle cx={17} cy={31} r={5} /></g>}
    {k === "bath" && <g><path d="M6 32 H58 V38 Q58 50 46 50 H18 Q6 50 6 38 Z M14 50 L11 56 M50 50 L53 56 M14 32 V14 Q14 9 19 9 Q24 9 24 14" /></g>}
    {k === "balcony" && <g><path d="M10 30 H54 M10 54 H54 M10 30 V54 M54 30 V54 M21 30 V54 M32 30 V54 M43 30 V54 M18 30 V10 H46 V30" /></g>}
    {k === "pin" && <g><path d="M32 58 C20 42 12 32 12 22 A20 20 0 0 1 52 22 C52 32 44 42 32 58 Z" /><circle cx={32} cy={22} r={7} /></g>}
    {k === "phone" && <path d="M14 8 L24 8 L28 20 L22 25 Q27 36 39 42 L44 36 L56 40 L56 50 Q56 56 50 56 Q10 52 8 14 Q8 8 14 8 Z" fill={c} stroke="none" />}
    {k === "calendar" && <g><rect x={8} y={12} width={48} height={44} rx={5} /><path d="M8 24 H56 M20 6 V16 M44 6 V16" /><path d="M20 36 h6 M30 36 h6 M40 36 h6 M20 46 h6 M30 46 h6" /></g>}
    {k === "tools" && <g><path d="M38 10 a12 12 0 0 0 -14 16 L8 42 l14 14 l16 -16 a12 12 0 0 0 16 -14 l-7 7 l-8 -2 l-2 -8 Z" /></g>}
  </svg>
);

// ------------------------------------------------------------ scenes
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t / 1.4), out = ramp(t, 3.9, 0.6);
  return (
    <AbsoluteFill style={{ background: G.cream, opacity: 1 - out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, ${G.cream} 60%, #E9E2D2 100%)` }} />
      <div style={{ position: "absolute", left: 960 - 520, top: 300, width: 1040, height: 461, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, transform: `scale(${lerp(0.96, 1, k)})` }}>
        <Img src={staticFile("gc/logo.png")} style={{ width: 1040 }} />
      </div>
      <div style={{ position: "absolute", left: 960 - 520, top: 300, width: 1040, height: 461, overflow: "hidden", mixBlendMode: "overlay" }}><Light t={t} a={1.6} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 10, color: G.green, ...rise(t, 2.0) }}>PRESENTS</div>
    </AbsoluteFill>
  );
};

const Hero: React.FC<{ t: number }> = ({ t }) => {
  // the render, tilted up from the street to the roof garden
  const p = ease(t / 8.0);
  const imgH = (1600 / 1378) * W;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#8DB8D8" }}>
      <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", left: 0, width: W, top: lerp(H - imgH, -60, p), transform: `scale(${lerp(1.04, 1.0, p)})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,30,14,0.78) 0%, rgba(8,30,14,0.35) 38%, rgba(0,0,0,0) 60%)" }} />
      <div style={{ position: "absolute", left: 120, top: 330 }}>
        <div style={rise(t, 0.5)}><Chip><Dot /> PROYOJON ABASHON</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 132, color: "#fff", lineHeight: 1.0, marginTop: 34, letterSpacing: 2, ...rise(t, 0.9, 0.8) }}>THE GREEN</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 132, color: "#B9E3A5", lineHeight: 1.0, letterSpacing: 2, ...rise(t, 1.2, 0.8) }}>CREST</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: "#fff", ...rise(t, 1.9) }}>
          <Icon k="pin" s={44} /> Bashundhara R/A, Block M
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: "rgba(255,255,255,0.85)", marginTop: 12, ...rise(t, 2.3) }}>বসুন্ধরা আবাসিক এলাকা, ব্লক এম</div>
      </div>
    </AbsoluteFill>
  );
};

const FEATS: { k: "area" | "bed" | "bath" | "balcony"; n: number; en: string; bn: string }[] = [
  { k: "area", n: 1850, en: "SFT", bn: "স্কয়ার ফিট" }, { k: "bed", n: 4, en: "BEDROOMS", bn: "বেডরুম" },
  { k: "bath", n: 4, en: "BATHROOMS", bn: "বাথরুম" }, { k: "balcony", n: 3, en: "BALCONIES", bn: "বারান্দা" },
];
const BN_DIG = "০১২৩৪৫৬৭৮৯";
const Features: React.FC<{ t: number }> = ({ t }) => {
  const zoom = lerp(1.0, 1.1, t / 12);
  return (
    <AbsoluteFill style={{ background: G.greenD }}>
      {/* the render's balconies, slowly closer */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 860, height: H, overflow: "hidden" }}>
        <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 1500, left: -330, top: -520, transform: `scale(${zoom})`, transformOrigin: "50% 60%" }} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0) 70%, rgba(15,63,27,1) 100%)", width: 860 }} />
      </div>
      <div style={{ position: "absolute", left: 960, top: 120, right: 100 }}>
        <div style={rise(t, 0.3)}><Chip style={{ background: "rgba(255,255,255,0.08)" }}>APARTMENT FEATURES</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: "#fff", marginTop: 26, ...rise(t, 0.6) }}>প্রতিটি অ্যাপার্টমেন্টে</div>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 26 }}>
          {FEATS.map((f, i) => {
            const a = 1.2 + i * 0.9;
            const n = f.n > 100 ? Math.round(lerp(0, f.n, easeOut((t - a) / 1.6))) : f.n;
            return (
              <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 34, ...rise(t, a, 0.7) }}>
                <div style={{ width: 104, height: 104, borderRadius: 26, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(185,227,165,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon k={f.k} s={60} c="#B9E3A5" /></div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: "#fff", minWidth: f.n > 100 ? 250 : 80, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("en-US")}</div>
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, color: "#B9E3A5" }}>{f.en}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.85)" }}>{String(f.n).replace(/[0-9]/g, (d) => BN_DIG[+d])} {f.bn}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Location: React.FC<{ t: number }> = ({ t }) => {
  const drop = easeOut((t - 0.5) / 0.7), ring = (t * 0.8) % 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 2400, left: -240, top: -1400 + t * 20, filter: "blur(16px) brightness(0.55) saturate(1.1)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(15,63,27,0.35), rgba(8,25,12,0.85))" }} />
      {/* an abstract street grid with the block marked; not a real map */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 14 }).map((_, i) => <line key={`h${i}`} x1={0} y1={80 + i * 74} x2={W} y2={80 + i * 74 + (i % 3) * 12} stroke="#B9E3A5" strokeWidth={i % 4 === 0 ? 3 : 1} />)}
        {Array.from({ length: 22 }).map((_, i) => <line key={`v${i}`} x1={60 + i * 90} y1={0} x2={60 + i * 90 - 40} y2={H} stroke="#B9E3A5" strokeWidth={i % 5 === 0 ? 3 : 1} />)}
      </svg>
      <div style={{ position: "absolute", left: 960 - 60, top: lerp(200, 300, drop), opacity: clamp(drop * 2) }}><Icon k="pin" s={120} c={G.gold} /></div>
      <div style={{ position: "absolute", left: 960 - 90, top: 400, width: 180, height: 60, borderRadius: "50%", border: `3px solid ${G.gold}`, transform: `scale(${0.4 + ring})`, opacity: (1 - ring) * clamp(drop * 2) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center" }}>
        <div style={rise(t, 0.9)}><Chip>LOCATION</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 104, color: "#fff", marginTop: 26, ...rise(t, 1.2, 0.8) }}>Bashundhara R/A</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: "#B9E3A5", marginTop: 6, ...rise(t, 1.6, 0.8) }}>Block M · Dhaka</div>
      </div>
    </AbsoluteFill>
  );
};

const SITE: { src: string; cap: string; capBn: string; len: number }[] = [
  { src: "site1", cap: "Foundation work in progress", capBn: "ফাউন্ডেশনের কাজ চলছে", len: 4.6 },
  { src: "site4", cap: "Our team at work", capBn: "আমাদের টিম কাজ করছে", len: 4.4 },
  { src: "site2", cap: "Materials on site", capBn: "সাইটে নির্মাণসামগ্রী", len: 4.4 },
  { src: "site3", cap: "Bashundhara R/A, Block M", capBn: "নিজের চোখে দেখে যান", len: 4.6 },
];
const SiteUpdate: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SITE.map((c, i) => {
        const a = acc; acc += c.len;
        const lt = t - a;
        if (lt < -0.4 || lt > c.len) return null;
        const fade = clamp((lt + 0.4) / 0.4);
        return (
          <Sequence key={c.src} from={Math.round((from + a - 0.4) * FPS)} durationInFrames={Math.round((c.len + 0.4) * FPS)} layout="none">
            <AbsoluteFill style={{ opacity: fade, transform: `scale(${lerp(1.0, 1.06, (lt + 0.4) / (c.len + 0.4))})` }}>
              <OffthreadVideo src={staticFile(`gc/${c.src}.mp4`)} muted style={{ width: W, height: H, objectFit: "cover" }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,20,10,0.75) 0%, rgba(5,20,10,0) 34%)" }} />
            <div style={{ position: "absolute", left: 100, bottom: 96 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: "#fff", ...rise(lt, 0.3) }}>{c.capBn}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 2, color: "#B9E3A5", marginTop: 6, ...rise(lt, 0.5) }}>{c.cap}</div>
            </div>
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", left: 100, top: 80, ...rise(t, 0.3) }}><Chip style={{ background: "rgba(15,63,27,0.75)" }}><span style={{ width: 14, height: 14, borderRadius: 7, background: "#E8483B", opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) }} /> SITE UPDATE · NOVEMBER 2026</Chip></div>
      <div style={{ position: "absolute", right: 100, top: 80, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#fff", textAlign: "right", ...rise(t, 0.6) }}>নির্মাণকাজ চলছে</div>
    </AbsoluteFill>
  );
};

const Offer: React.FC<{ t: number }> = ({ t }) => {
  const imgH = (1600 / 1378) * 1100;
  return (
    <AbsoluteFill style={{ background: G.cream }}>
      <div style={{ position: "absolute", right: 0, top: 0, width: 1000, height: H, overflow: "hidden" }}>
        <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 1100, left: -50, top: lerp(-120, -260, t / 6.5) }} />
        <AbsoluteFill style={{ width: 1000, background: `linear-gradient(90deg, ${G.cream} 0%, rgba(247,243,234,0) 30%)` }} />
      </div>
      <div style={{ position: "absolute", left: 110, top: 180, width: 900 }}>
        {[{ k: "calendar" as const, bn: "২ বছরের কিস্তি সুবিধা", en: "2 Years Installment Facility", a: 0.4 }, { k: "tools" as const, bn: "নিজের মতো কাস্টমাইজ করার সুযোগ", en: "Customization Possible", a: 2.6 }].map((o) => (
          <div key={o.k} style={{ display: "flex", gap: 30, alignItems: "center", marginBottom: 70, ...rise(t, o.a, 0.8) }}>
            <div style={{ width: 128, height: 128, borderRadius: 32, background: G.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon k={o.k} s={70} /></div>
            <div>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 62, color: G.ink, lineHeight: 1.2 }}>{o.bn}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: G.green, marginTop: 4 }}>{o.en}</div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", ...rise(t, 4.2) }}>
          {["1850 SFT", "4 BED", "4 BATH", "3 BALCONY"].map((s) => <div key={s} style={{ padding: "12px 24px", borderRadius: 40, border: `2px solid ${G.green}`, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: G.green }}>{s}</div>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const pulse = (t * 0.9) % 1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, ${G.cream} 60%, #E6DFCD 100%)` }}>
      <div style={{ position: "absolute", left: 960 - 330, top: 90, width: 660, ...rise(t, 0.2, 0.8) }}><Img src={staticFile("gc/logo.png")} style={{ width: 660 }} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: G.ink, letterSpacing: 2, ...rise(t, 0.6) }}>THE GREEN CREST</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: G.green, marginTop: 8, letterSpacing: 1, ...rise(t, 0.8) }}>Bashundhara R/A, Block M · 1850 sft · 2 Years Installment</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: G.ink, marginTop: 56, ...rise(t, 1.2) }}>বুকিং ও বিস্তারিত জানতে এখনই কল করুন</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 26, marginTop: 30, padding: "22px 54px 22px 30px", borderRadius: 80, background: G.green, boxShadow: "0 18px 40px rgba(15,63,27,0.35)", position: "relative", ...rise(t, 1.5) }}>
          <div style={{ position: "absolute", left: 22, top: 12, width: 96, height: 96, borderRadius: 48, border: "3px solid #B9E3A5", transform: `scale(${1 + pulse * 0.6})`, opacity: 1 - pulse }} />
          <div style={{ width: 96, height: 96, borderRadius: 48, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t * 14) * 8 * clamp((t % 2.2) < 0.6 ? 1 : 0)}deg)` }}><Icon k="phone" s={52} c={G.green} /></div>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: "#fff", letterSpacing: 3, fontVariantNumeric: "tabular-nums" }}>01323280004</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ timeline
const SC = [
  { a: 0, b: 4.5, C: Intro }, { a: 4.5, b: 12.5, C: Hero }, { a: 12.5, b: 24.5, C: Features }, { a: 24.5, b: 31.0, C: Location },
  { a: 31.0, b: 49.0, C: null }, { a: 49.0, b: 55.5, C: Offer }, { a: 55.5, b: 63.5, C: CTA },
];

export const GreenCrest: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.race([Promise.all([document.fonts.load(`800 80px ${HEAD}`, "THE GREEN প্রতিটি"), document.fonts.load(`700 40px ${SANS}`, "Block বসুন্ধরা"), document.fonts.load(`600 40px ${SANS}`, "a ক")]),
      new Promise((r) => setTimeout(r, 12000))]).then(() => continueRender(h));
  }, [h]);
  return (
    <AbsoluteFill style={{ background: "#0A1F10" }}>
      <style>{FONT_CSS}</style>
      {SC.map((s, i) => {
        const lt = t - s.a;
        if (t < s.a - 0.5 || t >= s.b + 0.5) return null;
        // half-second cross-dissolve between sections
        const op = i === 0 ? 1 : clamp((t - s.a + 0.5) / 0.5);
        if (op <= 0) return null;
        return (
          <AbsoluteFill key={i} style={{ opacity: op }}>
            {s.C ? <s.C t={lt} /> : <SiteUpdate t={lt} from={s.a} />}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: "#000", opacity: clamp((t - 61.6) / 1.3) }} />
      <Audio src={staticFile("gc/music.wav")} />
    </AbsoluteFill>
  );
};
