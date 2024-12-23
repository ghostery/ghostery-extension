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

import getBrowserInfo from '/utils/browser-info.js';
import { SUPPORT_PAGE_URL } from '/utils/urls.js';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'report-broken-page') {
    (async () => {
      try {
        const formData = new FormData();
        const browserInfo = await getBrowserInfo();

        formData.append('support_ticket[user_name]', '');
        formData.append('support_ticket[user_email]', msg.email);
        formData.append(
          'support_ticket[subject]',
          `[GBE] Broken page report: ${msg.url}`,
        );
        formData.append('support_ticket[message]', msg.description);
        formData.append('support_ticket[selected_browser]', browserInfo.name);
        formData.append('support_ticket[browser_version]', browserInfo.version);
        formData.append('support_ticket[selected_os]', browserInfo.osVersion);
        formData.append('support_ticket[os_version]', '');

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
