import { html, define, router } from 'hybrids';

const slide = {
  keyframes: { transform: ['translateY(100%)', 'translateY(0)'] },
  options: {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards',
  },
};

const fade = {
  keyframes: { opacity: [0, 1] },
  options: {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards',
    pseudoElement: '::backdrop',
  },
};

function close(host, event) {
  if (event.target === event.currentTarget) {
    const closeBtn = host.shadowRoot.querySelector('#close');
    closeBtn.shadowRoot.querySelector('a').click();
  }
}

function animateOnClose(host, event) {
  router.resolve(
    event,
    new Promise((resolve) => {
      host.dialog.animate(fade.keyframes, {
        ...fade.options,
        direction: 'reverse',
      });

      host.dialog
        .animate(slide.keyframes, {
          ...slide.options,
          direction: 'reverse',
        })
        .addEventListener('finish', resolve);
    }),
  );
}

export default define({
  tag: 'gh-panel-dialog',
  dialog: {
    get: ({ render }) => render().querySelector('dialog'),
    observe(host, el) {
      el.showModal();
      el.animate(slide.keyframes, slide.options);
      el.animate(fade.keyframes, fade.options);
    },
  },
  render: () => html`
    <template layout="contents">
      <dialog
        onclick="${close}"
        layout="grid::max|1 width:full::full bottom margin:0 top:auto"
      >
        <section id="header" layout="grid:24px|1|24px items:center">
          <div layout="column items:center area:2">
            <slot name="header"></slot>
          </div>
          <a id="close" onclick="${animateOnClose}" href="${router.backUrl()}">
            <ui-icon name="panel-close" layout="size:3"></ui-icon>
          </a>
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
      max-height: calc(100vh - 32px);
      overscroll-behavior: contain;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1 }
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.4);
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
