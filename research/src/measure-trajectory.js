import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { remote } from 'webdriverio';

import { ensureExtensionExtracted } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = join(__dirname, '..');
const REPO_ROOT = join(RESEARCH_ROOT, '..');
const RESULTS_ROOT = join(RESEARCH_ROOT, 'results');

const CHROME_BIN = join(
  RESEARCH_ROOT,
  '.browsers/chrome/mac_arm-148.0.7778.167/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);
const CHROMEDRIVER_BIN = join(
  RESEARCH_ROOT,
  '.browsers/chromedriver/mac_arm-148.0.7778.167/chromedriver-mac-arm64/chromedriver',
);

for (const envPath of [join(RESEARCH_ROOT, '..', '.env'), join(RESEARCH_ROOT, '.env')]) {
  try { process.loadEnvFile(envPath); break; } catch { /* try next */ }
}

const VIEWPORT = { width: 1280, height: 800 };
const SETTLE_AFTER_LOAD_MS = 2500;
const GHOSTERY_WARMUP_FALLBACK_MS = 4000;
const GHOSTERY_READY_TIMEOUT_MS = 30_000;
const COMPUTER_TOOL_BETA = 'computer-use-2025-01-24';

const SYSTEM_PROMPT =
  'You are an autonomous web-browsing agent driving a 1280x800 browser viewport. ' +
  'Your goal: identify the single top headline visible on this page and call the `finish` tool with that headline as `headline`. ' +
  'If a consent / cookie / privacy banner is blocking the page, dismiss it FIRST by clicking the appropriate button. ' +
  'Banner button labels can be in any language: prefer reject ("Reject all" / "Odrzuć wszystkie" / "Ablehnen" / "Refuser tout"), otherwise accept ("Accept all" / "Zaakceptuj wszystkie" / "Przejdź do serwisu" / "Zgadzam się" / "Akzeptieren" / "Tout accepter"). ' +
  'Use the `computer` tool to take screenshots and click. You should not need to scroll — the top headline is at the top of the page once any banner is dismissed. ' +
  'Do not narrate or explain — issue tool calls. Call `finish` as soon as you can read a headline (in its original language is fine). ' +
  'If no headline is visible after dismissing any banner, call `finish` with an empty string.';

const USER_TASK =
  'What is the top headline on this page? Take a screenshot to see, dismiss any consent banner if present, then call `finish` with the headline.';

const FINISH_TOOL = {
  name: 'finish',
  description: 'Call when you have identified the top headline (or determined the page has no readable headline).',
  input_schema: {
    type: 'object',
    properties: {
      headline: {
        type: 'string',
        description: 'The single top headline visible on the page. Empty string if none was readable.',
      },
    },
    required: ['headline'],
  },
};

async function chromedriverCdp(port, sessionId, method, params = {}) {
  const url = `http://localhost:${port}/session/${sessionId}/goog/cdp/execute`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cmd: method, params }),
  });
  const data = await resp.json();
  if (data.value && data.value.error) throw new Error(data.value.message || data.value.error);
  return data.value;
}

async function startChromedriver(port) {
  if (!existsSync(CHROMEDRIVER_BIN)) {
    throw new Error(`chromedriver missing at ${CHROMEDRIVER_BIN} — run npm run setup:browsers`);
  }
  const proc = spawn(CHROMEDRIVER_BIN, [`--port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(), 1500);
    proc.stdout.on('data', (d) => {
      if (d.toString().toLowerCase().includes('chromedriver was started')) {
        clearTimeout(timer);
        resolve();
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`chromedriver exited early with code ${code}`));
    });
  });
  return proc;
}

async function discoverLoadedExtensionId(browser) {
  try {
    await browser.url('chrome://extensions');
    const item = await browser.$('>>>extensions-item');
    return await item.getAttribute('id');
  } catch {
    return null;
  }
}

async function waitForGhosteryReady(browser, port, sessionId) {
  const extId = await discoverLoadedExtensionId(browser);
  if (!extId) {
    await new Promise((r) => setTimeout(r, GHOSTERY_WARMUP_FALLBACK_MS));
    return { fallback: true };
  }
  await chromedriverCdp(port, sessionId, 'Page.navigate', {
    url: `chrome-extension://${extId}/pages/status/index.html`,
  });
  const deadline = Date.now() + GHOSTERY_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
        expression: '(() => window.__ghosteryStatus ?? null)()',
        returnByValue: true,
      });
      const v = res?.result?.value;
      if (v && v.ready === true) return v;
    } catch { /* still loading */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  return { timeout: true };
}

