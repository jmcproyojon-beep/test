#!/usr/bin/env python3
"""ACI Eid Reel v2, final assembly (after the kit's make_final.py, steps 3-6):
    python3 make_edit.py && node captions.mjs && python3 make_final_v2.py
out/edit.mp4 (re-cut picture) + out/mix.wav (song map + Flow ambience at -16 dB) + out/cap/*.png (Bangla lyrics)
-> out/ACI_Eid_Reel_v2_60s.mp4: white flash on the chorus hit (30.4 s), lyric captions at 75 % height inside the
Reels safe zone, "BODY FLUID RECOVERY" from 56.5 s at the top of the packshot (logo there too if aci_logo.png exists), 0.8 s fade to black,
audio two-pass loudnorm to -14 LUFS / -1 dBTP, H.264 CRF 17, AAC 192k, faststart."""
import json, os, re, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "out")
TOTAL, FLASH_AT, END_FROM, FADE = 60.0, [30.4], 56.5, 0.25
LOGO = os.path.join(HERE, "aci_logo.png")

def main():
    L = json.load(open(os.path.join(OUT, "cap/list.json")))
    caps = L["caps"] + [{"a": END_FROM, "b": TOTAL + 1, "file": L["end"], "y": 250}]  # end card above the bottles, clear of the labels
    inputs = ["-i", os.path.join(OUT, "edit.mp4"), "-i", os.path.join(OUT, "mix.wav")]
    g, last = [], "[0:v]"
    for i, c in enumerate(caps):
        k = i + 2
        inputs += ["-loop", "1", "-framerate", "30", "-t", str(TOTAL), "-i", c["file"]]
        fo = f",fade=t=out:st={c['b'] - FADE:.2f}:d={FADE}:alpha=1" if c["b"] < TOTAL else ""
        g.append(f"[{k}:v]format=rgba,fade=t=in:st={c['a'] - 0.05:.2f}:d={FADE}:alpha=1{fo}[c{i}]")
        g.append(f"{last}[c{i}]overlay=0:{c['y']}:enable='between(t,{c['a'] - 0.05:.2f},{c['b']:.2f})'[v{i}]"); last = f"[v{i}]"
    if os.path.exists(LOGO):
        k = len(caps) + 2; inputs += ["-loop", "1", "-framerate", "30", "-t", str(TOTAL), "-i", LOGO]
        g.append(f"[{k}:v]scale=346:-1,format=rgba,fade=t=in:st={END_FROM}:d=0.5:alpha=1[lg]")
        g.append(f"{last}[lg]overlay=(W-w)/2:H*0.03:enable='gte(t,{END_FROM})'[vl]"); last = "[vl]"
    fl = ",".join(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.85:t=fill:enable='between(t,{t},{t + 0.15})'" for t in FLASH_AT)
    g.append(f"{last}{fl},fade=t=out:st={TOTAL - 0.8}:d=0.8,format=yuv420p[v]")
    # two-pass loudnorm
    m = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", os.path.join(OUT, "mix.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", m).group(0))
    g.append(f"[1:a]loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000[a]")
    out = os.path.join(OUT, "ACI_Eid_Reel_v2_60s.mp4")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(g), "-map", "[v]", "-map", "[a]",
                    "-t", str(TOTAL), "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)
    print("Done:", out)

if __name__ == "__main__":
    main()
