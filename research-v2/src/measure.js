import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  cdp,
  captureScreenshot,
  killChromedriver,
  newSession,
  randomPort,
  startChromedriver,
  VIEWPORT,
  V2_ROOT,
  REPO_ROOT,
  waitForGhosteryReady,
} from './browser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const envPath of [join(REPO_ROOT, '.env'), join(V2_ROOT, '.env')]) {
  try { process.loadEnvFile(envPath); break; } catch { /* try next */ }
}

const SETTLE_AFTER_LOAD_MS = 5000;
const COMPUTER_TOOL_BETA = 'computer-use-2025-01-24';

const SYSTEM_PROMPT =
  'You are an autonomous web-browsing agent driving a 1280x800 browser viewport. ' +
  'Your goal: identify the single top headline visible on this page and call the `finish` tool with that headline as `headline`. ' +
  'If a consent / cookie / privacy banner is blocking the page, dismiss it FIRST by clicking the appropriate button. ' +
  'Prefer "Reject all" if available; otherwise "Accept all" / "Agree" / "Continue". ' +
  'Use the `computer` tool to take screenshots and click. You should not need to scroll -- the top headline is at the top of the page once any banner is dismissed. ' +
  'Do not narrate or explain -- issue tool calls. Call `finish` as soon as you can read a headline. ' +
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

