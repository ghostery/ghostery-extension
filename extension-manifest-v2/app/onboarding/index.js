import { define, html, store } from 'hybrids';
import { getBrowserInfo } from '@ghostery/libs';

import '@ghostery/ui/onboarding';
import './styles.scss';

function complete() {
	chrome.runtime.sendMessage({
		name: 'setup_complete',
		message: null,
		origin: 'onboarding',
	});
}

function skip() {
	chrome.runtime.sendMessage({
		name: 'setup_skip',
		message: null,
		origin: 'onboarding',
	});
}

const BrowserInfo = {
	name: '',
	[store.connect]: getBrowserInfo,
};

define({
	tag: 'gh-onboarding',
	browserInfo: store(BrowserInfo),
	content: ({ browserInfo }) => (
		store.pending(browserInfo)
			? html``
			: html`
				<ui-onboarding
					platform="${store.ready(browserInfo) ? browserInfo.name : ''}"
					onsuccess="${complete}"
					onskip="${skip}"
				></ui-onboarding>
			`
	),
});
