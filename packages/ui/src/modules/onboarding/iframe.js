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

import { define, html, msg, dispatch } from 'hybrids';

export default define({
  tag: 'ui-onboarding-iframe',
  trackers: 0,
  render: ({ trackers }) => html`
    <template layout="block">
      <ui-onboarding-card>
        <div layout="row items:start gap:2">
          <div layout="relative">
            <ui-icon name="ghosty" color="gray-300" layout="size:4"></ui-icon>
            <ui-icon
              name="alert"
              color="error-500"
              layout="absolute bottom:-1 right:-1"
            ></ui-icon>
          </div>
          <div layout="column">
            <ui-text type="label-l" layout="margin:bottom:0.5">
              Ghostery is disabled
            </ui-text>
            <ui-text color="gray-500">
              ${msg.html`Trackers detected by Ghostery on this
                      website:&nbsp;${trackers}`}
            </ui-text>
            <ui-text color="gray-500">
              Ghostery can't block them due to missing permissions.
            </ui-text>
            <div layout="row gap margin:top:1.5">
              <ui-button type="success" size="small">
                <button onclick="${(host) => dispatch(host, 'enable')}">
                  Enable Ghostery
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
