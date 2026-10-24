"""Burn the client's lyrics onto their video and give it a cinematic grade.

Deliberately conservative: the picture is not re-cut, re-framed, cropped or
letterboxed, nothing is added but the lyrics, and the audio is copied through
untouched.

  python3 client-builds/vebacheka-mv/cinematic.py INPUT.mp4 [OUTPUT.mp4]
"""
import json, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import make_lyrics

P = Path("projects/vebacheka-mv")
OV = P/"assets/overlays"

# A film pass, not a look-at-me filter:
#   curves   gentle S with a lifted toe, so blacks stay open instead of crushed
#   balance  cool shadows against the warm lamp, the standard teal/amber split
#   eq       a little contrast and colour, nothing that clips
#   vignette light, just enough to hold the eye centre-frame
#   noise    fine grain; also breaks up banding in the dark background
GRADE = (
    "curves=r='0/0.015 0.25/0.22 0.5/0.5 0.75/0.79 1/0.985':"
    "g='0/0.012 0.25/0.225 0.5/0.5 0.75/0.785 1/0.99':"
    "b='0/0.03 0.25/0.245 0.5/0.5 0.75/0.775 1/0.975',"
    "colorbalance=rs=-0.045:gs=-0.012:bs=0.055:rm=0.012:rh=0.05:bh=-0.045,"
    "eq=contrast=1.05:saturation=1.07:gamma=0.99,"
    "vignette=angle=PI/5.2:mode=forward,"
    "noise=alls=3:allf=t+u"
)
FADE = 0.35


def probe(src):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=width,height,r_frame_rate",
                        "-show_entries", "format=duration", "-of", "json", str(src)],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)
    st = d["streams"][0]
    num, den = st["r_frame_rate"].split("/")
    return st["width"], st["height"], float(num) / float(den), float(d["format"]["duration"])


def run(src, out=None, preset="slow", crf=17, grade=True):
    src = Path(src)
    w, h, fps, dur = probe(src)
    out = Path(out) if out else P/"renders"/f"{src.stem}-lyrics-cinematic.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)

    meta = make_lyrics.build(w, h)
    late = [m for m in meta if m["end"] > dur + 0.05]
    print(f"source {w}x{h} @ {fps:.3f}fps, {dur:.2f}s  |  {len(meta)} lyric lines")
    if late:
        print(f"  NOTE: {len(late)} line(s) run past the end of the video "
              f"(last lyric ends {meta[-1]['end']:.1f}s, video ends {dur:.1f}s)")

    inputs, chains = [], []
    # Each strip is looped only for its own span and shifted onto the timeline,
    # so 31 overlays cost little and none of them linger.
    for n, m in enumerate(meta, start=1):
        span = m["end"] - m["start"]
        inputs += ["-loop", "1", "-framerate", f"{fps:.6f}", "-t", f"{span:.3f}",
                   "-i", str(OV/m["file"])]
        fo = max(0.0, span - FADE)
        chains.append(
            f"[{n}:v]format=rgba,"
            f"fade=t=in:st=0:d={FADE}:alpha=1,fade=t=out:st={fo:.3f}:d={FADE}:alpha=1,"
            f"setpts=PTS+{m['start']:.3f}/TB[ly{n}]")

    cur = "[v0]"
    chains.insert(0, f"[0:v]{GRADE}[v0]" if grade else "[0:v]null[v0]")
    for n, m in enumerate(meta, start=1):
        nxt = "[vout]" if n == len(meta) else f"[s{n}]"
        chains.append(f"{cur}[ly{n}]overlay={m['x']}:{m['y']}:"
                      f"enable='between(t,{m['start']:.3f},{m['end']:.3f})':"
                      f"eof_action=pass:repeatlast=0{nxt}")
        cur = nxt

    cmd = ["ffmpeg", "-v", "error", "-stats", "-i", str(src), *inputs,
           "-filter_complex", ";".join(chains), "-map", "[vout]", "-map", "0:a?",
           "-c:v", "libx264", "-crf", str(crf), "-preset", preset,
           "-pix_fmt", "yuv420p", "-x264-params", "ref=4:bframes=4",
           "-c:a", "copy", "-movflags", "+faststart", str(out), "-y"]
    subprocess.run(cmd, check=True)
    print("wrote", out)
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    run(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
