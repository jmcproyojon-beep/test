import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { CLIPS, FPS, PHRASES, SEGS, STEPS, TOTAL } from "./data";
import { Phone } from "./phone";

loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-bengali-800-normal.woff2"), weight: "800" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-bengali-600-normal.woff2"), weight: "600" });
loadFont({ family: "Anek", url: staticFile("bw/anek-bangla-latin-600-normal.woff2"), weight: "600" });
loadFont({ family: "Inter", url: staticFile("bw/inter-700-normal.woff2"), weight: "700" });

export const LIME = "#c8ff3d", INKD = "#0b0b0d";
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (x: number) => { const k = clamp(x); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const backOut = (x: number, c = 1.8) => { const k = clamp(x); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const on = (t: number, a: number, d = 0.3) => clamp((t - a) / d);
export const win = (t: number, a: number, b: number, f = 0.25) => Math.min(on(t, a, f), 1 - on(t, b - f, f));
const BND = "০১২৩৪৫৬৭৮৯";
export const bn = (n: number) => String(n).replace(/[0-9]/g, (d) => BND[+d]);
export const F = "Anek, Inter, sans-serif";

// ---------------- presenter ----------------
const Presenter: React.FC<{ seg: Extract<(typeof SEGS)[number], { kind: "p" }>; t: number }> = ({ seg, t }) => {
  const c = CLIPS[seg.clip];
  const k = clamp((t - seg.s) / (seg.e - seg.s));
  const punch = 1 + 0.05 * (1 - easeOut(on(t, seg.s, 0.25)));
  const z = lerp(seg.z[0], seg.z[1], k) * punch;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INKD }}>
      <Sequence from={Math.round(seg.s * FPS)} durationInFrames={Math.round((seg.e - seg.s) * FPS) + 1} layout="none">
        <OffthreadVideo src={staticFile(c.src)} muted startFrom={Math.round((seg.s - c.start) * FPS)}
          style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: "50% 28%" }} />
      </Sequence>
      {/* grade: moody vignette + lime glow (reference look) */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 38%, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 0% 100%, rgba(200,255,61,.30), rgba(200,255,61,0) 45%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,.65) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------- overlays ----------------
