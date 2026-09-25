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

import { html, router, store } from 'hybrids';

import CustomFilters from '/store/custom-filters.js';
import Options from '/store/options.js';

function remove({ options, url }, event) {
  event.preventDefault();

  router.resolve(event, store.set(options, { customFilters: { filterLists: { [url]: null } } }));
}

export default {
  [router.connect]: { dialog: true },
  url: '',
  options: store(Options),
  customFilters: store(CustomFilters),
  name: ({ customFilters, url }) =>
    (store.ready(customFilters) && customFilters.filterLists[url]?.name) || '',
  render: ({ url, name }) => html`
    <template layout>
      <settings-dialog closable>
        <form
          action="${router.backUrl()}"
          onsubmit="${remove}"
          layout="column gap:2 width::0"
          data-qa="form:custom-filters:remove-filter-list"
        >
          <ui-text type="label-l" layout="block:center margin:bottom">Remove Filter List</ui-text>
          <div layout="column gap:0.5">
            <ui-text type="label-s" ellipsis>${name || url}</ui-text>
            ${name && html`<ui-text type="body-s" color="secondary" ellipsis>${url}</ui-text>`}
          </div>
          <ui-text type="body-m" color="secondary">
            Are you sure you want to remove this filter list? Its rules will no longer be applied.
          </ui-text>
          <div layout="grid:2 gap">
            <ui-button>
              <a href="${router.backUrl()}" tabindex="2">Cancel</a>
            </ui-button>
            <ui-button type="danger" data-qa="button:custom-filters:remove-filter-list:confirm">
              <button type="submit" tabindex="1">Remove</button>
            </ui-button>
          </div>
        </form>
      </settings-dialog>
    </template>
  `,
};
