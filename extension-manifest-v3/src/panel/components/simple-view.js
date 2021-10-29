import { html, define, store, dispatch } from '/hybrids.js';
import "./simple-view/tracker-wheel.js";
import "./simple-view/toggle-switch.js";
import { toggles } from '../../common/rulesets.js';
import { sortCategories, getCategoryName } from '../utils/categories.js';
import { t } from '../utils/i18n.js';

function toggleDetailedView(host) {
  dispatch(host, 'toggle-detailed-view');
}

define({
  tag: "simple-view",
  settings: null,
  stats: null,
  content: ({ settings, stats }) => html`
    <main>

      <h1>${t('privacy_protection')}</h1>

      <section class="toggles">
        ${store.pending(settings) && `Loading...`}

        ${store.ready(settings) && toggles.map((toggle) => html`
          <toggle-switch toggle=${toggle} settings=${settings}></toggle-switch>
        `)}
      </section>

      <section class="stats">
        <main>
          <tracker-wheel stats=${stats}></tracker-wheel>
        </main>

        <aside>
          <ul>
            ${store.ready(stats) && html`
              ${sortCategories(Object.keys(stats.byCategory)).map((category) => html`
                <li class="category">
                  <category-bullet category=${category} size=${8}></category-bullet>
                  <label>${getCategoryName(category)}</label>
                  <strong>${stats.byCategory[category].count}</strong>
                </li>
              `)}
            `}
          </ul>
        </aside>
      </section>

      <section class="buttons">
        <a href="https://www.whotracks.me/websites/${store.ready(stats) ? stats.domain : ''}.html" target="_blank">
          ${t('statistical_report')}
        </a>
        <a onclick="${toggleDetailedView}">${t('detailed_view')}</a>
      </section>

      <section>
        <p>${t('page_load')} ${store.ready(stats) ? `${Math.round(stats.loadTime)}ms` : html`&nbsp;`}</p>
      </section>

    </main>
  `,
});