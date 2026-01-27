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

import { isSafari } from './browser-info.js';
import { debugMode, stagingMode } from './debug.js';

export const GHOSTERY_DOMAIN = debugMode ? 'ghosterystage.com' : 'ghostery.com';

export const TERMS_AND_CONDITIONS_URL = `https://www.${GHOSTERY_DOMAIN}/privacy/ghostery-terms-and-conditions?utm_source=gbe&utm_campaign=onboarding`;
export const HOME_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/`;

export const WTM_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/whotracksme`;
export const SUPPORT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/support`;
export const WHATS_NEW_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/blog/ghostery-extension-v10-5?embed=1&utm_campaign=whatsnew`;

export const PANEL_STORE_PAGE_URL = `${HOME_PAGE_URL}downloads/review?utm_source=gbe&utm_campaign=panel`;
export const REVIEW_STORE_PAGE_URL = `${HOME_PAGE_URL}downloads/review?utm_source=gbe&utm_campaign=review`;

export const BECOME_A_CONTRIBUTOR_PAGE_URL =
  __PLATFORM__ !== 'firefox' && isSafari()
    ? 'ghosteryapp://www.ghostery.com'
    : 'https://www.ghostery.com/become-a-contributor';

export const ENGINE_CONFIGS_ROOT_URL = `https://${stagingMode ? 'staging-' : ''}cdn.ghostery.com/adblocker/configs`;

export const CDN_URL = stagingMode
  ? 'https://staging-cdn.ghostery.com/'
  : 'https://cdn.ghostery.com/';

export const PAUSE_ASSISTANT_LEARN_MORE_URL = `https://www.${GHOSTERY_DOMAIN}/blog/browsing-assistant-user-agent`;
export const TRACKERS_PREVIEW_LEARN_MORE_URL = `https://www.${GHOSTERY_DOMAIN}/blog/introducing-wtm-serp-report`;

export const ZAP_AUTORELOAD_DISABLED_HOSTNAMES = ['youtube.com'];
