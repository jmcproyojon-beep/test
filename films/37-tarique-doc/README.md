# 37 · শুভ জন্মদিন — documentary tribute (1 min, 1920×1080)

A one-minute birthday tribute to Prime Minister Tarique Rahman, in the "vintage history documentary" grammar of the
client's reference: dark grunge paper with faint Bangla handwriting, archive photos on floating glass plates in
depth, gold serif headings over a white line, dust, scratches, flicker, warm light leaks. The past (1965, family
photos) is sepia; the present warms into colour. The film ends on «শুভ জন্মদিন» with golden bokeh.

- **Script:** the client's Bangla text, read in the client's own recording (assets/vo_user.wav, 56.8 s; scene cuts measured from its pauses);
  numbers were written out as words so they are read correctly. Each scene starts on its narrated line
  (timings measured from the voice with faster-whisper and silence detection).
- **Photos:** the client's Google Drive folder (44 WhatsApp images). The zip pack had only source links, no images.
  Graded with `prep.py` (S = sepia, W = warm colour, C = cut-out of the studio portrait).
- **Sound:** narration plus an ambient glass-pad bed (`mgaudio` ambient recipe) that blooms on the name, with soft
  whooshes on each plate move, ducked under the voice, −14 LUFS.

## Rebuild
```sh
# from mg-styles-15/ (demo copied to demos/37-tarique-doc)
python3 -I demos/37-tarique-doc/prep.py <folder with p01.jpg … p44.jpg>   # assets/photos + assets/paper.jpg
python3 demos/37-tarique-doc/audio.py                                    # out/audio.wav (needs assets/vo_user.wav)
MG_CPU=1 ../scripts/mg-render.sh demos/37-tarique-doc --workers 6        # out/37-tarique-doc.mp4
```
Not in git: `assets/photos/` (the client's photos), `assets/vo.*` and `out/`.
