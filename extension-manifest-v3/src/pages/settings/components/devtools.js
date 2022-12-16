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

import { define, html, store } from 'hybrids';
import Options from '/store/options.js';

const VERSION = chrome.runtime.getManifest().version;

async function asyncAction(event, fn, complete = '') {
  const button = event.currentTarget;
  const el = button.children[0];
  const origText = el.textContent;

  button.disabled = true;
  await fn();

  if (complete) {
    el.innerHTML = complete;

    setTimeout(() => {
      button.disabled = false;
      el.innerHTML = origText;
    }, 2000);
  } else {
    button.disabled = false;
    el.innerHTML = origText;
  }
}

function clearStorage(host, event) {
  asyncAction(
    event,
    async () => {
      // Restore options to default values
      await store.set(Options, null);

      // Clear main local storage
      chrome.storage.local.clear();
    },
    'Storage cleared',
  );
}

export default define({
  tag: 'gh-settings-devtools',
  counter: 0,
  content: ({ counter }) => html`
    <template layout="block">
      ${counter === 5
        ? html`
            <section layout="column gap" translate="no">
              <ui-text
                type="headline-m"
                mobile-type="headline-s"
                layout="margin:bottom"
              >
                Developer tools
              </ui-text>
              <div layout="row">
                <ui-button
                  size="small"
                  type="outline"
                  onclick="${clearStorage}"
                  layout="shrink:0"
                >
                  <button>Clear storage</button>
                </ui-button>
              </div>
            </section>
          `
        : html`
            <ui-text
              type="label-xs"
              color="gray-300"
              layout="block:right margin:top:2"
              onclick="${html.set('counter', counter + 1)}"
              translate="no"
            >
              v${VERSION}
            </ui-text>
          `}
    </template>
  `,
});
