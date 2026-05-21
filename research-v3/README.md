# Ghostery research v3 — when AI vision models give up on the page

This folder contains the v3 measurement: how often a production vision model (Anthropic Sonnet 4.5) asked to *inventory the contents of a webpage screenshot* fails outright when the viewport carries a consent banner and ad clutter — and how that failure mode disappears when Ghostery's autoconsent dismisses the banner first.

It is the third narrowing of [research v1](../research/), after [v2](../research-v2/) which measured the per-load cost story.

- **The question.** Do vision-model agents that look at viewport screenshots fail on real news sites because of consent banners + ad clutter? If so, on which pages and how badly?
- **The answer (target).** A measured count of *failures* (model gave up producing parseable JSON) and *output-token bloat* (model produced more text trying to describe a cluttered viewport) on a small US news page set — vanilla Chrome vs. Chrome + Ghostery.
- **What v3 doesn't do.** Measure the agent-loop cost (v2 already did that). Measure text-only agents. Cross-region comparison. Industry-wide projection.

This is a *failure-mode* post, not a percentage-saving post.

## Headline finding

A production vision model (Sonnet 4.5) asked to inventory a US news viewport screenshot returns **wrong headlines** when a consent banner dominates the image — silently, in well-formed JSON. On theverge specifically, three vanilla trials returned three different sets of wrong headlines (Neuralink, Fortnite, Apple TV — none are the actual top story). The Ghostery viewport returned the same two correct headlines on all three trials.

Across 24 trials: 2/12 vanilla returned **zero articles**; 0/12 Ghostery did the same. Suite average: 1.8 articles per vanilla viewport, 2.8 per Ghostery viewport.

The catastrophic v1 EU failure (model truncates mid-output) did **not** reproduce on US screenshots — the failure here is softer but arguably more dangerous: the output looks fine until you check the content against the page.

## Deliverables

- [`POST.md`](./POST.md) — blog draft, *"A cookie banner can make a vision model read the wrong page."*
- [`POST.html`](./POST.html) — self-contained 1.1 MB single file with inline hero screenshots + model JSON output side-by-side.
- [`POST.png`](./POST.png) / [`POST-top.png`](./POST-top.png) / [`POST-hero.png`](./POST-hero.png) / [`POST-mid.png`](./POST-mid.png) / [`POST-bottom.png`](./POST-bottom.png) — pre-rendered visual previews.
- [`RESULTS.md`](./RESULTS.md) — full data: every trial's extracted articles, per-cell stats.
- [`PLAN.md`](./PLAN.md) / [`JOURNAL.md`](./JOURNAL.md) — scope and research log.
- [`pages-us.json`](./pages-us.json) — US page set (re-used from v2).
- [`results/<run-id>/inventory.json`](./results/) — raw API responses for all 24 trials.
- [`src/`](./src/) — harness:
  - `measure.js` — feeds saved v2 screenshots to the Sonnet vision API, records output + classification.
  - `report.js` — generates `POST.md`, `POST.html`, `RESULTS.md`.
  - `render-post.js` — captures `POST.png` and section previews.

## To re-run

```sh
cd research-v3 && npm install
node src/measure.js     # ~4 min, ~$0.50 API spend at 3 trials per cell
node src/report.js      # regenerate POST.* and RESULTS.md
node src/render-post.js # regenerate POST.png previews
```

Requires `ANTHROPIC_API_KEY` in `../.env` and saved viewport screenshots at `../research-v2/results/<latest-run>/trajectory/<page>/{vanilla,ghostery}.t<n>.initial.png`.
