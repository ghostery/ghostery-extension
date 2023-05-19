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

import Options, { SYNC_OPTIONS } from '/store/options.js';
import { getUserOptions, setUserOptions } from '/utils/api.js';

let revision;
export async function syncOptions(options) {
  console.log('syncing options', revision === options.revision);

  if (revision === options.revision) return;

  const serverOptions = await getUserOptions();

  if (
    // Not logged in user
    serverOptions === null ||
    // Equal revisions
    serverOptions.revision === options.revision
  ) {
    return;
  }

  try {
    if (serverOptions.revision > options.revision) {
      revision = serverOptions.revision;
      await store.set(Options, serverOptions);
    } else {
      revision = options.revision;

      await setUserOptions(
        SYNC_OPTIONS.reduce((acc, key) => {
          acc[key] = options[key];
          return acc;
        }, {}),
      );
    }
  } catch (e) {
    revision = null;
  }
}
