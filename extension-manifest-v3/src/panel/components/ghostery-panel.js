import { html, define, store } from '/hybrids.js';
import Stats from '../store/stats.js';
import Settings from '../store/settings.js';

define({
  tag: "ghostery-panel",
  settings: store(Settings),
  stats: store(Stats),
  content: ({ stats, settings }) => html`
    <panel-header domain=${store.ready(stats) ? stats.domain : ''}></panel-header>
    <panel-body
      stats=${stats}
      settings=${settings}
    ></panel-body>
    <panel-footer></panel-footer>
  `,
});
