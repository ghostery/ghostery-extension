import { html } from 'hybrids';

export default {
  render: () => html`
    <template layout="block padding">
      <slot></slot>
    </template>
  `.css`
    :host {
      border: 1px solid var(--border-primary);
      border-radius: 8px;
    }
  `,
};
