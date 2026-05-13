# Ghostery / AI-agent cost research — progress log

## Goal

Quantify whether running Ghostery in a headless/automated browser reduces the input-token cost an AI agent (Claude, GPT, etc.) pays when consuming web pages. Hypothesis: ads inflate DOM/text tokens and screenshot tokens; blocking them (and dismissing cookie banners via autoconsent) saves money.

## Harness — what works

Stack:
- **Chrome for Testing 148** + matching **chromedriver 148** (installed via `@puppeteer/browsers` into `research/.browsers/`).
- **webdriverio v9** over WebDriver BIDI (`webSocketUrl: true`).
- Extension loaded **unpacked** (the zip is extracted once into `research/.ghostery-extension/`).
- HTML/innerText/iframes captured with `browser.execute()`.
- A11y tree captured via ChromeDriver classic CDP-forwarding (`POST /session/:sid/goog/cdp/execute` → `Accessibility.getFullAXTree`) — BIDI has no AX command yet.
- Screenshots via the same CDP endpoint (`Page.captureScreenshot`) — the BIDI viewport screenshot was waiting ~17 s for paint stability and the BIDI full-page screenshot was scrolling/stitching for ~25 s.
- Network requests/bytes via BIDI events (`network.beforeRequestSent`, `network.responseCompleted`, `network.fetchError`).
- Anthropic image-token formula: resize to 1568 px on long edge then `⌈w·h/750⌉`.
- Text tokens via `gpt-tokenizer` (cl100k_base — close enough for relative comparisons; use Anthropic's `count_tokens` API for exact numbers).
- Per-page: vanilla and ghostery runs each in fresh chromedriver session + fresh temp profile.
- Per-phase timings logged on the console (`session / warmup / navigate / settle / extract / a11y / screenshots`).
- Outputs: `results/<run-id>/<page>/{vanilla,ghostery}.{html,text.txt,a11y.json,viewport.png,metrics.json}`, plus `summary.json`, `summary.csv`, `report.md`.

Per-page run time: ~6–12 s vanilla, ~9–13 s ghostery (extra ~4 s for warmup nav). Full 8-page suite finishes in ~2.5 minutes.

## Key technical findings

### BIDI `webExtension.install` is gated off in chromedriver 148

- The BIDI `webExtension.install` command **is** wired up by `chromium-bidi` and accepts `extensionData.type === 'path'`. (`archivePath` and `base64` return `"Archived and Base64 extensions are not supported"`.)
- For `type: 'path'`, the BIDI mapper internally invokes CDP **`Extensions.loadUnpacked`**. Chrome 148 launched by chromedriver replies **`"Method not available"`** — `--test-type=webdriver` (the chromedriver-injected automation flag) gates the Extensions CDP domain off.
- Workaround in this harness: pass `--load-extension=<unpacked-dir>` in `goog:chromeOptions.args`. Chrome for Testing still honors that flag (regular Chrome 137+ does not). The BIDI install attempt is left in the code as a diagnostic; revisit when chromedriver/Chrome opens the CDP gate.

### Playwright headless-shell cannot run extensions

`npx playwright install chromium` downloads both `chromium-headless-shell` and the full `chromium`; default headless picks the shell, which strips out extensions. Setting `channel: 'chromium'` (or moving off Playwright entirely, as we did) is required.

### `Page.captureScreenshot` (CDP) is dramatically faster than BIDI

- BIDI `browsingContext.captureScreenshot` with `origin: 'viewport'` waited for paint stability (~17 s/page).
- BIDI with `origin: 'document'` (full-page) scrolled & stitched (~25 s/page).
- CDP `Page.captureScreenshot` returns immediately — viewport in <100 ms.
- Default in this harness: viewport-only screenshot. Full-page is opt-in via `--fullpage` (uses `captureBeyondViewport: true`). Full-page token cost is *estimated* from `document.documentElement.scrollHeight × viewport_width`, applied to the Anthropic resize formula — no actual capture needed for the cost number.

### Useful tunings

- `pageLoadStrategy: 'eager'` — return on `interactive`, not `complete`. Cuts navigate phase from 30 s+ to <2 s on ad-heavy pages that never reach `complete`.
- `SETTLE_AFTER_LOAD_MS = 1500` — enough for most pages.
- `GHOSTERY_WARMUP_SETTLE_MS = 4000` after a productive `browser.url('https://example.com/')` — gives the MV3 service worker time to boot and load adblocker engines. Pure `setTimeout` without a real navigation didn't initialize the extension at all.

## Headline data — first complete run (8 pages, 2026-05-13)

Run id: `2026-05-13T15-02-36-304Z`. Pages: cnn, foxnews, dailymail, nypost, allrecipes, foodnetwork, weather, espn.

Aggregate (sum across all 8):

| Metric | Vanilla | Ghostery | Δ |
|---|---:|---:|---:|
| innerText tokens | 12.7 k | 11.1 k | **−12.2 %** |
| HTML tokens | 3.75 M | 3.50 M | −6.8 % |
| A11y tree tokens | 973 k | 1020 k | +4.8 % (Ghostery reveals content vanilla left under banners) |
| Viewport image tokens | 9.0 k | 9.0 k | 0 % (fixed dimensions) |
| Estimated full-page image tokens | 5.9 k | 6.5 k | +10.8 % |
| Network bytes | 62 MB | 69 MB | +10.8 % (autoconsent triggers more secondary loads) |

Per-load $ (Sonnet 4.6 input, $3/MTok):

| Mode | Vanilla | Ghostery | Saved | per 1k loads |
|---|---:|---:|---:|---:|
| innerText + viewport screenshot | $0.0081 | $0.0075 | $0.00058 | $0.58 |
| A11y tree + viewport screenshot | $0.368 | $0.386 | −$0.017 | −$17.43 |
| Full HTML + viewport screenshot | $1.41 | $1.32 | $0.095 | $95 |
| innerText + full-page screenshot | $0.0070 | $0.0066 | $0.00034 | $0.34 |

**With consent-dismiss overhead modeled** (3 agent loops × 5 k tokens per banner Ghostery dismissed; only 1/8 pages currently flagged because the detector is too lax — see open problem #1):

| Mode | Vanilla (incl. dismiss) | Ghostery | Saved | per 1k loads |
|---|---:|---:|---:|---:|
| innerText + viewport screenshot | $0.0138 | $0.0075 | $0.0062 | **$6.21** |
| innerText + full-page screenshot | $0.0126 | $0.0066 | $0.0060 | **$5.97** |

So even with a one-banner-out-of-eight count the consent-dismiss overhead is the dominant savings driver.

### Notable per-page observations

- **dailymail**, **allrecipes**: vanilla rendered ~70 innerText tokens — page was a near-empty consent wall. Ghostery rendered 67 / 71 innerText tokens — autoconsent did **not** dismiss, page still mostly empty. (Possibly the consent dialog is rendered before Ghostery's content scripts attach.)
- **foodnetwork**: vanilla 988 innerText tokens, ghostery 1421 — Ghostery actually unblocked content here (recipe rendered). Earlier flaky run showed vanilla = 0 tokens, ghostery = 1421 — confirms variance.
- **cnn**, **nypost**: Ghostery's autoconsent revealed *more* content than vanilla. innerText went *up* (+21 % cnn, +29 % nypost). This is a real "agent gets useful content sooner" win, but it's not a token *reduction*.
- **foxnews**: nearly identical between variants (no consent wall, not many native ads in DOM).
- **weather.com**: BIDI `browsingContext.getTree` timeout fired in the background (now caught by our `unhandledRejection` handler so it doesn't kill the run).
- **espn**: Ghostery run produced **0 innerText tokens** vs 2.7 k vanilla — looks like Ghostery broke the page (anti-adblock detection? cosmetic filter too aggressive?). Worth investigating.

## Open problems (one per future session)

### 1. Tighten consent-banner detection

Current detector matches a broad regex on `document.body.innerText` plus a long list of `[id*="onetrust" i]`-style selectors. Both fire false positives (cookie text in privacy-policy footers ⇒ false ⚠️ on cnn / nypost / weather) and false negatives (dailymail / allrecipes vanilla are clearly blocked but flagged "no banner"). Replace with: walk `document.querySelectorAll('*')`, keep elements whose computed `position` is `fixed`/`sticky`, area > 30 % of viewport, z-index > 100, and whose text contains specific button strings ("accept all cookies" / "reject all" / "manage preferences"). Optionally adopt `@duckduckgo/autoconsent`'s detection helper directly.

### 2. Investigate espn Ghostery breakage

Re-run espn headed with `--debug`, capture chromedriver log + screenshot. Hypotheses to test: (a) anti-adblock script blanks the page when Ghostery is present, (b) a Ghostery cosmetic filter rule hides the main content container, (c) MV3 DNR rule blocks an essential script. Next step: `node src/run.js --pages espn --headed --debug` then diff `vanilla.html` vs `ghostery.html`.

### 3. Add `--repeat N` for stability

Pages have rotating ads, breaking news, and lazy loads. Single-run numbers swing 30 %+ between runs (already observed on foodnetwork: 0 → 988 innerText tokens between two runs). Add a runner that does N back-to-back runs of each (page, variant), aggregates median/p25/p75 into the report.

### 4. A11y mode realism — capture filtered tree, not full

`Accessibility.getFullAXTree` returns 190 k+ tokens for cnn — huge and not what real agents consume. Real agents use `interestingOnly: true`-style filtering or `aria-snapshot`. Capture both a "raw" full tree (current) and a "filtered" tree (drop nodes whose role is `none` / `presentation` / `InlineTextBox` / `text` if no name; drop nodes with no name and no children). Report the filtered cost as primary.

### 5. Cross-region consent-wall reproducibility

The consent walls we saw (cnn, dailymail, allrecipes) only appear because the test machine's IP is in the EEA. For US-only or fully-public pages the picture changes. Either (a) tag pages with expected jurisdiction in `pages.json` and report broken-out results, or (b) add a way to route the browser through a US/EU IP to A/B test that effect.

### 6. BIDI `webExtension.install` revisit

When chromedriver / Chrome lifts the `Extensions.loadUnpacked` gate (or chromium-bidi switches to a different CDP method), drop the `--load-extension` arg and use BIDI cleanly. Track via the chromium-bidi GitHub issues; the current diagnostic logs (`*.chromedriver.log`) contain the exact failing call so we'll know when it starts succeeding.

### 7. Honest end-to-end agent simulation

The current cost model is artifact-based: it costs out a single page consumption. A real agent loop is multi-turn (read, decide, click, read, …). Sim a fixed task ("find and read the article body") with both variants, count actual model turns + total tokens. That's the number worth quoting publicly.

### 8. Report polish

- Drop the misleading "Notes" line that still says "first-launch warmup waits 25s" (now 4 s).
- Add a "verdict" column in the per-page table that combines consent + content-rendered + cosmetic-filter signals.
- Per-page $ delta column, not just aggregate.

## How to run

```bash
cd research
npm install
npx playwright install chromium             # only needed if you want to compare vs Playwright
npx @puppeteer/browsers install chrome@stable --path .browsers
npx @puppeteer/browsers install chromedriver@stable --path .browsers
node src/setup.js                            # extracts the Ghostery zip

node src/run.js                              # all pages, headless
node src/run.js --pages cnn,espn             # subset
node src/run.js --headed                     # visible browser
node src/run.js --debug                      # writes wdio + chromedriver logs
node src/run.js --fullpage                   # also captures full-page PNG (slow: ~25 s/run)

node src/report-cli.js                       # re-render latest report.md
```
