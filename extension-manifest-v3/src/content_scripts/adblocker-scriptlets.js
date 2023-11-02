// Should only be needed on Safari:
// the tabId of the initial chrome.webNavigation.onCommitted
// is not reliable. When opening bookmarks, it can happen that
// the event is associated with a tabId of 0.
chrome.runtime.sendMessage({ action: 'onCommitted' });
