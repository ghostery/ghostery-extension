import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { measure } from './measure.js';
import { renderReport, renderCsv } from './report.js';

process.on('unhandledRejection', (reason) => {
  console.warn(`[unhandled rejection] ${reason?.message || reason}`);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = join(__dirname, '..');
const RESULTS_ROOT = join(RESEARCH_ROOT, 'results');

function parseArgs(argv) {
  const out = { pages: null, headless: true, debug: false, capturePages: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pages') out.pages = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--headed') out.headless = false;
    else if (a === '--debug') out.debug = true;
    else if (a === '--fullpage') out.capturePages = true;
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node src/run.js [--pages id1,id2] [--headed] [--debug] [--fullpage]\n' +
          '  --pages     restrict to these page ids from pages.json\n' +
          '  --headed    run with visible browser window\n' +
          '  --debug     write chromedriver + wdio debug logs to results/<run>/<page>/\n' +
          '  --fullpage  also capture the full-page screenshot (slow: ~25s per run)\n',
      );
      process.exit(0);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const pages = JSON.parse(readFileSync(join(RESEARCH_ROOT, 'pages.json'), 'utf8'));
const selected = args.pages ? pages.filter((p) => args.pages.includes(p.id)) : pages;
if (selected.length === 0) {
  console.error('No pages selected. Available ids:', pages.map((p) => p.id).join(', '));
  process.exit(1);
}

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = join(RESULTS_ROOT, runId);
mkdirSync(runDir, { recursive: true });

console.log(`Run: ${runId}`);
console.log(`Pages: ${selected.map((p) => p.id).join(', ')}`);
console.log(`Headless: ${args.headless}`);
console.log(`Output: ${runDir}\n`);

const rows = [];

for (const p of selected) {
  const dir = join(runDir, p.id);
  mkdirSync(dir, { recursive: true });
  console.log(`=== ${p.id}  ${p.url}`);

  for (const withGhostery of [false, true]) {
    const label = withGhostery ? 'ghostery' : 'vanilla';
    const t0 = Date.now();
    try {
      const r = await measure(p.url, {
        withGhostery,
        outDir: dir,
        label,
        headless: args.headless,
        debug: args.debug,
        capturePages: args.capturePages,
      });
      r.id = p.id;
      rows.push(r);
      writeFileSync(join(dir, `${label}.metrics.json`), JSON.stringify(r, null, 2));
      const dt = ((Date.now() - t0) / 1000).toFixed(1);
      const tg = r.timings || {};
      const phase = Object.entries(tg)
        .filter(([k]) => k !== 'total')
        .map(([k, v]) => `${k}:${(v / 1000).toFixed(1)}`)
        .join(' ');
      console.log(
        `  ${label.padEnd(8)} ` +
          `html ${r.html.tokens.toString().padStart(7)}t  ` +
          `text ${(r.innerText?.tokens ?? 0).toString().padStart(6)}t  ` +
          `a11y ${r.a11y.tokens.toString().padStart(6)}t  ` +
          `fp ${r.screenshot.fullPage.tokens.toString().padStart(4)}t  ` +
          `iframes ${(r.iframeCount ?? 0).toString().padStart(3)}  ` +
          `net ${(r.network.bytes / 1024 / 1024).toFixed(1)}MB  ` +
          `(${dt}s) [${phase}]`,
      );
    } catch (e) {
      const r = { id: p.id, url: p.url, label, withGhostery, error: e.message };
      rows.push(r);
      writeFileSync(join(dir, `${label}.metrics.json`), JSON.stringify(r, null, 2));
      console.error(`  ${label} FAILED: ${e.message}`);
    }
  }
  console.log();
}

const summaryPath = join(runDir, 'summary.json');
const csvPath = join(runDir, 'summary.csv');
const reportPath = join(runDir, 'report.md');

writeFileSync(summaryPath, JSON.stringify(rows, null, 2));
writeFileSync(csvPath, renderCsv(rows));
writeFileSync(reportPath, renderReport(rows, { runId }));

console.log(`Wrote ${summaryPath}`);
console.log(`Wrote ${csvPath}`);
console.log(`Wrote ${reportPath}`);
