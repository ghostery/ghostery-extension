import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V3_ROOT = join(__dirname, '..');
const REPO_ROOT = join(V3_ROOT, '..');
const V2_ROOT = join(REPO_ROOT, 'research-v2');

for (const envPath of [join(REPO_ROOT, '.env'), join(V3_ROOT, '.env')]) {
  try { process.loadEnvFile(envPath); break; } catch { /* try next */ }
}

const SYSTEM_PROMPT =
  'You are an inventory assistant looking at a webpage screenshot. ' +
  'Identify every visible element and categorize each. ' +
  'Output a single JSON object with these keys: ' +
  '"articles" — an array of plain string headlines (each entry is one headline string, not an object). ' +
  '"navigation" — an array of plain string nav link labels. ' +
  '"other" — an array of plain strings for cookie banners, modals, buttons, etc. ' +
  'CRITICAL: every string MUST be valid JSON. Escape any " inside a string as \\". Do not output objects, only plain strings. Do not include trailing commas. ' +
  'Be exhaustive within the visible viewport. ' +
  'Output ONLY the JSON object. No commentary, no code fences.';

const USER_PROMPT = 'Inventory this webpage screenshot.';

const TRIALS_PER_CELL = Number(process.env.TRIALS) || 10;
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 2048;

function findLatestV2Run() {
  const resultsDir = join(V2_ROOT, 'results');
  if (!existsSync(resultsDir)) return null;
  const dirs = readdirSync(resultsDir)
    .filter((d) => existsSync(join(resultsDir, d, 'trajectory')))
    .sort();
  return dirs.length ? join(resultsDir, dirs[dirs.length - 1]) : null;
}

function parseInventory(rawText) {
  let text = (rawText || '').trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) text = fenceMatch[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return { parsed: false, reason: 'no JSON object delimiters' };
  }
  const candidate = text.slice(firstBrace, lastBrace + 1);
  try {
    return { parsed: true, obj: JSON.parse(candidate) };
  } catch (e) {
    return { parsed: false, reason: e.message };
  }
}

async function inventoryOne(client, imagePath) {
  const imageBuf = readFileSync(imagePath);
  const imageB64 = imageBuf.toString('base64');
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageB64 } },
        { type: 'text', text: USER_PROMPT },
      ],
    }],
  });
  const rawText = resp.content.find((b) => b.type === 'text')?.text || '';
  const { parsed, obj, reason } = parseInventory(rawText);
  const articles = parsed && Array.isArray(obj?.articles) ? obj.articles : null;
  return {
    inputTokens: resp.usage?.input_tokens ?? 0,
    outputTokens: resp.usage?.output_tokens ?? 0,
    stopReason: resp.stop_reason,
    rawText,
    parsed,
    parseError: parsed ? null : reason,
    inventory: parsed ? obj : null,
    articles,
    articlesCount: articles?.length ?? 0,
    adsCount: parsed && Array.isArray(obj?.ads) ? obj.ads.length : 0,
    navigationCount: parsed && Array.isArray(obj?.navigation) ? obj.navigation.length : 0,
    otherCount: parsed && Array.isArray(obj?.other) ? obj.other.length : 0,
  };
}

function classify(r) {
  if (r.error) return 'error';
  if (r.stopReason === 'max_tokens') return 'truncated';
  if (!r.parsed) return 'parse_fail';
  if (r.articlesCount === 0) return 'zero_articles';
  return 'ok';
}

function screenshotPathFor(page, v2Run, variant, trial) {
  const source = page.screenshotSource || 'v2';
  if (source === 'v3') {
    return join(V3_ROOT, 'screenshots', page.id, `${variant}.t${trial}.initial.png`);
  }
  return join(v2Run, 'trajectory', page.id, `${variant}.t${trial}.initial.png`);
}

