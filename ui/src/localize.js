import { localize } from 'hybrids';

if (typeof chrome === 'object' && chrome.i18n) {
  localize((key) => {
    const translation = chrome.i18n.getMessage(key);
    if (!translation) {
      console.warn(`Ghostery: missing translation for key: ${key}`);
    }
    return translation || key;
  });
}
