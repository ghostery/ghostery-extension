import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remote } from 'webdriverio';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const V2_ROOT = join(__dirname, '..');
export const REPO_ROOT = join(V2_ROOT, '..');

export const CHROME_BIN = join(
  REPO_ROOT,
  'research',
  '.browsers',
  'chrome',
  'mac_arm-148.0.7778.167',
  'chrome-mac-arm64',
  'Google Chrome for Testing.app',
  'Contents',
  'MacOS',
  'Google Chrome for Testing',
);
export const CHROMEDRIVER_BIN = join(
  REPO_ROOT,
  'research',
  '.browsers',
  'chromedriver',
  'mac_arm-148.0.7778.167',
  'chromedriver-mac-arm64',
  'chromedriver',
);
export const GHOSTERY_DIST = join(REPO_ROOT, 'dist');

export const VIEWPORT = { width: 1280, height: 800 };

export function randomPort() {
  return 9515 + Math.floor(Math.random() * 4000);
}

export async function startChromedriver(port) {
  if (!existsSync(CHROMEDRIVER_BIN)) {
    throw new Error(`chromedriver missing at ${CHROMEDRIVER_BIN}`);
  }
  const proc = spawn(CHROMEDRIVER_BIN, [`--port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 1500);
    proc.stdout.on('data', (d) => {
      if (d.toString().toLowerCase().includes('chromedriver was started')) {
        clearTimeout(timer);
        resolve();
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`chromedriver exited early with code ${code}`));
    });
  });
  return proc;
}

export async function newSession({ port, withGhostery = false, headless = true }) {
  if (!existsSync(CHROME_BIN)) {
    throw new Error(`chrome missing at ${CHROME_BIN}`);
  }
  if (withGhostery && !existsSync(join(GHOSTERY_DIST, 'manifest.json'))) {
    throw new Error(`ghostery dist missing at ${GHOSTERY_DIST} -- build with 'npm run build chromium && scripts/patch-automation.sh dist'`);
  }
  const chromeArgs = [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate',
    '--disable-blink-features=AutomationControlled',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
  ];
  if (headless) chromeArgs.push('--headless=new');
  if (withGhostery) {
    chromeArgs.push(`--disable-extensions-except=${GHOSTERY_DIST}`);
    chromeArgs.push(`--load-extension=${GHOSTERY_DIST}`);
  }
  return remote({
    automationProtocol: 'webdriver',
    hostname: 'localhost',
    port,
    path: '/',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        binary: CHROME_BIN,
        args: chromeArgs,
        excludeSwitches: ['enable-automation'],
        useAutomationExtension: false,
      },
      pageLoadStrategy: 'eager',
    },
    logLevel: 'error',
    connectionRetryCount: 1,
  });
}

export async function cdp(port, sessionId, method, params = {}) {
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

export async function captureScreenshot(port, sessionId) {
  const res = await cdp(port, sessionId, 'Page.captureScreenshot', { format: 'png' });
  return res.data;
}

export async function discoverExtensionId(browser) {
  try {
    await browser.url('chrome://extensions');
    const item = await browser.$('>>>extensions-item');
    return await item.getAttribute('id');
  } catch {
    return null;
  }
}

const GHOSTERY_READY_TIMEOUT_MS = 30_000;
const GHOSTERY_FALLBACK_MS = 4_000;

export async function waitForGhosteryReady(browser, port) {
  const extId = await discoverExtensionId(browser);
  if (!extId) {
    await new Promise((r) => setTimeout(r, GHOSTERY_FALLBACK_MS));
    return { fallback: true };
  }
  await cdp(port, browser.sessionId, 'Page.navigate', {
    url: `chrome-extension://${extId}/pages/status/index.html`,
  });
  const deadline = Date.now() + GHOSTERY_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await cdp(port, browser.sessionId, 'Runtime.evaluate', {
        expression: '(() => window.__ghosteryStatus ?? null)()',
        returnByValue: true,
      });
      const v = res?.result?.value;
      if (v && v.ready === true) return v;
    } catch { /* still loading */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  return { timeout: true };
}

export async function killChromedriver(proc) {
  try {
    proc.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 200));
    if (!proc.killed) proc.kill('SIGKILL');
  } catch { /* */ }
}
