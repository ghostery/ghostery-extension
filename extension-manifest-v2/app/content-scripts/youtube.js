import { showIframe, closeIframe } from '@ghostery/ui/iframe';

function show() {
	showIframe(chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`), '460px');
}

function start() {
	window.addEventListener('yt-navigate-start', () => {
		closeIframe();
	}, true);

	window.addEventListener('yt-navigate-finish', () => {
		show();
	}, true);

	show();
}

chrome.storage.local.get(['youtube_dont_show_again'], (storage) => {
	if (storage.youtube_dont_show_again) {
		return;
	}
	start();
});
