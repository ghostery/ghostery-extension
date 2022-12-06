import { define, html } from 'hybrids';

export default define({
  tag: 'ui-text',
  type: 'body-m',
  color: '',
  ellipsis: false,
  underline: false,
  render: ({ type, color }) => html`<slot></slot>`.css`
    :host {
      display: block;
      font: var(--ui-font-${type});
      color: var(--ui-text-color, inherit);
    }

    :host([type^="display"]), 
    :host([type^="headline"]),
    :host([type^="label"]) {
      color: var(--ui-text-color-heading, var(--ui-color-gray-800));
    }

    :host([color]) {
      --ui-text-color: var(--ui-color-${color});
      --ui-text-color-anchor: var(--ui-color-${color});
      --ui-text-color-heading: var(--ui-color-${color});
    }

    :host([type^="display"]), :host([type^="button"]) {
      text-transform: uppercase;
    }

    :host([type^="button"]) ::slotted(*) {
      text-decoration: none;
    }

    :host([ellipsis]) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ::slotted(*) {
      display: inline;
      margin: 0;
      padding: 0;
      color: inherit;
    }

    ::slotted(a) { transition: all 0.2s; text-decoration: none}
    ::slotted(a:hover) { color: var(--ui-text-color-anchor, inherit); }
    ::slotted(a:active) { opacity: 0.6; }
    ::slotted(a:not([href])) { opacity: 0.6; pointer-events: none; }

    :host([type^="body"]) ::slotted(a) { font-weight: 500; }
    :host([underline]) ::slotted(a) { text-decoration: underline; }
  `,
});
