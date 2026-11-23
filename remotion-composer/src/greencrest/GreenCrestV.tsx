import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { BN_DIG, Chip, Dot, FEATS, FONT_CSS, G, HEAD, Icon, Light, SANS, clamp, ease, easeOut, lerp, ramp, rise } from "./GreenCrest";

// The Green Crest, vertical 9:16 cut (1080x1920) for Reels, Shorts and TikTok. Same assets, music and section
// timing as the 16:9 film; every scene is re-laid-out for the tall frame, key text kept inside y 220-1560
// (clear of the platforms' top bar and bottom caption area). The landscape site clips fill the frame with a
// slow pan; the client's vertical lane clip is used natively.

export const FPS = 30, W = 1080, H = 1920, DUR = 63, FRAMES = DUR * FPS;
const RW = 1378, RH = 1600; // render.jpg

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t / 1.4), out = ramp(t, 3.9, 0.6);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, ${G.cream} 60%, #E6DFCD 100%)`, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 90, top: 640, width: 900, height: 399, clipPath: `inset(0 ${(1 - k) * 100}% 0 0)`, transform: `scale(${lerp(0.96, 1, k)})` }}>
        <Img src={staticFile("gc/logo.png")} style={{ width: 900 }} />
      </div>
      <div style={{ position: "absolute", left: 90, top: 640, width: 900, height: 399, overflow: "hidden", mixBlendMode: "overlay" }}><Light t={t} a={1.6} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 12, color: G.green, ...rise(t, 2.0) }}>PRESENTS</div>
    </AbsoluteFill>
  );
};

