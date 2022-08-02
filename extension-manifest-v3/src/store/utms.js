import { store } from 'hybrids';

const UTMs = {
  utm_source: '',
  utm_campaign: '',
  [store.connect]: {
    async get() {
      const { utms = {} } = await chrome.storage.local.get(['utms']);
      return utms;
    },
    async set(_, utms) {
      await chrome.storage.local.set({ utms });
      return utms;
    },
  },
};

export default UTMs;
