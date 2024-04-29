import { createDocumentConverter } from '/utils/dnr-converter.js';

const convert = createDocumentConverter();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'offscreen:urlfitler2dnr:convert') {
    convert(msg.filter).then((result) => sendResponse(result));
    return true;
  }
  return false;
});
