"""Upscale to 1920x1080 and blur out the floating baked-in captions (scene text such as chalkboards is kept)."""
import subprocess, sys
SRC = sys.argv[1]; OUT = sys.argv[2]
K = 1920 / 848   # source -> 1080p scale
# (start, end, x, y, w, h) in source pixels
P = [(4.6, 9.0, 40, 370, 770, 80), (17.4, 24.2, 480, 55, 340, 160), (24.4, 27.2, 30, 135, 315, 115), (28.4, 31.4, 15, 155, 360, 105),
     (42.4, 48.7, 475, 50, 355, 115), (48.6, 50.6, 525, 8, 300, 262), (50.6, 55.2, 465, 35, 365, 120),
     (59.4, 67.6, 495, 30, 315, 200), (69.4, 74.6, 410, 30, 420, 125), (74.4, 80.4, 430, 305, 418, 115)]
f = [f"[0:v]scale=1920:1080:flags=lanczos,unsharp=5:5:0.6,fps=30,format=yuv420p,split={len(P) + 1}[base]" + "".join(f"[s{i}]" for i in range(len(P)))]
cur = "base"
for i, (a, b, x, y, w, h) in enumerate(P):
    pad = 26; x, y, w, h = x - pad, y - pad, w + 2 * pad, h + 2 * pad
    X, Y, W, H = [max(0, int(round(v * K)) // 2 * 2) for v in (x, y, w, h)]
    W = min(W, 1920 - X); H = min(H, 1080 - Y)
    f.append(f"[s{i}]crop={W}:{H}:{X}:{Y},boxblur=34:4,eq=brightness=-0.03,format=yuva420p,"
             f"geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='255*min(1,min(min(X,W-X),min(Y,H-Y))/34)',"
             f"fade=t=in:st={a}:d=0.25:alpha=1,fade=t=out:st={b - 0.25}:d=0.25:alpha=1[p{i}]")
    f.append(f"[{cur}][p{i}]overlay={X}:{Y}:enable='between(t,{a},{b})'[o{i}]"); cur = f"o{i}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", ";".join(f), "-map", f"[{cur}]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "medium", OUT], check=True)
print("clean ok")
