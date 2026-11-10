# ক্যামেরা লাইটিং মাস্টারক্লাস — স্টুডিও থেকে আউটডোর

A 5:00 animated tutorial class (1920x1080), instructor রুবেল মিয়া, edit পালওয়ান (Paloan).
One self-contained HTML page: SVG + CSS + GSAP 3.12.5, Hind Siliguri + Inter embedded
(base64 woff2), no network needed. A 300 s GSAP master timeline; Play/Pause, scrub bar,
scene number + scene chips; Space = play/pause, ←/→ = ∓5 s.

```bash
node client-builds/lighting-masterclass/build.mjs
# -> projects/lighting-masterclass/lighting-masterclass.html
# -> projects/lighting-masterclass/voice-script.txt  (every line with its time window)
```

- `src/script.js`: scenes (timestamps from the brief) and the voice script split into
  subtitle lines; `timeLines()` spreads each scene's lines over its window by length.
  The subtitles, the instructor's lip-flap and every animation cue read those times.
- `src/app.js`: the instructor (blink, lip-flap, walk, point, wave, carry the stand,
  hold scrim/reflector), `makeFace()`, a live-lit portrait (each light = a tinted copy
  of the face masked by its light pool, nose/eye/chin shadows and the Rembrandt patch,
  softness = blur + gradient width, Kelvin colour, rim light), `makeLamp()` (click burst,
  flicker, glow bloom, cone), and the nine scenes.
- URL options: `?t=123` start at a time, `?autoplay=1`, `?capture=1` hides the player
  (for frame capture; `window.__seek(t)` and `window.__ready` are exposed).
