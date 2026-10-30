"""Lay the artwork and the lyrics over the moving background, then mux the song.

Works in time chunks cut at instrumental gaps, so no lyric ever straddles a
join and no single ffmpeg call has to juggle eighty overlay inputs. The
background is already a continuous render, so chunking the composite does not
break its motion.
"""
import json, subprocess, sys
from pathlib import Path

P = Path("projects/nikhoj-songbad")
OV = P/"assets/overlays"
SEG = P/"assets/segments"
BG = P/"assets/bg.mp4"
COVER = P/"assets/images/cover.png"
SONG = P/"assets/audio/song.mp3"
R = P/"renders"
W, H, FPS = 1920, 1080, 30
DUR = 351.17

ART = 880                       # artwork square, centred in the upper half
ART_Y = 42
WHISPER_Y = 880                 # intro/outro lines sit under the artwork

# Windows where the song has no words and the cover art carries the frame.
ART_WINDOWS = [
    (0.0, 59.6), (139.3, 157.0), (237.9, 247.0),
    (269.9, 277.4), (328.0, DUR),
]
FADE = 0.55


def ease_in(start, dur, dist):
    """overlay y expression: settle `dist` px into place over `dur` seconds."""
    return f"+{dist}*(1-min(1,max(0,(t-{start:.3f})/{dur:.2f})))"


def run():
    meta = json.load(open(OV/"lyrics.json", encoding="utf-8"))
    SEG.mkdir(parents=True, exist_ok=True)
    R.mkdir(parents=True, exist_ok=True)

    # chunk boundaries: the middle of each instrumental window
    cuts = [0.0] + [round((a + b) / 2, 2) for a, b in ART_WINDOWS[1:]] + [DUR]
    chunks = list(zip(cuts, cuts[1:]))

    parts = []
    for ci, (c0, c1) in enumerate(chunks):
        out = SEG/f"c{ci:02d}.mp4"
        span = c1 - c0
        inputs, chains, idx = [], [], 1

        # the sharp cover art, for whichever art windows touch this chunk
        for ai, (a0, a1) in enumerate(ART_WINDOWS):
            if a1 <= c0 + 0.02 or a0 >= c1 - 0.02:
                continue
            s, e = max(a0, c0), min(a1, c1)
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{e - s:.3f}",
                       "-i", str(COVER)]
            fo = max(0.0, (e - s) - FADE)
            f = [f"[{idx}:v]scale={ART}:{ART}:flags=lanczos,format=rgba"]
            if a0 >= c0 - 0.01:
                f.append(f"fade=t=in:st=0:d={FADE}:alpha=1")
            if a1 <= c1 + 0.01:
                f.append(f"fade=t=out:st={fo:.3f}:d={FADE}:alpha=1")
            f.append(f"setpts=PTS+{s - c0:.3f}/TB")
            chains.append(",".join(f) + f"[art{idx}]")
            idx += 1

        # lyric lines whose span overlaps this chunk
        for m in meta:
            if m["end"] <= c0 + 0.02 or m["start"] >= c1 - 0.02:
                continue
            s, e = max(m["start"], c0), min(m["end"], c1)
            span_l = e - s
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{span_l:.3f}",
                       "-i", str(OV/m["file"])]
            fin = 0.22 if m["section"] in ("Chorus", "Final Chorus",
                                           "Instrumental Drop") else 0.32
            fout = min(0.42, max(0.14, span_l * 0.3))
            f = [f"[{idx}:v]format=rgba", f"fade=t=in:st=0:d={fin}:alpha=1"]
            f.append(f"fade=t=out:st={max(0.0, span_l - fout):.3f}:d={fout}:alpha=1")
            f.append(f"setpts=PTS+{s - c0:.3f}/TB")
            chains.append(",".join(f) + f"[ly{idx}]")
            m["_idx"], m["_s"], m["_e"] = idx, s, e
            idx += 1

        cur = "[0:v]"
        chains.insert(0, f"[0:v]null[b0]")
        cur = "[b0]"
        n = 0
        for ai in range(1, idx):
            tag = f"[art{ai}]"
            if not any(c.endswith(tag) for c in chains):
                continue
            n += 1
            nxt = f"[m{n}]"
            chains.append(f"{cur}{tag}overlay={(W - ART) // 2}:{ART_Y}:"
                          f"eof_action=pass:repeatlast=0{nxt}")
            cur = nxt
        for m in meta:
            if m.get("_idx") is None or not (c0 <= m["_s"] < c1):
                continue
            n += 1
            nxt = f"[m{n}]"
            whisper = m["section"] in ("Intro", "Outro")
            y = WHISPER_Y if whisper else m["y"]
            dist = 30 if m["section"] in ("Chorus", "Final Chorus") else 18
            yexpr = f"{y}{ease_in(m['_s'] - c0, 0.38, dist)}"
            chains.append(f"{cur}[ly{m['_idx']}]overlay={m['x']}:'{yexpr}':"
                          f"enable='between(t,{m['_s'] - c0:.3f},{m['_e'] - c0:.3f})':"
                          f"eof_action=pass:repeatlast=0{nxt}")
            cur = nxt
            m["_idx"] = None
        chains.append(f"{cur}format=yuv420p[vout]")

        cmd = ["ffmpeg", "-v", "error", "-ss", f"{c0:.3f}", "-t", f"{span:.3f}",
               "-i", str(BG), *inputs,
               "-filter_complex", ";".join(chains), "-map", "[vout]",
               "-frames:v", str(round(span * FPS)), "-r", str(FPS),
               "-c:v", "libx264", "-crf", "19", "-preset", "medium",
               "-pix_fmt", "yuv420p", "-an", str(out), "-y"]
        subprocess.run(cmd, check=True)
        got = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v",
                                  "-count_frames", "-show_entries", "stream=nb_read_frames",
                                  "-of", "csv=p=0", str(out)],
                                 capture_output=True, text=True).stdout.strip())
        want = round(span * FPS)
        print(f"  chunk {ci}: {c0:7.2f}-{c1:7.2f}s  {got}/{want} frames"
              f"{'  SHORT' if got != want else ''}")
        if got != want:
            raise SystemExit(f"chunk {ci} is {want - got} frames short")
        parts.append(out)

    lst = P/"assets/concat.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-c", "copy", str(P/"assets/silent.mp4"), "-y"], check=True)

    fade_at = DUR - 4.0
    subprocess.run(["ffmpeg", "-v", "error", "-stats",
                    "-i", str(P/"assets/silent.mp4"), "-i", str(SONG),
                    "-filter_complex",
                    f"[0:v]fade=t=in:st=0:d=1.5,fade=t=out:st={fade_at:.2f}:d=4.0[v];"
                    f"[1:a]afade=t=out:st={fade_at:.2f}:d=4.0[a]",
                    "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                    "-maxrate", "7000k", "-bufsize", "14000k", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
                    "-movflags", "+faststart", "-shortest",
                    str(R/"nikhoj-songbad-lyric-video.mp4"), "-y"], check=True)
    (P/"assets/silent.mp4").unlink()
    print("wrote", R/"nikhoj-songbad-lyric-video.mp4")


if __name__ == "__main__":
    run()
