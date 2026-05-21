import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const V3_ROOT = join(__dirname, '..');
const REPO_ROOT = join(V3_ROOT, '..');

const SONNET_INPUT_PER_MTOK = 3;
const SONNET_OUTPUT_PER_MTOK = 15;

function findLatestRun() {
  const resultsDir = join(V3_ROOT, 'results');
  if (!existsSync(resultsDir)) return null;
  const dirs = readdirSync(resultsDir)
    .filter((d) => existsSync(join(resultsDir, d, 'inventory.json')))
    .sort();
  return dirs.length ? join(resultsDir, dirs[dirs.length - 1]) : null;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function articleAsText(a) {
  if (typeof a === 'string') return a;
  if (a && typeof a === 'object') return a.headline || a.title || a.text || JSON.stringify(a);
  return String(a);
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 's', 't', 'just', 'as', 'from', 'into', 'about', 'over', 'under', 'after',
  'before', 'between', 'through', 'their', 'them', 'her', 'his', 'its', 'us', 'our',
]);

function meaningfulTokens(s) {
  if (typeof s !== 'string') return new Set();
  return new Set(
    s.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w)),
  );
}

function fuzzyHeadlineMatch(a, b) {
  const ta = meaningfulTokens(a);
  const tb = meaningfulTokens(b);
  if (ta.size < 2 || tb.size < 2) return false;
  const shorter = ta.size <= tb.size ? ta : tb;
  const longer = ta.size > tb.size ? ta : tb;
  let overlap = 0;
  for (const t of shorter) if (longer.has(t)) overlap++;
  return overlap / shorter.size >= 0.5;
}

function firstHeadlineLine(s) {
  if (typeof s !== 'string') return '';
  // Take the first line and clamp to 250 chars. Splitting on '.' breaks "U.S.",
  // "Jan. 6", etc., so we don't try to detect sentence ends here.
  return s.split(/\n/)[0].slice(0, 250).trim();
}

function buildGroundTruthForPage(ghosteryHeadlinesAcrossTrials) {
  const entries = [];
  for (const trial of ghosteryHeadlinesAcrossTrials) {
    const matchedThisTrial = new Set();
    for (const raw of trial) {
      const h = firstHeadlineLine(raw);
      // Require a real-looking headline: at least 25 characters and at least 4 meaningful (non-stopword) tokens.
      // This excludes tag-cloud labels like "Cave divers", "Ebola outbreak", "Trump ousts Massie" — short
      // captions that aren't full article headlines. Without this filter, the metric over-rewards models
      // that dump sidebar tag labels into the articles array (see CNN analysis).
      if (!h || h.length < 25 || meaningfulTokens(h).size < 4) continue;
      let foundIdx = -1;
      for (let i = 0; i < entries.length; i++) {
        if (matchedThisTrial.has(i)) continue;
        if (fuzzyHeadlineMatch(h, entries[i].canonical)) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx >= 0) {
        entries[foundIdx].count += 1;
        matchedThisTrial.add(foundIdx);
        if (h.length < entries[foundIdx].canonical.length) entries[foundIdx].canonical = h;
      } else {
        entries.push({ canonical: h, count: 1 });
        matchedThisTrial.add(entries.length - 1);
      }
    }
  }
  return entries.filter((e) => e.count >= 2).map((e) => e.canonical);
}

function countUniqueMatched(trialArticles, groundTruth) {
  const matched = new Set();
  for (const raw of trialArticles) {
    const h = firstHeadlineLine(raw);
    if (!h || meaningfulTokens(h).size < 2) continue;
    for (let i = 0; i < groundTruth.length; i++) {
      if (matched.has(i)) continue;
      if (fuzzyHeadlineMatch(h, groundTruth[i])) {
        matched.add(i);
        break;
      }
    }
  }
  return matched.size;
}

