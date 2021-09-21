import { html, define, store } from '/hybrids.js';
import Settings, { toggleBlocking } from '../store/settings.js';

function increaseCount(host) {
  host.count += 1;
}

define({
  tag: "simple-counter",
  count: 0,
  settings: store(Settings),
  render: ({ settings }) => html`
    <div>
      Settings:
      ${store.pending(settings) && `Loading...`}
      ${store.ready(settings) && html`
        <ul>
          <li>
            <label>Block Ads:</label>
            <span>${String(settings.blockingStatus.ads)}</span>
            <button onclick=${() => toggleBlocking('ads')}>Toggle</button>
          </li>
          <li>
            <label>Block Annoyances:</label>
            <span>${String(settings.blockingStatus.annoyances)}</span>
            <button onclick=${() => toggleBlocking('annoyances')}>Toggle</button>
          </li>
          <li>
            <label>Block Tracking:</label>
            <span>${String(settings.blockingStatus.tracking)}</span>
            <button onclick=${() => toggleBlocking('tracking')}>Toggle</button>
          </li>
        </ul>
      `}
    </div>
  `,
});
