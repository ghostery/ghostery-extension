import { html, store, router, msg } from 'hybrids';

import { openTabWithUrl } from '/utils/tabs.js';

import Options from '/store/options.js';
import Session from '/store/session.js';

import {
  ACCOUNT_PAGE_URL,
  SIGNON_PAGE_URL,
  CREATE_ACCOUNT_PAGE_URL,
} from '/utils/api.js';

import assets from '../assets/index.js';
import Preview from './preview.js';

const PREVIEWS = {
  'sync': {
    src: assets['sync'],
    title: msg`Settings Sync`,
    description: msg`Save and synchronize your custom settings between browsers and devices.`,
  },
};

function openGhosteryPage(url) {
  return async () => {
    const currentTab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    let tab;
    const onSuccess = (details) => {
      if (
        details.tabId === tab.id &&
        details.url.startsWith(ACCOUNT_PAGE_URL)
      ) {
        chrome.tabs.remove(tab.id);
        chrome.webNavigation.onCommitted.removeListener(onSuccess);
      }
    };

    const onRemove = (tabId) => {
      if (tabId === tab.id) {
        chrome.webNavigation.onCommitted.removeListener(onSuccess);
        chrome.tabs.onRemoved.removeListener(onRemove);

        store.clear(Session);
        chrome.tabs.update(currentTab[0].id, { active: true });
      }
    };

    chrome.tabs.onRemoved.addListener(onRemove);
    chrome.webNavigation.onCommitted.addListener(onSuccess);

    tab = await chrome.tabs.create({ url });
  };
}

export default {
  options: store(Options),
  session: store(Session),
  render: ({ options, session }) => html`
    <template layout="contents">
      <gh-settings-page-layout>
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-l" mobile-type="headline-m">
              My Account
            </ui-text>
          </div>
          <gh-settings-card>
            <img
              src="${assets[
                store.ready(session) && session.user ? 'shield' : 'contribution'
              ]}"
              layout="size:20"
              alt="Contribution"
              slot="picture"
            />
            ${store.ready(session) &&
            (session.user
              ? html`
                  <div layout="column gap:0.5 margin:bottom:2">
                    <ui-text type="label-m" color="gray-600"
                      >You are signed in as:</ui-text
                    >
                    <div layout="row items:center gap:2">
                      <ui-text type="headline-m"> ${session.name} </ui-text>
                      ${session.contributor &&
                      html`<gh-settings-badge type="primary" uppercase>
                        Contributor
                      </gh-settings-badge>`}
                    </div>
                    <ui-text type="body-m" color="gray-600"
                      >${session.email}</ui-text
                    >
                  </div>
                  <div layout="row gap">
                    <ui-button>
                      <a href="${ACCOUNT_PAGE_URL}" onclick="${openTabWithUrl}">
                        Account details <ui-icon name="arrow-right-s"></ui-icon>
                      </a>
                    </ui-button>
                  </div>
                `
              : html`
                  <div>
                    <ui-text type="headline-m">Join Ghostery</ui-text>
                    <ui-text color="gray-500">
                      Sign in or create account on ghostery.com
                    </ui-text>
                  </div>
                  <div layout="row gap">
                    <ui-button type="success">
                      <button onclick="${openGhosteryPage(SIGNON_PAGE_URL)}">
                        Sign in <ui-icon name="arrow-right-s"></ui-icon>
                      </button>
                    </ui-button>
                    <ui-button type="outline">
                      <button
                        onclick="${openGhosteryPage(CREATE_ACCOUNT_PAGE_URL)}"
                      >
                        Create Account <ui-icon name="arrow-right-s"></ui-icon>
                      </button>
                    </ui-button>
                  </div>
                `)}
          </gh-settings-card>

          <div layout="column gap:4" layout@768px="gap:5">
            <div layout="row items:start gap:2" layout@768px="gap:5">
              <a href="${router.url(Preview, PREVIEWS['sync'])}">
                <gh-settings-help-image>
                  <img src="${assets.sync_small}" alt="Sync" />
                </gh-settings-help-image>
              </a>
              <div
                layout="column gap:2"
                layout@768px="row items:center gap:5 grow"
              >
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s">Settings Sync</ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Save and synchronize your custom settings between browsers
                    and devices.
                  </ui-text>
                </div>
                ${store.ready(session) &&
                html`
                  <ui-toggle
                    disabled="${!session.user}"
                    value="${session.user && options.sync}"
                    onchange="${session.user && html.set(options, 'sync')}"
                  ></ui-toggle>
                `}
              </div>
            </div>
          </div>
        </section>
      </gh-settings-page-layout>
    </template>
  `,
};
