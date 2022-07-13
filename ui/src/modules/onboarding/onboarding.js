import { define, dispatch, html, router } from 'hybrids';

import Main from './views/main.js';
import OutroSkip from './views/outro-skip.js';
import OutroSuccess from './views/outro-success.js';

export default define({
  tag: 'ui-onboarding',
  views: router([Main, OutroSuccess, OutroSkip]),
  success: {
    get: (host, lastValue) => {
      return lastValue || router.active(OutroSuccess);
    },
    connect: (host, key, invalidate) => {
      host.addEventListener('navigate', invalidate);
      return () => host.removeEventListener('navigate', invalidate);
    },
    observe(host, value, lastValue) {
      if (lastValue !== undefined) dispatch(host, 'success');
    },
  },
  render: ({ views }) => html`${views}`.css`
    :host { 
      display: block;
      height: 100%;
    }
  `,
});
