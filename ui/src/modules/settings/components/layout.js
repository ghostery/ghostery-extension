import { define, html } from 'hybrids';

export default define({
  tag: 'ui-settings-layout',
  render: () => html`
    <template layout="column">
      <header layout="row center gap padding:2 relative layer">
        <ui-icon
          name="logo-full"
          color="primary-500"
          layout="height:4 margin:bottom:-2px"
        ></ui-icon>
        <ui-text type="label-s">Settings</ui-text>
      </header>
      <nav layout="order:1 row content:space-around padding gap:0.5">
        <slot name="nav"></slot>
      </nav>
      <main
        layout="block overflow:scroll padding:5:2"
        layout@768px="padding:5:6"
        layout@992="padding:6:2"
      >
        <slot></slot>
      </main>
    </template>
  `.css`
    :host {
      background: var(--ui-color-white);
    }

    header, nav {
      background: var(--ui-color-white);
      box-shadow: 0px 0px 80px rgba(32, 44, 68, 0.1);
    }

    header {
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    header ui-text {
      color: var(--ui-color-white);
      background: var(--ui-color-primary-500);
      border-radius: 4px;
      padding: 2px 4px;
    }

    nav {
      border-top: 1px solid var(--ui-color-gray-200);
    }

    nav ::slotted(a) {
      box-sizing: border-box;
      display: flex;
      flex-flow: column;
      align-items: center;
      gap: 4px;
      color: var(--ui-color-gray-900);
      text-decoration: none;
      font: var(--ui-font-label-xs);
      flex: 1 1 0;
      max-width: 165px;
      border-radius: 6px;
      padding: 6px 4px 4px;
      text-align: center;
    }

    nav ::slotted(a.active) {
      color: var(--ui-color-primary-700);
      background: var(--ui-color-primary-100);
    }
  `,
});
