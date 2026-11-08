// «আরেকটু থাকো» — film assembly.
// shot paints a tonal 4:3 frame → Redraw (ink line, wash steps, boiling hatch) → iris → FilmPost (silver print, flicker,
// weave, scratches, burn) → dust/hair → into the 4:3 gate between the velvet curtains. Motion is sampled at 16 fps (18 and a
// faster crank when he runs for the train); flicker and weave change every 24 fps frame.
import { Redraw } from './engine/redraw.js';
import { FilmPost, damage } from './engine/film.js';
import { intertitle, iris, theatre } from './engine/cards.js';
import { setFrame, S as IS } from './engine/ink.js';
import { SEC, DUR as D, HIT, secAt } from './timeline.js';
import { CARDS } from './cardspecs.js';
import * as SH from './shots.js';

export const DUR = D;
const W = 1920, H = 1080, FW = 1440, FH = 1080, GATE = { x: 240, y: 0, w: FW, h: FH };
const fc = document.createElement('canvas'); fc.width = FW; fc.height = FH; const fg = fc.getContext('2d');
let RD = null, FP = null;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };

// tint and damage are the mood: warm and light for the show, colder and harsher at the ticket and the run-out,
// rose-warm and clean for the frozen moment and her look, cold blue-silver at dawn on the platform, warm again for the held frame
const L = (str, sepia, fps = 16, crank = 1) => ({ str, sepia, fps, crank });
const LOOK = {
  PRE: L(.7, .14), TITLE: L(.55, .2), HALL1: L(.5, .24), CARD1: L(.5, .22), PIT1: L(.42, .26), BOOTH1: L(.48, .24), TEA: L(.45, .26),
  TICKET: L(.75, .08), CARD2: L(.7, .08), BOOTH2: L(.62, .12), PIT2: L(.55, .16), BOOTH3: L(.5, .2), HALL2: L(.35, .3), BOOTH4: L(.55, .2, 18, 1.2),
  SCREEN: L(.45, .26), CARD3: L(.3, .34), LOOK: L(.28, .36), RUNOUT: L(.85, .08, 18, 1.3), EMPTY: L(.6, .12), LID: L(.5, .16), AISLE: L(.5, .16),
  MISS: L(.55, .14), CARD4: L(.45, .2), DOOR: L(.55, .14), STATION: L(.6, .05), ALONE: L(.42, .3), FRAME: L(.35, .34), BURN: L(.7, .3), CARD5: L(.4, .32),
  CREDITS: L(.4, .3), END: L(.45, .28),
};
const SHOTS = { HALL1: SH.hall1, PIT1: SH.pit1, BOOTH1: SH.booth1, TEA: SH.tea, TICKET: SH.ticket, BOOTH2: SH.booth2, PIT2: SH.pit2, BOOTH3: SH.booth3,
  HALL2: SH.hall2, BOOTH4: SH.booth4, SCREEN: SH.screen, LOOK: SH.look, RUNOUT: SH.runout, EMPTY: SH.empty, LID: SH.lid, AISLE: SH.aisle, MISS: SH.miss,
  DOOR: SH.door, STATION: SH.stationShot, ALONE: SH.alone, FRAME: SH.frameShot, BURN: SH.burn };
const fpsOf = (sec, t) => sec.name === 'STATION' && t > SEC.STATION.t0 + 8 && t < HIT.grab + 1.5 ? 18 : LOOK[sec.name].fps;
const crankOf = (sec, t) => sec.name === 'STATION' && t > SEC.STATION.t0 + 8 && t < HIT.grab + 1.5 ? 1.3 : LOOK[sec.name].crank;

