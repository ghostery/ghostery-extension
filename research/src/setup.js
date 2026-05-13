import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = join(__dirname, '..');
const REPO_ROOT = join(RESEARCH_ROOT, '..');

const ZIP = join(REPO_ROOT, 'web-ext-artifacts', 'ghostery-automation-chromium.zip');
const EXTRACT_DIR = join(RESEARCH_ROOT, '.ghostery-extension');

// Chromium derives the ID of an unpacked extension from SHA-256 of its
// absolute load path, taking the first 32 hex chars and translating
// '0'-'9','a'-'f' to 'a'-'p'. Reproduced here so the harness knows the
// chrome-extension:// URL of an extension it just --load-extension'd.
export function extensionIdForPath(absPath) {
  const hash = createHash('sha256').update(absPath).digest();
  let id = '';
  for (let i = 0; i < 16; i++) {
    const b = hash[i];
    id += String.fromCharCode('a'.charCodeAt(0) + (b >> 4));
    id += String.fromCharCode('a'.charCodeAt(0) + (b & 0xf));
  }
  return id;
}

// Resolve the directory we should hand to --load-extension. Priority:
// 1. explicit `dir` arg (from --ext-dir / `extDir` option)
// 2. GHOSTERY_EXT_DIR env var
// 3. ./.ghostery-extension extracted from the prebuilt zip (legacy default)
export function ensureExtensionExtracted({ force = false, dir } = {}) {
  const override = dir ?? process.env.GHOSTERY_EXT_DIR;
  if (override) {
    const abs = resolve(override);
    if (!existsSync(join(abs, 'manifest.json'))) {
      throw new Error(`extension dir has no manifest.json: ${abs}`);
    }
    return abs;
  }

  const manifest = join(EXTRACT_DIR, 'manifest.json');
  if (!force && existsSync(manifest)) return EXTRACT_DIR;

  if (!existsSync(ZIP)) {
    throw new Error(
      `Ghostery automation zip not found: ${ZIP}\n` +
        `Build it with: npm run build chromium && scripts/patch-automation.sh (from repo root)\n` +
        `Or point at a built dist with: --ext-dir <path> / GHOSTERY_EXT_DIR=<path>`,
    );
  }

  rmSync(EXTRACT_DIR, { recursive: true, force: true });
  mkdirSync(EXTRACT_DIR, { recursive: true });
  execSync(`unzip -q "${ZIP}" -d "${EXTRACT_DIR}"`);
  return EXTRACT_DIR;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = ensureExtensionExtracted({ force: !process.env.GHOSTERY_EXT_DIR });
  console.log(`Ghostery extension dir: ${dir}`);
  console.log(`Computed extension id:  ${extensionIdForPath(dir)}`);
}
