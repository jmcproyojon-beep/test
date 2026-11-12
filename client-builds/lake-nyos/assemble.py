"""Assemble the rendered frames into the 48 s film (1080x1920, 30 fps).

    python3 client-builds/lake-nyos/assemble.py

Shots rendered every other frame are motion-interpolated (ffmpeg minterpolate,
MCI) back to 30 fps; every shot is trimmed to exactly 120 frames, upscaled
2x (lanczos + light unsharp), given a fine film grain, then joined with hard
cuts in order. Shot 12 ends on shot 1's first frame, so the film loops.
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FR = ROOT / "projects/lake-nyos/frames_fast"
OUT = ROOT / "projects/lake-nyos"
STEP = {n: 2 for n in range(1, 13)}
LOOK = "scale=1080:1920:flags=lanczos,unsharp=5:5:0.55:5:5:0.0,noise=alls=2:allf=t,format=yuv420p"


def run(cmd):
    subprocess.run(cmd, check=True)


def clip(n):
    d = FR / f"s{n:02d}"
    frames = sorted(d.glob("f*.png"))
    want = 120 // STEP[n]
    assert len(frames) >= want, f"shot {n}: {len(frames)}/{want} frames"
    out = OUT / "clips" / f"s{n:02d}.mp4"
    out.parent.mkdir(parents=True, exist_ok=True)
    lst = out.with_suffix(".txt")
    lst.write_text("".join(f"file '{f}'\nduration {STEP[n] / 30:.6f}\n" for f in frames[:want]) + f"file '{frames[want - 1]}'\n")
    vf = (f"fps=15,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,tpad=stop_mode=clone:stop_duration=1,"
          if STEP[n] == 2 else "fps=30,tpad=stop_mode=clone:stop_duration=1,")
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-vf", vf + LOOK,
         "-frames:v", "120", "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "9M", "-bufsize", "18M", str(out)])
    return out


def main():
    clips = [clip(n) for n in range(1, 13)]
    lst = OUT / "clips" / "all.txt"
    lst.write_text("".join(f"file '{c}'\n" for c in clips))
    film = OUT / "lake-nyos-1986-3d-documentary-9x16.mp4"
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(film)])
    print("wrote", film)


if __name__ == "__main__":
    main()
