import { define, html, store } from 'hybrids';

import Options from '/store/options.js';

function toggleNeverConsent(host, event) {
  const { checked } = event.target;

  store.set(host.options, {
    dnrRules: {
      annoyances: checked,
    },
    autoconsent: null,
  });
}

export default define({
  tag: 'gh-settings-privacy',
  options: store(Options),
  devtools: true,
  content: ({ options }) => html`
    <template layout="block">
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
          <section layout="column gap:3">
            <div layout="column gap:0.5">
              <ui-text type="headline-m" mobile-type="headline-s">
                Manage your Ghostery Privacy Protection
              </ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                Ghostery protects your privacy by detecting and neutralizing
                different types of data collectors, from ads to trackers and
                cookie popups. You can manage the functionality of these privacy
                components to your liking. We recommend keeping them ON at all
                times.
              </ui-text>
            </div>
            <label layout="row items:center">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Ad-Blocking</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                  Declutters the web for you/eliminates ads on the websites you
                  visit, offering a calm, safe and private internet.
                </ui-text>
              </div>
              <input
                type="checkbox"
                checked="${options.dnrRules.ads}"
                onchange="${html.set(options, 'dnrRules.ads')}"
                layout="shrink:0 size:2"
              />
            </label>
            <label layout="row items:center">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Anti-Tracking</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                  Ghostery’s AI driven Anti-Tracking technology prevents various
                  tracking techniques (should we mention them to make an
                  impression and educate?) securing your digital privacy while
                  browsing the web.
                </ui-text>
              </div>
              <input
                type="checkbox"
                checked="${options.dnrRules.tracking}"
                onchange="${html.set(options, 'dnrRules.tracking')}"
                layout="shrink:0 size:2"
              />
            </label>
            <label layout="row items:center">
              <div layout="column grow gap:0.5">
                <ui-text type="headline-s">Never-Consent</ui-text>
                <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                  Removes intrusive cookie popups and expresses dissent to
                  online tracking. You can browse the web without worrying about
                  cookie consent dialogues or privacy violations.
                </ui-text>
              </div>
              <input
                type="checkbox"
                checked="${options.dnrRules.annoyances}"
                onchange="${toggleNeverConsent}"
                layout="shrink:0 size:2"
              />
            </label>
          </section>

          <gh-settings-devtools></gh-settings-devtools>
        </div>
      `}
    </template>
  `,
});
