import React from "react";
import { clamp, lerp, noise, rand } from "./lib";
import { INK, Person, Who, Face } from "./chars";

// Painted sets for "তুই নেই". Each set keeps one spatial layout for every visit.
// Perspective sets (corridor, stairs) project world points (cm) with a pinhole camera so the camera can travel.

export type Cam = { x: number; y: number; z: number };
export const CAM0: Cam = { x: 0, y: 0, z: 1 };
/** parallax layer: depth d = 0 far .. 1 subject plane .. >1 foreground */
export const Lay: React.FC<{ cam: Cam; d: number; children: React.ReactNode }> = ({ cam, d, children }) => (
  <g transform={`translate(960 540) scale(${1 + (cam.z - 1) * d}) translate(${-960 - cam.x * d} ${-540 - cam.y * d})`}>{children}</g>
);

const Steam: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.5}>
    {[0, 1].map((i) => {
      const ph = t * 0.9 + i * 0.5;
      return <path key={i} d={`M${i * 6} 0 C${-10 + Math.sin(ph * 3) * 8} -20 ${12 + Math.sin(ph * 2.3) * 8} -40 ${Math.sin(ph * 2) * 10} -64`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.55 - i * 0.2} />;
    })}
  </g>
);
export const TeaGlass: React.FC<{ x: number; y: number; s?: number; t: number; steam?: boolean; level?: number }> = ({ x, y, s = 1, t, steam = true, level = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={2} rx={22} ry={5} fill="#000" opacity={0.15} />
    <path d="M-17 -48 L-14 0 H14 L17 -48 Z" fill="#E8EEF0" opacity={0.55} stroke="#8E9A9E" strokeWidth={2} />
    <path d={`M${-16 + (1 - level) * 1.5} ${-44 + (1 - level) * 40} L-14 0 H14 L${16 - (1 - level) * 1.5} ${-44 + (1 - level) * 40} Z`} fill="#B5642A" opacity={0.9} />
    <ellipse cx={0} cy={-44 + (1 - level) * 40} rx={15.5} ry={3} fill="#E9C9A0" />
    <path d="M-12 -44 L-10 -6" stroke="#fff" strokeWidth={3} opacity={0.6} />
    {steam && level > 0.5 && <Steam x={0} y={-50} t={t + x * 0.01} s={0.6} />}
  </g>
);

// ============================================================ CANTEEN (front view; group at the long table)
export const Canteen: React.FC<{ t: number; cam: Cam; sixth?: boolean; children?: React.ReactNode; fg?: React.ReactNode; dusk?: number }> = ({ t, cam, sixth = true, children, fg }) => (
  <g>
    <Lay cam={cam} d={0.55}>
      <defs>
        <linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EFE5CF" /><stop offset="1" stopColor="#DFD1B3" /></linearGradient>
        <linearGradient id="cOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF3DC" /><stop offset="0.55" stopColor="#E7EBC9" /><stop offset="1" stopColor="#9DBA84" /></linearGradient>
        <linearGradient id="cShaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF6DE" stopOpacity={0.55} /><stop offset="1" stopColor="#FFF6DE" stopOpacity={0} /></linearGradient>
      </defs>
      <rect x={-600} y={-300} width={3120} height={1100} fill="url(#cWall)" />
      {[[300, 260, 160], [1500, 380, 120], [880, 140, 90]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#C9B793" opacity={0.18} />)}
      <rect x={-600} y={600} width={3120} height={300} fill="#8FAE98" />
      <rect x={-600} y={596} width={3120} height={10} fill="#6D8D77" />
      <rect x={-600} y={880} width={3120} height={400} fill="#B6A487" />
      {/* window with grill */}
      <rect x={110} y={150} width={430} height={420} fill="url(#cOut)" />
      {[[170, 470, 70], [260, 430, 90], [420, 460, 80], [500, 500, 60]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t * 0.8 + i) * 3} cy={y} r={r} fill={i % 2 ? "#7FA36E" : "#93B57C"} />)}
      <g stroke="#2F4238" strokeWidth={6}>{Array.from({ length: 10 }).map((_, i) => <line key={i} x1={150 + i * 40} y1={160} x2={150 + i * 40} y2={560} />)}
        <line x1={120} y1={360} x2={530} y2={360} /><line x1={120} y1={250} x2={530} y2={250} /></g>
      <rect x={110} y={150} width={430} height={420} fill="none" stroke="#3E5B4C" strokeWidth={20} />
      <rect x={96} y={566} width={458} height={22} fill="#C9BDA2" stroke={INK} strokeWidth={3} />
      {/* wiring, switchboard, clock, a poster of shapes */}
      <path d="M560 120 H1380 V330" fill="none" stroke="#6C6152" strokeWidth={4} />
      <rect x={1360} y={330} width={44} height={60} rx={4} fill="#EDE6D6" stroke="#6C6152" strokeWidth={3} />
      <g transform="translate(1240 230)"><circle r={46} fill="#F6F1E6" stroke={INK} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-30} stroke={INK} strokeWidth={4} transform={`rotate(${t * 6})`} /><line x1={0} y1={0} x2={22} y2={0} stroke={INK} strokeWidth={4} transform={`rotate(${120 + t * 0.5})`} /></g>
      <g transform="translate(760 200)"><rect width={190} height={250} fill="#E7D3A8" stroke={INK} strokeWidth={3} /><circle cx={95} cy={100} r={56} fill="#C0583A" opacity={0.85} /><rect x={30} y={180} width={130} height={14} fill="#3E5B4C" /><rect x={30} y={204} width={90} height={10} fill="#3E5B4C" opacity={0.6} /></g>
      {/* tea counter */}
      <rect x={1440} y={520} width={520} height={360} fill="#7A4B30" stroke={INK} strokeWidth={4} />
      <rect x={1430} y={500} width={540} height={30} fill="#A8754F" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${1500 + i * 70} 500)`}><rect x={-26} y={-96} width={52} height={96} rx={10} fill="#E7EEF0" opacity={0.6} stroke="#7F8B8E" strokeWidth={3} /><rect x={-22} y={-60} width={44} height={56} rx={6} fill={["#D8A24A", "#B35B3A", "#E3C27A"][i]} /><rect x={-28} y={-106} width={56} height={14} rx={4} fill="#C64A3A" /></g>)}
      <g transform="translate(1800 500)"><rect x={-60} y={-20} width={120} height={20} fill="#3A3A3A" /><path d="M-46 -20 C-50 -90 50 -90 46 -20 Z" fill="#B9BAB4" stroke={INK} strokeWidth={4} /><path d="M46 -60 Q90 -70 96 -40" fill="none" stroke="#9A9B95" strokeWidth={10} />
        <Steam x={60} y={-60} t={t} s={1.2} /><ellipse cx={0} cy={-6} rx={30} ry={5} fill="#4A7FD0" opacity={0.5 + Math.sin(t * 20) * 0.2} /></g>
      {Array.from({ length: 6 }).map((_, i) => <TeaGlass key={i} x={1700 + (i % 3) * 30} y={498 - Math.floor(i / 3) * 44} s={0.8} t={t} steam={false} />)}
      {/* light shafts from the window */}
      <path d="M540 170 L1180 1000 L760 1000 L540 560 Z" fill="url(#cShaft)" opacity={0.6 + Math.sin(t * 0.7) * 0.08} />
      {/* ceiling fan */}
      <g transform="translate(1000 30)"><rect x={-4} y={-60} width={8} height={70} fill="#5A5A55" /><ellipse cx={0} cy={14} rx={230} ry={20} fill="#6B6A62" opacity={0.18} />
        {[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={14} rx={210} ry={9} fill="#6B6A62" opacity={0.25} transform={`rotate(${(a + t * 900) % 360 * 0.02} 0 14)`} />)}
        <circle cx={0} cy={14} r={20} fill="#55544E" /></g>
    </Lay>
    <Lay cam={cam} d={0.8}>
      {/* a canteen boy and students at the counter, softer */}
      <g opacity={0.92}>
        <Person who="extra" x={1560} y={900} s={0.42} f={{ yaw: -0.4 }} l={[-120, -560]} r={[110, -500]} legs="hidden" />
        <Person who="extra" x={1300} y={900} s={0.44} f={{ yaw: 0.6 }} legs="hidden" bodyYaw={0.5} />
      </g>
    </Lay>
    <Lay cam={cam} d={1}>
      {children}
      {/* long worn table */}
      <path d="M180 806 H1740 L1820 880 H100 Z" fill="#8F5E3D" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${200 + i * 170} ${812 + (i % 3) * 18} q60 ${4 + (i % 2) * 6} ${110 + (i % 4) * 20} 2`} fill="none" stroke="#B88762" strokeWidth={2.5} opacity={0.7} />)}
      <rect x={100} y={880} width={1720} height={36} fill="#6E4329" stroke={INK} strokeWidth={4} />
      {/* under the table: shadow, legs, the near bench */}
      <rect x={-400} y={916} width={2800} height={200} fill="#4A3324" />
      <rect x={-400} y={916} width={2800} height={40} fill="#2E2018" opacity={0.6} />
      {[160, 1760].map((x) => <rect key={x} x={x} y={916} width={34} height={170} fill="#5B3823" stroke={INK} strokeWidth={3} />)}
      {[[520, 842], [700, 836], [930, 846], [1180, 838], [1400, 848]].map(([x, y], i) => <TeaGlass key={i} x={x} y={y} t={t} s={0.95} level={i === 2 ? 0.45 : 0.9} />)}
      {sixth && <TeaGlass x={1640} y={846} t={t} s={0.95} level={1} />}
      {[[600, 860], [1300, 862]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y} rx={46} ry={10} fill="#E8E2D2" stroke={INK} strokeWidth={2} />{[0, 1, 2].map((k) => <circle key={k} cx={x - 20 + k * 20} cy={y - 6} r={9} fill="#D9A55A" stroke="#8B5A2B" strokeWidth={2} />)}</g>)}
    </Lay>
    <Lay cam={cam} d={1.25}>
      <rect x={-200} y={1000} width={2400} height={60} fill="#5B3823" stroke={INK} strokeWidth={4} />
      {fg}
    </Lay>
  </g>
);

