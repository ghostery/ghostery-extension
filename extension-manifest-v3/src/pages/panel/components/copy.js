import { html } from 'hybrids';

function copy(host) {
  navigator.clipboard.writeText(host.text);
}

export default {
  text: '',
  content: () => html`
    <template layout="contents">
      <ui-action>
        <button onclick="${copy}" layout="padding margin:-1">
          <ui-icon name="copy" color="gray-400"></ui-icon>
        </button>
      </ui-action>
    </template>
  `,
};
