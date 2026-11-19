// Geometry helpers: ground-plane unprojection and CSS homographies for text lying on the plot.
import * as THREE from "three";
import { makeCam, View, K, PY, W, H } from "./rig";

const BASE: View = { z: 1, cx: W / 2, cy: H / 2 };
const baseCam = makeCam(BASE);
const ray = new THREE.Raycaster();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// pixel of the original photo -> point on the ground plane (y = 0) in world metres
export function groundAt(ix: number, iy: number): [number, number, number] {
  const fx = ix * K, fy = PY + iy * K;
  ray.setFromCamera(new THREE.Vector2(fx / W * 2 - 1, 1 - fy / H * 2), baseCam);
  const p = new THREE.Vector3(); ray.ray.intersectPlane(ground, p);
  return [p.x, p.y, p.z];
}

const camCache: { key: string; cam: THREE.PerspectiveCamera | null } = { key: "", cam: null };
function camFor(v: View) {
  const key = `${v.z.toFixed(5)}|${v.cx.toFixed(3)}|${v.cy.toFixed(3)}`;
  if (camCache.key !== key) { camCache.cam = makeCam(v); camCache.key = key; }
  return camCache.cam!;
}
export function proj(v: View, p: [number, number, number]) {
  const q = new THREE.Vector3(...p).project(camFor(v));
  return [(q.x + 1) / 2 * W, (1 - q.y) / 2 * H] as [number, number];
}

// solve the 3x3 homography mapping (0,0),(w,0),(w,h),(0,h) to four destination points
function homography(w: number, h: number, d: [number, number][]) {
  const s = [[0, 0], [w, 0], [w, h], [0, h]];
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = s[i], [u, v] = d[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let c = 0; c < 8; c++) {                       // gaussian elimination with partial pivoting
    let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]; }
  }
  const x = A.map((r, i) => r[8] / r[i]);
  return [x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], 1];
}
export function quadMatrix(w: number, h: number, d: [number, number][]) {
  const [a, b, c, dd, e, f, g, hh, i] = homography(w, h, d);
  return `matrix3d(${a},${dd},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,${i})`;
}

// a w x h px element laid flat on the ground: centre, along-direction (unit, on ground), length in metres, lift (m)
export function groundQuad(v: View, w: number, h: number, c: [number, number, number], dir: [number, number], len: number, lift = 0) {
  const [ux, uz] = dir; const hl = len / 2, hh = (len * h / w) / 2;
  const up: [number, number] = [uz, -ux];               // text "up" = dir rotated 90deg (away from camera for dir ~ +x)
  const P = (a: number, b: number): [number, number, number] => [c[0] + ux * a + up[0] * b, lift, c[2] + uz * a + up[1] * b];
  const d = [P(-hl, hh), P(hl, hh), P(hl, -hh), P(-hl, -hh)].map((p) => proj(v, p));
  return quadMatrix(w, h, d);
}
