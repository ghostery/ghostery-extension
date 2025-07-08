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

import getBrowserInfo from '/utils/browser-info.js';
import { SUPPORT_PAGE_URL } from '/utils/urls.js';

import { tabStats } from './stats.js';
import { parse } from 'tldts-experimental';

async function getMetadata(tab) {
  let result = '\n------\n';

  // Send only not-private options
  const options = Object.fromEntries(
    Object.entries(await store.resolve(Options)).filter(([key]) =>
      SYNC_OPTIONS.includes(key),
    ),
  );

  result += `${JSON.stringify(options, null, 2)}\n\n`;

  const trackers = tabStats.get(tab.id)?.trackers.map((t) => t.id);
  if (trackers) {
    result += `Trackers(${trackers.length}): ${trackers.join(', ')}`;
  }

  return result;
}

function sliceWithEllipsis(str, maxLength) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...';
  }
  return str;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'report-broken-page') {
    (async () => {
      try {
        const formData = new FormData();
        const browserInfo = await getBrowserInfo();
        const { version } = chrome.runtime.getManifest();
        const email = msg.email || 'noreplay@ghostery.com';
        const domain = parse(msg.url).domain || '';

        formData.append('support_ticket[user_name]', email);
        formData.append('support_ticket[user_email]', email);
        formData.append(
          'support_ticket[subject]',
          `[GBE] ${sliceWithEllipsis(msg.url, 40)} - ${sliceWithEllipsis(msg.description.trim(), 30)}`,
        );

        formData.append('support_ticket[version]', version);
        formData.append('support_ticket[selected_browser]', browserInfo.name);
        formData.append('support_ticket[browser_version]', browserInfo.version);
        formData.append('support_ticket[domain]', domain);

        formData.append(
          'support_ticket[selected_os]',
          browserInfo.os !== 'other' ? browserInfo.os : 'other_os',
        );
        formData.append('support_ticket[os_version]', browserInfo.osVersion);

        let description = `${msg.url}\n\n${msg.description.trim()}${await getMetadata(msg.tab)}`;

        formData.append(
          'support_ticket[message]',
          sliceWithEllipsis(description, 5000),
        );

        if (msg.screenshot) {
          const screenshot = await chrome.tabs.captureVisibleTab(null, {
            format: 'jpeg',
            quality: 100,
          });
          formData.append(
            'support_ticket[screenshot]',
            await fetch(screenshot).then((res) => res.blob()),
            'screenshot.jpeg',
          );
        }

        await fetch(SUPPORT_PAGE_URL, {
          method: 'POST',
          body: formData,
        }).then((res) => {
          if (!res.ok || res.status > 204) {
            throw new Error(
              `Sending report has failed with status: ${res.status}`,
            );
          }
        });

        sendResponse();
      } catch (e) {
        sendResponse(e.message);
      }
    })();

    return true;
  }

  return false;
});