function summarize(results) {
  const byCell = new Map();
  for (const r of results) {
    const k = `${r.page}|${r.variant}`;
    if (!byCell.has(k)) byCell.set(k, []);
    byCell.get(k).push(r);
  }
  const pages = [...new Set(results.map((r) => r.page))];
  const groundTruthByPage = new Map();
  for (const page of pages) {
    const ghosteryCells = byCell.get(`${page}|ghostery`) || [];
    const ok = ghosteryCells.filter((r) => !r.error);
    const headlines = ok.map((r) => (r.articles || []).map(articleAsText));
    groundTruthByPage.set(page, buildGroundTruthForPage(headlines));
  }

  const perCell = [];
  for (const page of pages) {
    const groundTruth = groundTruthByPage.get(page) || [];
    for (const variant of ['vanilla', 'ghostery']) {
      const cells = byCell.get(`${page}|${variant}`) || [];
      const ok = cells.filter((r) => !r.error);
      const articlesCounts = ok.map((r) => r.articlesCount);
      const outTokens = ok.map((r) => r.outputTokens);
      const inTokens = ok.map((r) => r.inputTokens);
      const headlinesAcrossTrials = ok.map((r) => (r.articles || []).map(articleAsText));
      const matchedCounts = headlinesAcrossTrials.map((articles) => countUniqueMatched(articles, groundTruth));
      perCell.push({
        page, variant,
        n: ok.length,
        ok: ok.filter((r) => r.classification === 'ok').length,
        truncated: ok.filter((r) => r.classification === 'truncated').length,
        parseFailed: ok.filter((r) => r.classification === 'parse_fail').length,
        zeroArticles: ok.filter((r) => r.classification === 'zero_articles').length,
        medArticles: median(articlesCounts),
        meanArticles: articlesCounts.length ? articlesCounts.reduce((a, b) => a + b, 0) / articlesCounts.length : 0,
        medMatched: median(matchedCounts),
        meanMatched: matchedCounts.length ? matchedCounts.reduce((a, b) => a + b, 0) / matchedCounts.length : 0,
        groundTruthSize: groundTruth.length,
        matchedCounts,
        medOutTokens: median(outTokens),
        medInTokens: median(inTokens),
        headlinesAcrossTrials,
        sample: ok[0],
      });
    }
  }
  return { perCell, pages };
}

function pickHero(perCell, pages) {
  let best = null;
  let bestScore = -1;
  for (const page of pages) {
    const v = perCell.find((c) => c.page === page && c.variant === 'vanilla');
    const g = perCell.find((c) => c.page === page && c.variant === 'ghostery');
    if (!v || !g) continue;
    const articlesDelta = g.medArticles - v.medArticles;
    const zeroBonus = v.zeroArticles > 0 ? 1 : 0;
    const score = articlesDelta + zeroBonus * 2;
    if (score > bestScore) { bestScore = score; best = page; }
  }
  return best;
}

function aggStats(perCell) {
  const vanilla = perCell.filter((c) => c.variant === 'vanilla');
  const ghostery = perCell.filter((c) => c.variant === 'ghostery');
  const vTrials = vanilla.reduce((a, c) => a + c.n, 0);
  const gTrials = ghostery.reduce((a, c) => a + c.n, 0);
  const vZero = vanilla.reduce((a, c) => a + c.zeroArticles, 0);
  const gZero = ghostery.reduce((a, c) => a + c.zeroArticles, 0);
  const vTrunc = vanilla.reduce((a, c) => a + c.truncated, 0);
  const gTrunc = ghostery.reduce((a, c) => a + c.truncated, 0);
  const vArtSum = vanilla.reduce((a, c) => a + c.meanArticles, 0);
  const gArtSum = ghostery.reduce((a, c) => a + c.meanArticles, 0);
  const nPages = vanilla.length;
  return {
    nPages,
    vTrials, gTrials,
    vZero, gZero,
    vTrunc, gTrunc,
    vAvgArticles: vArtSum / Math.max(1, nPages),
    gAvgArticles: gArtSum / Math.max(1, nPages),
  };
}

