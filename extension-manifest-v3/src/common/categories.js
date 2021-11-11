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

import { t } from './i18n.js';

export function sortCategories(categories) {
  // WTMTrackerWheel.CATEGORY_ORDER is a global from wtm-tracker-wheel.js
  return categories.slice().sort((a, b) => WTMTrackerWheel.CATEGORY_ORDER.indexOf(a) - WTMTrackerWheel.CATEGORY_ORDER.indexOf(b));
}

export function getCategoryName(category) {
  return t(`category_${category}`);
}
