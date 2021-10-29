
import { html, define, dispatch, store } from '/hybrids.js';
import { getCategoryName } from '../../utils/categories.js';
import { t } from '../../utils/i18n.js';

function toggleShowMore(host) {
  host.shouldShowMore = !host.shouldShowMore;
}

define({
  tag: "category-with-trackers",
  category: '',
  stats: null,
  shouldShowMore: true,
  trackerCounts: ({ stats, category }) => {
    const { trackers } = stats.byCategory[category];
    const _trackerCounts = trackers.reduce((all, current) => ({
      ...all,
      [current.id]: (all[current.id] || 0) + 1
    }), {});
    return Object.keys(_trackerCounts)
      .sort()
      .map(tracker => [tracker, _trackerCounts[tracker]]);
  },
  render: ({ category, stats, shouldShowMore, trackerCounts }) => html`
    <section>
      <category-bullet category=${category} size=${20}></category-bullet>
      <label>${getCategoryName(category)}</label>
      <strong class="count">${stats.byCategory[category].count} ${t('trackers_detected')}</strong>
      <buttom onclick="${toggleShowMore}">more</buttom>
    </section>
    ${shouldShowMore && html`
      <ul>
        ${trackerCounts.map(([tracker, count]) => html`
          <li>
            ${stats.byTracker[tracker].name}
            <strong>${count}</strong>
            <a href="https://whotracks.me/trackers/${tracker}.html" target="_blank">
              ${t('tracker_details')}
            </a>
          </li>
        `)}
      </ul>
    `}
  `.css`
    :host {
      background-color: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    :host section {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    :host section button {
      justify-self: flex-end;
      align-self: flex-end;
    }
    .count {
      flex: 1;
      text-align: right;
    }
  `,
});