import { costUsd, PRICING_USD_PER_MTOK, consentDismissOverheadTokens, CONSENT_DISMISS_AGENT_LOOPS, TOKENS_PER_AGENT_LOOP } from './cost-model.js';

const MODEL = 'sonnet-4.6';

function pct(ghostery, vanilla) {
  if (!vanilla) return '–';
  const delta = (1 - ghostery / vanilla) * 100;
  const sign = delta >= 0 ? '−' : '+';
  return `${sign}${Math.abs(delta).toFixed(1)}%`;
}

function fmtBytes(b) {
  if (b == null) return '–';
  if (b > 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`;
  if (b > 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

function fmtTokens(n) {
  if (n == null) return '–';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtUsd(n) {
  if (n == null) return '–';
  if (n < 0.01) return `$${n.toFixed(5)}`;
  return `$${n.toFixed(4)}`;
}

function totalAgentTokens(r, mode) {
  if (!r || r.error) return null;
  const text = mode === 'a11y' ? r.a11y.tokens : r.html.tokens;
  return text + r.screenshot.viewport.tokens;
}

export function renderReport(rows, { runId } = {}) {
  const byId = new Map();
  for (const r of rows) {
    if (!byId.has(r.id)) byId.set(r.id, {});
    byId.get(r.id)[r.label] = r;
  }

  const sampleCounts = rows.map((r) => r.sampleCount).filter((n) => typeof n === 'number');
  const maxSamples = sampleCounts.length ? Math.max(...sampleCounts) : 1;

  const out = [];
  out.push('# Ghostery cost-savings benchmark');
  out.push('');
  if (runId) out.push(`Run: \`${runId}\`  `);
  out.push(`Model assumed for $: **${MODEL}** (input @ $${PRICING_USD_PER_MTOK[MODEL]}/MTok)  `);
  out.push(`Viewport: 1280×800. Image tokens: Anthropic formula (resize to 1568px long edge, `);
  out.push(`then ⌈w·h/750⌉). Text tokens: cl100k_base BPE (close approximation).`);
  if (maxSamples > 1) {
    out.push('');
    out.push(`Samples: up to **${maxSamples} per (page, variant)** — cells show the median. Per-sample values + p25/p75/min/max are in each \`<variant>.metrics.json\` under \`.stats\`.`);
  }
  out.push('');

  out.push('## Consent / blocking summary');
  out.push('');
  out.push('| Page | Vanilla rendered? | Vanilla consent banner? | Ghostery rendered? | Ghostery consent banner? | Verdict |');
  out.push('|---|:-:|:-:|:-:|:-:|---|');
  for (const [id, byLabel] of byId) {
    const v = byLabel.vanilla;
    const g = byLabel.ghostery;
    const vRender = v && !v.error && !v.mostlyEmpty;
    const gRender = g && !g.error && !g.mostlyEmpty;
    const vConsent = v?.consentBannerDetected;
    const gConsent = g?.consentBannerDetected;
    let verdict = 'neutral';
    if (!vRender && gRender) verdict = '**Ghostery unblocked content**';
    else if (vConsent && !gConsent) verdict = '**autoconsent dismissed banner**';
    else if (vConsent && gConsent) verdict = 'both blocked by banner';
    else if (!vRender && !gRender) verdict = 'both blocked';
    out.push(
      `| ${id} | ${vRender ? '✓' : '–'} | ${vConsent ? '⚠️' : '–'} | ${gRender ? '✓' : '–'} | ${gConsent ? '⚠️' : '–'} | ${verdict} |`,
    );
  }
  out.push('');

  out.push('## Per-page comparison');
  out.push('');
  out.push('Each token column is what the agent would pay if it consumed that artifact once.');
  out.push('`Text` = `document.body.innerText` (what the agent "reads"). `A11y` = Chromium accessibility tree.');
  out.push('Cross-origin ad iframes are opaque to text/HTML but visible in screenshots — so screenshot tokens are the most honest signal for visual cost.');
  out.push('');
  out.push(
    '| Page | Variant | HTML tok | Text tok | A11y tok | VP img tok | Full img tok | Iframes | Net req | Net bytes | Load (ms) |',
  );
  out.push(
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  );

  let totalVanillaHtml = 0,
    totalGhosteryHtml = 0,
    totalVanillaText = 0,
    totalGhosteryText = 0,
    totalVanillaA11y = 0,
    totalGhosteryA11y = 0,
    totalVanillaVp = 0,
    totalGhosteryVp = 0,
    totalVanillaFp = 0,
    totalGhosteryFp = 0,
    totalVanillaBytes = 0,
    totalGhosteryBytes = 0;

  for (const [id, byLabel] of byId) {
    const v = byLabel.vanilla;
    const g = byLabel.ghostery;

    for (const [label, r] of [
      ['vanilla', v],
      ['ghostery', g],
    ]) {
      if (!r) continue;
      if (r.error) {
        out.push(`| ${id} | ${label} | ERROR: ${r.error} | | | | | | | | |`);
        continue;
      }
      out.push(
        [
          id,
          label,
          fmtTokens(r.html.tokens),
          fmtTokens(r.innerText?.tokens ?? 0),
          fmtTokens(r.a11y.tokens),
          fmtTokens(r.screenshot.viewport.tokens),
          fmtTokens(r.screenshot.fullPage.tokens),
          r.iframeCount ?? '–',
          r.network.requests,
          fmtBytes(r.network.bytes),
          r.loadTimeMs,
        ]
          .map((x) => ` ${x} `)
          .join('|')
          .replace(/^/, '|')
          .replace(/$/, '|'),
      );
    }

    if (v && g && !v.error && !g.error) {
      out.push(
        [
          id,
          '**Δ savings**',
          pct(g.html.tokens, v.html.tokens),
          pct(g.innerText?.tokens ?? 0, v.innerText?.tokens ?? 0),
          pct(g.a11y.tokens, v.a11y.tokens),
          pct(g.screenshot.viewport.tokens, v.screenshot.viewport.tokens),
          pct(g.screenshot.fullPage.tokens, v.screenshot.fullPage.tokens),
          pct(g.iframeCount ?? 0, v.iframeCount ?? 0),
          pct(g.network.requests, v.network.requests),
          pct(g.network.bytes, v.network.bytes),
          '–',
        ]
          .map((x) => ` ${x} `)
          .join('|')
          .replace(/^/, '|')
          .replace(/$/, '|'),
      );

      totalVanillaHtml += v.html.tokens;
      totalGhosteryHtml += g.html.tokens;
      totalVanillaText += v.innerText?.tokens ?? 0;
      totalGhosteryText += g.innerText?.tokens ?? 0;
      totalVanillaA11y += v.a11y.tokens;
      totalGhosteryA11y += g.a11y.tokens;
      totalVanillaVp += v.screenshot.viewport.tokens;
      totalGhosteryVp += g.screenshot.viewport.tokens;
      totalVanillaFp += v.screenshot.fullPage.tokens;
      totalGhosteryFp += g.screenshot.fullPage.tokens;
      totalVanillaBytes += v.network.bytes;
      totalGhosteryBytes += g.network.bytes;
    }
  }

  out.push('');
  out.push('## Aggregate (sum across pages with both runs)');
  out.push('');
  out.push('| Metric | Vanilla | Ghostery | Savings |');
  out.push('|---|---:|---:|---:|');
  out.push(`| HTML tokens | ${fmtTokens(totalVanillaHtml)} | ${fmtTokens(totalGhosteryHtml)} | ${pct(totalGhosteryHtml, totalVanillaHtml)} |`);
  out.push(`| Text tokens | ${fmtTokens(totalVanillaText)} | ${fmtTokens(totalGhosteryText)} | ${pct(totalGhosteryText, totalVanillaText)} |`);
  out.push(`| A11y tokens | ${fmtTokens(totalVanillaA11y)} | ${fmtTokens(totalGhosteryA11y)} | ${pct(totalGhosteryA11y, totalVanillaA11y)} |`);
  out.push(`| Viewport image tokens | ${fmtTokens(totalVanillaVp)} | ${fmtTokens(totalGhosteryVp)} | ${pct(totalGhosteryVp, totalVanillaVp)} |`);
  out.push(`| Full-page image tokens | ${fmtTokens(totalVanillaFp)} | ${fmtTokens(totalGhosteryFp)} | ${pct(totalGhosteryFp, totalVanillaFp)} |`);
  out.push(`| Network bytes | ${fmtBytes(totalVanillaBytes)} | ${fmtBytes(totalGhosteryBytes)} | ${pct(totalGhosteryBytes, totalVanillaBytes)} |`);

  out.push('');
  out.push('## Cost translation');
  out.push('');
  out.push('Cost per page-load if the agent consumes one artifact (text + viewport image):');
  out.push('');
  out.push('| Mode | Vanilla $/load | Ghostery $/load | Saved $/load | Saved $/1k loads |');
  out.push('|---|---:|---:|---:|---:|');
  const completed = [...byId.values()].filter((b) => b.vanilla && b.ghostery && !b.vanilla.error && !b.ghostery.error);
  const numPages = completed.length || 1;

  let consentOverheadVanilla = 0;
  let consentOverheadGhostery = 0;
  for (const b of completed) {
    if (b.vanilla.consentBannerDetected && !b.ghostery.consentBannerDetected) {
      consentOverheadVanilla += consentDismissOverheadTokens();
    }
  }

  const modes = [
    { label: 'innerText + viewport screenshot', v: totalVanillaText + totalVanillaVp, g: totalGhosteryText + totalGhosteryVp },
    { label: 'A11y tree + viewport screenshot', v: totalVanillaA11y + totalVanillaVp, g: totalGhosteryA11y + totalGhosteryVp },
    { label: 'Full HTML + viewport screenshot', v: totalVanillaHtml + totalVanillaVp, g: totalGhosteryHtml + totalGhosteryVp },
    { label: 'innerText + full-page screenshot', v: totalVanillaText + totalVanillaFp, g: totalGhosteryText + totalGhosteryFp },
  ];
  for (const m of modes) {
    const vUsd = costUsd(m.v / numPages, MODEL);
    const gUsd = costUsd(m.g / numPages, MODEL);
    const saved = vUsd - gUsd;
    out.push(`| ${m.label} | ${fmtUsd(vUsd)} | ${fmtUsd(gUsd)} | ${fmtUsd(saved)} | ${fmtUsd(saved * 1000)} |`);
  }
  out.push('');
  out.push(`### + hidden cost of dismissing consent banners`);
  out.push('');
  out.push(`Assumption: an agent needs **${CONSENT_DISMISS_AGENT_LOOPS} extra loops × ${TOKENS_PER_AGENT_LOOP.toLocaleString()} tokens each** to read a consent dialog, decide on a button, and click it. That cost is paid by vanilla but skipped by Ghostery's autoconsent.`);
  out.push('');
  out.push('| Mode | Vanilla $/load (incl. consent dismiss) | Ghostery $/load | Saved $/load | Saved $/1k loads |');
  out.push('|---|---:|---:|---:|---:|');
  for (const m of modes) {
    const vUsd = costUsd((m.v + consentOverheadVanilla) / numPages, MODEL);
    const gUsd = costUsd((m.g + consentOverheadGhostery) / numPages, MODEL);
    const saved = vUsd - gUsd;
    out.push(`| ${m.label} | ${fmtUsd(vUsd)} | ${fmtUsd(gUsd)} | ${fmtUsd(saved)} | ${fmtUsd(saved * 1000)} |`);
  }
  out.push('');
  out.push(`Pages where Ghostery dismissed a banner that vanilla still showed: ${consentOverheadVanilla / consentDismissOverheadTokens()} / ${numPages}`);

  out.push('');
  out.push('## Notes');
  out.push('');
  out.push('- "Net bytes" comes from response bodies actually received by the page.');
  out.push('  Ghostery (MV3) uses declarative net request, so blocked requests do not even hit the network.');
  out.push('- "Viewport img tok" is the Anthropic-formula token cost for a 1280×800 PNG (≈1366 tokens).');
  out.push('  Differences between vanilla and Ghostery here only appear if the screenshot dimensions change.');
  out.push('  (They will differ on full-page screenshots because page height changes when ads are gone.)');
  out.push('- Ghostery warmup is an adaptive handshake against the extension status page (`pages/status/index.html`); typically ~3-5s. Falls back to a 4s sleep when the loaded extension predates the status page.');
  out.push('- Both runs use the same viewport, navigation timeout, and settle delay.');

  return out.join('\n');
}

export function renderCsv(rows) {
  const cols = [
    'id',
    'url',
    'label',
    'withGhostery',
    'loadTimeMs',
    'iframeCount',
    'emptyIframes',
    'network.requests',
    'network.errors',
    'network.bytes',
    'html.bytes',
    'html.tokens',
    'innerText.bytes',
    'innerText.tokens',
    'a11y.bytes',
    'a11y.tokens',
    'screenshot.viewport.width',
    'screenshot.viewport.height',
    'screenshot.viewport.bytes',
    'screenshot.viewport.tokens',
    'screenshot.fullPage.width',
    'screenshot.fullPage.height',
    'screenshot.fullPage.bytes',
    'screenshot.fullPage.tokens',
    'navError',
  ];
  const lines = [cols.join(',')];
  for (const r of rows) {
    lines.push(
      cols
        .map((c) => {
          const v = c.split('.').reduce((o, k) => (o == null ? undefined : o[k]), r);
          if (v == null) return '';
          if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`;
          return v;
        })
        .join(','),
    );
  }
  return lines.join('\n');
}
