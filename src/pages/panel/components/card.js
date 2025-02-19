import { html } from 'hybrids';

export default {
  type: { value: '', reflect: true },
  render: () => html`
    <template layout="block padding:1.5">
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--background-secondary);
      border-radius: 8px;
    }

    :host([type="info"]) {
      background: var(--background-brand-primary);
    }
  `,
};
