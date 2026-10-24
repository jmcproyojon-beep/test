#!/usr/bin/env python3
"""Look at and listen to footage from a shell, so an agent can understand media it cannot play.

Every command prints JSON to stdout. Images are written to disk and their paths
are listed in the JSON; open them with the Read tool to actually see them.

Requires ffmpeg/ffprobe. `transcribe` additionally needs `pip install faster-whisper`
and network access to huggingface.co the first time a model is used.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def die(msg: str, code: int = 1) -> None:
    print(json.dumps({"error": msg}), file=sys.stdout)
    sys.exit(code)


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def need_ffmpeg() -> None:
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            die(f"{tool} not found. Install ffmpeg (apt install ffmpeg / brew install ffmpeg).")


def fmt_ts(t: float) -> str:
    m, s = divmod(max(t, 0.0), 60)
    h, m = divmod(int(m), 60)
    return f"{h:d}:{m:02d}:{s:06.3f}" if h else f"{m:02d}:{s:06.3f}"


def default_outdir(src: str, kind: str) -> Path:
    d = Path(tempfile.gettempdir()) / "watch" / f"{Path(src).stem}_{kind}"
    d.mkdir(parents=True, exist_ok=True)
    return d


# ---------------------------------------------------------------- probe

def probe(path: str) -> dict:
    if not os.path.exists(path):
        die(f"file not found: {path}")
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path])
    if r.returncode != 0:
        die(f"ffprobe failed: {r.stderr.strip()}")
    data = json.loads(r.stdout)
    fmt = data.get("format", {})
    out = {
        "file": os.path.abspath(path),
        "container": fmt.get("format_name"),
        "duration": float(fmt["duration"]) if fmt.get("duration") else None,
        "size_bytes": int(fmt.get("size", 0)),
        "bit_rate": int(fmt["bit_rate"]) if fmt.get("bit_rate") else None,
        "video": None,
        "audio": None,
    }
    for s in data.get("streams", []):
        if s.get("codec_type") == "video" and out["video"] is None and s.get("disposition", {}).get("attached_pic") != 1:
            num, _, den = (s.get("avg_frame_rate") or "0/1").partition("/")
            fps = float(num) / float(den) if den and float(den) else None
            rot = 0
            for sd in s.get("side_data_list", []) or []:
                if "rotation" in sd:
                    rot = int(sd["rotation"])
            out["video"] = {
                "codec": s.get("codec_name"),
                "width": s.get("width"),
                "height": s.get("height"),
                "fps": round(fps, 3) if fps else None,
                "pix_fmt": s.get("pix_fmt"),
                "rotation": rot,
                "frames": int(s["nb_frames"]) if s.get("nb_frames", "").isdigit() else None,
            }
        elif s.get("codec_type") == "audio" and out["audio"] is None:
            out["audio"] = {
                "codec": s.get("codec_name"),
                "sample_rate": int(s.get("sample_rate", 0)) or None,
                "channels": s.get("channels"),
            }
    if out["duration"] is None:
        out["duration"] = 0.0
    return out


# ---------------------------------------------------------------- frames

def grab(path: str, times: list[float], outdir: Path, width: int) -> list[dict]:
    outdir.mkdir(parents=True, exist_ok=True)
    frames = []
    for i, t in enumerate(times):
        dest = outdir / f"frame_{i:03d}_{t:08.3f}s.png"
        r = run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t}", "-i", path, "-frames:v", "1",
                 "-vf", f"scale={width}:-2", str(dest)])
        if r.returncode != 0 or not dest.exists():
            frames.append({"t": t, "error": r.stderr.strip() or "no frame at this time"})
        else:
            frames.append({"t": t, "time": fmt_ts(t), "path": str(dest)})
    return frames


def filmstrip(path: str, count: int, cols: int, width: int, out: Path, start: float | None, end: float | None) -> dict:
    from PIL import Image, ImageDraw, ImageFont

    info = probe(path)
    if not info["video"]:
        die("no video stream")
    dur = info["duration"] or 0
    a = start or 0.0
    b = min(end, dur) if end else dur
    span = max(b - a, 0.001)
    times = [a + span * (i + 0.5) / count for i in range(count)]
    with tempfile.TemporaryDirectory() as td:
        frames = grab(path, times, Path(td), width)
        imgs = [(f, Image.open(f["path"]).convert("RGB")) for f in frames if "path" in f]
        if not imgs:
            die("could not decode any frames")
        w, h = imgs[0][1].size
        rows = math.ceil(len(imgs) / cols)
        sheet = Image.new("RGB", (cols * w, rows * h), "black")
        draw = ImageDraw.Draw(sheet)
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", max(12, w // 14))
        except OSError:
            font = ImageFont.load_default()
        for i, (f, im) in enumerate(imgs):
            x, y = (i % cols) * w, (i // cols) * h
            sheet.paste(im.resize((w, h)), (x, y))
            label = f"{i + 1}  {fmt_ts(f['t'])}"
            bbox = draw.textbbox((0, 0), label, font=font)
            draw.rectangle([x, y, x + bbox[2] + 10, y + bbox[3] + 8], fill="black")
            draw.text((x + 5, y + 3), label, fill="white", font=font)
        out.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(out)
    return {"path": str(out), "tiles": [{"index": i + 1, "t": round(f["t"], 3), "time": fmt_ts(f["t"])}
                                         for i, (f, _) in enumerate(imgs)], "cols": cols}


# ---------------------------------------------------------------- analysis

def silences(path: str, noise_db: float, min_dur: float) -> list[dict]:
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn",
             "-af", f"silencedetect=noise={noise_db}dB:d={min_dur}", "-f", "null", "-"])
    out, cur = [], None
    for line in r.stderr.splitlines():
        if m := re.search(r"silence_start: (-?[\d.]+)", line):
            cur = max(float(m.group(1)), 0.0)
        elif (m := re.search(r"silence_end: ([\d.]+)", line)) and cur is not None:
            end = float(m.group(1))
            out.append({"start": round(cur, 3), "end": round(end, 3), "duration": round(end - cur, 3)})
            cur = None
    if cur is not None:
        d = probe(path)["duration"]
        out.append({"start": round(cur, 3), "end": round(d, 3), "duration": round(d - cur, 3)})
    return out


def loudness(path: str) -> dict:
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "volumedetect", "-f", "null", "-"])
    res = {}
    for key in ("mean_volume", "max_volume"):
        if m := re.search(rf"{key}: (-?[\d.]+) dB", r.stderr):
            res[key + "_db"] = float(m.group(1))
    return res


def waveform(path: str, out: Path, noise_db: float, min_dur: float) -> dict:
    from PIL import Image, ImageDraw

    info = probe(path)
    if not info["audio"]:
        die("no audio stream")
    W, H = 1600, 240
    out.parent.mkdir(parents=True, exist_ok=True)
    r = run(["ffmpeg", "-v", "error", "-y", "-i", path, "-filter_complex",
             f"aformat=channel_layouts=mono,showwavespic=s={W}x{H}:colors=#4fa3ff", "-frames:v", "1", str(out)])
    if r.returncode != 0:
        die(f"waveform render failed: {r.stderr.strip()}")
    sil = silences(path, noise_db, min_dur)
    dur = info["duration"] or 1
    img = Image.open(out).convert("RGBA")
    bg = Image.new("RGBA", img.size, (16, 16, 16, 255))
    over = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for s in sil:
        d.rectangle([s["start"] / dur * W, 0, s["end"] / dur * W, H], fill=(255, 80, 80, 70))
    for i in range(int(dur) + 1):  # tick each second, label every 5/10/30
        step = 1 if dur <= 30 else 5 if dur <= 120 else 10 if dur <= 600 else 60
        if i % step == 0:
            x = i / dur * W
            d.line([x, H - 10, x, H], fill=(200, 200, 200, 255))
            d.text((x + 2, H - 22), fmt_ts(i)[:-4], fill=(200, 200, 200, 255))
    Image.alpha_composite(Image.alpha_composite(bg, img), over).convert("RGB").save(out)
    return {"path": str(out), "duration": dur, "silences": sil, "loudness": loudness(path),
            "note": "Red bands are silences."}


def scenes(path: str, threshold: float, min_gap: float = 1.0) -> list[dict]:
    """Scene changes. Scores every frame (0-1); a score >= threshold is a hard cut, and a
    clear local peak well above the clip's typical motion is reported as a soft one
    (dissolves, cuts between dark shots)."""
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-an", "-vf",
             "select='gte(scene,0)',metadata=print:key=lavfi.scene_score", "-f", "null", "-"])
    scores: list[tuple[float, float]] = []
    t = None
    for line in r.stderr.splitlines():
        if m := re.search(r"pts_time:([\d.]+)", line):
            t = float(m.group(1))
        elif (m := re.search(r"lavfi\.scene_score=([\d.]+)", line)) and t is not None:
            scores.append((t, float(m.group(1))))
    if not scores:
        return []
    vals = sorted(s for _, s in scores)
    median = vals[len(vals) // 2]
    soft_floor = max(0.04, median * 8)
    cands = []
    for i, (t, s) in enumerate(scores):
        if t < 0.25:  # opening frames have nothing to change from
            continue
        window = [v for _, v in scores[max(0, i - 3):i + 4]]
        if s >= threshold or (s >= soft_floor and s == max(window)):
            cands.append((t, s))
    cuts: list[dict] = []
    for t, s in cands:  # keep the strongest peak within min_gap
        if cuts and t - cuts[-1]["t"] < min_gap:
            if s > cuts[-1]["score"]:
                cuts[-1] = {"t": round(t, 3), "score": s}
            continue
        cuts.append({"t": round(t, 3), "score": s})
    for c in cuts:
        c["time"] = fmt_ts(c["t"])
        c["kind"] = "hard" if c["score"] >= threshold else "soft"
        c["score"] = round(c["score"], 3)
    return cuts


# ---------------------------------------------------------------- speech

def transcribe(path: str, model: str, language: str | None) -> dict:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        die("faster-whisper is not installed: pip install faster-whisper")
    try:
        m = WhisperModel(model, device="cpu", compute_type="int8")
    except Exception as e:  # model download blocked, no disk, etc.
        die(f"could not load Whisper model '{model}': {e}. The first run downloads it from "
            "huggingface.co; make sure that host is reachable.")
    segs, info = m.transcribe(path, word_timestamps=True, language=language, vad_filter=True)
    segments = []
    for s in segs:
        segments.append({
            "start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
            "words": [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for w in (s.words or [])],
        })
    return {"language": info.language, "duration": round(info.duration, 2),
            "text": " ".join(s["text"] for s in segments), "segments": segments}


def to_srt(segments: list[dict]) -> str:
    def t(x: float) -> str:
        ms = int(round(x * 1000))
        h, ms = divmod(ms, 3600000)
        m, ms = divmod(ms, 60000)
        s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    return "\n".join(f"{i}\n{t(s['start'])} --> {t(s['end'])}\n{s['text']}\n" for i, s in enumerate(segments, 1))


# ---------------------------------------------------------------- cli

def main() -> None:
    need_ffmpeg()
    p = argparse.ArgumentParser(prog="watch", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("probe", help="container, codec, duration, resolution, fps, audio")
    s.add_argument("file")

    s = sub.add_parser("overview", help="one-shot: probe + filmstrip + scene cuts + silences (+ transcript)")
    s.add_argument("file")
    s.add_argument("-o", "--outdir")
    s.add_argument("--transcribe", action="store_true", help="also run speech-to-text")
    s.add_argument("--model", default="base")

    s = sub.add_parser("grab", help="decode frames at exact times to PNG")
    s.add_argument("file")
    s.add_argument("-t", "--times", type=float, nargs="+", required=True, help="seconds")
    s.add_argument("-o", "--outdir")
    s.add_argument("-w", "--width", type=int, default=960)

    s = sub.add_parser("filmstrip", help="contact sheet of evenly spaced frames, labelled with timestamps")
    s.add_argument("file")
    s.add_argument("-n", "--count", type=int, default=12)
    s.add_argument("-c", "--cols", type=int, default=4)
    s.add_argument("-w", "--width", type=int, default=480, help="width of each tile")
    s.add_argument("--start", type=float)
    s.add_argument("--end", type=float)
    s.add_argument("-o", "--output")

    s = sub.add_parser("waveform", help="waveform image with silences flagged, plus loudness")
    s.add_argument("file")
    s.add_argument("-o", "--output")
    s.add_argument("--noise", type=float, default=-35.0, help="silence threshold in dB")
    s.add_argument("--min", type=float, default=0.5, help="minimum silence length in seconds")

    s = sub.add_parser("scenes", help="timestamps of hard cuts / scene changes")
    s.add_argument("file")
    s.add_argument("--threshold", type=float, default=0.3, help="score 0-1 that counts as a hard cut")

    s = sub.add_parser("transcribe", help="timed, word-level transcript (faster-whisper)")
    s.add_argument("file")
    s.add_argument("--model", default="base", help="tiny | base | small | medium | large-v3")
    s.add_argument("--language")
    s.add_argument("--srt", help="also write subtitles to this .srt path")
    s.add_argument("--no-words", action="store_true", help="omit per-word timings from the JSON")

    a = p.parse_args()
    if a.cmd == "probe":
        res = probe(a.file)
    elif a.cmd == "grab":
        res = {"frames": grab(a.file, a.times, Path(a.outdir) if a.outdir else default_outdir(a.file, "frames"), a.width)}
    elif a.cmd == "filmstrip":
        out = Path(a.output) if a.output else default_outdir(a.file, "sheets") / "filmstrip.png"
        res = filmstrip(a.file, a.count, a.cols, a.width, out, a.start, a.end)
    elif a.cmd == "waveform":
        out = Path(a.output) if a.output else default_outdir(a.file, "audio") / "waveform.png"
        res = waveform(a.file, out, a.noise, a.min)
    elif a.cmd == "scenes":
        res = {"cuts": scenes(a.file, a.threshold)}
    elif a.cmd == "transcribe":
        res = transcribe(a.file, a.model, a.language)
        if a.srt:
            Path(a.srt).write_text(to_srt(res["segments"]))
            res["srt"] = os.path.abspath(a.srt)
        if a.no_words:
            for seg in res["segments"]:
                seg.pop("words", None)
    elif a.cmd == "overview":
        od = Path(a.outdir) if a.outdir else default_outdir(a.file, "overview")
        res = {"probe": probe(a.file)}
        if res["probe"]["video"]:
            n = 12 if res["probe"]["duration"] <= 120 else 20
            res["filmstrip"] = filmstrip(a.file, n, 4, 480, od / "filmstrip.png", None, None)
            res["scene_cuts"] = scenes(a.file, 0.3)
        if res["probe"]["audio"]:
            res["waveform"] = waveform(a.file, od / "waveform.png", -35.0, 0.5)
            if a.transcribe:
                res["transcript"] = transcribe(a.file, a.model, None)
                for seg in res["transcript"]["segments"]:
                    seg.pop("words", None)
        res["note"] = "Open the PNG paths with the Read tool to see them."
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
