import { dispatch, html } from 'hybrids';

function toggle(host) {
  host.value = !host.value;
  dispatch(host, 'change', { detail: host.value });
}

export default {
  value: false,
  blockByDefault: true,
  render: ({ value, blockByDefault }) => html`
    <template layout="row relative">
      <ui-panel-action-group>
        <ui-panel-action grouped active="${value !== blockByDefault}">
          <button layout="row relative gap:0.5 padding:0.5" onclick="${toggle}">
            <ui-icon name="block-s"></ui-icon>
            <ui-text type="label-xs">Blocked</ui-text>
          </button>
        </ui-panel-action>
        <ui-panel-action
          class="trusted"
          grouped
          active="${value === blockByDefault}"
        >
          <button layout="row gap:0.5 padding:0.5" onclick="${toggle}">
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
