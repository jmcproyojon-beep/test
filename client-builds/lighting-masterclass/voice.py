"""Soundtrack for the lighting class MP4: male Bangla voiceover + underscore + light clicks.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I client-builds/lighting-masterclass/voice.py

Each subtitle line (timed by src/script.js -> lines.json) is spoken by Microsoft
neural TTS bn-BD-PradeepNeural (male) and fitted inside its own time window
(faster rate, then a gentle time-stretch if still long), so voice, subtitles and
the instructor's lip-flap stay together. A soft pad/pluck underscore ducks under
the voice; a light "click" plays wherever a light switches on.
"""
import asyncio, json, os, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa
from scipy.signal import butter, sosfilt
import edge_tts

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
OUT = ROOT / "projects/lighting-masterclass/audio"
SR, TOTAL = 48000, 300.0
VOICE = "bn-BD-PradeepNeural"
rng = np.random.default_rng(3)


def lines():
    js = "import('./src/script.js').then(m=>console.log(JSON.stringify(m.timeLines())))"
    return json.loads(subprocess.run(["node", "-e", js], cwd=HERE, capture_output=True, text=True, check=True).stdout)


async def say(text, rate, path):
    c = edge_tts.Communicate(text, VOICE, rate=f"{rate:+d}%", proxy=os.environ.get("HTTPS_PROXY"))
    await c.save(str(path))


def load_trim(path):
    y, _ = librosa.load(path, sr=SR, mono=True)
    iv = librosa.effects.split(y, top_db=40)
    return y[max(0, iv[0][0] - int(0.02 * SR)): iv[-1][1] + int(0.05 * SR)]


async def voice_track(L):
    (OUT / "lines").mkdir(parents=True, exist_ok=True)
    track = np.zeros(int(TOTAL * SR), np.float32)
    report = []
    for l in L:
        room = l["e"] - l["s"]
        rate, y = 0, None
        for rate in (0, 10, 20, 30):
            p = OUT / "lines" / f"s{l['scene']}_{l['i']}_{rate}.mp3"
            if not p.exists():
                await say(l["text"], rate, p)
            y = load_trim(p)
            if len(y) / SR <= room:
                break
        if len(y) / SR > room:
            y = librosa.effects.time_stretch(y, rate=min(1.25, len(y) / SR / room))
        y = y / (np.abs(y).max() + 1e-9) * 0.9
        i = int(l["s"] * SR)
        track[i:i + len(y)] += y[: len(track) - i]
        report.append((l["scene"], l["i"], round(room, 2), round(len(y) / SR, 2), rate))
    return track, report


# ------------------------------------------------------------------ music + clicks
t_ = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += g * x[: j - i]


def note(f, d, pad=False):
    t = t_(d)
    if pad:
        x = sum(np.sin(2 * np.pi * f * (1 + dt) * t) for dt in (-0.003, 0, 0.004)) / 3
        return x * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.minimum(1, t / 0.005) * np.exp(-t / 0.35)


def music(L):
    m = np.zeros(int(TOTAL * SR))
    BPM = 84; BEAT = 60 / BPM; BAR = 4 * BEAT
    prog = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 196.0, 261.63), (196.0, 246.94, 293.66)]  # Am F C G
    outdoor = (240.0, 280.0)
    for b in range(int(TOTAL / BAR) + 1):
        t0 = b * BAR; c = prog[b % 4]
        for f in c:
            add(m, note(f / 2, BAR + 1.0, pad=True), t0, 0.05)
        if t0 < 1.5 or t0 > TOTAL - 4:
            continue
        bright = 1.4 if outdoor[0] <= t0 < outdoor[1] else 1.0
        for k in range(8):
            if k in (0, 3, 5, 6):
                add(m, note(c[(k * 2) % 3] * 2, 0.8), t0 + k * BEAT / 2, 0.035 * bright)
    for f in prog[2]:
        add(m, note(f / 2, 5.0, pad=True), TOTAL - 5.0, 0.07)
    m = lp(m, 7000)
    fade = np.ones_like(m); n = int(1.5 * SR); fade[:n] = np.linspace(0, 1, n); fade[-n:] = np.linspace(1, 0, n)
    return m * fade


def click():
    t = t_(0.06)
    return hp(rng.normal(0, 1, len(t)), 1800) * np.exp(-t * 120) + 0.5 * np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 90)


def hum(d=0.5):
    t = t_(d); return lp(rng.normal(0, 1, len(t)), 500) * np.exp(-t * 6) * 0.6


def clicks(L):
    cue = {(l["scene"], l["i"]): l["s"] for l in L}
    ons = [0.9, 50.4, 95.3, cue[(4, 1)] - 0.4, cue[(5, 1)] + 0.5, cue[(5, 3)] + 0.5, cue[(5, 6)] + 0.5, cue[(5, 8)] + 1.2,
           280.3, 280.55, 280.8]
    offs = [cue[(9, 5)] + 0.9, cue[(9, 5)] + 1.6, cue[(9, 5)] + 2.3]
    fx = np.zeros(int(TOTAL * SR))
    for t in ons:
        add(fx, click(), t, 0.5); add(fx, hum(), t + 0.02, 0.12)
    for t in offs:
        add(fx, click(), t, 0.35)
    return fx


async def main():
    L = lines()
    v, report = await voice_track(L)
    over = [r for r in report if r[3] > r[2] + 0.01]
    print(f"{len(report)} lines voiced; rate bumps: {sum(1 for r in report if r[4])}; still long: {over}")
    m = music(L)
    env = np.sqrt(np.convolve(v ** 2, np.ones(4800) / 4800, mode="same"))
    env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
    m *= 1 - 0.6 * np.convolve(env, np.ones(12000) / 12000, mode="same")
    mix = v + m * 0.9 + clicks(L) * 0.6
    mix = np.tanh(mix * 1.05) / 1.05
    sf.write(OUT / "mix_raw.wav", np.stack([mix, mix], 1), SR)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "mix_raw.wav"), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), str(OUT / "mix.wav")], check=True)
    print("wrote", OUT / "mix.wav")


if __name__ == "__main__":
    asyncio.run(main())
