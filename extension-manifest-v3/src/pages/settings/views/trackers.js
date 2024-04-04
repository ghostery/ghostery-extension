import { html, store } from 'hybrids';

import Options from '/store/options.js';

export default {
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4">
      ${store.ready(options) &&
      html`
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-l" mobile-type="headline-m">
              Tracker database
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              Listed entities may or may not be trackers, meaning not all of
              them are collecting your personal data.
            </ui-text>
            <ui-text
              type="label-m"
              mobile-type="body-m"
              color="primary-700"
              underline
            >
              <a
                href="https://github.com/ghostery/trackerdb"
                rel="noreferrer"
                layout="row gap:0.5"
                target="_blank"
              >
                View trackerdb on GitHub
                <ui-icon name="arrow-right-s"></ui-icon>
              </a>
            </ui-text>
          </div>
        </section>
      `}
    </template>
  `,
};
