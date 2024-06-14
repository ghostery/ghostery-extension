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

import { define, html, dispatch } from 'hybrids';

export default define({
  tag: 'ui-onboarding-serp',
  href: '',
  render: () => html`
    <template layout="block overflow">
      <ui-onboarding-card layout="padding:2">
        <div layout="row items:start gap:2">
          <div layout="relative">
            <ui-icon name="ghosty" color="gray-300" layout="size:4"></ui-icon>
            <ui-icon
              name="alert"
              color="error-500"
              layout="absolute bottom:-1 right:-1"
            ></ui-icon>
          </div>
          <div layout="column gap:1.5">
            <ui-text type="label-l" layout="margin:bottom:-1">
              More ad blocking available
            </ui-text>
            <ui-text color="gray-500">
              Expand Ghostery ad blocking to search engines in a few easy steps.
            </ui-text>
            <div layout="row:wrap gap">
              <ui-button type="success" size="small">
                <button onclick="${(host) => dispatch(host, 'enable')}">
                  Enable now
                </button>
              </ui-button>
              <ui-button type="transparent" size="small">
                <button onclick="${(host) => dispatch(host, 'ignore')}">
                  Ignore
                </button>
              </ui-button>
            </div>
          </div>
        </div>
      </ui-onboarding-card>
    </template>
  `,
});
