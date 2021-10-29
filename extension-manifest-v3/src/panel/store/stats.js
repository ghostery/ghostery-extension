import { store } from '/hybrids.js';

import Tracker from './tracker.js';

const Stats = {
  domain: '',
  all: 0,
  loadTime: 0,
  trackers: [Tracker],
  byCategory: ({ trackers }) => {
    return trackers.reduce((all, current) => ({
      ...all,
      [current.category]: {
        count: (all[current.category] || { count: 0 }).count + 1,
        trackers: [...(all[current.category] || { trackers: []}).trackers, current],
      },
    }), {});
  },
  byTracker: ({ trackers }) => {
    return trackers.reduce((all, current) => ({
      ...all,
      [current.id]: current,
    }), {});
  },
  [store.connect] : {
    get: async () => {
      const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
      const storage = await chrome.storage.local.get(['tabStats:v1']);
      const tabStats = storage['tabStats:v1'].entries[currentTab.id];
      return tabStats;
    },
  },
};

export function reloadStats() {
  store.clear(Stats);
}

export default Stats;
