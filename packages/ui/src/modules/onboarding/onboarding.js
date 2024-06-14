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

import { define, dispatch, html, router } from 'hybrids';

import Main from './views/main.js';
import OutroSkip from './views/outro-skip.js';
import OutroSuccess from './views/outro-success.js';

export default define({
  tag: 'ui-onboarding',
  platform: '',
  renew: false,
  views: router([Main, OutroSuccess], {
    params: ['platform', 'renew'],
  }),
  state: {
    value: '',
    connect: (host) => {
      function cb(event) {
        switch (event.detail.entry.id) {
          case OutroSkip.tag:
            dispatch(host, 'skip');
            break;
          case OutroSuccess.tag:
            dispatch(host, 'success');
            break;
          default:
            break;
        }
      }

      host.addEventListener('navigate', cb);

      return () => host.removeEventListener('navigate', cb);
    },
  },
  render: ({ views }) => html`
    <template layout="grid height::100%">
      <ui-onboarding-layout>${views}</ui-onboarding-layout>
    </template>
  `.css`
    ui-text a { text-decoration: underline }
  `,
});
