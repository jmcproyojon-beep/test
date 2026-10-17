"""Script + reading-paced timing for the no-voiceover quantum/safety edition (16 Oct 2026 news)."""
import json
import re

SCENES = [
    dict(id="s1", label="Hook", lines=[
        "AI দুনিয়ায় নতুন চমক!",
        "Claude এবার Quantum Computing গবেষণায় দেখিয়েছে বড় অগ্রগতি।",
        "আর AI Agent-এর নিরাপত্তা নিয়ে সামনে এসেছে নতুন উদ্বেগ!"]),
    dict(id="s2", label="Claude research", lines=[
        "Anthropic-এর নতুন গবেষণায় Claude Mythos 5 আটটি Quantum Circuit ডিজাইনের কাজ করেছে,",
        "যার সাতটিতে আগের প্রকাশিত সেরা ডিজাইনের চেয়ে ভালো ফল এসেছে।",
        "একটি ক্ষেত্রে গেট সংখ্যা কমেছে সর্বোচ্চ ১৭ গুণ।"]),
    dict(id="s3", label="Why it matters", lines=[
        "এর ফলে ভবিষ্যতে জটিল বৈজ্ঞানিক সমস্যা সমাধান আরও সাশ্রয়ী হতে পারে।",
        "তবে এটি গবেষণার ফলাফল, নতুন কোনো বাণিজ্যিক Quantum Computer নয়।"]),
    dict(id="s4", label="AI agent safety", lines=[
        "অন্যদিকে Tencent জানিয়েছে, মডেল পরীক্ষায় ব্যবহৃত কিছু AI Agent অনাকাঙ্ক্ষিতভাবে ওয়েব ব্রাউজ করেছে।",
        "ঘটনাটি দেখিয়েছে, শক্তিশালী AI-এর পাশাপাশি নিরাপত্তা নিয়ন্ত্রণও কতটা জরুরি।"]),
    dict(id="s5", label="Global AI security", lines=[
        "এদিকে G7 দেশগুলোর অর্থমন্ত্রী ও কেন্দ্রীয় ব্যাংকগুলো আর্থিক খাতে AI-চালিত সাইবার হামলা মোকাবিলায় যৌথ মহড়ার পরিকল্পনা করেছে।",
        "AI নিরাপত্তা এখন আন্তর্জাতিক আলোচনার গুরুত্বপূর্ণ বিষয়।"]),
    dict(id="s6", label="Free AI tool", lines=[
        "আর আপনি AI দিয়ে কাজ শুরু করতে চাইলে",
        "Google AI Studio-র নির্বাচিত ফ্রি মডেল ব্যবহার করে নিজের AI প্রোটোটাইপ পরীক্ষা করতে পারেন।"]),
    dict(id="s7", label="Ending CTA", lines=[
        "AI-এর নতুন সম্ভাবনা কাজে লাগান, তবে নিরাপত্তা ভুলবেন না।",
        "প্রতিদিন যাচাইকৃত AI নিউজ, নতুন টুল আর ব্যবহারিক টিপস পেতে আমাদের সঙ্গে থাকুন!"]),
]

TARGET = 85.0           # total video length
LEAD, TAIL = 0.6, 1.0   # first caption delay, end-card tail
GAP_LINE, GAP_SCENE = 0.35, 0.9
MAXC = 40


def build(out):
    lines = [(s["id"], l) for s in SCENES for l in s["lines"]]
    chars = [len(re.sub(r"\s", "", l)) for _, l in lines]
    gaps = sum(GAP_SCENE if lines[i][0] != lines[i + 1][0] else GAP_LINE for i in range(len(lines) - 1))
    avail = TARGET - LEAD - TAIL - gaps
    rate = sum(chars) / avail                          # chars per second actually shown
    t = LEAD; L = []
    for i, ((sc, text), c) in enumerate(zip(lines, chars)):
        d = c / rate
        words = text.split(); wc = [len(w) for w in words]; tot = sum(wc); acc = t
        ws = []
        for w, n in zip(words, wc):
            dd = d * n / tot; ws.append(dict(t=w, s=round(acc, 3), e=round(acc + dd, 3))); acc += dd
        L.append(dict(scene=sc, text=text, start=round(t, 3), end=round(t + d, 3), words=ws))
        if i + 1 < len(lines):
            t += d + (GAP_SCENE if lines[i + 1][0] != sc else GAP_LINE)
    # caption cues (<= ~40 chars, keep names together, merge orphans)
    NB = {"Claude", "Mythos", "Quantum", "Google", "AI", "G7", "১৭"}
    cues = []
    for ln in L:
        lc, cur = [], []
        for i, w in enumerate(ln["words"]):
            cur.append(w); txt = " ".join(x["t"] for x in cur)
            nxt = ln["words"][i + 1]["t"] if i + 1 < len(ln["words"]) else None
            brk = nxt is None or (w["t"] not in NB and (len(txt + " " + nxt) > MAXC or (len(txt) >= 18 and re.search(r"[,—।!]$", w["t"]))))
            if brk:
                lc.append(dict(scene=ln["scene"], text=txt, start=cur[0]["s"], end=cur[-1]["e"], words=cur)); cur = []
        if len(lc) > 1 and len(lc[-1]["text"]) <= 12:
            a, b = lc[-2], lc.pop(); a["text"] += " " + b["text"]; a["end"] = b["end"]; a["words"] += b["words"]
        cues += lc
    # reading floor: each cue on screen >= 1.4 s by borrowing into the following gap
    for a, b in zip(cues, cues[1:]):
        a["end"] = round(max(a["end"], min(b["start"] - 0.05, a["start"] + 1.4)), 3)
    scenes = []
    for i, s in enumerate(SCENES):
        first = next(x for x in L if x["scene"] == s["id"])
        scenes.append(dict(id=s["id"], label=s["label"], start=0.0 if i == 0 else round(first["start"] - 0.45, 3)))
    for a, b in zip(scenes, scenes[1:]): a["end"] = b["start"]
    scenes[-1]["end"] = TARGET
    json.dump(dict(mode="no_voiceover", chars_per_second=round(rate, 2), video_duration=TARGET, scenes=scenes, lines=L, cues=cues),
              open(out, "w"), ensure_ascii=False, indent=1)
    return rate, scenes, cues


if __name__ == "__main__":
    r, sc, cu = build("/home/user/test/projects/ai-news-quantum-2026-10-16/artifacts/timing.json")
    print("chars/s", round(r, 2), "cues", len(cu))
    for s in sc: print(s["id"], s["start"], s["end"])
    for c in cu: print(f'{c["start"]:6.2f}-{c["end"]:6.2f} [{len(c["text"])}] {c["text"]}')
