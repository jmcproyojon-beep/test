import React from "react";
import { AbsoluteFill } from "remotion";
import { SEGS } from "./data";
import { ChatIcon, F, INKD, LIME, SparkIcon, backOut, clamp, easeOut, on } from "./WebAIReel";

const SW = 576, SH = 1216; // screen size inside the phone
const MONO = "'DejaVu Sans Mono', Anek, monospace";
const PROMPT = "আমার কফি শপের জন্য একটা সুন্দর ওয়েবসাইট বানাও। মেনু, ছবি আর যোগাযোগ সেকশন রাখো।";

const StatusBar = () => (
  <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: "#fff" }}>
    <span>9:41</span>
    <div style={{ width: 150, height: 34, borderRadius: 20, background: "#000" }} />
    <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>{[10, 14, 18, 22].map((h) => <span key={h} style={{ width: 5, height: h, background: "#fff", borderRadius: 2 }} />)}<span style={{ width: 34, height: 18, border: "2px solid #fff", borderRadius: 5, marginLeft: 8 }} /></span>
  </div>
);
const AppBar: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ height: 76, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 30, height: 4, borderRadius: 2, background: "#cfcfd6" }} />)}</div>
    <span style={{ fontFamily: F, fontWeight: 800, fontSize: 32, color: "#fff", paddingTop: 4, flex: 1 }}>{title}</span>
    {right}
  </div>
);
const Bubble: React.FC<{ text: string; me?: boolean; a?: number; size?: number }> = ({ text, me = true, a = 1, size = 27 }) => (
  <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: "8px 22px", opacity: clamp(a * 2), transform: `translateY(${(1 - easeOut(a)) * 30}px)` }}>
    <div style={{ maxWidth: 430, padding: "16px 22px 12px", borderRadius: 26, borderBottomRightRadius: me ? 6 : 26, background: me ? "#7b5cff" : "#232329", fontFamily: F, fontWeight: 600, fontSize: size, lineHeight: 1.35, color: "#fff" }}>{text}</div>
  </div>
);
const Keyboard = () => (
  <div style={{ position: "absolute", bottom: 0, left: 0, width: SW, height: 330, background: "#1c1c21", padding: "16px 8px", boxSizing: "border-box" }}>
    {[10, 9, 9, 5].map((n, r) => (
      <div key={r} style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 12 }}>
        {Array.from({ length: n }).map((_, i) => <div key={i} style={{ width: r === 3 ? (i === 2 ? 230 : 70) : 48, height: 60, borderRadius: 9, background: r === 3 && i !== 2 ? "#2c2c33" : "#3a3a42" }} />)}
      </div>
    ))}
  </div>
);
const Hi: React.FC<{ a: number; style: React.CSSProperties }> = ({ a, style }) => a > 0 ? (
  <div style={{ position: "absolute", border: `5px solid ${LIME}`, borderRadius: 22, boxShadow: `0 0 26px ${LIME}`, opacity: clamp(a * 2), transform: `scale(${1.15 - 0.15 * easeOut(a)})`, ...style }} />
) : null;
const Tap: React.FC<{ x: number; y: number; t: number; at: number }> = ({ x, y, t, at }) => {
  const k = (t - at) / 0.5; if (k < 0 || k > 1) return null;
  return <div style={{ position: "absolute", left: x - 70 * k, top: y - 70 * k, width: 140 * k, height: 140 * k, borderRadius: "50%", border: `5px solid ${LIME}`, opacity: 1 - k }} />;
};

