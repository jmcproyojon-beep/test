"""Render each lyric line to a tight RGBA strip, sized for the source video.

libass is NOT usable for this: ffmpeg's subtitles filter here exposes no
`shaping` option, and with the default shaper libass reorders Bengali vowel
signs — অচেনা comes out as অচনো — and misplaces trailing punctuation. Pillow
with raqm shapes correctly, so every line is drawn here and composited as an
image instead.

Each PNG is cropped to its own text, not the full frame, so burning 31 of them
in one pass stays cheap.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features

sys.path.insert(0, str(Path(__file__).parent))
from srt_lyrics import lines

P = Path("projects/vebacheka-mv")
OUT = P/"assets/overlays"

# Pillow only shapes Bengali correctly when it is built against raqm. Without
# it the vowel signs reorder exactly the way libass does — and it fails
# silently, producing text that looks fine until you read it. Refuse to render
# rather than burn mangled lyrics into a finished video.
if not features.check("raqm"):
    raise SystemExit(
        "This Pillow has no raqm, so it cannot shape Bengali and would render\n"
        "the lyrics wrong without saying so. Install it with:\n"
        "    pip install --upgrade 'pillow[raqm]'\n"
        "or on Debian/Ubuntu: apt install libraqm0\n"
        "Verify with: python -c \"from PIL import features; print(features.check('raqm'))\""
    )

_BUNDLED = Path(__file__).parent/"fonts"/"NotoSerifBengali-Bold.ttf"
_SYSTEM = [
    "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf",
    "C:/Windows/Fonts/NotoSerifBengali-Bold.ttf",
    "/Library/Fonts/NotoSerifBengali-Bold.ttf",
]
BN_B = str(_BUNDLED) if _BUNDLED.exists() else next(
    (p for p in _SYSTEM if Path(p).exists()), None)
if BN_B is None:
    raise SystemExit("No Noto Serif Bengali found, and the bundled copy is missing from "
                     f"{_BUNDLED.parent}")


def build(w, h, outdir=OUT):
    outdir.mkdir(parents=True, exist_ok=True)
    k = h / 1080.0
    size = round(58 * k)
    stroke = max(1, round(2.2 * k))
    pad = round(26 * k)
    bottom = round(96 * k)           # distance from frame bottom to text baseline block
    maxw = round(w * 0.86)
    font = ImageFont.truetype(BN_B, size)
    asc, desc = font.getmetrics()
    lh = asc + desc + round(10 * k)

    def wrap(text):
        """Spaces only — splitting inside a Bengali word destroys its shaping."""
        words, rows, cur = text.split(), [], ""
        for word in words:
            trial = f"{cur} {word}".strip()
            if font.getlength(trial) <= maxw or not cur:
                cur = trial
            else:
                rows.append(cur); cur = word
        if cur:
            rows.append(cur)
        return rows

    meta = []
    for i, l in enumerate(lines()):
        rows = wrap(l["text"])
        tw = max(font.getlength(r) for r in rows)
        iw = int(tw) + pad * 2
        ih = lh * len(rows) + pad * 2
        img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        for j, row in enumerate(rows):
            x = (iw - font.getlength(row)) / 2
            y = pad + j * lh
            # soft drop shadow, then a crisp dark outline: reads on bright and
            # dark footage alike without needing a box behind it
            for dx, dy, a in ((0, round(4 * k), 120), (0, round(2 * k), 90)):
                d.text((x + dx, y + dy), row, font=font, fill=(0, 0, 0, a))
            d.text((x, y), row, font=font, fill=(255, 255, 255, 255),
                   stroke_width=stroke, stroke_fill=(10, 10, 12, 205))
        png = outdir/f"ly-{i:02d}.png"
        img.save(png)
        meta.append({"i": i, "file": png.name, "start": l["start"], "end": l["end"],
                     "x": round((w - iw) / 2), "y": round(h - bottom - ih + pad),
                     "w": iw, "h": ih, "rows": len(rows), "text": l["text"]})

    (outdir/"lyrics.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1),
                                      encoding="utf-8")
    return meta


if __name__ == "__main__":
    w, h = int(sys.argv[1]), int(sys.argv[2])
    m = build(w, h)
    print(f"{len(m)} lyric strips for {w}x{h}")
    for x in m[:3] + m[-1:]:
        print(f"  {x['i']:2d} {x['start']:7.2f}-{x['end']:7.2f} {x['w']}x{x['h']} "
              f"@({x['x']},{x['y']}) rows={x['rows']}  {x['text'][:40]}")
