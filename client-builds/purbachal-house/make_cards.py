from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
GREEN = (11, 93, 30); DEEP = (8, 68, 22); LIGHT = (247, 249, 245)
INK = (20, 48, 26); MUTED = (92, 110, 96)
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
OUT = "projects/purbachal-house/assets/overlays"
os.makedirs(OUT, exist_ok=True)

def centre(d, y, text, font, fill):
    b = d.textbbox((0, 0), text, font=font)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])

# extra lower third: the gate beat
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
scrim = Image.new("RGBA", (W, 560), (0, 0, 0, 0))
sd = ImageDraw.Draw(scrim)
for i in range(560):
    sd.line([(0, i), (W, i)], fill=(0, 0, 0, int(150 * (i / 560) ** 1.4)))
img.alpha_composite(scrim, (0, H - 560))
f_bn = ImageFont.truetype(BN_B, 62); f_en = ImageFont.truetype(EN_R, 32)
txt = "সুদৃশ্য প্রধান ফটক"
b = d.textbbox((0, 0), txt, font=f_bn)
tw, th = b[2] - b[0], b[3] - b[1]
d.rounded_rectangle([W/2 - tw/2 - 40, 1560 - 22, W/2 + tw/2 + 40, 1560 + th + 32], radius=18, fill=(11, 93, 30, 240))
d.text((W/2 - tw/2 - b[0], 1560 - b[1] + 4), txt, font=f_bn, fill=(255, 255, 255, 255))
en = "Decorative main gate"
eb = d.textbbox((0, 0), en, font=f_en)
d.text(((W - (eb[2] - eb[0])) / 2 - eb[0], 1560 + th + 58), en, font=f_en, fill=(255, 255, 255, 235))
img.save(f"{OUT}/lt-08-gate2.png")

# title overlay (sits over the hero photo)
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
scrim = Image.new("RGBA", (W, 900), (0, 0, 0, 0))
sd = ImageDraw.Draw(scrim)
for i in range(900):
    sd.line([(0, i), (W, i)], fill=(0, 0, 0, int(165 * (i / 900) ** 1.3)))
img.alpha_composite(scrim, (0, H - 900))
y = centre(d, 1300, "নিজস্ব তিন তলা বাড়ি", ImageFont.truetype(BN_B, 78), (255, 255, 255, 255))
d.rounded_rectangle([W/2 - 110, y + 46, W/2 + 110, y + 52], radius=3, fill=(255, 255, 255, 210))
y2 = centre(d, y + 110, "ঢাকার অদূরে পূর্বাচল উপশহরের পাশে", ImageFont.truetype(BN_R, 46), (255, 255, 255, 240))
centre(d, y2 + 60, "Independent house beside Purbachal New Town, Dhaka",
       ImageFont.truetype(EN_R, 30), (255, 255, 255, 220))
img.save(f"{OUT}/title.png")

# end card (opaque)
card = Image.new("RGB", (W, H), LIGHT)
d = ImageDraw.Draw(card)
d.rectangle([0, 0, W, 26], fill=GREEN); d.rectangle([0, H - 26, W, H], fill=GREEN)
y = centre(d, 560, "PROYOJON ABASHON", ImageFont.truetype(EN_B, 72), GREEN)
y = centre(d, y + 70, "আগামীর নিশ্চিত ঠিকানা", ImageFont.truetype(BN_R, 52), INK)
d.rounded_rectangle([W/2 - 110, y + 70, W/2 + 110, y + 76], radius=3, fill=GREEN)
y = centre(d, y + 150, "ঢাকার অদূরে পূর্বাচল", ImageFont.truetype(BN_B, 58), INK)
y = centre(d, y + 40, "উপশহরের পাশে", ImageFont.truetype(BN_B, 58), INK)
y = centre(d, y + 120, "সরাসরি দেখতে যোগাযোগ করুন", ImageFont.truetype(BN_R, 44), GREEN)
centre(d, y + 80, "Book a site visit", ImageFont.truetype(EN_R, 32), MUTED)
card.save(f"{OUT}/card-end.png")
print("cards written")
