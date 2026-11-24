#!/usr/bin/env python3
"""ACI Eid Reel, version 2: re-cut of the client's new Flow scene (in/reel_flow_60s.mp4) to the song, after
the client's README_ClaudeCode.md and make_final.py (kit). Writes the picture and the audio; the lyric captions,
the chorus flash and the end card are laid on in Remotion (src/aciReel), which shapes Bangla properly.

    python3 make_edit.py   ->  out/edit.mp4 (1080x1920, 30 fps, no audio) and out/mix.wav (60 s, -14 LUFS)

Song map (kit's 3 pieces, 0.6 s crossfades), set from the song's measured vocal onsets (Whisper):
  reel 0:00-0:40  song 6.6-47.2  -> "উড়ে উড়ে যায়" (song 37.02) lands at reel 30.42, the bridge, arms open
  reel 0:40-0:50  song 71.6-82.2 -> "ডাকছে ঘরে মায়ের আদর" (71.88) at 40.28, the hug at the door
  reel 0:50-1:00  song 91.8-101.8 -> "উড়ে উড়ে যায়, ফিরব আবার চেনা মানুষে" (92.14) at 50.34, the family table
The picture is re-cut so each lyric meets its scene (EDL below); two product moments run in gentle slow motion.
"""
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
SRC, SONG = os.path.join(HERE, "in/reel_flow_60s.mp4"), os.path.join(HERE, "in/eid_song.mp3")
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
W, H, FPS = 1080, 1920, 30

# (source start, source end, speed, push-in)  reel times in the comments
EDL = [
    (5.30, 7.12, 0.55, 0.00),   # 0.00-3.31   the office clock at night, the camera finds him typing (slow motion)
    (0.00, 5.25, 0.5872, 0.00), # 3.31-12.25  tired, rubs his eyes, smiles at his mother's photo ("মনটা আজ ছুটে চলে" 4.4,
                                #             "কানে বাজে আপনজনের ডাক" 10.0 on the photo). The Flow file holds one frozen
                                #             frame from 7.1 to 15.3 s (a gap in its timestamps), so it is not used.
    (15.33, 20.27, 0.76, 0.00), # 12.25-18.75 ACI Lemon, packs up (slow motion: the product moment)
    (20.31, 21.98, 1.0, 0.00),  # 18.75-20.42 the Eid crowd at the station ("ফিরবো বাড়ি খুশি নিয়ে" at 19.8)
    (22.02, 24.94, 1.0, 0.00),  # 20.42-23.34 the train, from above
    (24.98, 29.90, 1.0, 0.00),  # 23.34-28.26 tired in the crowd, the Lemon bottle ("পথের ক্লান্তি ভুলে")
    (29.94, 31.94, 1.0, 0.00),  # 28.26-30.26 the bridge
    (31.98, 35.94, 1.0, 0.00),  # 30.26-34.22 arms open ("উড়ে উড়ে যায়" at 30.42, flash)
    (35.98, 37.27, 1.0, 0.00),  # 34.22-35.51 the village station
    (37.31, 39.94, 1.0, 0.00),  # 35.51-38.14 running home ("ফিরব আবার চেনা মানুষে" at 36.9)
    (39.98, 42.90, 1.0, 0.00),  # 38.14-41.06 mother at the door, the hug ("ডাকছে ঘরে মায়ের আদর" at 40.3)
    (42.94, 46.02, 1.0, 0.00),  # 41.06-44.14 tired mother in the kitchen ("ক্লান্ত হলেও কি")
    (46.06, 47.40, 0.74, 0.00), # 44.14-45.95 ACI Orange for her ("মায়ের হাতের যত্ন পেয়ে")
    (47.44, 49.94, 0.62, 0.00), # 45.95-49.98 she drinks ("খেয়ালটাও রাখি")
    (49.98, 59.95, 1.0, 0.00),  # 49.98-59.95 the family table, then both bottles ("উড়ে উড়ে যায়, ফিরব আবার চেনা মানুষে")
]
SONG_MAP = [(0.0, 6.6, 40.0), (40.0, 71.6, 10.0), (50.0, 91.8, 10.0)]
XFADE, FADE_OUT, AMBIENCE_DB, TOTAL = 0.6, 3.0, -16, 60.0

