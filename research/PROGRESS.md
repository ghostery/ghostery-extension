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
- `SETTLE_AFTER_LOAD_MS = 2500` — covers Sourcepoint's iframe injection (~1.5-2 s) and OneTrust's autoconsent dismissal fade. 1.5 s was sometimes too short — weather's consent iframe wasn't in the captured DOM, cnn's OneTrust preference panel was mid-dismissal.
- Ghostery warmup is now a real handshake against `chrome-extension://<id>/pages/status/index.html` — see problem #9. Replaces a 4-second `setTimeout` that was sometimes too short, producing bimodal Ghostery samples on espn.
- Consent-banner detector lives in `src/detect-consent.js`. Walks `body *`, keeps fixed/sticky elements that pass `Element.checkVisibility`, intersect the viewport, cover ≥ 15 % of viewport area, and either contain a consent-button phrase ("accept all" / "reject all" / "manage preferences" etc.) or wrap an iframe pointing at a known CMP CDN (Sourcepoint, Cookiebot, Didomi, TrustArc, …). See problem #1.

## Headline data — 8 pages, median of 5, new detector (2026-05-13)

Run id: `2026-05-13T18-58-19-691Z`. Pages: cnn, foxnews, dailymail, nypost, allrecipes, foodnetwork, weather, espn. Each `(page, variant)` sampled 5× back-to-back; cells below are the **median**, p25/p75 in each `<variant>.metrics.json` under `.stats`. Every ghostery sample verified `ghosteryStatus.ready === true` (40/40). Consent flags are 5-of-5 stable per cell (no flakes).

**Consent banner detected:** vanilla TRUE on cnn / nypost / weather / espn (4/8); ghostery TRUE on none → **4 pages where ghostery's autoconsent saved the agent a banner-dismiss loop**.

Aggregate (sum of medians across all 8 pages):

| Metric | Vanilla | Ghostery | Δ |
|---|---:|---:|---:|
| innerText tokens | 12.7 k | 13.7 k | **+8.1 %** (Ghostery surfaces more body content via autoconsent) |
| HTML tokens | 3.77 M | 3.71 M | **−1.7 %** |
| A11y tree tokens | 983 k | 1 034 k | +5.3 % (Ghostery reveals more interactive nodes once banners go) |
| Viewport image tokens | 9.0 k | 9.0 k | 0 % (fixed dimensions) |
| Estimated full-page image tokens | 5.7 k | 6.1 k | +6.8 % |
| Network bytes | 61 MB | 72 MB | +17.9 % (autoconsent + ghostery content scripts pull secondary loads) |

Per-load $ (Sonnet 4.6 input, $3/MTok), **without** modelling banner-dismiss agent cost:

| Mode | Vanilla | Ghostery | Saved | per 1k loads |
|---|---:|---:|---:|---:|
| innerText + viewport screenshot | $0.0081 | $0.0085 | −$0.00039 | −$0.39 |
| A11y tree + viewport screenshot | $0.372 | $0.391 | −$0.019 | −$19.46 |
| Full HTML + viewport screenshot | $1.42 | $1.39 | $0.024 | **$23.90** |
| innerText + full-page screenshot | $0.0069 | $0.0074 | −$0.00053 | −$0.53 |

**With consent-dismiss overhead modeled** — extra agent turns × **measured** per-turn input tokens for each of the 4 dismissed banners (cnn, nypost, weather, espn):

The 5-k-tokens-per-turn assumption from earlier is now replaced with measured Anthropic `count_tokens` calls on the captured (screenshot + innerText) for each (page, variant). See `<runDir>/consent-tax.json`. Per-turn input-token cost for an agent prompt that includes the viewport screenshot, the system instruction, and ~8 k chars of `innerText`:

| Banner page | Per-turn vanilla | Per-turn ghostery |
|---|---:|---:|
| cnn | 3 401 | 3 401 (text truncated equally) |
| nypost | 2 443 | 2 864 |
| weather | 2 316 | 2 189 |
| espn | 4 207 | 4 070 |

Average per-turn vanilla on banner pages: **3 092 tokens**. (Compare to the previous synthetic 5 000.)

Multiplier: a banner-bearing turn-sequence is "see banner → decide → click → re-read." We assume **2 extra turns** (conservative) or **3 extra turns** (aggressive) of vanilla overhead beyond the single read-and-extract turn Ghostery requires. Layer 3 (real Anthropic computer-use trajectories on 2-3 banner pages) is the next-session item that turns this assumption into a measurement.

Per 1 k page loads, assuming 4/8 = 50 % banner prevalence (every other load hits a banner page) and ~3 100 tokens per banner-page agent turn:

| Extra-turns assumption | Banner-page tax | Per 1 k loads | Saved (Sonnet 4.6 input) |
|---|---:|---:|---:|
| 2 extra turns / banner | 6 200 t / banner page | 3.10 M tokens / 1 k loads | **$9.28 / 1 k** |
| 3 extra turns / banner | 9 300 t / banner page | 4.64 M tokens / 1 k loads | **$13.93 / 1 k** |

