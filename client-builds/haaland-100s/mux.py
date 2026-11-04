"""Lay the final mix (voice + music + effects) under the silent render.

    python3 -I client-builds/haaland-100s/mux.py
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
R = ROOT/"projects/haaland-100s"
PIC, MIX, OUT = R/"renders/picture.mp4", R/"audio/mix.wav", R/"renders/100-sekende-shikhi-haaland.mp4"


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout)


a, v = dur(MIX), dur(PIC)
pad = max(0.0, a - v) + 0.2
subprocess.run(["ffmpeg", "-v", "error", "-i", str(PIC), "-i", str(MIX),
                "-filter_complex", f"[0:v]tpad=stop_mode=clone:stop_duration={pad:.3f}[v];[1:a]loudnorm=I=-14:TP=-1.0:LRA=11[a]",
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{a:.3f}", str(OUT), "-y"], check=True)
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1048576:.1f} MB, {dur(OUT):.2f}s)")
