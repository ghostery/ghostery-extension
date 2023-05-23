import { html, store } from 'hybrids';

import Options from '/store/options.js';
import Session from '/store/session.js';

const ACCOUNT_URL = 'https://account.ghostery.com/';
const SIGNON_URL = 'https://signon.ghostery.com/';

export default {
  options: store(Options),
  session: store(Session),
  content: ({ options, session }) => html`
    <template layout="column">
      <section layout="column gap:4" layout@768px="gap:5">
        <div layout="column gap" layout@992px="margin:bottom">
          <ui-text type="headline-l" mobile-type="headline-m">
            My Account
          </ui-text>
        </div>
        <ui-text>
          ${store.ready(session) &&
          html`
            <a
              href="${session.user ? ACCOUNT_URL : SIGNON_URL}"
              target="_blank"
              layout="row gap items:center"
            >
              ${session.user
                ? html`
                    <ui-icon name="user" color="nav"></ui-icon>
                    <div layout="column margin:left:2px width::0">
                      <div>${session.name}</div>
                      <ui-text type="body-m" color="gray-600" ellipsis>
                        ${session.email}
                      </ui-text>
                    </div>
                  `
                : html`
                    <ui-icon name="user" color="nav"></ui-icon>
                    Sign in
                  `}
            </a>
          `}
        </ui-text>

        <div layout="column gap:4" layout@768px="gap:5">
          <div layout="row items:start gap:2" layout@768px="gap:5">
            <div
              layout="column gap:2"
              layout@768px="row items:center gap:5 grow"
            >
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Sync settings</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                  Automatically sync settings between your devices.
                </ui-text>
              </div>
              <ui-settings-toggle
                disabled="${!session.user}"
                value="${options.sync}"
                onchange="${html.set(options, 'sync')}"
              ></ui-settings-toggle>
            </div>
          </div>
        </div>
      </section>
    </template>
  `,
};
