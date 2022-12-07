import { define, html } from 'hybrids';

export default define({
  tag: 'ui-panel-action',
  active: false,
  grouped: false,
  render: () => html`
    <template layout="grid size:4.5">
      <ui-action><slot></slot></ui-action>
    </template>
  `.css`
    ::slotted(*) {
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      border: none;
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
      transition: all 0.2s;
      padding: 0;
      margin: 0;
      color: var(--ui-color-gray-900);
    }

    :host([grouped]:not([active])) ::slotted(*) {
      background: none;
      border: none;
      box-shadow: none;
    }

    ::slotted(*:hover) { color: var(--ui-color-primary-700); }
  `,
});
