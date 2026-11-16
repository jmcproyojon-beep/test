// "কোডিং ছাড়াই ওয়েবসাইট" reel: timeline built from the 5 lip-synced avatar clips.
// Clip trims (source seconds) live in client-builds/webai-reel/prep.sh; times below are output seconds.
export const FPS = 30;
export const W = 1080, H = 1920;
export const CLIPS = [
  { src: "webai/c1.mp4", start: 0, end: 9.4 },
  { src: "webai/c2.mp4", start: 9.4, end: 18.7 },
  { src: "webai/c3.mp4", start: 18.7, end: 26.55 },
  { src: "webai/c4.mp4", start: 26.55, end: 34.6 },
  { src: "webai/c5.mp4", start: 34.6, end: 41.35 },
];
export const TOTAL = 41.35;
export const FRAMES = Math.round(TOTAL * FPS);

// caption phrases: words with start times (brand names shown in Latin, highlighted)
type Wd = [string, number];
export const PHRASES: Wd[][] = [
  [["কোডিং", 0.0], ["জানেন", 0.56], ["না?", 0.86]],
  [["কোনো", 1.08], ["সমস্যা", 1.8], ["নেই", 2.14]],
  [["আজ", 2.38], ["দেখাবো", 3.0]],
  [["ChatGPT", 3.76], ["বা", 5.04], ["Gemini", 5.56], ["দিয়ে", 6.12]],
  [["কয়েক", 6.48], ["ধাপে", 7.12], ["নিজের", 7.5]],
  [["ওয়েবসাইট", 8.28], ["বানানো", 8.74]],
  [["প্রথম", 9.45], ["ধাপ", 10.6]],
  [["ChatGPT", 11.24], ["বা", 12.54], ["Gemini", 12.74], ["খুলুন", 13.22]],
  [["দ্বিতীয়", 13.6], ["ধাপ", 15.0]],
  [["সহজ", 15.52], ["বাংলায়", 16.1], ["লিখুন", 16.58]],
  [["আপনি", 16.94], ["কেমন", 17.46], ["ওয়েবসাইট", 17.76], ["চান", 18.24]],
  [["তৃতীয়", 18.85], ["ধাপ", 19.5]],
  [["Canvas", 19.85], ["অপশনটা", 20.83], ["চালু", 21.31], ["করুন", 21.65]],
  [["AI", 21.87], ["নিজেই", 22.99], ["পুরো", 23.73], ["কোড", 24.03], ["লিখে", 24.31], ["দেবে", 24.67]],
  [["প্রিভিউও", 24.91], ["দেখাবে", 25.87]],
  [["চতুর্থ", 26.7], ["ধাপ", 27.34]],
  [["যা", 27.72], ["পছন্দ", 28.14], ["হয়নি", 28.56]],
  [["সেটা", 28.88], ["বলে", 29.12], ["বদলে", 29.38], ["নিন", 29.7]],
  [["তারপর", 29.94], ["Netlify", 31.06], ["বা", 31.72]],
  [["GitHub", 32.08], ["Pages-এ", 32.3], ["ফ্রিতে", 32.92]],
  [["পাবলিশ", 33.64], ["করুন", 34.0]],
  [["ব্যস!", 34.75]],
  [["কোড", 35.13], ["ছাড়াই", 35.97], ["আপনার", 36.39], ["ওয়েবসাইট", 36.75], ["রেডি", 37.17]],
  [["এমন", 37.93], ["আরও", 38.69], ["AI", 39.09], ["টিপস", 39.33], ["পেতে", 39.71]],
  [["ফলো", 40.07], ["করুন", 40.71]],
];

// picture segments: presenter (clip index + zoom) or phone screen
export type Seg = { s: number; e: number; kind: "p"; clip: number; z: [number, number]; x?: number } | { s: number; e: number; kind: "phone"; screen: string };
export const SEGS: Seg[] = [
  { s: 0, e: 2.38, kind: "p", clip: 0, z: [1.18, 1.06] },
  { s: 2.38, e: 6.48, kind: "p", clip: 0, z: [1.0, 1.04] },
  { s: 6.48, e: 9.4, kind: "p", clip: 0, z: [1.16, 1.2] },
  { s: 9.4, e: 11.1, kind: "p", clip: 1, z: [1.0, 1.04] },
  { s: 11.1, e: 13.54, kind: "phone", screen: "open" },
  { s: 13.54, e: 15.5, kind: "p", clip: 1, z: [1.14, 1.18] },
  { s: 15.5, e: 18.7, kind: "phone", screen: "type" },
  { s: 18.7, e: 20.4, kind: "p", clip: 2, z: [1.0, 1.04] },
  { s: 20.4, e: 21.87, kind: "phone", screen: "canvas" },
  { s: 21.87, e: 24.91, kind: "phone", screen: "code" },
  { s: 24.91, e: 26.55, kind: "phone", screen: "preview" },
  { s: 26.55, e: 28.8, kind: "p", clip: 3, z: [1.0, 1.04] },
  { s: 28.8, e: 29.94, kind: "phone", screen: "edit" },
  { s: 29.94, e: 31.0, kind: "p", clip: 3, z: [1.16, 1.2] },
  { s: 31.0, e: 34.6, kind: "phone", screen: "publish" },
  { s: 34.6, e: 37.93, kind: "p", clip: 4, z: [1.12, 1.04] },
  { s: 37.93, e: 41.35, kind: "p", clip: 4, z: [1.0, 1.06] },
];
export const STEPS = [
  { n: 1, s: 9.4, title: ["ChatGPT বা", "Gemini খুলুন"] },
  { n: 2, s: 13.54, title: ["সহজ বাংলায়", "লিখুন"] },
  { n: 3, s: 18.7, title: ["Canvas", "চালু করুন"] },
  { n: 4, s: 26.55, title: ["যা পছন্দ হয়নি", "বদলে নিন"] },
];