async function captureScreenshot(port, sessionId) {
  const res = await chromedriverCdp(port, sessionId, 'Page.captureScreenshot', { format: 'png' });
  return res.data;
}

async function dispatchClick(port, sessionId, x, y) {
  await chromedriverCdp(port, sessionId, 'Input.dispatchMouseEvent', {
    type: 'mouseMoved', x, y, button: 'none',
  });
  await chromedriverCdp(port, sessionId, 'Input.dispatchMouseEvent', {
    type: 'mousePressed', x, y, button: 'left', clickCount: 1,
  });
  await chromedriverCdp(port, sessionId, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased', x, y, button: 'left', clickCount: 1,
  });
}

async function dispatchScroll(port, sessionId, x, y, deltaY) {
  await chromedriverCdp(port, sessionId, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel', x, y, deltaX: 0, deltaY,
  });
}

async function dispatchKey(port, sessionId, key) {
  await chromedriverCdp(port, sessionId, 'Input.dispatchKeyEvent', { type: 'keyDown', key });
  await chromedriverCdp(port, sessionId, 'Input.dispatchKeyEvent', { type: 'keyUp', key });
}

async function dispatchType(port, sessionId, text) {
  for (const ch of text) {
    await chromedriverCdp(port, sessionId, 'Input.insertText', { text: ch });
  }
}

