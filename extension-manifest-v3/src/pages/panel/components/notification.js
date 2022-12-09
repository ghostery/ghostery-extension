import { define, html } from 'hybrids';

function close(host) {
  host.parentNode.removeChild(host);
}

export default define({
  tag: 'gh-panel-notification',
  icon: '',
  render: ({ icon }) => html`
    <template layout="row gap:2 items:stretch padding:1.5">
      ${icon &&
      html`
        <div id="icon" layout="row center shrink:0 width:5">
          <ui-icon name="${icon}" color="primary-700" layout="margin"></ui-icon>
        </div>
      `}
      <div layout="column gap grow"><slot></slot></div>
      <ui-action>
        <button
          id="close"
          layout="
            row center self:start shrink:0 
            size:3
            margin:right:-1 margin:top:-1 padding:0
          "
          onclick="${close}"
        >
          <ui-icon name="close" layout="size:2"></ui-icon>
        </button>
      </ui-action>
    </template>
  `.css`
    :host {
      border-radius: 12px;
      background: var(--ui-color-gray-100);
    }

    #icon {
      background: var(--ui-color-white);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
    }

    #close {
      cursor: pointer;
      border: none;
      color: var(--ui-color-gray-500);
      background: var(--ui-color-white);
      border-radius: 12px;
    }

    #close:hover {
      color: var(--ui-color-gray-700);
    }
  `,
});
