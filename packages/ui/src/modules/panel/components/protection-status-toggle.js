import { dispatch, html } from 'hybrids';

function updateValue(value) {
  return (host) => {
    host.value = value;
    dispatch(host, 'change', { detail: value });
  };
}

export default {
  value: false,
  responsive: false,
  render: ({ value, responsive }) => html`
    <template layout="row relative">
      <ui-panel-action-group
        class="${{ responsive }}"
        layout.responsive="column"
        layout.responsive@768px="row"
      >
        <ui-panel-action grouped active="${value}">
          <button
            layout="row relative gap:0.5 padding:0.5"
            onclick="${updateValue(true)}"
          >
            <ui-icon name="block-s"></ui-icon>
            <ui-text type="label-xs">Blocked</ui-text>
          </button>
        </ui-panel-action>
        <ui-panel-action class="trusted" grouped active="${!value}">
          <button
            layout="row gap:0.5 padding:0.5"
            onclick="${updateValue(false)}"
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
  `,
};
