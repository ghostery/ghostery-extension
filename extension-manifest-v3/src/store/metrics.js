import { store } from 'hybrids';
import { Metrics as Telemetry } from '@ghostery/libs';

const VELOCITIES = [
  'active_daily_velocity',
  'engaged_daily_velocity',
  'engaged_daily_count',
];

const Metrics = {
  ...VELOCITIES.reduce((all, current) => ({ ...all, [current]: [0] }), {}),
  [store.connect]: {
    async get() {
      const { metrics = {} } = await chrome.storage.local.get(['metrics']);
      VELOCITIES.forEach((velocity) => {
        if (
          (metrics[velocity] &&
            metrics[velocity].length === 0 &&
            metrics[velocity][0] === 0) ||
          !metrics[velocity]
        ) {
          metrics[velocity] = [];
        }
      });

      return metrics;
    },
    async set(_, metrics) {
      await chrome.storage.local.set({ metrics });
      return metrics;
    },
  },
};

Telemetry.FREQUENCY_TYPES.forEach((frequency) => {
  Telemetry.CRITICAL_TYPES.forEach((type) => {
    Metrics[`${type}_${frequency}`] = 0;
  });
});

export default Metrics;
