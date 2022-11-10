import { define, html } from 'hybrids';

export default define({
  tag: 'ui-link',
  href: '',
  clean: false,
  external: false,
  render: ({ href, external }) =>
    html`
      <template layout="contents">
        <a href="${href}" target="${external ? '_blank' : ''}"><slot></slot></a>
      </template>
    `.css`
      a { color: inherit; transition: opacity 0.2s; -webkit-tap-highlight-color: transparent; }
      a:hover { color: var(--ui-link-color-hover, inherit); }
      a:active { opacity: 0.6; }
      
      :host([clean]) a { text-decoration: none; }
    `,
});
