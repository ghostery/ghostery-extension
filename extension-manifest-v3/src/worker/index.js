try {
  importScripts('../vendor/tldts/index.umd.min.js'); // exports `tldts`
  importScripts('../vendor/@cliqz/adblocker/adblocker.umd.min.js'); // exports `adblocker`
  importScripts('./adblocker.js');
  importScripts('./storage.js');
  importScripts('../common/tracker-wheel.js');
} catch (e) {
  // on Safari those have to be imported from manifest.json
}

const tabStats = new Map();

function trackerUrlToCategory(url) {
  // TODO: ignore dataurls
  try {
    const { domain } = tldts.parse(url);
    const trackerId = storage.get('tracker_domains')[domain];
    const tracker = storage.get('trackers')[trackerId];
    return storage.get('categories')[tracker.category_id];
  } catch (e) {
    return 'unknown';
  }
}

chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, frameId }) => {
  if (frameId !== 0) {
    return;
  }
  tabStats.set(tabId, { urls: [], loadTime: 0 });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "dnrUpdate") {
    updateAdblockerEngineStatuses();
    return;
  }

  if (msg.action === "getTabStats") {
    sendResponse(tabStats.get(msg.args[0].tabId));
    return;
  }

  if (sender.tab === undefined) {
    throw new Error('required "sender.tab" information is not available');
  }

  if (sender.tab.id === undefined) {
    throw new Error('required "sender.tab.id" information is not available');
  }

  if (sender.frameId === undefined) {
    throw new Error('required "sender.frameId" information is not available');
  }

  const tabId = sender.tab.id;

  if (msg.action === "updateTabStats") {
    let stats = tabStats.get(tabId);
    if (msg.args[0].loadTime && sender.frameId === 0) {
      stats.loadTime = msg.args[0].loadTime;
    }
    if (msg.args[0].urls) {
      stats.urls.push(...msg.args[0].urls);
    }
    tabStats.set(tabId, stats);

    (chrome.browserAction || chrome.action).setIcon({
      tabId,
      imageData: offscreenImageData(128, stats.urls.map(trackerUrlToCategory)),
    });

    return;
  }

  adblockerOnMessage(msg, sender, sendResponse);
});
