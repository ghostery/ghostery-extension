# Ghostery cost-savings benchmark for AI agent browsing

Measures whether Ghostery reduces the input-token cost an AI agent (Claude, GPT, etc.) pays when consuming web pages, by comparing **vanilla Chromium** vs. **Chromium + Ghostery (automation build)** on a fixed list of ad-heavy URLs.

## Hypothesis

Ads, trackers, and consent dialogs:
1. inflate the **DOM / HTML / accessibility tree** an agent reads (more text tokens), and
2. inflate the **screenshot** the agent sees (more visual area, taller pages → more image tokens).

Removing them with Ghostery should reduce both, in measurable, dollar-translatable ways.

## What is measured, per URL × {vanilla, ghostery}

| Artifact | What | Why an agent pays |
|---|---|---|
| `*.html` | `page.content()` byte length + cl100k token count | Agents that scrape full HTML |
| `*.a11y.json` | Chromium accessibility tree (interesting-only) | Browser-use, Selenium-AI, etc. |
| `*.viewport.png` | 1280×800 viewport screenshot | Visual agents (default) |
| `*.full.png` | Full-page screenshot | Agents that scroll / capture all |
| network bytes/requests | what actually crossed the wire | Cost of running the browser |
| load time | time to DOMContentLoaded + idle | Wall-clock cost |

The Ghostery extension used is `web-ext-artifacts/ghostery-automation-chromium.zip` (the MV3 automation build).

## Cost model

- **Text tokens:** counted with `gpt-tokenizer` (cl100k_base BPE). Anthropic uses a different tokenizer, but cl100k is within ~10% on English HTML — fine for relative comparisons.
- **Image tokens (Anthropic):** `tokens = ⌈(w × h) / 750⌉`, with the long edge first scaled down to 1568 px. A 1280×800 viewport screenshot ≈ 1366 tokens.
- **$ per token:** Sonnet 4.6 input @ $3 / MTok by default. Configurable in `src/cost-model.js`.

## Methodology

1. **Same chromium binary** for both runs; same viewport (1280×800); same navigation strategy (`domcontentloaded` → `networkidle` → 5 s settle).
2. **Vanilla** = Playwright's bundled chromium, no extensions.
3. **Ghostery** = same chromium with `--load-extension=<extracted automation build>`. First, a 25-second `about:blank` warmup so the adblocker engines are loaded before the timed navigation.
4. **Fresh, isolated profile per run.** No shared cookies, no carry-over state between vanilla and Ghostery.
5. Each run writes raw artifacts (html, a11y json, viewport png, full-page png) to `results/<run-id>/<page-id>/<vanilla|ghostery>.*` so anything can be re-tokenized later without re-running the browser.

### Known caveats

- Vanilla browsers hit consent dialogs that Ghostery's autoconsent may dismiss. That's a real difference in agent cost, not a bug — but it means "savings" includes "agent didn't have to handle a cookie banner".
- `gpt-tokenizer` is approximate. To get exact numbers, re-tokenize artifacts with Anthropic's `count_tokens` API; the byte sizes don't change.
- Page content varies hour-to-hour (rotating ads, breaking news). For publishable numbers, run the suite N times and take the median.
- Some pages may geoblock or paywall — failures are recorded as `navError`, not silently dropped.

## Setup

```bash
cd research
npm install
npx playwright install chromium
node src/setup.js   # extract the Ghostery zip
```

## Run

```bash
# all pages (default headless)
node src/run.js

# subset
node src/run.js --pages cnn,allrecipes

# headed (slower but more reliable for extension loading on some setups)
node src/run.js --headed
```

Output goes to `results/<ISO-timestamp>/`:
- `<page>/vanilla.*` and `<page>/ghostery.*` — raw artifacts
- `summary.json` — all metrics, machine-readable
- `summary.csv` — same, spreadsheet-friendly
- `report.md` — human-readable comparison + $ translation

## Re-render the latest report

```bash
node src/report-cli.js          # latest run
node src/report-cli.js <run-id> # specific run
```
