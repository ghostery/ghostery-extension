import { mount, html, store } from 'hybrids';
import { getBrowserInfo } from '@ghostery/libs';

import '@ghostery/ui/onboarding';
import './styles.scss';

const renew = new URLSearchParams(window.location.search).get('renew') === '1';

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

mount(document.body, {
	browserInfo: store(BrowserInfo),
	content: ({ browserInfo }) => (
		store.pending(browserInfo)
			? html``
			: html`
				<ui-onboarding
					platform="${store.ready(browserInfo) ? browserInfo.name : ''}"
					renew=${renew}
					onsuccess="${complete}"
					onskip="${skip}"
				></ui-onboarding>
			`
	),
});
