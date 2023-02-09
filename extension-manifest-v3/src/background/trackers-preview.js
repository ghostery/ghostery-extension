import { store } from 'hybrids';
import {
  tryWTMReportOnMessageHandler,
  isDisableWTMReportMessage,
} from '@whotracksme/webextension-packages/packages/trackers-preview/background';

import Options from '/store/options.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const options = store.get(Options);

  if (!store.ready(options)) {
    return false;
  }

  if (options.wtmSerpReport) {
    if (tryWTMReportOnMessageHandler(msg, sender, sendResponse)) {
      return false;
    }

    if (isDisableWTMReportMessage(msg)) {
      store.set(options, { wtmSerpReport: false });
    }
  }

  return false;
});
