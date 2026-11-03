"""Build the beat-synced edit decision list for the Baul riverbank music video.

    python3.13 -I client-builds/baul-mv/edl.py   # -> remotion-composer/src/baul/edl.json

The artist supplied eight 10 s vertical clips (each holding several shots)
and a 302 s song. Shot boundaries were found with ffmpeg's scene detector and
every shot was tagged by hand from its middle frame (time of day, framing).

The edit follows the light — day verses, sunset choruses, a night finale,
with clip 1's day-to-night time-lapse carrying the breakdown — and the song:
cuts land on detected downbeats, every 4 bars in the solo-voice intro/outro,
2 bars in verses, 1 bar in choruses; choruses alternate a single framed shot
with a three-shot triptych. Shots shorter than their slot are slowed (never
below 0.5x); reused shots vary in-point, mirror, push-in/pull-out and drift.
"""
import json, random
from pathlib import Path
import numpy as np
import librosa

ROOT = Path(__file__).resolve().parents[2]
A = ROOT/"projects/clip-mv/assets/audio"
OUT = ROOT/"remotion-composer/src/baul/edl.json"
FPS = 30

# id: (clip, in, out, time of day, framing)   — from the shot contact sheet
SHOTS = {
    0: (1, 0.05, 9.95, "lapse", "wide"),
    1: (2, 0.05, 1.742, "day", "wide"), 2: (2, 1.842, 3.45, "day", "med"), 3: (2, 3.55, 5.117, "day", "boat"),
    4: (2, 5.217, 6.908, "day", "hands"), 5: (2, 7.008, 9.95, "sunset", "med"),
    6: (3, 0.05, 2.408, "day", "wide"), 7: (3, 2.508, 4.95, "day", "hands"), 8: (3, 5.05, 7.367, "day", "face"), 9: (3, 7.467, 9.95, "day", "far"),
    10: (4, 0.05, 2.075, "day", "wide"), 11: (4, 2.175, 4.492, "day", "med"), 12: (4, 4.592, 8.45, "dusk", "boat"), 13: (4, 8.55, 9.95, "night", "wide"),
    14: (5, 0.05, 3.45, "day", "wide"), 15: (5, 3.55, 5.075, "day", "hands"), 16: (5, 5.175, 8.367, "night", "wide"), 17: (5, 8.467, 9.95, "night", "face"),
    18: (6, 0.05, 3.908, "sunset", "wide"), 19: (6, 4.008, 5.908, "sunset", "hands"), 20: (6, 6.008, 9.95, "night", "wide"),
    21: (7, 0.05, 1.492, "sunset", "wide"), 22: (7, 1.592, 4.492, "sunset", "med"), 23: (7, 4.592, 5.908, "sunset", "hands"),
    24: (7, 6.008, 7.367, "sunset", "boat"), 25: (7, 7.467, 8.325, "sunset", "med"), 26: (7, 8.425, 9.367, "sunset", "face"),
    27: (7, 9.467, 9.95, "sunset", "wide"),
    28: (8, 0.05, 3.825, "day", "wide"), 29: (8, 3.925, 5.158, "day", "hands"), 30: (8, 5.258, 6.867, "day", "face"), 31: (8, 6.967, 9.95, "day", "far"),
}

# (from, to, bars per cut, mode, pool, transition)   — sections from the energy
# profile: solo voice 0-28 s, band from ~28 s, vocal peaks ~64/92/128/160/188,
# near-silence 208-216, final section 216-268, solo-voice outro 276 s.
PLAN = [
    (0.0, 28.0, 2, "single", [31, 9, 3, 8, 14, 28], "xfade"),
    (28.0, 36.5, 1, "single", [7, 29, 4, 15], "cut"),
    (36.5, 60.0, 2, "single", [1, 2, 6, 10, 11, 14, 28, 30, 8], "cut"),
    (60.0, 72.0, 1, "chorus", [1, 2, 6, 10, 11, 14, 28, 4, 7, 29, 30, 15], "flash"),
    (72.0, 88.0, 2, "single", [10, 11, 28, 2, 22, 5], "cut"),
    (88.0, 104.0, 1, "chorus", [5, 18, 21, 22, 25, 26, 27, 23, 19, 24], "flash"),
    (104.0, 124.0, 2, "single", [21, 22, 25, 27, 18, 24, 5], "cut"),
    (124.0, 136.0, 1, "chorus", [5, 18, 21, 22, 25, 26, 23, 19, 24, 27], "flash"),
    (136.0, 160.0, 2, "single", [5, 18, 26, 24, 22, 19, 12], "cut"),
    (160.0, 176.0, 1, "chorus", [18, 21, 22, 25, 26, 23, 19, 24, 5], "flash"),
    (176.0, 184.0, 2, "single", [12, 24, 27, 18], "cut"),
    (184.0, 196.0, 1, "chorus", [5, 18, 22, 26, 23, 19, 12, 24], "flash"),
    (196.0, 208.0, 2, "single", [12, 24, 27], "xfade"),
    (208.0, 216.0, 4, "single", [0], "xfade"),
    (216.0, 236.0, 2, "single", [13, 16, 17, 20, 12], "cut"),
    (236.0, 248.0, 1, "chorus", [13, 16, 17, 20, 12], "flash"),
    (248.0, 268.0, 2, "single", [16, 17, 20, 13, 12], "cut"),
    (268.0, 276.0, 2, "single", [12, 24], "xfade"),
    (276.0, 302.1, 2, "single", [17, 16, 20, 13, 12], "xfade"),
]

