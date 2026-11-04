# "১০০ সেকেন্ডে শিখি" — আর্লিং হালান্ড (Rubel Miah)

Vertical 1080×1920 motion-graphics short for Reels / Shorts / TikTok, from the
creator's script. Output: `projects/haaland-100s/renders/100-sekende-shikhi-haaland.mp4`;
post with `caption.txt`.

- **Voice** (`vo.py`): Microsoft neural TTS, bn-BD-PradeepNeural, the script's
  text section by section (emoji removed; ৪–১ → "চার-এক" etc. so it reads
  right). The script runs ~2:20 at a natural pace, not 2:00 — fitting it into
  the script's windows needed +40% speed and still overran — so the video
  follows the voice (2:24). Serious section slower/lower, World Cup run faster.
- **Sound** (`build_audio.py`): synthesised 100 BPM bed (drops to a pad for
  "অপেক্ষার গল্প", riser into "ডাবল গোল!"), ducked under the voice; whoosh,
  pop, ding, boom, cheer, scratch on cues taken from the spoken words.
  Writes the cue sheet the animation uses.
- **Picture** (`remotion-composer/src/haaland/story.tsx`): told as a story,
  not cards. Rubel (cartoon host) opens on his phone, returns with his
  notebook for the lessons and closes it; between, the boy from Bryne lives
  it — Leeds 2000, snowy Bryne, dad's photo, the smallest boy on the youth
  pitch and the team photo years later, a staircase through five cities, a
  record night, his routine vs ours (with a দাদি), grey rainy years and the
  tunnel to 2026, the World Cup on one stadium's big screen. Chapter titles,
  the script's on-screen lines placed in the world, countdown ring, Bangla
  word-highlight captions. Stylised #9 player, no club badges or likeness.
  Only the scores the script states are shown (other wins read "জয়").
- **Mix** (`mux.py`): loudness-normalised to −14 LUFS for social platforms.

    SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3.13 -I client-builds/haaland-100s/vo.py
    python3.13 -I client-builds/haaland-100s/build_audio.py
    cd remotion-composer && npx remotion render src/index.tsx HaalandShort ../projects/haaland-100s/renders/picture.mp4 --muted
    python3 -I client-builds/haaland-100s/mux.py
