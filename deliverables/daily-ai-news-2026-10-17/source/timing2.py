import json, re, subprocess, sys
from script_src import SCENES, tts_line
W="/home/user/test/projects/daily-ai-news-2026-10-17"
SPEED=1.03
words=[w for w in json.load(open(f"{W}/artifacts/narration_words.json"))["words"] if not re.fullmatch(r"\[.*\]",w["text"])]
def sc(t): return round(t/SPEED,3)
idx=0; lines=[]
for sci,s in enumerate(SCENES):
    for l in s["lines"]:
        n=len(tts_line(l).split())
        ws=words[idx:idx+n]; idx+=n
        # sanity check last token matches
        assert ws[-1]["text"].strip("।?!,")[:2]==tts_line(l).split()[-1].strip("।?!,")[:2], (ws[-1]["text"], l)
        disp=l.split()
        assert len(disp)==n
        lines.append(dict(scene=s["id"],text=l,start=sc(ws[0]["start"]),end=sc(ws[-1]["end"]),
                          words=[dict(t=d,s=sc(w["start"]),e=sc(w["end"])) for d,w in zip(disp,ws)]))
assert idx==len(words), (idx,len(words))
# caption chunks: <=2 lines, ~40 chars total; break after punctuation when possible
MAXC=40
cues=[]
for L in lines:
    lc=[]
    cur=[]
    for i,w in enumerate(L["words"]):
        cur.append(w)
        txt=" ".join(x["t"] for x in cur)
        nxt=L["words"][i+1]["t"] if i+1<len(L["words"]) else None
        NB={"Gemini","4","Muse","Spark","Google","Intelligent","হোয়াইট","১৩","১৫","১","১০","প্রায়"}
        brk = nxt is None or (w["t"] not in NB and (False or len(txt+" "+nxt)>MAXC or (len(txt)>=18 and re.search(r"[,—।]$",w["t"])) or (nxt=="—" and len(txt)>=14)))
        if nxt is not None and w["t"] in NB and len(txt+" "+nxt)<=MAXC+12: brk=False
        if brk:
            lc.append(dict(scene=L["scene"],text=txt.strip(" —"),start=cur[0]["s"],end=cur[-1]["e"],words=cur)); cur=[]
    if len(lc)>1 and len(lc[-1]["text"])<=10 and len(lc[-2]["text"])+len(lc[-1]["text"])<=MAXC+12:
        a,b=lc[-2],lc.pop(); a["text"]=a["text"]+" "+b["text"]; a["end"]=b["end"]; a["words"]+=b["words"]
    cues+=lc
# drop standalone dash tokens from cue word lists; extend cue end to next start (min gap 0.04)
for c in cues: c["words"]=[w for w in c["words"] if w["t"]!="—"]
for a,b in zip(cues,cues[1:]):
    if b["start"]-a["end"]<0.6: a["end"]=round(b["start"]-0.04,3)
total=sc(91.716)
scenes=[]
for i,s in enumerate(SCENES):
    ls=[L for L in lines if L["scene"]==s["id"]]
    st=0.0 if i==0 else round(ls[0]["start"]-0.25,3)
    scenes.append(dict(id=s["id"],label=s["label"],tag=s["tag"],onscreen=s["onscreen"],start=st))
for a,b in zip(scenes,scenes[1:]): a["end"]=b["start"]
scenes[-1]["end"]=round(total+1.0,3)   # 1.5s tail for outro
json.dump(dict(speed=SPEED,narration_duration=total,video_duration=scenes[-1]["end"],scenes=scenes,lines=lines,cues=cues),
          open(f"{W}/artifacts/timing.json","w"),ensure_ascii=False,indent=1)
for s in scenes: print(f'{s["id"]} {s["start"]:6.2f}-{s["end"]:6.2f} {s["label"]}')
print(len(cues),"cues; video",scenes[-1]["end"])
for c in cues[:8]: print(f'{c["start"]:6.2f}-{c["end"]:6.2f} {c["text"]}')
