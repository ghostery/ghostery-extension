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

1. **US-native traffic.** Polish publishers serve a heavier ad load to EEA visitors than to US visitors. A run from a US IP against US publishers should isolate the "no consent banner, but more ads in the body" case. The expected shape: smaller per-turn savings, larger artifact savings.

2. **Cross-region re-run with realistic browser fingerprints.** The earlier US-on-EEA-IP run predates the anti-bot work, so it under-counts. Re-running it gives a defensible cross-region comparison.

3. **Page selection.** A couple of the original US pages now return anti-bot blocks rather than content. They tell us nothing about consent or ad load and should be replaced with pages a real user would want.

4. **Coverage.** Six pages can't support a per-million-loads industry-wide claim. Projecting from the consent-rule database (which dialogs are covered) against a top-N list of EEA sites would let us do that.

## What we tried that didn't work

- **A static "extra turns × tokens per turn" formula.** Off by ~50% because conversation history compounds.
- **Letting the browser advertise itself as an automation client.** Several consent dialogs hid themselves, which made vanilla look artificially cheap.
- **The raw accessibility view.** Buried Ghostery's savings under nodes no real agent reads.
- **One-shot samples.** Too noisy — single outlier swings the headline. Median of five is the practical floor.
