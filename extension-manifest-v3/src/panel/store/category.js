import { store } from '/hybrids.js';

export default {
  id: true,
  name: '',
  [store.connect] : {
    list: async () => {
      const storage = await chrome.storage.local.get(['categories']);
      return Object.keys(storage.categories).map((id) => ({
        id,
        name: storage.categories[id],
      }));
    },
  },
};