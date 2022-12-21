import { html } from 'hybrids';

function copy(host) {
  navigator.clipboard.writeText(host.content);
}

export default {
  content: '',
  render: () =>
    html` <template layout="contents">
      <ui-action>
        <button onclick="${copy}" layout="padding margin:-1">
          <ui-icon name="copy" color="gray-400"></ui-icon>
        </button>
      </ui-action>
    </template>`.css`
      button {
        background: none;
        appearance: none;
        border: none;
      }
    `,
};
