import { showIframe } from '@ghostery/ui/iframe';

function start() {
	showIframe(chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`), '460px');
}

chrome.storage.local.get(['youtube_dont_show_again'], (storage) => {
	if (storage.youtube_dont_show_again) {
		return;
	}
	start();
});
