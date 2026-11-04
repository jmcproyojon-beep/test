"""Music bed, sound effects, final mix — and the cue sheet the animation uses.

    python3.13 -I client-builds/haaland-100s/build_audio.py

Everything is synthesised here (no library music, nothing to clear for
copyright): a 100 BPM major-key bed (C–G–Am–F) that drops to a pad for the
serious "অপেক্ষার গল্প" section as the script asks, rises back into
"ডাবল গোল!", and runs hot through the World Cup section. The music ducks
under the voice. Effects (whoosh, pop, ding, boom, cheer, scratch, tick)
are placed on cues found in the voiceover's word timings, and the same cue
times are written to remotion-composer/src/haaland/data.json so picture and
sound hit together.
"""
import json
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[2]
A = ROOT/"projects/haaland-100s/audio"
OUT_JSON = ROOT/"remotion-composer/src/haaland/data.json"
SR = 48000
rng = np.random.default_rng(9)

vo = json.load(open(A/"vo.json", encoding="utf-8"))
SEC = {s["id"]: s for s in vo["sections"]}
TOTAL = vo["total"]
N = int(TOTAL * SR)


def W(sid, needle, nth=0, edge="s"):
    exact = needle.startswith("=")          # "=এক" matches the word এক only, not একটা
    hits = [w for w in SEC[sid]["words"] if (w["w"] == needle[1:] if exact else needle in w["w"])]
    return hits[min(nth, len(hits) - 1)][edge] if hits else SEC[sid]["start"]


# ----------------------------------------------------------------- cues
CUES = {
    "title": W("intro", "চলো"), "search": W("intro", "আজকের"), "name": W("intro", "আর্লিং"),
    "leeds": W("child", "লিডসে"), "bryne": W("child", "ব্রাইনে"), "dad": W("child", "বাবা"), "easy": W("child", "ভাবছো"),
    "small": W("child", "শোনা"), "giant": W("child", "সাড়ে"),
    "s_bryne": W("stairs", "ব্রাইন"), "s_molde": W("stairs", "মোল্ডে"), "s_salz": W("stairs", "সালজবুর্গ"),
    "s_dort": W("stairs", "ডর্টমুন্ড"), "s_city": W("stairs", "ম্যানচেস্টার"), "lift": W("stairs", "লিফট"),
    "goals": W("record", "৩৬"), "treble": W("record", "লিগ", 1), "trebleWord": W("record", "ট্রেবল"), "class": W("record", "আমরা"),
    "sleep": W("routine", "ঘুম"), "food": W("routine", "খাবারের"), "dadi": W("routine", "দাদিরা"), "zen": W("routine", "ধ্যানে"),
    "us": W("routine", "আমরা"), "reel": W("routine", "রিল"), "mood": W("routine", "মুড"),
    "wait": SEC["wait"]["start"], "wc22": W("wait", "২০২২"), "euro": W("wait", "ইউরো"), "y1998": W("wait", "১৯৯৮"),
    "noquit": W("wait", "অভিযোগ"), "work": W("wait", "চুপচাপ"), "y2026": W("wait", "২০২৬"), "iraq": W("wait", "ইরাকের"), "double": W("wait", "ডাবল"),
    "sen": W("run", "সেনেগালকে"), "fra": W("run", "ফ্রান্সের"), "fra41": W("run", "চার-এক"), "over": W("run", "শেষ"), "start": W("run", "শুরু"),
    "civ": W("run", "আইভরি"), "bra": W("run", "ব্রাজিল"), "min11": W("run", "১১"), "brag": W("run", "দুই", 0), "nb21": W("run", "নরওয়ে", 0),
    "qf": W("run", "ইতিহাসে"), "eng": W("run", "ইংল্যান্ডের"), "seven": W("run", "৭"), "hero": W("run", "হিরো"),
    "L0": W("lessons", "তাহলে"), "L1": W("lessons", "=এক"), "L2": W("lessons", "=দুই"), "L3": W("lessons", "=তিন"), "L4": W("lessons", "=চার"), "Lhist": W("lessons", "ইতিহাস"),
    "o_wc": SEC["outro"]["start"], "o_phone": W("outro", "ফোনটা"), "o_tag": W("outro", "ট্যাগ"), "o_me": W("outro", "রুবেল"), "o_end": W("outro", "শিখি", 0),
}
for s in SEC.values():
    CUES["sec_" + s["id"]] = s["start"]

