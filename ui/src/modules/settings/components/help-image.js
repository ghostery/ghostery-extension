import { html } from 'hybrids';

export default {
  render: () =>
    html`
      <template layout="grid relative overflow">
        <div id="icon" layout="absolute top:2px right:2px row center size:3">
          <ui-icon name="zoom-in" color="gray-900" layout="size:2"></ui-icon>
        </div>
        <ui-action><slot></slot></ui-action>
      </template>
    `.css`
      :host {
        background: var(--ui-color-white);
        border: 1px solid var(--ui-color-gray-300);
        border-radius: 4px;
      }

      #icon {
        border-radius:12px;
        border: 1px solid var(--ui-color-gray-300);
        background: var(--ui-color-white);
      }
    `,
};
