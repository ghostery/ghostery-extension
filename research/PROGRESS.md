# Ghostery / AI-agent cost research — progress log

## Goal

Quantify whether running Ghostery in a headless/automated browser reduces the input-token cost an AI agent (Claude, GPT, etc.) pays when consuming web pages. Hypothesis: ads inflate DOM/text tokens and screenshot tokens; blocking them (and dismissing cookie banners via autoconsent) saves money.

## Harness — what works

Stack:
- **Chrome for Testing 148** + matching **chromedriver 148** (installed via `@puppeteer/browsers` into `research/.browsers/`).
- **webdriverio v9** over WebDriver BIDI (`webSocketUrl: true`).
- Extension loaded **unpacked**: either from the prebuilt `ghostery-automation-chromium.zip` (legacy default) or from a freshly built `dist/` via `--ext-dir ../dist` / `GHOSTERY_EXT_DIR=PATH` after running `scripts/patch-automation.sh dist`.
- HTML/innerText/iframes captured via CDP `Runtime.evaluate` (chromedriver-forwarded) — was BIDI `browser.execute()` until we hit the iframe-storm race on espn (problem #2).
- A11y tree captured via the same CDP endpoint (`POST /session/:sid/goog/cdp/execute` → `Accessibility.getFullAXTree`) — BIDI has no AX command yet.
- Screenshots via the same CDP endpoint (`Page.captureScreenshot`) — the BIDI viewport screenshot was waiting ~17 s for paint stability and the BIDI full-page screenshot was scrolling/stitching for ~25 s.
- Network requests/bytes via BIDI events (`network.beforeRequestSent`, `network.responseCompleted`, `network.fetchError`).
- Anthropic image-token formula: resize to 1568 px on long edge then `⌈w·h/750⌉`.
- Text tokens via `gpt-tokenizer` (cl100k_base — close enough for relative comparisons; use Anthropic's `count_tokens` API for exact numbers).
- Per-page: vanilla and ghostery runs each in fresh chromedriver session + fresh temp profile.
- Per-phase timings logged on the console (`session / warmup / navigate / settle / extract / a11y / screenshots`).
- Repeat support: `--repeat N` does N back-to-back samples of each `(page, variant)` and reports the median. Per-sample metrics, p25/p75/min/max under `.stats` in `<variant>.metrics.json`. See problem #3 for the design rationale.
- Outputs: `results/<run-id>/<page>/{vanilla,ghostery}.{html,text.txt,a11y.json,viewport.png,metrics.json}` (with `.s{i}` suffix per sample when N>1), plus `summary.json`, `summary.csv`, `report.md`.

Per-page run time: ~4 s vanilla, ~9 s ghostery (warmup is adaptive — ~3-5 s waiting on the Ghostery status page to report `ready`). Full 8-page suite at `--repeat 1` finishes in ~2 minutes; `--repeat 5` in ~10.

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
- Ghostery warmup is now a real handshake against `chrome-extension://<id>/pages/status/index.html` — see problem #9. Replaces a 4-second `setTimeout` that was sometimes too short, producing bimodal Ghostery samples on espn.

## Headline data — first complete run (8 pages, 2026-05-13, median of 5)

Run id: `2026-05-13T16-40-06-574Z`. Pages: cnn, foxnews, dailymail, nypost, allrecipes, foodnetwork, weather, espn. Each `(page, variant)` was sampled 5× back-to-back; cells below are the **median**, p25/p75 in each `<variant>.metrics.json` under `.stats`. Every ghostery sample verified `ghosteryStatus.ready === true` (40/40).

Aggregate (sum of medians across all 8 pages):

| Metric | Vanilla | Ghostery | Δ |
|---|---:|---:|---:|
| innerText tokens | 12.6 k | 12.6 k | **+0.5 %** (≈ neutral — see per-page split) |
| HTML tokens | 3.76 M | 3.57 M | **−5.0 %** |
| A11y tree tokens | 966 k | 930 k | **−3.7 %** (flipped sign from previous run — was +4.8 %) |
| Viewport image tokens | 9.0 k | 9.0 k | 0 % (fixed dimensions) |
| Estimated full-page image tokens | 5.7 k | 5.7 k | +1.7 % |
| Network bytes | 64 MB | 69 MB | +8.2 % (autoconsent + ghostery content scripts pull secondary loads) |

Per-load $ (Sonnet 4.6 input, $3/MTok):

| Mode | Vanilla | Ghostery | Saved | per 1k loads |
|---|---:|---:|---:|---:|
| innerText + viewport screenshot | $0.0081 | $0.0081 | −$0.00002 | −$0.02 |
| A11y tree + viewport screenshot | $0.366 | $0.352 | $0.013 | **$13.36** |
| Full HTML + viewport screenshot | $1.41 | $1.34 | $0.070 | **$69.84** |
| innerText + full-page screenshot | $0.0068 | $0.0069 | −$0.00006 | −$0.06 |

**Consent-dismiss overhead is currently $0/1k in this dataset.** The detector flagged a banner on both runs for all 8 pages (0 cases where Ghostery dismissed but vanilla did not), so the model adds no overhead to vanilla. This is a regression vs the previous "1/8 detected" run — the detector is now matching cookie-policy text in footers on every page. Real autoconsent activity is visible in per-page text deltas (cnn +20 %, nypost +31 %, foodnetwork +44 %) but the headline savings number stays at $0 until problem #1 ships. See "Next session — priorities" below.

### Notable per-page observations

- **espn**: Ghostery is the largest single-page win — text **−43.2 %** (2.6 k → 1.5 k), HTML **−72.5 %** (264 k → 73 k), A11y **−44.8 %** (209 k → 116 k). iframeCount drops 6 → 1. The previous "0 innerText" failure (problem #2) is fully fixed — every sample now extracts real content. One leftover wrinkle: s1 of the 5 samples landed at html=154 k / iframes=0 while s2-s5 stabilised at ~73 k / iframes=1. Median picks 73 k; worth keeping an eye on whether s1 is an early-extract race or a real bimodal mode.
- **cnn**, **nypost**, **foodnetwork**: text tokens go **up** under Ghostery (+20.5 %, +30.6 %, +43.8 %) because autoconsent dismisses the cookie wall and the article body renders. Same story as before — a real "agent gets useful content sooner" win, but token cost goes up, not down.
- **dailymail**, **allrecipes**: still both stuck at ~70 text tokens in both variants — consent wall renders before Ghostery's content scripts attach. HTML token count goes *up* under Ghostery (105 → 1.5 k, 187 → 1.6 k) because Ghostery's autoconsent script body itself is in the DOM. Net bytes also spike (798 B → 1.85 MB, 1.3 KB → 1.85 MB) — that's autoconsent worker scripts loading even though they fail to find a matching dialog.
- **foxnews**: nearly identical (no consent wall, modest difference in iframes / requests).
- **weather**: modest reduction across the board (text −5.6 %, html −0.5 %, a11y −5.5 %). `browsingContext.getTree` timeouts still fire in the background, harmless (caught by `unhandledRejection`).
- **Network bytes go up under Ghostery on most pages.** MV3 declarative blocking happens at the network layer, but autoconsent + Ghostery's own content scripts + the pin-it iframe + (on dailymail/allrecipes) Ghostery's request bundles all add load. The +8.2 % aggregate is consistent with the previous run's +10.8 %.

## Next session — priorities

Headline rerun is done (see table above). The two pieces of the story that the rerun made more important, not less:

1. **Tighter consent detection** (problem #1 below, ≈ one session) — **promoted to #1** because the previous run had 1/8 detected and gave us $6/1k savings; the new run has 0/8 detected and gives $0/1k. The "Ghostery dismisses banners so you don't pay agent loops to do it" story is the single biggest savings claim and is currently invisible in the headline. Concretely: cnn, nypost, and foodnetwork all show large positive text deltas under Ghostery (+20 / +31 / +44 %) which is exactly the "banner went away, body rendered" signal we want the detector to flag, and it doesn't. Either adopt `@duckduckgo/autoconsent`'s detector or hand-roll the position/area/z-index heuristic in problem #1.

2. **A11y filtering** (problem #4 below, ≈ half a day). The aggregate flipped from +4.8 % (Ghostery makes it worse) to −3.7 % (Ghostery saves $13/1k), but only because espn alone dropped 209 k → 116 k A11y tokens. The other 7 pages are still mixed. A filtered tree ("interestingOnly: true"-style) is what real agents actually consume, so capture both and report filtered as primary — that's the row a skeptic will quote.

3. **Investigate the espn s1 outlier.** Out of 5 ghostery samples, s1 was 154 k html / 0 iframes while s2-s5 were ~73 k / 1 iframe. Median is fine for the headline but a 2× swing on the first sample suggests there's still a state leak between the warmup window and the first navigation. Cheap experiment: capture per-sample request timing for the first ad slot's blocking decision and see if it lands before vs after extract.

Then in priority order: #7 (agent simulation, the actual deliverable), #5 (cross-region), #8 (report polish — remaining items: "verdict" column, per-page $ delta column), #6 (BiDi `webExtension.install`, low value).

## Open problems (one per future session)

### 1. Tighten consent-banner detection

Current detector matches a broad regex on `document.body.innerText` plus a long list of `[id*="onetrust" i]`-style selectors. Both fire false positives (cookie text in privacy-policy footers ⇒ false ⚠️ on cnn / nypost / weather) and false negatives (dailymail / allrecipes vanilla are clearly blocked but flagged "no banner"). Replace with: walk `document.querySelectorAll('*')`, keep elements whose computed `position` is `fixed`/`sticky`, area > 30 % of viewport, z-index > 100, and whose text contains specific button strings ("accept all cookies" / "reject all" / "manage preferences"). Optionally adopt `@duckduckgo/autoconsent`'s detection helper directly.

### 2. ~~Investigate espn Ghostery breakage~~ — fixed (harness bug, not Ghostery)

**Fix shipped** in `src/measure.js`: extract now goes through CDP `Runtime.evaluate` (via the existing `chromedriverCdp` helper used for a11y + screenshots) instead of webdriverio's `browser.execute()` → BiDi `script.callFunction`. One retry on either error or stale-snapshot signal (`innerText.length < 100 && scrollHeight <= viewport.height`).

Verification: 10/10 espn runs succeeded, vs. ~30% failure rate pre-fix. Extract timings 16–289 ms (no retries fired), down from ~556 ms via BiDi.

Original diagnosis kept below for context.

---


Root cause is in the **harness**, not Ghostery. The "broken" 15-02-36 capture (ghostery `innerText=0`, body literally `<body ...>\n\t\t</body>`) was contradicted by the viewport screenshot from the same run, which shows espn **fully rendered** (NBA scoreboard, LeBron headline, autoconsent had dismissed the Disney privacy modal). So Ghostery did its job; what we wrote to disk was a bad snapshot.

In 5 repeat runs + 1 headed + the original, two distinct failure modes appeared (~3/7 total):

1. **Outright `script.callFunction` error**: `WebDriver Bidi command "script.callFunction" failed with error: unknown error - Cannot find context with specified id`. `measure()` catches this only as a thrown error and writes a minimal `{error: ...}` metrics file; html/text/a11y/screenshot are skipped.
2. **Silent stale snapshot**: `script.callFunction` returns the document's outerHTML with an empty `<body>` (matches the raw server-side HTML's `<body class="...prod  ">` pre-hydration state) even though the DOM has fully painted by the time the screenshot is taken ~150 ms later.

Chromedriver log (`results/2026-05-13T15-20-11-961Z/espn/ghostery.chromedriver.log`) shows the BiDi-mapper CDP send `Runtime.callFunctionOn(executionContextId: 1, sessionId: 3F44C03F…)` issued at t=623.970 returning `Cannot find context` at t=624.520 — a 550 ms window during which the main frame's children went through an iframe storm: `__tcfapiLocator` attaches, Adobe AccessEnabler, Ghostery's `pages/notifications/pin-it.html` (the "pin the extension" notification, injected as a child iframe of espn by `chrome-extension://.../store/options.js`), repeated `about:blank` placeholders, and four `executionContextCreated`/`executionContextDestroyed` pairs. Ghostery's pin-it iframe is **additive load** on top of espn's already-busy frame tree and pushes the BiDi mapper's realm bookkeeping over the edge. (We can confirm by disabling pin-it: set the Ghostery "pin notification dismissed" pref or filter the iframe, then repeat the 5-run test.)

espn is the only page where this fires currently because (a) it sets up an unusual number of short-lived iframes during init, and (b) the consent flow is one of the slower ones we hit. cnn and weather have fewer iframes; nypost / foxnews don't trigger it in any observed run.

**Fixes in priority order:**

- (a) Switch `extract` from BiDi `browser.execute()` to direct CDP `Runtime.evaluate` (we already use CDP for a11y + screenshots — same pattern). That sidesteps the mapper entirely for the high-value call. The wdio `browser.execute` is convenient but adds a layer that races during iframe churn.
- (b) Add retry-with-backoff around the extract call (1 retry after 500 ms is probably enough). Cheap, low-risk; doesn't fix the silent-stale-snapshot case though.
- (c) Add a sanity check: if `pageData.scrollHeight < 200` or `body.children.length === 0` but the screenshot dimensions imply a real page, retry. This catches the silent case.
- (d) Optional: bump `SETTLE_AFTER_LOAD_MS` for ghostery runs to 3 s. Probably masks the bug without fixing it.

Once (a)+(c) ship, re-run espn 10× and confirm 0/10 failures.

### 3. ~~Add `--repeat N` for stability~~ — done (`--repeat N`, default 1)

`node src/run.js --repeat 5` now runs each `(page, variant)` N times back to back and aggregates the samples. The default of `1` keeps single-shot behaviour identical to before (same artifact filenames, same metrics-row shape passed to the report).

**Design choices and rationale:**

- **Sample loop scope = inside `(page, variant)`.** Page A's vanilla repeats are adjacent in time, then page A's ghostery, then page B. We do *not* permute the whole page list per repeat. Rationale: keeps ad rotation + cache state similar across the N samples of one cell so the noise we measure is page-level noise, not cross-page drift. Also lets us keep one `runId` directory and one `runDir` output even for large N. We can change to interleaved later if cell-level drift turns out to be the more interesting noise source.
- **Aggregator = `src/aggregate.js`.** For every numeric leaf in the metrics tree (e.g. `html.tokens`, `network.bytes`, `timings.extract`) we record `{median, p25, p75, min, max, samples}` in a separate `stats` map and place the **median** at the original path. Non-numeric leaves (`title`, `consentBannerDetected`, `iframeSrcs`, …) get the **mode** (most common value). Rationale: the report consumes `r.html.tokens` etc. directly — we don't want to rewrite that path. By burying the variance under `.stats` we get a strict superset of the N=1 metrics shape, and the existing report code keeps working unchanged.
- **Median over mean.** Pages occasionally produce one wildly different sample (Ghostery's adblock engine not fully loaded → unblocked ads bump html tokens ~3×; verified in the espn `--repeat 3` test). Median ignores that outlier; mean would let it dominate. p25/p75 in `.stats` lets a reader spot the bimodal cases. We're not doing N=2 specially — with two samples, median = mean, so it doesn't matter.
- **Per-sample artifacts on disk when N > 1.** Each sample writes `<variant>.s{i}.{html,text.txt,a11y.json,viewport.png}`; the consolidated `<variant>.metrics.json` carries `.samples[]` + `.stats`. When N=1 the suffix is dropped to keep the file layout identical to pre-repeat. Disk cost is bounded (~5 MB per sample), so we save everything rather than just sample 1 — useful for debugging why one sample diverged.
- **Report shows medians + a header note.** The per-page table is unchanged; we add one line at the top: "Samples: up to **N per (page, variant)** — cells show the median." Anyone wanting the spread reads `stats` in the JSON. We can add a p25–p75 column to the table later if it earns its keep.
- **Error handling.** If any one sample throws, that sample's entry in `samples[]` carries `{error: ...}` and the aggregator surfaces the first error on the returned row. The report's existing "ERROR: …" handling for failed rows then catches it. With N>1 a partial failure currently nukes the whole cell — we could relax that to "aggregate over successful samples only" if it becomes a problem.

First observation already: even with the espn flakiness fix, `--repeat 3` on espn showed Ghostery HTML tokens swinging between 71 k and 263 k across the three samples. The big-html samples have iframeCount=3, the small-html sample has iframeCount=1 — the MV3 adblocker engine isn't always fully loaded by the time the first navigation extracts. The current 4 s warmup is sometimes too short. **Action: bump `GHOSTERY_WARMUP_SETTLE_MS` or add a content-script readiness probe.** Tracking as problem #9 below.

### 4. A11y mode realism — capture filtered tree, not full

`Accessibility.getFullAXTree` returns 190 k+ tokens for cnn — huge and not what real agents consume. Real agents use `interestingOnly: true`-style filtering or `aria-snapshot`. Capture both a "raw" full tree (current) and a "filtered" tree (drop nodes whose role is `none` / `presentation` / `InlineTextBox` / `text` if no name; drop nodes with no name and no children). Report the filtered cost as primary.

### 5. Cross-region consent-wall reproducibility

The consent walls we saw (cnn, dailymail, allrecipes) only appear because the test machine's IP is in the EEA. For US-only or fully-public pages the picture changes. Either (a) tag pages with expected jurisdiction in `pages.json` and report broken-out results, or (b) add a way to route the browser through a US/EU IP to A/B test that effect.

### 6. BIDI `webExtension.install` revisit

When chromedriver / Chrome lifts the `Extensions.loadUnpacked` gate (or chromium-bidi switches to a different CDP method), drop the `--load-extension` arg and use BIDI cleanly. Track via the chromium-bidi GitHub issues; the current diagnostic logs (`*.chromedriver.log`) contain the exact failing call so we'll know when it starts succeeding.

### 7. Honest end-to-end agent simulation

The current cost model is artifact-based: it costs out a single page consumption. A real agent loop is multi-turn (read, decide, click, read, …). Sim a fixed task ("find and read the article body") with both variants, count actual model turns + total tokens. That's the number worth quoting publicly.

### 8. Report polish

- ~~Drop the misleading "Notes" line that still says "first-launch warmup waits 25s" (now 4 s).~~ — done in `src/report.js`; now says "adaptive handshake against the extension status page; typically ~3-5s".
- Add a "verdict" column in the per-page table that combines consent + content-rendered + cosmetic-filter signals.
- Per-page $ delta column, not just aggregate.

### 9. ~~MV3 adblocker engine warmup is sometimes incomplete~~ — done (status page readiness probe)

Replaced the fixed `setTimeout(4000)` warmup with a real handshake against the extension. The extension now ships an automation-friendly page at `pages/status/index.html` that asks the background `{action: 'status:get'}`; the background `src/background/status.js` awaits the adblocker `setup.pending` promise and replies with `{ ready, adblocker: {ready, error}, version, id }`. The page surfaces the reply as `window.__ghosteryStatus` (and renders it for humans). The harness opens that URL during warmup and polls `Runtime.evaluate('window.__ghosteryStatus')` every 100 ms until `ready === true` (timeout 30 s, fallback to the old `example.com` + 4 s sleep).

**Knock-on changes:**

- `research/src/measure.js` discovers the loaded extension's ID at runtime by navigating to `chrome://extensions` and reading `$('>>>extensions-item').getAttribute('id')` — the same trick `tests/e2e/wdio.conf.js` uses. Works regardless of whether the extension was loaded by path, by archive, or with a manifest `key`, and the project already maintains the deep selector.
- `research/src/run.js --ext-dir PATH` (or `GHOSTERY_EXT_DIR=PATH` env) points at any pre-built unpacked extension instead of extracting `ghostery-automation-chromium.zip`. Default behaviour with no flag/env is unchanged.
- The per-sample metrics now carries `ghosteryStatus: {ready, adblocker, id, version}` so we can post-hoc check whether each sample saw a fully-loaded extension.
- New `scripts/patch-automation.sh` rewrites a freshly built `dist/`: renames `manifest.json` `name`/`short_name` to "Ghostery (Automation)" and flips `store/options.js` `terms`/`onboarding` defaults to `true` so the first-run UI is skipped. Run after every `npm run build chromium`.

**Workflow:**

```bash
# from repo root
npm run build chromium
scripts/patch-automation.sh dist
(cd research && node src/run.js --pages espn --repeat 5 --ext-dir ../dist)
```

**Verification (espn, `--repeat 3`, `--ext-dir ../dist`):**

| Metric | Before (`web-ext-artifacts/*.zip`, fixed 4 s warmup) | After (status-page poll) |
|---|---|---|
| Ghostery html token samples | 262 641 / 263 550 / 71 888 (3.7× swing) | 70 485 / 70 796 / 151 463 |
| iframeCount samples | 3 / 3 / 1 | 1 / 1 / 1 |
| Warmup phase | always 4 000 ms | 2 879 / 2 987 / 3 780 ms (adaptive) |

The bimodal "engine-not-loaded vs engine-loaded" pattern is gone — every sample now reports `ghosteryStatus.ready === true` and `iframeCount = 1` (the persistent ad slot that espn renders even with blocking). Residual variance (70 k vs 151 k html) is real page-content variance, not a Ghostery state issue.

## How to run

### One-time setup

```bash
cd research
npm install
npx @puppeteer/browsers install chrome@stable --path .browsers
npx @puppeteer/browsers install chromedriver@stable --path .browsers
npx playwright install chromium             # only needed if you want to compare vs Playwright
```

### Per-session: build a fresh extension and run the harness against it

```bash
# from repo root: rebuild Ghostery from source and apply the automation patches
npm run build chromium
scripts/patch-automation.sh dist

# from research/: point the harness at the freshly built dist
cd research
node src/run.js --repeat 5 --ext-dir ../dist                # full suite, median of 5
node src/run.js --pages cnn,espn --ext-dir ../dist          # subset
node src/run.js --headed --ext-dir ../dist                  # visible browser
node src/run.js --debug  --ext-dir ../dist                  # wdio + chromedriver logs
node src/run.js --fullpage --ext-dir ../dist                # also captures full-page PNG (slow)
node src/report-cli.js                                      # re-render latest report.md
```

`GHOSTERY_EXT_DIR=PATH` is equivalent to `--ext-dir PATH`.

### Legacy path (no rebuild)

If you don't want to rebuild Ghostery, the harness still falls back to extracting
`web-ext-artifacts/ghostery-automation-chromium.zip` into `.ghostery-extension/`:

```bash
cd research
node src/setup.js     # extracts the zip
node src/run.js       # no --ext-dir → uses the extracted zip
```

That path also skips the status-page readiness probe (older zip predates the
status page) and falls back to a 4-second sleep, which can produce the bimodal
samples described in problem #9.
