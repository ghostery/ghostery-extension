import { define, html } from 'hybrids';

export default define({
  tag: 'gh-panel-options',
  render: () => html`
    <template layout="column padding:2:2:1">
      <ui-text type="body-s" color="gray-500" layout="margin:bottom">
        <slot name="header"></slot>
      </ui-text>
      <slot></slot>
    </template>
  `.css`
    :host {
      background: linear-gradient(180deg, #F0F2F7 0%, #FFFFFF 90%);
    }
  `,
});
