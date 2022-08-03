import { Metrics as Telemetry } from '@ghostery/libs';
import { store } from 'hybrids';

import Options from '/store/options.js';
import Metrics from '/store/metrics.js';
import UTMs from '/store/utms.js';

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
  const metrics = await store.resolve(store.get(Metrics));

  const telemetry = new Telemetry({
    METRICS_BASE_URL: 'https://d.ghostery.com',
    EXTENSION_VERSION: chrome.runtime.getManifest().version,
    conf: options,
    log,
    // object copy as hybrics arrays are not extensible
    storage: JSON.parse(JSON.stringify(metrics)),
    saveStorage: async (_storage) => {
      await store.set(metrics, _storage);
    },
  });

  const JUST_INSTALLED = metrics.install_all === 0;

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
