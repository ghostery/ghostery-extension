# v2 plan — focused

## Claim (one sentence)

A real Anthropic computer-use agent pays ~$X per 1,000 page loads just to dismiss consent banners on US news sites — and the cost compounds with every turn because LLM context isn't free.

(`X` filled in once measurement runs. Working estimate from v1 EU per-turn cost extrapolated to US banner prevalence: **$15–25 per 1k loads** for the vanilla overhead on a vision-mode agent.)

## Why v2

v1 produced strong numbers but on Polish news sites. Too easy for an HN audience to dismiss as geography-specific before reading the methodology. v2 narrows to one measurement, on US pages with named CMPs (OneTrust, Ketch, Sourcepoint, custom CCPA), where HN readers recognize both the publisher and the consent vendor. Smaller percentage savings, much larger audience.

## In scope (only this)

- **Layer 3 only.** Real Anthropic computer-use agent driving Chrome over WebDriver BiDi. No Layer 1 artifact-size analysis, no Layer 2 static tokenizer estimate, no Layer 4 VLM ad-burden.
- **Single fixed task** per page: *"What is the top headline on this page?"* — measurable, terminates cleanly, every agent attempts it.
- **Two variants only:** vanilla Chrome vs. Chrome + Ghostery (autoconsent on).
- **One region:** US, run from a US IP (VPN).
- **One model:** Sonnet 4.6 at list price ($3/MTok input).
- **N=10 trials per (page, variant)** — ~$80–100 total API spend. Median + p25/p75 reported.

## Out of scope (deliberately)

- Artifact-size deltas (rounding error compared to Layer 3; dilutes the story).
- VLM ad-burden output cost (interesting but separate concept).
- Cross-region comparison (one-line footnote referencing v1).
- Industry-wide $/million-loads projections (page set too small to defend).
- Comparison to other consent-handling tools.
- Multiple agent models or price tiers.
- Mobile / non-Chromium browsers.

## Page selection criteria

1. **HN-recognizable publisher.** Front-page brand HN readers would visit themselves.
2. **Reliable banner display.** Banner shows on ≥8/10 vanilla loads from a US IP.
3. **CMP diversity.** Aim for ≥3 distinct CMP vendors across the final set.
4. **No anti-bot wall.** Page must load real content for chromedriver. (Drops dailymail, allrecipes, people, reuters, politico per v1.)
5. **No hard paywall.** Top-of-page reading must work without auth. (Drops nytimes, wsj, bloomberg.)

Candidates and rejections in [`pages-us.json`](./pages-us.json). Validation pass is action item #1 before any API spend.

## Methodology (proven in v1)

- Chrome for Testing latest + matching chromedriver, installed via `@puppeteer/browsers`.
- Vanilla = no extensions. Ghostery = same Chrome + `--load-extension=<built dist>` after `scripts/patch-automation.sh` flips `disableOnboarding`.
- **Anti-bot suppression**: `excludeSwitches: ['enable-automation']`, `--disable-blink-features=AutomationControlled`. Without this several CMPs hide their banner from headless agents and we under-count cost.
- Fresh temp profile per sample. No shared cookies, no carry-over between samples.
- 5s settle delay after page-interactive (modern CMPs like Ketch / OneTrust 2.x render their dialog asynchronously, 3–5s after page-interactive).
- Real Anthropic computer-use loop, screenshot + text input. Stopping condition: agent emits final answer OR exceeds 20 turns.
- Ghostery built from current `main`, not the legacy automation zip.

## Headline outputs

1. **One table.** Final-set pages × {vanilla, Ghostery} × {turns, input tokens, $}. Median with p25/p75. Sum/avg row.
2. **One bar chart.** Per-page $ vanilla vs. Ghostery.
3. **One hero trajectory.** Whichever page has the biggest delta (likely theverge or cnn): side-by-side screenshots of every turn the vanilla agent takes vs. the 2-turn Ghostery agent.
4. **One paragraph on the mechanic.** Why turn-N costs ≈ sum of turns 1..N (re-sent history).

## Deliverables

- `POST.md` — the blog post, conversational tone (target audience: HN, not the lab).
- `POST.html` — single-page visual version with charts and screenshots.
- `RESULTS.md` — full per-page table with error bars, for the deep-divers.
- Reproducible harness: `npm install && node src/measure.js` produces a fresh run.

## Open calls before measurement

1. **Page-set curation.** Validate banner reliability on the candidate list before committing API spend.
2. **Hero page picked from results,** not pre-committed.
3. **Open-source the harness.** Strong recommendation; needs Ghostery sign-off.
4. **Working title.** *"We measured what consent banners cost AI agents."* Open to alternatives once results land.
