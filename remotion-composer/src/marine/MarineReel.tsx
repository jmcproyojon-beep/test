// Proyojon Abashon, Purbachal Marine City: 54 s, 9:16 property reel.
// The client's aerial photo is the stage. A photo-matched three.js camera puts the G+9 tower on the plot.
// Beats: hook -> 10 katha plot -> 60/25 ft road -> south front -> lake view -> hologram build -> day hero
//        -> exploded studio model -> dusk -> spec card -> logo reveal -> booking CTA.
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { ANEK_CSS } from "../rubelpromo/anekcss";
import { FONT_CSS } from "../portfolio/fontcss";
import { Env, usePhotoCam, View, W, H, PY, PH, K, CX, CZ } from "./rig";
import { Tower, TowerState, GH, FH, NF, ROOF_Y, TOP_Y, TW, TD } from "./Tower";
import { groundAt, groundQuad, proj } from "./geo";

export const MR_FPS = 30, MR_W = W, MR_H = H, MR_T = 54;
export const MR_FRAMES = MR_T * MR_FPS;

// ---- timeline (seconds); mirrored in client-builds/proyojon-marine/mix.py
export const T = { plot: 3.6, road: 7.2, south: 10.4, lake: 12.6, build: 15.4, rise0: 16.2, rise1: 21.0, flash: 21.4, solid1: 23.0,
  hero: 23.4, studio: 27.8, dusk: 34.2, spec: 38.6, logo: 43.8, cta: 47.8 };

const G = { green: "#1f7a3a", deep: "#0f4a22", lime: "#9be15d", gold: "#ffd23f", cream: "#f6f3ea", ink: "#13261a" };
const BN = "Anek, sans-serif", EN = "InterTight, Inter, sans-serif";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic), back = Easing.out(Easing.back(1.7));
const iv = (t: number, a: number, b: number, x = 0, y = 1, e: (n: number) => number = io) => interpolate(t, [a, b], [x, y], { ...cl, easing: e });
const win = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(iv(t, a, a + fi), 1 - iv(t, b - fo, b));
const bnNum = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

// ---- camera path over the photo
const KEYS: [number, number, number, number][] = [ // t, zoom, cx, cy
  [0, 1.36, 570, 1330], [3.4, 1.46, 590, 1320], [7.0, 1.5, 600, 1305], [8.2, 1.56, 690, 1300], [10.2, 1.6, 700, 1318],
  [11.2, 1.5, 640, 1290], [12.4, 1.52, 600, 1250], [13.4, 1.62, 470, 1010], [15.2, 1.66, 470, 1000],
  [16.6, 1.04, 555, 1000], [21.2, 1.0, 540, 960], [23.4, 1.0, 540, 960], [27.8, 1.15, 600, 835],
  [34.2, 1.12, 595, 860], [38.6, 1.03, 560, 935], [43.8, 1.0, 540, 960], [54, 1.04, 548, 925],
];
function viewAt(t: number): View {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, z0, x0, y0] = KEYS[i], [t1, z1, x1, y1] = KEYS[i + 1];
  const k = io(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  const z = z0 + (z1 - z0) * k;
  const hx = W / 2 / z, hy = H / 2 / z;
  return { z, cx: Math.min(W - hx, Math.max(hx, x0 + (x1 - x0) * k)), cy: Math.min(H - hy, Math.max(hy, y0 + (y1 - y0) * k)) };
}

// ---- photo-space shapes (pixels of the original 1122x1402 aerial)
const OUTLINE: [number, number][] = [[22, 655], [155, 612], [150, 593], [428, 497], [428, 475], [478, 455], [518, 470], [708, 412], [832, 452], [835, 478], [1070, 563], [1175, 601], [922, 768], [1018, 848], [398, 1185]];
const ROAD: [number, number][] = [[1130, 944], [950, 1046], [750, 1148], [550, 1250], [330, 1378], [292, 1405], [484, 1405], [600, 1333], [750, 1264], [950, 1154], [1130, 1084]];
const POND: [number, number][] = [[268, 333], [322, 305], [452, 297], [610, 300], [765, 338], [700, 392], [560, 425], [470, 432], [372, 398], [330, 365]];
const pts = (p: [number, number][]) => p.map((q) => q.join(",")).join(" ");

