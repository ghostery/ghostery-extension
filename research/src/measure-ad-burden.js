import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, '..', 'results');

for (const envPath of [join(__dirname, '..', '.env'), join(__dirname, '..', '..', '.env')]) {
  try { process.loadEnvFile(envPath); break; } catch { /* try next */ }
}

const SYSTEM_PROMPT =
  'You are a vision agent inspecting a website screenshot. Your job is to inventory what is visible on the page so a downstream content-extraction agent can decide what to keep.';

const USER_PROMPT =
  'Look at this viewport screenshot (1280×800) and inventory what is visible. ' +
  'Output ONLY a JSON object (no prose, no markdown fences) with exactly these keys:\n' +
  '  "articles": an array of strings — every article headline / recipe title / body paragraph you can read. One entry per distinct article-like content item.\n' +
  '  "ads": an array of strings — every advertisement you can see (banner ads, sponsored cards, promotional tiles, etc.). One entry per distinct ad. Include the brand or short description.\n' +
  '  "navigation": an array of strings — every nav / menu / category link you can see.\n' +
  '  "other": an array of strings — anything else visible (cookie banners, login prompts, footers, search bars).\n' +
  'Be thorough — list every distinct element you can identify. Use short labels.';

function pickLatestRun() {
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => {
      try { return statSync(join(RESULTS_ROOT, d)).isDirectory(); } catch { return false; }
    })
    .sort();
  if (!dirs.length) throw new Error('no runs');
  return dirs[dirs.length - 1];
}

function pickScreenshot(pageDir, variant) {
  const all = readdirSync(pageDir);
  if (all.includes(`${variant}.viewport.png`)) return join(pageDir, `${variant}.viewport.png`);
  const idx = all
    .filter((f) => f.startsWith(`${variant}.s`) && f.endsWith('.viewport.png'))
    .map((f) => parseInt(f.match(new RegExp(`^${variant}\\.s(\\d+)\\.viewport\\.png$`))?.[1] || '0', 10))
    .sort((a, b) => a - b)[0];
  return idx ? join(pageDir, `${variant}.s${idx}.viewport.png`) : null;
}

function parseJsonish(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function parseArgs(argv) {
  const out = { runId: null, pages: null, model: 'claude-sonnet-4-5-20250929' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run') out.runId = argv[++i];
    else if (a === '--pages') out.pages = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--model') out.model = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node src/measure-ad-burden.js [--run RUN_ID] [--pages cnn,onet] [--model claude-sonnet-4-5-20250929]\n\n' +
          '  --run     run id under results/ (default: latest)\n' +
          '  --pages   comma-separated subset (default: all banner pages from this run)\n' +
          '  --model   Anthropic model (default sonnet-4.5)\n',
      );
      process.exit(0);
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runId = args.runId || pickLatestRun();
  const runDir = join(RESULTS_ROOT, runId);
  if (!existsSync(runDir)) {
    console.error(`No such run: ${runDir}`);
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(2);
  }

  const allPages = readdirSync(runDir).filter((d) => {
    try { return statSync(join(runDir, d)).isDirectory() && d !== 'trajectory'; } catch { return false; }
  });
  let selected = args.pages ?? allPages.filter((id) => {
    try {
      const m = JSON.parse(readFileSync(join(runDir, id, 'vanilla.metrics.json'), 'utf8'));
      return m.consentBannerDetected === true;
    } catch { return false; }
  });
  selected = selected.filter((id) => allPages.includes(id));
  if (!selected.length) {
    console.error('No pages selected.');
    process.exit(1);
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  console.log(`Run:    ${runDir}`);
  console.log(`Pages:  ${selected.join(', ')}`);
  console.log(`Model:  ${args.model}\n`);

  const rows = [];
  for (const id of selected) {
    const pageDir = join(runDir, id);
    for (const variant of ['vanilla', 'ghostery']) {
      const pngPath = pickScreenshot(pageDir, variant);
      if (!pngPath) { console.log(`  ${id} ${variant}: no screenshot`); continue; }
      const png = readFileSync(pngPath).toString('base64');
      const t0 = Date.now();
      const resp = await client.messages.create({
        model: args.model,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: png } },
          { type: 'text', text: USER_PROMPT },
        ] }],
      });
      const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      const parsed = parseJsonish(text);
      const counts = parsed ? {
        articles: (parsed.articles || []).length,
        ads: (parsed.ads || []).length,
        navigation: (parsed.navigation || []).length,
        other: (parsed.other || []).length,
      } : null;
      const row = {
        page: id,
        variant,
        screenshot: pngPath.split('/').slice(-2).join('/'),
        usage: resp.usage,
        durationMs: Date.now() - t0,
        counts,
        parsed,
        rawText: parsed ? null : text.slice(0, 600),
      };
      rows.push(row);
      const c = counts ?? { articles: 'NA', ads: 'NA', navigation: 'NA', other: 'NA' };
      console.log(
        `  ${id.padEnd(14)} ${variant.padEnd(9)} ` +
        `in=${resp.usage.input_tokens} out=${resp.usage.output_tokens}  ` +
        `articles=${String(c.articles).padStart(2)}  ads=${String(c.ads).padStart(2)}  nav=${String(c.navigation).padStart(2)}  other=${String(c.other).padStart(2)}  ` +
        `(${(row.durationMs / 1000).toFixed(1)}s)`,
      );
    }
  }

  const out = { runDir, model: args.model, rows };
  const outPath = join(runDir, 'ad-burden.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
