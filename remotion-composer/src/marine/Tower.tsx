// G+9 residential tower for the Proyojon Abashon Marine City reel.
// Ground floor on columns (lobby core at the back), nine residential floors with front balconies,
// timber fins, and a roof with parapet, lift/stair room, water tank and a brand sign.
// Units: metres. Origin: centre of the footprint at ground level. Front (road side) faces +z.
import React, { useMemo } from "react";
import * as THREE from "three";

export const TW = 24, TD = 17, GH = 3.6, FH = 3.1, NF = 9;
export const ROOF_Y = GH + NF * FH;            // top of floor 9 slab
export const TOP_Y = ROOF_Y + 4.2;             // top of lift room

export type TowerState = {
  build: number;    // metres: hologram exists below this height
  solid: number;    // metres: solid building exists below this height
  holo: number;     // 0..1 hologram brightness
  night: number;    // 0..1 window glow
  explode: number;  // metres of extra gap per floor (studio scene)
  frame: number;
};

type Box = { p: [number, number, number]; s: [number, number, number]; m: keyof Mats; floor: number; win?: number };
type Mats = { wall: 0; glass: 0; slab: 0; wood: 0; rail: 0; dark: 0; green: 0; col: 0; grey: 0 };

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function buildBoxes(): Box[] {
  const B: Box[] = [];
  const add = (p: [number, number, number], s: [number, number, number], m: keyof Mats, floor: number, win?: number) => B.push({ p, s, m, floor, win });
  // ---- ground floor (floor index 0)
  for (const x of [-11, -5.5, 0, 5.5, 11]) for (const z of [-7.5, 0, 7.5]) add([x, GH / 2, z], [0.7, GH, 0.7], "col", 0);
  add([0, GH / 2, -4.6], [9, GH, 7], "glass", 0, 9000);
  add([0, GH / 2, -8.05], [9.4, GH, 0.5], "wall", 0);
  add([-6.5, GH / 2, -8.2], [4, GH, .3], "grey", 0);
  add([0, 0.08, 0], [TW + 1.5, 0.16, TD + 1.5], "grey", 0);          // plinth / driveway
  add([0, GH - 0.15, 0], [TW + 0.6, 0.3, TD + 0.6], "slab", 0);
  // ---- residential floors
  for (let f = 1; f <= NF; f++) {
    const y0 = GH + (f - 1) * FH;
    const odd = f % 2 === 1;
    add([0, y0 + FH - 0.14, 0], [TW + 0.5, 0.28, TD + 0.5], "slab", f);                       // slab above
    add([0, y0 + (FH - 0.28) / 2, -0.4], [TW - 0.8, FH - 0.28, TD - 1.6], "wall", f);          // body
    // front windows (between balconies)
    const fz = (TD - 1.6) / 2 - 0.4 + 0.06;
    for (let i = 0; i < 6; i++) {
      const x = -9.6 + i * 3.84;
      add([x, y0 + 1.45, fz], [2.5, 1.9, 0.12], "glass", f, f * 100 + i);
    }
    // front balconies: four per floor, staggered on alternate floors
    const bx = odd ? [-8.6, -2.9, 2.9, 8.6] : [-10.2, -4.3, 4.3, 10.2];
    for (const x of bx) {
      add([x, y0 + 0.1, TD / 2 + 0.55], [3.8, 0.2, 1.7], "slab", f);
      add([x, y0 + 0.72, TD / 2 + 1.38], [3.8, 1.05, 0.06], "rail", f);
      add([x - 1.88, y0 + 0.72, TD / 2 + 0.55], [0.06, 1.05, 1.7], "rail", f);
      add([x + 1.88, y0 + 0.72, TD / 2 + 0.55], [0.06, 1.05, 1.7], "rail", f);
    }
    // side windows (east / west)
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
      add([sx * ((TW - 0.8) / 2 + 0.06), y0 + 1.45, -6 + i * 3.6], [0.12, 1.9, 2.2], "glass", f, f * 100 + 20 + i + (sx > 0 ? 10 : 0));
    }
    // back windows
    for (let i = 0; i < 6; i++) add([-9.6 + i * 3.84, y0 + 1.45, -(TD - 1.6) / 2 - 0.4 - 0.06], [2.2, 1.6, 0.12], "glass", f, f * 100 + 40 + i);
  }
  // ---- full-height timber fins and a brand-green corner strip on the front face
  const H = ROOF_Y - GH;
  for (const x of [-12.1, 12.1]) add([x, GH + H / 2, TD / 2 - 0.6], [0.5, H, 1.6], "wood", 99);
  for (const x of [-5.75, 0, 5.75]) add([x, GH + H / 2, TD / 2 + 1.0], [0.28, H, 0.5], "wood", 99);
  add([-12.15, GH + H / 2, -1], [0.45, H, 4.5], "green", 99);
  // ---- roof (floor index 10)
  add([0, ROOF_Y + 0.55, TD / 2 + 0.1], [TW + 0.5, 1.1, 0.3], "wall", 10);
  add([0, ROOF_Y + 0.55, -TD / 2 - 0.1], [TW + 0.5, 1.1, 0.3], "wall", 10);
  add([-(TW + 0.5) / 2, ROOF_Y + 0.55, 0], [0.3, 1.1, TD + 0.5], "wall", 10);
  add([(TW + 0.5) / 2, ROOF_Y + 0.55, 0], [0.3, 1.1, TD + 0.5], "wall", 10);
  add([0, ROOF_Y + 2.1, -4.5], [8, 4.2, 6], "wall", 10);
  add([0, ROOF_Y + 4.25, -4.5], [8.6, 0.25, 6.6], "slab", 10);
  add([7.5, ROOF_Y + 1.2, -5], [3.2, 2.4, 3.2], "grey", 10);
  for (const [x, z] of [[-7, 3], [-3, 4.5], [3.5, 4.2], [8, 2.5], [-9, -3]] as const) add([x, ROOF_Y + 0.45, z], [2.6, 0.6, 1.6], "green", 10);
  return B;
}

