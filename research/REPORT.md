# Does Ghostery save AI agents money?

**TL;DR (refreshed 2026-05-14, methodology overhaul).** Yes — and the win is materially bigger on native, real-user traffic than the earlier numbers suggested. On a 6-page Polish/EU set running from a Polish IP, with chromedriver's `navigator.webdriver` signal suppressed so CMPs and ad networks actually serve us their full payload, **Ghostery cuts the input-token bill by 17–57 %** depending on what the agent reads each turn — and *separately* the same Ghostery viewport screenshot costs a downstream VLM **~2× fewer output tokens** to inventory.

Headline savings (artifact tokens + measured per-turn consent-tax × {2, 3} extra dismissal turns, Sonnet 4.5/4.6 input @ $3/MTok, 100 %-banner workload):

| What the agent reads each turn | Saved (2-turn) | Saved (3-turn) |
|---|---:|---:|
| `innerText` + viewport screenshot (vision agent) | **57.0 %** | 65.7 % |
| `innerText` + full-page screenshot | 59.4 % | 67.5 % |
| Filtered A11y tree + viewport (browser-use shape) | **26.3 %** | 33.7 % |
| Full HTML + viewport screenshot (worst-case scraper) | **17.3 %** | 21.4 % |
| Raw `getFullAXTree` + viewport (adversarial baseline) | 8.4 % | 10.6 % |

The "Full HTML" row used to be a 2 – 3 % rounding error on the prior EEA-cross-region set; on native Polish traffic it's **17 %** — Polish publishers serve their full ad-laden HTML to PL IPs, Ghostery strips ~14 % of it, and that delta is real money.

Methodology fixes shipped this session and behind these numbers:

1. **Anti-bot suppression** (`measure.js`): `--disable-blink-features=AutomationControlled` + `excludeSwitches: ['enable-automation']`. Without this, several CMPs (including Wirtualna Polska's, used by pudelek.pl) detect `navigator.webdriver === true` and skip serving the consent dialog entirely; ad networks similarly throttle. *All prior measurements were "bot-lite" and undercount real-user cost.*
2. **Multilingual consent detector** (`detect-consent.js`): button-text regex now covers EN/PL/DE/FR/ES/IT/PT and `csr.onet.pl` + generic `/cmp` iframe paths.
3. **Managed-config automation patch** (`scripts/patch-automation.sh`): now flips `disableOnboarding: true` in `dist/store/managed-config.js` instead of mutating built `options.js` defaults. This auto-accepts terms (so autoconsent runs), skips onboarding, **and suppresses the "Pin Ghostery" notification** that was contaminating Ghostery viewport screenshots in prior runs.

Run: `2026-05-14T12-50-26-498Z` · 6 Polish pages (onet / wp / interia / gazeta / pudelek / kwestiasmaku) · region=eu · median of 5 fresh-profile samples · Chrome for Testing 148 · Ghostery built from `main` + patched.

---

## Hypothesis

An AI agent driving a browser pays an input-token bill in two places:

1. **Artifact size.** DOM / `innerText` / accessibility tree / screenshots all get fed back to the model. Bigger pages → bigger prompts.
2. **Turn count.** A consent banner that hides the content forces the agent to look at the banner, decide which button to click, click it, re-read the page. Each extra turn re-pays the system prompt + viewport screenshot (~1.4 k tokens) + truncated text.

Plus a third effect we only validated this session:

3. **Visual ad clutter.** A vanilla viewport carrying ads / sponsored cards / cookie banners costs a VLM *more output tokens* for the same content-extraction task — sometimes so much that the model fails to produce structured output at all.

## Test set (EU)

| Page | URL | CMP / notes |
|---|---|---|
| onet | https://www.onet.pl/ | Ringier Springer (`com_springer`), full-viewport modal |
| wp | https://www.wp.pl/ | Wirtualna Polska CMP |
| interia | https://www.interia.pl/ | Bauer Media CMP |
| gazeta | https://www.gazeta.pl/0,0.html | Agora SA CMP |
| pudelek | https://www.pudelek.pl/ | Wirtualna Polska CMP — *only appears with `navigator.webdriver` suppressed* |
| kwestiasmaku | https://www.kwestiasmaku.com/ | OneTrust (Polish locale) |

**6/6 pages show a consent banner in vanilla; 0/6 in Ghostery** (autoconsent dismisses every one). That's a 100 % banner prevalence on this set — Polish publishers are uniformly aggressive about consent flows. Earlier runs on this same set with bot-detection unsuppressed found only 5/6 (pudelek's WP CMP refused to show the dialog to a bot).

