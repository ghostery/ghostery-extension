import { html, msg, router, store } from 'hybrids';

import * as labels from '@ghostery/ui/labels';

import TabStats from '/store/tab-stats.js';
import { toggleExceptionDomain } from '/store/tracker-exception.js';

function toggleDomain({ stats, tracker }) {
  toggleExceptionDomain(
    tracker.exception,
    stats.domain,
    tracker.blockedByDefault,
  );
}

function updateException(host, event) {
  store.set(host.tracker.exception, { blocked: event.target.value });
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
  blockedOnSite: ({ stats, tracker }) =>
    store.ready(tracker.exception) &&
    tracker.exception.blockedDomains.includes(stats.domain),
  allowedOnSite: ({ stats, tracker }) =>
    store.ready(tracker.exception) &&
    tracker.exception.trustedDomains.includes(stats.domain),
  content: ({ stats, tracker, blocked, blockedOnSite, allowedOnSite }) => html`
    <template layout="column">
      <gh-panel-dialog>
        <div
          id="gh-panel-company-alerts"
          layout="absolute inset:1 bottom:auto"
        ></div>
        <ui-text slot="header" type="label-l">${tracker.name}</ui-text>

        <ui-text slot="header" type="body-s" color="gray-600">
          ${tracker.company &&
          tracker.company !== tracker.name &&
          tracker.company + ' •'}
          ${labels.categories[tracker.category]}
        </ui-text>
        ${(store.ready(tracker.exception) || store.error(tracker.exception)) &&
        html`
          <div layout="column gap:3">
            <div layout="column gap">
              <div layout="block:center grow">
                <ui-text type="label-l">Protection status</ui-text>
                <ui-text type="body-m" color="gray-500">
                  For all websites
                </ui-text>
              </div>
              <ui-panel-protection-status-toggle
                layout="self:center"
                value="${blocked}"
                tooltip
                onchange="${updateException}"
              ></ui-panel-protection-status-toggle>
            </div>
            <gh-panel-card type="info">
              <ui-text type="label-s" color="primary-700" layout="row gap:0.5">
                <ui-icon name="info-filled"></ui-icon>
                ${msg`Our recommendation for this activity`}:
                ${tracker.blockedByDefault ? msg`Blocked` : msg`Trusted`}
              </ui-text>
            </gh-panel-card>
            <gh-panel-card layout="row gap">
              <div layout="grow">
                <ui-text type="label-m">
                  <!-- Add domain as exception -->
                  Add ${stats.domain} as exception
                </ui-text>
                <ui-text type="body-s" color="gray-500">
                  ${blocked
                    ? msg`Trust on this website`
                    : msg`Block on this website`}
                </ui-text>
              </div>
              ${blocked
                ? html`
                    <ui-toggle
                      value="${allowedOnSite}"
                      onchange="${toggleDomain}"
                      type="status"
                      color="success-500"
                      layout="margin:top:0.5"
                    ></ui-toggle>
                  `
                : html`
                    <ui-toggle
                      value="${blockedOnSite}"
                      onchange="${toggleDomain}"
                      type="status"
                      color="danger-500"
                      layout="margin:top:0.5"
                    ></ui-toggle>
                  `}
            </gh-panel-card>
          </div>
        `}
      </gh-panel-dialog>
    </template>
  `,
};
