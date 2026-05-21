# Ghostery research v2 — the consent-banner tax on AI agents

This folder contains the v2 measurement: how much real money an AI browser agent pays to dismiss consent banners on US news sites, with and without Ghostery's autoconsent running.

It is a deliberate narrowing of [research v1](../research/) — same harness lineage, one question, one region, one number.

- **The question.** When a computer-use AI agent reads a US news site, how much of its input-token bill is consent-banner overhead?
- **The answer.** On 4 US news sites measured from California, a computer-use agent pays **32% more** with plain Chrome than with Chrome + Ghostery. The savings concentrate on the 3 sites where Ghostery's autoconsent has a rule (43% each); the 4th (theguardian's custom CCPA banner) is uncovered and savings are 0% — an honest illustration of the rule-coverage dependency.
- **The mechanism.** Not banner size, not ad payload. The extra agent turn (screenshot → click → screenshot vs. just screenshot) re-sends the whole prior conversation, so the cost compounds.

## Deliverables

- [`POST.md`](./POST.md) — the blog post (HN-ready draft).
- [`POST.html`](./POST.html) — single-file rendered version with inline hero screenshots + bar chart (~1.6 MB, self-contained).
- [`POST.png`](./POST.png) / [`POST-top.png`](./POST-top.png) / [`POST-bottom.png`](./POST-bottom.png) — pre-rendered visual previews.
- [`RESULTS.md`](./RESULTS.md) — full data tables (per-page medians + p25/p75, headlines, stop reasons).
- [`PLAN.md`](./PLAN.md) — scope and methodology.
- [`JOURNAL.md`](./JOURNAL.md) — research log.
- [`pages-us.json`](./pages-us.json) — candidate US page set + rejection reasons.
- [`results/<run-id>/`](./results/) — raw per-trial JSONs and per-turn screenshots from the actual measurement.
- [`src/`](./src/) — the harness:
  - `validate.js` — page-set pre-flight (loads each candidate, screenshots, runs banner detectors). No API spend.
  - `measure.js` — trajectory runner (real Anthropic computer-use agent).
  - `report.js` — regenerate `RESULTS.md` + `POST.md` + `POST.html` from `results/`.
  - `render-post.js` — regenerate `POST.png` and section previews from `POST.html`.

## To re-run

```sh
cd research-v2 && npm install
node src/validate.js    # ~1-2 min, no API spend
node src/measure.js     # ~10 min, ~$5 API spend at default 3 trials
node src/report.js      # regenerate POST.* and RESULTS.md
node src/render-post.js # regenerate POST.png previews
```

Requires `ANTHROPIC_API_KEY` in `../.env`, a built Ghostery `dist/` at the repo root (`npm run build chromium && scripts/patch-automation.sh dist`), and Chrome for Testing 148 installed under `research/.browsers/` (reused from v1).
