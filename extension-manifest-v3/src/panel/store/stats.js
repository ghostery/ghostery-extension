import { store } from '/hybrids.js';

import Category from './category.js';
import Tracker from './tracker.js';
import { toggles, getRulesetType } from '../../common/rulesets.js';
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
      const pageStats = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getTabStats", args: [{ tabId: currentTab.id }] }, resolve);
      });

      const url = currentTab.url;
      let all = 0;
      const byToggle = BY_TOGGLE_FACTORY();
      const trackers = [];

      if (chrome.declarativeNetRequest.getMatchedRules) {
        const mappings = toggles.map(toggle => `${toggle}_mapping`);
        const storage = await chrome.storage.local.get(['trackers', ...mappings]);
        const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({ tabId: currentTab.id });

        all = rulesMatchedInfo.length;

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
      } else {
        // Safari does not support any kind of DNR feedback
        const storage = await chrome.storage.local.get(['trackers', 'tracker_domains']);
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
            category: tracker.category_id,
          });
        })
      }

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
