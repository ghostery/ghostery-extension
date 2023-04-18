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

const supportedActions = [
  'block',
  'allow',
  'upgradeScheme',
  'allowAllRequests',
  'redirect',
];

export function getCompatRule(rule) {
  const resourceTypes = rule.condition.resourceTypes?.filter((type) =>
    supportedResourceTypes.includes(type),
  );

  if (
    // Based on https://github.com/w3c/webextensions/issues/344#issuecomment-1430358116
    rule.condition.regexFilter?.match(/(\{\d*,\d*\}|\{\d\}|\|)/) ||
    !supportedActions.includes(rule.action.type) ||
    (resourceTypes && resourceTypes.length === 0)
  ) {
    return null;
  }

  return {
    priority: rule.priority,
    ...(rule.action.type === 'allowAllRequests'
      ? {
          action: { type: 'allow' },
          condition: {
            domains: rule.condition.requestDomains?.map((d) => `*${d}`),
            resourceTypes,
            regexFilter: '.*',
          },
        }
      : {
          action: rule.action,
          condition: {
            isUrlFilterCaseSensitive:
              rule.condition.isUrlFilterCaseSensitive || false,
            domainType: rule.condition.domainType,
            resourceTypes,
            domains: rule.condition.initiatorDomains?.map((d) => `*${d}`),
            excludedDomains: rule.condition.excludedInitiatorDomains?.map(
              (d) => `*${d}`,
            ),
            urlFilter:
              rule.action.type === 'redirect' &&
              rule.condition.urlFilter?.startsWith('||')
                ? rule.condition.urlFilter.slice(2)
                : rule.condition.urlFilter,
            regexFilter:
              rule.condition.regexFilter ||
              (rule.condition.urlFilter ? undefined : '.*'),
          },
        }),
  };
}

export function setupStream(path) {
  const output = createWriteStream(path);

  let currentId = 1;
  let separator = '';

  output.write('[');

  return {
    write: (rule) => {
      rule.id = currentId;
      output.write(separator + JSON.stringify(rule));

      if (!separator) separator = ',';
      currentId += 1;
    },
    close: () => {
      output.write(']');
      output.close();
    },
  };
}