const Tracker: React.FC<{ t: number }> = ({ t }) => {
  const a = win(t, 9.4, 34.6, 0.3); if (a <= 0) return null;
  const cur = STEPS.filter((s) => t >= s.s).length;
  return (
    <div style={{ position: "absolute", top: 232, left: 0, width: 1080, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {[1, 2, 3, 4].map((n, i) => {
          const act = n === cur, done = n < cur;
          const pop = act ? backOut(on(t, STEPS[n - 1].s, 0.35)) : 1;
          return (
            <React.Fragment key={n}>
              {i > 0 && <div style={{ width: 54, height: 5, borderRadius: 3, background: n <= cur ? LIME : "rgba(255,255,255,.3)" }} />}
              <div style={{ width: 58, height: 58, borderRadius: 29, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${act ? 1.18 * pop : 1})`,
                background: act || done ? LIME : "rgba(20,20,22,.7)", border: `4px solid ${act || done ? LIME : "rgba(255,255,255,.45)"}`, boxShadow: act ? `0 0 28px ${LIME}` : "none",
                fontFamily: F, fontWeight: 800, fontSize: 34, color: act || done ? INKD : "#fff", paddingTop: 4 }}>{bn(n)}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
const StepHeader: React.FC<{ t: number }> = ({ t }) => {
  const st = STEPS.find((s) => t >= s.s && t < s.s + 2.3); if (!st) return null;
  const a = on(t, st.s + 0.05, 0.35), out = 1 - on(t, st.s + 2.0, 0.25);
  return (
    <div style={{ position: "absolute", left: 56, top: 330, opacity: out }}>
      <div style={{ fontFamily: F, fontWeight: 800, fontSize: 300, lineHeight: 0.9, color: LIME, textShadow: `0 0 40px rgba(200,255,61,.45), 0 8px 30px rgba(0,0,0,.6)`, transform: `translateY(${(1 - easeOut(a)) * 60}px) scale(${0.7 + 0.3 * backOut(a)})`, transformOrigin: "20% 80%" }}>{bn(st.n)}</div>
      <div style={{ marginTop: 6 }}>
        {st.title.map((l, i) => (
          <div key={i} style={{ fontFamily: F, fontWeight: 800, fontSize: 56, lineHeight: 1.15, color: i ? LIME : "#fff", textShadow: "0 4px 18px rgba(0,0,0,.8)", opacity: on(t, st.s + 0.2 + i * 0.12, 0.25), transform: `translateX(${(1 - easeOut(on(t, st.s + 0.2 + i * 0.12, 0.3))) * -40}px)` }}>{l}</div>
        ))}
      </div>
    </div>
  );
};
const Glass: React.FC<{ x: number; y: number; a: number; icon: React.ReactNode; label: string; t: number; ph: number }> = ({ x, y, a, icon, label, t, ph }) => {
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + Math.sin(t * 2 + ph) * 10, opacity: clamp(a * 2), transform: `scale(${0.6 + 0.4 * backOut(a)}) rotate(${Math.sin(t * 1.5 + ph) * 3}deg)`,
      display: "flex", alignItems: "center", gap: 18, padding: "18px 28px 18px 18px", borderRadius: 30, background: "rgba(18,18,22,.78)", border: "2px solid rgba(200,255,61,.55)", boxShadow: "0 20px 50px rgba(0,0,0,.5), 0 0 30px rgba(200,255,61,.18)" }}>
      <div style={{ width: 76, height: 76, borderRadius: 22, background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 44, color: "#fff" }}>{label}</div>
    </div>
  );
};
export const ChatIcon = ({ s = 44, c = INKD }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 5h16v10H9l-5 4z" fill="none" stroke={c} strokeWidth={2.4} strokeLinejoin="round" /><circle cx="9" cy="10" r="1.3" fill={c} /><circle cx="12.5" cy="10" r="1.3" fill={c} /><circle cx="16" cy="10" r="1.3" fill={c} /></svg>);
export const SparkIcon = ({ s = 44, c = INKD }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" fill={c} /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" fill={c} /></svg>);
const CodeOff = ({ s = 44 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" fill="none" stroke={INKD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /><path d="M4 21L20 3" stroke="#e0392f" strokeWidth={3} strokeLinecap="round" /></svg>);

const PresenterOverlays: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      <Glass x={60} y={520} a={win(t, 0.2, 2.38, 0.3)} icon={<CodeOff s={50} />} label="কোডিং?" t={t} ph={0} />
      <Glass x={40} y={560} a={win(t, 3.76, 6.48, 0.3)} icon={<ChatIcon s={50} />} label="ChatGPT" t={t} ph={1} />
      <Glass x={640} y={700} a={win(t, 5.56, 6.48, 0.3)} icon={<SparkIcon s={50} />} label="Gemini" t={t} ph={2} />
      {t >= 6.48 && t < 9.4 && (
        <div style={{ position: "absolute", left: 56, top: 330, opacity: 1 - on(t, 9.15, 0.25) }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 300, lineHeight: 0.9, color: LIME, textShadow: "0 0 40px rgba(200,255,61,.45)", transform: `scale(${0.6 + 0.4 * backOut(on(t, 6.55, 0.35))})`, transformOrigin: "20% 80%" }}>{bn(4)}</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 64, color: "#fff", lineHeight: 1.05, paddingBottom: 40, opacity: on(t, 7.1, 0.25), textShadow: "0 4px 18px rgba(0,0,0,.8)" }}>ধাপে</div>
          </div>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 58, color: "#fff", opacity: on(t, 7.5, 0.25), textShadow: "0 4px 18px rgba(0,0,0,.8)" }}>নিজের <span style={{ color: LIME }}>ওয়েবসাইট</span></div>
        </div>
      )}
      {t >= 29.94 && t < 31.0 && (
        <div style={{ position: "absolute", left: 60, top: 400, fontFamily: F, fontWeight: 800, fontSize: 84, color: "#fff", textShadow: "0 6px 24px rgba(0,0,0,.8)", transform: `scale(${0.7 + 0.3 * backOut(on(t, 29.98, 0.3))})`, transformOrigin: "0 50%" }}>
          এবার <span style={{ color: LIME }}>পাবলিশ</span>
        </div>
      )}
      {t >= 34.6 && t < 37.93 && (
        <div style={{ position: "absolute", left: 56, top: 340 }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 170, color: LIME, lineHeight: 1, textShadow: "0 0 40px rgba(200,255,61,.5)", transform: `rotate(-6deg) scale(${0.5 + 0.5 * backOut(on(t, 34.7, 0.35))})`, transformOrigin: "10% 80%" }}>ব্যস!</div>
          <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 16, padding: "16px 26px", borderRadius: 26, background: "rgba(18,18,22,.8)", border: `2px solid ${LIME}`, opacity: on(t, 37.0, 0.3), transform: `scale(${0.7 + 0.3 * backOut(on(t, 37.0, 0.35))})`, transformOrigin: "0 50%" }}>
            <svg width={48} height={48} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={LIME} /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={INKD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontFamily: F, fontWeight: 800, fontSize: 46, color: "#fff" }}>ওয়েবসাইট রেডি</span>
          </div>
        </div>
      )}
      {t >= 37.93 && (
        <div style={{ position: "absolute", left: 50, top: 330 }}>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 38, color: "#fff", opacity: on(t, 38.0, 0.3), textShadow: "0 4px 16px rgba(0,0,0,.8)" }}>আরও AI টিপস পেতে</div>
          {["ফলো", "করুন"].map((w, i) => (
            <div key={w} style={{ fontFamily: F, fontWeight: 800, fontSize: 130, lineHeight: 1.0, color: LIME, textShadow: "0 0 36px rgba(200,255,61,.5), 0 6px 20px rgba(0,0,0,.6)", opacity: on(t, 40.0 + i * 0.6, 0.15), transform: `scale(${0.6 + 0.4 * backOut(on(t, 40.07 + i * 0.6, 0.35))})`, transformOrigin: "0 50%" }}>{w}</div>
          ))}
          <svg width={200} height={330} viewBox="0 0 200 330" style={{ marginLeft: 40 }}><path d="M30 10 C 10 120, 60 240, 170 300" fill="none" stroke={LIME} strokeWidth={9} strokeLinecap="round" strokeDasharray="380" strokeDashoffset={380 * (1 - on(t, 40.4, 0.4))} /><path d="M140 270 L 172 302 L 128 314" fill="none" stroke={LIME} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={on(t, 40.75, 0.1)} /></svg>
        </div>
      )}
      {t >= 38.4 && (
        <div style={{ position: "absolute", left: 300, top: 1090, display: "flex", alignItems: "center", gap: 18, padding: "14px 30px 14px 14px", borderRadius: 60, background: "rgba(18,18,22,.85)", border: "2px solid rgba(255,255,255,.25)", opacity: on(t, 38.4, 0.3), transform: `translateY(${(1 - easeOut(on(t, 38.4, 0.4))) * 40}px)` }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 800, fontSize: 38, color: INKD, paddingTop: 4 }}>রু</div>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 40, color: "#fff" }}>রুবেল মিয়া</div>
          <div style={{ marginLeft: 10, padding: "8px 22px", borderRadius: 30, background: t > 40.3 ? "rgba(255,255,255,.2)" : LIME, fontFamily: F, fontWeight: 800, fontSize: 32, color: t > 40.3 ? "#fff" : INKD, paddingTop: 12 }}>{t > 40.3 ? "ফলোয়িং" : "ফলো"}</div>
        </div>
      )}
    </>
  );
};

// ---------------- captions ----------------
const LATIN = /[A-Za-z]/;
const Caption: React.FC<{ t: number; phone: boolean }> = ({ t, phone }) => {
  const i = PHRASES.findIndex((p, k) => t >= p[0][1] - 0.05 && (k === PHRASES.length - 1 || t < PHRASES[k + 1][0][1] - 0.05));
  if (i < 0) return null;
  const p = PHRASES[i], a = on(t, p[0][1] - 0.05, 0.15);
  const y = phone ? 330 : 1430;
  return (
    <div style={{ position: "absolute", top: y, left: 40, width: 1000, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 20px", transform: `scale(${0.85 + 0.15 * backOut(a)})`, opacity: clamp(a * 2) }}>
      {p.map(([w, s], k) => {
        const act = t >= s && (k === p.length - 1 || t < p[k + 1][1]);
        const hi = act || LATIN.test(w);
        return <span key={k} style={{ fontFamily: F, fontWeight: 800, fontSize: phone ? 66 : 76, color: hi ? LIME : "#fff", opacity: t >= s - 0.05 ? 1 : 0.55,
          textShadow: "0 0 2px #000, 0 4px 0 rgba(0,0,0,.85), 0 8px 26px rgba(0,0,0,.75)", transform: act ? "translateY(-4px) scale(1.06)" : "none", display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
};

// ---------------- composition ----------------
export const WebAIReel: React.FC = () => {
  const f = useCurrentFrame(); const t = Math.min(f / FPS, TOTAL - 0.001);
  const seg = SEGS.find((s) => t >= s.s && t < s.e) || SEGS[SEGS.length - 1];
  const phone = seg.kind === "phone";
  const flash = 1 - on(t, seg.s, 0.12);
  return (
    <AbsoluteFill style={{ background: INKD }}>
      {seg.kind === "p" ? <Presenter seg={seg} t={t} /> : <Phone t={t} seg={seg} />}
      {!phone && <PresenterOverlays t={t} />}
      {!phone && <StepHeader t={t} />}
      <Tracker t={t} />
      <Caption t={t} phone={phone} />
      {seg.s > 0 && flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.18 }} />}
    </AbsoluteFill>
  );
};
