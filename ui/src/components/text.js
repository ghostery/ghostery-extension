import { define, html } from 'hybrids';

export default define({
  tag: 'ui-text',
  type: 'body-m',
  color: '',
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
    
    :host([type^="body"]) {
      --ui-link-color-hover: var(--ui-color-${color ? color : 'primary-500'});
    }

    :host([type^="body"]) ::slotted(ui-link) {
      font-weight: 500;
    }

    :host([color]) {
      --ui-text-color: var(--ui-color-${color});
      --ui-text-color-heading: var(--ui-color-${color});
    }

    :host([type^="display"]), :host([type^="button"]) {
      text-transform: uppercase;
    }

    :host([type^="button"]) ::slotted(*) {
      text-decoration: none;
    }

    ::slotted(*) {
      display: inline;
      margin: 0;
      padding: 0;
      color: inherit;
    }

    :host([type^="body"]) ::slotted(a) {
      font-weight: 500;
    }
  `,
});