# ----------------------------------------------------------------- synth helpers
t_ = lambda d: np.arange(int(d * SR)) / SR


def env(d, a=0.005, r=0.2):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4)); return e


def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def kick():
    t = t_(0.35); f = 45 + 80 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare():
    n = rng.normal(0, 1, int(0.2 * SR)); t = t_(0.2)
    return 0.6 * bp(n, 1500, 7000) * np.exp(-t * 22) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)


def hat(): return hp(rng.normal(0, 1, int(0.05 * SR)), 7000) * np.exp(-t_(0.05) * 70) * 0.5


def note(f, d, kind="saw", a=0.01, r=0.3):
    t = t_(d)
    if kind == "saw":
        x = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
    elif kind == "pad":
        x = sum(np.sin(2 * np.pi * f * (1 + dt) * t) for dt in (-0.004, 0, 0.005)) / 3
    else:
        x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    e = np.minimum(1, t / a) * (np.exp(-t / r) if kind != "pad" else np.minimum(1, (d - t) / 0.3))
    return x * e


def add(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += g * x[max(0, -i):j - i]


# ----------------------------------------------------------------- music
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
CH = [(261.63, 329.63, 392.0), (196.0, 246.94, 293.66), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63)]  # C G Am F
ROOTS = [65.41, 49.0, 55.0, 43.65]
mus = np.zeros(N)
wait_a, wait_b = CUES["wait"] - 0.3, CUES["double"]
lessons_a, outro_a = CUES["sec_lessons"], CUES["sec_outro"]
nbars = int(TOTAL / BAR) + 1
for b in range(nbars):
    t0 = b * BAR
    c = CH[b % 4]; root = ROOTS[b % 4]
    calm = wait_a <= t0 < wait_b - 0.01
    hot = CUES["sec_run"] - 0.1 <= t0 < lessons_a
    light = lessons_a <= t0 < outro_a
    for f in c:                                    # pad
        add(mus, note(f, BAR + 0.2, "pad"), t0, 0.05 if not calm else 0.08)
    if calm:
        continue
    for k in range(4):                             # drums
        bt = t0 + k * BEAT
        add(mus, kick(), bt, 0.9 if k in (0, 2) or hot else 0.0)
        if k in (1, 3): add(mus, snare(), bt, 0.45)
        for h in (0, 0.5):
            add(mus, hat(), bt + h * BEAT, 0.35 if not light else 0.2)
        if hot:
            add(mus, hat(), bt + 0.25 * BEAT, 0.2); add(mus, hat(), bt + 0.75 * BEAT, 0.2)
    for k in range(8):                             # bass, pumping 8ths
        add(mus, lp(note(root * (2 if k % 4 == 3 else 1), BEAT / 2, "saw", r=0.12), 900), t0 + k * BEAT / 2, 0.22)
    if hot or t0 >= outro_a:                       # pluck arpeggio
        for k in range(16):
            f = c[k % 3] * (2 if k % 6 < 3 else 4)
            add(mus, note(f, BEAT / 4 + 0.15, "pluck", r=0.09), t0 + k * BEAT / 4, 0.07)
# riser into "ডাবল গোল!"
d = wait_b - (wait_b - 3.0)
rt = t_(3.0); riser = bp(rng.normal(0, 1, len(rt)), 400, 6000) * (rt / 3.0) ** 2
add(mus, riser, wait_b - 3.0, 0.5)
# final chord
for f in CH[0]:
    add(mus, note(f, 2.5, "pad"), TOTAL - 2.6, 0.12)
mus = lp(mus, 12000)

# duck under the voice
v, sr_v = sf.read(A/"vo.wav")
if v.ndim > 1: v = v.mean(1)
v = np.pad(v, (0, max(0, N - len(v))))[:N]
e = np.sqrt(np.convolve(v ** 2, np.ones(4800) / 4800, mode="same"))
e = np.clip(e / (np.percentile(e[e > 1e-4], 90) + 1e-9), 0, 1)
gain = 1 - 0.62 * np.convolve(e, np.ones(9600) / 9600, mode="same")
mus = mus * gain

