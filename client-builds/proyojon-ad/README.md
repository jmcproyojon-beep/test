# Proyojon Abashon brand ad (Sabbir & Nusrat)

A 45 s, 9:16 cartoon ad built from the client's 12-line SRT script and two full-script voice takes, one male and one female. Sabbir's lines come from the male take and Nusrat's lines from the female take (`build_vo.py`).

The characters, office, Dhaka skyline and plot landscape are drawn in SVG in `remotion-composer/src/proyojonad/`. Brand material comes from proyojonabashon.com:
- the five project banners (Green Crest, AURORA, Alokananda, Oishi Bagan Bari, the Purbachal three-storey house)
- the green and gold palette
- the services: flat, plot and land share; buy, sell and rent
- the locations: Bashundhara, Jolshiri and Purbachal

## Scenes
| s | scene |
|---|-------|
| 0 | Sabbir whooshes in over a Dhaka skyline and points at the viewer |
| 6.3 | The location, calculator, flat and plot icons pop up; he scratches his head, then shrugs |
| 11.4 | Finger snap and sparkle burst into the office; Nusrat waves and introduces herself |
| 15.9 | Mini towers and plots pop up on the desk, then a location pin and a ৳ badge |
| 23.0 | "আমাদের প্রজেক্ট" montage of the website banners |
| 26.6 | Golden plot by the road and lake: "বাহ! এটাই তো আমার স্বপ্নের ঠিকানা!"; Nusrat walks in |
| 32.8 | Logo signboard pops up; thumbs up, then the CTA |
| 39.9 | End card: hotline, website and office address; both wave |

## Build
1. `python3.13 -I build_vo.py <male.wav> <female.wav>` writes `audio/dialogue.wav` and `src/proyojonad/vo.json` (line times plus 30 fps mouth envelopes).
2. `python3.13 -I mix.py` writes `audio/mix.wav`: a 112 bpm Karplus-Strong ukulele bed and cartoon cues, ducked under the dialogue.
3. From `remotion-composer`, run `npx remotion render src/proyojonad/index.tsx ProyojonAd ../client-builds/proyojon-ad/ad-muted.mp4 --muted`, then mux it with `audio/mix.wav`.

The website photos go in `public/proyojonad/web/` (gitignored); the URLs are in the comment in `ProyojonAd.tsx`.
