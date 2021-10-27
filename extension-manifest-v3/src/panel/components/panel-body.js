import { html, define } from '/hybrids.js';

function toggleDetailedView(host) {
  host.showDetailedView = !host.showDetailedView;
}

define({
  tag: "panel-body",
  settings: null,
  stats: null,
  domain: '',
  showDetailedView: false,
  content: ({ domain, settings, stats, showDetailedView}) => html`
    <simple-view
      domain=${domain}
      settings=${settings}
      stats=${stats}
      style=${{
        display: showDetailedView ? 'none' : 'block',
      }}
      ontoggle-detailed-view="${toggleDetailedView}"
    ></simple-view>
    <detailed-view
      stats=${stats}
      style=${{
        display: !showDetailedView ? 'none' : 'block',
      }}
      ontoggle-detailed-view="${toggleDetailedView}"
    ></detailed-view>
  `,
});