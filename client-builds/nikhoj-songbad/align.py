"""Align the artist's own lyric sheet to word timings from the audio.

The transcript is only a clock. Its wording is wrong in places — it hears
"নোকাল" for "সকাল", "ভুলো উন্মাদ" for "বুনো উন্মাদ", "ছাইরা করা" for
"ছায়াটা কার" — so every word that reaches the screen comes from the artist's
file and only the TIMES come from the transcript.

Matching is Needleman-Wunsch over the two word sequences with a fuzzy
character-level similarity, which tolerates those mishearings as substitutions
and the instrumental passages as gaps.
"""
import json, re, sys
from difflib import SequenceMatcher
from pathlib import Path

HERE = Path(__file__).parent
P = Path("projects/nikhoj-songbad")
LYRICS = HERE/"lyrics.txt"
WORDS = P/"assets/audio/words.json"

SECTION = re.compile(r"^\[(.+?)\s*(?:—.*)?\]$")
DIRECTION = re.compile(r"^\(.*\)$")
PUNCT = re.compile(r"[।?!,.\"'…—\-]+")
MAXLEN = 34          # Bengali chars per on-screen line before it is split


def norm(w):
    return PUNCT.sub("", w).strip()


def read_sheet():
    """-> [{section, kind, text}] for every line meant to appear on screen."""
    out, section = [], "Intro"
    for raw in LYRICS.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        m = SECTION.match(line)
        if m:
            section = m.group(1).split("—")[0].strip()
            continue
        if DIRECTION.match(line):      # stage directions are not sung
            continue
        out.append({"section": section, "text": line})
    return out


def split_display(text):
    """Break a long written line into the chunks that appear one at a time."""
    parts = [p for p in re.split(r"(?<=[।?!])\s+", text) if p.strip()]
    chunks = []
    for part in parts:
        if len(part) <= MAXLEN:
            chunks.append(part.strip()); continue
        buf = ""
        for piece in re.split(r"(?<=,)\s+", part):
            if buf and len(buf) + len(piece) > MAXLEN:
                chunks.append(buf.strip()); buf = piece
            else:
                buf = f"{buf} {piece}".strip()
        if buf:
            chunks.append(buf.strip())
    return chunks or [text.strip()]


def align(a, b, sim_floor=0.55):
    """Needleman-Wunsch; returns {index in a: index in b} for matched pairs."""
    GAP = -1.0
    n, m = len(a), len(b)
    score = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        score[i][0] = i * GAP
    for j in range(1, m + 1):
        score[0][j] = j * GAP
    for i in range(1, n + 1):
        ai = a[i - 1]
        for j in range(1, m + 1):
            r = SequenceMatcher(None, ai, b[j - 1]).ratio()
            sub = score[i - 1][j - 1] + (2.0 * r if r >= sim_floor else -0.8)
            score[i][j] = max(sub, score[i - 1][j] + GAP, score[i][j - 1] + GAP)
    pairs, i, j = {}, n, m
    while i > 0 and j > 0:
        r = SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
        sub = score[i - 1][j - 1] + (2.0 * r if r >= sim_floor else -0.8)
        if abs(score[i][j] - sub) < 1e-9:
            if r >= sim_floor:
                pairs[i - 1] = j - 1
            i -= 1; j -= 1
        elif abs(score[i][j] - (score[i - 1][j] + GAP)) < 1e-9:
            i -= 1
        else:
            j -= 1
    return pairs


def build():
    tw = [w for w in json.load(open(WORDS, encoding="utf-8"))["words"]
          if w.get("type") == "word"]
    t_norm = [norm(w["text"]) for w in tw]

    lines = []
    for entry in read_sheet():
        for chunk in split_display(entry["text"]):
            lines.append({"section": entry["section"], "text": chunk})

    # flatten the artist's words, remembering which display line each came from
    a_words, owner = [], []
    for idx, l in enumerate(lines):
        for w in l["text"].split():
            nw = norm(w)
            if nw:
                a_words.append(nw); owner.append(idx)

    pairs = align(a_words, t_norm)

    for l in lines:
        l["hits"] = []
    for ai, bj in pairs.items():
        lines[owner[ai]]["hits"].append(bj)

    for l in lines:
        if l["hits"]:
            lo, hi = min(l["hits"]), max(l["hits"])
            l["start"] = round(tw[lo]["start"], 2)
            l["end"] = round(tw[hi]["end"], 2)
        else:
            l["start"] = l["end"] = None
        l["matched"] = len(l["hits"])
        l["words"] = len(l["text"].split())
        del l["hits"]

    # Scribe sometimes emits zero-length words on repeated shouts ("ও-ও-ও"),
    # which would flash a line for a couple of frames. Give every line room to
    # be read, stop it running into the next one, and cap a sustained note so
    # one line does not sit on screen for twelve seconds.
    MIN, MAX, GAP = 1.1, 8.0, 0.08
    for i, l in enumerate(lines):
        if l["start"] is None:
            continue
        nxt = next((x["start"] for x in lines[i + 1:] if x["start"] is not None), None)
        l["end"] = min(l["end"], l["start"] + MAX)
        if l["end"] - l["start"] < MIN:
            l["end"] = l["start"] + MIN
        if nxt is not None and l["end"] > nxt - GAP:
            l["end"] = max(l["start"] + 0.5, nxt - GAP)
        l["start"], l["end"] = round(l["start"], 2), round(l["end"], 2)
    return lines


if __name__ == "__main__":
    ls = build()
    hit = [l for l in ls if l["start"] is not None]
    print(f"{len(ls)} display lines, {len(hit)} timed, {len(ls)-len(hit)} unmatched\n")
    prev = None
    for i, l in enumerate(ls):
        if l["start"] is None:
            print(f"  {i:3d} [{l['section']:>13}]   --.-- .. --.--   UNMATCHED   {l['text']}")
        else:
            flag = ""
            if prev is not None and l["start"] < prev - 0.01:
                flag = "  <-- OUT OF ORDER"
            prev = l["start"]
            print(f"  {i:3d} [{l['section']:>13}] {l['start']:7.2f} .. {l['end']:7.2f}  "
                  f"{l['matched']}/{l['words']}{flag}  {l['text']}")
