import { store } from 'hybrids';

const CustomFiltersInput = {
  text: '',
  [store.connect]: {
    async get() {
      const { customFiltersInput } = await chrome.storage.local.get([
        'customFiltersInput',
      ]);
      return {
        text: customFiltersInput,
      };
    },
    async set(_, { text }) {
      await chrome.storage.local.set({ customFiltersInput: text });
      return { text };
    },
  },
};

export default CustomFiltersInput;
