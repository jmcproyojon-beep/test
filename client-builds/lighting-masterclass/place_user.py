"""Lay the client's voice, line by line, on the video's scene cues + mix.

    python3.13 -I client-builds/lighting-masterclass/place_user.py

Each line clip (voice-times.json, from align_user.py) starts on that line's
cue in the video (script.js timing), so cards, lights and face changes land
on the words; a line never overlaps the next or crosses its scene's end.
Writes voice-lines.json (actual on-screen s/e for every line; build.mjs uses it
for subtitles + lip-flap) and the final mix with underscore and light clicks.
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from voice import music, clicks, SR, TOTAL  # noqa: E402

OUT = HERE.parents[1] / "projects/lighting-masterclass/audio"
VT = json.loads((HERE / "voice-times.json").read_text())
LINES = json.loads(subprocess.run(["node", "-e", "import('./src/script.js').then(m=>console.log(JSON.stringify(m.timeLines(m.SCENES, true))))"],
                                  cwd=HERE, capture_output=True, text=True, check=True).stdout)
SC = json.loads(subprocess.run(["node", "-e", "import('./src/script.js').then(m=>console.log(JSON.stringify(m.SCENES)))"],
                               cwd=HERE, capture_output=True, text=True, check=True).stdout)
END = {s["n"]: s["end"] for s in SC}

y, _ = librosa.load(OUT / "user/voice.wav", sr=SR, mono=True)
track = np.zeros(int(TOTAL * SR), np.float32)
placed, prev_end, prev_scene = [], 0.0, 0
for v, l in zip(VT, LINES):
    assert (v["scene"], v["i"]) == (l["scene"], l["i"])
    a, b = int(v["src_s"] * SR), int(v["src_e"] * SR)
    clip = y[a:b].copy()
    # trim the silence the cut points carry, keep a breath of air
    iv = librosa.effects.split(clip, top_db=38)
    if len(iv):
        clip = clip[max(0, iv[0][0] - int(0.03 * SR)): iv[-1][1] + int(0.08 * SR)]
    f = int(0.012 * SR); clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    d = len(clip) / SR
    t = l["s"] if v["scene"] != prev_scene else max(l["s"], prev_end + 0.2)
    late = t + d - (END[v["scene"]] - 0.15)
    if late > 0:
        t -= late
    i = int(t * SR)
    track[i:i + len(clip)] += clip[: len(track) - i]
    placed.append({"scene": l["scene"], "i": l["i"], "text": l["text"], "s": round(t, 2), "e": round(t + d, 2)})
    prev_end, prev_scene = t + d, v["scene"]
(HERE / "voice-lines.json").write_text(json.dumps(placed, ensure_ascii=False, indent=1))
for p in placed:
    print(f"{p['scene']}.{p['i']}  {p['s']:7.2f}-{p['e']:7.2f}  {p['text'][:50]}")

peak = np.abs(track).max() + 1e-9
track = track / peak * 0.9
m = music(placed)
env = np.sqrt(np.convolve(track ** 2, np.ones(4800) / 4800, mode="same"))
env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
m *= 1 - 0.6 * np.convolve(env, np.ones(12000) / 12000, mode="same")
mix = track + m * 0.9 + clicks(placed) * 0.6
mix = np.tanh(mix * 1.05) / 1.05
sf.write(OUT / "mix_user_raw.wav", np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_user_raw.wav"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR),
                str(OUT / "mix_user.wav")], check=True)
print("wrote", OUT / "mix_user.wav")
