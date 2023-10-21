import { showIframe, closeIframe } from '@ghostery/ui/iframe';

// Based on https://github.com/AdguardTeam/AdguardFilters/blob/e5ae8e3194f8d18bdcc660d4c42282e4a96ca5b9/AnnoyancesFilter/Popups/sections/antiadblock.txt#L2044
const ADBLOCKER_WALL_SELECTORS = [
	'ytd-enforcement-message-view-model > div.ytd-enforcement-message-view-model',
];

function tryToShow() {
	if (document.querySelectorAll(ADBLOCKER_WALL_SELECTORS).length > 0) {
		showIframe(chrome.runtime.getURL(`app/templates/youtube.html?url=${encodeURIComponent(window.location.href)}`), '460px');
	}
}

chrome.storage.local.get(['youtube_dont_show_again'], (storage) => {
	if (storage.youtube_dont_show_again || chrome.extension.inIncognitoContext) {
		return;
	}

	window.addEventListener('yt-navigate-start', () => {
		closeIframe();
	}, true);

	window.addEventListener('yt-navigate-finish', () => {
		tryToShow();
	}, true);

	tryToShow();
});