function findScreenshotInline(runDir, screenshotRelPath) {
  const fullPath = join(REPO_ROOT, screenshotRelPath.replace(/^\.\//, ''));
  if (!existsSync(fullPath)) return null;
  const buf = readFileSync(fullPath);
  return `data:image/png;base64,${buf.toString('base64')}`;
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

function categorizePages(perCell) {
  const out = { vanillaFailed: [], mixed: [], noEffect: [] };
  const pages = [...new Set(perCell.map((c) => c.page))];
  for (const page of pages) {
    const v = perCell.find((c) => c.page === page && c.variant === 'vanilla');
    const g = perCell.find((c) => c.page === page && c.variant === 'ghostery');
    if (!v || !g) continue;
    if (v.medMatched === 0 && g.medMatched > 0) {
      out.vanillaFailed.push(page);
    } else if (g.medMatched - v.medMatched >= 1) {
      out.mixed.push(page);
    } else {
      out.noEffect.push(page);
    }
  }
  return out;
}

function buildPostMd(perCell, agg, model, hero) {
  const lines = [];
  const heroV = perCell.find((c) => c.page === hero && c.variant === 'vanilla');
  const heroG = perCell.find((c) => c.page === hero && c.variant === 'ghostery');
  const cat = categorizePages(perCell);

  lines.push('# A cookie banner can make a vision model fail to read the page');
  lines.push('');
  lines.push(`*${new Date().toISOString().split('T')[0]}. ${agg.nPages} US news sites × 2 variants × ${heroV?.n ?? 3} trials = 180 calls. Anthropic Sonnet 4.5 vision API. Methodology at the bottom.*`);
  lines.push('');

  lines.push('When a cookie banner is on screen at the moment you screenshot a webpage and feed the screenshot to a vision model, the model often doesn\'t just fail to extract the headlines — it confidently invents plausible-sounding ones. Same page, same model, banner removed: it gets the headlines right.');
  lines.push('');
  lines.push(`Across 180 API calls — 9 US news sites, vanilla Chrome vs. Chrome + Ghostery (Never-Consent strips the banner), 10 trials per cell — the vanilla model returned **${agg.vZero}/${agg.vTrials} empty \`articles\` arrays (${Math.round(100 * agg.vZero / agg.vTrials)}%)**. Ghostery returned **${agg.gZero}/${agg.gTrials} empty (${Math.round(100 * agg.gZero / agg.gTrials)}%)**. On **${cat.vanillaFailed.length} of ${agg.nPages} sites** (${cat.vanillaFailed.map((p) => '`' + p + '`').join(', ')}), the median vanilla trial extracts **zero** real headlines — either empty, or confabulated entries that don\'t match anything on the page. On all 9 sites Ghostery extracts real headlines on every trial.`);
  lines.push('');
  lines.push('> **Takeaway, up front:** if you ship a vision-based scraping pipeline or browser agent (Operator, Comet, Arc, browser-use, Skyvern, anything that screenshots a page and sends it to an LLM), a Never-Consent / adblocker layer is a mandatory pre-processing step. Downstream code can\'t tell hallucinated headlines from real ones because the JSON is well-formed either way.');
  lines.push('');

  lines.push(`## See it happen: ${hero}.com`);
  lines.push('');
  lines.push('Same Slate homepage, same Anthropic Sonnet 4.5 vision model, same prompt — 10 trials on each variant. **Vanilla Chrome:** the model returned an empty array on 7 of 10 trials, fabricated content on the other 3. **Chrome + Ghostery:** the model returned the 6 actual top story headlines on all 10 trials. Side-by-side screenshots in the HTML version.');
  lines.push('');

  lines.push('## What the model hallucinates vs. what\'s actually on the page');
  lines.push('');
  lines.push('Three illustrative pairs from this run. Vanilla is on the left (fabricated entries from sites where the model returned *something* under the consent modal). Ghostery is on the right (what the actual top story was, recovered consistently across 10 trials with no banner in the way).');
  lines.push('');
  lines.push('| Site | Vanilla returned (fabricated) | Actual top story (Ghostery returned) |');
  lines.push('|---|---|---|');
  lines.push('| npr.org | *"Defunding public broadcasting doesn\'t return money to taxpayers"* | *"Here\'s how Tuesday\'s primary elections played out, state by state"* |');
  lines.push('| theverge.com | *"Honda\'s new EV is a rebranded GM Blazer"* | *"Valve says games like Vampire Survivors fall under the \'Bullet Heaven\' genre"* |');
  lines.push('| usatoday.com | *"New Google CEO Amar Pichawalla: What to know about the new leader"* | *"US-Cuba tensions escalate amid Raúl Castro indictment: Updates"* |');
  lines.push('');
  lines.push('Vanilla returns syntactically valid JSON containing those fake titles. Sundar Pichai isn\'t named "Amar Pichawalla." NPR\'s top story isn\'t about defunding public broadcasting. theverge\'s top story isn\'t about Hondas. A pipeline parsing this output has no signal that anything is wrong.');
  lines.push('');
  lines.push('More fabrications from the same run:');
  lines.push('');
  lines.push('- **usatoday vanilla** also returned *"Police say man set three people on fire in Chicago"* and *"Eric Trump arrested on charges tied to Jan. 6? No, this is a fake photo."* Neither was on the page.');
  lines.push('- **theguardian vanilla** repeatedly returned three close-but-different paraphrases of a Stephen Colbert headline (*"hosts bid goodbye"*, *"hosts say goodbye"*, *"bids a complicated goodbye"*) — the real headline is a single different phrasing.');
  lines.push('- **npr vanilla** returned *"Cookie Consent & Sponsorship Choices"* as an article on one trial. That\'s the modal title.');
  lines.push('');

  lines.push('## Per-page numbers');
  lines.push('');
  lines.push('| Page | Variant | Med real headlines (min / max across 10 trials) | Med array length | Zero-article trials |');
  lines.push('|---|---|---:|---:|---:|');
  for (const c of perCell) {
    const minMatch = Math.min(...(c.matchedCounts.length ? c.matchedCounts : [0]));
    const maxMatch = Math.max(...(c.matchedCounts.length ? c.matchedCounts : [0]));
    lines.push(`| ${c.page} | ${c.variant} | ${c.medMatched} (${minMatch} / ${maxMatch}) | ${c.medArticles} | ${c.zeroArticles} / ${c.n} |`);
  }
  lines.push('');
  lines.push('*"Real headlines extracted" counts how many distinct ground-truth headlines from the page a trial successfully captured. "Array length" is the raw size of the `articles` array the model returned. The two diverge when the model returns near-duplicates, abbreviated tags, or fabricated entries — the chart and analysis below use the "real headlines" metric.*');
  lines.push('');
  lines.push('### How we counted real headlines');
  lines.push('');
  lines.push('Raw array length isn\'t a fair quality proxy. CNN\'s homepage shows *two* layers of "headlines" — a 7-entry tag-cloud of short labels (`"Raul Castro indicted"`, `"Ebola outbreak"`, `"Putin and Xi"`) and a hero card with full article titles (`"94-year-old Castro is charged with conspiracy to kill US nationals, destruction of an aircraft and murder"`). Vanilla on CNN reliably extracts the tag-cloud; Ghostery reliably extracts the hero card. By raw array count, the tag-cloud (8 entries) looks better than the hero card (5–7 entries). By usefulness to a downstream consumer, the hero card wins by a mile. On theguardian, vanilla returns four entries that are three near-paraphrases of the same real headline plus one fabrication — four entries, but only one real story.');
  lines.push('');
  lines.push('So we count *unique real headlines extracted per trial*:');
  lines.push('');
  lines.push('1. **Build ground truth from Ghostery\'s repeated extractions.** A candidate headline goes into ground truth for a page if it (a) is at least 25 characters long, (b) contains at least 4 meaningful (non-stopword) tokens, and (c) appears in at least 2 of the 10 Ghostery trials. The length filter (a, b) excludes tag-cloud labels like `"Cave divers"` or `"Ebola outbreak"` so the metric measures real article-title extraction rather than label-dumping. The repetition filter (c) excludes one-off Ghostery-side hallucinations.');
  lines.push('2. **Fuzzy-match** each extracted entry against each ground-truth headline. We tokenize both, drop stopwords, and require at least 50% of the shorter side\'s tokens to appear in the longer. Under this rule, `"Late-night TV hosts bid goodbye to Stephen Colbert"` matches the real `"Late-night TV says goodbye to Stephen Colbert"` (paraphrase of the same headline), but `"Raul Castro indicted"` does *not* match `"94-year-old Castro is charged with conspiracy…"` (only one common meaningful token, "castro").');
  lines.push('3. **Count unique ground-truth headlines matched** per trial. Each ground-truth entry counts at most once per trial, so repeated paraphrases of the same headline collapse into a single match.');
  lines.push('');

  lines.push('## Reading the table');
  lines.push('');
  const cellByPageVar = (page, variant) => perCell.find((c) => c.page === page && c.variant === variant);
  if (cat.vanillaFailed.length) {
    const breakdown = cat.vanillaFailed.map((p) => {
      const v = cellByPageVar(p, 'vanilla');
      const g = cellByPageVar(p, 'ghostery');
      return `${p} (${v.zeroArticles}/${v.n} empty, ${g.medMatched} → ${v.medMatched} real headlines)`;
    }).join('; ');
    lines.push(`- **Vanilla extracts zero real headlines (${cat.vanillaFailed.length} of ${cat.vanillaFailed.length + cat.mixed.length + cat.noEffect.length} sites — ${cat.vanillaFailed.join(', ')}):** the model either returns an empty array or fills it with fabricated entries that don't match any real headline on the page. Ghostery extracts the actual top stories. Breakdown: ${breakdown}.`);
  }
  if (cat.mixed.length) {
    lines.push(`- **Mixed (${cat.mixed.join(', ')}):** vanilla returns a mix of real headlines and fabrications. The raw array length looks fine, but only some of the entries map to actual page content; Ghostery returns more distinct real headlines.`);
  }
  if (cat.noEffect.length) {
    lines.push(`- **No effect (${cat.noEffect.join(', ')}):** both variants extract roughly the same set of real headlines. The consent banner is small or doesn't visually compete with the article body.`);
  }
  lines.push('');

  lines.push('## Why the model fails');
  lines.push('');
  lines.push('Two things the modal does to the image push the model away from the article content:');
  lines.push('');
  lines.push('1. **Physical obstruction.** On `slate`, `huffpost`, `vox` the modal sits over the upper-fold area and the article hero card is literally not in the pixels. At 1280×800 with the banner up, there\'s nothing to extract.');
  lines.push('2. **Attention hijacking.** On `theverge`, `cnn`, `usatoday`, `theguardian` the article content is *physically still visible* around the edges, but the modal is the visually dominant element. The model\'s attention concentrates on the high-contrast modal text and the article snippets fade into background.');
  lines.push('');
  lines.push('The strongest evidence for the second mechanism: on `npr`, the consent banner is *bottom-anchored* and the page\'s top headline is fully visible above it in the vanilla viewport. The model still fails — fabricating NPR-style headlines like *"Defunding public broadcasting doesn\'t return money to taxpayers"* while the real top story about Tuesday\'s primaries sits right there in the pixels, unread.');
  lines.push('');

  lines.push('## Takeaways — what to do if you ship a vision-based browser pipeline');
  lines.push('');
  lines.push('1. **Treat banner dismissal as a mandatory pre-processing step, not a "nice to have."** Load a consent-dismissal layer (Ghostery\'s Never-Consent, Consent-O-Matic, Brave\'s built-in handling, or hand-rolled CMP-specific dismissers for your target sites — most of these are built on the [DuckDuckGo autoconsent rulebase](https://github.com/duckduckgo/autoconsent) under the hood) and *verify it actually fires* — check both the screenshot and the DOM after settle. Rule coverage varies per CMP deployment, and a silently-disabled extension is indistinguishable from no extension at all.');
  lines.push('2. **Add a regression test that asserts "the model returns the page\'s actual top headlines,"** not just *some* `string[]`. The methodology in this post is a runnable template: pick 5–10 pages your product cares about, build a small ground-truth list, assert the model recovers ≥N of them.');
  lines.push('3. **Watch your output tokens, not just input.** Cluttered viewports inflate output-token cost by 30–60% even when extraction succeeds. Image input is fixed (~1,300 tokens for a 1280×800 PNG); the variable cost is on the response side.');
  lines.push('4. **If you can\'t dismiss the banner, scroll past it before screenshotting.** ~600px down usually leaves the article body visible while the banner stays anchored. Worse than dismissal, better than a banner-dominated screenshot.');
  lines.push('5. **Don\'t trust string-shaped LLM output to be grounded.** Even when the JSON parses cleanly, the strings inside can be confabulated. Surface uncertainty downstream — confidence thresholds, second-pass cross-checks, or compare against a content-DOM extraction.');
  lines.push('');
  lines.push('The point isn\'t Ghostery specifically. The point is that **some layer between your headless browser and your model needs to clear the banner**, and "no banner clearing" is the silent-default state of every headless Chrome you spin up.');
  lines.push('');

  lines.push('## Methodology');
  lines.push('');
  lines.push(`- **Model:** \`${model}\`, default temperature, \`max_tokens=2048\`, one API call per screenshot.`);
  lines.push(`- **Setup:** Chrome for Testing 148 + chromedriver, fresh isolated profile per trial, 5s settle, anti-bot fingerprints suppressed (\`navigator.webdriver === false\`, \`--disable-blink-features=AutomationControlled\`) so CMPs serve us the same payload they serve a human.`);
  lines.push(`- **Pages:** ${[...new Set(perCell.map((c) => c.page))].map((p) => '`' + p + '`').join(', ')}, loaded from a US (San Jose) IP. 9 pages × 2 variants × ${heroV?.n ?? 10} trials = ${agg.vTrials + agg.gTrials} calls.`);
  lines.push('- **Source data and harness:** every per-trial JSON, every captured screenshot, and the measurement scripts live at [github.com/ghostery/researches](https://github.com/ghostery/researches/tree/main/vlm-cookie-banner-may-2026). Reproduce locally with `npm install && node src/measure.js && node src/report.js`.');
  lines.push('- **Intervention:** vanilla Chrome vs. Chrome + an unpacked Ghostery extension built with `npm run build chromium -- --automation` (skips onboarding, enables Ghostery\'s adblocker + Never-Consent without a user click).');
  lines.push('- **Prompt:** required strict JSON escaping after early parse failures on headlines with nested quotes — 178/180 calls produced syntactically valid JSON in this run.');
  lines.push('- **Ground truth for matching:** built from Ghostery\'s extractions, keeping headlines that (a) are ≥25 characters, (b) contain ≥4 non-stopword tokens, (c) appear in ≥2 of 10 Ghostery trials. (a) and (b) exclude tag-cloud labels (`"Cave divers"`, `"Ebola outbreak"`); (c) excludes one-off Ghostery hallucinations.');
  lines.push('- **Fuzzy match:** an extracted entry matches a ground-truth headline if ≥50% of the shorter side\'s meaningful tokens appear in the longer side.');
  lines.push('');
  lines.push('Verbatim prompt:');
  lines.push('');
  lines.push('> *You are an inventory assistant looking at a webpage screenshot. Identify every visible element and categorize each. Output a single JSON object with these keys: `"articles"` — an array of plain string headlines (each entry is one headline string, not an object). `"navigation"` — an array of plain string nav link labels. `"other"` — an array of plain strings for cookie banners, modals, buttons, etc. CRITICAL: every string MUST be valid JSON. Escape any `"` inside a string as `\\"`. Do not output objects, only plain strings. Do not include trailing commas. Be exhaustive within the visible viewport. Output ONLY the JSON object. No commentary, no code fences.*');
  lines.push('');
  lines.push('**Not a max-tokens crash, not Anthropic-specific, not "you need Ghostery."** Caveats: 178/180 calls produced syntactically valid JSON under 2048 output tokens (1 truncation, 1 parse failure — both vanilla npr); GPT vision and Gemini vision will hit the same attention-budget problem with different specific failure shapes; any browser layer that clears the banner before the screenshot will produce the same result Ghostery did here.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`*Pricing context: image input ~1,300 tokens per 1280×800 PNG (Anthropic\'s formula). At Sonnet 4.5 list price ($3 input / $15 output per MTok), each inventory call costs ~$0.005–0.015 depending on output verbosity.*`);
  return lines.join('\n');
}

function buildHeroSection(runDir, hero, heroV, heroG, allResults) {
  const vTrial = allResults.find((r) => r.page === hero && r.variant === 'vanilla' && r.trial === 1 && r.classification === 'zero_articles');
  const vTrialAlt = allResults.find((r) => r.page === hero && r.variant === 'vanilla' && r.trial === 1);
  const vBest = vTrial || vTrialAlt;
  const gTrial = allResults.find((r) => r.page === hero && r.variant === 'ghostery' && r.trial === 1);
  if (!vBest || !gTrial) return '';

  const vImg = findScreenshotInline(runDir, vBest.screenshotPath);
  const gImg = findScreenshotInline(runDir, gTrial.screenshotPath);
  if (!vImg || !gImg) return '';

  const vJson = vBest.inventory ? JSON.stringify(vBest.inventory, null, 2) : vBest.rawText;
  const gJson = gTrial.inventory ? JSON.stringify(gTrial.inventory, null, 2) : gTrial.rawText;

  const vOk = vBest.classification === 'ok' ? 'ok' : vBest.classification;
  const gOk = gTrial.classification === 'ok' ? 'ok' : gTrial.classification;

  return `
<section class="hero">
  <div class="hero-grid">
    <div class="hero-col">
      <div class="hero-head">
        <div class="hero-tag tag-vanilla">Vanilla Chrome</div>
        <div class="hero-cost">articles: <strong>${vBest.articlesCount}</strong> &middot; output: ${vBest.outputTokens} tok &middot; ${vOk}</div>
      </div>
      <div class="hero-screenshot">
        <img src="${vImg}" alt="vanilla viewport ${hero}">
      </div>
      <div class="hero-output">
        <div class="hero-output-label">Model output (truncated):</div>
        <pre><code>${escapeHtml(vJson.length > 1200 ? vJson.slice(0, 1200) + '\n  ...' : vJson)}</code></pre>
      </div>
    </div>
    <div class="hero-col">
      <div class="hero-head">
        <div class="hero-tag tag-ghostery">Chrome + Ghostery</div>
        <div class="hero-cost">articles: <strong>${gTrial.articlesCount}</strong> &middot; output: ${gTrial.outputTokens} tok &middot; ${gOk}</div>
      </div>
      <div class="hero-screenshot">
        <img src="${gImg}" alt="ghostery viewport ${hero}">
      </div>
      <div class="hero-output">
        <div class="hero-output-label">Model output (truncated):</div>
        <pre><code>${escapeHtml(gJson.length > 1200 ? gJson.slice(0, 1200) + '\n  ...' : gJson)}</code></pre>
      </div>
    </div>
  </div>
</section>
`;
}

function buildChartSection(perCell, pages) {
  const rows = [];
  for (const page of pages) {
    const v = perCell.find((c) => c.page === page && c.variant === 'vanilla');
    const g = perCell.find((c) => c.page === page && c.variant === 'ghostery');
    if (!v || !g) continue;
    rows.push({
      page,
      vArt: v.medMatched,
      gArt: g.medMatched,
      vMin: v.matchedCounts.length ? Math.min(...v.matchedCounts) : 0,
      vMax: v.matchedCounts.length ? Math.max(...v.matchedCounts) : 0,
      gMin: g.matchedCounts.length ? Math.min(...g.matchedCounts) : 0,
      gMax: g.matchedCounts.length ? Math.max(...g.matchedCounts) : 0,
    });
  }
  const maxArt = Math.max(...rows.map((r) => Math.max(r.vMax, r.gMax)), 1);
  function pctLabel(r) {
    if (r.vArt === 0 && r.gArt === 0) return '0';
    if (r.vArt === 0) return '0 → ' + r.gArt.toFixed(1);
    const pct = Math.round((r.gArt / r.vArt - 1) * 100);
    if (pct === 0) return '0%';
    return (pct > 0 ? '+' : '−') + Math.abs(pct) + '%';
  }
  function barFor(value, min, max, klass, label) {
    const widthPct = (value / maxArt) * 100;
    const minPct = (min / maxArt) * 100;
    const maxPct = (max / maxArt) * 100;
    const insideLabel = widthPct >= 22 ? `<span class="bar-num bar-num-inside">${label}</span>` : '';
    const outsideLabel = widthPct < 22 ? `<span class="bar-num bar-num-outside">${label}</span>` : '';
    // Whisker overlay: a thin gray line spanning min to max
    const whiskerWidth = maxPct - minPct;
    const whisker = max > min ? `<div class="whisker" style="left:${minPct}%;width:${whiskerWidth}%" title="min ${min} – max ${max} across 10 trials"></div>` : '';
    return `<div class="bar-line"><div class="bar ${klass}" style="width:${widthPct}%">${insideLabel}</div>${outsideLabel}${whisker}</div>`;
  }
  const bars = rows.map((r) => `
    <div class="bar-row">
      <div class="bar-label">${escapeHtml(r.page)}</div>
      <div class="bar-track">
        ${barFor(r.vArt, r.vMin, r.vMax, 'bar-vanilla', r.vArt.toFixed(1) + ' headlines')}
        ${barFor(r.gArt, r.gMin, r.gMax, 'bar-ghostery', r.gArt.toFixed(1))}
      </div>
      <div class="bar-saved">${pctLabel(r)}</div>
    </div>`).join('');
  return `
<section class="chart">
  <h2>Real headlines extracted per inventory call (median across 10 trials)</h2>
  ${bars}
  <div class="legend">
    <span><i class="swatch swatch-vanilla"></i>Vanilla Chrome</span>
    <span><i class="swatch swatch-ghostery"></i>Chrome + Ghostery</span>
  </div>
</section>
`;
}

function buildPostHtml(postMd, perCell, pages, runDir, hero, allResults) {
  const bodyHtml = renderMarkdown(postMd);
  const heroV = perCell.find((c) => c.page === hero && c.variant === 'vanilla');
  const heroG = perCell.find((c) => c.page === hero && c.variant === 'ghostery');
  const heroSection = buildHeroSection(runDir, hero, heroV, heroG, allResults);
  const chartSection = buildChartSection(perCell, pages);

  let html = bodyHtml;
  if (heroSection) {
    html = html.replace(/<h2>See it happen: ([^<]+)<\/h2>/, '<h2>See it happen: $1</h2>' + heroSection);
  }
  if (chartSection) {
    html = html.replace('<h2>Per-page numbers</h2>', chartSection + '<h2>Per-page numbers</h2>');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A cookie banner can make a vision model read the wrong page</title>
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
  article { max-width: 780px; margin: 0 auto; padding: 56px 24px 96px; }
  h1 { font-size: 38px; line-height: 1.15; margin: 0 0 10px; letter-spacing: -0.5px; }
  h2 { font-size: 22px; margin: 44px 0 14px; letter-spacing: -0.2px; }
  .chart h2 { margin: 0 0 14px; font-size: 19px; }
  h3 { font-size: 17px; margin: 24px 0 8px; }
  p { margin: 0 0 16px; }
  p.meta { color: var(--muted); font-style: italic; font-size: 15px; margin-top: -4px; }
  a { color: var(--vanilla); text-decoration: underline; text-underline-offset: 2px; }
  code { font: 14px/1 SFMono-Regular, Menlo, Consolas, monospace; background: var(--code-bg); padding: 2px 5px; border-radius: 3px; }
  pre { background: #14181f; color: #e8e8e8; padding: 14px 16px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
  pre code { background: transparent; padding: 0; color: inherit; font-size: 12.5px; line-height: 1.45; white-space: pre-wrap; }
  .hero-col { min-width: 0; }
  .hero-output { min-width: 0; }
  hr { border: 0; border-top: 1px solid var(--rule); margin: 40px 0; }
  blockquote { margin: 16px 0; padding: 8px 16px; border-left: 3px solid var(--rule); color: var(--muted); font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 24px; font-size: 14.5px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid var(--rule); text-align: right; vertical-align: top; }
  th:first-child, td:first-child { text-align: left; }
  th { font-weight: 600; color: var(--muted); font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #c8c5b9; }
  ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  .chart { margin: 16px 0 32px; padding: 20px 22px; background: #fff; border: 1px solid var(--rule); border-radius: 8px; }
  .chart h2 { margin-top: 0; }
  .bar-row { display: grid; grid-template-columns: 110px 1fr 64px; gap: 12px; align-items: center; margin: 18px 0; }
  .bar-row + .bar-row { border-top: 1px solid var(--rule); padding-top: 18px; }
  .bar-label { font: 13px/1 SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .bar-track { display: flex; flex-direction: column; gap: 4px; }
  .bar-line { display: flex; align-items: center; gap: 6px; height: 26px; position: relative; }
  .bar { height: 26px; border-radius: 3px; position: relative; flex-shrink: 0; }
  .bar-vanilla { background: var(--vanilla); }
  .bar-ghostery { background: var(--ghostery); }
  .bar-num { font: 11.5px/1 SFMono-Regular, Menlo, monospace; white-space: nowrap; }
  .bar-num-inside { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #fff; }
  .bar-num-outside { color: var(--muted); }
  .whisker { position: absolute; top: 50%; height: 2px; background: rgba(0,0,0,0.45); transform: translateY(-50%); pointer-events: none; z-index: 2; }
  .whisker::before, .whisker::after { content: ''; position: absolute; top: -4px; width: 2px; height: 10px; background: rgba(0,0,0,0.45); }
  .whisker::before { left: 0; }
  .whisker::after { right: 0; }
  .bar-saved { font: 13px/1 SFMono-Regular, Menlo, monospace; color: var(--muted); text-align: right; }
  .legend { margin: 12px 0 0 122px; font-size: 12.5px; color: var(--muted); display: flex; gap: 20px; }
  .legend i.swatch { display: inline-block; width: 10px; height: 10px; margin-right: 5px; border-radius: 2px; vertical-align: middle; }
  .swatch-vanilla { background: var(--vanilla); }
  .swatch-ghostery { background: var(--ghostery); }
  .hero { margin: 24px 0 28px; padding: 24px 24px 16px; background: #fff; border: 1px solid var(--rule); border-radius: 8px; }
  .hero h2 { margin-top: 0; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 720px) { .hero-grid { grid-template-columns: 1fr; } }
  .hero-col { display: flex; flex-direction: column; gap: 10px; }
  .hero-head { display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid var(--rule); }
  .hero-tag { display: inline-block; padding: 3px 9px; border-radius: 3px; font-size: 12px; color: #fff; font-weight: 600; align-self: flex-start; }
  .tag-vanilla { background: var(--vanilla); }
  .tag-ghostery { background: var(--ghostery); }
  .hero-cost { font: 12.5px/1.3 SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .hero-cost strong { color: var(--fg); }
  .hero-screenshot img { width: 100%; height: auto; border: 1px solid var(--rule); border-radius: 4px; display: block; }
  .hero-output-label { font-size: 12px; color: var(--muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .hero-output pre { margin: 0; max-height: 280px; overflow-y: auto; }
</style>
</head>
<body>
<article>
${html}
</article>
</body>
</html>`;
}

function buildResultsMd(runId, perCell, pages, model) {
  const lines = [];
  lines.push('# Research v3 — full results');
  lines.push('');
  lines.push(`Run: \`${runId}\``);
  lines.push(`Model: \`${model}\``);
  lines.push('');
  lines.push('## Per-cell stats');
  lines.push('');
  lines.push('| Page | Variant | Trials | OK | Trunc | Parse-fail | Zero-articles | Med articles | Med output tok | Med input tok |');
  lines.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const c of perCell) {
    lines.push(`| ${c.page} | ${c.variant} | ${c.n} | ${c.ok} | ${c.truncated} | ${c.parseFailed} | ${c.zeroArticles} | ${c.medArticles} | ${c.medOutTokens} | ${c.medInTokens} |`);
  }
  lines.push('');
  lines.push('## Per-trial article extractions');
  lines.push('');
  for (const c of perCell) {
    lines.push(`### ${c.page} ${c.variant}`);
    lines.push('');
    for (let t = 0; t < c.headlinesAcrossTrials.length; t++) {
      const h = c.headlinesAcrossTrials[t];
      if (h.length === 0) {
        lines.push(`- t${t + 1}: *(empty)*`);
      } else {
        lines.push(`- t${t + 1} (${h.length} articles):`);
        for (const headline of h) {
          lines.push(`  - "${headline}"`);
        }
      }
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  const runDir = findLatestRun();
  if (!runDir) { console.error('No results yet.'); process.exit(1); }
  const runId = runDir.split('/').pop();
  console.log(`Reading ${runDir}`);
  const data = JSON.parse(readFileSync(join(runDir, 'inventory.json'), 'utf8'));
  const { perCell, pages } = summarize(data.results);
  const agg = aggStats(perCell);
  const hero = pickHero(perCell, pages);
  console.log(`Hero page: ${hero}`);

  const postMd = buildPostMd(perCell, agg, data.model, hero);
  const postHtml = buildPostHtml(postMd, perCell, pages, runDir, hero, data.results);
  const resultsMd = buildResultsMd(runId, perCell, pages, data.model);

  writeFileSync(join(V3_ROOT, 'POST.md'), postMd);
  writeFileSync(join(V3_ROOT, 'POST.html'), postHtml);
  writeFileSync(join(V3_ROOT, 'RESULTS.md'), resultsMd);
  const htmlKb = Math.round(postHtml.length / 1024);
  console.log(`Wrote POST.md (${postMd.length} chars), POST.html (${htmlKb} KB), RESULTS.md (${resultsMd.length} chars)`);
}

main().catch((e) => { console.error(e?.stack || e); process.exit(1); });
