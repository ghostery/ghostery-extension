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

import { html, dispatch, msg } from 'hybrids';
import * as labels from '@ghostery/ui/labels';

export default {
  name: '',
  description: '',
  size: 0,
  adjusted: 0,
  blocked: 0,
  trusted: 0,
  open: false,
  blockedByDefault: false,
  render: ({
    name,
    description,
    size,
    adjusted,
    open,
    blockedByDefault,
  }) => html`
    <template layout="column gap:2 padding:1.5">
      <header layout="row items:center gap:1.5" layout@768px="gap:2">
        <ui-action>
          <button
            onclick="${(host) => dispatch(host, 'toggle')}"
            layout="block:left row items:center gap:1.5 padding:0.5 grow"
            layout@768px="gap:2"
          >
            <ui-icon
              id="arrow"
              name="arrow-down"
              layout="size:3"
              color="gray-600"
            ></ui-icon>
            <ui-panel-category-icon
              name="${name}"
              layout="size:5 padding"
            ></ui-panel-category-icon>
            <div layout="column gap:0.5">
              <ui-text type="label-l">
                ${labels.categories[name]}<ui-tooltip
                  delay="0"
                  autohide="5"
                  wrap
                  inline
                >
                  <span slot="content" layout="block width:200px">
                    ${description}
                  </span>
                  <ui-icon
                    name="info"
                    color="gray-400"
                    layout="margin:top:1px"
                  ></ui-icon>
                </ui-tooltip>
              </ui-text>
              <div layout="column" layout@768px="row gap">
                <ui-text type="body-s" color="gray-600" layout="width::90px">
                  Activities<span>:</span> ${size}
                </ui-text>
                ${!!adjusted &&
                html`
                  <ui-text type="body-s" color="gray-600" layout="width::90px">
                    <!-- | tracker-list -->Adjusted<span>:</span> ${adjusted}
                  </ui-text>
                `}
              </div>
            </div>
          </button>
        </ui-action>

        <ui-tooltip>
          <span slot="content">
            ${blockedByDefault
              ? msg`Block all (recommended)`
              : msg`Trust all (recommended)`}
          </span>
          <ui-panel-action layout="width:4.5">
            <button onclick="${(host) => dispatch(host, 'clear')}">
              <ui-icon name="refresh"></ui-icon>
            </button>
          </ui-panel-action>
        </ui-tooltip>
      </header>

      ${open && html`<slot></slot> `}
    </template>
  `.css`
    :host {
      border-radius: 8px;
      border: 1px solid var(--ui-color-gray-200);
      background: var(--ui-color-white);
    }

    :host([open]) #arrow {
      transform: rotate(180deg);
    }
  `,
};
