const perf = require('@cliqz/webextension-emulator');

const sessionFile = process.argv[2];

const Emulator = perf.default;
const timeMultiplier = 10;
const emulator = new Emulator('../', {
  injectWebextenionPolyfill: true,
  quiet: true,
  chromeStoragePath: './data/storage',
  indexedDBPath: './data/idb',
  timeMultiplier,
});
emulator.createSandbox();

global.gc();
emulator._probe('memory.heap', process.memoryUsage().heapUsed);
emulator.startExtension();

// uncomment for stack-traces on errors
// process.on('unhandledRejection', console.error);

setTimeout(async () => {
  global.gc();
  emulator._probe('memory.heap', process.memoryUsage().heapUsed);
  await emulator.emulateSession(sessionFile);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  global.gc();
  emulator._probe('memory.heap', process.memoryUsage().heapUsed);
  emulator.stopExtension();
  emulator.probeStorage();
  console.log(JSON.stringify({
    idb: perf.measureIdbSize(emulator),
    ...emulator.getProbeSummary()
  }));
  setTimeout(() => {
    process.exit();
  }, 1000);
}, 5000)
