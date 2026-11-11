// overlay.html を 1 フレームずつ透過PNGに書き出す
// node render_overlay.js <overlay.html> <outdir> <seconds> <fps>
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [html, out, secs, fps] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(html));
  await p.evaluate(() => document.fonts.ready);
  const n = Math.round(+secs * +fps);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.setTime(t), i / +fps);
    await p.screenshot({ path: `${out}/${String(i + 1).padStart(4, '0')}.png`, omitBackground: true });
  }
  await b.close();
})();
