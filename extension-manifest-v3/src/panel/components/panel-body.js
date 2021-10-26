import { html, define, store } from '/hybrids.js';
import { toggleBlocking } from '../store/settings.js';
import { toggles } from '../../common/rulesets.js';

define({
  tag: "panel-body",
  settings: null,
  stats: null,
  domain: '',
  canvas: ({ stats }) => {

    const el = document.createElement("canvas");
    el.setAttribute('height', 200);
    el.setAttribute('width', 200);

    const context = el.getContext('2d');

    const categories = store.ready(stats)
      ? stats.trackers.map(t => t.category.name)
      : ['unknown'];
    draw(context, categories);

    // return element
    return el;
  },
  content: ({ domain, settings, stats, canvas }) => html`
    <main>

      <h1>Privacy protection on this site</h1>

      <section class="toggles">
        ${store.pending(settings) && `Loading...`}

        ${store.ready(settings) && html`
          ${toggles.map((toggle) => html`
            <button
              onclick=${() => toggleBlocking(toggle)}
              class=${{ disabled: !settings.blockingStatus[toggle]}}
            >
              <label>${toggle}:</label>
              <span>${store.ready(stats) ? stats.byToggle[toggle] : 0}</span>
            </button>
          `)}
        `}
      </section>

      <section class="stats">
        <main>
          ${canvas}
          <strong>${store.ready(stats) ? stats.all : 0}</strong>
        </main>

        <aside>
          <ul>
            ${Object.keys(store.ready(stats) ? stats.byCategory : {}).map((category) => html`
              <li>
                ${category}:
                <label
                  class="color"
                  style=${{ backgroundColor: CATEGORY_COLORS[category] }}
                ></label>
                <strong>${store.ready(stats) ? stats.byCategory[category] : 0}</strong>
              </li>
            `)}
          </ul>
        </aside>
      </section>

      <section class="buttons">
        <a href="https://www.whotracks.me/websites/${domain}.html" target="_blank">Statistics report</a>
        <a href="">Tracker list</a>
      </section>

      <section>
        <p>Load time: ${store.ready(stats) ? `${Math.round(stats.loadTime)}ms` : html`&nbsp;`}</p>
      </section>

    </main>
  `,
});