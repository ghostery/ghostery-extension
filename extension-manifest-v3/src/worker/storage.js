// This global will be asynchronously filled during startup,
// and provides access to the resources.
//
// Note: The resources are shipped with the extension, so
// loading from the local filesystem should be fast.
const storage = new Map();

const RESOURCES = {
  categories: 'rule_resources/categories.json',
  companies: 'rule_resources/companies.json',
  trackers: 'rule_resources/trackers.json',
  tracker_domains: 'rule_resources/tracker_domains.json',
  ads_mapping: 'rule_resources/dnr-ads-network-mapping.json',
  tracking_mapping: 'rule_resources/dnr-tracking-network-mapping.json',
  annoyances_mapping: 'rule_resources/dnr-annoyances-network-mapping.json',
};

async function loadResource(storageKey, filename) {
  const url = chrome.runtime.getURL(filename);
  const request = await fetch(url);
  const json = await request.json();
  storage.set(storageKey, json);

  // Note: for now, only keep it in memory
  // await chrome.storage.local.set({ [storageKey]: json });
}

const pendingLoads = Promise.all(
  Object.entries(RESOURCES).map(([key, resource]) => loadResource(key, resource))
);

// errors should not happen, as we are loading from the local filesystem
pendingLoads
  .then(() => console.debug('Finished loading:', storage))
  .catch((e) => console.error('Unexpected error while loading resources', e));
