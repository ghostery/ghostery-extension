import { define, html } from 'hybrids';

export default define({
  tag: 'gh-panel-menu',
  render: () => html`
    <template layout="column gap">
      <div id="header"><slot name="header"></slot></div>
      <slot></slot>
    </template>
  `.css`
    :host {
      background: var(--ui-color-white);
      padding-bottom: 8px;
    }

    #header {
    }

    ::slotted(a) {
      text-decoration: none;
    }

    ::slotted(hr) {
      height: 1px;
      margin: 0;
      border: none;
      background: var(--ui-color-gray-200);
    }
  `,
});
