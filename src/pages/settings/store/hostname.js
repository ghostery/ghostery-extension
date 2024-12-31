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
import { store } from 'hybrids';
import { parse } from 'tldts-experimental';

export default {
  id: true,
  value: '',
  [store.connect]: {
    get: () => null,
    set: (id, model) => {
      const parsed = parse(model.value);
      if (!parsed.hostname && !parsed.isIp) {
        throw 'The value must be a valid hostname or IP address.';
      }
      return {
        ...model,
        value: parsed.hostname,
      };
    },
  },
};
