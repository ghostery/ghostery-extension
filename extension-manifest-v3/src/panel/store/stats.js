import { store } from '/hybrids.js';

import Category from './category.js';
import Tracker from './tracker.js';
import { toggles, getRulesetType } from '../../common/rulesets.js';

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
      [current.category.name]: (all[current.category.name] || 0) + 1,
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
      let pageStats = {};

      const pageStatsPromise = new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(currentTab.id, { action: "getStats" }, (_pageStats) => {
          console.warn(_pageStats);
          pageStats = _pageStats;
          resolve();
        });
      });

      const mappings = toggles.map(toggle => `${toggle}_mapping`);
      const storage = await chrome.storage.local.get(['trackers', ...mappings]);
      const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({ tabId: currentTab.id });

      const url = currentTab.url;
      const all = rulesMatchedInfo.length;
      const byToggle = BY_TOGGLE_FACTORY();
      const trackers = [];

      await store.pending(store.get([Category]));

      rulesMatchedInfo.forEach(({ rule }) => {
        const type = getRulesetType(rule.rulesetId);
        const mapping = storage[`${type}_mapping`];
        const trackerId = mapping[rule.ruleId];
        const tracker = trackerId
          ? storage.trackers[trackerId]
          : { id: 'unknown', category_id: '11' };


        byToggle[type] += 1;

        trackers.push({
          id: tracker.id,
          name: tracker.name,
          category: tracker.category_id,
        });
      });

      await pageStatsPromise;

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
