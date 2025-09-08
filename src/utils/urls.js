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

import { isOpera, isEdge, isSafari } from './browser-info.js';
import { debugMode, stagingMode } from './debug.js';

export const GHOSTERY_DOMAIN = debugMode ? 'ghosterystage.com' : 'ghostery.com';

export const HOME_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/`;

export const SIGNON_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/signin`;
export const CREATE_ACCOUNT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/register`;
export const ACCOUNT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/account`;

export const WTM_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/whotracksme`;
export const SUPPORT_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/support`;
export const WHATS_NEW_PAGE_URL = `https://www.${GHOSTERY_DOMAIN}/blog/ghostery-extension-v10-5?embed=1&utm_campaign=whatsnew`;

export const REVIEW_PAGE_URL = (() => {
  if (__PLATFORM__ === 'firefox') return 'https://mygho.st/ReviewFirefoxPanel';

  if (isSafari()) return 'https://mygho.st/ReviewSafariPanel';
  if (isOpera()) return 'https://mygho.st/ReviewOperaPanel';
  if (isEdge()) return 'https://mygho.st/ReviewEdgePanel';

  // Chrome
  return 'https://mygho.st/ReviewChromePanel';
})();

export const BECOME_A_CONTRIBUTOR_PAGE_URL = isSafari()
  ? 'ghosteryapp://www.ghostery.com'
  : 'https://www.ghostery.com/become-a-contributor';

export const ENGINE_CONFIGS_ROOT_URL = `https://${debugMode ? 'staging-' : ''}cdn.ghostery.com/adblocker/configs`;

export const CDN_URL = stagingMode
  ? 'https://staging-cdn.ghostery.com/'
  : 'https://cdn.ghostery.com/';
