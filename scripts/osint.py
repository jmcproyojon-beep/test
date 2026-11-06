#!/usr/bin/env python3
"""Search the awesome-osint list (https://github.com/jivoi/awesome-osint).

The list lives in ./awesome-osint (git-ignored); install or update it with
scripts/setup_awesome_osint.sh. This script parses its README into
categories and tools and lets you search them.

  scripts/osint.py categories                 # all categories with counts
  scripts/osint.py search email               # keyword search (name, description, category)
  scripts/osint.py search "reverse image" -c image
  scripts/osint.py show "Username Check"      # every tool in one category
  scripts/osint.py export osint.json          # dump everything as JSON
  scripts/osint.py html osint.html            # build a searchable offline web page

Add --json to categories/search/show for machine-readable output.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "awesome-osint" / "README.md"

HEADING = re.compile(r"^(#{2,3})\s+(?:\[↑\]\([^)]*\)\s*)?(.+?)\s*$")
ENTRY = re.compile(r"^\s*[*-]\s+\[([^\]]+)\]\((https?://[^)\s]+)\)\s*(?:[-–—:]\s*)?(.*)$")
SKIP = {"📖 Table of Contents", "Contributing", "Credits", "License"}


def load(readme: Path = README) -> list[dict]:
    if not readme.exists():
        sys.exit(f"{readme} not found. Run scripts/setup_awesome_osint.sh first.")
    tools, parent, category = [], None, None
    for line in readme.read_text(encoding="utf-8").splitlines():
        m = HEADING.match(line)
        if m:
            level, title = len(m.group(1)), m.group(2).strip()
            if level == 2:
                parent, category = title, title
            else:
                category = f"{parent} / {title}" if parent else title
            continue
        if category is None or category in SKIP:
            continue
        m = ENTRY.match(line)
        if m:
            name, url, desc = m.groups()
            tools.append({"name": name.strip(), "url": url.strip(),
                          "description": desc.strip(), "category": category})
    return tools


def categories(tools: list[dict]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for t in tools:
        counts[t["category"]] = counts.get(t["category"], 0) + 1
    return counts


def match_category(tools: list[dict], query: str) -> list[dict]:
    q = query.lower()
    exact = [t for t in tools if t["category"].lower() == q
             or t["category"].lower().split(" / ")[-1] == q]
    return exact or [t for t in tools if q in t["category"].lower()]


def search(tools: list[dict], terms: list[str], category: str | None) -> list[dict]:
    pool = match_category(tools, category) if category else tools
    words = [w.lower() for w in " ".join(terms).split()]

    def score(t: dict) -> int:
        name, desc, cat = t["name"].lower(), t["description"].lower(), t["category"].lower()
        s = 0
        for w in words:
            if w not in name and w not in desc and w not in cat:
                return 0
            s += 3 * (w in name) + 3 * (w in cat) + (w in desc)
        return s

    hits = [(score(t), t) for t in pool]
    return [t for s, t in sorted((h for h in hits if h[0]), key=lambda h: -h[0])]


def print_tools(rows: list[dict], show_category: bool = True) -> None:
    for t in rows:
        cat = f"  [{t['category']}]" if show_category else ""
        print(f"- {t['name']}{cat}\n    {t['url']}")
        if t["description"]:
            print(f"    {t['description']}")
    print(f"\n{len(rows)} result(s)")


def build_html(tools: list[dict], out: Path) -> None:
    data = json.dumps(tools, ensure_ascii=False).replace("</", "<\\/")
    page = HTML_TEMPLATE.replace("__DATA__", data).replace("__COUNT__", str(len(tools)))
    out.write_text(page, encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("categories", help="list categories")
    c.add_argument("--json", action="store_true")
    s = sub.add_parser("search", help="keyword search")
    s.add_argument("terms", nargs="+")
    s.add_argument("-c", "--category", help="limit to a category (substring match)")
    s.add_argument("-n", "--limit", type=int, default=50)
    s.add_argument("--json", action="store_true")
    sh = sub.add_parser("show", help="list a category")
    sh.add_argument("category")
    sh.add_argument("--json", action="store_true")
    e = sub.add_parser("export", help="write JSON")
    e.add_argument("out", type=Path)
    h = sub.add_parser("html", help="write a searchable offline HTML page")
    h.add_argument("out", type=Path)
    a = ap.parse_args()

    tools = load()
    if a.cmd == "categories":
        cats = categories(tools)
        if a.json:
            print(json.dumps(cats, indent=2, ensure_ascii=False))
        else:
            for name, n in cats.items():
                print(f"{n:4d}  {name}")
            print(f"\n{len(cats)} categories, {len(tools)} tools")
    elif a.cmd == "search":
        rows = search(tools, a.terms, a.category)[: a.limit]
        print(json.dumps(rows, indent=2, ensure_ascii=False)) if a.json else print_tools(rows)
    elif a.cmd == "show":
        rows = match_category(tools, a.category)
        if not rows:
            sys.exit(f"No category matches '{a.category}'. Try: scripts/osint.py categories")
        print(json.dumps(rows, indent=2, ensure_ascii=False)) if a.json else print_tools(rows)
    elif a.cmd == "export":
        a.out.write_text(json.dumps(tools, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Wrote {len(tools)} tools to {a.out}")
    elif a.cmd == "html":
        build_html(tools, a.out)
        print(f"Wrote {len(tools)} tools to {a.out}")


HTML_TEMPLATE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>OSINT Toolkit</title>
<style>
:root{--bg:#f7f7f5;--fg:#1d1d1b;--muted:#6b6b66;--card:#fff;--line:#e3e2dd;--accent:#2f5fd0}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ecebe6;--muted:#9b9a94;--card:#1e1e1c;--line:#33332f;--accent:#7ea2ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
main{max-width:960px;margin:0 auto;padding:24px 16px}
h1{margin:0 0 4px;font-size:24px}p.sub{margin:0 0 16px;color:var(--muted)}
.bar{display:flex;gap:8px;flex-wrap:wrap;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:1}
input,select{font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg)}
input{flex:1 1 260px;min-width:0}select{flex:0 1 280px;min-width:0}
#count{color:var(--muted);margin:8px 0 12px}
.t{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:8px;overflow-wrap:anywhere}
.t a{color:var(--accent);font-weight:600;text-decoration:none}.t a:hover{text-decoration:underline}
.c{font-size:12px;color:var(--muted);margin-left:6px}.d{margin-top:2px}.u{font-size:12px;color:var(--muted)}
</style></head><body><main>
<h1>OSINT Toolkit</h1>
<p class="sub">__COUNT__ tools from <a href="https://github.com/jivoi/awesome-osint">jivoi/awesome-osint</a>. Search by name, description or category.</p>
<div class="bar"><input id="q" type="search" placeholder="Search: email, username, reverse image, ship tracking..." autofocus>
<select id="cat"><option value="">All categories</option></select></div>
<div id="count"></div><div id="list"></div>
</main><script>
const TOOLS=__DATA__;
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cats=[...new Set(TOOLS.map(t=>t.category))];const sel=document.getElementById('cat');
cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c+' ('+TOOLS.filter(t=>t.category===c).length+')';sel.appendChild(o)});
function render(){const words=document.getElementById('q').value.toLowerCase().split(/\\s+/).filter(Boolean);const c=sel.value;
const rows=TOOLS.filter(t=>(!c||t.category===c)&&words.every(w=>(t.name+' '+t.description+' '+t.category).toLowerCase().includes(w)));
document.getElementById('count').textContent=rows.length+' result'+(rows.length===1?'':'s');
document.getElementById('list').innerHTML=rows.slice(0,400).map(t=>'<div class="t"><a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+'</a><span class="c">'+esc(t.category)+'</span>'+(t.description?'<div class="d">'+esc(t.description)+'</div>':'')+'<div class="u">'+esc(t.url)+'</div></div>').join('')+(rows.length>400?'<p class="sub">Showing first 400. Narrow your search.</p>':'');}
document.getElementById('q').addEventListener('input',render);sel.addEventListener('change',render);render();
</script></body></html>
"""

if __name__ == "__main__":
    main()
