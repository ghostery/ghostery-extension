# Ghostery cost-savings benchmark for AI agent browsing

Measure how much input-token cost an AI agent (Claude, GPT, etc.) saves when its browser is running Ghostery.

## Hypothesis & key finding

Ads, trackers, and consent dialogs raise an AI agent's input-token cost in two ways:

1. **Larger artifacts.** DOM / `innerText` / accessibility tree / screenshots are bigger when ads and cookie banners are in the page.
2. **Extra agent turns.** When a consent banner blocks the content, the agent has to look at the banner, decide which button to click, click it, and re-read the page. Every extra turn re-pays the system prompt + screenshot + text-context cost.

In our latest 8-page run (see [`PROGRESS.md`](./PROGRESS.md)), the artifact-size delta is **small or even negative** — Ghostery actually *reveals* more body content once autoconsent dismisses banners on the 4 of 8 pages that show one. The dominant savings is the extra-turns cost: at Sonnet 4.6 input pricing, **$9-14 per 1 000 page loads** just from skipping consent dismissal, with the range coming from a 2-vs-3 extra-turns assumption.

That is the story this research is set up to tell, so the harness focuses on consent detection + per-turn agent cost rather than just byte counts.

## What is measured, per URL × {vanilla, ghostery}

Each `(page, variant)` is sampled `--repeat N` times in fresh chromedriver sessions with fresh temp profiles; cells reported are the **median**, with p25 / p75 / min / max under `.stats` in each sample's JSON.

| Artifact | Captured as | Why an agent pays |
|---|---|---|
| Raw DOM | `*.html` | Agents that scrape full HTML |
| Visible text | `*.text.txt` (`document.body.innerText`) | Most text-only agents |
| Accessibility tree | `*.a11y.json` (Chromium `Accessibility.getFullAXTree`) | browser-use, Selenium-AI, AX-aware agents |
| Viewport screenshot | `*.viewport.png` (1280 × 800 PNG) | Vision agents (default frame) |
| Full-page screenshot | `*.full.png` (page-height PNG, opt-in `--fullpage`) | Vision agents that scroll/stitch |
| Network | `metrics.network.{requests,bytes}` from BiDi events | Cost of running the browser side |
| Consent banner | `metrics.consentBannerDetected` + `consentBannerCandidates` | Whether a banner overlay is in the way (visibility-based detector — `src/detect-consent.js`) |
| Autoconsent oracle | `metrics.autoconsent.{cmp,lifecycle,inconclusive}` | What `@duckduckgo/autoconsent`'s production rulebase identifies (`src/autoconsent-oracle.js`) |
| Per-turn agent cost | `consent-tax.json` from `measure-consent-tax.js` | Empirical Anthropic `count_tokens` for a realistic agent prompt |

## Cost model

- **Text tokens (approximate, fast):** `gpt-tokenizer` (cl100k BPE). Within ~10 % of Anthropic's tokenizer on English HTML — fine for relative comparisons.
- **Image tokens (Anthropic formula):** scale the long edge to 1568 px, then `⌈w · h / 750⌉`. A 1280×800 viewport ≈ 1366 tokens.
- **Per-turn agent cost (exact, Layer 2):** `src/measure-consent-tax.js` calls Anthropic's `messages.countTokens` on a realistic prompt — system + viewport screenshot + truncated `innerText` — and reports the input-token count per (page, variant). Multiply by the number of extra turns a vanilla agent has to spend dismissing the banner to get the per-banner tax.
- **$ per token:** Sonnet 4.6 input @ $3 / MTok by default. Configurable in `src/cost-model.js`.

## Methodology

