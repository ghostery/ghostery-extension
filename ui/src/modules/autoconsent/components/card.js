import { define, html } from 'hybrids';

export default define({
  tag: 'ui-autoconsent-card',
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
});