const ROAD_A = groundAt(470, 1345), ROAD_B = groundAt(1010, 1063);
const RD = (() => { const dx = ROAD_B[0] - ROAD_A[0], dz = ROAD_B[2] - ROAD_A[2], l = Math.hypot(dx, dz); return [dx / l, dz / l] as [number, number]; })();
const ROAD_MID = groundAt(790, 1188);
const SOUTH_TXT = groundAt(640, 870), SOUTH_ARW = groundAt(735, 1035);
const LAKE = groundAt(505, 360);

// ---------------------------------------------------------------------------------------------
const TitleBar: React.FC<{ t: number; a: number; b: number; top: number; line1: string; line2?: string; color?: string; size?: number }> = ({ t, a, b, top, line1, line2, color = G.green, size = 82 }) => {
  const o = win(t, a, b, 0.25, 0.3); if (o <= 0) return null;
  const wipe = iv(t, a, a + 0.45, 0, 100, out), w2 = iv(t, a + 0.18, a + 0.6, 0, 1, back);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <div style={{ background: color, color: "#fff", fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1.18, padding: "6px 38px 14px", borderRadius: 14, boxShadow: "0 14px 40px rgba(0,0,0,.35)",
        clipPath: `inset(0 ${100 - wipe}% 0 0 round 14px)` }}>{line1}</div>
      {line2 && <div style={{ marginTop: 14, fontFamily: BN, fontWeight: 800, fontSize: size * 0.62, color: "#fff", transform: `scale(${w2})`, textShadow: "0 3px 0 rgba(0,0,0,.35), 0 0 22px rgba(0,0,0,.55)", WebkitTextStroke: "1.5px rgba(10,40,20,.6)" }}>{line2}</div>}
    </div>
  );
};

const LogoChip: React.FC<{ o: number }> = ({ o }) => o <= 0 ? null : (
  <div style={{ position: "absolute", left: 40, top: 56, background: "rgba(255,255,255,.94)", borderRadius: 22, padding: "12px 22px", opacity: o, boxShadow: "0 8px 30px rgba(0,0,0,.25)", transform: `translateY(${(1 - o) * -30}px)` }}>
    <Img src={staticFile("marine/logo.png")} style={{ height: 70, display: "block" }} />
  </div>
);

// text lying on the ground with a little extrusion
const GroundText: React.FC<{ v: View; text: React.ReactNode; c: [number, number, number]; dir: [number, number]; len: number; o: number; rise: number; color?: string; side?: string; size?: number; w?: number; h?: number; font?: string }> =
  ({ v, text, c, dir, len, o, rise, color = G.gold, side = "#a07a00", size = 190, w = 900, h = 260, font = BN }) => {
    if (o <= 0) return null;
    const layers = 7;
    return (
      <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
        {Array.from({ length: layers + 1 }, (_, k) => {
          const lift = (k / layers) * 1.1 * rise; const top = k === layers;
          return (
            <div key={k} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: groundQuad(v, w, h, c, dir, len, lift),
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 1, whiteSpace: "nowrap",
              color: top ? color : side, textShadow: top ? "0 0 18px rgba(255,230,120,.65)" : "none" }}>{text}</div>
          );
        })}
      </div>
    );
  };

