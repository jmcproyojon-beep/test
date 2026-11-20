# Purbachal: ৫টি ফ্যাক্ট (Proyojon Abashon)

A 45 s, 9:16 explainer cut to the client's Bangla voiceover. It follows the client's reference reel's editorial-collage look: cream paper, cut-out clouds, a grey road swoosh, a floating land island, a charcoal map silhouette with a red pin, counting numbers, and word-by-word captions where the spoken word is shown large.

| beat | visual |
|------|--------|
| Hook | The Marine City plot rises as a floating island (cut from the aerial, with a soil block); a pin drops; "৫টি ফ্যাক্ট" |
| 1 | A Purbachal silhouette whose planned-sector grid draws in; "প্রায় ৬,২০০ একর" counts up |
| 2 | Road swoosh from কুড়িল to পূর্বাচল with a car; "৩০০ ফিট" |
| 3 | Exhibition-centre illustration with bunting, then বাণিজ্য মেলা stalls and confetti |
| 4 | Purbachal → the Marine City site photo: "১ কিলোমিটার", a ৫ মিনিট clock, then zoom out to কুড়িল ফ্লাইওভার for ১৫ মিনিট |
| 5 | The multi-plot aerial; a counter runs ৫ → ২৫ কাঠা with chips; then the "সহজ হ্যান্ডওভার" key badge |
| CTA | Island, logo card, hotline, website, address, tagline |

The map is schematic, not to scale.

## Build
1. `python3.13 -I prep.py <multi-plot.jpg> <site.jpg>` writes `public/facts/{island.png, plots.jpg, site.jpg, logo.png}`.
2. `python3.13 -I align_vo.py <voice.wav> <whisper_words.json>` writes `audio/vo.wav` and `src/facts/vo.json`. Lines 7–8 needed a second, pause-cut Whisper pass.
3. `python3.13 -I mix.py` writes `audio/mix.wav`.
4. From `remotion-composer`: `npx remotion render src/facts/index.tsx Facts ../client-builds/purbachal-facts/facts-muted.mp4 --muted`, then mux with `audio/mix.wav`.
