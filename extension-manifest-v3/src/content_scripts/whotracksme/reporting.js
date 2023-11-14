import { recordMouseDown } from '@whotracksme/webextension-packages/packages/reporting/src/request/content-script.js';

window.addEventListener('mousedown', (ev) => {
  const { event, context, href } = recordMouseDown(ev);
  chrome.runtime.sendMessage({
    action: 'mousedown',
    event,
    context,
    href,
  });
});
