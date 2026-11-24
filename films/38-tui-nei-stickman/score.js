// THE SCORE for «তুই নেই» — a stickman music video on the user's own song (song.wav, 199 s, 88 BPM).
// The song's real beats come from `node engine/render.js analyze song.wav` → beats.js. Every scene starts on a bar
// line of the song, and every beat-synced flourish (rain bursts, the lamp, hearts, stars) reads the same clock.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const A = node ? require('./beats.js') : globalThis.ANALYSIS;

  const FPS = 30;
  const FORMAT = U.pickFormat('16:9');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const STYLE = 'paper';
  const clock = MU.makeClock({ beats: A.beats, downbeat: A.downbeat, beatsPerBar: A.meter });
  const { T, BEAT } = clock;
  const DURATION = Math.round(A.duration * FPS) / FPS;
  const B = (bar) => (bar <= 0 ? 0 : T(bar)); // scene starts: bar 0 begins at t = 0 (the song's pickup)

  // ---------- the story, scene by scene, on the song's bars ----------
  // intro 0-9 · break 9-14 · chorus 14-30 · verse 30-38 · chorus 38-50 · verse 50-54 · chorus 54-66 · outro 66-70
  const SCENES = [
    { bar: 0, id: 'window', mood: 'now' },      // night rain; he sits at the window, two cups of tea, one untouched
    { bar: 4, id: 'fog', mood: 'now' },         // he writes «তুই নেই» on the fogged glass (the title)
    { bar: 9, id: 'box', mood: 'now' },         // an old box: her red scarf; it glows
    { bar: 14, id: 'umbrella', mood: 'then' },  // memory: rain, she shares her red umbrella
    { bar: 18, id: 'cycle', mood: 'then' },     // the bicycle ride
    { bar: 20, id: 'tea', mood: 'then' },       // the tea stall, laughing
    { bar: 22, id: 'kite', mood: 'then' },      // kite on the rooftop
    { bar: 24, id: 'boat', mood: 'then' },      // a boat on the river
    { bar: 26, id: 'fair', mood: 'then' },      // the fair: the big wheel
    { bar: 28, id: 'lamp', mood: 'then' },      // under the streetlamp, she twirls
    { bar: 30, id: 'alone', mood: 'now' },      // the same street, alone; her outline flickers beside him
    { bar: 38, id: 'station', mood: 'then' },   // the station: she leaves on the train
    { bar: 44, id: 'chase', mood: 'then' },     // he runs after the train
    { bar: 48, id: 'kneel', mood: 'now' },      // rain; he kneels; the phone rings out
    { bar: 50, id: 'river', mood: 'now' },      // dusk: he draws her in the sand, a wave takes it
    { bar: 54, id: 'wind', mood: 'wind' },     // the wind takes the scarf; he follows it through the memories
    { bar: 60, id: 'stars', mood: 'dream' },    // the scarf rises; the stars draw her; she waves
    { bar: 66, id: 'dawn', mood: 'now' },       // dawn at the window; rain stopped; he keeps the scarf
  ].map((s, i, all) => ({ ...s, t0: B(s.bar), t1: i + 1 < all.length ? B(all[i + 1].bar) : DURATION }));

  const S = Object.fromEntries(A.sections.map((s, i) => [`${s.label}${i}`, [s.t, s.end]]));
  const markers = Object.fromEntries(SCENES.slice(1).map((s) => [s.id, { t: s.t0, sync: 'v' }]));
  markers.title = T(5); markers.memory = T(14); markers.train = T(41); markers.stars = T(60);

  const SCORE = { FPS, FORMAT, W, H, SAFE, STYLE, DURATION, clock, T, BEAT, A, S, SCENES, markers, bars: A.bars, hits: A.hits, energy: A.energy };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
