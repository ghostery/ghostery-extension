import { define, html, msg } from 'hybrids';

export default define({
  tag: 'gh-panel-options-item',
  icon: '',
  enabled: false,
  terms: false,
  render: ({ icon, enabled, terms }) => html`
    <template layout="row items:center">
      ${icon &&
      html`<ui-icon
        name="${icon}"
        layout="margin:right"
        color="gray-500"
      ></ui-icon>`}
      <ui-text type="body-s" layout="grow">
        <slot></slot>
      </ui-text>
      <ui-text type="label-s" color="${enabled ? '' : 'danger-500'}">
        ${terms
          ? enabled
            ? msg`Enabled`
            : msg`Disabled`
          : msg`Permission required`}
      </ui-text>
    </template>
  `.css`
    :host {
      padding: 8px 12px;
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
    }

    :host(:first-of-type) {
      border-radius: 8px 8px 0 0;
    }

    :host(:last-of-type) {
      border-radius: 0 0 8px 8px;
    }

    :host(:not(:last-of-type)) {
      border-bottom: none;
    }
  `,
});
