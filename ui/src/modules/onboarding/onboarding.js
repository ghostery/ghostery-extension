import { define, dispatch, html, router } from 'hybrids';

import Main from './views/main.js';
import OutroSkip from './views/outro-skip.js';
import OutroSuccess from './views/outro-success.js';

export default define({
  tag: 'ui-onboarding',
  views: router([Main, OutroSuccess, OutroSkip]),
  state: {
    value: '',
    connect: (host) => {
      function cb(event) {
        switch (event.detail.entry.id) {
          case OutroSkip.tag:
            dispatch(host, 'skip');
            break;
          case OutroSuccess.tag:
            dispatch(host, 'success');
            break;
          default:
            break;
        }
      }

      host.addEventListener('navigate', cb);

      return () => host.removeEventListener('navigate', cb);
    },
  },
  render: ({ views }) => html`
    <template layout="grid height::100%">
      <ui-onboarding-layout>${views}</ui-onboarding-layout>
    </template>
  `,
});
