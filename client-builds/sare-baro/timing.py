"""Time the artist's lyric sheet for "সাড়ে বারো" to the vocal — no ASR.

    python3.13 -I client-builds/sare-baro/timing.py      # writes timing.json, prints the table

No speech recognition was available (ElevenLabs out of credits, no local
model), so the timings are read from the audio itself:

1. The vocal is separated from the beat (REPET-SIM: the repeating
   accompaniment is the nearest-neighbour median of similar frames).
2. Section windows come from the song's structure. Chroma matching shows
   the hook's "বাজে সাড়ে বারো ×2" (33-39 s) recurring at 100.5 s and 112.5 s
   (r = 0.99), so the hook is sung three times: at 28.0, 95.5 and 107.5 s.
3. Inside a verse window, the line breaks are chosen by dynamic programming
   among the vocal's pauses (minima of the vocal envelope), so that each
   line's length is close to its share of the window by syllable count.
4. Words are placed by syllable weight and snapped to the nearest vocal onset.

Accuracy is phrase-level (a few tenths of a second), not word-perfect ASR.
"""
import json, re
from pathlib import Path
import numpy as np
import librosa

HERE = Path(__file__).parent
A = Path(__file__).resolve().parents[2]/"projects/sare-baro/assets/audio"
OUT = HERE/"timing.json"

SECTION = re.compile(r"^#{2,}\s*\[(.+?)\]\s*$")


def sheet():
    sec, out = "Intro", {}
    for raw in (HERE/"lyrics.md").read_text(encoding="utf-8").splitlines():
        s = raw.strip()
        if not s or s.startswith("# ") or (s.startswith("*") and s.endswith("*")):
            continue
        m = SECTION.match(s)
        if m:
            sec = m.group(1); continue
        out.setdefault(sec, []).append(s)
    return out


CONS = set(chr(c) for c in range(0x0995, 0x09BA)) | set("ড়ঢ়য়ৎ")
VOW = set(chr(c) for c in range(0x0985, 0x0995))


def syl(text):
    """Approximate syllables: vowels + consonants not followed by hasanta."""
    n = 0
    for i, ch in enumerate(text):
        nxt = text[i + 1] if i + 1 < len(text) else ""
        if ch in VOW or (ch in CONS and nxt != "্"):
            n += 1
    return max(1, n)


y, sr = librosa.load(A/"vocal_est.wav", sr=22050)
HOP = 256
FPS = sr / HOP
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
env = S[(fr > 250) & (fr < 3500)].sum(0)
env = np.convolve(env, np.hanning(9) / np.hanning(9).sum(), mode="same")
env /= np.percentile(env, 97)
ons = librosa.onset.onset_detect(y=y, sr=sr, hop_length=HOP, units="time", backtrack=True)


def e_at(t):
    return float(env[min(len(env) - 1, max(0, int(t * FPS)))])


def first_voice(a, b, thr=0.25):
    for k in range(int(a * FPS), int(b * FPS)):
        if env[k] > thr:
            return k / FPS
    return a


def last_voice(a, b, thr=0.2):
    for k in range(int(b * FPS) - 1, int(a * FPS), -1):
        if env[k] > thr:
            return k / FPS
    return b


def silence(a, b, thr=0.15):
    seg = env[int(a * FPS):int(b * FPS)]
    return float((seg < thr).sum() / FPS)


