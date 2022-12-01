import { html, define, router } from 'hybrids';

function close(host, event) {
  if (event.target === event.currentTarget) {
    const closeBtn = host.shadowRoot.querySelector('#close');
    closeBtn.shadowRoot.querySelector('a').click();
  }
}

export default define({
  tag: 'gh-panel-dialog',
  dialog: {
    get: ({ render }) => render().querySelector('dialog'),
    observe(host, el) {
      el?.showModal();
    },
  },
  render: () => html`
    <template layout="contents">
      <dialog
        onclick="${close}"
        layout="grid::max|1 width:full::full height:::95vh bottom margin:0 top:auto"
      >
        <section id="header" layout="grid:24px|1|24px items:center">
          <div layout="column items:center area:2">
            <slot name="header"></slot>
          </div>
          <ui-link id="close" href="${router.backUrl()}" layout="grid">
            <ui-icon name="panel-close" layout="size:3"></ui-icon>
          </ui-link>
        </section>
        <section id="content" layout="column overflow:scroll gap:2">
          <slot></slot>
        </section>
      </dialog>
    </template>
  `.css`
    dialog {
      padding: 0;
      border: none;
      border-radius: 12px 12px 0 0;
      background: var(--ui-color-white);
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    #header {
      border-bottom: 1px solid var(--ui-color-gray-200);
      padding: 12px 16px;
    }

    #close  {
      color: var(--ui-color-gray-500);
      background: var(--ui-color-gray-200);
      border-radius: 50%;
    }

    #content {
      padding: 16px;
    }

    #content ::slotted(hr) {
      margin: 0;
      height: 0px;
      border: none;
      border-bottom: 1px solid var(--ui-color-gray-200);
    }
  `,
});
