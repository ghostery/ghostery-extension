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

import { html, msg, router, store } from 'hybrids';
import { ACTION_PAUSE_ASSISTANT } from '@ghostery/config';

import { dismissAction } from '/store/config.js';
import ElementPickerSelectors from '/store/element-picker-selectors.js';
import Options, { MODE_ZAP } from '/store/options.js';

const MAX_DOMAIN_LENGTH = 20;

// Removes the protection status with exceptions and content blocks
export const SCOPE_FULL = 'full';
// Removes only the paused state, keeping exceptions and content blocks
export const SCOPE_PAUSE = 'pause';

function remove({ options, domain, scope }, event) {
  event.preventDefault();

  if (scope === SCOPE_PAUSE) {
    router.resolve(event, store.set(options, { paused: { [domain]: null } }));
    return;
  }

  const exceptions = Object.entries(options.exceptions).reduce((acc, [id, exception]) => {
    if (!exception.domains.includes(domain)) return acc;

    const domains = exception.domains.filter((d) => d !== domain);
    acc[id] = exception.global || domains.length > 0 ? { ...exception, domains } : null;

    return acc;
  }, {});

  if (options.paused[domain]?.assist) dismissAction(domain, ACTION_PAUSE_ASSISTANT);

  store.set(ElementPickerSelectors, { hostnames: { [domain]: null } });

  router.resolve(
    event,
    store.set(options, {
      [options.mode === MODE_ZAP ? 'zapped' : 'paused']: { [domain]: null },
      exceptions,
    }),
  );
}

export default {
  [router.connect]: { dialog: true },
  domain: '',
  shortDomain: ({ domain }) =>
    domain.length > MAX_DOMAIN_LENGTH ? `${domain.slice(0, MAX_DOMAIN_LENGTH)}...` : domain,
  scope: SCOPE_FULL,
  options: store(Options),
  render: ({ shortDomain, scope }) => html`
    <template layout>
      <settings-dialog closable>
        <form
          action="${router.backUrl()}"
          onsubmit="${remove}"
          layout="column gap:2 width::0"
          data-qa="form:website:remove"
        >
          <ui-text type="label-l" layout="block:center margin:bottom">
            ${scope === SCOPE_PAUSE ? html`Resume Protection` : html`Remove Website`}
          </ui-text>
          ${
            scope === SCOPE_PAUSE
              ? html`
                  <ui-text type="body-m" color="secondary">
                    ${msg.html`Are you sure you want to resume protection for the <strong>${shortDomain}</strong> website?`}
                  </ui-text>
                  <ui-text type="body-s" color="tertiary">
                    Ghostery will resume blocking on it, while its exceptions and blocked elements
                    stay untouched.
                  </ui-text>
                `
              : html`
                  <ui-text type="body-m" color="secondary">
                    ${msg.html`Are you sure you want to remove the <strong>${shortDomain}</strong> website?`}
                  </ui-text>
                  <ui-text type="body-s" color="tertiary">
                    Its protection status, exceptions and blocked elements will be restored to the
                    default settings.
                  </ui-text>
                `
          }
          <div layout="grid:2 gap">
            <ui-button>
              <a href="${router.backUrl()}" tabindex="2">Cancel</a>
            </ui-button>
            <ui-button type="danger" data-qa="button:website:remove:confirm">
              <button type="submit" tabindex="1">Remove</button>
            </ui-button>
          </div>
        </form>
      </settings-dialog>
    </template>
  `,
};
