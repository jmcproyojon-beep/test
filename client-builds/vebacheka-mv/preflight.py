"""Check this machine can run the lyric burn, before spending an hour on it.

    python3 client-builds/vebacheka-mv/preflight.py ["Vebacheka Ukulele Cover.mp4"]
"""
import json, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent
ok = True

def good(m): print(f"  OK    {m}")
def bad(m):
    global ok; ok = False; print(f"  FAIL  {m}")

print("ffmpeg")
for tool in ("ffmpeg", "ffprobe"):
    p = shutil.which(tool)
    if p:
        v = subprocess.run([p, "-version"], capture_output=True, text=True).stdout.splitlines()[0]
        good(f"{tool}: {v.split(' Copyright')[0]}")
    else:
        bad(f"{tool} not on PATH — install from https://ffmpeg.org/download.html")

print("\npython imaging")
try:
    from PIL import Image, features
    good(f"Pillow {Image.__version__}")
    if features.check("raqm"):
        good("raqm present — Bengali will shape correctly")
    else:
        bad("Pillow has NO raqm. Bengali vowel signs will be reordered and the\n"
            "        lyrics will be wrong without any error. Fix:\n"
            "          pip install --upgrade 'pillow[raqm]'       (or apt install libraqm0)")
except ImportError:
    bad("Pillow not installed — pip install 'pillow[raqm]'")

print("\nfont")
f = HERE/"fonts"/"NotoSerifBengali-Bold.ttf"
good(f"bundled {f.name} ({f.stat().st_size // 1024} KB)") if f.exists() else \
    bad(f"missing {f}")

print("\nlyrics")
sys.path.insert(0, str(HERE))
from srt_lyrics import SRT as srt, lines
if srt.exists():
    ls = lines()
    good(f"{len(ls)} lines, {ls[0]['start']:.1f}s .. {ls[-1]['end']:.1f}s")
else:
    bad(f"missing {srt} — put the client's SRT there (it is tracked, so it\n"
        "        survives between machines and cloud containers)")

if len(sys.argv) > 1:
    print("\nsource video")
    src = Path(sys.argv[1])
    if not src.exists():
        bad(f"not found: {src}")
    else:
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                            "-show_entries", "stream=width,height,r_frame_rate",
                            "-show_entries", "format=duration", "-of", "json", str(src)],
                           capture_output=True, text=True)
        if r.returncode:
            bad(f"ffprobe could not read it: {r.stderr.strip()[:120]}")
        else:
            d = json.loads(r.stdout); st = d["streams"][0]
            dur = float(d["format"]["duration"])
            good(f"{st['width']}x{st['height']}, {dur:.1f}s, {src.stat().st_size/1048576:.0f} MB")
            if srt.exists() and ls[-1]["end"] > dur + 0.05:
                print(f"  NOTE  last lyric ends {ls[-1]['end']:.1f}s but the video is "
                      f"{dur:.1f}s — the tail would be cut off")

print("\n" + ("READY — run cinematic.py" if ok else "NOT READY — fix the FAIL lines above"))
sys.exit(0 if ok else 1)
