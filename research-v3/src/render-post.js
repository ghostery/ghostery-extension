import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remote } from 'webdriverio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V3_ROOT = join(__dirname, '..');
const REPO_ROOT = join(V3_ROOT, '..');

const CHROME_BIN = join(REPO_ROOT, 'research', '.browsers', 'chrome', 'mac_arm-148.0.7778.167', 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
const CHROMEDRIVER_BIN = join(REPO_ROOT, 'research', '.browsers', 'chromedriver', 'mac_arm-148.0.7778.167', 'chromedriver-mac-arm64', 'chromedriver');

function randomPort() { return 9515 + Math.floor(Math.random() * 4000); }

async function startChromedriver(port) {
  if (!existsSync(CHROMEDRIVER_BIN)) throw new Error(`chromedriver missing at ${CHROMEDRIVER_BIN}`);
  const proc = spawn(CHROMEDRIVER_BIN, [`--port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 1500);
    proc.stdout.on('data', (d) => { if (d.toString().toLowerCase().includes('chromedriver was started')) { clearTimeout(timer); resolve(); } });
    proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`chromedriver exited early code=${code}`)); });
  });
  return proc;
}

async function cdp(port, sessionId, method, params = {}) {
  const url = `http://localhost:${port}/session/${sessionId}/goog/cdp/execute`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cmd: method, params }),
  });
  const data = await resp.json();
  if (data.value && data.value.error) throw new Error(data.value.message || data.value.error);
  return data.value;
}

async function main() {
  const port = randomPort();
  const cd = await startChromedriver(port);
  let browser;
  try {
    browser = await remote({
      automationProtocol: 'webdriver',
      hostname: 'localhost', port, path: '/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': { binary: CHROME_BIN, args: ['--headless=new', '--no-first-run', '--window-size=1280,800'] },
        pageLoadStrategy: 'eager',
      },
      logLevel: 'error',
      connectionRetryCount: 1,
    });
    await browser.url(`file://${join(V3_ROOT, 'POST.html')}`);
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
    writeFileSync(join(V3_ROOT, 'POST.png'), Buffer.from(full.data, 'base64'));
    console.log(`Wrote POST.png (${Math.round(full.data.length * 0.75 / 1024)}KB)`);

    const sections = [
      { name: 'POST-top.png', y: 0, height: 1100 },
      { name: 'POST-hero.png', y: 1100, height: 1400 },
      { name: 'POST-mid.png', y: Math.max(0, Math.floor(h / 2) - 200), height: 1400 },
      { name: 'POST-bottom.png', y: h - 1200, height: 1200 },
    ];
    for (const s of sections) {
      const shot = await cdp(port, browser.sessionId, 'Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: s.y, width: w, height: s.height, scale: 1 },
      });
      writeFileSync(join(V3_ROOT, s.name), Buffer.from(shot.data, 'base64'));
      console.log(`Wrote ${s.name} (${Math.round(shot.data.length * 0.75 / 1024)}KB)`);
    }
  } finally {
    if (browser) await browser.deleteSession().catch(() => {});
    try { cd.kill('SIGTERM'); } catch {}
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