async function executeComputerAction(port, sessionId, input, log) {
  const { action } = input;
  log.push({ at: Date.now(), action, input });
  switch (action) {
    case 'screenshot': {
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'left_click':
    case 'left_mouse_down':
    case 'left_mouse_up': {
      const [x, y] = input.coordinate || [];
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error(`bad ${action} coordinate`);
      await dispatchClick(port, sessionId, x, y);
      await new Promise((r) => setTimeout(r, 250));
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'scroll': {
      const [x, y] = input.coordinate || [VIEWPORT.width / 2, VIEWPORT.height / 2];
      const direction = input.scroll_direction || input.direction || 'down';
      const amount = Number(input.scroll_amount ?? input.amount ?? 3);
      const dy = direction === 'up' ? -amount * 100 : amount * 100;
      await dispatchScroll(port, sessionId, x, y, dy);
      await new Promise((r) => setTimeout(r, 250));
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'key': {
      await dispatchKey(port, sessionId, input.text || input.key || '');
      await new Promise((r) => setTimeout(r, 100));
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'type': {
      await dispatchType(port, sessionId, input.text || '');
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'wait': {
      const ms = Math.min(5000, (input.duration ?? 1) * 1000);
      await new Promise((r) => setTimeout(r, ms));
      const data = await captureScreenshot(port, sessionId);
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data } };
    }
    case 'cursor_position':
    case 'mouse_move':
      return { type: 'text', text: 'ok' };
    default:
      return { type: 'text', text: `unsupported action: ${action}` };
  }
}

async function runTrial({ client, model, url, withGhostery, maxTurns, dryRun, extDir, sampleDir, label }) {
  const port = 9515 + Math.floor(Math.random() * 4000);
  const cdProc = await startChromedriver(port);
  const chromeArgs = [
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    '--headless=new',
  ];
  if (withGhostery) {
    const extPath = ensureExtensionExtracted({ dir: extDir });
    chromeArgs.push(`--disable-extensions-except=${extPath}`);
    chromeArgs.push(`--load-extension=${extPath}`);
  }
  let browser;
  const actionLog = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreation = 0;
  let totalCacheRead = 0;
  let stopReason = null;
  let firstParagraph = null;
  let apiCalls = 0;
  let turns = 0;
  let error = null;
  try {
    browser = await remote({
      automationProtocol: 'webdriver',
      hostname: 'localhost',
      port,
      path: '/',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': { binary: CHROME_BIN, args: chromeArgs },
        pageLoadStrategy: 'eager',
      },
      logLevel: 'error',
      connectionRetryCount: 1,
    });

    if (withGhostery) {
      await waitForGhosteryReady(browser, port, browser.sessionId);
    }

    await browser.url(url);
    await new Promise((r) => setTimeout(r, SETTLE_AFTER_LOAD_MS));

    const initialShot = await captureScreenshot(port, browser.sessionId);
    if (sampleDir) writeFileSync(join(sampleDir, `${label}.initial.png`), Buffer.from(initialShot, 'base64'));

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: initialShot } },
          { type: 'text', text: USER_TASK },
        ],
      },
    ];

    if (dryRun) {
      stopReason = 'dry_run';
      return {
        url, withGhostery, dryRun: true, turns: 0, apiCalls: 0,
        totalInputTokens: 0, totalOutputTokens: 0,
        stopReason, firstParagraph: null, actionLog,
      };
    }

    const computerTool = {
      type: 'computer_20250124',
      name: 'computer',
      display_width_px: VIEWPORT.width,
      display_height_px: VIEWPORT.height,
      display_number: 1,
    };

    while (turns < maxTurns) {
      turns++;
      const turnStart = Date.now();
      process.stdout.write(`    turn ${turns}/${maxTurns} `);
      const resp = await client.beta.messages.create({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [computerTool, FINISH_TOOL],
        messages,
        betas: [COMPUTER_TOOL_BETA],
      });
      apiCalls++;
      const turnDur = ((Date.now() - turnStart) / 1000).toFixed(1);
      const toolNames = resp.content.filter((b) => b.type === 'tool_use').map((b) => b.name + (b.input?.action ? `(${b.input.action})` : '')).join(',') || 'none';
      process.stdout.write(`api=${turnDur}s in=${resp.usage?.input_tokens ?? 0} stop=${resp.stop_reason} tools=${toolNames}\n`);
      totalInputTokens += resp.usage?.input_tokens ?? 0;
      totalOutputTokens += resp.usage?.output_tokens ?? 0;
      totalCacheCreation += resp.usage?.cache_creation_input_tokens ?? 0;
      totalCacheRead += resp.usage?.cache_read_input_tokens ?? 0;
      stopReason = resp.stop_reason;
      messages.push({ role: 'assistant', content: resp.content });

      const toolUses = resp.content.filter((b) => b.type === 'tool_use');
      if (!toolUses.length) break;

      const toolResults = [];
      let finished = false;
      for (const tu of toolUses) {
        if (tu.name === 'finish') {
          firstParagraph = tu.input?.headline ?? tu.input?.first_paragraph ?? '';
          toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: 'ok' });
          finished = true;
        } else if (tu.name === 'computer') {
          try {
            const result = await executeComputerAction(port, browser.sessionId, tu.input, actionLog);
            toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: [result] });
          } catch (e) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: tu.id,
              is_error: true,
              content: [{ type: 'text', text: `error: ${e.message}` }],
            });
          }
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: tu.id,
            is_error: true,
            content: [{ type: 'text', text: `unknown tool: ${tu.name}` }],
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
      if (finished) break;
    }
    if (turns >= maxTurns) stopReason = stopReason ?? 'max_turns';
  } catch (e) {
    error = e.message;
  } finally {
    if (browser) {
      await Promise.race([browser.deleteSession().catch(() => {}), new Promise((r) => setTimeout(r, 5000))]);
    }
    cdProc.kill('SIGTERM');
    try { await new Promise((r) => setTimeout(r, 200)); if (!cdProc.killed) cdProc.kill('SIGKILL'); } catch {}
  }
  return {
    url, withGhostery, dryRun: false, turns, apiCalls,
    totalInputTokens, totalOutputTokens, totalCacheCreation, totalCacheRead,
    stopReason, firstParagraph, actionLog, error,
  };
}

