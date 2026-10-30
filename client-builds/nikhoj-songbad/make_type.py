"""Render every lyric line as an image, styled by the section it belongs to.

Pillow with raqm, never ffmpeg's drawtext or libass: neither shapes Bengali
correctly here — vowel signs get reordered and trailing punctuation jumps to
the front of the line, silently.

Per-character letter-spacing is also off the table for the same reason: a
Bengali run must be drawn in ONE call or its conjuncts fall apart. Weight,
size, colour and the accent rule carry the styling instead.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features

if not features.check("raqm"):
    raise SystemExit("Pillow has no raqm; Bengali would render mis-shaped. "
                     "pip install --upgrade 'pillow[raqm]'")

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from align import build as align_lines

P = Path("projects/nikhoj-songbad")
OUT = P/"assets/overlays"
SERIF_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
SERIF_R = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Regular.ttf"
SANS_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
W, H = 1920, 1080
RED = (240, 2, 1)            # sampled from the title art on the cover
WARM = (198, 132, 97)        # sunset tone from the cover

# section -> font, size, colour, accent rule under the line, max width
STYLE = {
    "Intro":            (SANS_R,  46, (214, 222, 226), None, 1200),
    "Outro":            (SANS_R,  46, (214, 222, 226), None, 1200),
    "Verse 1":          (SERIF_R, 64, (238, 240, 242), None, 1340),
    "Verse 2":          (SERIF_R, 64, (238, 240, 242), None, 1340),
    "Pre-Chorus":       (SERIF_B, 70, (255, 255, 255), None, 1340),
    "Pre-Chorus 2":     (SERIF_B, 70, (255, 255, 255), None, 1340),
    "Chorus":           (SERIF_B, 88, (255, 255, 255), RED, 1480),
    "Instrumental Drop":(SERIF_B, 150, (255, 255, 255), RED, 1600),
    "Bridge":           (SERIF_R, 66, (244, 236, 230), WARM, 1340),
    "Final Build":      (SERIF_B, 78, (255, 255, 255), None, 1400),
    "Final Chorus":     (SERIF_B, 92, (255, 255, 255), RED, 1480),
}
DEFAULT = (SERIF_R, 64, (238, 240, 242), None, 1340)


def wrap(text, font, maxw):
    """Spaces only. Splitting inside a Bengali word destroys its shaping."""
    words, rows, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if font.getlength(trial) <= maxw or not cur:
            cur = trial
        else:
            rows.append(cur); cur = w
    if cur:
        rows.append(cur)
    return rows


def render(text, section, path):
    fpath, size, colour, accent, maxw = STYLE.get(section, DEFAULT)
    font = ImageFont.truetype(fpath, size)
    rows = wrap(text, font, maxw)
    while len(rows) > 2 and size > 40:          # shrink rather than stack high
        size = int(size * 0.88)
        font = ImageFont.truetype(fpath, size)
        rows = wrap(text, font, maxw)

    asc, desc = font.getmetrics()
    lh = asc + desc + int(size * 0.18)
    pad = int(size * 0.55)
    tw = max(font.getlength(r) for r in rows)
    acc_h = int(size * 0.14) if accent else 0
    acc_gap = int(size * 0.36) if accent else 0
    iw = int(tw) + pad * 2
    ih = lh * len(rows) + pad * 2 + acc_h + acc_gap

    img = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    stroke = max(1, int(size * 0.035))
    for i, row in enumerate(rows):
        x = (iw - font.getlength(row)) / 2
        y = pad + i * lh
        for dx, dy, a in ((0, int(size * 0.09), 130), (0, int(size * 0.045), 95)):
            d.text((x + dx, y + dy), row, font=font, fill=(0, 0, 0, a))
        d.text((x, y), row, font=font, fill=colour + (255,),
               stroke_width=stroke, stroke_fill=(6, 8, 10, 215))
    if accent:
        bw = int(tw * 0.34)
        by = pad + lh * len(rows) + acc_gap
        d.rounded_rectangle([(iw - bw) // 2, by, (iw + bw) // 2, by + acc_h],
                            radius=acc_h // 2, fill=accent + (235,))
    img.save(path)
    return iw, ih, len(rows), size


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    lines = align_lines()
    meta = []
    for i, l in enumerate(lines):
        png = OUT/f"ly-{i:03d}.png"
        iw, ih, rows, size = render(l["text"], l["section"], png)
        meta.append({"i": i, "file": png.name, "section": l["section"],
                     "start": l["start"], "end": l["end"], "text": l["text"],
                     "w": iw, "h": ih, "rows": rows, "size": size,
                     "x": (W - iw) // 2, "y": (H - ih) // 2})
    (OUT/"lyrics.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1),
                                   encoding="utf-8")
    from collections import Counter
    print(f"{len(meta)} lyric images")
    print("per section:", dict(Counter(m["section"] for m in meta)))
    print("widest:", max(m["w"] for m in meta), "tallest:", max(m["h"] for m in meta))
    print("two-row lines:", sum(1 for m in meta if m["rows"] > 1))
    shrunk = [m for m in meta if m["size"] != STYLE.get(m["section"], DEFAULT)[1]]
    print("auto-shrunk to fit:", len(shrunk))
