import { define, html } from 'hybrids';

export default define({
  tag: 'ui-link',
  href: '',
  clean: false,
  external: false,
  render: Object.assign(
    ({ href, external }) =>
      html`
        <template layout="contents">
          ${href
            ? html`
                <a href="${href}" target="${external ? '_blank' : ''}"
                  ><slot></slot
                ></a>
              `
            : html`<slot></slot>`}
        </template>
      `.css`
      a { color: inherit; transition: opacity 0.2s; -webkit-tap-highlight-color: transparent; }
      a:hover { color: var(--ui-link-color-hover, inherit); }
      a:active { opacity: 0.6; }
      
      :host([clean]) a { text-decoration: none; }

      :host(:not([href])) {
        opacity: 0.6;
        pointer-events: none;
      }
    `,
    { delegateFocus: true },
  ),
});