export function renderFilm(g, t) {
  RD = RD || new Redraw(FW, FH); FP = FP || new FilmPost(FW, FH);
  const sec = secAt(t), look = LOOK[sec.name], frame = Math.floor(t * 24 + 1e-6), fps = fpsOf(sec, t);
  const ta = Math.floor(t * fps + 1e-6) / fps, lt = Math.max(0, ta - sec.t0);
  fg.setTransform(1, 0, 0, 1, 0, 0); fg.globalAlpha = 1; fg.globalCompositeOperation = 'source-over'; fg.filter = 'none';
  let src = fc, exposure = 1;
  const card = CARDS[sec.name];
  if (sec.name === 'PRE') { fg.fillStyle = '#0e0d0b'; fg.fillRect(0, 0, FW, FH); exposure = .25 + .6 * ss((t - HIT.curtain) / .6); }
  else if (sec.name === 'END') { intertitle(fg, FW, FH, CARDS.CREDITS, t - sec.t0); }
  else if (card) intertitle(fg, FW, FH, card, t - sec.t0);
  else {
    setFrame(ta, { boil: 1 }); IS.sepLine = .5;
    fg.fillStyle = '#fff'; fg.fillRect(0, 0, FW, FH);
    fg.save(); SHOTS[sec.name](fg, lt, ta); fg.restore();
    src = RD.render(fc, { frame });
  }
  const ir = irisAt(t);
  if (ir) { if (src !== fc) { fg.setTransform(1, 0, 0, 1, 0, 0); fg.drawImage(src, 0, 0); src = fc; } iris(fg, FW, FH, ir.x, ir.y, ir.r, 4); }
  // fades to black at the burn's white and between the last cards
  const fp = { frame, strength: look.str, sepia: look.sepia, crank: crankOf(sec, t), exposure };
  if (card || sec.name === 'END') fp.halation = 1.4;
  if (sec.name === 'BURN' && t > HIT.white) { fp.exposure = 1.6; fp.strength = .9; }
  const dev = FP.render(src, fp);
  const curtain = t < HIT.title ? ss((t - HIT.curtain) / 1.1) : 1 - ss((t - HIT.curtainOut) / 1.6);
  theatre(g, W, H, GATE, Math.max(.3, FP.mean * (sec.name === 'PRE' ? exposure : 1)), curtain);
  g.save(); g.beginPath(); g.roundRect(GATE.x, GATE.y, GATE.w, GATE.h, 22); g.clip();
  g.drawImage(dev, GATE.x, GATE.y);
  damage(g, GATE.x, GATE.y, FW, FH, frame, look.str);
  g.restore();
  if (curtain < 1) curtainsOver(g, curtain, Math.max(.55, FP.mean));
}
function curtainsOver(g, open, spill) {
  const cover = (1 - open) * (W / 2 + 10);
  if (cover < 1) return;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  theatre(x, W, H, { x: W / 2, y: 0, w: 0, h: H }, spill, 1);
  g.save();
  g.drawImage(c, 0, 0, W / 2, H, cover - W / 2, 0, W / 2, H);
  g.drawImage(c, W / 2, 0, W / 2, H, W - cover, 0, W / 2, H);
  g.save(); g.beginPath(); g.rect(0, 0, cover, H); g.rect(W - cover, 0, cover, H); g.clip();
  g.globalCompositeOperation = 'screen';
  const fl = g.createRadialGradient(W / 2, H + 120, 60, W / 2, H + 120, 1250);
  fl.addColorStop(0, 'rgba(255,170,110,.42)'); fl.addColorStop(.55, 'rgba(170,70,50,.16)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = fl; g.fillRect(0, 0, W, H); g.restore();
  for (const [x0, dir] of [[cover, -1], [W - cover, 1]]) { const gr = g.createLinearGradient(x0, 0, x0 + dir * 60, 0); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(Math.min(x0, x0 + dir * 60), 0, 60, H); }
  g.restore();
}
// irises: open on the ticket; the half-open iris that holds on her look; a closing iris on the tea cup in his hand? (no: keep two)
function irisAt(t) {
  const full = 1900;
  if (t >= SEC.TICKET.t0 && t < SEC.TICKET.t1) return { x: 720, y: 540, r: 8 + ss((t - SEC.TICKET.t0) / 1.6) * full };
  if (t >= SEC.LOOK.t0 && t < SEC.LOOK.t1) {
    const c = SH.herFaceLook(), b = t - SEC.LOOK.t0, d = SEC.LOOK.dur;
    const r = b < 1.2 ? full - (full - 300) * ss(b / 1.2) : b < d - .8 ? 300 : 300 * (1 - ss((b - (d - .8)) / .7));
    return { x: c[0], y: c[1], r: Math.max(.5, r) };
  }
  if (t >= SEC.DOOR.t0 && t < SEC.DOOR.t1) { const b = t - SEC.DOOR.t0; return b > 2.4 ? { x: 470 + 0, y: 520, r: Math.max(.5, 1900 * (1 - ss((b - 2.4) / 1.1))) } : null; }
  return null;
}
export function events() {
  const ev = [];
  for (const k in SEC) ev.push({ t: SEC[k].t0, type: 'section', name: k });
  for (const k in HIT) ev.push({ t: HIT[k], type: 'hit', name: k });
  for (const k in CARDS) if (SEC[k]) { const c = CARDS[k]; ev.push({ t: SEC[k].t0 + .1, type: 'sub', t1: SEC[k].t1 - .1, zh: c.lines[0].text, en: c.lines[1]?.text || '' }); }
  return ev.sort((a, b) => a.t - b.t);
}
