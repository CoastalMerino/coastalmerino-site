// Renders tools/og.html to og-image.png. Run from the repo root with a local server:
//   python3 -m http.server 8765 &   then   node tools/render-og.js
const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:8765/tools/og.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: 'og-image.png' });
  await b.close();
})();
