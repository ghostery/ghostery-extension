import { showIframe } from '@ghostery/ui/iframe';

// TODO: add detection
showIframe(chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`), '460px');
