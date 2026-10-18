"""Brand bar (client logo on a chip) and the end card with the booking number."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
GREEN = (11, 93, 30); INK = (20, 48, 26); MUTED = (92, 110, 96); LIGHT = (247, 249, 245)
BN_B = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
BN_R = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"
EN_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
EN_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
IMG = "projects/purbachal-house/assets/images"
OUT = "projects/purbachal-house/assets/overlays"
PHONE = "01323280004"

def centre(d, y, text, font, fill):
    b = d.textbbox((0, 0), text, font=font)
    d.text(((W - (b[2] - b[0])) / 2 - b[0], y - b[1]), text, font=font, fill=fill)
    return y + (b[3] - b[1])

# ---- brand bar: the real logo on a white chip, top right -------------------
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
print("brand bar", (bw, bh))

# ---- end card: logo, location, booking number ------------------------------
card = Image.new("RGB", (W, H), LIGHT)
d = ImageDraw.Draw(card)
d.rectangle([0, 0, W, 26], fill=GREEN); d.rectangle([0, H - 26, W, H], fill=GREEN)

logo = Image.open(f"{IMG}/logo.png").convert("RGBA")
lw = 760
logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
card.paste(logo, ((W - lw) // 2, 430), logo)
y = 430 + logo.height

d.rounded_rectangle([(W - 220) // 2, y + 80, (W + 220) // 2, y + 86], radius=3, fill=GREEN)
y = centre(d, y + 160, "ঢাকার অদূরে পূর্বাচল", ImageFont.truetype(BN_B, 56), INK)
y = centre(d, y + 36, "উপশহরের পাশে", ImageFont.truetype(BN_B, 56), INK)

y = centre(d, y + 110, "ভিজিটের জন্য যোগাযোগ করুন", ImageFont.truetype(BN_R, 42), GREEN)

f_ph = ImageFont.truetype(EN_B, 74)
pb = d.textbbox((0, 0), PHONE, font=f_ph)
pw, ph = pb[2] - pb[0], pb[3] - pb[1]
py = y + 70
d.rounded_rectangle([W/2 - pw/2 - 54, py - 30, W/2 + pw/2 + 54, py + ph + 36], radius=20, fill=GREEN)
d.text((W/2 - pw/2 - pb[0], py - pb[1] + 4), PHONE, font=f_ph, fill=(255, 255, 255))

centre(d, py + ph + 86, "Book a visit", ImageFont.truetype(EN_R, 32), MUTED)
card.save(f"{OUT}/card-end.png")
print("end card with", PHONE)
