import { localize } from 'hybrids';

if (typeof chrome === 'object' && chrome.i18n) {
  localize(chrome.i18n.getMessage, { format: 'chrome.i18n' });
}
