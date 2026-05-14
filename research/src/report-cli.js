import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderReport } from './report.js';

function loadConsentTax(runDir) {
  const p = join(runDir, 'consent-tax.json');
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function loadTrajectoryTax(runDir) {
  const p = join(runDir, 'trajectory-tax.json');
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function loadMeta(runDir) {
  const p = join(runDir, 'run-meta.json');
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function loadAdBurden(runDir) {
  const p = join(runDir, 'ad-burden.json');
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, '..', 'results');

const arg = process.argv[2];
let runDir;
if (arg) {
  runDir = join(RESULTS_ROOT, arg);
} else {
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => {
      try {
        return statSync(join(RESULTS_ROOT, d)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
  if (dirs.length === 0) {
    console.error('No runs found in', RESULTS_ROOT);
    process.exit(1);
  }
  runDir = join(RESULTS_ROOT, dirs[dirs.length - 1]);
}

const rows = JSON.parse(readFileSync(join(runDir, 'summary.json'), 'utf8'));
const consentTax = loadConsentTax(runDir);
const trajectoryTax = loadTrajectoryTax(runDir);
const adBurden = loadAdBurden(runDir);
const meta = loadMeta(runDir);
process.stdout.write(renderReport(rows, { runId: runDir.split('/').pop(), consentTax, trajectoryTax, adBurden, meta }));
