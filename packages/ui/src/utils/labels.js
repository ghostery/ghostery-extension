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

import { msg } from 'hybrids';

// Required to force loading localization module before using msg`...`
import '../modules/global/localize.js';

export const categories = {
  advertising: msg`Advertising | Tracker category name`,
  site_analytics: msg`Site Analytics | Tracker category name`,
  consent: msg`Consent Management | Tracker category name - includes trackers used for cookie consent management, allowing websites different levels of tracking user activity`,
  essential: msg`Essential | Tracker category name`,
  hosting: msg`Hosting | Tracker category name`,
  customer_interaction: msg`Customer Interaction | Tracker category name`,
  unidentified: msg`Unidentified | Tracker category name`,
  audio_video_player: msg`Audio/Video Player | Tracker category name`,
  cdn: msg`CDN | Tracker category name`,
  comments: msg`Comments | Tracker category name`,
  email: msg`Email | Tracker category name`,
  extensions: msg`Extensions | Tracker category name`,
  misc: msg`Miscellaneous | Tracker category name`,
  pornvertising: msg`Adult Advertising | Tracker category name`,
  social_media: msg`Social Media | Tracker category name`,
  telemetry: msg`Telemetry | Tracker category name`,
  other: msg`Other | Tracker category name`,
};

export const regions = new Intl.DisplayNames(
  [chrome.i18n.getUILanguage().split('-')[0]],
  { type: 'region' },
);

export const languages = new Intl.DisplayNames(
  [chrome.i18n.getUILanguage().split('-')[0]],
  { type: 'language' },
);
