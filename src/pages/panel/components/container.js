import { html } from 'hybrids';

function updateShadow({ render }) {
  const root = render();

  const el = root.querySelector('#scroll');
  const shadow = root.querySelector('.shadow');

  if (el.scrollHeight > el.clientHeight) {
    shadow.classList.toggle(
      'show',
      Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight,
    );
  } else {
    shadow.classList.remove('show');
  }
}

export default {
  render: {
    connect: (host) => {
      const resizeObserver = new ResizeObserver(() => updateShadow(host));
      resizeObserver.observe(host);

      return () => {
        resizeObserver.disconnect();
      };
    },
    value: () => html`
      <template layout="row height::0 relative">
        <div
          id="scroll"
          onscroll="${updateShadow}"
          layout="grow overflow:x:hidden overflow:y:auto"
        >
          <slot onslotchange="${updateShadow}"></slot>
        </div>
        <div class="shadow" layout="absolute bottom left right height:5"></div>
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
          var(--ui-color-scroll-shadow) 100%
        );
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.2s ease, opacity 0.2s ease;
      }

      .shadow.show {
        visibility: visible;
        opacity: 1;
      }
    `,
  },
};
