/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { convertWithAdguard } from '@ghostery/urlfilter2dnr';
import { convert } from './dnr-converter-safari.js';

async function asyncConvert(filter) {
  let { rules, errors } = await convertWithAdguard([filter]);

  rules =
    __PLATFORM__ === 'safari'
      ? rules
          .map((r) => {
            try {
              return convert(r);
            } catch (e) {
              errors.push(e);
            }
          })
          .filter(Boolean)
      : rules;

  return { rules, errors };
}

export function createDocumentConverter() {
  return asyncConvert;
}

export function createOffscreenConverter() {
  return asyncConvert;
}
