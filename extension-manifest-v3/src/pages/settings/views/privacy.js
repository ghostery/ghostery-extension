import { html, store } from 'hybrids';

import Options from '/store/options.js';

import assets from '../assets/index.js';

function toggleNeverConsent(host) {
  store.set(host.options, {
    dnrRules: {
      annoyances: !host.options.dnrRules.annoyances,
    },
    autoconsent: null,
  });
}

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="block overflow:scroll">
      ${store.ready(options) &&
      html`
        <div layout="column gap:4">
          <ui-text
            type="headline-l"
            mobile-type="headline-m"
            layout@992px="margin:bottom"
          >
            Global Settings for Privacy Protection
          </ui-text>
          <section layout="column gap:4" layout@768px="gap:5">
            <div layout="column gap:0.5">
              <ui-text type="headline-m" mobile-type="headline-s">
                Manage your Ghostery Privacy Protection
              </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                Ghostery protects your privacy by detecting and neutralizing
                different types of data collectors, from ads to trackers and
                cookie popups. You can manage the functionality of these privacy
                components to your liking. We recommend keeping them ON at all
                times.
              </ui-text>
            </div>
            <div layout="row gap:2" layout@768px="gap:5">
              <a href="#">
                <ui-settings-help-image layout="size:12:8 shrink:0">
                  <img src="${assets.ad_blocking_small}" alt="Ad-Blocking" />
                </ui-settings-help-image>
              </a>
              <div
                layout="column gap:2"
                layout@768px="row items:center gap:5 grow"
              >
                <div layout="column gap:0.5 grow">
                  <ui-text type="headline-s">Ad-Blocking</ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Declutters the web for you/eliminates ads on the websites
                    you visit, offering a calm, safe and private internet.
                  </ui-text>
                </div>
                <ui-settings-toggle
                  value="${options.dnrRules.ads}"
                  onchange="${html.set(options, 'dnrRules.ads')}"
                ></ui-settings-toggle>
              </div>
            </div>
            <div layout="row gap:2" layout@768px="gap:5">
              <a href="#">
                <ui-settings-help-image layout="size:12:8 shrink:0">
                  <img
                    src="${assets.anti_tracking_small}"
                    alt="Anti-Tracking"
                  />
                </ui-settings-help-image>
              </a>
              <div
                layout="column gap:2"
                layout@768px="row items:center gap:5 grow"
              >
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s">Anti-Tracking</ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Ghostery’s AI driven Anti-Tracking technology prevents
                    various tracking techniques (should we mention them to make
                    an impression and educate?) securing your digital privacy
                    while browsing the web.
                  </ui-text>
                </div>
                <ui-settings-toggle
                  value="${options.dnrRules.tracking}"
                  onchange="${html.set(options, 'dnrRules.tracking')}"
                ></ui-settings-toggle>
              </div>
            </div>
            <div layout="row gap:2" layout@768px="gap:5">
              <a href="#">
                <ui-settings-help-image layout="size:12:8 shrink:0">
                  <img
                    src="${assets.never_consent_small}"
                    alt="Never-Consent"
                  />
                </ui-settings-help-image>
              </a>
              <div
                layout="column gap:2"
                layout@768px="row items:center gap:5 grow"
              >
                <div layout="column grow gap:0.5">
                  <ui-text type="headline-s">Never-Consent</ui-text>
                  <ui-text type="body-l" mobile-type="body-m" color="gray-600">
                    Removes intrusive cookie popups and expresses dissent to
                    online tracking. You can browse the web without worrying
                    about cookie consent dialogues or privacy violations.
                  </ui-text>
                </div>
                <ui-settings-toggle
                  value="${options.dnrRules.annoyances}"
                  onchange="${toggleNeverConsent}"
                ></ui-settings-toggle>
              </div>
            </div>
          </section>

          <gh-settings-devtools></gh-settings-devtools>
        </div>
      `}
    </template>
  `,
};
