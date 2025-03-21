import { html, store } from 'hybrids';

import { openTabWithUrl } from '/utils/tabs.js';

import Options from '/store/options.js';
import Session from '/store/session.js';

import {
  ACCOUNT_PAGE_URL,
  SIGNON_PAGE_URL,
  CREATE_ACCOUNT_PAGE_URL,
} from '/utils/urls.js';

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
        chrome.webNavigation.onDOMContentLoaded.removeListener(onSuccess);
        chrome.tabs.remove(tab.id);
      }
    };

    const onRemove = (tabId) => {
      if (tabId === tab.id) {
        chrome.webNavigation.onDOMContentLoaded.removeListener(onSuccess);
        chrome.tabs.onRemoved.removeListener(onRemove);

        // The tab is closed before the background listeners can catch the event
        // so we need to refresh session and trigger sync manually
        chrome.runtime.sendMessage({ action: 'syncOptions' });

        // Restore the original tab
        chrome.tabs.update(currentTab[0].id, { active: true });
      }
    };

    chrome.webNavigation.onDOMContentLoaded.addListener(onSuccess);
    chrome.tabs.onRemoved.addListener(onRemove);

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
            <ui-text type="headline-m">My Ghostery</ui-text>
          </div>
          ${store.ready(session) &&
          session.enabled &&
          html`
            <settings-card>
              <img
                src="${assets[
                  store.ready(session) && session.user
                    ? 'shield'
                    : 'contribution'
                ]}"
                layout="size:20"
                alt="Contribution"
                slot="picture"
              />
              ${session.user
                ? html`
                    <div layout="column gap:0.5 margin:bottom:2">
                      <ui-text type="label-m" color="secondary">
                        You are signed in as:
                      </ui-text>
                      <div layout="row items:center gap:2">
                        <ui-text type="headline-m">${session.name}</ui-text>
                        ${session.contributor &&
                        html`<settings-badge type="brand" uppercase>
                          Contributor
                        </settings-badge>`}
                      </div>
                      <ui-text type="body-m" color="secondary">
                        ${session.email}
                      </ui-text>
                    </div>
                    <div layout="row gap">
                      <ui-button type="primary">
                        <a
                          href="${ACCOUNT_PAGE_URL}"
                          onclick="${openTabWithUrl}"
                        >
                          Account details
                          <ui-icon name="arrow-right-s"></ui-icon>
                        </a>
                      </ui-button>
                    </div>
                  `
                : html`
                    <div>
                      <ui-text type="headline-s">Join Ghostery</ui-text>
                      <ui-text
                        color="secondary"
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
                          Create Account
                          <ui-icon name="arrow-right-s"></ui-icon>
                        </button>
                      </ui-button>
                    </div>
                  `}
            </settings-card>
          `}
          <div layout="column gap:4">
            ${store.ready(session) &&
            session.enabled &&
            html`
              <ui-toggle
                value="${options.sync}"
                onchange="${html.set(options, 'sync')}"
              >
                <settings-option>
                  Sync Settings
                  <span slot="description">
                    Saves and synchronizes your custom settings between browsers
                    and devices.
                  </span>
                </settings-option>
              </ui-toggle>
            `}

            <div layout="row gap:2">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-xs">Theme</ui-text>
                <ui-text type="body-m" mobile-type="body-s" color="secondary">
                  Changes application color theme.
                </ui-text>
              </div>
              <ui-input>
                <select
                  value="${options.theme}"
                  onchange="${html.set(options, 'theme')}"
                >
                  <option value="">Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </ui-input>
            </div>
          </div>
        </section>
      </settings-page-layout>
    </template>
  `,
};
