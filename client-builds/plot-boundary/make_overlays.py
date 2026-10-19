"""Bengali lower thirds, brand chip and end card for the walled-plot promo."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
GREEN = (11, 93, 30); INK = (20, 48, 26); MUTED = (92, 110, 96); LIGHT = (247, 249, 245)
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IMG = "projects/plot-boundary/assets/images"
OUT = "projects/plot-boundary/assets/overlays"
PHONE = "01323280004"
os.makedirs(OUT, exist_ok=True)

# The Bengali face has no U+00B7 — never put a middle dot in a Bengali string.
LOWER_THIRDS = [
    ("lt-01-wall",   "পাকা সীমানা প্রাচীরে ঘেরা",   "Fully walled boundary"),
    ("lt-02-build",  "মজবুত গাঁথুনির প্রাচীর",       "Solid brick-and-pillar construction"),
    ("lt-03-road",   "রাস্তার পাশেই জমি",            "Direct road access"),
    ("lt-04-gate",   "নিজস্ব গেট ও প্রবেশপথ",        "Private gate and entry"),
    ("lt-05-green",  "গাছপালায় ঘেরা সবুজ পরিবেশ",   "Green, tree-lined surroundings"),
    ("lt-06-calm",   "নিরিবিলি আবাসিক পরিবেশ",      "Quiet residential setting"),
    ("lt-07-plot",   "প্লটের সম্পূর্ণ সীমানা",        "The full extent of the plot"),
]

def scrim(img, height=560, strength=150):
    s = Image.new("RGBA", (W, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    for i in range(height):
        d.line([(0, i), (W, i)], fill=(0, 0, 0, int(strength * (i / height) ** 1.4)))
    img.alpha_composite(s, (0, H - height))

f_bn, f_en = ImageFont.truetype(BN_B, 62), ImageFont.truetype(EN_R, 32)
for name, bn, en in LOWER_THIRDS:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    scrim(img)
    b = d.textbbox((0, 0), bn, font=f_bn); tw, th = b[2] - b[0], b[3] - b[1]
    d.rounded_rectangle([W/2 - tw/2 - 40, 1560 - 22, W/2 + tw/2 + 40, 1560 + th + 32],
                        radius=18, fill=(11, 93, 30, 240))
    d.text((W/2 - tw/2 - b[0], 1560 - b[1] + 4), bn, font=f_bn, fill=(255, 255, 255, 255))
    eb = d.textbbox((0, 0), en, font=f_en)
    d.text(((W - (eb[2] - eb[0])) / 2 - eb[0], 1560 + th + 58), en, font=f_en, fill=(255, 255, 255, 235))
    img.save(f"{OUT}/{name}.png")
    print("lower third:", name)

# title overlay for the hero photo
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
scrim(img, 900, 165)
def centre(y, text, font, fill):
    b = d.textbbox((0, 0), text, font=font)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])
y = centre(1300, "সীমানা প্রাচীরে ঘেরা প্লট", ImageFont.truetype(BN_B, 76), (255, 255, 255, 255))
d.rounded_rectangle([W/2 - 110, y + 48, W/2 + 110, y + 54], radius=3, fill=(255, 255, 255, 215))
y = centre(y + 116, "রাস্তার পাশে, গাছপালায় ঘেরা", ImageFont.truetype(BN_R, 46), (255, 255, 255, 240))
centre(y + 62, "Walled residential plot with road access", ImageFont.truetype(EN_R, 30), (255, 255, 255, 220))
img.save(f"{OUT}/title.png")
print("title overlay")

# brand chip, top right
mark = Image.open(f"{IMG}/logo-mark.png").convert("RGBA")
mw = 300
mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
pad = 22
bw, bh = mw + pad * 2, mark.height + pad * 2
bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(bar)
x0, y0 = W - bw - 40, 44
d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=16, fill=(255, 255, 255, 236))
bar.alpha_composite(mark, (x0 + pad, y0 + pad))
bar.save(f"{OUT}/brand-bar.png")
print("brand bar")

# end card
card = Image.new("RGB", (W, H), LIGHT)
d = ImageDraw.Draw(card)
d.rectangle([0, 0, W, 26], fill=GREEN); d.rectangle([0, H - 26, W, H], fill=GREEN)
logo = Image.open(f"{IMG}/logo.png").convert("RGBA")
lw = 760
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
card.paste(logo, ((W - lw) // 2, 470), logo)
y = 470 + logo.height
d.rounded_rectangle([(W - 220) // 2, y + 80, (W + 220) // 2, y + 86], radius=3, fill=GREEN)
y = centre(y + 170, "সীমানা প্রাচীরে ঘেরা প্লট", ImageFont.truetype(BN_B, 56), INK)
y = centre(y + 110, "জমি দেখতে যোগাযোগ করুন", ImageFont.truetype(BN_R, 42), GREEN)
f_ph = ImageFont.truetype(EN_B, 74)
pb = d.textbbox((0, 0), PHONE, font=f_ph)
pw, ph = pb[2] - pb[0], pb[3] - pb[1]
py = y + 70
d.rounded_rectangle([W/2 - pw/2 - 54, py - 30, W/2 + pw/2 + 54, py + ph + 36], radius=20, fill=GREEN)
d.text((W/2 - pw/2 - pb[0], py - pb[1] + 4), PHONE, font=f_ph, fill=(255, 255, 255))
centre(py + ph + 86, "Book a visit", ImageFont.truetype(EN_R, 32), MUTED)
card.save(f"{OUT}/card-end.png")
print("end card with", PHONE)
