import { html, msg, router, store } from 'hybrids';

import * as labels from '@ghostery/ui/labels';

import TabStats from '/store/tab-stats.js';
import {
  toggleExceptionDomain,
  toggleExceptionBlocked,
} from '/store/tracker-exception.js';

function toggleDomain({ stats, tracker }) {
  toggleExceptionDomain(
    tracker.exception,
    stats.hostname,
    tracker.blockedByDefault,
  );
}

function toggleBlocked({ tracker }) {
  toggleExceptionBlocked(tracker.exception, tracker.blockedByDefault);
}

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  trackerId: '',
  tracker: ({ stats, trackerId }) =>
    stats.trackers.find((t) => t.id === trackerId),
  blocked: ({ tracker }) =>
    store.ready(tracker.exception)
      ? tracker.exception.blocked
      : tracker.blockedByDefault,
  status: ({ stats, tracker }) =>
    store.ready(tracker.exception)
      ? tracker.exception.getDomainStatus(stats.hostname)
      : { type: tracker.blockedByDefault ? 'block' : 'trust' },
  render: ({ stats, tracker, blocked, status }) => html`
    <template layout="column">
      <gh-panel-dialog>
        <div
          id="gh-panel-company-alerts"
          layout="absolute inset:1 bottom:auto"
        ></div>
        <ui-text slot="header" type="label-l">${tracker.name}</ui-text>

        <div
          slot="header"
          layout="center row items:center gap overflow margin:0.5:0:0:0"
        >
          <ui-panel-category-icon
            name="${tracker.category}"
            layout="size:2.5"
          ></ui-panel-category-icon>
          <ui-text slot="header" type="body-s" color="gray-600">
            ${tracker.company &&
            tracker.company !== tracker.name &&
            tracker.company + ' •'}
            ${labels.categories[tracker.category]}
          </ui-text>
        </div>
        ${(store.ready(tracker.exception) || store.error(tracker.exception)) &&
        html`
          <div layout="column gap:2">
            <div layout="column items:center gap:0.5">
              <ui-text type="body-s">Protection status</ui-text>
              <div layout="row items:center gap:0.5">
                <ui-icon
                  name="${status.type}-m"
                  color="gray-600"
                  layout="size:2"
                ></ui-icon>
                <ui-text type="label-m">
                  ${status.website
                    ? (status.type === 'trust' &&
                        msg`Trusted on this website`) ||
                      (status.type === 'block' && msg`Blocked on this website`)
                    : (status.type === 'trust' &&
                        msg`Trusted on all websites`) ||
                      (status.type === 'block' && msg`Blocked on all websites`)}
                </ui-text>
              </div>
            </div>
            <div layout="column margin:1:1:0">
              <ui-toggle
                value="${blocked !== tracker.blockedByDefault}"
                onchange="${toggleBlocked}"
                no-label
              >
                <div layout="grow">
                  <ui-text type="label-m">
                    <!-- Add domain as exception -->
                    ${tracker.blockedByDefault
                      ? msg`Trust on all websites`
                      : msg`Block on all websites`}
                  </ui-text>
                  <ui-text type="body-s" color="gray-500">
                    Add exception
                  </ui-text>
                </div>
              </ui-toggle>
            </div>
            <ui-line></ui-line>
            <gh-panel-card layout="column gap">
              <ui-toggle
                value="${status.website}"
                onchange="${toggleDomain}"
                no-label
              >
                <div layout="grow">
                  <ui-text type="label-m">
                    ${blocked
                      ? msg`Trust on this website`
                      : msg`Block on this website`}
                  </ui-text>
                  <ui-text type="body-s" color="gray-500">
                    <!-- Add domain as an exception -->
                    Add ${stats.hostname} as an exception
                  </ui-text>
                </div>
              </ui-toggle>
            </gh-panel-card>
          </div>
        `}
      </gh-panel-dialog>
    </template>
  `,
};
