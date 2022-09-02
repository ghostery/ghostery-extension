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

import { define, html, msg } from 'hybrids';

import { getCategoryColor, getCategoryKey } from '../utils/categories.js';

const labels = {
  get advertising() {
    return msg`Advertising | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get audio_video_player() {
    return msg`Audio/Video Player | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get cdn() {
    return msg`CDN | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get comments() {
    return msg`Comments | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get consent() {
    return msg`Consent Management | Includes trackers used for cookie consent management, allowing websites different levels of tracking user activity.`;
  },
  get customer_interaction() {
    return msg`Customer Interaction | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get email() {
    return msg`Email | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get essential() {
    return msg`Essential | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get extensions() {
    return msg`Extensions | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get hosting() {
    return msg`Hosting | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get misc() {
    return msg`Miscellaneous | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get pornvertising() {
    return msg`Adult Advertising | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get site_analytics() {
    return msg`Site Analytics | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get social_media() {
    return msg`Social Media | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
  get unknown() {
    return msg`Unknown | Ghostery organizes tags by category. This is one of several tag categories.`;
  },
};

export default define({
  tag: 'ui-category',
  name: {
    set: (host, value) => getCategoryKey(value),
  },
  bullet: 0,
  count: 0,
  content: ({ name, bullet, count }) => {
    const sizePx = `${bullet}px`;

    return html`
      <template layout="row items:center gap">
        ${!!bullet &&
        html`<div
          layout="shrink:0"
          style=${{
            width: sizePx,
            height: sizePx,
            backgroundColor: getCategoryColor(name),
            borderRadius: sizePx,
          }}
        ></div>`}
        <div layout="grow">${labels[name]}</div>
        ${!!count && html`<div><strong>${count}</strong></div>`}
      </template>
    `;
  },
});
