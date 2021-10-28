
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
        ${store.ready(stats) && html`
          ${Object.keys(stats.byCategory).map(category => html`
            <li>
              <label>${category}</label>
              <category-bullet category=${category} size=${20}></category-bullet>
              <strong>${stats.byCategory[category].count}</strong>
              <ul>
                ${stats.byCategory[category].trackers.map(tracker => html`
                  <li>
                    ${tracker}
                  </li>
                `)}
              </ul>
            </li>
          `)}
        `}
      </ul>
    </main>
  `.css`
    header button {
      position: absolute;
    }
  `,
});