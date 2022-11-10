import { define, html } from 'hybrids';

export default define({
  tag: 'gh-panel-button',
  render: () => html`
    <template layout="block">
      <ui-text type="label-m" layout="grid margin:2" color="white">
        <slot></slot>
      </ui-text>
    </template>
  `.css`
    :host {
      background: var(--ui-color-primary-200);
    }

    ui-text {
      background: var(--ui-color-primary-500);
      box-shadow: 0px 2px 8px rgba(0, 105, 210, 0.2);
      border-radius: 8px;
      height: 48px;
      transition: 0.2s all;
    }

    ui-text:hover {
      background: var(--ui-color-primary-700);
    }

    ui-text:active {
      opacity: 0.6;
    }

    ui-text ::slotted(a) {
      text-decoration: none;
    }
  `,
});
