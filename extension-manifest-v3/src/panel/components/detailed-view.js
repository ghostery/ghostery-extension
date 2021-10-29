
import { html, define, dispatch, store } from '/hybrids.js';
import './detailed-view/category-with-trackers.js';
import { sortCategories } from '../utils/categories.js';
import { t } from '../utils/i18n.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

define({
  tag: "detailed-view",
  stats: null,
  render: ({ stats }) => html`
    <header>
      <button onclick="${toggleDetailedView}">${t('back')}</button>
      <h1>${t('detailed_view')}</h1>
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
    h1 {
      color: var(--black);
      text-align: center;
    }

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