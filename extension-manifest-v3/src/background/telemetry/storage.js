import { Metrics as Telemetry } from '@ghostery/libs';

export const saveStorage = async (storage, metrics) => {
  Object.assign(storage, metrics);
  await chrome.storage.local.set({ metrics: storage });
};

export const loadStorage = async () => {
  const storage = {
    active_daily_velocity: [],
    engaged_daily_velocity: [],
    engaged_daily_count: [],
  };
  Telemetry.FREQUENCY_TYPES.forEach((frequency) => {
    Telemetry.CRITICAL_TYPES.forEach((type) => {
      storage[`${type}_${frequency}`] = 0;
    });
  });
  const { metrics = {} } = await chrome.storage.local.get(['metrics']);
  Object.assign(storage, metrics);
  return storage;
};