async function main() {
  const v2Run = findLatestV2Run();
  if (!v2Run) {
    console.error('No v2 run found at', join(V2_ROOT, 'results'));
    process.exit(1);
  }
  console.log(`v2 trajectory source: ${v2Run}`);
  console.log(`v3 screenshots source: ${join(V3_ROOT, 'screenshots')}`);

  const pagesSpec = JSON.parse(readFileSync(join(V3_ROOT, 'pages-us.json'), 'utf8'));
  const pages = pagesSpec.pages;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(2);
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = join(V3_ROOT, 'results', runId);
  mkdirSync(runDir, { recursive: true });

  console.log(`Run:    ${runId}`);
  console.log(`Pages:  ${pages.map((p) => p.id).join(', ')}`);
  console.log(`Trials: ${TRIALS_PER_CELL} per (page, variant)`);
  console.log(`Model:  ${MODEL}`);
  console.log('');

  const results = [];
  for (const p of pages) {
    for (const variant of ['vanilla', 'ghostery']) {
      for (let t = 1; t <= TRIALS_PER_CELL; t++) {
        const screenshotPath = screenshotPathFor(p, v2Run, variant, t);
        if (!existsSync(screenshotPath)) {
          console.log(`  ${p.id} ${variant} t${t}: screenshot not found at ${screenshotPath}`);
          continue;
        }
        process.stdout.write(`  ${p.id.padEnd(14)} ${variant.padEnd(9)} t${t}/${TRIALS_PER_CELL} `);
        const t0 = Date.now();
        let r;
        try {
          r = await inventoryOne(client, screenshotPath);
        } catch (e) {
          r = { error: e.message };
        }
        const dur = ((Date.now() - t0) / 1000).toFixed(1);
        const klass = classify(r);
        if (r.error) {
          console.log(`ERROR ${r.error}`);
        } else {
          console.log(`stop=${r.stopReason} out=${r.outputTokens} art=${r.articlesCount} ads=${r.adsCount} [${klass}] (${dur}s)`);
        }
        const record = {
          page: p.id, variant, trial: t,
          screenshotPath: screenshotPath.replace(REPO_ROOT, '.'),
          model: MODEL,
          durationMs: Date.now() - t0,
          classification: klass,
          ...r,
        };
        results.push(record);
        writeFileSync(join(runDir, 'inventory.json'), JSON.stringify({ runId, model: MODEL, trials: TRIALS_PER_CELL, v2Run, results }, null, 2));
      }
    }
  }

  console.log('');
  console.log('Per-cell summary (3 trials each):');
  console.log('');
  console.log('  page             variant   ok  trunc  parse-fail  zero-art  med-art  med-out-tok');
  console.log('  ' + '-'.repeat(82));
  const byCell = new Map();
  for (const r of results) {
    const k = `${r.page}|${r.variant}`;
    if (!byCell.has(k)) byCell.set(k, []);
    byCell.get(k).push(r);
  }
  for (const p of pages) {
    for (const variant of ['vanilla', 'ghostery']) {
      const cells = byCell.get(`${p.id}|${variant}`) || [];
      const ok = cells.filter((r) => !r.error);
      const okCount = ok.filter((r) => r.classification === 'ok').length;
      const trunc = ok.filter((r) => r.classification === 'truncated').length;
      const parseFail = ok.filter((r) => r.classification === 'parse_fail').length;
      const zeroArt = ok.filter((r) => r.classification === 'zero_articles').length;
      const arts = ok.map((r) => r.articlesCount).sort((a, b) => a - b);
      const outs = ok.map((r) => r.outputTokens).sort((a, b) => a - b);
      const medA = arts.length ? arts[Math.floor(arts.length / 2)] : 0;
      const medO = outs.length ? outs[Math.floor(outs.length / 2)] : 0;
      console.log(`  ${p.id.padEnd(16)} ${variant.padEnd(9)} ${okCount.toString().padStart(2)}  ${trunc.toString().padStart(5)}  ${parseFail.toString().padStart(10)}  ${zeroArt.toString().padStart(8)}  ${medA.toString().padStart(7)}  ${medO.toString().padStart(11)}`);
    }
  }
  console.log('');
  console.log(`Wrote ${join(runDir, 'inventory.json')}`);
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
