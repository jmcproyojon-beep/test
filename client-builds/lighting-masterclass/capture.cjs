// Frame-accurate MP4 of the class page: seeks the GSAP timeline frame by frame
// in headless Chromium and pipes screenshots to ffmpeg.
//   node capture.cjs page.html out.mp4 [fromFrame toFrame]
const { chromium } = require("playwright");
const { spawn } = require("child_process");
(async () => {
  const [, , file, out, a = "0", b = "9000"] = process.argv;
  const FPS = 30, from = +a, to = +b;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + file + "?capture=1");
  await page.evaluate(() => window.__ready);
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = from; f < to; f++) {
    await page.evaluate((t) => window.__seek(t), f / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - from) % 600 === 0) console.log(out, f);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
})();
