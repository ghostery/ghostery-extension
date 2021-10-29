import { html, define, store, dispatch } from '/hybrids.js';

define({
  tag: "tracker-wheel",
  stats: null,
  canvas: ({ stats }) => {
    const el = document.createElement("canvas");
    el.setAttribute('height', 180);
    el.setAttribute('width', 180);

    const context = el.getContext('2d');

    const categories = store.ready(stats)
      ? stats.trackers.map(t => t.category)
      : ['unknown'];
    draw(context, categories);

    // return element
    return el;
  },
  content: ({ stats, canvas }) => html`
    ${canvas}
    <strong>${store.ready(stats) ? stats.trackers.length : 0}</strong>
  `,
});