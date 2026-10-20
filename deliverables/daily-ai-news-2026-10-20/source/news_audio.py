"""Original synthesized news bed (pulse + pad) and SFX for Daily AI News 20 Oct; mixed under the narration to -14 LUFS."""
import json, subprocess
import numpy as np, soundfile as sf

P = "/home/user/test/projects/daily-ai-news-2026-10-20"
T = json.load(open(f"{P}/artifacts/timing.json"))
SR = 48000; DUR = T["video_duration"]; N = int(DUR * SR); t = np.arange(N) / SR
rng = np.random.default_rng(7)
note = lambda m: 440 * 2 ** ((m - 69) / 12)

# music: 112 BPM newsroom pulse — Dm, Bb, F, C pads + 8th-note synth pulse + soft kick
BPM = 112; beat = 60 / BPM; bar = 4 * beat
prog = [(50, 53, 57), (46, 50, 53), (41, 45, 48), (48, 52, 55)]
mus = np.zeros(N)
for i in range(int(DUR / bar) + 1):
    s0, s1 = int(i * bar * SR), min(N, int((i + 1) * bar * SR))
    if s0 >= N: break
    tt = np.arange(s1 - s0) / SR; env = np.minimum(1, np.minimum(tt / .2, (tt[-1] - tt + 1e-3) / .3))
    ch = prog[i % 4]
    for m in ch:
        mus[s0:s1] += 0.12 * (np.sin(2 * np.pi * note(m) * tt) + .3 * np.sin(2 * np.pi * note(m + 12) * tt)) * env
    for k in range(8):                                        # 8th-note pulse
        a0 = s0 + int(k * beat / 2 * SR); n = min(int(.18 * SR), N - a0)
        if n > 0:
            t2 = np.arange(n) / SR; mus[a0:a0 + n] += .09 * np.sign(np.sin(2 * np.pi * note(ch[k % 3] + 12) * t2)) * np.exp(-t2 * 18)
    for k in range(4):                                        # soft kick
        a0 = s0 + int(k * beat * SR); n = min(int(.25 * SR), N - a0)
        if n > 0:
            t2 = np.arange(n) / SR; mus[a0:a0 + n] += .5 * np.sin(2 * np.pi * (50 + 80 * np.exp(-t2 * 30)) * t2) * np.exp(-t2 * 14)
mus[:SR] *= np.linspace(0, 1, SR); mus[-3 * SR:] *= np.linspace(1, 0, 3 * SR)
mus /= np.max(np.abs(mus)) + 1e-9
sf.write(f"{P}/assets/music/bed.wav", np.stack([mus, mus], 1).astype(np.float32), SR)

sfx = np.zeros(N); cues = []
def add(at, sig, g, name):
    s0 = int(at * SR); n = min(len(sig), N - s0)
    if n > 0: sfx[s0:s0 + n] += g * sig[:n]; cues.append((round(at, 2), name))
def whoosh():
    n = int(.6 * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR; y = np.convolve(x, np.ones(40) / 40, "same")
    return y * np.sin(np.pi * tt / tt[-1]) ** 2 * 2.5
def hit():
    n = int(1.2 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 4) + .3 * rng.standard_normal(n) * np.exp(-tt * 20))
def blip(f=1400):
    n = int(.09 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 40)
def alert():
    n = int(.5 * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * 880 * tt) * (tt < .2) + np.sin(2 * np.pi * 660 * tt) * (tt >= .25)) * .5
add(0.05, hit(), .45, "news hit (open)")
for s in T["scenes"][1:]:
    add(s["start"] - .15, whoosh(), .35, f"whoosh → {s['id']}")
    add(s["narr_start"] + .4, blip(), .25, f"tag blip {s['id']}")
add(T["scenes"][5]["narr_start"] + 1.0, alert(), .2, "soft security tone")
add(T["scenes"][6]["start"] + .2, hit(), .35, "outro hit")
sfx /= max(1.0, np.max(np.abs(sfx)) * 1.05)
sf.write(f"{P}/assets/audio/sfx.wav", np.stack([sfx, sfx], 1).astype(np.float32), SR)
json.dump(cues, open(f"{P}/artifacts/sfx_cues.json", "w"), ensure_ascii=False, indent=1)

A = f"{P}/assets/audio"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{A}/narration.wav", "-i", f"{P}/assets/music/bed.wav", "-i", f"{A}/sfx.wav", "-filter_complex",
                "[0:a]highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=8:release=160,afade=t=in:d=0.02,asplit=2[v][sc];[1:a]volume=0.2[m];"
                "[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=30:release=400[md];[2:a]volume=0.6[fx];[v][md][fx]amix=inputs=3:normalize=0,"
                "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.79:level=false,aresample=48000[o]", "-map", "[o]", f"{A}/final_mix.wav"], check=True)
print("audio done", len(cues))