const Pin: React.FC<{ x: number; y: number; o: number; label: string; sub?: string }> = ({ x, y, o, label, sub }) => o <= 0 ? null : (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${0.6 + 0.4 * o})`, transformOrigin: "50% 100%", opacity: o, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ background: "#fff", borderRadius: 18, padding: "10px 26px 14px", fontFamily: BN, fontWeight: 800, fontSize: 64, color: G.deep, boxShadow: "0 10px 30px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>{label}
      {sub && <div style={{ fontSize: 34, fontWeight: 600, color: G.green, textAlign: "center", marginTop: -4 }}>{sub}</div>}</div>
    <div style={{ width: 4, height: 90, background: "#fff" }} />
    <div style={{ width: 22, height: 22, borderRadius: 11, background: G.gold, boxShadow: "0 0 0 8px rgba(255,210,63,.35)" }} />
  </div>
);

// ---------------------------------------------------------------------------------------------
// the aerial stage: sky + photo + highlight SVG, zoomed by the view
const Aerial: React.FC<{ t: number; v: View; dusk: number }> = ({ t, v, dusk }) => {
  const drawO = iv(t, 0.8, 2.6, 0, 1, io);
  const plotFill = 0.18 + 0.12 * Math.sin(t * 5) * win(t, T.plot, T.build, 0.4, 0.6);
  const outlineO = 1 - iv(t, T.build + 0.6, T.build + 1.6) * 0.75;
  const roadP = iv(t, T.road + 0.2, T.road + 1.3, 0, 1, out), roadO = win(t, T.road, T.south + 0.4);
  const pondO = win(t, T.lake + 0.3, T.build + 0.6);
  const sky = (a: string, b: string, c: string, d: string) => `linear-gradient(180deg, ${mix(a, c, dusk)} 0%, ${mix(b, d, dusk)} 100%)`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${W / 2 - v.cx * v.z}px, ${H / 2 - v.cy * v.z}px) scale(${v.z})` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: PY + 60, background: sky("#4f8fd6", "#aad0f5", "#1b2350", "#e9925f") }} />
      <Img src={staticFile("marine/aerial.jpg")} style={{ position: "absolute", left: 0, top: PY, width: W, height: PH,
        WebkitMaskImage: "linear-gradient(180deg, transparent 0px, #000 46px)",
        filter: `brightness(${1 - 0.5 * dusk}) saturate(${1 - 0.3 * dusk}) hue-rotate(${-12 * dusk}deg)` }} />
      {dusk > 0 && <div style={{ position: "absolute", left: 0, top: PY, width: W, height: PH, background: "linear-gradient(180deg, rgba(255,140,80,.35), rgba(40,50,110,.35) 40%, rgba(10,20,50,.35))", opacity: dusk, mixBlendMode: "multiply" }} />}
      <svg viewBox={`0 0 ${1122} ${1402}`} style={{ position: "absolute", left: 0, top: PY, width: W, height: PH, overflow: "visible" }}>
        <defs><filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter></defs>
        {pondO > 0 && <g opacity={pondO}>
          <polygon points={pts(POND)} fill="rgba(90,200,255,.35)" stroke="#9fe6ff" strokeWidth={5} />
          {[0, 1, 2].map((k) => { const p = ((t - T.lake) * 0.6 + k / 3) % 1; return <ellipse key={k} cx={505} cy={362} rx={60 + 260 * p} ry={16 + 70 * p} fill="none" stroke="#dff7ff" strokeWidth={4} opacity={(1 - p) * 0.9} />; })}
        </g>}
        {roadO > 0 && <g opacity={roadO}>
          <polygon points={pts(ROAD)} fill="rgba(255,210,63,.8)" opacity={roadP} />
          <polyline points="390,1404 575,1291 750,1206 950,1100 1130,1014" fill="none" stroke="#fff6c8" strokeWidth={10} pathLength={1} strokeDasharray="0.12 0.88" strokeDashoffset={-((t * 0.7) % 1)} strokeLinecap="round" opacity={roadP} />
        </g>}
        <polygon points={pts(OUTLINE)} fill={`rgba(255,210,63,${plotFill * iv(t, 2.2, 3.0) * outlineO})`} />
        <polygon points={pts(OUTLINE)} fill="none" stroke={G.gold} strokeWidth={16} filter="url(#gl)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawO} opacity={0.9 * outlineO} />
        <polygon points={pts(OUTLINE)} fill="none" stroke="#fff6c8" strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawO} opacity={outlineO} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const mix = (a: string, b: string, k: number) => { const A = new THREE.Color(a), B = new THREE.Color(b); return "#" + A.lerp(B, k).getHexString(); };

// ---------------------------------------------------------------------------------------------
const towerAt = (t: number): TowerState => {
  const build = iv(t, T.rise0, T.rise1, 0, TOP_Y + 0.5, Easing.linear);
  const solid = iv(t, T.flash, T.solid1, 0, TOP_Y + 0.5, Easing.inOut(Easing.quad));
  return { build, solid: t >= T.solid1 ? 1e6 : solid, holo: iv(t, T.build + 0.4, T.rise0) * (1 - iv(t, T.solid1 - 0.3, T.solid1 + 0.3)), night: 0, explode: 0, frame: t };
};

