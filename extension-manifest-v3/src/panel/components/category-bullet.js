
import { html, define } from '/hybrids.js';

define({
  tag: "category-bullet",
  category: "unknown",
  size: 0,
  render: ({ category, size }) => {
    const sizePx = `${size}px`;
    return html`
      <label
        class="category-bullet"
        style=${{
          width: sizePx,
          height: sizePx,
          backgroundColor: CATEGORY_COLORS[category],
          borderRadius: sizePx,
          display: 'inline-block',
        }}
      ></label>
    `;
  },
});