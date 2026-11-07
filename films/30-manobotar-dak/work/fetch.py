"""Download the CC0 / public-domain sources for 30-manobotar-dak into assets/src and record them in sources.json."""
import json, os, urllib.request, urllib.parse
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
SRC = D + "assets/src/"; os.makedirs(SRC, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (collage-film asset fetch)"}
CLE = {  # name: Cleveland Museum of Art open-access id (CC0)
    "mother": 162297, "boy": 522634, "girl": 160784, "man": 294187, "king": 124829, "globe": 110908,
    "court": 325414, "goya_a": 153758, "goya_b": 172518, "goya_c": 172516, "goya_d": 172517,
    "map_a": 423510, "map_b": 423521, "flowers": 128484, "birds": 679352, "ruins": 668079,
    "hands": 162888, "aircraft": 316999, "children": 523595,
}
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
srcs = json.load(open(D + "work/sources.json")) if os.path.exists(D + "work/sources.json") else {}
for name, aid in CLE.items():
    if os.path.exists(SRC + name + ".jpg"): continue
    a = json.loads(get(f"https://openaccess-api.clevelandart.org/api/artworks/{aid}"))["data"]
    im = a["images"].get("print") or a["images"]["web"]
    open(SRC + name + ".jpg", "wb").write(get(im["url"]))
    srcs[name] = {"title": a["title"], "creator": (a.get("creators") or [{}])[0].get("description", "unknown"),
                  "date": a.get("creation_date"), "source": a.get("url"), "license": a.get("share_license_status")}
    print(name, srcs[name]["license"], a["title"][:50])
# NASA (public domain): a full-disk Sun image
if not os.path.exists(SRC + "sun.jpg"):
    r = json.loads(get("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": "sun full disk SDO", "media_type": "image"})))
    it = r["collection"]["items"][0]; nid = it["data"][0]["nasa_id"]
    assets = json.loads(get(it["href"]))
    url = next((u for u in assets if u.endswith("~medium.jpg")), assets[0])
    open(SRC + "sun.jpg", "wb").write(get(url.replace("http://", "https://")))
    srcs["sun"] = {"title": it["data"][0]["title"], "creator": "NASA", "source": f"https://images.nasa.gov/details/{nid}", "license": "Public domain (NASA)"}
    print("sun", srcs["sun"]["title"])
json.dump(srcs, open(D + "work/sources.json", "w"), indent=1, ensure_ascii=False)