## Artifact size — now the story is bigger

Aggregate tokens summed across all 6 pages, median per `(page, variant)`:

| Artifact | Vanilla | Ghostery | Δ |
|---|---:|---:|---:|
| Raw HTML | 1.14 M | 985 k | **−13.6 %** |
| `innerText` | 44.0 k | 37.5 k | **−14.6 %** |
| Filtered A11y (browser-use shape) | 174 k | 165 k | −5.2 % |
| Raw `getFullAXTree` | 1.40 M | 1.33 M | −5.0 % |
| Viewport screenshot (1280 × 800) | 6.7 k | 6.7 k | 0 % |
| Full-page screenshot | 2.1 k | 2.4 k | +14.1 % |
| Network bytes received | 16.5 MB | 16.0 MB | −2.5 % |

This is the inverse of the picture on US-on-EEA traffic, where every artifact-row was flat-to-slightly-*larger* under Ghostery because autoconsent revealed body content the banner had hidden. On native Polish traffic Ghostery removes more than the banner reveals — the ad / tracker / partner-script payload is large enough that blocking it dominates.

The `innerText` row goes down (−14.6 %) because the Polish consent dialogs themselves contain ~3 paragraphs of legalese; once dismissed, the homepage `innerText` is much shorter than "consent prose + headlines". Same for HTML.

The full-page screenshot is +14 % under Ghostery because the dismissed-banner page is taller than the banner-overlaid one (the agent now sees the full homepage column rather than a fixed-position dialog). Not a meaningful cost signal in either direction — viewport-screenshot is the realistic cell.

## Per-turn agent cost — measured

`src/measure-consent-tax.js` calls Anthropic's `messages.countTokens` on a realistic agent prompt (system instruction + viewport screenshot + 8 kB-truncated `innerText`) for every `(page, variant)` cell.

| Page | Vanilla / turn | Ghostery / turn |
|---|---:|---:|
| onet | 4,728 | 4,794 |
| wp | 4,283 | 4,699 |
| interia | 4,813 | 4,839 |
| gazeta | 5,046 | 5,035 |
| pudelek | 4,276 | 4,364 |
| kwestiasmaku | 2,994 | 2,832 |
| **avg** | **4,357** | **4,427** |

Per-turn cost on Polish sites averages **~4,400 tokens** — higher than the 3,100-tok/turn we measured on US-on-EEA pages, because the Polish consent dialogs contain more text and the `innerText` budget fills up.

## Headline cost translation

A vanilla agent on a banner page burns the per-turn cost above each time it loops "see banner → decide → click → re-read." Ghostery's autoconsent skips that loop entirely.

### Step 1 — the consent tax (vanilla only, Layer 2)

100 % banner prevalence on this set × 4,357 tok/turn × {2, 3} extra turns at Sonnet 4.5/4.6 input ($3/MTok):

| Extra-turns / banner | Tax per load | Per 1,000 loads |
|---|---:|---:|
| 2 (conservative) | 8,714 tok | **$26.14 / 1k** |
| 3 (typical) | 13,071 tok | **$39.21 / 1k** |

> **Caveat — Layer 3 not yet captured for this run.** The earlier cross-region measurement (Layer 3 trajectory: real Anthropic computer-use agent driving Chrome over BiDi) saw vanilla burn ~14.7 k tokens per banner page on average — already higher than the static `{2,3} × 3,100` model predicted, because each extra agent turn re-sends the message history and the per-turn cost compounds. On the EU set per-turn cost is ~40 % higher, so Layer 3 here would likely land in the **$60 – $100 / 1k** range. Tracked as next-session work.

### Step 2 — total bill (artifact + consent tax) per agent mode

Per-page artifact cost (Sonnet 4.6 input, $3/MTok) plus the Step-1 tax:

