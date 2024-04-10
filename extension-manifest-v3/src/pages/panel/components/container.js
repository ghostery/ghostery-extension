import { html } from 'hybrids';

function updateShadow({ render }) {
  const root = render();

  const el = root.querySelector('#scroll');
  const shadowTop = root.querySelector('.shadow.top');
  const shadowBottom = root.querySelector('.shadow.bottom');

  if (el.scrollHeight > el.clientHeight) {
    shadowTop.classList.toggle('show', el.scrollTop !== 0);
    shadowBottom.classList.toggle(
      'show',
      el.scrollTop + el.clientHeight < el.scrollHeight,
    );
  } else {
    shadowTop.classList.remove('show');
    shadowBottom.classList.remove('show');
  }
}

export default {
  _: {
    get: () => {},
    connect(host) {
      const resizeObserver = new ResizeObserver(() => updateShadow(host));
      resizeObserver.observe(host);

      return () => {
        resizeObserver.disconnect();
      };
    },
  },
  render: () => html`
    <template layout="row height::0 relative">
      <div
        id="scroll"
        onscroll="${updateShadow}"
        layout="grow overflow:x:hidden overflow:y:auto"
      >
        <slot onslotchange="${updateShadow}"></slot>
      </div>
      <div class="shadow top" layout="absolute width:full height:3"></div>
      <div class="shadow bottom" layout="absolute width:full height:3"></div>
    </template>
  `.css`
    /* set custom scrollbar */
    #scroll {
      scrollbar-width: thin;
      scrollbar-color: var(--ui-color-gray-200) transparent;
    }

    .shadow {
      pointer-events: none;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.1) 100%
      );
      visibility: hidden;
      opacity: 0;
      transition: visibility 0.1s, opacity 0.1s;
    }

    .shadow.show {
      visibility: visible;
      opacity: 1;
    }

    .shadow.top {
      top: 0;
      transform: rotate(180deg);
    }

    .shadow.bottom {
      bottom: 0;
    }
  `,
};
