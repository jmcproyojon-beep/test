import React from "react";
import { geoMercator, geoPath, geoTransform } from "d3-geo";
import bd from "./bd.json";
import { C, clamp, lerp } from "./lib";

// 2.5D map of Bangladesh (Natural Earth 1:10m, via world-atlas). The outline
// is projected to a plane, tilted back in perspective, and extruded downward
// so it reads as a solid slab standing on the white stage.

const merc = geoMercator().fitExtent([[-300, -370], [300, 370]], bd as any);

export const CITIES: Record<string, [number, number, string]> = {
  dhaka: [90.41, 23.81, "ঢাকা"], ctg: [91.83, 22.36, "চট্টগ্রাম"], rajshahi: [88.6, 24.37, "রাজশাহী"], khulna: [89.56, 22.82, "খুলনা"],
  sylhet: [91.87, 24.89, "সিলেট"], rangpur: [89.25, 25.75, "রংপুর"], barishal: [90.35, 22.7, "বরিশাল"], mymensingh: [90.4, 24.75, "ময়মনসিংহ"],
  comilla: [91.18, 23.46, "কুমিল্লা"], bogura: [89.37, 24.85, "বগুড়া"], jessore: [89.21, 23.17, "যশোর"], coxs: [91.98, 21.45, "কক্সবাজার"],
  dinajpur: [88.64, 25.63, "দিনাজপুর"], noakhali: [91.1, 22.87, "নোয়াখালী"], tangail: [89.92, 24.25, "টাঙ্গাইল"], pabna: [89.24, 24.0, "পাবনা"],
};

export type MapView = { cx: number; cy: number; s: number; tilt: number };

export const projector = (v: MapView) => {
  const th = (v.tilt * Math.PI) / 180, P = 1700;
  const tiltPt = (x: number, y: number): [number, number] => {
    const sc = P / (P - y * Math.sin(th));
    return [v.cx + x * sc * v.s, v.cy + y * Math.cos(th) * sc * v.s];
  };
  const ll = (lon: number, lat: number) => { const [x, y] = merc([lon, lat])!; return tiltPt(x, y); };
  const path = geoPath(geoTransform({ point(lon: number, lat: number) { const [x, y] = ll(lon, lat); (this as any).stream.point(x, y); } }));
  return { ll, d: path(bd as any) || "", city: (k: string) => ll(CITIES[k][0], CITIES[k][1]) };
};

export const BDMap: React.FC<{ v: MapView; depth?: number; k?: number; top?: string; glow?: number; t?: number; cities?: string[]; cityK?: number[]; labels?: boolean; dim?: number }> =
  ({ v, depth = 22, k = 1, top = C.paper, glow = 0, t = 0, cities = [], cityK = [], labels = true, dim = 0 }) => {
    const pr = projector(v);
    const dep = depth * v.s;
    const layers = Math.max(1, Math.round(dep / 2));
    return (
      <g opacity={clamp(k)}>
        <defs>
          <linearGradient id="bwTop" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={top} /><stop offset="1" stopColor={C.mint} />
          </linearGradient>
          <radialGradient id="bwCity"><stop offset="0" stopColor={C.green} stopOpacity={0.55} /><stop offset="1" stopColor={C.green} stopOpacity={0} /></radialGradient>
        </defs>
        {/* contact shadow */}
        <ellipse cx={v.cx + 10 * v.s} cy={v.cy + 300 * v.s * Math.cos((v.tilt * Math.PI) / 180) + dep + 10} rx={300 * v.s} ry={46 * v.s} fill="#0E2A1C" opacity={0.1 * k} />
        <path d={pr.d} transform={`translate(${14 * v.s} ${dep + 22 * v.s})`} fill="#0E2A1C" opacity={0.08} />
        {/* extruded side wall */}
        {Array.from({ length: layers }).map((_, i) => (
          <path key={i} d={pr.d} transform={`translate(0 ${dep - (i * dep) / layers})`} fill={i < 2 ? C.greenDD : C.greenD} />
        ))}
        <path d={pr.d} fill="url(#bwTop)" stroke={C.green} strokeWidth={Math.max(2, 4 * v.s)} strokeLinejoin="round" />
        {dim > 0 && <path d={pr.d} fill={C.ink} opacity={dim} />}
        {cities.map((c, i) => {
          const kk = clamp(cityK[i] ?? 1);
          if (kk <= 0) return null;
          const [x, y] = pr.city(c);
          const pulse = (t * 0.8 + i * 0.37) % 1;
          return (
            <g key={c}>
              <ellipse cx={x} cy={y} rx={110 * v.s * kk * (1 + glow * 0.2)} ry={60 * v.s * kk} fill="url(#bwCity)" />
              <ellipse cx={x} cy={y} rx={(14 + pulse * 46) * v.s} ry={(8 + pulse * 26) * v.s} fill="none" stroke={C.green} strokeWidth={3} opacity={(1 - pulse) * 0.7 * kk} />
              <circle cx={x} cy={y} r={9 * v.s * lerp(0.4, 1, kk)} fill={C.green} stroke="#fff" strokeWidth={3} />
              {labels && (
                <text x={x + 18 * v.s} y={y - 14 * v.s} fontFamily="BwSans" fontWeight={700} fontSize={30 * Math.max(0.8, v.s)} fill={C.ink} opacity={kk}
                  stroke="#fff" strokeWidth={6} paintOrder="stroke">{CITIES[c][2]}</text>
              )}
            </g>
          );
        })}
      </g>
    );
  };
