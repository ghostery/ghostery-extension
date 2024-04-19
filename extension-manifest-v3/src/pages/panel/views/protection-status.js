import { html, msg, router, store } from 'hybrids';

import * as labels from '@ghostery/ui/labels';

import { isCategoryBlockedByDefault } from '../../../utils/trackerdb.js';

import TabStats from '/store/tab-stats.js';
import TrackerException from '/store/tracker-exception.js';

function toggleException(type) {
  return ({ exception, stats }) => {
    const list = [...exception[type]];
    const index = list.indexOf(stats.domain);
    if (index !== -1) {
      list.splice(index, 1);
    } else {
      list.push(stats.domain);
    }

    store.set(exception, { [type]: list });
  };
}

export default {
  [router.connect]: { dialog: true },
  stats: store(TabStats),
  trackerId: '',
  tracker: ({ stats, trackerId }) =>
    stats.trackers.find((t) => t.id === trackerId),
  exception: store(TrackerException, { id: 'trackerId' }),
  blockedByDefault: ({ tracker }) =>
    isCategoryBlockedByDefault(tracker.category),
  blockedOnSite: ({ stats, exception }) =>
    store.ready(exception) && exception.blocked.includes(stats.domain),
  allowedOnSite: ({ stats, exception }) =>
    store.ready(exception) && exception.allowed.includes(stats.domain),
  content: ({
    stats,
    tracker,
    exception,
    blockedByDefault,
    blockedOnSite,
    allowedOnSite,
  }) => html`
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
        ${store.ready(exception) &&
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
                value="${exception.overwriteStatus}"
                blockByDefault="${blockedByDefault}"
                tooltip
                onchange="${html.set(exception, 'overwriteStatus')}"
              ></ui-panel-protection-status-toggle>
            </div>
            <gh-panel-card type="info">
              <ui-text type="label-s" color="primary-700" layout="row gap:0.5">
                <ui-icon name="info-filled"></ui-icon>
                ${blockedByDefault
                  ? msg`Our recommendation for this activity: Blocked`
                  : msg`Our recommendation for this activity: Trusted`}
              </ui-text>
            </gh-panel-card>
            <gh-panel-card layout="row gap">
              <div layout="grow">
                <ui-text type="label-m">
                  Add ${stats.domain} as exception
                </ui-text>
                <ui-text type="body-s" color="gray-500">
                  ${blockedByDefault === exception.overwriteStatus
                    ? msg`Block on this website`
                    : msg`Trust on this website`}
                </ui-text>
              </div>
              ${blockedByDefault === exception.overwriteStatus
                ? html`
                    <ui-toggle
                      value="${blockedOnSite}"
                      onchange="${toggleException('blocked')}"
                      type="status"
                      color="danger-500"
                      layout="margin:top:0.5"
                    ></ui-toggle>
                  `
                : html`
                    <ui-toggle
                      value="${allowedOnSite}"
                      onchange="${toggleException('allowed')}"
                      type="status"
                      color="success-500"
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
