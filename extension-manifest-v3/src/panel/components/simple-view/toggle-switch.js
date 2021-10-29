import { html, define } from '/hybrids.js';
import { toggleBlocking } from '../../store/settings.js';
import { t } from '../../utils/i18n.js';

define({
  tag: "toggle-switch",
  toggle: '',
  settings: null,
  content: ({ toggle, settings }) => html`
    <button
      onclick=${() => toggleBlocking(toggle)}
      class=${{ disabled: !settings.blockingStatus[toggle]}}
    >
      <label>${t(`block_toggle_${toggle}`)}</label>
    </button>
  `,
});