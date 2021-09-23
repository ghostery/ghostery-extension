export const rulesetIds = chrome.runtime.getManifest().declarative_net_request.rule_resources.map(r => r.id);

export function getRulesetType(rulesetId) {
  return rulesetId.split("_")[0];
}

export const toggles = rulesetIds.map(getRulesetType);
