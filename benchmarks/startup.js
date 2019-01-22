const perf = require('@cliqz/webextension-emulator');

const Emulator = perf.default;

const emulator = new Emulator('../', {
  injectWebextenionPolyfill: true,
  quiet: true,
  chromeStoragePath: './data/storage',
  indexedDBPath: './data/idb',
  timeMultiplier: 10,
});
emulator.createSandbox();

emulator.startExtension();

// process.on('unhandledRejection', console.error);

setTimeout(() => {
  global.gc();
  emulator._probe('memory.heap', process.memoryUsage().heapUsed);
}, 5000);

setTimeout(() => {
  global.gc();
  emulator._probe('memory.heap', process.memoryUsage().heapUsed);
  emulator.stopExtension();
  emulator.probeStorage();
  console.log(JSON.stringify(Object.assign({
    idb: perf.measureIdbSize(emulator),
  }, emulator.getProbeSummary())));
  process.exit();
}, 20000);
