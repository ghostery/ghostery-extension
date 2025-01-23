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

import { setLogLevel, describeLoggers } from '@whotracksme/reporting/reporting';

import debug from '/utils/debug.js';
import * as OptionsObserver from '/utils/options-observer.js';

import config from './config.js';
import communication from './communication.js';
import urlReporter from './url-reporter.js';
import webRequestReporter from './webrequest-reporter.js';

(async () => {
  try {
    const key = 'ghosteryReportingLoggerConfig';
    const { [key]: config } = (await chrome.storage.local.get(key)) || {};
    if (config) {
      for (const { level, prefix = '*' } of config) {
        setLogLevel(level, { prefix });
      }
    } else {
      setLogLevel('off');
    }
  } catch (e) {
    console.warn('Failed to apply logger overwrites', e);
  }
})();

OptionsObserver.addListener('terms', function reporting(terms) {
  if (terms) {
    if (webRequestReporter) {
      webRequestReporter.init().catch((e) => {
        console.warn(
          'Failed to initialize request reporting. Leaving the module disabled and continue.',
          e,
        );
      });
    }
    urlReporter.init().catch((e) => {
      console.warn(
        'Failed to initialize urlReporting. Leaving the module disabled and continue.',
        e,
      );
    });
  } else {
    try {
      urlReporter.unload();
    } catch (e) {
      console.error(e);
    }
    try {
      webRequestReporter?.unload();
    } catch (e) {
      console.error(e);
    }
  }
});

debug.WTM = {
  communication,
  urlReporter,
  config,
  webRequestReporter,
  extensionStartedAt: new Date(),
  logging: {
    setLogLevel,
    describeLoggers,
  },
};
