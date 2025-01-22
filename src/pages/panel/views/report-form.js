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

import { html, router, store, msg } from 'hybrids';

import Session from '/store/session.js';
import { getCurrentTab, openTabWithUrl } from '/utils/tabs.js';
import { SUPPORT_PAGE_URL } from '/utils/urls.js';

import ReportConfirm from './report-confirm.js';

const Form = {
  url: '',
  email: '',
  description: '',
  screenshot: false,
  [store.connect]: {
    async get() {
      const [currentTab, session] = await Promise.all([
        getCurrentTab(),
        store.resolve(Session),
      ]);

      const url = currentTab && new URL(currentTab.url);

      return {
        url: url ? `${url.origin}${url.pathname}` : '',
        email: session.email,
      };
    },
    async set(_, values) {
      const error = await chrome.runtime.sendMessage({
        action: 'report-broken-page',
        tab: await getCurrentTab(),
        ...values,
      });

      if (error) throw new Error(error);

      return values;
    },
  },
};

function submit(host, event) {
  try {
    router.resolve(
      event,
      store.submit(host.form).then(() => store.clear(Form)),
    );
  } catch {
    event.preventDefault();
  }
}

export default {
  form: store(Form, { draft: true }),
  render: ({ form }) => html`
    <template layout="column grow shrink">
      <ui-header>
        <div layout="row gap items:center">
          <ui-icon name="report" layout="size:2"></ui-icon>
          Report a broken page
        </div>
        <ui-action slot="actions">
          <a href="${router.backUrl()}">
            <ui-icon name="close" color="gray-800" layout="size:3"></ui-icon>
          </a>
        </ui-action>
      </ui-header>
      <panel-container>
        ${store.ready(form) &&
        html`
          <form
            layout="column gap:2 padding:2"
            onsubmit="${submit}"
            action="${router.url(ReportConfirm)}"
          >
            ${store.error(form) &&
            !store.pending(form) &&
            html`
              <div layout="row gap">
                <ui-icon
                  name="warning"
                  layout="inline size:2"
                  color="danger-700"
                ></ui-icon>
                <ui-text type="body-s" color="danger-700">
                  ${store.error(form)?.message}
                </ui-text>
              </div>
            `}
            <ui-text layout="width:::40">
              Inform us about a broken page experience, we’re happy to
              investigate and fix.
            </ui-text>
            <ui-line></ui-line>
            <ui-text
              type="label-s"
              color="primary-700"
              style="word-break: break-all"
              layout="width:::40"
            >
              ${form.url}
            </ui-text>
            <ui-input>
              <textarea
                placeholder="Please describe the issue"
                rows="4"
                autocomplete="off"
                style="resize: vertical"
                oninput="${html.set(form, 'description')}"
                maxlength="4000"
                layout="::ui:font:body-s"
                required
              ></textarea>
            </ui-input>
            <ui-input>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                layout="::ui:font:body-s"
                value="${form.email}"
                oninput="${html.set(form, 'email')}"
                required
              />
            </ui-input>
            <label layout="row gap items:center">
              <input
                type="checkbox"
                onchange="${html.set(form, 'screenshot')}"
              />
              <ui-text type="body-s">
                Include a screenshot of the current page
              </ui-text>
            </label>
            <ui-text
              type="body-s"
              color="gray-600"
              underline
              layout="width:::40"
            >
              ${msg.html`
                If the issue persists or you’d like to report a different page as broken,
                please use the report form on <a href="${SUPPORT_PAGE_URL}" onclick="${openTabWithUrl}">ghostery.com</a>.
              `}
            </ui-text>
            <ui-line></ui-line>
            <div layout="grid:2 gap:1">
              <ui-button type="transparent" disabled="${store.pending(form)}">
                <a href="${router.backUrl()}">Cancel</a>
              </ui-button>
              <ui-button type="primary" disabled="${store.pending(form)}">
                <button type="submit">Send</button>
              </ui-button>
            </div>
          </form>
        `}
      </panel-container>
    </template>
  `,
};
