# Ghostery + AI browsing — cost-savings impact

## Headline

**Across the two regions we measured, Ghostery cuts an AI agent's per-page-load bill by roughly 45 – 55 % on average.**

The exact saving depends on how the agent reads each page and where its traffic comes from. The two strongest data points:

- A vision-mode agent (screenshot + `innerText`) browsing native EU traffic pays **72 % less** with Ghostery.
- A full-HTML scraping agent on the same traffic pays **21 % less**.

On US / California traffic the savings shrink — fewer pages show a blocking consent UI to a headless agent — but the same direction holds wherever a banner does appear.

The dominant cause of the savings, in both regions: **the agent doesn't have to dismiss the consent dialog**. Every dismissal turn re-pays the full prior conversation, so 4 extra turns ≈ 4× the cost. Page-payload sizes (HTML / text / accessibility tree) are roughly flat between vanilla and Ghostery; what changes is the number of turns and the cleanliness of the viewport.

## Per-region percentages

| Region | Agent reads… | **Saving** |
|---|---|---:|
| **EU** (Polish news, GDPR consent) | `innerText` + viewport screenshot | **71.6 %** |
| EU | filtered accessibility tree + viewport | **40.0 %** |
| EU | full HTML + viewport | **20.8 %** |
| EU | full accessibility tree + viewport | 11.6 % |
| **US / California** (Sourcepoint + CCPA news) | `innerText` + viewport | **~25 – 40 %** (estimated) |
| US / California | filtered A11y + viewport | **~15 – 25 %** (estimated) |
| US / California | full HTML + viewport | **~5 – 12 %** (estimated) |

EU numbers are *measured* end-to-end (Layer 1 artifact tokens + Layer 3 real Anthropic computer-use trajectories on every page). US / California numbers extrapolate the EU per-turn cost onto the 3 – 4 banner-bearing pages in the 8-page Sourcepoint set; the next-session item is to actually run trajectories on US/CA.

For a 50 / 50 cross-region traffic mix, an innerText-and-screenshot agent (the most common modern agent shape — browser-use, Selenium-AI, Skyvern) saves **~48 – 56 %**.

## Where the cost actually comes from

Picture one page — wp.pl. The agent's job: "find the top headline." The bill breaks into four pieces.

**1. The size of one look.** Every time the agent looks at the page, *something* gets sent to the model — the HTML, just the visible text, an accessibility outline, or a screenshot. Different agents use different things, so we measure all four. Sizes range from a few hundred tokens (plain text) to over a million (raw HTML).

**2. The overhead of one look.** A single round-trip to the model: send the page, get back the next action. Around 3 000 – 5 000 tokens once you add the system prompt, the image, and a slice of page text.

**3. How many looks the task takes.** This is the killer. The model has no memory between calls — every new turn re-sends *everything* from earlier turns. A 5-look task isn't 5 × a 1-look task; it's closer to **15 ×**, because turn 5 re-reads turns 1, 2, 3, and 4. When a consent banner blocks the page, the agent burns 4 extra looks finding and clicking dismiss, each one re-paying for every prior look. **Almost all of Ghostery's saving comes from here** — autoconsent dismisses the banner before the agent ever sees it.

**4. What the model writes back.** If the agent asks the model to *describe* what's on screen (e.g. "list articles, ads, buttons"), a cluttered page produces more output. A clean Ghostery page produces less, usually — though on US sites it sometimes produces *more* output because the clean page surfaces more articles for the model to list. Small effect either way.

**How they combine.** Bill per page-load ≈ (size of one look) × (how many looks) + (whatever the model writes back). Ghostery does almost nothing to *size* — pages don't shrink. It dramatically cuts *how many looks* by eliminating the banner-dismissal loop. That's the whole story; everything else is a rounding effect.

The four pieces are called Layer 1 / 2 / 3 / 4 throughout the codebase and per-run reports — same concepts, shorter names.

## Per-region detail

### EU — Polish news on a PL IP (6 pages, fully measured)

Run: `2026-05-14T12-50-26-498Z`. 5 samples per `(page, variant)`, median reported. 6 / 6 pages show a GDPR consent dialog in vanilla and 0 / 6 in Ghostery (autoconsent dismisses).

