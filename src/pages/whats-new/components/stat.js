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

const ICONS = {
  activities: 'search',
  blocked: 'block-s',
  pages: 'globe',
  cookies: 'cookie',
  consents: 'autoconsent-managed',
  modified: 'eye',
};

export default {
  type: { value: 'activities', reflect: true },
  value: '',
  label: '',
  description: '',
  featured: { value: false, reflect: true },
  render: ({ type, value, label, description, featured }) => html`
    <template layout="column gap:3 shrink:0 width:260px" layout@768px="width:310px">
      <div id="header" layout="row items:center gap">
        <div id="icon" layout="row center shrink:0 size:6">
          <ui-icon name="${ICONS[type]}" layout="size:6"></ui-icon>
        </div>
        <ui-text
          mobile-type="display-l"
          type="${featured ? 'display-2xl' : 'display-xl'}"
          translate="no"
        >
          ${value}
        </ui-text>
      </div>
      <div layout="column gap:0.5">
        <ui-text type="headline-s">${label}</ui-text>
        <ui-text type="body-l" color="tertiary">${description}</ui-text>
      </div>
    </template>
  `.css`
    :host {
      background: var(--background-secondary);
      border-radius: 24px;
      padding: 16px;
    }

    :host([type="activities"]) #icon { color: var(--color-wtm-secondary); }
    :host([type="blocked"]) #icon { color: var(--color-danger-secondary); }
    :host([type="pages"]) #icon { color: var(--color-warning-secondary); }
    :host([type="cookies"]) #icon { color: var(--color-warning-primary); }
    :host([type="consents"]) #icon { color: var(--color-success-secondary); }
    :host([type="modified"]) #icon { color: var(--color-brand-secondary); }

    :host([featured]) {
      background: var(--background-wtm-primary);
      padding: 24px;
      gap: 16px;
      width: 300px;
    }

    :host([featured]) #header {
      gap: 16px;
    }

    :host([featured]) #icon {
      width: 80px;
      height: 80px;
      border-radius: 999px;
      background: var(--background-primary);
    }

    @media screen and (min-width: 768px) {
      :host([featured]) {
        width: 400px;
      }
    }
  `,
};
