import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  cdp,
  captureScreenshot,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  V2_ROOT,
} from './browser.js';
import { detectConsentBanners } from './consent.js';
import { detectViaAutoconsent } from './autoconsent-oracle.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SETTLE_MS = 5000;

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

async function validateOne(url) {
  const port = randomPort();
  const cdProc = await startChromedriver(port);
  let browser;
  try {
    browser = await newSession({ port });
    const t0 = Date.now();
    try {
      await Promise.race([
        browser.url(url),
        new Promise((_, rej) => setTimeout(() => rej(new Error('nav timeout')), 30000)),
      ]);
    } catch (e) {
      return { url, error: `nav: ${e.message}` };
    }
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    const loadMs = Date.now() - t0;

    let pageData;
    try {
      const res = await cdp(port, browser.sessionId, 'Runtime.evaluate', {
        expression: pageExtractScript(),
        returnByValue: true,
        awaitPromise: false,
      });
      pageData = res?.result?.value;
    } catch (e) {
      return { url, error: `extract: ${e.message}` };
    }

    let autoconsent;
    try {
      autoconsent = await detectViaAutoconsent(cdp, port, browser.sessionId);
    } catch (e) {
      autoconsent = { error: e.message, detected: false };
    }

    const shotB64 = await captureScreenshot(port, browser.sessionId);
    return {
      url,
      loadMs,
      title: pageData?.title,
      innerTextLen: pageData?.innerTextLen,
      scrollHeight: pageData?.scrollHeight,
      visibilityDetected: pageData?.consent?.detected ?? false,
      visibilityCandidates: pageData?.consent?.candidates ?? [],
      autoconsent: {
        detected: autoconsent?.detected ?? false,
        cmp: autoconsent?.cmp ?? null,
        lifecycle: autoconsent?.lifecycle ?? null,
      },
      shotB64,
    };
  } finally {
    if (browser) {
      await Promise.race([
        browser.deleteSession().catch(() => {}),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    }
    await killChromedriver(cdProc);
  }
}

async function main() {
  const pagesPath = join(V2_ROOT, 'pages-us.json');
  const spec = JSON.parse(readFileSync(pagesPath, 'utf8'));
  const candidates = spec.candidates ?? [];

  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(V2_ROOT, 'results', runId, 'validation');
  mkdirSync(outDir, { recursive: true });

  const results = [];
  console.log(`Validating ${candidates.length} candidate pages from current IP. Each load takes ~10s.`);
  console.log('');
  for (const c of candidates) {
    process.stdout.write(`  ${c.id.padEnd(16)} ${c.url} `);
    const r = await validateOne(c.url);
    if (r.error) {
      console.log(`ERROR: ${r.error}`);
      results.push({ id: c.id, cmp: c.cmp, url: c.url, error: r.error });
      continue;
    }
    const bannerSignals = [
      r.visibilityDetected ? 'V' : '-',
      r.autoconsent.detected ? 'A' : '-',
    ].join('');
    const flag = r.visibilityDetected || r.autoconsent.detected ? 'BANNER' : 'no-banner';
    console.log(
      `[${bannerSignals}] ${flag} title="${(r.title || '').slice(0, 40)}" textLen=${r.innerTextLen} cmp=${r.autoconsent.cmp ?? '?'} lifecycle=${r.autoconsent.lifecycle ?? '?'}`,
    );
    writeFileSync(join(outDir, `${c.id}.png`), Buffer.from(r.shotB64, 'base64'));
    results.push({
      id: c.id,
      cmp: c.cmp,
      cmpDetected: r.autoconsent.cmp,
      url: c.url,
      title: r.title,
      innerTextLen: r.innerTextLen,
      scrollHeight: r.scrollHeight,
      loadMs: r.loadMs,
      bannerByVisibility: r.visibilityDetected,
      bannerByAutoconsent: r.autoconsent.detected,
      lifecycle: r.autoconsent.lifecycle,
      visibilityCandidates: r.visibilityCandidates.map((v) => ({
        tag: v.tag, areaPct: v.areaPct, matchedBy: v.matchedBy, textSample: v.textSample.slice(0, 100),
      })),
    });
  }

  const summary = {
    runId,
    timestamp: new Date().toISOString(),
    results,
    recommended: results
      .filter((r) => !r.error && (r.bannerByVisibility || r.bannerByAutoconsent))
      .map((r) => r.id),
    failed: results.filter((r) => r.error).map((r) => ({ id: r.id, error: r.error })),
    noBanner: results
      .filter((r) => !r.error && !r.bannerByVisibility && !r.bannerByAutoconsent)
      .map((r) => r.id),
  };
  const outPath = join(V2_ROOT, 'results', runId, 'validation.json');
  writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log('');
  console.log(`Recommended for measurement (${summary.recommended.length}): ${summary.recommended.join(', ')}`);
  console.log(`Failed / no banner: ${[...summary.failed.map((f) => f.id), ...summary.noBanner].join(', ') || 'none'}`);
  console.log(`Wrote ${outPath}`);
}

process.on('unhandledRejection', (e) => console.warn(`[unhandled] ${e?.message || e}`));
main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
