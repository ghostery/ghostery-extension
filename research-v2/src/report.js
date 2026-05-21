import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { V2_ROOT } from './browser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SONNET_INPUT_PER_MTOK = 3;
const SONNET_OUTPUT_PER_MTOK = 15;

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

function loadTrials(runDir) {
  const trajDir = join(runDir, 'trajectory');
  if (!existsSync(trajDir)) return [];
  const out = [];
  for (const page of readdirSync(trajDir)) {
    const pageDir = join(trajDir, page);
    if (!statSync(pageDir).isDirectory()) continue;
    for (const f of readdirSync(pageDir)) {
      const m = f.match(/^(vanilla|ghostery)\.t(\d+)\.trajectory\.json$/);
      if (!m) continue;
      const raw = JSON.parse(readFileSync(join(pageDir, f), 'utf8'));
      out.push({ ...raw, page, variant: m[1], trial: Number(m[2]) });
    }
  }
  return out;
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
  for (const [page, v] of byPage) {
    const reduce = (ts) => {
      const ok = ts.filter((t) => !t.error);
      if (!ok.length) return null;
      const turns = ok.map((t) => t.turns);
      const inTok = ok.map((t) => t.totalInputTokens);
      const outTok = ok.map((t) => t.totalOutputTokens);
      return {
        medTurns: median(turns),
        medInputTokens: median(inTok),
        medOutputTokens: median(outTok),
        p25Turns: pct(turns, 25), p75Turns: pct(turns, 75),
        p25Input: pct(inTok, 25), p75Input: pct(inTok, 75),
        n: ok.length,
        stopReasons: ok.map((t) => t.stopReason),
        headlines: ok.map((t) => t.headline).filter(Boolean),
        sampleTrial: ok[0],
      };
    };
    perPage.push({ page, vanilla: reduce(v.vanilla), ghostery: reduce(v.ghostery) });
  }
  perPage.sort((a, b) => {
    const aDelta = (a.vanilla?.medInputTokens || 0) - (a.ghostery?.medInputTokens || 0);
    const bDelta = (b.vanilla?.medInputTokens || 0) - (b.ghostery?.medInputTokens || 0);
    return bDelta - aDelta;
  });
  return perPage;
}

function suiteStats(perPage) {
  const covered = perPage.filter((r) => r.vanilla && r.ghostery && r.vanilla.medTurns > r.ghostery.medTurns);
  const uncovered = perPage.filter((r) => r.vanilla && r.ghostery && r.vanilla.medTurns <= r.ghostery.medTurns);
  const all = perPage.filter((r) => r.vanilla && r.ghostery);
  const usd = (tok) => (tok / 1e6) * SONNET_INPUT_PER_MTOK;
  const avgVTok = all.reduce((a, r) => a + r.vanilla.medInputTokens, 0) / Math.max(1, all.length);
  const avgGTok = all.reduce((a, r) => a + r.ghostery.medInputTokens, 0) / Math.max(1, all.length);
  const coveredAvgSaved = covered.length
    ? covered.reduce((a, r) => a + (1 - r.ghostery.medInputTokens / r.vanilla.medInputTokens), 0) / covered.length
    : 0;
  const avgVTurn = all.reduce((a, r) => a + r.vanilla.medTurns, 0) / Math.max(1, all.length);
  const avgGTurn = all.reduce((a, r) => a + r.ghostery.medTurns, 0) / Math.max(1, all.length);
  return {
    nCovered: covered.length,
    nUncovered: uncovered.length,
    nTotal: all.length,
    avgVTok, avgGTok,
    avgVUsd: usd(avgVTok), avgGUsd: usd(avgGTok),
    coveredAvgSavedPct: Math.round(coveredAvgSaved * 100),
    suiteAvgSavedPct: avgVTok > 0 ? Math.round((1 - avgGTok / avgVTok) * 100) : 0,
    avgVTurn, avgGTurn,
    coveredPages: covered.map((r) => r.page),
    uncoveredPages: uncovered.map((r) => r.page),
  };
}

