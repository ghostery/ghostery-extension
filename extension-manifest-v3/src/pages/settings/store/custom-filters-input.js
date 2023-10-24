import { store } from 'hybrids';

const CustomFiltersInput = {
  text: '',
  [store.connect]: {
    async get() {
      const storage = await chrome.storage.local.get(['custom-filters-input']);
      return {
        text: storage['custom-filters-input'] || '',
      };
    },
    async set(_, { text }) {
      await chrome.storage.local.set({ 'custom-filters-input': text });
      return { text };
    },
  },
};

export default CustomFiltersInput;