const SceneLights: React.FC<{ dusk: number; studio?: boolean }> = ({ dusk, studio }) => {
  const sun = useMemo(() => {
    const l = new THREE.DirectionalLight("#fff1dc", 3);
    l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.04;
    Object.assign(l.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 400 });
    return l;
  }, []);
  if (studio) { sun.position.set(40, 80, 60); sun.target.position.set(0, 0, 0); }
  else { sun.position.set(CX + 18, 70, CZ + 75); sun.target.position.set(CX, 0, CZ); }
  sun.intensity = 3.1 * (1 - 0.6 * dusk); sun.color.set(mix("#fff1dc", "#ffc49a", dusk));
  sun.target.updateMatrixWorld();
  return (<>
    <primitive object={sun} /><primitive object={sun.target} />
    <hemisphereLight args={[mix("#dfeeff", "#8f9ce0", dusk), mix("#6b7a4a", "#3a3446", dusk), 1.05 - 0.2 * dusk]} />
  </>);
};

const HoloExtras: React.FC<{ t: number; st: TowerState }> = ({ t, st }) => {
  const grid = useMemo(() => { const g = new THREE.GridHelper(44, 22, "#7dffcf", "#3fd9a0"); const m = g.material as THREE.Material; m.transparent = true; m.depthWrite = false; m.blending = THREE.AdditiveBlending; return g; }, []);
  const gO = win(t, T.build + 0.3, T.solid1, 0.5, 0.6);
  (grid.material as THREE.Material).opacity = 0.7 * gO;
  const scanY = t < T.flash ? st.build : st.solid;
  const scanO = (t > T.rise0 && t < T.rise1 + 0.2 ? 1 : 0) * 0.55 + (t > T.flash && t < T.solid1 ? 0.8 : 0);
  return (<>
    {gO > 0 && <primitive object={grid} position={[0, 0.06, 0]} />}
    {scanO > 0 && <mesh position={[0, scanY, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[TW + 5, TD + 5]} />
      <meshBasicMaterial color={t > T.flash ? "#fff4c2" : "#7dffcf"} transparent opacity={scanO * 0.45} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>}
  </>);
};

const AerialTower: React.FC<{ t: number; v: View; dusk: number; st: TowerState }> = ({ t, v, dusk, st }) => {
  const cam = usePhotoCam(v);
  return (
    <ThreeCanvas width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} camera={cam} shadows gl={{ antialias: true, localClippingEnabled: true, preserveDrawingBuffer: true } as never}>
      <Env />
      <SceneLights dusk={dusk} />
      <group position={[CX, 0, CZ]}>
        <Tower st={st} />
        <HoloExtras t={t} st={st} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow><planeGeometry args={[260, 260]} /><shadowMaterial opacity={0.42 * (1 - 0.6 * dusk)} /></mesh>
      </group>
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------------------------------------
// studio: exploded model on a plinth with an orbiting camera
const STUDIO_TGT = new THREE.Vector3(0, 25, 0);
function studioCam(t: number) {
  const k = (t - T.studio) / (T.dusk - T.studio);
  const a = THREE.MathUtils.degToRad(28 + 95 * io(k));
  const r = 140 - 10 * k, h = 30 + 8 * Math.sin(k * Math.PI);
  const c = new THREE.PerspectiveCamera(38, W / H, 1, 2000);
  c.position.set(Math.sin(a) * r, h, Math.cos(a) * r); c.lookAt(STUDIO_TGT); c.updateMatrixWorld(); c.updateProjectionMatrix();
  return c;
}
const Studio: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.studio, ex = iv(lt, 0.9, 2.2, 0, 1.6) * (1 - iv(lt, 5.2, 6.2));
  const cam = useMemo(() => { const c = studioCam(t); (c as unknown as { manual: boolean }).manual = true; return c; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const now = studioCam(t); cam.position.copy(now.position); cam.quaternion.copy(now.quaternion); cam.updateMatrixWorld();
  const st: TowerState = { build: 0, solid: 1e6, holo: 0, night: 0, explode: ex, frame: t };
  const P = (p: THREE.Vector3) => { const q = p.clone().project(cam); return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H]; };
  const callouts: { y: number; text: string; a: number; side: 1 | -1 }[] = [
    { y: ROOF_Y + 10 * ex + 2.5, text: "রুফটপ", a: 2.3, side: 1 },
    { y: GH + 4.5 * FH + 5 * ex, text: "৯টি আবাসিক ফ্লোর", a: 2.6, side: -1 },
    { y: GH / 2, text: "গ্রাউন্ড ফ্লোর", a: 2.9, side: 1 },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 38%, #ffffff 0%, ${G.cream} 55%, #dfe8d8 100%)` }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 28 }, (_, i) => <line key={"v" + i} x1={i * 40} y1={0} x2={i * 40} y2={H} stroke="#b9cbb0" strokeWidth={1} />)}
        {Array.from({ length: 49 }, (_, i) => <line key={"h" + i} x1={0} y1={i * 40} x2={W} y2={i * 40} stroke="#b9cbb0" strokeWidth={1} />)}
      </svg>
      <ThreeCanvas width={W} height={H} style={{ position: "absolute", inset: 0 }} camera={cam} shadows gl={{ antialias: true, localClippingEnabled: true, preserveDrawingBuffer: true } as never}>
        <Env /><SceneLights dusk={0} studio />
        <Tower st={st} />
        <mesh position={[0, -0.6, 0]} receiveShadow><cylinderGeometry args={[30, 31, 1.2, 64]} /><meshStandardMaterial color="#e9efe3" roughness={0.9} /></mesh>
        <mesh position={[0, -1.3, 0]}><cylinderGeometry args={[31.5, 31.5, 0.4, 64]} /><meshStandardMaterial color={G.green} roughness={0.6} /></mesh>
      </ThreeCanvas>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {callouts.map((c, i) => {
          const o = win(lt, c.a, 6.0, 0.35, 0.4); if (o <= 0) return null;
          const [x, y] = P(new THREE.Vector3(c.side * (TW / 2 + 1), c.y, 0));
          const x2 = c.side > 0 ? Math.min(W - 60, x + 140) : Math.max(60, x - 140), y2 = y - 70;
          return <g key={i} opacity={o}><circle cx={x} cy={y} r={10} fill={G.green} /><polyline points={`${x},${y} ${x2},${y2} ${x2 + c.side * 10},${y2}`} fill="none" stroke={G.green} strokeWidth={4} /></g>;
        })}
      </svg>
      {callouts.map((c, i) => {
        const o = win(lt, c.a, 6.0, 0.35, 0.4); if (o <= 0) return null;
        const [x, y] = P(new THREE.Vector3(c.side * (TW / 2 + 1), c.y, 0));
        const x2 = c.side > 0 ? Math.min(W - 60, x + 140) : Math.max(60, x - 140), y2 = y - 70;
        return <div key={i} style={{ position: "absolute", top: y2 - 40, left: c.side > 0 ? Math.min(x2 + 16, W - 330) : undefined, right: c.side < 0 ? Math.min(W - x2 + 16, W - 470) : undefined, opacity: o, transform: `scale(${0.8 + 0.2 * o})`,
          background: G.green, color: "#fff", fontFamily: BN, fontWeight: 800, fontSize: 46, padding: "6px 22px 12px", borderRadius: 12, whiteSpace: "nowrap", boxShadow: "0 8px 22px rgba(0,0,0,.2)" }}>{c.text}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: win(lt, 0.2, 6.3), transform: `translateY(${(1 - iv(lt, 0.2, 0.8, 0, 1, out)) * 40}px)` }}>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 150, color: G.deep, letterSpacing: -4, lineHeight: 1 }}>G+9</div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 60, color: G.green, marginTop: 6 }}>গ্রাউন্ড + ৯ তলা</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
const SpecCard: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.spec; const o = win(t, T.spec, T.logo, 0.4, 0.4); if (o <= 0) return null;
  const rows: [string, string, string][] = [
    ["📍", "লোকেশন", "পূর্বাচল মেরিন সিটি"], ["📐", "জমি", "১০ কাঠা"], ["🏢", "স্ট্রাকচার", "G+9"], ["🛣️", "রাস্তা", "৬০/২৫ ফুট"], ["🧭", "পজিশন", "দক্ষিণমুখী, লেক ভিউ"],
  ];
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1010, opacity: o }}>
      <div style={{ background: "rgba(255,255,255,.95)", borderRadius: 34, padding: "34px 40px 26px", boxShadow: "0 30px 80px rgba(0,0,0,.45)", transform: `translateY(${(1 - iv(lt, 0, 0.6, 0, 1, out)) * 120}px)` }}>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 52, color: G.deep, marginBottom: 14 }}>প্রজেক্ট ডিটেইলস</div>
        {rows.map(([ic, k, v], i) => {
          const ro = iv(lt, 0.35 + i * 0.32, 0.7 + i * 0.32, 0, 1, out);
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 0", borderTop: i ? "2px solid #e6ece3" : "none", opacity: ro, transform: `translateX(${(1 - ro) * -60}px)` }}>
            <div style={{ width: 70, height: 70, borderRadius: 18, background: "#e8f3ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{ic}</div>
            <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: "#55705d", width: 200 }}>{k}</div>
            <div style={{ fontFamily: k === "স্ট্রাকচার" ? EN : BN, fontWeight: 800, fontSize: 46, color: G.ink, flex: 1 }}>{v}</div>
          </div>;
        })}
        <div style={{ marginTop: 12, background: G.gold, color: G.ink, borderRadius: 14, padding: "8px 18px 12px", fontFamily: BN, fontWeight: 800, fontSize: 40, textAlign: "center", opacity: iv(lt, 2.2, 2.6), transform: `scale(${iv(lt, 2.2, 2.7, 0.7, 1, back)})` }}>★ একমাত্র লেক-ভিউ প্রজেক্ট ★</div>
      </div>
    </div>
  );
};

