"""Fetch the Latin fonts that mg-styles-15 films expect (from npm @fontsource, since Google Fonts is
blocked in cloud sessions) and write them as TTF at the paths assets/fonts/fonts.css references.
Usage: python3 scripts/mg_fonts.py <path-to-mg-styles-15>"""
import io, json, os, subprocess, sys, tarfile, tempfile
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "mg-styles-15")
F = os.path.join(ROOT, "assets/fonts/latin")
# target path -> (npm package, file inside package/files/)
V = "@fontsource-variable/"
S = "@fontsource/"
MAP = {
    "anton/Anton-Regular.ttf": (S + "anton", "anton-latin-400-normal.woff2"),
    "archivo/Archivo-Italic-VF.ttf": (V + "archivo", "archivo-latin-wght-italic.woff2"),
    "bebasneue/BebasNeue-Regular.ttf": (S + "bebas-neue", "bebas-neue-latin-400-normal.woff2"),
    "caveat/Caveat-VF.ttf": (V + "caveat", "caveat-latin-wght-normal.woff2"),
    "chakrapetch/ChakraPetch-SemiBold.ttf": (S + "chakra-petch", "chakra-petch-latin-600-normal.woff2"),
    "cormorantgaramond/CormorantGaramond-VF.ttf": (V + "cormorant-garamond", "cormorant-garamond-latin-wght-normal.woff2"),
    "dmsans/DMSans-VF.ttf": (V + "dm-sans", "dm-sans-latin-wght-normal.woff2"),
    "fredoka/Fredoka-VF.ttf": (V + "fredoka", "fredoka-latin-wght-normal.woff2"),
    "ibmplexmono/IBMPlexMono-Medium.ttf": (S + "ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2"),
    "ibmplexmono/IBMPlexMono-SemiBold.ttf": (S + "ibm-plex-mono", "ibm-plex-mono-latin-600-normal.woff2"),
    "instrumentserif/InstrumentSerif-Regular.ttf": (S + "instrument-serif", "instrument-serif-latin-400-normal.woff2"),
    "instrumentserif/InstrumentSerif-Italic.ttf": (S + "instrument-serif", "instrument-serif-latin-400-italic.woff2"),
    "inter/Inter-VF.ttf": (V + "inter", "inter-latin-wght-normal.woff2"),
    "jetbrainsmono/JetBrainsMono-VF.ttf": (V + "jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2"),
    "luckiestguy/LuckiestGuy-Regular.ttf": (S + "luckiest-guy", "luckiest-guy-latin-400-normal.woff2"),
    "michroma/Michroma-Regular.ttf": (S + "michroma", "michroma-latin-400-normal.woff2"),
    "poppins/Poppins-Black.ttf": (S + "poppins", "poppins-latin-900-normal.woff2"),
    "poppins/Poppins-SemiBold.ttf": (S + "poppins", "poppins-latin-600-normal.woff2"),
    "pressstart2p/PressStart2P-Regular.ttf": (S + "press-start-2p", "press-start-2p-latin-400-normal.woff2"),
    "rajdhani/Rajdhani-Bold.ttf": (S + "rajdhani", "rajdhani-latin-700-normal.woff2"),
    "rajdhani/Rajdhani-SemiBold.ttf": (S + "rajdhani", "rajdhani-latin-600-normal.woff2"),
    "sora/Sora-VF.ttf": (V + "sora", "sora-latin-wght-normal.woff2"),
    "unbounded/Unbounded-VF.ttf": (V + "unbounded", "unbounded-latin-wght-normal.woff2"),
    "vt323/VT323-Regular.ttf": (S + "vt323", "vt323-latin-400-normal.woff2"),
}
EXTRA = {  # per-film static cuts (approximations of the originals)
    os.path.join(ROOT, "demos/03-isometric/assets/fonts/Unbounded-800-static.ttf"): (S + "unbounded", "unbounded-latin-800-normal.woff2"),
    os.path.join(ROOT, "demos/07-liquid/assets/Fraunces-Liquid-72-900-Soft.ttf"): (S + "fraunces", "fraunces-latin-900-normal.woff2"),
    os.path.join(ROOT, "demos/08-morph/assets/fonts/Outfit-SemiBold.ttf"): (S + "outfit", "outfit-latin-600-normal.woff2"),
    os.path.join(ROOT, "demos/10-synthwave/assets/fonts/MrDafoe-Regular.ttf"): (S + "mr-dafoe", "mr-dafoe-latin-400-normal.woff2"),
}
jobs = {os.path.join(F, k): v for k, v in MAP.items()} | EXTRA
cache = {}
tmp = tempfile.mkdtemp()
ok = 0
for dst, (pkg, fn) in jobs.items():
    if os.path.exists(dst):
        ok += 1; continue
    try:
        if pkg not in cache:
            out = subprocess.run(["npm", "pack", pkg, "--json", "--silent"], cwd=tmp, capture_output=True, text=True, check=True).stdout
            cache[pkg] = os.path.join(tmp, json.loads(out)[0]["filename"])
        with tarfile.open(cache[pkg]) as t:
            data = t.extractfile("package/files/" + fn).read()
        f = TTFont(io.BytesIO(data)); f.flavor = None
        os.makedirs(os.path.dirname(dst), exist_ok=True); f.save(dst); ok += 1
    except Exception as e:
        print("MISS", os.path.relpath(dst, ROOT), pkg, fn, type(e).__name__, str(e)[:80])
print(f"fonts ready: {ok}/{len(jobs)} (CJK fonts are not fetched; Chinese text falls back to system fonts)")

# CJK: the original fonts are not on npm as whole files. Substitute WenQuanYi Zen Hei (system font) for every
# missing font referenced by fonts.css, so pages that await document.fonts don't fail. Linked, not copied.
import re
from fontTools.ttLib import TTCollection
SUB = os.path.join(ROOT, "assets/fonts/cjk/_fallback/WenQuanYiZenHei.ttf")
ttc = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
if not os.path.exists(SUB) and os.path.exists(ttc):
    os.makedirs(os.path.dirname(SUB), exist_ok=True)
    TTCollection(ttc).fonts[0].save(SUB)
css = open(os.path.join(ROOT, "assets/fonts/fonts.css")).read()
linked = 0
for u in re.findall(r"url\('(/[^']+)'\)", css):
    p = os.path.join(ROOT, u.lstrip("/"))
    if not os.path.exists(p) and os.path.exists(SUB):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        os.symlink(os.path.relpath(SUB, os.path.dirname(p)), p); linked += 1
missing = [u for u in re.findall(r"url\('(/[^']+)'\)", css) if not os.path.exists(os.path.join(ROOT, u.lstrip("/")))]
print(f"CJK fallback linked for {linked} files; still missing: {missing or 'none'}")
