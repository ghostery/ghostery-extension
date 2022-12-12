import { define, html } from 'hybrids';

export default define({
  tag: 'gh-panel-menu-item',
  icon: '',
  render: ({ icon }) => html`
    <template layout="grid:max|1|max items:center:start gap:2">
      <ui-icon name="${icon}"></ui-icon>
      <ui-text type="label-m"><slot></slot></ui-text>
      <ui-icon name="arrow-right"></ui-icon>
    </template>
  `.css`
    :host {
      text-decoration: none;
      color: var(--ui-color-gray-900);
      --ui-text-color-heading: currentColor;
    }

    ui-icon {
      color: var(--ui-color-gray-500);
    }

    @media (hover: hover) and (pointer: fine) {
      :host(:hover) {
        color: var(--ui-color-primary-700);
      }

      :host(:hover) ui-icon {
        color: var(--ui-color-primary-700);
      }
    }
  `,
});
