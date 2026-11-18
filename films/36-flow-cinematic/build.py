"""Flow Communications — «ব্র্যান্ডে জ্যাম? Flow করান।» a cinematic 9:16 edit of the client's three AI clips.

Pipeline (python3 build.py <clip1.mp4> <clip2.mp4> <clip3.mp4>):
 1. each clip: motion-interpolated 24 → 48 fps (every other frame is an original), lanczos upscale 360×640 → 1080×1920,
    sharpen, gentle grade → work/pre_N.mp4
 2. compositor: a slow push-in per clip, a zoom-through with a warm light leak (clip 1 → 2, the phone match), a bright gold
    flash (clip 2 → 3), word-by-word Bangla captions timed to the voice in the clips (word onsets from faster-whisper with VAD),
    key words in the logo's gold, vignette + fine grain, a 1 s hold on the logo → work/video.mp4
 3. sound: the clips' own voice + music, crossfaded on the same cuts (clip 3's first word is never faded), −14 LUFS
 4. mux → out/Flow_Brand_Jam_Cinematic.mp4"""
import sys, os, subprocess, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); WORK = os.path.join(HERE, 'work'); OUT = os.path.join(HERE, 'out')
os.makedirs(WORK, exist_ok=True); os.makedirs(OUT, exist_ok=True)
W, H, FPS = 1080, 1920, 48
CLIPS = sys.argv[1:4]
LEN = 10.0                                  # each clip
OFF = [0.0, 9.5, 19.0]                      # where each clip starts in the edit (0.5 s overlaps for the transitions)
DUR = 30.0                                  # clip 3 ends at 29.0; the logo holds to 30.0
GOLD, GOLDL, WHITE = (245, 190, 70), (255, 214, 110), (250, 246, 238)
NAVY, BLUE = (22, 40, 74), (20, 140, 214)          # ink for captions over clip 3's white logo world (blue from the logo)

def run(cmd): subprocess.run(cmd, check=True)

# ---------------------------------------------------------------- 1 · upscale + smooth each clip
for i, c in enumerate(CLIPS):
    dst = os.path.join(WORK, f'pre_{i}.mp4')
    if os.path.exists(dst): continue
    run(['ffmpeg', '-v', 'error', '-y', '-i', c, '-an', '-vf',
         'minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,'
         'scale=1080:1920:flags=lanczos,unsharp=5:5:0.8:3:3:0.0,eq=contrast=1.04:saturation=1.08:gamma=0.98',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '13', '-pix_fmt', 'yuv420p', dst])
    print('pre', i)

# ---------------------------------------------------------------- captions (edit time = clip offset + word onset in the clip)
#  [clip, [(onset, word, hot), ...], hide_after]
CAP = [
    (0, [(0.00, 'ঢাকার', 0), (0.62, 'জ্যাম', 1), (0.76, 'তো', 0), (0.92, 'চেনেন।', 0)], 1.75),
    (0, [(1.90, 'কিন্তু', 0), (2.14, 'ব্র্যান্ডের', 1), (2.78, 'জ্যাম?', 1)], 4.05),
    (0, [(4.21, 'লাইক', 0), (4.61, 'তিনটা…', 1)], 5.50),
    (0, [(5.59, 'আম্মু,', 0), (6.55, 'খালা,', 0)], 7.70),
    (0, [(7.83, 'আর', 0), (7.97, 'নিজের', 0), (8.33, 'সেকেন্ড', 1), (8.73, 'আইডি।', 1)], 9.75),
    (1, [(0.99, 'খাবার', 1), (2.45, 'হোক,', 0)], 4.40),
    (1, [(4.50, 'ইলেকট্রনিক্স', 1), (5.44, 'হোক,', 0)], 6.05),
    (1, [(6.10, 'সিমেন্ট', 1), (6.66, 'হোক,', 0)], 7.42),
    (1, [(7.48, 'মধু', 1), (8.00, 'হোক…', 0)], 9.40),
    (2, [(0.00, 'জ্যাম', 0), (0.40, 'ছোটাতে', 0), (0.90, 'লাগে', 0), (1.30, 'Flow।', 1)], 2.08),
    (2, [(2.13, 'ব্র্যান্ডে', 0), (3.19, 'জ্যাম?', 0), (3.95, 'Flow', 1), (4.55, 'করান।', 1)], 11.5),
]
FB = os.path.join(HERE, 'fonts/HindSiliguri-700-bn.ttf'); FL = os.path.join(HERE, 'fonts/HindSiliguri-700-lat.ttf')
SIZE = 92
fbn = ImageFont.truetype(FB, SIZE, layout_engine=ImageFont.Layout.RAQM); flat = ImageFont.truetype(FL, SIZE, layout_engine=ImageFont.Layout.RAQM)
def runs(word):                              # split a word into Bangla / other runs (the Bangla font is a Bengali-only subset)
    out, cur, kind = [], '', None
    for ch in word:
        k = 'bn' if ('ঀ' <= ch <= '৿' or ch in '।॥‌‍') else 'lat'
        if kind is not None and k != kind: out.append((kind, cur)); cur = ''
        cur += ch; kind = k
    if cur: out.append((kind, cur))
    return out
