import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderReport } from './report.js';

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
process.stdout.write(renderReport(rows, { runId: runDir.split('/').pop() }));
