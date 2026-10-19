"""Convert SadTalker outputs to the presenter-frame crop (matches the still photo's object-fit/position) for the lesson."""
import glob, json, os, subprocess
P = "/home/user/test/projects/pillar01-lesson06"; L = f"{P}/assets/lipsync"; J = f"{P}/artifacts/lipsync.json"
res = {}
for sid in ["s01b", "s10c"]:
    v = sorted(glob.glob(f"{L}/out_{sid}/*.mp4"))
    if not v: continue
    out = f"{P}/hf/assets/talk_{sid}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v[-1], "-an", "-vf", "crop=896:1036:0:33,scale=640:740,fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "16", out], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout)
    res[sid] = dict(dur=round(d, 3), src=os.path.basename(v[-1])); print(sid, d)
json.dump(res, open(J, "w"), indent=1)
