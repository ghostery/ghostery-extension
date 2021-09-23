import { html, define, store } from '/hybrids.js';
import Settings, { toggleBlocking } from '../store/settings.js';
import Stats, { reloadStats } from '../store/stats.js';
import Category from '../store/category.js';
import { toggles } from '../../common/rulesets.js';

define({
  tag: "ghostery-panel",
  settings: store(Settings),
  stats: store(Stats),
  categories: store([Category]),
  render: ({ settings, stats, categories }) => html`
    <div>
      <div>
        <h2>Page</h2>
        <p>${store.ready(stats) ? (new URL(stats.url)).hostname : html`&nbsp;`}</p>

        <h2>Stats</h2>

        ${store.error(stats) && html`
          <button onclick=${reloadStats}>reload</button>
        `}

        <ul>
          <li>All: ${store.ready(stats) ? stats.all : 0}</li>
          <li>By toggle:</li>
          <ul>
            ${toggles.map((toggle) => html`
              <li>${toggle}: ${store.ready(stats) ? stats.byToggle[toggle] : 0}</li>
            `)}
          </ul>
          <li>By category:</li>
          <ul>
            ${Object.keys(store.ready(stats) ? stats.byCategory : {}).map((category) => html`
              <li>${category}: ${store.ready(stats) ? stats.byCategory[category] : 0}</li>
            `)}
          </ul>
          <li>By tracker:</li>
          <ul>
            ${Object.keys(store.ready(stats) ? stats.byTracker : {}).map((tracker) => html`
              <li>
                ${tracker}: ${store.ready(stats) ? stats.byTracker[tracker] : 0}</li>
            `)}
          </ul>
        </ul>

      </div>
      <div>
        <h2>Global settings</h2>

        ${store.pending(settings) && `Loading...`}

        ${store.ready(settings) && html`
          <ul>
            ${toggles.map((toggle) => html`
              <li>
                <label>Block ${toggle}:</label>
                <span>${String(settings.blockingStatus[toggle])}</span>
                <button onclick=${() => toggleBlocking(toggle)}>Toggle</button>
              </li>
            `)}
          </ul>
        `}
      </div>
    </div>
  `,
});
