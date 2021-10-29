export function t(key) {
  const translation = chrome.i18n.getMessage(key);
  if (!translation) {
    console.warn(`Ghostery: missing translation for key: ${key}`);
  }
  return translation || key;
}
