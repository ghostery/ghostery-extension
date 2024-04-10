import { dispatch, html } from 'hybrids';

export default {
  value: {
    value: false,
    observe(host, value, lastValue) {
      if (lastValue !== undefined) {
        dispatch(host, 'change', { detail: value });
      }
    },
  },
  blockByDefault: true,
  responsive: false,
  render: ({ value, blockByDefault, responsive }) => html`
    <template layout="row relative">
      <ui-panel-action-group
        class="${{ responsive }}"
        layout.responsive="column"
        layout.responsive@768px="row"
      >
        <ui-panel-action grouped active="${value !== blockByDefault}">
          <button
            layout="row relative gap:0.5 padding:0.5"
            onclick="${html.set('value', !blockByDefault)}"
          >
            <ui-icon name="block-s"></ui-icon>
            <ui-text type="label-xs">Blocked</ui-text>
          </button>
        </ui-panel-action>
        <ui-panel-action
          class="trusted"
          grouped
          active="${value === blockByDefault}"
        >
          <button
            layout="row gap:0.5 padding:0.5"
            onclick="${html.set('value', blockByDefault)}"
          >
            <ui-icon name="trust-s"></ui-icon>
            <ui-text type="label-xs">Trusted</ui-text>
          </button>
        </ui-panel-action>
      </ui-panel-action-group>
    </template>
  `.css`
    ui-panel-action {
      width: auto;
      height: 28px;
      color: var(--ui-color-gray-500);
      --ui-text-color-heading: currentColor;
    }

    ui-panel-action[active] {
      color: var(--ui-color-gray-800);
    }

    ui-panel-action.trusted[active] {
      color: var(--ui-color-success-500);
    }
  `,
};
