import { store } from '/hybrids.js';
import { toggles, getRulesetType } from '../../common/rulesets.js';

const BY_TOGGLE_FACTORY = () => toggles.reduce((all, toggle) => ({ ...all, [toggle]: 0 }), {});

const Tracker = {
  id: true,
  category_id: 'unknown',
  company_id: 'unknown',
};

const Stats = {
  url: '',
  all: 0,
  byToggle: BY_TOGGLE_FACTORY(),
  trackers: [Tracker],
  byCategory: ({ trackers }) => {
    return trackers.reduce((all, current) => ({
      ...all,
      [current.category_id]: (all[current.category_id] || 0) + 1,
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

      const mappings = toggles.map(toggle => `${toggle}_mapping`);
      const storage = await chrome.storage.local.get(['trackers', 'categories', ...mappings]);
      const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({ tabId: currentTab.id });

      const url = currentTab.url;
      const all = rulesMatchedInfo.length;
      const byToggle = BY_TOGGLE_FACTORY();
      const trackers = [];

      rulesMatchedInfo.forEach(({ rule }) => {
        const type = getRulesetType(rule.rulesetId);
        const mapping = storage[`${type}_mapping`];
        const trackerId = mapping[rule.ruleId];
        const tracker = trackerId
          ? storage.trackers[trackerId]
          : { id: 'unknown', category_id: 'unknown' };

        if (!trackerId) {
          console.warn(`Unknown tracker - ruleId: ${rule.ruleId}, rulesetId: ${rule.rulesetId}`);
        }

        byToggle[type] += 1;
        trackers.push(tracker);
      });

      const stats = {
        url,
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
