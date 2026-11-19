"""Prepare assets for the Proyojon Abashon Marine City reel.

    python3.13 -I prep.py <aerial.jpg> <logo.jpg>        (run anywhere)

1. Removes the baked-in white plot outline from the aerial photo (OpenCV inpaint) -> public/marine/aerial.jpg
2. Keys the white ground out of the logo -> public/marine/logo.png
3. Solves a pinhole camera from the plot's four corners (vanishing points + PnP) -> src/marine/cam.json
"""
import json, sys
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parents[2]
PUB, SRC = ROOT / "remotion-composer/public/marine", ROOT / "remotion-composer/src/marine"
aer, logo = sys.argv[1], sys.argv[2]

# ---- 1. inpaint the white outline -------------------------------------------------
im = cv2.imread(aer); H, W = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
white = ((im.min(2) > 200) & (hsv[..., 1] < 45)).astype(np.uint8) * 255
white[:300] = 0; white[1250:] = 0
for x0, y0, x1, y1 in [(520, 900, 700, 1050), (150, 1000, 300, 1110)]:   # keep the site sign and the hut roof
    white[y0:y1, x0:x1] = 0
mask = cv2.dilate(white, np.ones((5, 5), np.uint8), 2)
clean = cv2.inpaint(im, mask, 7, cv2.INPAINT_TELEA)
cv2.imwrite(str(PUB / "aerial.jpg"), clean, [cv2.IMWRITE_JPEG_QUALITY, 94])

# ---- 2. logo ---------------------------------------------------------------------
lg = cv2.imread(logo).astype(np.float32)
lg[:14] = 255; lg[:, :14] = 255; lg[-14:] = 255; lg[:, -14:] = 255            # thin frame line on the scan
dark = 255 - lg.min(2)
a = np.clip((dark - 18) / 120, 0, 1)
ys, xs = np.nonzero(a > .3); y0, y1, x0, x1 = ys.min() - 8, ys.max() + 8, xs.min() - 8, xs.max() + 8
rgb = lg.copy()
for c in range(3): rgb[..., c] = np.where(a > 0, (lg[..., c] - 255 * (1 - a)) / np.maximum(a, 1e-3), 0)
out = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8)[y0:y1, x0:x1]
cv2.imwrite(str(PUB / "logo.png"), out)
print("logo", out.shape)

# ---- 3. camera -------------------------------------------------------------------
# plot corners in the photo: left, top (far), right (off-frame, extrapolated), bottom (near)
L, T, R, B = [(22, 655), (708, 418), (1175, 601), (398, 1185)]
P = np.array([L, T, R, B], float); c = np.array([W / 2, H / 2])
def vp(a, b, c_, d):
    l1 = np.cross([*a, 1], [*b, 1]); l2 = np.cross([*c_, 1], [*d, 1]); p = np.cross(l1, l2); return p[:2] / p[2]
v1, v2 = vp(L, T, B, R), vp(L, B, T, R)
f = float(np.sqrt(-np.dot(v1 - c, v2 - c)))
K = np.array([[f, 0, c[0]], [0, f, c[1]], [0, 0, 1]])
Ki = np.linalg.inv(K)
d1 = Ki @ [*v1, 1]; d1 /= np.linalg.norm(d1); d2 = Ki @ [*v2, 1]; d2 /= np.linalg.norm(d2)
# aspect from the homography: try widths and pick the one with the lowest reprojection error
AREA = 669.0  # 10 katha = 7200 sft
best = None
for asp in np.linspace(.4, 2.5, 400):
    Wd = np.sqrt(AREA * asp); Dp = AREA / Wd
    obj = np.array([[0, 0, 0], [Wd, 0, 0], [Wd, 0, Dp], [0, 0, Dp]], float)   # x along L->T, z along L->B, y up
    ok, rv, tv = cv2.solvePnP(obj, P, K, None, flags=cv2.SOLVEPNP_IPPE)
    if not ok: continue
    pr, _ = cv2.projectPoints(obj, rv, tv, K, None); e = np.abs(pr[:, 0] - P).sum()
    Rm, _ = cv2.Rodrigues(rv); cam = (-Rm.T @ tv).ravel()
    if cam[1] > 0 and (best is None or e < best[0]): best = (e, asp, Wd, Dp, Rm, tv.ravel(), cam)
e, asp, Wd, Dp, Rm, tv, cam = best
print(f"f={f:.0f}px vfov={np.degrees(2*np.arctan(H/2/f)):.1f} plot {Wd:.1f}x{Dp:.1f} m err={e:.1f}px cam={cam.round(1)}")
# OpenCV camera (x right, y down, z fwd) -> three.js camera (x right, y up, z back)
Rc = Rm.T @ np.diag([1, -1, -1])
q = cv2.RQDecomp3x3(Rc)  # unused, keep matrix instead
json.dump({"imgW": W, "imgH": H, "f": f, "vfov": float(np.degrees(2 * np.arctan(H / 2 / f))),
           "pos": cam.tolist(), "rot": Rc.T.ravel().tolist(),   # column-major 3x3 for THREE.Matrix3.fromArray
           "plot": {"w": Wd, "d": Dp}, "corners": [L, T, R, B]}, open(SRC / "cam.json", "w"), indent=1)
