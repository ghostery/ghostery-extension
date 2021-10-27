import { store } from '/hybrids.js';

import Tracker from './tracker.js';
import { toggles } from '../../common/rulesets.js';
import '../../vendor/tldts/index.umd.min.js'; // exports tldts

const BY_TOGGLE_FACTORY = () => toggles.reduce((all, toggle) => ({ ...all, [toggle]: 0 }), {});

const Stats = {
  url: '',
  all: 0,
  loadTime: 0,
  byToggle: BY_TOGGLE_FACTORY(),
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
      [current.id]: (all[current.id] || 0) + 1,
    }), {});
  },
  [store.connect] : {
    get: async () => {
      const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
      const pageStats = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getTabStats", args: [{ tabId: currentTab.id }] }, resolve);
      });

      const url = currentTab.url;
      let all = 0;
      const byToggle = BY_TOGGLE_FACTORY();
      const trackers = [];

      // Safari does not support any kind of DNR feedback
      const storage = await chrome.storage.local.get(['categories', 'trackers', 'tracker_domains']);
      const { urls } = pageStats;
      all = urls.length;

      urls.forEach(url => {
        const { domain } = tldts.parse(url);
        const trackerId = storage.tracker_domains[domain];

        const tracker = trackerId
          ? storage.trackers[trackerId]
          : { id: 'unknown', category_id: '11' };

        trackers.push({
          id: tracker.id,
          name: tracker.name,
          category: storage.categories[String(tracker.category_id)],
        });
      })

      const stats = {
        url,
        loadTime: pageStats.loadTime,
        all,
        byToggle,
        trackers,
      };

      return stats;
    },
  },
};

export function reloadStats() {
  store.clear(Stats);
}

export default Stats;
