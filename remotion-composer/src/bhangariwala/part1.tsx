import React from "react";
import { BDMap, projector, MapView } from "./map";
import { Badge, DEVS, Dev, DevKind, Apartment, Office, Shop, House, Palm, Rickshaw } from "./icons";
import { C, HEAD, SANS, at, backOut, clamp, ease, easeOut, expoOut, lerp, rand, ramp, smooth } from "./lib";

// PART 1 (0-10 s): Bangladesh, 2022 - 367 million kg of e-waste.

const T = {
  icons: 1.0,
  accum: 2.0,
  count0: at("৩৬৭") - 0.15,
  count1: at("৩৬৭", 0, "e"),
  sky: 4.85,
  back: 7.0,
  q: 7.75,
  push: 9.25,
};


/** map camera for part 1 */
const mapView = (t: number): MapView => {
  const a = ease(t / 1.3);
  let cx = 540, cy = lerp(1000, 900, a), s = lerp(0.8, 1.04, a), tilt = lerp(64, 32, a);
  s -= 0.04 * ramp(t, 1.3, 0.7);
  const z = ease((t - T.accum) / 2.6);
  s = lerp(s, 0.8, z); cy = lerp(cy, 1010, z);
  const up = ease((t - T.sky) / 0.5);
  const down = ease((t - T.back) / 0.4);
  cy += -1400 * up * (1 - down);
  // final view: a little closer, pile over the south
  s = lerp(s, 0.88, down); cy = lerp(cy, 890, down);
  return { cx, cy, s, tilt };
};

// discarded devices that fly in around the map (2-4.6 s)
const ACC = Array.from({ length: 46 }).map((_, i) => {
  const a = (i / 46) * Math.PI * 2 + rand(i) * 0.3;
  const bottomBias = Math.sin(a) > 0 ? 1 : 0.85;
  return {
    kind: DEVS[(i * 3) % DEVS.length],
    ox: Math.cos(a) * (360 + rand(i + 7) * 80), oy: Math.sin(a) * (430 + rand(i + 9) * 70) * bottomBias + 40,
    rot: (rand(i + 3) - 0.5) * 70, s: 0.36 + rand(i + 5) * 0.16, t0: T.accum + 0.05 * i,
    from: a + (rand(i + 11) - 0.5) * 0.8,
  };
});

const MAP_ICONS: [string, DevKind][] = [["dhaka", "phone"], ["ctg", "laptop"], ["rajshahi", "monitor"], ["khulna", "charger"], ["sylhet", "battery"], ["rangpur", "cable"]];

// a mound of devices: rows from the bottom up
const mound = (rows: number, step: number, rowH: number, seed: number) => {
  const out: { x: number; y: number; rot: number; kind: DevKind; s: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const n = rows - r + 2;
    for (let j = 0; j < n; j++) {
      const i = out.length;
      out.push({ x: (j - (n - 1) / 2) * step + (rand(i + seed) - 0.5) * step * 0.4, y: -r * rowH + (rand(i + seed + 50) - 0.5) * 10,
        rot: (rand(i + seed + 90) - 0.5) * 80, kind: DEVS[(i * 5 + seed) % DEVS.length], s: 0.42 + rand(i + seed + 20) * 0.14 });
    }
  }
  return out;
};
const SKY_PILE = mound(6, 84, 54, 3);
const MAP_PILE = mound(8, 66, 44, 11);

const Counter: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, T.count0, 0.35, easeOut) * (1 - ramp(t, T.sky - 0.05, 0.35));
  if (k <= 0) return null;
  const n = Math.round(367 * expoOut((t - T.count0) / (T.count1 - T.count0 + 0.05)));
  const land = Math.exp(-Math.max(0, t - T.count1) * 7) * (t > T.count1 ? 1 : 0);
  const lift = (1 - k) * 40 - ramp(t, T.sky - 0.05, 0.35) * 60;
  return (
    <g transform={`translate(540 ${290 + lift})`} opacity={k}>
      <text y={170} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={250} letterSpacing={-8} fill={C.ink}
        transform={`scale(${1 + land * 0.06})`} style={{ transformOrigin: "0px 90px" }}>{n}</text>
      <text y={250} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={74} letterSpacing={6} fill={C.green}>MILLION KG</text>
      <g transform="translate(0 322)" opacity={ramp(t, T.count1 - 0.1, 0.3)}>
        <rect x={-190} y={-34} width={380} height={68} rx={34} fill={C.ink} />
        <text y={12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} letterSpacing={4} fill="#fff">E-WASTE • 2022</text>
      </g>
      <text y={392} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={22} fill={C.mute} opacity={ramp(t, T.count1 + 0.2, 0.4)}>
        Source: Global E-waste Monitor 2024 (ITU / UNITAR)</text>
    </g>
  );
};