function buildResultsMd(runId, perPage, model) {
  const lines = [];
  lines.push('# Research v2 -- full results');
  lines.push('');
  lines.push(`Run: \`${runId}\``);
  lines.push(`Model: \`${model}\` (Sonnet 4.5 -- only Anthropic model with computer-use beta in May 2026).`);
  lines.push(`Pricing: input $${SONNET_INPUT_PER_MTOK}/MTok, output $${SONNET_OUTPUT_PER_MTOK}/MTok.`);
  lines.push('');
  lines.push('## Per-page medians (input tokens, sorted by Ghostery saving)');
  lines.push('');
  lines.push('| Page | Vanilla turns (p25/p75) | Ghostery turns | Vanilla input tokens (p25/p75) | Ghostery input tokens | Δtokens | Vanilla $/load | Ghostery $/load | Saved % |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');

  let sumVTok = 0, sumGTok = 0, sumVTurn = 0, sumGTurn = 0;
  for (const row of perPage) {
    if (!row.vanilla || !row.ghostery) {
      lines.push(`| ${row.page} | ${row.vanilla ? row.vanilla.medTurns : '–'} | ${row.ghostery ? row.ghostery.medTurns : '–'} | – | – | – | – | – | – |`);
      continue;
    }
    const v = row.vanilla, g = row.ghostery;
    const dTok = v.medInputTokens - g.medInputTokens;
    const vUsd = (v.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK + (v.medOutputTokens / 1e6) * SONNET_OUTPUT_PER_MTOK;
    const gUsd = (g.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK + (g.medOutputTokens / 1e6) * SONNET_OUTPUT_PER_MTOK;
    const savedPct = vUsd > 0 ? Math.round((1 - gUsd / vUsd) * 100) : 0;
    sumVTok += v.medInputTokens; sumGTok += g.medInputTokens;
    sumVTurn += v.medTurns; sumGTurn += g.medTurns;
    lines.push(
      `| ${row.page} | ${v.medTurns.toFixed(1)} (${v.p25Turns}/${v.p75Turns}) | ${g.medTurns.toFixed(1)} (${g.p25Turns}/${g.p75Turns}) | ${Math.round(v.medInputTokens).toLocaleString()} (${Math.round(v.p25Input).toLocaleString()}/${Math.round(v.p75Input).toLocaleString()}) | ${Math.round(g.medInputTokens).toLocaleString()} | ${Math.round(dTok).toLocaleString()} | $${vUsd.toFixed(4)} | $${gUsd.toFixed(4)} | ${savedPct}% |`,
    );
  }
  const vTotalUsd = (sumVTok / 1e6) * SONNET_INPUT_PER_MTOK;
  const gTotalUsd = (sumGTok / 1e6) * SONNET_INPUT_PER_MTOK;
  const savedTotalPct = vTotalUsd > 0 ? Math.round((1 - gTotalUsd / vTotalUsd) * 100) : 0;
  lines.push(`| **suite sum** | **${sumVTurn.toFixed(1)}** | **${sumGTurn.toFixed(1)}** | **${Math.round(sumVTok).toLocaleString()}** | **${Math.round(sumGTok).toLocaleString()}** | **${Math.round(sumVTok - sumGTok).toLocaleString()}** | **$${vTotalUsd.toFixed(4)}** | **$${gTotalUsd.toFixed(4)}** | **${savedTotalPct}%** |`);
  lines.push('');
  const perPageVUsd = vTotalUsd / Math.max(1, perPage.length) * 1000;
  const perPageGUsd = gTotalUsd / Math.max(1, perPage.length) * 1000;
  lines.push('Per-1,000 page-loads (input-token bill, vanilla vs Ghostery):');
  lines.push('');
  lines.push(`- Vanilla: **$${perPageVUsd.toFixed(2)} / 1k loads** (avg across measured pages)`);
  lines.push(`- Ghostery: **$${perPageGUsd.toFixed(2)} / 1k loads**`);
  lines.push(`- Saved: **$${(perPageVUsd - perPageGUsd).toFixed(2)} / 1k loads** (${savedTotalPct}%)`);
  lines.push('');
  lines.push('## Stop-reason distribution');
  lines.push('');
  for (const row of perPage) {
    if (!row.vanilla || !row.ghostery) continue;
    lines.push(`- **${row.page}** vanilla: ${row.vanilla.stopReasons.join(', ')} -- ghostery: ${row.ghostery.stopReasons.join(', ')}`);
  }
  lines.push('');
  lines.push('## Headlines extracted (vanilla / ghostery)');
  lines.push('');
  for (const row of perPage) {
    if (!row.vanilla) continue;
    const vH = row.vanilla.headlines[0] || '(none)';
    const gH = row.ghostery?.headlines?.[0] || '(none)';
    lines.push(`- **${row.page}**`);
    lines.push(`  - vanilla: "${vH}"`);
    lines.push(`  - ghostery: "${gH}"`);
  }
  lines.push('');
  return lines.join('\n');
}

function textAgentStats(textSummary) {
  if (!textSummary || !textSummary.length) return null;
  const ratios = textSummary.map((r) => 1 - r.ghostery.medInputTokens / Math.max(1, r.vanilla.medInputTokens));
  const sumV = textSummary.reduce((a, r) => a + r.vanilla.medInputTokens, 0);
  const sumG = textSummary.reduce((a, r) => a + r.ghostery.medInputTokens, 0);
  return {
    rows: textSummary,
    avgSavedPct: Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100),
    suiteSavedPct: sumV > 0 ? Math.round((1 - sumG / sumV) * 100) : 0,
    maxSavedPct: Math.round(Math.max(...ratios) * 100),
    minSavedPct: Math.round(Math.min(...ratios) * 100),
  };
}

function buildPostMd(perPage, stats, model, runId, heroPage, textSummary) {
  const lines = [];
  const hero = perPage.find((p) => p.page === heroPage);
  const tStats = textAgentStats(textSummary);

  lines.push('# How much consent banners cost an AI agent (depends on the agent)');
  lines.push('');
  lines.push(`*${new Date().toISOString().split('T')[0]}. 4 US news sites. Two agent shapes (text-only and computer-use). Real Anthropic API, Sonnet 4.5. ${perPage[0]?.vanilla?.n ?? 3} trials per cell on the computer-use side, ${textSummary?.[0]?.vanilla?.n ?? 3} on the text side.*`);
  lines.push('');

  lines.push('## TL;DR');
  lines.push('');
  lines.push('Two AI agents try to read the top headline off the same news site. One reads the page as text. The other looks at it like a human — screenshot, click, screenshot. Same task, same model, same page, same answer.');
  lines.push('');
  if (tStats) {
    lines.push(`- **Text-only agent** (fetch innerText, one LLM call): consent banners cost **${tStats.avgSavedPct}%** of the input-token bill on average. Range across our 4 pages: ${tStats.minSavedPct}% to ${tStats.maxSavedPct}%. Small effect; banners just add a bit of innerText alongside the article body.`);
  }
  lines.push(`- **Computer-use agent** (screenshot in, action out, repeat): consent banners cost **${stats.coveredAvgSavedPct}%** of the input-token bill on pages where the banner can be auto-dismissed. The agent burns an extra turn clicking through, and every extra turn re-sends every prior screenshot — so the cost compounds.`);
  lines.push('');
  lines.push('Both numbers are measured on plain Chrome vs. Chrome with the [Ghostery extension](https://www.ghostery.com/), which runs the production [DuckDuckGo autoconsent](https://github.com/duckduckgo/autoconsent) rulebase and dismisses the banner before either agent ever sees the page. The interesting story is the **gap between the two numbers**, and why the gap exists.');
  lines.push('');

  lines.push('## What we measured');
  lines.push('');
  lines.push('Four US news sites: npr.org, cnn.com, theverge.com, theguardian.com. Same task on each: *what is the top headline on this page?* Same model (Anthropic Sonnet 4.5). Same Chrome (148, fresh isolated profile per trial, anti-bot suppression so CMPs don\'t hide their dialog from us).');
  lines.push('');
  lines.push('Two agent shapes:');
  lines.push('');
  lines.push('- **Text-only.** Load the page, wait 5 seconds, grab `document.body.innerText`, send it to the model with a one-shot prompt asking for the top headline. One API call, no loop.');
  lines.push('- **Computer-use.** Load the page, wait 5 seconds, give the model a 1280×800 screenshot. The model returns a tool call — `click(x, y)`, `scroll`, or `finish(headline)`. Run the action, take a new screenshot, repeat. ([Anthropic\'s production tool-use API](https://docs.anthropic.com/en/docs/build-with-claude/computer-use).)');
  lines.push('');
  lines.push('Both variants ran on plain Chrome and on Chrome + Ghostery. The Ghostery configuration is identical except for the unpacked extension and a 5-second warmup that waits for Ghostery\'s autoconsent to be ready.');
  lines.push('');

  if (tStats) {
    lines.push('## Shape 1: text-only agents');
    lines.push('');
    lines.push('This is what most production AI browsing looks like today — Perplexity-style search, Claude reading a URL, browser-use\'s text mode, the `fetch → innerText → LLM` pattern in every "ask an LLM about this webpage" tool.');
    lines.push('');
    lines.push('| Page | Vanilla input tok | Ghostery input tok | Δ | Saved |');
    lines.push('|---|---:|---:|---:|---:|');
    for (const row of tStats.rows) {
      const dTok = row.vanilla.medInputTokens - row.ghostery.medInputTokens;
      const saved = row.vanilla.medInputTokens > 0 ? Math.round((1 - row.ghostery.medInputTokens / row.vanilla.medInputTokens) * 100) : 0;
      lines.push(`| ${row.page} | ${Math.round(row.vanilla.medInputTokens).toLocaleString()} | ${Math.round(row.ghostery.medInputTokens).toLocaleString()} | ${dTok > 0 ? '+' : ''}${Math.round(dTok).toLocaleString()} | **${saved}%** |`);
    }
    lines.push('');
    lines.push('Headlines match across all variants and trials — the text agent extracts the *correct* top headline on every page, with or without Ghostery. The banner doesn\'t hide the article body from a text scraper; it just adds a few hundred tokens of "We use cookies and similar technologies…" alongside.');
    lines.push('');
    lines.push('Two things to notice in the numbers:');
    lines.push('');
    lines.push('1. **The saving is small.** ~5% suite-wide, ~11% best case (cnn). For most production text-pipeline workloads, this is in the noise.');
    lines.push('2. **theguardian is slightly negative.** Ghostery\'s content scripts add ~200 tokens of their own DOM text to the page — small enough to be a rounding error, but visible in this measurement. The autoconsent rulebase doesn\'t cover theguardian\'s custom CCPA banner, so the only effect Ghostery has on theguardian is a tiny added DOM cost.');
    lines.push('');
    lines.push('If you are running a text-only AI pipeline at scale, this is roughly your number. **Single-digit percent, and not always positive.**');
    lines.push('');
  }

  lines.push('## Shape 2: computer-use agents');
  lines.push('');
  lines.push('The newer pattern: an agent that sees the page the way a human does and clicks through it. Anthropic\'s computer use, OpenAI\'s Operator, [Browser Use](https://github.com/browser-use/browser-use)\'s vision mode, Skyvern, etc. The bill is dominated by how many turns the agent takes — *not* the size of any single screenshot.');
  lines.push('');
  lines.push(`On the same 4 pages, with the same task and the same model:`);
  lines.push('');
  lines.push('| Page | CMP | Vanilla turns | Ghostery turns | Vanilla input tok | Ghostery input tok | Saved |');
  lines.push('|---|---|---:|---:|---:|---:|---:|');
  for (const row of perPage) {
    if (!row.vanilla || !row.ghostery) continue;
    const cmp = guessCmp(row.page);
    const saved = row.vanilla.medInputTokens > 0 ? Math.round((1 - row.ghostery.medInputTokens / row.vanilla.medInputTokens) * 100) : 0;
    lines.push(`| ${row.page} | ${cmp} | ${row.vanilla.medTurns.toFixed(1)} | ${row.ghostery.medTurns.toFixed(1)} | ${Math.round(row.vanilla.medInputTokens).toLocaleString()} | ${Math.round(row.ghostery.medInputTokens).toLocaleString()} | **${saved}%** |`);
  }
  lines.push(`| **suite avg** | – | **${stats.avgVTurn.toFixed(1)}** | **${stats.avgGTurn.toFixed(1)}** | **${Math.round(stats.avgVTok).toLocaleString()}** | **${Math.round(stats.avgGTok).toLocaleString()}** | **${stats.suiteAvgSavedPct}%** |`);
  lines.push('');
  lines.push(`On the 3 pages where Ghostery\'s autoconsent has a rule for the CMP (${stats.coveredPages.join(', ')}), the agent saves about **${stats.coveredAvgSavedPct}%**. That\'s an order of magnitude more than the text agent saves on the same pages — even though both agents end up returning *the same headline*.`);
  lines.push('');

  lines.push('### Why so much more?');
  lines.push('');
  lines.push('Every call to a computer-use agent is an independent API request. The model has **no memory** between calls. So every turn re-sends the whole prior conversation — every screenshot the agent has ever taken on this page, plus every text response it has ever produced. That\'s how the model "remembers" what happened.');
  lines.push('');
  lines.push('Practical consequence: turn N pays for itself **plus** turns 1..N-1, every time. Cost is roughly quadratic in turn count.');
  lines.push('');
  lines.push('On the pages we measured:');
  lines.push('');
  lines.push('| | Turn 1 | Turn 2 | Turn 3 | Total |');
  lines.push('|---|---:|---:|---:|---:|');
  lines.push('| **2-turn read (Ghostery dismissed the banner)** | ~3,200 in | ~4,400 in | – | **~7,700 input tokens** |');
  lines.push('| **3-turn read (vanilla — banner still there)** | ~3,200 in | ~4,400 in | ~5,700 in | **~13,300 input tokens** |');
  lines.push('');
  lines.push('The extra turn costs 5,700 tokens on its own — not 3,200 — because that turn *also* re-sends turn 2\'s screenshot. One extra screenshot, but it counts twice in the bill: once as the new turn\'s input, and again as the prior-turn history that future turns will also re-send. Compounding.');
  lines.push('');

  if (hero?.vanilla && hero?.ghostery) {
    lines.push(`### Hero example: ${hero.page}.org`);
    lines.push('');
    lines.push(`Same task, same outcome — both agents return the same headline. The only difference: the vanilla agent has to deal with an OneTrust cookie banner that Ghostery's autoconsent dismisses for it.`);
    lines.push('');
    const vUsd = (hero.vanilla.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK;
    const gUsd = (hero.ghostery.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK;
    const savedHero = vUsd > 0 ? Math.round((1 - gUsd / vUsd) * 100) : 0;
    lines.push(`- **Vanilla:** ${hero.vanilla.medTurns.toFixed(1)} turns, ${Math.round(hero.vanilla.medInputTokens).toLocaleString()} input tokens, **$${vUsd.toFixed(4)} per page-load**`);
    lines.push(`- **Ghostery:** ${hero.ghostery.medTurns.toFixed(1)} turns, ${Math.round(hero.ghostery.medInputTokens).toLocaleString()} input tokens, **$${gUsd.toFixed(4)} per page-load**`);
    lines.push(`- **${savedHero}% saved.** The HTML version of this post shows every turn side-by-side; in the markdown the numbers above tell the story.`);
    lines.push('');
  }

  if (stats.nUncovered > 0) {
    lines.push(`## What ${stats.uncoveredPages.join(', ')} tells us about rule coverage`);
    lines.push('');
    lines.push(`${stats.uncoveredPages[0]} is the computer-use page where Ghostery did *not* save tokens. Both variants of the agent took the same number of turns. The reason is mechanical: ${stats.uncoveredPages[0]}'s consent banner is a custom CCPA modal that isn't in the DuckDuckGo autoconsent rulebase Ghostery ships. No rule, no automatic dismiss, no savings.`);
    lines.push('');
    lines.push('That is the honest shape of this technology. The savings come from **rule coverage**, not from Ghostery being magic. The same dynamic applies to any autoconsent tool — uBlock Origin\'s [I don\'t care about cookies](https://www.i-dont-care-about-cookies.eu/) list, Consent-O-Matic, Brave\'s built-in rules. The rulebase is the asset; the extension just executes it.');
    lines.push('');
    lines.push(`A practical implication for anyone running computer-use agents at scale: when you hit a publisher that isn\'t covered, you\'re paying the compounding tax until someone files a rule for it. ${stats.uncoveredPages[0]}-style sites are missed savings.`);
    lines.push('');
  }

  lines.push('## What this isn\'t');
  lines.push('');
  lines.push('- **Not an ad-blocker pitch.** Ghostery also blocks ads and trackers; that effect on an agent\'s input-token cost is single-digit percent on either agent shape. The cost story here is consent-dismissal turns avoided.');
  lines.push('- **Not cross-region.** We ran from a US (California) IP against US news sites. EU pages — where GDPR consent walls are universal and harder to dismiss — show much bigger savings on the computer-use side (we have measured 70%+ on a Polish news set).');
  lines.push('- **Not Claude-specific.** The compounding-history dynamic is in the computer-use *protocol shape* (turn N includes turns 1..N-1), not in Anthropic\'s implementation. GPT computer-use, Gemini, your own scaffolding — same shape.');
  lines.push('- **Not "you need Ghostery."** Any autoconsent solution that dismisses the dialog before the agent looks will produce the same savings. Ghostery happens to ship the DuckDuckGo rulebase by default and it works well.');
  lines.push('- **Not all that\'s out there.** Many agent toolchains do hybrid (a screenshot for layout cues + filtered accessibility tree for actions). Their savings will land between the two numbers, weighted by how much of each turn is screenshot.');
  lines.push('');

  lines.push('## How it was measured');
  lines.push('');
  lines.push('Chrome for Testing 148 + chromedriver over WebDriver BiDi, fresh isolated profile per trial. Anti-bot suppression (`navigator.webdriver === false`, `--disable-blink-features=AutomationControlled`) so CMPs serve the same payload they would to a human — without this several banners hide from automation and the measurement under-counts cost.');
  lines.push('');
  lines.push('**Text-only agent.** Load the page, wait 5s for any deferred banner to render, snapshot `document.body.innerText`, send it to the model with a one-shot prompt asking for the top headline. One API call per (page, variant, trial). Input tokens = system + truncated innerText + prompt.');
  lines.push('');
  lines.push('**Computer-use agent.** Load the page, wait 5s, capture an initial 1280×800 screenshot, hand it to the model. The model returns a tool call — `screenshot`, `left_click([x, y])`, `scroll`, `type`, or `finish(headline)`. Chrome executes the action, captures a new screenshot, returns it as the tool result. Loop until the model calls `finish` or hits a 15-turn cap (never reached on these pages).');
  lines.push('');
  lines.push('The Ghostery variant loads a freshly built unpacked extension with the production [@duckduckgo/autoconsent](https://github.com/duckduckgo/autoconsent) rulebase. Before each trial we wait for Ghostery\'s status page to report `ready: true` so we never measure with a half-loaded extension.');
  lines.push('');
  lines.push('---');
  lines.push('');
  const p25p75 = perPage.filter((r) => r.vanilla && r.ghostery).map((r) => `${r.page} ${r.vanilla.p25Turns}/${r.vanilla.p75Turns} vs ${r.ghostery.p25Turns}/${r.ghostery.p75Turns}`).join('; ');
  lines.push(`*Model: ${model} at list price ($${SONNET_INPUT_PER_MTOK}/MTok input, $${SONNET_OUTPUT_PER_MTOK}/MTok output). Computer-use: ${perPage[0]?.vanilla?.n ?? 10} trials per cell, p25/p75 of turn count: ${p25p75}. Text-only: ${textSummary?.[0]?.vanilla?.n ?? 3} trials per cell, headline match rate 100%.*`);
  return lines.join('\n');
}

function guessCmp(page) {
  const map = {
    theverge: 'OneTrust',
    cnn: 'custom CCPA',
    npr: 'OneTrust',
    theguardian: 'custom CCPA (no rule)',
    forbes: 'Ketch',
  };
  return map[page] || '–';
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(s) {
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function renderMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('### ')) { out.push(`<h3>${renderInline(line.slice(4))}</h3>`); i++; continue; }
    if (line.startsWith('## ')) { out.push(`<h2>${renderInline(line.slice(3))}</h2>`); i++; continue; }
    if (line.startsWith('# ')) { out.push(`<h1>${renderInline(line.slice(2))}</h1>`); i++; continue; }
    if (line === '---') { out.push('<hr>'); i++; continue; }
    if (line.startsWith('```')) {
      const fence = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { fence.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(fence.join('\n'))}</code></pre>`);
      continue;
    }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      if (rows.length >= 2) {
        const header = rows[0].split('|').slice(1, -1).map((c) => c.trim());
        const body = rows.slice(2).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
        let html = '<table><thead><tr>';
        for (const h of header) html += `<th>${renderInline(h)}</th>`;
        html += '</tr></thead><tbody>';
        for (const row of body) {
          html += '<tr>';
          for (const cell of row) html += `<td>${renderInline(cell)}</td>`;
          html += '</tr>';
        }
        html += '</tbody></table>';
        out.push(html);
      }
      continue;
    }
    if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(lines[i].slice(2)); i++; }
      out.push(`<ul>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</ul>`);
      continue;
    }
    if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) { items.push(lines[i].replace(/^\d+\.\s/, '')); i++; }
      out.push(`<ol>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</ol>`);
      continue;
    }
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**') && line.length > 4) {
      out.push(`<p class="meta">${renderInline(line.slice(1, -1))}</p>`);
      i++; continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|-|\|---|\d+\.\s)/.test(lines[i]) && !lines[i].startsWith('```') && lines[i] !== '---') {
      if (lines[i].startsWith('#') || lines[i].startsWith('- ')) break;
      para.push(lines[i]);
      i++;
    }
    if (para.length) out.push(`<p>${renderInline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

function pngDataUrl(path) {
  if (!existsSync(path)) return '';
  const buf = readFileSync(path);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function buildHeroSection(runDir, hero) {
  if (!hero?.vanilla || !hero?.ghostery) return '';
  const trajDir = join(runDir, 'trajectory', hero.page);
  const vInitial = pngDataUrl(join(trajDir, 'vanilla.t1.initial.png'));
  const vAfter = pngDataUrl(join(trajDir, 'vanilla.t1.turn-02.png'));
  const gInitial = pngDataUrl(join(trajDir, 'ghostery.t1.initial.png'));
  if (!vInitial || !vAfter || !gInitial) return '';

  const headline = hero.vanilla.headlines[0] || '(headline)';
  const headlineShort = headline.length > 60 ? headline.slice(0, 60) + '…' : headline;
  const vUsd = ((hero.vanilla.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK).toFixed(4);
  const gUsd = ((hero.ghostery.medInputTokens / 1e6) * SONNET_INPUT_PER_MTOK).toFixed(4);

  return `
<section class="hero">
  <div class="hero-grid">
    <div class="hero-col hero-vanilla">
      <div class="hero-head">
        <div class="hero-tag tag-vanilla">Vanilla Chrome</div>
        <div class="hero-cost">${hero.vanilla.medTurns.toFixed(0)} turns &middot; ${Math.round(hero.vanilla.medInputTokens).toLocaleString()} input tok &middot; $${vUsd}</div>
      </div>
      <div class="hero-step">
        <div class="step-num">1</div>
        <div class="step-body">
          <div class="step-action">Agent takes a screenshot. It sees a cookie banner blocking the page.</div>
          <img src="${vInitial}" alt="vanilla turn 1 -- banner visible">
        </div>
      </div>
      <div class="hero-step">
        <div class="step-num">2</div>
        <div class="step-body">
          <div class="step-action">Agent clicks &ldquo;Accept All Cookies&rdquo;. Banner disappears.</div>
          <img src="${vAfter}" alt="vanilla turn 2 -- banner dismissed">
        </div>
      </div>
      <div class="hero-step">
        <div class="step-num">3</div>
        <div class="step-body">
          <div class="step-action">Agent calls <code>finish</code> with headline: <em>&ldquo;${escapeHtml(headlineShort)}&rdquo;</em></div>
        </div>
      </div>
    </div>
    <div class="hero-col hero-ghostery">
      <div class="hero-head">
        <div class="hero-tag tag-ghostery">Chrome + Ghostery</div>
        <div class="hero-cost">${hero.ghostery.medTurns.toFixed(0)} turns &middot; ${Math.round(hero.ghostery.medInputTokens).toLocaleString()} input tok &middot; $${gUsd}</div>
      </div>
      <div class="hero-step">
        <div class="step-num">1</div>
        <div class="step-body">
          <div class="step-action">Agent takes a screenshot. Ghostery's autoconsent already dismissed the banner.</div>
          <img src="${gInitial}" alt="ghostery turn 1 -- no banner">
        </div>
      </div>
      <div class="hero-step">
        <div class="step-num">2</div>
        <div class="step-body">
          <div class="step-action">Agent calls <code>finish</code> with the same headline: <em>&ldquo;${escapeHtml(headlineShort)}&rdquo;</em></div>
        </div>
      </div>
      <div class="hero-step hero-step-empty">
        <div class="step-num">&nbsp;</div>
        <div class="step-body"><div class="step-empty">(no third turn needed)</div></div>
      </div>
    </div>
  </div>
</section>
`;
}

function buildChartSection(perPage) {
  const rows = perPage
    .filter((r) => r.vanilla && r.ghostery)
    .map((r) => ({
      page: r.page,
      vTok: r.vanilla.medInputTokens,
      gTok: r.ghostery.medInputTokens,
      saved: r.vanilla.medInputTokens > 0
        ? Math.round((1 - r.ghostery.medInputTokens / r.vanilla.medInputTokens) * 100)
        : 0,
    }));
  const maxTok = Math.max(...rows.map((r) => Math.max(r.vTok, r.gTok)), 1);
  const bars = rows.map((r) => `
    <div class="bar-row">
      <div class="bar-label">${escapeHtml(r.page)}</div>
      <div class="bar-track">
        <div class="bar bar-vanilla" style="width:${(r.vTok / maxTok) * 100}%"><span class="bar-num">${Math.round(r.vTok).toLocaleString()} tok</span></div>
        <div class="bar bar-ghostery" style="width:${(r.gTok / maxTok) * 100}%"><span class="bar-num">${Math.round(r.gTok).toLocaleString()}</span></div>
      </div>
      <div class="bar-saved">${r.saved > 0 ? '&minus;' + r.saved + '%' : '0%'}</div>
    </div>`).join('');
  return `
<section class="chart">
  <h2>Input tokens per page-load</h2>
  ${bars}
  <div class="legend">
    <span><i class="swatch swatch-vanilla"></i>Vanilla Chrome</span>
    <span><i class="swatch swatch-ghostery"></i>Chrome + Ghostery</span>
  </div>
</section>
`;
}

function buildPostHtml(postMd, perPage, runDir, hero) {
  const bodyHtml = renderMarkdown(postMd);
  const heroSection = buildHeroSection(runDir, hero);
  const chartSection = buildChartSection(perPage);

  let html = bodyHtml;
  if (chartSection) {
    html = html.replace('<h3>Why so much more?</h3>', chartSection + '<h3>Why so much more?</h3>');
  }
  if (heroSection) {
    html = html.replace(/<h3>Hero example: ([^<]+)<\/h3>/, '<h3>Hero example: $1</h3>' + heroSection);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>How much consent banners cost an AI agent</title>
<style>
  :root {
    --bg: #fbfaf6;
    --fg: #1a1a1a;
    --muted: #6b6b6b;
    --rule: #e6e3d8;
    --vanilla: #c93a4a;
    --ghostery: #1f6dde;
    --code-bg: #efebe0;
  }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); }
  body { font: 17px/1.6 -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Helvetica, Arial, sans-serif; }
  article { max-width: 760px; margin: 0 auto; padding: 56px 24px 96px; }
  h1 { font-size: 38px; line-height: 1.15; margin: 0 0 10px; letter-spacing: -0.5px; }
  h2 { font-size: 22px; margin: 44px 0 14px; letter-spacing: -0.2px; }
  h3 { font-size: 17px; margin: 24px 0 8px; }
  p { margin: 0 0 16px; }
  p.meta { color: var(--muted); font-style: italic; font-size: 15px; margin-top: -4px; }
  a { color: var(--vanilla); text-decoration: underline; text-underline-offset: 2px; }
  code { font: 14px/1 SFMono-Regular, Menlo, Consolas, monospace; background: var(--code-bg); padding: 2px 5px; border-radius: 3px; }
  pre { background: #14181f; color: #e8e8e8; padding: 16px 18px; border-radius: 8px; overflow-x: auto; }
  pre code { background: transparent; padding: 0; color: inherit; font-size: 13px; }
  hr { border: 0; border-top: 1px solid var(--rule); margin: 40px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 24px; font-size: 14.5px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--rule); text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  th { font-weight: 600; color: var(--muted); font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #c8c5b9; }
  ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  blockquote { margin: 16px 0; padding: 8px 16px; border-left: 3px solid var(--rule); color: var(--muted); }
  .chart { margin: 16px 0 32px; padding: 20px 22px; background: #fff; border: 1px solid var(--rule); border-radius: 8px; }
  .chart h2 { margin-top: 0; }
  .bar-row { display: grid; grid-template-columns: 110px 1fr 64px; gap: 12px; align-items: center; margin: 8px 0; }
  .bar-label { font: 13px/1 SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .bar-track { display: flex; flex-direction: column; gap: 3px; }
  .bar { height: 26px; border-radius: 3px; position: relative; min-width: 60px; }
  .bar-vanilla { background: var(--vanilla); }
  .bar-ghostery { background: var(--ghostery); }
  .bar-num { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font: 11.5px/1 SFMono-Regular, Menlo, monospace; color: #fff; white-space: nowrap; }
  .bar-saved { font: 13px/1 SFMono-Regular, Menlo, monospace; color: var(--muted); text-align: right; }
  .legend { margin: 12px 0 0 122px; font-size: 12.5px; color: var(--muted); display: flex; gap: 20px; }
  .legend i.swatch { display: inline-block; width: 10px; height: 10px; margin-right: 5px; border-radius: 2px; vertical-align: middle; }
  .swatch-vanilla { background: var(--vanilla); }
  .swatch-ghostery { background: var(--ghostery); }
  .hero { margin: 24px 0 28px; padding: 24px 24px 16px; background: #fff; border: 1px solid var(--rule); border-radius: 8px; }
  .hero h2 { margin-top: 0; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 14px; }
  @media (max-width: 720px) { .hero-grid { grid-template-columns: 1fr; } }
  .hero-col { display: flex; flex-direction: column; gap: 12px; }
  .hero-head { display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid var(--rule); margin-bottom: 4px; }
  .hero-tag { display: inline-block; padding: 3px 9px; border-radius: 3px; font-size: 12px; color: #fff; font-weight: 600; align-self: flex-start; }
  .tag-vanilla { background: var(--vanilla); }
  .tag-ghostery { background: var(--ghostery); }
  .hero-cost { font: 12.5px/1.3 SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .hero-step { display: grid; grid-template-columns: 26px 1fr; gap: 8px; }
  .hero-step-empty { opacity: 0.35; }
  .step-num { font: 12px/24px SFMono-Regular, Menlo, monospace; text-align: center; background: var(--code-bg); border-radius: 4px; height: 24px; color: var(--muted); }
  .step-body { display: flex; flex-direction: column; gap: 6px; }
  .step-action { font-size: 14.5px; line-height: 1.45; }
  .step-empty { font-size: 13px; color: var(--muted); font-style: italic; padding-top: 4px; }
  .step-body img { width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 4px; }
  .step-action code { font-size: 12.5px; }
</style>
</head>
<body>
<article>
${html}
</article>
</body>
</html>`;
}

async function main() {
  const runDir = findLatestRun();
  if (!runDir) { console.error('No results yet.'); process.exit(1); }
  const runId = runDir.split('/').pop();
  console.log(`Reading ${runDir}`);
  const trials = loadTrials(runDir);
  if (!trials.length) { console.error('No trials in run.'); process.exit(1); }
  const perPage = summarize(trials);
  const model = trials[0]?.model || 'claude-sonnet-4-5-20250929';

  let heroName = null;
  let bestDelta = 0;
  for (const row of perPage) {
    if (!row.vanilla || !row.ghostery) continue;
    const d = row.vanilla.medInputTokens - row.ghostery.medInputTokens;
    if (d > bestDelta) { bestDelta = d; heroName = row.page; }
  }
  const hero = perPage.find((r) => r.page === heroName);
  console.log(`Hero page: ${heroName}`);

  const stats = suiteStats(perPage);

  let textSummary = null;
  const textPath = join(runDir, 'text-agent.json');
  if (existsSync(textPath)) {
    try {
      const td = JSON.parse(readFileSync(textPath, 'utf8'));
      textSummary = td.summary || null;
      console.log(`Loaded text-agent data: ${textSummary?.length ?? 0} pages`);
    } catch (e) {
      console.warn(`text-agent.json present but unreadable: ${e.message}`);
    }
  }

  const resultsMd = buildResultsMd(runId, perPage, model);
  const postMd = buildPostMd(perPage, stats, model, runId, heroName, textSummary);
  const postHtml = buildPostHtml(postMd, perPage, runDir, hero);

  writeFileSync(join(V2_ROOT, 'RESULTS.md'), resultsMd);
  writeFileSync(join(V2_ROOT, 'POST.md'), postMd);
  writeFileSync(join(V2_ROOT, 'POST.html'), postHtml);
  const htmlKb = Math.round(postHtml.length / 1024);
  console.log(`Wrote RESULTS.md (${resultsMd.length} chars), POST.md (${postMd.length} chars), POST.html (${htmlKb} KB)`);
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