ASC, DESC = int(SIZE * 1.15), int(SIZE * .55)
_cache = {}
def word_img(word, hot, light=False):
    """the word as an RGBA image: fill + a soft dark shadow; gold for key words. light=True: dark ink for the white logo world"""
    key = (word, hot, light)
    if key in _cache: return _cache[key]
    rs = runs(word); widths = []
    for k, s in rs:
        f = fbn if k == 'bn' else flat
        widths.append(f.getlength(s, language='bn') if k == 'bn' else f.getlength(s))
    pad = 40; w = int(sum(widths)) + 2 * pad; h = ASC + DESC + 2 * pad
    txt = Image.new('L', (w, h), 0); d = ImageDraw.Draw(txt); x = pad
    for (k, s), ww in zip(rs, widths):
        f = fbn if k == 'bn' else flat
        d.text((x, pad + ASC), s, font=f, fill=255, anchor='ls', **({'language': 'bn'} if k == 'bn' else {}))
        x += ww
    col = (BLUE if hot else NAVY) if light else (GOLDL if hot else WHITE)
    shadow = txt.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * (.55 if light else .85)))
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    img.paste((255, 255, 255, 255) if light else (8, 6, 4, 255), (0, 6), shadow)   # soft shadow (a white halo on the light world)
    if hot and not light:                                                   # a warm glow under key words
        g = txt.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * .7)); img.paste((255, 170, 40, 255), (0, 0), g)
    img.paste(col + (255,), (0, 0), txt)
    _cache[key] = (img, int(sum(widths)), pad)
    return _cache[key]
SPACE = SIZE * .28
def ease_out(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def ease_io(x): x = min(1, max(0, x)); return 4 * x * x * x if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def caption_layer(t):
    """the active caption line at time t, each word rising in with a blur-to-sharp reveal"""
    for ci, words, hide in CAP:
        o = OFF[ci]; t0 = o + words[0][0] - .06; t1 = o + hide
        if not (t0 <= t < t1 + .3): continue
        out = ease_io((t - t1) / .3) if t >= t1 else 0
        imgs = [word_img(w, h, ci == 2) for _, w, h in words]
        tot = sum(iw for _, iw, _ in imgs) + SPACE * (len(imgs) - 1)
        lines = [list(range(len(imgs)))] if tot <= W - 140 else [list(range(len(imgs) // 2 + len(imgs) % 2)), list(range(len(imgs) // 2 + len(imgs) % 2, len(imgs)))]
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        base_y = 1590 - (len(lines) - 1) * SIZE * .62
        for li, idx in enumerate(lines):
            lw = sum(imgs[i][1] for i in idx) + SPACE * (len(idx) - 1); x = (W - lw) / 2
            for i in idx:
                img, iw, pad = imgs[i]; at = o + words[i][0]
                u = ease_out((t - at) / .32)
                if u > 0:
                    a = u * (1 - out); dy = (1 - u) * 46 - out * 30; sc = .9 + .1 * u
                    im = img
                    if u < .98: im = img.filter(ImageFilter.GaussianBlur((1 - u) * 9))
                    if sc != 1: im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BICUBIC)
                    if a < 1: im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a)))
                    cx = x + iw / 2; cy = base_y + li * SIZE * 1.24
                    layer.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2 + dy)))
                x += iw + SPACE
        return layer
    return None

# ---------------------------------------------------------------- looks: vignette, grain, light leaks
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H * .48) / (H * .6)) ** 2)
VIG = (1 - .38 * np.clip((r - .55) / .65, 0, 1) ** 1.6)[..., None].astype(np.float32)
rng = np.random.default_rng(3); GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]
def leak(u, warm=True):
    """an additive light leak sweeping across the frame (u 0..1, peak at .5)"""
    k = math.sin(math.pi * min(1, max(0, u))); cx = -300 + u * (W + 600)
    g = np.exp(-(((xx - cx) / 520) ** 2 + ((yy - H * .4) / 1100) ** 2))[..., None]
    col = np.array([255, 160, 60] if warm else [255, 232, 180], np.float32)
    return g * col * k * (1.0 if warm else 1.3)