function parseArgs(argv) {
  const out = {
    pages: null,
    trials: 3,
    maxTurns: 15,
    model: 'claude-sonnet-4-5-20250929',
    dryRun: false,
    extDir: process.env.GHOSTERY_EXT_DIR || null,
    outRun: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pages') out.pages = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--trials') out.trials = Number(argv[++i]);
    else if (a === '--max-turns') out.maxTurns = Number(argv[++i]);
    else if (a === '--model') out.model = argv[++i];
    else if (a === '--ext-dir') out.extDir = argv[++i];
    else if (a === '--run') out.outRun = argv[++i];
    else if (a === '--page-set') out.pageSet = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--force') out.force = true;
    else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: node src/measure-trajectory.js [--pages cnn,weather,espn] [--page-set pages-eu.json] [--trials 3] [--max-turns 15] [--model claude-sonnet-4-5-20250929] [--ext-dir ../dist] [--run RUN_ID] [--dry-run] [--force]\n\n' +
          '  --pages     comma-separated page ids from the page set (default: pages with consent banners detected in the run\'s vanilla metrics)\n' +
          '  --page-set  path (relative to research/) to a pages JSON file (default: pages-trajectory.json if present, else pages.json)\n' +
          '  --trials    trajectories per (page, variant) (default 3)\n' +
          '  --max-turns hard cap on agent turns per trajectory (default 15)\n' +
          '  --model     Anthropic model id (default claude-sonnet-4-5-20250929; Sonnet 4.6 / Opus 4.7 do not ship computer-use yet)\n' +
          '  --ext-dir   unpacked Ghostery dir (default: extract web-ext-artifacts zip)\n' +
          '  --run       reuse an existing results/<run-id> dir to write trajectory-tax.json into\n' +
          '  --dry-run   skip API calls; just navigate and capture initial state\n' +
          '  --force     re-run trials even if a cached trajectory.json already exists\n',
      );
      process.exit(0);
    }
  }
  return out;
}

function defaultBannerPages(allPages, latestRunDir) {
  if (!latestRunDir) return allPages.map((p) => p.id);
  const banner = [];
  for (const p of allPages) {
    const metricsPath = join(latestRunDir, p.id, 'vanilla.metrics.json');
    if (!existsSync(metricsPath)) {
      banner.push(p.id);
      continue;
    }
    try {
      const m = JSON.parse(readFileSync(metricsPath, 'utf8'));
      if (m.consentBannerDetected) banner.push(p.id);
    } catch { banner.push(p.id); }
  }
  return banner.length ? banner : allPages.map((p) => p.id);
}

