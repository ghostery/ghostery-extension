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

import Config from '/store/config.js';
import Options, { REPORT_OPTIONS } from '/store/options.js';
import Resources from '/store/resources.js';

import getBrowserInfo from '/utils/browser-info.js';
import { SUPPORT_PAGE_URL } from '/utils/urls.js';
import { isOptionEqual } from '/utils/options-observer.js';

import { tabStats } from './stats.js';

async function getMetadata(tab) {
  let result = '\n------\n';

  // Add options
  result +=
    `Options:\n` +
    Object.entries(await store.resolve(Options))
      .filter(([key]) => REPORT_OPTIONS.includes(key))
      .reduce((acc, [key, value]) => {
        // Skip options that are equal to the default value
        if (key !== 'regionalFilters' && isOptionEqual(Options[key], value)) {
          return acc;
        }

        acc += `* ${key}: `;

        if (typeof value === 'object') {
          acc += Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        } else {
          acc += value;
        }

        return `${acc}\n`;
      }, '');

  // Add checksums of resources
  result +=
    `\nChecksums:\n` +
    Object.entries((await store.resolve(Resources)).checksums)
      .map(([key, value]) => `* ${key}: ${value}`)
      .join('\n') +
    '\n';

  // Add page trackers
  const trackers = tabStats.get(tab.id)?.trackers.map((t) => t.id);
  if (trackers) {
    result += `\nTrackers(${trackers.length}):\n* ${trackers.join('\n* ')}`;
  }

  // Add enabled flags
  const flags = Object.entries((await store.resolve(Config)).flags)
    .filter(([, { enabled }]) => enabled)
    .map(([key]) => `* ${key}`);

  result += `\n\nFlags:\n` + (flags.length ? flags.join('\n') : '* None');

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
        // Fetch CSRF token first
        const csrfResponse = await fetch(`${SUPPORT_PAGE_URL}/csrf_token`);

        if (!csrfResponse.ok) {
          throw new Error('Failed to fetch CSRF token');
        }

        const { csrf_token: csrfToken, csrf_param: csrfParam } =
          await csrfResponse.json();

        const formData = new FormData();
        const browserInfo = await getBrowserInfo();
        const { version } = chrome.runtime.getManifest();

        const email = msg.email || 'noreplay@ghostery.com';
        const domain = parse(msg.url).domain || '';

        // Add CSRF token to form data
        formData.append(csrfParam, csrfToken);

        formData.append('support_ticket[user_name]', email);
        formData.append('support_ticket[user_email]', email);

        let subject = `[GBE] ${sliceWithEllipsis(msg.url, 40)}`;

        if (msg.category) {
          formData.append('support_ticket[category]', msg.category);
          subject += ` (${msg.category})`;
        }

        if (msg.description) {
          subject += ` - ${sliceWithEllipsis(msg.description.trim(), 30)}`;
        }

        formData.append('support_ticket[subject]', subject);

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
