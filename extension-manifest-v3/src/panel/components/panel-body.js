import { html, define, property } from '/hybrids.js';

function toggleDetailedView(host) {
  host.showDetailedView = !host.showDetailedView;
}

define({
  tag: "panel-body",
  settings: null,
  stats: null,
  domain: '',
  showDetailedView: {
    set: ({ content }, value) => {
      if (value) {
        const el = content();
        const simpleView = el.querySelector('simple-view');
        const detailedView = el.querySelector('detailed-view');
        detailedView.style.width = `${simpleView.clientWidth}px`;
        detailedView.style.height = `${simpleView.clientHeight}px`;
      }
      return value;
    }
  },
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