const PerPerson: React.FC<{ t: number }> = ({ t }) => {
  const a = T.sky + 0.65;
  const k = ramp(t, a, 0.35, easeOut) * (1 - ramp(t, T.back - 0.1, 0.3));
  if (k <= 0) return null;
  const v = (2.2 * easeOut((t - a - 0.1) / 0.8)).toFixed(1);
  return (
    <g transform={`translate(540 ${560 - (1 - k) * 30}) scale(1.25)`} opacity={k}>
      <rect x={-300} y={-70} width={600} height={140} rx={30} fill={C.paper} stroke={C.line} strokeWidth={3} />
      <rect x={-300} y={-70} width={600} height={140} rx={30} fill="none" stroke={C.green} strokeWidth={4} strokeDasharray="10 0" opacity={0.0} />
      <g transform="translate(-228 4)"><circle r={44} fill={C.mint} />
        <circle cy={-16} r={13} fill={C.green} /><path d="M-22 26 C-22 2 22 2 22 26 Z" fill={C.green} /></g>
      <text x={-160} y={16} fontFamily={HEAD} fontWeight={800} fontSize={58} fill={C.ink}>≈ {v} KG<tspan fill={C.mute} fontSize={40} fontWeight={700}> / PERSON</tspan></text>
    </g>
  );
};

/** the skyline layer (5-7 s): buildings send old devices to one pile */
const Skyline: React.FC<{ t: number; off: number }> = ({ t, off }) => {
  const G = 1240; // ground line
  const pileX = 540, pileY = G + 70;
  const SRC: [number, number][] = [[150, G - 90], [300, G - 300], [330, G - 180], [560, G - 150], [610, G - 210], [780, G - 380], [800, G - 230], [960, G - 260]];
  const launches = 18;
  const lt = (i: number) => T.sky + 0.45 + i * 0.09;
  const landed = SKY_PILE.filter((_, i) => i < 6 || t > lt(i - 6) + 0.5).length;
  return (
    <g transform={`translate(0 ${off})`}>
      <rect x={-200} y={0} width={1480} height={G} fill="url(#bwSky)" />
      <Palm x={60} y={G} s={1.1} t={t} />
      <House x={170} y={G} s={0.95} />
      <Apartment x={250} y={G} w={190} h={440} seed={2} />
      <Shop x={450} y={G} w={220} />
      <Office x={690} y={G} w={180} h={560} />
      <Apartment x={880} y={G} w={190} h={380} tone="#EEF3F2" seed={5} />
      <Palm x={1050} y={G} s={0.9} t={t + 2} />
      <rect x={-200} y={G} width={1480} height={720} fill="#D5DCDD" />
      <rect x={-200} y={G} width={1480} height={10} fill={C.ink2} />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={i * 150 - ((t * 120) % 150)} y={G + 118} width={70} height={8} rx={4} fill="#fff" opacity={0.8} />)}
      <Rickshaw x={-160 + ((t - T.sky) * 260)} y={G + 110} s={0.62} t={t} />
      {/* pile */}
      <g transform={`translate(${pileX} ${pileY})`}>
        <ellipse cx={0} cy={26} rx={90 + landed * 11} ry={22} fill="#000" opacity={0.16} />
        {SKY_PILE.slice(0, landed).map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s * 1.3})`}><Dev kind={p.kind} /></g>
        ))}
      </g>
      {/* flights */}
      {Array.from({ length: launches }).map((_, i) => {
        const u = (t - lt(i)) / 0.5;
        if (u <= 0 || u >= 1) return null;
        const [sx, sy] = SRC[i % SRC.length];
        const slot = SKY_PILE[i + 6] ?? SKY_PILE[SKY_PILE.length - 1];
        const ex = pileX + slot.x, ey = pileY + slot.y;
        const e = smooth(u);
        const x = lerp(sx, ex, e), y = lerp(sy, ey, e) - Math.sin(Math.PI * e) * 220;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${lerp(0, slot.rot, e) + Math.sin(u * 6) * 20}) scale(${lerp(0.42, slot.s * 1.3, e)})`}>
            <Badge r={70}><Dev kind={slot.kind} /></Badge>
          </g>
        );
      })}
    </g>
  );
};

/** where the hero phone (top of the pile) sits on screen, and its scale, at time t */
export const p1Hero = (t: number) => {
  const v = mapView(t), pr = projector(v);
  const [px, py] = pr.ll(90.15, 22.25);
  const top = MAP_PILE[MAP_PILE.length - 1];
  return { x: px + top.x * v.s, y: py + top.y * v.s - 40 * v.s, s: 0.62 * v.s };
};