export const BOXES = buildBoxes();
export const floorBase = (f: number) => (f <= 0 ? 0 : f >= 10 ? ROOF_Y : f === 99 ? GH : GH + (f - 1) * FH);

export function useTowerMats() {
  return useMemo(() => {
    const solidClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const holoTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const holoBot = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const std = (c: string, r = 0.8, m = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, clippingPlanes: [solidClip], clipShadows: true, ...extra });
    const mats = {
      wall: std("#f3efe7", 0.85), slab: std("#fbfaf6", 0.7), wood: std("#9a6a43", 0.6), col: std("#e6e1d8", 0.8),
      grey: std("#9aa0a2", 0.9), dark: std("#2a2f33", 0.6), green: std("#1f7a3a", 0.7),
      glass: std("#5f7f95", 0.12, 0.55, { envMapIntensity: 1 }),
      rail: std("#bcd6e4", 0.05, 0.2, { transparent: true, opacity: 0.38, depthWrite: false }),
    };
    const lit = std("#ffd9a0", 0.3, 0, { emissive: new THREE.Color("#ffbf6a"), emissiveIntensity: 1.6 });
    const holoLine = new THREE.LineBasicMaterial({ color: "#7dffcf", transparent: true, opacity: 0.9, clippingPlanes: [holoTop, holoBot], blending: THREE.AdditiveBlending, depthWrite: false });
    const holoFace = new THREE.MeshBasicMaterial({ color: "#36e6a8", transparent: true, opacity: 0.1, clippingPlanes: [holoTop, holoBot], blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide });
    return { mats, lit, holoLine, holoFace, solidClip, holoTop, holoBot };
  }, []);
}

const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitEdges = new THREE.EdgesGeometry(unitBox);

export const Tower: React.FC<{ st: TowerState; castShadow?: boolean }> = ({ st, castShadow = true }) => {
  const M = useTowerMats();
  // clip planes: solid keeps y < solid; hologram keeps solid <= y < build
  M.solidClip.constant = st.solid;
  M.holoTop.constant = st.build;
  M.holoBot.constant = -st.solid;
  M.holoLine.opacity = 0.85 * st.holo;
  M.holoFace.opacity = 0.05 * st.holo;
  M.lit.emissiveIntensity = 1.8 * st.night;
  M.lit.color.set(st.night > 0.05 ? "#ffd9a0" : "#5f7f95");
  const off = (f: number) => (f === 99 ? 0 : Math.min(f, 10) * st.explode);
  // the explode offsets would break the shared clip planes, so the studio scene uses solid = Infinity
  return (
    <group>
      {BOXES.map((b, i) => {
        const y = b.p[1] + off(b.floor);
        const onWin = b.win !== undefined && rnd(b.win) < 0.62;
        const mat = b.m === "glass" && onWin && st.night > 0.01 ? M.lit : M.mats[b.m];
        return (
          <group key={i} position={[b.p[0], y, b.p[2]]} scale={b.s}>
            {st.solid > 0 && <mesh geometry={unitBox} material={mat} castShadow={castShadow && b.m !== "rail"} receiveShadow />}
            {st.holo > 0.01 && b.m !== "rail" && <lineSegments geometry={unitEdges} material={M.holoLine} />}
            {st.holo > 0.01 && b.m === "wall" && <mesh geometry={unitBox} material={M.holoFace} />}
          </group>
        );
      })}
    </group>
  );
};
