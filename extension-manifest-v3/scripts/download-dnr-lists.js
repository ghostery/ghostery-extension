import shelljs from 'shelljs';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const REPO_URL = 'git@github.com:ghostery/ghostery-dnr-lists.git';
const DNR_LIST_DIR = resolve('src/rule_resources');

shelljs.rm('-rf', 'tmp');
shelljs.rm('-rf', DNR_LIST_DIR);
shelljs.mkdir('-p', DNR_LIST_DIR);

function writeJSONPlaceholder(path, content) {
  writeFileSync(resolve(DNR_LIST_DIR, path), JSON.stringify(content));
}

try {
  const result = shelljs.exec(`git clone ${REPO_URL} tmp/dnr-lists`);
  if (result.code !== 0) {
    throw Error("Couldn't clone repo");
  }

  shelljs.exec('cd tmp/dnr-lists && npm ci && npm start');

  shelljs.cp('-R', 'tmp/dnr-lists/build/*.json', DNR_LIST_DIR);
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
