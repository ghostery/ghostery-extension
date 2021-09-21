import { store } from '/hybrids.js';

const rulesetIds = chrome.runtime.getManifest().declarative_net_request.rule_resources.map(r => r.id);

function getRulesetType(rulesetId) {
  return rulesetId.split("_")[0];
}

const Settings = {
  blockingStatus: rulesetIds.reduce((all, rulesetId) => ({ ...all, [getRulesetType(rulesetId)]: false }), {}),
  [store.connect] : {
    get: async () => {
      const enabledRulesetIds = await chrome.declarativeNetRequest.getEnabledRulesets();
      const enabledRulesetTypes = enabledRulesetIds.map(getRulesetType);
      const settings = {
        blockingStatus: {},
      };
      enabledRulesetTypes.forEach(type => {
        settings.blockingStatus[type] = true;
      });
      return settings;
    },
    set: (_, settings) => settings,
  },
};

export async function toggleBlocking(type) {
  const settings = store.get(Settings);
  const rulesetId = rulesetIds.find(r => r.startsWith(type));

  const currentStatus = settings.blockingStatus[type];

  if (currentStatus) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: [rulesetId],
    });
  } else {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: [rulesetId],
    });
  }

  store.set(Settings, {
    ...settings,
    blockingStatus: {
      ...settings.blockingStatus,
      [type]: !currentStatus
    }
  });
}

export default Settings;