import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderReport, renderCsv } from './report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, '..', 'results');

const runId = process.argv[2];
if (!runId) {
  console.error('usage: node src/rebuild-summary.js <runId>');
  process.exit(1);
}
const runDir = join(RESULTS_ROOT, runId);
if (!existsSync(runDir)) {
  console.error(`No such run: ${runDir}`);
  process.exit(1);
}

const metaPath = join(runDir, 'run-meta.json');
const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : null;
const pageSetFile = meta?.pageSet || 'pages.json';
const pagesJson = JSON.parse(readFileSync(join(__dirname, '..', pageSetFile), 'utf8'));
const orderedIds = pagesJson.map((p) => p.id);

const rows = [];
for (const id of orderedIds) {
  const pageDir = join(runDir, id);
  if (!existsSync(pageDir)) continue;
  for (const variant of ['vanilla', 'ghostery']) {
    const metricsPath = join(pageDir, `${variant}.metrics.json`);
    if (!existsSync(metricsPath)) continue;
    const m = JSON.parse(readFileSync(metricsPath, 'utf8'));
    m.id = id;
    m.label = variant;
    m.withGhostery = variant === 'ghostery';
    const pageUrl = pagesJson.find((p) => p.id === id)?.url;
    if (pageUrl) m.url = pageUrl;
    rows.push(m);
  }
}

const consentTaxPath = join(runDir, 'consent-tax.json');
const consentTax = existsSync(consentTaxPath) ? JSON.parse(readFileSync(consentTaxPath, 'utf8')) : null;
const trajectoryTaxPath = join(runDir, 'trajectory-tax.json');
const trajectoryTax = existsSync(trajectoryTaxPath) ? JSON.parse(readFileSync(trajectoryTaxPath, 'utf8')) : null;
const adBurdenPath = join(runDir, 'ad-burden.json');
const adBurden = existsSync(adBurdenPath) ? JSON.parse(readFileSync(adBurdenPath, 'utf8')) : null;

writeFileSync(join(runDir, 'summary.json'), JSON.stringify(rows, null, 2));
writeFileSync(join(runDir, 'summary.csv'), renderCsv(rows));
writeFileSync(join(runDir, 'report.md'), renderReport(rows, { runId, consentTax, trajectoryTax, adBurden, meta }));
console.log(`Rebuilt ${rows.length / 2} pages × 2 variants in ${runDir}`);
