import React from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

// A paper globe from Natural Earth (world-atlas 110m), orthographic.
// Countries are cut from tinted kraft; borders can be inked red (the
// lyric's "কতগুলো সীমানা") or erased (the bridge's "একটি পৃথিবী").

const COUNTRIES = (feature(world as any, (world as any).objects.countries) as any).features as any[];
const TINTS = ["#C9A877", "#BF9D6A", "#D2B488", "#B8955F", "#CDAE7E", "#C4A270"];
const tint = (id: string) => TINTS[Math.abs([...String(id)].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) % TINTS.length];

export const CAPITALS: Record<string, [number, number, string]> = {
  washington: [-77.04, 38.9, "ওয়াশিংটন"], moscow: [37.62, 55.75, "মস্কো"], beijing: [116.4, 39.9, "বেইজিং"],
  delhi: [77.21, 28.61, "দিল্লি"], newyork: [-74.0, 40.71, "নিউইয়র্ক"], dhaka: [90.41, 23.81, "ঢাকা"],
};

export const Globe: React.FC<{
  cx: number; cy: number; r: number; lon: number; lat?: number; borders?: number; borderColor?: string; glow?: number;
  pins?: string[]; pinK?: number; erase?: number; night?: number; label?: boolean;
}> = ({ cx, cy, r, lon, lat = -15, borders = 0.6, borderColor = "#B3261E", glow = 0, pins = [], pinK = 1, erase = 0, night = 0, label = true }) => {
  const proj = geoOrthographic().scale(r).translate([cx, cy]).rotate([-lon, -lat]).clipAngle(90);
  const path = geoPath(proj);
  const center: [number, number] = [lon, lat];
  return (
    <g>
      {glow > 0 && <circle cx={cx} cy={cy} r={r * 1.18} fill="#FFD27A" opacity={0.35 * glow} />}
      <circle cx={cx + 10} cy={cy + 14} r={r} fill="#000" opacity={0.25} />
      <circle cx={cx} cy={cy} r={r} fill={night ? "#2A3A5A" : "#8FB3C9"} stroke="#3A2A1A" strokeWidth={4} />
      <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="#fff" strokeWidth={1} opacity={0.25} />
      {COUNTRIES.map((c, i) => (
        <path key={i} d={path(c) ?? ""} fill={night ? "#4A4A5A" : tint(c.id ?? i)} stroke={borderColor} strokeWidth={1.6 + borders * 1.6}
          strokeOpacity={borders * (1 - erase)} strokeDasharray={borders > 0.8 ? "6 4" : undefined} />
      ))}
      {/* paper shading */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.9} fill="#fff" opacity={0.08} />
      {pins.map((k, i) => {
        const [lo, la, name] = CAPITALS[k];
        if (geoDistance([lo, la], center) > Math.PI / 2 - 0.05) return null;
        const p = proj([lo, la]);
        if (!p) return null;
        const s = Math.min(1, Math.max(0, pinK * pins.length - i));
        if (s <= 0) return null;
        return (
          <g key={k} transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
            <circle r={10} fill="#B3261E" stroke="#fff" strokeWidth={3} />
            {label && <g transform="translate(16 -30)"><rect x={0} y={-30} width={name.length * 22 + 30} height={46} rx={4} fill="#F4ECD8" stroke="#3A2A1A" strokeWidth={3} />
              <text x={15} y={2} fontFamily="SigDisplay" fontWeight={800} fontSize={30} fill="#2A1A10">{name}</text></g>}
          </g>
        );
      })}
    </g>
  );
};