function findLatestRun() {
  if (!existsSync(RESULTS_ROOT)) return null;
  const dirs = readdirSync(RESULTS_ROOT)
    .filter((d) => {
      try { return statSync(join(RESULTS_ROOT, d)).isDirectory(); } catch { return false; }
    })
    .sort();
  return dirs.length ? join(RESULTS_ROOT, dirs[dirs.length - 1]) : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let pagesPath;
  if (args.pageSet) {
    pagesPath = join(RESEARCH_ROOT, args.pageSet);
  } else {
    const trajectoryPagesPath = join(RESEARCH_ROOT, 'pages-trajectory.json');
    pagesPath = existsSync(trajectoryPagesPath) ? trajectoryPagesPath : join(RESEARCH_ROOT, 'pages.json');
  }
  const allPages = JSON.parse(readFileSync(pagesPath, 'utf8'));
  console.log(`Page list: ${pagesPath.split('/').pop()}`);
  const latestRun = args.outRun ? join(RESULTS_ROOT, args.outRun) : findLatestRun();
  const selectedIds = args.pages ?? defaultBannerPages(allPages, latestRun);
  const selectedPages = allPages.filter((p) => selectedIds.includes(p.id));
  if (!selectedPages.length) {
    console.error('No pages selected.');
    process.exit(1);
  }

  let runDir;
  if (latestRun) {
    runDir = latestRun;
  } else {
    runDir = join(RESULTS_ROOT, new Date().toISOString().replace(/[:.]/g, '-'));
    mkdirSync(runDir, { recursive: true });
  }
  const trajectoryDir = join(runDir, 'trajectory');
  mkdirSync(trajectoryDir, { recursive: true });

  let client = null;
  if (!args.dryRun) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set. Use --dry-run to test the harness without API calls.');
      process.exit(2);
    }
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    client = new Anthropic();
  }

  console.log(`Pages:   ${selectedIds.join(', ')}`);
  console.log(`Trials:  ${args.trials}`);
  console.log(`Model:   ${args.model}`);
  console.log(`Output:  ${runDir}`);
  if (args.dryRun) console.log(`Mode:    DRY RUN (no API calls)`);
  console.log('');

  const results = [];
  for (const p of selectedPages) {
    const pageDir = join(trajectoryDir, p.id);
    mkdirSync(pageDir, { recursive: true });
    for (const withGhostery of [false, true]) {
      const variant = withGhostery ? 'ghostery' : 'vanilla';
      const trials = [];
      for (let t = 1; t <= args.trials; t++) {
        const label = `${variant}.t${t}`;
        const trialPath = join(pageDir, `${label}.trajectory.json`);
        if (existsSync(trialPath) && !args.force) {
          try {
            const prev = JSON.parse(readFileSync(trialPath, 'utf8'));
            if (!prev.error && (prev.dryRun || prev.totalInputTokens > 0)) {
              console.log(`=== ${p.id} ${variant} trial ${t}/${args.trials} (cached: turns=${prev.turns} in=${prev.totalInputTokens})`);
              trials.push(prev);
              continue;
            }
          } catch { /* fall through to re-run */ }
        }
        console.log(`=== ${p.id} ${variant} trial ${t}/${args.trials}`);
        const t0 = Date.now();
        const r = await runTrial({
          client,
          model: args.model,
          url: p.url,
          withGhostery,
          maxTurns: args.maxTurns,
          dryRun: args.dryRun,
          extDir: args.extDir,
          sampleDir: pageDir,
          label,
        });
        r.page = p.id;
        r.url = p.url;
        r.variant = variant;
        r.trial = t;
        r.durationMs = Date.now() - t0;
        trials.push(r);
        writeFileSync(join(pageDir, `${label}.trajectory.json`), JSON.stringify(r, null, 2));
        console.log(
          `  turns=${r.turns} api=${r.apiCalls} in=${r.totalInputTokens} out=${r.totalOutputTokens} ` +
          `stop=${r.stopReason ?? 'n/a'} elapsed=${(r.durationMs / 1000).toFixed(1)}s` +
          (r.error ? ` ERROR=${r.error}` : ''),
        );
      }
      results.push({ page: p.id, variant, trials });
    }
  }

  const aggregatedResults = readAllTrialsFromDisk(trajectoryDir);
  const summary = summarize(aggregatedResults, args);
  const outPath = join(runDir, 'trajectory-tax.json');
  writeFileSync(outPath, JSON.stringify({ runDir, model: args.model, trials: args.trials, maxTurns: args.maxTurns, perPage: summary.perPage, totals: summary.totals }, null, 2));
  console.log('');
  console.log('Per-page averages:');
  for (const row of summary.perPage) {
    console.log(
      `  ${row.page.padEnd(14)} ` +
      `vanilla turns=${row.vanilla.avgTurns.toFixed(1)} in=${Math.round(row.vanilla.avgInputTokens)}  ` +
      `ghostery turns=${row.ghostery.avgTurns.toFixed(1)} in=${Math.round(row.ghostery.avgInputTokens)}  ` +
      `Δturns=${(row.vanilla.avgTurns - row.ghostery.avgTurns).toFixed(1)} ` +
      `Δin=${Math.round(row.vanilla.avgInputTokens - row.ghostery.avgInputTokens)}`,
    );
  }
  console.log('');
  console.log(`Wrote ${outPath}`);
}

