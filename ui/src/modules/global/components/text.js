import { html } from 'hybrids';

export default {
  type: 'body-m',
  mobileType: '',
  color: '',
  ellipsis: false,
  underline: false,
  render: ({ type, mobileType, color }) => html`<slot></slot>`.css`
    :host {
      display: block;
      font: var(--ui-font-${mobileType || type});
      color: var(--ui-text-color, inherit);
    }

    ${
      mobileType
        ? /*css*/ `
          @media screen and (min-width: 768px) {
            :host { font: var(--ui-font-${type}); }
          }
        `
        : ''
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

    ::slotted(ui-text) {
      display: inline;
    }

    ::slotted(*) {
      color: inherit;
    }

    ::slotted(a) { transition: color 0.2s, opacity 0.2s; text-decoration: none; -webkit-tap-highlight-color: transparent; }
    ::slotted(a:hover, a:focus-visible) { color: var(--ui-text-color-anchor, inherit); }

    @media (hover: hover) and (pointer: fine) {
      ::slotted(a:hover) { color: var(--ui-text-color-anchor, inherit) }
      :host([underline]) ::slotted(a:hover) { text-decoration: underline; }
    }

    ::slotted(a:active) { opacity: 0.6; }
    ::slotted(a:not([href])) { opacity: 0.6; pointer-events: none; }

    :host([type^="body"]) ::slotted(a) { font-weight: 500; }
  `,
};