# ----------------------------------------------------------------- sfx
fx = np.zeros(N)


def whoosh():
    n = rng.normal(0, 1, int(0.5 * SR)); t = t_(0.5)
    out = np.zeros_like(n)
    for k in range(10):
        a, b = int(k * len(n) / 10), int((k + 1) * len(n) / 10)
        lo = 300 + 3000 * (k / 10); out[a:b] = bp(n, lo, lo * 2.2)[a:b]
    return out * np.sin(np.pi * t / 0.5) ** 2


def pop(): t = t_(0.08); return np.sin(2 * np.pi * (900 - 4000 * t) * t) * np.exp(-t * 60)
def ding(): t = t_(0.8); return sum(np.sin(2 * np.pi * 1318.5 * m * t) * np.exp(-t * (4 + m)) / m for m in (1, 2.4, 3.9))
def tick(): t = t_(0.03); return hp(rng.normal(0, 1, len(t)), 3000) * np.exp(-t * 200)


def boom():
    t = t_(1.4); f = 30 + 70 * np.exp(-t * 6)
    return 0.8 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5) + 0.4 * lp(rng.normal(0, 1, len(t)), 800) * np.exp(-t * 4)


def cheer(d=2.6):
    t = t_(d); n = bp(rng.normal(0, 1, len(t)), 500, 3500)
    return n * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 1.2) * (1 + 0.3 * np.sin(2 * np.pi * 3 * t))


def scratch():
    t = t_(0.5); f = 600 * np.sin(2 * np.pi * 3 * t) + 700
    return 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) * (bp(rng.normal(0, 1, len(t)), 200, 4000) * 0.5 + 0.5)


for s in vo["sections"][1:]:
    add(fx, whoosh(), s["start"] - 0.35, 0.35)
for k in ("title", "name", "leeds", "bryne", "dad", "giant", "s_bryne", "s_molde", "s_salz", "s_dort", "s_city", "lift", "trebleWord",
          "sleep", "food", "zen", "reel", "mood", "wc22", "euro", "y1998", "y2026", "sen", "civ", "eng", "L0", "o_phone", "o_tag"):
    add(fx, pop(), CUES[k], 0.4)
for k in ("L1", "L2", "L3", "L4", "seven", "qf"):
    add(fx, ding(), CUES[k], 0.3)
for k in ("goals", "double", "brag", "nb21", "o_end"):
    add(fx, boom(), CUES[k], 0.5)
for k in ("double", "brag", "qf", "hero"):
    add(fx, cheer(), CUES[k] + 0.1, 0.18)
add(fx, scratch(), CUES["fra41"], 0.45)
for i in range(int(CUES["goals"] * 10), int((CUES["goals"] + 1.4) * 10)):     # goal counter ticks
    add(fx, tick(), i / 10, 0.25)

# ----------------------------------------------------------------- mix
mix = 0.9 * v + 0.55 * mus + fx
mix = mix / max(1e-9, np.max(np.abs(mix))) * 0.95
sf.write(A/"mix.wav", np.stack([mix, mix], 1), SR)
sf.write(A/"music_only.wav", np.stack([mus, mus], 1) * 0.5, SR)

# ----------------------------------------------------------------- data for the picture
words = [w | {"sec": s["id"]} for s in vo["sections"] for w in s["words"]]
OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
OUT_JSON.write_text(json.dumps({
    "fps": 30, "total": TOTAL, "frames": int(np.ceil(TOTAL * 30)), "bpm": BPM,
    "sections": [{k: s[k] for k in ("id", "start", "end")} for s in vo["sections"]],
    "words": words, "cues": {k: round(x, 3) for k, x in CUES.items()},
}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"mix.wav {TOTAL:.2f}s; {len(words)} words; cues: " + ", ".join(f"{k}={CUES[k]:.2f}" for k in ("double", "fra41", "brag", "seven", "L4")))