def place(lines, a, b):
    """Split window [a,b] among lines at vocal pauses (DP)."""
    a, b = first_voice(a, b), last_voice(a, b)
    w = np.array([syl(l) for l in lines], float)
    exp = (b - a) * w / w.sum()
    grid = np.arange(a + 0.3, b - 0.3, 0.05)
    cand = [t for t in grid if e_at(t) <= min(e_at(t - 0.15), e_at(t + 0.15)) + 1e-6]
    pts = [a] + cand + [b]
    n, m = len(lines), len(pts)
    INF = 1e18
    cost = np.full((n + 1, m), INF); back = np.zeros((n + 1, m), int)
    cost[0][0] = 0
    for i in range(1, n + 1):
        for j in range(1, m):
            if i == n and j != m - 1:
                continue
            for k in range(j):
                if cost[i - 1][k] >= INF:
                    continue
                s0 = first_voice(pts[k], pts[j])
                d = pts[j] - s0
                c = ((d - exp[i - 1]) / exp[i - 1]) ** 2 + (0 if j == m - 1 else 2.5 * e_at(pts[j]))
                c += 3.0 * max(0.0, silence(s0, pts[j]) - 0.45)   # a line does not sing through a pause
                if cost[i - 1][k] + c < cost[i][j]:
                    cost[i][j] = cost[i - 1][k] + c; back[i][j] = k
    cuts, j = [], m - 1
    for i in range(n, 0, -1):
        cuts.append(pts[j]); j = back[i][j]
    cuts.append(pts[j]); cuts.reverse()
    return [(first_voice(cuts[i], cuts[i + 1]), cuts[i + 1]) for i in range(n)]


def words(text, s, e):
    ws = text.split()
    wt = np.array([syl(x) for x in ws], float)
    edges = s + (e - s) * np.concatenate([[0], np.cumsum(wt) / wt.sum()])
    starts = [s]
    for k in range(1, len(ws)):
        near = [o for o in ons if abs(o - edges[k]) < 0.22 and o > starts[-1] + 0.08]
        starts.append(min(near, key=lambda o: abs(o - edges[k])) if near else edges[k])
    out = []
    for k, x in enumerate(ws):
        end = starts[k + 1] - 0.03 if k + 1 < len(ws) else e
        out.append({"w": x, "s": round(float(starts[k]), 3), "e": round(float(max(end, starts[k] + 0.08)), 3)})
    return out


def hook(H, last_end=None, last=True):
    """The hook's internal timing, measured on its first occurrence (28.0 s)
    from the vocal envelope; later hooks share the same musical bars."""
    L = SH["Hook"]
    rel = [(0.3, 1.85), (1.9, 4.0), (4.95, 7.6), (8.1, 10.4), (11.3, 15.5)]
    out = []
    for i, (txt, (s, e)) in enumerate(zip(L, rel)):
        if i == 4 and not last:
            continue
        ee = H + e if not (i == 4 and last_end) else last_end
        out.append(("Hook", txt, H + s, ee))
    return out


SH = sheet()
plan = []
v1 = SH["Verse 1"]
plan += [("Verse 1", t, s, e) for t, (s, e) in zip(v1[:3], place(v1[:3], 5.85, 14.1))]   # 4.8-5.5 s is a lead-in; the phrases start ~6.0, 9.2, 12.0
plan += [("Verse 1", t, s, e) for t, (s, e) in zip(v1[3:], place(v1[3:], 16.2, 26.4))]
plan += hook(28.0)
v2 = SH["Verse 2"]
plan += [("Verse 2", t, s, e) for t, (s, e) in zip(v2, place(v2, 46.0, 69.0))]
br = SH["Bridge"]
plan += [("Bridge", t, s, e) for t, (s, e) in zip(br[:-1], place(br[:-1], 69.0, 89.55))]
plan += [("Bridge", br[-1], 89.6, 95.2)]          # the big hit
plan += hook(95.5, last_end=107.4)
plan += hook(107.5, last=False)
plan += [("Outro", SH["Outro"][0], 118.8, 123.6)]

lines = []
for sec, txt, s, e in plan:
    s, e = round(float(s), 2), round(float(e), 2)
    lines.append({"section": sec, "text": txt, "s": s, "e": e, "words": words(txt, s, max(s + 0.3, e - 0.05))})
json.dump({"lines": lines}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for l in lines:
    print(f"  {l['s']:7.2f} {l['e']:7.2f} [{l['section']:>7}] {l['text']}")
