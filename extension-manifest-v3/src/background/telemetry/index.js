import { Metrics as Telemetry } from '@ghostery/libs';
import { store } from 'hybrids';

import Options from '/store/options.js';
import UTMs from '/store/utms.js';

import { loadStorage, saveStorage } from './storage';

const log = console.log.bind(console, '[telemetry]');

async function recordUTMs(telemetry, JUST_INSTALLED) {
  if (JUST_INSTALLED) {
    const { utm_source, utm_campaign } = await telemetry.detectUTMs();
    await store.set(utms, { utm_source, utm_campaign });
    return;
  }

  const utms = await store.resolve(store.get(UTMs));

  telemetry.setUTMs(utms);
}

(async () => {
  const options = await store.resolve(store.get(Options));
  const storage = await loadStorage();

  const telemetry = new Telemetry({
    METRICS_BASE_URL: 'https://d.ghostery.com',
    EXTENSION_VERSION: chrome.runtime.getManifest().version,
    conf: options,
    log,
    storage,
    saveStorage: (metrics) => {
      saveStorage(storage, metrics);
    },
  });

  const JUST_INSTALLED = storage.install_all === 0;

  try {
    await recordUTMs(telemetry, JUST_INSTALLED);
  } catch (error) {
    log('Telemetry recordUTMs() error', error);
  }

  if (JUST_INSTALLED) {
    telemetry.setUninstallUrl();

    telemetry.ping('install');
  } else {
    telemetry.ping('active');
  }
})();