rng = random.Random(1404)
USED: dict = {}


def main():
    y, sr = librosa.load(A/"song.wav", sr=22050, mono=True)
    dur = len(y) / sr
    beats = json.load(open(A/"beats.json"))["beats"]
    hop = 512
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
    bass = S[fr < 150].sum(0)
    bi = [min(len(bass) - 1, int(b * sr / hop)) for b in beats]
    phase = int(np.argmax([sum(bass[f] for k, f in enumerate(bi) if k % 4 == p) for p in range(4)]))
    down = [b for k, b in enumerate(beats) if k % 4 == phase]

    def snap(t):
        if t <= 0.01 or t >= dur - 0.5:
            return t
        return min(down, key=lambda d: abs(d - t))

    def fit(sid, need):
        c, a, b, _, _ = SHOTS[sid]
        avail = b - a
        rate = 1.0 if avail >= need else max(0.45, avail / need)
        slack = max(0.0, avail - need * rate)
        return {"clip": c, "in": round(a + rng.random() * slack, 3), "rate": round(rate, 3),
                "flip": rng.random() < 0.3, "z0": round(1.0 + rng.random() * 0.06, 3), "z1": round(1.04 + rng.random() * 0.08, 3) if rng.random() < 0.6 else 1.0,
                "dx": round((rng.random() - 0.5) * 0.06, 3)}

    def pick(pool, need, last, k=1):
        good = [s for s in pool if (SHOTS[s][2] - SHOTS[s][1]) / 0.47 >= need] or sorted(pool, key=lambda s: SHOTS[s][1] - SHOTS[s][2])[:2]
        out = []
        for _ in range(k):
            cand = [s for s in good if s not in last and s not in out] or good
            low = min(USED.get(s, 0) for s in cand)          # least-used first, so reuse is spread out
            x = rng.choice([s for s in cand if USED.get(s, 0) == low])
            USED[x] = USED.get(x, 0) + 1
            out.append(x)
        return out

    events, last = [], []
    for a, b, bars, mode, pool, trans in PLAN:
        a, b = snap(a), snap(b)
        grid = [d for d in down if a - 0.01 <= d < b - 0.3]
        if not grid or grid[0] - a > 0.3:
            grid = [a] + grid
        cuts = grid[::bars] + [b]
        for i, (s, e) in enumerate(zip(cuts, cuts[1:])):
            need = e - s
            tri = mode == "chorus" and i % 2 == 1
            ids = pick(pool, need, last, 3 if tri else 1)
            last = ids
            events.append({"s": round(s, 3), "e": round(e, 3), "layout": "tri" if tri else "single",
                           "trans": trans if i > 0 or trans != "flash" else "flash", "shots": [dict(fit(x, need), id=x) for x in ids]})
    for ev, nxt in zip(events, events[1:]):
        ev["e"] = nxt["s"]
    events[-1]["e"] = round(dur, 3)

    fps_rms = librosa.feature.rms(y=y, hop_length=int(sr / FPS))[0]
    fps_rms = np.clip(fps_rms / np.percentile(fps_rms, 98), 0, 1)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"fps": FPS, "duration": round(dur, 3), "frames": int(np.ceil(dur * FPS)),
                               "beats": [round(x, 3) for x in beats], "downbeats": [round(x, 3) for x in down],
                               "rms": [int(round(v * 99)) for v in fps_rms], "events": events}, separators=(",", ":")))
    print(f"{len(events)} events over {dur:.1f}s, downbeat phase {phase}, {len(down)} bars")
    for ev in events[:8] + events[-4:]:
        print(f"  {ev['s']:7.2f}-{ev['e']:7.2f} {ev['layout']:6} {ev['trans']:5} {[ (x['id'], x['rate']) for x in ev['shots']]}")


if __name__ == "__main__":
    main()
