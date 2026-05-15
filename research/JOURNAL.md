# Research journal

A running log of what we tried, what we found, the decisions behind those findings, and what's still open. For *how to run the benchmark* and *what is measured*, see [README.md](./README.md).

## Where we are (May 2026)

We can now put a defensible number on the question: *how much does an AI agent save when it runs the browser with Ghostery instead of without?*

On a 6-page set of Polish news sites, an agent given the task "find the top headline on this page" pays:

- About **35,000 fewer input tokens per page** on average when Ghostery is on
- Around **70% less** in total bill if it works from screenshots + plain text
- Around **40% less** if it works from a structured accessibility view of the page
- Around **20% less** if it scrapes the full HTML

The biggest single page is wp.pl: roughly **100,000 tokens saved per page**. Its consent dialog actively resists automated dismissal, so the agent scrolls around for 11 turns before it can read the headline. With Ghostery, the same task takes 2 turns.

These numbers are noticeably higher than an earlier US-page measurement (about 14,000 tokens saved per page). Two things explain the gap:

1. We made the test browser look less like a bot. Before that change, several Polish publishers were detecting the automation framework and *not showing* their consent dialogs to it — making the "vanilla" baseline artificially cheap.
2. Polish ad density on the same publishers is genuinely heavier than US ad density.

## What changes from a US IP

A first US run used a generic news mix (cnn, foxnews, dailymail, weather, etc.) from a US VPN. The headline numbers shrank dramatically:

- **No GDPR consent banners** on any of the 9 pages — as expected
- **Aggregate artifact tokens are flat** between vanilla and Ghostery (HTML +1%, text +1%, accessibility tree noisy but near-zero)
- **Network bytes are essentially unchanged** (Ghostery saves ~2%)

This confirmed the central finding from the EU run: *Ghostery's measurable agent-cost savings come overwhelmingly from skipping consent-dismissal turns, not from making the page smaller*. On generic US traffic with no consent banners, there is little for an agent to save.

A softer story did surface, though. cnn US still shows a single-"Agree" CCPA modal with California state-law text. Our detector originally missed it (the regex was tuned to GDPR phrasing); once we added a few CCPA-specific phrases the visibility walk caught it. The modal really does block the page — cnn vanilla's accessibility tree came out 280× smaller than Ghostery's because the modal captured focus before the rest of the page could be rendered to the tree. Re-running the same set from a California IP didn't help much either: still only cnn surfaced a modal, and dailymail/allrecipes returned anti-bot pages whether we were on EEA or US IP — the block is automation-detection, not geo.

## Picking pages that actually show the benefit

To see a US savings story, the set had to be picked deliberately. Targeting publishers known to use Sourcepoint-family CMPs (forbes, theverge, wired, buzzfeed, aol, yahoo, people) plus cnn for continuity told a clearer story. Two things had to change first:

- **Bump the page-settle delay from 2.5s to 5s.** Modern CMPs like Ketch and OneTrust 2.x render their modal asynchronously, often 3–5 seconds after the page is interactive. Our old 2.5s settle screenshot was taken *before* the modal appeared — the page looked banner-free even though autoconsent's later check confirmed the popup had opened. Bumping the settle lets the screenshot capture the actual visible state.
- **Trust the autoconsent oracle, not just the visibility walk, for modern CMPs.** The visibility detector reads `body *` from the main document. That misses Ketch and OneTrust 2.x, both of which render their dialog inside a shadow DOM that the walk can't pierce. The autoconsent oracle runs the production rulebase, which knows where each CMP keeps its dialog and reports `openPopupDetected` when the modal is actually open. That's the ground-truth signal; the visibility detector is a useful cross-check when the modal sits in the regular DOM (cnn's CCPA "Agree" modal is a good example — visibility caught it, oracle didn't).

The Sourcepoint-targeted set surfaced **3 of 8 pages** with confirmed banners: cnn (CCPA "Agree" modal, caught by visibility), forbes (Ketch, caught by oracle only), and theverge (OneTrust, caught by oracle only). On theverge the vanilla viewport is so dominated by the modal that a vision model asked to inventory it returns **zero articles** — Ghostery's autoconsent dismisses the same modal and the model immediately sees the page's top story. That contrast is the showcase.

Five other pages on the set (wired, buzzfeed, aol, yahoo, people) didn't surface a modal in either variant. Either they use a slower-still-rendering CMP, or their bot-detection skips the consent flow, or — for people.com — they return an anti-bot wall instead of content. Worth investigating separately; not part of the headline.

## How the cost adds up

Most of the savings come from *agent turns*, not from artifact size.

