import setupTrackersPreview from '@whotracksme/webextension-packages/packages/trackers-preview/src/content_scripts';
import './content_script.scss';

setupTrackersPreview(
	chrome.runtime.getURL('/app/trackers-preview/popup.html'),
);
