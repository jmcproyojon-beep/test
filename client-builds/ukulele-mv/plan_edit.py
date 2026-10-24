"""Plan the music video: beat-locked cuts, shot choice, look, lyric placement.

Every cut boundary is a detected beat, so each change of image lands on the
music. Cut lengths are whole beats — 4 (one bar) through 16 — chosen per
section, so the edit breathes in the verses and drives in the choruses.
"""
import json, random
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from lyrics import lines as lyric_lines

P = Path("projects/ukulele-mv")
random.seed(20261024)

# ---------------------------------------------------------------- shot library
# clip, in, out, kind, look.  kind drives where a shot is allowed to go:
#   close/strum = hands on the instrument, NEVER speed-changed (the playing has
#   to read as real); mid/portrait/wide may be slowed for a long hold.
ZONES = [
    ("01", 0.0,  2.0, "mid",      "dark"),
    ("01", 2.0,  5.0, "close",    "warm"),
    ("01", 4.9,  6.1, "portrait", "dark"),
    ("01", 6.0,  8.0, "mid",      "dark"),
    ("01", 8.0, 10.0, "close",    "warm"),
    ("02", 0.0,  3.2, "close",    "dark"),
    ("02", 3.2,  6.4, "close",    "warm"),
    ("02", 6.4, 10.0, "close",    "warm"),
    ("03", 0.0,  4.0, "close",    "warm"),
    ("03", 4.0,  6.4, "close",    "dark"),
    ("03", 6.4, 10.0, "strum",    "warm"),
    ("04", 0.0,  3.0, "mid",      "warm"),
    ("04", 3.0,  6.0, "strum",    "warm"),
    ("04", 6.0, 10.0, "portrait", "dark"),
    ("05", 0.0,  2.2, "mid",      "bright"),
    ("05", 2.2,  5.0, "close",    "bright"),
    ("05", 5.0, 10.0, "portrait", "bright"),
    ("06", 0.0,  3.0, "mid",      "warm"),
    ("06", 2.9,  4.2, "close",    "bright"),
    ("06", 4.2,  7.0, "mid",      "warm"),
    ("06", 7.0, 10.0, "close",    "warm"),
    ("07", 0.0,  1.3, "close",    "dark"),
    ("07", 1.0,  4.0, "portrait", "dark"),
    ("07", 4.0,  7.0, "mid",      "warm"),
    ("07", 6.6,  8.3, "wide",     "dark"),
    ("07", 8.0, 10.0, "close",    "bright"),
]
ZONES = [{"clip": c, "in": a, "out": b, "kind": k, "look": l, "len": b - a}
         for c, a, b, k, l in ZONES]

NO_SLOW = {"close", "strum"}   # real playing: never time-stretched
MAX_SLOW = 1.7

# ------------------------------------------------------------------- sections
# name, end time, beats-per-cut pattern, preferred kinds, grade
SECTIONS = [
    ("intro",   17.2, [16, 8, 8, 8],      ["wide", "mid", "portrait"],        "cool"),
    ("verse1a", 45.3, [8, 8, 8, 4],       ["portrait", "mid", "close"],       "cool"),
    ("verse1b", 61.5, [8, 4, 8, 4],       ["portrait", "close", "mid"],       "cool"),
    ("chorus1", 94.7, [4, 4, 4, 8],       ["strum", "close", "mid"],          "warm"),
    ("inst1",   99.4, [8],                ["wide", "portrait"],               "neutral"),
    ("verse2a", 127.3, [8, 8, 4, 8],      ["portrait", "mid", "close"],       "neutral"),
    ("verse2b", 136.4, [4, 4, 8],         ["close", "mid", "portrait"],       "neutral"),
    ("chorus2", 174.5, [4, 4, 8, 4],      ["strum", "close", "mid"],          "warm"),
    ("bridge",  202.2, [8, 8, 16],        ["portrait", "mid", "wide"],        "cool"),
    ("chorus3", 227.3, [4, 4, 2, 2, 4, 8],["strum", "close", "mid"],          "golden"),
    ("outro",   243.1, [16, 16, 8],       ["wide", "portrait", "mid"],        "fade"),
]

