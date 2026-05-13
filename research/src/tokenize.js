import { encode } from 'gpt-tokenizer/encoding/cl100k_base';

export function countTokens(text) {
  if (!text) return 0;
  return encode(text).length;
}
