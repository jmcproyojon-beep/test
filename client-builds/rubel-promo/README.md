# Rapar Rubel promo (Bangla, 2:37, 9:16)

A long-format Bangla promo built from rubelpublic.github.io. It follows the style of the client's agency reference:
- animated red-gradient scenes alternating with white ones
- kinetic Bangla type and cursor clicks
- glossy icons
- problem cards dropped into a bin
- service icons orbiting an "rr" core
- full-screen brand panels
- stat circles over a white wave
- big-word outro and an end card

## Story
1. Problems: manual work, English-only tools, content that doesn't sell.
2. Introduction: Rubel Miah, AI expert and AI workflow builder.
3. Five service areas: Strategy, AI, Product, Content, Operations.
4. The audience-first content method (listen, decode, frame, create, test) and the ক্রেতা সুরক্ষা example.
5. The ventures: Proyojon Shop, The AB Wardrobe, Vromon, Abashon, Prozukti and Solutions.
6. The AI products: MimAI, Gaan Banai and Paloan.
7. The AI Power User course: 10 classes, 18–20 hours, 70% hands-on.
8. Results.
9. Contact.

## Build
1. **Voice:** run `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I voice.py`. It uses bn-BD-PradeepNeural and writes `audio/vo.wav` and `remotion-composer/src/rubelpromo/vo.json`.
2. **Mix:** `python3.13 -I mix.py` writes `audio/mix.wav` (the voice plus a 112 bpm track and UI sounds, ducked under the voice).
3. **Picture:** from `remotion-composer`, run `npx remotion render src/rubelpromo/index.tsx RubelPromo ../client-builds/rubel-promo/promo-muted.mp4 --muted`, then mux it with `audio/mix.wav`.

The portrait is cropped from the site's "Starring" section into `public/rubelpromo/portrait.jpg`. The Anek Bangla and Inter fonts are inlined as data URLs.
