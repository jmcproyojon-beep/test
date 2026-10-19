// Records each demo as a genuine browser session: real typing, real send, LIVE Gemini streaming answer, slow read-through scroll.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const DEMOS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));   // {id: [prompt, followup...]}
const OUT = process.argv[3]; const only = process.argv[4] ? process.argv[4].split(',') : Object.keys(DEMOS);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const id of only) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: OUT + '/tmp_' + id, size: { width: 1920, height: 1080 } } });
    const page = await ctx.newPage(); const t0 = Date.now(); const log = [];
    const mark = (e, extra) => log.push(Object.assign({ e, t: (Date.now() - t0) / 1000 }, extra || {}));
    await page.goto('http://127.0.0.1:8765/index.html'); await page.waitForTimeout(1200); mark('ready');
    await page.evaluate(() => cursorTo(1500, 700)); await page.waitForTimeout(600);
    for (let turn = 0; turn < DEMOS[id].length; turn++) {
      const prompt = DEMOS[id][turn];
      await page.evaluate(() => cursorTo(900, 965)); await page.waitForTimeout(650);
      await page.evaluate(() => clickFx(912, 978)); await page.click('#in'); mark('type_start', { turn });
      await page.keyboard.type(prompt, { delay: prompt.length > 300 ? 14 : (prompt.length < 60 ? 70 : 32) });
      mark('type_end', { turn }); await page.waitForTimeout(700);
      await page.evaluate(() => cursorTo(1820, 990)); await page.waitForTimeout(650);
      await page.evaluate(() => clickFx(1832, 1003)); mark('send', { turn });
      await page.evaluate(([d, t]) => send(d, t), [id, turn]);
      mark('done', { turn }); await page.waitForTimeout(1200);
      // read-through: scroll to the start of this answer, then glide down to the end
      const h = await page.evaluate(() => { const c = document.getElementById('chat'); const m = [...document.querySelectorAll('.msg.a')].pop(); c.scrollTop = m.offsetTop - 30; return { top: m.offsetTop, h: m.offsetHeight, view: c.clientHeight } });
      mark('read_start', { turn });
      const dist = Math.max(0, h.h - h.view + 120); const secs = Math.min(40, Math.max(4, dist / 60));
      const steps = Math.round(secs * 20);
      for (let k = 1; k <= steps; k++) { await page.evaluate(([y]) => { document.getElementById('chat').scrollTop = y }, [h.top - 30 + dist * k / steps]); await page.waitForTimeout(50) }
      mark('read_end', { turn }); await page.waitForTimeout(1500);
    }
    mark('end'); await ctx.close();
    const dir = OUT + '/tmp_' + id; const f = fs.readdirSync(dir).find(x => x.endsWith('.webm'));
    fs.renameSync(dir + '/' + f, OUT + '/' + id + '.webm'); fs.rmdirSync(dir);
    fs.writeFileSync(OUT + '/' + id + '.events.json', JSON.stringify(log, null, 1));
    console.log('recorded', id, log[log.length - 1].t.toFixed(1), 's');
  }
  await browser.close();
})();
