// Renders the Bangla lyric captions and the end card as transparent PNGs (Chromium shapes Bangla correctly).
//   node captions.mjs  ->  out/cap/NN.png + out/cap/list.json   (reel times, from the song's measured vocal onsets)
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PW || "playwright");
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out/cap"); fs.mkdirSync(OUT, { recursive: true });
// [start, end, text, chorus?]   reel seconds
const CAPS = [
  [4.42, 7.20, "মনটা আজ ছুটে চলে"],
  [7.26, 9.95, "জীবনের সব ব্যস্ততা ছেড়ে"],
  [10.02, 13.40, "কানে বাজে আপনজনের ডাক"],
  [15.30, 19.75, "জীবনের দৌড়ে পথটা ছোট হয়ে যাক"],
  [19.82, 25.30, "ফিরবো বাড়ি খুশি নিয়ে, পথের ক্লান্তি ভুলে"],
  [25.36, 30.30, "ফিরবো বাড়ি মনানন্দে, প্রিয়জনের কাছে"],
  [30.42, 31.75, "উড়ে উড়ে যায়", 1],
  [31.78, 35.25, "ফিরব আমি আমার আকাশে"],
  [35.40, 36.85, "উড়ে উড়ে যায়", 1],
  [36.90, 39.85, "ফিরব আবার চেনা মানুষে"],
  [40.28, 42.60, "ডাকছে ঘরে মায়ের আদর"],
  [42.66, 44.40, "ক্লান্ত হলেও কি"],
  [44.46, 47.70, "মায়ের হাতের যত্ন পেয়ে"],
  [47.74, 49.90, "খেয়ালটাও রাখি"],
  [50.34, 51.66, "উড়ে উড়ে যায়", 1],
  [51.72, 55.15, "ফিরব আবার চেনা মানুষে"],
  [55.20, 56.40, "উড়ে উড়ে যায়", 1],
];
const f = (n) => "data:font/woff2;base64," + fs.readFileSync(path.join(HERE, "fonts", n)).toString("base64");
const css = `@font-face{font-family:Cap;font-weight:800;src:url(${f("anek-bangla-bengali-800-normal.woff2")}) format("woff2");unicode-range:U+0980-09FE,U+200C-200D,U+25CC;}
@font-face{font-family:Cap;font-weight:800;src:url(${f("inter-tight-latin-800-normal.woff2")}) format("woff2");unicode-range:U+0000-00FF,U+2000-206F;}
html,body{margin:0;background:transparent;width:1080px;height:320px;overflow:hidden}
.w{width:1080px;height:320px;display:flex;align-items:center;justify-content:center}
.t{font-family:Cap;font-weight:800;color:#fff;text-align:center;line-height:1.25;max-width:900px;
   text-shadow:0 3px 14px rgba(0,0,0,.75),0 0 3px rgba(0,0,0,.9);}
.c{color:#FFD45C;font-size:96px;letter-spacing:1px}.n{font-size:62px}
.e{font-size:64px;letter-spacing:6px}`;
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 320 } });
const list = [];
async function shot(html, file) {
  await pg.setContent(`<style>${css}</style><div class="w">${html}</div>`);
  await pg.evaluate(async () => { await document.fonts.load("800 60px Cap", "কানে"); await document.fonts.ready; });
  await pg.screenshot({ path: file, omitBackground: true });
}
for (const [i, [a, b, text, ch]] of CAPS.entries()) {
  const file = path.join(OUT, `${String(i).padStart(2, "0")}.png`);
  await shot(`<div class="t ${ch ? "c" : "n"}">${text.replace(", ", ",<br>")}</div>`, file);
  list.push({ a, b, file, y: 1440 - 160 });
}
const endf = path.join(OUT, "end.png");
await shot(`<div class="t e">BODY FLUID RECOVERY</div>`, endf);
fs.writeFileSync(path.join(OUT, "list.json"), JSON.stringify({ caps: list, end: endf }, null, 1));
await br.close(); console.log(list.length, "captions");
