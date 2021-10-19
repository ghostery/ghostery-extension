const start = Date.now();
let loadTime = 0;

window.addEventListener('load', () => {
  loadTime = Date.now() - start;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStats') {
    sendResponse({
      loadTime,
      blockedUrls,
    });
    return;
  }
});
