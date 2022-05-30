import setupTrackersPreview from '@whotracksme/webextension-packages/packages/trackers-preview/src/content_scripts';

setupTrackersPreview(
	chrome.runtime.getURL('/app/templates/trackers-preview.html'),
);
