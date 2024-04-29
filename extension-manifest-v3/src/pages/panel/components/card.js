import { html } from 'hybrids';

export default {
  type: '',
  render: () => html`
    <template layout="block padding:1.5">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--ui-color-gray-100);
      border-radius: 8px;
    }

    :host([type="info"]) {
      background: var(--ui-color-primary-100);
    }
  `,
};
