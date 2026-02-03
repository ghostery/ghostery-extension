if (typeof globalThis.chrome === 'undefined') {
  global.chrome = {
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

if (typeof globalThis.__PLATFORM__ === 'undefined') {
  global.__PLATFORM__ = 'chrome';
}
