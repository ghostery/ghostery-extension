import { localize } from 'hybrids';

if (typeof chrome === 'object' && chrome.i18n) {
  localize(chrome.i18n.getMessage.bind(chrome.i18n), { format: 'chrome.i18n' });
}