def plan():
    beats = json.load(open(P/"assets/audio/beats.json"))["beats"]
    nb = len(beats)

    def beat_at(t):
        """index of the first beat at or after t"""
        for i, b in enumerate(beats):
            if b >= t - 1e-6:
                return i
        return nb - 1

    cuts, recent, i = [], [], 0
    prev_clip = None
    for name, end_t, pattern, prefer, grade in SECTIONS:
        end_i = beat_at(end_t)
        p = 0
        while i < end_i and i < nb - 1:
            n = pattern[p % len(pattern)]; p += 1
            j = min(i + n, end_i, nb - 1)
            if j <= i:
                break
            t0, t1 = beats[i], beats[j]
            dur = t1 - t0
            if dur < 0.3:
                i = j; continue

            # pick a zone: prefer this section's kinds, never repeat the clip
            # back to back, and keep a window of recent zones off the table
            def ok(z, strict=True):
                if z["clip"] == prev_clip:
                    return False
                if strict and z["kind"] not in prefer:
                    return False
                if z["key"] in recent:
                    return False
                cap = z["len"] * (1.0 if z["kind"] in NO_SLOW else MAX_SLOW)
                return cap >= dur - 1e-3

            for z in ZONES:
                z["key"] = f'{z["clip"]}@{z["in"]}'
            pool = [z for z in ZONES if ok(z)] or [z for z in ZONES if ok(z, False)]
            if not pool:
                pool = [z for z in ZONES
                        if z["len"] * (1.0 if z["kind"] in NO_SLOW else MAX_SLOW) >= dur - 1e-3]
            z = random.choice(pool)

            speed = min(1.0, z["len"] / dur) if z["kind"] not in NO_SLOW else 1.0
            src_len = dur * speed
            start = z["in"] + random.uniform(0, max(0.0, z["len"] - src_len))
            cuts.append({"section": name, "grade": grade, "clip": z["clip"],
                         "kind": z["kind"], "src_in": round(start, 3),
                         "t0": round(t0, 3), "t1": round(t1, 3),
                         "dur": round(dur, 3), "beats": j - i,
                         "speed": round(speed, 4)})
            recent.append(z["key"]); recent[:] = recent[-6:]
            prev_clip = z["clip"]
            i = j

    # Clamping to a section edge can leave a 1-beat sliver. Under half a bar
    # reads as a glitch rather than a cut, so give it back to the cut before it.
    merged = []
    for c in cuts:
        if c["beats"] < 2 and merged:
            merged[-1]["t1"] = c["t1"]
            merged[-1]["beats"] += c["beats"]
            merged[-1]["dur"] = round(merged[-1]["t1"] - merged[-1]["t0"], 3)
        else:
            merged.append(c)
    cuts = merged

    # The first beat is at ~0.42s, but the picture starts at 0:00. Without this
    # the whole edit sits a beat early against the music: pull the opening cut
    # back to zero so every later cut lands on its beat.
    if cuts:
        cuts[0]["t0"] = 0.0
        cuts[0]["dur"] = round(cuts[0]["t1"], 3)

    # a merged cut may now outrun its source zone; re-slow the ones allowed to
    for c in cuts:
        if c["kind"] not in NO_SLOW:
            z = next(z for z in ZONES if z["clip"] == c["clip"] and abs(z["in"] - c["src_in"]) < z["len"] + 1e-6
                     and z["in"] <= c["src_in"] <= z["out"])
            avail = z["out"] - c["src_in"]
            if avail < c["dur"]:
                c["speed"] = round(max(1.0 / MAX_SLOW, avail / c["dur"]), 4)

    # The picture ends on the last detected beat. Any sliver of song after it is
    # covered by freezing the final frame in stitch_mv.py — stretching the last
    # cut to reach the end would need a slow no clip has the footage for.
    return {"cuts": cuts, "lyrics": lyric_lines()}

if __name__ == "__main__":
    pl = plan()
    out = P/"assets/edit-plan.json"
    json.dump(pl, open(out, "w"), ensure_ascii=False, indent=1)
    cuts = pl["cuts"]
    print(f"{len(cuts)} cuts, {len(pl['lyrics'])} lyric lines -> {out}")
    from collections import Counter
    print("per section:", Counter(c["section"] for c in cuts))
    print("per clip   :", Counter(c["clip"] for c in cuts))
    print("per kind   :", Counter(c["kind"] for c in cuts))
    print("cut lengths:", Counter(c["beats"] for c in cuts))
    slowed = [c for c in cuts if c["speed"] < 0.999]
    print(f"slowed: {len(slowed)}  (min speed {min((c['speed'] for c in slowed), default=1):.2f})")
    print("total:", round(sum(c["dur"] for c in cuts), 2), "s")
