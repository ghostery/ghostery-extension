
import { html, define, dispatch, store } from '/hybrids.js';
import { sortCategories } from '../utils/categories.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

function toggleShowMore(host) {
  host.shouldShowMore = !host.shouldShowMore;
}

define({
  tag: "category-with-trackers",
  category: '',
  stats: null,
  shouldShowMore: false,
  companies: ({ stats, category }) => {
    const { trackers } = stats.byCategory[category];
  },
  render: ({ category, stats, shouldShowMore, companies }) => html`
    <section>
      <category-bullet category=${category} size=${20}></category-bullet>
      <label>${category}</label>
      <strong>${stats.byCategory[category].count}</strong>
      <buttom onclick="${toggleShowMore}">more</buttom>
    </section>
    ${shouldShowMore && html`
      <ul>
        ${stats.byCategory[category].trackers.map(tracker => html`
          <li>
            ${tracker}
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
  `,
});

define({
  tag: "detailed-view",
  stats: null,
  render: ({ stats }) => html`
    <header>
      <button onclick="${toggleDetailedView}">back</button>
      <h1>Detailed View</h1>
    </header>
    <main>
      <ul>
        ${store.ready(stats) && html`
          ${sortCategories(Object.keys(stats.byCategory)).map(category => html`
            <li class="category">
              <category-with-trackers category=${category} stats=${stats}></category-with-trackers>
            </li>
          `)}
        `}
      </ul>
    </main>
  `.css`
    header button {
      position: absolute;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
});