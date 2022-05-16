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

export const colors = {
  advertising: '#cb55cd',
  audio_video_player: '#ef671e',
  cdn: '#43b7c5',
  customer_interaction: '#fdc257',
  essential: '#fc9734',
  misc: '#ecafc2',
  site_analytics: '#87d7ef',
  social_media: '#388ee8',
  hosting: '#e8e8e8',
  pornvertising: '#fb5b8b',
  extensions: '#e2e781',
  comments: '#b0a8ff',
  unknown: '#959595',
  default: '#ffffff30',
  no_tracker: '#94c59e',
};

export const order = [
  'advertising',
  'site_analytics',
  'cdn',
  'audio_video_player',
  'misc',
  'essential',
  'social_media',
  'hosting',
  'customer_interaction',
  'pornvertising',
  'extensions',
  'comments',
  'unknown',
];

export const labels = {
  get advertising() {
    return msg`Advertising | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get audio_video_player() {
    return msg`Audio/Video Player | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get cdn() {
    return msg`CDN`;
  },
  get comments() {
    return msg`Comments | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get customer_interaction() {
    return msg`Customer Interaction | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get email() {
    return msg`Email`;
  },
  get essential() {
    return msg`Essential | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get extensions() {
    return msg`Extensions`;
  },
  get hosting() {
    return msg`Hosting`;
  },
  get misc() {
    return msg`Miscellaneous`;
  },
  get pornvertising() {
    return msg`Adult Advertising | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
};