export const Part1: React.FC<{ t: number }> = ({ t }) => {
  const v = mapView(t);
  const pr = projector(v);
  const intro = ramp(t, 0, 0.9);
  const frozen = t > T.q + 0.15;
  const tt = frozen ? T.q + 0.15 : t; // "everything pauses"
  const skyOff = (1 - ease((t - T.sky) / 0.5)) * 1400 + ease((t - T.back) / 0.4) * 1400;
  // southern pile on the map
  const [px, py] = pr.ll(90.15, 22.25);
  const mp = ramp(t, T.back + 0.2, 0.7);
  const shownMap = Math.min(MAP_PILE.length, Math.round(lerp(26, MAP_PILE.length + 3, mp)));
  const { x: heroX, y: heroY } = p1Hero(t);
  // push into the pile at the end
  const push = ease((t - T.push) / 0.75);
  const zs = lerp(1, 6.5, push * push) * (1 + Math.max(0, t - 10) * 1.5);
  const gone = 1 - ramp(t, 10.0, 0.28);
  return (
    <g opacity={gone}>
      <g transform={`translate(${heroX} ${heroY}) scale(${zs}) translate(${-heroX} ${-heroY})`}>
        <g filter={t > T.sky - 0.1 && t < T.back + 0.5 ? "url(#bwVBlur)" : undefined}>
          <g opacity={intro}>
            <BDMap v={v} k={1} depth={lerp(0, 24, ramp(t, 0.2, 1.0))} t={tt} cities={["dhaka", "ctg"]} cityK={[ramp(t, 0.8, 0.5), ramp(t, 1.05, 0.5)]} />
          </g>
          {/* first devices pop onto the map */}
          {MAP_ICONS.map(([c, kind], i) => {
            const a = T.icons + i * 0.17;
            const k = backOut((t - a) / 0.4);
            if (t < a) return null;
            const [x, y] = pr.city(c);
            const bob = Math.sin(tt * 2.2 + i) * 6;
            return (
              <g key={c} transform={`translate(${x + (i % 2 ? 40 : -40) * v.s} ${y - 70 * v.s + bob}) scale(${0.5 * v.s * k})`}>
                <Badge r={78}><Dev kind={kind} /></Badge>
              </g>
            );
          })}
          {/* accumulation around the map */}
          {ACC.map((p, i) => {
            const u = (t - p.t0) / 0.55;
            if (u <= 0) return null;
            const e = easeOut(u);
            const R = lerp(900, 0, e);
            const x = v.cx + p.ox * v.s + Math.cos(p.from) * R, y = v.cy + p.oy * v.s + Math.sin(p.from) * R;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${p.rot + (1 - e) * 220}) scale(${p.s * v.s})`}><Dev kind={p.kind} /></g>
            );
          })}
          {/* the pile over the south of the map (final beat) */}
          {mp > 0 && (
            <g transform={`translate(${px} ${py}) scale(${v.s})`}>
              <ellipse cx={0} cy={26} rx={280} ry={34} fill="#000" opacity={0.16} />
              {MAP_PILE.slice(0, shownMap).map((p, i) => {
                const isTop = i === MAP_PILE.length - 1;
                if (isTop && t >= 10) return null;
                const drop = i >= 26 ? 1 - easeOut((mp * (MAP_PILE.length + 3) - i) / 3) : 0;
                return (
                  <g key={i} transform={`translate(${p.x} ${p.y - (isTop ? 40 : 0) - drop * 160}) rotate(${isTop ? 0 : p.rot}) scale(${isTop ? 0.62 : p.s})`}>
                    <Dev kind={isTop ? "phone" : p.kind} />
                  </g>
                );
              })}
            </g>
          )}
        </g>
        {/* skyline */}
        {skyOff < 1390 && <g filter={Math.abs(skyOff) > 2 ? "url(#bwVBlur)" : undefined}><Skyline t={tt} off={skyOff} /></g>}
      </g>
            <Counter t={t} />
      <PerPerson t={t} />
      {/* question */}
      {t > T.q && (
        <g opacity={1 - push}>
          <g transform={`translate(${heroX} ${heroY - 170 * v.s}) scale(${backOut((t - T.q) / 0.45)})`}>
            <circle r={70} fill={C.ink} />
            <text y={34} textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={100} fill="#fff">?</text>
          </g>
          <g transform={`translate(540 ${360 + (1 - easeOut((t - T.q - 0.15) / 0.4)) * 30})`} opacity={ramp(t, T.q + 0.15, 0.3)}>
            <text textAnchor="middle" fontFamily={HEAD} fontWeight={800} fontSize={88} fill={C.ink}>এগুলো যাচ্ছে <tspan fill={C.green}>কোথায়?</tspan></text>
          </g>
        </g>
      )}
    </g>
  );
};
