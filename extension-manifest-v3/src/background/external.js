import { session } from '/utils/api.js';

if (__PLATFORM__ !== 'safari') {
  // Listen for messages from Ghostery Search extension
  // https://github.com/ghostery/ghostery-search-extension/blob/main/src/background.js#L40

  const GHOSTERY_SEARCH_EXTENSION_IDS = [
    'nomidcdbhopffbhbpfnnlgnfimhgdman', // Chrome
    'search@ghostery.com', // Firefox
  ];

  const GHOSTERY_NEW_TAB_EXTENSION_IDS = ['newtab@ghostery.com'];

  chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
      // Refresh session support for Ghostery Search extension
      if (GHOSTERY_SEARCH_EXTENSION_IDS.includes(sender.id)) {
        switch (message) {
          case 'refreshToken':
            session().then(
              (res) => sendResponse({ success: res !== undefined }),
              (error) => sendResponse({ success: false, error }),
            );
            return true;
          default:
            console.error(`Unknown message type from "${sender.id}"`, message);
        }
      }

      // Send historical stats to Ghostery New Tab extension
      if (GHOSTERY_NEW_TAB_EXTENSION_IDS.includes(sender.id)) {
        switch (message?.name) {
          case 'getDashboardStats':
            sendResponse({});
            return true;
          default:
            console.error(`Unknown message type from "${sender.id}"`, message);
        }
      }

      return false;
    },
  );
}
