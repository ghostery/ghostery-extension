import { html } from 'hybrids';

export default {
  render: () => html`
    <template layout="block">
      <ui-text color="gray-800" type="body-s"><slot></slot></ui-text>
    </template>
  `.css`
    ui-text {
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-decoration-color: var(--ui-color-gray-300);
    }

    @media (hover: hover) {
      ui-text:hover {
        text-decoration-color: var(--ui-color-primary-500);
      }
    }
  `,
};
