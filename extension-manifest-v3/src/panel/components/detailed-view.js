
import { html, define, dispatch, store } from '/hybrids.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

define({
  tag: "detailed-view",
  stats: null,
  content: ({ stats }) => html`
    <header>
      <button onclick="${toggleDetailedView}">back</button>
      <h1>Detailed View</h1>
    </header>
    <main>
      <ul>
        ${Object.keys(store.ready(stats) ? stats.byCategory : {}).map((category) => html`
          <li>
            ${category}:
            <category-bullet category=${category} size=${20}></category-bullet>
            <strong>${store.ready(stats) ? stats.byCategory[category].count : 0}</strong>
          </li>
        `)}
      </ul>
    </main>
  `.css`
    header button {
      position: absolute;
    }
  `,
});