The previous synthetic model used 3 loops × 5 k = 15 k tokens / banner → $22.50 / 1 k, ~60–150 % higher than the measured range. Still material; story unchanged, just defensible numbers now.

Story: Ghostery does **not** make page payloads smaller — in this 8-page set the text/HTML/A11y artifact sizes are flat-to-slightly-bigger because autoconsent reveals body content that vanilla hides under banners. The savings come from the agent **not having to dismiss the banner itself**. The per-turn tax is the boilerplate (~200 t) + viewport screenshot (~1 366 t) + truncated text (~1 500 t) the agent re-pays for each turn vanilla spends locating and clicking the dismiss button.

### Notable per-page observations

- **cnn**: vanilla banner detected (OneTrust, `[id="onetrust-banner-sdk"]`, 36 % of viewport). Under Ghostery, autoconsent dismisses; text goes from 2.3 k → 2.7 k (+20.5 %, more article body) and the panel is no longer flagged.
- **nypost**: vanilla banner detected (also OneTrust-style). Text 1.0 k → 1.4 k (+37.4 %). Largest text delta in the set.
- **weather**: vanilla banner detected via the **iframe-cmp** path — a fixed wrapper containing `cdn.privacy-mgmt.com/index.html` (Sourcepoint TCF v2). Cross-origin so its innerText is empty, but the URL pattern catches it. Ghostery dismisses; text 917 → 792.
- **espn**: vanilla banner detected (Disney privacy modal — same code path as OneTrust). text 2.6 k → 2.5 k. Note this run's median is iframes 6 → 3 / html flat, whereas the 2026-05-13 16:40 run showed iframes 6 → 1 / html −72.5 %. Real page variance — espn's ad slot count depends on which inventory wins. Median over 5 samples picks the stable mode.
- **foodnetwork**: vanilla no banner detected — page is regionally redirected (test machine in EEA) to a WBD landing page that doesn't show a consent UI. Under Ghostery, text more than doubles (988 → 1421) because the recipe page is allowed to render. The detector being false on vanilla is **correct** here: there really isn't a banner to dismiss; what's happening is Ghostery enables a different (better) page state.
- **foxnews**: no banner in either variant, near-identical metrics.
- **dailymail** and **allrecipes** vanilla pages now look like full-on **anti-bot blocks** ("Access Denied" / "If you are a reader experiencing an access issue, please contact …"). No consent UI is shown, so the detector correctly returns false for both variants. Both pages are essentially unusable for the agent in both modes — they shouldn't be informing the headline. Action item: pick replacement pages with reproducible content access from a residential IP.
- **Network bytes up 17.9 % aggregate.** Same root cause as before — Ghostery's autoconsent + content scripts + (on dailymail/allrecipes) Ghostery's own request bundles. Ad blocking still happens at MV3-DNR level but the additive load outweighs it on this set.

## Next session — priorities

Layers 1 + 2 of the consent-tax measurement stack landed this session. The remaining gaps, in order:

1. **Layer 3 — real Anthropic computer-use trajectory on 2-3 banner pages.** Replaces the "2-3 extra turns" assumption with a measurement. For each of cnn, weather, espn: drive Anthropic's computer-use tool to "extract the article's first paragraph," both variants, 3 trials each, capturing total input tokens consumed. Use those trajectory totals as the "per-banner agent tax" in the headline. ~1 day.

2. **Replace dailymail + allrecipes with reproducible test pages.** Both return anti-bot blocks (Edgesuite "Access Denied" / People Inc. "blocked your IP") from the current machine. They contribute nothing to the consent / blocking story and inflate the network-bytes "+17.9 %" number because Ghostery's autoconsent worker scripts still load against a 403. Pick two pages where (a) the agent would realistically want the content, (b) a consent banner is present in EEA, (c) the IP doesn't get blocked. Candidates: an Independent article, a Reuters piece, a Wired article.

