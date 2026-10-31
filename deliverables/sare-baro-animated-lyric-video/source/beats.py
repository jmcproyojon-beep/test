"""Tempo + beat grid + strong-onset list from the song (numpy spectral flux)."""
import json, numpy as np, soundfile as sf
x, sr = sf.read("/home/user/test/deliverables/sare-baro-music-video/audio/sare-baro.wav"); x = x.mean(1)
hop, n = 512, 2048; w = np.hanning(n)
fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * w
S = np.abs(np.fft.rfft(fr, axis=1)); S = np.log1p(S)
flux = np.maximum(0, np.diff(S, axis=0)).sum(1); flux = (flux - flux.mean()) / (flux.std() + 1e-9)
fps = sr / hop
ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
lags = np.arange(len(ac)) / fps; band = (lags > 60 / 180) & (lags < 60 / 70)
lag = lags[band][np.argmax(ac[band])]; bpm = 60 / lag
# phase: best offset aligning a grid with flux peaks
period = lag * fps; best = max(range(int(period)), key=lambda o: flux[o::int(round(period))][:400].sum() if True else 0)
beats = []; t = best / fps
while t < len(x) / sr: beats.append(round(t, 3)); t += lag
pk = [i for i in range(1, len(flux) - 1) if flux[i] > flux[i - 1] and flux[i] >= flux[i + 1] and flux[i] > 2.2]
strong = [round(i / fps, 3) for i in pk]
rms = np.sqrt((fr ** 2).mean(1)); env = (rms / rms.max()).round(3)
json.dump(dict(bpm=round(bpm, 2), beats=beats, strong=strong, env_fps=fps, env=env[::4].tolist()), open("/tmp/claude-0/-home-user-test/4a1619f7-9e1f-5b4c-b3f6-fe635e51cfcc/scratchpad/mv2/beats.json", "w"))
print("bpm", round(bpm, 1), "beats", len(beats), "first", beats[:4], "strong", len(strong))
