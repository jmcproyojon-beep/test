#!/usr/bin/env bash
# seek-shot.sh — LIGHT tier (standalone HTML): freeze the animation at given times and screenshot each.
#
# Drives the skill's own `?t=N` seek harness (the page does `tl.pause(); tl.seek(t)` on load), so
# every shot lands on a deterministic still — the web parallel of pinning a video frame.
#
# Usage:
#   scripts/seek-shot.sh anim.html 0 1.5 3      # screenshot at t=0,1.5,3 seconds
#   scripts/seek-shot.sh anim.html              # defaults to 0, 1.5, 3
#   VIEWPORT=1080x1920 scripts/seek-shot.sh anim.html 0 2   # set the viewport (default 1280x720)
# Output: frame-<t>.png in the current directory.
#
# OpenMontage patch: uses the Playwright that is already installed (resolvable from Node) instead of
# `npx -y playwright`, which downloads a second Playwright that cannot find the preinstalled browser.
# Falls back to the upstream npx path only when Node cannot load playwright / playwright-core.
set -euo pipefail
html="${1:?usage: seek-shot.sh <file.html> [t1 t2 ...]}"; shift || true
times=("$@"); [ "${#times[@]}" -eq 0 ] && times=(0 1.5 3)
abs="$(cd "$(dirname "$html")" && pwd)/$(basename "$html")"
vp="${VIEWPORT:-1280x720}"

if node -e "try{require('playwright')}catch{require('playwright-core')}" >/dev/null 2>&1; then
  node - "$abs" "$vp" "${times[@]}" <<'JS'
const [abs, vp, ...times] = process.argv.slice(2);
let pw; try { pw = require('playwright'); } catch { pw = require('playwright-core'); }
const [width, height] = vp.split('x').map(Number);
(async () => {
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  for (const t of times) {
    await page.goto(`file://${abs}?t=${t}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
    await page.waitForFunction(() => window.__ready !== false, null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(600);
    await page.screenshot({ path: `frame-${t}.png` });
    console.log(`  ✓ t=${t}s → frame-${t}.png`);
  }
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
JS
else
  for t in "${times[@]}"; do
    out="frame-${t}.png"
    npx -y playwright screenshot --viewport-size="${vp/x/,}" --wait-for-timeout=600 "file://${abs}?t=${t}" "$out" >/dev/null 2>&1
    echo "  ✓ t=${t}s → $out"
  done
fi
echo "  → tile them: scripts/contact-sheet.sh sheet.png frame-*.png"
