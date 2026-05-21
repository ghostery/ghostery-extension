import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  cdp,
  captureScreenshot,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  V2_ROOT as _,
  waitForGhosteryReady,
} from '../../research-v2/src/browser.js';
import { detectViaAutoconsent } from '../../research-v2/src/autoconsent-oracle.js';
import { detectConsentBanners } from '../../research-v2/src/consent.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V3_ROOT = join(__dirname, '..');

const SETTLE_MS = Number(process.env.SETTLE_MS) || 5000;

function pageExtractScript() {
  return `(() => {
    const detectConsentBanners = ${detectConsentBanners.toString()};
    return (${(() => {
      const text = document.body ? document.body.innerText : '';
      const consent = detectConsentBanners();
      return {
        title: document.title,
        innerTextLen: text.length,
        scrollHeight: document.documentElement.scrollHeight,
        consent,
      };
    }).toString()})();
  })()`;
}

async function loadAndCapture({ url, withGhostery, savePath, headless }) {
  const port = randomPort();
  const cdProc = await startChromedriver(port);
  let browser;
  try {
    browser = await newSession({ port, withGhostery, headless: headless !== false });
    if (withGhostery) await waitForGhosteryReady(browser, port);
    await Promise.race([
      browser.url(url),
      new Promise((_, rej) => setTimeout(() => rej(new Error('nav timeout')), 30_000)),
    ]);
    await new Promise((r) => setTimeout(r, SETTLE_MS));

    let pageData = null;
    try {
      const res = await cdp(port, browser.sessionId, 'Runtime.evaluate', {
        expression: pageExtractScript(),
        returnByValue: true,
      });
      pageData = res?.result?.value;
    } catch { /* ignore */ }

    let autoconsent = null;
    try {
      autoconsent = await detectViaAutoconsent(cdp, port, browser.sessionId);
    } catch (e) {
      autoconsent = { error: e.message };
    }

    const shotB64 = await captureScreenshot(port, browser.sessionId);
    writeFileSync(savePath, Buffer.from(shotB64, 'base64'));

    return {
      title: pageData?.title,
      innerTextLen: pageData?.innerTextLen,
      visibility: pageData?.consent?.detected,
      visibilityCandidates: pageData?.consent?.candidates,
      autoconsent,
    };
  } finally {
    if (browser) await browser.deleteSession().catch(() => {});
    await killChromedriver(cdProc);
  }
}

async function validate(candidates) {
  const validateDir = join(V3_ROOT, 'screenshots', '_validation');
  mkdirSync(validateDir, { recursive: true });

  console.log(`Validating ${candidates.length} candidates (vanilla only, 1 trial each).`);
  console.log('');

  const results = [];
  for (const c of candidates) {
    process.stdout.write(`  ${c.id.padEnd(16)} `);
    const t0 = Date.now();
    try {
      const r = await loadAndCapture({
        url: c.url,
        withGhostery: false,
        savePath: join(validateDir, `${c.id}.png`),
      });
      const dur = ((Date.now() - t0) / 1000).toFixed(1);
      const sig = [r.visibility ? 'V' : '-', r.autoconsent?.detected ? 'A' : '-'].join('');
      const banner = r.visibility || r.autoconsent?.detected ? 'BANNER' : 'no-banner';
      console.log(`[${sig}] ${banner} title="${(r.title || '').slice(0, 35)}" textLen=${r.innerTextLen ?? '?'} cmp=${r.autoconsent?.cmp ?? '?'} (${dur}s)`);
      results.push({ id: c.id, url: c.url, ...r });
    } catch (e) {
      console.log(`ERROR ${e.message}`);
      results.push({ id: c.id, url: c.url, error: e.message });
    }
  }
  writeFileSync(join(validateDir, 'validation.json'), JSON.stringify(results, null, 2));
  console.log('');
  console.log(`Screenshots saved to ${validateDir}. Open and pick the strongest viewport-dominating modal.`);
}

async function capture(pageId, trials = Number(process.env.TRIALS) || 3) {
  const pagesSpec = JSON.parse(readFileSync(join(V3_ROOT, 'pages-us.json'), 'utf8'));
  const candidates = pagesSpec.pages.concat(pagesSpec.candidates || []);
  const page = candidates.find((p) => p.id === pageId);
  if (!page) {
    console.error(`Page id "${pageId}" not found in pages-us.json`);
    process.exit(1);
  }
  const outDir = join(V3_ROOT, 'screenshots', pageId);
  mkdirSync(outDir, { recursive: true });
  const headed = process.env.HEADED === '1' || process.env.HEADED === 'true';
  console.log(`Capturing ${pageId} (${page.url}) into ${outDir} ${headed ? '[HEADED]' : '[headless]'}`);
  console.log('');
  for (const withGhostery of [false, true]) {
    const variant = withGhostery ? 'ghostery' : 'vanilla';
    for (let t = 1; t <= trials; t++) {
      const fileName = `${variant}.t${t}.initial.png`;
      const savePath = join(outDir, fileName);
      process.stdout.write(`  ${variant.padEnd(9)} t${t}/${trials} `);
      const t0 = Date.now();
      try {
        const r = await loadAndCapture({ url: page.url, withGhostery, savePath, headless: !headed });
        const dur = ((Date.now() - t0) / 1000).toFixed(1);
        const sig = [r.visibility ? 'V' : '-', r.autoconsent?.detected ? 'A' : '-'].join('');
        console.log(`[${sig}] cmp=${r.autoconsent?.cmp ?? '?'} ${fileName} (${dur}s)`);
      } catch (e) {
        console.log(`ERROR ${e.message}`);
      }
    }
  }
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'validate') {
    const pagesSpec = JSON.parse(readFileSync(join(V3_ROOT, 'pages-us.json'), 'utf8'));
    const candidates = pagesSpec.candidates || [];
    if (!candidates.length) {
      console.error('No "candidates" array in pages-us.json');
      process.exit(1);
    }
    await validate(candidates);
  } else if (cmd === 'capture') {
    const pageId = process.argv[3];
    if (!pageId) {
      console.error('Usage: node src/capture.js capture <page-id>');
      process.exit(1);
    }
    await capture(pageId);
  } else {
    console.error('Usage:');
    console.error('  node src/capture.js validate         # validate candidates from pages-us.json');
    console.error('  node src/capture.js capture <id>     # capture 3 trials per variant for one page');
    process.exit(1);
  }
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
