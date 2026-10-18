"""Render Bengali/English lower-thirds and brand cards as transparent PNGs."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
GREEN = (11, 93, 30, 255)
GREEN_S = (11, 93, 30, 240)
WHITE = (255, 255, 255, 255)
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
OUT = "projects/purbachal-house/assets/overlays"

import os
os.makedirs(OUT, exist_ok=True)

LOWER_THIRDS = [
    ("lt-01-gate",    "নিজস্ব গেট ও সীমানা প্রাচীর",   "Private gate and boundary wall"),
    ("lt-02-yard",    "গাছে ঘেরা সবুজ উঠান",           "Green, tree-shaded grounds"),
    ("lt-03-house",   "তিন তলা নিজস্ব বাড়ি",           "Three-storey independent house"),
    ("lt-04-parking", "ঘরের নিচেই গাড়ি পার্কিং",       "Covered car parking under the house"),
    ("lt-05-entry",   "প্রশস্ত প্রবেশপথ",               "Wide entrance"),
    ("lt-06-living",  "বিশাল ড্রয়িং ও ডাইনিং",         "Large drawing and dining space"),
    ("lt-07-stair",   "অভ্যন্তরীণ সিঁড়ি · টাইলস মেঝে",  "Internal staircase · tiled floors"),
]

def pill(draw, cx, cy, text, font, pad_x=40, pad_y=22, fill=GREEN_S, color=WHITE):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x0, y0 = cx - tw / 2 - pad_x, cy - pad_y
    x1, y1 = cx + tw / 2 + pad_x, cy + th + pad_y + 10
    draw.rounded_rectangle([x0, y0, x1, y1], radius=18, fill=fill)
    draw.text((cx - tw / 2 - bbox[0], cy - bbox[1] + 4), text, font=font, fill=color)
    return y1

f_bn = ImageFont.truetype(BN_B, 62)
f_en = ImageFont.truetype(EN_R, 32)

for name, bn, en in LOWER_THIRDS:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # soft scrim so text reads over any footage
    scrim = Image.new("RGBA", (W, 560), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for i in range(560):
        sd.line([(0, i), (W, i)], fill=(0, 0, 0, int(150 * (i / 560) ** 1.4)))
    img.alpha_composite(scrim, (0, H - 560))
    bottom = pill(d, W / 2, 1560, bn, f_bn)
    ebox = d.textbbox((0, 0), en, font=f_en)
    d.text(((W - (ebox[2] - ebox[0])) / 2 - ebox[0], bottom + 26), en, font=f_en, fill=(255, 255, 255, 235))
    img.save(f"{OUT}/{name}.png")
    print("lower third:", name)

# ---- brand bar (top-right wordmark, stands in for the logo file) -------------
bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(bar)
f_mark = ImageFont.truetype(EN_B, 38)
f_tag = ImageFont.truetype(BN_R, 26)
mark, tag = "PROYOJON ABASHON", "আগামীর নিশ্চিত ঠিকানা"
mb = d.textbbox((0, 0), mark, font=f_mark)
tb = d.textbbox((0, 0), tag, font=f_tag)
bw = max(mb[2] - mb[0], tb[2] - tb[0]) + 56
bh = 132
x0, y0 = W - bw - 40, 44
d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=16, fill=(255, 255, 255, 232))
d.text((x0 + (bw - (mb[2] - mb[0])) / 2 - mb[0], y0 + 24), mark, font=f_mark, fill=GREEN)
d.text((x0 + (bw - (tb[2] - tb[0])) / 2 - tb[0], y0 + 78), tag, font=f_tag, fill=(20, 48, 26, 255))
bar.save(f"{OUT}/brand-bar.png")
print("brand bar")
