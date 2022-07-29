import { define, html } from 'hybrids';

export default define({
  tag: 'ui-text',
  type: 'body-m',
  color: '',
  render: ({ type, color }) => html`<slot></slot>`.css`
    :host {
      display: block;
      font: var(--ui-font-${type});
      color: ${color ? `var(--ui-color-${color})` : 'inherit'};
    }

    :host([type^="display"]), :host([type^="button"]) {
      text-transform: uppercase;
      font-weight: 700;
    }

    :host([type^="button"]) ::slotted(*) {
      text-decoration: none;
    }

    :host([type^="label"]) {
      font-weight: 500;
    }

    ::slotted(*) {
      display: inline;
      margin: 0;
      padding: 0;
      color: inherit;
    }

    ::slotted(a) {
      color: white;
    }
  `,
});
