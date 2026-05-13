import { spawn } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remote } from 'webdriverio';

import { countTokens } from './tokenize.js';
import { imageTokens } from './cost-model.js';
import { ensureExtensionExtracted } from './setup.js';
import { detectConsentBanners } from './detect-consent.js';
import { detectViaAutoconsent } from './autoconsent-oracle.js';

async function chromedriverCdp(port, sessionId, method, params = {}) {
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

function pageExtractScript() {
  const extractFn = () => {
    const text = document.body ? document.body.innerText : '';
    const iframes = document.querySelectorAll('iframe');
    const iframeSrcs = [];
    let emptyIframes = 0;
    for (const f of iframes) {
      const src = f.src || f.getAttribute('data-src') || '';
      iframeSrcs.push(src);
      try {
        if (!f.contentDocument || !f.contentDocument.body || !f.contentDocument.body.innerHTML) {
          emptyIframes++;
        }
      } catch {
        /* cross-origin */
      }
    }
    const consent = detectConsentBanners();
    return {
      html: document.documentElement.outerHTML,
      innerText: text,
      iframeCount: iframes.length,
      iframeSrcs,
      emptyIframes,
      title: document.title,
      scrollHeight: document.documentElement.scrollHeight,
      consentBannerDetected: consent.detected,
      consentBannerCandidates: consent.candidates,
      mostlyEmpty: text.length < 200,
    };
  };
  return `(() => {
    const detectConsentBanners = ${detectConsentBanners.toString()};
    return (${extractFn.toString()})();
  })()`;
}

async function extractPageDataViaCdp(port, sessionId) {
  const res = await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
    expression: pageExtractScript(),
    returnByValue: true,
    awaitPromise: false,
  });
  if (res && res.exceptionDetails) {
    const ed = res.exceptionDetails;
    throw new Error(`Runtime.evaluate exception: ${ed.text || ed.exception?.description || 'unknown'}`);
  }
  return res?.result?.value;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = join(__dirname, '..');
const REPO_ROOT = join(RESEARCH_ROOT, '..');

