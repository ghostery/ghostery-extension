// Simplified version of chrome.alarms API from MV3
function shimAlarms() {
  const listeners = new Set();
  const alarms = new Map();

  return {
    async getAll() {
      return Array.from(alarms.keys()).map((name) => ({ name }));
    },
    async clearAll() {
      alarms.forEach((timeout) => clearTimeout(timeout));
      alarms.clear();
    },
    async clear(name) {
      clearTimeout(alarms.get(name));
      alarms.delete(name);
    },
    create(name, options) {
      if (options.when) {
        alarms.set(
          name,
          setTimeout(() => {
            listeners.forEach((fn) => fn({ name }));
            if (options.periodInMinutes) {
              setInterval(() => {
                listeners.forEach((fn) => fn({ name }));
              }, options.periodInMinutes * 60 * 1000);
            }
          }, options.when - Date.now()),
        );
      } else {
        throw new Error('Invalid alarm options');
      }
    },
    onAlarm: {
      addListener(fn) {
        listeners.add(fn);
      },
    },
  };
}

if (__PLATFORM__ === 'firefox') {
  window.chrome = Object.assign(window.browser, {
    alarms: shimAlarms(),
  });
}
