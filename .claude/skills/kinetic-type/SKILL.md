---
name: kinetic-type
description: Make short kinetic typography / motion-graphics videos and lyric videos in Remotion, in four reference looks (A brand promo black/white slams, B teal lyric type with icons, C warm 3D collage, D soft minimal). Use when the user asks for kinetic typography, a motion-graphics text video, an animated lyric video, a brand promo made of type, or names style A/B/C/D.
---

## Notes for this workspace (read first)

- The Remotion project is `remotion-composer/`. Give each video its own standalone entry file (like `src/sb-index.tsx`) so the shared Root's Google Fonts loading is skipped. Google Fonts are blocked here, so use local fonts instead of `@remotion/google-fonts`: system Noto Sans/Serif Bengali (`apt-get install -y fonts-noto-core` if missing) and the Hind Siliguri / Bricolage files in `remotion-composer/public/brand/fonts` (load with `FontFace` + `delayRender`).
- Render with `REMOTION_BROWSER_EXECUTABLE` pointing at the pre-installed headless Chromium (`/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`).
- For music: analyse the song (beats, bass, onsets) and time lyrics to the actual singing. Show the user's official lyrics word for word, and confirm credits with the user.
- Default to delivering both 16:9 and 9:16 when the user wants social and YouTube versions. Files sent in chat must be under 30 MB (two-pass encode), and the HQ copy stays in `output/`.

You are a senior motion designer working in code. This project makes short (15–60 s) **kinetic typography / motion-graphics videos** with **Remotion** (React → MP4). Read this whole file before writing any scene.

---

## 1. The style we are copying (from 4 reference videos)

| Ref | Look | What to steal |
|---|---|---|
| **A — Brand promo (Optious style)** | Black ↔ white hard cuts, bold geometric sans (Montserrat/Inter Black), neon/iridescent fluid textures inside frames, outlined "ghost" text walls, giant cropped letters | One-word-per-beat pacing, scale slams, rows of repeating text scrolling opposite directions, outline vs. filled text, emoji/icon popping next to a word, logo reveal in script font, mask wipes |
| **B — Lyric kinetic type (Maps style)** | Dark teal radial gradient + drifting star particles, thin light font for small words, heavy bold for key word, small icons (speech bubble, box) that illustrate the word | Weight contrast (thin "setup" words + heavy "punch" word), striped/pattern fill on the punch word, 3D-ish camera push between lines, words flying into objects, map/line-draw transitions |
| **C — 3D collage (After The Storm style)** | Vertical 9:16, warm yellow/orange/sky-blue, condensed ultra-bold type, cut-out photos, clouds, sunflowers, flat-lay props | Layered depth (BG → text → cut-out subject → foreground clouds), text partly *behind* subject, parallax, curved text on a circle/plate, sticker-like props popping in |
| **D — Soft minimal (Cupid style)** | Off-white BG, one accent colour (soft blue), clean sans, simple flat icons (door, umbrella, window), light rays, falling dots | An object replaces a letter (door = "I"), line-draw rounded boxes, gentle floaty easing, handwritten small text, calm credits card |

**Common DNA of all four:**
1. Text IS the visual. Every word that matters gets its own moment.
2. Rhythm: each beat = 0.3–0.8 s. Nothing sits still longer than ~1.2 s.
3. Strong hierarchy: one dominant word per frame, small helper words around it.
4. Every entrance has an exit — no hard pops unless it's a deliberate "slam" on a beat.
5. Small illustrative icons/objects reinforce the meaning of the word.
6. Smooth easing (overshoot springs for punchy, ease-in-out for calm).

---

## 2. Tech stack (do not change unless asked)

- **Remotion** (latest) + React + TypeScript
- Fonts via `@remotion/google-fonts` (Montserrat, Inter, Bebas Neue, Anton, Pacifico, Poppins; Bangla: **Hind Siliguri**, **Noto Sans Bengali**, **Baloo Da 2**)
- Optional: `@remotion/transitions`, `@remotion/paths` (line draw), `@remotion/noise` (particles), `@remotion/three` (only if real 3D is asked for)
- Audio: put the track in `public/audio/` and use `<Audio>`; images/cut-outs in `public/img/`
- Default output: **1920×1080 @ 30 fps** (landscape). For Reels/Shorts/TikTok: **1080×1920 @ 30 fps**.

