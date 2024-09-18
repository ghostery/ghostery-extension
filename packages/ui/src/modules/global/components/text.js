import { html } from 'hybrids';

export default {
  type: { value: 'body-m', reflect: true },
  mobileType: { value: '', reflect: true },
  color: 'gray-800',
  ellipsis: { value: false, reflect: true },
  underline: { value: false, reflect: true },
  uppercase: { value: false, reflect: true },
  render: ({ type, mobileType, color }) => html`<slot></slot>`.css`
    :host {
      display: block;
      font: var(--ui-font-${mobileType || type});
      color: var(--ui-color-${color});
    }

    :host([hidden]) {
      display: none;
    }

    ${
      mobileType &&
      /*css*/ `
          @media screen and (min-width: 768px) {
            :host { font: var(--ui-font-${type}); }
          }
        `
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

    :host([uppercase]) {
      text-transform: uppercase;
    }

    @media (hover: hover) and (pointer: fine) {
      :host([underline]) ::slotted(a:hover) { text-decoration: underline; }
    }

    ::slotted(ui-text) {
      display: inline;
    }

    ::slotted(*) {
      color: inherit;
    }

    ::slotted(a) { transition: color 0.2s, opacity 0.2s; text-decoration: none; -webkit-tap-highlight-color: transparent; }
    ::slotted(a:active) { opacity: 0.6; }
    ::slotted(a:not([href])) { opacity: 0.6; pointer-events: none; }

    :host([type^="body"]) ::slotted(a) { font-weight: 500; }
  `,
};
