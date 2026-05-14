import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { filterAxNodes } from './filter-ax.js';
import { countTokens } from './tokenize.js';
import { renderReport, renderCsv } from './report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, '..', 'results');

function pickLatest() {
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => {
      try {
        return statSync(join(RESULTS_ROOT, d)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
  if (!dirs.length) throw new Error('no runs');
  return dirs[dirs.length - 1];
}

function listSampleSuffixes(pageDir, variant) {
  const all = readdirSync(pageDir);
  if (all.includes(`${variant}.a11y.json`)) return [''];
  const idx = [];
  for (const f of all) {
    const m = f.match(new RegExp(`^${variant}\\.s(\\d+)\\.a11y\\.json$`));
    if (m) idx.push(parseInt(m[1], 10));
  }
  idx.sort((a, b) => a - b);
  return idx.map((i) => `.s${i}`);
}

function processVariant(pageDir, variant) {
  const suffixes = listSampleSuffixes(pageDir, variant);
  const tokens = [];
  const bytes = [];
  for (const suf of suffixes) {
    const inPath = join(pageDir, `${variant}${suf}.a11y.json`);
    const outPath = join(pageDir, `${variant}${suf}.a11y-filtered.json`);
    if (!existsSync(inPath)) continue;
    const raw = readFileSync(inPath, 'utf8');
    let nodes;
    try {
      nodes = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!Array.isArray(nodes)) continue;
    const filteredJson = JSON.stringify(filterAxNodes(nodes));
    writeFileSync(outPath, filteredJson);
    tokens.push(countTokens(filteredJson));
    bytes.push(Buffer.byteLength(filteredJson, 'utf8'));
  }
  if (!tokens.length) return null;
  const sortedT = [...tokens].sort((a, b) => a - b);
  const sortedB = [...bytes].sort((a, b) => a - b);
  const med = (s) => (s.length % 2 ? s[(s.length - 1) >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2);
  return {
    median: { tokens: med(sortedT), bytes: med(sortedB) },
    samples: { tokens, bytes },
  };
}

function updateMetricsFile(pageDir, variant, result) {
  const metricsPath = join(pageDir, `${variant}.metrics.json`);
  if (!existsSync(metricsPath)) return;
  const metrics = JSON.parse(readFileSync(metricsPath, 'utf8'));
  metrics.a11yFiltered = result.median;
  if (Array.isArray(metrics.samples)) {
    for (let i = 0; i < metrics.samples.length && i < result.samples.tokens.length; i++) {
      const s = metrics.samples[i];
      if (!s) continue;
      s.a11yFiltered = {
        tokens: result.samples.tokens[i],
        bytes: result.samples.bytes[i],
      };
    }
  }
  if (metrics.stats && typeof metrics.stats === 'object') {
    const t = [...result.samples.tokens].sort((a, b) => a - b);
    const b = [...result.samples.bytes].sort((a, b) => a - b);
    const q = (s, p) => {
      if (!s.length) return null;
      const pos = p * (s.length - 1);
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (pos - lo);
    };
    metrics.stats['a11yFiltered.tokens'] = {
      median: q(t, 0.5), p25: q(t, 0.25), p75: q(t, 0.75),
      min: t[0], max: t[t.length - 1], samples: result.samples.tokens,
    };
    metrics.stats['a11yFiltered.bytes'] = {
      median: q(b, 0.5), p25: q(b, 0.25), p75: q(b, 0.75),
      min: b[0], max: b[b.length - 1], samples: result.samples.bytes,
    };
  }
  writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  return metrics;
}

const runId = process.argv[2] || pickLatest();
const runDir = join(RESULTS_ROOT, runId);
console.log('Run:', runDir);

const pages = readdirSync(runDir).filter((d) => {
  try {
    return statSync(join(runDir, d)).isDirectory();
  } catch {
    return false;
  }
});

const rows = [];
for (const page of pages) {
  const pageDir = join(runDir, page);
  for (const variant of ['vanilla', 'ghostery']) {
    const res = processVariant(pageDir, variant);
    if (!res) continue;
    const metrics = updateMetricsFile(pageDir, variant, res);
    console.log(
      `  ${page.padEnd(14)} ${variant.padEnd(9)} a11yFiltered=${res.median.tokens.toString().padStart(6)} t (was a11y=${(metrics?.a11y?.tokens ?? 0).toString().padStart(7)} t)`,
    );
    if (metrics) {
      metrics.id = page;
      metrics.label = variant;
      metrics.withGhostery = variant === 'ghostery';
      rows.push(metrics);
    }
  }
}

const consentTaxPath = join(runDir, 'consent-tax.json');
const consentTax = existsSync(consentTaxPath)
  ? JSON.parse(readFileSync(consentTaxPath, 'utf8'))
  : null;

const trajectoryTaxPath = join(runDir, 'trajectory-tax.json');
const trajectoryTax = existsSync(trajectoryTaxPath)
  ? JSON.parse(readFileSync(trajectoryTaxPath, 'utf8'))
  : null;

writeFileSync(join(runDir, 'summary.json'), JSON.stringify(rows, null, 2));
writeFileSync(join(runDir, 'summary.csv'), renderCsv(rows));
writeFileSync(join(runDir, 'report.md'), renderReport(rows, { runId, consentTax, trajectoryTax }));
console.log('');
console.log('Re-wrote', join(runDir, 'summary.json'));
console.log('Re-wrote', join(runDir, 'summary.csv'));
console.log('Re-wrote', join(runDir, 'report.md'));
