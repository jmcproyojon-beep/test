#!/usr/bin/env bash
# sfx.sh — generate one sound effect with each::sense and save the audio file(s).
#
# Usage:
#   scripts/sfx.sh "a heavy wooden door creaking open in a stone hallway, echo, 3 seconds" [out_dir] [basename]
# Prints the saved file path(s). Also writes <basename>.response.json next to them.
#
# Auth: sends $EACHLABS_API_KEY as X-API-Key. In a Claude cloud session the key is injected by the
# network proxy, so EACHLABS_API_KEY may be unset here — a placeholder is sent and replaced in transit.
# Needs: curl, python3.
set -euo pipefail
prompt="${1:?usage: sfx.sh \"<sound description incl. duration>\" [out_dir] [basename]}"
out_dir="${2:-.}"; base="${3:-sfx-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$out_dir"
case "$prompt" in "Generate a sound effect:"*) ;; *) prompt="Generate a sound effect: $prompt" ;; esac
resp="$out_dir/$base.response.json"

body=$(python3 -I -c 'import json,sys; print(json.dumps({"messages":[{"role":"user","content":sys.argv[1]}],"stream":False}))' "$prompt")
code=$(curl -sS -o "$resp" -w '%{http_code}' --max-time 600 \
  -X POST https://eachsense-agent.core.eachlabs.run/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${EACHLABS_API_KEY:-placeholder-injected-by-proxy}" \
  -d "$body")
if [ "$code" != 200 ]; then echo "  ✗ HTTP $code — see $resp" >&2; head -c 600 "$resp" >&2; echo >&2; exit 1; fi

# Collect every audio URL anywhere in the response (message text or structured fields).
mapfile -t urls < <(python3 -I - "$resp" <<'PY'
import json, re, sys
raw = open(sys.argv[1], encoding="utf-8").read()
try: data = json.loads(raw)
except Exception: data = raw
found = []
def walk(x):
    if isinstance(x, dict): [walk(v) for v in x.values()]
    elif isinstance(x, list): [walk(v) for v in x]
    elif isinstance(x, str):
        for u in re.findall(r'https?://[^\s)\]"\'<>]+', x):
            if re.search(r'\.(mp3|wav|ogg|flac|m4a|aac|opus)(\?|$)', u, re.I) and u not in found:
                found.append(u)
walk(data)
print("\n".join(found))
PY
)
if [ "${#urls[@]}" -eq 0 ] || [ -z "${urls[0]}" ]; then
  echo "  ! no audio URL in the response — read $resp (the agent may have asked a follow-up question)" >&2
  python3 -I -c 'import json,sys; d=json.load(open(sys.argv[1])); print(d["choices"][0]["message"]["content"][:800])' "$resp" 2>/dev/null >&2 || true
  exit 2
fi
i=0
for u in "${urls[@]}"; do
  i=$((i+1)); ext="${u%%\?*}"; ext="${ext##*.}"
  f="$out_dir/$base$([ ${#urls[@]} -gt 1 ] && echo "-$i").$ext"
  curl -sSL --max-time 300 -o "$f" "$u"
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo "?")
  echo "  ✓ $f (${dur}s)"
done
