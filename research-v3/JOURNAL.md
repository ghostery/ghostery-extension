# v3 research journal

## Kickoff (2026-05-20)

Pivoting from v2's percentage-saving framing to v1's strongest underused finding: **when you ask a vision model to inventory a real news page's viewport screenshot, it sometimes gives up**. v1 documented this on EU traffic (2/6 Polish, 3/7 German vanilla viewports caused Sonnet 4.5 to hit `max_tokens` producing chaotic non-JSON). v1 also noted that on theverge's US vanilla viewport, the same model returned **zero articles** — the modal was so dominant the inventory came back empty.

That's a failure mode, not a percentage. Failure modes are HN-shaped: visceral, mechanism-driven, easy to demo side-by-side. The audience this lands with most directly is **builders of vision-based browser pipelines** (browser-use vision mode, Operator/Claude/Skyvern-style agentic browsing, AI scrapers, AI browser products like Comet/Arc).

### What we re-use from v2

- The 4 US pages (theverge, cnn, npr, theguardian) — same set, already validated.
- The viewport screenshots — v2 saved `vanilla.t1.initial.png` through `t10.initial.png` and `ghostery.t1.initial.png` through `t10.initial.png` for every page. That's 80 viewport PNGs to draw from. No need to re-load anything.
- The anti-bot setup, the Ghostery patch, all of that — already in v2's screenshots. v3 just adds the vision-inventory call on top.

### What v3 adds

- A single fixed-prompt vision-extraction call per saved screenshot.
- Records: `input_tokens`, `output_tokens`, `stop_reason`, the raw response text, whether the response parses as JSON, and how many `articles` the model surfaced.
- Categorises each cell as: clean success / empty articles / unparseable / truncated.

### Why US-only, no VPN

v1 already documented theverge as a US failure case. If theverge alone reproduces ("vision model returns zero articles"), that's a publishable hero. If US-only is too thin, the next move is a German VPN to add bild/focus/handelsblatt where v1 saw a 3/7 failure rate.

### Hypotheses going in

- **theverge:** vanilla viewport will produce few articles or fail entirely; Ghostery viewport will produce a normal article list. (Most confident.)
- **cnn:** less confident — the modal is smaller and the page may still surface articles below it.
- **npr:** lowest expected failure — the OneTrust banner is bottom-anchored and the headline is visible above it on both variants.
- **theguardian:** vanilla and Ghostery should look similar to the model because autoconsent has no rule for the custom CCPA banner; both should fail or both should succeed.

## Measurement results (2026-05-20, run `2026-05-20T10-56-52-612Z`)

24 trials. 0 truncations, 0 parse failures, 2 zero-article returns (1 on theverge vanilla t1, 1 on theguardian vanilla t3). The catastrophic v1 EU failure mode (model hits max_tokens, produces chaotic non-JSON) **did not reproduce** on US screenshots with Sonnet 4.5 at max_tokens=2048. All 24 responses were syntactically valid JSON.

What did reproduce, in stronger form than expected:

| Page | Vanilla med articles | Ghostery med articles | Notes |
|---|---:|---:|---|
| theverge | **1** | **2** | Vanilla returned 3 *different* article sets across 3 trials. None were the actual top story. Ghostery returned the same 2 correct headlines all 3 trials. |
| cnn | 2 | 4 | Vanilla saw only the top story carousel; Ghostery saw the full hero card text plus secondary cards. |
| npr | 1 | 1 | Same article extracted both variants. Banner is bottom-anchored. Ghostery uses 39% fewer output tokens. |
| theguardian | 3 | 4 | Banner is up in both variants (no autoconsent rule). Still some variance in favor of Ghostery, probably noise. |

### Why theverge is the strongest demo

The vanilla model didn't *fail* — it returned valid JSON every trial. But the JSON contained article headlines that:
1. **Were different across trials.** t1: empty. t2: "Elon Musk's Neuralink chip", "Fortnite's The Rock is huge". t3: "Apple TV app on Chromecast". The same screenshot would produce these — but each trial is a fresh API call to a different (modal-dominated) screenshot, and the model is grasping at stray text fragments.
2. **Were not the actual top stories.** Cross-checked manually: the real top story visible in the Ghostery viewport is "Leaked images reveal Sony's 10th anniversary 'ColleXion' headphones" — never returned on any vanilla trial.

Ghostery's 3 trials all returned the same 2 correct headlines. The contrast is stark and replicable.

### What this means for the post

The story shifted *better* than the hypothesis. Originally we expected "vanilla causes catastrophic JSON failures." What we found is more dangerous: **vanilla causes silent quality failures.** The model produces well-formed JSON containing wrong information. That's a much harder bug to detect downstream than `JSON.parse` failure.

Title that emerged: *"A cookie banner can make a vision model read the wrong page."*

### Deliverables

- `POST.md` (10 KB) — blog draft with the hallucination-not-failure framing
- `POST.html` (1.1 MB) — self-contained, inline hero screenshots + side-by-side JSON output blocks
- `POST.png` + section previews — visual previews
- `RESULTS.md` (5 KB) — every trial's extracted articles
- `results/2026-05-20T10-56-52-612Z/inventory.json` — raw API responses for all 24 trials
- `src/{measure,report,render-post}.js` — harness, re-uses v2's saved screenshots

API spend: ~$0.50. Wall-clock: ~4 minutes of API calls.