// leaves that swirl in and settle behind the logo
const LEAF = "M0,-40 C22,-30 26,10 0,40 C-26,10 -22,-30 0,-40 Z";
const LogoReveal: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.logo; const o = win(t, T.logo, T.cta + 0.4, 0.3, 0.5); if (o <= 0) return null;
  const leaves = Array.from({ length: 46 }, (_, i) => {
    const r0 = 900 + (i * 37) % 400, a0 = i * 2.39996, k = iv(lt, 0.05 * (i % 9), 1.5 + 0.03 * (i % 7), 0, 1, Easing.out(Easing.quad));
    const ang = a0 + (1 - k) * 2.6, r = r0 * (1 - k) + (150 + (i * 53) % 330) * k;
    const x = W / 2 + Math.cos(ang) * r, y = 860 + Math.sin(ang) * r * 0.8 - k * 0, fall = iv(lt, 1.6, 3.6, 0, 1, Easing.in(Easing.quad)) * (260 + (i * 31) % 300);
    const sc = 0.55 + ((i * 17) % 10) / 14;
    return { x, y: y + fall, rot: (ang * 57 + lt * 90 * (i % 2 ? 1 : -1)), sc, col: [G.green, "#2e9a4c", G.lime, "#167036"][i % 4], op: 1 - iv(lt, 1.1, 1.9) };
  });
  const logoK = iv(lt, 0.9, 1.6, 0, 1, back), shine = iv(lt, 1.6, 2.4, -30, 130);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 45%, #ffffff 0%, ${G.cream} 60%, #e3ecd9 100%)`, opacity: o }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {leaves.map((l, i) => <path key={i} d={LEAF} transform={`translate(${l.x},${l.y}) rotate(${l.rot}) scale(${l.sc})`} fill={l.col} opacity={l.op} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.6 + 0.4 * logoK})`, opacity: Math.min(1, logoK * 1.4) }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <Img src={staticFile("marine/logo.png")} style={{ width: 860, display: "block" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: "18%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)", transform: "skewX(-20deg)", mixBlendMode: "screen" }} />
        </div>
        <div style={{ marginTop: 40, fontFamily: BN, fontWeight: 600, fontSize: 50, color: G.green, opacity: iv(lt, 1.8, 2.4), letterSpacing: 1 }}>পূর্বাচল মেরিন সিটি প্রজেক্ট</div>
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T.cta; if (lt < 0) return null;
  const a = (d: number) => iv(lt, d, d + 0.5, 0, 1, out);
  const pulse = 1 + 0.04 * Math.sin(lt * 7) * iv(lt, 1.4, 1.8);
  return (<>
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", opacity: a(0.2), transform: `translateY(${(1 - a(0.2)) * -50}px)` }}>
      <div style={{ background: G.gold, color: G.ink, fontFamily: BN, fontWeight: 800, fontSize: 76, padding: "6px 46px 16px", borderRadius: 18, boxShadow: "0 14px 40px rgba(0,0,0,.4)", transform: `rotate(-2deg) scale(${iv(lt, 0.2, 0.7, 0.6, 1, back)})` }}>বুকিং চলছে!</div>
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, top: 1250, background: "rgba(255,255,255,.96)", borderRadius: 36, padding: "30px 36px 34px", boxShadow: "0 30px 90px rgba(0,0,0,.5)", opacity: a(0.5), transform: `translateY(${(1 - a(0.5)) * 160}px)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Img src={staticFile("marine/logo.png")} style={{ height: 92 }} />
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 40, color: G.green, textAlign: "right", lineHeight: 1.15 }}>বুকিং দিতে<br />আজই কল করুন</div>
      </div>
      <div style={{ marginTop: 22, background: G.green, borderRadius: 22, padding: "16px 24px", display: "flex", alignItems: "center", gap: 22, transform: `scale(${pulse})`, opacity: a(1.0) }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={46} height={46} viewBox="0 0 24 24"><path fill={G.green} d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
        </div>
        <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 74, color: "#fff", letterSpacing: 1 }}>+880 1323 280004</div>
      </div>
      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, opacity: a(1.4) }}>
        <div style={{ fontSize: 40 }}>🌐</div><div style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, color: G.deep }}>www.proyojonabashon.com</div>
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "flex-start", gap: 16, opacity: a(1.8) }}>
        <div style={{ fontSize: 40, marginTop: 4 }}>🏢</div>
        <div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 36, color: G.green }}>অফিস ঠিকানা</div>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 38, color: G.ink, lineHeight: 1.25 }}>Level-4, House: 23, Road: 16,<br />Nikunja-2, Dhaka</div>
        </div>
      </div>
    </div>
  </>);
};

// ---------------------------------------------------------------------------------------------
export const MarineReel: React.FC = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all(["800 60px Anek", "600 40px Anek", "800 60px InterTight", "700 40px Inter"].map((f) => document.fonts.load(f, "অআ abc"))).then(() => continueRender(h), () => continueRender(h)); }, [h]);
  const fr = useCurrentFrame(); const t = fr / MR_FPS;
  const v = viewAt(t);
  const dusk = iv(t, T.dusk + 0.2, T.dusk + 2.0) * (t < T.logo + 0.5 ? 1 : 1);
  const st = towerAt(t); st.night = iv(t, T.dusk + 0.9, T.dusk + 2.6);
  const inStudio = t >= T.studio && t < T.dusk;
  const showTower = t >= T.build - 0.2 && !inStudio && t < T.logo + 0.5 || t >= T.cta - 0.2;
  const aerialO = 1;
  const flash = Math.max(win(t, T.flash - 0.05, T.flash + 0.45, 0.05, 0.4), 0) * 0.85;
  const whip = (a: number) => Math.max(0, 1 - Math.abs(t - a) / 0.22);
  const blur = 18 * Math.max(whip(T.studio), whip(T.dusk));
  // building floor counter during the hologram rise
  const floors = st.build < GH ? -1 : Math.min(NF, Math.floor((st.build - GH) / FH));
  const top = proj(v, [CX, TOP_Y + 3, CZ]);
  return (
    <AbsoluteFill style={{ background: "#0d1a12", fontFamily: BN }}>
      <style>{FONT_CSS + ANEK_CSS}</style>
      {!inStudio && <AbsoluteFill style={{ opacity: aerialO, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
        <Aerial t={t} v={v} dusk={dusk} />
        {/* ground text: 10 katha on the plot, road width along the road, south arrow */}
        <GroundText v={v} text="১০ কাঠা" c={[CX + 1, 0, CZ + 2]} dir={[1, 0]} len={30} o={win(t, T.plot + 0.2, T.south + 0.1, 0.3, 0.3)} rise={iv(t, T.plot + 0.2, T.plot + 0.9, 0, 1, back)} />
        <GroundText v={v} text="৬০/২৫ ফুট" c={[ROAD_MID[0], 0, ROAD_MID[2]]} dir={RD} len={15} size={170} o={win(t, T.road + 0.8, T.south + 0.3, 0.3, 0.4)} rise={iv(t, T.road + 0.8, T.road + 1.4, 0, 1, back)} />
        <GroundText v={v} text="দক্ষিণ" c={SOUTH_TXT} dir={RD} len={20} size={170} color="#ffffff" side="#9aa39c"
          o={win(t, T.south + 0.2, T.lake + 0.2, 0.3, 0.4)} rise={iv(t, T.south + 0.2, T.south + 0.8, 0, 1, back)} />
        <GroundText v={v} c={SOUTH_ARW} dir={RD} len={11} w={600} h={600} side="rgba(0,0,0,0)" color="#fff"
          o={win(t, T.south + 0.5, T.lake + 0.2, 0.3, 0.4)} rise={0}
          text={<svg width={600} height={600} viewBox="0 0 600 600">{[0, 1, 2].map((k) => { const y = 80 + k * 150 + ((t * 220) % 150); return <polyline key={k} points={`120,${y} 300,${y + 120} 480,${y}`} fill="none" stroke={G.gold} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" opacity={0.95 - k * 0.2} />; })}</svg>} />
        {showTower && <AerialTower t={t} v={v} dusk={dusk} st={st} />}
        {st.night > 0 && <div style={{ position: "absolute", left: top[0] - 420, top: top[1] - 60, width: 840, height: 1300, background: "radial-gradient(50% 50% at 50% 50%, rgba(255,190,110,.28), transparent 70%)", opacity: st.night, mixBlendMode: "screen" }} />}
      </AbsoluteFill>}
      {inStudio && <Studio t={t} />}

      {/* screen-space copy */}
      {!inStudio && t < T.logo && <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35) 100%)" }} />
        <LogoChip o={win(t, 0.3, T.build, 0.5, 0.4)} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#fff", opacity: win(t, 0.2, T.plot, 0.3, 0.3), textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>প্রয়োজন আবাসন নিয়ে এলো</div>
        <TitleBar t={t} a={0.6} b={T.plot} top={300} line1="পূর্বাচল মেরিন সিটি" line2="আপনার আগামীর ঠিকানা" />
        <TitleBar t={t} a={T.plot + 0.1} b={T.road} top={240} line1="১০ কাঠা জমি" line2="প্রশস্ত প্লট, পরিকল্পিত নির্মাণ" />
        <TitleBar t={t} a={T.road + 0.1} b={T.south} top={240} line1="৬০/২৫ ফুট রাস্তা" line2="প্রশস্ত সড়কের পাশেই" />
        <TitleBar t={t} a={T.south + 0.1} b={T.lake} top={240} line1="দক্ষিণমুখী" line2="সাউথ ফ্রন্ট প্লট" />
        <TitleBar t={t} a={T.lake + 0.1} b={T.build} top={240} line1="লেক ভিউ" line2="একমাত্র লেক-ভিউ প্রজেক্ট" color="#0f6d8c" />
        {(() => { const p = proj(v, LAKE); return <Pin x={p[0]} y={p[1] - 10} o={iv(t, T.lake + 0.5, T.lake + 1.0, 0, 1, back) * (1 - iv(t, T.build - 0.3, T.build + 0.2))} label="লেক" sub="Lake View" />; })()}
        {/* build phase */}
        <TitleBar t={t} a={T.build + 0.5} b={T.flash} top={150} line1="তৈরি হচ্ছে আগামীর ঠিকানা" size={64} />
        {floors >= 0 && t < T.solid1 + 0.6 && <div style={{ position: "absolute", left: 50, top: 1150, textAlign: "left", opacity: win(t, T.rise0, T.solid1 + 0.6, 0.3, 0.5) }}>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 150, color: "#fff", lineHeight: 1, textShadow: "0 0 30px rgba(125,255,207,.9), 0 4px 0 rgba(0,0,0,.4)" }}>{floors === 0 ? "G" : `G+${floors}`}</div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 44, color: "#bfffe6", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{floors === 0 ? "গ্রাউন্ড ফ্লোর" : `${bnNum(floors)} তলা`}</div>
        </div>}
        <TitleBar t={t} a={T.solid1 - 0.4} b={T.studio} top={150} line1="G+9 স্ট্রাকচার" line2="আধুনিক ডিজাইন, মজবুত নির্মাণ" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", opacity: win(t, T.hero + 0.6, T.studio, 0.5, 0.3) }}>
          <div style={{ display: "inline-block", fontFamily: BN, fontWeight: 800, fontSize: 70, color: "#fff", background: "rgba(15,74,34,.82)", padding: "8px 40px 18px", borderRadius: 20 }}>আগামীর নিশ্চিত ঠিকানা</div>
        </div>
        <TitleBar t={t} a={T.dusk + 1.0} b={T.spec} top={150} line1="সন্ধ্যায় লেকের হাওয়া" line2="শহরের ভিড় থেকে দূরে, শান্ত জীবন" color="#7a3d1e" />
        <SpecCard t={t} />
      </>}
      <LogoReveal t={t} />
      {t >= T.cta && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)" }} />}
      <CTA t={t} />
      {flash > 0 && <AbsoluteFill style={{ background: "#fffbe6", opacity: flash }} />}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - iv(t, 0, 0.35) + iv(t, MR_T - 0.5, MR_T) }} />
    </AbsoluteFill>
  );
};
