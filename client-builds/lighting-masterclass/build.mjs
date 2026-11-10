// Build the single self-contained class video page + the voice script.
//   node client-builds/lighting-masterclass/build.mjs
// -> projects/lighting-masterclass/lighting-masterclass.html   (fonts, GSAP, data inlined)
// -> projects/lighting-masterclass/voice-script.txt            (every line with its timestamp)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, TITLE, INSTRUCTOR, EDITOR, timeLines } from "./src/script.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, "../../projects/lighting-masterclass");
fs.mkdirSync(OUT, { recursive: true });
const V = (f) => path.join(HERE, "vendor", f);
const b64 = (f) => fs.readFileSync(V(f)).toString("base64");

const BN_RANGE = "U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0-1CF9,U+200C-200D,U+20B9,U+25CC,U+A8F1";
const LAT_RANGE = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
let faces = "";
for (const w of [400, 500, 600, 700]) {
  faces += `@font-face{font-family:'Hind Siliguri';font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64(`hind-siliguri-bengali-${w}-normal.woff2`)}) format('woff2');unicode-range:${BN_RANGE}}\n`;
  faces += `@font-face{font-family:'Hind Siliguri';font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64(`hind-siliguri-latin-${w}-normal.woff2`)}) format('woff2');unicode-range:${LAT_RANGE}}\n`;
}
for (const w of [400, 500, 600, 700, 800])
  faces += `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64(`inter-latin-${w}-normal.woff2`)}) format('woff2');unicode-range:${LAT_RANGE}}\n`;

const LINES = timeLines();
const scenesLite = SCENES.map(({ n, start, end, title }) => ({ n, start, end, title }));
const css = fs.readFileSync(path.join(HERE, "src/style.css"), "utf8");
const app = fs.readFileSync(path.join(HERE, "src/app.js"), "utf8");
const gsapJs = fs.readFileSync(V("gsap.min.js"), "utf8");
// preload every weight so text never renders in a fallback face
const warm = [400, 500, 600, 700, 800].map((w) => `<span style="font-weight:${w}">অআকখ Aa</span>`).join("");

const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<style>
${faces}
${css}
</style>
</head>
<body>
<div id="frame"><div id="stage">
  <svg id="svg" width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg"></svg>
  <div id="sub"><span></span></div>
</div></div>
<div id="controls">
  <button id="play" aria-label="Play"></button>
  <span id="time">0:00 / 5:00</span>
  <input id="scrub" type="range" min="0" max="300" step="0.01" value="0" aria-label="Scrub">
  <span id="scene"></span>
  <div id="chips"></div>
</div>
<div id="warm" aria-hidden="true">${warm}</div>
<script>window.__SCENES=${JSON.stringify(scenesLite)};window.__LINES=${JSON.stringify(LINES)};</script>
<script>${gsapJs}</script>
<script>${app}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, "lighting-masterclass.html"), html);

// voice script
const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const ts = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
let txt = `${TITLE}
ভয়েসওভার স্ক্রিপ্ট — ইনস্ট্রাক্টর: ${INSTRUCTOR} · সম্পাদনা: ${EDITOR}
মোট দৈর্ঘ্য: ৫:০০ (৩০০ সেকেন্ড)

কীভাবে ব্যবহার করবেন:
- প্রতিটা লাইনের পাশে সময় দেওয়া আছে (মিনিট:সেকেন্ড)। ভিডিওর সাবটাইটেল আর ক্যারেক্টারের
  মুখ নড়া ঠিক এই সময় ধরে চলে। লাইনটা ওই সময়ের মধ্যে শুরু ও শেষ করুন।
- প্রতিটা সিনের শুরুর সময় নির্দিষ্ট; সিনের ভেতরে একটু আগে-পরে হলে সমস্যা নেই।
- রেকর্ড শেষে অডিওটা ০:০০ থেকে বসালেই মিলে যাবে।

`;
for (const sc of SCENES) {
  txt += `────────────────────────────────────────\nসিন ${bn(sc.n)} — ${sc.title}  (${mmss(sc.start)}–${mmss(sc.end)})\n\n`;
  for (const l of LINES.filter((x) => x.scene === sc.n)) txt += `[${ts(l.s)} – ${ts(l.e)}]  ${l.text}\n`;
  txt += "\n";
}
txt += `────────────────────────────────────────\nপুরো স্ক্রিপ্ট (একটানা):\n\n`;
for (const sc of SCENES) txt += `সিন ${bn(sc.n)}: ${sc.lines.join(" ")}\n\n`;
fs.writeFileSync(path.join(OUT, "voice-script.txt"), txt);
console.log("wrote", path.join(OUT, "lighting-masterclass.html"), (html.length / 1024).toFixed(0) + " KB");
console.log("wrote", path.join(OUT, "voice-script.txt"));
