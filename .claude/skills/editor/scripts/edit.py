#!/usr/bin/env python3
"""Edit footage from a shell with ffmpeg: cut, join, tighten, reframe, caption, title,
score, grade and export. Every command writes a new file (inputs are never changed)
and prints JSON describing the result.

Requires ffmpeg/ffprobe. Inspect footage first with the `watch` skill.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]

ASPECTS = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080), "4:5": (1080, 1350), "4:3": (1440, 1080)}

GRADES = {
    "neutral": "eq=contrast=1.05:saturation=1.05",
    "warm": "colorbalance=rs=.08:gs=.02:bs=-.08:rm=.05:bm=-.05,eq=saturation=1.1",
    "cool": "colorbalance=rs=-.06:bs=.08:rm=-.04:bm=.06,eq=saturation=1.05",
    "punchy": "eq=contrast=1.15:saturation=1.25:gamma=0.97",
    "cinematic": "curves=preset=medium_contrast,colorbalance=rs=-.05:bs=.05:rh=.06:bh=-.04,eq=saturation=0.9",
    "bw": "hue=s=0,eq=contrast=1.15",
    "fade": "curves=all='0/0.08 1/0.92',eq=saturation=0.85",
}

ENC_V = ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p"]
ENC_A = ["-c:a", "aac", "-b:a", "192k"]


def die(msg: str) -> None:
    print(json.dumps({"error": msg}))
    sys.exit(1)


def ff(args: list[str]) -> None:
    cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-y", *args]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        die(f"ffmpeg failed: {r.stderr.strip()[-1500:]}")


def probe(path: str) -> dict:
    if not os.path.exists(path):
        die(f"file not found: {path}")
    r = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path],
                       capture_output=True, text=True)
    if r.returncode != 0:
        die(f"ffprobe failed on {path}: {r.stderr.strip()}")
    d = json.loads(r.stdout)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"
              and s.get("disposition", {}).get("attached_pic") != 1), None)
    a = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
    fps = None
    if v:
        n, _, dd = v.get("avg_frame_rate", "0/1").partition("/")
        fps = float(n) / float(dd) if float(dd or 0) else None
    return {"duration": float(d["format"].get("duration", 0)), "width": v and v["width"],
            "height": v and v["height"], "fps": fps, "has_video": bool(v), "has_audio": bool(a)}


def result(out: str, **extra) -> None:
    info = probe(out)
    print(json.dumps({"output": os.path.abspath(out), "duration": round(info["duration"], 3),
                      "resolution": f"{info['width']}x{info['height']}" if info["has_video"] else None,
                      **extra}, indent=2))


def font() -> str:
    for f in FONT_CANDIDATES:
        if os.path.exists(f):
            return f
    die("no TrueType font found; pass --font /path/to/font.ttf")


def esc_path(p: str) -> str:
    return os.path.abspath(p).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")


def parse_ranges(spec: str) -> list[tuple[float, float]]:
    """'0-4.5, 10-12' -> [(0, 4.5), (10, 12)]. Times may be seconds or mm:ss(.ms)."""
    def sec(x: str) -> float:
        parts = [float(p) for p in x.strip().split(":")]
        return sum(p * 60 ** i for i, p in enumerate(reversed(parts)))
    out = []
    for chunk in spec.split(","):
        a, _, b = chunk.strip().partition("-")
        if not b:
            die(f"bad range '{chunk}', expected start-end")
        out.append((sec(a), sec(b)))
    return out


def ensure_audio_args(info: dict) -> list[str]:
    """Extra input for silent clips so every segment has an audio track to concat."""
    return [] if info["has_audio"] else ["-f", "lavfi", "-t", str(info["duration"]),
                                         "-i", "anullsrc=r=48000:cl=stereo"]


# ---------------------------------------------------------------- commands

def cmd_keep(src: str, out: str, ranges: list[tuple[float, float]], fade: float) -> None:
    """Keep only the given ranges, joined in order, frame-accurate."""
    info = probe(src)
    if not ranges:
        die("nothing to keep")
    parts, labels = [], []
    for i, (a, b) in enumerate(ranges):
        b = min(b, info["duration"])
        if b <= a:
            continue
        v = f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]"
        if info["has_audio"]:
            af = f"atrim={a}:{b},asetpts=PTS-STARTPTS"
            if fade > 0:
                af += f",afade=t=in:d={fade},afade=t=out:st={max(b - a - fade, 0)}:d={fade}"
            parts += [v, f"[0:a]{af}[a{i}]"]
            labels.append(f"[v{i}][a{i}]")
        else:
            parts.append(v)
            labels.append(f"[v{i}]")
    n = len(labels)
    a_flag = 1 if info["has_audio"] else 0
    graph = ";".join(parts) + f";{''.join(labels)}concat=n={n}:v=1:a={a_flag}[v]" + ("[a]" if a_flag else "")
    maps = ["-map", "[v]"] + (["-map", "[a]"] if a_flag else [])
    ff(["-i", src, "-filter_complex", graph, *maps, *ENC_V, *(ENC_A if a_flag else []), out])
    result(out, segments=[{"start": a, "end": b} for a, b in ranges])


def cmd_concat(inputs: list[str], out: str, aspect: str | None, fps: float, xfade: float) -> None:
    infos = [probe(p) for p in inputs]
    if aspect:
        W, H = ASPECTS[aspect]
    else:
        W, H = infos[0]["width"], infos[0]["height"]
    args, parts = [], []
    idx = 0
    vlabels, alabels = [], []
    for i, (p, info) in enumerate(zip(inputs, infos)):
        args += ["-i", p]
        vi = idx
        idx += 1
        if info["has_audio"]:
            ai = f"{vi}:a"
        else:
            args += ensure_audio_args(info)
            ai = f"{idx}:a"
            idx += 1
        parts.append(f"[{vi}:v]scale={W}:{H}:force_original_aspect_ratio=decrease,"
                     f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps={fps},format=yuv420p[v{i}]")
        parts.append(f"[{ai}]aformat=sample_rates=48000:channel_layouts=stereo[a{i}]")
        vlabels.append(f"[v{i}]")
        alabels.append(f"[a{i}]")
    if xfade > 0 and len(inputs) > 1:
        offset, vprev, aprev = 0.0, "[v0]", "[a0]"
        for i in range(1, len(inputs)):
            offset += infos[i - 1]["duration"] - xfade
            parts.append(f"{vprev}[v{i}]xfade=transition=fade:duration={xfade}:offset={offset:.3f}[vx{i}]")
            parts.append(f"{aprev}[a{i}]acrossfade=d={xfade}[ax{i}]")
            vprev, aprev = f"[vx{i}]", f"[ax{i}]"
        graph = ";".join(parts)
        maps = ["-map", vprev, "-map", aprev]
    else:
        graph = ";".join(parts) + ";" + "".join(v + a for v, a in zip(vlabels, alabels)) + \
            f"concat=n={len(inputs)}:v=1:a=1[v][a]"
        maps = ["-map", "[v]", "-map", "[a]"]
    ff([*args, "-filter_complex", graph, *maps, *ENC_V, *ENC_A, out])
    result(out, inputs=len(inputs))


def detect_silences(src: str, noise: float, min_len: float) -> list[tuple[float, float]]:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-vn", "-af",
                        f"silencedetect=noise={noise}dB:d={min_len}", "-f", "null", "-"],
                       capture_output=True, text=True)
    sil, cur = [], None
    for line in r.stderr.splitlines():
        if m := re.search(r"silence_start: (-?[\d.]+)", line):
            cur = max(float(m.group(1)), 0.0)
        elif (m := re.search(r"silence_end: ([\d.]+)", line)) and cur is not None:
            sil.append((cur, float(m.group(1))))
            cur = None
    if cur is not None:
        sil.append((cur, probe(src)["duration"]))
    return sil


def cmd_tighten(src: str, out: str, noise: float, min_len: float, pad: float, dry: bool) -> None:
    """Remove pauses longer than min_len, keeping `pad` seconds of air on each side."""
    info = probe(src)
    if not info["has_audio"]:
        die("no audio track to detect pauses in")
    keep, pos = [], 0.0
    for a, b in detect_silences(src, noise, min_len):
        cut_a, cut_b = a + pad, b - pad
        if cut_b - cut_a <= 0.05:
            continue
        if cut_a > pos:
            keep.append((round(pos, 3), round(cut_a, 3)))
        pos = cut_b
    if pos < info["duration"]:
        keep.append((round(pos, 3), round(info["duration"], 3)))
    removed = info["duration"] - sum(b - a for a, b in keep)
    if dry:
        print(json.dumps({"keep": keep, "would_remove_seconds": round(removed, 2)}, indent=2))
        return
    cmd_keep(src, out, keep, fade=0.01)


def cmd_reframe(src: str, out: str, aspect: str, mode: str, x: float) -> None:
    W, H = ASPECTS[aspect]
    if mode == "crop":
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H}:(iw-{W})*{x}:(ih-{H})/2,setsar=1")
        graph, maps = None, ["-vf", vf]
    elif mode == "pad":
        maps = ["-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
                       f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1"]
    else:  # blur: fit the frame on a blurred, zoomed copy of itself
        graph = (f"[0:v]split[bg][fg];[bg]scale={W}:{H}:force_original_aspect_ratio=increase,"
                 f"crop={W}:{H},boxblur=30:5,eq=brightness=-0.08[b];"
                 f"[fg]scale={W}:{H}:force_original_aspect_ratio=decrease[f];"
                 f"[b][f]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")
        maps = ["-filter_complex", graph, "-map", "[v]", "-map", "0:a?"]
    ff(["-i", src, *maps, *ENC_V, *ENC_A, out])
    result(out, aspect=aspect, mode=mode)


def cmd_captions(src: str, out: str, srt: str, size: int, position: str, style: str) -> None:
    info = probe(src)
    # libass sizes are relative to a 288-line canvas; scale so --size is in output pixels.
    fs = max(8, round(size * 288 / info["height"]))
    margin = round((0.08 if position == "bottom" else 0.42) * 288)
    styles = {
        "clean": f"FontName=DejaVu Sans,Bold=1,FontSize={fs},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
                 f"BorderStyle=1,Outline=1.6,Shadow=0.6,Alignment=2,MarginV={margin}",
        "box": f"FontName=DejaVu Sans,Bold=1,FontSize={fs},PrimaryColour=&H00FFFFFF,BackColour=&H80000000,"
               f"OutlineColour=&H80000000,BorderStyle=3,Outline=6,Shadow=0,Alignment=2,MarginV={margin}",
        "yellow": f"FontName=DejaVu Sans,Bold=1,FontSize={fs},PrimaryColour=&H0000E5FF,OutlineColour=&H00000000,"
                  f"BorderStyle=1,Outline=2,Shadow=0.8,Alignment=2,MarginV={margin}",
    }
    vf = f"subtitles='{esc_path(srt)}':force_style='{styles[style]}'"
    ff(["-i", src, "-vf", vf, *ENC_V, "-c:a", "copy", out])
    result(out, captions=os.path.abspath(srt))


POSITIONS = {"top": "h*0.08", "upper": "h*0.2", "center": "(h-text_h)/2",
             "lower-third": "h*0.72", "bottom": "h*0.85-text_h"}


def drawtext(text: str, start: float, end: float, tmp: list[str], size: int = 96, position: str = "center",
             color: str = "white", box: bool = False, boxcolor: str = "black@0.55", fade: float = 0.3,
             font: str | None = None, **_) -> str:
    """One drawtext filter. The text goes through a temp file with expansion off, so quotes,
    colons and % need no escaping; the caller deletes the files listed in `tmp`."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as tf:
        tf.write(text)
    tmp.append(tf.name)
    y = POSITIONS.get(position, position)  # a named slot or a raw ffmpeg y expression
    alpha = "1" if fade <= 0 else \
        f"if(lt(t,{start}+{fade}),(t-{start})/{fade},if(gt(t,{end}-{fade}),({end}-t)/{fade},1))"
    return (f"drawtext=fontfile='{esc_path(font or globals()['font']())}':textfile='{esc_path(tf.name)}':"
            f"expansion=none:fontsize={size}:fontcolor={color}:x=(w-text_w)/2:y={y}:"
            f"enable='between(t,{start},{end})':alpha='{alpha}'"
            + (f":box=1:boxcolor={boxcolor}:boxborderw={max(12, size // 4)}" if box
               else ":shadowcolor=black@0.7:shadowx=3:shadowy=3"))


