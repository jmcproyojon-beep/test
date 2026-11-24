#!/usr/bin/env python3
"""ACI Eid Reel — final assembly: Flow 60s video + song, synced to the story.

Usage (from this folder):
    python3 make_final.py --video reel_flow_60s.mp4 --song eid_song.mp3
Optional:
    --snap            snap song cut points to the nearest beat (needs: pip install librosa)
    --size 1080       output width 1080 (1080x1920) instead of 720 (720x1280)
    --no-ambience     drop the Flow clip sound completely (song only)
Output: ACI_Eid_Reel_FINAL_60s.mp4
"""
import argparse, json, os, subprocess, sys

# ---------------------------------------------------------------------------
# 1) SONG MAP — which part of the song plays under which part of the video.
#    (reel_start, song_start, length)   all in seconds.
#    Song times are ESTIMATES from the song's energy curve (±1-2 s).
#    Listen once and adjust song_start so each lyric lands on its scene.
# ---------------------------------------------------------------------------
SONG_MAP = [
    # reel 0:00-0:40  verse 1 -> pre-chorus -> chorus, one continuous piece
    #   0:00 "মনটা আজ ছুটে চলে" over the office
    #   ~0:15 "ফিরবো বাড়ি খুশি নিয়ে" as he leaves for the station
    #   ~0:30 "উড়ে উড়ে যায়" when he spreads his arms on the bridge
    (0.0, 11.5, 40.0),
    # reel 0:40-0:50  verse 2 "ডাকছে ঘরে মায়ের আদর ... মায়ের হাতের যত্ন" over mother
    (40.0, 70.0, 10.0),
    # reel 0:50-1:00  last chorus over the family table + packshot
    (50.0, 105.0, 10.0),
]
XFADE = 0.6          # seconds of audio crossfade at each song join
FADE_OUT = 3.0       # fade out at the very end
AMBIENCE_DB = -16    # Flow clip sound (train, cap click) under the music; set None to mute

# ---------------------------------------------------------------------------
# 2) VIDEO POLISH
# ---------------------------------------------------------------------------
FLASH_AT = [30.4]                # quick white flash on the chorus hit (bridge, arms open)
END_TEXT = "BODY FLUID RECOVERY" # from the bottle label; replace with client tagline if given
END_TEXT_FROM = 56.5
LOGO_PNG = "aci_logo.png"        # optional: client logo PNG in this folder (shown with END_TEXT)
FONT = ""                        # optional .ttf path (bold sans recommended)

def run(cmd):
    print("+", " ".join(cmd)); subprocess.run(cmd, check=True)

def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    return float(json.loads(out)["format"]["duration"])

def snap_to_beats(song, song_map):
    try:
        import librosa
    except ImportError:
        sys.exit("--snap needs librosa: pip install librosa")
    y, sr = librosa.load(song, sr=22050, mono=True)
    _, beats = librosa.beat.beat_track(y=y, sr=sr)
    bt = librosa.frames_to_time(beats, sr=sr)
    snapped = []
    for r0, s0, ln in song_map:
        s = float(bt[abs(bt - s0).argmin()])
        print(f"  song cut {s0:.2f}s -> beat {s:.2f}s")
        snapped.append((r0, s, ln))
    return snapped

def build_music(song, song_map, total, workdir):
    parts = []
    for i, (r0, s0, ln) in enumerate(song_map):
        p = os.path.join(workdir, f"_m{i}.wav")
        extra = XFADE if i < len(song_map) - 1 else 0
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(s0), "-t", str(ln + extra), "-i", song,
             "-ac", "2", "-ar", "48000", p])
        parts.append(p)
    # chain acrossfade so each join overlaps by XFADE
    inputs, filt, last = [], [], "[0:a]"
    for p in parts:
        inputs += ["-i", p]
    for i in range(1, len(parts)):
        out = f"[x{i}]"
        filt.append(f"{last}[{i}:a]acrossfade=d={XFADE}:c1=tri:c2=tri{out}")
        last = out
    filt.append(f"{last}atrim=0:{total},afade=t=out:st={total-FADE_OUT}:d={FADE_OUT},"
                f"loudnorm=I=-14:TP=-1.0:LRA=11[m]")
    music = os.path.join(workdir, "_music.wav")
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt),
         "-map", "[m]", music])
    return music

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--song", required=True)
    ap.add_argument("--snap", action="store_true")
    ap.add_argument("--size", type=int, default=720)
    ap.add_argument("--no-ambience", action="store_true")
    a = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    total = min(60.0, duration(a.video))
    song_map = snap_to_beats(a.song, SONG_MAP) if a.snap else SONG_MAP
    music = build_music(a.song, song_map, total, here)

    W = a.size; H = W * 16 // 9
    font = f":fontfile='{FONT}'" if FONT else ""
    v = [f"scale={W}:{H}:flags=lanczos:force_original_aspect_ratio=increase,crop={W}:{H}",
         "unsharp=5:5:0.6:5:5:0.0",                    # gentle sharpen after upscale
         "eq=contrast=1.04:saturation=1.08",           # small, even grade across clips
         "noise=alls=4:allf=t"]                        # light film grain glues AI clips together
    for t in FLASH_AT:
        v.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.85:t=fill:enable='between(t,{t},{t+0.15})'")
    v.append(f"drawtext=text='{END_TEXT}'{font}:fontcolor=white:fontsize={int(W*0.064)}:"
             f"borderw=3:bordercolor=black@0.55:x=(w-text_w)/2:y=h*0.78:"
             f"enable='gte(t,{END_TEXT_FROM})':alpha='min(1,(t-{END_TEXT_FROM})/0.5)'")
    v.append(f"fade=t=out:st={total-0.8}:d=0.8")
    vchain = ",".join(v)

    logo = os.path.join(here, LOGO_PNG)
    inputs = ["-i", a.video, "-i", music]
    if os.path.exists(logo):
        inputs += ["-i", logo]
        vgraph = (f"[0:v]{vchain}[base];[2:v]scale={int(W*0.32)}:-1[lg];"
                  f"[base][lg]overlay=(W-w)/2:H*0.66:enable='gte(t,{END_TEXT_FROM})'[v]")
    else:
        vgraph = f"[0:v]{vchain}[v]"

    has_amb = (not a.no_ambience) and AMBIENCE_DB is not None and \
        subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
                        "stream=index", "-of", "csv=p=0", a.video],
                       capture_output=True, text=True).stdout.strip() != ""
    if has_amb:
        agraph = (f"[0:a]volume={AMBIENCE_DB}dB,atrim=0:{total}[amb];"
                  f"[1:a][amb]amix=inputs=2:normalize=0:duration=first[a]")
    else:
        agraph = "[1:a]anull[a]"

    out = os.path.join(here, "ACI_Eid_Reel_FINAL_60s.mp4")
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", vgraph + ";" + agraph,
         "-map", "[v]", "-map", "[a]", "-t", str(total), "-r", "30",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    for f in os.listdir(here):
        if f.startswith("_m") or f == "_music.wav":
            os.remove(os.path.join(here, f))
    print("Done:", out)

if __name__ == "__main__":
    main()
