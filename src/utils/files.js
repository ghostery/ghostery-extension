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

import { getOS } from './browser-info.js';

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

// Safari on iOS/iPadOS does not support downloading blobs, but it can handle data URLs.
async function isBlobDownloadSupported() {
  const os = getOS();
  if (os !== 'ios' && os !== 'ipados') return true;

  // Safari on a touchscreen Mac is detected as iPadOS (the same user-agent and touch points),
  // so the platform info, which is set by the browser build, has the final word.
  try {
    return (await chrome.runtime.getPlatformInfo()).os === 'mac';
  } catch {
    return false;
  }
}

export async function download({
  data,
  filename,
  type = 'application/json;charset=utf-8;',
  forceNewTab = false,
}) {
  const blob = new Blob([data], { type });

  if (__CHROMIUM__ && !(await isBlobDownloadSupported())) {
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

  const url = URL.createObjectURL(blob);
  await saveOrOpenTab(url, filename, forceNewTab);
}
