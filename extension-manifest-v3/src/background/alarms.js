import { store } from 'hybrids';
import Options, { observe } from '/store/options.js';

// Pause / unpause domains
const PAUSED_ALARM_PREFIX = 'options:revoke';

// Remove paused domains from options when alarm is triggered
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(PAUSED_ALARM_PREFIX)) {
    store.resolve(Options).then((options) => {
      store.set(options, {
        paused: options.paused.filter(
          ({ id }) => `${PAUSED_ALARM_PREFIX}:${id}` !== alarm.name,
        ),
      });
    });
  }
});

observe('paused', async (paused) => {
  const alarms = (await chrome.alarms.getAll()).filter(({ name }) =>
    name.startsWith(PAUSED_ALARM_PREFIX),
  );
  const revokeDomains = paused.filter(({ revokeAt }) => revokeAt);

  // Clear alarms for removed domains
  alarms.forEach(({ name }) => {
    if (
      !revokeDomains.find(({ id }) => name === `${PAUSED_ALARM_PREFIX}:${id}`)
    ) {
      chrome.alarms.clear(name);
    }
  });

  // Add alarms for new domains
  if (revokeDomains.length) {
    revokeDomains
      .filter(({ id }) => !alarms.some(({ name }) => name === id))
      .forEach(({ id, revokeAt }) => {
        chrome.alarms.create(`${PAUSED_ALARM_PREFIX}:${id}`, {
          when: revokeAt,
        });
      });
  }
});
