import { html } from 'hybrids';

export default {
  icon: '',
  render: ({ icon }) => html`
    <template layout="column items:center gap padding:2:0.5">
      <ui-icon name="${icon}" layout="size:4" color="primary-500"></ui-icon>
      <ui-text type="label-xs" layout="block:center" color="gray-600">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      background: linear-gradient(180deg, #D9F3FD 0%, rgba(217, 243, 253, 0) 100%);
      border-radius: 16px;
    }
  `,
};
