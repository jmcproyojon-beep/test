"""Parse the client's SRT. Their timings and wording are authoritative."""
import re
from pathlib import Path

# The client's SRT lives beside this script, NOT under projects/ — that path is
# gitignored, so a copy there does not survive a clone and a fresh checkout
# comes up with no lyrics at all.
SRT = Path(__file__).parent/"lyrics.srt"
_LEGACY = Path("projects/vebacheka-mv/assets/lyrics.srt")
if not SRT.exists() and _LEGACY.exists():
    SRT = _LEGACY
TC = re.compile(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)")


def _secs(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")) / 1000


def lines(path=SRT):
    out = []
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8").strip()):
        rows = [r for r in block.splitlines() if r.strip()]
        if len(rows) < 2:
            continue
        m = next((TC.match(r) for r in rows if TC.match(r)), None)
        if not m:
            continue
        g = m.groups()
        text = " ".join(rows[rows.index(m.string if m.string in rows else
                                        next(r for r in rows if TC.match(r))) + 1:]).strip()
        if text:
            out.append({"start": _secs(*g[:4]), "end": _secs(*g[4:]), "text": text})
    return out


if __name__ == "__main__":
    ls = lines()
    print(f"{len(ls)} lines, {ls[0]['start']:.1f}s .. {ls[-1]['end']:.1f}s")
    for i, l in enumerate(ls):
        print(f"  {i:2d}  {l['start']:7.2f}-{l['end']:7.2f} ({l['end']-l['start']:4.1f}s)  {l['text']}")
    gaps = [(b["start"] - a["end"]) for a, b in zip(ls, ls[1:])]
    print(f"\noverlaps: {sum(1 for g in gaps if g < 0)}   largest gap: {max(gaps):.1f}s")