const CHROME_BIN = join(
  RESEARCH_ROOT,
  '.browsers/chrome/mac_arm-148.0.7778.167/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);
const CHROMEDRIVER_BIN = join(
  RESEARCH_ROOT,
  '.browsers/chromedriver/mac_arm-148.0.7778.167/chromedriver-mac-arm64/chromedriver',
);
const EXT_ZIP = join(REPO_ROOT, 'web-ext-artifacts/ghostery-automation-chromium.zip');

const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 30_000;
const SETTLE_AFTER_LOAD_MS = 2_500;
const GHOSTERY_WARMUP_FALLBACK_MS = 4_000;
const GHOSTERY_READY_TIMEOUT_MS = 30_000;
const WARMUP_URL = 'https://example.com/';

function pngDimensions(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function startChromedriver(port, { verbose = false, logPath } = {}) {
  if (!existsSync(CHROMEDRIVER_BIN)) {
    throw new Error(`chromedriver missing at ${CHROMEDRIVER_BIN} — run npm run setup:browsers`);
  }
  const args = [`--port=${port}`];
  if (verbose) args.push('--verbose');
  if (logPath) args.push(`--log-path=${logPath}`);
  const proc = spawn(CHROMEDRIVER_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (verbose) {
    proc.stdout.on('data', (d) => process.stdout.write(`[chromedriver] ${d}`));
    proc.stderr.on('data', (d) => process.stderr.write(`[chromedriver:err] ${d}`));
  }
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 1500);
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

async function installGhosteryViaBidi(browser) {
  const extDir = ensureExtensionExtracted();
  const params = { extensionData: { type: 'path', path: extDir } };
  if (typeof browser.webExtensionInstall === 'function') {
    return browser.webExtensionInstall(params);
  }
  if (typeof browser.installExtension === 'function') {
    return browser.installExtension(params);
  }
  throw new Error('webdriverio does not expose webExtension.install — check version');
}

async function discoverLoadedExtensionId(browser, label) {
  try {
    await browser.url('chrome://extensions');
    const item = await browser.$('>>>extensions-item');
    const id = await item.getAttribute('id');
    if (id) return id;
  } catch (e) {
    console.warn(`[${label}] could not read extension id from chrome://extensions: ${e.message}`);
  }
  return null;
}

async function waitForGhosteryReady(browser, port, sessionId, label) {
  const extId = await discoverLoadedExtensionId(browser, label);
  if (!extId) {
    await new Promise((r) => setTimeout(r, GHOSTERY_WARMUP_FALLBACK_MS));
    return { fallback: true, reason: 'no-extension-id' };
  }
  const url = `chrome-extension://${extId}/pages/status/index.html`;
  const expression = '(() => window.__ghosteryStatus ?? null)()';
  const deadline = Date.now() + GHOSTERY_READY_TIMEOUT_MS;
  try {
    await chromedriverCdp(port, sessionId, 'Page.navigate', { url });
  } catch (e) {
    console.warn(`[${label}] could not open status page (${e.message}); falling back to fixed warmup sleep`);
    await new Promise((r) => setTimeout(r, GHOSTERY_WARMUP_FALLBACK_MS));
    return { fallback: true, reason: 'nav-failed', error: e.message };
  }
  while (Date.now() < deadline) {
    try {
      const res = await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
        expression,
        returnByValue: true,
      });
      const v = res?.result?.value;
      if (v && v.ready === true) return v;
      if (v && v.error) {
        console.warn(`[${label}] status page reported error: ${v.error}; falling back to fixed warmup sleep`);
        await new Promise((r) => setTimeout(r, GHOSTERY_WARMUP_FALLBACK_MS));
        return { fallback: true, reason: 'page-error', error: v.error };
      }
    } catch {
      /* page may not have finished loading yet — keep polling */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  console.warn(`[${label}] Ghostery readiness timed out after ${GHOSTERY_READY_TIMEOUT_MS}ms`);
  return { timeout: true };
}

export async function measure(url, { withGhostery, outDir, label, headless = true, debug = false, capturePages = false, extDir = null }) {
  const timings = {};
  const mark = (k, t0) => {
    timings[k] = Date.now() - t0;
  };
  const tStart = Date.now();

  const port = 9515 + Math.floor(Math.random() * 4000);
  let t = Date.now();
  const cdProc = await startChromedriver(port, {
    verbose: debug,
    logPath: debug ? join(outDir, `${label}.chromedriver.log`) : undefined,
  });
  mark('chromedriver', t);

  const chromeArgs = [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
  ];
  if (headless) chromeArgs.push('--headless=new');

  let extPath;
  if (withGhostery) {
    extPath = ensureExtensionExtracted({ dir: extDir });
    chromeArgs.push(`--disable-extensions-except=${extPath}`);
    chromeArgs.push(`--load-extension=${extPath}`);
  }

  let browser;
  try {
    t = Date.now();
    browser = await remote({
      automationProtocol: 'webdriver',
      hostname: 'localhost',
      port,
      path: '/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          binary: CHROME_BIN,
          args: chromeArgs,
        },
        'pageLoadStrategy': 'eager',
        webSocketUrl: true,
      },
      logLevel: debug ? 'debug' : 'error',
      outputDir: debug ? outDir : undefined,
      connectionRetryCount: 1,
    });
    mark('session', t);

    let ghosteryStatus = null;
    if (withGhostery) {
      t = Date.now();
      ghosteryStatus = await waitForGhosteryReady(browser, port, browser.sessionId, label);
      if (ghosteryStatus?.fallback || ghosteryStatus?.timeout) {
        try {
          await browser.url(WARMUP_URL);
        } catch {}
      }
      mark('warmup', t);
    }

    let networkRequests = 0;
    let networkBytes = 0;
    let networkErrors = 0;

    try {
      await browser.sessionSubscribe({
        events: ['network.beforeRequestSent', 'network.responseCompleted', 'network.fetchError'],
      });
    } catch (e) {
      console.warn(`[${label}] BIDI network subscribe failed: ${e.message}`);
    }

    browser.on('network.beforeRequestSent', () => {
      networkRequests++;
    });
    browser.on('network.responseCompleted', (evt) => {
      const sz = evt?.response?.bodySize;
      if (typeof sz === 'number' && sz >= 0) networkBytes += sz;
    });
    browser.on('network.fetchError', () => {
      networkErrors++;
    });

    let navError = null;
    t = Date.now();
    const t0 = t;
    try {
      await Promise.race([
        browser.url(url),
        new Promise((_, rej) => setTimeout(() => rej(new Error('nav timeout')), NAV_TIMEOUT_MS)),
      ]);
    } catch (e) {
      navError = e.message;
    }
    mark('navigate', t);
    t = Date.now();
    await new Promise((r) => setTimeout(r, SETTLE_AFTER_LOAD_MS));
    mark('settle', t);
    const loadTimeMs = Date.now() - t0;

    t = Date.now();
    let pageData;
    let extractErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 500));
      try {
        const data = await extractPageDataViaCdp(port, browser.sessionId);
        const stale = data && data.innerText.length < 100 && data.scrollHeight <= VIEWPORT.height;
        if (!stale || attempt > 0) {
          pageData = data;
          extractErr = null;
          break;
        }
        console.warn(`[${label}] extract returned empty body (innerText=${data.innerText.length}, scrollHeight=${data.scrollHeight}), retrying`);
      } catch (e) {
        extractErr = e;
        console.warn(`[${label}] extract failed (${e.message})${attempt === 0 ? ', retrying' : ''}`);
      }
    }
    if (!pageData) throw extractErr ?? new Error('extract failed');
    const html = pageData.html;
    const innerText = pageData.innerText;
    mark('extract', t);

    t = Date.now();
    let a11yJson = '';
    try {
      await chromedriverCdp(port, browser.sessionId, 'Accessibility.enable', {});
      const res = await chromedriverCdp(port, browser.sessionId, 'Accessibility.getFullAXTree', {});
      const nodes = (res?.nodes ?? []).filter((n) => {
        const role = n.role?.value;
        return role && role !== 'none' && role !== 'presentation' && role !== 'InlineTextBox';
      });
      a11yJson = JSON.stringify(nodes);
    } catch (e) {
      a11yJson = JSON.stringify({ error: e.message });
    }
    mark('a11y', t);

    t = Date.now();
    let viewportShot;
    let fullShot = null;
    try {
      const vpResult = await chromedriverCdp(port, browser.sessionId, 'Page.captureScreenshot', { format: 'png' });
      viewportShot = Buffer.from(vpResult.data, 'base64');
      if (capturePages) {
        const fpResult = await chromedriverCdp(port, browser.sessionId, 'Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: true,
        });
        fullShot = Buffer.from(fpResult.data, 'base64');
      }
    } catch (e) {
      const vpb64 = await browser.takeScreenshot();
      viewportShot = Buffer.from(vpb64, 'base64');
    }

    const vpDim = pngDimensions(viewportShot);
    const fpDim = fullShot ? pngDimensions(fullShot) : { width: VIEWPORT.width, height: pageData.scrollHeight };
    mark('screenshots', t);

    writeFileSync(join(outDir, `${label}.viewport.png`), viewportShot);
    if (fullShot) writeFileSync(join(outDir, `${label}.full.png`), fullShot);
    writeFileSync(join(outDir, `${label}.html`), html);
    writeFileSync(join(outDir, `${label}.text.txt`), innerText);
    writeFileSync(join(outDir, `${label}.a11y.json`), a11yJson);

    t = Date.now();
    let autoconsent;
    try {
      autoconsent = await detectViaAutoconsent(chromedriverCdp, port, browser.sessionId);
    } catch (e) {
      autoconsent = { error: e.message, detected: false, cmp: null, lifecycle: 'error' };
    }
    mark('autoconsent', t);

    timings.total = Date.now() - tStart;
    return {
      url,
      label,
      withGhostery,
      ghosteryStatus,
      navError,
      loadTimeMs,
      timings,
      title: pageData.title,
      iframeCount: pageData.iframeCount,
      emptyIframes: pageData.emptyIframes,
      iframeSrcs: pageData.iframeSrcs,
      consentBannerDetected: pageData.consentBannerDetected,
      consentBannerCandidates: pageData.consentBannerCandidates,
      autoconsent,
      mostlyEmpty: pageData.mostlyEmpty,
      network: {
        requests: networkRequests,
        errors: networkErrors,
        bytes: networkBytes,
      },
      html: {
        bytes: Buffer.byteLength(html, 'utf8'),
        tokens: countTokens(html),
      },
      innerText: {
        bytes: Buffer.byteLength(innerText, 'utf8'),
        tokens: countTokens(innerText),
      },
      a11y: {
        bytes: Buffer.byteLength(a11yJson, 'utf8'),
        tokens: countTokens(a11yJson),
      },
      screenshot: {
        viewport: {
          width: vpDim.width,
          height: vpDim.height,
          bytes: viewportShot.byteLength,
          tokens: imageTokens(vpDim.width, vpDim.height),
        },
        fullPage: {
          width: fpDim.width,
          height: fpDim.height,
          bytes: fullShot ? fullShot.byteLength : null,
          tokens: imageTokens(fpDim.width, fpDim.height),
          captured: !!fullShot,
        },
      },
    };
  } finally {
    if (browser) {
      await Promise.race([
        browser.deleteSession().catch(() => {}),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    }
    cdProc.kill('SIGTERM');
    try {
      await new Promise((r) => setTimeout(r, 200));
      if (!cdProc.killed) cdProc.kill('SIGKILL');
    } catch {}
  }
}
