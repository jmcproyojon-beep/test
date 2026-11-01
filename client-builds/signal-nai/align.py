"""Align the artist's lyric sheet for "Signal নাই" to word timings from the audio.

The transcript is only a clock. Every word that reaches the screen comes from
lyrics.md; only the TIMES come from the transcript. Matching is
Needleman-Wunsch over the two word sequences with fuzzy similarity, so
mishearings align as substitutions and instrumental passages as gaps.

This song mixes scripts: the sheet writes "Signal" in Latin, while a Bengali
transcript may spell it সিগন্যাল. Plain character similarity scores that pair
0, so known English words get an explicit equivalence.

    python3 -I client-builds/signal-nai/align.py      # prints the timing table
"""
import json, re
from difflib import SequenceMatcher
from pathlib import Path

HERE = Path(__file__).parent
P = Path(__file__).resolve().parents[2]/"projects/signal-nai"
LYRICS = HERE/"lyrics.md"
WORDS = P/"assets/audio/words.json"

SECTION = re.compile(r"^#{2,}\s*\[(.+?)\]\s*$")
PUNCT = re.compile(r"[।?!,.\"'…—\-“”‘’*]+")
MAXLEN = 34

# Latin words in the sheet and the Bengali-script stems a transcript may use
TRANSLIT = {"signal": ("সিগন", "সিগন্য", "signal")}


def norm(w):
    return PUNCT.sub("", w).strip().lower()


def similar(a, b):
    for latin, forms in TRANSLIT.items():
        if (a == latin and any(b.startswith(f) for f in forms)) or \
           (b == latin and any(a.startswith(f) for f in forms)):
            return 1.0
    return SequenceMatcher(None, a, b).ratio()


def read_sheet():
    """-> [{section, text, dialogue}] for every line meant to appear on screen."""
    out, section = [], "Intro"
    for raw in LYRICS.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("# "):
            continue
        m = SECTION.match(line)
        if m:
            section = m.group(1).split("—")[0].strip()
            continue
        # *(stage direction)* and the *Signal Nai* subtitle are not sung
        if line.startswith("*") and line.endswith("*") and not line.startswith("**"):
            continue
        line = line.replace("**", "").strip()
        dialogue = line.startswith("—")
        if dialogue:
            line = line.lstrip("—").strip()
        if line:
            out.append({"section": section, "text": line, "dialogue": dialogue})
    return out


def split_display(text):
    if len(text) <= MAXLEN:
        return [text]
    chunks, buf = [], ""
    for piece in re.split(r"(?<=[,!?।])\s+", text):
        if buf and len(buf) + len(piece) > MAXLEN:
            chunks.append(buf.strip()); buf = piece
        else:
            buf = f"{buf} {piece}".strip()
    if buf:
        chunks.append(buf.strip())
    return chunks


def align(a, b, floor=0.55):
    """Needleman-Wunsch; returns {index in a: index in b} for matched pairs."""
    GAP = -1.0
    n, m = len(a), len(b)
    sim = [[similar(a[i], b[j]) for j in range(m)] for i in range(n)]
    score = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        score[i][0] = i * GAP
    for j in range(1, m + 1):
        score[0][j] = j * GAP
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            r = sim[i - 1][j - 1]
            sub = score[i - 1][j - 1] + (2.0 * r if r >= floor else -0.8)
            score[i][j] = max(sub, score[i - 1][j] + GAP, score[i][j - 1] + GAP)
    pairs, i, j = {}, n, m
    while i > 0 and j > 0:
        r = sim[i - 1][j - 1]
        sub = score[i - 1][j - 1] + (2.0 * r if r >= floor else -0.8)
        if abs(score[i][j] - sub) < 1e-9:
            if r >= floor:
                pairs[i - 1] = j - 1
            i -= 1; j -= 1
        elif abs(score[i][j] - (score[i - 1][j] + GAP)) < 1e-9:
            i -= 1
        else:
            j -= 1
    return pairs


