// Photo-matched camera: the aerial photo is laid out full-width at the bottom of the 1080x1920 frame,
// and a three.js camera solved from the plot corners (prep.py -> cam.json) renders over it.
// A "view" {z, cx, cy} zooms both layers together: cx/cy is the base-layout point shown at frame centre.
import React, { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import CAM from "./cam.json";

export const W = 1080, H = 1920;
export const S = 1.6;                                   // world scale (see README)
export const K = W / CAM.imgW;                          // photo px -> frame px
export const PH = CAM.imgH * K, PY = H - PH;            // photo height and top offset in the frame
export const PPX = W / 2, PPY = PY + (CAM.imgH / 2) * K;
const FULL_H = 2 * PPY, FC = CAM.f * K;
export const PLOT = { w: CAM.plot.w * S, d: CAM.plot.d * S };
export const CX = PLOT.w / 2, CZ = PLOT.d / 2;          // building centre in world
export type View = { z: number; cx: number; cy: number };

export function makeCam(v: View) {
  const cam = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2 * Math.atan(PPY / FC)), W / FULL_H, 0.5, 4000);
  cam.position.set(CAM.pos[0] * S, CAM.pos[1] * S, CAM.pos[2] * S);
  const m3 = new THREE.Matrix3().fromArray(CAM.rot);
  cam.quaternion.setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(m3));
  applyView(cam, v);
  cam.updateMatrixWorld();
  return cam;
}
export function applyView(cam: THREE.PerspectiveCamera, v: View) {
  cam.setViewOffset(W * v.z, FULL_H * v.z, v.cx * v.z - W / 2, v.cy * v.z - H / 2, W, H);
  cam.updateProjectionMatrix();
}
// world point -> frame px for HTML labels
export function project(v: View, p: [number, number, number]) {
  const cam = makeCam(v); const q = new THREE.Vector3(...p).project(cam);
  return { x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H, behind: q.z > 1 };
}
// image px (of the original photo) -> frame px under a view
export const imgToFrame = (v: View, x: number, y: number) => ({ x: (x * K - v.cx) * v.z + W / 2, y: (PY + y * K - v.cy) * v.z + H / 2 });

// One camera instance per composition, handed to <ThreeCanvas camera={...}>; call applyView every frame.
export function usePhotoCam(view: View) {
  const cam = useMemo(() => { const c = makeCam(view); (c as unknown as { manual: boolean }).manual = true; return c; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  applyView(cam, view);
  return cam;
}
// Environment map so the glass and metal pick up reflections.
export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env; return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
};
