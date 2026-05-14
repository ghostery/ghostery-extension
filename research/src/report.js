import {
  costUsd,
  PRICING_USD_PER_MTOK,
  consentDismissOverheadTokens,
  CONSENT_DISMISS_AGENT_LOOPS,
  TOKENS_PER_AGENT_LOOP,
  CONSENT_DISMISS_EXTRA_TURNS_LOW,
  CONSENT_DISMISS_EXTRA_TURNS_HIGH,
} from './cost-model.js';

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

export function renderReport(rows, { runId, consentTax, trajectoryTax, adBurden, meta } = {}) {
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
  if (meta?.region) out.push(`Region: **${String(meta.region).toUpperCase()}**  `);
  if (meta?.pageSet && meta.pageSet !== 'pages.json') out.push(`Page set: \`${meta.pageSet}\`  `);
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
  out.push('`Text` = `document.body.innerText`. `A11y(filt)` = filtered accessibility tree (drops `generic` / `StaticText` / `LineBreak` / layout-only nodes; serializes role+name+value+state — what production agents like browser-use consume). `A11y(full)` = lightly-filtered tree captured for comparison.');
  out.push('Cross-origin ad iframes are opaque to text/HTML but visible in screenshots — so screenshot tokens are the most honest signal for visual cost.');
  out.push('');
  out.push(
    '| Page | Variant | HTML tok | Text tok | A11y(filt) tok | A11y(full) tok | VP img tok | Full img tok | Iframes | Net req | Net bytes | Load (ms) |',
  );
  out.push(
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  );

  let totalVanillaHtml = 0,
    totalGhosteryHtml = 0,
    totalVanillaText = 0,
    totalGhosteryText = 0,
    totalVanillaA11y = 0,
    totalGhosteryA11y = 0,
    totalVanillaA11yF = 0,
    totalGhosteryA11yF = 0,
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
        out.push(`| ${id} | ${label} | ERROR: ${r.error} | | | | | | | | | |`);
        continue;
      }
      out.push(
        [
          id,
          label,
          fmtTokens(r.html.tokens),
          fmtTokens(r.innerText?.tokens ?? 0),
          fmtTokens(r.a11yFiltered?.tokens ?? 0),
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
          pct(g.a11yFiltered?.tokens ?? 0, v.a11yFiltered?.tokens ?? 0),
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
      totalVanillaA11yF += v.a11yFiltered?.tokens ?? 0;
      totalGhosteryA11yF += g.a11yFiltered?.tokens ?? 0;
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
  out.push(`| A11y(filtered) tokens | ${fmtTokens(totalVanillaA11yF)} | ${fmtTokens(totalGhosteryA11yF)} | ${pct(totalGhosteryA11yF, totalVanillaA11yF)} |`);
  out.push(`| A11y(full) tokens | ${fmtTokens(totalVanillaA11y)} | ${fmtTokens(totalGhosteryA11y)} | ${pct(totalGhosteryA11y, totalVanillaA11y)} |`);
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
    { label: 'A11y(filtered) + viewport screenshot', v: totalVanillaA11yF + totalVanillaVp, g: totalGhosteryA11yF + totalGhosteryVp },
    { label: 'A11y(full) + viewport screenshot', v: totalVanillaA11y + totalVanillaVp, g: totalGhosteryA11y + totalGhosteryVp },
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

  const bannerPageIds = [];
  for (const [id, b] of byId) {
    if (b.vanilla && b.ghostery && !b.vanilla.error && !b.ghostery.error
        && b.vanilla.consentBannerDetected && !b.ghostery.consentBannerDetected) {
      bannerPageIds.push(id);
    }
  }
  const numBannerPages = bannerPageIds.length;

  let measuredAvgPerTurn = null;
  if (consentTax && Array.isArray(consentTax.perPage) && numBannerPages > 0) {
    const taxByPage = new Map(consentTax.perPage.map((r) => [r.page, r.vanillaInputTokens]));
    const turnTokens = bannerPageIds
      .map((id) => taxByPage.get(id))
      .filter((n) => typeof n === 'number');
    if (turnTokens.length) {
      measuredAvgPerTurn = Math.round(turnTokens.reduce((a, b) => a + b, 0) / turnTokens.length);
    }
  }

  if (measuredAvgPerTurn != null) {
    out.push(
      `Measured per-turn agent cost on the ${numBannerPages} banner page${numBannerPages === 1 ? '' : 's'} ` +
      `(Anthropic \`messages.countTokens\` over system + viewport screenshot + 8 kB \`innerText\`): ` +
      `**${measuredAvgPerTurn.toLocaleString()} input tokens / turn** (average vanilla). ` +
      `An agent that has to dismiss the banner pays this for **${CONSENT_DISMISS_EXTRA_TURNS_LOW}–${CONSENT_DISMISS_EXTRA_TURNS_HIGH} extra turns**; Ghostery's autoconsent skips it entirely.`,
    );
    out.push('');
    const scenarios = [
      { turns: CONSENT_DISMISS_EXTRA_TURNS_LOW, note: 'conservative' },
      { turns: CONSENT_DISMISS_EXTRA_TURNS_HIGH, note: 'typical' },
    ];
    for (const { turns, note } of scenarios) {
      const overheadVanilla = measuredAvgPerTurn * turns * numBannerPages;
      out.push(`**${turns} extra turns / banner (${note}) — ${numBannerPages}/${numPages} pages dismiss:**`);
      out.push('');
      out.push('| Mode | Vanilla $/load (artifact + tax) | Ghostery $/load | Saved $/load | Saved $/1k loads | Saved % |');
      out.push('|---|---:|---:|---:|---:|---:|');
      for (const m of modes) {
        const vUsd = costUsd((m.v + overheadVanilla) / numPages, MODEL);
        const gUsd = costUsd(m.g / numPages, MODEL);
        const saved = vUsd - gUsd;
        const savedPct = vUsd > 0 ? `${(100 * saved / vUsd).toFixed(1)}%` : '–';
        out.push(`| ${m.label} | ${fmtUsd(vUsd)} | ${fmtUsd(gUsd)} | ${fmtUsd(saved)} | ${fmtUsd(saved * 1000)} | ${savedPct} |`);
      }
      out.push('');
    }
    out.push(`Pages where Ghostery dismissed a banner that vanilla still showed: ${numBannerPages} / ${numPages}`);

    if (trajectoryTax && Array.isArray(trajectoryTax.perPage) && trajectoryTax.perPage.length) {
      out.push('');
      out.push('### Layer 3 — measured trajectory tokens (per banner page)');
      out.push('');
      const trialCounts = new Set();
      for (const row of trajectoryTax.perPage) {
        trialCounts.add(row.vanilla?.n ?? 0);
        trialCounts.add(row.ghostery?.n ?? 0);
      }
      const trialNote = trialCounts.size === 1 ? `${[...trialCounts][0]} trial${[...trialCounts][0] === 1 ? '' : 's'} per (page, variant)` : `${Math.min(...trialCounts)}-${Math.max(...trialCounts)} trials per (page, variant)`;
      out.push(
        `Anthropic computer-use (${trajectoryTax.model ?? 'sonnet-4.5'}) was driven through "identify the top headline" — ${trialNote}. Numbers are averages across trials; total input tokens include every API turn (every screenshot the agent re-saw counts again).`,
      );
      out.push('');
      out.push('| Page | Vanilla turns | Vanilla input tok | Ghostery turns | Ghostery input tok | Δ turns | Δ input tok |');
      out.push('|---|---:|---:|---:|---:|---:|---:|');
      let sumDeltaTok = 0;
      let nTraj = 0;
      for (const row of trajectoryTax.perPage) {
        const vt = row.vanilla?.avgTurns ?? 0;
        const vin = Math.round(row.vanilla?.avgInputTokens ?? 0);
        const gt = row.ghostery?.avgTurns ?? 0;
        const gin = Math.round(row.ghostery?.avgInputTokens ?? 0);
        out.push(`| ${row.page} | ${vt.toFixed(1)} | ${vin.toLocaleString()} | ${gt.toFixed(1)} | ${gin.toLocaleString()} | ${(vt - gt).toFixed(1)} | ${(vin - gin).toLocaleString()} |`);
        sumDeltaTok += vin - gin;
        nTraj++;
      }
      if (nTraj > 0) {
        const avgDelta = Math.round(sumDeltaTok / nTraj);
        const measuredTax1k = costUsd(avgDelta * 0.5 * 1000, MODEL);
        out.push('');
        out.push(
          `**Average measured Ghostery saving on banner pages: ${avgDelta.toLocaleString()} input tokens per page-task.** ` +
          `At 50 % banner prevalence and Sonnet 4.5 input ($3/MTok), that's **${fmtUsd(measuredTax1k)} / 1k loads** — replaces the {2, 3}-extra-turn assumption above with a real measurement.`,
        );
        out.push('');
        out.push(`Headline cost-translation table with the measured tax (per-page artifact + measured banner cost at 50% prevalence):`);
        out.push('');
        out.push('| Mode | Vanilla $/1k (artifact + measured tax) | Ghostery $/1k | Saved $/1k | Saved % |');
        out.push('|---|---:|---:|---:|---:|');
        for (const m of modes) {
          const vUsd1k = costUsd(m.v / numPages, MODEL) * 1000 + measuredTax1k;
          const gUsd1k = costUsd(m.g / numPages, MODEL) * 1000;
          const saved = vUsd1k - gUsd1k;
          const pctStr = vUsd1k > 0 ? `${(100 * saved / vUsd1k).toFixed(1)}%` : '–';
          out.push(`| ${m.label} | ${fmtUsd(vUsd1k)} | ${fmtUsd(gUsd1k)} | ${fmtUsd(saved)} | ${pctStr} |`);
        }
      }
    }
  } else {
    out.push(
      `Assumption: an agent needs **${CONSENT_DISMISS_AGENT_LOOPS} extra loops × ${TOKENS_PER_AGENT_LOOP.toLocaleString()} tokens each** to read a consent dialog, decide on a button, and click it. That cost is paid by vanilla but skipped by Ghostery's autoconsent. (Run \`src/measure-consent-tax.js\` to replace this with the measured per-turn cost.)`,
    );
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
  }

  if (adBurden && Array.isArray(adBurden.rows) && adBurden.rows.length) {
    out.push('');
    out.push('## Ad burden — VLM inventory per viewport screenshot');
    out.push('');
    out.push(
      `Each viewport PNG was fed to ${adBurden.model ?? 'sonnet-4.5'} with the prompt "inventory what is visible on this page; split into articles / ads / navigation / other as JSON." Counts below are how many distinct items the VLM identified per category. The signal: with the same input-token cost (a fixed-size screenshot), the model extracts *more articles and fewer ads/cookie-banner items* under Ghostery.`,
    );
    out.push('');
    out.push('| Page | Variant | articles | ads | nav | other | VLM input tok | VLM output tok |');
    out.push('|---|---|---:|---:|---:|---:|---:|---:|');
    const byPage = new Map();
    for (const r of adBurden.rows) {
      if (!r) continue;
      if (!byPage.has(r.page)) byPage.set(r.page, {});
      byPage.get(r.page)[r.variant] = r;
    }
    let sumDeltaArticles = 0, sumDeltaAds = 0, sumDeltaOut = 0, deltaPages = 0;
    for (const [page, byVariant] of byPage) {
      for (const variant of ['vanilla', 'ghostery']) {
        const r = byVariant[variant];
        if (!r) continue;
        const c = r.counts ?? {};
        out.push(`| ${page} | ${variant} | ${c.articles ?? 'NA'} | ${c.ads ?? 'NA'} | ${c.navigation ?? 'NA'} | ${c.other ?? 'NA'} | ${r.usage?.input_tokens ?? 'NA'} | ${r.usage?.output_tokens ?? 'NA'} |`);
      }
      const v = byVariant.vanilla;
      const g = byVariant.ghostery;
      if (v?.counts && g?.counts) {
        const dA = (g.counts.articles ?? 0) - (v.counts.articles ?? 0);
        const dAd = (g.counts.ads ?? 0) - (v.counts.ads ?? 0);
        const dOut = (g.usage?.output_tokens ?? 0) - (v.usage?.output_tokens ?? 0);
        out.push(`| ${page} | **Δ** | ${dA >= 0 ? '+' : ''}${dA} | ${dAd >= 0 ? '+' : ''}${dAd} | – | – | – | ${dOut >= 0 ? '+' : ''}${dOut} |`);
        sumDeltaArticles += dA;
        sumDeltaAds += dAd;
        sumDeltaOut += dOut;
        deltaPages++;
      }
    }
    if (deltaPages > 0) {
      out.push('');
      out.push(
        `Aggregate over ${deltaPages} page${deltaPages === 1 ? '' : 's'} with both variants: ` +
        `**${sumDeltaArticles >= 0 ? '+' : ''}${sumDeltaArticles} articles** identified per viewport under Ghostery, ` +
        `**${sumDeltaAds >= 0 ? '+' : ''}${sumDeltaAds} ads**, ` +
        `VLM output **${sumDeltaOut >= 0 ? '+' : ''}${sumDeltaOut} tokens** vs vanilla.`,
      );
    }
  }

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
    'a11yFiltered.bytes',
    'a11yFiltered.tokens',
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
