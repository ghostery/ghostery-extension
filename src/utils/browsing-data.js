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

export const SCOPE_WEBSITE = 'website';
export const SCOPE_ALL = 'all';

const HOUR = 60 * 60 * 1000;

export const TIME_RANGES = {
  hour: HOUR,
  day: 24 * HOUR,
  week: 7 * 24 * HOUR,
  all: 0,
};