def build():
    """Lines with line-level and per-word timings, cleaned for display."""
    tw = [w for w in json.load(open(WORDS, encoding="utf-8"))["words"] if w.get("type") == "word"]
    t_norm = [norm(w["text"]) for w in tw]

    lines = []
    for e in read_sheet():
        for chunk in split_display(e["text"]):
            lines.append({**e, "text": chunk})

    a_words, owner, a_tok = [], [], []
    for li, l in enumerate(lines):
        for tok in l["text"].split():
            n = norm(tok)
            if n:
                a_words.append(n); owner.append(li); a_tok.append(tok)
    pairs = align(a_words, t_norm)

    by_line = [[] for _ in lines]
    for ai, tok in enumerate(a_tok):
        bj = pairs.get(ai)
        by_line[owner[ai]].append({"w": tok, "s": tw[bj]["start"] if bj is not None else None,
                                   "e": tw[bj]["end"] if bj is not None else None})

    # lines with no matched word at all get placed between their neighbours
    for li, words in enumerate(by_line):
        hit = [w for w in words if w["s"] is not None]
        lines[li]["start"] = min(w["s"] for w in hit) if hit else None
        lines[li]["end"] = max(w["e"] for w in hit) if hit else None
        lines[li]["matched"] = len(hit)
        lines[li]["nwords"] = len(words)
    for li, l in enumerate(lines):
        if l["start"] is None:
            prev = next((lines[k]["end"] for k in range(li - 1, -1, -1) if lines[k]["end"] is not None), 0.0)
            nxt = next((lines[k]["start"] for k in range(li + 1, len(lines)) if lines[k]["start"] is not None), prev + 2)
            l["start"] = prev + 0.1
            l["end"] = max(l["start"] + 0.6, nxt - 0.15)
            l["guessed"] = True

    MIN, MAX, GAP = 1.0, 7.0, 0.06
    for i, l in enumerate(lines):
        nxt = next((x["start"] for x in lines[i + 1:]), None)
        l["end"] = min(l["end"], l["start"] + MAX)
        if l["end"] - l["start"] < MIN:
            l["end"] = l["start"] + MIN
        if nxt is not None and l["end"] > nxt - GAP:
            l["end"] = max(l["start"] + 0.4, nxt - GAP)

    # words: matched ones keep their times; the rest are spread between
    # their matched neighbours, then everything is kept inside the line
    for l, words in zip(lines, by_line):
        s0, e0, n = l["start"], l["end"], len(words)
        for i, w in enumerate(words):
            if w["s"] is None:
                prev = next((words[j]["e"] for j in range(i - 1, -1, -1) if words[j]["e"] is not None), s0)
                nxt = next((words[j]["s"] for j in range(i + 1, n) if words[j]["s"] is not None), e0)
                if prev == s0 and nxt == e0 and not any(x["s"] for x in words):
                    w["s"] = s0 + (e0 - s0) * i / max(1, n)
                    w["e"] = s0 + (e0 - s0) * (i + 1) / max(1, n)
                else:
                    w["s"] = prev + (nxt - prev) * 0.15
                    w["e"] = max(w["s"] + 0.1, nxt - (nxt - prev) * 0.1)
        last = s0
        for w in words:
            w["s"] = round(min(max(w["s"], last), e0), 3)
            w["e"] = round(min(max(w["e"], w["s"] + 0.08), e0), 3)
            last = w["s"]
        l["words"] = words
        l["start"], l["end"] = round(l["start"], 2), round(l["end"], 2)
    return lines


if __name__ == "__main__":
    ls = build()
    guessed = [l for l in ls if l.get("guessed")]
    print(f"{len(ls)} display lines, {len(ls) - len(guessed)} timed from the vocal, {len(guessed)} placed\n")
    prev = -1
    for i, l in enumerate(ls):
        flag = "  <-- OUT OF ORDER" if l["start"] < prev - 0.01 else ""
        prev = l["start"]
        tag = "PLACED " if l.get("guessed") else f"{l['matched']}/{l['nwords']}  "
        d = "»" if l["dialogue"] else " "
        print(f"  {i:3d} [{l['section'][:13]:>13}] {l['start']:7.2f} .. {l['end']:7.2f}  {tag:7s}{d} {l['text']}{flag}")
