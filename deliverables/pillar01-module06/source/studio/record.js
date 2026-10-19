// Records each AI Reel Studio demo as a genuine browser session: real typing, real clicks, LIVE AI results.
// Events (seconds from page start) drive the edit: part_start/part_end, wait_start/wait_end (trimmed), zoom boxes, play (audio overlay), read (speedable).
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const P = JSON.parse(fs.readFileSync(__dirname + '/prompts.json', 'utf8'));
const OUT = process.argv[2]; const only = process.argv[3].split(',');
const FULL = [0, 0, 1920, 1080];

async function run(id, page, mark) {
  const box = async sel => { const b = await page.locator(sel).first().boundingBox(); return [b.x, b.y, b.width, b.height] };
  const zoomTo = async (sel, pad = 40, minW = 1100) => {           // 16:9 box around an element, at least minW wide
    const [x, y, w, h] = await box(sel); let W = Math.max(minW, w + 2 * pad, (h + 2 * pad) * 16 / 9); W = Math.min(1920, W); const H = W * 9 / 16;
    let X = x + w / 2 - W / 2, Y = y + h / 2 - H / 2; X = Math.max(0, Math.min(1920 - W, X)); Y = Math.max(0, Math.min(1080 - H, Y));
    mark('zoom', { box: [X, Y, W, H].map(Math.round) });
  };
  const zoomFull = () => mark('zoom', { box: FULL });
  const click = async sel => {
    const [x, y, w, h] = await box(sel); const cx = x + w / 2, cy = y + h / 2;
    await page.evaluate(([a, b]) => cursorTo(a - 4, b - 4), [cx, cy]); await page.waitForTimeout(700);
    await page.evaluate(([a, b]) => clickFx(a, b), [cx, cy]); mark('click', { sel }); await page.waitForTimeout(250);
  };
  const type = async (sel, text) => {
    await click(sel); await page.click(sel); mark('type_start');
    await page.keyboard.type(text, { delay: text.length > 300 ? 12 : (text.length < 80 ? 55 : 26) }); mark('type_end'); await page.waitForTimeout(600);
  };
  const wait = async (fn, arg) => { mark('wait_start'); const r = await page.evaluate(fn, arg); mark('wait_end'); await page.waitForTimeout(900); return r };
  const play = async (tag, fn, arg) => { mark('play_start', { tag }); await page.evaluate(fn, arg); mark('play_end', { tag }); await page.waitForTimeout(800) };
  const readScroll = async () => {   // glide down through the newest chat answer
    const h = await page.evaluate(() => { const c = document.getElementById('chat'); const m = [...document.querySelectorAll('.msg.a')].pop(); c.scrollTop = m.offsetTop - 30; return { top: m.offsetTop, h: m.offsetHeight, view: c.clientHeight } });
    const dist = Math.max(0, h.h - h.view + 120); const secs = Math.min(36, Math.max(5, dist / 55)); const steps = Math.round(secs * 20);
    mark('read_start');
    for (let k = 1; k <= steps; k++) { await page.evaluate(([y]) => { document.getElementById('chat').scrollTop = y }, [h.top - 30 + dist * k / steps]); await page.waitForTimeout(50) }
    mark('read_end'); await page.waitForTimeout(1200);
  };

  if (id === 'd1') {
    for (const [part, key, turn] of [['p0', 'script', 0], ['p1', 'script2', 1]]) {
      mark('part_start', { part }); zoomFull(); await page.waitForTimeout(800);
      await zoomTo('#inwrap', 30, 1300); await type('#in', P[key]);
      await click('#send'); zoomFull();
      await wait(([t]) => sendChat('d1', t), [turn]);
      await zoomTo('#chat', 0, 1500); await readScroll(); mark('part_end', { part });
    }
  }
  if (id === 'd2') {
    await click('#st2'); await page.evaluate(() => goStep(2)); await page.waitForTimeout(900);
    for (const idx of [1, 2, 3]) {
      if (idx !== 3) mark('part_start', { part: idx === 1 ? 'img1' : 'img23' });
      zoomFull(); await page.evaluate(([i]) => setShot(i), [idx]); await page.waitForTimeout(700);
      await zoomTo('#ip', 60, 1150); await type('#ip', P['img' + idx]);
      await click('#genimg'); await zoomTo('#icode', 40, 1150);
      await wait(([i]) => genSvg(i), [idx]);
      await page.waitForTimeout(1500);                             // let the last of the code be read
      await zoomTo('#fr' + idx, 60, 900); await page.waitForTimeout(3500);
      zoomFull(); await page.waitForTimeout(2500);
      if (idx !== 2) mark('part_end', { part: idx === 1 ? 'img1' : 'img23' });
    }
  }
  if (id === 'd3') {
    await click('#st3'); await page.evaluate(() => goStep(3)); await page.waitForTimeout(900);
    mark('part_start', { part: 'v1' }); zoomFull();
    await click('#imp'); await page.evaluate(() => importNarr()); await page.waitForTimeout(1500);
    await zoomTo('#narr', 40, 1100); await page.waitForTimeout(3500); zoomFull();
    await click('#vAoede'); await page.evaluate(() => pickVoice('Aoede')); await page.waitForTimeout(800);
    await zoomTo('#sty', 80, 1100); await type('#sty', P.style); zoomFull();
    await click('#gentts'); await wait(() => genTTS('voice_bn_a', 'd3'));
    await zoomTo('#takes', 60, 1000); await page.waitForTimeout(800);
    await click('#takes .take:nth-child(1) .play'); await play('voice_bn_a', () => playTake(0));
    mark('part_end', { part: 'v1' });
    mark('part_start', { part: 'v2' }); zoomFull();
    await click('#vPuck'); await page.evaluate(() => pickVoice('Puck')); await page.waitForTimeout(800);
    await click('#gentts'); await wait(() => genTTS('voice_bn_b', 'd3'));
    await zoomTo('#takes', 60, 1000); await page.waitForTimeout(800);
    await click('#takes .take:nth-child(2) .play'); await play('voice_bn_b', () => playTake(1));
    mark('part_end', { part: 'v2' });
  }
  if (id === 'd4') {
    await click('#st4'); await page.evaluate(() => goStep(4)); await page.waitForTimeout(900);
    mark('part_start', { part: 'tr' }); zoomFull(); await page.waitForTimeout(1200);
    await zoomTo('#dp', 80, 1150); await type('#dp', P.dub);
    await click('#trb'); await wait(() => translate()); await zoomTo('#en', 60, 1150); await page.waitForTimeout(6000);
    mark('part_end', { part: 'tr' });
    mark('part_start', { part: 'en' }); zoomFull();
    await click('#enb'); await wait(() => genEN()); await zoomTo('#entake', 60, 1100); await page.waitForTimeout(600);
    await click('#entake .play'); await play('voice_en', () => playEN());
    mark('part_end', { part: 'en' });
    mark('part_start', { part: 'av' }); await zoomTo('#avbox', 30, 1000); await page.waitForTimeout(800);
    await click('#avp'); await play('avatar', () => playAvatar());
    mark('part_end', { part: 'av' });
  }
  if (id === 'd5') {
    await click('#st5'); await page.evaluate(() => goStep(5)); await page.waitForTimeout(900);
    mark('part_start', { part: 'srt' }); zoomFull();
    await zoomTo('#sp', 80, 1150); await type('#sp', P.srt);
    await click('#srtb'); await wait(() => makeSrt()); await zoomTo('#srt', 30, 1150); await page.waitForTimeout(7000);
    mark('part_end', { part: 'srt' });
    mark('part_start', { part: 'prev' }); await page.evaluate(() => loadSubs()); await zoomTo('#pv', 120, 1000); await page.waitForTimeout(600);
    await click('#pvp'); const d = await page.evaluate(() => S.takes.find(t => t.tag === 'voice_bn_a').dur);
    await play('voice_bn_a', ([x]) => playPreview(x), [d]);
    mark('part_end', { part: 'prev' });
  }
  if (id === 'd5b') {
    await click('#st5'); await page.evaluate(() => goStep(5)); await page.waitForTimeout(900);
    mark('part_start', { part: 'fixprev' }); await zoomTo('#srt', 30, 1150); await page.waitForTimeout(3500);
    await click('#fixb'); await page.evaluate(() => fixSrt()); await page.waitForTimeout(800); await zoomTo('#fixmsg', 300, 1150); await page.waitForTimeout(6000);
    await page.evaluate(() => loadSubs()); await zoomTo('#pv', 120, 1000); await page.waitForTimeout(600);
    await click('#pvp'); const d = await page.evaluate(() => S.takes.find(t => t.tag === 'voice_bn_a').dur);
    await play('voice_bn_a', ([x]) => playPreview(x), [d]);
    mark('part_end', { part: 'fixprev' });
  }
  if (id === 'd6') {
    await click('#st6'); await page.evaluate(() => goStep(6)); await page.waitForTimeout(900);
    mark('part_start', { part: 'tl' }); zoomFull();
    await page.evaluate(() => buildTimeline(S.plan.cuts, S.plan.dur)); await page.waitForTimeout(2500);
    await zoomTo('#tl', 20, 1700); await page.waitForTimeout(1500);
    mark('read_start'); await page.evaluate(() => scrubTimeline(10)); mark('read_end');
    await zoomTo('#editnotes', 60, 1100); await page.waitForTimeout(5000); zoomFull(); await page.waitForTimeout(1200);
    mark('part_end', { part: 'tl' });
    mark('part_start', { part: 'ex' }); await zoomTo('#exp', 60, 1100); await page.waitForTimeout(2500);
    await click('#exb'); await wait(() => exportReel()); await page.waitForTimeout(1500);
    zoomFull(); await page.waitForTimeout(500);
    await play('reel_final', () => playFinal());
    mark('part_end', { part: 'ex' });
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const id of only) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: OUT + '/tmp_' + id, size: { width: 1920, height: 1080 } } });
    const page = await ctx.newPage(); const t0 = Date.now(); const log = [];
    const mark = (e, extra) => log.push(Object.assign({ e, t: (Date.now() - t0) / 1000 }, extra || {}));
    await page.goto('http://127.0.0.1:8766/index.html'); await page.evaluate(() => restore()); await page.waitForTimeout(1500); mark('ready');
    await page.evaluate(() => cursorTo(1500, 700)); await page.waitForTimeout(600);
    try { await run(id, page, mark) } catch (e) { console.log('ERROR', id, e.message); mark('error', { msg: e.message }) }
    mark('end'); await page.waitForTimeout(500); await ctx.close();
    const dir = OUT + '/tmp_' + id; const f = fs.readdirSync(dir).find(x => x.endsWith('.webm'));
    fs.renameSync(dir + '/' + f, OUT + '/' + id + '.webm'); fs.rmdirSync(dir);
    fs.writeFileSync(OUT + '/' + id + '.events.json', JSON.stringify(log, null, 1));
    console.log('recorded', id, log[log.length - 1].t.toFixed(1), 's');
  }
  await browser.close();
})();
