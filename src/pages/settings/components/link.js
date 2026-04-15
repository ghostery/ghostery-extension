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

import { html } from 'hybrids';

export default {
  href: '',
  icon: '',
  render: ({ href, icon }) => html`
    <template layout="contents">
      <ui-action>
        <a href="${href}" layout="block">
          <settings-card>
            <div id="content" layout="row gap:2 items:center">
              ${icon &&
              html`
                <div id="icon" layout="row center padding self:start">
                  <ui-icon name="${icon}" color="brand-primary" layout="size:3"></ui-icon>
                </div>
              `}
              <div id="description" layout="column gap:2px grow">
                <ui-text type="headline-xs" color="primary">
                  <slot></slot>
                </ui-text>
                <slot name="footer"></slot>
              </div>
              <div id="chevron" layout="row center size:4">
                <ui-icon name="chevron-right" color="onbrand" layout="size:2"></ui-icon>
              </div>
            </div>
          </settings-card>
        </a>
      </ui-action>
    </template>
  `.css`
    a {
      container-type: inline-size;
    }

    #icon {
      background: var(--background-brand-primary);
      border-radius: 12px;
    }

    #chevron {
      border-radius: 100px;
      background: var(--background-brand-solid);
    }

    @media (hover: hover) {
      a:hover ui-text {
        text-decoration: underline;
      }
    }

    @container (width < 500px) {
      #content {
        display: grid;
        grid-template-columns: 1fr min-content;
        justify-items: stretch;
      }

      #description {
        grid-area: 2 / 1 / 3 / 3;
      }
    }
  `,
};
