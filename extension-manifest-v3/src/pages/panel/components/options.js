import { define, html } from 'hybrids';

export default define({
  tag: 'gh-panel-options',
  render: () => html`
    <template layout="column">
      <ui-text type="body-s" color="gray-500" layout="margin:bottom">
        <slot name="header"></slot>
      </ui-text>
      <slot></slot>
    </template>
  `.css`
    :host {
      padding: 16px 16px 8px;
      background: linear-gradient(180deg, #F0F2F7 0%, #FFFFFF 90%);
    }
  `,
});
