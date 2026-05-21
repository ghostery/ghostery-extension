import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  cdp,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  REPO_ROOT,
  V2_ROOT,
  waitForGhosteryReady,
} from './browser.js';

for (const envPath of [join(REPO_ROOT, '.env'), join(V2_ROOT, '.env')]) {
  try { process.loadEnvFile(envPath); break; } catch { /* try next */ }
}

const SETTLE_MS = 5000;
const MAX_TEXT_CHARS = 80_000;

const SYSTEM_PROMPT = 'You are reading the text content of a webpage. Identify the single top headline -- the most prominent news story on the page. Reply with just the headline text, no commentary, no quotes.';

async function fetchPageText(url, withGhostery) {
  const port = randomPort();
  const cdProc = await startChromedriver(port);
  let browser;
  try {
    browser = await newSession({ port, withGhostery });
    if (withGhostery) await waitForGhosteryReady(browser, port);
    await Promise.race([
      browser.url(url),
      new Promise((_, rej) => setTimeout(() => rej(new Error('nav timeout')), 30_000)),
    ]);
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    const res = await cdp(port, browser.sessionId, 'Runtime.evaluate', {
      expression: '(() => ({ text: document.body ? document.body.innerText : "", title: document.title }))()',
      returnByValue: true,
    });
    return res?.result?.value;
  } finally {
    if (browser) await browser.deleteSession().catch(() => {});
    await killChromedriver(cdProc);
  }
}

async function measureOne(client, model, url, withGhostery) {
  const pageData = await fetchPageText(url, withGhostery);
  const fullText = pageData?.text || '';
  const truncated = fullText.length > MAX_TEXT_CHARS;
  const text = fullText.slice(0, MAX_TEXT_CHARS);
  if (!text) return { error: 'empty text', textChars: 0 };

  const resp = await client.messages.create({
    model,
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text + '\n\nWhat is the top headline?' }],
  });
  const headline = resp.content.find((b) => b.type === 'text')?.text?.trim() || '';
  return {
    headline,
    textChars: text.length,
    textFullChars: fullText.length,
    truncated,
    title: pageData?.title,
    inputTokens: resp.usage?.input_tokens ?? 0,
    outputTokens: resp.usage?.output_tokens ?? 0,
    stopReason: resp.stop_reason,
  };
}

function findLatestRun() {
  const resultsDir = join(V2_ROOT, 'results');
  if (!existsSync(resultsDir)) return null;
  const dirs = readdirSync(resultsDir)
    .filter((d) => {
      try { return statSync(join(resultsDir, d)).isDirectory(); } catch { return false; }
    })
    .sort();
  return dirs.length ? join(resultsDir, dirs[dirs.length - 1]) : null;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  const trials = Number(process.env.TEXT_TRIALS || 3);
  const pagesSpec = JSON.parse(readFileSync(join(V2_ROOT, 'pages-us.json'), 'utf8'));
  const ids = ['theverge', 'cnn', 'npr', 'theguardian'];
  const pages = pagesSpec.candidates.filter((c) => ids.includes(c.id));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(2);
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  const model = 'claude-sonnet-4-5-20250929';

  const runDir = findLatestRun();
  if (!runDir) {
    console.error('No measurement run dir found; run measure.js first');
    process.exit(1);
  }
  const outPath = join(runDir, 'text-agent.json');

  console.log(`Run dir: ${runDir}`);
  console.log(`Pages:   ${pages.map((p) => p.id).join(', ')}`);
  console.log(`Trials:  ${trials} per (page, variant)`);
  console.log(`Model:   ${model}`);
  console.log('');

  const results = [];
  for (const p of pages) {
    for (const withGhostery of [false, true]) {
      const variant = withGhostery ? 'ghostery' : 'vanilla';
      for (let t = 1; t <= trials; t++) {
        process.stdout.write(`  ${p.id} ${variant} t${t}/${trials} `);
        const t0 = Date.now();
        let r;
        try {
          r = await measureOne(client, model, p.url, withGhostery);
        } catch (e) {
          r = { error: e.message };
        }
        const dur = ((Date.now() - t0) / 1000).toFixed(1);
        if (r.error) {
          console.log(`ERROR ${r.error} (${dur}s)`);
        } else {
          console.log(`chars=${r.textChars}${r.truncated ? '(trunc)' : ''} in=${r.inputTokens} out=${r.outputTokens} dur=${dur}s "${(r.headline || '').slice(0, 50)}"`);
        }
        results.push({ page: p.id, variant, trial: t, durationMs: Date.now() - t0, ...r });
      }
    }
  }

  const byCell = new Map();
  for (const r of results) {
    const k = `${r.page}|${r.variant}`;
    if (!byCell.has(k)) byCell.set(k, []);
    byCell.get(k).push(r);
  }
  const summary = [];
  for (const p of pages) {
    const v = byCell.get(`${p.id}|vanilla`) || [];
    const g = byCell.get(`${p.id}|ghostery`) || [];
    const okV = v.filter((r) => !r.error);
    const okG = g.filter((r) => !r.error);
    if (!okV.length || !okG.length) continue;
    summary.push({
      page: p.id,
      vanilla: {
        medInputTokens: median(okV.map((r) => r.inputTokens)),
        medOutputTokens: median(okV.map((r) => r.outputTokens)),
        medChars: median(okV.map((r) => r.textChars)),
        n: okV.length,
        headlines: okV.map((r) => r.headline),
      },
      ghostery: {
        medInputTokens: median(okG.map((r) => r.inputTokens)),
        medOutputTokens: median(okG.map((r) => r.outputTokens)),
        medChars: median(okG.map((r) => r.textChars)),
        n: okG.length,
        headlines: okG.map((r) => r.headline),
      },
    });
  }

  writeFileSync(outPath, JSON.stringify({ model, trials, results, summary }, null, 2));
  console.log('');
  console.log('Per-page medians (input tokens):');
  for (const row of summary) {
    const dTok = row.vanilla.medInputTokens - row.ghostery.medInputTokens;
    const savedPct = row.vanilla.medInputTokens > 0 ? Math.round((1 - row.ghostery.medInputTokens / row.vanilla.medInputTokens) * 100) : 0;
    console.log(`  ${row.page.padEnd(14)} vanilla=${Math.round(row.vanilla.medInputTokens).toString().padStart(6)} ghostery=${Math.round(row.ghostery.medInputTokens).toString().padStart(6)} Δ=${Math.round(dTok).toString().padStart(5)} (${savedPct}%)`);
  }
  console.log('');
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
