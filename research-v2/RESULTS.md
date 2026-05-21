# Research v2 -- full results

Run: `2026-05-18T12-59-15-755Z`
Model: `claude-sonnet-4-5-20250929` (Sonnet 4.5 -- only Anthropic model with computer-use beta in May 2026).
Pricing: input $3/MTok, output $15/MTok.

## Per-page medians (input tokens, sorted by Ghostery saving)

| Page | Vanilla turns (p25/p75) | Ghostery turns | Vanilla input tokens (p25/p75) | Ghostery input tokens | Δtokens | Vanilla $/load | Ghostery $/load | Saved % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| npr | 3.0 (3/3) | 2.0 (2/2) | 13,347 (13,342/13,349) | 7,660 | 5,688 | $0.0449 | $0.0261 | 42% |
| theverge | 3.0 (3/3) | 2.0 (2/2) | 13,337 (13,329/13,354) | 7,666 | 5,671 | $0.0450 | $0.0261 | 42% |
| cnn | 3.0 (3/3) | 2.0 (2/2) | 13,325 (13,322/13,345) | 7,666 | 5,659 | $0.0444 | $0.0264 | 40% |
| theguardian | 3.0 (3/3) | 3.0 (3/3) | 13,369 (13,359/13,381) | 13,352 | 17 | $0.0460 | $0.0450 | 2% |
| **suite sum** | **12.0** | **9.0** | **53,377** | **36,344** | **17,034** | **$0.1601** | **$0.1090** | **32%** |

Per-1,000 page-loads (input-token bill, vanilla vs Ghostery):

- Vanilla: **$40.03 / 1k loads** (avg across measured pages)
- Ghostery: **$27.26 / 1k loads**
- Saved: **$12.78 / 1k loads** (32%)

## Stop-reason distribution

- **npr** vanilla: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use -- ghostery: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use
- **theverge** vanilla: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use -- ghostery: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use
- **cnn** vanilla: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use -- ghostery: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use
- **theguardian** vanilla: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use -- ghostery: tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use, tool_use

## Headlines extracted (vanilla / ghostery)

- **npr**
  - vanilla: "Why the Supreme Court's voting rights ruling could play a big role at the local level"
  - ghostery: "Why the Supreme Court's voting rights ruling could play a big role at the local level"
- **theverge**
  - vanilla: "Leaked images reveal Sony's 10th anniversary 'ColleXion' headphones"
  - ghostery: "Leaked images reveal Sony's 10th anniversary 'ColleXion' headphones"
- **cnn**
  - vanilla: "Guns on television and in Iran's streets as Trump renews war threats"
  - ghostery: "Guns on television and in Iran's streets as Trump renews war threats"
- **theguardian**
  - vanilla: "The strange case of murderer who shared Epstein's cell"
  - ghostery: "Trump's immigration crackdown could cost up to $479bn in lost taxes over 10 years"