const Hero: React.FC<{ t: number }> = ({ t }) => {
  // the render fills the tall frame and tilts up from the street to the roof garden
  const p = ease(t / 8.0);
  const w = 1900, h = (RH / RW) * w;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#8DB8D8" }}>
      <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: w, left: (W - w) / 2 - 40, top: lerp(H - h, -40, p), transform: `scale(${lerp(1.05, 1.0, p)})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(8,30,14,0.92) 0%, rgba(8,30,14,0.6) 30%, rgba(0,0,0,0) 52%)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060 }}>
        <div style={rise(t, 0.5)}><Chip><Dot /> PROYOJON ABASHON</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 128, color: "#fff", lineHeight: 1.0, marginTop: 30, ...rise(t, 0.9, 0.8) }}>THE GREEN</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 128, color: "#B9E3A5", lineHeight: 1.0, ...rise(t, 1.2, 0.8) }}>CREST</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 34, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#fff", ...rise(t, 1.9) }}>
          <Icon k="pin" s={46} /> Bashundhara R/A, Block M
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: "rgba(255,255,255,0.88)", marginTop: 10, ...rise(t, 2.3) }}>বসুন্ধরা আবাসিক এলাকা, ব্লক এম</div>
      </div>
    </AbsoluteFill>
  );
};

const Features: React.FC<{ t: number }> = ({ t }) => {
  const zoom = lerp(1.0, 1.1, t / 12);
  return (
    <AbsoluteFill style={{ background: G.greenD }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 820, overflow: "hidden" }}>
        <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 1500, left: -230, top: -420, transform: `scale(${zoom})`, transformOrigin: "50% 60%" }} />
        <AbsoluteFill style={{ height: 820, background: "linear-gradient(0deg, rgba(15,63,27,1) 0%, rgba(15,63,27,0) 35%)" }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 60, top: 760 }}>
        <div style={rise(t, 0.3)}><Chip style={{ background: "rgba(255,255,255,0.08)" }}>APARTMENT FEATURES</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: "#fff", marginTop: 22, ...rise(t, 0.6) }}>প্রতিটি অ্যাপার্টমেন্টে</div>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 24 }}>
          {FEATS.map((f, i) => {
            const a = 1.2 + i * 0.9;
            const n = f.n > 100 ? Math.round(lerp(0, f.n, easeOut((t - a) / 1.6))) : f.n;
            return (
              <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 30, ...rise(t, a, 0.7) }}>
                <div style={{ width: 104, height: 104, borderRadius: 26, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(185,227,165,0.6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon k={f.k} s={60} c="#B9E3A5" /></div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: "#fff", minWidth: f.n > 100 ? 250 : 74, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("en-US")}</div>
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
      <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 2200, left: -560, top: -600 + t * 20, filter: "blur(16px) brightness(0.55) saturate(1.1)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(15,63,27,0.35), rgba(8,25,12,0.85))" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 24 }).map((_, i) => <line key={`h${i}`} x1={0} y1={80 + i * 76} x2={W} y2={80 + i * 76 + (i % 3) * 12} stroke="#B9E3A5" strokeWidth={i % 4 === 0 ? 3 : 1} />)}
        {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={40 + i * 90} y1={0} x2={40 + i * 90 - 60} y2={H} stroke="#B9E3A5" strokeWidth={i % 5 === 0 ? 3 : 1} />)}
      </svg>
      <div style={{ position: "absolute", left: 540 - 70, top: lerp(460, 580, drop), opacity: clamp(drop * 2) }}><Icon k="pin" s={140} c={G.gold} /></div>
      <div style={{ position: "absolute", left: 540 - 100, top: 700, width: 200, height: 66, borderRadius: "50%", border: `3px solid ${G.gold}`, transform: `scale(${0.4 + ring})`, opacity: (1 - ring) * clamp(drop * 2) }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 860, textAlign: "center" }}>
        <div style={rise(t, 0.9)}><Chip>LOCATION</Chip></div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: "#fff", marginTop: 30, lineHeight: 1.05, ...rise(t, 1.2, 0.8) }}>Bashundhara R/A</div>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: "#B9E3A5", marginTop: 14, ...rise(t, 1.6, 0.8) }}>Block M · Dhaka</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.85)", marginTop: 22, ...rise(t, 2.0, 0.8) }}>বসুন্ধরা আবাসিক এলাকা, ব্লক এম</div>
      </div>
    </AbsoluteFill>
  );
};

// landscape clips fill the frame and pan across; "lane" is the client's own vertical clip
const SITE: { src: string; cap: string; capBn: string; len: number; pan?: [number, number]; vertical?: boolean }[] = [
  { src: "site1", cap: "Foundation work in progress", capBn: "ফাউন্ডেশনের কাজ চলছে", len: 3.6, pan: [0.15, 0.55] },
  { src: "lane", cap: "Construction moving ahead", capBn: "নির্মাণকাজ এগিয়ে চলছে", len: 3.6, vertical: true },
  { src: "site4", cap: "Materials on site", capBn: "সাইটে নির্মাণসামগ্রী", len: 3.6, pan: [0.3, 0.7] },
  { src: "site2", cap: "Our team at work", capBn: "আমাদের টিম কাজ করছে", len: 3.6, pan: [0.75, 0.4] },
  { src: "site3", cap: "Bashundhara R/A, Block M", capBn: "নিজের চোখে দেখে যান", len: 3.6, pan: [0.2, 0.6] },
];
const SiteUpdate: React.FC<{ t: number; from: number }> = ({ t, from }) => {
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SITE.map((c) => {
        const a = acc; acc += c.len;
        const lt = t - a;
        if (lt < -0.4 || lt > c.len) return null;
        const fade = clamp((lt + 0.4) / 0.4), u = (lt + 0.4) / (c.len + 0.4);
        // a 1920x1080 clip scaled to 1920 tall is 3413 wide; pan between two fractions of the spare width
        const vw = (1920 / 1080) * H, spare = vw - W;
        const x = c.pan ? -spare * lerp(c.pan[0], c.pan[1], ease(u)) : 0;
        return (
          <Sequence key={c.src} from={Math.round((from + a - 0.4) * FPS)} durationInFrames={Math.round((c.len + 0.4) * FPS)} layout="none">
            <AbsoluteFill style={{ opacity: fade, overflow: "hidden" }}>
              {c.vertical
                ? <OffthreadVideo src={staticFile(`gc/${c.src}.mp4`)} muted style={{ width: W, height: H, objectFit: "cover", transform: `scale(${lerp(1.0, 1.06, u)})` }} />
                : <OffthreadVideo src={staticFile(`gc/${c.src}.mp4`)} muted style={{ position: "absolute", height: H, width: vw, left: x, maxWidth: "none" }} />}
            </AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,20,10,0.85) 0%, rgba(5,20,10,0) 34%), linear-gradient(180deg, rgba(5,20,10,0.55) 0%, rgba(5,20,10,0) 16%)" }} />
            <div style={{ position: "absolute", left: 70, right: 70, top: 1330 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 60, color: "#fff", lineHeight: 1.2, ...rise(lt, 0.3) }}>{c.capBn}</div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, letterSpacing: 2, color: "#B9E3A5", marginTop: 8, ...rise(lt, 0.5) }}>{c.cap}</div>
            </div>
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", left: 70, top: 230, ...rise(t, 0.3) }}>
        <Chip style={{ background: "rgba(15,63,27,0.8)", fontSize: 26 }}><span style={{ width: 14, height: 14, borderRadius: 7, background: "#E8483B", opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) }} /> SITE UPDATE · NOV 2026</Chip>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#fff", marginTop: 16, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>নির্মাণকাজ চলছে</div>
      </div>
    </AbsoluteFill>
  );
};

const Offer: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: G.cream }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 860, overflow: "hidden" }}>
      <Img src={staticFile("gc/render.jpg")} style={{ position: "absolute", width: 1200, left: -60, top: lerp(-80, -240, t / 6.5) }} />
      <AbsoluteFill style={{ height: 860, background: `linear-gradient(0deg, ${G.cream} 0%, rgba(247,243,234,0) 32%)` }} />
    </div>
    <div style={{ position: "absolute", left: 80, right: 70, top: 830 }}>
      {[{ k: "calendar" as const, bn: "২ বছরের কিস্তি সুবিধা", en: "2 Years Installment Facility", a: 0.4 }, { k: "tools" as const, bn: "নিজের মতো কাস্টমাইজ করার সুযোগ", en: "Customization Possible", a: 2.6 }].map((o) => (
        <div key={o.k} style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 54, ...rise(t, o.a, 0.8) }}>
          <div style={{ width: 120, height: 120, borderRadius: 30, background: G.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon k={o.k} s={66} /></div>
          <div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 58, color: G.ink, lineHeight: 1.2 }}>{o.bn}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: G.green, marginTop: 4 }}>{o.en}</div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", ...rise(t, 4.2) }}>
        {["1850 SFT", "4 BED", "4 BATH", "3 BALCONY"].map((s) => <div key={s} style={{ padding: "12px 24px", borderRadius: 40, border: `2px solid ${G.green}`, fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: G.green }}>{s}</div>)}
      </div>
    </div>
  </AbsoluteFill>
);

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const pulse = (t * 0.9) % 1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #FFFFFF 0%, ${G.cream} 60%, #E6DFCD 100%)` }}>
      <div style={{ position: "absolute", left: 100, top: 300, width: 880, ...rise(t, 0.2, 0.8) }}><Img src={staticFile("gc/logo.png")} style={{ width: 880 }} /></div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 760, textAlign: "center" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 76, color: G.ink, letterSpacing: 2, ...rise(t, 0.6) }}>THE GREEN CREST</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: G.green, marginTop: 10, lineHeight: 1.5, ...rise(t, 0.8) }}>Bashundhara R/A, Block M<br />1850 sft · 2 Years Installment</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: G.ink, marginTop: 70, lineHeight: 1.35, ...rise(t, 1.2) }}>বুকিং ও বিস্তারিত জানতে<br />এখনই কল করুন</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22, marginTop: 36, padding: "20px 44px 20px 24px", borderRadius: 80, background: G.green, boxShadow: "0 18px 40px rgba(15,63,27,0.35)", position: "relative", ...rise(t, 1.5) }}>
          <div style={{ position: "absolute", left: 16, top: 10, width: 92, height: 92, borderRadius: 46, border: "3px solid #B9E3A5", transform: `scale(${1 + pulse * 0.6})`, opacity: 1 - pulse }} />
          <div style={{ width: 92, height: 92, borderRadius: 46, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t * 14) * 8 * ((t % 2.2) < 0.6 ? 1 : 0)}deg)` }}><Icon k="phone" s={50} c={G.green} /></div>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 76, color: "#fff", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>01323280004</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SC = [
  { a: 0, b: 4.5, C: Intro }, { a: 4.5, b: 12.5, C: Hero }, { a: 12.5, b: 24.5, C: Features }, { a: 24.5, b: 31.0, C: Location },
  { a: 31.0, b: 49.0, C: null }, { a: 49.0, b: 55.5, C: Offer }, { a: 55.5, b: 63.5, C: CTA },
];

export const GreenCrestV: React.FC = () => {
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
        const op = i === 0 ? 1 : clamp((t - s.a + 0.5) / 0.5);
        if (op <= 0) return null;
        return <AbsoluteFill key={i} style={{ opacity: op }}>{s.C ? <s.C t={lt} /> : <SiteUpdate t={lt} from={s.a} />}</AbsoluteFill>;
      })}
      <AbsoluteFill style={{ background: "#000", opacity: clamp((t - 61.6) / 1.3) }} />
      <Audio src={staticFile("gc/music.wav")} />
    </AbsoluteFill>
  );
};
