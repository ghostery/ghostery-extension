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

import { createWriteStream } from 'fs';

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

export function getCompatRule(rule, debug = false) {
  const resourceTypes = rule.condition.resourceTypes?.filter((type) =>
    supportedResourceTypes.includes(type),
  );

  const log = (msg) => debug && console.warn(`${msg}:\n`, JSON.stringify(rule));

  if (
    // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
    rule.condition.regexFilter?.includes('\\d') ||
    rule.condition.regexFilter?.match(/(\{\d*,\d*\}|\{\d+\}|\|)/) ||
    !supportedActions.includes(rule.action.type) ||
    (resourceTypes && resourceTypes.length === 0)
  ) {
    log('Skipping unsupported rule');
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
    log('Fixing missing urlFilter');
  }

  if (newRule.condition.urlFilter === '*' && !newRule.condition.domainType) {
    newRule.condition.domainType = 'thirdParty';
    log('Fixing missing domainType');
  }

  if (
    newRule.condition.regexFilter?.startsWith('/') &&
    newRule.condition.regexFilter?.endsWith('/')
  ) {
    newRule.condition.regexFilter = newRule.condition.regexFilter.slice(1, -1);
    log('Fixing regexp');
  }

  if (newRule.priority > 10000) {
    log('Skipping complex rule');
    return null;
  }

  return newRule;
}

export function setupStream(path) {
  const output = createWriteStream(path);

  let currentId = 1;
  let separator = '';

  output.write('[');

  return {
    write: (rule) => {
      if (!rule) return;

      rule.id = currentId;
      output.write(separator + JSON.stringify(rule));

      if (!separator) separator = ',';
      currentId += 1;
    },
    close: () => {
      output.write(']');
      console.log(`Generated ${currentId} rules`);
      if (currentId > 75000) {
        throw new Error('Too many DNR rules');
      }
      output.close();
    },
  };
}
