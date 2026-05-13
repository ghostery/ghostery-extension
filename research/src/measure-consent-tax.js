import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, '..', 'results');

for (const envPath of [join(__dirname, '..', '.env'), join(__dirname, '..', '..', '.env')]) {
  try {
    process.loadEnvFile(envPath);
    break;
  } catch {
    /* file missing or unreadable — try next */
  }
}

const SYSTEM_PROMPT = `You are an autonomous web-browsing agent. Your goal is to read articles on web pages and report their first paragraph back to the user. You see a viewport screenshot plus the page's visible text. If the content is hidden by a consent / cookie / privacy banner, you must dismiss it first. On every turn you reply with one of:
  read_more() - request more visible text
  click("<button label>") - click a button identified by its visible label
  scroll_down() - scroll the page
  finished("<first paragraph>") - you have the article body
Never reply with prose. Only the actions above.`;

const USER_INSTRUCTION = `Page state attached as a screenshot and as visible-text below. Decide your next action.\n\nVisible text:\n\`\`\`\n`;
const TEXT_BUDGET = 8000;
const USER_INSTRUCTION_SUFFIX = `\n\`\`\`\n\nNext action:`;

function findLatestRun() {
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => {
      try {
        return statSync(join(RESULTS_ROOT, d)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
  if (dirs.length === 0) throw new Error('No runs in ' + RESULTS_ROOT);
  return join(RESULTS_ROOT, dirs[dirs.length - 1]);
}

function loadSdkOrDie() {
  return import('@anthropic-ai/sdk').catch(() => {
    throw new Error('Install the Anthropic SDK first:\n  cd research && npm install @anthropic-ai/sdk');
  });
}

function pickSampleArtifacts(pageDir, variant) {
  const all = readdirSync(pageDir);
  const exactPng = all.includes(`${variant}.viewport.png`);
  if (exactPng) {
    return {
      pngPath: join(pageDir, `${variant}.viewport.png`),
      textPath: join(pageDir, `${variant}.text.txt`),
    };
  }
  const sampleIdx = all
    .filter((f) => f.startsWith(`${variant}.s`) && f.endsWith('.viewport.png'))
    .map((f) => parseInt(f.match(new RegExp(`^${variant}\\.s(\\d+)\\.viewport\\.png$`))?.[1] || '0', 10))
    .sort((a, b) => a - b)[0];
  if (!sampleIdx) return null;
  return {
    pngPath: join(pageDir, `${variant}.s${sampleIdx}.viewport.png`),
    textPath: join(pageDir, `${variant}.s${sampleIdx}.text.txt`),
  };
}

async function countTokensForCell(client, model, pngPath, text) {
  const png = readFileSync(pngPath).toString('base64');
  const trimmedText = (text || '').slice(0, TEXT_BUDGET);
  const userContent = [
    { type: 'image', source: { type: 'base64', media_type: 'image/png', data: png } },
    { type: 'text', text: USER_INSTRUCTION + trimmedText + USER_INSTRUCTION_SUFFIX },
  ];
  const res = await client.messages.countTokens({
    model,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });
  return res.input_tokens;
}

async function main() {
  const argRun = process.argv[2];
  const argModel = process.argv[3] || 'claude-sonnet-4-6';
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. Get a key from https://console.anthropic.com/ and re-run.');
    process.exit(2);
  }
  const runDir = argRun ? (argRun.startsWith('/') ? argRun : join(RESULTS_ROOT, argRun)) : findLatestRun();
  console.log('Run:    ', runDir);
  console.log('Model:  ', argModel);

  const { default: Anthropic } = await loadSdkOrDie();
  const client = new Anthropic();

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
    const vanilla = pickSampleArtifacts(pageDir, 'vanilla');
    const ghostery = pickSampleArtifacts(pageDir, 'ghostery');
    if (!vanilla || !ghostery) {
      console.log(`  ${page}: skipped (missing artifacts)`);
      continue;
    }
    const vText = (() => { try { return readFileSync(vanilla.textPath, 'utf8'); } catch { return ''; } })();
    const gText = (() => { try { return readFileSync(ghostery.textPath, 'utf8'); } catch { return ''; } })();
    try {
      const vTok = await countTokensForCell(client, argModel, vanilla.pngPath, vText);
      const gTok = await countTokensForCell(client, argModel, ghostery.pngPath, gText);
      const delta = vTok - gTok;
      console.log(`  ${page.padEnd(14)} vanilla=${String(vTok).padStart(6)} ghostery=${String(gTok).padStart(6)} delta=${String(delta).padStart(6)}`);
      rows.push({ page, vanillaInputTokens: vTok, ghosteryInputTokens: gTok, deltaTokens: delta });
    } catch (e) {
      console.warn(`  ${page}: ${e.message}`);
      rows.push({ page, error: e.message });
    }
  }

  const totalsV = rows.filter((r) => !r.error).reduce((a, r) => a + r.vanillaInputTokens, 0);
  const totalsG = rows.filter((r) => !r.error).reduce((a, r) => a + r.ghosteryInputTokens, 0);
  console.log('');
  console.log(`Totals (one-turn input):  vanilla=${totalsV}  ghostery=${totalsG}  delta=${totalsV - totalsG}`);

  const out = { runDir, model: argModel, perPage: rows, totalsVanilla: totalsV, totalsGhostery: totalsG };
  const outPath = join(runDir, 'consent-tax.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote', outPath);
}

main().catch((e) => {
  console.error(e?.stack || e);
  process.exit(1);
});
