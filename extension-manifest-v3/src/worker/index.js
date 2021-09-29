try {
  importScripts('../vendor/tldts/index.umd.min.js'); // exports `tldts`
  importScripts('../vendor/@cliqz/adblocker/adblocker.umd.min.js'); // exports `adblocker`
  importScripts('./adblocker.js');
  importScripts('./storage.js');
} catch (e) {
  // on Safari those have to be imported from manifest.json
}

chrome.declarativeNetRequest.setExtensionActionOptions && chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: true });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.tab === undefined) {
    throw new Error('required "sender.tab" information is not available');
  }

  if (sender.tab.id === undefined) {
    throw new Error('required "sender.tab.id" information is not available');
  }

  if (sender.frameId === undefined) {
    throw new Error('required "sender.frameId" information is not available');
  }

  adblockerOnMessage(msg, sender, sendResponse);
});
