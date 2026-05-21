import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  cdp,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  V2_ROOT,
} from './browser.js';

async function main() {
  const port = randomPort();
  const cd = await startChromedriver(port);
  let browser;
  try {
    browser = await newSession({ port });
    await browser.url(`file://${join(V2_ROOT, 'POST.html')}`);
    await new Promise((r) => setTimeout(r, 1500));

    const dim = await cdp(port, browser.sessionId, 'Runtime.evaluate', {
      expression: 'JSON.stringify({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight })',
      returnByValue: true,
    });
    const { w, h } = JSON.parse(dim.result.value);
    console.log(`Page dimensions: ${w}x${h}`);

    const full = await cdp(port, browser.sessionId, 'Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    });
    writeFileSync(join(V2_ROOT, 'POST.png'), Buffer.from(full.data, 'base64'));
    console.log(`Wrote ${V2_ROOT}/POST.png (${Math.round(full.data.length * 0.75 / 1024)}KB)`);

    const sections = [
      { name: 'POST-top.png',    y: 0,    height: 1100 },
      { name: 'POST-mid.png',    y: Math.max(0, Math.floor(h / 2) - 700), height: 1400 },
      { name: 'POST-bottom.png', y: h - 1200, height: 1200 },
    ];
    for (const s of sections) {
      const shot = await cdp(port, browser.sessionId, 'Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: s.y, width: w, height: s.height, scale: 1 },
      });
      writeFileSync(join(V2_ROOT, s.name), Buffer.from(shot.data, 'base64'));
      console.log(`Wrote ${s.name} (${Math.round(shot.data.length * 0.75 / 1024)}KB)`);
    }
  } finally {
    if (browser) await browser.deleteSession().catch(() => {});
    await killChromedriver(cd);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
