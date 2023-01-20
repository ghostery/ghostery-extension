import { dispatch, html } from 'hybrids';

function copy(host) {
  navigator.clipboard.writeText(host.textContent);
  dispatch(host, 'copy');
}

export default {
  render: () => html`
    <template layout="contents">
      <ui-action>
        <button onclick="${copy}" layout="block padding margin:-1">
          <div layout="row content:space-between items:center gap:0.5">
            <ui-text type="body-s" color="gray-600" ellipsis>
              <slot></slot>
            </ui-text>
            <ui-icon name="copy"></ui-icon>
          </div>
        </button>
      </ui-action>
    </template>
  `.css`
    ui-icon {
      color: var(--ui-color-gray-400);
    }

    @media (hover: hover) and (pointer: fine) {
      button:hover ui-text, button:hover ui-icon {
        --ui-text-color: var(--ui-color-primary-700);
        color: var(--ui-color-primary-700);
      }
    }
  `,
};
