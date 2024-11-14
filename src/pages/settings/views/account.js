import { html, store } from 'hybrids';

import { openTabWithUrl } from '/utils/tabs.js';

import Options from '/store/options.js';
import Session from '/store/session.js';

import {
  ACCOUNT_PAGE_URL,
  SIGNON_PAGE_URL,
  CREATE_ACCOUNT_PAGE_URL,
} from '/utils/api.js';

import assets from '../assets/index.js';

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
        chrome.webNavigation.onCommitted.removeListener(onSuccess);
        chrome.tabs.remove(tab.id);
      }
    };

    const onRemove = (tabId) => {
      if (tabId === tab.id) {
        chrome.webNavigation.onCommitted.removeListener(onSuccess);
        chrome.tabs.onRemoved.removeListener(onRemove);

        // The tab is closed before the background listeners can catch the event
        // so we need to refresh session and trigger sync manually
        store.clear(Session);
        chrome.runtime.sendMessage({ action: 'syncOptions' });

        // Restore the original tab
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
      <settings-page-layout>
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-m">My Account</ui-text>
          </div>
          <settings-card>
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
                      <ui-text type="headline-s"> ${session.name} </ui-text>
                      ${session.contributor &&
                      html`<settings-badge type="primary" uppercase>
                        Contributor
                      </settings-badge>`}
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
                    <ui-text type="headline-s">Join Ghostery</ui-text>
                    <ui-text
                      color="gray-600"
                      type="body-m"
                      mobile-type="body-s"
                    >
                      Sign in or create account on ghostery.com
                    </ui-text>
                  </div>
                  <div layout="row gap">
                    <ui-button type="success">
                      <button onclick="${openGhosteryPage(SIGNON_PAGE_URL)}">
                        Sign in <ui-icon name="arrow-right-s"></ui-icon>
                      </button>
                    </ui-button>
                    <ui-button>
                      <button
                        onclick="${openGhosteryPage(CREATE_ACCOUNT_PAGE_URL)}"
                      >
                        Create Account <ui-icon name="arrow-right-s"></ui-icon>
                      </button>
                    </ui-button>
                  </div>
                `)}
          </settings-card>
          <div layout="grid">
            <ui-toggle
              value="${options.sync}"
              onchange="${html.set(options, 'sync')}"
            >
              <div layout="column grow gap:0.5">
                <div layout="row gap items:center">
                  <ui-icon
                    name="websites"
                    color="gray-600"
                    layout="size:2"
                  ></ui-icon>
                  <ui-text type="headline-xs">Settings Sync</ui-text>
                </div>
                <ui-text type="body-m" mobile-type="body-s" color="gray-600">
                  Saves and synchronizes your custom settings between browsers
                  and devices.
                </ui-text>
              </div>
            </ui-toggle>
          </div>
        </section>
      </settings-page-layout>
    </template>
  `,
};