def run(cmd): subprocess.run(cmd, check=True)

def main():
    parts, amb = [], []
    t = 0.0
    for i, (a, b, sp, push) in enumerate(EDL):
        n = round((t + (b - a) / sp) * FPS) - round(t * FPS)   # frames, so cut times never drift
        d = n / FPS
        v = [f"trim={a}:{b}", "setpts=PTS-STARTPTS"]
        if sp != 1.0:   # motion-interpolated slow motion, done at source size
            v += [f"setpts=PTS/{sp}", "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1"]
        v += ["fps=30", "tpad=stop_mode=clone:stop_duration=1", f"trim=end_frame={n}", "setpts=PTS-STARTPTS", f"scale={W}:{H}:flags=lanczos:force_original_aspect_ratio=increase", f"crop={W}:{H}"]
        if push:        # slow push-in for the static shots
            v += [f"scale=w='{W}*(1+{push}*t/{d:.3f})':h=-1:eval=frame:flags=lanczos", f"crop={W}:{H}"]
        v += ["unsharp=5:5:0.6:5:5:0.0", "eq=contrast=1.04:saturation=1.08", "setsar=1"]
        p = os.path.join(OUT, f"_v{i:02d}.mp4")
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", SRC, "-vf", ",".join(v), "-an", "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-pix_fmt", "yuv420p", p])
        # the clip's own sound, same length, slowed with atempo where the picture is slowed
        q = os.path.join(OUT, f"_a{i:02d}.wav")
        af = f"atrim={a}:{b},asetpts=PTS-STARTPTS" + (f",atempo={sp}" if sp != 1.0 else "") + f",apad,atrim=0:{d:.4f}"
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", SRC, "-af", af, "-ac", "2", "-ar", "48000", q])
        parts.append(p); amb.append(q)
        print(f"{i:2d} {t:6.2f}-{t + d:6.2f}  src {a}-{b} x{sp}")
        t += d
    with open(os.path.join(OUT, "_v.txt"), "w") as f: f.writelines(f"file '{p}'\n" for p in parts)
    with open(os.path.join(OUT, "_a.txt"), "w") as f: f.writelines(f"file '{p}'\n" for p in amb)
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(OUT, "_v.txt"),
         "-vf", f"noise=alls=4:allf=t,tpad=stop_mode=clone:stop_duration=1,trim=0:{TOTAL}", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", os.path.join(OUT, "edit.mp4")])
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(OUT, "_a.txt"), "-af", f"apad,atrim=0:{TOTAL}", os.path.join(OUT, "_amb.wav")])
    # music: the kit's three pieces with 0.6 s crossfades
    ms = []
    for i, (r0, s0, ln) in enumerate(SONG_MAP):
        p = os.path.join(OUT, f"_m{i}.wav"); extra = XFADE if i < len(SONG_MAP) - 1 else 0
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s0), "-t", str(ln + extra), "-i", SONG, "-ac", "2", "-ar", "48000", p]); ms.append(p)
    inputs = sum((["-i", p] for p in ms), []) + ["-i", os.path.join(OUT, "_amb.wav")]
    filt, last = [], "[0:a]"
    for i in range(1, len(ms)):
        filt.append(f"{last}[{i}:a]acrossfade=d={XFADE}:c1=tri:c2=tri[x{i}]"); last = f"[x{i}]"
    n = len(ms)
    filt.append(f"{last}atrim=0:{TOTAL},afade=t=out:st={TOTAL - FADE_OUT}:d={FADE_OUT}[mus]")
    filt.append(f"[{n}:a]volume={AMBIENCE_DB}dB,afade=t=out:st={TOTAL - FADE_OUT}:d={FADE_OUT}[amb]")
    filt.append("[mus][amb]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.0:LRA=11[m]")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[m]", "-ar", "48000", os.path.join(OUT, "mix.wav")])
    for f in os.listdir(OUT):
        if f.startswith("_"): os.remove(os.path.join(OUT, f))
    print("total picture", round(t, 2))

if __name__ == "__main__":
    main()