// ============================================================ perspective helper
export const F = 900;
export const VP = { x: 960, y: 420 };
export const proj = (X: number, Y: number, Z: number, vp = VP): [number, number, number] => {
  const z = Math.max(Z, 5);
  return [vp.x + (X * F) / z, vp.y + (Y * F) / z, F / z];
};
/** a person standing at world (X, Z) on a floor at height floorY (cm below eye) */
export const PersonAt: React.FC<{ X: number; Z: number; floorY?: number; who: Who; f?: Face; vp?: typeof VP } & Partial<React.ComponentProps<typeof Person>>> = (p) => {
  const [x, y, k] = proj(p.X, p.floorY ?? 150, p.Z, p.vp);
  return <Person {...(p as any)} x={x} y={y} s={(170 / 925) * k} />;
};

// ============================================================ CORRIDOR (one-point, travelling)
const quad = (a: [number, number, number], b: [number, number, number], c: [number, number, number], d: [number, number, number]) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} Z`;
export const Corridor: React.FC<{ t: number; travel: number; vp?: typeof VP; children?: React.ReactNode; warm?: number; dusk?: number }> = ({ t, travel, vp = VP, children, dusk = 0 }) => {
  const P = (X: number, Y: number, Z: number) => proj(X, Y, Z, vp);
  const HW = 230, FL = 150, CE = -220, FAR = 4200;
  const items: React.ReactNode[] = [];
  // pillars + arches on the right (open to the garden), doors and noticeboards on the left
  for (let i = 0; i < 16; i++) {
    const Z = ((i * 380 - travel) % (16 * 380) + 16 * 380) % (16 * 380) + 60;
    if (Z > FAR) continue;
    const fade = clamp((FAR - Z) / 1200);
    const a = P(HW, CE, Z), b = P(HW + 40, FL, Z), w = (36 * F) / Z;
    items.push(<g key={`p${i}`} opacity={fade} data-z={Z}>
      <rect x={a[0]} y={a[1]} width={w} height={b[1] - a[1]} fill="#E6DCC6" stroke={INK} strokeWidth={Math.max(1, 3 * (F / Z) / 4)} />
      <rect x={a[0] + w * 0.75} y={a[1]} width={w * 0.25} height={b[1] - a[1]} fill="#C8B998" />
    </g>);
    // light patch on the floor between pillars
    const l1 = P(HW, FL, Z + 120), l2 = P(HW, FL, Z + 300), l3 = P(-40, FL, Z + 360), l4 = P(-40, FL, Z + 180);
    items.push(<path key={`l${i}`} d={`M${l1[0]} ${l1[1]} L${l2[0]} ${l2[1]} L${l3[0]} ${l3[1]} L${l4[0]} ${l4[1]} Z`} fill="#FFF3D2" opacity={0.42 * fade * (1 - dusk)} />);
    if (i % 2 === 0) {
      const d1 = P(-HW, -70, Z + 60), d2 = P(-HW, FL, Z + 200);
      items.push(<path key={`d${i}`} d={quad(d1, P(-HW, -70, Z + 200), d2, P(-HW, FL, Z + 60))} fill="#6F4E37" stroke={INK} strokeWidth={Math.max(1, (2 * F) / Z / 4)} opacity={fade} />);
    } else {
      const n1 = P(-HW, -40, Z + 40), n2 = P(-HW, -40, Z + 260), n3 = P(-HW, 50, Z + 260), n4 = P(-HW, 50, Z + 40);
      items.push(<g key={`n${i}`} opacity={fade}><path d={quad(n1, n2, n3, n4)} fill="#B98F5E" stroke={INK} strokeWidth={Math.max(1, (2 * F) / Z / 4)} />
        {[0, 1, 2, 3, 4].map((k) => {
          const zz = Z + 60 + k * 40, yy = -30 + (k % 2) * 30, pa = P(-HW, yy, zz), pb = P(-HW, yy + 28, zz + 30);
          return <rect key={k} x={Math.min(pa[0], pb[0])} y={pa[1]} width={Math.abs(pb[0] - pa[0]) + 1} height={pb[1] - pa[1]} fill={["#F4F1E8", "#F2D98C", "#CFE3D8", "#F4F1E8", "#E9B8A4"][k]} />;
        })}</g>);
    }
  }
  const z0 = 40;
  const fl = [P(-HW, FL, z0), P(HW, FL, z0), P(HW, FL, FAR), P(-HW, FL, FAR)];
  const wl = [P(-HW, CE, z0), P(-HW, CE, FAR), P(-HW, FL, FAR), P(-HW, FL, z0)];
  const ce = [P(-HW, CE, z0), P(HW, CE, z0), P(HW, CE, FAR), P(-HW, CE, FAR)];
  const garden = [P(HW, CE, z0), P(HW, CE, FAR), P(HW, FL, FAR), P(HW, FL, z0)];
  return (
    <g>
      <defs>
        <linearGradient id="kGarden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={dusk ? "#E9B98A" : "#F5F0D8"} /><stop offset="0.5" stopColor="#B8CD92" /><stop offset="1" stopColor="#7E9F5C" /></linearGradient>
        <linearGradient id="kFloor" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#C9BBA0" /><stop offset="1" stopColor="#B3A486" /></linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="#D9CCB0" />
      <path d={quad(garden[0], garden[1], garden[2], garden[3])} fill="url(#kGarden)" />
      {Array.from({ length: 10 }).map((_, i) => { const Z = 300 + i * 420, a = P(HW + 260, -60, Z); return <circle key={i} cx={a[0]} cy={a[1]} r={(220 * F) / Z} fill={i % 2 ? "#7FA36E" : "#93B57C"} opacity={0.9} />; })}
      <path d={quad(ce[0], ce[1], ce[2], ce[3])} fill="#EEE6D3" />
      <path d={quad(wl[0], wl[1], wl[2], wl[3])} fill="#E3D7BC" />
      {(() => { const a = P(-HW, 20, z0), b = P(-HW, 20, FAR), c = P(-HW, FL, FAR), d = P(-HW, FL, z0); return <path d={quad(a, b, c, d)} fill="#8FAE98" />; })()}
      <path d={quad(fl[0], fl[1], fl[2], fl[3])} fill="url(#kFloor)" />
      {Array.from({ length: 14 }).map((_, i) => { const Z = ((i * 300 - travel) % 4200 + 4200) % 4200 + 40, a = P(-HW, FL, Z), b = P(HW, FL, Z); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#A99878" strokeWidth={1.5} opacity={0.5} />; })}
      {(() => { const a = P(-HW * 0.6, CE, z0), b = P(-HW * 0.6, CE, FAR); return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />; })()}
      {items.reverse()}
      {children}
      {dusk > 0 && <rect width={1920} height={1080} fill="#E59A5A" opacity={dusk * 0.18} />}
    </g>
  );
};

// ============================================================ STAIRS (camera on the landing, looking down the flight)
export const STAIR_VP = { x: 900, y: 300 };
export const stepAt = (k: number) => ({ Z: 150 + k * 30, Y: 150 + k * 17 });
export const Stairs: React.FC<{ t: number; children?: React.ReactNode; fg?: React.ReactNode; warm?: number; below?: React.ReactNode }> = ({ t, children, fg, below }) => {
  const vp = STAIR_VP;
  const P = (X: number, Y: number, Z: number) => proj(X, Y, Z, vp);
  const HW = 150;
  const steps = Array.from({ length: 22 }).map((_, k) => {
    const { Z, Y } = stepAt(k);
    const a = P(-HW, Y, Z), b = P(HW, Y, Z), c = P(HW, Y, Z + 30), d = P(-HW, Y, Z + 30);
    const r1 = P(-HW, Y + 17, Z + 30), r2 = P(HW, Y + 17, Z + 30);
    return <g key={k}>
      <path d={quad(a, b, c, d)} fill={k % 2 ? "#D4CBB9" : "#CEC4B1"} />
      <path d={`M${d[0]} ${d[1]} L${c[0]} ${c[1]} L${r2[0]} ${r2[1]} L${r1[0]} ${r1[1]} Z`} fill="#A79C88" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8D8270" strokeWidth={Math.max(1, (2 * F) / Z / 3)} />
    </g>;
  });
  const lw = [P(-HW, -260, 100), P(-HW, -260, 900), P(-HW, 150 + 22 * 17, 900), P(-HW, 150, 100)];
  const rw = [P(HW, -260, 100), P(HW, -260, 900), P(HW, 150 + 22 * 17, 900), P(HW, 150, 100)];
  const bottom = P(0, 150 + 22 * 17, 810);
  return (
    <g>
      <rect width={1920} height={1080} fill="#E7DDC9" />
      {/* the lobby below, bright through the open stairwell */}
      <rect x={bottom[0] - 600} y={bottom[1] - 340} width={1200} height={400} fill="#F3E9CF" />
      <rect x={bottom[0] - 600} y={bottom[1] - 40} width={1200} height={200} fill="#CDBE9F" />
      <rect x={bottom[0] - 250} y={bottom[1] - 300} width={500} height={260} fill="#BFD6A4" opacity={0.8} />
      {below}
      <path d={quad(lw[0], lw[1], lw[2], lw[3])} fill="#DCCFB4" />
      <path d={quad(rw[0], rw[1], rw[2], rw[3])} fill="#D3C5A8" />
      {(() => { const a = P(HW, 60, 100), b = P(HW, 60 + 22 * 17, 900), c = P(HW, 150 + 22 * 17, 900), d = P(HW, 150, 100); return <path d={quad(a, b, c, d)} fill="#8FAE98" opacity={0.9} />; })()}
      {steps}
      {/* window light on the right wall */}
      {(() => { const a = P(HW, -180, 260), b = P(HW, -180, 420), c = P(HW, 20, 420), d = P(HW, 20, 260); return <path d={quad(a, b, c, d)} fill="#FFF7E0" opacity={0.85} />; })()}
      {children}
      {/* the handrail in the foreground (left), running down with the flight */}
      {(() => {
        const r0 = P(-HW + 30, 60, 60), r1 = P(-HW + 30, 60 + 20 * 17, 780);
        return <g>
          {Array.from({ length: 8 }).map((_, i) => { const z = 70 + i * 90, y = 60 + ((z - 150) / 30) * 17, a = P(-HW + 30, y, z), b = P(-HW + 30, y + 100, z); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#3B3F44" strokeWidth={(5 * F) / z / 2.2} />; })}
          <path d={`M${r0[0]} ${r0[1]} L${r1[0]} ${r1[1]}`} stroke="#2F3237" strokeWidth={26} strokeLinecap="round" />
          <path d={`M${r0[0]} ${r0[1] - 8} L${r1[0]} ${r1[1] - 3}`} stroke="#6C7178" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
        </g>;
      })()}
      {fg}
    </g>
  );
};

// ============================================================ FIELD + STEPS (late afternoon)
export const Field: React.FC<{ t: number; cam: Cam; sun?: number; children?: React.ReactNode; fg?: React.ReactNode; dusk?: number; cricket?: boolean }> = ({ t, cam, children, fg, dusk = 0, cricket = true }) => (
  <g>
    <defs>
      <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={lerpC("#BFD9E2", "#3E4A6E", dusk)} /><stop offset="0.7" stopColor={lerpC("#F4DDB0", "#D9825A", dusk)} /><stop offset="1" stopColor={lerpC("#F6C98D", "#E58C55", dusk)} />
      </linearGradient>
      <linearGradient id="fGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={lerpC("#A9B868", "#5F6A45", dusk)} /><stop offset="1" stopColor={lerpC("#7B9645", "#3F4E2E", dusk)} /></linearGradient>
      <radialGradient id="fSun"><stop offset="0" stopColor="#FFF3C9" /><stop offset="0.4" stopColor="#FFD58A" stopOpacity={0.7} /><stop offset="1" stopColor="#FFC27A" stopOpacity={0} /></radialGradient>
    </defs>
    <Lay cam={cam} d={0.15}>
      <rect x={-800} y={-400} width={3600} height={1000} fill="url(#fSky)" />
      <circle cx={420} cy={lerp(400, 520, dusk)} r={260} fill="url(#fSun)" />
      <circle cx={420} cy={lerp(400, 520, dusk)} r={46} fill="#FFF1C8" opacity={1 - dusk * 0.6} />
    </Lay>
    <Lay cam={cam} d={0.35}>
      {/* the red-brick academic building and a tree line */}
      <g fill={lerpC("#B0634A", "#5E3A33", dusk)}><rect x={-300} y={330} width={620} height={230} /><rect x={-120} y={290} width={260} height={60} /></g>
      {Array.from({ length: 12 }).map((_, i) => <g key={i} fill={lerpC("#B0634A", "#5E3A33", dusk)}><rect x={-280 + (i % 6) * 100} y={360 + Math.floor(i / 6) * 90} width={50} height={56} fill={dusk > 0.4 ? "#F2C46E" : "#F2E6D0"} opacity={0.85} /></g>)}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 300 + i * 120 + (rand(i) - 0.5) * 60, r = 70 + rand(i * 3) * 50;
        return <g key={i}><rect x={x - 6} y={520} width={12} height={60} fill="#5A4636" />
          <circle cx={x} cy={500 - r * 0.3} r={r} fill={lerpC(i % 3 ? "#6F8F4E" : "#5E7D44", "#2F3A2A", dusk)} />
          {i % 5 === 2 && Array.from({ length: 6 }).map((_, k) => <circle key={k} cx={x + Math.cos(k) * r * 0.6} cy={500 - r * 0.3 + Math.sin(k * 1.7) * r * 0.5} r={14} fill="#D9452F" opacity={0.85} />)}
        </g>;
      })}
    </Lay>
    <Lay cam={cam} d={0.55}>
      <rect x={-800} y={560} width={3600} height={700} fill="url(#fGrass)" />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-800} y={580 + i * 40 + i * i * 4} width={3600} height={18 + i * 4} fill="#fff" opacity={0.05} />)}
      {/* the cricket game far out */}
      {cricket && <g>
        <rect x={980} y={640} width={140} height={12} fill="#D9C79A" opacity={0.8} />
        {[984, 1112].map((x) => <g key={x}>{[0, 6, 12].map((d) => <line key={d} x1={x + d - 6} y1={622} x2={x + d - 6} y2={644} stroke="#F1E9D6" strokeWidth={2.5} />)}</g>)}
        {[[960, 650, 0.12, "extra"], [1130, 652, 0.12, "extra"], [1300, 690, 0.14, "extra"], [820, 700, 0.15, "extra"], [1500, 640, 0.11, "extra"]].map(([x, y, s, w], i) => (
          <Person key={i} who={w as Who} x={(x as number) + Math.sin(t * 0.7 + i) * 12} y={y as number} s={s as number} legs="stride" phase={t * 3 + i} f={{ yaw: i % 2 ? 0.5 : -0.5 }} />
        ))}
        {(() => { const p = (t * 0.45) % 1; return <circle cx={1112 - p * 128} cy={636 - Math.sin(p * Math.PI) * 30} r={3} fill="#A3262A" />; })()}
      </g>}
    </Lay>
    <Lay cam={cam} d={1}>
      {children}
    </Lay>
    <Lay cam={cam} d={1.2}>
      {fg}
    </Lay>
    {dusk > 0 && <rect width={1920} height={1080} fill="#2A2350" opacity={dusk * 0.25} />}
  </g>
);
/** concrete gallery steps beside the field (draw inside Field's subject layer) */
export const Steps: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={-1400} y={740 + i * 90} width={4800} height={34} fill="#D8CFBF" stroke="#8D8270" strokeWidth={3} />
        <rect x={-1400} y={774 + i * 90} width={4800} height={56} fill="#B9AE9A" />
        <rect x={-1400} y={774 + i * 90} width={4800} height={6} fill="#8D8270" opacity={0.5} />
      </g>
    ))}
  </g>
);

const lerpC = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, "0")).join("");
};

// ============================================================ STREET with the signal and hanging wires
export const Street: React.FC<{ t: number; cam: Cam; light: "red" | "green"; children?: React.ReactNode; fg?: React.ReactNode; flow?: number }> = ({ t, cam, light, children, fg, flow = 0 }) => (
  <g>
    <defs><linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E7D3B4" /><stop offset="1" stopColor="#F2E2C4" /></linearGradient></defs>
    <Lay cam={cam} d={0.3}>
      <rect x={-800} y={-400} width={3600} height={1200} fill="url(#sSky)" />
      {Array.from({ length: 14 }).map((_, i) => {
        const x = -400 + i * 220, h = 300 + rand(i * 2.7) * 260;
        return <g key={i}><rect x={x} y={640 - h} width={200} height={h} fill={["#C9B08E", "#B79C80", "#D3BFA0", "#A88E76"][i % 4]} stroke="#8C735C" strokeWidth={3} />
          {Array.from({ length: Math.floor(h / 70) }).map((_, r) => <rect key={r} x={x + 24} y={640 - h + 24 + r * 70} width={150} height={36} fill="#7C6A5A" opacity={0.5} />)}
          <rect x={x + 10} y={560} width={180} height={34} fill={["#2F6F73", "#C0583A", "#D8A24A", "#5A7FA8"][i % 4]} /></g>;
      })}
    </Lay>
    <Lay cam={cam} d={0.6}>
      <rect x={-800} y={640} width={3600} height={500} fill="#8E8778" />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-600 + i * 330} y={800} width={180} height={26} fill="#F1EDE4" opacity={0.85} />)}
      {/* signal pole */}
      <g transform="translate(1500 640)"><rect x={-10} y={-420} width={20} height={420} fill="#3B3F44" />
        <rect x={-40} y={-520} width={80} height={170} rx={12} fill="#22262A" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={-488} r={24} fill={light === "red" ? "#FF4636" : "#5A2622"} />
        <circle cx={0} cy={-412} r={24} fill={light === "green" ? "#3EE27A" : "#1E4A30"} />
        <circle cx={0} cy={light === "red" ? -488 : -412} r={70} fill={light === "red" ? "#FF4636" : "#3EE27A"} opacity={0.2} /></g>
      {/* the hanging, dusty wires */}
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M-600 ${150 + i * 18} Q${600 + i * 40} ${330 + i * 22 + Math.sin(t * 0.8 + i) * 4} 2600 ${120 + i * 14}`} fill="none" stroke="#2A2622" strokeWidth={3} opacity={0.75} />)}
      <path d="M1100 300 q30 50 -10 90 q-40 40 20 70" fill="none" stroke="#2A2622" strokeWidth={4} />
      {/* traffic: CNG and buses passing */}
      {[0, 1].map((i) => { const x = ((t * (flow ? 260 : 40) + i * 900) % 2600) - 500; return <g key={i} transform={`translate(${x} ${700 + i * 20})`}><rect x={0} y={-80} width={i ? 360 : 150} height={80} rx={16} fill={i ? "#C64A3A" : "#3F8F4E"} stroke={INK} strokeWidth={4} /><rect x={20} y={-66} width={i ? 300 : 70} height={30} fill="#BFD6E0" opacity={0.8} /><circle cx={30} cy={2} r={16} fill={INK} /><circle cx={i ? 320 : 120} cy={2} r={16} fill={INK} /></g>; })}
    </Lay>
    <Lay cam={cam} d={1}>{children}</Lay>
    <Lay cam={cam} d={1.25}>{fg}</Lay>
    <rect width={1920} height={1080} fill="#E8C99A" opacity={0.16} />
  </g>
);