// a little website the AI builds (theme switches brown -> green on the edit step)
export const Site: React.FC<{ g: number; w?: number }> = ({ g, w = SW - 40 }) => {
  const c = (a: string, b: string) => g <= 0 ? a : g >= 1 ? b : (g < 0.5 ? a : b);
  const main = c("#6b3e26", "#1f6b45"), acc = c("#f5c26b", "#c8ff3d");
  return (
    <div style={{ width: w, borderRadius: 18, overflow: "hidden", background: "#fffaf3", boxShadow: "0 10px 30px rgba(0,0,0,.4)", transition: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: main }}>
        <span style={{ fontFamily: F, fontWeight: 800, fontSize: 26, color: "#fff", paddingTop: 4 }}>কফি হাউস</span>
        <span style={{ display: "flex", gap: 14, fontFamily: F, fontWeight: 600, fontSize: 18, color: "rgba(255,255,255,.85)", paddingTop: 3 }}><span>মেনু</span><span>ছবি</span><span>যোগাযোগ</span></span>
      </div>
      <div style={{ position: "relative", height: 300, background: `linear-gradient(160deg, ${main}, ${c("#3a1f12", "#0f3a26")})`, padding: "30px 24px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 40, color: "#fff", lineHeight: 1.15, width: 300 }}>সেরা কফি, সেরা আড্ডা</div>
        <div style={{ marginTop: 18, display: "inline-block", padding: "12px 24px 8px", borderRadius: 30, background: acc, fontFamily: F, fontWeight: 800, fontSize: 22, color: INKD }}>মেনু দেখুন</div>
        <div style={{ position: "absolute", right: 34, bottom: 46, width: 130, height: 100, borderRadius: "0 0 50px 50px", background: "#fff" }} />
        <div style={{ position: "absolute", right: 14, bottom: 76, width: 46, height: 46, borderRadius: "50%", border: "10px solid #fff" }} />
        <div style={{ position: "absolute", right: 46, bottom: 140, width: 104, height: 18, borderRadius: 9, background: c("#8a5a3a", "#2d8a5a") }} />
      </div>
      <div style={{ display: "flex", gap: 12, padding: 18 }}>
        {[["এসপ্রেসো", "১২০৳"], ["ক্যাপুচিনো", "১৮০৳"], ["কোল্ড কফি", "২০০৳"]].map(([n, p]) => (
          <div key={n} style={{ flex: 1, borderRadius: 14, background: "#fff", boxShadow: "0 3px 10px rgba(0,0,0,.12)", padding: 10 }}>
            <div style={{ height: 70, borderRadius: 10, background: c("#e9d2b8", "#cfe9d8") }} />
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 18, color: "#222", marginTop: 8 }}>{n}</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 18, color: main }}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CODE: [string, string][] = [
  ["#ff7aa8", "<!DOCTYPE html>"], ["#ff7aa8", "<html lang=\"bn\">"], ["#ff7aa8", "<head>"], ["#cfd3dc", "  <title>কফি হাউস</title>"], ["#ff7aa8", "  <style>"],
  ["#7fd3ff", "    .hero { background: #6b3e26;"], ["#7fd3ff", "            color: #fff; }"], ["#7fd3ff", "    .btn  { border-radius: 24px; }"], ["#ff7aa8", "  </style>"], ["#ff7aa8", "</head>"],
  ["#ff7aa8", "<body>"], ["#c8ff3d", "  <header class=\"hero\">"], ["#cfd3dc", "    <h1>সেরা কফি, সেরা আড্ডা</h1>"], ["#cfd3dc", "    <a class=\"btn\">মেনু দেখুন</a>"], ["#c8ff3d", "  </header>"],
  ["#c8ff3d", "  <section id=\"menu\">"], ["#cfd3dc", "    <h2>আমাদের মেনু</h2>"], ["#c8ff3d", "  </section>"], ["#ff7aa8", "</body>"], ["#ff7aa8", "</html>"],
];

const Screen: React.FC<{ id: string; t: number }> = ({ id, t }) => {
  if (id === "open") {
    const cards = [["ChatGPT", 11.24, <ChatIcon s={46} />], ["Gemini", 12.74, <SparkIcon s={46} />]] as const;
    return (
      <>
        <AppBar title="AI সহকারী" />
        <div style={{ textAlign: "center", marginTop: 120, fontFamily: F, fontWeight: 800, fontSize: 44, color: "#fff" }}>আজ কী বানাবেন?</div>
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: F, fontWeight: 600, fontSize: 26, color: "#8e8e99" }}>একটা AI চ্যাট খুলুন</div>
        {cards.map(([n, at, ic], i) => (
          <div key={n} style={{ position: "absolute", left: 40, top: 440 + i * 190, width: SW - 80, height: 150, borderRadius: 28, background: "#1d1d23", display: "flex", alignItems: "center", gap: 26, padding: "0 30px", boxSizing: "border-box", transform: `scale(${t > at ? 1 + 0.03 * Math.sin(Math.min(1, (t - at) / 0.3) * Math.PI) : 1})` }}>
            <div style={{ width: 90, height: 90, borderRadius: 24, background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</div>
            <div><div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 42, color: "#fff" }}>{n}</div><div style={{ fontFamily: F, fontWeight: 600, fontSize: 24, color: "#8e8e99" }}>চ্যাট শুরু করুন</div></div>
            <Hi a={on(t, at, 0.3)} style={{ left: -8, top: -8, right: -8, bottom: -8 }} />
          </div>
        ))}
        <Tap x={SW / 2} y={630 + 190} t={t} at={13.22} />
      </>
    );
  }
  if (id === "type") {
    const k = clamp((t - 15.6) / 2.6); const shown = PROMPT.slice(0, Math.round(PROMPT.length * k));
    const sent = on(t, 18.3, 0.3);
    return (
      <>
        <AppBar title="নতুন চ্যাট" />
        {sent <= 0 && <div style={{ textAlign: "center", marginTop: 240, fontFamily: F, fontWeight: 600, fontSize: 28, color: "#6e6e78" }}>আপনার আইডিয়া সহজ বাংলায় লিখুন</div>}
        {sent > 0 && <div style={{ marginTop: 40 }}><Bubble text={PROMPT} a={sent} /></div>}
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 350, minHeight: 90, borderRadius: 30, background: "#1d1d23", border: `3px solid ${k > 0 && sent <= 0 ? LIME : "rgba(255,255,255,.12)"}`, padding: "18px 90px 14px 24px", boxSizing: "border-box",
          fontFamily: F, fontWeight: 600, fontSize: 28, lineHeight: 1.4, color: "#fff", opacity: 1 - sent }}>
          {shown}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: LIME }}>|</span>
          <div style={{ position: "absolute", right: 14, bottom: 12, width: 62, height: 62, borderRadius: 31, background: k >= 1 ? LIME : "#3a3a42", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k >= 1 ? 1 + 0.08 * Math.sin(t * 12) : 1})` }}>
            <svg width={30} height={30} viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke={INKD} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <Keyboard />
      </>
    );
  }
  if (id === "canvas") {
    const tog = on(t, 21.31, 0.25);
    return (
      <>
        <AppBar title="নতুন চ্যাট" />
        <div style={{ marginTop: 30 }}><Bubble text={PROMPT} size={25} /></div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 150, borderRadius: 28, background: "#1d1d23", padding: 14, transform: `translateY(${(1 - easeOut(on(t, 20.45, 0.3))) * 60}px)`, opacity: on(t, 20.45, 0.2) }}>
          {[["ছবি যোগ করুন", false], ["ফাইল আপলোড", false], ["Canvas", true]].map(([n, isC], i) => (
            <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: 92, padding: "0 22px", borderRadius: 20, fontFamily: isC ? "Inter" : F, fontWeight: 700, fontSize: 32, color: "#fff" }}>
              <span style={{ paddingTop: isC ? 0 : 4 }}>{n as string}</span>
              {isC && <div style={{ width: 92, height: 52, borderRadius: 26, background: tog > 0.5 ? LIME : "#3a3a42", position: "relative" }}><div style={{ position: "absolute", top: 6, left: 6 + 40 * tog, width: 40, height: 40, borderRadius: 20, background: "#fff" }} /></div>}
              {isC && <Hi a={on(t, 20.83, 0.3)} style={{ left: -4, top: -4, right: -4, bottom: -4 }} />}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 50, height: 80, borderRadius: 40, background: "#1d1d23", display: "flex", alignItems: "center", gap: 14, padding: "0 16px" }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "#3a3a42", color: "#fff", fontFamily: "Inter", fontWeight: 700, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>+</div>
          {tog > 0.5 && <div style={{ padding: "8px 18px", borderRadius: 24, background: "rgba(200,255,61,.18)", border: `2px solid ${LIME}`, fontFamily: "Inter", fontWeight: 700, fontSize: 24, color: LIME }}>Canvas ✓</div>}
        </div>
        <Tap x={SW - 90} y={SH - 150 - 46 - 0} t={t} at={21.2} />
      </>
    );
  }
  if (id === "code" || id === "preview") {
    const prev = id === "preview";
    const n = Math.floor(clamp((t - 22.0) / 2.6) * CODE.length);
    const sl = on(t, 24.95, 0.45);
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: 76, padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 26, color: "#fff", flex: 1 }}>Canvas · index.html</span>
          {["কোড", "প্রিভিউ"].map((s, i) => <span key={s} style={{ padding: "8px 18px 4px", borderRadius: 18, fontFamily: F, fontWeight: 800, fontSize: 24, background: (i === 1) === prev ? LIME : "#26262d", color: (i === 1) === prev ? INKD : "#bbb" }}>{s}</span>)}
        </div>
        {!prev && (
          <div style={{ padding: "18px 22px", fontFamily: MONO, fontSize: 21, lineHeight: 1.55 }}>
            {CODE.slice(0, n + 1).map(([c, l], i) => <div key={i} style={{ color: c, whiteSpace: "pre", opacity: i === n ? 0.6 : 1 }}><span style={{ color: "#555", marginRight: 14 }}>{String(i + 1).padStart(2, " ")}</span>{l}</div>)}
            <div style={{ marginTop: 14, fontFamily: F, fontWeight: 600, fontSize: 24, color: LIME }}>AI কোড লিখছে{".".repeat(1 + (Math.floor(t * 4) % 3))}</div>
          </div>
        )}
        {prev && (
          <div style={{ padding: 20, transform: `translateY(${(1 - easeOut(sl)) * 300}px)`, opacity: sl }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}</div>
            <Site g={0} />
          </div>
        )}
      </>
    );
  }
  if (id === "edit") {
    const g = on(t, 29.38, 0.3);
    return (
      <>
        <AppBar title="নতুন চ্যাট" />
        <div style={{ padding: "26px 20px 0", transform: "scale(.82)", transformOrigin: "50% 0" }}><Site g={g} /></div>
        {g > 0 && g < 1 && <div style={{ position: "absolute", left: 0, top: 120, width: SW, height: 560, background: `linear-gradient(90deg, rgba(200,255,61,0) ${g * 100 - 20}%, rgba(200,255,61,.5) ${g * 100}%, rgba(200,255,61,0) ${g * 100 + 20}%)` }} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 690 }}>
          <Bubble text="রংটা সবুজ করে দাও, বাটন আরও বড় করো" a={on(t, 28.85, 0.3)} />
          <Bubble me={false} text="ঠিক আছে! রং বদলে দিলাম ✓" a={on(t, 29.45, 0.3)} />
        </div>
      </>
    );
  }
  if (id === "publish") {
    const opts = [["Netlify", 31.06], ["GitHub Pages", 32.08]] as const;
    const press = on(t, 33.64, 0.15), done = on(t, 33.95, 0.35);
    return (
      <>
        <AppBar title="পাবলিশ করুন" />
        <div style={{ textAlign: "center", marginTop: 50, fontFamily: F, fontWeight: 600, fontSize: 28, color: "#8e8e99" }}>কোথায় পাবলিশ করবেন?</div>
        {opts.map(([n, at], i) => (
          <div key={n} style={{ position: "absolute", left: 40, top: 230 + i * 180, width: SW - 80, height: 140, borderRadius: 28, background: "#1d1d23", display: "flex", alignItems: "center", gap: 24, padding: "0 28px", boxSizing: "border-box" }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: i ? "#f0f0f0" : "#25c2a0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 700, fontSize: 40, color: INKD }}>{i ? "GH" : "N"}</div>
            <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 38, color: "#fff", flex: 1 }}>{n}</div>
            <div style={{ padding: "8px 18px 4px", borderRadius: 20, background: LIME, fontFamily: F, fontWeight: 800, fontSize: 26, color: INKD, transform: `scale(${backOut(on(t, 32.92 + i * 0.1, 0.3))})` }}>ফ্রি</div>
            <Hi a={on(t, at, 0.3)} style={{ left: -8, top: -8, right: -8, bottom: -8 }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 60, right: 60, top: 640, height: 110, borderRadius: 55, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 800, fontSize: 44, color: INKD, paddingTop: 6, transform: `scale(${1 - 0.06 * Math.sin(press * Math.PI)})`, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 6)}px rgba(200,255,61,.45)` }}>পাবলিশ</div>
        <Tap x={SW / 2} y={695} t={t} at={33.64} />
        {done > 0 && (
          <div style={{ position: "absolute", left: 30, right: 30, top: 820, borderRadius: 30, background: "#13261a", border: `3px solid ${LIME}`, padding: "28px 24px", textAlign: "center", opacity: done, transform: `scale(${0.8 + 0.2 * backOut(done)})` }}>
            <svg width={90} height={90} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={LIME} /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={INKD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 48, color: "#fff", marginTop: 8 }}>ওয়েবসাইট লাইভ!</div>
            <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: LIME, marginTop: 6 }}>amar-cafe.netlify.app</div>
          </div>
        )}
      </>
    );
  }
  return null;
};

