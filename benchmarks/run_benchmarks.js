const fs = require('fs');
const childProcess = require('child_process');

function runBenchmark(script, sessionFile) {
  const process = childProcess.spawnSync('time', ['-p', 'node', '--expose-gc', script, sessionFile]);
  const stderr = process.stderr.toString().split('\n');
  const results = JSON.parse(process.stdout.toString());
  const cputime = parseFloat(stderr[stderr.length - 3].split(/[ ]+/)[1]);
  return {
    results: { cputime, ...results },
    errors: stderr,
  }
}

const prefFile = './data/storage/storage_local.json';

function setCliqzPref(name, value) {
  const prefs = JSON.parse(fs.readFileSync(prefFile));
  prefs.cliqzprefs[name] = value;
  fs.writeFileSync(prefFile, JSON.stringify(prefs));
}

if (fs.existsSync('./data')) {
  childProcess.spawnSync('rm', ['-r', './data']);
}
fs.mkdirSync('./data');
fs.mkdirSync('./data/storage');
// auto-select adblocker enabled

const results = [];

function logResult(result) {
  console.log(JSON.stringify(result.results));
}

console.log('=== Startup benchmark: New profile ===');
results.push(runBenchmark('./startup.js'));
logResult(results[0])

console.log('=== Startup benchmark: Existing profile ===');
results.push(runBenchmark('./startup.js'));
logResult(results[1])

// webrequest benchmark
console.log('=== Webrequest Benchmark: Anti-tracking + adblocker ===');
results.push(runBenchmark('./run_session.js', 'session.jl'));
logResult(results[2])

// with anti-tracking off
console.log('=== Webrequest Benchmark: Anti-tracking off ===');
setCliqzPref('modules.antitracking.enabled', false);
results.push(runBenchmark('./run_session.js', 'session.jl'));
logResult(results[3])

console.log('=== Webrequest Benchmark: Both off ===');
setCliqzPref('modules.adblocker.enabled', false);
results.push(runBenchmark('./run_session.js', 'session.jl'));
logResult(results[4])
