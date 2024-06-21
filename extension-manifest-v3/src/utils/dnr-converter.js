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

let documentConverter;
export function createDocumentConverter() {
  const requests = new Map();

  function createIframe() {
    if (documentConverter) return documentConverter;

    window.addEventListener('message', (event) => {
      const requestId = event.data.rules.shift().condition.urlFilter;

      if (__PLATFORM__ === 'safari') {
        event.data.rules = event.data.rules.map(getCompatRule).filter(Boolean);
      }

      requests.get(requestId)(event.data);
      requests.delete(requestId);
    });

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://ghostery.github.io/urlfilter2dnr/');
    iframe.setAttribute('style', 'display: none;');

    documentConverter = new Promise((resolve) => {
      iframe.addEventListener('load', () => resolve(iframe));
      document.head.appendChild(iframe);
    });

    return documentConverter;
  }

  let requestCount = 0;

  return async function convert(filter) {
    const iframe = await createIframe();
    const requestId = `request${requestCount++}`;

    return new Promise((resolve) => {
      requests.set(requestId, resolve);

      iframe.contentWindow.postMessage(
        {
          action: 'convert',
          converter: 'adguard',
          filters: [requestId, filter],
        },
        '*',
      );
    });
  };
}

async function setupOffscreenDocument() {
  const path = 'pages/offscreen/urlfilter2dnr/index.html';
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length) {
    return existingContexts[0];
  }

  await chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
    justification: 'Convert network filters to DeclarativeNetRequest format.',
  });
}

let offscreenDocument;
export function createOffscreenConverter() {
  return async function convert(filter) {
    try {
      if (!offscreenDocument) {
        offscreenDocument = setupOffscreenDocument().then(() => {
          offscreenDocument = true;
        });
      }

      await offscreenDocument;
    } catch (e) {
      return { errors: [e.message], rules: [] };
    }

    return (
      (await chrome.runtime.sendMessage({
        action: 'offscreen:urlfitler2dnr:convert',
        filter,
      })) || { errors: ['failed to initiate offscreen document'], rules: [] }
    );
  };
}

const supportedResourceTypes = [
  'font',
  'image',
  'main_frame',
  'media',
  'ping',
  'script',
  'stylesheet',
  'sub_frame',
  'websocket',
  'xmlhttprequest',
  'other',
];

const supportedActions = ['block', 'allow', 'allowAllRequests'];

function getCompatRule(rule) {
  if (!rule.condition) {
    return null;
  }

  const resourceTypes = rule.condition.resourceTypes?.filter((type) =>
    supportedResourceTypes.includes(type),
  );

  if (
    // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
    rule.condition.regexFilter?.includes('\\d') ||
    rule.condition.regexFilter?.match(/(\{\d*,\d*\}|\{\d+\}|\|)/) ||
    !supportedActions.includes(rule.action.type) ||
    (resourceTypes && resourceTypes.length === 0)
  ) {
    return null;
  }

  const newRule = {
    id: rule.id,
    priority: rule.priority,
    action:
      rule.action.type === 'allowAllRequests' ? { type: 'allow' } : rule.action,
    condition: {
      domainType: rule.condition.domainType,
      resourceTypes,
      domains: (
        rule.condition.initiatorDomains || rule.condition.requestDomains
      )?.map((d) => `*${d}`),
      excludedDomains: (
        rule.condition.excludedInitiatorDomains ||
        rule.condition.excludedRequestDomains
      )?.map((d) => `*${d}`),
      urlFilter: rule.condition.urlFilter,
      regexFilter: rule.condition.regexFilter,
      isUrlFilterCaseSensitive: undefined,
    },
  };

  if (!newRule.condition.urlFilter && !newRule.condition.regexFilter) {
    newRule.condition.urlFilter = '*';
  }

  if (newRule.condition.urlFilter === '*' && !newRule.condition.domainType) {
    newRule.condition.domainType = 'thirdParty';
  }

  if (
    newRule.condition.regexFilter?.startsWith('/') &&
    newRule.condition.regexFilter?.endsWith('/')
  ) {
    newRule.condition.regexFilter = newRule.condition.regexFilter.slice(1, -1);
  }

  return newRule;
}
