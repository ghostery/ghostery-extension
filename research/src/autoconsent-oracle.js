import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AC_ROOT = join(__dirname, '..', '..', 'node_modules', '@duckduckgo', 'autoconsent');

let cachedBundle = null;
let cachedRules = null;

function loadBundle() {
  if (cachedBundle === null) {
    cachedBundle = readFileSync(join(AC_ROOT, 'dist', 'autoconsent.playwright.js'), 'utf8');
  }
  return cachedBundle;
}

function loadRules() {
  if (cachedRules === null) {
    cachedRules = JSON.parse(readFileSync(join(AC_ROOT, 'rules', 'rules.json'), 'utf8'));
  }
  return cachedRules;
}

const DETECT_CONFIG = {
  enabled: true,
  autoAction: null,
  disabledCmps: [],
  enablePrehide: false,
  enableCosmeticRules: true,
  enableGeneratedRules: true,
  detectRetries: 20,
  isMainWorld: true,
  prehideTimeout: 2000,
  enableFilterList: false,
  enableHeuristicDetection: true,
  enableHeuristicAction: false,
  visualTest: false,
  logs: { lifecycle: false, rulesteps: false, detectionsteps: false, evals: false, errors: false, messages: false, waits: false },
};

const TERMINAL_LIFECYCLES = new Set([
  'nothingDetected',
  'cosmeticFiltersDetected',
  'cmpDetected',
  'openPopupDetected',
  'optOutSucceeded',
  'optOutFailed',
  'optInSucceeded',
  'optInFailed',
  'done',
]);

export async function detectViaAutoconsent(chromedriverCdp, port, sessionId, { waitMs = 8000 } = {}) {
  const bundle = loadBundle();
  const rules = loadRules();

  await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
    expression: `
      (() => {
        delete window.autoconsentReceiveMessage;
        delete window.autoconsentSendMessage;
        window.__autoconsentMessages = [];
        window.autoconsentSendMessage = (m) => { try { window.__autoconsentMessages.push(JSON.parse(JSON.stringify(m))); } catch {} };
      })();
    `,
    returnByValue: false,
    awaitPromise: false,
  });

  await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
    expression: bundle,
    returnByValue: false,
    awaitPromise: false,
  });

  const initExpr = `window.autoconsentReceiveMessage && window.autoconsentReceiveMessage(${JSON.stringify({
    type: 'initResp',
    config: DETECT_CONFIG,
    rules,
  })});`;
  await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
    expression: initExpr,
    returnByValue: false,
    awaitPromise: false,
  });

  const tStart = Date.now();
  let final = null;
  while (Date.now() - tStart < waitMs) {
    await new Promise((r) => setTimeout(r, 200));
    const res = await chromedriverCdp(port, sessionId, 'Runtime.evaluate', {
      expression: 'JSON.stringify(window.__autoconsentMessages || [])',
      returnByValue: true,
    });
    const messages = JSON.parse(res?.result?.value || '[]');
    const reports = messages.filter((m) => m.type === 'report');
    if (reports.length > 0) {
      const last = reports[reports.length - 1];
      if (last.state && TERMINAL_LIFECYCLES.has(last.state.lifecycle)) {
        final = { messages, lastState: last.state };
        break;
      }
      final = { messages, lastState: last.state };
    } else {
      final = { messages, lastState: null };
    }
  }

  if (!final) final = { messages: [], lastState: null };

  const cmpDetected = final.messages.find((m) => m.type === 'cmpDetected');
  const popupFound = final.messages.find((m) => m.type === 'popupFound');
  const lifecycle = final.lastState?.lifecycle || 'unknown';
  const inconclusive = !TERMINAL_LIFECYCLES.has(lifecycle);

  return {
    detected: !!popupFound,
    cmp: popupFound?.cmp || cmpDetected?.cmp || null,
    lifecycle,
    inconclusive,
    heuristicPatterns: final.lastState?.heuristicPatterns || [],
    heuristicSnippets: final.lastState?.heuristicSnippets || [],
    durationMs: Date.now() - tStart,
  };
}
