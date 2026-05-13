import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = join(__dirname, '..');
const REPO_ROOT = join(RESEARCH_ROOT, '..');

const ZIP = join(REPO_ROOT, 'web-ext-artifacts', 'ghostery-automation-chromium.zip');
const EXTRACT_DIR = join(RESEARCH_ROOT, '.ghostery-extension');

export function ensureExtensionExtracted({ force = false } = {}) {
  const manifest = join(EXTRACT_DIR, 'manifest.json');
  if (!force && existsSync(manifest)) return EXTRACT_DIR;

  if (!existsSync(ZIP)) {
    throw new Error(
      `Ghostery automation zip not found: ${ZIP}\n` +
        `Build it with: npm run build chromium-automation (from repo root)`,
    );
  }

  rmSync(EXTRACT_DIR, { recursive: true, force: true });
  mkdirSync(EXTRACT_DIR, { recursive: true });
  execSync(`unzip -q "${ZIP}" -d "${EXTRACT_DIR}"`);
  return EXTRACT_DIR;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = ensureExtensionExtracted({ force: true });
  console.log(`Extracted Ghostery extension to: ${dir}`);
}
