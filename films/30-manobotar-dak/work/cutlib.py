"""Halftone + scissor-cut helpers, copied from demos/06-collage/work/prep.py (same repo, MIT)."""
import numpy as np, cv2
from PIL import Image
PAPER_W = np.array([244, 239, 228], np.float32) / 255
INK = np.array([28, 24, 20], np.float32) / 255
def load_rgba(p):
    return np.asarray(Image.open(p).convert('RGBA')).astype(np.float32) / 255


def resize(a, w, h):
    return cv2.resize(a, (int(w), int(h)), interpolation=cv2.INTER_AREA if w < a.shape[1] else cv2.INTER_CUBIC)


def spot(h, w, period, angle):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (x * np.cos(a) + y * np.sin(a)) / period
    v = (-x * np.sin(a) + y * np.cos(a)) / period
    return (np.cos(2 * np.pi * u) + np.cos(2 * np.pi * v)) * 0.25 + 0.5


def screen(cov, period, angle):
    T = spot(cov.shape[0], cov.shape[1], period, angle)
    aa = 1.6 / period
    return np.clip((cov - T) / aa + 0.5, 0, 1)


def lum(rgb):
    return rgb[..., 0] * 0.3 + rgb[..., 1] * 0.59 + rgb[..., 2] * 0.11


def halftone_mono(rgb, period=6.5, angle=45, lo=0.06, hi=0.93, gamma=0.95, tone=0.3, tint=(0.93, 0.88, 0.78)):
    L = np.clip((lum(rgb) - lo) / (hi - lo), 0, 1) ** gamma
    ink = screen(1 - L, period, angle)[..., None]
    paper = PAPER_W * np.array(tint, np.float32) / np.array(tint).max()
    base = paper * (1 - tone + tone * L[..., None])      # faint continuous tone under the dots (newspaper repro)
    return base * (1 - ink) + INK * ink


def halftone_cmyk(rgb, period=6.0, mix=0.6, sat=1.1):
    g = lum(rgb)[..., None]
    rgb = np.clip(g + (rgb - g) * sat, 0, 1)
    C, M, Y = 1 - rgb[..., 0], 1 - rgb[..., 1], 1 - rgb[..., 2]
    K = np.minimum(np.minimum(C, M), Y)
    den = 1 - K + 1e-5
    C, M, Y = (C - K) / den, (M - K) / den, (Y - K) / den
    out = np.ones_like(rgb) * PAPER_W
    for cov, ang, col in ((C, 15, (0.0, 0.62, 0.88)), (M, 75, (0.9, 0.12, 0.48)), (Y, 0, (1.0, 0.9, 0.05)),
                          (K * 0.95, 45, (0.11, 0.1, 0.09))):
        ink = screen(cov, period, ang)[..., None]
        out = out * (1 - ink + ink * np.array(col, np.float32))
    return rgb * (1 - mix) + out * mix


def scissor_border(alpha, r=5, eps=None, close=None, seed=0):
    """Polygonal scissor cut around the silhouette: dilate, close concavities, approxPolyDP -> straight facets."""
    rng = np.random.default_rng(seed)
    H, W = alpha.shape
    a = (alpha > 0.45).astype(np.uint8) * 255
    a = cv2.morphologyEx(a, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    d = cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1)))
    c = close or r * 3
    d = cv2.morphologyEx(d, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * c + 1, 2 * c + 1)))
    cnts, _ = cv2.findContours(d, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    ss = 3
    out = np.zeros((H * ss, W * ss), np.uint8)
    for cn in cnts:
        if cv2.contourArea(cn) < 80:
            continue
        ap = cv2.approxPolyDP(cn, eps or max(2.0, r * 0.7), True)[:, 0, :].astype(np.float32)
        ap += rng.uniform(-0.7, 0.7, ap.shape)
        cv2.fillPoly(out, [np.round(ap * ss).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    out = cv2.resize(out, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    return np.maximum(out, alpha * (cv2.dilate(a, np.ones((3, 3), np.uint8)) > 0))


def pad(rgba, p):
    return np.pad(rgba, ((p, p), (p, p), (0, 0)))


def sticker(rgba, r=5, seed=0, edge=PAPER_W):
    """rgba (already halftoned) -> white-bordered piece."""
    rgba = pad(rgba, r * 3 + 4)
    b = scissor_border(rgba[..., 3], r=r, seed=seed)
    a = rgba[..., 3:4]
    rgb = rgba[..., :3] * a + edge * (1 - a)
    return np.dstack([rgb, b])


