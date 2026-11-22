import { geoMercator, geoPath, geoTransform } from "d3-geo";
import bd from "../bhangariwala/bd.json";

// Bangladesh outline projector (same maths as ../bhangariwala/map.tsx, without that module's font loading).
const merc = geoMercator().fitExtent([[-300, -370], [300, 370]], bd as any);
export const CITIES: Record<string, [number, number]> = {
  dhaka: [90.41, 23.81], ctg: [91.83, 22.36], rajshahi: [88.6, 24.37], khulna: [89.56, 22.82], sylhet: [91.87, 24.89], rangpur: [89.25, 25.75],
  barishal: [90.35, 22.7], mymensingh: [90.4, 24.75], comilla: [91.18, 23.46], bogura: [89.37, 24.85], coxs: [91.98, 21.45],
};
export const projector = (v: { cx: number; cy: number; s: number; tilt: number }) => {
  const th = (v.tilt * Math.PI) / 180, P = 1700;
  const tiltPt = (x: number, y: number): [number, number] => { const sc = P / (P - y * Math.sin(th)); return [v.cx + x * sc * v.s, v.cy + y * Math.cos(th) * sc * v.s]; };
  const ll = (lon: number, lat: number) => { const [x, y] = merc([lon, lat])!; return tiltPt(x, y); };
  const path = geoPath(geoTransform({ point(lon: number, lat: number) { const [x, y] = ll(lon, lat); (this as any).stream.point(x, y); } }));
  return { d: path(bd as any) || "", city: (k: string) => ll(CITIES[k][0], CITIES[k][1]) };
};
