# v2 research journal

## Kickoff (2026-05-18)

Splitting from v1 (`research/`) to publish a focused blog post. v1's numbers were strong (up to ~70% savings on EU traffic) but the page set was Polish news; an HN audience would dismiss geo-specific results before reading the methodology.

### What we keep from v1

- Full harness lineage: Chrome for Testing + chromedriver over WebDriver BiDi, fresh-profile per sample, anti-bot suppression flags, `scripts/patch-automation.sh` to disable Ghostery onboarding.
- **Layer 3 (`measure-trajectory.js`) is the only cost measurement that matters.** Static tokenizer estimates undercount real cost by ~50% because turn-history compounding is the dominant factor, and only a real-agent run captures it.
- The autoconsent oracle (`autoconsent-oracle.js`) as the reliable banner-detection signal. Visibility-walk detection stays as a cross-check but misses shadow-DOM CMPs (Ketch, OneTrust 2.x).
- Median over N samples, not mean. One outlier shouldn't move the headline.
- 5s settle delay (the 2.5s default missed CMPs that render asynchronously).

### What we drop from v1

- Layer 1 artifact-size analysis. Real effect, but rounding-error vs. Layer 3 and it dilutes the story.
- Layer 4 VLM ad-burden. Standalone interesting; conceptually separate; confuses a single-narrative post.
- Cross-region comparison. Adds methodology overhead that costs reader attention.
- Multi-model cost comparison. One model (Sonnet 4.6), one price.
- Filtered-vs-raw a11y tree analysis. Not in scope for Layer 3.

### Why US, not Polish

Polish gave the cleanest numbers (100% banner prevalence, ~70% savings) but reads as cherry-picked geography. US sites with named CMP vendors (OneTrust on theverge, Ketch on forbes, CCPA modals on cnn) give a story where HN readers recognize the villain by name. Smaller percentage savings (estimated 25–40% on a curated US set), much larger receptive audience.

### What v2 actually has to generate

v1 has Layer 3 trajectories for **Polish only**. US Layer 3 was extrapolated, not measured. v2's main API spend is running real trajectories on a curated US set. Everything else is supporting work.

### Immediate next actions

1. Validate the candidate page set in `pages-us.json` — quick chromedriver pass, screenshot vanilla load from US IP, confirm banner shows reliably. Drop candidates that fail.
2. Port the trimmed-down harness from `research/src/` — keep `measure.js`, `measure-trajectory.js`, `autoconsent-oracle.js`, `detect-consent.js`, supporting infra. Strip out Layer 1/2/4 code paths.
3. Confirm we can measure from a US IP cleanly (VPN; v1 noted some US sites server-side-skip the modal based on IP heuristics).

## Validation pass — 2026-05-18 (San Jose, US IP)

Loaded all 9 candidates vanilla, 5s settle, ran both detectors. Findings:

| Page | Detection | CMP | Notes |
|---|---|---|---|
| **theverge** | autoconsent | OneTrust | `openPopupDetected`. Clean signal. |
| **cnn** | visibility | custom-CCPA | "Agree" modal in main DOM. |
| **npr** | both | OneTrust | `openPopupDetected`. Strong signal. |
| **theguardian** | neither (but screenshot shows banner) | custom-CCPA | "Your privacy / Do not sell or share my personal information" modal renders AFTER our 5s settle window. Visible in screenshot taken later, missed by detector. Including in measurement anyway — agent waits longer than detector did. |
| forbes | neither (no banner) | – | Clean Forbes homepage from US IP. Dropping. |
| arstechnica | neither (no banner) | – | Clean page from US IP. Condé Nast auto-applies opt-out server-side. Dropping. |
| techcrunch | neither (no banner) | – | Same. Dropping. |
| engadget | neither (no banner) | – | Same. Dropping. |
| washingtonpost | error (anti-bot) | – | `textLen=181` -- automation wall. Dropping. |

**Key finding:** A surprisingly large share of US news sites don't fire a consent banner at all from a US IP. They server-side-apply CCPA opt-out (`us_privacy=1YNN` or similar) and skip the dialog. This makes the US-specific story *smaller* but not zero — the agent still sees real banners on the pages that do fire them, and that's where the savings concentrate.

### Final measurement set

**theverge, cnn, npr, theguardian** — 4 pages, 2 OneTrust + 2 custom-CCPA. Smaller than the 6-8 target but every page has a confirmed visible banner on screenshots.

### Smoke test (1 trial, theverge)

- Vanilla: 3 turns, 13,329 input tokens, 24.5s wall-clock
- Ghostery: 2 turns, 7,666 input tokens, 24.0s wall-clock
- Δ: 1 turn saved, ~5,700 tokens (~43% input-token reduction)

Pipeline works end-to-end. Anti-bot suppression confirmed (banner fires for the agent). Kicking off full N=3 measurement.

## Full measurement — 2026-05-18

Run `2026-05-18T12-59-15-755Z` -- 4 pages × 2 variants × 3 trials.

Median turns and input tokens:

