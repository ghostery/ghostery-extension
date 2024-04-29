import chrome from 'sinon-chrome';

globalThis.chrome = chrome;

// for webextension-polyfill
chrome.runtime.id = true;

chrome.runtime.getManifest.withArgs().returns({
  permissions: [],
});
