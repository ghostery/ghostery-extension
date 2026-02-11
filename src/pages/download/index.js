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

import { saveAs } from '/utils/files.js';

try {
  const searchParams = new URL(location.href).searchParams;

  const url = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!url || !filename) {
    throw new Error('Missing download parameters');
  }

  if (!url.startsWith(`blob:${location.origin}`)) {
    throw new Error('Invalid URL');
  }

  saveAs(url, filename);

  // Close the tab after a reasonable delay, giving the user
  // time to accept the download if needed (usually only once)
  setTimeout(() => window.close(), 30 * 1000);
} catch {
  window.close();
}
