import { define, html, store } from 'hybrids';

import Options from '/store/options.js';

export default define({
  tag: 'gh-settings-whostracksme',
  options: store(Options),
  content: ({ options }) => html`
    <template layout="column gap:4">
      <div layout="column gap" layout@992px="margin:bottom">
        <ui-text type="headline-l" mobile-type="headline-m">
          WhoTracks.me
        </ui-text>
        <ui-text type="body-l" mobile-type="body-m" color="gray-500">
          WhoTracks.Me, operated by Ghostery, is an integral part of Ghostery’s
          AI anti-tracking technology. It is a comprehensive global resource on
          trackers, bringing transparency to web tracking.
        </ui-text>
        <ui-text type="body-l" mobile-type="body-m" color="gray-500">
          It exists thanks to micro-contributions of every Ghostery user who
          chooses to send non-personal information to WhoTracks.Me. The input
          enables Ghostery to provide real-time intel on trackers which in turn
          provides protection to the entire Ghostery community.
        </ui-text>
      </div>
      ${store.ready(options) &&
      html`
        <section layout="column gap:4">
          <div layout="column gap:0.5">
            <ui-text type="headline-m" mobile-type="headline-s">
              Browser Settings
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-500">
              Suspendisse feugiat. Nunc nulla. Vivamus consectetuer hendrerit
              lacus. In ut quam vitae odio lacinia tincidunt. Sed cursus turpis
              vitae tortor.
            </ui-text>
          </div>
          <label layout="row items:center">
            <div layout="column grow">
              <ui-text type="headline-s">Trackers Wheel</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                Praesent egestas tristique nibh. Cras ultricies mi eu turpis
                hendrerit fringilla.
              </ui-text>
            </div>
            <input
              type="checkbox"
              checked="${options.trackerWheel}"
              onchange="${html.set(options, 'trackerWheel')}"
              layout="shrink:0 size:2"
            />
          </label>
        </section>

        <section layout="column gap:2 margin:top:6">
          <div layout="column gap:0.5">
            <ui-text type="headline-l" mobile-type="headline-m">
              Tracker Settings
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-500">
              Vivamus quis mi. Vestibulum ante ipsum primis in faucibus orci
              luctus et ultrices posuere cubilia Curae; Fusce id purus.
            </ui-text>
          </div>
          <label layout="row items:center">
            <div layout="column grow">
              <ui-text type="headline-s">Trackers Preview on SERP</ui-text>
              <ui-text type="body-l" mobile-type="body-m" color="gray-500">
                Praesent egestas tristique nibh. Cras ultricies mi eu turpis
                hendrerit fringilla.
              </ui-text>
            </div>
            <input
              type="checkbox"
              checked="${options.wtmSerpReport}"
              onchange="${html.set(options, 'wtmSerpReport')}"
              layout="shrink:0 size:2"
            />
          </label>
        </section>
      `}
    </template>
  `,
});
