// Render check stills of the SignalMV composition at given seconds.
//   cd remotion-composer && cp ../client-builds/signal-nai/stills.mjs .stills.mjs && node .stills.mjs OUTDIR 5 12.5 17 ...
// Bundles once, then renders each still (much faster than `remotion still`).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [out, ...secs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const root = process.cwd();   // run from remotion-composer/ (its node_modules)
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.tsx"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "SignalMV", browserExecutable });
for (const s of secs) {
  const frame = Math.round(parseFloat(s) * 30);
  const output = path.join(out, `s${String(s).padStart(6, "0")}.jpg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "jpeg", jpegQuality: 80, browserExecutable, scale: 0.5 });
  console.log(output);
}