async function dispatchClick(port, sessionId, x, y) {
  await cdp(port, sessionId, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' });
  await cdp(port, sessionId, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await cdp(port, sessionId, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}

async function dispatchScroll(port, sessionId, x, y, deltaY) {
  await cdp(port, sessionId, 'Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY });
}

async function dispatchKey(port, sessionId, key) {
  await cdp(port, sessionId, 'Input.dispatchKeyEvent', { type: 'keyDown', key });
  await cdp(port, sessionId, 'Input.dispatchKeyEvent', { type: 'keyUp', key });
}

async function dispatchType(port, sessionId, text) {
  for (const ch of text) {
    await cdp(port, sessionId, 'Input.insertText', { text: ch });
  }
}

async function executeComputerAction(port, sessionId, input) {
  const { action } = input;
  switch (action) {
    case 'screenshot': {
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'left_click':
    case 'left_mouse_down':
    case 'left_mouse_up': {
      const [x, y] = input.coordinate || [];
      if (typeof x !== 'number' || typeof y !== 'number') throw new Error(`bad ${action} coordinate`);
      await dispatchClick(port, sessionId, x, y);
      await new Promise((r) => setTimeout(r, 400));
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'scroll': {
      const [x, y] = input.coordinate || [VIEWPORT.width / 2, VIEWPORT.height / 2];
      const direction = input.scroll_direction || input.direction || 'down';
      const amount = Number(input.scroll_amount ?? input.amount ?? 3);
      const dy = direction === 'up' ? -amount * 100 : amount * 100;
      await dispatchScroll(port, sessionId, x, y, dy);
      await new Promise((r) => setTimeout(r, 250));
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'key': {
      await dispatchKey(port, sessionId, input.text || input.key || '');
      await new Promise((r) => setTimeout(r, 100));
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'type': {
      await dispatchType(port, sessionId, input.text || '');
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'wait': {
      const ms = Math.min(5000, (input.duration ?? 1) * 1000);
      await new Promise((r) => setTimeout(r, ms));
      const data = await captureScreenshot(port, sessionId);
      return { kind: 'image', data };
    }
    case 'cursor_position':
    case 'mouse_move':
      return { kind: 'text', text: 'ok' };
    default:
      return { kind: 'text', text: `unsupported action: ${action}` };
  }
}

async function runTrial({ client, model, url, withGhostery, maxTurns, sampleDir, label }) {
  const port = randomPort();
  const cdProc = await startChromedriver(port);
  let browser;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreation = 0;
  let totalCacheRead = 0;
  let stopReason = null;
  let headline = null;
  let apiCalls = 0;
  let turns = 0;
  let error = null;
  const actionLog = [];

  try {
    browser = await newSession({ port, withGhostery });
    if (withGhostery) await waitForGhosteryReady(browser, port);

    await Promise.race([
      browser.url(url),
      new Promise((_, rej) => setTimeout(() => rej(new Error('nav timeout')), 30000)),
    ]);
    await new Promise((r) => setTimeout(r, SETTLE_AFTER_LOAD_MS));

    const initialShot = await captureScreenshot(port, browser.sessionId);
    writeFileSync(join(sampleDir, `${label}.initial.png`), Buffer.from(initialShot, 'base64'));

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: initialShot } },
          { type: 'text', text: USER_TASK },
        ],
      },
    ];

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
      let resp;
      try {
        resp = await client.beta.messages.create({
          model,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: [computerTool, FINISH_TOOL],
          messages,
          betas: [COMPUTER_TOOL_BETA],
        });
      } catch (e) {
        error = `api: ${e.message}`;
        stopReason = 'api_error';
        break;
      }
      apiCalls++;
      const turnDur = ((Date.now() - turnStart) / 1000).toFixed(1);
      const toolNames = resp.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => b.name + (b.input?.action ? `(${b.input.action})` : ''))
        .join(',') || 'none';
      console.log(`      turn ${turns}/${maxTurns} api=${turnDur}s in=${resp.usage?.input_tokens ?? 0} stop=${resp.stop_reason} tools=${toolNames}`);

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
        actionLog.push({ at: Date.now(), turn: turns, tool: tu.name, input: tu.input });
        if (tu.name === 'finish') {
          headline = tu.input?.headline ?? '';
          toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: 'ok' });
          finished = true;
        } else if (tu.name === 'computer') {
          try {
            const result = await executeComputerAction(port, browser.sessionId, tu.input);
            if (result.kind === 'image') {
              writeFileSync(join(sampleDir, `${label}.turn-${String(turns).padStart(2, '0')}.png`), Buffer.from(result.data, 'base64'));
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tu.id,
                content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: result.data } }],
              });
            } else {
              toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: result.text });
            }
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
    if (turns >= maxTurns && stopReason !== 'api_error') stopReason = stopReason ?? 'max_turns';
  } catch (e) {
    error = error ?? e.message;
  } finally {
    if (browser) {
      await Promise.race([
        browser.deleteSession().catch(() => {}),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    }
    await killChromedriver(cdProc);
  }

  return {
    url,
    withGhostery,
    turns,
    apiCalls,
    totalInputTokens,
    totalOutputTokens,
    totalCacheCreation,
    totalCacheRead,
    stopReason,
    headline,
    actionLog,
    error,
  };
}

function parseArgs(argv) {
  const out = {
    pages: null,
    trials: 3,
    maxTurns: 15,
    model: 'claude-sonnet-4-5-20250929',
    runId: null,
    force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pages') out.pages = (argv[++i] || '').split(',').filter(Boolean);
    else if (a === '--trials') out.trials = Number(argv[++i]);
    else if (a === '--max-turns') out.maxTurns = Number(argv[++i]);
    else if (a === '--model') out.model = argv[++i];
    else if (a === '--run') out.runId = argv[++i];
    else if (a === '--force') out.force = true;
  }
  return out;
}

function findLatestValidationRun() {
  const resultsDir = join(V2_ROOT, 'results');
  if (!existsSync(resultsDir)) return null;
  const dirs = readdirSync(resultsDir)
    .filter((d) => existsSync(join(resultsDir, d, 'validation.json')))
    .sort();
  return dirs.length ? join(resultsDir, dirs[dirs.length - 1]) : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const pagesSpec = JSON.parse(readFileSync(join(V2_ROOT, 'pages-us.json'), 'utf8'));
  const allCandidates = pagesSpec.candidates ?? [];

  let pageIds = args.pages;
  if (!pageIds) {
    const validationDir = findLatestValidationRun();
    if (validationDir) {
      const v = JSON.parse(readFileSync(join(validationDir, 'validation.json'), 'utf8'));
      pageIds = v.recommended;
      console.log(`Defaulting to validation-recommended pages from ${validationDir.split('/').pop()}: ${pageIds.join(', ')}`);
    } else {
      pageIds = allCandidates.map((c) => c.id);
      console.log(`No validation run found; using all candidates: ${pageIds.join(', ')}`);
    }
  }
  const pages = allCandidates.filter((c) => pageIds.includes(c.id));
  if (!pages.length) { console.error('No pages selected.'); process.exit(1); }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set.');
    process.exit(2);
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  const runId = args.runId || new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = join(V2_ROOT, 'results', runId);
  const trajDir = join(runDir, 'trajectory');
  mkdirSync(trajDir, { recursive: true });

  console.log(`Run:     ${runId}`);
  console.log(`Pages:   ${pages.map((p) => p.id).join(', ')}`);
  console.log(`Trials:  ${args.trials}`);
  console.log(`Model:   ${args.model}`);
  console.log('');

  const all = [];
  for (const p of pages) {
    const pageDir = join(trajDir, p.id);
    mkdirSync(pageDir, { recursive: true });
    for (const withGhostery of [false, true]) {
      const variant = withGhostery ? 'ghostery' : 'vanilla';
      for (let t = 1; t <= args.trials; t++) {
        const label = `${variant}.t${t}`;
        const trialPath = join(pageDir, `${label}.trajectory.json`);
        if (existsSync(trialPath) && !args.force) {
          try {
            const prev = JSON.parse(readFileSync(trialPath, 'utf8'));
            if (!prev.error && prev.totalInputTokens > 0) {
              console.log(`=== ${p.id} ${variant} trial ${t}/${args.trials} (cached: turns=${prev.turns} in=${prev.totalInputTokens})`);
              all.push({ ...prev, page: p.id, variant, trial: t, cached: true });
              continue;
            }
          } catch { /* fall through */ }
        }
        console.log(`=== ${p.id} ${variant} trial ${t}/${args.trials}`);
        const t0 = Date.now();
        const r = await runTrial({
          client,
          model: args.model,
          url: p.url,
          withGhostery,
          maxTurns: args.maxTurns,
          sampleDir: pageDir,
          label,
        });
        r.page = p.id;
        r.variant = variant;
        r.trial = t;
        r.durationMs = Date.now() - t0;
        r.model = args.model;
        writeFileSync(trialPath, JSON.stringify(r, null, 2));
        all.push(r);
        console.log(
          `  -> turns=${r.turns} api=${r.apiCalls} in=${r.totalInputTokens} out=${r.totalOutputTokens} ` +
          `stop=${r.stopReason ?? 'n/a'} dur=${(r.durationMs / 1000).toFixed(1)}s` +
          (r.error ? ` ERROR=${r.error}` : ''),
        );
      }
    }
  }

  const summary = summarize(all);
  writeFileSync(join(runDir, 'summary.json'), JSON.stringify({ runId, model: args.model, trials: args.trials, perPage: summary.perPage, totals: summary.totals }, null, 2));
  console.log('');
  console.log('Per-page medians (turns / in-tokens):');
  for (const row of summary.perPage) {
    console.log(
      `  ${row.page.padEnd(16)} ` +
      `vanilla  turns=${row.vanilla.medTurns.toFixed(1)} in=${Math.round(row.vanilla.medInputTokens).toString().padStart(7)}  ` +
      `ghostery turns=${row.ghostery.medTurns.toFixed(1)} in=${Math.round(row.ghostery.medInputTokens).toString().padStart(6)}  ` +
      `Δin=${Math.round(row.vanilla.medInputTokens - row.ghostery.medInputTokens)}`,
    );
  }
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function pct(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.floor((p / 100) * (s.length - 1))));
  return s[idx];
}

