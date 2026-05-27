import { store } from 'hybrids';

export default {
  id: true,
  title: '',
  hostname: '',
  active: false,
  [store.connect]: {
    async list() {
      const tabs = await chrome.tabs.query({});
      return tabs
        .filter(({ url }) => url !== location.href)
        .map((tab) => {
          let hostname = '';
          try {
            hostname = new URL(tab.url).hostname;
          } catch (e) {
            // Ignore invalid URLs
          }
          return {
            id: tab.id,
            title: tab.title,
            hostname,
            active: tab.active,
          };
        });
    },
  },
};
