import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  captureScreenshot,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  waitForGhosteryReady,
} from '../../research-v2/src/browser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V3_ROOT = join(__dirname, '..');

const URL = process.argv[2] || 'https://www.vox.com/';
const SETTLE_MS = Number(process.env.SETTLE_MS) || 15000;
const KEEP_OPEN_MS = Number(process.env.KEEP_OPEN_MS) || 30000;

async function main() {
  console.log(`URL:           ${URL}`);
  console.log(`Settle:        ${SETTLE_MS}ms before screenshot`);
  console.log(`Keep open:     ${KEEP_OPEN_MS}ms after screenshot (so you can watch)`);
  console.log(`Mode:          HEADED + Ghostery enabled (patched dist)`);
  console.log('');

  const port = randomPort();
  const cd = await startChromedriver(port);
  let browser;
  try {
    console.log('[1/5] Launching Chrome with Ghostery extension...');
    const headless = process.env.HEADLESS === '1' || process.env.HEADLESS === 'true';
    console.log(`[1.5] Mode: ${headless ? 'headless' : 'headed'}`);
    browser = await newSession({ port, withGhostery: true, headless });
    console.log('[2/5] Waiting for Ghostery to report ready...');
    const status = await waitForGhosteryReady(browser, port);
    console.log(`      Ghostery status: ${JSON.stringify(status)}`);
    console.log(`[3/5] Navigating to ${URL}`);
    await browser.url(URL);
    console.log(`[4/5] Waiting ${SETTLE_MS}ms for page + autoconsent / cosmetic filters...`);
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    console.log('[5/5] Capturing screenshot...');
    const shotB64 = await captureScreenshot(port, browser.sessionId);
    const outPath = join(V3_ROOT, 'headed-test.png');
    writeFileSync(outPath, Buffer.from(shotB64, 'base64'));
    console.log(`      Saved: ${outPath}`);
    console.log('');
    console.log(`Browser stays open for ${KEEP_OPEN_MS / 1000}s. Inspect the window now.`);
    console.log('Banner should appear briefly and be removed by Ghostery, leaving a clean viewport.');
    await new Promise((r) => setTimeout(r, KEEP_OPEN_MS));
  } finally {
    if (browser) await browser.deleteSession().catch(() => {});
    await killChromedriver(cd);
  }
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
