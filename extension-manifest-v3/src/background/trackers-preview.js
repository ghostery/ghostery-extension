import { store } from 'hybrids';
import {
  tryWTMReportOnMessageHandler,
  isDisableWTMReportMessage,
} from '@whotracksme/webextension-packages/packages/trackers-preview/background';

import Options from '/store/options.js';

store.get(Options);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const options = store.get(Options);

  if (options.wtmSerpReport ?? true) {
    if (tryWTMReportOnMessageHandler(msg, sender, sendResponse)) {
      return false;
    }

    if (isDisableWTMReportMessage(msg)) {
      store.set(options, { wtmSerpReport: false });
    }
  }

  return false;
});
