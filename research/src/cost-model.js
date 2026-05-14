export const PRICING_USD_PER_MTOK = {
  'haiku-4.5': 1,
  'sonnet-4.6': 3,
  'opus-4.7': 15,
};

const ANTHROPIC_MAX_DIM = 1568;

export function imageTokens(width, height) {
  let w = width;
  let h = height;
  const longEdge = Math.max(w, h);
  if (longEdge > ANTHROPIC_MAX_DIM) {
    const scale = ANTHROPIC_MAX_DIM / longEdge;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  return Math.ceil((w * h) / 750);
}

export function costUsd(tokens, model = 'sonnet-4.6') {
  const rate = PRICING_USD_PER_MTOK[model];
  if (rate == null) throw new Error(`Unknown model: ${model}`);
  return (tokens / 1_000_000) * rate;
}

export const CONSENT_DISMISS_AGENT_LOOPS = 3;
export const TOKENS_PER_AGENT_LOOP = 5000;

export const CONSENT_DISMISS_EXTRA_TURNS_LOW = 2;
export const CONSENT_DISMISS_EXTRA_TURNS_HIGH = 3;

export function consentDismissOverheadTokens() {
  return CONSENT_DISMISS_AGENT_LOOPS * TOKENS_PER_AGENT_LOOP;
}

export function measuredConsentTaxTokens(perTurnTokens, extraTurns) {
  return perTurnTokens * extraTurns;
}
