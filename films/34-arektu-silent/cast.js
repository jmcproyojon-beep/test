// The cast of «আরেকটু থাকো» (all original). Values are print densities (0 = black, 1 = white).
// HIM — the projectionist: a flat cloth cap pushed back, dark waistcoat, white shirt with the sleeves rolled, dark trousers.
// HER — the pianist: a pale sari with a dark border (the pallu over the left shoulder), a dark blouse, a long plait.
import { form, stroke, catmull, grey, pathOf } from './engine/ink.js';
import { torsoPoint } from './engine/figure.js';
import { PROFILE_ADULT, FRONT_ADULT } from './engine/heads.js';
import { headShape, OTTO } from './chars.js';

const loop = (pts, n = 5) => catmull(pts, true, n);

// flat cap: crown + a short peak that points the way the face looks
const flatF = [[-.42, -.27], [-.45, -.4], [-.32, -.52], [0, -.56], [.32, -.52], [.45, -.4], [.42, -.27], [.2, -.3], [0, -.32], [-.2, -.3]];
const flatP = [[-.44, -.19], [-.47, -.35], [-.3, -.52], [0, -.57], [.28, -.51], [.42, -.38], [.62, -.29], [.6, -.24], [.38, -.26], [0, -.29]];
export const HIM = {
  ...OTTO, name: 'Him',
  skin: { v: .8 },
  arm: { v: .9, w: [.36, .31, .27], sleeve: .45, foreW: [.26, .19] },     // sleeves rolled to the elbow
  leg: { v: .2, w: [.54, .44, .38], folds: true, gap: 5 },
  shoe: { v: .1 },
  vest: { v: .17, shoulder: .6, bottom: .72 },
  skirt: null,                                                            // no apron
  collar(g, J, pr, s, lw) {
    const T = (xf, y, xs) => torsoPoint(J, pr, xf, y, xs);
    const c = pr.cy > -.3 ? loop([T(-.26, 2.33, -.22), T(-.04, 2.27, .16), T(0, 2.36, .22), T(.04, 2.27, .2), T(.26, 2.33, .24), T(.24, 2.5, .2), T(0, 2.46, -.03), T(-.24, 2.5, -.24)], 4)
      : loop([T(-.26, 2.33, -.22), T(.26, 2.33, .24), T(.24, 2.5, .2), T(-.24, 2.5, -.24)], 4);
    form(g, c, { v: .92, line: lw * .85, grad: .18, hatch: 0, seed: 243 });
  },
  head: {
    ...OTTO.head,
    hairMass: { v: .12, top: -.22, nape: .24, temple: .2 },
    beard(g, H) {       // a thin moustache
      const pts = headShape(H, [[-.16, .22], [-.04, .2], [0, .21], [.04, .2], [.16, .22], [.15, .26], [0, .245], [-.15, .26]],
        [[.22, .22], [.34, .19], [.4, .2], [.43, .21], [.44, .24], [.4, .245], [.33, .24], [.24, .26]]);
      form(g, loop(pts, 3), { v: .15, line: H.lw * .7, hatch: .3, seed: 451 });
    },
    hat(g, H) {
      const pts = loop(headShape(H, flatF, flatP, flatF), 5);
      form(g, pts, { v: .3, line: H.lw, grad: .22, hatch: .25, seed: 461, shade: { off: H.sc * .07, a: .16, hatch: .2, seed: 462 } });
      const seam = headShape(H, [[-.3, -.44], [0, -.5], [.3, -.44]], [[-.3, -.44], [0, -.5], [.3, -.43]]);
      stroke(g, catmull(seam, false, 5), H.lw * .5, { color: grey(.15), seed: 463, alpha: .7 });
    },
  },
};

// her plait: hangs down the back from the nape (drawn behind the head)
function plait(g, H) {
  if (H.front > .6) return;                                  // hidden when she faces us
  const pts = []; for (let i = 0; i <= 8; i++) { const y = .15 + i * .16; pts.push(H.P(-.36 - i * .01, y, (i % 2 ? .05 : -.05) * H.f)); }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], w = H.sc * (.13 - i * .008);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    form(g, loop([[a[0] - w * .6, a[1]], [m[0] - w * .7, m[1]], [b[0], b[1] + w * .2], [m[0] + w * .7, m[1]], [a[0] + w * .6, a[1]]], 3), { v: .12, line: H.lw * .6, hatch: .3, seed: 520 + i });
  }
}
const hairF = [[-.4, .02], [-.42, -.22], [-.3, -.42], [0, -.5], [.3, -.42], [.42, -.22], [.4, .02], [.33, -.14], [.18, -.3], [0, -.33], [-.18, -.3], [-.33, -.14]];
const hairP = [[-.42, .2], [-.46, -.08], [-.36, -.4], [-.06, -.52], [.22, -.46], [.34, -.32], [.3, -.26], [.18, -.3], [.06, -.22], [-.02, -.06], [-.1, .1], [-.26, .24]];
export const HER = {
  name: 'Her', body: 'adult', line: .027,
  skin: { v: .8 }, handW: .28, neckW: .34,
  leg: { v: .88, w: [.48, .4, .34] },
  shoe: { v: .2 },
  arm: { v: .2, w: [.31, .27, .23], sleeve: .3, foreW: [.22, .17] },     // dark short-sleeved blouse, bare forearms
  torso: { v: .88, grad: .2 },
  torsoW: .9, torsoD: .92,
  skirt: { front: true, v: .88, top: .95, len: 3.62, wz: .62, fx: .4, topW: 1, hemW: 1.28, hatch: 0 },
  torsoDetail(g, J, pr, s, lw) {
    if (s < 12) return;
    const T = (xf, y, xs) => torsoPoint(J, pr, xf, y, xs);
    // the pallu: the sari's dark-bordered end, from the left shoulder across to the right hip
    const band = pr.cy > -.3 ? [T(-.62, 2.2, .1), T(-.3, 2.3, .3), T(.66, .55, .3), T(.5, .4, .25)] : [T(-.62, 2.2, -.2), T(-.4, 2.3, -.3), T(.4, .2, -.3), T(.2, .1, -.3)];
    form(g, loop(band, 3), { v: .18, line: lw * .7, hatch: .35, seed: 531 });
    stroke(g, [T(-.5, 2.1, .2), T(.56, .6, .3)], lw * .5, { color: grey(.75), seed: 532, alpha: .8 });
  },
  collar(g, J, pr, s, lw) { },
  head: {
    skin: .8, jaw: .9, chinW: .42, brow: 1.4, lip: .44, profile: PROFILE_ADULT, front: FRONT_ADULT, makeup: .8, nose: .85,
    hairBack: plait,
    hair(g, H) {
      const pts = loop(headShape(H, hairF, hairP));
      g.save(); pathOf(g, H.outline); g.clip();
      form(g, pts, { v: .12, line: H.lw * .7, grad: .1, hatch: .3, seed: 541 });
      // the centre parting
      const a = headShape(H, [[0, -.5]], [[-.02, -.52]])[0], b = headShape(H, [[0, -.32]], [[.12, -.38]])[0];
      stroke(g, [a, b], H.lw * .6, { color: grey(.75), seed: 542, alpha: .8 });
      g.restore();
      // a small bindi
      if (H.front > .2) { const q = headShape(H, [[0, -.16]], [[.38, -.16]])[0]; g.fillStyle = grey(.15); g.beginPath(); g.arc(q[0], q[1], H.sc * .025, 0, 7); g.fill(); }
    },
  },
};
