import { define, html, store, msg, router } from 'hybrids';

import Options from '/store/options.js';
import Stats from '/store/stats.js';

import sleep from '../assets/sleep.svg';

import Menu from './menu.js';
import Company from './company.js';

const NOTIFICATIONS = [
  {
    icon: 'panel-help',
    text: msg`Ghostery is not fully functional because of the browser’s restrictions and missing additional permissions.`,
    actions: [
      {
        text: msg`Get Help`,
        url: 'https://www.ghostery.com/support/',
      },
    ],
  },
  {
    icon: 'panel-heart',
    text: msg`Hey, do you enjoy Ghostery and want to support our work?`,
    actions: [
      {
        text: msg`Become a contributor`,
        url: 'https://www.ghostery.com/become-a-contributor/',
      },
    ],
  },
];

const UNPROTECTED_SITES_URL = chrome.runtime.getURL(
  '/pages/options/index.html',
);

function getPauseNotification(domain, paused, pauseType) {
  if (paused) {
    switch (pauseType) {
      case 0:
        return msg.html`${domain} removed from <a href="${UNPROTECTED_SITES_URL}" target="_blank">unprotected sites</a>`;
      default:
        return msg`${domain} was unpaused`;
    }
  }

  switch (pauseType) {
    case 0:
      return msg.html`${domain} added to <a href="${UNPROTECTED_SITES_URL}" target="_blank">unprotected sites</a>`;
    case 1:
      return msg`${domain} paused for 1 hour`;
    case 24:
      return msg`${domain} paused for 24 hours`;
  }
}

async function togglePause(host, event) {
  const { paused, pauseType } = event.target;

  // Update options
  await store.set(host.options, {
    paused: paused
      ? host.options.paused.filter((p) => p.id !== host.stats.domain)
      : [
          ...host.options.paused,
          {
            id: host.stats.domain,
            revokeAt: pauseType && Date.now() + 60 * 60 * 1000 * pauseType,
          },
        ],
  });

  // Reload current tab
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  chrome.tabs.reload(tab.id);

  // Show alert message
  Array.from(host.querySelectorAll('#gh-panel-alerts gh-panel-alert')).forEach(
    (el) => el.parentNode.removeChild(el),
  );

  const wrapper = document.createDocumentFragment();

  html`
    <gh-panel-alert type="success" slide autoclose="5">
      ${getPauseNotification(host.stats.domain, paused, pauseType)}
    </gh-panel-alert>
  `(wrapper);

  host.querySelector('#gh-panel-alerts').appendChild(wrapper);
}

export default define({
  [router.connect]: {
    stack: [Menu, Company],
  },
  tag: 'gh-panel-home-view',
  options: store(Options),
  stats: store(Stats),
  notification: ({ options }) =>
    store.ready(options) && NOTIFICATIONS[options.terms ? 1 : 0],
  content: ({ options, stats, notification }) => html`}
    <template layout="column">
      <section
        id="gh-panel-alerts"
        layout="fixed inset:1 bottom:auto layer:2"
      ></section>
      ${store.ready(options) &&
      (store.ready(stats) || store.error(stats)) &&
      html`
        ${options.terms
          ? html`
              <ui-header layout="fixed top left width:full">
                ${store.ready(stats) && stats.domain}
                <ui-action slot="icon">
                  <a href="https://www.ghostery.com" target="_blank">
                    <ui-icon name="logo"></ui-icon>
                  </a>
                </ui-action>
                <ui-action slot="actions">
                  <a href="${router.url(Menu)}">
                    <ui-icon name="panel-menu" color="gray-900"></ui-icon>
                  </a>
                </ui-action>
              </ui-header>
            `
          : html`
              <gh-panel-alert
                type="info"
                icon="logo"
                layout="absolute inset bottom:auto margin"
              >
                Additional Permissions Required <br />
                <a
                  href="${chrome.runtime.getURL(
                    '/pages/onboarding/index.html',
                  )}"
                  target="_blank"
                >
                  Enable Ghostery
                </a>
              </gh-panel-alert>
            `}
        <section layout="column margin:7:0:1">
          ${store.error(stats) &&
          html`
            <div layout="column items:center gap margin:2:0:3">
              <img src="${sleep}" alt="Ghosty sleeping" layout="size:160px" />
              <ui-text
                type="label-l"
                layout="block:center width:::60% margin:top"
              >
                Ghostery has nothing to do on this page
              </ui-text>
              <ui-text type="body-m" layout="block:center width:::70%">
                Try to open this panel on a different browser tab
              </ui-text>
            </div>
          `}
          ${store.ready(stats) &&
          html`
            ${options.terms
              ? options.paused &&
                html`
                  <gh-panel-pause
                    onaction="${togglePause}"
                    paused="${options.paused.find(
                      ({ id }) => id === stats.domain,
                    )}"
                  ></gh-panel-pause>
                `
              : html`
                  <gh-panel-button>
                    <a
                      href="${chrome.runtime.getURL(
                        '/pages/onboarding/index.html',
                      )}"
                      target="_blank"
                      layout="row center gap:0.5"
                    >
                      <ui-icon name="panel-pause"></ui-icon>
                      Enable Ghostery
                    </a>
                  </gh-panel-button>
                `}
            <ui-panel-stats
              domain="${stats.domain}"
              categories="${stats.categories}"
              trackers="${stats.byCategory}"
              dialog="${Company}"
              layout="margin:2"
            >
              <ui-text type="label-m">Trackers found</ui-text>
            </ui-panel-stats>
          `}

          <gh-panel-options>
            <span slot="header">Ghostery global operations</span>
            <ui-text color="inherit">
              <a
                href="${chrome.runtime.getURL(
                  `/pages/${
                    options.terms ? 'options' : 'onboarding'
                  }/index.html`,
                )}"
                target="_blank"
              >
                <gh-panel-options-item
                  icon="panel-ads"
                  enabled="${options.dnrRules.ads}"
                  terms="${options.terms}"
                >
                  Ad-Blocking
                </gh-panel-options-item>
                <gh-panel-options-item
                  icon="panel-tracking"
                  enabled="${options.dnrRules.tracking}"
                  terms="${options.terms}"
                >
                  Anti-Tracking
                </gh-panel-options-item>
                <gh-panel-options-item
                  icon="panel-autoconsent"
                  enabled="${options.dnrRules.annoyances}"
                  terms="${options.terms}"
                >
                  Never-Consent
                </gh-panel-options-item>
              </a>
            </ui-text>
          </gh-panel-options>
          ${notification &&
          html`
            <gh-panel-notification
              icon="${notification.icon}"
              layout="margin:0:2:1"
            >
              <ui-text type="body-s">${notification.text}</ui-text>

              ${notification.actions.map(
                ({ text, url }) => html`
                  <ui-text type="label-s" color="primary-700">
                    <a href="${url}" target="_blank">${text}</a>
                  </ui-text>
                `,
              )}
            </gh-panel-notification>
          `}
        </section>
      `}
    </template>`,
});
