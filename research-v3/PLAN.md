# v3 plan — Layer 4 vision-model failure mode

## Claim (one sentence)

When you ask a production vision model to inventory a real news site's viewport screenshot, the model **sometimes gives up** if the page carries a consent banner and ad clutter — it produces more output tokens and occasionally fails to produce parseable JSON at all. Dismissing the banner with Ghostery's autoconsent flips both behaviours.

## Why this story

v1 documented this on EU traffic: 2 of 6 Polish vanilla viewports (onet, gazeta) made Sonnet 4.5 hit `max_tokens` producing chaotic non-JSON; 3 of 7 German vanilla viewports (bild, focus, handelsblatt) did the same. v1 also flagged that on theverge's vanilla viewport, the vision model asked to list articles returned **zero articles** — the modal was so dominant the model never reached the article body.

That's a *failure mode*, not a percentage. Failure modes are HN-shaped: visceral, mechanism-driven, and easy to demo side-by-side. v3 reproduces this on US traffic, where the v2 numbers (5% on text agents, 43% on computer-use) didn't carry the same punch.

## In scope (only this)

- **Layer 4 only.** Single vision-model API call per saved viewport screenshot. No agent loop, no trajectory.
- **Single fixed prompt** per screenshot: "inventory what is visible on this page. Output JSON with arrays: articles, ads, navigation, other. Be exhaustive."
- **Two variants per page:** vanilla Chrome viewport, Chrome + Ghostery viewport (re-used from v2's saved screenshots).
- **3 trials per (page, variant).** Each trial picks a different saved screenshot of the same page (v2 captured 10 per cell). Median + per-trial detail reported.
- **One region:** US (San Jose). German addition deferred until US data is in.
- **One model:** Sonnet 4.5 (same as v1's Layer 4) for replicability.

## Out of scope

- Re-loading pages. v2's viewport screenshots are good enough; capturing fresh ones adds variance, not signal.
- Re-measuring agent cost. v2 covered this.
- Text-only agents. v2 covered this.
- Cross-region.
- Industry projection.

## Page set

Re-use v2's validated 4 pages (theverge, cnn, npr, theguardian). All four have screenshots from 10 vanilla trials and 10 ghostery trials saved at `../research-v2/results/2026-05-18T12-59-15-755Z/trajectory/<page>/{vanilla,ghostery}.t<n>.initial.png`.

If US-only fails to surface the failure mode (i.e. all 4 pages produce clean JSON on both variants), we extend with a German VPN to test bild / focus / handelsblatt where v1 saw the failure cleanly.

## Methodology

For each saved viewport screenshot:

1. Read the PNG as base64.
2. Call Anthropic `messages.create` with `model=claude-sonnet-4-5-20250929`, `max_tokens=2048` (large enough to allow the model to either succeed or visibly run out of budget), the image as user content, and a fixed system prompt + user prompt asking for the inventory.
3. Capture `usage.input_tokens` (will be constant — image is fixed size), `usage.output_tokens`, `stop_reason`, and the full text response.
4. Attempt to `JSON.parse` the response. Record success / failure.
5. If parseable, record `articles` array length and dump the headlines.

We don't expect input-tokens to vary much (image tokens are ~1,326 for a 1280×800 PNG by Anthropic's formula, plus ~150 for the prompt). The **interesting dimensions** are:

- **`stop_reason`** = `"end_turn"` (good) vs. `"max_tokens"` (model ran out before finishing).
- **JSON parseable** = yes/no.
- **Articles array length** when parseable — does Ghostery's cleaner view extract *more* article items?
- **Output tokens** — proxy for how hard the model worked.

## Headline outputs

1. **Failure-mode count.** Of N (page, variant) cells, how many produced max-tokens stops or non-parseable output? Compare vanilla vs Ghostery.
2. **Articles-extracted delta.** Per page, how many articles did the vanilla vs Ghostery viewport surface to the model?
3. **One hero screenshot pair.** Whichever page has the most dramatic failure on vanilla — likely theverge — shown side-by-side with the model's actual output overlaid below each.

## Open calls before measurement

1. **Start with v2 screenshots, no re-capture.** Cheaper and cleaner-data.
2. **3 trials per cell.** Cheap (~24 API calls ~ $1), variance from model temperature is what we want to see.
3. **Don't extend with German pages until US data is in.** If US fails to surface failures, then add Germany via VPN.