/** a rickshaw seen from behind its seat (passengers' backs) or from the front */
export const Rickshaw: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-220, 220].map((cx) => <g key={cx}><circle cx={cx} cy={-60} r={60} fill="none" stroke={INK} strokeWidth={10} />{[0, 1, 2, 3].map((k) => <line key={k} x1={cx} y1={-60} x2={cx + Math.cos(t * 3 + k * 0.8) * 58} y2={-60 + Math.sin(t * 3 + k * 0.8) * 58} stroke={INK} strokeWidth={3} />)}</g>)}
    <path d="M-260 -140 H260 L240 -60 H-240 Z" fill="#2F6F73" stroke={INK} strokeWidth={6} />
    <path d="M-250 -140 C-250 -420 250 -420 250 -140 Z" fill="#C0583A" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={-180 + i * 60} cy={-290 + Math.abs(i - 3) * 16} r={14} fill={["#F2D98C", "#3F8F4E", "#F4F1E8"][i % 3]} stroke={INK} strokeWidth={3} />)}
  </g>
);

// ============================================================ NIGHT: hall veranda + the room
export const Veranda: React.FC<{ t: number; cam: Cam; children?: React.ReactNode; fg?: React.ReactNode }> = ({ t, cam, children, fg }) => (
  <g>
    <defs>
      <linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141B33" /><stop offset="1" stopColor="#2D3655" /></linearGradient>
      <radialGradient id="vMoon"><stop offset="0" stopColor="#FFF6DA" /><stop offset="0.3" stopColor="#FFF0C0" stopOpacity={0.5} /><stop offset="1" stopColor="#FFF0C0" stopOpacity={0} /></radialGradient>
      <radialGradient id="vBulb"><stop offset="0" stopColor="#FFD58A" stopOpacity={0.55} /><stop offset="1" stopColor="#FFD58A" stopOpacity={0} /></radialGradient>
    </defs>
    <Lay cam={cam} d={0.1}>
      <rect x={-800} y={-400} width={3600} height={1300} fill="url(#vSky)" />
      {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={-400 + rand(i) * 2800} cy={-200 + rand(i * 7) * 700} r={1 + rand(i * 3) * 1.8} fill="#fff" opacity={0.4 + 0.4 * Math.abs(Math.sin(t * (0.5 + rand(i)) + i))} />)}
      <circle cx={1380} cy={210} r={180} fill="url(#vMoon)" /><circle cx={1380} cy={210} r={44} fill="#FFF4D6" />
    </Lay>
    <Lay cam={cam} d={0.4}>
      {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={-200 + i * 330} cy={700 - (i % 3) * 30} r={190} fill="#18211C" />)}
      <rect x={1500} y={380} width={500} height={420} fill="#262B3A" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={1530 + (i % 4) * 110} y={410 + Math.floor(i / 4) * 120} width={60} height={70} fill={rand(i * 5) > 0.4 ? "#F2C46E" : "#3A4054"} opacity={0.9} />)}
    </Lay>
    <Lay cam={cam} d={0.85}>
      {/* the veranda: ceiling, back wall with the lit door, floor */}
      <rect x={-600} y={-300} width={3200} height={260} fill="#3A3A44" />
      <rect x={-600} y={-50} width={700} height={1200} fill="#5A5560" />
      <rect x={-120} y={60} width={260} height={560} fill="#F2C46E" opacity={0.9} />
      <rect x={-120} y={60} width={260} height={560} fill="none" stroke="#2A2630" strokeWidth={14} />
      <rect x={-600} y={760} width={3200} height={500} fill="#4A4650" />
      <circle cx={300} cy={-20} r={240} fill="url(#vBulb)" /><circle cx={300} cy={-26} r={14} fill="#FFE7B0" />
    </Lay>
    <Lay cam={cam} d={1}>{children}</Lay>
    <Lay cam={cam} d={1.2}>
      {/* railing with balusters */}
      <rect x={-600} y={820} width={3200} height={26} fill="#6B6670" stroke="#1F1D24" strokeWidth={4} />
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={-560 + i * 110} y={846} width={22} height={260} fill="#5E5964" stroke="#1F1D24" strokeWidth={3} />)}
      {fg}
    </Lay>
    <rect width={1920} height={1080} fill="#2A3460" opacity={0.18} />
  </g>
);

