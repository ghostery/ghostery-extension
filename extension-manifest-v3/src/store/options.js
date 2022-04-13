import { store } from 'hybrids';

const UPDATE_ACTION_NAME = 'updateOptions';

const Options = {
  trackerWheelDisabled: false,
  wtmSerpReport: true,
  [store.connect]: {
    async get() {
      const storage = await chrome.storage.local.get(['options']);
      return storage.options || {};
    },
    async set(_, options, keys) {
      const prevOptions = await this.get();
      const nextOptions = {
        ...prevOptions,
        ...Object.fromEntries(keys.map((key) => [key, options[key]])),
      };

      chrome.storage.local.set({ options: nextOptions });
      chrome.runtime.sendMessage({ action: UPDATE_ACTION_NAME });

      return options;
    },
  },
};

export default Options;

chrome.runtime.onMessage.addListener((message) => {
  if (message?.action === UPDATE_ACTION_NAME) {
    store.clear(Options, false);
    store.get(Options);

    return false;
  }
});