function summarize(trials) {
  const byPage = new Map();
  for (const tr of trials) {
    if (!byPage.has(tr.page)) byPage.set(tr.page, { vanilla: [], ghostery: [] });
    byPage.get(tr.page)[tr.variant].push(tr);
  }
  const perPage = [];
  let sumV = 0, sumG = 0, sumVT = 0, sumGT = 0;
  for (const [page, v] of byPage) {
    const reduce = (ts) => {
      const ok = ts.filter((t) => !t.error);
      if (!ok.length) return { medTurns: 0, medInputTokens: 0, medOutputTokens: 0, p25Turns: 0, p75Turns: 0, n: 0, stopReasons: [] };
      const turns = ok.map((t) => t.turns);
      const inTok = ok.map((t) => t.totalInputTokens);
      const outTok = ok.map((t) => t.totalOutputTokens);
      return {
        medTurns: median(turns),
        medInputTokens: median(inTok),
        medOutputTokens: median(outTok),
        p25Turns: pct(turns, 25),
        p75Turns: pct(turns, 75),
        p25InputTokens: pct(inTok, 25),
        p75InputTokens: pct(inTok, 75),
        n: ok.length,
        stopReasons: ok.map((t) => t.stopReason),
      };
    };
    const vanilla = reduce(v.vanilla);
    const ghostery = reduce(v.ghostery);
    perPage.push({ page, vanilla, ghostery });
    if (vanilla.n && ghostery.n) {
      sumV += vanilla.medInputTokens;
      sumG += ghostery.medInputTokens;
      sumVT += vanilla.medTurns;
      sumGT += ghostery.medTurns;
    }
  }
  return {
    perPage,
    totals: {
      vanillaMedInputTokens: sumV,
      ghosteryMedInputTokens: sumG,
      vanillaMedTurns: sumVT,
      ghosteryMedTurns: sumGT,
      deltaInputTokens: sumV - sumG,
      deltaTurns: sumVT - sumGT,
    },
  };
}

process.on('unhandledRejection', (e) => console.warn(`[unhandled] ${e?.message || e}`));
main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
