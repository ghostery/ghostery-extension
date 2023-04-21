import chrome from 'sinon-chrome';

window.document = {};
globalThis.__PLATFORM__ = 'deno';
chrome.runtime.id = 'deno';
globalThis.chrome = chrome;
