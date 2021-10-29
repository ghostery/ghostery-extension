import { html, define, property } from '/hybrids.js';

function toggleDetailedView(host) {
  host.showDetailedView = !host.showDetailedView;
}

const IS_SIMPLE_VIEW_DEFAULT = true;

define({
  tag: "panel-body",
  settings: null,
  stats: null,
  domain: '',
  showDetailedView: {
    get: (_host, value) => {
      if (typeof value === "undefined") {
        return !IS_SIMPLE_VIEW_DEFAULT;
      }
      return value;
    },
    set: (host, value) => {
      if (value) {
        const simpleView = host.querySelector('simple-view');
        host.style.display = 'block';
        host.style.width = `${simpleView.clientWidth}px`;
        host.style.height = `${simpleView.clientHeight}px`;
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