import setupTrackersPreview from '@ghostery/trackers-preview/content_scripts';

setupTrackersPreview(
	chrome.runtime.getURL('/app/templates/trackers-preview.html'),
);
