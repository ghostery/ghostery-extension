const fs = require('fs');
const perf = require('@cliqz/webextension-emulator');
const addAndroidApis = require('./android-apis');

const Emulator = perf.default;

const emulator = new Emulator('../', {
  injectWebextenionPolyfill: true,
  quiet: true,
  chromeStoragePath: './data/storage',
  indexedDBPath: './data/idb',
  timeMultiplier: 10,
});
addAndroidApis(emulator);
emulator.createSandbox();

emulator.startExtension();
emulator.mock.createTab({
  id: 3,
  active: true,
  title: 'Ghostery',
  url: 'https://ghostery.com',
});

process.on('unhandledRejection', (e) => {
  emulator._probe('errors.promiserejection', e.message + '\n' + e.stack);
});

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
  fs.appendFileSync('./diagnostics.jl', JSON.stringify(emulator.probes))
  setTimeout(() => {
    process.exit();
  }, 1000);
}, 20000);
