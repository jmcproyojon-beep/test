"""Captions, title, spec card, brand chip and end card for the Sector-9 plot promo."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
GREEN = (11, 93, 30); INK = (20, 48, 26); MUTED = (92, 110, 96); LIGHT = (247, 249, 245)
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IMG = "projects/purbachal-s9/assets/images"
OUT = "projects/purbachal-s9/assets/overlays"
PHONE = "01323280004"
LOCATION = "পূর্বাচল ৯নং সেক্টর, ৩০৪ নং রোড"
SIZE = "৫ কাঠা প্লট"
os.makedirs(OUT, exist_ok=True)

# No U+00B7 in the Bengali face — a middle dot renders as tofu.
LOWER_THIRDS = [
    ("lt-01-open",   "খোলা ও সমতল জমি",            "Open, level land"),
    ("lt-02-pillar", "সীমানা পিলার দেওয়া প্লট",     "Boundary pillars in place"),
    ("lt-03-around", "চারপাশে গড়ে উঠছে নতুন ভবন",  "New buildings rising all around"),
    ("lt-04-path",   "প্লটের পাশেই চলাচলের পথ",     "Access path along the plot"),
    ("lt-05-green",  "গাছপালায় ঘেরা সবুজ পরিবেশ",   "Green, tree-lined surroundings"),
    ("lt-06-road",   "প্রশস্ত পাকা রাস্তা",           "Wide paved road"),
    ("lt-07-light",  "সড়কবাতি ও বিদ্যুৎ লাইন",      "Street lighting and power lines"),
]

def scrim(img, height=560, strength=155):
    s = Image.new("RGBA", (W, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    for i in range(height):
        d.line([(0, i), (W, i)], fill=(0, 0, 0, int(strength * (i / height) ** 1.4)))
    img.alpha_composite(s, (0, H - height))

f_bn, f_en = ImageFont.truetype(BN_B, 62), ImageFont.truetype(EN_R, 32)
for name, bn, en in LOWER_THIRDS:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img); scrim(img)
    b = d.textbbox((0, 0), bn, font=f_bn); tw, th = b[2] - b[0], b[3] - b[1]
    d.rounded_rectangle([W/2 - tw/2 - 40, 1560 - 22, W/2 + tw/2 + 40, 1560 + th + 32],
                        radius=18, fill=(11, 93, 30, 240))
    d.text((W/2 - tw/2 - b[0], 1560 - b[1] + 4), bn, font=f_bn, fill=(255, 255, 255, 255))
    eb = d.textbbox((0, 0), en, font=f_en)
    d.text(((W - (eb[2] - eb[0])) / 2 - eb[0], 1560 + th + 58), en, font=f_en, fill=(255, 255, 255, 235))
    img.save(f"{OUT}/{name}.png"); print("lower third:", name)

def centre(d, y, text, font, fill):
    b = d.textbbox((0, 0), text, font=font)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])

# title overlay
img = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img); scrim(img, 920, 170)
y = centre(d, 1290, SIZE, ImageFont.truetype(BN_B, 92), (255, 255, 255, 255))
d.rounded_rectangle([W/2 - 110, y + 46, W/2 + 110, y + 52], radius=3, fill=(255, 255, 255, 215))
y = centre(d, y + 114, LOCATION, ImageFont.truetype(BN_R, 44), (255, 255, 255, 242))
centre(d, y + 60, "5 katha plot — Purbachal Sector 9, Road 304",
       ImageFont.truetype(EN_R, 30), (255, 255, 255, 220))
img.save(f"{OUT}/title.png"); print("title overlay")

# brand chip
mark = Image.open(f"{IMG}/logo-mark.png").convert("RGBA")
mw = 300; mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
pad = 22; bw, bh = mw + pad * 2, mark.height + pad * 2
bar = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(bar)
x0, y0 = W - bw - 40, 44
d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=16, fill=(255, 255, 255, 236))
bar.alpha_composite(mark, (x0 + pad, y0 + pad))
bar.save(f"{OUT}/brand-bar.png"); print("brand bar")

# spec card
card = Image.new("RGB", (W, H), (8, 68, 22)); d = ImageDraw.Draw(card)
d.rectangle([0, 0, W, 26], fill=(255, 255, 255)); d.rectangle([0, H - 26, W, H], fill=(255, 255, 255))
y = centre(d, 620, "এক নজরে", ImageFont.truetype(BN_R, 44), (176, 205, 180))
y = centre(d, y + 120, SIZE, ImageFont.truetype(BN_B, 104), (255, 255, 255))
d.rounded_rectangle([W/2 - 150, y + 70, W/2 + 150, y + 76], radius=3, fill=(255, 255, 255))
y = centre(d, y + 150, "পূর্বাচল ৯নং সেক্টর", ImageFont.truetype(BN_B, 58), (255, 255, 255))
y = centre(d, y + 44, "৩০৪ নং রোড", ImageFont.truetype(BN_B, 58), (255, 255, 255))
centre(d, y + 120, "Purbachal Sector 9, Road 304", ImageFont.truetype(EN_R, 32), (198, 222, 200))
card.save(f"{OUT}/card-spec.png"); print("spec card")

# end card
card = Image.new("RGB", (W, H), LIGHT); d = ImageDraw.Draw(card)
d.rectangle([0, 0, W, 26], fill=GREEN); d.rectangle([0, H - 26, W, H], fill=GREEN)
logo = Image.open(f"{IMG}/logo.png").convert("RGBA")
lw = 740; logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
card.paste(logo, ((W - lw) // 2, 430), logo)
y = 430 + logo.height
d.rounded_rectangle([(W - 220) // 2, y + 76, (W + 220) // 2, y + 82], radius=3, fill=GREEN)
y = centre(d, y + 150, SIZE, ImageFont.truetype(BN_B, 62), INK)
y = centre(d, y + 40, LOCATION, ImageFont.truetype(BN_R, 38), MUTED)
y = centre(d, y + 100, "জমি দেখতে যোগাযোগ করুন", ImageFont.truetype(BN_R, 42), GREEN)
f_ph = ImageFont.truetype(EN_B, 74)
pb = d.textbbox((0, 0), PHONE, font=f_ph); pw, ph = pb[2] - pb[0], pb[3] - pb[1]
py = y + 66
d.rounded_rectangle([W/2 - pw/2 - 54, py - 30, W/2 + pw/2 + 54, py + ph + 36], radius=20, fill=GREEN)
d.text((W/2 - pw/2 - pb[0], py - pb[1] + 4), PHONE, font=f_ph, fill=(255, 255, 255))
centre(d, py + ph + 84, "Book a visit", ImageFont.truetype(EN_R, 32), MUTED)
card.save(f"{OUT}/card-end.png"); print("end card with", PHONE)