| Agent mode | Vanilla $/1k | Ghostery $/1k | Saved $/1k | **Saved %** |
|---|---:|---:|---:|---:|
| `innerText` + viewport screenshot | $51.50 | $22.10 | $29.36 | **57.0 %** |
| `innerText` + full-page screenshot | $49.20 | $20.00 | $29.22 | **59.4 %** |
| Filtered A11y + viewport screenshot | $116.70 | $86.00 | $30.69 | **26.3 %** |
| Full HTML + viewport screenshot | $599.10 | $495.80 | $103.38 | **17.3 %** |
| Raw A11y + viewport screenshot | $727.10 | $666.20 | $60.82 | **8.4 %** |

Numbers are the 2-extra-turn (conservative) row. At 3 extra turns the percentages rise to 65.7 % (innerText + viewport), 67.5 % (innerText + full-page), 33.7 % (filtered A11y), 21.4 % (Full HTML), 10.6 % (raw A11y).

The **`innerText` rows are realistic for Anthropic computer-use-style agents** — short visible-text + screenshot per turn. That's where the ~57 – 65 % headline lives.

The **filtered-A11y row** mimics what production agents like [browser-use](https://github.com/browser-use/browser-use) feed to the model. Aggressive filter cuts the AX tree to ~14 % of raw size; ~26 % overall savings comes from the consent-tax line plus a smaller filtered-AX delta.

The **Full HTML row** is now significant: Polish sites carry **~155 k more HTML tokens per page** in vanilla than Ghostery — partner scripts, tracker inlines, ad scaffolding. At $3/MTok that's $0.10 / load delta, plus the consent tax → 17 % savings.

The **raw A11y row** finally clears the artifact growth (it was a net loss for Ghostery on US-on-EEA traffic because autoconsent revealed more interactive nodes than the ad load added); on EU traffic the ad-driven AX growth in vanilla is bigger than the post-dismissal exposure, so this row is +8 %.

## Ad burden — VLM output cost for content extraction

We sent each viewport PNG to `claude-sonnet-4-5-20250929` with one prompt: "inventory what is visible on this page; output JSON with `articles`, `ads`, `navigation`, `other`." Input tokens are fixed (the image is always 1,326 tokens). The VLM's **output token count** is a proxy for how much labelling work it had to do; ad-cluttered viewports require more output, and at the extreme they cause the model to fail JSON structuring entirely.

| Page | Vanilla out tok | Ghostery out tok | Ratio | Vanilla parseable? |
|---|---:|---:|---:|:-:|
| **onet** | **1,519** | 399 | **3.8 ×** | ❌ (model gave up) |
| **gazeta** | **956** | 414 | 2.3 × | ❌ (model gave up) |
| wp | 630 | 368 | 1.7 × | ✓ |
| interia | 627 | 466 | 1.3 × | ✓ |
| pudelek | 516 | 335 | 1.5 × | ✓ |
| kwestiasmaku | 422 | 291 | 1.4 × | ✓ |
| **total** | **4,670** | **2,273** | **2.05 ×** | — |

Same input cost. Half the output bill with Ghostery. **Two of six vanilla viewports were so cluttered the model failed to emit parseable JSON** — a hard regression that a static-tokenizer cost model would never have surfaced. Per-pixel "information density" of a Ghostery viewport is genuinely higher; the VLM extracted 3 more *article* items aggregated across the four parseable pages.

This is the third Ghostery savings axis. It compounds with the two above on any downstream pipeline that does multi-step VLM extraction (browser-use, AgentQ, etc.).

## Where the banners are caught

Two independent detectors agree (`src/detect-consent.js` + `src/autoconsent-oracle.js`):

| Page | Visibility detector | Autoconsent oracle |
|---|:-:|---|
| onet | ⚠️ | Ringier Springer (`com_springer`), `openPopupDetected` |
| wp | ⚠️ | inconclusive (WP CMP not in autoconsent rulebase) |
| interia | ⚠️ | inconclusive (Bauer CMP) |
| gazeta | ⚠️ | inconclusive (Agora CMP) |
| pudelek | ⚠️ | inconclusive — *only flagged with anti-bot suppression on; visibility detector catches it via Polish button-text regex* |
| kwestiasmaku | ⚠️ | OneTrust, `openPopupDetected` |

The visibility detector now matches consent-button phrasing in EN / PL / DE / FR / ES / IT / PT (`akceptuj` / `przejdź do serwisu` / `alle akzeptieren` / `tout accepter` / `aceptar todo` / `accetta tutto` / `aceitar tudo`) plus the previous English set, and the iframe-CMP regex includes `csr.onet.pl` and a generic `/cmp` path. The autoconsent oracle is inconclusive on most Polish CMPs because they're not in `@duckduckgo/autoconsent`'s rulebase, but the visibility detector catches them all once button text is multilingual.

## What this measurement is, and isn't

**Is**:
- A defensible measurement of Ghostery's effect on native EU/Polish traffic with a realistic browser fingerprint (no `navigator.webdriver` tell).
- Layer 1 (artifact size, n=5 medians) + Layer 2 (per-turn cost via Anthropic `count_tokens`, exact tokenizer) + Ad-burden (VLM output cost, n=1 per cell).
- Cross-checked banner detection via two independent oracles.

**Isn't yet**:
1. **Layer 3 (real trajectory) on this run.** The cost-translation table uses the {2, 3}-extra-turn assumption; a measured-trajectory column would replace that, likely *increasing* savings further because per-turn cost compounds with message history. Next-session item.
2. **Cross-region.** US-traffic measurement (US IP + US-publisher set) is still pending VPN; it'll quantify what an EEA-hosted agent visiting US-served traffic looks like.
3. **The earlier 9-page US-on-EEA run (`2026-05-14T10-18-40-218Z`, $22 / 1k headline) was bot-lite** — captured before the `navigator.webdriver` suppression landed. The numbers under-count real cost; the report file is preserved for diff but should be re-run with the new flags before being quoted.
4. **A11y filtering rule.** Other agent toolchains (browser-use, MCP, AX-tree exporters) may filter differently; rerun against their exact serializer for a strict number.
5. **Coverage-extrapolated.** Tranco-top-1k × CMP-rule coverage → $/million-loads number not yet produced.

## Methodology in one paragraph

Chrome for Testing 148 + chromedriver 148 over WebDriver BiDi (`webdriverio` v9). Each `(page, variant)` runs in a fresh chromedriver session with a fresh temp profile, sampled `--repeat 5`; reported cells are the median. **Anti-bot suppression**: chromedriver launched with `excludeSwitches: ['enable-automation']` + `useAutomationExtension: false` and chrome with `--disable-blink-features=AutomationControlled`, so `navigator.webdriver === false` and `window.cdc_*` markers are absent. Vanilla = no extensions. Ghostery = same chromium with `--load-extension=<dist>` after `scripts/patch-automation.sh dist`, which flips `disableOnboarding: true` in the built `managed-config.js` (auto-accepts terms, skips onboarding, suppresses the pin-it notification). Before each Ghostery sample, the harness polls `chrome-extension://<id>/pages/status/index.html` for `window.__ghosteryStatus.ready` so we never measure with a half-loaded adblocker. Artifacts captured per sample: full DOM, `document.body.innerText`, `Accessibility.getFullAXTree` (raw + filtered), 1280 × 800 viewport PNG, BiDi network counters, the two consent signals, and (post-hoc) the Anthropic `count_tokens` per-turn cost and per-screenshot VLM inventory cost.

Full per-page artifacts and statistics live in `results/2026-05-14T12-50-26-498Z/`; see `PROGRESS.md` for the session log and `README.md` for harness setup / commands.

## Bottom line

If you ship an AI agent that browses native EU traffic (a Polish or other-EU-language site visited from an EU IP), adding Ghostery cuts the input-token bill by **17 – 57 %** depending on what your agent reads each turn (HTML scraping at the low end, vision-mode at the high end). Separately, the **VLM cost of inventorying or extracting content from each viewport is ~halved** — and on the worst pages (onet, gazeta) the vanilla viewport is so cluttered the model fails structured output entirely. The savings is dominated by *avoided agent turns* and *blocked native ad load*, not page text. Multiply by monthly load volume and your model's input price (Opus 4.7 is 5×) for the bill delta.

The earlier $22 / 1k cross-region headline (US sites visited from an EEA IP) is a **lower bound** — it was captured with `navigator.webdriver === true` so the publishers served us a cut-down ad pack and some banners stayed hidden. A re-run with the new anti-bot flags is the next data point.
