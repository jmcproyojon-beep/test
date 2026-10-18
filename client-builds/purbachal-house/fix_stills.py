import subprocess
from pathlib import Path
P = Path("projects/purbachal-house")
IMG, OV, SEG = P/"assets/images", P/"assets/overlays", P/"assets/segments"
FPS = 30

def ov_chain(dur, ov_idx, bar_idx):
    fo = max(0.0, dur - 0.75)
    return (f"[{ov_idx}]format=rgba,fade=t=in:st=0.25:d=0.45:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[ov];"
            f"[{bar_idx}]format=rgba,fade=t=in:st=0.15:d=0.4:alpha=1,fade=t=out:st={fo:.2f}:d=0.45:alpha=1[bar];"
            f"[base][ov]overlay=0:0[t1];[t1][bar]overlay=0:0,format=yuv420p[vout]")

for name, img, dur, ovf in (("01-hero", "photo-01.jpg", 4.0, "title.png"),
                            ("05-house", "photo-02.jpg", 4.0, "lt-03-house.png")):
    n = int(dur * FPS)
    base = (f"scale=2200:-2:flags=lanczos,"
            f"zoompan=z='if(eq(on,0),1.12,max(1.0,zoom-0.00040))':d={n}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},"
            f"eq=contrast=1.05:saturation=1.06:brightness=0.01[base]")
    subprocess.run(["ffmpeg","-v","error","-loop","1","-i",str(IMG/img),
                    "-i",str(OV/ovf),"-i",str(OV/"brand-bar.png"),
                    "-filter_complex", base + ";" + ov_chain(dur,1,2),
                    "-map","[vout]","-frames:v",str(n),"-r",str(FPS),
                    "-c:v","libx264","-crf","19","-preset","slow","-an",
                    str(SEG/f"{name}.mp4"),"-y"], check=True)
    print(name, "rebuilt", dur)

n = 120
subprocess.run(["ffmpeg","-v","error","-loop","1","-i",str(OV/"card-end.png"),"-r",str(FPS),
                "-vf", (f"zoompan=z='min(1.04,1.0+0.00018*on)':d={n}:x='iw/2-(iw/zoom/2)':"
                        f"y='ih/2-(ih/zoom/2)':s=1080x1920:fps={FPS},fade=t=in:st=0:d=0.4,format=yuv420p"),
                "-frames:v", str(n), "-c:v","libx264","-crf","19","-preset","slow","-an",
                str(SEG/"10-end.mp4"),"-y"], check=True)
print("10-end rebuilt 4.0")
