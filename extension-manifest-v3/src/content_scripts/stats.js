chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStats') {
    const perfEntries = performance.getEntriesByType("navigation");
    sendResponse({
      loadTime: perfEntries[0].loadEventEnd,
    });
    return;
  }
});
