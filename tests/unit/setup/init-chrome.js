if (typeof globalThis.chrome === 'undefined') {
  globalThis.chrome = {
    runtime: {
      getManifest() {
        return {};
      },
      onMessage: {
        addListener() {},
      },
    },
    storage: {
      onChanged: {
        addListener() {},
      },
    },
  };
}

// Mock navigator to simulate Chrome
Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    brave: undefined,
  },
  writable: true,
  configurable: true,
});

globalThis.__CHROMIUM__ = true;
globalThis.__FIREFOX__ = false;