When a consent banner blocks the page, the agent has to take a screenshot to see the banner, decide which button to click, click it, wait for the page to reveal, then take another screenshot to read the actual content. Every one of those turns re-sends the whole prior conversation back to the model — every earlier screenshot included. So a 5-turn run costs roughly five times what a 2-turn run costs, even though the *content* the agent walks away with is the same.

The page payload itself (HTML, accessibility view, screenshot bytes) only changes by single-digit percentages between vanilla and Ghostery. Sometimes Ghostery's version is *larger*: once a banner is dismissed, more of the article body becomes visible, which is more text to read.

## Decisions worth recording

### Measure with a real model, not a formula

The first cost model was a static one: *assume two or three extra turns, multiply by a per-turn token estimate*. That gave a ballpark but understated reality by roughly 50%. Real agent trajectories grow per-turn cost as conversation history accumulates — every turn re-sends every prior screenshot — so the static model can't capture the compounding. Running the actual agent on each page replaces the assumption with a measurement.

### Make the test browser look like a real user

Early measurements were quiet because the publisher saw a bot and skipped the consent flow entirely. Suppressing the automation fingerprints (so the page can't tell whether a human or a script is driving) brought the dialogs back, and pushed measured savings from a few percent to around 70% on the same set of pages. Any measurement taken without this is a lower bound, not a realistic number.

### Use the page view a real agent would use, not the raw one

Production agents that read structured page representations (browser-use, Selenium-AI, similar) don't feed the model the unfiltered accessibility tree — they strip out layout-only nodes and keep only what's interactive. Using the unfiltered tree had hidden Ghostery's savings under a wall of noise that didn't change between vanilla and Ghostery. Switching to the filtered version (about 14% of the raw size) flipped the comparison from "Ghostery slightly more expensive" to a real saving.

### Five samples per cell, take the median

Each page varies between samples — ad rotation, slow content scripts, occasional state where the adblocker isn't fully ready yet. A single sample is too noisy. Five samples plus median picks a stable reading and discards the occasional outlier. Mean would let one bad sample dominate; we saw it happen with an adblocker-warmup race that briefly let ads through.

### Dismiss banners only with the production rulebase

The savings come from the same consent-dismissal rules that ship to end users — no test-only shortcuts, no hand-coded selectors. If a publisher's consent dialog isn't covered by the production rulebase, we don't claim a saving on it.

### Tag every run with a region

EEA-traffic and US-traffic versions of the same publisher serve different ad packs and trigger different consent flows. Numbers from one region can't be compared cleanly to the other. Each run records which region it came from so the headline isn't muddled.

## Open questions

1. **Shadow-DOM-aware banner detection.** Modern CMPs (Ketch, OneTrust 2.x, and likely others) render their dialog inside a shadow root. Our visibility walk reads from the main document tree, so the dialog is invisible to it. For now we rely on the autoconsent oracle (which knows each CMP's structure) to catch them. A direct fix would be to pierce shadow DOM in the walk, but it adds complexity and the oracle already gives us the right answer — worth weighing whether the visibility detector should keep trying.

2. **Pages where neither signal sees a modal.** On the Sourcepoint-targeted set, wired, buzzfeed, aol, and yahoo didn't surface a consent dialog under either the visibility walk or the autoconsent oracle, despite all four being CCPA-jurisdiction publishers. Either they use an even-slower CMP (need to bump settle past 5s), they detect the headless browser and skip the consent flow, or they only show the modal once per cookie. Worth inspecting one of them by hand before deciding it's not a real savings opportunity.

3. **Cross-region re-run with realistic browser fingerprints.** The earlier US-on-EEA-IP run predates the anti-bot work, so it under-counts. Re-running it gives a defensible cross-region comparison.

4. **Replace pages that return anti-bot blocks.** dailymail, allrecipes, and people.com all return automation-detection walls from every IP we've tried. They tell us nothing about consent or ad load and should be replaced with pages a real user would want.

5. **Coverage.** A handful of pages can't support a per-million-loads industry-wide claim. Projecting from the consent-rule database (which dialogs are covered) against a top-N list of regional sites would let us do that.

## What we tried that didn't work

- **A static "extra turns × tokens per turn" formula.** Off by ~50% because conversation history compounds.
- **Letting the browser advertise itself as an automation client.** Several consent dialogs hid themselves, which made vanilla look artificially cheap.
- **The raw accessibility view.** Buried Ghostery's savings under nodes no real agent reads.
- **One-shot samples.** Too noisy — single outlier swings the headline. Median of five is the practical floor.