function readAllTrialsFromDisk(trajectoryDir) {
  if (!existsSync(trajectoryDir)) return [];
  const results = [];
  for (const page of readdirSync(trajectoryDir)) {
    const pageDir = join(trajectoryDir, page);
    let pageStat;
    try { pageStat = statSync(pageDir); } catch { continue; }
    if (!pageStat.isDirectory()) continue;
    const byVariant = { vanilla: [], ghostery: [] };
    for (const f of readdirSync(pageDir)) {
      const m = f.match(/^(vanilla|ghostery)\.t(\d+)\.trajectory\.json$/);
      if (!m) continue;
      try {
        const raw = JSON.parse(readFileSync(join(pageDir, f), 'utf8'));
        byVariant[m[1]].push(raw);
      } catch { /* skip */ }
    }
    for (const variant of ['vanilla', 'ghostery']) {
      if (byVariant[variant].length) {
        results.push({ page, variant, trials: byVariant[variant] });
      }
    }
  }
  return results;
}

function summarize(results, args) {
  const byPage = new Map();
  for (const r of results) {
    if (!byPage.has(r.page)) byPage.set(r.page, { vanilla: null, ghostery: null });
    byPage.get(r.page)[r.variant] = r.trials;
  }
  const perPage = [];
  let totalVanillaIn = 0, totalGhosteryIn = 0;
  let totalVanillaTurns = 0, totalGhosteryTurns = 0;
  let bannerPages = 0;
  for (const [page, vs] of byPage) {
    const reduce = (trials) => {
      const ok = trials.filter((t) => !t.error);
      if (!ok.length) return { avgTurns: 0, avgInputTokens: 0, avgOutputTokens: 0, n: 0 };
      const sum = (k) => ok.reduce((a, t) => a + (t[k] ?? 0), 0);
      return {
        avgTurns: sum('turns') / ok.length,
        avgInputTokens: sum('totalInputTokens') / ok.length,
        avgOutputTokens: sum('totalOutputTokens') / ok.length,
        n: ok.length,
        stopReasons: ok.map((t) => t.stopReason),
      };
    };
    const v = reduce(vs.vanilla ?? []);
    const g = reduce(vs.ghostery ?? []);
    perPage.push({ page, vanilla: v, ghostery: g });
    if (v.n && g.n) {
      totalVanillaIn += v.avgInputTokens;
      totalGhosteryIn += g.avgInputTokens;
      totalVanillaTurns += v.avgTurns;
      totalGhosteryTurns += g.avgTurns;
      if (v.avgTurns - g.avgTurns >= 1) bannerPages++;
    }
  }
  return {
    perPage,
    totals: {
      vanillaAvgInputTokens: totalVanillaIn,
      ghosteryAvgInputTokens: totalGhosteryIn,
      vanillaAvgTurns: totalVanillaTurns,
      ghosteryAvgTurns: totalGhosteryTurns,
      deltaInputTokens: totalVanillaIn - totalGhosteryIn,
      deltaTurns: totalVanillaTurns - totalGhosteryTurns,
      bannerPagesByMeasuredTurns: bannerPages,
    },
  };
}

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  console.warn(`[unhandledRejection ignored] ${msg}`);
});
process.on('uncaughtException', (err) => {
  console.warn(`[uncaughtException ignored] ${err?.message ?? err}`);
});

main().catch((e) => {
  console.error(e?.stack || e);
  process.exit(1);
});
