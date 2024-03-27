import * as engines from '/utils/engines.js';

async function updateDNRRules(dnrRules) {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: dynamicRules
      // ids between 1 and 2 million are reserved for dynamic rules
      .filter(({ id }) => id >= 1000000 && id < 2000000)
      .map(({ id }) => id),
  });

  const addRules = dnrRules.map((rule, index) => ({
    ...rule,
    id: 1000000 + index,
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({ addRules });
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.action === 'custom-filters:update-engine') {
    engines
      .createCustomEngine(engines.CUSTOM_ENGINE, msg.filters)
      .then(() => sendResponse());
    return true;
  }

  if (__PLATFORM__ !== 'firefox') {
    if (msg.action === 'custom-filters:update-dnr') {
      updateDNRRules(msg.dnrRules).then(() => sendResponse());
      return true;
    }
  }
});