export const Phone: React.FC<{ t: number; seg: Extract<(typeof SEGS)[number], { kind: "phone" }> }> = ({ t, seg }) => {
  // the phone enters when a run of phone segments starts (after a presenter shot)
  let i = SEGS.indexOf(seg); while (i > 0 && SEGS[i - 1].kind === "phone") i--;
  const enter = easeOut(on(t, SEGS[i].s, 0.4));
  const swap = on(t, seg.s, 0.18);
  const tilt = Math.sin(t * 0.8) * 2;
  return (
    <AbsoluteFill style={{ background: "#0a0a0c", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 0% 100%, rgba(200,255,61,.45), rgba(200,255,61,0) 50%), radial-gradient(circle at 100% 45%, rgba(200,255,61,.18), rgba(200,255,61,0) 40%)" }} />
      <div style={{ position: "absolute", left: 540 - 310, top: 450, width: 620, height: 1260, borderRadius: 80, background: "linear-gradient(145deg, #4a4a52, #16161a 40%, #2a2a30)", boxShadow: "0 40px 90px rgba(0,0,0,.7), 0 0 0 3px #5c5c66 inset",
        transform: `translateY(${(1 - enter) * 700}px) perspective(1600px) rotateY(${tilt}deg) rotateX(${2 + (1 - enter) * 10}deg)` }}>
        <div style={{ position: "absolute", left: 22, top: 22, width: SW, height: SH, borderRadius: 60, overflow: "hidden", background: "#0f0f12" }}>
          <StatusBar />
          <div style={{ position: "absolute", left: 0, top: 54, width: SW, height: SH - 54, opacity: swap }}><Screen id={seg.screen} t={t} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
