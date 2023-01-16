import { html, router } from 'hybrids';

export default {
  [router.connect]: { dialog: true },
  src: '',
  title: '',
  description: '',
  content: ({ src, title, description }) => html`
    <template layout="block">
      <ui-settings-preview>
        <img src="${src}" />
        <div layout="block:center column gap:0.5" slot="footer">
          <ui-text type="headline-s">${title}</ui-text>
          <ui-text color="gray-600">${description}</ui-text>
        </div>
      </ui-settings-preview>
    </template>
  `,
};