1. **Chrome for Testing 148** + matching **chromedriver 148**, installed via `@puppeteer/browsers` into `research/.browsers/`.
2. **Vanilla** = Chrome for Testing 148 with no extensions.
3. **Ghostery** = same chromium with `--load-extension=<unpacked dist>` (the BiDi `webExtension.install` path is gated off by chromedriver — see PROGRESS for details). The extension is either the prebuilt automation zip or — preferred — a freshly built `dist/` after `scripts/patch-automation.sh dist`.
4. **Warmup.** Before each Ghostery run, the harness opens `chrome-extension://<id>/pages/status/index.html` and polls `window.__ghosteryStatus.ready` so we never measure with a half-loaded adblocker. Falls back to a 4 s sleep on older builds that don't ship the status page.
5. **Fresh, isolated profile per run.** No shared cookies, no carry-over state between vanilla and Ghostery, no carry-over between samples.
6. Each run writes raw artifacts (html, innerText, a11y json, viewport png, full-page png if `--fullpage`) so anything can be re-tokenized after the fact without re-running the browser.

### Known caveats

- The 8-page set is small and EEA-IP biased. `dailymail` and `allrecipes` currently return anti-bot blocks (Edgesuite "Access Denied" / People Inc. "blocked your IP"), not consent walls — they should be replaced with reproducibly-accessible pages.
- Vanilla browsers hit consent dialogs that Ghostery's autoconsent dismisses. That's a real difference in agent cost, not a bug — the whole point of the benchmark.
- `gpt-tokenizer` is within ~10 % of Anthropic's tokenizer on English HTML. Use `measure-consent-tax.js` for exact numbers.
- Page content varies hour-to-hour (rotating ads, breaking news). `--repeat 5` and median picks a stable reading.
- Failures are recorded as `navError` in the metrics, not silently dropped.

## Setup

```bash
cd research
npm install
npx @puppeteer/browsers install chrome@stable --path .browsers
npx @puppeteer/browsers install chromedriver@stable --path .browsers
```

Optional, for the per-turn agent cost measurement:

```bash
# from repo root or research/ — read by node --env-file or process.loadEnvFile
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> ../.env
```

## Run

Build a fresh Ghostery dist and benchmark it:

```bash
# from repo root: rebuild Ghostery + apply automation patches
npm run build chromium
scripts/patch-automation.sh dist

# from research/: point the harness at the freshly built dist
cd research
node src/run.js --repeat 5 --ext-dir ../dist           # 8-page suite, median of 5
node src/run.js --pages cnn,espn --ext-dir ../dist     # subset
node src/run.js --headed --ext-dir ../dist             # visible window for debug
node src/run.js --debug  --ext-dir ../dist             # wdio + chromedriver logs
node src/run.js --fullpage --ext-dir ../dist           # also capture full-page PNG (slow)
```

`GHOSTERY_EXT_DIR=PATH` is equivalent to `--ext-dir PATH`.

After a run, measure the per-turn agent cost (Layer 2) and re-render the report:

```bash
node src/measure-consent-tax.js                        # latest run, default model
node src/measure-consent-tax.js <runId> claude-opus-4-7
node src/report-cli.js                                 # re-render report.md
```

Output goes to `results/<run-id>/`:

- `<page>/{vanilla,ghostery}.{html,text.txt,a11y.json,viewport.png,metrics.json}` per sample (`.s{i}` suffix when `--repeat N > 1`)
- `summary.json` + `summary.csv` — machine-readable per-page metrics
- `report.md` — human-readable comparison + $ translation
- `consent-tax.json` — per-turn agent cost from Anthropic `count_tokens` (after Layer 2 runs)

## Legacy path

If you don't want to rebuild Ghostery from source, the harness still falls back to extracting `web-ext-artifacts/ghostery-automation-chromium.zip` into `.ghostery-extension/`:

```bash
cd research
node src/setup.js     # extracts the zip
node src/run.js       # no --ext-dir → uses the extracted zip
```

That path skips the status-page readiness probe (older zip predates it) and falls back to a 4-second sleep, which can produce bimodal samples on ad-heavy pages — see PROGRESS problem #9.

## More

[`PROGRESS.md`](./PROGRESS.md) is the running session log — what's been tried, what works, the headline data of the latest run, open problems, and the "Next session — priorities" stack.
