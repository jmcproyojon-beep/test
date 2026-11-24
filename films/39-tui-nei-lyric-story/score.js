// THE SCORE for «তুই নেই» — vertical (9:16) lyric-story video in the look of the client's references (pencil-sketched
// rooms on white, big-headed expressive stick figures, bold words at the top, one red heart). The song is the user's
// own master (song.wav); its beats come from `engine/render.js analyze` (beats.js). The lyric lines and their times
// were transcribed from the isolated vocal (demucs + whisper) and checked by ear-free alignment to the vocal onsets.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const A = node ? require('./beats.js') : globalThis.ANALYSIS;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const STYLE = 'paper';
  const clock = MU.makeClock({ beats: A.beats, downbeat: A.downbeat, beatsPerBar: A.meter });
  const { T, BEAT } = clock;
  const DURATION = Math.round(A.duration * FPS) / FPS;

  // ---------- the words on screen (song seconds) ----------
  const LYRICS = [
    [34.06, 37.0, 'যদি থাকতি পাশে'],
    [37.1, 40.6, 'আকাশে উঠতো এক ফালি চাঁদ'],
    [64.1, 67.6, 'ঘুরে ফিরি সারাদিন'],
    [67.6, 69.4, 'সারাক্ষণ গুনগুন করে'],
    [69.4, 72.6, 'খুন হয়ে যাই আমি নিজের আদালতে'],
    [72.6, 75.0, 'জানতে চাসনি কোনোদিন'],
    [75.0, 77.4, 'তাই আজ বেদুইন হয়ে যাই'],
    [77.4, 78.8, 'বেদুইন দিন কাটে'],
    [78.8, 81.1, 'নীল লাল বাতি জ্বলা সিগন্যালে'],
    [106.3, 109.0, 'এক মৃত চাঁদের আলো'],
    [109.0, 111.8, 'তারাগুলো লাগতো ভালো'],
    [117.2, 119.2, 'আজ আর নেই কোনো টান'],
    [119.2, 121.0, 'বসে লেখা গান'],
    [125.4, 127.6, 'ফুল দিয়ে যাবে কে তোমাকে'],
    [128.2, 130.6, 'তবু এলোমেলো স্মৃতিগুলো'],
    [131.3, 133.8, 'আমি আজ কেন নিরুপায়'],
    [163.8, 165.5, 'ঘুরে ফিরি সারাদিন'],
    [165.5, 167.7, 'সারাক্ষণ গুনগুন করে'],
    [167.7, 170.96, 'খুন হয়ে যাই আমি নিজের আদালতে'],
    [170.96, 173.6, 'জানতে চাসনি কোনোদিন'],
    [173.6, 175.6, 'তাই আজ বেদুইন হয়ে যাই'],
    [175.6, 177.4, 'বেদুইন দিন কাটে'],
    [177.4, 179.3, 'নীল লাল বাতি জ্বলা সিগন্যালে'],
    [182.8, 185.6, 'তুই নেই'],
    [186.4, 188.6, 'তুই নেই'],
    [188.8, 192.5, 'তুই নেই'],
  ].map(([t0, t1, text]) => ({ t0, t1, text }));

  // ---------- the story, one scene per line ----------
  const SCENES = [
    [0, 'room'], [33.6, 'imagine'], [46.0, 'search'], [57.0, 'street'], [69.4, 'court'], [72.6, 'turned'], [75.0, 'bedouin'],
    [78.8, 'signal'], [81.1, 'crowd'], [84.5, 'bench'], [96.4, 'road'], [106.3, 'deadmoon'], [109.0, 'starsMem'], [113.8, 'sunMem'],
    [117.2, 'writing'], [125.4, 'flower'], [128.2, 'memories'], [131.3, 'helpless'], [133.8, 'solo'],
    [163.8, 'street'], [167.7, 'court'], [170.96, 'turned'], [173.6, 'bedouin'], [177.4, 'signal'], [179.3, 'crowd'],
    [182.8, 'emptyBed'], [186.4, 'photo'], [188.8, 'window'], [193.6, 'endcard'],
  ].map(([t0, id], i, all) => ({ id, t0, t1: i + 1 < all.length ? all[i + 1][0] : DURATION, second: i >= 19 && i <= 24 }));

  const S = Object.fromEntries(A.sections.map((s, i) => [`${s.label}${i}`, [s.t, s.end]]));
  const markers = Object.fromEntries(SCENES.slice(1).map((s, i) => [`${s.id}${i + 1}`, { t: s.t0, sync: 'v' }]));

  const SCORE = { FPS, FORMAT, W, H, SAFE, STYLE, DURATION, clock, T, BEAT, A, S, SCENES, LYRICS, markers, bars: A.bars, hits: A.hits };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