def push(img, tau, s0=1.0, s1=1.05, cx=.5, cy=.5):
    """slow push-in: scale over the clip's local time tau (0..LEN)"""
    s = s0 + (s1 - s0) * ease_io(tau / LEN)
    if abs(s - 1) < 1e-4: return img
    w, h = W / s, H / s; x0 = (W - w) * cx; y0 = (H - h) * cy
    return img.transform((W, H), Image.AFFINE, (w / W, 0, x0, 0, h / H, y0), resample=Image.BICUBIC)
def zoom(img, s, blur=0):
    w, h = W / s, H / s; x0 = (W - w) / 2; y0 = (H - h) / 2
    im = img.transform((W, H), Image.AFFINE, (w / W, 0, x0, 0, h / H, y0), resample=Image.BILINEAR)
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur > .3 else im

# ---------------------------------------------------------------- 2 · composite
class Reader:
    def __init__(self, path):
        self.p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
        self.last = None; self.n = 0
        self.eof = False
    def read(self):
        b = self.p.stdout.read(W * H * 3)
        if len(b) == W * H * 3: self.last = Image.frombuffer('RGB', (W, H), b, 'raw', 'RGB', 0, 1); self.n += 1
        else: self.eof = True                   # the clip is a frame or two short: hold its last frame
        return self.last
R = [Reader(os.path.join(WORK, f'pre_{i}.mp4')) for i in range(3)]
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', os.path.join(WORK, 'video.mp4')], stdin=subprocess.PIPE)
NF = int(DUR * FPS)
cur = [None, None, None]
for f in range(NF):
    t = f / FPS
    # advance each clip's reader to its own frame
    for i in range(3):
        need = int(round((t - OFF[i]) * FPS))
        if 0 <= need < LEN * FPS:
            while R[i].n <= need and not R[i].eof: cur[i] = R[i].read()
    A, B, C = cur
    if t < OFF[1]:
        frame = push(A, t)
    elif t < OFF[0] + LEN:                                       # 9.5–10.0: zoom-through from the phone into the drop
        u = (t - OFF[1]) / .5
        a = zoom(push(A, t), 1 + .35 * ease_io(u), 18 * ease_io(u)); b = zoom(push(B, t - OFF[1]), 1.18 - .18 * ease_out(u), 16 * (1 - ease_out(u)))
        frame = Image.blend(a, b, ease_io(u))
    elif t < OFF[2]:
        frame = push(B, t - OFF[1])
    elif t < OFF[1] + LEN:                                       # 19.0–19.5: a bright gold flash into the white logo world
        u = (t - OFF[2]) / .5
        frame = Image.blend(push(B, t - OFF[1]), push(C, t - OFF[2], 1.04, 1.0), ease_io(u))
    else:
        tau = min(t - OFF[2], LEN - .01)
        frame = push(C, tau, 1.04, 1.0) if t < OFF[2] + LEN else push(C, LEN - .01, 1.04, 1.0)
    arr = np.asarray(frame, np.float32)
    # light leaks on the cuts
    for tc, warm in ((OFF[1] + .25, True), (OFF[2] + .25, False)):
        u = (t - (tc - .45)) / .9
        if 0 < u < 1: arr = arr + leak(u, warm) * .55
    arr = arr * VIG
    g = GRAIN[f % 6]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)[..., None]; arr = arr + g * 5.0
    frame = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    cl = caption_layer(t)
    if cl is not None: frame = frame.convert('RGBA'); frame.alpha_composite(cl); frame = frame.convert('RGB')
    enc.stdin.write(frame.tobytes())
    if f % 96 == 0: print(f'frame {f}/{NF}', flush=True, file=open(os.path.join(WORK, 'progress.txt'), 'w'))
enc.stdin.close(); enc.wait()

# ---------------------------------------------------------------- 3 · sound: the clips' own voice + music, crossfaded on the cuts
fc = ('[0:a]aresample=48000,afade=t=out:st=9.5:d=0.5[a0];'
      '[1:a]aresample=48000,afade=t=in:st=0:d=0.35,afade=t=out:st=9.5:d=0.5,adelay=9500|9500[a1];'
      '[2:a]aresample=48000,adelay=19000|19000[a2];'
      '[a0][a1][a2]amix=inputs=3:normalize=0,apad=whole_dur=30,atrim=0:30,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
run(['ffmpeg', '-v', 'error', '-y', '-i', CLIPS[0], '-i', CLIPS[1], '-i', CLIPS[2], '-filter_complex', fc, '-map', '[a]', '-ar', '48000', os.path.join(WORK, 'audio.wav')])
run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(WORK, 'video.mp4'), '-i', os.path.join(WORK, 'audio.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
     '-shortest', '-movflags', '+faststart', os.path.join(OUT, 'Flow_Brand_Jam_Cinematic.mp4')])
print('done', os.path.join(OUT, 'Flow_Brand_Jam_Cinematic.mp4'))
