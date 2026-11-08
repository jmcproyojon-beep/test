// «আরেকটু থাকো» — a photoplay in one reel. The cue sheet: every section in absolute seconds, laid on the song's own sections
// (lines.json: the sung lines' times in the artist's master). Picture, projector sound and intertitles all read this file.
export const FPS = 24;
// [name, t0, mood / what happens]
const SECS = [
  ['PRE', 0, 'lamp strikes, projector spins up, curtains part'],
  ['TITLE', 3.0, 'title card'],
  ['HALL1', 8.0, 'the picture house, the last show: wide'],
  ['CARD1', 21.4, 'card: the last show of the season'],
  ['PIT1', 24.8, 'verse 1: she plays under the screen'],
  ['BOOTH1', 35.2, 'verse 1: he cranks the projector, looks down through the port'],
  ['TEA', 45.4, 'verse 2: the chain in one take — a cup of tea down the string, a note back up'],
  ['TICKET', 61.1, 'iris on the note: a railway ticket'],
  ['CARD2', 64.4, 'card: the morning train'],
  ['BOOTH2', 68.0, 'pre-chorus: the clock, the crank; he cranks slower'],
  ['PIT2', 81.0, 'pre-chorus: the film on the screen slows; she looks up'],
  ['BOOTH3', 90.9, 'chorus: he stops the crank'],
  ['HALL2', 96.0, 'chorus: the screen freezes; she stops playing and turns'],
  ['BOOTH4', 104.0, 'chorus: he winds the film back'],
  ['SCREEN', 109.5, 'chorus: the couple on the screen walk backwards (trick shot)'],
  ['CARD3', 115.4, 'card: stay a little longer'],
  ['LOOK', 119.0, 'chorus: half-open iris — she looks up to the booth and smiles'],
  ['RUNOUT', 123.8, 'interlude: the reel runs out, the tail flaps'],
  ['EMPTY', 130.5, 'interlude: white screen, the hall empties'],
  ['LID', 139.5, 'bridge: she closes the piano lid'],
  ['AISLE', 146.6, 'bridge: he comes down the aisle'],
  ['MISS', 151.2, 'bridge: the near-miss — his hand where hers was'],
  ['CARD4', 156.4, 'card: your road is yours'],
  ['DOOR', 160.0, 'bridge: she leaves; he gives her the reel can — no: she leaves'],
  ['STATION', 163.6, 'final chorus: the platform at dawn; he runs with the reel can; the train goes'],
  ['ALONE', 196.0, 'instrumental: the booth, alone; he threads the one frame she left'],
  ['FRAME', 203.0, 'the held frame on the screen'],
  ['BURN', 212.6, 'outro: the held frame burns through'],
  ['CARD5', 221.8, 'card: until the next show'],
  ['CREDITS', 226.0, 'credits card'],
  ['END', 235.0, 'curtains close on the footlights'],
];
export const DUR = 243.6;
export const SEC = {};
SECS.forEach(([name, t0, mood], i) => { SEC[name] = { name, t0, t1: i + 1 < SECS.length ? SECS[i + 1][1] : DUR, mood }; SEC[name].dur = SEC[name].t1 - t0; });
export const secAt = tt => { for (const k in SEC) if (tt < SEC[k].t1) return SEC[k]; return SEC.END; };
// named moments
export const HIT = {
  curtain: .6, title: 3.0,
  hang: 46.6, release: 47.8, sag: 51.6, catch: 54.2, sip: 55.2, noteUp: 57.0, noteIn: 60.4,
  slow: 72.6, freeze: 91.6, turn: 98.0, rewind: 104.8, smile: 120.6,
  runout: 123.8, lidDown: 141.0, reach: 153.4, miss: 153.6,
  trainGo: 176.0, grab: 184.6,
  thread: 197.5, hold: 201.5, burn: 216.0, white: 219.4,
  curtainOut: 236.5,
};
