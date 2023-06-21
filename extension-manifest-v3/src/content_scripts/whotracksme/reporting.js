import { recordMouseDown } from '@whotracksme/webextension-packages/packages/reporting/content-script';

window.addEventListener('mousedown', (ev) => {
  const { event, context, href } = recordMouseDown(ev);
  chrome.runtime.sendMessage({
    action: 'mousedown',
    event,
    context,
    href,
  });
});