export const Room: React.FC<{ t: number; cam: Cam; warm?: number; children?: React.ReactNode; fg?: React.ReactNode }> = ({ t, cam, warm = 0, children, fg }) => (
  <g>
    <Lay cam={cam} d={0.6}>
      <rect x={-600} y={-300} width={3200} height={1500} fill={warm ? "#C98F5C" : "#6E7A86"} />
      <rect x={-600} y={760} width={3200} height={500} fill={warm ? "#8C5B3C" : "#4B5560"} />
      {/* window with the night outside, clothes line, a calendar of shapes, shelf of books */}
      <rect x={1240} y={180} width={420} height={360} fill="#1C2440" stroke="#2A2630" strokeWidth={16} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={1240 + i * 105} y1={180} x2={1240 + i * 105} y2={540} stroke="#2A2630" strokeWidth={6} />)}
      <path d="M100 160 Q700 230 1200 150" fill="none" stroke="#2A2630" strokeWidth={3} />
      {[[260, "#B5573B"], [520, "#8FA584"], [820, "#EFE6D2"]].map(([x, c], i) => <path key={i} d={`M${x} ${180 + i * 12} l-50 10 l14 120 h72 l14 -120 Z`} fill={c as string} stroke="#2A2630" strokeWidth={3} />)}
      <rect x={200} y={480} width={420} height={18} fill="#6B4A33" />{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={210 + i * 32} y={400 + (i % 3) * 8} width={26} height={80 - (i % 3) * 8} fill={["#C0583A", "#2F6F73", "#D8A24A", "#F1E9D6"][i % 4]} stroke="#2A2630" strokeWidth={2} />)}
      {/* fairy lights */}
      {Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={80 + i * 100} cy={110 + Math.sin(i * 0.9) * 16} r={7} fill="#FFD58A" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 1.4 + i))} />)}
    </Lay>
    <Lay cam={cam} d={1}>
      {/* bed / couch with a checked spread: the back behind the friends, the seat in front of their legs */}
      <rect x={160} y={600} width={1500} height={180} rx={30} fill={warm ? "#8A3F32" : "#52637F"} stroke={INK} strokeWidth={5} />
      {children}
      <rect x={120} y={830} width={1580} height={250} rx={36} fill={warm ? "#9C4A3A" : "#5C6E8C"} stroke={INK} strokeWidth={5} />
      {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={160 + i * 150} y1={830} x2={160 + i * 150} y2={1080} stroke="#fff" strokeWidth={4} opacity={0.15} />)}
    </Lay>
    <Lay cam={cam} d={1.2}>{fg}</Lay>
    <rect width={1920} height={1080} fill={warm ? "#FFB060" : "#3A4A70"} opacity={warm ? 0.12 : 0.15} />
  </g>
);

