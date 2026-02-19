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

import getBrowserInfo from './browser-info.js';

export function saveAs(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  a.dispatchEvent(new MouseEvent('click'));
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function saveOrOpenTab(url, filename, forceNewTab = false) {
  if (__CHROMIUM__ && forceNewTab) {
    return chrome.tabs.create({
      url: url.startsWith('data:')
        ? url
        : chrome.runtime.getURL(
            'pages/download/index.html?url=' +
              encodeURIComponent(url) +
              '&filename=' +
              encodeURIComponent(filename),
          ),
    });
  }

  return saveAs(url, filename);
}

export async function download({
  data,
  filename,
  type = 'application/json;charset=utf-8;',
  forceNewTab = false,
}) {
  const blob = new Blob([data], { type });

  // Safari on iOS does not support downloading blobs,
  // but it can handle data URLs, so we convert the blob to a data URL in that case.
  if (__CHROMIUM__) {
    const { os } = await getBrowserInfo();

    if (os === 'ios' || os === 'ipados') {
      const fileReader = new FileReader();

      return new Promise((resolve, reject) => {
        fileReader.onload = () => {
          saveOrOpenTab(fileReader.result, filename, forceNewTab);
          resolve();
        };

        fileReader.onerror = reject;
        fileReader.readAsDataURL(blob);
      });
    }
  }

  const url = URL.createObjectURL(blob);
  await saveOrOpenTab(url, filename, forceNewTab);
}