---

## 3. Project structure

```
src/
  Root.tsx              // registers compositions
  theme.ts              // colours, fonts, timing constants
  lib/
    easing.ts           // shared springs/easings
    timing.ts           // beat → frame helpers
  components/           // reusable animated primitives
    WordSlam.tsx        // big word scales in from 3x with overshoot
    TypeOn.tsx          // letter-by-letter reveal
    SplitLetters.tsx    // per-letter stagger (y + opacity + rotate)
    MaskReveal.tsx      // text revealed by sliding rectangle mask
    OutlineText.tsx     // stroke-only text (-webkit-text-stroke)
    MarqueeRows.tsx     // repeating rows scrolling opposite directions
    WeightPair.tsx      // thin setup line + heavy punch word
    IconPop.tsx         // SVG/emoji icon pops next to a word
    LineDraw.tsx        // SVG path draw-on (boxes, maps, underlines)
    Particles.tsx       // drifting stars / dots / falling circles
    GradientBG.tsx      // radial gradient + subtle grain
    Layered.tsx         // BG / text / subject / FG parallax stack
    FlashCut.tsx        // 2-frame black↔white invert
  scenes/
    Scene01_*.tsx ...   // one file per scene
  Video.tsx             // stitches scenes with <Series> or <TransitionSeries>
public/
  audio/  img/  fonts/
script.md               // the words + timing sheet (source of truth)
```

---

## 4. Workflow you must follow every time

1. **Read `script.md`.** If it doesn't exist, ask the user for: the text/script, aspect ratio, duration, style ref (A/B/C/D or mix), colours, music file.
2. **Write a beat sheet** at the top of `script.md`: a table of `beat # | start (s) | word(s) | animation | visual/icon`. If music is supplied and BPM is known, snap beats to `60/BPM` seconds. Show it to the user before coding.
3. **Build `theme.ts` first** (palette, fonts, `FPS`, `BEAT`).
4. **Build/reuse primitives in `components/`** — never inline the same animation twice.
5. **Build scenes one at a time**, each its own `<Sequence>`; keep each scene 1–4 s.
6. Run `npx remotion studio` so the user can preview. Fix anything they flag.
7. Render: `npx remotion render Video out/video.mp4` (add `--codec=h264 --crf=18` for quality).

---

## 5. Animation rules (hard rules)

- **Only animate with `useCurrentFrame()` + `interpolate()` / `spring()`.** Never use CSS transitions, `setTimeout`, or `requestAnimationFrame` — they won't render.
- Always pass `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` to `interpolate`.
- Animate only `transform` (translate/scale/rotate), `opacity`, `clip-path`, `filter: blur()`, and SVG `strokeDashoffset`. Don't animate `width/height/top/left`.
- **Springs:** punchy = `{damping: 12, stiffness: 200, mass: 0.6}`; smooth = `{damping: 200}`; bouncy icon = `{damping: 8, stiffness: 150}`.
- **Easing for interpolate:** `Easing.bezier(0.16, 1, 0.3, 1)` (expo-out) for entrances, `Easing.bezier(0.7, 0, 0.84, 0)` (expo-in) for exits.
- **Stagger** letters 1–2 frames apart, words 3–5 frames apart.
- **Entrance ≈ 8–12 frames, hold ≥ 10 frames, exit ≈ 6–8 frames** at 30 fps.
- Motion blur feel: add `filter: blur(Npx)` proportional to speed during fast moves, 0 when settled.
- Text must stay inside a 5 % safe margin unless it's intentionally cropped "giant type".
- Every scene ends cleanly (exit animation or hard cut on a beat). No dangling elements.
- Use `<AbsoluteFill>` for layering; z-order = BG → back text → subject → front text → FG particles.

---

## 6. Typography rules

