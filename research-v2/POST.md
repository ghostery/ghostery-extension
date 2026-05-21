# How much consent banners cost an AI agent (depends on the agent)

*2026-05-18. 4 US news sites. Two agent shapes (text-only and computer-use). Real Anthropic API, Sonnet 4.5. 10 trials per cell on the computer-use side, 3 on the text side.*

## TL;DR

Two AI agents try to read the top headline off the same news site. One reads the page as text. The other looks at it like a human — screenshot, click, screenshot. Same task, same model, same page, same answer.

- **Text-only agent** (fetch innerText, one LLM call): consent banners cost **5%** of the input-token bill on average. Range across our 4 pages: -4% to 11%. Small effect; banners just add a bit of innerText alongside the article body.
- **Computer-use agent** (screenshot in, action out, repeat): consent banners cost **43%** of the input-token bill on pages where the banner can be auto-dismissed. The agent burns an extra turn clicking through, and every extra turn re-sends every prior screenshot — so the cost compounds.

Both numbers are measured on plain Chrome vs. Chrome with the [Ghostery extension](https://www.ghostery.com/), which runs the production [DuckDuckGo autoconsent](https://github.com/duckduckgo/autoconsent) rulebase and dismisses the banner before either agent ever sees the page. The interesting story is the **gap between the two numbers**, and why the gap exists.

## What we measured

Four US news sites: npr.org, cnn.com, theverge.com, theguardian.com. Same task on each: *what is the top headline on this page?* Same model (Anthropic Sonnet 4.5). Same Chrome (148, fresh isolated profile per trial, anti-bot suppression so CMPs don't hide their dialog from us).

Two agent shapes:

- **Text-only.** Load the page, wait 5 seconds, grab `document.body.innerText`, send it to the model with a one-shot prompt asking for the top headline. One API call, no loop.
- **Computer-use.** Load the page, wait 5 seconds, give the model a 1280×800 screenshot. The model returns a tool call — `click(x, y)`, `scroll`, or `finish(headline)`. Run the action, take a new screenshot, repeat. ([Anthropic's production tool-use API](https://docs.anthropic.com/en/docs/build-with-claude/computer-use).)

Both variants ran on plain Chrome and on Chrome + Ghostery. The Ghostery configuration is identical except for the unpacked extension and a 5-second warmup that waits for Ghostery's autoconsent to be ready.

## Shape 1: text-only agents

This is what most production AI browsing looks like today — Perplexity-style search, Claude reading a URL, browser-use's text mode, the `fetch → innerText → LLM` pattern in every "ask an LLM about this webpage" tool.

| Page | Vanilla input tok | Ghostery input tok | Δ | Saved |
|---|---:|---:|---:|---:|
| theverge | 5,803 | 5,538 | +265 | **5%** |
| cnn | 2,377 | 2,122 | +255 | **11%** |
| theguardian | 4,808 | 5,018 | -210 | **-4%** |
| npr | 3,684 | 3,379 | +305 | **8%** |

Headlines match across all variants and trials — the text agent extracts the *correct* top headline on every page, with or without Ghostery. The banner doesn't hide the article body from a text scraper; it just adds a few hundred tokens of "We use cookies and similar technologies…" alongside.

Two things to notice in the numbers:

1. **The saving is small.** ~5% suite-wide, ~11% best case (cnn). For most production text-pipeline workloads, this is in the noise.
2. **theguardian is slightly negative.** Ghostery's content scripts add ~200 tokens of their own DOM text to the page — small enough to be a rounding error, but visible in this measurement. The autoconsent rulebase doesn't cover theguardian's custom CCPA banner, so the only effect Ghostery has on theguardian is a tiny added DOM cost.

If you are running a text-only AI pipeline at scale, this is roughly your number. **Single-digit percent, and not always positive.**

## Shape 2: computer-use agents

The newer pattern: an agent that sees the page the way a human does and clicks through it. Anthropic's computer use, OpenAI's Operator, [Browser Use](https://github.com/browser-use/browser-use)'s vision mode, Skyvern, etc. The bill is dominated by how many turns the agent takes — *not* the size of any single screenshot.

On the same 4 pages, with the same task and the same model:

| Page | CMP | Vanilla turns | Ghostery turns | Vanilla input tok | Ghostery input tok | Saved |
|---|---|---:|---:|---:|---:|---:|
| npr | OneTrust | 3.0 | 2.0 | 13,347 | 7,660 | **43%** |
| theverge | OneTrust | 3.0 | 2.0 | 13,337 | 7,666 | **43%** |
| cnn | custom CCPA | 3.0 | 2.0 | 13,325 | 7,666 | **42%** |
| theguardian | custom CCPA (no rule) | 3.0 | 3.0 | 13,369 | 13,352 | **0%** |
| **suite avg** | – | **3.0** | **2.3** | **13,344** | **9,086** | **32%** |

On the 3 pages where Ghostery's autoconsent has a rule for the CMP (npr, theverge, cnn), the agent saves about **43%**. That's an order of magnitude more than the text agent saves on the same pages — even though both agents end up returning *the same headline*.

### Why so much more?

Every call to a computer-use agent is an independent API request. The model has **no memory** between calls. So every turn re-sends the whole prior conversation — every screenshot the agent has ever taken on this page, plus every text response it has ever produced. That's how the model "remembers" what happened.

Practical consequence: turn N pays for itself **plus** turns 1..N-1, every time. Cost is roughly quadratic in turn count.

On the pages we measured:

| | Turn 1 | Turn 2 | Turn 3 | Total |
|---|---:|---:|---:|---:|
| **2-turn read (Ghostery dismissed the banner)** | ~3,200 in | ~4,400 in | – | **~7,700 input tokens** |
| **3-turn read (vanilla — banner still there)** | ~3,200 in | ~4,400 in | ~5,700 in | **~13,300 input tokens** |

The extra turn costs 5,700 tokens on its own — not 3,200 — because that turn *also* re-sends turn 2's screenshot. One extra screenshot, but it counts twice in the bill: once as the new turn's input, and again as the prior-turn history that future turns will also re-send. Compounding.

### Hero example: npr.org

Same task, same outcome — both agents return the same headline. The only difference: the vanilla agent has to deal with an OneTrust cookie banner that Ghostery's autoconsent dismisses for it.

- **Vanilla:** 3.0 turns, 13,347 input tokens, **$0.0400 per page-load**
- **Ghostery:** 2.0 turns, 7,660 input tokens, **$0.0230 per page-load**
- **43% saved.** The HTML version of this post shows every turn side-by-side; in the markdown the numbers above tell the story.

## What theguardian tells us about rule coverage

theguardian is the computer-use page where Ghostery did *not* save tokens. Both variants of the agent took the same number of turns. The reason is mechanical: theguardian's consent banner is a custom CCPA modal that isn't in the DuckDuckGo autoconsent rulebase Ghostery ships. No rule, no automatic dismiss, no savings.

That is the honest shape of this technology. The savings come from **rule coverage**, not from Ghostery being magic. The same dynamic applies to any autoconsent tool — uBlock Origin's [I don't care about cookies](https://www.i-dont-care-about-cookies.eu/) list, Consent-O-Matic, Brave's built-in rules. The rulebase is the asset; the extension just executes it.

A practical implication for anyone running computer-use agents at scale: when you hit a publisher that isn't covered, you're paying the compounding tax until someone files a rule for it. theguardian-style sites are missed savings.

## What this isn't

- **Not an ad-blocker pitch.** Ghostery also blocks ads and trackers; that effect on an agent's input-token cost is single-digit percent on either agent shape. The cost story here is consent-dismissal turns avoided.
- **Not cross-region.** We ran from a US (California) IP against US news sites. EU pages — where GDPR consent walls are universal and harder to dismiss — show much bigger savings on the computer-use side (we have measured 70%+ on a Polish news set).
- **Not Claude-specific.** The compounding-history dynamic is in the computer-use *protocol shape* (turn N includes turns 1..N-1), not in Anthropic's implementation. GPT computer-use, Gemini, your own scaffolding — same shape.
- **Not "you need Ghostery."** Any autoconsent solution that dismisses the dialog before the agent looks will produce the same savings. Ghostery happens to ship the DuckDuckGo rulebase by default and it works well.
- **Not all that's out there.** Many agent toolchains do hybrid (a screenshot for layout cues + filtered accessibility tree for actions). Their savings will land between the two numbers, weighted by how much of each turn is screenshot.

## How it was measured

Chrome for Testing 148 + chromedriver over WebDriver BiDi, fresh isolated profile per trial. Anti-bot suppression (`navigator.webdriver === false`, `--disable-blink-features=AutomationControlled`) so CMPs serve the same payload they would to a human — without this several banners hide from automation and the measurement under-counts cost.

**Text-only agent.** Load the page, wait 5s for any deferred banner to render, snapshot `document.body.innerText`, send it to the model with a one-shot prompt asking for the top headline. One API call per (page, variant, trial). Input tokens = system + truncated innerText + prompt.

**Computer-use agent.** Load the page, wait 5s, capture an initial 1280×800 screenshot, hand it to the model. The model returns a tool call — `screenshot`, `left_click([x, y])`, `scroll`, `type`, or `finish(headline)`. Chrome executes the action, captures a new screenshot, returns it as the tool result. Loop until the model calls `finish` or hits a 15-turn cap (never reached on these pages).

The Ghostery variant loads a freshly built unpacked extension with the production [@duckduckgo/autoconsent](https://github.com/duckduckgo/autoconsent) rulebase. Before each trial we wait for Ghostery's status page to report `ready: true` so we never measure with a half-loaded extension.

---

*Model: claude-sonnet-4-5-20250929 at list price ($3/MTok input, $15/MTok output). Computer-use: 10 trials per cell, p25/p75 of turn count: npr 3/3 vs 2/2; theverge 3/3 vs 2/2; cnn 3/3 vs 2/2; theguardian 3/3 vs 3/3. Text-only: 3 trials per cell, headline match rate 100%.*