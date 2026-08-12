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

export const PERIOD_IN_MS = 90 * 24 * 60 * 60 * 1000;

// Set by the background when it opens the panel, so the panel starts with the recap view
export const SESSION_KEY = 'whatsnew:open:panel';

export function getPeriod() {
  const now = Date.now();

  return {
    dateFrom: new Date(now - PERIOD_IN_MS).toISOString().slice(0, 10),
    dateTo: new Date(now).toISOString().slice(0, 10),
  };
}
