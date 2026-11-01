"""Stage the "Signal নাই" video's few files in remotion-composer/public/signal.

    python3 -I client-builds/signal-nai/prep_assets.py FONT_DIR

Everything on screen is drawn in code (remotion-composer/src/signal/). The
only files are the master, the fonts, and eight generated film-grain tiles
(noise per frame in headless Chrome is slow).

FONT_DIR holds the unpacked @fontsource packages (SIL Open Font License):
    npm pack @fontsource/anek-bangla @fontsource/baloo-da-2 \\
             @fontsource/press-start-2p @fontsource/anton @fontsource/space-mono
"""
import shutil, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/"remotion-composer/public/signal"
OUT.mkdir(parents=True, exist_ok=True)
FONTS = Path(sys.argv[1])

shutil.copy(ROOT/"projects/signal-nai/assets/audio/song.mp3", OUT/"song.mp3")
want = ["anek-bangla-bengali-800-normal", "anek-bangla-latin-800-normal",
        "anek-bangla-bengali-600-normal", "anek-bangla-latin-600-normal",
        "baloo-da-2-bengali-700-normal", "baloo-da-2-latin-700-normal",
        "press-start-2p-latin-400-normal", "anton-latin-400-normal",
        "space-mono-latin-400-normal", "space-mono-latin-700-normal"]
for name in want:
    src = next(FONTS.glob(f"*/package/files/{name}.woff2"))
    shutil.copy(src, OUT/f"{name}.woff2")

rng = np.random.default_rng(2004)
for i in range(8):
    g = rng.normal(128, 46, (512, 512)).clip(0, 255).astype(np.uint8)
    a = (np.abs(g.astype(int) - 128) * 0.55).clip(0, 70).astype(np.uint8)
    Image.merge("RGBA", [Image.fromarray(g)] * 3 + [Image.fromarray(a)]).save(OUT/f"grain{i}.png")

for f in sorted(OUT.iterdir()):
    print(f"  {f.name:40s} {f.stat().st_size // 1024:6d} KB")
