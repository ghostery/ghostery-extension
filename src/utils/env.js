import { evaluatePreprocessor } from '@ghostery/adblocker';

export const ENV = new Map([
  ['ext_ghostery', true],
  ['ext_ublock', true],
  ['ext_ubol', checkUserAgent('Firefox')],
  ['cap_html_filtering', checkUserAgent('Firefox')],
  // can be removed in once $replace support is sufficiently distributed
  ['cap_replace_modifier', checkUserAgent('Firefox')],
  ['cap_user_stylesheet', true],
  ['env_firefox', checkUserAgent('Firefox')],
  ['env_chromium', checkUserAgent('Chrome')],
  ['env_edge', checkUserAgent('Edg')],
  ['env_mobile', checkUserAgent('Mobile')],
  ['env_experimental', false],
]);

function checkUserAgent(pattern) {
  return navigator.userAgent.indexOf(pattern) !== -1;
}

export function evaluatePreprocessorCondition(condition) {
  return evaluatePreprocessor(condition, ENV);
}