def burn_texts(src: str, out: str, items: list[dict]) -> None:
    tmp: list[str] = []
    try:
        vf = ",".join(drawtext(tmp=tmp, **it) for it in items)
        ff(["-i", src, "-vf", vf, *ENC_V, "-c:a", "copy", out])
    finally:
        for f in tmp:
            os.unlink(f)


def cmd_title(src: str, out: str, text: str, start: float, end: float | None, size: int,
              position: str, color: str, box: bool, fontfile: str | None) -> None:
    end = end if end is not None else probe(src)["duration"]
    burn_texts(src, out, [dict(text=text, start=start, end=end, size=size, position=position,
                               color=color, box=box, font=fontfile)])
    result(out, title=text, start=start, end=end)


def cmd_texts(src: str, out: str, spec: str) -> None:
    """Many text overlays in one encode. spec is a JSON file: a list of objects with
    text, start, end and optional size, position, color, box, boxcolor, fade, font."""
    items = json.loads(Path(spec).read_text(encoding="utf-8"))
    dur = probe(src)["duration"]
    for it in items:
        it.setdefault("end", dur)
    burn_texts(src, out, items)
    result(out, overlays=len(items))


def cmd_sfx(src: str, out: str, cues: list[str]) -> None:
    """Mix sound effects in at given times. Each cue is FILE@SECONDS or FILE@SECONDS@VOLUME."""
    info = probe(src)
    args, parts, labels = ["-i", src], [], []
    base = "0:a"
    if not info["has_audio"]:
        args += ensure_audio_args(info)
        base = "1:a"
    offset = args.count("-i")
    for i, cue in enumerate(cues):
        f, _, rest = cue.partition("@")
        t, _, vol = rest.partition("@")
        if not t:
            die(f"bad cue '{cue}', expected FILE@SECONDS[@VOLUME]")
        args += ["-i", f]
        ms = int(float(t) * 1000)
        parts.append(f"[{offset + i}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                     f"volume={vol or 1},adelay={ms}|{ms}[s{i}]")
        labels.append(f"[s{i}]")
    graph = ";".join(parts) + f";[{base}]aformat=sample_rates=48000:channel_layouts=stereo[b];" \
        f"[b]{''.join(labels)}amix=inputs={len(cues) + 1}:duration=first:normalize=0[a]"
    ff([*args, "-filter_complex", graph, "-map", "0:v", "-map", "[a]", "-c:v", "copy", *ENC_A, out])
    result(out, cues=len(cues))


def cmd_music(src: str, out: str, music: str, volume: float, duck: bool, fade_out: float,
              replace: bool = False) -> None:
    info = probe(src)
    if replace:  # drop the original sound (room noise, wind) and use only the music
        info["has_audio"] = False
    dur = info["duration"]
    m = (f"[1:a]aloop=loop=-1:size=2e9,atrim=0:{dur},volume={volume},"
         f"afade=t=in:d=1,afade=t=out:st={max(dur - fade_out, 0)}:d={fade_out}[m]")
    if info["has_audio"] and duck:
        graph = (m + ";[0:a]asplit[voice][key];[m][key]sidechaincompress=threshold=0.03:ratio=8:"
                 "attack=20:release=400[md];[voice][md]amix=inputs=2:duration=first:normalize=0[a]")
    elif info["has_audio"]:
        graph = m + ";[0:a][m]amix=inputs=2:duration=first:normalize=0[a]"
    else:
        graph = m.replace("[m]", "[a]")
    ff(["-i", src, "-stream_loop", "-1", "-i", music, "-filter_complex", graph,
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", *ENC_A, "-t", str(dur), out])
    result(out, music=os.path.abspath(music), ducked=bool(duck and info["has_audio"]), replaced=replace)


def cmd_grade(src: str, out: str, look: str, lut: str | None) -> None:
    vf = f"lut3d='{esc_path(lut)}'" if lut else GRADES[look]
    ff(["-i", src, "-vf", vf, *ENC_V, "-c:a", "copy", out])
    result(out, look=lut or look)


def cmd_speed(src: str, out: str, factor: float) -> None:
    info = probe(src)
    atempo, f = [], factor
    while f > 2.0:
        atempo.append("atempo=2.0")
        f /= 2.0
    while f < 0.5:
        atempo.append("atempo=0.5")
        f /= 0.5
    atempo.append(f"atempo={f}")
    args = ["-i", src, "-filter:v", f"setpts=PTS/{factor}"]
    if info["has_audio"]:
        args += ["-filter:a", ",".join(atempo)]
    ff([*args, *ENC_V, *(ENC_A if info["has_audio"] else []), out])
    result(out, factor=factor)


def cmd_normalize(src: str, out: str, lufs: float) -> None:
    ff(["-i", src, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-c:v", "copy", *ENC_A, out])
    result(out, target_lufs=lufs)


def cmd_export(src: str, out: str, preset: str) -> None:
    presets = {
        "web": ["-vf", "scale='min(1920,iw)':-2", "-c:v", "libx264", "-preset", "slow", "-crf", "21",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", *ENC_A],
        "social": ["-vf", "scale='min(1080,iw)':-2", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
                   "-maxrate", "8M", "-bufsize", "16M", "-r", "30", "-pix_fmt", "yuv420p",
                   "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", "-ar", "48000"],
        "small": ["-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "slow", "-crf", "28",
                  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k"],
        "gif": ["-vf", "fps=12,scale=640:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse", "-an"],
        "audio": ["-vn", "-c:a", "libmp3lame", "-q:a", "2"],
    }
    ff(["-i", src, *presets[preset], out])
    result(out, preset=preset, size_mb=round(os.path.getsize(out) / 1e6, 2))


# ---------------------------------------------------------------- cli

def main() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            die(f"{tool} not found. Install ffmpeg first.")
    p = argparse.ArgumentParser(prog="edit", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    def io(name: str, help: str) -> argparse.ArgumentParser:
        s = sub.add_parser(name, help=help)
        s.add_argument("input")
        s.add_argument("output")
        return s

    s = io("trim", "keep one range")
    s.add_argument("--start", type=float, default=0.0)
    s.add_argument("--end", type=float, required=True)

    s = io("keep", "keep several ranges and join them, e.g. --ranges '0-4.2, 9.5-15, 1:02-1:10'")
    s.add_argument("--ranges", required=True)
    s.add_argument("--fade", type=float, default=0.02, help="audio fade at each join, seconds")

    s = io("cut", "remove ranges, keep the rest, e.g. --ranges '3-5, 12.5-14'")
    s.add_argument("--ranges", required=True)

    s = sub.add_parser("concat", help="join clips end to end (normalises size, fps, audio)")
    s.add_argument("output")
    s.add_argument("inputs", nargs="+")
    s.add_argument("--aspect", choices=ASPECTS)
    s.add_argument("--fps", type=float, default=30)
    s.add_argument("--xfade", type=float, default=0.0, help="crossfade length between clips, seconds")

    s = io("tighten", "remove dead air / long pauses")
    s.add_argument("--noise", type=float, default=-35.0, help="silence threshold dB")
    s.add_argument("--min", type=float, default=0.6, help="only remove pauses longer than this")
    s.add_argument("--pad", type=float, default=0.15, help="seconds of pause to keep each side")
    s.add_argument("--dry-run", action="store_true", help="only print what would be kept")

    s = io("reframe", "change aspect ratio, e.g. 16:9 to 9:16 for shorts")
    s.add_argument("--aspect", choices=ASPECTS, required=True)
    s.add_argument("--mode", choices=["crop", "pad", "blur"], default="crop")
    s.add_argument("--x", type=float, default=0.5, help="crop focus, 0=left 0.5=centre 1=right")

    s = io("captions", "burn an .srt into the picture")
    s.add_argument("--srt", required=True)
    s.add_argument("--size", type=int, default=56, help="text height in output pixels")
    s.add_argument("--position", choices=["bottom", "middle"], default="bottom")
    s.add_argument("--style", choices=["clean", "box", "yellow"], default="clean")

    s = io("title", "draw a text title over a time range (fades in/out)")
    s.add_argument("--text", required=True)
    s.add_argument("--start", type=float, default=0.0)
    s.add_argument("--end", type=float)
    s.add_argument("--size", type=int, default=96)
    s.add_argument("--position", choices=list(POSITIONS), default="center")
    s.add_argument("--color", default="white")
    s.add_argument("--box", action="store_true")
    s.add_argument("--font")

    s = io("texts", "many text overlays in one encode, from a JSON list (see SKILL.md)")
    s.add_argument("--spec", required=True)

    s = io("sfx", "drop sound effects at given times")
    s.add_argument("--cue", action="append", required=True, help="FILE@SECONDS[@VOLUME], repeatable")

    s = io("music", "add a music bed under the existing audio (loops to length)")
    s.add_argument("--music", required=True)
    s.add_argument("--volume", type=float, default=0.18)
    s.add_argument("--no-duck", action="store_true", help="do not lower music under speech")
    s.add_argument("--fade-out", type=float, default=2.0)
    s.add_argument("--replace", action="store_true", help="drop the original audio, keep only the music")

    s = io("grade", "colour look: " + ", ".join(GRADES))
    s.add_argument("--look", choices=GRADES, default="neutral")
    s.add_argument("--lut", help=".cube LUT file (overrides --look)")

    s = io("speed", "speed up or slow down (audio pitch preserved)")
    s.add_argument("--factor", type=float, required=True)

    s = io("normalize", "loudness-normalise audio")
    s.add_argument("--lufs", type=float, default=-14.0, help="-14 social/web, -16 podcasts, -23 broadcast")

    s = io("export", "final encode")
    s.add_argument("--preset", choices=["web", "social", "small", "gif", "audio"], default="web")

    a = p.parse_args()
    if getattr(a, "input", None) and getattr(a, "output", None) and \
            os.path.abspath(a.input) == os.path.abspath(a.output):
        die("output must be a different file from input")

    if a.cmd == "trim":
        cmd_keep(a.input, a.output, [(a.start, a.end)], fade=0.0)
    elif a.cmd == "keep":
        cmd_keep(a.input, a.output, parse_ranges(a.ranges), a.fade)
    elif a.cmd == "cut":
        dur, pos, keep = probe(a.input)["duration"], 0.0, []
        for x, y in sorted(parse_ranges(a.ranges)):
            if x > pos:
                keep.append((pos, x))
            pos = max(pos, y)
        if pos < dur:
            keep.append((pos, dur))
        cmd_keep(a.input, a.output, keep, fade=0.02)
    elif a.cmd == "concat":
        cmd_concat(a.inputs, a.output, a.aspect, a.fps, a.xfade)
    elif a.cmd == "tighten":
        cmd_tighten(a.input, a.output, a.noise, a.min, a.pad, a.dry_run)
    elif a.cmd == "reframe":
        cmd_reframe(a.input, a.output, a.aspect, a.mode, a.x)
    elif a.cmd == "captions":
        cmd_captions(a.input, a.output, a.srt, a.size, a.position, a.style)
    elif a.cmd == "title":
        cmd_title(a.input, a.output, a.text, a.start, a.end, a.size, a.position, a.color, a.box, a.font)
    elif a.cmd == "texts":
        cmd_texts(a.input, a.output, a.spec)
    elif a.cmd == "sfx":
        cmd_sfx(a.input, a.output, a.cue)
    elif a.cmd == "music":
        cmd_music(a.input, a.output, a.music, a.volume, not a.no_duck, a.fade_out, a.replace)
    elif a.cmd == "grade":
        cmd_grade(a.input, a.output, a.look, a.lut)
    elif a.cmd == "speed":
        cmd_speed(a.input, a.output, a.factor)
    elif a.cmd == "normalize":
        cmd_normalize(a.input, a.output, a.lufs)
    elif a.cmd == "export":
        cmd_export(a.input, a.output, a.preset)


if __name__ == "__main__":
    main()