| Page | CMP | Vanilla | Ghostery | Saved |
|---|---|---:|---:|---:|
| npr | OneTrust | 3 turns / 13,349 tok | 2 turns / 7,665 tok | **43%** |
| cnn | custom CCPA | 3 turns / 13,345 tok | 2 turns / 7,666 tok | **43%** |
| theverge | OneTrust | 3 turns / 13,336 tok | 2 turns / 7,666 tok | **43%** |
| theguardian | custom CCPA (no rule) | 3 turns / 13,367 tok | 3 turns / 13,354 tok | **0%** |
| **suite avg** | – | 3.0 / 13,349 | 2.3 / 9,088 | **32%** |

Variance: across 3 trials per cell, turn count is essentially constant (p25 = p75 = median on every cell except theguardian vanilla, where one trial took 4 turns and two took 3). Headlines extracted match between vanilla and ghostery in 3 of 4 pages (theguardian differs because the homepage has multiple top stories and the chosen one depends on viewport state — not a Ghostery effect).

### Key findings

1. **The mechanism the post needs to explain is turn-count compounding.** A 3-turn vanilla read is 1.7× the input tokens of a 2-turn ghostery read, not 1.5×, because turn 3 re-sends turn 2's screenshot. That ratio is the heart of the cost story.

2. **The "no rule = no savings" finding is honest and HN-credible.** theguardian's custom CCPA banner isn't in the DuckDuckGo autoconsent rulebase Ghostery ships, so both variants paid the same cost. That's the truth-in-advertising the post leans into: it isn't magic, it's rule coverage.

3. **US sites are much more often *banner-free* to a headless browser than EU.** 5 of our 9 candidates didn't show a banner at all from a US IP — they auto-applied CCPA opt-out server-side (us_privacy=1YNN style) and skipped the dialog. So the headline number is necessarily smaller than EU, but on banner-bearing pages the per-page savings are similar in shape.

### Deliverables

- `POST.md` -- HN-targeted blog draft (~370 lines, ~7.4 KB).
- `POST.html` -- single self-contained file with inline base64 screenshots and a CSS bar chart (~1.6 MB). Renders correctly verified via headless Chrome → POST.png.
- `RESULTS.md` -- machine-friendly data table.
- `results/2026-05-18T12-59-15-755Z/` -- raw per-trial JSONs and per-turn screenshots.
- `src/` -- the harness (validate.js, measure.js, report.js, render-post.js + supporting modules).

### Open items for follow-up

1. **N=10 would tighten the bounds.** N=3 is enough to publish (variance is tiny), but N=10 would let the post say "p25–p75 across 10 trials" which is more defensible.
2. **More banner-bearing US pages** would broaden the suite. Candidates not yet tried: nbcnews, abcnews, latimes, bostonglobe, vox.
3. **A trajectory comparison for theguardian** would visually reinforce the rule-coverage point (both vanilla and ghostery clicking dismiss = compelling visual).
4. **Open-source the harness.** Needs Ghostery sign-off.

## N=10 extension — 2026-05-18

Ran 7 more trials per (page, variant) on top of the original 3, bringing every cell to 10. Same run dir, cached trials re-used.

Medians moved by less than 30 tokens on any cell; the headline numbers are unchanged. The p25/p75 bounds are now publishable:

| Page | Vanilla turns p25/p75 | Ghostery turns p25/p75 |
|---|:-:|:-:|
| npr | 3/3 | 2/2 |
| theverge | 3/3 | 2/2 |
| cnn | 3/3 | 2/2 |
| theguardian | 3/3 | 3/3 |

Turn count is rock-solid consistent across 10 trials on every cell. Input-token variance within a cell is < 1 % (just different stop-reason text). N=10 confirms the N=3 finding rather than refining it -- the agent's behaviour on a fixed page + fixed task is deterministic enough that 3 trials was already telling the truth.

### Publication adjustment (no open-source yet)

Removed the "Reproduce" section from POST.md (which had a clone-and-run snippet linking to a future-open-source repo). Replaced with a "How it was measured" methodology section that describes the setup without promising the harness is publicly available. The harness still exists in `research-v2/src/` for internal re-runs; just the public-facing post doesn't advertise it. Also removed repo-relative links from POST.md (the `./results/`, `../research/`, `./RESULTS.md` ones) so the markdown reads as a standalone document. POST.html is unaffected -- it was already self-contained via inline screenshots.

### Final state

Deliverables in `research-v2/`:

- `POST.md` (7.2 KB) -- standalone HN-ready draft
- `POST.html` (1.6 MB) -- self-contained with inline screenshots + chart
- `POST.png` (858 KB), `POST-top.png` (192 KB), `POST-bottom.png` (235 KB) -- visual previews
- `RESULTS.md` -- full data table with p25/p75 + headlines + stop reasons
- `results/2026-05-18T12-59-15-755Z/` -- 80 raw trial JSONs and per-turn screenshots

Suite total: 80 trajectories run, ~$8 API spend.
