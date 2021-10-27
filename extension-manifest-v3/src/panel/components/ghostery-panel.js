import { html, define, store } from '/hybrids.js';
import Stats from '../store/stats.js';
import Settings from '../store/settings.js';
import '../../vendor/tldts/index.umd.min.js'; // exports tldts

const extractDomainName = url => {
  try {
    const uri = tldts.parse(url);
    return uri.domain
  } catch (e) {
    return '';
  }
};

define({
  tag: "ghostery-panel",
  settings: store(Settings),
  stats: store(Stats),
  domain: ({ stats }) => {
    return store.ready(stats) ? extractDomainName(stats.url) : '';
  },
  content: ({ stats, settings, domain }) => html`
    <panel-header domain=${domain}></panel-header>
    <panel-body
      domain=${domain}
      stats=${stats}
      settings=${settings}
    ></panel-body>
    <panel-footer></panel-footer>
  `,
});