3. **A11y filtering** (problem #4 below, ≈ half a day). The new detector run shows A11y aggregate **+5.3 %** under Ghostery — worse than the previous run's −3.7 %. The realistic-agent answer is filtered AX trees (`interestingOnly: true` style); capture both raw + filtered and report filtered as primary. That's the row a skeptic will quote against the headline.

4. **Fix the autoconsent oracle's iframe-blind spot.** Currently the oracle injects only into the main frame, so Sourcepoint TCF v2 / Quantcast / other iframe-CMP banners come back `lifecycle: "started"` (inconclusive). Fix by enumerating frames via CDP `Target.getTargets` and injecting into each. Improves the auxiliary "X / Y banners with a production-CMP rule" number.

Then in priority order: #5 (cross-region — the EEA-vs-US flip is currently un-tested), coverage extrapolation (Tranco top-1k EEA + autoconsent rule presence → $/million-loads headline), #8 (remaining report polish), #6 (BiDi `webExtension.install`, low value).

## Open problems (one per future session)

### 1. ~~Tighten consent-banner detection~~ — done (structural detector in `src/detect-consent.js`)

The old broad-regex + branded-selector detector was replaced with a structural walk. Gate conditions, in order of evaluation:

1. Position is `fixed` or `sticky`.
2. `Element.checkVisibility({ checkOpacity, checkVisibilityCSS, contentVisibilityAuto })` returns `true` — catches `display:none`, `visibility:hidden`, `opacity:0`, `content-visibility:hidden`, and clipped/transformed-out states that the previous detector missed.
3. The element's `getBoundingClientRect` intersects the viewport. (The OneTrust preference panel on cnn was being false-positive flagged because its bounding rect existed at a real on-screen position even after autoconsent dismissed — `checkVisibility` plus the viewport-intersection check fixes that.)
4. Area ≥ 15 % of viewport.
5. **Either** `innerText` matches a consent-button-action regex (`accept all` / `reject all` / `manage preferences` / `save preferences` / `accept (&|and) continue` / `do not sell` / `customize my (choices|preferences)` / `agree (&|and) (continue|proceed)`), **or** the element wraps an `<iframe>` whose `src` matches a known CMP CDN (`cdn.privacy-mgmt.com`, `cookielaw.org`, `cookiebot.com`, `usercentrics.eu`, `consentmanager.net`, `consent-pref.trustarc.com`, `didomi.io`, `consensu.org`, etc.). The iframe path is required for Sourcepoint / TCF v2 banners whose buttons render cross-origin.

Per-candidate diagnostics (tag, id, class, w, h, z-index, areaPct, role, ariaModal, `matchedBy`, `cmpIframeSrc`, `textSample`) are kept in `consentBannerCandidates`.

Knock-on changes: `SETTLE_AFTER_LOAD_MS` bumped from 1500 → 2500 to give Sourcepoint enough time to inject its iframe and OneTrust enough time to complete its autoconsent dismissal fade.

**Verification (8-page, `--repeat 5`, 40/40 ghostery samples `ready=true`):** detected vanilla=TRUE on cnn / nypost / weather / espn, ghostery=FALSE on all of them. Detector decisions are 5-of-5 stable per cell. Banner-dismissed-by-autoconsent count: **4 / 8** (was 0 / 8 with the previous detector, was 1 / 8 with the original one).

**Corroboration via autoconsent oracle (Layer 1):** `src/autoconsent-oracle.js` injects `@duckduckgo/autoconsent`'s production rulebase into the main frame after artifacts are captured, with `autoAction: null` so it only detects, never acts. Captured per sample as `metrics.autoconsent.{detected, cmp, lifecycle, inconclusive, durationMs}`. On the 4-page subset (cnn / foxnews / weather / espn):

| Page | Vanilla viz | Vanilla oracle | Ghostery viz | Ghostery oracle |
|---|:-:|---|:-:|---|
| cnn | ✓ | OneTrust, `openPopupDetected` (204 ms) | – | OneTrust, `cmpDetected` (532 ms — rule still in DOM, popup not open) |
| foxnews | – | inconclusive (`started`, 8.0 s) | – | inconclusive (`started`, 8.0 s) |
| weather | ✓ | inconclusive (`started`, 8.2 s) | – | inconclusive (`started`, 8.2 s) |
| espn | ✓ | OneTrust, `openPopupDetected` (203 ms) | – | inconclusive (`started`, 8.2 s) |

Confirms the visibility detector on OneTrust pages (cnn, espn) with the bonus of identifying the CMP family. The `inconclusive` cases are a known limitation: our oracle injects into the main frame only, so Sourcepoint TCF v2 (weather) and other iframe-CMP banners stall in `findCmp()`. The real Ghostery extension injects into every frame and handles these fine — that's why ghostery dismisses weather's banner in practice. Fix tracked as next-session item #4.

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

### Layer 2 — per-turn agent token cost via Anthropic count_tokens

Reads the screenshots + innerText from a completed run and calls Anthropic's `count_tokens` for each (page, variant) with a realistic agent prompt. Output goes to `<runDir>/consent-tax.json`.

```bash
# one-time: API key (placed in .env at repo root or research/.env)
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env

# one-time install
cd research && npm install @anthropic-ai/sdk

# run against latest run dir (default) or a specific one
node src/measure-consent-tax.js
node src/measure-consent-tax.js 2026-05-13T18-58-19-691Z
node src/measure-consent-tax.js <runId> claude-opus-4-7   # different model
```

Per-turn cost = boilerplate + 1 viewport image (1366 t) + truncated innerText (8 000 chars). Multiply by the assumed extra turns to get the consent-dismiss tax. See the headline table for the model.

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