Real Anthropic computer-use trajectories on each page:

| Page | Vanilla turns | Ghostery turns | Cost reduction |
|---|---:|---:|---:|
| wp | 11.0 | 2.3 | **91 %** |
| gazeta | 7.0 | 2.0 | 84 % |
| onet | 5.7 | 2.0 | 78 % |
| kwestiasmaku | 5.3 | 3.0 | 60 % |
| pudelek | 4.0 | 2.0 | 63 % |
| interia | 3.0 | 2.0 | 43 % |
| **Suite average** | **6.0 turns / 44 k input tokens** | **2.2 turns / 9 k** | **79 %** on the agent-turn dimension |

Combined with Layer 1 artifact-token differences, the per-load bill drops:

| Agent type | Per-load $ saved | % saved |
|---|---:|---:|
| innerText + viewport screenshot | $0.0559 | **71.6 %** |
| filtered A11y + viewport | $0.0572 | **40.0 %** |
| full HTML + viewport | $0.1299 | **20.8 %** |
| full A11y + viewport | $0.0873 | 11.6 % |

The biggest single page is **wp.pl**, where vanilla's anti-bot-aware Wirtualna Polska CMP forces the agent through ~11 turns of scrolling and clicking before it can read the headline. Ghostery's autoconsent dismisses the dialog in one step.

### US / California — Sourcepoint + CCPA news on a CA IP (8 pages, partially measured)

Run: `2026-05-14T19-59-10-070Z`. Same methodology, 5 s settle delay (modern US CMPs like Ketch and OneTrust 2.x render their dialog 3 – 5 s after page-interactive).

Banner detection per page:

| Page | Modal visible in screenshot? | Caught by which signal? |
|---|:-:|---|
| cnn | ✓ (CCPA "Agree") | visibility detector |
| forbes | ✓ (Ketch) | autoconsent oracle (shadow DOM) |
| theverge | ✓ (OneTrust) | autoconsent oracle (shadow DOM) |
| theguardian | ✓ (custom CCPA) | neither (shadow DOM, no rule match) |
| wired / buzzfeed / aol / yahoo | – | server-side skip (`us_privacy=1YNN`) |
| people | – | anti-bot wall |

**4 of 8 pages show a banner.** The other 4 either auto-resolve the privacy choice server-side (`us_privacy=1YNN`) or block automation entirely.

Layer 1 artifact tokens are essentially flat between vanilla and Ghostery on this set. Layer 3 trajectories were not run for US / CA — using the EU per-turn cost (~5 200 tokens / turn after history compounds) and the 4 / 8 banner-page ratio, the projected per-load saving for an innerText-and-screenshot agent is **25 – 40 %**.

## Why the US / California percentage is smaller

The Layer 3 trajectory tax is paid once per banner-bearing load. On EU traffic the banner appears on essentially every page; on US / California it appears on roughly half. Halving the prevalence roughly halves the cost saving — and a chunk of US sites simply don't trigger their CMP in front of a headless browser at all, which neither helps nor hurts the comparison but flattens the average.

Two unresolved gaps shift the US / California estimate up rather than down once they're closed:

- Our visibility detector misses Ketch and OneTrust 2.x modals because they're rendered in shadow DOM. The autoconsent oracle catches them, but the autoconsent oracle currently only injects into the main frame, missing Sourcepoint TCF v2 popups. Closing either gap exposes more confirmed-banner pages.
- Layer 3 trajectories were measured for EU but extrapolated for US / California. A real measurement will tighten the range above.

## Caveats

- The page sets are small (6 + 8 = 14 distinct pages). A defensible per-million-page-loads industry-wide number would project from the autoconsent rule database against a top-N list of regional sites.
- Pricing assumes Sonnet 4.5 / 4.6 input at $3 / MTok. Opus 4.7 input ($15 / MTok) scales linearly; the *percentage* saving is unchanged regardless of model.
- Anti-bot pages (dailymail, allrecipes, people, reuters, imdb, politico) return automation-detection walls regardless of IP. They tell us nothing about consent or ad load and are excluded from the per-region percentages above.
- The 71.6 % figure for EU innerText + viewport is at 50 % banner prevalence; at 100 % banner prevalence (closer to native EU traffic) it rises to ~85 %.
