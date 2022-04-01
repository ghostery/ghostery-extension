import shelljs from 'shelljs';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const REPO_URL = 'git@github.com:ghostery/ghostery-dnr-lists.git';

shelljs.rm('-rf', 'tmp');
shelljs.rm('-rf', 'src/assets/rule_resources/*.json');

function writeJSONPlaceholder(path, content) {
  writeFileSync(
    resolve('src/assets/rule_resources/', path),
    JSON.stringify(content),
  );
}

try {
  const result = shelljs.exec(`git clone ${REPO_URL} tmp/dnr-lists`);
  if (result.code !== 0) {
    throw Error("Couldn't clone repo");
  }

  shelljs.exec('cd tmp/dnr-lists && npm ci && npm start');

  shelljs.cp('-R', 'tmp/dnr-lists/build/*.json', 'src/assets/rule_resources/');
} catch (e) {
  console.log('Generating placeholder DNR lists');

  writeJSONPlaceholder('bugs.json', {
    patterns: { host_path: {} },
  });

  writeJSONPlaceholder('categories.json', {});
  writeJSONPlaceholder('trackers.json', {});
  writeJSONPlaceholder('tracker_domains.json', {});

  writeJSONPlaceholder('sites.json', []);

  writeJSONPlaceholder('dnr-ads-network.json', []);
  writeJSONPlaceholder('dnr-annoyances-network.json', []);
  writeJSONPlaceholder('dnr-tracking-network.json', []);

  writeJSONPlaceholder('dnr-safari-ads-network.json', []);
  writeJSONPlaceholder('dnr-safari-annoyances-network.json', []);
  writeJSONPlaceholder('dnr-safari-tracking-network.json', []);
} finally {
  shelljs.rm('-rf', 'tmp');
}
