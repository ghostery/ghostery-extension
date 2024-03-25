import { dispatch, html } from 'hybrids';

function toggle(host) {
  host.value = !host.value;
  dispatch(host, 'change', { detail: host.value });
}

export default {
  value: false, // overwrite status
  blockByDefault: true,
  tooltip: false,
  render: ({ value, blockByDefault, tooltip }) => html`
    <template layout="row relative margin:bottom:3">
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
      ${tooltip &&
      html`
        <ui-text
          type="label-s"
          id="tooltip"
          layout="absolute top:full padding:0.25:0.5 margin:top:0.25"
        >
          recommended
        </ui-text>
      `}
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

    #tooltip {
      color: var(--ui-color-gray-500);
      border-radius: 4px;
      border: 1px solid var(--ui-color-gray-300);
      background: var(--ui-color-white);
    }

    #tooltip::before {
      content: '';
      position: absolute;
      background: var(--ui-color-white);
      transform: rotate(45deg);
      width: 6px;
      height: 6px;
      top: -4px;
      left: 50%;
      margin-left: -3px;
      border-top: 1px solid var(--ui-color-gray-300);
      border-left: 1px solid var(--ui-color-gray-300);
    }

    :host([block-by-default]) #tooltip {
      left: -8px;
    }

    :host(:not([block-by-default])) #tooltip {
      right: -8px;
    }
  `,
};