- Max **2 font families** per video (one display, one body). Optional third = script font for the logo only.
- **Hierarchy:** punch word 180–400 px (landscape) / weight 800–900; helper words 40–80 px / weight 200–400.
- Tight tracking on bold (`letterSpacing: -0.03em`), wide tracking on thin caps (`0.15em`).
- Uppercase for punch words, sentence case or lowercase for helpers.
- Fill variants to rotate through: solid, outline (`WebkitTextStroke: '3px #fff', color: 'transparent'`), striped (`backgroundImage: repeating-linear-gradient(...)` + `backgroundClip: 'text'`), gradient/iridescent, image-filled.
- Bangla text: use Hind Siliguri / Noto Sans Bengali, never split Bangla conjuncts per-letter — animate per **word** instead.

---

## 7. Colour presets (pick one in `theme.ts`)

```ts
export const PRESETS = {
  brandBW:   { bg: '#000000', fg: '#FFFFFF', alt: '#FFFFFF', accent: '#0A9CFF', grad: ['#ff3cac','#784ba0','#2b86c5'] }, // Ref A
  tealNight: { bg: '#0d3b3a', fg: '#4fb3a0', alt: '#e8e3d9', accent: '#e8735a', grad: ['#145c58','#071f1e'] },          // Ref B
  sunCollage:{ bg: '#63d3dc', fg: '#f6c21c', alt: '#ffffff', accent: '#f08a24', grad: ['#7fe0e6','#f6c21c'] },           // Ref C
  softBlue:  { bg: '#f1f1f1', fg: '#4a8fe7', alt: '#2d2d2d', accent: '#9cc3f5', grad: ['#ffffff','#dbe8fb'] },           // Ref D
};
```

---

## 8. Signature moves library (implement as components)

1. **WordSlam** – scale 3 → 1 with punchy spring + blur 20 → 0. Optional 2-frame screen shake.
2. **WeightPair** – thin line fades/tracks in (letterSpacing 0.4em → 0.15em), heavy word springs up from y+80.
3. **MarqueeRows** – 4–6 rows of the brand word, alternating outline/filled, alternating direction, slight skew.
4. **MaskReveal** – `clipPath: inset(0 X% 0 0)` wipe, or text rising from behind a hard line.
5. **IconPop** – icon scales 0 → 1.15 → 1 with bouncy spring, small rotate wiggle.
6. **ObjectAsLetter** – an SVG object (door, bulb, pin) takes a letter's place, then animates (door opens → light ray).
7. **InvertFlash** – 2-frame swap of bg/fg on a beat.
8. **GiantCrop** – one letter scaled to 800 %+ filling the frame, slowly drifting, used as a transition.
9. **FrameInFrame** – nested rectangles with a fluid/gradient texture inside, zooming through them.
10. **LineDraw** – SVG path stroke-dash animation for boxes, underlines, maps, arrows.
11. **ParallaxLayers** – BG moves 0.2×, text 0.5×, subject 1×, FG clouds 1.4× of a slow camera drift.
12. **CurvedText** – text on an SVG circle `<textPath>`, rotating slowly.
13. **Particles** – 60–120 deterministic dots (use `random(seed)` from `remotion`, never `Math.random`).
14. **LogoReveal** – script/logo font draws on or springs in, cursor/arrow icon clicks it, end card.

---

## 9. Quality checklist before saying "done"

- [ ] Beat sheet exists and matches the scenes
- [ ] No frame where the screen is empty for more than 4 frames (unless intentional)
- [ ] Every word readable for ≥ 10 frames
- [ ] Only frame-driven animation; no `Math.random`, no CSS transitions
- [ ] Fonts loaded via `loadFont()` before use
- [ ] Studio preview checked at 0.25× speed on at least 3 transitions
- [ ] Rendered MP4 plays with audio in sync

---

## 10. Copyright guardrails

- Don't put copyrighted song lyrics or other people's logos/characters in videos for publishing unless the user owns the rights. Use the user's own script, brand, or licensed/royalty-free music.
- Photos/cut-outs must be the user's own or licensed.
