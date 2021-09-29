async function cacheFile(filename, storageKey) {
  const url = chrome.runtime.getURL(filename);
  const request = await fetch(url);
  const json = await request.json();
  await chrome.storage.local.set({ [storageKey]: json });
  return json;
}

cacheFile('rule_resources/categories.json', 'categories');
cacheFile('rule_resources/companies.json', 'companies');
cacheFile('rule_resources/trackers.json', 'trackers');
cacheFile('rule_resources/tracker_domains.json', 'tracker_domains');
cacheFile('rule_resources/dnr-ads-network-mapping.json', 'ads_mapping');
cacheFile('rule_resources/dnr-tracking-network-mapping.json', 'tracking_mapping');
cacheFile('rule_resources/dnr-annoyances-network-mapping.json', 'annoyances_mapping');
