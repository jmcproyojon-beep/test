"""Render one PNG per lyric line, plus the opening title card.

ffmpeg's drawtext has no complex-script shaping, so Bengali conjuncts break if
drawn there. Everything textual is rendered here with Pillow (raqm) instead and
composited as an image.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

P = Path("projects/ukulele-mv")
OUT = P/"assets/overlays"; OUT.mkdir(parents=True, exist_ok=True)
W, H = 1280, 720
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
MAXW = 1120

def scrim(img, height=250, strength=165):
    s = Image.new("RGBA", (W, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    for i in range(height):
        d.line([(0, i), (W, i)], fill=(0, 0, 0, int(strength * (i / height) ** 1.5)))
    img.alpha_composite(s, (0, H - height))

def wrap(text, font):
    """Wrap on spaces only — splitting inside a Bengali word breaks shaping."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if font.getlength(trial) <= MAXW or not cur:
            cur = trial
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines

def draw_shadowed(d, xy, text, font, fill=(255, 255, 255, 255)):
    x, y = xy
    for dx, dy, a in ((0, 3, 150), (0, 2, 110), (2, 2, 90), (-2, 2, 90)):
        d.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, a))
    d.text((x, y), text, font=font, fill=fill)

def render_line(text, path, size=46):
    font = ImageFont.truetype(BN_B, size)
    rows = wrap(text, font)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); scrim(img)
    d = ImageDraw.Draw(img)
    asc, desc = font.getmetrics(); lh = asc + desc + 8
    base = H - 74 - lh * len(rows)
    for i, row in enumerate(rows):          # one call per row keeps shaping intact
        x = (W - font.getlength(row)) / 2
        draw_shadowed(d, (x, base + i * lh), row, font)
    img.save(path)
    return len(rows)

if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from lyrics import lines as lyric_lines

    ls = lyric_lines()
    for i, l in enumerate(ls):
        n = render_line(l["text"], OUT/f"ly-{i:02d}.png")
        print(f"ly-{i:02d}  {l['start']:7.2f}-{l['end']:7.2f}  {n} row(s)  {l['text'][:46]}")

    # opening title, centred, over the instrumental intro
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    f1, f2 = ImageFont.truetype(BN_B, 78), ImageFont.truetype(BN_R, 34)
    t1, t2 = "অচেনা শহর, নতুন সকাল", "Ochena Shohor, Notun Sokal"
    b = d.textbbox((0, 0), t1, font=f1)
    draw_shadowed(d, ((W - (b[2] - b[0])) / 2 - b[0], 300 - b[1]), t1, f1)
    d.rounded_rectangle([W/2 - 90, 392, W/2 + 90, 396], radius=2, fill=(255, 255, 255, 190))
    f3 = ImageFont.truetype(EN_R, 30)
    draw_shadowed(d, ((W - f3.getlength(t2)) / 2, 424), t2, f3, (255, 255, 255, 225))
    img.save(OUT/"title.png"); print("title card")