/** memory sets that only need a backdrop */
export const BusWindow: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#4F5E58" />
    <rect x={200} y={120} width={1520} height={560} rx={40} fill="#CFE0D8" />
    <g>{Array.from({ length: 14 }).map((_, i) => { const x = ((i * 260 - t * 700) % 3640 + 3640) % 3640 - 400; return <circle key={i} cx={x} cy={420 + (i % 3) * 40} r={110 + (i % 4) * 30} fill={i % 2 ? "#7FA36E" : "#93B57C"} opacity={0.8} />; })}</g>
    <rect x={200} y={120} width={1520} height={560} rx={40} fill="none" stroke="#2F3A38" strokeWidth={40} />
    <rect x={0} y={680} width={1920} height={400} fill="#3E4A47" />
    {children}
  </g>
);
export const Mist: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <g>
    <rect width={1920} height={1080} fill="#DDE6DA" />
    {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={200 + i * 220} cy={520 + (i % 2) * 60} r={220} fill="#B7C9AE" opacity={0.45} />)}
    <rect y={760} width={1920} height={320} fill="#9DB58A" />
    {Array.from({ length: 40 }).map((_, i) => <g key={i} transform={`translate(${rand(i) * 1920} ${800 + rand(i * 3) * 260})`}><circle r={8} fill="#fff" /><rect x={-2} y={0} width={4} height={10} fill="#E0782C" /></g>)}
    <rect width={1920} height={1080} fill="#fff" opacity={0.22 + Math.sin(t * 0.5) * 0.04} />
    {children}
  </g>
);

export { noise };
