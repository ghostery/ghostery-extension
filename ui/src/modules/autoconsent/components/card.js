import { html } from 'hybrids';

export default {
  render: () =>
    html`
      <template layout="column">
        <slot></slot>
      </template>
    `.css`
      :host {
        background: white;
        border-radius: 16px;
        overflow: hidden;
      }
    `,
};
