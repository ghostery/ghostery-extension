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

import { dispatch, html } from 'hybrids';

function copy(host) {
  navigator.clipboard.writeText(host.textContent.trim());
  dispatch(host, 'copy');
}

export default {
  value: (host) => host.textContent.trim(),
  render: ({ value }) => html`
    <template layout="contents">
      <ui-action>
        <button onclick="${copy}" layout="block padding margin:-1">
          <ui-tooltip position="bottom" delay="0.5" autohide="0">
            <div layout="row content:space-between items:center gap:0.5">
              <ui-text id="full" type="body-s" color="secondary" ellipsis>
                <slot></slot>
              </ui-text>
              <ui-icon name="copy" layout="shrink:0"></ui-icon>
            </div>
            <div slot="content" id="tooltip">${value}</div>
          </ui-tooltip>
        </button>
      </ui-action>
    </template>
  `.css`
    ui-icon {
      color: var(--color-tertiary);
    }

    #tooltip {
      width: max-content;
      max-width: 80vw;
      text-wrap: wrap;
      word-break: break-all;
    }

    @media (hover: hover) {
      button:hover ui-text, button:hover ui-icon {
        color: var(--color-brand-primary);
      }
    }
  `,
};
