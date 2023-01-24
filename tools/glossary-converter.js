/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2023 Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import path from 'node:path';
import fs from 'node:fs';
import { parse, stringify } from 'csv/sync';


const [ , , ...args ] = process.argv;

const force = args.find(arg => arg === '--force');
const help = args.find(arg => arg === '--help');
const dry = args.find(arg => arg === '--dry');

const log = (...messages) => {
  if (dry) {
    return;
  }
  console.log(...messages);
}

if (help || args.length === 0) {
  console.log(`
    Converts Transifex glossary into TextMasters format

    Example of usage:
      npm run glossary-converter -- ~/Downloads/glossary-transifex.csv glossary-textmasters.csv

    Possible options:
      --help: prints this message
      --force: overwrite output file
      --dry: prints output to stdout
  `);
  process.exit(0);
}

/* CHECK INPUT */

const inputFilepath = args[0];
if (!inputFilepath) {
  throw new Error('First argument must be the filepath to Transifex glossary');
}

const inputAbsFilepath = path.resolve(process.cwd(), inputFilepath);
log('Input filepath:', inputAbsFilepath);
if (!fs.existsSync(inputAbsFilepath)) {
  throw new Error(`Transifex glossary file with a path '${inputAbsFilepath}' does not exist`);
}

/* READ INPUT */

const inputCSV = parse(fs.readFileSync(inputAbsFilepath, {}).toString(), {
  columns: true,
});

/* GENERATE OUTPUT */

const MAPPING = {
  'en-us': 'term',
  'de-de': 'translation_de',
  'es-es': 'translation_es',
  'fr-fr': 'translation_fr',
  'hu-hu': 'translation_hu',
  'it-it': 'translation_it',
  'ja-jp': 'translation_ja',
  'ko-kr': 'translation_ko',
  'nl-nl': 'translation_nl',
  'pl-pl': 'translation_pl',
  'pt-pt': 'translation_pt',
  'pt-br': 'translation_pt',
  'ru-ru': 'translation_ru',
  'zh-cn': 'translation_zh_cn',
  'zh-tw': 'translation_zh_tw',
};

const output = stringify([
  Object.keys(MAPPING),
  ...inputCSV.map(term => Object.values(MAPPING).map(key => term[key])),
]);

/* WRITE OUTPUT */

if (dry) {
  console.log(output);
} else {
  const outputFilepath = args[1];
  if (!outputFilepath) {
    throw new Error('Second argument must be the output filepath');
  }

  const outputAbsFilepath = path.resolve(process.cwd(), outputFilepath);
  log('Output filepath:', outputAbsFilepath);
  if (!force && fs.existsSync(outputAbsFilepath)) {
    throw new Error(`Output file must not exist`);
  }
  if (!fs.existsSync(path.dirname(outputAbsFilepath))) {
    throw new Error('Output folder must exist');
  }

  fs.writeFileSync(outputAbsFilepath, output);

  log('\nConversion successful');
}
